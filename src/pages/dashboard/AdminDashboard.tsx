import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Package, MapPin, Wallet, Settings,
  AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight,
  ClipboardList, ChevronDown, TrendingUp, Zap, Eye,
  UserCheck, ShoppingBag, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CountUp } from "@/components/ui/CountUp";
import { EmptyState } from "@/components/ui/EmptyState";

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const stats = [
  { label: "Total Pendapatan", value: 155500000, change: "+12%", positive: true, icon: Wallet, isCurrency: true, sub: "vs bulan lalu" },
  { label: "Total Customer", value: 8234, change: "+8%", positive: true, icon: Users, isCurrency: false, sub: "pengguna aktif" },
  { label: "Total Traveler", value: 1542, change: "+15%", positive: true, icon: MapPin, isCurrency: false, sub: "terverifikasi" },
  { label: "Order Bulan Ini", value: 2891, change: "-3%", positive: false, icon: Package, isCurrency: false, sub: "total transaksi" },
];

const allActivity = [
  { type: "user", message: "Budi Santoso mendaftar sebagai traveler", time: "5 menit lalu", detail: "Jakarta → Bali" },
  { type: "order", message: "Order ORD-1234 selesai dikonfirmasi", time: "12 menit lalu", detail: "Rp 250.000" },
  { type: "dispute", message: "Dispute baru dari customer Rina", time: "30 menit lalu", detail: "ORD-1199" },
  { type: "user", message: "Maya Putri terverifikasi sebagai traveler", time: "1 jam lalu", detail: "Bandung → Surabaya" },
  { type: "order", message: "Order ORD-1230 berhasil diselesaikan", time: "2 jam lalu", detail: "Rp 180.000" },
  { type: "user", message: "Reza Firmansyah mendaftar sebagai customer", time: "3 jam lalu", detail: "Akun baru" },
  { type: "dispute", message: "Dispute ORD-1198 telah diselesaikan admin", time: "4 jam lalu", detail: "Refund diproses" },
  { type: "order", message: "Order ORD-1228 menunggu konfirmasi traveler", time: "5 jam lalu", detail: "Rp 320.000" },
  { type: "user", message: "Siti Rahma memperbarui profil traveler", time: "6 jam lalu", detail: "Dokumen baru" },
  { type: "order", message: "Order ORD-1225 dalam pengiriman", time: "7 jam lalu", detail: "Rp 95.000" },
];

const pendingOrders = [
  { id: "ORD-1235", customer: "Ahmad Fauzi", item: "iPhone 15 Pro", date: "Hari ini", amount: "Rp 450.000" },
  { id: "ORD-1236", customer: "Dewi Lestari", item: "Laptop ASUS", date: "Hari ini", amount: "Rp 280.000" },
  { id: "ORD-1237", customer: "Riko Pratama", item: "Sepatu Nike", date: "Kemarin", amount: "Rp 120.000" },
];

const quickLinks = [
  { href: "/admin/users", icon: Users, title: "Manajemen User", desc: "Kelola akun", color: "bg-primary/10", iconColor: "text-primary" },
  { href: "/admin/transactions", icon: Package, title: "Transaksi", desc: "Monitor order", color: "bg-success/10", iconColor: "text-success" },
  { href: "/admin/routes", icon: MapPin, title: "Rute Perjalanan", desc: "Kelola rute", color: "bg-accent/10", iconColor: "text-accent" },
  { href: "/admin/disputes", icon: AlertTriangle, title: "Dispute", desc: "Tangani masalah", color: "bg-warning/10", iconColor: "text-warning" },
];

// ─── Animations ────────────────────────────────────────────────────────────────

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const activityConfig = {
  user: {
    icon: UserCheck,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    dot: "bg-emerald-500",
    badgeBg: "bg-emerald-50 text-emerald-700",
    label: "User",
  },
  order: {
    icon: ShoppingBag,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    dot: "bg-blue-500",
    badgeBg: "bg-blue-50 text-blue-700",
    label: "Order",
  },
  dispute: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    dot: "bg-amber-500",
    badgeBg: "bg-amber-50 text-amber-700",
    label: "Dispute",
  },
};

