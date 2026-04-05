import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, CheckCircle, XCircle, Phone, Clock, Loader2,
  Truck, CheckCheck, Ban, MapPin, Weight, DollarSign, ChevronRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

interface Order {
  id: number;
  sku: string;
  name: string;
  description: string;
  order_type: string;
  weight: string;
  price: string;
  status: string;
  created_at: string;
  customer: { id: number; name: string; phone: string; profile_photo: string | null } | null;
  trip: { id: number; city: string; destination: string } | null;
  pickup_point: { name: string; address: string } | null;
}

const tabs = [
  { key: "pending",      label: "Menunggu",          icon: Clock,      color: "text-amber-500",   bg: "bg-amber-50",   activeBg: "bg-amber-500" },
  { key: "on_progress",  label: "Diproses",          icon: Loader2,    color: "text-violet-500",  bg: "bg-violet-50",  activeBg: "bg-violet-500" },
  { key: "on_the_way",   label: "Dalam Perjalanan",  icon: Truck,      color: "text-sky-500",     bg: "bg-sky-50",     activeBg: "bg-sky-500" },
  { key: "finished",     label: "Selesai",           icon: CheckCheck, color: "text-emerald-500", bg: "bg-emerald-50", activeBg: "bg-emerald-500" },
  { key: "cancelled",    label: "Dibatalkan",        icon: Ban,        color: "text-rose-500",    bg: "bg-rose-50",    activeBg: "bg-rose-500" },
] as const;

function getAvatar(photo: string | null, name: string) {
  if (photo) return `${BASE_URL}/storage/${photo}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
}

export default function TravelerOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const [actionDialog, setActionDialog] = useState<{
    open: boolean; action: "accept" | "reject"; order: Order | null;
  }>({ open: false, action: "accept", order: null });
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/traveler/orders");
      const raw = res.data.data?.data ?? res.data.data ?? [];
      setOrders(Array.isArray(raw) ? raw : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = orders.filter(o => o.status === activeTab);

  const handleAccept = async () => {
    if (!actionDialog.order) return;
    setProcessing(true);
    try {
      await api.patch(`/traveler/orders/${actionDialog.order.id}/accept`);
      toast({ title: "Order diterima" });
      fetchOrders();
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal", variant: "destructive" });
    } finally {
      setProcessing(false);
      setActionDialog({ open: false, action: "accept", order: null });
    }
  };

  const handleReject = async () => {
    if (!actionDialog.order || !rejectReason.trim()) return;
    setProcessing(true);
    try {
      await api.patch(`/traveler/orders/${actionDialog.order.id}/reject`, { reason: rejectReason });
      toast({ title: "Order ditolak" });
      fetchOrders();
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal", variant: "destructive" });
    } finally {
      setProcessing(false);
      setActionDialog({ open: false, action: "accept", order: null });
      setRejectReason("");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/traveler/orders/${id}/status`, { status });
      toast({ title: "Status diperbarui" });
      fetchOrders();
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout role="traveler">
      <div className="min-h-screen bg-gray-50/60 p-6 md:p-8 lg:p-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Order</h1>
              <p className="text-sm text-gray-400">Kelola seluruh order pengiriman Anda</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(({ key, label, icon: Icon, color, bg, activeBg }) => {
            const count = orders.filter(o => o.status === key).length;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  isActive
                    ? `${activeBg} text-white border-transparent shadow-md`
                    : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : color}`} />
                <span>{label}</span>
                <span className={`ml-0.5 min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                  isActive ? "bg-white/20 text-white" : `${bg} ${color}`
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState icon={Package} title="Tidak ada order" description="Order akan muncul di sini" variant="compact" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredOrders.map(order => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getAvatar(order.customer?.profile_photo ?? null, order.customer?.name ?? "User")}
                        alt=""
                        className="h-10 w-10 rounded-full bg-muted object-cover"
                      />
                      <div>
                        <span className="text-xs font-semibold text-gray-400">{order.sku}</span>
                        <p className="text-sm font-semibold text-gray-800">{order.customer?.name ?? "Customer"}</p>
                      </div>
                    </div>
                    <StatusBadge status={order.status as any} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-2">{order.name}</h3>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{order.trip?.city} → {order.trip?.destination}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Weight className="h-3.5 w-3.5" />
                      <span>{order.weight} kg</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">
                        Rp {Number(order.price).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-50 my-3" />

                  <div className="flex items-center gap-2 flex-wrap">
                    {order.status === "pending" && (
                      <>
                        <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8 rounded-lg"
                          onClick={() => setActionDialog({ open: true, action: "accept", order })}>
                          <CheckCircle className="h-3.5 w-3.5" /> Terima
                        </Button>
                        <Button size="sm" variant="destructive" className="gap-1.5 text-xs h-8 rounded-lg"
                          onClick={() => setActionDialog({ open: true, action: "reject", order })}>
                          <XCircle className="h-3.5 w-3.5" /> Tolak
                        </Button>
                      </>
                    )}
                    {order.status === "on_progress" && (
                      <Button size="sm" className="gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs h-8 rounded-lg"
                        onClick={() => handleUpdateStatus(order.id, "on_the_way")}>
                        <Truck className="h-3.5 w-3.5" /> Mulai Kirim
                      </Button>
                    )}
                    {order.status === "on_the_way" && (
                      <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8 rounded-lg"
                        onClick={() => handleUpdateStatus(order.id, "finished")}>
                        <CheckCheck className="h-3.5 w-3.5" /> Selesai
                      </Button>
                    )}

                    <div className="flex items-center gap-1.5 ml-auto">
                    {order.customer?.phone && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg" asChild>
                        <a href={`tel:${order.customer.phone}`}><Phone className="h-3.5 w-3.5" /></a>
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-8 gap-1 px-3 rounded-lg text-xs text-gray-500 hover:text-gray-800" asChild>
                      <Link to={`/traveler/order/${order.id}`}>
                        Detail <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Action Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={() => { setActionDialog({ open: false, action: "accept", order: null }); setRejectReason(""); }}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>
                {actionDialog.action === "accept" ? "Terima Order" : "Tolak Order"}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.action === "accept"
                  ? `Konfirmasi penerimaan order ${actionDialog.order?.sku}.`
                  : `Tolak order ${actionDialog.order?.sku} dengan alasan.`}
              </DialogDescription>
            </DialogHeader>

            {actionDialog.action === "reject" && (
              <div className="space-y-1.5 mt-1">
                <label className="text-sm font-semibold">Alasan penolakan *</label>
                <textarea
                  className="w-full rounded-xl border p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200"
                  rows={3}
                  placeholder="Contoh: Jadwal bentrok / rute tidak sesuai"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" className="flex-1"
                onClick={() => setActionDialog({ open: false, action: "accept", order: null })}>
                Batal
              </Button>
              <Button
                className={`flex-1 ${actionDialog.action === "accept" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"} text-white`}
                disabled={processing || (actionDialog.action === "reject" && !rejectReason.trim())}
                onClick={actionDialog.action === "accept" ? handleAccept : handleReject}>
                {processing ? "Memproses..." : actionDialog.action === "accept" ? "Ya, Terima" : "Ya, Tolak"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}