import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  AlertTriangle, CheckCircle, Eye, Clock,
  ChevronRight, User, Package, Calendar,
  Banknote, FileText, MessageSquare, ShieldCheck,
  AlertCircle, XCircle, RotateCcw, ArrowRight,
  Plane,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { CountUp } from "@/components/ui/CountUp";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type Dispute = {
  id: string;
  orderId: string;
  customer: string;
  traveler: string;
  issue: string;
  description: string;
  status: "open" | "in_review" | "resolved";
  priority: "high" | "medium" | "low";
  date: string;
  amount: string;
  resolution?: string;
  decision?: "refund" | "partial_refund" | "release_payment";
  adminNote?: string;
  travelerNote?: string;
  resolvedAt?: string;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockDisputes: Dispute[] = [
  {
    id: "DSP-001", orderId: "ORD-001",
    customer: "Budi Santoso", traveler: "Andi Pratama",
    issue: "Barang rusak saat pengiriman",
    description: "Sepatu yang dikirim kondisinya rusak, ada goresan di bagian samping.",
    status: "open", priority: "high", date: "15 Feb 2024", amount: "Rp 45.000"
  },
  {
    id: "DSP-002", orderId: "ORD-005",
    customer: "Rina Kusuma", traveler: "Sari Dewi",
    issue: "Barang tidak sesuai pesanan",
    description: "Warna barang yang diterima tidak sesuai dengan yang dipesan.",
    status: "in_review", priority: "medium", date: "14 Feb 2024", amount: "Rp 35.000"
  },
  {
    id: "DSP-003", orderId: "ORD-003",
    customer: "Maya Putri", traveler: "Dimas Wijaya",
    issue: "Barang hilang",
    description: "Traveler mengklaim sudah mengantarkan tapi customer belum menerima.",
    status: "open", priority: "high", date: "13 Feb 2024", amount: "Rp 150.000"
  },
  {
    id: "DSP-004", orderId: "ORD-010",
    customer: "Ahmad Fauzi", traveler: "Budi Santoso",
    issue: "Keterlambatan pengiriman",
    description: "Barang tiba 3 hari lebih lambat dari estimasi.",
    status: "resolved", priority: "low", date: "10 Feb 2024", amount: "Rp 25.000",
    resolution: "Refund 50% biaya pengiriman",
    decision: "partial_refund",
    adminNote: "Konfirmasi dengan traveler sudah dilakukan via chat.",
    resolvedAt: "12 Feb 2024, 14:30"
  },
];

// ─── Configs ──────────────────────────────────────────────────────────────────

const statusCfg = {
  open:      { label: "Baru",     icon: AlertCircle, dot: "bg-red-400",     chip: "bg-red-50 text-red-700 ring-1 ring-red-200",     bar: "bg-red-400" },
  in_review: { label: "Ditinjau", icon: Clock,       dot: "bg-amber-400",   chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", bar: "bg-amber-400" },
  resolved:  { label: "Selesai",  icon: CheckCircle, dot: "bg-emerald-400", chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", bar: "bg-emerald-400" },
};

const priorityCfg = {
  high:   { label: "Prioritas Tinggi", chip: "bg-red-50 text-red-600 ring-1 ring-red-100",       dot: "bg-red-400" },
  medium: { label: "Prioritas Sedang", chip: "bg-amber-50 text-amber-600 ring-1 ring-amber-100", dot: "bg-amber-400" },
  low:    { label: "Prioritas Rendah", chip: "bg-zinc-50 text-zinc-500 ring-1 ring-zinc-200",    dot: "bg-zinc-300" },
};

const decisionCfg = {
  refund:          { label: "Refund ke Customer",       icon: RotateCcw,    color: "text-red-600",     bg: "bg-red-50",     ring: "ring-red-200" },
  partial_refund:  { label: "Refund Sebagian",          icon: ArrowRight,   color: "text-amber-600",   bg: "bg-amber-50",   ring: "ring-amber-200" },
  release_payment: { label: "Lepaskan Dana ke Traveler",icon: ShieldCheck,  color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-200" },
};

const filterLabels: Record<string, string> = {
  all: "Semua", open: "Baru", in_review: "Ditinjau", resolved: "Selesai"
};


// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, count, icon: Icon, iconBg, iconColor, accentBar }: {
  label: string; count: number;
  icon: React.ElementType; iconBg: string; iconColor: string; accentBar: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="relative overflow-hidden rounded-2xl bg-white border border-zinc-100 p-5 shadow-sm cursor-default"
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentBar}`} />
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} shrink-0`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-0.5 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-zinc-800 leading-none">
            <CountUp key={count} end={count} duration={1000} />
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Decision Option Button ───────────────────────────────────────────────────

function DecisionOption({ value, selected, onSelect }: {
  value: "refund" | "partial_refund" | "release_payment";
  selected: boolean;
  onSelect: () => void;
}) {
  const cfg = decisionCfg[value];
  const DIcon = cfg.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ring-1
        ${selected
          ? `${cfg.bg} ${cfg.ring} shadow-sm`
          : "bg-zinc-50 ring-zinc-100 hover:bg-zinc-100"
        }`}
    >
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0
        ${selected ? `${cfg.bg} ring-1 ${cfg.ring}` : "bg-white ring-1 ring-zinc-200"}`}>
        <DIcon className={`h-4 w-4 ${selected ? cfg.color : "text-zinc-400"}`} />
      </div>
      <span className={`text-sm font-medium ${selected ? cfg.color : "text-zinc-500"}`}>
        {cfg.label}
      </span>
      {selected && (
        <CheckCircle className={`h-4 w-4 ml-auto shrink-0 ${cfg.color}`} />
      )}
    </button>
  );
}

// ─── Animation variant ────────────────────────────────────────────────────────

const listItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminDisputes() {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [, setLoading]          = useState(true);
  const [stats, setStats]       = useState({ open: 0, review: 0, resolved: 0 });
  const [viewDispute, setViewDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution]           = useState("");
  const [filter, setFilter]                   = useState("all");
  const [decision, setDecision]               = useState<Dispute["decision"]>(undefined);
  const [adminNote, setAdminNote]             = useState("");

  const filteredDisputes = disputes.filter(d => filter === "all" || d.status === filter);

  // fetch 
  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = () => {
    setLoading(true);
    api.get("/admin/disputes")
      .then(res => {
        setDisputes(res.data.data?.data ?? []);
        setStats(res.data.stats ?? {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-4 sm:p-6 md:p-8 space-y-6">

        {/* ── HEADER (unchanged) ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-lg bg-primary/10 p-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight">Disputes</h1>
                <p className="text-sm text-muted-foreground">Monitoring Laporan & Permasalahan transaksi pengguna</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Baru"     count={stats.open}     icon={AlertCircle} iconBg="bg-red-50"     iconColor="text-red-500"     accentBar="bg-red-400" />
          <StatCard label="Ditinjau" count={stats.review}   icon={Clock}       iconBg="bg-amber-50"   iconColor="text-amber-500"   accentBar="bg-amber-400" />
          <StatCard label="Selesai"  count={stats.resolved} icon={CheckCircle} iconBg="bg-emerald-50" iconColor="text-emerald-500" accentBar="bg-emerald-400" />
        </div>

        {/* ── FILTER TABS ── */}
        <div className="flex items-center gap-1.5 bg-zinc-100/70 rounded-xl p-1 w-fit">
          {(["all", "open", "in_review", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${filter === f
                  ? "bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-200/60"
                  : "text-zinc-400 hover:text-zinc-600"
                }`}
            >
              {filterLabels[f]}
              {f !== "all" && disputes.filter(d => d.status === f).length > 0 && (
                <span className={`ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-bold
                  ${filter === f ? statusCfg[f as keyof typeof statusCfg].chip : "bg-zinc-200 text-zinc-500"}`}>
                  {disputes.filter(d => d.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── DISPUTE LIST ── */}
        {filteredDisputes.length > 0 ? (
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          >
            <AnimatePresence mode="popLayout">
              {filteredDisputes.map((dispute) => {
                const sCfg = statusCfg[dispute.status];
                const pCfg = priorityCfg[dispute.priority];
                const SIcon = sCfg.icon;

                return (
                  <motion.div
                    key={dispute.id}
                    variants={listItem}
                    layout
                    exit={{ opacity: 0, y: -6 }}
                    className="group rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200 transition-all overflow-hidden"
                  >
                    {/* Left accent bar */}
                    <div className="flex">
                      <div className={`w-1 shrink-0 ${sCfg.bar}`} />

                      <div className="flex-1 p-5">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">

                          {/* Content */}
                          <div className="flex-1 min-w-0">

                            {/* Top meta row */}
                            <div className="flex flex-wrap items-center gap-2 mb-2.5">
                              <span className="text-xs font-mono font-semibold text-zinc-400">{dispute.id}</span>
                              <span className="text-zinc-200">·</span>
                              <span className="text-xs text-zinc-400">{dispute.orderId}</span>
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sCfg.chip}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${sCfg.dot}`} />
                                {sCfg.label}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pCfg.chip}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${pCfg.dot}`} />
                                {pCfg.label}
                              </span>
                            </div>

                            {/* Issue title */}
                            <h3 className="text-sm font-bold text-zinc-800 mb-1 leading-snug">{dispute.issue}</h3>
                            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{dispute.description}</p>

                            {/* Info row */}
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400">
                                <User className="h-3 w-3" />{dispute.customer}
                              </span>
                              <span className="text-zinc-200">·</span>
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400">
                                <Plane className="h-3 w-3" />{dispute.traveler}
                              </span>
                              <span className="text-zinc-200">·</span>
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400">
                                <Calendar className="h-3 w-3" />{dispute.date}
                              </span>
                              <span className="text-zinc-200">·</span>
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600">
                                <Banknote className="h-3 w-3" />{dispute.amount}
                              </span>
                            </div>

                            {/* Traveler answer — read only */}
                            {dispute.travelerNote && (
                              <div className="mt-3 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Plane className="h-3.5 w-3.5 text-primary shrink-0" />
                                  <p className="text-xs font-semibold text-primary">Jawaban Traveler</p>
                                </div>
                                <p className="text-xs text-foreground/80 leading-relaxed pl-5">{dispute.travelerNote}</p>
                              </div>
                            )}

                            {/* Resolution block */}
                            {dispute.resolution && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-3 rounded-xl bg-emerald-50 ring-1 ring-emerald-100 p-3.5 space-y-1.5"
                              >
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                  <p className="text-xs font-semibold text-emerald-700">Resolusi: {dispute.resolution}</p>
                                </div>
                                {dispute.decision && (
                                  <p className="text-[11px] text-emerald-600 pl-5">
                                    Keputusan: <span className="font-semibold">{decisionCfg[dispute.decision].label}</span>
                                  </p>
                                )}
                                {dispute.adminNote && (
                                  <p className="text-[11px] text-zinc-500 pl-5">Catatan: {dispute.adminNote}</p>
                                )}
                                {dispute.resolvedAt && (
                                  <p className="text-[10px] text-zinc-400 pl-5">Diselesaikan pada {dispute.resolvedAt}</p>
                                )}
                              </motion.div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-row md:flex-col items-center gap-2 shrink-0">
                            <button
                              onClick={() => setViewDispute(dispute)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-muted hover:bg-muted/80 border border-border px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Lihat
                            </button>
                            {dispute.status === "resolved" && (
                              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 px-3.5 py-2 text-xs font-semibold">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Selesai
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyState
            icon={AlertTriangle}
            title="Tidak ada dispute"
            description="Semua masalah sudah ditangani"
          />
        )}

        {/* ── RESOLVE DIALOG ── */}
        <Dialog open={!!viewDispute} onOpenChange={() => setViewDispute(null)}>
          <DialogContent className="max-w-md p-0 gap-0 rounded-2xl overflow-hidden">
            {viewDispute && (() => {
              const sCfg = statusCfg[viewDispute.status];
              const pCfg = priorityCfg[viewDispute.priority];
              return (
                <div className="overflow-y-auto max-h-[80vh]">
                  {/* Header */}
                  <div className="px-5 pt-5 pb-4 border-b border-border/60 bg-muted/20">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-muted-foreground">{viewDispute.id} · {viewDispute.orderId}</span>
                    </div>
                    <h2 className="text-base font-bold text-foreground mb-3">{viewDispute.issue}</h2>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sCfg.chip}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sCfg.dot}`} />{sCfg.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pCfg.chip}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${pCfg.dot}`} />{pCfg.label}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 py-4 space-y-3">
                    {/* Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Customer</p>
                        <p className="text-sm font-semibold text-foreground">{viewDispute.customer}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Traveler</p>
                        <p className="text-sm font-semibold text-foreground">{viewDispute.traveler}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Tanggal</p>
                        <p className="text-sm font-semibold text-foreground">{viewDispute.date}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Order</p>
                        <p className="text-sm font-semibold text-foreground">{viewDispute.orderId}</p>
                      </div>
                    </div>

                    {/* Deskripsi */}
                    <div className="rounded-xl bg-muted/40 border border-border/50 px-4 py-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Deskripsi Masalah</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">{viewDispute.description}</p>
                    </div>

                    {/* Jawaban traveler */}
                    {viewDispute.travelerNote && (
                      <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Plane className="h-3.5 w-3.5 text-primary shrink-0" />
                          <p className="text-xs font-semibold text-primary">Jawaban Traveler</p>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed pl-5">{viewDispute.travelerNote}</p>
                      </div>
                    )}

                    {/* Resolusi jika sudah selesai */}
                    {viewDispute.status === "resolved" && (
                      <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-100 px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                          <p className="text-sm font-semibold text-emerald-700">Dispute Diselesaikan oleh Traveler</p>
                        </div>
                        {viewDispute.resolvedAt && (
                          <p className="text-[11px] text-emerald-600 pl-6">{viewDispute.resolvedAt}</p>
                        )}
                      </div>
                    )}

                    <button onClick={() => setViewDispute(null)}
                      className="w-full h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/40 transition">
                      Tutup
                    </button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}