import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowDownLeft, ArrowUpRight,
  Wallet, TrendingUp, TrendingDown, CheckCircle2, Clock,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type TxType = "income" | "withdraw";

interface Transaction {
  id: string;
  type: TxType;
  title: string;
  date: string;
  amount: number;
  status: "success" | "processing";
  method?: "bank" | "E-Wallet";
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const transactions: Transaction[] = [
  {
    id: "tx-1", type: "income",
    title: "Pendapatan perjalanan Jakarta → Bandung",
    date: "12 Feb 2026 • 14:32",
    amount: 350000, status: "success",
  },
  {
    id: "tx-2", type: "withdraw",
    title: "Penarikan ke E-Wallet",
    date: "10 Feb 2026 • 09:10",
    amount: 500000, status: "success", method: "E-Wallet"
  },
  {
    id: "tx-3", type: "income",
    title: "Pendapatan titip beli",
    date: "8 Feb 2026 • 18:45",
    amount: 200000, status: "success",
  },
  {
    id: "tx-4", type: "withdraw",
    title: "Penarikan ke Rekening Bank",
    date: "5 Feb 2026 • 11:02",
    amount: 750000, status: "processing", method: "bank"
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;

const filterTabs = [
  { key: "all",      label: "Semua" },
  { key: "income",   label: "Pendapatan" },
  { key: "withdraw", label: "Penarikan" },
] as const;

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function RiwayatSaldo() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialFilter = (location.state as any)?.filter || "all";
  const [filter, setFilter] = useState<"all" | "income" | "withdraw">(initialFilter);
  const [txState, setTxState] = useState<Transaction[]>(transactions);
  const [saldoTersedia, setSaldoTersedia] = useState(1250000);

  const filteredTx = filter === "all" ? txState : txState.filter(tx => tx.type === filter);

  const totalIncome   = txState.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalWithdraw = txState.filter(t => t.type === "withdraw").reduce((s, t) => s + t.amount, 0);

  function addWithdrawTransaction(amount: number, method: "bank" | "E-Wallet") {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: "withdraw",
      title: method === "bank" ? "Penarikan ke Rekening Bank" : "Penarikan ke E-Wallet",
      date: new Date().toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }),
      amount, status: "processing", method,
    };
    setTxState(prev => [newTx, ...prev]);
    setSaldoTersedia(prev => prev - amount);
    setTimeout(() => {
      setTxState(prev => prev.map(tx => tx.id === newTx.id ? { ...tx, status: "success" } : tx));
    }, 2000);
  }

  return (
    <DashboardLayout role="traveler">
      <div className="max-w-2xl mx-auto px-4 sm:px-0 py-2 space-y-5">

        {/* ── BACK ── */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali
        </motion.button>

        {/* ── HEADER CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl bg-white border border-zinc-100 shadow-sm p-5"
        >
          {/* Decorative top bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />

          <div className="flex items-start justify-between gap-4">
            {/* Left: title + saldo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold text-zinc-800 leading-tight">Riwayat Saldo</h1>
                <p className="text-xs text-zinc-400 mt-0.5">Pantau pendapatan & penarikan kamu</p>
              </div>
            </div>

            {/* Right: saldo tersedia */}
            <div className="text-right shrink-0">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Saldo Tersedia</p>
              <p className="text-lg font-bold text-primary leading-tight">{fmt(saldoTersedia)}</p>
            </div>
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 px-3.5 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 shrink-0">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-500 font-medium">Total Masuk</p>
                <p className="text-sm font-bold text-emerald-700 leading-tight">{fmt(totalIncome)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-amber-50/80 border border-amber-100 px-3.5 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 shrink-0">
                <TrendingDown className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-amber-500 font-medium">Total Keluar</p>
                <p className="text-sm font-bold text-amber-700 leading-tight">{fmt(totalWithdraw)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── FILTER TABS ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25, ease: "easeOut" }}
          className="flex items-center gap-1.5 bg-zinc-100/70 rounded-xl p-1 w-fit"
        >
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                filter === tab.key
                  ? "bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-200/60"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {tab.label}
              {tab.key !== "all" && (
                <span className={cn(
                  "ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-bold",
                  filter === tab.key ? "bg-zinc-100 text-zinc-500" : "bg-zinc-200 text-zinc-400"
                )}>
                  {txState.filter(t => t.type === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* ── TRANSACTION LIST ── */}
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {filteredTx.length > 0 ? filteredTx.map((tx, i) => {
              const isIncome = tx.type === "income";
              const isSuccess = tx.status === "success";

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.22, delay: i * 0.04, ease: "easeOut" }}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200 transition-all"
                >
                  {/* Left accent bar */}
                  <div className={cn(
                    "absolute top-0 left-0 bottom-0 w-0.5",
                    isIncome ? "bg-emerald-400" : "bg-amber-400"
                  )} />

                  <div className="flex items-center justify-between gap-3 px-5 py-4 pl-6">
                    {/* Icon + Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
                        isIncome ? "bg-emerald-50" : "bg-amber-50"
                      )}>
                        {isIncome
                          ? <ArrowDownLeft className="h-4.5 w-4.5 text-emerald-500" />
                          : <ArrowUpRight className="h-4.5 w-4.5 text-amber-500" />
                        }
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-700 truncate leading-tight">{tx.title}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{tx.date}</p>
                        {tx.method && (
                          <p className="text-[11px] text-zinc-400">
                            Ke {tx.method === "bank" ? "Rekening Bank" : "E-Wallet"}
                          </p>
                        )}
                        {/* Status badge */}
                        <span className={cn(
                          "inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          isSuccess
                            ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                            : "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
                        )}>
                          {isSuccess
                            ? <><CheckCircle2 className="h-2.5 w-2.5" /> Berhasil</>
                            : <><Clock className="h-2.5 w-2.5" /> Diproses</>
                          }
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="shrink-0 text-right">
                      <p className={cn(
                        "text-base font-bold leading-tight",
                        isIncome ? "text-emerald-600" : "text-amber-600"
                      )}>
                        {isIncome ? "+" : "−"}&nbsp;{fmt(tx.amount)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            }) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl bg-zinc-50 border border-zinc-100 py-14 flex flex-col items-center gap-2"
              >
                <Wallet className="h-8 w-8 text-zinc-300" />
                <p className="text-sm font-medium text-zinc-400">Tidak ada transaksi</p>
                <p className="text-xs text-zinc-300">Belum ada data untuk filter ini</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </DashboardLayout>
  );
}