import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowDownLeft, ArrowUpRight,
  Wallet, TrendingUp, TrendingDown, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface Transaction {
  id: string;
  type: "income" | "withdraw";
  title: string;
  amount: number;
  fee?: number;
  net?: number;
  status: "success" | "processing" | "failed";
  withdraw_status?: string;
  method?: string;
  account_number?: string;
  note?: string;
  date: string;
  date_formatted: string;
}

const fmt = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

const filterTabs = [
  { key: "all",      label: "Semua" },
  { key: "income",   label: "Pendapatan" },
  { key: "withdraw", label: "Penarikan" },
] as const;

export default function RiwayatSaldo() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialFilter = (location.state as any)?.filter || "all";
  const [filter, setFilter] = useState<"all" | "income" | "withdraw">(initialFilter);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState({ balance: 0, totalIncome: 0, totalWithdraw: 0 });

  useEffect(() => {
    api.get("/traveler/wallet").then(res => {
      setWalletData(res.data.data ?? { balance: 0, totalIncome: 0, totalWithdraw: 0 });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get(`/traveler/wallet/history?filter=${filter}`)
      .then(res => setTransactions(res.data.data ?? []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <DashboardLayout role="traveler">
      <div className="max-w-2xl mx-auto px-4 sm:px-0 py-2 space-y-5">

        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali
        </motion.button>

        {/* Header Card */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-white border border-zinc-100 shadow-sm p-5">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold text-zinc-800 leading-tight">Riwayat Saldo</h1>
                <p className="text-xs text-zinc-400 mt-0.5">Pantau pendapatan & penarikan kamu</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Saldo Tersedia</p>
              <p className="text-lg font-bold text-primary leading-tight">{fmt(walletData.balance)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 px-3.5 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 shrink-0">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-500 font-medium">Total Masuk</p>
                <p className="text-sm font-bold text-emerald-700 leading-tight">{fmt(walletData.totalIncome)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-amber-50/80 border border-amber-100 px-3.5 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 shrink-0">
                <TrendingDown className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-amber-500 font-medium">Total Keluar</p>
                <p className="text-sm font-bold text-amber-700 leading-tight">{fmt(walletData.totalWithdraw)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-1.5 bg-zinc-100/70 rounded-xl p-1 w-fit">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                filter === tab.key
                  ? "bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-200/60"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Transaction List */}
        <div className="space-y-2.5">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-zinc-100 animate-pulse" />)}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {transactions.length > 0 ? transactions.map((tx, i) => {
                const isIncome = tx.type === "income";

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, delay: i * 0.04 }}
                    className="group relative overflow-hidden rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className={cn("absolute top-0 left-0 bottom-0 w-0.5", isIncome ? "bg-emerald-400" : "bg-amber-400")} />

                    <div className="flex items-center justify-between gap-3 px-5 py-4 pl-6">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
                          isIncome ? "bg-emerald-50" : "bg-amber-50")}>
                          {isIncome
                            ? <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                            : <ArrowUpRight className="h-4 w-4 text-amber-500" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-700 truncate">{tx.title}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{tx.date_formatted}</p>
                          {tx.method && (
                            <p className="text-[11px] text-zinc-400">
                              {isIncome ? `via ${tx.method}` : `Ke ${tx.method?.toUpperCase()}${tx.account_number ? ` • ${tx.account_number}` : ""}`}
                            </p>
                          )}
                          <span className={cn(
                            "inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            tx.status === "success" ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" :
                            tx.status === "failed" ? "bg-red-50 text-red-600 ring-1 ring-red-100" :
                            "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
                          )}>
                            {tx.status === "success" ? <><CheckCircle2 className="h-2.5 w-2.5" /> Berhasil</> :
                             tx.status === "failed" ? <><XCircle className="h-2.5 w-2.5" /> Ditolak</> :
                             <><Clock className="h-2.5 w-2.5" /> Diproses</>}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={cn("text-base font-bold leading-tight",
                          isIncome ? "text-emerald-600" : "text-amber-600")}>
                          {isIncome ? "+" : "−"} {fmt(tx.amount)}
                        </p>
                        {tx.type === "withdraw" && tx.fee !== undefined && tx.fee > 0 && (
                          <p className="text-[10px] text-zinc-400 mt-0.5">Fee: {fmt(tx.fee)}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-2xl bg-zinc-50 border border-zinc-100 py-14 flex flex-col items-center gap-2">
                  <Wallet className="h-8 w-8 text-zinc-300" />
                  <p className="text-sm font-medium text-zinc-400">Tidak ada transaksi</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}