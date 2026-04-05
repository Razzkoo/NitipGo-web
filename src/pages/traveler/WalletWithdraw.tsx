import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Wallet, Landmark, Smartphone,
  Info, ArrowRight, CheckCircle2, Clock,
  Shield, AlertCircle, Eye, EyeOff,
  Banknote, X, Check, TrendingUp, Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MethodId = "bank" | "ewallet";

const QUICK_AMOUNTS = [50_000, 100_000, 250_000, 500_000, 1_000_000, 2_000_000];
const BANKS    = ["BCA", "BNI", "BRI", "Mandiri", "BSI", "CIMB Niaga", "Danamon"];
const EWALLETS = ["Dana", "OVO", "GoPay", "ShopeePay", "LinkAja"];

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease, delay } },
  exit:    { opacity: 0, y: 10, transition: { duration: 0.2 } },
});
const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, delay } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
});

function SummaryRow({ label, value, accent, large }: { label: string; value: string; accent?: string; large?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={cn("font-semibold text-gray-800", large && "text-lg", accent)}>{value}</span>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150",
        active ? "bg-primary text-white border-primary shadow-sm" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300",
      )}
    >{children}</button>
  );
}

export default function TarikSaldo() {
  const navigate  = useNavigate();
  const { toast } = useToast();

  const saldo = 5_200_000 - 2_700_000; // mirror wallet page

  const [method,       setMethod]       = useState<MethodId | null>(null);
  const [account,      setAccount]      = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [amount,       setAmount]       = useState("");
  const [pin,          setPin]          = useState("");
  const [showPin,      setShowPin]      = useState(false);
  const [step,         setStep]         = useState<"form" | "confirm" | "success">("form");
  const [processing,   setProcessing]   = useState(false);

  const numericAmount  = Number(amount.replace(/\D/g, "")) || 0;
  const fee            = method === "bank" ? 2_500 : 0;
  const receivedAmount = numericAmount - fee;
  const isValidAmount  = numericAmount >= 50_000 && numericAmount <= saldo;
  const isFormValid    = !!(method && account && selectedBank && isValidAmount && pin.length === 6);

  const formatAmount = (val: string) => {
    const num = val.replace(/\D/g, "");
    setAmount(num ? Number(num).toLocaleString("id-ID") : "");
  };
  const handleSelectMethod = (m: MethodId) => { setMethod(m); setAccount(""); setSelectedBank(""); };
  const handleSubmit = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1600));
    setProcessing(false);
    setStep("success");
    toast({ title: "Permintaan Terkirim", description: "Menunggu persetujuan admin." });
  };
  const resetForm = () => { setMethod(null); setAccount(""); setSelectedBank(""); setAmount(""); setPin(""); setStep("form"); };

  return (
    <DashboardLayout role="traveler">
      <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-700 transition-all shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-none">Tarik Saldo</h1>
            <p className="text-sm text-gray-400 mt-0.5">Cairkan saldo ke rekening atau e-wallet</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* SUCCESS */}
          {step === "success" && (
            <motion.div key="success" {...fadeUp(0)} className="max-w-lg mx-auto">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500" />
                <div className="p-10 text-center space-y-6">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.1 }} className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  </motion.div>
                  <motion.div {...fadeUp(0.2)}>
                    <h2 className="text-2xl font-bold text-gray-900">Permintaan Terkirim!</h2>
                    <p className="text-gray-400 mt-1">Menunggu persetujuan admin — maks. 1×24 jam</p>
                  </motion.div>
                  <motion.div {...fadeUp(0.3)} className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-3 text-left">
                    <SummaryRow label="Jumlah Tarik" value={"Rp " + numericAmount.toLocaleString("id-ID")} />
                    <SummaryRow label="Biaya Admin" value={fee > 0 ? "Rp " + fee.toLocaleString("id-ID") : "Gratis"} />
                    <div className="border-t border-gray-100 pt-3">
                      <SummaryRow label="Dana Diterima" value={"Rp " + receivedAmount.toLocaleString("id-ID")} accent="text-emerald-600" large />
                    </div>
                    <SummaryRow label="Tujuan" value={selectedBank + " — " + account} />
                  </motion.div>
                  <motion.div {...fadeUp(0.4)} className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl h-12 border-gray-200 font-semibold" onClick={() => navigate(-1)}>Ke Dompet</Button>
                    <Button className="flex-1 rounded-xl h-12 bg-primary font-semibold" onClick={resetForm}>Tarik Lagi</Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* FORM — 2 column desktop */}
          {step === "form" && (
            <motion.div key="form" {...fadeIn(0)} className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

              {/* LEFT 3/5 */}
              <div className="lg:col-span-3 space-y-4">

                {/* Saldo card */}
                <motion.div {...fadeUp(0.05)} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-7 text-accent-foreground shadow-md">
                  <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2 opacity-75"><Shield className="h-4 w-4" /><span className="text-sm font-medium">Saldo Tersedia</span></div>
                      <p className="text-4xl font-bold tracking-tight">Rp {saldo.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-1.5 mt-3 opacity-70"><TrendingUp className="h-3.5 w-3.5" /><span className="text-xs">Siap dicairkan kapan saja</span></div>
                    </div>
                    <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15"><Wallet className="h-8 w-8" /></div>
                  </div>
                </motion.div>

                {/* Step 1 */}
                <motion.div {...fadeUp(0.1)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                    <h2 className="font-bold text-gray-900">Pilih Metode</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { id: "bank" as MethodId, label: "Rekening Bank", sub: "BCA, BNI, BRI, dll", icon: Landmark, feeLabel: "Biaya Rp 2.500", feeColor: "text-amber-600 bg-amber-50" },
                      { id: "ewallet" as MethodId, label: "E-Wallet", sub: "Dana, OVO, GoPay", icon: Smartphone, feeLabel: "Gratis", feeColor: "text-emerald-600 bg-emerald-50" },
                    ]).map(({ id, label, sub, icon: Icon, feeLabel, feeColor }) => {
                      const active = method === id;
                      return (
                        <motion.button key={id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => handleSelectMethod(id)}
                          className={cn("relative rounded-xl border p-5 text-left transition-all duration-200", active ? "border-primary bg-primary/5 shadow-sm" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/80")}
                        >
                          {active && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
                              <Check className="h-3 w-3 text-white" />
                            </motion.span>
                          )}
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors", active ? "bg-primary/10" : "bg-gray-100")}>
                            <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-gray-500")} />
                          </div>
                          <p className="font-semibold text-gray-900 leading-snug">{label}</p>
                          <p className="text-xs text-gray-400 mt-0.5 mb-3">{sub}</p>
                          <span className={cn("inline-block text-xs font-semibold px-2.5 py-1 rounded-full", feeColor)}>{feeLabel}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Step 2 */}
                <AnimatePresence>
                  {method && (
                    <motion.div key="account" {...fadeUp(0)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                        <h2 className="font-bold text-gray-900">Detail Rekening</h2>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{method === "bank" ? "Pilih Bank" : "Pilih E-Wallet"}</p>
                        <div className="flex flex-wrap gap-2">
                          {(method === "bank" ? BANKS : EWALLETS).map(b => <Chip key={b} active={selectedBank === b} onClick={() => setSelectedBank(b)}>{b}</Chip>)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{method === "bank" ? "Nomor Rekening" : "Nomor HP / Akun"}</p>
                        <Input className="h-12 rounded-xl border-gray-200 bg-gray-50 text-sm font-medium" placeholder={method === "bank" ? "Contoh: 1234567890" : "08xxxxxxxxxx"} value={account} onChange={e => setAccount(e.target.value)} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 3 */}
                <AnimatePresence>
                  {method && (
                    <motion.div key="amount" {...fadeUp(0)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                        <h2 className="font-bold text-gray-900">Nominal Penarikan</h2>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nominal Cepat</p>
                        <div className="flex flex-wrap gap-2">
                          {QUICK_AMOUNTS.filter(a => a <= saldo).map(a => (
                            <Chip key={a} active={numericAmount === a} onClick={() => setAmount(a.toLocaleString("id-ID"))}>
                              {a >= 1_000_000 ? (a / 1_000_000) + "Jt" : (a / 1_000) + "Rb"}
                            </Chip>
                          ))}
                          <Chip active={numericAmount === saldo} onClick={() => setAmount(saldo.toLocaleString("id-ID"))}>Semua</Chip>
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-gray-400">Rp</span>
                        <Input type="text"
                          className={cn("pl-12 h-14 rounded-xl text-xl font-bold border-gray-200 bg-gray-50 transition-all",
                            amount && !isValidAmount && "border-rose-300 bg-rose-50/60",
                            isValidAmount && "border-emerald-300 bg-emerald-50/30")}
                          placeholder="0" value={amount} onChange={e => formatAmount(e.target.value)}
                        />
                        {amount && <button onClick={() => setAmount("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X className="h-4 w-4" /></button>}
                      </div>
                      <AnimatePresence>
                        {amount && !isValidAmount && (
                          <motion.p {...fadeUp(0)} className="text-xs text-rose-500 flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />{numericAmount < 50_000 ? "Minimal penarikan Rp 50.000" : "Melebihi saldo tersedia"}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-600">
                        <Info className="h-4 w-4 shrink-0" /><span>Minimal Rp 50.000 · Diproses maksimal 1×24 jam kerja</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 4 */}
                <AnimatePresence>
                  {method && isValidAmount && account && selectedBank && (
                    <motion.div key="pin" {...fadeUp(0)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">4</span>
                        <div><h2 className="font-bold text-gray-900">PIN Keamanan</h2><p className="text-xs text-gray-400 mt-0.5">Masukkan PIN 6 digit untuk konfirmasi</p></div>
                      </div>
                      <div className="relative">
                        <Input type={showPin ? "text" : "password"} maxLength={6} className="h-12 rounded-xl border-gray-200 bg-gray-50 tracking-[0.4em] text-xl font-bold pr-12" placeholder="......" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} />
                        <button onClick={() => setShowPin(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                          {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="flex gap-1.5">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <motion.div key={i} animate={{ backgroundColor: i < pin.length ? "var(--primary, #6366f1)" : "#e5e7eb" }} transition={{ duration: 0.15 }} className="h-2 flex-1 rounded-full" />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RIGHT 2/5 sticky */}
              <div className="lg:col-span-2 lg:sticky lg:top-6 space-y-4">
                <motion.div {...fadeUp(0.12)} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-100 px-6 py-4"><h2 className="font-bold text-gray-900">Ringkasan</h2></div>
                  <div className="p-6 space-y-4">
                    {[["Metode", method === "bank" ? "Transfer Bank" : method === "ewallet" ? "E-Wallet" : null], ["Tujuan", selectedBank || null], ["No. Akun", account || null]].map(([label, value]) => (
                      <div key={label as string} className="flex justify-between">
                        <span className="text-sm text-gray-400">{label}</span>
                        <span className={cn("text-sm font-semibold", value ? "text-gray-700" : "text-gray-200")}>{value ?? "—"}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <SummaryRow label="Jumlah Tarik" value={numericAmount > 0 ? "Rp " + numericAmount.toLocaleString("id-ID") : "—"} />
                      <SummaryRow label="Biaya Admin" value={method ? (fee > 0 ? "Rp " + fee.toLocaleString("id-ID") : "Gratis") : "—"} accent={fee === 0 && !!method ? "text-emerald-600" : undefined} />
                    </div>
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Dana Diterima</p>
                      <AnimatePresence mode="wait">
                        <motion.p key={receivedAmount} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }}
                          className={cn("text-3xl font-bold", isValidAmount ? "text-emerald-600" : "text-gray-200")}>
                          {isValidAmount ? "Rp " + receivedAmount.toLocaleString("id-ID") : "Rp —"}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <Button className={cn("w-full h-12 rounded-xl text-base font-bold transition-all duration-200", isFormValid ? "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20" : "bg-gray-100 text-gray-400 cursor-not-allowed")} disabled={!isFormValid} onClick={() => setStep("confirm")}>
                      <Banknote className="h-5 w-5 mr-2" />Lanjutkan{isFormValid && <ArrowRight className="h-4 w-4 ml-2" />}
                    </Button>
                    <div className="pt-1 space-y-2.5 border-t border-gray-50">
                      {[
                        { label: "Pilih metode", done: !!method },
                        { label: "Isi detail rekening", done: !!(account && selectedBank) },
                        { label: "Masukkan nominal", done: isValidAmount },
                        { label: "Masukkan PIN", done: pin.length === 6 },
                      ].map(({ label, done }) => (
                        <div key={label} className="flex items-center gap-2.5">
                          <motion.div animate={{ backgroundColor: done ? "#10b981" : "#e5e7eb" }} transition={{ duration: 0.3 }} className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                            {done && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}><Check className="h-2.5 w-2.5 text-white" /></motion.div>}
                          </motion.div>
                          <span className={cn("text-xs transition-colors duration-300", done ? "text-gray-600 font-medium" : "text-gray-300")}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div {...fadeUp(0.18)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center"><Zap className="h-3.5 w-3.5 text-blue-500" /></div>
                    <h3 className="text-sm font-bold text-gray-700">Info Penarikan</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-400 leading-relaxed">
                    <li>Minimal penarikan <span className="font-semibold text-gray-600">Rp 50.000</span></li>
                    <li>Biaya admin bank <span className="font-semibold text-gray-600">Rp 2.500</span>, e-wallet <span className="font-semibold text-gray-600">gratis</span></li>
                    <li>Diproses maksimal <span className="font-semibold text-gray-600">1×24 jam kerja</span></li>
                    <li>Dana masuk setelah disetujui admin</li>
                  </ul>
                </motion.div>
              </div>

            </motion.div>
          )}

          {/* CONFIRM */}
          {step === "confirm" && (
            <motion.div key="confirm" {...fadeUp(0)} className="max-w-lg mx-auto">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary/60 to-primary" />
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Konfirmasi Penarikan</h2>
                    <button onClick={() => setStep("form")} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {[
                      ["Metode", method === "bank" ? "Transfer Bank" : "E-Wallet"],
                      ["Tujuan", selectedBank],
                      ["Nomor Akun", account],
                      ["Jumlah Tarik", "Rp " + numericAmount.toLocaleString("id-ID")],
                      ["Biaya Admin", fee > 0 ? "Rp " + fee.toLocaleString("id-ID") : "Gratis"],
                      ["Dana Diterima", "Rp " + receivedAmount.toLocaleString("id-ID")],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center py-3.5">
                        <span className="text-sm text-gray-400">{label}</span>
                        <span className={cn("text-sm font-semibold text-gray-800", label === "Dana Diterima" && "text-emerald-600 text-lg")}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Penarikan tidak dapat dibatalkan setelah dikonfirmasi. Pastikan data sudah benar.</span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl border-gray-200 font-semibold" onClick={() => setStep("form")}>Kembali Edit</Button>
                    <Button className="flex-1 h-12 rounded-xl bg-primary font-bold" onClick={handleSubmit} disabled={processing}>
                      {processing ? (
                        <span className="flex items-center gap-2">
                          <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} className="inline-flex"><Clock className="h-4 w-4" /></motion.span>
                          Memproses...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Ya, Konfirmasi</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}