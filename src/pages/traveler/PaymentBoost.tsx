import { useState, useEffect } from "react";
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
  RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentStep = "select" | "confirm" | "processing" | "success";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const planMeta: Record<number, { label: string; icon: typeof Rocket; sublabel: string }> = {
  3: { label: "Starter", icon: Clock, sublabel: "Coba Dulu" },
  5: { label: "Popular", icon: Zap, sublabel: "Paket Terlaris" },
  7: { label: "Premium", icon: Crown, sublabel: "Dominasi Penuh" },
};

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
// HAPUS seluruh planMeta constant dan ganti komponen OrderSummary:

function OrderSummary({ days, price, label, color }: {
  days: number; price: number; label: string; color: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 60%, ${color}99 100%)`,
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
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)" }}
      />

      <div className="relative flex items-center gap-3">
        {/* Icon Rocket konsisten dengan TravelerSettings */}
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: "rgba(255,255,255,0.2)" }}
        >
          <Rocket size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white/55 text-[10px] font-medium uppercase tracking-widest">Paket Boost</p>
          <p className="text-white font-bold text-base leading-tight">{label}</p>
        </div>
      </div>

      <div
        className="relative mt-4 pt-4 flex items-end justify-between"
        style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
      >
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
function StepSelect({ onNext }: { onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
      <h2 className="text-base font-semibold text-slate-800 mb-4">Metode Pembayaran</h2>

      <div className="rounded-2xl p-4 mb-5" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
        <div className="flex items-start gap-3">
          <ShieldCheck size={16} style={{ color: "#16a34a", flexShrink: 0, marginTop: 1 }} />
          <p className="text-xs text-green-700 font-normal">
            Pembayaran diproses melalui <strong>Midtrans</strong> — pilih metode (Transfer Bank, E-Wallet, atau Kartu Kredit) setelah klik Bayar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: "Transfer Bank", icon: Building2, desc: "BCA · BRI · BNI · Mandiri" },
          { label: "E-Wallet", icon: Wallet, desc: "GoPay · OVO · DANA" },
          { label: "Kartu Kredit", icon: CreditCard, desc: "Visa · Mastercard" },
        ].map(({ label, icon: Icon, desc }) => (
          <div
            key={label}
            className="rounded-xl p-3 text-center"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
          >
            <Icon size={18} className="mx-auto mb-1.5" style={{ color: "#64748b" }} />
            <p className="text-[10px] font-semibold text-slate-600">{label}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{desc}</p>
          </div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm transition-all"
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
  onBack,
  onPay,
  buying,
  label,
}: {
  days: number;
  price: number;
  onBack: () => void;
  onPay: () => void;
  buying: boolean;
  label: string;
}) {
  const rows = [
    { label: "Paket", value: `${label} (${days} hari)` },
    { label: "Metode", value: "Dipilih via Midtrans" },
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

      <div className="flex items-center gap-3 mb-5 p-3.5 rounded-xl" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
        <ShieldCheck size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
        <p className="text-xs text-green-700 font-normal">
          Pembayaran diproses aman via Midtrans. Boost aktif instan setelah pembayaran berhasil.
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
          disabled={buying}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #f3b10b 0%, #ddaa4c 60%, #e9b67c 100%)",
            color: "#431407",
            boxShadow: "0 6px 20px -4px rgba(217,119,6,0.35)",
          }}
        >
          {buying ? (
            <><RefreshCw size={14} className="animate-spin" /> Membuka Midtrans...</>
          ) : (
            <><Lock size={14} /> Bayar via Midtrans · {formatRupiah(price)}</>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Step 3: Processing (pending payment) ────────────────────────────────────
function StepProcessing({
  snapToken,
  onDone,
  syncing,
}: {
  snapToken: string | null;
  onDone: () => void;
  syncing: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      className="text-center"
    >
      <div className="flex justify-center mb-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "rgba(125,179,117,0.12)" }}
        >
          <RefreshCw size={28} style={{ color: "#3f8a5a" }} />
        </motion.div>
      </div>

      <h2 className="text-base font-semibold text-slate-800 mb-1">Menunggu Pembayaran</h2>
      <p className="text-xs text-slate-400 font-normal mb-6">
        Selesaikan pembayaran melalui Midtrans, lalu klik tombol di bawah setelah selesai.
      </p>

      {snapToken && (
        <a
          href={`https://app.sandbox.midtrans.com/snap/v3/redirection/${snapToken}`}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 mb-3 font-semibold text-sm text-white transition-all"
          style={{ background: "linear-gradient(135deg,#7db375,#5a9e6f)" }}
        >
          <CreditCard size={15} />
          Buka Halaman Pembayaran
        </a>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onDone}
        disabled={syncing}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-sm disabled:opacity-60"
        style={{ background: "#f1f5f9", color: "#475569" }}
      >
        {syncing
          ? <><RefreshCw size={14} className="animate-spin" /> Mengecek...</>
          : <><CheckCircle2 size={16} /> Sudah Bayar</>
        }
      </motion.button>
      <p className="mt-3 text-[10px] text-slate-400">Klik setelah pembayaran selesai di Midtrans</p>
    </motion.div>
  );
}

