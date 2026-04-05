import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Wallet, Lock, CheckCircle, TrendingUp, Percent,
  ChevronDown, CheckCircle2, Clock, XCircle,
  Banknote, Package, AlertCircle, User,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";

// ─── Data ──────────────────────────────────────────────────────────────────────

const saldoSummary = {
  total:     12500000,
  available:  8500000,
  hold:       4000000,
};

const platformCommission = { total: 750000, percent: 10 };

type HoldStatus = "menunggu_konfirmasi" | "dalam_perjalanan" | "selesai";

interface HoldItem {
  id: string;
  orderId: string;
  customer: string;
  traveler: string;
  route: string;
  amount: number;
  status: HoldStatus;
  since: string;
}

const holdItems: HoldItem[] = [
  { id: "H-001", orderId: "ORD-1041", customer: "Budi Santoso",  traveler: "Andi Pratama",   route: "Jakarta → Batam",      amount: 750000, status: "dalam_perjalanan",    since: "12 Apr 2024" },
  { id: "H-002", orderId: "ORD-1038", customer: "Maya Putri",    traveler: "Sari Dewi",      route: "Bandung → Surabaya",   amount: 620000, status: "menunggu_konfirmasi", since: "13 Apr 2024" },
  { id: "H-003", orderId: "ORD-1035", customer: "Rina Kusuma",   traveler: "Dimas Wijaya",   route: "Jakarta → Denpasar",   amount: 980000, status: "dalam_perjalanan",    since: "14 Apr 2024" },
  { id: "H-004", orderId: "ORD-1031", customer: "Ahmad Fauzi",   traveler: "Rizky Mahendra", route: "Yogyakarta → Jakarta", amount: 450000, status: "menunggu_konfirmasi", since: "15 Apr 2024" },
  { id: "H-005", orderId: "ORD-1028", customer: "Dewi Lestari",  traveler: "Budi Santoso",   route: "Surabaya → Bali",      amount: 320000, status: "selesai",     since: "16 Apr 2024" },
  { id: "H-006", orderId: "ORD-1025", customer: "Lina Permata",  traveler: "Andi Pratama",   route: "Jakarta → Batam",      amount: 880000, status: "dalam_perjalanan",    since: "17 Apr 2024" },
];

type WStatus = "success" | "pending" | "rejected";

const allWithdrawals: { name: string; amount: number; status: WStatus; date: string }[] = [
  { name: "Rina Setiawan",   amount: 500000, status: "success",  date: "10 Apr 2024" },
  { name: "Budi Pratama",    amount: 800000, status: "pending",  date: "12 Apr 2024" },
  { name: "Dewi Anggraini",  amount: 350000, status: "rejected", date: "15 Apr 2024" },
  { name: "Andi Firmansyah", amount: 620000, status: "success",  date: "18 Apr 2024" },
  { name: "Sari Wulandari",  amount: 430000, status: "pending",  date: "20 Apr 2024" },
  { name: "Yoga Pratama",    amount: 280000, status: "rejected", date: "22 Apr 2024" },
  { name: "Maya Kusuma",     amount: 950000, status: "success",  date: "25 Apr 2024" },
];

const INITIAL_ROWS = 3;
const LOAD_MORE    = 3;

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

