import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, CreditCard, Building2, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CountUp } from "@/components/ui/CountUp";

const withdrawMethods = [
  { id: "bank", name: "Transfer Bank", icon: Building2, fee: "Rp 2.500" },
  { id: "ewallet", name: "E-Wallet", icon: CreditCard, fee: "Gratis" },
];

export default function TravelerWallet() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const balance = 2500000;
  const numAmount = parseInt(amount) || 0;
  const isValidAmount = numAmount >= 50000 && numAmount <= balance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Withdrawal:", { method: selectedMethod, amount, accountNumber });
    toast({
      title: "Penarikan Diproses",
      description: "Dana akan masuk ke rekening Anda dalam 1x24 jam.",
    });
    setSubmitted(true);
  };

  return (
    <DashboardLayout role="traveler">
      <div className="p-6 md:p-8 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Saldo & Penarikan</h1>
          <p className="text-muted-foreground mt-1">Kelola saldo dan tarik penghasilan Anda</p>
        </motion.div>

        <div className="max-w-xl mx-auto space-y-6">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-6 text-accent-foreground relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="h-8 w-8" />
                <span className="text-lg font-medium">Saldo Anda</span>
              </div>
              <p className="text-4xl font-bold">
                Rp <CountUp end={balance} duration={1500} />
              </p>
              <p className="text-accent-foreground/70 mt-2 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Tersedia untuk ditarik
              </p>
            </div>
          </motion.div>

          {!submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-card p-6 shadow-card"
            >
              <h2 className="text-xl font-semibold text-foreground mb-6">Tarik Saldo</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Jumlah Penarikan</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                    <Input
                      id="amount"
                      type="number"
                      min="50000"
                      max={balance}
                      step="10000"
                      placeholder="100000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum Rp 50.000</p>
                  {amount && !isValidAmount && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {numAmount < 50000 ? "Minimum Rp 50.000" : "Melebihi saldo tersedia"}
                    </p>
                  )}
                </div>

                {/* Quick Amount */}
                <div className="flex gap-2 flex-wrap">
                  {[100000, 250000, 500000, 1000000].map((val) => (
                    <motion.div key={val} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="button"
                        variant={amount === val.toString() ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAmount(val.toString())}
                        disabled={val > balance}
                      >
                        Rp {(val / 1000)}rb
                      </Button>
                    </motion.div>
                  ))}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="button"
                      variant={amount === balance.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAmount(balance.toString())}
                    >
                      Semua
                    </Button>
                  </motion.div>
                </div>

                {/* Method */}
                <div className="space-y-3">
                  <Label>Metode Penarikan</Label>
                  {withdrawMethods.map((method) => (
                    <motion.label
                      key={method.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <method.icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{method.name}</p>
                        <p className="text-sm text-muted-foreground">Biaya: {method.fee}</p>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 transition-all ${selectedMethod === method.id ? "border-primary bg-primary" : "border-muted"}`}>
                        {selectedMethod === method.id && (
                          <CheckCircle className="h-full w-full text-primary-foreground" />
                        )}
                      </div>
                    </motion.label>
                  ))}
                </div>

                {/* Account */}
                {selectedMethod && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <Label htmlFor="accountNumber">
                      {selectedMethod === "bank" ? "Nomor Rekening" : "Nomor E-Wallet"}
                    </Label>
                    <Input
                      id="accountNumber"
                      placeholder={selectedMethod === "bank" ? "1234567890" : "08xxxxxxxxxx"}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="h-12"
                      required
                    />
                  </motion.div>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={!isValidAmount || !selectedMethod || !accountNumber}
                >
                  Tarik Rp {numAmount.toLocaleString()}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-card p-8 shadow-card text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20 mx-auto mb-6"
              >
                <CheckCircle className="h-10 w-10 text-success" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Penarikan Berhasil!
              </h2>
              <p className="text-muted-foreground mb-2">
                Rp {numAmount.toLocaleString()} sedang diproses ke {selectedMethod === "bank" ? "rekening bank" : "e-wallet"} Anda.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Estimasi waktu: 1x24 jam kerja
              </p>
              <Button variant="hero" onClick={() => navigate("/traveler")}>
                Kembali ke Dashboard
              </Button>
            </motion.div>
          )}

          {/* Transaction History */}
          {!submitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-card p-6 shadow-card"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Riwayat Penarikan</h2>
              <div className="space-y-3">
                {[
                  { date: "10 Feb 2024", amount: 500000, status: "success" },
                  { date: "25 Jan 2024", amount: 750000, status: "success" },
                  { date: "15 Jan 2024", amount: 300000, status: "success" },
                ].map((tx, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">Rp {tx.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{tx.date}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs font-medium">
                      Berhasil
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}