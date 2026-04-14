import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, AlertCircle, Crown, Flag,
  User, CalendarDays, MessageSquare, TrendingUp,
  ThumbsUp, ThumbsDown, Minus, Eye, ShieldAlert,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CountUp } from "@/components/ui/CountUp";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type Review = {
  id: string;
  traveler: string;
  travelerRoute: string;
  customer: string;
  rating: number;
  review: string;
  date: string;
  orderId: string;
  category?: string;
  flagged?: boolean;
};


// ─── Animation variants ───────────────────────────────────────────────────────

const listContainer = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const listItem = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRatingConfig(rating: number) {
  if (rating >= 4) return {
    label: "Positif", icon: ThumbsUp,
    color:   "text-emerald-600",
    bg:      "bg-emerald-50",
    border:  "border-emerald-200",
    star:    "text-emerald-500",
    badge:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
    bar:     "bg-emerald-400",
    accent:  "bg-emerald-400",
    ringColor: "ring-emerald-100",
  };
  if (rating === 3) return {
    label: "Netral", icon: Minus,
    color:   "text-amber-600",
    bg:      "bg-amber-50",
    border:  "border-amber-200",
    star:    "text-amber-400",
    badge:   "bg-amber-50 text-amber-700 border border-amber-200",
    bar:     "bg-amber-400",
    accent:  "bg-amber-400",
    ringColor: "ring-amber-100",
  };
  return {
    label: "Negatif", icon: ThumbsDown,
    color:   "text-red-500",
    bg:      "bg-red-50",
    border:  "border-red-200",
    star:    "text-red-400",
    badge:   "bg-red-50 text-red-600 border border-red-200",
    bar:     "bg-red-400",
    accent:  "bg-red-400",
    ringColor: "ring-red-100",
  };
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  // rating 5 = 5 bintang kuning, bukan berdasarkan getRatingConfig
  const sz = size === "lg" ? "h-5 w-5" : size === "md" ? "h-[15px] w-[15px]" : "h-3 w-3";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + i * 0.055, duration: 0.22 }}
        >
          <Star
            className={`${sz} ${
              i < rating
                ? "fill-yellow-400 text-yellow-400" 
                : "fill-current text-border"
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Inline stars (no animation, for static use) ──────────────────────────────

function StarsStatic({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "h-[15px] w-[15px]" : "h-2.5 w-2.5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sz} ${
            i < rating
              ? "fill-yellow-400 text-yellow-400" 
              : "fill-current text-border"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Info Row (dialog) ────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-foreground leading-tight break-words">{value}</p>
      </div>
    </div>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-8 rounded-full px-3.5 text-xs font-semibold transition-all border whitespace-nowrap shrink-0 ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground hover:bg-muted/40"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar() {
  return (
    <div className="h-8 w-8 shrink-0 rounded-full bg-muted border border-border flex items-center justify-center">
      <User className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminReviews() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    total: 0, positive: 0, neutral: 0, negative: 0, avg: "0.0"
  });
  const [filter, setFilter] = useState<"all"|"positive"|"neutral"|"negative">("all");
  const [selected, setSelected] = useState<Review | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get("/admin/ratings")
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

  const handleFlag = (r: Review) => {
    setReviews(prev => prev.map(x => x.id === r.id ? { ...x, flagged: !x.flagged } : x));
    if (selected?.id === r.id) setSelected({ ...r, flagged: !r.flagged });
    toast({ title: r.flagged ? "Tanda Dicabut" : "Review Ditandai" });
  };

  const filtered = reviews.filter(r => {
    if (filter === "positive") return r.rating >= 4;
    if (filter === "neutral")  return r.rating === 3;
    if (filter === "negative") return r.rating < 3;
    return true;
  });


  const ratingDist = [5,4,3,2,1].map(n => ({
    n,
    count: reviews.filter(r => r.rating === n).length,
    pct:   reviews.length > 0
      ? (reviews.filter(r => r.rating === n).length / reviews.length) * 100
      : 0,
  }));

  return (
    <DashboardLayout role="admin">
      <div className="p-4 sm:p-6 md:p-8 space-y-5">

        {/* ── HEADER ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-primary/10 p-2 shrink-0">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Rating & Ulasan Platform
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Pantau feedback traveler untuk tingkatkan kualitas layanan
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── STATISTICS PANEL ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/50">

            {/* ── LEFT: avg score ── */}
            <div className="relative overflow-hidden p-8 flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary to-primary-dark shadow-lg">
              {/* Shimmer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "260%" }}
                transition={{ duration: 2.4, delay: 0.9 }}
                className="absolute top-0 left-0 h-px w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              />
              {/* Decorative circles */}
              <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute right-8 top-6 h-14 w-14 rounded-full bg-white/8 blur-xl" />
              <div className="absolute -left-6 top-1/2 h-20 w-20 rounded-full bg-white/5 blur-2xl" />

              <div className="relative text-center">
                <p className="text-[10px] font-semibold text-primary-foreground/60 uppercase tracking-widest mb-6 letter-spacing-wider">
                  Skor Rata-rata Platform
                </p>
                <div className="flex flex-col items-center justify-center gap-4 mb-4">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: [0.34, 1.2, 0.64, 1] }}
                    className="text-7xl font-black leading-none text-primary-foreground tracking-tight"
                  >
                    {Number(stats.avg).toFixed(1)}
                  </motion.span>
                  <div className="flex flex-col items-center gap-2">
                    <Stars rating={Math.round(Number(stats.avg))} size="lg" />
                    <p className="text-[12px] text-primary-foreground/50 font-medium">dari 5 bintang</p>
                  </div>
                </div>
                <p className="text-sm text-primary-foreground/50 font-semibold">{stats.total} ulasan terkumpul</p>
              </div>
            </div>

            {/* ── MIDDLE: 4 mini stats ── */}
            <div className="p-5 grid grid-cols-2 gap-3">
              {([
                { label: "Total Ulasan", value: stats.total,    icon: MessageSquare, iconBg: "bg-primary/10",  iconColor: "text-primary",     valColor: "text-foreground",   accent: "bg-primary"    },
                { label: "Positif",      value: stats.positive, icon: ThumbsUp,      iconBg: "bg-emerald-50",  iconColor: "text-emerald-600", valColor: "text-emerald-600",  accent: "bg-emerald-400" },
                { label: "Netral",       value: stats.neutral,  icon: Minus,         iconBg: "bg-amber-50",    iconColor: "text-amber-600",   valColor: "text-amber-600",    accent: "bg-amber-400"   },
                { label: "Negatif",      value: stats.negative, icon: ThumbsDown,    iconBg: "bg-red-50",      iconColor: "text-red-500",     valColor: "text-red-500",      accent: "bg-red-400"     },
              ] as const).map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.3 }}
                  className="relative overflow-hidden rounded-xl bg-muted/30 border border-border/50 p-3"
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, delay: 0.4 + i * 0.07 }}
                    className={`absolute top-0 left-0 right-0 h-[2px] ${s.accent} origin-left opacity-70`}
                  />
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.iconBg} mb-2`}>
                    <s.icon className={`h-3.5 w-3.5 ${s.iconColor}`} />
                  </div>
                  <p className={`text-xl font-bold leading-none ${s.valColor}`}>
                    <CountUp key={s.value} end={s.value} duration={900} />
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* ── RIGHT: distribution bars ── */}
            <div className="p-5 flex flex-col justify-center gap-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">
                Distribusi Bintang
              </p>
              {ratingDist.map(({ n, count, pct }, i) => {
                const cfg = getRatingConfig(n);
                return (
                  <div key={n} className="flex items-center gap-2.5">
                    {/* Star label */}
                    <div className="flex items-center gap-1 w-9 shrink-0">
                      <span className="text-xs font-bold text-foreground">{n}</span>
                      <Star className={`h-2.5 w-2.5 fill-current ${cfg.star}`} />
                    </div>
                    {/* Bar */}
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, delay: 0.4 + i * 0.08, ease: [0.34, 1.06, 0.64, 1] }}
                        className={`h-full rounded-full ${cfg.bar}`}
                      />
                    </div>
                    {/* Count */}
                    <span className="text-[11px] text-muted-foreground w-5 text-right shrink-0 tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── FILTER TABS ─────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap pb-0.5">
          <Chip label={`Semua (${stats.total})`}      active={filter==="all"}      onClick={() => setFilter("all")} />
          <Chip label={`Positif (${stats.positive})`} active={filter==="positive"} onClick={() => setFilter("positive")} />
          <Chip label={`Netral (${stats.neutral})`}   active={filter==="neutral"}  onClick={() => setFilter("neutral")} />
          <Chip label={`Negatif (${stats.negative})`} active={filter==="negative"} onClick={() => setFilter("negative")} />
        </div>

        {/* ── REVIEW LIST ─────────────────────────────────── */}
       {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length > 0 ? (
          <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-2.5">
            {filtered.map(r => {
              const cfg = getRatingConfig(r.rating);
              const RIcon = cfg.icon;
              return (
                <motion.div
                  key={r.id}
                  variants={listItem}
                  whileHover={{ y: -1, transition: { duration: 0.16 } }}
                  className={`relative rounded-2xl bg-card border transition-all hover:shadow-card overflow-hidden ${
                    r.flagged ? "border-red-200" : "border-border/60 hover:border-primary/20"
                  }`}
                >
                  {/* Left accent stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${cfg.accent}`} />

                  <div className="flex items-start gap-3 pl-5 pr-4 py-4">

                    {/* ── Rating badge block (desktop) ── */}
                    <div className={`hidden sm:flex flex-col items-center gap-1.5 shrink-0 rounded-xl border ${cfg.border} ${cfg.bg} px-3 py-2.5 min-w-[58px] shadow-sm`}>
                      <span className={`text-2xl font-black leading-none ${cfg.color}`}>{Number(r.rating).toFixed(1)}</span>
                      <StarsStatic rating={r.rating} />
                      <span className={`text-[9px] font-semibold uppercase tracking-wide ${cfg.color} opacity-70`}>
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">

                      {/* Row 1: traveler + actions */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">

                          {/* Mobile: inline rating pill */}
                          <span className={`sm:hidden inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm`}>
                            <Star className="h-2.5 w-2.5 fill-current" />{Number(r.rating).toFixed(1)}
                          </span>

                          <Avatar />
                          <span className="text-sm font-semibold text-foreground truncate max-w-[140px] sm:max-w-none">
                            {r.traveler}
                          </span>

                          {r.flagged && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 px-2 py-0.5 text-[11px] font-semibold border border-red-200">
                              <ShieldAlert className="h-3 w-3" />
                              <span className="hidden sm:inline">Bermasalah</span>
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                            onClick={() => setSelected(r)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                            onClick={() => handleFlag(r)}
                            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                              r.flagged ? "bg-red-100 text-red-500 hover:bg-red-200" : "text-muted-foreground hover:bg-amber-50 hover:text-amber-600"
                            }`}
                          >
                            <Flag className="h-3.5 w-3.5" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Customer */}
                      <p className="text-xs text-muted-foreground mb-1.5">
                        oleh <span className="font-semibold text-foreground/80">{r.customer}</span>
                        <span className="mx-1.5 text-border">·</span>
                        <span className="font-mono">{r.orderId}</span>
                      </p>

                      {/* Review text */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-2">{r.review}</p>

                      {/* Footer meta */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground font-medium border border-border/40">
                          {r.travelerRoute}
                        </span>
                        {r.category && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground font-medium border border-border/40">
                            {r.category}
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground/60 ml-auto">{r.date}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <EmptyState icon={AlertCircle} title="Tidak ada ulasan" description="Belum ada feedback sesuai filter ini" />
        )}

        {/* ── DETAIL DIALOG ───────────────────────────────── */}
        <AnimatePresence>
          {selected && (() => {
            const cfg = getRatingConfig(selected.rating);
            const RIcon = cfg.icon;
            return (
              <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent className="p-0 overflow-hidden gap-0 max-w-md rounded-2xl">

                  <div className="overflow-y-auto max-h-[80vh]">
                    {/* Header */}
                    <div className={`relative overflow-hidden px-5 pt-5 pb-5 border-b border-border/60 ${cfg.bg}`}>
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.accent}`} />
                      <div className="flex items-start justify-between gap-3 pl-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wide mb-2">
                            {selected.id} · {selected.orderId}
                          </p>
                          <h2 className="text-base font-bold text-foreground mb-3">Detail Ulasan</h2>
                          {/* Large star display */}
                          <div className="flex items-center gap-4">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4 }}
                              className={`flex flex-col items-center justify-center rounded-xl border-2 ${cfg.border} bg-card px-4 py-3 shadow-md ${cfg.bg}`}
                            >
                              <span className={`text-4xl font-black leading-none ${cfg.color}`}>{Number(selected.rating).toFixed(1)}</span>
                              <span className="text-[10px] text-muted-foreground mt-1 font-medium">/ 5.0</span>
                            </motion.div>
                            <div>
                              <Stars rating={selected.rating} size="md" />
                              <span className={`inline-flex items-center gap-1 mt-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.badge}`}>
                                <RIcon className="h-3 w-3" />{cfg.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {selected.flagged && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 px-2.5 py-1 text-xs font-semibold border border-red-200 shrink-0">
                            <ShieldAlert className="h-3 w-3" />Bermasalah
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <InfoRow icon={User}         label="Traveler" value={selected.traveler} />
                        <InfoRow icon={User}         label="Customer" value={selected.customer} />
                        <InfoRow icon={CalendarDays} label="Tanggal"  value={selected.date} />
                        <InfoRow icon={TrendingUp} label="Kategori" value={selected.category ?? '-'} />
                      </div>

                      <div className="rounded-xl bg-muted/40 border border-border/50 px-4 py-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Rute Perjalanan</p>
                        <p className="text-sm font-bold text-foreground">{selected.travelerRoute}</p>
                      </div>

                      <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Isi Ulasan</p>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">"{selected.review}"</p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleFlag(selected)}
                        className={`w-full flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all ${
                          selected.flagged
                            ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                      >
                        <Flag className="h-4 w-4" />
                        {selected.flagged ? "Cabut Tanda Bermasalah" : "Tandai sebagai Bermasalah"}
                      </motion.button>
                    </div>

                    {/* Footer */}
                    <div className="px-5 pb-6">
                      <button
                        onClick={() => setSelected(null)}
                        className="w-full h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/40 transition"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })()}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}