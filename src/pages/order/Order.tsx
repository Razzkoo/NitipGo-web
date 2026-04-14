import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Package, Clock, Truck, CheckCheck, Ban, ArrowRight,
  MapPin, Loader2, XCircle, CreditCard, Star, TriangleAlert
} from "lucide-react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import api from "@/lib/api";

const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

interface Order {
  id: number;
  sku: string;
  name: string;
  order_type: string;
  weight: string;
  price: string;
  shipping_price: string;
  price_confirmed?: boolean;
  status: string;
  created_at: string;
  traveler: { id: number; name: string; profile_photo: string | null } | null;
  trip: { id: number; city: string; destination: string } | null;
  payment: { id: number; payment_status: string; paid_at: string | null } | null;
  rating: { id: number; rating: number; review: string | null } | null;
  pickup_point: {
    name: string;
    address: string;
    collections_time?: string;
    pickup_time?: string;
    map_url: string | null;
  } | null;
}

const statusTabs = [
  { key: "all",      label: "Semua" },
  { key: "active",   label: "Aktif" },
  { key: "finished", label: "Selesai" },
  { key: "cancelled", label: "Dibatalkan" },
] as const;

const typeTabs = [
  { key: "all",        label: "Semua Jenis" },
  { key: "titip-beli", label: "Titip Beli" },
  { key: "kirim",      label: "Kirim Barang" },
] as const;

const statusLabel: Record<string, string> = {
  pending: "Menunggu",
  on_progress: "Diproses",
  on_the_way: "Dalam Perjalanan",
  finished: "Selesai",
  cancelled: "Dibatalkan",
};

