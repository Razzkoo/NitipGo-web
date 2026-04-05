import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CreditCard, Wallet, CheckCircle } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/context/OrderContext";

const BANKS = ["BCA", "BNI", "BRI", "Mandiri"];
const EWALLETS = ["DANA", "GoPay", "SeaBank"];

export default function OrderPayment() {
  const { id } = useParams();

  const [method, setMethod] = useState<"bank" | "ewallet" | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useOrders();

const order = orders.find((o) => o.id === id);

if (!order) {
  return (
    <DashboardLayout role="customer">
      <div className="p-6">Order tidak ditemukan</div>
    </DashboardLayout>
  );
}
  const [showConfirm, setShowConfirm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const isValidAccount = () => {
  if (method === "bank") return accountNumber.length >= 8;
  if (method === "ewallet") return accountNumber.length >= 10;
  return false;
};

  return (
    <DashboardLayout role="customer">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/orders"
            className="flex items-center gap-2 text-sm text-muted-foreground mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Order Aktif
          </Link>

          <h1 className="text-2xl font-bold">Pembayaran Order</h1>
          <p className="text-muted-foreground mt-1">
            Selesaikan pembayaran agar order dapat diproses traveler
          </p>
        </motion.div>

        {/* CONTENT */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="md:col-span-2 space-y-6">
            {/* ORDER SUMMARY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-card p-5 shadow-card"
            >
              <h2 className="font-semibold mb-3">Ringkasan Order</h2>

              <div className="text-sm space-y-1 text-muted-foreground">
                <p>ID Order: <span className="text-foreground font-medium">{id}</span></p>
                <p>Barang: {order.item}</p>
                <p>Rute: {order.from} → {order.to}</p>
                <p>Titik Temu: {order.meetingPoint}</p>
                <span>{order.price}</span>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Pembayaran</span>
                <span className="text-xl font-bold text-primary">Rp 120.000</span>
              </div>
            </motion.div>

            {/* PAYMENT METHOD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl bg-card p-5 shadow-card"
            >
              <h2 className="font-semibold mb-4">Metode Pembayaran</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* BANK */}
                <button
                  onClick={() => {
                setMethod("bank");
                setSelected(null);
                setAccountNumber("");
                }}
                  className={`rounded-xl border p-4 text-left transition ${
                    method === "bank"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Transfer Bank</p>
                      <p className="text-sm text-muted-foreground">
                        BCA, BNI, BRI, Mandiri
                      </p>
                    </div>
                  </div>
                </button>

                {/* EWALLET */}
                <button
                  onClick={() => {
                    setMethod("ewallet");
                    setSelected(null);
                    setAccountNumber("");
                }}
                  className={`rounded-xl border p-4 text-left transition ${
                    method === "ewallet"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">E-Wallet</p>
                      <p className="text-sm text-muted-foreground">
                        DANA, GoPay, SeaBank
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* DROPDOWN */}
              <AnimatePresence>
                {method && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 border rounded-xl p-4"
                  >
                    <p className="text-sm font-medium mb-3">
                      Pilih {method === "bank" ? "Bank" : "E-Wallet"}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
  {(method === "bank" ? BANKS : EWALLETS).map((item) => (
    <button
      key={item}
      onClick={() => setSelected(item)}
      className={`rounded-lg border p-3 text-sm font-medium transition ${
        selected === item
          ? "border-primary bg-primary/10"
          : "hover:bg-muted"
      }`}
    >
      {item}
    </button>
  ))}
                    </div>

                    {selected && (
                      <div className="mt-4">
                        <label className="text-sm font-medium">
                          {method === "bank"
                            ? "Nomor Rekening"
                            : "Nomor HP E-Wallet"}
                        </label>
                        
                        <AnimatePresence>
  {error && (
    <motion.p
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-2 text-xs text-red-500"
    >
      {error}
    </motion.p>
  )}
</AnimatePresence>

                        <input
                          type="text"
                          placeholder={
                            method === "bank"
                              ? "Masukkan nomor rekening"
                              : "Masukkan nomor HP terdaftar"
                          }
                          value={accountNumber}
                         onChange={(e) => { const value = e.target.value.replace(/\D/g, ""); setAccountNumber(value); setError(""); }}
                          className="mt-2 w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />

                        <p className="mt-1 text-xs text-muted-foreground">
                          Pastikan data yang kamu masukkan sudah benar
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-card p-5 shadow-card h-fit"
          >
            <h3 className="font-semibold mb-3">Konfirmasi</h3>

            <div className="text-sm text-muted-foreground space-y-1 mb-4">
              <p>Metode: <span className="text-foreground">{method ?? "-"}</span></p>
              <p>Penyedia: <span className="text-foreground">{selected ?? "-"}</span></p>
              <p>
  {method === "bank" ? "No Rekening" : "No HP"}:{" "}
  <span className="text-foreground">
    {accountNumber || "-"}
  </span>
</p>
            </div>

             <Button
  onClick={() => {
    if (!isValidAccount()) {
      setError(
        method === "bank"
          ? "Nomor rekening minimal 8 digit"
          : "Nomor HP minimal 10 digit"
      );
      return;
    }
    setShowConfirm(true);
  }}
  disabled={!method || !selected || !accountNumber}
  className="w-full flex items-center gap-2"
>
    <CheckCircle className="h-4 w-4" />
  Bayar Sekarang
            </Button>

            <p className="text-xs text-muted-foreground mt-3 text-center">
              Dengan melanjutkan, kamu menyetujui proses pembayaran
            </p>
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
  {showConfirm && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-lg"
      >
        <h3 className="font-semibold text-lg mb-4">Konfirmasi Pembayaran</h3>

{/* RINGKASAN ORDER */}
<div className="text-sm text-muted-foreground space-y-1 mb-5">
  <p>ID Order: <b>{id}</b></p>
  <p>Barang: <b>Titip Beli Parfum Zara</b></p>
  <p>Rute: <b>Jakarta → Semarang</b></p>
  <p>Titik Temu: <b>Mall Grand Indonesia</b></p>
</div>

<hr className="my-4 border-muted-foreground/40" />

{/* INFORMASI PEMBAYARAN */}
<div className="text-sm text-muted-foreground space-y-1 mb-5">
  <p>Metode: <b>{method}</b></p>
  <p>Penyedia: <b>{selected}</b></p>
  <p>
    {method === "bank" ? "No Rekening" : "No HP"}:{" "}
    <b>{accountNumber}</b>
  </p>
</div>

{/* TOTAL PEMBAYARAN */}
<div className="flex justify-between items-center bg-primary/10 rounded-xl p-4">
  <span className="font-medium">Total Pembayaran</span>
  <span className="font-bold text-primary text-lg">Rp 120.000</span>
</div>

{/* BUTTON */}
<div className="flex gap-3 mt-5">
  <Button
    variant="outline"
    className="flex-1"
    onClick={() => setShowConfirm(false)}
  >
    Batal
  </Button>

 <Button
  className="flex-1"
  onClick={() => {
    if (order.status !== "waiting_payment") return;
    updateOrderStatus(id!, "pending", "Menunggu Konfirmasi Traveler");

    setShowConfirm(false);
    setPaymentSuccess(true);

    setTimeout(() => {
      navigate("/orders");
    }, 1200);
  }}
>
  Konfirmasi Bayar
</Button>
</div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
<AnimatePresence>
  {paymentSuccess && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-5 right-5 z-50 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl shadow-lg"
    >
      Pembayaran berhasil! Status order telah diperbarui.
      <button
        className="ml-3 font-bold"
        onClick={() => setPaymentSuccess(false)}
      >
        ✕
      </button>
    </motion.div>
  )}
</AnimatePresence>
    </DashboardLayout>
  );
}