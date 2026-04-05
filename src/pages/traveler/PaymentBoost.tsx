import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Rocket,
  ShieldCheck,
  CreditCard,
  Wallet,
  Building2,
  ChevronRight,
  Clock,
  Zap,
  Crown,
  CircleCheck,
  Lock,
  BadgeCheck,
  CheckCircle2,
  Copy,
  RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentMethod = "transfer" | "ewallet" | "card";
type PaymentStep = "select" | "confirm" | "processing" | "success";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const planMeta: Record<number, { label: string; icon: typeof Rocket; sublabel: string }> = {
  3: { label: "Starter", icon: Clock, sublabel: "Coba Dulu" },
  5: { label: "Popular", icon: Zap, sublabel: "Paket Terlaris" },
  7: { label: "Premium", icon: Crown, sublabel: "Dominasi Penuh" },
};

const paymentMethods = [
  {
    id: "transfer" as PaymentMethod,
    label: "Transfer Bank",
    desc: "BCA · BRI · Mandiri · BNI",
    icon: Building2,
  },
  {
    id: "ewallet" as PaymentMethod,
    label: "E-Wallet",
    desc: "GoPay · OVO · DANA · ShopeePay",
    icon: Wallet,
  },
  {
    id: "card" as PaymentMethod,
    label: "Kartu Kredit / Debit",
    desc: "Visa · Mastercard · JCB",
    icon: CreditCard,
  },
];

const bankOptions = ["BCA", "BRI", "Mandiri", "BNI"];
const ewalletOptions = ["GoPay", "OVO", "DANA", "ShopeePay"];

function formatRupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepBar({ step }: { step: PaymentStep }) {
  const steps: PaymentStep[] = ["select", "confirm", "processing", "success"];
  const labels = ["Metode", "Konfirmasi", "Proses", "Selesai"];
  const current = steps.indexOf(step);

  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={
                  active
                    ? { scale: [1, 1.08, 1], transition: { duration: 1.4, repeat: Infinity } }
                    : {}
                }
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all"
                style={
                  done
                    ? { background: "#7db375", color: "white" }
                    : active
                    ? { background: "linear-gradient(135deg,#7db375,#5a9e6f)", color: "white", boxShadow: "0 0 0 4px rgba(125,179,117,0.2)" }
                    : { background: "#f1f5f9", color: "#94a3b8" }
                }
              >
                {done ? <CircleCheck size={14} /> : i + 1}
              </motion.div>
              <p
                className="text-[10px] font-medium whitespace-nowrap"
                style={{ color: active ? "#5a9e6f" : done ? "#7db375" : "#94a3b8" }}
              >
                {labels[i]}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all"
                style={{ background: i < current ? "#7db375" : "#e2e8f0" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Order Summary Card ───────────────────────────────────────────────────────
function OrderSummary({ days, price }: { days: number; price: number }) {
  const meta = planMeta[days] ?? planMeta[5];
  const Icon = meta.icon;
  const isPopular = days === 5;
  const isPremium = days === 7;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: "linear-gradient(135deg, #7db375 0%, #77b18c 60%, #96b8a3 100%)",
      }}
    >
      {/* subtle noise */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />
      <div
        className="absolute -top-10 -right-10 h-32 w-32 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)" }}
      />

      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white/55 text-[10px] font-medium uppercase tracking-widest">Paket Boost</p>
          <p className="text-white font-bold text-base leading-tight">{meta.sublabel}</p>
        </div>
        {isPopular && (
          <span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-yellow-400 text-yellow-900">
            Terlaris
          </span>
        )}
        {isPremium && (
          <span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-white/20 text-white">
            Premium
          </span>
        )}
      </div>

      <div className="relative mt-4 pt-4 flex items-end justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
        <div>
          <p className="text-white/55 text-xs font-normal">Durasi aktif</p>
          <p className="text-white font-semibold text-sm">{days} hari</p>
        </div>
        <div className="text-right">
          <p className="text-white/55 text-xs font-normal">Total pembayaran</p>
          <p className="text-white font-bold text-xl leading-none">{formatRupiah(price)}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Select Method ────────────────────────────────────────────────────
function StepSelect({
  selected,
  setSelected,
  subOption,
  setSubOption,
  onNext,
}: {
  selected: PaymentMethod | null;
  setSelected: (m: PaymentMethod) => void;
  subOption: string;
  setSubOption: (s: string) => void;
  onNext: () => void;
}) {
  const subOptions = selected === "transfer" ? bankOptions : selected === "ewallet" ? ewalletOptions : [];

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
      <h2 className="text-base font-semibold text-slate-800 mb-4">Pilih Metode Pembayaran</h2>

      <div className="space-y-2.5 mb-5">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isActive = selected === method.id;
          return (
            <motion.button
              key={method.id}
              whileTap={{ scale: 0.985 }}
              onClick={() => { setSelected(method.id); setSubOption(""); }}
              className="w-full flex items-center gap-3.5 rounded-2xl p-4 text-left transition-all"
              style={
                isActive
                  ? {
                      background: "rgba(125,179,117,0.10)",
                      border: "2px solid #7db375",
                    }
                  : {
                      background: "#f8fafc",
                      border: "2px solid #e2e8f0",
                    }
              }
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all"
                style={
                  isActive
                    ? { background: "linear-gradient(135deg,#7db375,#5a9e6f)" }
                    : { background: "#e2e8f0" }
                }
              >
                <Icon size={18} style={{ color: isActive ? "white" : "#64748b" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800">{method.label}</p>
                <p className="text-xs text-slate-400 font-normal truncate">{method.desc}</p>
              </div>
              <div
                className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                style={
                  isActive
                    ? { borderColor: "#7db375", background: "#7db375" }
                    : { borderColor: "#cbd5e1", background: "transparent" }
                }
              >
                {isActive && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Sub-options */}
      <AnimatePresence>
        {subOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <p className="text-xs font-medium text-slate-500 mb-2.5">
              {selected === "transfer" ? "Pilih Bank" : "Pilih E-Wallet"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {subOptions.map((opt) => (
                <motion.button
                  key={opt}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSubOption(opt)}
                  className="rounded-xl py-2.5 px-3 text-sm font-medium transition-all text-left"
                  style={
                    subOption === opt
                      ? { background: "rgba(125,179,117,0.12)", color: "#3f8a5a", border: "1.5px solid #7db375" }
                      : { background: "#f1f5f9", color: "#475569", border: "1.5px solid transparent" }
                  }
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        disabled={!selected || (subOptions.length > 0 && !subOption)}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, #f3b10b 0%, #ddaa4c 60%, #e9b67c 100%)",
          color: "#431407",
          boxShadow: "0 6px 20px -4px rgba(217,119,6,0.35)",
        }}
      >
        Lanjut ke Konfirmasi
        <ChevronRight size={16} />
      </motion.button>
    </motion.div>
  );
}

// ─── Step 2: Confirm ──────────────────────────────────────────────────────────
function StepConfirm({
  days,
  price,
  method,
  subOption,
  onBack,
  onPay,
}: {
  days: number;
  price: number;
  method: PaymentMethod;
  subOption: string;
  onBack: () => void;
  onPay: () => void;
}) {
  const methodLabel = paymentMethods.find((m) => m.id === method)?.label ?? "";
  const rows = [
    { label: "Paket", value: `Boost ${planMeta[days]?.sublabel ?? ""} (${days} hari)` },
    { label: "Metode", value: subOption ? `${methodLabel} · ${subOption}` : methodLabel },
    { label: "Subtotal", value: formatRupiah(price) },
    { label: "Biaya layanan", value: "Rp0" },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
      <h2 className="text-base font-semibold text-slate-800 mb-4">Konfirmasi Pesanan</h2>

      <div className="rounded-2xl overflow-hidden border border-slate-100 mb-5">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: i < rows.length - 1 ? "1px solid #f1f5f9" : "none" }}
          >
            <p className="text-sm text-slate-400 font-normal">{r.label}</p>
            <p className="text-sm font-medium text-slate-700">{r.value}</p>
          </div>
        ))}
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ background: "rgba(125,179,117,0.07)", borderTop: "1px solid rgba(125,179,117,0.15)" }}
        >
          <p className="font-semibold text-slate-700">Total</p>
          <p className="font-bold text-lg" style={{ color: "#3f8a5a" }}>{formatRupiah(price)}</p>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center gap-3 mb-5 p-3.5 rounded-xl" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
        <ShieldCheck size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
        <p className="text-xs text-green-700 font-normal">
          Pembayaran diproses dengan aman. Boost aktif instan setelah konfirmasi berhasil.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 rounded-2xl py-4 px-5 font-medium text-sm text-slate-500 hover:text-slate-700 transition-colors"
          style={{ background: "#f1f5f9" }}
        >
          <ArrowLeft size={15} />
          Kembali
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onPay}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm transition-all"
          style={{
            background: "linear-gradient(135deg, #f3b10b 0%, #ddaa4c 60%, #e9b67c 100%)",
            color: "#431407",
            boxShadow: "0 6px 20px -4px rgba(217,119,6,0.35)",
          }}
        >
          <Lock size={14} />
          Bayar Sekarang · {formatRupiah(price)}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Step 3: Processing / Virtual Account ─────────────────────────────────────
