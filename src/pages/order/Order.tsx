import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Package, Clock, Truck, CheckCheck, Ban, ArrowRight,
  MapPin, Loader2, XCircle,
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
  status: string;
  created_at: string;
  traveler: { id: number; name: string; profile_photo: string | null } | null;
  trip: { id: number; city: string; destination: string } | null;
}

const tabs = [
  { key: "all",          label: "Semua",             icon: Package },
  { key: "pending",      label: "Menunggu",          icon: Clock },
  { key: "on_progress",  label: "Diproses",          icon: Loader2 },
  { key: "on_the_way",   label: "Dalam Perjalanan",  icon: Truck },
  { key: "finished",     label: "Selesai",           icon: CheckCheck },
  { key: "cancelled",    label: "Dibatalkan",        icon: Ban },
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
  const [activeTab, setActiveTab] = useState("all");
  const [cancelDialog, setCancelDialog] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customer/orders");
      const raw = res.data.data?.data ?? res.data.data ?? [];
      setOrders(Array.isArray(raw) ? raw : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = activeTab === "all"
    ? orders
    : orders.filter(o => o.status === activeTab);

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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(({ key, label, icon: Icon }) => {
            const count = key === "all" ? orders.length : orders.filter(o => o.status === key).length;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/30"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "" : "opacity-60"}`} />
                {label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 rounded-full ${isActive ? "bg-white/20" : "bg-muted"}`}>
                    {count}
                  </span>
                )}
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
          <EmptyState
            icon={Package}
            title="Tidak ada order"
            description={activeTab === "all" ? "Buat order pertama Anda dari halaman Perjalanan" : "Tidak ada order dengan status ini"}
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
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <p className="text-lg font-bold text-primary">
                      Rp {Number(order.price).toLocaleString("id-ID")}
                    </p>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/order/${order.id}`}>Detail</Link>
                      </Button>

                      {order.status === "pending" && (
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                          onClick={() => setCancelDialog(order)}>
                          Batalkan
                        </Button>
                      )}

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
      </div>
    </CustomerLayout>
  );
}