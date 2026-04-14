import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Package, Eye, ArrowRight, Banknote, X,
  TrendingUp, CheckCircle, Clock, XCircle, Loader2,
  MapPin, User, CalendarDays, Activity, CreditCard,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountUp } from "@/components/ui/CountUp";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import api from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

type PaymentStatus = "pending" | "paid" | "failed" | "expired";

interface Transaction {
  id: number;
  orderId: string;
  customer: string;
  traveler: string;
  route: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentChannel: string;
  paymentType: string;
  orderType: string;
  date: string;
  paidAt: string | null;
}

interface Stats {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  total_volume: number;
}

// ─── Config ────────────────────────────────────────────────────────────────────

const paymentStatusConfig: Record<PaymentStatus, { label: string; icon: React.ElementType; chip: string }> = {
  pending:  { label: "Menunggu",   icon: Clock,       chip: "bg-amber-50 text-amber-700 border border-amber-100" },
  paid:     { label: "Berhasil",   icon: CheckCircle, chip: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
  failed:   { label: "Gagal",      icon: XCircle,     chip: "bg-red-50 text-red-700 border border-red-100" },
  expired:  { label: "Kadaluarsa", icon: XCircle,     chip: "bg-zinc-50 text-zinc-500 border border-zinc-100" },
};

const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const staggerItem = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

function formatRupiah(n: number | string) {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (!num || isNaN(num)) return "Rp 0";
  return "Rp " + num.toLocaleString("id-ID");
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 rounded-full px-3.5 text-xs font-semibold transition-all border whitespace-nowrap ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      {label}
    </button>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-zinc-500" />
      </div>
      <div>
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="text-sm font-semibold text-zinc-900">{value}</p>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, paid: 0, pending: 0, failed: 0, total_volume: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchTransactions = (searchQ = "", status = "all") => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (searchQ) params.search = searchQ;
    if (status !== "all") params.status = status;

    api.get("/admin/transactions", { params })
      .then(res => {
        setTransactions(res.data.data?.data ?? []);
        setStats(res.data.stats ?? {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleSearch = () => fetchTransactions(search, statusFilter);
  const handleFilter = (s: PaymentStatus | "all") => {
    setStatusFilter(s);
    fetchTransactions(search, s);
  };

  const filtered = transactions; // sudah difilter di backend

  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 lg:p-10 space-y-6">

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-lg bg-primary/10 p-2">
            <Banknote className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">Transaksi</h1>
            <p className="text-sm text-muted-foreground">Monitoring transaksi pembayaran secara real-time</p>
          </div>
        </div>

        {/* Stat Cards */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { label: "Total Transaksi",  value: stats.total,        icon: Package,      color: "bg-primary/10",  iconColor: "text-primary",     isCurrency: false },
            { label: "Volume Terbayar",  value: stats.total_volume, icon: Banknote,     color: "bg-emerald-50",  iconColor: "text-emerald-600", isCurrency: true  },
            { label: "Berhasil",         value: stats.paid,         icon: CheckCircle,  color: "bg-emerald-50",  iconColor: "text-emerald-600", isCurrency: false },
            { label: "Pending / Gagal",  value: stats.pending + stats.failed, icon: Clock, color: "bg-amber-50", iconColor: "text-amber-600",  isCurrency: false },
          ].map((s, i) => (
            <motion.div key={i} variants={staggerItem} whileHover={{ y: -2 }}
              className="relative overflow-hidden rounded-2xl bg-white border border-zinc-100 p-5 shadow-sm">
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-primary/5" />
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl mb-3 ${s.color}`}>
                <s.icon className={`h-4 w-4 ${s.iconColor}`} />
              </div>
              <p className="text-xl font-bold text-zinc-900 leading-none mb-1">
                {s.isCurrency
                  ? <>{formatRupiah(s.value)}</>
                  : <CountUp key={s.value} end={s.value} duration={1000} />
                }
              </p>
              <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filter */}
        <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Cari ID order, nama customer, atau traveler..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 h-10 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white"
            />
            {search && (
              <button onClick={() => { setSearch(""); fetchTransactions("", statusFilter); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
              <Activity className="h-3 w-3" /> Status Pembayaran
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterChip label={`Semua (${stats.total})`}     active={statusFilter === "all"}     onClick={() => handleFilter("all")} />
              <FilterChip label={`Berhasil (${stats.paid})`}   active={statusFilter === "paid"}    onClick={() => handleFilter("paid")} />
              <FilterChip label={`Pending (${stats.pending})`} active={statusFilter === "pending"} onClick={() => handleFilter("pending")} />
              <FilterChip label={`Gagal (${stats.failed})`}    active={statusFilter === "failed"}  onClick={() => handleFilter("failed")} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
            <p className="text-xs font-medium text-zinc-500">
              Menampilkan <span className="font-bold text-zinc-900">{filtered.length}</span> transaksi
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-zinc-100">
                    {["ID & Tanggal", "Rute", "Customer", "Traveler", "Total", "Status Bayar", "Provider", ""].map((h, i) => (
                      <th key={i} className={`px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide ${i === 0 ? "text-left" : "text-center"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
                  {filtered.map((tx) => {
                    const psCfg = paymentStatusConfig[tx.paymentStatus] ?? paymentStatusConfig.pending;
                    const PsIcon = psCfg.icon;
                    return (
                      <motion.tr key={tx.id} variants={staggerItem}
                        className="border-b border-zinc-50 hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3.5 text-left">
                          <p className="text-sm font-bold text-zinc-900 font-mono">{tx.orderId}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{tx.date}</p>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 border border-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                            {tx.route}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <p className="text-sm text-zinc-700 font-medium">{tx.customer}</p>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <p className="text-sm text-zinc-700 font-medium">{tx.traveler}</p>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <p className="text-sm font-bold text-zinc-900">{formatRupiah(tx.amount)}</p>
                        </td>
                        {/* STATUS PEMBAYARAN */}
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${psCfg.chip}`}>
                            <PsIcon className="h-3 w-3" />
                            {psCfg.label}
                          </span>
                        </td>
                        {/* PROVIDER / CHANNEL */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 uppercase">
                            <CreditCard className="h-3 w-3" />
                            {tx.paymentChannel !== '-' ? tx.paymentChannel : 'Midtrans'}
                          </span>
                        </td>
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
            <EmptyState icon={Package} title="Tidak ada transaksi" description="Coba ubah filter pencarian" />
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            {selectedTx && (() => {
              const psCfg = paymentStatusConfig[selectedTx.paymentStatus] ?? paymentStatusConfig.pending;
              const PsIcon = psCfg.icon;
              return (
                <>
                  <div className="bg-gradient-to-br from-zinc-50 to-white px-6 pt-6 pb-5 border-b border-zinc-100">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-zinc-400 mb-1">Order ID</p>
                        <h2 className="text-lg font-bold text-zinc-900 font-mono">{selectedTx.orderId}</h2>
                        <p className="text-xs text-zinc-400 mt-1">{selectedTx.date}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${psCfg.chip}`}>
                          <PsIcon className="h-3 w-3" />{psCfg.label}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 uppercase">
                          <CreditCard className="h-3 w-3" />
                          {selectedTx.paymentChannel !== '-' ? selectedTx.paymentChannel : 'Midtrans'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-5 space-y-4">
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

                    <div className="grid grid-cols-2 gap-4">
                      <InfoRow icon={User}         label="Customer" value={selectedTx.customer} />
                      <InfoRow icon={MapPin}        label="Traveler" value={selectedTx.traveler} />
                      <InfoRow icon={CalendarDays}  label="Tanggal"  value={selectedTx.date} />
                      <InfoRow icon={CalendarDays}  label="Dibayar"  value={selectedTx.paidAt ?? '-'} />
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-primary/5 to-emerald-50 border border-primary/10 p-4">
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Ringkasan Pembayaran</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600">Total</span>
                        <span className="text-base font-bold text-zinc-900">{formatRupiah(selectedTx.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-zinc-600">Tipe Order</span>
                        <span className="text-sm font-medium text-zinc-700 capitalize">{selectedTx.orderType}</span>
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