const holdStatusCfg: Record<HoldStatus, { label: string; icon: React.ElementType; chip: string; dot: string }> = {
  menunggu_konfirmasi: { label: "Menunggu",        icon: Clock,       dot: "bg-amber-400",   chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60" },
  dalam_perjalanan:   { label: "Dalam Perjalanan", icon: Package,     dot: "bg-sky-400",     chip: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/60" },
  selesai:    { label: "Selesai",  icon: CheckCircle2, dot: "bg-primary/50",  chip: "bg-primary/10 text-primary ring-1 ring-primary/20" },
};

const wStatusCfg: Record<WStatus, { label: string; icon: React.ElementType; chip: string; dot: string }> = {
  success:  { label: "Sukses",   icon: CheckCircle2, dot: "bg-success",     chip: "bg-success/10 text-success ring-1 ring-success/20" },
  pending:  { label: "Menunggu", icon: Clock,        dot: "bg-warning",     chip: "bg-warning/10 text-warning-foreground ring-1 ring-warning/20" },
  rejected: { label: "Ditolak",  icon: XCircle,      dot: "bg-destructive", chip: "bg-destructive/10 text-destructive ring-1 ring-destructive/20" },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const cardItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// ─── Avatar (plain, no color) ─────────────────────────────────────────────────

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  return (
    <div className={`${dim} shrink-0 rounded-full bg-muted border border-border flex items-center justify-center`}>
      <User className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}

// ─── Status Chip ──────────────────────────────────────────────────────────────

function StatusChip({ cfg }: { cfg: { label: string; icon: React.ElementType; chip: string; dot: string } }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${cfg.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} shrink-0`} />
      {cfg.label}
    </span>
  );
}

// ─── Edit Pencil Icon ─────────────────────────────────────────────────────────

function PencilIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z" />
    </svg>
  );
}

// ─── Saldo Summary Card ───────────────────────────────────────────────────────

function SaldoCard({ title, sub, value, icon: Icon, variant }: {
  title: string; sub: string; value: number;
  icon: React.ElementType;
  variant: "primary" | "success" | "warning";
}) {
  const ratio = value / saldoSummary.total;

  const cfg = {
    primary: {
      border:      "border-border",
      iconBg:      "bg-primary/10",
      iconColor:   "text-primary",
      valueColor:  "text-foreground",
      labelColor:  "text-muted-foreground",
      subColor:    "text-primary/50",
      bar:         "bg-primary",
      barBg:       "bg-primary/10",
      topLine:     "bg-primary",
    },
    success: {
      border:      "border-success/20",
      iconBg:      "bg-success/10",
      iconColor:   "text-success",
      valueColor:  "text-success",
      labelColor:  "text-muted-foreground",
      subColor:    "text-success/50",
      bar:         "bg-success",
      barBg:       "bg-success/10",
      topLine:     "bg-success",
    },
    warning: {
      border:      "border-warning/25",
      iconBg:      "bg-warning/10",
      iconColor:   "text-warning-foreground",
      valueColor:  "text-warning-foreground",
      labelColor:  "text-muted-foreground",
      subColor:    "text-warning/60",
      bar:         "bg-warning",
      barBg:       "bg-warning/10",
      topLine:     "bg-warning",
    },
  }[variant];

  return (
    <motion.div
      variants={cardItem}
      whileHover={{ y: -2, transition: { duration: 0.18, ease: "easeOut" } }}
      className={`relative overflow-hidden rounded-2xl bg-card border ${cfg.border} p-5 shadow-card hover:shadow-card-hover transition-shadow cursor-default`}
    >
      {/* Top accent hairline */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
        className={`absolute top-0 left-0 right-0 h-[2px] ${cfg.topLine} origin-left opacity-70`}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cfg.iconBg}`}>
          <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
        </div>
        <span className={`text-[10px] uppercase tracking-widest font-semibold ${cfg.subColor}`}>{sub}</span>
      </div>

      {/* Value */}
      <motion.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className={`text-xl sm:text-2xl font-bold leading-none tracking-tight ${cfg.valueColor} mb-1`}
      >
        {fmt(value)}
      </motion.p>
      <p className={`text-[11px] ${cfg.labelColor} mb-4`}>{title}</p>

      {/* Progress bar */}
      <div className={`h-1 w-full rounded-full ${cfg.barBg} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.34, 1.06, 0.64, 1] }}
          className={`h-full rounded-full ${cfg.bar}`}
        />
      </div>
      <p className={`text-[10px] mt-1.5 text-right font-medium ${cfg.subColor}`}>
        {(ratio * 100).toFixed(0)}% dari total
      </p>
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, iconBg, iconColor, title, sub, right }: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  title: string; sub: string; right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/60">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} shrink-0`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
        </div>
      </div>
      {right}
    </div>
  );
}

// ─── Expand Footer ────────────────────────────────────────────────────────────

function ExpandFooter({ hasMore, remaining, onMore, onCollapse }: {
  hasMore: boolean; remaining: number;
  onMore: () => void; onCollapse: () => void;
}) {
  return (
    <div className="px-5 sm:px-6 py-3.5 border-t border-border/50 bg-muted/30">
      {hasMore ? (
        <button
          onClick={onMore}
          className="flex w-full items-center justify-center gap-2 py-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors group"
        >
          <ChevronDown className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
          Tampilkan {remaining} data lagi
        </button>
      ) : (
        <button
          onClick={onCollapse}
          className="flex w-full items-center justify-center gap-2 py-1 text-xs font-medium text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          Sembunyikan
        </button>
      )}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function WalletAdmin() {
  const [holdLimit, setHoldLimit] = useState(INITIAL_ROWS);
  const [wLimit,    setWLimit]    = useState(INITIAL_ROWS);
  const navigate = useNavigate();

  const holdHasMore = holdLimit < holdItems.length;
  const wHasMore    = wLimit    < allWithdrawals.length;
  const totalHold   = holdItems.reduce((s, h) => s + h.amount, 0);

  return (
    <DashboardLayout role="admin">
      <div className="p-4 sm:p-6 md:p-8 space-y-6">

        {/* ── HEADER ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-xl bg-primary/10 p-2 shrink-0">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Saldo & Keuangan Platform
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Monitoring saldo sistem, komisi, dan pergerakan dana
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── 3 SALDO CARDS ───────────────────────────────── */}
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <SaldoCard title="Total Saldo Platform" sub="Akumulasi Sistem"  value={saldoSummary.total}     icon={Wallet}       variant="primary" />
          <SaldoCard title="Saldo Tersedia"        sub="Siap Dicairkan"    value={saldoSummary.available} icon={CheckCircle}  variant="success" />
          <SaldoCard title="Saldo Ditahan"         sub="Pending Transaksi" value={saldoSummary.hold}      icon={Lock}         variant="warning" />
        </motion.div>

        {/* ── HOLD DETAIL + KOMISI ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── DATA SALDO DITAHAN ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
            className="lg:col-span-2 rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden"
          >
            <SectionHeader
              icon={Lock} iconBg="bg-warning/10" iconColor="text-warning-foreground"
              title="Data Saldo Ditahan"
              sub="Dana transaksi aktif yang masih dalam penahanan sistem"
              right={
                <div className="hidden sm:flex flex-col items-end shrink-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total ditahan</p>
                  <p className="text-base font-bold text-warning-foreground leading-tight">{fmt(totalHold)}</p>
                </div>
              }
            />

            {/* Status strip */}
            <div className="grid grid-cols-3 border-b border-border/50 bg-muted/20">
              {([
                { label: "Menunggu",         status: "menunggu_konfirmasi" as HoldStatus, color: "text-amber-600", bar: "bg-amber-400" },
                { label: "Dalam Perjalanan", status: "dalam_perjalanan"    as HoldStatus, color: "text-sky-600",   bar: "bg-sky-400" },
                { label: "Selesai",  status: "selesai"     as HoldStatus, color: "text-primary",   bar: "bg-primary" },
              ]).map((s, i) => {
                const count = holdItems.filter(h => h.status === s.status).length;
                const pct   = (count / holdItems.length) * 100;
                return (
                  <div key={i} className={`px-4 sm:px-5 py-4 ${i < 2 ? "border-r border-border/40" : ""}`}>
                    <p className={`text-2xl font-bold leading-none ${s.color} mb-1`}>{count}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mb-3">{s.label}</p>
                    <div className="h-0.5 w-full rounded-full bg-border/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                        className={`h-full ${s.bar} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    {[
                      { label: "Order",              align: "text-left"   },
                      { label: "Customer → Traveler", align: "text-center" },
                      { label: "Rute",               align: "text-center" },
                      { label: "Dana Ditahan",       align: "text-center" },
                      { label: "Status",             align: "text-center" },
                      { label: "Sejak",              align: "text-center" },
                    ].map((h, i) => (
                      <th key={i} className={`px-4 sm:px-5 py-3 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold ${h.align}`}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {holdItems.slice(0, holdLimit).map((h, idx) => {
                      const cfg = holdStatusCfg[h.status];
                      return (
                        <motion.tr
                          key={h.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 6 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          className="border-b border-border/30 hover:bg-muted/30 transition-colors group"
                        >
                          <td className="px-4 sm:px-5 py-3.5">
                            <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{h.orderId}</p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{h.id}</p>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <p className="text-xs text-foreground font-medium">{h.customer}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                              <span className="text-border">→</span> {h.traveler}
                            </p>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="inline-flex items-center rounded-lg bg-muted/60 ring-1 ring-border/50 px-2.5 py-1 text-[11px] text-muted-foreground whitespace-nowrap font-medium">
                              {h.route}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="text-sm font-bold text-amber-600">{fmt(h.amount)}</span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <StatusChip cfg={cfg} />
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="text-[11px] text-muted-foreground font-medium">{h.since}</span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-border/30">
              <AnimatePresence initial={false}>
                {holdItems.slice(0, holdLimit).map(h => {
                  const cfg = holdStatusCfg[h.status];
                  return (
                    <motion.div
                      key={h.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 py-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div>
                            <p className="text-xs font-semibold text-foreground">{h.orderId}
                              <span className="text-muted-foreground font-mono font-normal ml-1.5 text-[10px]">· {h.id}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{h.since}</p>
                          </div>
                          <StatusChip cfg={cfg} />
                        </div>
                        <p className="text-xs text-foreground/80 mb-3">
                          <span className="font-medium">{h.customer}</span>
                          <span className="text-border mx-1.5">→</span>
                          <span className="text-muted-foreground">{h.traveler}</span>
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center rounded-lg bg-muted/60 ring-1 ring-border/50 px-2.5 py-1 text-[10px] text-muted-foreground font-medium">
                            {h.route}
                          </span>
                          <span className="text-sm font-bold text-amber-600">{fmt(h.amount)}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <ExpandFooter
              hasMore={holdHasMore}
              remaining={holdItems.length - holdLimit}
              onMore={() => setHoldLimit(p => Math.min(p + LOAD_MORE, holdItems.length))}
              onCollapse={() => setHoldLimit(INITIAL_ROWS)}
            />
          </motion.div>

          {/* ── KOMISI PLATFORM ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
            className="rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden flex flex-col"
          >
            <SectionHeader
              icon={TrendingUp} iconBg="bg-primary/10" iconColor="text-primary"
              title="Komisi Platform"
              sub="Pendapatan dari setiap transaksi"
            />

            <div className="px-5 py-5 space-y-3 flex-1">

              {/* Main commission card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-5 text-primary-foreground"
              >
                {/* Shimmer line */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "220%" }}
                  transition={{ duration: 2.4, delay: 0.9, ease: "easeInOut" }}
                  className="absolute top-0 left-0 h-px w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
                {/* Soft glow blob */}
                <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -left-3 -bottom-3 h-14 w-14 rounded-full bg-white/5 blur-xl" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[10px] text-primary-foreground/50 uppercase tracking-widest font-medium">
                      Total Komisi Bulan Ini
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.07 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => navigate("/admin/settings")}
                      className="flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1.5 transition-colors"
                      title="Edit komisi di pengaturan"
                    >
                      <PencilIcon className="h-3 w-3 text-primary-foreground/70" />
                      <span className="text-[10px] text-primary-foreground/60 font-medium">Edit</span>
                    </motion.button>
                  </div>

                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="text-2xl font-bold leading-none mb-1 text-primary-foreground"
                  >
                    {fmt(platformCommission.total)}
                  </motion.p>
                  <p className="text-[11px] text-primary-foreground/40">diakumulasi dari seluruh transaksi</p>
                </div>
              </motion.div>

              {/* Percentage row */}
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.45 }}
                className="flex items-center justify-between rounded-xl bg-muted/50 ring-1 ring-border/50 px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-card ring-1 ring-border/60 shadow-sm">
                    <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground/70 font-medium">Persentase Komisi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                    {platformCommission.percent}%
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => navigate("/admin/settings")}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    title="Ubah persentase komisi"
                  >
                    <PencilIcon />
                  </motion.button>
                </div>
              </motion.div>

              {/* Estimasi block */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.55 }}
                className="rounded-xl bg-muted/30 ring-1 ring-border/40 p-4 space-y-3"
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Estimasi Bulanan</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Avg. komisi / transaksi</span>
                    <span className="text-xs font-semibold text-foreground">{fmt(Math.round(platformCommission.total / 5))}</span>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Transaksi dihitung</span>
                    <span className="text-xs font-semibold text-foreground">5 trx</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* ── PENARIKAN TRAVELER ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden"
        >
          <SectionHeader
            icon={Banknote} iconBg="bg-primary/10" iconColor="text-primary"
            title="Penarikan Traveler"
            sub="Riwayat permintaan penarikan saldo"
            right={
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                {(["success", "pending", "rejected"] as WStatus[]).map(s => {
                  const c = wStatusCfg[s];
                  const n = allWithdrawals.filter(w => w.status === s).length;
                  return (
                    <span key={s} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${c.chip}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                      {n} {c.label}
                    </span>
                  );
                })}
              </div>
            }
          />

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {[
                    { label: "Traveler", align: "text-left"   },
                    { label: "Jumlah",   align: "text-center" },
                    { label: "Status",   align: "text-center" },
                    { label: "Tanggal", align: "text-center"  },
                  ].map((h, i) => (
                    <th key={i} className={`px-5 py-3 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold ${h.align}`}>
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {allWithdrawals.slice(0, wLimit).map((w, i) => {
                    const cfg = wStatusCfg[w.status];
                    return (
                      <motion.tr
                        key={w.name + i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 6 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        className="border-b border-border/30 hover:bg-muted/30 transition-colors group"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={w.name} />
                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{w.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm font-bold text-foreground">{fmt(w.amount)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusChip cfg={cfg} />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-[11px] text-muted-foreground font-medium">{w.date}</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="sm:hidden divide-y divide-border/30">
            <AnimatePresence initial={false}>
              {allWithdrawals.slice(0, wLimit).map((w, i) => {
                const cfg = wStatusCfg[w.status];
                return (
                  <motion.div
                    key={w.name + i}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3 px-4 py-4 hover:bg-muted/30 transition-colors">
                      <Avatar name={w.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{w.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{w.date}</p>
                      </div>
                      <div className="text-right shrink-0 space-y-1.5">
                        <p className="text-sm font-bold text-foreground">{fmt(w.amount)}</p>
                        <StatusChip cfg={cfg} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <ExpandFooter
            hasMore={wHasMore}
            remaining={allWithdrawals.length - wLimit}
            onMore={() => setWLimit(p => Math.min(p + LOAD_MORE, allWithdrawals.length))}
            onCollapse={() => setWLimit(INITIAL_ROWS)}
          />
        </motion.div>

      </div>
    </DashboardLayout>
  );
}