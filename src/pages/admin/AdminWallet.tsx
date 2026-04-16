import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, TrendingUp, ArrowRight, Rocket, Megaphone,
  ChevronLeft, ChevronRight, BadgeDollarSign, Loader2,
  ArrowDownToLine, CheckCircle, AlertCircle,
  Building2, CreditCard, FileText, RefreshCw, Trash2,
  CircleDollarSign,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
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

interface BalanceSummary {
  total_income:    number;
  booster_income:  number;
  ads_income:      number;
  total_withdrawn: number;
  total_pending:   number;
  available:       number;
}

interface WithdrawRecord {
  id:             number;
  bank_name:      string;
  account_number: string;
  account_name:   string;
  amount:         number;
  fee:            number;
  net_amount:     number;
  status:         string;
  note:           string | null;
  reference_no:   string | null;
  created_at:     string;
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

// ─── Withdraw Form Modal ──────────────────────────────────────────────────────

function WithdrawModal({
  open, onClose, balance, onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  balance: BalanceSummary | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [step, setStep]     = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm]     = useState({
    bank_name: "", account_number: "", account_name: "",
    amount: "", fee: "0", note: "",
  });

  const reset = () => {
    setStep(1);
    setForm({ bank_name: "", account_number: "", account_name: "", amount: "", fee: "0", note: "" });
  };
  const close = () => { reset(); onClose(); };

  const available = balance?.available ?? 0;
  const amount    = Number(form.amount) || 0;
  const fee       = Number(form.fee)    || 0;
  const net       = amount - fee;
  const isValid   = form.bank_name && form.account_number && form.account_name
                    && amount >= 10000 && net > 0 && amount <= available;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post("/admin/platform-withdraw", {
        bank_name: form.bank_name, account_number: form.account_number,
        account_name: form.account_name, amount, fee,
        note: form.note || undefined,
      });
      toast({ title: "Penarikan berhasil!", description: `${formatRp(net)} sedang diproses ke ${form.bank_name}` });
      close();
      onSuccess();
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal menarik saldo", variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) close(); }}>
      <DialogContent className="max-w-md p-0 gap-0 rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary to-primary/80 px-6 pt-5 pb-6 overflow-hidden">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-white/10 blur-xl" />
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 mb-3">
              <ArrowDownToLine className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">Tarik Saldo Platform</h2>
            <p className="text-sm text-white/70 mt-0.5">
              Tersedia: <span className="font-bold text-white">{formatRp(available)}</span>
            </p>
          </div>

          {/* Step indicator */}
          <div className="relative mt-4 flex items-center">
            {["Rekening & Nominal", "Konfirmasi"].map((label, i) => {
              const s = i + 1;
              const done = step > s; const active = step === s;
              return (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      done ? "bg-white text-primary" : active ? "bg-white text-primary ring-2 ring-white/50 ring-offset-1 ring-offset-primary" : "bg-white/20 text-white/60"
                    }`}>
                      {done ? <CheckCircle className="h-3.5 w-3.5" /> : s}
                    </div>
                    <span className={`text-[9px] mt-1 font-medium ${active ? "text-white" : "text-white/50"}`}>{label}</span>
                  </div>
                  {i < 1 && <div className={`flex-1 h-px mx-2 mb-4 ${step > s ? "bg-white" : "bg-white/20"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* Step 1 */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="px-6 py-5 space-y-4 overflow-y-auto max-h-[60vh]">

              {/* Rekening */}
              <div className="rounded-xl bg-muted/30 border border-border/50 p-3.5 space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rekening Tujuan</p>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3 w-3" /> Bank / E-Wallet <span className="text-red-500">*</span>
                  </Label>
                  <Input placeholder="Contoh: BCA, BNI, GoPay" value={form.bank_name}
                    onChange={e => setForm({ ...form, bank_name: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <CreditCard className="h-3 w-3" /> Nomor Rekening <span className="text-red-500">*</span>
                  </Label>
                  <Input placeholder="1234567890" value={form.account_number}
                    onChange={e => setForm({ ...form, account_number: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Atas Nama <span className="text-red-500">*</span>
                  </Label>
                  <Input placeholder="Nama pemilik rekening" value={form.account_name}
                    onChange={e => setForm({ ...form, account_name: e.target.value })} className="rounded-xl" />
                </div>
              </div>

              {/* Nominal */}
              <div className="rounded-xl bg-muted/30 border border-border/50 p-3.5 space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nominal</p>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <CircleDollarSign className="h-3 w-3" /> Jumlah Tarik <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
                    <Input type="number" placeholder="0" value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })} className="rounded-xl pl-9" />
                  </div>
                  {amount > 0 && amount > available && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Melebihi saldo tersedia ({formatRp(available)})
                    </p>
                  )}
                  {amount > 0 && amount < 10000 && (
                    <p className="text-xs text-red-500">Minimal penarikan Rp 10.000</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Biaya Transfer (opsional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
                    <Input type="number" placeholder="0" value={form.fee}
                      onChange={e => setForm({ ...form, fee: e.target.value })} className="rounded-xl pl-9" />
                  </div>
                </div>

                {/* Preview net amount */}
                {amount >= 10000 && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Yang diterima</span>
                    <span className="text-sm font-black text-primary">{formatRp(Math.max(0, net))}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3 w-3" /> Catatan (opsional)
                  </Label>
                  <textarea rows={2} placeholder="Catatan penarikan..."
                    value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                    className="flex w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={close}
                  className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/40 transition">
                  Batal
                </button>
                <button onClick={() => setStep(2)} disabled={!isValid}
                  className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5">
                  Lanjut <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Konfirmasi */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="px-6 py-5 space-y-4">

              {/* Summary */}
              <div className="rounded-xl bg-muted/30 border border-border/50 p-4 space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Konfirmasi Penarikan</p>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Bank / E-Wallet",  value: form.bank_name      },
                    { label: "Nomor Rekening",   value: form.account_number },
                    { label: "Atas Nama",        value: form.account_name   },
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="font-semibold">{r.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-border/60 pt-2 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jumlah Tarik</span>
                      <span className="font-semibold">{formatRp(amount)}</span>
                    </div>
                    {fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Biaya Transfer</span>
                        <span className="font-semibold text-red-500">−{formatRp(fee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1 border-t border-border/40">
                      <span className="font-semibold text-foreground">Yang Diterima</span>
                      <span className="text-xl font-black text-primary">{formatRp(net)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Saldo setelah tarik */}
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-emerald-700 font-medium">Saldo tersisa setelah tarik</span>
                <span className="text-sm font-black text-emerald-700">{formatRp(available - amount)}</span>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Pastikan data rekening sudah benar. Penarikan tidak bisa dibatalkan setelah dikonfirmasi.
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/40 transition flex items-center justify-center gap-1.5">
                  <ChevronLeft className="h-4 w-4" /> Kembali
                </button>
                <button onClick={handleSubmit} disabled={saving}
                  className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition flex items-center justify-center gap-1.5">
                  {saving
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
                    : <><ArrowDownToLine className="h-4 w-4" /> Tarik Sekarang</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteWithdrawModal({ withdraw, onClose, onSuccess }: {
  withdraw: WithdrawRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!withdraw) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/platform-withdraw/${withdraw.id}`);
      toast({ title: "Riwayat dihapus" });
      onClose();
      onSuccess();
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    } finally { setDeleting(false); }
  };

  return (
    <Dialog open={!!withdraw} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <DialogTitle>Hapus Riwayat?</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Riwayat penarikan ke <strong>{withdraw?.bank_name}</strong> akan dihapus.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Batal</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="flex-1">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            Ya, Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminWallet() {
  const navigate = useNavigate();

  // ── Booster ──────────────────────────────────────────────────────────────
  const [boosterStats,   setBoosterStats]   = useState<WalletStats>({ total_income: 0, this_month: 0, last_month: 0, total_trx: 0 });
  const [boosterTrx,     setBoosterTrx]     = useState<BoosterTrx[]>([]);
  const [boosterLoading, setBoosterLoading] = useState(true);
  const [boosterPage,    setBoosterPage]    = useState(1);
  const [boosterMeta,    setBoosterMeta]    = useState<PaginationMeta>({ last_page: 1, total: 0 });

  // ── Ads ──────────────────────────────────────────────────────────────────
  const [adsStats,   setAdsStats]   = useState<WalletStats>({ total_income: 0, this_month: 0, last_month: 0, total_trx: 0 });
  const [adsTrx,     setAdsTrx]     = useState<AdsTrx[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const [adsPage,    setAdsPage]    = useState(1);
  const [adsMeta,    setAdsMeta]    = useState<PaginationMeta>({ last_page: 1, total: 0 });

  // ── Withdraw ─────────────────────────────────────────────────────────────
  const [balance,         setBalance]         = useState<BalanceSummary | null>(null);
  const [withdrawList,    setWithdrawList]    = useState<WithdrawRecord[]>([]);
  const [withdrawLoading, setWithdrawLoading] = useState(true);
  const [withdrawPage,    setWithdrawPage]    = useState(1);
  const [withdrawMeta,    setWithdrawMeta]    = useState<PaginationMeta>({ last_page: 1, total: 0 });

  // ── Modal ────────────────────────────────────────────────────────────────
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [deleteTarget,      setDeleteTarget]      = useState<WithdrawRecord | null>(null);

  // ── Tabs ─────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"booster" | "ads" | "withdraw">("booster");

  // ── Fetch ─────────────────────────────────────────────────────────────────

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

  const fetchWithdraw = async (page = 1) => {
    setWithdrawLoading(true);
    try {
      const res = await api.get(`/admin/platform-withdraw?page=${page}`);
      setWithdrawList(res.data.data.data ?? []);
      setWithdrawMeta({ last_page: res.data.data.last_page ?? 1, total: res.data.data.total ?? 0 });
      if (res.data.summary) setBalance(res.data.summary);
    } catch {}
    finally { setWithdrawLoading(false); }
  };

  const fetchBalance = async () => {
    try {
      const res = await api.get("/admin/platform-withdraw/balance");
      setBalance(res.data.data);
    } catch {}
  };

  useEffect(() => {
    fetchBooster();
    fetchAds();
    fetchWithdraw();
    fetchBalance();
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────

  const totalIncome      = boosterStats.total_income + adsStats.total_income;
  const thisMonthAll     = boosterStats.this_month + adsStats.this_month;
  const availableBalance = balance?.available ?? 0;

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

          {/* ── Total Card ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-6 text-accent-foreground relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
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
              <div className="flex flex-col items-start sm:items-end gap-2">
                <div className="rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2.5">
                  <p className="text-xs text-accent-foreground/70 mb-0.5">Saldo Tersedia</p>
                  <p className="text-xl font-black">{formatRp(availableBalance)}</p>
                </div>
                <button onClick={() => setWithdrawModalOpen(true)}
                  className="flex items-center gap-2 bg-white text-accent hover:bg-white/90 font-semibold text-sm px-4 py-2.5 rounded-xl transition shadow-sm">
                  <ArrowDownToLine className="h-4 w-4" /> Tarik Saldo
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="rounded-xl bg-card p-4 shadow-card hover:shadow-lg transition">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.iconBg}`}><item.icon className="h-4 w-4" /></div>
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
          <div className="grid grid-cols-3 gap-3">
            <Button variant="hero" size="lg" onClick={() => navigate("/admin/boosters")}>
              <Rocket className="h-5 w-5 mr-2" /> Kelola Booster
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/admin/ads")}>
              <Megaphone className="h-5 w-5 mr-2" /> Kelola Iklan
            </Button>
            <Button variant="outline" size="lg" onClick={() => setWithdrawModalOpen(true)}>
              <ArrowDownToLine className="h-5 w-5 mr-2" /> Tarik Saldo
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
                        <img src={item.image_url} alt={item.partner_name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
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

          {/* ── Riwayat ── */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Riwayat</h2>
              {activeTab === "withdraw" && (
                <button onClick={() => { fetchWithdraw(withdrawPage); fetchBalance(); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {([
                { key: "booster",  label: `Booster (${boosterStats.total_trx})`  },
                { key: "ads",      label: `Iklan (${adsStats.total_trx})`         },
                { key: "withdraw", label: `Tarik Saldo (${withdrawMeta.total})`   },
              ] as const).map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeTab === tab.key
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-2.5 min-h-[200px]">

              {/* Booster */}
              {activeTab === "booster" && (
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
              )}

              {/* Ads */}
              {activeTab === "ads" && (
                adsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
                ) : adsTrx.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">Belum ada transaksi iklan</p>
                ) : adsTrx.map(item => (
                  <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 hover:bg-muted transition">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.partner_name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: pkgColor(item.package) + "22" }}>
                          <Megaphone className="h-4 w-4" style={{ color: pkgColor(item.package) }} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.partner_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.title} · {item.package_label} · {item.paid_at}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold text-success">+{formatRp(item.amount)}</p>
                      <p className="text-[10px] text-muted-foreground">{item.order_id}</p>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Withdraw — riwayat sederhana */}
              {activeTab === "withdraw" && (
                withdrawLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
                ) : withdrawList.length === 0 ? (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <ArrowDownToLine className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Belum ada riwayat penarikan</p>
                    <button onClick={() => setWithdrawModalOpen(true)}
                      className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition">
                      <ArrowDownToLine className="h-4 w-4" /> Tarik Saldo Sekarang
                    </button>
                  </div>
                ) : withdrawList.map(item => (
                  <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.bank_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.account_name} · {item.account_number}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.created_at}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <div className="text-right">
                        <p className="text-sm font-black text-foreground">−{formatRp(item.net_amount)}</p>
                        {item.fee > 0 && (
                          <p className="text-[10px] text-muted-foreground">fee {formatRp(item.fee)}</p>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full mt-0.5">
                          <CheckCircle className="h-2.5 w-2.5" /> Selesai
                        </span>
                      </div>
                      <button onClick={() => setDeleteTarget(item)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-red-50 hover:text-red-400 transition">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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

            {/* Pagination Withdraw */}
            {activeTab === "withdraw" && withdrawMeta.last_page > 1 && (
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-border">
                <button disabled={withdrawPage === 1}
                  onClick={() => { const p = withdrawPage - 1; setWithdrawPage(p); fetchWithdraw(p); }}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronLeft className="h-4 w-4" /> Sebelumnya
                </button>
                <span className="text-xs text-muted-foreground">{withdrawPage} / {withdrawMeta.last_page}</span>
                <button disabled={withdrawPage === withdrawMeta.last_page}
                  onClick={() => { const p = withdrawPage + 1; setWithdrawPage(p); fetchWithdraw(p); }}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition">
                  Selanjutnya <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modals */}
      <WithdrawModal
        open={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        balance={balance}
        onSuccess={() => { fetchWithdraw(); fetchBalance(); setActiveTab("withdraw"); }}
      />
      <DeleteWithdrawModal
        withdraw={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => { fetchWithdraw(withdrawPage); fetchBalance(); }}
      />

    </DashboardLayout>
  );
}