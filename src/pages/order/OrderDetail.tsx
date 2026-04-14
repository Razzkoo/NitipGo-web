import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Package, MapPin, Calendar, Clock,
  Phone, Mail, User, CheckCircle, Loader2, ExternalLink,
  Star, Send, RefreshCw, XCircle, AlertTriangle
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

  // Rating 
  const [ratingDialog, setRatingDialog] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [report, setReport] = useState<any>(null);
  const fetchReport = async () => {
    try {
      const res = await api.get(`/customer/orders/${id}/report/answer`);
      if (res.data.data) setReport(res.data.data);
    } catch {}
  };

  // Payment by midtrans
  const [paying, setPaying] = useState(false);

  useEffect(() => {   
    if (id) {
      fetchOrder();
      fetchReport();
    }
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

  // Handle payment by midtrans
  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await api.post(`/customer/orders/${id}/pay`);
      const { snap_token, snap_url, client_key } = res.data.data;

      const existingScript = document.querySelector('script[src*="snap"]');
      if (existingScript) existingScript.remove();

      const script = document.createElement("script");
      script.src = snap_url;
      script.setAttribute("data-client-key", client_key);
      script.onload = () => {
        (window as any).snap.pay(snap_token, {
          onSuccess: async () => {
            // Sync status ke backend
            await api.post(`/customer/orders/${id}/payment-sync`);
            toast({ title: "Pembayaran berhasil!" });
            fetchOrder();
          },
          onPending: () => {
            toast({ title: "Menunggu pembayaran..." });
            fetchOrder();
          },
          onError: () => {
            toast({ title: "Pembayaran gagal", variant: "destructive" });
          },
          onClose: async () => {
            // Sync close popup
            try {
              await api.post(`/customer/orders/${id}/payment-sync`);
            } catch {}
            fetchOrder();
          },
        });
      };
      document.head.appendChild(script);
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal memproses pembayaran", variant: "destructive" });
    } finally {
      setPaying(false);
    }
  };

  // Rating traveler
  const handleSubmitRating = async () => {
    if (!ratingValue) return;
    setSubmittingRating(true);
    try {
      await api.post(`/customer/orders/${id}/rating`, {
        rating: ratingValue,
        review: reviewText,
      });
      toast({ title: "Rating berhasil dikirim!" });
      setRatingDialog(false);
      fetchOrder(); // refresh agar tombol rating hilang
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal mengirim rating", variant: "destructive" });
    } finally {
      setSubmittingRating(false);
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

          {/* Pembayaran Midtrans */}
          {order.status === "on_progress" && (
            <>
              {/* BELUM ADA HARGA FINAL */}
              {order.order_type === "titip-beli" && !order.price_confirmed ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-gray-100 border border-gray-300 p-5"
                >
                  <h3 className="font-bold text-gray-700 text-lg">
                    Menunggu Harga dari Traveler
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Traveler sedang menghitung total harga barang Anda. Pembayaran akan tersedia setelah harga final ditentukan.
                  </p>
                </motion.div>
              ) : (
                /* SUDAH ADA HARGA */
                (!order.payment || order.payment.payment_status !== "paid") && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-5 space-y-4"
                  >
                    <div>
                      <h3 className="font-bold text-amber-800 text-lg">Pembayaran Diperlukan</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Traveler sudah menetapkan harga. Silakan lakukan pembayaran untuk melanjutkan.
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-3 border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Biaya Pengiriman</span>
                        <span>{formatRupiah(order.shipping_price)}</span>
                      </div>

                      {order.order_type === "titip-beli" && order.item_price && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Harga Barang</span>
                          <span>{formatRupiah(Number(order.item_price) * order.quantity)}</span>
                        </div>
                      )}

                      <div className="border-t my-2" />

                      <div className="flex justify-between">
                        <span className="font-semibold">Total Bayar</span>
                        <span className="text-lg font-bold text-primary">
                          {formatRupiah(order.price)}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                      disabled={paying}
                      onClick={handlePay}
                    >
                      {paying ? "Memproses..." : "Bayar Sekarang"}
                    </Button>
                  </motion.div>
                )
              )}
            </>
          )}

          {order.payment?.payment_status === "paid" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-emerald-700 font-medium">Pembayaran berhasil</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    via {order.payment.payment_type ?? "Midtrans"} • {formatDate(order.payment.paid_at)}
                  </p>
                </div>
              </div>
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

            {/* Button Rating */}
            {order.status === "finished" && !order.rating && (
              <Button
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => setRatingDialog(true)}
              >
                <Star className="h-4 w-4 mr-1.5 fill-amber-400 text-amber-400" />
                Beri Rating
              </Button>
            )}
            {order.status === "finished" && order.rating && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`h-4 w-4 ${s <= order.rating.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                ))}
                <span className="text-xs text-amber-700 ml-1 font-medium">Sudah dirating</span>
              </div>
            )}
          </motion.div>

          {/* Laporan yang Kamu Kirim */}
          {report && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-card p-5 shadow-card space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Laporan yang Kamu Kirim
              </h3>

              <div className="rounded-xl bg-muted/40 border border-border/50 px-4 py-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                  {report.code} · {report.dispute_status === "resolved" ? "Diselesaikan" : report.dispute_status === "under_review" ? "Ditinjau" : "Menunggu Jawaban"}
                </p>
                <p className="text-sm font-semibold text-foreground mb-1">{report.title}</p>
                {report.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{report.description}</p>
                )}
              </div>

              {report.traveler_note ? (
                <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    <p className="text-xs font-semibold text-primary">Jawaban dari Traveler</p>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{report.traveler_note}</p>
                  {report.resolved_at && (
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Diselesaikan: {new Date(report.resolved_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                  <p className="text-xs text-amber-700">Traveler belum memberikan jawaban. Mohon tunggu.</p>
                </div>
              )}
            </motion.div>
          )}
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

        {/* Rating Dialog */}
        <Dialog open={ratingDialog} onOpenChange={setRatingDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Beri Rating Traveler</DialogTitle>
              <DialogDescription>
                Bagaimana pengalaman Anda dengan {order.traveler?.name}?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Star selector */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingValue(star)}
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-9 w-9 transition-colors ${
                        star <= (ratingHover || ratingValue)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {ratingValue > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  {["", "Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"][ratingValue]}
                </p>
              )}

              {/* Review textarea */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Ulasan (opsional)</label>
                <textarea
                  className="w-full rounded-xl border p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                  placeholder="Ceritakan pengalaman Anda..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setRatingDialog(false)}>
                Batal
              </Button>
              <Button
                className="flex-1"
                disabled={!ratingValue || submittingRating}
                onClick={handleSubmitRating}
              >
                {submittingRating ? "Mengirim..." : "Kirim Rating"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </CustomerLayout>
  );
}