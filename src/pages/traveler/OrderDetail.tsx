import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Package, MapPin, Calendar, Clock, Weight,
  Phone, Mail, User, Truck, CheckCheck, XCircle, CheckCircle,
  Image, ExternalLink, Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

interface OrderDetail {
  id: number;
  sku: string;
  order_type: string;
  name: string;
  description: string;
  weight: string;
  quantity: number;
  item_price: string | null;
  shipping_price: string;
  price: string;
  price_confirmed: boolean;
  paid_at: string | null;
  payment_proof: string | null;
  image: string | null;
  status: string;
  notes: string | null;
  arrival_date: string;
  recipient_name: string | null;
  recipient_phone: string | null;
  destination_address: string | null;
  created_at: string;
  customer: {
    id: number;
    name: string;
    phone: string;
    email: string;
    profile_photo: string | null;
    address: string | null;
  } | null;
  trip: {
    id: number;
    code: string;
    city: string;
    destination: string;
    departure_at: string;
    estimated_arrival_at: string;
    price: string;
  } | null;
  pickup_point: {
    id: number;
    name: string;
    address: string;
    pickup_time: string;
    map_url: string | null;
  } | null;
  collection_point: {
    id: number;
    name: string;
    address: string;
    collections_time: string;
    map_url: string | null;
  } | null;
  order_process: {
    id: number;
    original_item_price: string;
    updated_item_price: string;
    updated_total_price: string;
    receipt_photo: string | null;
    price_notes: string | null;
    step: string;
  } | null;
}

