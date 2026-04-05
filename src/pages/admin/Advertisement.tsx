import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Megaphone, Search, Trash2, Plus, X,
  Calendar, Link2, Clock, CheckCircle,
  AlertTriangle, TrendingDown, Building2,
  Eye, BarChart2, FileText, Radio, ListOrdered,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

// ─── Constants ─────────────────────────────────────────────────────────────────

const MAX_LIVE_SLOTS = 2;

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Raw status based on date only */
type AdStatus = "active" | "expiring" | "expired";

/**
 * Display status that also factors in slot availability:
 * - "live"     → active AND occupying one of the 2 landing-page slots
 * - "queued"   → active/expiring but all slots are taken; will auto-promote
 * - "expiring" → live but ≤ 7 days left (shown differently)
 * - "expired"  → past end date
 */
type DisplayStatus = "live" | "expiring" | "queued" | "expired";

interface PartnerAd {
  id: number;
  partnerName: string;
  partnerContact: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  createdAt: string;
}

interface EnrichedAd extends PartnerAd {
  dateStatus: AdStatus;
  displayStatus: DisplayStatus;
  slotIndex: number | null; // 1 or 2 if live, null otherwise
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseDate(str: string): Date {
  return new Date(str + "T00:00:00");
}

function daysRemaining(endDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((parseDate(endDate).getTime() - now.getTime()) / 86_400_000);
}

function getDateStatus(endDate: string): AdStatus {
  const d = daysRemaining(endDate);
  if (d < 0) return "expired";
  if (d <= 7) return "expiring";
  return "active";
}

function formatDate(str: string): string {
  return parseDate(str).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/**
 * Find the earliest future date when at least one slot is open,
 * scanning up to LOOK_AHEAD_DAYS days from a given start date.
 * Returns null if no open slot found within that window.
 */
const LOOK_AHEAD_DAYS = 120;

function getNextSlotOpenDate(ads: PartnerAd[], fromDate: string): string | null {
  for (let i = 0; i < LOOK_AHEAD_DAYS; i++) {
    const date = addDays(fromDate, i);
    const activeOnDay = ads.filter(
      (a) => getDateStatus(a.endDate) !== "expired" &&
             a.startDate <= date && a.endDate >= date
    );
    if (activeOnDay.length < MAX_LIVE_SLOTS) return date;
  }
  return null;
}

/**
 * Enrich ads with display status and slot assignment.
 * Slot priority: earliest startDate wins; ties broken by id (insertion order).
 * Only non-expired ads compete for slots.
 */
function enrichAds(ads: PartnerAd[]): EnrichedAd[] {
  const sorted = [...ads].sort((a, b) =>
    a.startDate.localeCompare(b.startDate) || a.id - b.id
  );

  let liveCount = 0;

  return ads.map((ad) => {
    const dateStatus = getDateStatus(ad.endDate);
    const rank = sorted.findIndex((s) => s.id === ad.id);

    let displayStatus: DisplayStatus;
    let slotIndex: number | null = null;

    if (dateStatus === "expired") {
      displayStatus = "expired";
    } else {
      // Count how many non-expired ads rank ahead of this one
      const aheadCount = sorted
        .slice(0, rank)
        .filter((s) => getDateStatus(s.endDate) !== "expired").length;

      if (aheadCount < MAX_LIVE_SLOTS) {
        slotIndex = aheadCount + 1;
        displayStatus = dateStatus === "expiring" ? "expiring" : "live";
      } else {
        displayStatus = "queued";
      }
    }

    return { ...ad, dateStatus, displayStatus, slotIndex };
  });
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const today = new Date().toISOString().split("T")[0];

const mockAds: PartnerAd[] = [
  {
    id: 1,
    partnerName: "Garuda Indonesia",
    partnerContact: "marketing@garuda.co.id",
    title: "Terbang Lebih Hemat Bersama Garuda",
    description: "Promo tiket spesial untuk rute domestik pilihan. Pemesanan melalui aplikasi Garuda Indonesia.",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
    linkUrl: "https://garuda-indonesia.com/promo",
    startDate: addDays(today, -20),
    endDate: addDays(today, 10),
    durationDays: 30,
    createdAt: addDays(today, -20),
  },
  {
    id: 2,
    partnerName: "Allianz Travel",
    partnerContact: "partner@allianz.id",
    title: "Proteksi Perjalanan Mulai Rp 50.000",
    description: "Asuransi perjalanan terpercaya untuk perjalanan domestik dan internasional Anda.",
    imageUrl: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=600&q=80",
    linkUrl: "https://allianz.co.id/travel",
    startDate: addDays(today, -25),
    endDate: addDays(today, 4),
    durationDays: 30,
    createdAt: addDays(today, -25),
  },
  {
    id: 3,
    partnerName: "Traveloka",
    partnerContact: "ads@traveloka.com",
    title: "Hotel & Tiket Murah Setiap Hari",
    description: "Temukan penginapan dan tiket terbaik di lebih dari 200 kota di Indonesia.",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    linkUrl: "https://traveloka.com",
    startDate: addDays(today, -5),
    endDate: addDays(today, 25),
    durationDays: 30,
    createdAt: addDays(today, -5),
  },
  {
    id: 4,
    partnerName: "Tokopedia",
    partnerContact: "iklan@tokopedia.com",
    title: "Titip Beli? Temukan Semua di Tokopedia",
    description: "Belanja produk apapun dengan mudah dan aman. Gratis ongkir untuk pembelian pertama.",
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80",
    linkUrl: "https://tokopedia.com",
    startDate: addDays(today, -40),
    endDate: addDays(today, -10),
    durationDays: 30,
    createdAt: addDays(today, -40),
  },
];

// ─── Status Config ─────────────────────────────────────────────────────────────

const displayStatusConfig: Record<DisplayStatus, {
  label: string; textColor: string; bgColor: string;
  borderColor: string; dotColor: string;
}> = {
  live:     { label: "Tayang",       textColor: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", dotColor: "bg-emerald-500" },
  expiring: { label: "Hampir Habis", textColor: "text-amber-700",   bgColor: "bg-amber-50",   borderColor: "border-amber-200",   dotColor: "bg-amber-500"   },
  queued:   { label: "Antrian",      textColor: "text-blue-700",    bgColor: "bg-blue-50",    borderColor: "border-blue-200",    dotColor: "bg-blue-400"    },
  expired:  { label: "Kadaluarsa",   textColor: "text-red-600",     bgColor: "bg-red-50",     borderColor: "border-red-200",     dotColor: "bg-red-400"     },
};

// ─── Animations ────────────────────────────────────────────────────────────────

const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const staggerItem = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.22 } } };

// ─── Sub-components ────────────────────────────────────────────────────────────

function FormField({ label, icon: Icon, required, children }: {
  label: string; icon: React.ElementType; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5" />
        {label}
        {required && <span className="text-red-500 normal-case font-normal tracking-normal ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function DisplayStatusBadge({ status }: { status: DisplayStatus }) {
  const c = displayStatusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${c.textColor} ${c.bgColor} ${c.borderColor}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dotColor}`} />
      {c.label}
    </span>
  );
}

function DurationBar({ startDate, endDate }: { startDate: string; endDate: string }) {
  const total   = parseDate(endDate).getTime() - parseDate(startDate).getTime();
  const elapsed = Math.min(Date.now(), parseDate(endDate).getTime()) - parseDate(startDate).getTime();
  const pct     = Math.max(0, Math.min(100, (elapsed / total) * 100));
  const days    = daysRemaining(endDate);
  const status  = getDateStatus(endDate);
  const barColor = status === "expired" ? "bg-red-400" : status === "expiring" ? "bg-amber-400" : "bg-emerald-500";

  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-[10px] text-zinc-400">
        <span>{formatDate(startDate)}</span>
        <span className={`font-semibold ${status === "expired" ? "text-red-500" : status === "expiring" ? "text-amber-600" : "text-zinc-500"}`}>
          {status === "expired" ? "Sudah berakhir" : `${days} hari tersisa`}
        </span>
        <span>{formatDate(endDate)}</span>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-3.5 ${color}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/60">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[11px] font-semibold opacity-60 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, isLink }: {
  icon: React.ElementType; label: string; value: string; isLink?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-zinc-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-zinc-400 font-medium">{label}</p>
        {isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-600 hover:underline truncate block">
            {value}
          </a>
        ) : (
          <p className="text-sm font-semibold text-zinc-900 break-all">{value}</p>
        )}
      </div>
    </div>
  );
}

// ─── Timeline Monitor ─────────────────────────────────────────────────────────

/**
 * Shows a mini Gantt-style timeline for the next 60 days,
 * so admin can visually see when each slot opens up.
 */
function SlotTimeline({ ads }: { ads: EnrichedAd[] }) {
  const DAYS = 60;
  const todayTs = new Date();
  todayTs.setHours(0, 0, 0, 0);

  // Only non-expired ads are relevant
  const relevant = ads
    .filter((a) => a.displayStatus !== "expired")
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.id - b.id);

  // Build day-by-day slot occupancy
  const slotDays: Array<{ date: string; slot1: EnrichedAd | null; slot2: EnrichedAd | null }> = [];

  for (let i = 0; i < DAYS; i++) {
    const d = new Date(todayTs);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    // On this day, which ads are active?
    const activeOnDay = relevant.filter(
      (a) => a.startDate <= dateStr && a.endDate >= dateStr
    );
    slotDays.push({
      date: dateStr,
      slot1: activeOnDay[0] ?? null,
      slot2: activeOnDay[1] ?? null,
    });
  }

  // Find slot-opening events (when a queued ad would become live)
  // We only show week markers for readability
  const weeks: Array<{ label: string; days: typeof slotDays }> = [];
  for (let w = 0; w < Math.ceil(DAYS / 7); w++) {
    const chunk = slotDays.slice(w * 7, w * 7 + 7);
    if (chunk.length) {
      const d = parseDate(chunk[0].date);
      weeks.push({
        label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        days: chunk,
      });
    }
  }

  // Color per ad id (consistent)
  const palette = [
    "bg-emerald-400", "bg-amber-400", "bg-blue-400",
    "bg-violet-400", "bg-rose-400", "bg-cyan-400",
  ];
  const adColor = (id: number) => palette[relevant.findIndex((a) => a.id === id) % palette.length];

  // Find next slot-open dates
  const nextOpenSlot1 = slotDays.find((d) => !d.slot1);
  const nextOpenSlot2 = slotDays.find((d) => !d.slot2);

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
            <Calendar className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">Monitor Slot Tayang</p>
            <p className="text-xs text-zinc-400">Timeline 60 hari ke depan · {MAX_LIVE_SLOTS} slot tersedia</p>
          </div>
        </div>
        {/* Slot open info */}
        <div className="hidden sm:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-zinc-200" />
            <span className="text-zinc-400">
              Slot 1 kosong: {nextOpenSlot1 ? formatDate(nextOpenSlot1.date) : "Penuh 60 hari"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-zinc-200" />
            <span className="text-zinc-400">
              Slot 2 kosong: {nextOpenSlot2 ? formatDate(nextOpenSlot2.date) : "Penuh 60 hari"}
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {relevant.map((ad) => (
          <div key={ad.id} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-sm ${adColor(ad.id)}`} />
            <span className="text-[11px] text-zinc-500 font-medium truncate max-w-[100px]">{ad.partnerName}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-zinc-100 border border-zinc-200" />
          <span className="text-[11px] text-zinc-400">Kosong</span>
        </div>
      </div>

      {/* Gantt grid */}
      <div className="space-y-2 overflow-x-auto pb-1">
        {/* Week labels */}
        <div className="flex gap-px min-w-max">
          {weeks.map((w, wi) => (
            <div key={wi} className="flex gap-px">
              <div className="w-16 text-[9px] text-zinc-400 font-medium mb-1 pl-0.5">{w.label}</div>
              {w.days.slice(1).map((_, di) => (
                <div key={di} className="w-6" />
              ))}
            </div>
          ))}
        </div>

        {/* Slot 1 row */}
        <div className="flex items-center gap-1 min-w-max">
          <span className="w-12 shrink-0 text-[10px] font-semibold text-zinc-500 text-right pr-2">Slot 1</span>
          <div className="flex gap-px">
            {slotDays.map((d, i) => {
              const isToday = d.date === today;
              return (
                <div
                  key={i}
                  title={d.slot1 ? `${d.slot1.partnerName} · ${formatDate(d.date)}` : `Kosong · ${formatDate(d.date)}`}
                  className={`h-5 w-6 rounded-sm transition-opacity cursor-default
                    ${isToday ? "ring-1 ring-zinc-400 ring-offset-1" : ""}
                    ${d.slot1 ? adColor(d.slot1.id) : "bg-zinc-100 border border-zinc-150"}
                  `}
                />
              );
            })}
          </div>
        </div>

        {/* Slot 2 row */}
        <div className="flex items-center gap-1 min-w-max">
          <span className="w-12 shrink-0 text-[10px] font-semibold text-zinc-500 text-right pr-2">Slot 2</span>
          <div className="flex gap-px">
            {slotDays.map((d, i) => {
              const isToday = d.date === today;
              return (
                <div
                  key={i}
                  title={d.slot2 ? `${d.slot2.partnerName} · ${formatDate(d.date)}` : `Kosong · ${formatDate(d.date)}`}
                  className={`h-5 w-6 rounded-sm transition-opacity cursor-default
                    ${isToday ? "ring-1 ring-zinc-400 ring-offset-1" : ""}
                    ${d.slot2 ? adColor(d.slot2.id) : "bg-zinc-100 border border-zinc-150"}
                  `}
                />
              );
            })}
          </div>
        </div>

        {/* Today marker label */}
        <div className="flex items-center gap-1 min-w-max">
          <span className="w-12 shrink-0" />
          <div className="flex gap-px">
            {slotDays.map((d, i) => (
              <div key={i} className="w-6 flex justify-center">
                {d.date === today && (
                  <span className="text-[8px] font-bold text-zinc-500">▲</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Queue preview: which queued ads are waiting and when they'll go live */}
      {relevant.filter((a) => a.displayStatus === "queued").length > 0 && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 space-y-1.5">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <ListOrdered className="h-3 w-3" /> Antrian — akan otomatis tayang saat slot kosong
          </p>
          {relevant
            .filter((a) => a.displayStatus === "queued")
            .map((a) => {
              // Find the first day this ad would occupy slot 1 or 2
              const firstLiveDay = slotDays.find(
                (d) => d.date >= a.startDate && d.date <= a.endDate &&
                  (d.slot1?.id === a.id || d.slot2?.id === a.id)
              );
              return (
                <div key={a.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`h-2 w-2 rounded-full ${adColor(a.id)} shrink-0`} />
                    <span className="text-xs font-semibold text-blue-800 truncate">{a.partnerName}</span>
                    <span className="text-xs text-blue-500 truncate hidden sm:block">· {a.title}</span>
                  </div>
                  <span className="text-[11px] text-blue-600 font-medium shrink-0">
                    {firstLiveDay
                      ? `Tayang mulai ${formatDate(firstLiveDay.date)}`
                      : "Belum ada slot dalam 60 hari"}
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

const DURATION_OPTIONS = [7, 14, 30, 60, 90];

const emptyForm = {
  partnerName: "", partnerContact: "", title: "", description: "",
  imageUrl: "", linkUrl: "", startDate: today, durationDays: 30,
};

export default function AdminAds() {
  const [ads, setAds]                   = useState<PartnerAd[]>(mockAds);
  const { toast }                        = useToast();
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DisplayStatus>("all");
  const [addOpen, setAddOpen]           = useState(false);
  const [detailAd, setDetailAd]         = useState<EnrichedAd | null>(null);
  const [deleteAd, setDeleteAd]         = useState<EnrichedAd | null>(null);
  const [form, setForm]                 = useState({ ...emptyForm });

  // ── Derived ──
  const enriched = useMemo(() => enrichAds(ads), [ads]);

  const filtered = enriched.filter((a) => {
    const q = search.toLowerCase();
    return (
      (a.partnerName.toLowerCase().includes(q) || a.title.toLowerCase().includes(q)) &&
      (statusFilter === "all" || a.displayStatus === statusFilter)
    );
  });

  const countLive     = enriched.filter((a) => a.displayStatus === "live" || a.displayStatus === "expiring").length;
  const countQueued   = enriched.filter((a) => a.displayStatus === "queued").length;
  const countExpiring = enriched.filter((a) => a.displayStatus === "expiring").length;
  const countExpired  = enriched.filter((a) => a.displayStatus === "expired").length;

  // filter button definitions with optional activeClass
  type FilterKey = "all" | DisplayStatus;
  const filterOptions: { key: FilterKey; label: string; activeClass?: string }[] = [
    { key: "all",      label: `Semua (${ads.length})` },
    { key: "live",     label: `Tayang (${countLive})`,          activeClass: "bg-emerald-600 text-white border-emerald-600" },
    { key: "queued",   label: `Antrian (${countQueued})`,       activeClass: "bg-blue-600 text-white border-blue-600" },
    { key: "expiring", label: `Hampir Habis (${countExpiring})`,activeClass: "bg-amber-500 text-white border-amber-500" },
    { key: "expired",  label: `Kadaluarsa (${countExpired})`,   activeClass: "bg-red-500 text-white border-red-500" },
  ];

  // If slots are full, auto-advance startDate to the next open slot
  const slotsAreFull       = countLive >= MAX_LIVE_SLOTS;
  const nextSlotOpen       = slotsAreFull ? getNextSlotOpenDate(ads, form.startDate) : null;
  const effectiveStartDate = slotsAreFull && nextSlotOpen ? nextSlotOpen : form.startDate;
  const effectiveEndDate   = addDays(effectiveStartDate, form.durationDays);
  const endDate            = effectiveEndDate; // alias for handleAdd

  // ── Handlers ──
  const handleAdd = () => {
    const newAd: PartnerAd = {
      id: Date.now(),
      ...form,
      startDate: effectiveStartDate,
      endDate: effectiveEndDate,
      createdAt: today,
    };
    setAds((prev) => [newAd, ...prev]);
    toast({ title: "Iklan Ditambahkan", description: `Iklan mitra "${form.partnerName}" berhasil disimpan.` });
    setAddOpen(false);
    setForm({ ...emptyForm });
  };

  const handleConfirmDelete = () => {
    if (!deleteAd) return;
    setAds((prev) => prev.filter((a) => a.id !== deleteAd.id));
    toast({ title: "Iklan Dihapus", description: `Iklan "${deleteAd.title}" telah dihapus.` });
    setDeleteAd(null);
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 lg:p-10 space-y-6">

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-orange-100 p-2">
              <Megaphone className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Iklan Mitra</h1>
              <p className="text-sm text-muted-foreground">
                Kelola promosi mitra · maks. {MAX_LIVE_SLOTS} slot tayang di landing page
              </p>
            </div>
          </div>
          <Button onClick={() => setAddOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
            <Plus className="h-4 w-4" />
            Tambah Iklan
          </Button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard icon={Radio}         label={`Tayang (${MAX_LIVE_SLOTS} slot)`} value={`${countLive}/${MAX_LIVE_SLOTS}`} color="bg-emerald-50 border-emerald-100 text-emerald-700" />
          <SummaryCard icon={ListOrdered}   label="Antrian"       value={countQueued}   color="bg-blue-50 border-blue-100 text-blue-700" />
          <SummaryCard icon={AlertTriangle} label="Hampir Habis"  value={countExpiring} color="bg-amber-50 border-amber-100 text-amber-700" />
          <SummaryCard icon={TrendingDown}  label="Kadaluarsa"    value={countExpired}  color="bg-red-50 border-red-100 text-red-600" />
        </div>

        {/* SLOT TIMELINE */}
        <SlotTimeline ads={enriched} />

        {/* FILTERS */}
        <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Cari nama mitra atau judul iklan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              { key: "all",      label: `Semua (${ads.length})`, activeClass: "" },
              { key: "live",     label: `Tayang (${countLive})`,          activeClass: "bg-emerald-600 text-white border-emerald-600" },
              { key: "queued",   label: `Antrian (${countQueued})`,       activeClass: "bg-blue-600 text-white border-blue-600" },
              { key: "expiring", label: `Hampir Habis (${countExpiring})`,activeClass: "bg-amber-500 text-white border-amber-500" },
              { key: "expired",  label: `Kadaluarsa (${countExpired})`,   activeClass: "bg-red-500 text-white border-red-500" },
            ] as const).map(({ key, label, activeClass = "" }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`h-8 rounded-full px-4 text-xs font-semibold transition-all border ${
                  statusFilter === key
                    ? (activeClass ?? "bg-zinc-800 text-white border-zinc-800")
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* AD LIST */}
        <div className="space-y-3">
          <p className="text-xs text-zinc-400 font-medium">
            Menampilkan <span className="text-zinc-900 font-bold">{filtered.length}</span> dari {ads.length} iklan
          </p>

          {filtered.length > 0 ? (
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-3">
              {filtered.map((ad) => {
                const days = daysRemaining(ad.endDate);
                const sc   = displayStatusConfig[ad.displayStatus];
                return (
                  <motion.div
                    key={ad.id}
                    variants={staggerItem}
                    className="rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="flex">
                      {/* Thumbnail */}
                      <div className="relative w-36 sm:w-48 shrink-0 overflow-hidden">
                        {ad.imageUrl ? (
                          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full min-h-[130px] bg-zinc-100 flex items-center justify-center">
                            <Megaphone className="h-8 w-8 text-zinc-300" />
                          </div>
                        )}
                        {/* Status badge overlay */}
                        <div className="absolute top-2 left-2">
                          <DisplayStatusBadge status={ad.displayStatus} />
                        </div>
                        {/* Slot number badge */}
                        {ad.slotIndex && (
                          <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white text-[10px] font-bold">
                            #{ad.slotIndex}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 flex flex-col justify-between gap-3 min-w-0">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <Building2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              <p className="text-xs font-semibold text-zinc-500 truncate">{ad.partnerName}</p>
                            </div>
                            <h3 className="text-sm font-bold text-zinc-900 leading-tight line-clamp-1">{ad.title}</h3>
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{ad.description}</p>
                          </div>
                          {/* Days pill */}
                          <div className={`shrink-0 rounded-xl border px-3 py-2 text-center min-w-[72px] ${sc.bgColor} ${sc.borderColor}`}>
                            <p className={`text-xl font-black leading-none ${sc.textColor}`}>
                              {ad.displayStatus === "expired" ? "–" : days}
                            </p>
                            <p className={`text-[10px] font-semibold mt-0.5 opacity-70 ${sc.textColor}`}>
                              {ad.displayStatus === "expired" ? "selesai" : "hari lagi"}
                            </p>
                          </div>
                        </div>

                        {/* Duration bar */}
                        <DurationBar startDate={ad.startDate} endDate={ad.endDate} />

                        {/* Bottom row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 text-xs text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {ad.durationDays} hari
                            </span>
                            <span className="flex items-center gap-1">
                              <Link2 className="h-3 w-3" />
                              <span className="truncate max-w-[140px]">{ad.linkUrl.replace(/^https?:\/\//, "")}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setDetailAd(ad)}
                              title="Lihat detail"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteAd(ad)}
                              title="Hapus iklan"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-zinc-100 bg-white py-16 text-center">
              <Megaphone className="h-10 w-10 text-zinc-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-zinc-400">Tidak ada iklan ditemukan</p>
              <p className="text-xs text-zinc-300 mt-1">Coba ubah filter atau tambah iklan baru</p>
            </div>
          )}
        </div>

        {/* ── DETAIL DIALOG ── */}
        <Dialog open={!!detailAd} onOpenChange={() => setDetailAd(null)}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            {detailAd && (() => {
              const days = daysRemaining(detailAd.endDate);
              const sc   = displayStatusConfig[detailAd.displayStatus];
              return (
                <>
                  {detailAd.imageUrl && (
                    <div className="relative h-44">
                      <img src={detailAd.imageUrl} alt={detailAd.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="text-white font-bold text-base leading-snug">{detailAd.title}</p>
                        <p className="text-white/70 text-xs mt-0.5">{detailAd.partnerName}</p>
                      </div>
                    </div>
                  )}
                  <div className="px-5 py-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DisplayStatusBadge status={detailAd.displayStatus} />
                        {detailAd.slotIndex && (
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-600">
                            Slot #{detailAd.slotIndex}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm font-bold ${sc.textColor}`}>
                        {detailAd.displayStatus === "expired"
                          ? "Iklan telah berakhir"
                          : detailAd.displayStatus === "queued"
                          ? "Menunggu slot kosong"
                          : `${days} hari tersisa`}
                      </span>
                    </div>

                    {detailAd.displayStatus === "queued" && (
                      <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5">
                        <ListOrdered className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                          Iklan ini sedang dalam antrian. Akan otomatis tayang begitu salah satu slot kosong.
                        </p>
                      </div>
                    )}

                    {detailAd.description && (
                      <p className="text-sm text-zinc-600 leading-relaxed">{detailAd.description}</p>
                    )}
                    <div className="space-y-2.5">
                      <DetailRow icon={Building2} label="Mitra"          value={detailAd.partnerName} />
                      <DetailRow icon={FileText}  label="Kontak"         value={detailAd.partnerContact} />
                      <DetailRow icon={Link2}     label="URL Tujuan"     value={detailAd.linkUrl} isLink />
                      <DetailRow icon={Calendar}  label="Mulai Tayang"   value={formatDate(detailAd.startDate)} />
                      <DetailRow icon={Clock}     label="Selesai Tayang" value={formatDate(detailAd.endDate)} />
                      <DetailRow icon={BarChart2} label="Durasi"         value={`${detailAd.durationDays} hari`} />
                    </div>
                    <div className="pt-1">
                      <DurationBar startDate={detailAd.startDate} endDate={detailAd.endDate} />
                    </div>
                  </div>
                  <DialogFooter className="px-5 pb-5 gap-2">
                    {detailAd.displayStatus === "expired" && (
                      <Button variant="destructive" className="flex-1"
                        onClick={() => { setDeleteAd(detailAd); setDetailAd(null); }}>
                        <Trash2 className="h-4 w-4 mr-1.5" /> Hapus Iklan
                      </Button>
                    )}
                    <Button variant="outline" className="flex-1" onClick={() => setDetailAd(null)}>Tutup</Button>
                  </DialogFooter>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* ── ADD DIALOG ── */}
        <Dialog open={addOpen} onOpenChange={() => setAddOpen(false)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                  <Plus className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <DialogTitle>Tambah Iklan Mitra</DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    Isi informasi iklan yang ingin ditampilkan di landing page
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Slot info banner */}
            {countLive >= MAX_LIVE_SLOTS && (
              <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5 -mt-1">
                <ListOrdered className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Kedua slot sedang penuh. Iklan baru akan masuk antrian dan otomatis tayang saat ada slot kosong.
                </p>
              </div>
            )}

            <div className="space-y-4 py-2">
              {/* Informasi Mitra */}
              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3.5 space-y-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Informasi Mitra</p>
                <FormField label="Nama Mitra / Perusahaan" icon={Building2} required>
                  <Input placeholder="Contoh: Garuda Indonesia" value={form.partnerName}
                    onChange={(e) => setForm({ ...form, partnerName: e.target.value })}
                    className="h-10 rounded-xl border-zinc-200 bg-white" />
                </FormField>
                <FormField label="Email / Kontak Mitra" icon={FileText}>
                  <Input placeholder="marketing@perusahaan.com" value={form.partnerContact}
                    onChange={(e) => setForm({ ...form, partnerContact: e.target.value })}
                    className="h-10 rounded-xl border-zinc-200 bg-white" />
                </FormField>
              </div>

              {/* Konten Iklan */}
              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3.5 space-y-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Konten Iklan</p>
                <FormField label="Judul Iklan" icon={Megaphone} required>
                  <Input placeholder="Contoh: Terbang Lebih Hemat Bersama Kami" value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="h-10 rounded-xl border-zinc-200 bg-white" />
                </FormField>
                <FormField label="Deskripsi Singkat" icon={FileText}>
                  <textarea placeholder="Deskripsi iklan yang akan ditampilkan..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                </FormField>
                <FormField label="URL Gambar Iklan" icon={Megaphone}>
                  <Input placeholder="https://... (link gambar banner)" value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="h-10 rounded-xl border-zinc-200 bg-white" />
                </FormField>
                <FormField label="URL Tujuan (Link Iklan)" icon={Link2} required>
                  <Input placeholder="https://mitra.com/promo" value={form.linkUrl}
                    onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                    className="h-10 rounded-xl border-zinc-200 bg-white" />
                </FormField>
              </div>

              {/* Waktu Tayang */}
              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3.5 space-y-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Waktu Tayang</p>
                <FormField label="Tanggal Mulai" icon={Calendar} required>
                  <Input type="date" value={form.startDate} min={today}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="h-10 rounded-xl border-zinc-200 bg-white" />
                </FormField>
                <FormField label="Durasi Tayang" icon={Clock} required>
                  <div className="flex flex-wrap gap-2">
                    {DURATION_OPTIONS.map((d) => (
                      <button key={d} type="button"
                        onClick={() => setForm({ ...form, durationDays: d })}
                        className={`h-9 rounded-xl px-4 text-sm font-semibold border transition-all ${
                          form.durationDays === d
                            ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                            : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        {d} hari
                      </button>
                    ))}
                  </div>
                </FormField>
                {form.startDate && (
                  <div className={`flex items-start gap-2 rounded-xl px-3 py-2.5 border ${slotsAreFull && nextSlotOpen ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100"}`}>
                    <Clock className={`h-4 w-4 shrink-0 mt-0.5 ${slotsAreFull && nextSlotOpen ? "text-amber-400" : "text-blue-400"}`} />
                    <div className="space-y-0.5">
                      <p className={`text-xs ${slotsAreFull && nextSlotOpen ? "text-amber-700" : "text-blue-700"}`}>
                        Iklan akan tayang dari{" "}
                        <span className="font-bold">{formatDate(effectiveStartDate)}</span>
                        {" "}hingga{" "}
                        <span className="font-bold">{formatDate(effectiveEndDate)}</span>
                        {" "}({form.durationDays} hari)
                      </p>
                      {slotsAreFull && nextSlotOpen && (
                        <p className="text-[11px] text-amber-600">
                          Slot penuh — tanggal mulai otomatis disesuaikan ke slot kosong terdekat
                          {form.startDate !== effectiveStartDate && (
                            <span> (dari {formatDate(form.startDate)})</span>
                          )}
                        </p>
                      )}
                      {slotsAreFull && !nextSlotOpen && (
                        <p className="text-[11px] text-amber-600 font-semibold">
                          Tidak ada slot kosong dalam 120 hari ke depan
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="flex-1">Batal</Button>
              <Button
                onClick={handleAdd}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!form.partnerName || !form.title || !form.linkUrl || !form.startDate}
              >
                Simpan Iklan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── DELETE DIALOG ── */}
        <Dialog open={!!deleteAd} onOpenChange={() => setDeleteAd(null)}>
          <DialogContent className="max-w-sm">
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="h-7 w-7 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">Hapus Iklan?</h3>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Iklan dari mitra{" "}
                  <span className="font-semibold text-zinc-800">{deleteAd?.partnerName}</span>
                  {" "}akan dihapus secara permanen.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteAd(null)} className="flex-1">Batal</Button>
              <Button variant="destructive" onClick={handleConfirmDelete} className="flex-1">Ya, Hapus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}