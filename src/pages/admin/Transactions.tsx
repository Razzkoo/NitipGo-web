import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Package, Eye, ArrowRight, Banknote, X,
  TrendingUp, CheckCircle, Clock, XCircle, Loader2,
  MapPin, User, CalendarDays, Activity,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CountUp } from "@/components/ui/CountUp";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

// ─── Types ─────────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";
type MoneyStatus = "HOLD" | "SPLIT" | "WITHDRAWN";

interface Transaction {
  id: string;
  orderId: string;
  customer: string;
  traveler: string;
  route: string;
  amount: string;
  commission: string;
  orderStatus: OrderStatus;
  moneyStatus: MoneyStatus;
  date: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const mockTransactions: Transaction[] = [
  { id: "TRX-001", orderId: "ORD-001", customer: "Budi Santoso", traveler: "Andi Pratama", route: "Jakarta → Bandung", amount: "Rp 45.000", commission: "Rp 4.500", orderStatus: "completed", moneyStatus: "SPLIT", date: "15 Feb 2024" },
  { id: "TRX-002", orderId: "ORD-002", customer: "Rina Kusuma", traveler: "Sari Dewi", route: "Yogyakarta → Jakarta", amount: "Rp 50.000", commission: "Rp 5.000", orderStatus: "completed", moneyStatus: "WITHDRAWN", date: "14 Feb 2024" },
  { id: "TRX-003", orderId: "ORD-003", customer: "Maya Putri", traveler: "Dimas Wijaya", route: "Surabaya → Malang", amount: "Rp 30.000", commission: "Rp 3.000", orderStatus: "in_progress", moneyStatus: "SPLIT", date: "15 Feb 2024" },
  { id: "TRX-004", orderId: "ORD-004", customer: "Ahmad Fauzi", traveler: "Andi Pratama", route: "Jakarta → Semarang", amount: "Rp 75.000", commission: "Rp 7.500", orderStatus: "pending", moneyStatus: "HOLD", date: "15 Feb 2024" },
  { id: "TRX-005", orderId: "ORD-005", customer: "Dewi Lestari", traveler: "Budi Santoso", route: "Bandung → Jakarta", amount: "Rp 35.000", commission: "Rp 3.500", orderStatus: "cancelled", moneyStatus: "HOLD", date: "13 Feb 2024" },
];

// ─── Animations ────────────────────────────────────────────────────────────────

const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const staggerItem = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

// ─── Config maps ───────────────────────────────────────────────────────────────

const orderStatusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; chip: string }> = {
  pending:     { label: "Pending",    icon: Clock,      chip: "bg-amber-50 text-amber-700 border border-amber-100" },
  in_progress: { label: "Diproses",   icon: Loader2,    chip: "bg-blue-50 text-blue-700 border border-blue-100" },
  completed:   { label: "Selesai",    icon: CheckCircle,chip: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
  cancelled:   { label: "Dibatalkan", icon: XCircle,    chip: "bg-red-50 text-red-700 border border-red-100" },
};

const moneyStatusConfig: Record<MoneyStatus, { label: string; chip: string; dot: string }> = {
  HOLD:      { label: "Hold",      chip: "bg-amber-50 text-amber-700",   dot: "bg-amber-400" },
  SPLIT:     { label: "Split",     chip: "bg-blue-50 text-blue-700",     dot: "bg-blue-400" },
  WITHDRAWN: { label: "Withdrawn", chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

// ─── Filter Chip ───────────────────────────────────────────────────────────────

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 rounded-full px-3.5 text-xs font-semibold transition-all duration-150 border whitespace-nowrap ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      {label}
    </button>
  );
}

// ─── InfoRow for dialog ────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value, valueClass = "" }: { icon: React.ElementType; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-zinc-500" />
      </div>
      <div>
        <p className="text-xs text-zinc-400">{label}</p>
        <p className={`text-sm font-semibold text-zinc-900 ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function AdminTransactions() {
  const [search, setSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<OrderStatus | "all">("all");
  const [moneyFilter, setMoneyFilter] = useState<MoneyStatus | "all">("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filteredTx = mockTransactions.filter((tx) => {
    const q = search.toLowerCase();
    const matchSearch = tx.id.toLowerCase().includes(q) || tx.customer.toLowerCase().includes(q) || tx.traveler.toLowerCase().includes(q);
    const matchOrder = orderFilter === "all" || tx.orderStatus === orderFilter;
    const matchMoney = moneyFilter === "all" || tx.moneyStatus === moneyFilter;
    return matchSearch && matchOrder && matchMoney;
  });

  const completedTxs = mockTransactions.filter((t) => t.orderStatus === "completed");
  const totalVolume = completedTxs.reduce((s, t) => s + parseInt(t.amount.replace(/\D/g, "")), 0);
  const totalCommission = completedTxs.reduce((s, t) => s + parseInt(t.commission.replace(/\D/g, "")), 0);

  const countStatus = (s: OrderStatus) => mockTransactions.filter((t) => t.orderStatus === s).length;
  const countMoney = (m: MoneyStatus) => mockTransactions.filter((t) => t.moneyStatus === m).length;
  const activeFilters = (orderFilter !== "all" ? 1 : 0) + (moneyFilter !== "all" ? 1 : 0);

  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 lg:p-10 space-y-6">

        {/* ── HEADER (unchanged) ── */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-primary/10 p-2">
              <Banknote className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Transaksi</h1>
              <p className="text-sm text-muted-foreground">
                Monitoring transaksi pelanggan dan traveler secara real-time
              </p>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-4 grid-cols-2 md:grid-cols-4"
        >
          {[
            { label: "Total Transaksi", value: mockTransactions.length, suffix: "", prefix: "", icon: Package, color: "bg-primary/10", iconColor: "text-primary", isCurrency: false },
            { label: "Volume Selesai", value: totalVolume, suffix: "", prefix: "Rp ", icon: Banknote, color: "bg-emerald-50", iconColor: "text-emerald-600", isCurrency: true },
            { label: "Komisi Platform", value: totalCommission, suffix: "", prefix: "Rp ", icon: TrendingUp, color: "bg-emerald-50", iconColor: "text-emerald-600", isCurrency: true },
            { label: "Transaksi Selesai", value: countStatus("completed"), suffix: ` / ${mockTransactions.length}`, prefix: "", icon: CheckCircle, color: "bg-emerald-50", iconColor: "text-emerald-600", isCurrency: false },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="relative overflow-hidden rounded-2xl bg-white border border-zinc-100 p-5 shadow-sm"
            >
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-primary/5" />
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className={`h-4.5 w-4.5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-xl font-bold text-zinc-900 leading-none mb-1">
                {stat.isCurrency ? (
                  <>{stat.prefix}<CountUp end={stat.value / 1000} decimals={0} duration={1200} />K</>
                ) : (
                  <>{stat.prefix}<CountUp end={stat.value} duration={1000} />{stat.suffix}</>
                )}
              </p>
              <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── FILTER SECTION ── */}
        <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Cari ID transaksi, nama customer, atau traveler..."
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

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Order status filters */}
            <div className="space-y-1.5 flex-1">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                <Activity className="h-3 w-3" /> Status Order
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterChip label="Semua" active={orderFilter === "all"} onClick={() => setOrderFilter("all")} />
                <FilterChip label={`Pending (${countStatus("pending")})`} active={orderFilter === "pending"} onClick={() => setOrderFilter("pending")} />
                <FilterChip label={`Diproses (${countStatus("in_progress")})`} active={orderFilter === "in_progress"} onClick={() => setOrderFilter("in_progress")} />
                <FilterChip label={`Selesai (${countStatus("completed")})`} active={orderFilter === "completed"} onClick={() => setOrderFilter("completed")} />
                <FilterChip label={`Dibatalkan (${countStatus("cancelled")})`} active={orderFilter === "cancelled"} onClick={() => setOrderFilter("cancelled")} />
              </div>
            </div>

            <div className="hidden sm:block w-px bg-zinc-100" />

            {/* Money status filters */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                <Banknote className="h-3 w-3" /> Status Pembayaran
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterChip label="Semua" active={moneyFilter === "all"} onClick={() => setMoneyFilter("all")} />
                <FilterChip label={`Hold (${countMoney("HOLD")})`} active={moneyFilter === "HOLD"} onClick={() => setMoneyFilter("HOLD")} />
                <FilterChip label={`Split (${countMoney("SPLIT")})`} active={moneyFilter === "SPLIT"} onClick={() => setMoneyFilter("SPLIT")} />
                <FilterChip label={`Withdrawn (${countMoney("WITHDRAWN")})`} active={moneyFilter === "WITHDRAWN"} onClick={() => setMoneyFilter("WITHDRAWN")} />
              </div>
            </div>
          </div>

          {/* Active filter tags */}
          {activeFilters > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
              <span className="text-xs text-zinc-400">Filter aktif:</span>
              {orderFilter !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {orderStatusConfig[orderFilter].label}
                  <button onClick={() => setOrderFilter("all")}><X className="h-3 w-3" /></button>
                </span>
              )}
              {moneyFilter !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {moneyStatusConfig[moneyFilter].label}
                  <button onClick={() => setMoneyFilter("all")}><X className="h-3 w-3" /></button>
                </span>
              )}
              <button
                onClick={() => { setOrderFilter("all"); setMoneyFilter("all"); setSearch(""); }}
                className="ml-auto text-xs text-zinc-400 hover:text-zinc-700 transition"
              >
                Reset semua
              </button>
            </div>
          )}
        </div>

        {/* ── TABLE ── */}
        <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
            <p className="text-xs font-medium text-zinc-500">
              Menampilkan <span className="font-bold text-zinc-900">{filteredTx.length}</span> dari {mockTransactions.length} transaksi
            </p>
          </div>

          {filteredTx.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-zinc-100">
                    {["ID & Tanggal", "Rute", "Customer", "Traveler", "Amount", "Status Order", "Pembayaran", ""].map((h, i) => (
                      <th key={i} className={`px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide ${i === 0 ? "text-left" : "text-center"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
                  {filteredTx.map((tx) => {
                    const osCfg = orderStatusConfig[tx.orderStatus];
                    const msCfg = moneyStatusConfig[tx.moneyStatus];
                    const OsIcon = osCfg.icon;
                    return (
                      <motion.tr
                        key={tx.id}
                        variants={staggerItem}
                        className="border-b border-zinc-50 hover:bg-zinc-50/80 transition-colors"
                      >
                        {/* ID */}
                        <td className="px-4 py-3.5 text-left">
                          <p className="text-sm font-bold text-zinc-900">{tx.id}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{tx.date}</p>
                        </td>

                        {/* Route */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 border border-zinc-100 px-3 py-1">
                            <span className="text-xs font-medium text-zinc-700">{tx.route}</span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3.5 text-center">
                          <p className="text-sm text-zinc-700 font-medium">{tx.customer}</p>
                        </td>

                        {/* Traveler */}
                        <td className="px-4 py-3.5 text-center">
                          <p className="text-sm text-zinc-700 font-medium">{tx.traveler}</p>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3.5 text-center">
                          <p className="text-sm font-bold text-zinc-900">{tx.amount}</p>
                          <p className="text-xs font-medium text-emerald-600">+{tx.commission}</p>
                        </td>

                        {/* Order Status */}
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${osCfg.chip}`}>
                            <OsIcon className="h-3 w-3" />
                            {osCfg.label}
                          </span>
                        </td>

                        {/* Money Status */}
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${msCfg.chip}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${msCfg.dot}`} />
                            {msCfg.label}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="flex h-8 w-8 mx-auto items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-all"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </motion.tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Package} title="Tidak ada transaksi ditemukan" description="Coba ubah filter pencarian Anda" />
          )}
        </div>

        {/* ── DETAIL DIALOG ── */}
        <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            {selectedTx && (() => {
              const osCfg = orderStatusConfig[selectedTx.orderStatus];
              const msCfg = moneyStatusConfig[selectedTx.moneyStatus];
              const OsIcon = osCfg.icon;
              return (
                <>
                  {/* Dialog header strip */}
                  <div className="bg-gradient-to-br from-zinc-50 to-white px-6 pt-6 pb-5 border-b border-zinc-100">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-zinc-400 mb-1">Transaction ID</p>
                        <h2 className="text-xl font-bold text-zinc-900">{selectedTx.id}</h2>
                        <p className="text-xs text-zinc-400 mt-1">{selectedTx.orderId} · {selectedTx.date}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${osCfg.chip}`}>
                          <OsIcon className="h-3 w-3" />{osCfg.label}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${msCfg.chip}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${msCfg.dot}`} />
                          {msCfg.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-5 space-y-5">

                    {/* Route */}
                    <div className="flex items-center gap-3 rounded-xl bg-zinc-50 border border-zinc-100 px-4 py-3">
                      <div className="text-center flex-1">
                        <p className="text-xs text-zinc-400">Dari</p>
                        <p className="text-sm font-bold text-zinc-900">{selectedTx.route.split(" → ")[0]}</p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-xs text-zinc-400">Ke</p>
                        <p className="text-sm font-bold text-zinc-900">{selectedTx.route.split(" → ")[1]}</p>
                      </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <InfoRow icon={User} label="Customer" value={selectedTx.customer} />
                      <InfoRow icon={MapPin} label="Traveler" value={selectedTx.traveler} />
                      <InfoRow icon={CalendarDays} label="Tanggal" value={selectedTx.date} />
                      <InfoRow icon={Package} label="Order ID" value={selectedTx.orderId} />
                    </div>

                    {/* Payment summary */}
                    <div className="rounded-xl bg-gradient-to-br from-primary/5 to-emerald-50 border border-primary/10 p-4">
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Ringkasan Pembayaran</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-600">Total Transaksi</span>
                        <span className="text-base font-bold text-zinc-900">{selectedTx.amount}</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-primary/10 mb-2">
                        <span className="text-sm text-zinc-600">Komisi Platform (10%)</span>
                        <span className="text-sm font-bold text-emerald-600">{selectedTx.commission}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600">Diterima Traveler</span>
                        <span className="text-sm font-bold text-zinc-900">
                          Rp {(parseInt(selectedTx.amount.replace(/\D/g, "")) - parseInt(selectedTx.commission.replace(/\D/g, ""))).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-5">
                    <Button variant="outline" className="w-full h-10 rounded-xl" onClick={() => setSelectedTx(null)}>
                      Tutup
                    </Button>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}