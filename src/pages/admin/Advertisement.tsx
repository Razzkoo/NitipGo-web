import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Megaphone, Search, Trash2, Plus, X,
  Calendar, Link2, Clock, CheckCircle,
  TrendingDown, Building2, Phone,
  Eye, BarChart2, FileText, Radio, ListOrdered,
  Loader2, ExternalLink, ImageOff, CreditCard,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import api from "@/lib/api";

// ─── Constants ─────────────────────────────────────────────────────────────────

const MAX_LIVE_SLOTS = 3;

const PACKAGES = {
  basic:    { days: 7,  price: 150_000, label: "Basic",    color: "border-zinc-200 bg-zinc-50",      active: "border-orange-400 bg-orange-50 ring-2 ring-orange-200" },
  standard: { days: 14, price: 250_000, label: "Standard", color: "border-blue-200 bg-blue-50/50",   active: "border-blue-500 bg-blue-50 ring-2 ring-blue-200" },
  premium:  { days: 30, price: 450_000, label: "Premium",  color: "border-amber-200 bg-amber-50/50", active: "border-amber-500 bg-amber-50 ring-2 ring-amber-200" },
} as const;

type PackageKey = keyof typeof PACKAGES;
type AdStatus = "pending" | "active" | "expired" | "rejected";
type DisplayStatus = "live" | "expiring" | "queued" | "pending" | "expired" | "rejected";

