import { Link, useParams } from "react-router-dom";
import { MapPin, Calendar, Clock, Package, ArrowLeft, CheckCircle, Navigation, Square } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState, useRef, lazy, Suspense } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Trip {
  id: number;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  arrivalDate: string;
  capacity: string;
  capacityPercent: number;
  active: boolean;
  status: string;
}

interface PickupPoint {
  id: number;
  name: string;
  address: string;
  pickupTime: string;
  mapUrl?: string;
}

interface CollectionPoint {
  id: number;
  name: string;
  address: string;
  collectionTime: string;
  mapUrl?: string;
}

interface TrackingPoint {
  latitude: number;
  longitude: number;
  recorded_at: string;
}

const TripTrackingMap = lazy(() => import("@/components/map/TripTrackingMap"));

export default function TripDetail() {
  const { toast } = useToast();
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<boolean>(true);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTrip();
      fetchTracking();
    }
  }, [id]);

  const fetchTrip = async () => {
    try {
      const res = await api.get(`/traveler/trips/${id}`);
      const data = res.data.data;

      setTrip({
        id: data.id,
        from: data.city,
        to: data.destination,
        date: new Date(data.departure_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        departureTime: new Date(data.departure_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        arrivalDate: data.estimated_arrival_at
          ? new Date(data.estimated_arrival_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
          : "-",
        arrivalTime: data.estimated_arrival_at
          ? new Date(data.estimated_arrival_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
          : "-",
        capacity: `${data.used_capacity}/${data.capacity} kg`,
        capacityPercent: data.capacity > 0 ? Math.round((data.used_capacity / data.capacity) * 100) : 0,
        active: data.status === "active",
        status: data.status,
      });

      setPickupPoints(
        (data.pickups ?? []).map((p: Record<string, any>) => ({
          id: Number(p.id ?? 0),
          name: p.name ?? "",
          address: p.address ?? "",
          pickupTime: p.pickup_time ?? "",
          mapUrl: p.map_url,
        }))
      );

      setCollectionPoints(
        (data.collections ?? []).map((c: Record<string, any>) => ({
          id: Number(c.id ?? 0),
          name: c.name ?? "",
          address: c.address ?? "",
          collectionTime: c.collections_time ?? "",
          mapUrl: c.map_url,
        }))
      );

      setActive(data.status === "active");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!trip) return;
    const newStatus = active ? "cancelled" : "active";

    try {
      await api.patch(`/traveler/trips/${trip.id}/status`, { status: newStatus });
      setActive(!active);
      toast({ title: active ? "Perjalanan dinonaktifkan" : "Perjalanan diaktifkan" });
    } catch (err: any) {
      toast({
        title: err?.response?.data?.message ?? "Gagal mengubah status",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!trip) return;

    try {
      await api.delete(`/traveler/trips/${trip.id}`);
      toast({ title: "Trip berhasil dihapus" });
      window.history.back();
    } catch (err) {
      toast({
        title: "Gagal menghapus trip",
        variant: "destructive",
      });
    }
  };

    function InfoItem({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-center gap-3">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted">
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
        </div>
    );
    }
    function PickupItem({ point }: { point: PickupPoint }) {
      return (
        <div className="flex items-center justify-between border rounded-xl p-3">
          <div>
            <p className="font-medium">{point.name}</p>
            <p className="text-sm text-muted-foreground">{point.address}</p>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium">{point.pickupTime}</p>

            {point.mapUrl && (
              <a
                href={point.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline">
                Lihat Maps
              </a>
            )}
          </div>
        </div>
      );
    }

    function CollectionItem({ point }: { point: CollectionPoint }) {
      return (
        <div className="flex items-center justify-between border rounded-xl p-3">
          <div>
            <p className="font-medium">{point.name}</p>
            <p className="text-sm text-muted-foreground">{point.address}</p>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium">{point.collectionTime}</p>

            {point.mapUrl && (
              <a
                href={point.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline">
                Lihat Maps
              </a>
            )}
          </div>
        </div>
      );
    }

    // TRIP TRACKING MANAGEMENT
    const [isTracking, setIsTracking] = useState(false);
    const [trackingRoute, setTrackingRoute] = useState<TrackingPoint[]>([]);
    const [latestPoint, setLatestPoint] = useState<TrackingPoint | null>(null);
    const [startingTracking, setStartingTracking] = useState(false);
    const lastSentAt = useRef<number>(0);
    const watchId = useRef<number | null>(null);
    const [mapReady, setMapReady] = useState(false);

    // Fetch tracking data
    const fetchTracking = async () => {
      try {
        const res = await api.get(`/traveler/trips/${id}/tracking`);
        const rawPoints: any[] = Array.isArray(res.data.data) ? res.data.data : [];

        const points: TrackingPoint[] = rawPoints
          .map((p) => ({
            latitude: Number(p.latitude),
            longitude: Number(p.longitude),
            recorded_at: p.recorded_at ?? "",
          }))
          .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));

        setTrackingRoute(points);
        const tracking = res.data.is_tracking ?? false;
        setIsTracking(tracking);
        setLatestPoint(points.length > 0 ? points[points.length - 1] : null);

        if (tracking || points.length > 0) {
          setMapReady(true);
        }
      } catch {
        setTrackingRoute([]);
        setIsTracking(false);
        setLatestPoint(null);
      }
    };

    const handleStartTracking = async () => {
      if (!trip) return;
      setStartingTracking(true);

      try {
        await api.post(`/traveler/trips/${trip.id}/tracking/start`);
        setIsTracking(true);
        setMapReady(true);
        toast({ title: "Tracking dimulai" });
      } catch (err: any) {
        toast({
          title: err?.response?.data?.message ?? "Gagal memulai tracking",
          variant: "destructive",
        });
      } finally {
        setStartingTracking(false);
      }
    };

    // Sending location updates
    const startSendingLocation = () => {
      if (!navigator.geolocation) {
        toast({ title: "GPS tidak didukung di browser ini", variant: "destructive" });
        return;
      }

      if (watchId.current !== null) return;

      watchId.current = navigator.geolocation.watchPosition(
        async (position) => {
          // Throttle: 10 seconds
          const now = Date.now();
          if (now - lastSentAt.current < 10000) return;
          lastSentAt.current = now;

          const { latitude, longitude, speed, heading } = position.coords;

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

          try {
            const res = await api.post(`/traveler/trips/${id}/tracking/location`, {
              latitude,
              longitude,
              speed: speed ?? null,
              heading: heading ?? null,
            });

            const raw = res.data.data;
            if (!raw) return;

            const point: TrackingPoint = {
              latitude: Number(raw.latitude),
              longitude: Number(raw.longitude),
              recorded_at: raw.recorded_at ?? new Date().toISOString(),
            };

            if (!Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) return;

            setLatestPoint(point);
            setTrackingRoute((prev) => [...prev, point]);
          } catch (err) {
            console.error("send location error", err);
          }
        },
        (error) => {
          console.error("GPS error:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 15000,
        }
      );
    };

    // Stop tracking
    const handleStopTracking = async () => {
      if (!trip) return;

      try {
        await api.post(`/traveler/trips/${trip.id}/tracking/stop`);
        setIsTracking(false);
        toast({ title: "Tracking selesai" });

        if (watchId.current !== null) {
          navigator.geolocation.clearWatch(watchId.current);
          watchId.current = null;
        }
      } catch (err: any) {
        toast({
          title: err?.response?.data?.message ?? "Gagal menghentikan tracking",
          variant: "destructive",
        });
      }
    };

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (watchId.current !== null) {
          navigator.geolocation.clearWatch(watchId.current);
        }
      };
    }, []);

    useEffect(() => {
      if (isTracking && trip) {
        startSendingLocation();
      }

      return () => {
        if (watchId.current !== null) {
          navigator.geolocation.clearWatch(watchId.current);
          watchId.current = null;
        }
      };
    }, [isTracking, trip]);

    // TRIP ORDERS MANAGEMENT
    function TripOrders({ tripId }: { tripId: number }) {
      const [orders, setOrders] = useState<any[]>([]);
      const [loadingOrders, setLoadingOrders] = useState(true);
      const { toast } = useToast();

      const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

      useEffect(() => {
        fetchOrders();
      }, [tripId]);

      const fetchOrders = async () => {
        try {
          const res = await api.get(`/traveler/trips/${tripId}/orders`);
          setOrders(res.data.data ?? []);
        } catch {
          setOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      };

      const handleAccept = async (id: number) => {
        try {
          await api.patch(`/traveler/orders/${id}/accept`);
          toast({ title: "Order diterima" });
          fetchOrders();
        } catch (err: any) {
          toast({ title: err?.response?.data?.message ?? "Gagal", variant: "destructive" });
        }
      };

      const handleReject = async (id: number, reason: string) => {
        try {
          await api.patch(`/traveler/orders/${id}/reject`, { reason });
          toast({ title: "Order ditolak" });
          fetchOrders();
        } catch (err: any) {
          toast({ title: err?.response?.data?.message ?? "Gagal", variant: "destructive" });
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

      const pendingOrders = orders.filter(o => o.status === "pending");
      const activeOrders = orders.filter(o => ["on_progress", "on_the_way"].includes(o.status));
      const finishedOrders = orders.filter(o => ["finished", "cancelled"].includes(o.status));

      const statusLabel: Record<string, string> = {
        pending: "Menunggu",
        on_progress: "Diproses",
        on_the_way: "Dalam Perjalanan",
        finished: "Selesai",
        cancelled: "Dibatalkan",
      };

      const statusColor: Record<string, string> = {
        pending: "bg-amber-50 text-amber-700",
        on_progress: "bg-violet-50 text-violet-700",
        on_the_way: "bg-sky-50 text-sky-700",
        finished: "bg-emerald-50 text-emerald-700",
        cancelled: "bg-red-50 text-red-700",
      };

      const getAvatar = (avatar: string | null, name: string) => {
        if (avatar) return `${BASE_URL}/storage/${avatar}`;
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
      };

      if (loadingOrders) {
        return (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="h-40 rounded-2xl bg-muted animate-pulse" />
            <div className="h-40 rounded-2xl bg-muted animate-pulse" />
          </div>
        );
      }

      const OrderItem = ({ order }: { order: any }) => (
        <div className="flex items-start gap-3 p-3 border rounded-xl">
          <img
            src={getAvatar(order.avatar, order.customer)}
            alt={order.customer}
            className="h-10 w-10 rounded-full bg-muted object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-sm truncate">{order.customer}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[order.status]}`}>
                {statusLabel[order.status]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{order.item} • {order.weight}</p>
            <p className="text-xs font-semibold text-primary mt-0.5">{order.price}</p>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-2">
              {order.status === "pending" && (
                <>
                  <button
                    onClick={() => handleAccept(order.id)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
                  >
                    Terima
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt("Alasan penolakan:");
                      if (reason) handleReject(order.id, reason);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Tolak
                  </button>
                </>
              )}
              {order.status === "on_progress" && (
                <button
                  onClick={() => handleUpdateStatus(order.id, "on_the_way")}
                  className="text-xs px-2.5 py-1 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition"
                >
                  Mulai Kirim
                </button>
              )}
              {order.status === "on_the_way" && (
                <button
                  onClick={() => handleUpdateStatus(order.id, "finished")}
                  className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
                >
                  Selesai
                </button>
              )}
            </div>
          </div>
        </div>
      );

      return (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="font-semibold text-lg mb-4">
              Order Menunggu
              {pendingOrders.length > 0 && (
                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {pendingOrders.length}
                </span>
              )}
            </h2>
            {pendingOrders.length === 0 ? (
              <Empty message="Belum ada order menunggu" />
            ) : (
              <div className="space-y-3">
                {pendingOrders.map(o => <OrderItem key={o.id} order={o} />)}
              </div>
            )}
          </div>

          {/* Active + Finished */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="font-semibold text-lg mb-4">
              Order Aktif & Selesai
              {activeOrders.length > 0 && (
                <span className="ml-2 text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                  {activeOrders.length} aktif
                </span>
              )}
            </h2>
            {[...activeOrders, ...finishedOrders].length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="font-medium text-muted-foreground">Belum ada order</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...activeOrders, ...finishedOrders].map(o => <OrderItem key={o.id} order={o} />)}
              </div>
            )}
          </div>
        </div>
      );
    }

  return (
    <DashboardLayout role="traveler">
      <div className="p-6 md:p-8 lg:p-10">

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading trip...</p>
        ) : !trip ? (
          <p className="text-sm text-muted-foreground">Trip tidak ditemukan</p>
        ) : (
          <>
            {/* Back */}
            <Link
              to="/traveler/trip"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Kelola Perjalanan
            </h1>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
              <p className="text-muted-foreground">
                {trip.from} → {trip.to} • {trip.date}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialog(true)}
                  disabled={active}
                >
                  Hapus
                </Button>
                {trip.status !== "expired" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleActive}>
                    {active ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                )}
              </div>
            </div>

            {trip.status === "expired" && (
              <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                <Clock className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-amber-700">Perjalanan sudah kedaluwarsa</p>
                  <p className="text-xs text-amber-600">Tanggal keberangkatan sudah berlalu. Trip ini tidak bisa diaktifkan kembali.</p>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="rounded-2xl bg-card p-6 shadow-card mb-6">
              <div className="grid md:grid-cols-4 gap-4">
                <InfoItem icon={MapPin} label="Rute" value={`${trip.from} → ${trip.to}`} />
                <InfoItem icon={Calendar} label="Berangkat" value={`${trip.date} • ${trip.departureTime}`} />
                <InfoItem icon={Clock} label="Estimasi Tiba" value={`${trip.arrivalDate} • ${trip.arrivalTime}`} />
                <InfoItem icon={Package} label="Kapasitas" value={trip.capacity} />
              </div>
            </div>

            {/* Collection Points */}
            <div className="rounded-2xl bg-card p-6 shadow-card mb-6">
              <h2 className="font-semibold text-lg mb-4">Pos Pengumpulan</h2>

              {collectionPoints.length === 0 ? (
                <Empty message="Belum ada pos pengumpulan" />
              ) : (
                <div className="space-y-3">
                  {collectionPoints.map((point) => (
                    <CollectionItem key={point.id} point={point} />
                  ))}
                </div>
              )}
            </div>

            {/* Pickup Points */}
            <div className="rounded-2xl bg-card p-6 shadow-card mb-6">
            <h2 className="font-semibold text-lg mb-4">Pos Pengambilan</h2>

            {pickupPoints.length === 0 ? (
                <Empty message="Belum ada pos pengambilan" />
            ) : (
                <div className="space-y-3">
                {pickupPoints.map((point) => (
                    <PickupItem key={point.id} point={point} />
                ))}
                </div>
            )}
            </div>

            {/* Tracking Map */}
            <div className="rounded-2xl bg-card p-6 shadow-card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Live Tracking</h2>
                <div className="flex gap-2">
                  {!isTracking ? (
                    <Button size="sm" onClick={handleStartTracking} disabled={startingTracking || !active || trip.status === "expired"}>
                      <Navigation className="h-4 w-4 mr-1.5" />
                      {startingTracking ? "Memulai..." : "Mulai Tracking"}
                    </Button>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={handleStopTracking}>
                      <Square className="h-4 w-4 mr-1.5" />
                      Selesai Tracking
                    </Button>
                  )}
                </div>
              </div>

              {isTracking && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs text-emerald-700 font-medium">Tracking aktif — lokasi dikirim otomatis</p>
                </div>
              )}

              {mapReady ? (
                <Suspense fallback={<div className="h-[400px] rounded-xl bg-muted animate-pulse" />}>
                  <TripTrackingMap
                    route={trackingRoute}
                    latest={latestPoint}
                    isTracking={isTracking}
                  />
                </Suspense>
              ) : (
                <div className="h-[300px] rounded-xl bg-muted/50 flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Belum ada data tracking</p>
                    <p className="text-xs text-muted-foreground mt-1">Klik "Mulai Tracking" saat memulai perjalanan</p>
                  </div>
                </div>
              )}
            </div>

            {/* Orders */}
            <TripOrders tripId={trip.id} /></>
        )}
        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Perjalanan</DialogTitle>
              <DialogDescription>
                Hapus permanen perjalanan {trip?.from} → {trip?.to}?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialog(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
      <p>{message}</p>
    </div>
  );
}