const INITIAL_SHOW = 4;
const LOAD_MORE_STEP = 4;

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activityLimit, setActivityLimit] = useState(INITIAL_SHOW);
  const hasMore = activityLimit < allActivity.length;

  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 lg:p-10 space-y-6">

        {/* ── HEADER (unchanged) ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-lg bg-primary/10 p-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Selamat datang kembali, Admin! Berikut ringkasan aktivitas terbaru dan statistik platform Anda.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Button variant="outline" asChild>
              <Link to="/admin/settings">
                <Settings className="h-5 w-5 mr-2" />
                Pengaturan
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-4 grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className="relative overflow-hidden rounded-2xl bg-white border border-zinc-100 p-5 shadow-sm hover:shadow-md transition-all"
            >
              {/* Decorative gradient blob */}
              <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 ${
                stat.positive ? "bg-emerald-500" : "bg-red-400"
              }`} />

              <div className="flex items-start justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-bold rounded-full px-2 py-0.5 ${
                  stat.positive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}>
                  {stat.positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {stat.change}
                </span>
              </div>

              <p className="text-2xl font-bold text-zinc-900 leading-none mb-1">
                {stat.isCurrency ? (
                  <>Rp <CountUp end={stat.value / 1000000} decimals={1} duration={1500} /> jt</>
                ) : (
                  <CountUp end={stat.value} duration={1500} />
                )}
              </p>
              <p className="text-sm font-medium text-zinc-600">{stat.label}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{stat.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Aktivitas Terbaru */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-2 rounded-2xl bg-white border border-zinc-100 shadow-sm overflow-hidden"
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-zinc-900">Aktivitas Terbaru</h2>
              </div>
              <span className="text-xs text-zinc-400 font-medium">
                {allActivity.length} total aktivitas
              </span>
            </div>

            {/* Activity list */}
            <div className="divide-y divide-zinc-50">
              <AnimatePresence initial={false}>
                {allActivity.slice(0, activityLimit).map((activity, i) => {
                  const cfg = activityConfig[activity.type as keyof typeof activityConfig];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <div className="flex items-center gap-4 px-6 py-3.5 hover:bg-zinc-50/80 transition-colors group">
                        {/* Icon */}
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                          <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-800 leading-snug">{activity.message}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-zinc-400">{activity.time}</span>
                            <span className="text-zinc-200">·</span>
                            <span className="text-xs text-zinc-400">{activity.detail}</span>
                          </div>
                        </div>

                        {/* Badge */}
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.badgeBg}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Load more / collapse */}
            <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50">
              {hasMore ? (
                <button
                  onClick={() => setActivityLimit((prev) => Math.min(prev + LOAD_MORE_STEP, allActivity.length))}
                  className="flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors py-1"
                >
                  <ChevronDown className="h-4 w-4" />
                  Tampilkan lebih banyak ({allActivity.length - activityLimit} lagi)
                </button>
              ) : (
                <button
                  onClick={() => setActivityLimit(INITIAL_SHOW)}
                  className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-600 transition-colors py-1"
                >
                  Sembunyikan
                </button>
              )}
            </div>
          </motion.div>

          {/* Order Pending */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl bg-white border border-zinc-100 shadow-sm overflow-hidden"
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-amber-500" />
                <h2 className="text-base font-bold text-zinc-900">Order Pending</h2>
              </div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">
                {pendingOrders.length}
              </span>
            </div>

            {/* Orders */}
            {pendingOrders.length > 0 ? (
              <div className="divide-y divide-zinc-50">
                {pendingOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                    className="px-5 py-3.5 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900">{order.id}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">{order.item}</p>
                        <p className="text-xs text-zinc-400">{order.customer} · {order.date}</p>
                      </div>
                      <span className="text-sm font-bold text-primary shrink-0">{order.amount}</span>
                    </div>
                    <Button size="sm" className="w-full h-8 text-xs" asChild>
                      <Link to={`/admin/transactions?order=${order.id}&status=pending`}>
                        <Eye className="h-3.5 w-3.5 mr-1.5" />Review
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-6">
                <EmptyState icon={ClipboardList} title="Tidak ada order pending" description="Semua order sudah diproses" variant="compact" />
              </div>
            )}

            <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50">
              <Button variant="ghost" className="w-full h-8 text-xs font-semibold" asChild>
                <Link to="/admin/transactions">Lihat Semua Transaksi →</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* ── QUICK LINKS ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-4"
        >
          {quickLinks.map((link) => (
            <motion.div
              key={link.href}
              variants={staggerItem}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
            >
              <Link
                to={link.href}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200 transition-all"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${link.color} group-hover:scale-105 transition-transform`}>
                  <link.icon className={`h-6 w-6 ${link.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 text-sm">{link.title}</p>
                  <p className="text-xs text-zinc-400">{link.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </DashboardLayout>
  );
}