interface PartnerAd {
  id: number;
  code: string;
  partnerName: string;
  partnerContact?: string;
  title: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  package: PackageKey;
  status: AdStatus;
  slotIndex: number | null;
  daysRemaining: number;
  isExpiring: boolean;
  payment?: { status: string; amount: number; paidAt: string | null; paymentType: string | null } | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(str: string): string {
  return new Date(str + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

function getDisplayStatus(ad: PartnerAd): DisplayStatus {
  if (ad.status === "expired")  return "expired";
  if (ad.status === "rejected") return "rejected";
  if (ad.status === "pending")  return "pending";
  if (ad.status === "active") {
    if (ad.slotIndex !== null) {
      return ad.daysRemaining <= 3 ? "expiring" : "live"; 
    }
    return "queued"; 
  }
  return "queued";
}

// ─── Status Config ─────────────────────────────────────────────────────────────

const statusCfg: Record<DisplayStatus, {
  label: string; text: string; bg: string; border: string; dot: string;
}> = {
  live:     { label: "Tayang",       text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
  expiring: { label: "Hampir Habis", text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   dot: "bg-amber-500"   },
  queued:   { label: "Antrian",      text: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",    dot: "bg-blue-500"    },
  pending:  { label: "Belum Bayar",  text: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200",  dot: "bg-violet-500"  },
  expired:  { label: "Kadaluarsa",   text: "text-red-600",     bg: "bg-red-50",     border: "border-red-200",     dot: "bg-red-400"     },
  rejected: { label: "Ditolak",      text: "text-zinc-500",    bg: "bg-zinc-100",   border: "border-zinc-200",    dot: "bg-zinc-400"    },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DisplayStatus }) {
  const c = statusCfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${c.text} ${c.bg} ${c.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}

function PackageBadge({ pkg }: { pkg: PackageKey }) {
  const colors: Record<PackageKey, string> = {
    premium:  "bg-amber-50 text-amber-700 border-amber-200",
    standard: "bg-blue-50 text-blue-700 border-blue-200",
    basic:    "bg-zinc-50 text-zinc-600 border-zinc-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colors[pkg]}`}>
      {PACKAGES[pkg].label} · {PACKAGES[pkg].days}h
    </span>
  );
}

function DurationBar({ startDate, endDate, daysRemaining }: { startDate: string; endDate: string; daysRemaining: number }) {
  const start   = new Date(startDate).getTime();
  const end     = new Date(endDate).getTime();
  const now     = Date.now();
  const total   = end - start;
  const elapsed = Math.min(now, end) - start;
  const pct     = total > 0 ? Math.max(0, Math.min(100, (elapsed / total) * 100)) : 0;
  const color = daysRemaining <= 0 ? "bg-red-400" : daysRemaining <= 3 ? "bg-amber-400" : "bg-emerald-500";

  return (
    <div className="space-y-1.5">
      <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-zinc-400">
        <span>{formatDate(startDate)}</span>
        <span className={`font-semibold ${daysRemaining <= 0 ? "text-red-500" : daysRemaining <= 3 ? "text-amber-600" : "text-zinc-500"}`}>
          {daysRemaining <= 0 ? "Berakhir" : `${daysRemaining} hari lagi`}
        </span>
        <span>{formatDate(endDate)}</span>
      </div>
    </div>
  );
}

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item    = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function AdminAds() {
  const { toast } = useToast();
  const [ads, setAds]         = useState<PartnerAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DisplayStatus>("all");
  const [detailAd, setDetailAd] = useState<PartnerAd | null>(null);
  const [deleteAd, setDeleteAd] = useState<PartnerAd | null>(null);
  const [addOpen, setAddOpen]   = useState(false);

  const [form, setForm] = useState({
    partnerName: "", partnerContact: "", title: "",
    description: "", imageUrl: "", linkUrl: "",
    package: "basic" as PackageKey,
  });
  const [saving, setSaving] = useState(false);

  const fetchAds = () => {
    setLoading(true);
    api.get("/admin/advertisements")
      .then(res => { setAds(res.data.data?.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAds(); }, []);

  const enriched = useMemo(() =>
    ads.map(a => ({ ...a, displayStatus: getDisplayStatus(a) })), [ads]);

  const filtered = enriched.filter(a => {
    const q = search.toLowerCase();
    const matchQ = !q || a.partnerName.toLowerCase().includes(q) || a.title.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || a.displayStatus === statusFilter;
    return matchQ && matchS;
  });

  const counts = {
    live:    enriched.filter(a => a.displayStatus === "live" || a.displayStatus === "expiring").length,
    queued:  enriched.filter(a => a.displayStatus === "queued").length,
    pending: enriched.filter(a => a.displayStatus === "pending").length,
    expired: enriched.filter(a => a.displayStatus === "expired").length,
  };

  const handleAdd = async () => {
    if (!form.partnerName || !form.title || !form.linkUrl) return;
    setSaving(true);
    try {
      await api.post("/admin/advertisements/approve-manual", { ...form, image_url: form.imageUrl });
      toast({ title: "Iklan ditambahkan" });
      setAddOpen(false);
      setForm({ partnerName: "", partnerContact: "", title: "", description: "", imageUrl: "", linkUrl: "", package: "basic" });
      fetchAds();
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal menambahkan iklan", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleApprove = async (id: number) => {
    try { await api.patch(`/admin/advertisements/${id}/approve`); toast({ title: "Iklan disetujui" }); fetchAds(); }
    catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const handleReject = async (id: number) => {
    try { await api.patch(`/admin/advertisements/${id}/reject`); toast({ title: "Iklan ditolak" }); fetchAds(); }
    catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const handleDelete = async () => {
    if (!deleteAd) return;
    try {
      await api.delete(`/admin/advertisements/${deleteAd.id}`);
      toast({ title: "Iklan dihapus" });
      setDeleteAd(null);
      if (detailAd?.id === deleteAd.id) setDetailAd(null);
      fetchAds();
    } catch { toast({ title: "Gagal menghapus", variant: "destructive" }); }
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-2.5">
              <Megaphone className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">Iklan Mitra</h1>
              <p className="text-sm text-zinc-500">Kelola promosi mitra · maks. {MAX_LIVE_SLOTS} slot tayang</p>
            </div>
          </div>
          <Button onClick={() => setAddOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Tambah Iklan
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {([
            { icon: Radio,        label: "Tayang",      value: `${counts.live}/${MAX_LIVE_SLOTS}`, bg: "bg-emerald-50", border: "border-emerald-100", ic: "text-emerald-600", tx: "text-emerald-800" },
            { icon: ListOrdered,  label: "Antrian",     value: counts.queued,                       bg: "bg-blue-50",    border: "border-blue-100",    ic: "text-blue-600",    tx: "text-blue-800"    },
            { icon: CreditCard,   label: "Belum Bayar", value: counts.pending,                      bg: "bg-violet-50",  border: "border-violet-100",  ic: "text-violet-600",  tx: "text-violet-800"  },
            { icon: TrendingDown, label: "Kadaluarsa",  value: counts.expired,                      bg: "bg-red-50",     border: "border-red-100",     ic: "text-red-600",     tx: "text-red-800"     },
          ] as const).map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`rounded-xl border p-4 flex items-center gap-3 ${s.bg} ${s.border}`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/70">
                <s.icon className={`h-5 w-5 ${s.ic}`} />
              </div>
              <div>
                <p className={`text-[11px] font-medium opacity-60 ${s.tx}`}>{s.label}</p>
                <p className={`text-xl font-bold leading-tight ${s.tx}`}>{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input placeholder="Cari nama mitra atau judul iklan..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-lg border-zinc-200 bg-zinc-50 focus:bg-white text-sm" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              { key: "all",      label: `Semua (${ads.length})`,           active: "bg-zinc-800 text-white border-zinc-800"       },
              { key: "live",     label: `Tayang (${counts.live})`,         active: "bg-emerald-600 text-white border-emerald-600" },
              { key: "queued",   label: `Antrian (${counts.queued})`,      active: "bg-blue-600 text-white border-blue-600"       },
              { key: "pending",  label: `Belum Bayar (${counts.pending})`, active: "bg-violet-600 text-white border-violet-600"   },
              { key: "expiring", label: "Hampir Habis",                    active: "bg-amber-500 text-white border-amber-500"     },
              { key: "expired",  label: `Kadaluarsa (${counts.expired})`,  active: "bg-red-500 text-white border-red-500"         },
            ] as const).map(({ key, label, active }) => (
              <button key={key} onClick={() => setStatusFilter(key)}
                className={`h-8 rounded-full px-3.5 text-xs font-semibold transition-all border ${
                  statusFilter === key ? active : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-2.5">
          <p className="text-xs text-zinc-400 font-medium">
            Menampilkan <span className="text-zinc-700 font-bold">{filtered.length}</span> dari {ads.length} iklan
          </p>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-zinc-400" /></div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Megaphone} title="Tidak ada iklan" description="Coba ubah filter atau tambah iklan baru" />
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2.5">
              {filtered.map(ad => {
                const ds  = ad.displayStatus;
                const sc  = statusCfg[ds];
                return (
                  <motion.div key={ad.id} variants={item}
                    className="rounded-xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden group">
                    <div className="flex min-h-[120px]">

                      {/* Thumbnail */}
                      <div className="relative w-28 sm:w-36 shrink-0 overflow-hidden">
                        {ad.imageUrl ? (
                          <img src={ad.imageUrl} alt={ad.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-zinc-100 flex flex-col items-center justify-center gap-1.5 min-h-[120px]">
                            <ImageOff className="h-5 w-5 text-zinc-300" />
                            <p className="text-[9px] text-zinc-300">No Image</p>
                          </div>
                        )}
                        <div className="absolute top-2 left-2"><StatusBadge status={ds} /></div>
                        {ad.slotIndex && (
                          <div className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white text-[9px] font-bold">
                            {ad.slotIndex}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 min-w-0 flex flex-col justify-between gap-2">

                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              <span className="text-xs text-zinc-500 font-medium">{ad.partnerName}</span>
                              <PackageBadge pkg={ad.package} />
                            </div>
                            <h3 className="text-sm font-bold text-zinc-900 line-clamp-1">{ad.title}</h3>
                            {ad.description && (
                              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{ad.description}</p>
                            )}
                          </div>
                          <div className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-center min-w-[60px] ${sc.bg} ${sc.border}`}>
                            <p className={`text-base font-black leading-none ${sc.text}`}>
                              {["expired", "rejected", "pending"].includes(ds) ? "–" : ad.daysRemaining}
                            </p>
                            <p className={`text-[9px] font-semibold mt-0.5 ${sc.text} opacity-70`}>
                              {ds === "expired" ? "selesai" : ds === "rejected" ? "ditolak" : ds === "pending" ? "belum bayar" : "hari lagi"}
                            </p>
                          </div>
                        </div>

                        {ds !== "pending" && ds !== "rejected" && (
                          <DurationBar startDate={ad.startDate} endDate={ad.endDate} daysRemaining={ad.daysRemaining} />
                        )}

                        {ds === "pending" && ad.payment && (
                          <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-1.5 text-xs text-violet-700 flex items-center gap-2">
                            <CreditCard className="h-3 w-3 shrink-0" />
                            Menunggu pembayaran {formatRupiah(ad.payment.amount)}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 text-xs text-zinc-400 min-w-0">
                            <span className="flex items-center gap-1 shrink-0">
                              <Calendar className="h-3 w-3" />{ad.durationDays}h
                            </span>
                            <span className="flex items-center gap-1 truncate min-w-0">
                              <Link2 className="h-3 w-3 shrink-0" />
                              <span className="truncate">{ad.linkUrl.replace(/^https?:\/\//, "").substring(0, 28)}{ad.linkUrl.length > 38 ? "…" : ""}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {ds === "pending" && (
                              <>
                                <button onClick={() => handleApprove(ad.id)}
                                  className="flex h-8 items-center gap-1 px-2 rounded-lg text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition">
                                  <CheckCircle className="h-3.5 w-3.5" /> Setujui
                                </button>
                                <button onClick={() => handleReject(ad.id)}
                                  className="flex h-8 items-center gap-1 px-2 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 transition">
                                  <X className="h-3.5 w-3.5" /> Tolak
                                </button>
                              </>
                            )}
                            <button onClick={() => setDetailAd(ad)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeleteAd(ad)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-500 transition">
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
          )}
        </div>

        {/* ── Detail Dialog ── */}
        <Dialog open={!!detailAd} onOpenChange={() => setDetailAd(null)}>
          <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
            {detailAd && (() => {
              const ds     = getDisplayStatus(detailAd);
              const sc     = statusCfg[ds];
              const pkg    = PACKAGES[detailAd.package];
              const isPaid = detailAd.payment?.status === "paid";
              return (
                <>
                  {/* Image header */}
                  <div className="relative h-48 bg-zinc-100 flex-shrink-0">
                    {detailAd.imageUrl ? (
                      <img src={detailAd.imageUrl} alt={detailAd.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <ImageOff className="h-10 w-10 text-zinc-300" />
                        <p className="text-xs text-zinc-400">Tidak ada gambar</p>
                      </div>
                    )}
                    {detailAd.imageUrl && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`text-xs mb-0.5 ${detailAd.imageUrl ? "text-white/65" : "text-zinc-500"}`}>{detailAd.partnerName}</p>
                          <p className={`font-bold text-sm leading-snug line-clamp-2 ${detailAd.imageUrl ? "text-white" : "text-zinc-900"}`}>{detailAd.title}</p>
                        </div>
                        <StatusBadge status={ds} />
                      </div>
                    </div>
                  </div>

                  {/* Scrollable body */}
                  <div className="overflow-y-auto" style={{ maxHeight: "calc(80vh - 192px - 60px)" }}>
                    <div className="px-5 py-4 space-y-4">

                      {/* Badges row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {detailAd.slotIndex && (
                          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600">
                            Slot #{detailAd.slotIndex}
                          </span>
                        )}
                        <PackageBadge pkg={detailAd.package} />
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${sc.bg} ${sc.border} ${sc.text}`}>
                          {["expired", "rejected", "pending"].includes(ds) ? sc.label : `${detailAd.daysRemaining} hari tersisa`}
                        </span>
                      </div>

                      {detailAd.description && (
                        <p className="text-sm text-zinc-600 leading-relaxed">{detailAd.description}</p>
                      )}

                      {/* Info table */}
                      <div className="rounded-xl border border-zinc-100 bg-zinc-50 overflow-hidden divide-y divide-zinc-100">
                        {[
                          { icon: Building2, label: "Mitra",   value: detailAd.partnerName,                                          link: false },
                          { icon: Phone,     label: "Kontak",  value: detailAd.partnerContact ?? "–",                                link: false },
                          { icon: Calendar,  label: "Mulai",   value: formatDate(detailAd.startDate),                                link: false },
                          { icon: Clock,     label: "Selesai", value: formatDate(detailAd.endDate),                                  link: false },
                          { icon: BarChart2, label: "Paket",   value: `${pkg.label} · ${pkg.days} hari · ${formatRupiah(pkg.price)}`, link: false },
                        ].map((r, i) => (
                          <div key={i} className="flex items-center gap-3 px-3.5 py-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-zinc-100">
                              <r.icon className="h-3.5 w-3.5 text-zinc-400" />
                            </div>
                            <div className="flex items-baseline justify-between flex-1 gap-2 min-w-0">
                              <span className="text-xs text-zinc-400 shrink-0 w-14">{r.label}</span>
                              <span className="text-xs font-semibold text-zinc-800 text-right truncate flex-1">{r.value}</span>
                            </div>
                          </div>
                        ))}
                        {/* URL row */}
                        <div className="flex items-center gap-3 px-3.5 py-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-zinc-100">
                            <Link2 className="h-3.5 w-3.5 text-zinc-400" />
                          </div>
                          <div className="flex items-baseline justify-between flex-1 gap-2 min-w-0">
                            <span className="text-xs text-zinc-400 shrink-0 w-14">URL</span>
                            <a href={detailAd.linkUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 truncate flex-1 justify-end">
                              <span className="truncate">{detailAd.linkUrl.replace(/^https?:\/\//, "").substring(0, 32)}{detailAd.linkUrl.length > 42 ? "…" : ""}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Payment */}
                      {detailAd.payment && (
                        <div className={`rounded-xl border px-4 py-3 ${isPaid ? "bg-emerald-50 border-emerald-200" : "bg-violet-50 border-violet-200"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-zinc-600 flex items-center gap-1.5">
                              <CreditCard className={`h-3.5 w-3.5 ${isPaid ? "text-emerald-600" : "text-violet-500"}`} />
                              Pembayaran
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPaid ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}`}>
                              {isPaid ? "Lunas" : "Belum Bayar"}
                            </span>
                          </div>
                          <p className="text-lg font-black text-zinc-900">{formatRupiah(detailAd.payment.amount)}</p>
                          {isPaid && detailAd.payment.paidAt && (
                            <p className="text-xs text-zinc-500 mt-0.5">Dibayar: {detailAd.payment.paidAt}</p>
                          )}
                          {isPaid && detailAd.payment.paymentType && (
                            <p className="text-xs text-zinc-400">via {detailAd.payment.paymentType}</p>
                          )}
                        </div>
                      )}

                      {/* Duration bar */}
                      {ds !== "pending" && ds !== "rejected" && (
                        <DurationBar startDate={detailAd.startDate} endDate={detailAd.endDate} daysRemaining={detailAd.daysRemaining} />
                      )}

                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-4 border-t border-zinc-100 flex gap-2 bg-white">
                    {ds === "pending" && (
                      <>
                        <Button size="sm" onClick={() => { handleApprove(detailAd.id); setDetailAd(null); }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9">
                          <CheckCircle className="h-4 w-4 mr-1.5" /> Setujui
                        </Button>
                        <Button size="sm" variant="destructive"
                          onClick={() => { handleReject(detailAd.id); setDetailAd(null); }}
                          className="flex-1 h-9">
                          <X className="h-4 w-4 mr-1.5" /> Tolak
                        </Button>
                      </>
                    )}
                    <Button variant="outline" className="flex-1 h-9 border-zinc-200" onClick={() => setDetailAd(null)}>
                      Tutup
                    </Button>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* ── Add Dialog ── */}
        <Dialog open={addOpen} onOpenChange={v => { if (!v) setAddOpen(false); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                  <Plus className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <DialogTitle>Tambah Paket Iklan</DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">Isi informasi iklan mitra · maks. {MAX_LIVE_SLOTS} slot aktif</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3.5 space-y-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Informasi Mitra</p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Nama Mitra <span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="Contoh: Garuda Indonesia" value={form.partnerName}
                    onChange={e => setForm({ ...form, partnerName: e.target.value })} className="h-9 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Email / Kontak
                  </label>
                  <Input placeholder="marketing@perusahaan.com" value={form.partnerContact}
                    onChange={e => setForm({ ...form, partnerContact: e.target.value })} className="h-9 rounded-lg" />
                </div>
              </div>

              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3.5 space-y-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Konten Iklan</p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                    <Megaphone className="h-3.5 w-3.5" /> Judul Iklan <span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="Terbang Lebih Hemat Bersama Kami" value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })} className="h-9 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Deskripsi
                  </label>
                  <textarea rows={2} placeholder="Deskripsi singkat iklan..."
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="flex w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> URL Gambar Banner
                  </label>
                  <Input placeholder="https://... (link gambar)" value={form.imageUrl}
                    onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="h-9 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5" /> URL Tujuan <span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="https://mitra.com/promo" value={form.linkUrl}
                    onChange={e => setForm({ ...form, linkUrl: e.target.value })} className="h-9 rounded-lg" />
                </div>
              </div>

              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3.5 space-y-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pilih Paket</p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(PACKAGES) as [PackageKey, typeof PACKAGES[PackageKey]][]).map(([key, pkg]) => (
                    <button key={key} type="button" onClick={() => setForm({ ...form, package: key })}
                      className={`rounded-xl border-2 p-3 text-center transition-all ${form.package === key ? pkg.active : pkg.color}`}>
                      <p className="text-sm font-bold text-zinc-900">{pkg.label}</p>
                      <p className="text-lg font-black text-zinc-800">{pkg.days}<span className="text-xs font-normal"> hari</span></p>
                      <p className="text-xs font-semibold text-zinc-600 mt-0.5">{formatRupiah(pkg.price)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="flex-1 h-9">Batal</Button>
              <Button onClick={handleAdd} disabled={!form.partnerName || !form.title || !form.linkUrl || saving}
                className="flex-1 h-9 bg-orange-500 hover:bg-orange-600 text-white">
                {saving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Menyimpan...</> : "Simpan Iklan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Dialog ── */}
        <Dialog open={!!deleteAd} onOpenChange={() => setDeleteAd(null)}>
          <DialogContent className="max-w-sm">
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-100">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">Hapus Iklan?</h3>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Iklan dari <span className="font-semibold text-zinc-800">{deleteAd?.partnerName}</span> akan dihapus secara permanen.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteAd(null)} className="flex-1">Batal</Button>
              <Button variant="destructive" onClick={handleDelete} className="flex-1">Ya, Hapus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}