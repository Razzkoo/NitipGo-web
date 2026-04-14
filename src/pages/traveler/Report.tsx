import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Star, CheckCircle, Clock, Eye,
  User, Calendar, Banknote, ShieldCheck, AlertCircle,
  ThumbsUp, ThumbsDown, Minus, MessageSquare, Flag,
  ShieldAlert, TrendingUp, CalendarDays, ArrowRight,
  RotateCcw,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CountUp } from "@/components/ui/CountUp";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type DisputeStatus = "open" | "in_review" | "resolved";
type DisputePriority = "high" | "medium" | "low";

interface Dispute {
  id: string | number;
  code: string;
  orderId: string;
  customer: string;
  issue: string;
  description: string;
  status: DisputeStatus;
  priority: DisputePriority;
  date: string;
  amount: string;
  route: string;
  orderName: string;
  note?: string;
  travelerNote?: string;
  resolvedAt?: string;
}

interface Review {
  id: string;
  customer: string;
  orderId: string;
  rating: number;
  review: string;
  date: string;
  category: string;
  route: string;
  flagged?: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockReviews: Review[] = [
  {
    id: "R-001", customer: "Dicky Rahman", orderId: "TRX-11",
    rating: 5, review: "Mantap wokkk, travelernya responsif dan barang sampai dengan cepat dan aman!",
    date: "09 Apr 2026", category: "Titip Beli", route: "Solo → Yogyakarta",
  },
  {
    id: "R-002", customer: "Rina Kusuma", orderId: "TRX-09",
    rating: 4, review: "Pelayanan bagus, komunikasi lancar. Barang sampai sesuai estimasi.",
    date: "05 Apr 2026", category: "Pengiriman", route: "Solo → Yogyakarta",
  },
  {
    id: "R-003", customer: "Budi Santoso", orderId: "TRX-06",
    rating: 3, review: "Oke sih tapi agak telat dari estimasi. Komunikasinya perlu ditingkatkan.",
    date: "28 Mar 2026", category: "Titip Beli", route: "Yogyakarta → Solo",
  },
  {
    id: "R-004", customer: "Maya Putri", orderId: "TRX-04",
    rating: 2, review: "Kecewa, barang sampai lebih lama dan kondisi packaging kurang bagus.",
    date: "20 Mar 2026", category: "Pengiriman", route: "Solo → Yogyakarta",
    flagged: true,
  },
];

// ─── Configs ──────────────────────────────────────────────────────────────────

const disputeStatusCfg: Record<DisputeStatus, { label: string; icon: React.ElementType; chip: string; dot: string; bar: string }> = {
  open:      { label: "Baru",     icon: AlertCircle, chip: "bg-red-50 text-red-700 ring-1 ring-red-200",       dot: "bg-red-400",     bar: "bg-red-400" },
  in_review: { label: "Ditinjau", icon: Clock,       chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", dot: "bg-amber-400",   bar: "bg-amber-400" },
  resolved:  { label: "Selesai",  icon: CheckCircle, chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-400", bar: "bg-emerald-400" },
};

const priorityCfg: Record<DisputePriority, { label: string; chip: string; dot: string }> = {
  high:   { label: "Prioritas Tinggi", chip: "bg-red-50 text-red-600 ring-1 ring-red-100",       dot: "bg-red-400" },
  medium: { label: "Prioritas Sedang", chip: "bg-amber-50 text-amber-600 ring-1 ring-amber-100", dot: "bg-amber-400" },
  low:    { label: "Prioritas Rendah", chip: "bg-zinc-50 text-zinc-500 ring-1 ring-zinc-200",    dot: "bg-zinc-300" },
};

function getRatingConfig(rating: number) {
  if (rating >= 4) return {
    label: "Positif", icon: ThumbsUp,
    color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    bar: "bg-emerald-400", accent: "bg-emerald-400",
  };
  if (rating === 3) return {
    label: "Netral", icon: Minus,
    color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    bar: "bg-amber-400", accent: "bg-amber-400",
  };
  return {
    label: "Negatif", icon: ThumbsDown,
    color: "text-red-500", bg: "bg-red-50", border: "border-red-200",
    badge: "bg-red-50 text-red-600 border border-red-200",
    bar: "bg-red-400", accent: "bg-red-400",
  };
}

// ─── Shared Components ────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconBg, iconColor, accent }: {
  label: string; value: number | string;
  icon: React.ElementType; iconBg: string; iconColor: string; accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-card border border-border/60 p-5 shadow-sm"
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} mb-3`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-foreground leading-none mb-1">
        {typeof value === "number"
          ? <CountUp key={value} end={value} duration={900} />
          : value}
      </p>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
    </motion.div>
  );
}

function StarsStatic({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-2.5 w-2.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-current text-border"}`} />
      ))}
    </div>
  );
}

