import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Package, MapPin, Calendar, Clock,
  Phone, Mail, User, CheckCircle, Loader2, ExternalLink,
  Star, Send, RefreshCw, XCircle,
} from "lucide-react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import logoBni from "@/assets/providers/BNI.png";
import logoDana from "@/assets/providers/Dana.png";
import logoGopay from "@/assets/providers/Gopay.png";
import logoMandiri from "@/assets/providers/Mandiri.png";
import logoOvo from "@/assets/providers/OVO.png";
import logoBca from "@/assets/providers/BCA.png";

const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

function getAvatar(photo: string | null, name: string) {
  if (photo) return `${BASE_URL}/storage/${photo}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
}

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatRupiah(v: string | number | null) {
  if (!v) return "Rp 0";
  return "Rp " + Number(v).toLocaleString("id-ID");
}

const statusLabel: Record<string, string> = {
  pending: "Menunggu Konfirmasi Traveler",
  on_progress: "Sedang Diproses",
  on_the_way: "Dalam Perjalanan",
  finished: "Selesai",
  cancelled: "Dibatalkan",
};

// Provider logo
const providerLogos: Record<string, string> = {
  bca: logoBca, bni: logoBni, mandiri: logoMandiri,
  ovo: logoOvo, dana: logoDana, gopay: logoGopay,
};

const providerLabels: Record<string, string> = {
  bca: "BCA", bni: "BNI", mandiri: "Mandiri",
  ovo: "OVO", dana: "DANA", gopay: "GoPay",
};

export default function CustomerOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  // Payment order
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);


  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customer/orders/${id}`);
      setOrder(res.data.data);
    } catch {
      toast({ title: "Gagal memuat order", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel order 
  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.patch(`/customer/orders/${id}/cancel`);
      toast({ title: "Order dibatalkan" });
      fetchOrder();
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal", variant: "destructive" });
    } finally {
      setCancelling(false);
      setCancelDialog(false);
    }
  };

  // Handle upload payment order
  const handleUploadPayment = async () => {
    if (!paymentFile) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("payment_proof", paymentFile);
      await api.post(`/customer/orders/${id}/payment`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({ title: "Bukti pembayaran berhasil diupload" });
      setPaymentFile(null);
      fetchOrder();
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  if (!order) {
    return (
      <CustomerLayout>
        <div className="p-6 text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Order tidak ditemukan</h2>
          <Button variant="outline" asChild><Link to="/orders">Kembali</Link></Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="p-6 md:p-8 lg:p-10">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-muted-foreground">{order.sku}</p>
              <h1 className="text-2xl font-bold">{order.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {order.order_type === "titip-beli" ? "Titip Beli" : "Kirim Barang"}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </motion.div>

          {/* Status Info */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className={`rounded-xl p-4 text-sm ${
              order.status === "pending" ? "bg-amber-50 text-amber-700" :
              order.status === "on_progress" ? "bg-violet-50 text-violet-700" :
              order.status === "on_the_way" ? "bg-sky-50 text-sky-700" :
              order.status === "finished" ? "bg-emerald-50 text-emerald-700" :
              "bg-red-50 text-red-700"
            }`}>
            {statusLabel[order.status] ?? order.status}
          </motion.div>

          {/* Route */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl bg-card p-5 shadow-card">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 mb-4">
              <div className="flex-1 text-center">
                <p className="text-xs text-muted-foreground">Dari</p>
                <p className="font-semibold">{order.trip?.city}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-center">
                <p className="text-xs text-muted-foreground">Ke</p>
                <p className="font-semibold">{order.trip?.destination}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Berangkat</p>
                  <p className="font-medium">{formatDate(order.trip?.departure_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Estimasi Tiba</p>
                  <p className="font-medium">{formatDate(order.trip?.estimated_arrival_at)}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detail Barang */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl bg-card p-5 shadow-card">
            <h3 className="font-semibold mb-3">Detail Barang</h3>

            {order.image && (
              <div className="mb-3 cursor-pointer" onClick={() => setPhotoOpen(true)}>
                <img src={`${BASE_URL}/storage/${order.image}`} alt={order.name}
                  className="w-full h-44 rounded-xl object-cover border hover:opacity-90 transition" />
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deskripsi</span>
                <span className="text-right max-w-[60%]">{order.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Berat</span>
                <span>{order.weight} kg</span>
              </div>
              {order.order_type === "titip-beli" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jumlah</span>
                    <span>{order.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harga Barang</span>
                    <span>{formatRupiah(order.item_price)}</span>
                  </div>
                </>
              )}
              {order.notes && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Catatan</span>
                  <span className="text-right max-w-[60%]">{order.notes}</span>
                </div>
              )}
            </div>

            {order.order_type === "kirim" && order.recipient_name && (
              <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">Penerima</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama</span>
                  <span>{order.recipient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telepon</span>
                  <span>{order.recipient_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alamat</span>
                  <span className="text-right max-w-[60%]">{order.destination_address}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Titik COD */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card p-5 shadow-card">
            <h3 className="font-semibold mb-3">Titik COD</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {order.collection_point && (
                <div className="p-3 rounded-xl border">
                  <p className="text-xs text-muted-foreground mb-1">Pengumpulan</p>
                  <p className="font-medium text-sm">{order.collection_point.name}</p>
                  <p className="text-xs text-muted-foreground">{order.collection_point.address}</p>
                  {order.collection_point.map_url && (
                    <a href={order.collection_point.map_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">
                      <ExternalLink className="h-3 w-3" /> Maps
                    </a>
                  )}
                </div>
              )}
              {order.pickup_point && (
                <div className="p-3 rounded-xl border">
                  <p className="text-xs text-muted-foreground mb-1">Pengambilan</p>
                  <p className="font-medium text-sm">{order.pickup_point.name}</p>
                  <p className="text-xs text-muted-foreground">{order.pickup_point.address}</p>
                  {order.pickup_point.map_url && (
                    <a href={order.pickup_point.map_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">
                      <ExternalLink className="h-3 w-3" /> Maps
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Traveler */}
          {order.traveler && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="rounded-2xl bg-card p-5 shadow-card">
              <h3 className="font-semibold mb-3">Traveler</h3>
              <div className="flex items-center gap-4">
                <img src={getAvatar(order.traveler.profile_photo, order.traveler.name)} alt=""
                  className="h-12 w-12 rounded-full bg-muted object-cover" />
                <div className="flex-1">
                  <p className="font-semibold">{order.traveler.name}</p>
                  <p className="text-sm text-muted-foreground">{order.traveler.city}</p>
                  <p className="text-sm text-muted-foreground">{order.traveler.phone}</p>
                </div>
                {order.traveler.phone && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`tel:${order.traveler.phone}`}><Phone className="h-4 w-4 mr-1" /> Hubungi</a>
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Harga */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl bg-primary/5 border border-primary/20 p-5">
            <h3 className="font-semibold mb-3">Rincian Harga</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biaya Pengiriman</span>
                <span>{formatRupiah(order.shipping_price)}</span>
              </div>
              {order.order_type === "titip-beli" && order.item_price && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga Barang</span>
                  <span>{formatRupiah(Number(order.item_price) * order.quantity)}</span>
                </div>
              )}
              <div className="border-t my-2" />
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-primary">{formatRupiah(order.price)}</span>
              </div>
            </div>
          </motion.div>

          {order.order_type === "titip-beli" && order.status === "on_progress" && order.price_confirmed && !order.paid_at && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-5 space-y-4">
              <div>
                <h3 className="font-bold text-amber-800 text-lg">Pembayaran Diperlukan</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Traveler sudah mengkonfirmasi harga barang. Silakan transfer dan upload bukti pembayaran.
                </p>
              </div>

              {/* Struk dari traveler */}
              {order.order_process?.receipt_photo && (
                <div>
                  <p className="text-xs font-semibold text-amber-800 mb-1">Struk Belanja dari Traveler</p>
                  <img
                    src={`${BASE_URL}/storage/${order.order_process.receipt_photo}`}
                    alt="Struk"
                    className="w-full h-40 rounded-lg object-cover border cursor-pointer hover:opacity-90"
                    onClick={() => setReceiptOpen(true)}
                  />
                  {order.order_process.price_notes && (
                    <p className="text-xs text-amber-600 mt-1">Catatan: {order.order_process.price_notes}</p>
                  )}
                </div>
              )}

              {/* Total */}
              <div className="rounded-lg bg-white p-3 border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Biaya Pengiriman</span>
                  <span>{formatRupiah(order.shipping_price)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Harga Barang (final)</span>
                  <span>{formatRupiah(Number(order.item_price) * order.quantity)}</span>
                </div>
                <div className="border-t my-2" />
                <div className="flex justify-between">
                  <span className="font-semibold">Total Bayar</span>
                  <span className="text-lg font-bold text-primary">{formatRupiah(order.price)}</span>
                </div>
              </div>

              {/* Rekening Traveler */}
              {order.traveler?.payout_accounts && order.traveler.payout_accounts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-amber-800">Transfer ke Rekening Traveler</p>
                  {order.traveler.payout_accounts.map((acc: any) => {
                    const logo = providerLogos[acc.provider];
                    return (
                      <div key={acc.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-100 overflow-hidden shrink-0">
                          {logo ? (
                            <img src={logo} alt={acc.provider} className="h-7 w-7 object-contain" />
                          ) : (
                            <span className="text-xs font-bold text-zinc-400">{(acc.provider ?? "").toUpperCase().slice(0, 3)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{providerLabels[acc.provider] ?? (acc.provider ?? "").toUpperCase()}</p>
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                              acc.payout_type === "bank" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                            }`}>
                              {acc.payout_type === "bank" ? "Bank" : "E-Wallet"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{acc.account_name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-mono font-bold">{acc.account_number}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upload Bukti */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-amber-800">Upload Bukti Transfer *</Label>
                <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-amber-300 bg-white cursor-pointer hover:border-amber-400 transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                  />
                  <Package className="h-5 w-5 text-amber-500" />
                  <span className="text-sm text-amber-700">
                    {paymentFile ? paymentFile.name : "Klik untuk upload bukti transfer"}
                  </span>
                </label>
              </div>

              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={uploading || !paymentFile}
                onClick={handleUploadPayment}
              >
                {uploading ? "Mengupload..." : "Upload Bukti Pembayaran"}
              </Button>
            </motion.div>
          )}

          {order.order_type === "titip-beli" && order.paid_at && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <p className="text-sm text-emerald-700 font-medium">Pembayaran berhasil. Traveler akan segera mengirim barang.</p>
              </div>
              {order.payment_proof && (
                <img
                  src={`${BASE_URL}/storage/${order.payment_proof}`}
                  alt="Bukti bayar"
                  className="w-full h-32 rounded-lg object-cover border mt-3 cursor-pointer"
                  onClick={() => setPhotoOpen(true)}
                />
              )}
            </motion.div>
          )}

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="flex items-center gap-3 flex-wrap">
            {order.status === "pending" && (
              <Button variant="destructive" onClick={() => setCancelDialog(true)}>
                <XCircle className="h-4 w-4 mr-1.5" /> Batalkan Order
              </Button>
            )}
            {order.status === "on_the_way" && (
              <Button asChild>
                <Link to={`/order/${order.id}/tracking`}>
                  <MapPin className="h-4 w-4 mr-1.5" /> Lihat Tracking
                </Link>
              </Button>
            )}
          </motion.div>
        </div>

        {/* Cancel Dialog */}
        <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Batalkan Order</DialogTitle>
              <DialogDescription>Yakin membatalkan order {order.sku}?</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setCancelDialog(false)}>Kembali</Button>
              <Button variant="destructive" className="flex-1" disabled={cancelling} onClick={handleCancel}>
                {cancelling ? "Memproses..." : "Ya, Batalkan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Photo Dialog */}
        {order.image && (
          <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
              <img src={`${BASE_URL}/storage/${order.image}`} alt={order.name} className="w-full object-contain" />
            </DialogContent>
          </Dialog>
        )}

        {order.order_process?.receipt_photo && (
          <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
              <img src={`${BASE_URL}/storage/${order.order_process.receipt_photo}`} alt="Struk" className="w-full object-contain" />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </CustomerLayout>
  );
}