// ─── Step 4: Success ──────────────────────────────────────────────────────────
function StepSuccess({ days, price, label }: { days: number; price: number; label: string }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  
  const benefits = [
    "Profil ditampilkan di posisi teratas pencarian",
    "Badge Traveler Terverifikasi aktif",
    "Analitik performa boost tersedia",
    "Highlight profil premium aktif",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/traveler/settings", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

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
            <p className="text-sm font-semibold text-slate-700">Paket {label}</p>
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

      {/* Countdown + buttons */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-2.5"
      >
        {/* Countdown bar */}
        <div className="rounded-xl p-3 mb-1" style={{ background: "rgba(125,179,117,0.08)", border: "1px solid rgba(125,179,117,0.2)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-normal">Kembali ke Pengaturan dalam</p>
            <p className="text-sm font-bold" style={{ color: "#3f8a5a" }}>{countdown}s</p>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #7db375, #5a9e6f)" }}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/traveler/settings", { replace: true })}
          className="w-full rounded-2xl py-4 font-semibold text-sm"
          style={{
            background: "linear-gradient(135deg,#7db375,#5a9e6f)",
            color: "white",
            boxShadow: "0 6px 20px -4px rgba(90,158,111,0.4)",
          }}
        >
          Kembali ke Pengaturan
        </motion.button>
        <button
          onClick={() => navigate("/traveler", { replace: true })}
          className="w-full rounded-2xl py-3.5 font-medium text-sm text-slate-500 hover:text-slate-700 transition-colors"
          style={{ background: "#f1f5f9" }}
        >
          Lihat Dashboard
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BoostPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    boosterId,
    days = 7,
    price = 15000,
    label = "Basic Boost",
    color = "#22c55e",  
  } = (location.state as any) ?? {};

  const [step, setStep] = useState<PaymentStep>("select");

  const [clientKey, setClientKey] = useState<string>("");
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [buying, setBuying]       = useState(false);
  const [syncing, setSyncing]     = useState(false);
  const { toast } = useToast();

  const handleNext = () => setStep("confirm");

  // Tambah di dalam BoostPaymentPage, setelah state declarations
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");
    const transactionStatus = params.get("transaction_status");
    const statusCode = params.get("status_code");

    if (!orderId || !transactionStatus) return;

    // Bersihkan URL params tanpa reload
    window.history.replaceState({}, "", window.location.pathname);

    // Auto sync berdasarkan status dari redirect
    if (transactionStatus === "settlement" || 
        (transactionStatus === "capture" && statusCode === "200")) {
      // Cari payment_id dari order_id di URL, lalu sync
      const syncByOrderId = async () => {
        try {
          // Simpan orderId ke state untuk sync
          // Panggil endpoint sync — kita perlu endpoint baru atau gunakan yang ada
          const res = await api.post("/traveler/boosters/sync-by-order", {
            midtrans_order_id: orderId,
          });
          if (res.data.data?.status === "paid") {
            setStep("success");
          }
        } catch {
          // Jika gagal, tampilkan step processing dengan tombol "Sudah Bayar"
          setStep("processing");
        }
      };
      syncByOrderId();
    } else if (transactionStatus === "pending") {
      setStep("processing");
    }
  }, []);

  const handlePay = async () => {
    if (!boosterId) return;
    setBuying(true);
    try {
      const res = await api.post("/traveler/boosters/buy", { booster_id: boosterId });
      const { snap_token, snap_url, client_key, payment_id } = res.data.data;

      setPaymentId(payment_id);
      setSnapToken(snap_token);

      // Hapus script snap lama jika ada, load ulang
      const existingScript = document.querySelector('script[src*="snap"]');
      if (existingScript) existingScript.remove();

      const script = document.createElement("script");
      script.src = snap_url;
      script.setAttribute("data-client-key", client_key);
      script.onload = () => {
        (window as any).snap.pay(snap_token, {
          onSuccess: async () => {
            // Sync ke backend
            try {
              await api.post(`/traveler/boosters/${payment_id}/sync`);
            } catch {}
            setStep("success");
          },
          onPending: () => {
            toast({
              title: "Menunggu Pembayaran",
              description: "Selesaikan pembayaran Anda.",
            });
            setStep("processing");
          },
          onError: () => {
            toast({
              title: "Pembayaran Gagal",
              variant: "destructive",
            });
          },
          onClose: async () => {
            // Sync saat popup ditutup
            try {
              const syncRes = await api.post(`/traveler/boosters/${payment_id}/sync`);
              if (syncRes.data.data?.status === "paid") {
                setStep("success");
              }
            } catch {}
          },
        });
      };
      document.head.appendChild(script);

    } catch (err: any) {
      toast({
        title: err?.response?.data?.message ?? "Gagal membuat pembayaran",
        variant: "destructive",
      });
    } finally {
      setBuying(false);
    }
  };

  const handleDone = async () => {
    if (!paymentId) { setStep("success"); return; }
    setSyncing(true);
    try {
      const res = await api.post(`/traveler/boosters/${paymentId}/sync`);
      const status = res.data.data?.status;
      if (status === "paid") {
        setStep("success");
      } else {
        toast({
          title: "Pembayaran belum terkonfirmasi",
          description: "Coba beberapa saat lagi setelah transfer selesai.",
        });
      }
    } catch {
      toast({ title: "Gagal mengecek status", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

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
              <OrderSummary days={days} price={price} label={label} color={color} />
            </motion.div>
          )}

          {/* Step content card */}
          <div
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100"
          >
            <AnimatePresence mode="wait">
              {step === "select" && (
                <StepSelect key="select" onNext={handleNext} />
              )}
              {step === "confirm" && (
                <StepConfirm
                  key="confirm"
                  days={days}
                  price={price}
                  onBack={() => setStep("select")}
                  onPay={handlePay}
                  buying={buying}
                  label={label}
                />
              )}
              {step === "processing" && (
                <StepProcessing
                  key="processing"
                  snapToken={snapToken}
                  onDone={handleDone}
                  syncing={syncing}
                />
              )}
              {step === "success" && (
                <StepSuccess key="success" days={days} price={price} label={label} />
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