function StarsAnimated({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "h-5 w-5" : size === "md" ? "h-[15px] w-[15px]" : "h-3 w-3";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div key={i} initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + i * 0.055, duration: 0.22 }}>
          <Star className={`${sz} ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-current text-border"}`} />
        </motion.div>
      ))}
    </div>
  );
}

const listContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const listItem = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

// ─── Dispute Tab ──────────────────────────────────────────────────────────────

function DisputeTab() {
  const [disputes, setDisputes]     = useState<Dispute[]>([]);
  const [stats, setStats]           = useState({ open: 0, review: 0, resolved: 0 });
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<"all" | DisputeStatus>("all");
  const [selected, setSelected]     = useState<Dispute | null>(null);
  const [replyText, setReplyText]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const { toast } = useToast();

  // Fetch disputes
  const fetchDisputes = () => {
    setLoading(true);
    api.get("/traveler/disputes")
      .then(res => {
        setDisputes(res.data.data?.data ?? []);
        setStats(res.data.stats ?? {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDisputes(); }, []);

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/traveler/disputes/${selected.id}/reply`, { note: replyText });
      toast({ title: "Jawaban berhasil dikirim!" });
      setReplyText("");
      setSelected(null);
      fetchDisputes();
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal mengirim jawaban", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!selected || !replyText.trim()) return;
    setResolving(true);
    try {
        await api.post(`/traveler/disputes/${selected.id}/resolve`, { note: replyText });
        toast({ title: "Laporan berhasil diselesaikan!" });
        setReplyText("");
        setSelected(null);
        fetchDisputes();
    } catch (err: any) {
        toast({ title: err?.response?.data?.message ?? "Gagal", variant: "destructive" });
    } finally {
        setResolving(false);
    }
    };

  const filtered = disputes.filter(d => filter === "all" || d.status === filter);
  const filterTabCount = (s: DisputeStatus) => disputes.filter(d => d.status === s).length;

  return (
    <div className="space-y-5">
      {/* Stats — sama tapi pakai stats.open, stats.review, stats.resolved */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Laporan Baru"    value={stats.open}     icon={AlertCircle} iconBg="bg-red-50"     iconColor="text-red-500"     accent="bg-red-400" />
        <StatCard label="Sedang Ditinjau" value={stats.review}   icon={Clock}       iconBg="bg-amber-50"   iconColor="text-amber-500"   accent="bg-amber-400" />
        <StatCard label="Diselesaikan"    value={stats.resolved} icon={CheckCircle} iconBg="bg-emerald-50" iconColor="text-emerald-500" accent="bg-emerald-400" />
      </div>

      {/* Info banner */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Dispute di bawah adalah laporan dari customer. Kamu bisa memberikan jawaban/klarifikasi sebelum admin memutuskan.
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "open", "in_review", "resolved"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`h-8 rounded-full px-3.5 text-xs font-semibold transition-all border whitespace-nowrap ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:bg-muted/40"
            }`}>
            {f === "all" ? "Semua" : f === "open" ? "Baru" : f === "in_review" ? "Ditinjau" : "Selesai"}
            {f !== "all" && disputes.filter(d => d.status === f).length > 0 && (
              <span className="ml-1.5">({disputes.filter(d => d.status === f).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* List — tambah tombol Jawab */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="Tidak ada laporan" description="Belum ada laporan sesuai filter ini" />
      ) : (
        <motion.div className="space-y-3" variants={listContainer} initial="hidden" animate="show">
          {filtered.map(dispute => {
            const sCfg = disputeStatusCfg[dispute.status];
            const pCfg = priorityCfg[dispute.priority];
            return (
              <motion.div key={dispute.id} variants={listItem}
                className="rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="flex">
                  <div className={`w-1 shrink-0 ${sCfg.bar}`} />
                  <div className="flex-1 p-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Meta, issue, desc — sama */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-muted-foreground">{dispute.code} · {dispute.orderId}</span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sCfg.chip}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${sCfg.dot}`} />{sCfg.label}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pCfg.chip}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${pCfg.dot}`} />{pCfg.label}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-foreground mb-1">{dispute.issue}</h3>
                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{dispute.description}</p>

                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <User className="h-3 w-3" />{dispute.customer}
                          </span>
                          <span className="text-border">·</span>
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />{dispute.date}
                          </span>
                          {dispute.route !== '-' && (
                            <>
                              <span className="text-border">·</span>
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <ArrowRight className="h-3 w-3" />{dispute.route}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Jawaban traveler jika sudah ada */}
                        {dispute.travelerNote && (
                          <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 mb-2">
                            <p className="text-[10px] text-primary font-semibold uppercase tracking-wide mb-1">Jawaban Kamu</p>
                            <p className="text-xs text-foreground/80 leading-relaxed">{dispute.travelerNote}</p>
                          </div>
                        )}

                        {/* Resolusi admin */}
                        {dispute.note && dispute.status === 'resolved' && (
                          <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-100 px-4 py-3">
                            <div className="flex items-center gap-2 mb-1">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <p className="text-xs font-semibold text-emerald-700">Keputusan Admin</p>
                            </div>
                            <p className="text-xs text-emerald-600 pl-5">{dispute.note}</p>
                            {dispute.resolvedAt && (
                              <p className="text-[10px] text-emerald-500 pl-5 mt-1">{dispute.resolvedAt}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row md:flex-col items-center gap-2 shrink-0">
                        <button onClick={() => { setSelected(dispute); setReplyText(dispute.travelerNote ?? ""); }}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                            dispute.status === "open"
                                ? "bg-primary/10 hover:bg-primary/15 border-primary/20 text-primary"
                                : "bg-muted hover:bg-muted/80 border-border text-muted-foreground hover:text-foreground"
                            }`}>
                            {dispute.status === "open" ? (
                            <><MessageSquare className="h-3.5 w-3.5" />Jawab</>
                            ) : (
                            <><Eye className="h-3.5 w-3.5" />Detail</>
                            )}
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

      {/* Detail + Reply Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setReplyText(""); } }}>
        <DialogContent className="max-w-md p-0 gap-0 rounded-2xl overflow-hidden">
          {selected && (() => {
            const sCfg = disputeStatusCfg[selected.status];
            const pCfg = priorityCfg[selected.priority];
            return (
              <div className="overflow-y-auto max-h-[85vh]">
                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-border/60 bg-muted/20">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-muted-foreground">{selected.code} · {selected.orderId}</span>
                  </div>
                  <h2 className="text-base font-bold text-foreground mb-3">{selected.issue}</h2>
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sCfg.chip}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sCfg.dot}`} />{sCfg.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pCfg.chip}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${pCfg.dot}`} />{pCfg.label}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-4 space-y-4">
                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Customer</p>
                      <p className="text-sm font-semibold text-foreground">{selected.customer}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Tanggal</p>
                      <p className="text-sm font-semibold text-foreground">{selected.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Order</p>
                      <p className="text-sm font-semibold text-foreground">{selected.orderId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Rute</p>
                      <p className="text-sm font-semibold text-foreground">{selected.route}</p>
                    </div>
                  </div>

                  {/* Deskripsi masalah */}
                  <div className="rounded-xl bg-muted/40 border border-border/50 px-4 py-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Deskripsi Masalah dari Customer</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{selected.description}</p>
                  </div>

                  {/* Jawaban traveler sebelumnya */}
                  {selected.travelerNote && (
                    <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                      <p className="text-[10px] text-primary font-semibold uppercase tracking-wide mb-1">Jawaban Kamu Sebelumnya</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">{selected.travelerNote}</p>
                    </div>
                  )}

                  {/* Keputusan admin */}
                  {selected.note && selected.status === 'resolved' && (
                    <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-100 px-4 py-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                        <p className="text-sm font-semibold text-emerald-700">Keputusan Admin</p>
                      </div>
                      <p className="text-sm text-emerald-600 pl-6">{selected.note}</p>
                      {selected.resolvedAt && (
                        <p className="text-[11px] text-emerald-500 pl-6">{selected.resolvedAt}</p>
                      )}
                    </div>
                  )}

                  {/* Form jawab — hanya jika belum resolved */}
                  {selected.status !== "resolved" && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        {selected.travelerNote ? "Perbarui Jawaban" : "Berikan Jawaban / Klarifikasi"}
                      </p>
                      <textarea
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                        rows={4}
                        placeholder="Jelaskan situasi dari sisimu, berikan klarifikasi kepada admin..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => { setSelected(null); setReplyText(""); }}
                          className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/40 transition">
                          Batal
                        </button>
                        <button
                          onClick={handleReply}
                          disabled={!replyText.trim() || submitting}
                          className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition">
                          {submitting ? "Mengirim..." : "Kirim Jawaban"}
                        </button>
                      </div>
                    </div>
                  )}

                  {selected.status === "resolved" && (
                    <button onClick={() => setSelected(null)}
                      className="w-full h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/40 transition">
                      Tutup
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Rating Tab ───────────────────────────────────────────────────────────────

function RatingTab() {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [stats, setStats]       = useState({ total: 0, positive: 0, neutral: 0, negative: 0, avg: "0.0" });
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"all" | "positive" | "neutral" | "negative">("all");
  const [selected, setSelected] = useState<Review | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get("/traveler/ratings")
      .then(res => {
        setReviews(res.data.data?.data ?? []);
        const s = res.data.stats;
        if (s) {
          setStats({
            total:    Number(s.total),
            positive: Number(s.positive),
            neutral:  Number(s.neutral),
            negative: Number(s.negative),
            avg:      Number(s.avg).toFixed(1),
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = reviews.filter(r => {
    if (filter === "positive") return r.rating >= 4;
    if (filter === "neutral")  return r.rating === 3;
    if (filter === "negative") return r.rating < 3;
    return true;
  });

  const ratingDist = [5, 4, 3, 2, 1].map(n => ({
    n,
    count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length > 0
      ? (reviews.filter(r => r.rating === n).length / reviews.length) * 100
      : 0,
  }));

  return (
    <div className="space-y-5">

      {/* Stats panel */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/50">

          {/* Avg */}
          <div className="relative overflow-hidden p-8 flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/80">
            <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
            <div className="relative text-center">
              <p className="text-[10px] font-semibold text-primary-foreground/60 uppercase tracking-widest mb-4">Rating Kamu</p>
              <div className="flex flex-col items-center gap-3 mb-3">
                <span className="text-6xl font-black text-primary-foreground">{stats.avg}</span>
                <StarsAnimated rating={Math.round(Number(stats.avg))} size="lg" />
                <p className="text-[12px] text-primary-foreground/50">dari 5 bintang</p>
              </div>
              <p className="text-sm text-primary-foreground/50">{stats.total} ulasan diterima</p>
            </div>
          </div>

          {/* Mini stats */}
          <div className="p-5 grid grid-cols-2 gap-3">
            {([
              { label: "Total",    value: stats.total, icon: MessageSquare, iconBg: "bg-primary/10",  iconColor: "text-primary",     valColor: "text-foreground",  accent: "bg-primary"    },
              { label: "Positif",  value: stats.positive,           icon: ThumbsUp,      iconBg: "bg-emerald-50",  iconColor: "text-emerald-600", valColor: "text-emerald-600", accent: "bg-emerald-400" },
              { label: "Netral",   value: stats.neutral,            icon: Minus,         iconBg: "bg-amber-50",    iconColor: "text-amber-600",   valColor: "text-amber-600",   accent: "bg-amber-400"   },
              { label: "Negatif",  value: stats.negative,           icon: ThumbsDown,    iconBg: "bg-red-50",      iconColor: "text-red-500",     valColor: "text-red-500",     accent: "bg-red-400"     },
            ] as const).map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                className="relative overflow-hidden rounded-xl bg-muted/30 border border-border/50 p-3">
                <div className={`absolute top-0 left-0 right-0 h-[2px] ${s.accent} origin-left`} />
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.iconBg} mb-2`}>
                  <s.icon className={`h-3.5 w-3.5 ${s.iconColor}`} />
                </div>
                <p className={`text-xl font-bold leading-none ${s.valColor}`}>
                  <CountUp key={s.value} end={s.value} duration={900} />
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Distribution */}
          <div className="p-5 flex flex-col justify-center gap-2.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Distribusi Bintang</p>
            {ratingDist.map(({ n, count, pct }, i) => {
              const cfg = getRatingConfig(n);
              return (
                <div key={n} className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 w-9 shrink-0">
                    <span className="text-xs font-bold text-foreground">{n}</span>
                    <Star className={`h-2.5 w-2.5 fill-yellow-400 text-yellow-400`} />
                  </div>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, delay: 0.4 + i * 0.08 }}
                      className={`h-full rounded-full ${cfg.bar}`} />
                  </div>
                  <span className="text-[11px] text-muted-foreground w-5 text-right tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "all",      label: `Semua (${stats.total})` },
          { key: "positive", label: `Positif (${stats.positive})` },
          { key: "neutral",  label: `Netral (${stats.neutral})` },
          { key: "negative", label: `Negatif (${stats.negative})` },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`h-8 rounded-full px-3.5 text-xs font-semibold transition-all border whitespace-nowrap ${
              filter === key
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:bg-muted/40"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Review list */}
      {filtered.length === 0 ? (
        <EmptyState icon={Star} title="Tidak ada ulasan" description="Belum ada ulasan sesuai filter ini" />
      ) : (
        <motion.div className="space-y-2.5" variants={listContainer} initial="hidden" animate="show">
          {filtered.map(r => {
            const cfg = getRatingConfig(r.rating);
            const RIcon = cfg.icon;
            return (
              <motion.div key={r.id} variants={listItem}
                className={`relative rounded-2xl bg-card border transition-all hover:shadow-sm overflow-hidden ${
                  r.flagged ? "border-red-200" : "border-border/60 hover:border-primary/20"
                }`}>
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${cfg.accent}`} />
                <div className="flex items-start gap-3 pl-5 pr-4 py-4">

                  {/* Rating badge */}
                  <div className={`hidden sm:flex flex-col items-center gap-1.5 shrink-0 rounded-xl border ${cfg.border} ${cfg.bg} px-3 py-2.5 min-w-[58px]`}>
                    <span className={`text-2xl font-black leading-none ${cfg.color}`}>{r.rating}.0</span>
                    <StarsStatic rating={r.rating} />
                    <span className={`text-[9px] font-semibold uppercase tracking-wide ${cfg.color} opacity-70`}>{cfg.label}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Mobile rating pill */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`sm:hidden inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          <Star className="h-2.5 w-2.5 fill-current" />{r.rating}.0
                        </span>
                        <div className="h-7 w-7 shrink-0 rounded-full bg-muted border border-border flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">{r.customer}</span>
                        {r.flagged && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 px-2 py-0.5 text-[11px] font-semibold border border-red-200">
                            <ShieldAlert className="h-3 w-3" />
                            <span className="hidden sm:inline">Ditandai</span>
                          </span>
                        )}
                      </div>
                      <button onClick={() => setSelected(r)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground mb-1.5">
                      <span className="font-mono">{r.orderId}</span>
                      <span className="mx-1.5 text-border">·</span>
                      {r.date}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-2">{r.review}</p>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground font-medium border border-border/40">
                        {r.route}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground font-medium border border-border/40">
                        {r.category}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Review detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="p-0 gap-0 max-w-md rounded-2xl overflow-hidden">
          {selected && (() => {
            const cfg = getRatingConfig(selected.rating);
            const RIcon = cfg.icon;
            return (
              <div className="overflow-y-auto max-h-[80vh]">
                <div className={`relative overflow-hidden px-5 pt-5 pb-5 border-b border-border/60 ${cfg.bg}`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.accent}`} />
                  <div className="pl-2">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wide mb-2">
                      {selected.id} · {selected.orderId}
                    </p>
                    <h2 className="text-base font-bold text-foreground mb-3">Detail Ulasan</h2>
                    <div className="flex items-center gap-4">
                      <div className={`flex flex-col items-center justify-center rounded-xl border-2 ${cfg.border} bg-card px-4 py-3`}>
                        <span className={`text-4xl font-black leading-none ${cfg.color}`}>{selected.rating}.0</span>
                        <span className="text-[10px] text-muted-foreground mt-1">/ 5.0</span>
                      </div>
                      <div>
                        <StarsAnimated rating={selected.rating} size="md" />
                        <span className={`inline-flex items-center gap-1 mt-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.badge}`}>
                          <RIcon className="h-3 w-3" />{cfg.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Customer",  value: selected.customer,  icon: User },
                      { label: "Tanggal",   value: selected.date,      icon: CalendarDays },
                      { label: "Kategori",  value: selected.category,  icon: TrendingUp },
                      { label: "Rute",      value: selected.route,     icon: ArrowRight },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
                          <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">{item.label}</p>
                          <p className="text-sm font-semibold text-foreground">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Isi Ulasan</p>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">"{selected.review}"</p>
                  </div>

                  <button onClick={() => setSelected(null)}
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
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TravelerReports() {
  const [tab, setTab] = useState<"dispute" | "rating">("dispute");

  return (
    <DashboardLayout role="traveler">
      <div className="p-4 sm:p-6 md:p-8 space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-primary/10 p-2 shrink-0">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Laporan & Ulasan
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Pantau dispute dan rating dari customer
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit">
          <button onClick={() => setTab("dispute")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "dispute"
                ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            <AlertTriangle className="h-4 w-4" />
            Dispute
          </button>
          <button onClick={() => setTab("rating")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "rating"
                ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            <Star className="h-4 w-4" />
            Rating
          </button>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {tab === "dispute" ? <DisputeTab /> : <RatingTab />}
          </motion.div>
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}