function getAvatar(photo: string | null, name: string) {
  if (photo) return `${BASE_URL}/storage/${photo}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatRupiah(val: string | number | null) {
  if (!val) return "Rp 0";
  return "Rp " + Number(val).toLocaleString("id-ID");
}

// FInal price
function formatRupiahInput(value: string) {
  const number = value.replace(/\D/g, "");
  return new Intl.NumberFormat("id-ID").format(Number(number));
}

const statusLabel: Record<string, string> = {
  pending: "Menunggu",
  on_progress: "Diproses",
  on_the_way: "Dalam Perjalanan",
  finished: "Selesai",
  cancelled: "Dibatalkan",
};

export default function TravelerOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Updating price for titip-beli
  const [priceForm, setPriceForm] = useState({ itemPrice: "", receiptPhoto: null as File | null, notes: "" });
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const cleanPrice = priceForm.itemPrice.replace(/\D/g, "");

  // Reject dialog
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/traveler/orders/${id}`);
      setOrder(res.data.data);
    } catch {
      toast({ title: "Gagal memuat detail order", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Handle accept order
  const handleAccept = async () => {
    if (!order) return;
    setProcessing(true);
    try {
      await api.patch(`/traveler/orders/${order.id}/accept`);
      toast({ title: "Order diterima" });
      fetchOrder();
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  // Handle reject order
  const handleReject = async () => {
    if (!order || !rejectReason.trim()) return;
    setProcessing(true);
    try {
      await api.patch(`/traveler/orders/${order.id}/reject`, { reason: rejectReason });
      toast({ title: "Order ditolak" });
      setRejectOpen(false);
      setRejectReason("");
      fetchOrder();
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  // Handle update status order
  const handleUpdateStatus = async (status: string) => {
    if (!order) return;
    setProcessing(true);
    try {
      await api.patch(`/traveler/orders/${order.id}/status`, { status });
      toast({ title: "Status diperbarui" });
      fetchOrder();
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  // Handle update price (titip-beli)
  const handleUpdatePrice = async () => {
    if (!order || !priceForm.itemPrice || !priceForm.receiptPhoto) return;

    // Validate number
    const cleanPrice = priceForm.itemPrice.replace(/[^\d]/g, "");
    if (isNaN(Number(cleanPrice))) {
      toast({ title: "Harga harus berupa angka", variant: "destructive" });
      return;
    }

    // Validate file
    if (!priceForm.receiptPhoto || !priceForm.receiptPhoto.type.startsWith('image/')) {
      toast({ title: "File harus berupa gambar", variant: "destructive" });
      return;
    }

    if (priceForm.receiptPhoto.size > 2048 * 1024) {
      toast({ title: "Ukuran file maksimal 2MB", variant: "destructive" });
      return;
    }

    setUpdatingPrice(true);
    try {
      const form = new FormData();
      form.append("item_price", cleanPrice);
      form.append("receipt_photo", priceForm.receiptPhoto);
      if (priceForm.notes) form.append("price_notes", priceForm.notes);

      
      await api.post(`/traveler/orders/${order.id}/price`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({ title: "Harga berhasil diperbarui" });

      setPriceForm({ itemPrice: "", receiptPhoto: null, notes: "" });
      fetchOrder();
    } catch (err: any) {
      console.log(err.response?.data);
      toast({
        title: err?.response?.data?.message ?? "Gagal update harga",
        variant: "destructive"
      });
    } finally {
      setUpdatingPrice(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="traveler">
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout role="traveler">
        <div className="p-6 text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Order tidak ditemukan</h2>
          <Button variant="outline" asChild>
            <Link to="/traveler/orders">Kembali</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="traveler">
      <div className="p-6 md:p-8 lg:p-10 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Button variant="ghost" size="sm" className="mb-2" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
            </Button>
            <h1 className="text-2xl font-bold">{order.name}</h1>
            <p className="text-sm text-muted-foreground">{order.sku} • {order.order_type === "titip-beli" ? "Titip Beli" : "Kirim Barang"}</p>
          </div>
          <StatusBadge status={order.status as any} />
        </div>

        {/* Customer */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card p-5 shadow-card">
          <h3 className="font-semibold mb-3">Customer</h3>
          <div className="flex items-center gap-4">
            <img
              src={getAvatar(order.customer?.profile_photo ?? null, order.customer?.name ?? "User")}
              alt="" className="h-12 w-12 rounded-full bg-muted object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold">{order.customer?.name}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {order.customer?.phone}</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {order.customer?.email}</span>
              </div>
              {order.customer?.address && (
                <p className="text-xs text-muted-foreground mt-1">{order.customer.address}</p>
              )}
            </div>
            {order.customer?.phone && (
              <Button size="sm" variant="outline" className="shrink-0" asChild>
                <a href={`tel:${order.customer.phone}`}><Phone className="h-4 w-4" /></a>
              </Button>
            )}
          </div>
        </motion.div>

        {/* Detail Barang */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-card p-5 shadow-card">
          <h3 className="font-semibold mb-3">Detail Barang</h3>

          {order.image && (
            <div className="mb-4 cursor-pointer" onClick={() => setPhotoOpen(true)}>
              <img
                src={`${BASE_URL}/storage/${order.image}`}
                alt={order.name}
                className="w-full h-48 rounded-xl object-cover border hover:opacity-90 transition"
              />
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama Barang</span>
              <span className="font-medium">{order.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deskripsi</span>
              <span className="font-medium text-right max-w-[60%]">{order.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Berat</span>
              <span className="font-medium">{order.weight} kg</span>
            </div>
            {order.order_type === "titip-beli" && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga Barang</span>
                  <span className="font-medium">{formatRupiah(order.item_price)}</span>
                </div>
              </>
            )}
          </div>
          

          {/* Penerima (kirim) */}
          {order.order_type === "kirim" && order.recipient_name && (
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div className="flex items-center gap-2 mb-2">
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

          {order.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-1">Catatan Customer</p>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
        </motion.div>

        {/* Rute & Titik COD */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-card p-5 shadow-card">
          <h3 className="font-semibold mb-3">Rute & Titik COD</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>{order.trip?.city} → {order.trip?.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>Berangkat: {formatDate(order.trip?.departure_at ?? null)}, {formatTime(order.trip?.departure_at ?? null)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>Tiba: {formatDate(order.trip?.estimated_arrival_at ?? null)}, {formatTime(order.trip?.estimated_arrival_at ?? null)}</span>
            </div>
          </div>

          {/* Pickup & Collection */}
          <div className={`${order.collection_point ? "grid md:grid-cols-2" : ""} gap-3 mt-4`}>
            {order.collection_point && (
              <div className="p-3 rounded-xl border">
                <p className="text-xs text-muted-foreground mb-1">Pos Pengumpulan</p>
                <p className="font-medium text-sm">{order.collection_point.name}</p>
                <p className="text-xs text-muted-foreground">{order.collection_point.address}</p>
                <p className="text-xs text-muted-foreground">Jam: {order.collection_point.collections_time}</p>
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
                <p className="text-xs text-muted-foreground mb-1">Pos Pengambilan</p>
                <p className="font-medium text-sm">{order.pickup_point.name}</p>
                <p className="text-xs text-muted-foreground">{order.pickup_point.address}</p>
                <p className="text-xs text-muted-foreground">Jam: {order.pickup_point.pickup_time}</p>
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

        {order.order_type === "titip-beli" && order.status === "on_progress" && !order.price_confirmed && (
            <div className="mt-4 pt-4 border-t">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-amber-800">Update Harga Barang</h4>
                  <p className="text-xs text-amber-600 mt-0.5">Upload struk belanja dan masukkan harga final</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-amber-800">Harga Final Barang *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={priceForm.itemPrice}
                      onChange={(e) => setPriceForm({ ...priceForm, itemPrice: formatRupiahInput(e.target.value) })}
                      className="pl-10 h-10 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-amber-800">Foto Struk Belanja *</Label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-amber-300 bg-white cursor-pointer hover:border-amber-400 transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setPriceForm({ ...priceForm, receiptPhoto: e.target.files?.[0] || null })}
                    />
                    <Package className="h-5 w-5 text-amber-500" />
                    <span className="text-sm text-amber-700">
                      {priceForm.receiptPhoto ? priceForm.receiptPhoto.name : "Klik untuk upload struk"}
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-amber-800">Catatan (Opsional)</Label>
                  <Textarea
                    placeholder="Contoh: Harga berbeda karena diskon..."
                    rows={2}
                    value={priceForm.notes}
                    onChange={(e) => setPriceForm({ ...priceForm, notes: e.target.value })}
                    className="bg-white text-sm"
                  />
                </div>

                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={updatingPrice || !priceForm.itemPrice || !priceForm.receiptPhoto}
                  onClick={handleUpdatePrice}
                >
                  {updatingPrice ? "Menyimpan..." : "Konfirmasi Harga & Upload Struk"}
                </Button>
              </div>
            </div>
          )}

          {order.order_type === "titip-beli" && order.price_confirmed && (
            <div className="mt-4 pt-4 border-t space-y-3">
              {order.order_process?.receipt_photo && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Struk Belanja</p>
                  <img
                    src={`${BASE_URL}/storage/${order.order_process.receipt_photo}`}
                    alt="Struk"
                    className="w-full h-32 rounded-lg object-cover border cursor-pointer hover:opacity-90"
                    onClick={() => setReceiptOpen(true)}
                  />
                </div>
              )}
              {!order.paid_at ? (
                <div className="rounded-lg bg-sky-50 border border-sky-200 p-3">
                  <p className="text-sm text-sky-700 font-medium">Harga dikonfirmasi. Menunggu pembayaran customer.</p>
                </div>
              ) : (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                  <p className="text-sm text-emerald-700 font-medium">Customer sudah membayar. Anda bisa mulai mengirim.</p>
                </div>
              )}
            </div>
          )}

        {/* Rincian Harga */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
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

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-3 flex-wrap">
          {order.status === "pending" && (
            <>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={processing} onClick={handleAccept}>
                <CheckCircle className="h-4 w-4 mr-1.5" /> Terima Order
              </Button>
              <Button variant="destructive" disabled={processing} onClick={() => setRejectOpen(true)}>
                <XCircle className="h-4 w-4 mr-1.5" /> Tolak Order
              </Button>
            </>
          )}
          {order.status === "on_progress" && (
            <>
              {(!(order as any).payment || (order as any).payment?.payment_status !== "paid") && (
                <div className="w-full rounded-xl bg-sky-50 border border-sky-200 p-3">
                  <p className="text-sm text-sky-700">Menunggu pembayaran dari customer sebelum bisa mulai kirim.</p>
                </div>
              )}
              {(order as any).payment?.payment_status === "paid" && (
                <div className="w-full rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                  <p className="text-sm text-emerald-700">Customer sudah membayar. Anda bisa mulai mengirim.</p>
                </div>
              )}
              <Button
                className="bg-sky-500 hover:bg-sky-600 text-white"
                disabled={processing || !(order as any).payment || (order as any).payment?.payment_status !== "paid"}
                onClick={() => handleUpdateStatus("on_the_way")}
              >
                <Truck className="h-4 w-4 mr-1.5" /> Mulai Kirim
              </Button>
            </>
          )}
          {order.status === "on_the_way" && (
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={processing}
              onClick={() => handleUpdateStatus("finished")}>
              <CheckCheck className="h-4 w-4 mr-1.5" /> Selesai
            </Button>
          )}
        </motion.div>

        {/* Reject Dialog */}
        <Dialog open={rejectOpen} onOpenChange={() => { setRejectOpen(false); setRejectReason(""); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tolak Order</DialogTitle>
              <DialogDescription>Berikan alasan penolakan untuk {order.sku}</DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Alasan *</label>
              <textarea
                className="w-full rounded-xl border p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200"
                rows={3}
                placeholder="Contoh: Jadwal bentrok / kapasitas penuh"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setRejectOpen(false)}>Batal</Button>
              <Button variant="destructive" className="flex-1" disabled={processing || !rejectReason.trim()} onClick={handleReject}>
                {processing ? "Memproses..." : "Ya, Tolak"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Photo Dialog */}
        {order.image && (
          <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
              <img src={`${BASE_URL}/storage/${order.image}`} alt={order.name} className="w-full h-full object-contain" />
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
    </DashboardLayout>
  );
}