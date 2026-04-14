import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet, TrendingUp, ArrowRight, Rocket, Megaphone,
  ChevronLeft, ChevronRight, BadgeDollarSign, Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WalletStats {
  total_income: number;
  this_month:   number;
  last_month:   number;
  total_trx:    number;
}

interface BoosterTrx {
  id:         number;
  traveler:   { id: number; name: string; photo?: string };
  plan:       string;
  plan_color: string;
  amount:     number;
  paid_at:    string;
  order_id:   string;
}

interface AdsTrx {
  id:            number;
  partner_name:  string;
  title:         string;
  package:       string;
  package_label: string;
  amount:        number;
  paid_at:       string;
  order_id:      string;
  image_url:     string | null;
}

interface PaginationMeta {
  last_page: number;
  total:     number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pkgColor(pkg: string): string {
  if (pkg === "premium")  return "#f59e0b";
  if (pkg === "standard") return "#3b82f6";
  return "#6b7280";
}

function formatRp(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminWallet() {
  const navigate = useNavigate();

  // ── Booster state ──────────────────────────────────────────────────────────
  const [boosterStats,   setBoosterStats]   = useState<WalletStats>({ total_income: 0, this_month: 0, last_month: 0, total_trx: 0 });
  const [boosterTrx,     setBoosterTrx]     = useState<BoosterTrx[]>([]);
  const [boosterLoading, setBoosterLoading] = useState(true);
  const [boosterPage,    setBoosterPage]    = useState(1);
  const [boosterMeta,    setBoosterMeta]    = useState<PaginationMeta>({ last_page: 1, total: 0 });

  // ── Ads state ──────────────────────────────────────────────────────────────
  const [adsStats,   setAdsStats]   = useState<WalletStats>({ total_income: 0, this_month: 0, last_month: 0, total_trx: 0 });
  const [adsTrx,     setAdsTrx]     = useState<AdsTrx[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const [adsPage,    setAdsPage]    = useState(1);
  const [adsMeta,    setAdsMeta]    = useState<PaginationMeta>({ last_page: 1, total: 0 });

  // ── Tab ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"booster" | "ads">("booster");

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchBooster = async (page = 1) => {
    setBoosterLoading(true);
    try {
      const res = await api.get(`/admin/wallet/booster?page=${page}`);
      const d = res.data.data;
      setBoosterStats(d.stats);
      setBoosterTrx(d.transactions.data ?? []);
      setBoosterMeta({ last_page: d.transactions.last_page ?? 1, total: d.transactions.total ?? 0 });
    } catch {}
    finally { setBoosterLoading(false); }
  };

  const fetchAds = async (page = 1) => {
    setAdsLoading(true);
    try {
      const res = await api.get(`/admin/wallet/advertisements?page=${page}`);
      const d = res.data.data;
      setAdsStats(d.stats);
      setAdsTrx(d.transactions.data ?? []);
      setAdsMeta({ last_page: d.transactions.last_page ?? 1, total: d.transactions.total ?? 0 });
    } catch {}
    finally { setAdsLoading(false); }
  };

  useEffect(() => {
    fetchBooster();
    fetchAds();
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────

  const totalIncome  = boosterStats.total_income + adsStats.total_income;
  const thisMonthAll = boosterStats.this_month   + adsStats.this_month;

  const summaryCards = [
    { label: "Pendapatan Booster", value: boosterStats.total_income, icon: Rocket,          iconBg: "bg-orange-500/10 text-orange-500", currency: true  },
    { label: "Pendapatan Iklan",   value: adsStats.total_income,     icon: Megaphone,       iconBg: "bg-blue-500/10 text-blue-500",    currency: true  },
    { label: "Transaksi Booster",  value: boosterStats.total_trx,    icon: BadgeDollarSign, iconBg: "bg-primary/10 text-primary",      currency: false },
    { label: "Transaksi Iklan",    value: adsStats.total_trx,        icon: BadgeDollarSign, iconBg: "bg-blue-400/10 text-blue-400",    currency: false },
  ] as const;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 lg:p-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-primary/10 p-2">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Saldo Platform</h1>
              <p className="text-sm text-muted-foreground">Kelola pendapatan dari booster dan iklan mitra</p>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto space-y-6">

          {/* ── Total Pendapatan Card ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-6 text-accent-foreground relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <Wallet className="h-8 w-8" />
                <span className="text-lg font-medium">Total Pendapatan Platform</span>
              </div>
              <p className="text-4xl font-bold">{formatRp(totalIncome)}</p>
              <p className="mt-2 text-sm flex items-center gap-1 text-accent-foreground/80">
                <TrendingUp className="h-4 w-4" />
                +{formatRp(thisMonthAll)} bulan ini (booster + iklan)
              </p>
            </div>
          </motion.div>

          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="rounded-xl bg-card p-4 shadow-card hover:shadow-lg transition">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.iconBg}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-semibold text-foreground">
                      {item.currency ? formatRp(item.value) : `${item.value} trx`}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Actions ── */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="hero" size="lg" onClick={() => navigate("/admin/boosters")}>
              <Rocket className="h-5 w-5 mr-2" /> Kelola Booster
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/admin/ads")}>
              <Megaphone className="h-5 w-5 mr-2" /> Kelola Iklan
            </Button>
          </div>

          {/* ── 2-col Preview ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Booster Terbaru */}
            <div className="rounded-2xl bg-card p-6 shadow-card flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Booster Terbaru</h2>
                <button onClick={() => setActiveTab("booster")}
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition group">
                  Lihat Semua <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {boosterLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : boosterTrx.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Belum ada transaksi booster</p>
                ) : boosterTrx.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: item.plan_color ?? "#f97316" }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.traveler?.name}</p>
                        <p className="text-xs text-muted-foreground">{item.plan} · {item.paid_at}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-success shrink-0 ml-2">+{formatRp(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Iklan Terbaru */}
            <div className="rounded-2xl bg-card p-6 shadow-card flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Iklan Terbaru</h2>
                <button onClick={() => setActiveTab("ads")}
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition group">
                  Lihat Semua <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {adsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : adsTrx.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Belum ada transaksi iklan</p>
                ) : adsTrx.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted transition">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.partner_name}
                          className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: pkgColor(item.package) }} />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.partner_name}</p>
                        <p className="text-xs text-muted-foreground">{item.package_label} · {item.paid_at}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-success shrink-0 ml-2">+{formatRp(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Riwayat Pendapatan ── */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-5">Riwayat Pendapatan</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {(["booster", "ads"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}>
                  {tab === "booster" ? `Booster (${boosterStats.total_trx})` : `Iklan (${adsStats.total_trx})`}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2.5 min-h-[200px]">
              {activeTab === "booster" ? (
                boosterLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
                ) : boosterTrx.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">Belum ada transaksi booster</p>
                ) : boosterTrx.map(item => (
                  <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 hover:bg-muted transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: (item.plan_color ?? "#f97316") + "22" }}>
                        <Rocket className="h-4 w-4" style={{ color: item.plan_color ?? "#f97316" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">Booster — {item.plan}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.traveler?.name} · {item.paid_at}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold text-success">+{formatRp(item.amount)}</p>
                      <p className="text-[10px] text-muted-foreground">{item.order_id}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                adsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
                ) : adsTrx.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">Belum ada transaksi iklan</p>
                ) : adsTrx.map(item => (
                  <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 hover:bg-muted transition">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.partner_name}
                          className="w-9 h-9 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: pkgColor(item.package) + "22" }}>
                          <Megaphone className="h-4 w-4" style={{ color: pkgColor(item.package) }} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.partner_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.title} · {item.package_label} · {item.paid_at}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold text-success">+{formatRp(item.amount)}</p>
                      <p className="text-[10px] text-muted-foreground">{item.order_id}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Pagination Booster */}
            {activeTab === "booster" && boosterMeta.last_page > 1 && (
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-border">
                <button disabled={boosterPage === 1}
                  onClick={() => { const p = boosterPage - 1; setBoosterPage(p); fetchBooster(p); }}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronLeft className="h-4 w-4" /> Sebelumnya
                </button>
                <span className="text-xs text-muted-foreground">{boosterPage} / {boosterMeta.last_page}</span>
                <button disabled={boosterPage === boosterMeta.last_page}
                  onClick={() => { const p = boosterPage + 1; setBoosterPage(p); fetchBooster(p); }}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition">
                  Selanjutnya <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Pagination Ads */}
            {activeTab === "ads" && adsMeta.last_page > 1 && (
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-border">
                <button disabled={adsPage === 1}
                  onClick={() => { const p = adsPage - 1; setAdsPage(p); fetchAds(p); }}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronLeft className="h-4 w-4" /> Sebelumnya
                </button>
                <span className="text-xs text-muted-foreground">{adsPage} / {adsMeta.last_page}</span>
                <button disabled={adsPage === adsMeta.last_page}
                  onClick={() => { const p = adsPage + 1; setAdsPage(p); fetchAds(p); }}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition">
                  Selanjutnya <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}