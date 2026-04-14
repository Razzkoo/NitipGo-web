import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet,
  CreditCard,
  Building2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  PlusCircle,
  History,
  ArrowRight,
  Plus,
  Star,
  Trash2,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import api from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CountUp } from "@/components/ui/CountUp";
import { Dialog, DialogContent, DialogDescription,DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
// Provider logo
import logoBni from "@/assets/providers/BNI.png";
import logoDana from "@/assets/providers/Dana.png";
import logoGopay from "@/assets/providers/Gopay.png";
import logoMandiri from "@/assets/providers/Mandiri.png";
import logoOvo from "@/assets/providers/OVO.png";
import logoBca from "@/assets/providers/BCA.png";

const withdrawMethods = [
  { id: "bank", name: "Transfer Bank", icon: Building2, fee: "Rp 2.500" },
  { id: "ewallet", name: "E-Wallet", icon: CreditCard, fee: "Gratis" },
];


// Dummy account traveler
interface PayoutAccount {
  id: number;
  payout_type: "bank" | "e_wallet";
  provider: string;
  account_name: string;
  account_number: string;
  is_default: boolean;
}

const providerLabels: Record<string, string> = {
  bca: "BCA", bni: "BNI", mandiri: "Mandiri",
  ovo: "OVO", dana: "DANA", gopay: "GoPay",
};

const bankProviders = ["bca", "bni", "mandiri"];
const ewalletProviders = ["ovo", "dana", "gopay"];

export default function TravelerWallet() {
  const navigate = useNavigate();
  const { toast } = useToast();
  type WithdrawStatus = "PENDING" | "APPROVED" | "REJECTED";


const providerLogos: Record<string, string> = {
  bca: logoBca,
  bni: logoBni,
  mandiri: logoMandiri,
  ovo: logoOvo,
  dana: logoDana,
  gopay: logoGopay,
};

const [selectedMethod, setSelectedMethod] = useState("");
const [amount, setAmount] = useState("");
const [accountNumber, setAccountNumber] = useState("");
const [submitted, setSubmitted] = useState(false);
const [withdrawRequests, setWithdrawRequests] = useState<any[]>([]);

const [showAddAccount, setShowAddAccount] = useState(false);
const [deleteAccount, setDeleteAccount] = useState<PayoutAccount | null>(null);
const [addForm, setAddForm] = useState({ payout_type: "bank" as "bank" | "e_wallet", provider: "", account_name: "", account_number: "" });
const [walletData, setWalletData] = useState({ balance: 0, totalIncome: 0, totalWithdraw: 0 });
const [incomeList, setIncomeList] = useState<any[]>([]);
const { balance, totalIncome, totalWithdraw } = walletData;

useEffect(() => {
  api.get("/traveler/wallet").then(res => {
    setWalletData(res.data.data ?? { balance: 0, totalIncome: 0, totalWithdraw: 0 });
  }).catch(() => {});
}, []);

useEffect(() => {
  api.get("/traveler/wallet/income").then(res => {
    setIncomeList(res.data.data ?? []);
  }).catch(() => {});
}, []);

useEffect(() => {
  api.get("/traveler/wallet/withdraws").then(res => {
    const raw = res.data.data?.data ?? res.data.data ?? [];
    setWithdrawRequests(Array.isArray(raw) ? raw : []);
  }).catch(() => {});
}, []);

// ======================

const numAmount = Number(amount) || 0;

// payout account
const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
const [loadingAccounts, setLoadingAccounts] = useState(false);

const [accountPage, setAccountPage] = useState(0);
const accountsPerPage = 3;
const totalAccountPages = Math.ceil(accounts.length / accountsPerPage);
const pagedAccounts = accounts.slice(accountPage * accountsPerPage, (accountPage + 1) * accountsPerPage);

const fetchAccounts = async () => {
  setLoadingAccounts(true);
  try {
    const res = await api.get("/traveler/payout-accounts");
    setAccounts(res.data.data ?? []);
  } catch {
    toast({ title: "Gagal memuat rekening", variant: "destructive" });
  } finally {
    setLoadingAccounts(false);
  }
};

useEffect(() => {
  fetchAccounts();
}, []);

// Payment account
const handleAddAccount = async () => {
  try {
    await api.post("/traveler/payout-accounts", addForm);
    toast({ title: "Rekening berhasil ditambahkan" });
    setShowAddAccount(false);
    setAddForm({ payout_type: "bank", provider: "", account_name: "", account_number: "" });
    fetchAccounts();
  } catch (err: any) {
    toast({
      title: err.response?.data?.message ?? "Gagal menambah rekening",
      variant: "destructive",
    });
  }
};

const handleDeleteAccount = async () => {
  if (!deleteAccount) return;
  try {
    await api.delete(`/traveler/payout-accounts/${deleteAccount.id}`);
    toast({ title: "Rekening berhasil dihapus" });
    fetchAccounts();
  } catch (err: any) {
    toast({
      title: err.response?.data?.message ?? "Gagal menghapus rekening",
      variant: "destructive",
    });
  } finally {
    setDeleteAccount(null);
  }
};

const handleSetDefault = async (id: number) => {
  try {
    await api.patch(`/traveler/payout-accounts/${id}/default`);
    toast({ title: "Rekening utama berhasil diubah" });
    fetchAccounts();
  } catch {
    toast({ title: "Gagal mengubah rekening utama", variant: "destructive" });
  }
};

  return (
    <DashboardLayout role="traveler">
      <div className="p-6 md:p-8 lg:p-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-lg bg-primary/10 p-2">
                <Wallet className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                  Saldo Saya
                </h1>
                <p className="text-sm text-muted-foreground">
                  Kelola saldo dan riwayat transaksi Anda
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* SALDO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-6 text-accent-foreground relative overflow-hidden"
          >

            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <Wallet className="h-8 w-8" />
                <span className="text-lg font-medium">Saldo Anda</span>
              </div>

             <p className="text-4xl font-bold">
              Rp {balance.toLocaleString("id-ID")}
            </p>

              <p className="mt-2 text-sm flex items-center gap-1 text-accent-foreground/80">
                <TrendingUp className="h-4 w-4" />
                Tersedia untuk ditarik
              </p>
            </div>
          </motion.div>

          {/* RINGKASAN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-card p-4 shadow-card hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10 text-success">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Pendapatan</p>
                  <p className="font-semibold text-foreground">
                    Rp {totalIncome.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

                        <div className="rounded-xl bg-card p-4 shadow-card hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10 text-warning">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sudah Ditarik</p>
                  <p className="font-semibold text-foreground">
                    Rp {totalWithdraw.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

                        <div className="rounded-xl bg-card p-4 shadow-card hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Saldo Tersedia</p>
                  <p className="font-semibold text-foreground">
                    Rp {balance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BUTTON AKSI */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/traveler/tariksaldo")}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Tarik Saldo
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/traveler/riwayatsaldo")}
            >
              <History className="h-5 w-5 mr-2" />
              Lihat Riwayat
            </Button>
          </div>

          {/* WRAPPER DESKTOP 2 KOLOM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* RIWAYAT PENARIKAN TERBARU */}
          <div className="rounded-2xl bg-card p-6 shadow-card flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Penarikan Terakhir
              </h2>
              <button
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition group"
            onClick={() => navigate("/traveler/riwayatsaldo", { state: { filter: "withdraw" } })}
          >
            Lihat Semua
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
            </div>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {withdrawRequests.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada penarikan
            </p>
          )}
              {withdrawRequests.slice(0, 3).map((wd: any) => (
                <div key={wd.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted transition">
                  <div>
                    <p className="font-medium">Rp {Number(wd.amount).toLocaleString("id-ID")}</p>
                    <p className="text-xs text-muted-foreground">
                      {wd.payout_account?.provider?.toUpperCase() ?? "—"} • {new Date(wd.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    wd.withdraw_status === "pending" ? "bg-warning/15 text-warning" :
                    ["approved", "paid"].includes(wd.withdraw_status) ? "bg-success/15 text-success" :
                    "bg-destructive/15 text-destructive"
                  }`}>
                    {wd.withdraw_status?.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* REKENING PEMBAYARAN */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Rekening Pembayaran</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Rekening untuk menerima pembayaran dari customer
                </p>
              </div>
              <Button size="sm" onClick={() => setShowAddAccount(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Tambah
              </Button>
            </div>

            {loadingAccounts ? (
              <div className="py-8 text-center text-muted-foreground animate-pulse">Memuat rekening...</div>
            ) : accounts.length === 0 ? (
              <div className="py-8 text-center">
                <CreditCard className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Belum ada rekening</p>
                <p className="text-xs text-muted-foreground mt-1">Tambahkan rekening agar customer bisa membayar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pagedAccounts.map((acc) => {
                  const logo = providerLogos[acc.provider];
                  return (
                    <div
                      key={acc.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        acc.is_default
                          ? "border-primary/30 bg-primary/5"
                          : "border-zinc-100 bg-zinc-50/50 hover:border-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-zinc-100 overflow-hidden">
                          {logo ? (
                            <img src={logo} alt={acc.provider} className="h-7 w-7 object-contain" />
                          ) : (
                            <CreditCard className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{providerLabels[acc.provider] ?? acc.provider.toUpperCase()}</p>
                            {acc.is_default && (
                              <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                <Star className="h-3 w-3" /> Utama
                              </span>
                            )}
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              acc.payout_type === "bank" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                            }`}>
                              {acc.payout_type === "bank" ? "Bank" : "E-Wallet"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {acc.account_name} · {acc.account_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!acc.is_default && (
                          <button onClick={() => handleSetDefault(acc.id)} title="Jadikan utama"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-amber-50 hover:text-amber-600 transition">
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => setDeleteAccount(acc)} title="Hapus"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalAccountPages > 1 && (
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setAccountPage((p) => Math.max(0, p - 1))}
                      disabled={accountPage === 0}
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {accountPage + 1} / {totalAccountPages}
                    </span>
                    <button
                      onClick={() => setAccountPage((p) => Math.min(totalAccountPages - 1, p + 1))}
                      disabled={accountPage === totalAccountPages - 1}
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PENDAPATAN TERBARU */}
          <div className="rounded-2xl bg-card p-6 shadow-card flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Pendapatan Terbaru
              </h2>
              <button
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition group"
            onClick={() => navigate("/traveler/riwayatsaldo", { state: { filter: "income" } })}
          >
            Lihat Semua
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
            </div>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {incomeList.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ x: 2 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted transition"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      + Rp {item.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.title}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.date}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* DIALOG: TAMBAH REKENING */}
      <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Tambah Rekening</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">Rekening bank atau e-wallet untuk menerima pembayaran</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Tipe</Label>
              <Select value={addForm.payout_type} onValueChange={(v: "bank" | "e_wallet") => setAddForm({ ...addForm, payout_type: v, provider: "" })}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Transfer Bank</SelectItem>
                  <SelectItem value="e_wallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Provider</Label>
              <Select value={addForm.provider} onValueChange={(v) => setAddForm({ ...addForm, provider: v })}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200"><SelectValue placeholder="Pilih provider" /></SelectTrigger>
                <SelectContent>
                  {(addForm.payout_type === "bank" ? bankProviders : ewalletProviders).map((p) => (
                    <SelectItem key={p} value={p}>{providerLabels[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Nama Pemilik</Label>
              <Input placeholder="Nama sesuai rekening" value={addForm.account_name}
                onChange={(e) => setAddForm({ ...addForm, account_name: e.target.value })}
                className="h-10 rounded-xl border-zinc-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                {addForm.payout_type === "bank" ? "Nomor Rekening" : "Nomor HP / ID"}
              </Label>
              <Input placeholder={addForm.payout_type === "bank" ? "1234567890" : "08xxxxxxxxxx"}
                value={addForm.account_number}
                onChange={(e) => setAddForm({ ...addForm, account_number: e.target.value })}
                className="h-10 rounded-xl border-zinc-200" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddAccount(false)} className="flex-1">Batal</Button>
            <Button onClick={handleAddAccount} disabled={!addForm.provider || !addForm.account_name || !addForm.account_number} className="flex-1">
              Tambah Rekening
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: HAPUS REKENING */}
      <Dialog open={!!deleteAccount} onOpenChange={() => setDeleteAccount(null)}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-lg">Hapus Rekening?</h3>
              <p className="text-sm text-zinc-500 mt-1">
                <span className="font-semibold text-zinc-800">
                  {providerLabels[deleteAccount?.provider ?? ""] ?? deleteAccount?.provider?.toUpperCase()} · {deleteAccount?.account_number}
                </span> akan dihapus.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteAccount(null)} className="flex-1">Batal</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} className="flex-1">Ya, Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}