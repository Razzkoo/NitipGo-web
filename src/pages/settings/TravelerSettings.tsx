import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Wallet,
  Shield,
  Settings,
  Star,
  Zap,
  Clock,
  TrendingUp,
  ChevronRight,
  Rocket,
  Crown,
  X,
  ArrowRight,
  Flame,
  BadgeCheck,
  BarChart3,
  CircleCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

// ─── Boost Plans ──────────────────────────────────────────────────────────────
const boostPlans = [
  {
    id: "7days",
    days: 7,
    price: 15000,
    label: "Basic Boost",
    sublabel: "Coba Dulu",
    icon: Clock,
    isPopular: false,
    isPremium: false,
  },
  {
    id: "14days",
    days: 14,
    price: 35000,
    label: "Pro Boost",
    sublabel: "Paket Terlaris",
    icon: Zap,
    isPopular: true,
    isPremium: false,
  },
  {
    id: "30days",
    days: 30,
    price: 65000,
    label: "Elite Boost",
    sublabel: "Dominasi Penuh",
    icon: Crown,
    isPopular: false,
    isPremium: true,
  },
];

// ─── Boost Modal ──────────────────────────────────────────────────────────────
function BoostModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSelect = (plan: (typeof boostPlans)[0]) => {
    onClose();
    navigate("/traveler/boost/payment", { state: { days: plan.days, price: plan.price } });
    toast({ title: `Paket ${plan.label} dipilih!`, description: `Aktif selama ${plan.days} hari.` });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: "rgba(0,8,4,0.75)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl"
            style={{ background: "#fff" }}
          >
            {/* Modal Header — matched to card palette */}
            <div
              className="relative px-7 pt-8 pb-12 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #7db375 0%, #8ea886 35%, #77b18c 70%, #96b8a3 100%)",
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  backgroundSize: "200px",
                }}
              />
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-40 w-60 rounded-full blur-3xl bg-yellow-200/25" />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[2.5rem]" />

              <button
                onClick={onClose}
                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/15 hover:bg-black/25 transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>

              <div className="relative flex items-center gap-3 mb-2">
                <motion.div
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/25 backdrop-blur-sm shadow-lg"
                >
                  <Rocket className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <p className="text-white/55 text-[10px] font-medium uppercase tracking-[0.18em]">Boost Profil</p>
                  <h3 className="text-2xl font-bold text-white leading-tight tracking-tight">Pilih Paketmu</h3>
                </div>
              </div>
              <p className="relative text-sm font-normal text-white/65">
                Tampil paling atas dan raih lebih banyak order mulai hari ini.
              </p>
            </div>

            {/* Plans */}
            <div className="px-5 pt-5 pb-4 space-y-3 bg-white">
              {boostPlans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <motion.button
                    key={plan.id}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelect(plan)}
                    className="relative w-full flex items-center justify-between rounded-2xl p-4 text-left transition-all"
                    style={
                      plan.isPopular
                        ? {
                            background: "linear-gradient(130deg, #7db375 0%, #5a9e6f 100%)",
                            boxShadow: "0 8px 24px -4px rgba(125,179,117,0.4)",
                          }
                        : plan.isPremium
                        ? {
                            background: "linear-gradient(130deg, #8ea886 0%, #77b18c 100%)",
                            boxShadow: "0 6px 20px -4px rgba(119,177,140,0.3)",
                          }
                        : {
                            background: "#f8fafc",
                            border: "2px solid #e2e8f0",
                          }
                    }
                  >
                    {plan.isPopular && (
                      <span className="absolute -top-2.5 right-4 text-[10px] font-semibold uppercase tracking-wide px-3 py-0.5 rounded-full bg-yellow-400 text-yellow-900 shadow">
                        Terlaris
                      </span>
                    )}

                    <div className="flex items-center gap-3.5">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={
                          plan.isPopular || plan.isPremium
                            ? { background: "rgba(255,255,255,0.2)" }
                            : { background: "#e2e8f0" }
                        }
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: plan.isPopular || plan.isPremium ? "white" : "#64748b" }}
                        />
                      </div>
                      <div>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: plan.isPopular || plan.isPremium ? "white" : "#1e293b" }}
                        >
                          {plan.sublabel}
                        </p>
                        <p
                          className="text-xs font-normal"
                          style={{
                            color: plan.isPopular || plan.isPremium
                              ? "rgba(240,253,244,0.70)"
                              : "#94a3b8",
                          }}
                        >
                          Aktif selama {plan.days} hari
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <p
                        className="text-lg font-bold leading-none"
                        style={{ color: plan.isPopular || plan.isPremium ? "white" : "#0f172a" }}
                      >
                        Rp{plan.price / 1000}rb
                      </p>
                      <ArrowRight
                        className="h-4 w-4"
                        style={{
                          color: plan.isPopular || plan.isPremium ? "rgba(255,255,255,0.4)" : "#cbd5e1",
                        }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="px-5 pb-7">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl text-slate-400 font-medium text-sm hover:text-slate-600 transition-colors"
                style={{ background: "#f1f5f9" }}
              >
                Nanti Saja
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl py-3 px-2 text-center"
      style={{ background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.15)" }}
    >
      <p className="text-lg font-bold text-white leading-none tracking-tight">{value}</p>
      <p
        className="text-[10px] font-normal leading-snug mt-1.5"
        style={{ color: "rgba(255,255,255,0.58)" }}
      >
        {label}
      </p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TravelerSettings() {
  const { toast } = useToast();
  const [boostOpen, setBoostOpen] = useState(false);

  const handleSave = () => {
    toast({ title: "Pengaturan Disimpan", description: "Preferensi Anda telah berhasil disimpan." });
  };

  const settingSections = [
    {
      icon: Bell,
      title: "Notifikasi",
      subtitle: "Atur preferensi pemberitahuan",
      iconColor: "#f97316",
      iconBg: "rgba(249,115,22,0.08)",
      delay: 0,
      content: (
        <div className="space-y-1">
          {[
            { label: "Order Baru", desc: "Notifikasi saat ada order masuk", defaultOn: true },
            { label: "Pembayaran Masuk", desc: "Notifikasi saldo masuk", defaultOn: true },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="font-medium text-sm text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.defaultOn} />
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: Wallet,
      title: "Pembayaran",
      subtitle: "Kelola dompet & rekening",
      iconColor: "#16a34a",
      iconBg: "rgba(22,163,74,0.08)",
      delay: 0.08,
      content: (
        <div className="space-y-2">
          {[
            { label: "Kelola Rekening Bank", to: "/traveler/wallet" },
            { label: "Riwayat Penarikan", to: "/traveler/wallet" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center justify-between w-full p-3.5 rounded-xl border border-slate-100 hover:border-green-200 hover:bg-green-50/50 transition-all group"
            >
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-green-600 transition-colors" />
            </Link>
          ))}
        </div>
      ),
    },
    {
      icon: Shield,
      title: "Keamanan",
      subtitle: "Kata sandi & privasi akun",
      iconColor: "#2563eb",
      iconBg: "rgba(37,99,235,0.08)",
      delay: 0.16,
      content: (
        <button className="flex items-center justify-between w-full p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
          <span className="text-sm font-medium text-foreground">Ubah Password</span>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout role="traveler">
      <div className="p-6 md:p-8 lg:p-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-xl p-2.5" style={{ background: "rgba(22,163,74,0.1)" }}>
              <Settings className="h-5 w-5" style={{ color: "#16a34a" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Pengaturan Akun</h1>
              <p className="text-sm text-muted-foreground">Kelola preferensi akun Anda</p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: settings sections */}
          <div className="lg:col-span-2 space-y-5 max-w-2xl">
            {settingSections.map((section) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: section.delay }}
                  whileHover={{ y: -2, transition: { duration: 0.18 } }}
                  className="rounded-2xl bg-white p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: section.iconBg }}
                    >
                      <Icon className="h-4 w-4" style={{ color: section.iconColor }} />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
                      <p className="text-xs text-muted-foreground">{section.subtitle}</p>
                    </div>
                  </div>
                  {section.content}
                </motion.div>
              );
            })}

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
              <Button onClick={handleSave} className="w-full rounded-xl py-5 font-semibold">
                Simpan Pengaturan
              </Button>
            </motion.div>
          </div>

          {/* Right: BOOST CARD */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 }}
            className="sticky top-24"
          >
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.28, ease: "easeOut" } }}
              className="relative overflow-hidden rounded-[2rem] shadow-2xl"
              style={{
                background: "linear-gradient(145deg, #7db375 0%, #8ea886 28%, #77b18c 65%, #96b8a3 100%)",
              }}
            >
              {/* Noise texture */}
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  backgroundSize: "256px",
                }}
              />
              {/* Glow orbs */}
              <div
                className="absolute -top-20 -left-10 h-64 w-64 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)" }}
              />
              <div
                className="absolute -bottom-16 -right-10 h-56 w-56 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(134,239,172,0.2) 0%, transparent 70%)" }}
              />
              {/* Diagonal highlight */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)",
                }}
              />

              <div className="relative z-10 p-7">
                {/* Top badge row */}
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ background: "rgba(0,0,0,0.18)", color: "#e6ad1f", border: "1px solid rgba(251,191,36,0.2)" }}
                  >
                    <Flame size={10} />
                    Rekomendasi Untukmu
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: "rgba(251,191,36,0.18)" }}
                  >
                    <Zap size={14} className="text-yellow-300 fill-yellow-300" />
                  </motion.div>
                </div>

                {/* Headline */}
                <div className="mb-5">
                  <p className="text-white/50 text-[10px] font-medium uppercase tracking-widest mb-1">
                    Boost Profil Traveler
                  </p>
                  <h3 className="font-bold leading-[1.1] tracking-tight text-white" style={{ fontSize: "1.65rem" }}>
                    Tampil #1,{" "}
                    <span style={{ color: "#fde68a" }}>Order Lebih Deras!</span>
                  </h3>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <StatPill value="3x" label="Lebih Banyak Order" />
                  <StatPill value="95%" label="Tingkat Kepuasan" />
                  <StatPill value="24j" label="Aktif Instan" />
                </div>

                {/* Divider */}
                <div className="h-px mb-5" style={{ background: "rgba(255,255,255,0.12)" }} />

                {/* Benefits */}
                <div className="space-y-2.5 mb-6">
                  {[
                    { text: "Prioritas pencarian teratas" },
                    { text: "Badge Traveler Terverifikasi" },
                    { text: "Analitik performa real-time" },
                    { text: "Highlight profil premium" },
                  ].map(({ text }) => (
                    <div key={text} className="flex items-center gap-2.5">
                      <CircleCheck size={14} style={{ color: "#bbf7d0", flexShrink: 0 }} />
                      <span className="text-sm font-normal" style={{ color: "rgba(255,255,255,0.78)" }}>
                        {text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing grid */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {boostPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="rounded-xl p-2.5 text-center"
                      style={
                        plan.isPopular
                          ? {
                              background: "rgba(251,191,36,0.20)",
                              border: "1.5px solid rgba(251,191,36,0.45)",
                            }
                          : {
                              background: "rgba(255,255,255,0.07)",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }
                      }
                    >
                      <p className="text-[9px] font-normal uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
                        {plan.days} hari
                      </p>
                      <p className="text-sm font-bold text-white leading-none">{plan.price / 1000}rb</p>
                      {plan.isPopular && (
                        <p className="text-[9px] font-semibold mt-1 uppercase tracking-wide" style={{ color: "#fbbf24" }}>
                          Terbaik
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 12px 36px -6px rgba(230,173,31,0.5)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setBoostOpen(true)}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 font-semibold text-sm tracking-wide transition-all"
                  style={{
                    background: "linear-gradient(135deg, #f3b10b 0%, #ddaa4c 50%, #e9b67c 100%)",
                    color: "#431407",
                    boxShadow: "0 8px 28px -4px rgba(217,119,6,0.45)",
                  }}
                >
                  <Rocket size={16} />
                  Mulai Boost Sekarang
                </motion.button>

                {/* Trust line */}
                <div className="flex items-center justify-center gap-3 mt-3.5">
                  {["Bayar Aman", "Aktif Instan", "Batalkan Kapan Saja"].map((t, i) => (
                    <div key={t} className="flex items-center gap-1">
                      {i > 0 && (
                        <div className="h-3 w-px mr-1" style={{ background: "rgba(255,255,255,0.15)" }} />
                      )}
                      <p className="text-[9.5px] font-normal" style={{ color: "rgba(255,255,255,0.33)" }}>
                        {t}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <BoostModal open={boostOpen} onClose={() => setBoostOpen(false)} />
    </DashboardLayout>
  );
}