function getAvatar(photo: string | null, name: string) {
  if (photo) return `${BASE_URL}/storage/${photo}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function CustomerOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cancelDialog, setCancelDialog] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  // payment
  const [paying, setPaying] = useState(false);

  // Rating
  const [ratingDialog, setRatingDialog] = useState<Order | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  // Report
  const [reportDialog, setReportDialog]   = useState<Order | null>(null);
  const [reportTitle, setReportTitle]     = useState("");
  const [reportDesc, setReportDesc]       = useState("");
  const [reportPriority, setReportPriority] = useState<"low"|"medium"|"high">("medium");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [existingReport, setExistingReport] = useState<Record<number, boolean>>({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customer/orders");
      const raw = res.data.data?.data ?? res.data.data ?? [];
      const list = Array.isArray(raw) ? raw : [];
      setOrders(list);

      // Cek report per order secara parallel
      const reportChecks = await Promise.allSettled(
        list.map((o: Order) => api.get(`/customer/orders/${o.id}/report`))
      );
      const reportMap: Record<number, boolean> = {};
      reportChecks.forEach((result, i) => {
        if (result.status === "fulfilled") {
          reportMap[list[i].id] = !!result.value.data.data;
        }
      });
      setExistingReport(reportMap);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = orders.filter(o => {
    // Status filter
    if (statusFilter === "active" && !["pending", "on_progress", "on_the_way"].includes(o.status)) return false;
    if (statusFilter === "finished" && o.status !== "finished") return false;
    if (statusFilter === "cancelled" && o.status !== "cancelled") return false;

    // Type filter
    if (typeFilter !== "all" && o.order_type !== typeFilter) return false;

    return true;
  });

  const handleCancel = async () => {
    if (!cancelDialog) return;
    setCancelling(true);
    try {
      await api.patch(`/customer/orders/${cancelDialog.id}/cancel`);
      toast({ title: "Order dibatalkan" });
      fetchOrders();
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal membatalkan", variant: "destructive" });
    } finally {
      setCancelling(false);
      setCancelDialog(null);
    }
  };

  // Handle payment by midtrans
  const handlePay = async (orderId: number) => {
    setPaying(true);
    try {
      const res = await api.post(`/customer/orders/${orderId}/pay`);
      const { snap_token, snap_url, client_key } = res.data.data;

      // Load Midtrans Snap
      const existingScript = document.querySelector('script[src*="snap"]');
      if (existingScript) existingScript.remove();

      const script = document.createElement("script");
      script.src = snap_url;
      script.setAttribute("data-client-key", client_key);
      script.onload = () => {
        (window as any).snap.pay(snap_token, {
          onSuccess: async () => {
            await api.post(`/customer/orders/${orderId}/payment-sync`);
            toast({ title: "Pembayaran berhasil!" });
            fetchOrders();
          },
          onPending: () => {
            toast({ title: "Menunggu pembayaran..." });
            fetchOrders();
          },
          onError: () => {
            toast({ title: "Pembayaran gagal", variant: "destructive" });
          },
          onClose: async () => {
            try { await api.post(`/customer/orders/${orderId}/payment-sync`); } catch {}
            fetchOrders();
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
    if (!ratingDialog || !ratingValue) return;
    setSubmittingRating(true);
    try {
      await api.post(`/customer/orders/${ratingDialog.id}/rating`, {
        rating: ratingValue,
        review: reviewText,
      });
      toast({ title: "Rating berhasil dikirim!" });
      setRatingDialog(null);
      setRatingValue(0);
      setReviewText("");
      fetchOrders();
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal mengirim rating", variant: "destructive" });
    } finally {
      setSubmittingRating(false);
    }
  };

  // Report Traveler
  const handleSubmitReport = async () => {
    if (!reportDialog || !reportTitle.trim()) return;
    setSubmittingReport(true);
    try {
      await api.post(`/customer/orders/${reportDialog.id}/report`, {
        title:       reportTitle,
        description: reportDesc,
        priority:    reportPriority,
      });
      toast({ title: "Laporan berhasil dikirim!" });
      setExistingReport(prev => ({ ...prev, [reportDialog.id]: true }));
      setReportDialog(null);
      setReportTitle("");
      setReportDesc("");
      setReportPriority("medium");
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal mengirim laporan", variant: "destructive" });
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="p-6 md:p-8 lg:p-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-primary/10 p-2">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Daftar Order</h1>
              <p className="text-sm text-muted-foreground">Pantau status order Anda</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {statusTabs.map(({ key, label }) => {
              const isActive = statusFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground border-border hover:border-primary/30"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 flex-wrap">
            {typeTabs.map(({ key, label }) => {
              const isActive = typeFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setTypeFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    isActive
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-card text-muted-foreground border-border hover:border-emerald-300"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Tidak ada order"
            description={statusFilter === "all" ? "Buat order pertama Anda dari halaman Perjalanan" : "Tidak ada order dengan status ini"}
            actionLabel="Cari Perjalanan"
            onAction={() => window.location.href = "/customer/trip"}
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl bg-card p-5 shadow-card"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-muted-foreground">{order.sku}</span>
                      <StatusBadge status={order.status as any} size="sm" />
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        order.order_type === "titip-beli"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {order.order_type === "titip-beli" ? "Titip Beli" : "Kirim"}
                      </span>
                    </div>

                    {/* Item */}
                    <h3 className="font-semibold text-lg">{order.name}</h3>

                    {/* Route */}
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{order.trip?.city}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>{order.trip?.destination}</span>
                    </div>

                    {/* Traveler */}
                    {order.traveler && (
                      <div className="flex items-center gap-2 mt-2">
                        <img
                          src={getAvatar(order.traveler.profile_photo, order.traveler.name)}
                          alt="" className="h-6 w-6 rounded-full bg-muted object-cover"
                        />
                        <span className="text-sm text-muted-foreground">{order.traveler.name}</span>
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{order.weight} kg</span>
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                    
                    {/* Harga */}
                    <p className="text-lg font-bold text-primary">
                      Rp {Number(order.price).toLocaleString("id-ID")}
                    </p>

                    {/* Pickup info - full width */}
                    {order.status === "finished" && order.pickup_point && (
                      <Link
                        to={`/order/${order.id}`}
                        className="w-full rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 hover:bg-emerald-100 transition text-left block"
                      >
                        <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          Barang siap diambil <ArrowRight className="h-3 w-3" />
                        </p>
                        <p className="text-sm font-medium text-emerald-800">{order.pickup_point.name}</p>
                        {(order.pickup_point.pickup_time || order.pickup_point.collections_time) && (
                          <p className="text-xs text-emerald-600">
                            Jam: {order.pickup_point.pickup_time ?? order.pickup_point.collections_time}
                          </p>
                        )}
                      </Link>
                    )}

                    {/* Tombol-tombol dalam satu baris */}
                    <div className="flex items-center gap-2 flex-wrap justify-end">

                      {/* Rating - hanya untuk finished */}
                      {order.status === "finished" && !order.rating && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-300 text-amber-700 hover:bg-amber-50"
                          onClick={() => {
                            setRatingValue(0);
                            setRatingHover(0);
                            setReviewText("");
                            setRatingDialog(order);
                          }}
                        >
                          <Star className="h-3.5 w-3.5 mr-1" />
                          Rating
                        </Button>
                      )}
                      {order.status === "finished" && order.rating && (
                        <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`h-3.5 w-3.5 ${
                              s <= order.rating!.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`} />
                          ))}
                        </div>
                      )}

                      {/* Detail - selalu tampil */}
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/order/${order.id}`}>Detail</Link>
                      </Button>

                      {["on_progress", "on_the_way", "finished"].includes(order.status) && (
                        existingReport[order.id] ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 font-semibold">
                            <TriangleAlert className="h-3 w-3" />
                            Dilaporkan
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => {
                              setReportTitle("");
                              setReportDesc("");
                              setReportPriority("medium");
                              setReportDialog(order);
                            }}
                          >
                            <TriangleAlert className="h-3.5 w-3.5 mr-1" />
                          </Button>
                        )
                      )}

                      {/* Pending: batalkan */}
                      {order.status === "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setCancelDialog(order)}
                        >
                          Batalkan
                        </Button>
                      )}

                      {/* On progress: bayar / status pembayaran */}
                      {order.status === "on_progress" && (
                        order.order_type === "titip-beli" && !order.price_confirmed ? (
                          <span className="text-[10px] text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded-lg font-semibold">
                            Menunggu Harga
                          </span>
                        ) : order.payment?.payment_status === "paid" ? (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg font-semibold">
                            Sudah Dibayar
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                            disabled={paying}
                            onClick={() => handlePay(order.id)}
                          >
                            {paying ? "Memproses..." : "Bayar"}
                          </Button>
                        )
                      )}

                      {/* On the way: tracking */}
                      {order.status === "on_the_way" && (
                        <Button size="sm" variant="soft" asChild>
                          <Link to={`/order/${order.id}/tracking`}>Tracking</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Cancel Dialog */}
        <Dialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Batalkan Order</DialogTitle>
              <DialogDescription>
                Batalkan order {cancelDialog?.sku}? Tindakan ini tidak bisa dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setCancelDialog(null)}>Kembali</Button>
              <Button variant="destructive" className="flex-1" disabled={cancelling} onClick={handleCancel}>
                {cancelling ? "Memproses..." : "Ya, Batalkan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rating Dialog */}
        <Dialog open={!!ratingDialog} onOpenChange={(open) => { if (!open) setRatingDialog(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Beri Rating Traveler</DialogTitle>
              <DialogDescription>
                Bagaimana pengalaman Anda dengan {ratingDialog?.traveler?.name}?
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
                    <Star className={`h-9 w-9 transition-colors ${
                      star <= (ratingHover || ratingValue)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    }`} />
                  </button>
                ))}
              </div>
              {ratingValue > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  {["", "Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"][ratingValue]}
                </p>
              )}

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
              <Button variant="outline" className="flex-1" onClick={() => setRatingDialog(null)}>
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

        {/* Report Dialog */}
        <Dialog open={!!reportDialog} onOpenChange={(open) => { if (!open) setReportDialog(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-amber-500" />
                Laporkan Masalah
              </DialogTitle>
              <DialogDescription>
                Order {reportDialog?.sku} · {reportDialog?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Judul Laporan *</label>
                <input
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Contoh: Barang tidak sampai, barang rusak..."
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Deskripsi (opsional)</label>
                <textarea
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                  placeholder="Ceritakan masalah secara detail..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Prioritas</label>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setReportPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        reportPriority === p
                          ? p === "high"   ? "bg-red-50 text-red-600 border-red-300"
                          : p === "medium" ? "bg-amber-50 text-amber-600 border-amber-300"
                          :                  "bg-zinc-100 text-zinc-600 border-zinc-300"
                          : "bg-card text-muted-foreground border-border"
                      }`}
                    >
                      {p === "low" ? "Rendah" : p === "medium" ? "Sedang" : "Tinggi"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setReportDialog(null)}>Batal</Button>
              <Button
                className="flex-1"
                disabled={!reportTitle.trim() || submittingReport}
                onClick={handleSubmitReport}
              >
                {submittingReport ? "Mengirim..." : "Kirim Laporan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CustomerLayout>
  );
}