function StepProcessing({
  method,
  subOption,
  price,
  onDone,
}: {
  method: PaymentMethod;
  subOption: string;
  price: number;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const vaNumber = "8277 0042 9183 7401";
  const expiry = "03 Mar 2026 · 23:59";

  const handleCopy = () => {
    navigator.clipboard.writeText(vaNumber.replace(/\s/g, ""));
    toast({ title: "Disalin!", description: "Nomor VA berhasil disalin." });
  };

  if (method === "ewallet") {
    // Simulate redirect / QR for e-wallet
    return (
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        className="text-center"
      >
        <h2 className="text-base font-semibold text-slate-800 mb-1">Menunggu Pembayaran</h2>
        <p className="text-xs text-slate-400 font-normal mb-6">Selesaikan pembayaran melalui {subOption}</p>

        {/* QR placeholder */}
        <div
          className="mx-auto mb-5 flex h-44 w-44 items-center justify-center rounded-2xl"
          style={{ background: "#f8fafc", border: "2px dashed #e2e8f0" }}
        >
          <div className="text-center">
            <Wallet size={28} style={{ color: "#94a3b8", margin: "0 auto 8px" }} />
            <p className="text-[10px] text-slate-400">QR Code {subOption}</p>
          </div>
        </div>

        <div className="mb-5 rounded-xl p-3.5 text-sm font-medium" style={{ background: "#fefce8", border: "1px solid #fde68a", color: "#92400e" }}>
          Bayar {formatRupiah(price)} sebelum {expiry}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onDone}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm"
          style={{
            background: "linear-gradient(135deg,#7db375,#5a9e6f)",
            color: "white",
            boxShadow: "0 6px 20px -4px rgba(90,158,111,0.4)",
          }}
        >
          <CheckCircle2 size={16} />
          Sudah Bayar
        </motion.button>
        <p className="mt-3 text-[10px] text-slate-400">Klik setelah pembayaran selesai di aplikasi {subOption}</p>
      </motion.div>
    );
  }

  // Transfer bank — show VA
  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
      <h2 className="text-base font-semibold text-slate-800 mb-1">Transfer Bank · {subOption || "BCA"}</h2>
      <p className="text-xs text-slate-400 font-normal mb-5">Selesaikan transfer ke nomor Virtual Account berikut</p>

      {/* VA card */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 mb-4"
        style={{ background: "linear-gradient(135deg,#7db375,#77b18c)", boxShadow: "0 8px 24px -4px rgba(125,179,117,0.35)" }}
      >
        <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        <p className="text-white/55 text-[10px] font-medium uppercase tracking-widest mb-1">Nomor Virtual Account</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-white font-bold text-xl tracking-widest leading-none">{vaNumber}</p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all hover:bg-white/30"
            style={{ background: "rgba(255,255,255,0.18)", color: "white" }}
          >
            <Copy size={11} />
            Salin
          </button>
        </div>
        <div className="mt-4 pt-3.5 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <div>
            <p className="text-white/50 text-[10px] font-normal">Total Transfer</p>
            <p className="text-white font-bold text-base">{formatRupiah(price)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-[10px] font-normal">Berlaku hingga</p>
            <p className="text-white/85 text-xs font-medium">{expiry}</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="rounded-2xl border border-slate-100 overflow-hidden mb-5">
        <p className="px-4 pt-3.5 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cara Bayar</p>
        {[
          "Buka aplikasi atau ATM " + (subOption || "BCA"),
          "Pilih menu Transfer → Virtual Account",
          "Masukkan nomor VA di atas",
          "Masukkan nominal " + formatRupiah(price) + " dan konfirmasi",
        ].map((step, i) => (
          <div
            key={i}
            className="flex items-start gap-3 px-4 py-3"
            style={{ borderTop: "1px solid #f1f5f9" }}
          >
            <div
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5"
              style={{ background: "rgba(125,179,117,0.12)", color: "#3f8a5a" }}
            >
              {i + 1}
            </div>
            <p className="text-sm text-slate-600 font-normal leading-snug">{step}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          className="flex items-center justify-center gap-1.5 rounded-2xl py-4 px-4 font-medium text-sm text-slate-500 hover:text-slate-700 transition-colors"
          style={{ background: "#f1f5f9" }}
        >
          <RefreshCw size={14} />
          Cek Status
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onDone}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm"
          style={{
            background: "linear-gradient(135deg,#7db375,#5a9e6f)",
            color: "white",
            boxShadow: "0 6px 20px -4px rgba(90,158,111,0.4)",
          }}
        >
          <CheckCircle2 size={15} />
          Sudah Transfer
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Step 4: Success ──────────────────────────────────────────────────────────
function StepSuccess({ days, price }: { days: number; price: number }) {
  const navigate = useNavigate();
  const benefits = [
    "Profil ditampilkan di posisi teratas pencarian",
    "Badge Traveler Terverifikasi aktif",
    "Analitik performa boost tersedia",
    "Highlight profil premium aktif",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 250 }}
      className="text-center"
    >
      {/* Success icon */}
      <div className="flex justify-center mb-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
          className="relative flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg,#7db375,#5a9e6f)", boxShadow: "0 0 0 8px rgba(125,179,117,0.15)" }}
        >
          <CheckCircle2 size={36} className="text-white" />
          {/* ring pulse */}
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ border: "2px solid #7db375" }}
          />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Pembayaran Berhasil</p>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Boost Aktif!</h2>
        <p className="text-sm text-slate-400 font-normal mb-6">
          Profil kamu sudah di-boost selama <span className="font-semibold text-slate-600">{days} hari</span> mulai sekarang.
        </p>
      </motion.div>

      {/* Receipt mini */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden mb-5 text-left"
        style={{ border: "1px solid #e2e8f0" }}
      >
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: "rgba(125,179,117,0.07)", borderBottom: "1px solid rgba(125,179,117,0.15)" }}
        >
          <div className="flex items-center gap-2">
            <BadgeCheck size={15} style={{ color: "#3f8a5a" }} />
            <p className="text-sm font-semibold text-slate-700">Paket {planMeta[days]?.sublabel}</p>
          </div>
          <p className="text-sm font-bold" style={{ color: "#3f8a5a" }}>{formatRupiah(price)}</p>
        </div>
        <div className="px-4 py-3 space-y-2">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-2">
              <CircleCheck size={13} style={{ color: "#7db375", flexShrink: 0 }} />
              <p className="text-xs text-slate-500 font-normal">{b}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-2.5"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/traveler")}
          className="w-full rounded-2xl py-4 font-semibold text-sm"
          style={{
            background: "linear-gradient(135deg,#7db375,#5a9e6f)",
            color: "white",
            boxShadow: "0 6px 20px -4px rgba(90,158,111,0.4)",
          }}
        >
          Lihat Dashboard
        </motion.button>
        <button
          onClick={() => navigate("/traveler/settings")}
          className="w-full rounded-2xl py-3.5 font-medium text-sm text-slate-500 hover:text-slate-700 transition-colors"
          style={{ background: "#f1f5f9" }}
        >
          Kembali ke Pengaturan
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BoostPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { days = 5, price = 25000 } = (location.state as { days: number; price: number }) ?? {};

  const [step, setStep] = useState<PaymentStep>("select");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [subOption, setSubOption] = useState("");

  const handleNext = () => setStep("confirm");
  const handlePay = () => setStep("processing");
  const handleDone = () => setStep("success");

  return (
    <DashboardLayout role="traveler">
      <div className="min-h-screen p-6 md:p-8 lg:p-10">
        {/* Back nav */}
        {step !== "success" && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => {
              if (step === "select") navigate(-1);
              else if (step === "confirm") setStep("select");
              else if (step === "processing") setStep("confirm");
            }}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
            {step === "select" ? "Kembali ke Pengaturan" : "Kembali"}
          </motion.button>
        )}

        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(125,179,117,0.12)" }}>
            <Rocket size={18} style={{ color: "#3f8a5a" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Pembayaran Boost</h1>
            <p className="text-xs text-slate-400 font-normal">Aktifkan boost profil Anda</p>
          </div>
        </motion.div>

        <div className="mx-auto max-w-xl">
          {/* Step indicator */}
          <StepBar step={step} />

          {/* Order summary — always visible except success */}
          {step !== "success" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <OrderSummary days={days} price={price} />
            </motion.div>
          )}

          {/* Step content card */}
          <div
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100"
          >
            <AnimatePresence mode="wait">
              {step === "select" && (
                <StepSelect
                  key="select"
                  selected={method}
                  setSelected={setMethod}
                  subOption={subOption}
                  setSubOption={setSubOption}
                  onNext={handleNext}
                />
              )}
              {step === "confirm" && method && (
                <StepConfirm
                  key="confirm"
                  days={days}
                  price={price}
                  method={method}
                  subOption={subOption}
                  onBack={() => setStep("select")}
                  onPay={handlePay}
                />
              )}
              {step === "processing" && method && (
                <StepProcessing
                  key="processing"
                  method={method}
                  subOption={subOption}
                  price={price}
                  onDone={handleDone}
                />
              )}
              {step === "success" && (
                <StepSuccess key="success" days={days} price={price} />
              )}
            </AnimatePresence>
          </div>

          {/* Bottom trust strip */}
          {step !== "success" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex items-center justify-center gap-4"
            >
              {[
                { icon: Lock, label: "SSL Terenkripsi" },
                { icon: ShieldCheck, label: "Transaksi Aman" },
                { icon: BadgeCheck, label: "Aktif Instan" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon size={12} style={{ color: "#7db375" }} />
                  <p className="text-[10px] font-medium text-slate-400">{label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}