import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Package, MapPin, Clock, Truck, ArrowRight,
  Phone, Loader2, Navigation, RefreshCcw
} from "lucide-react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const TripTrackingMap = lazy(() => import("@/components/map/TripTrackingMap"));

const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

interface TrackingPoint {
  latitude: number;
  longitude: number;
  recorded_at: string;
}

function getAvatar(photo: string | null, name: string) {
  if (photo) return `${BASE_URL}/storage/${photo}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
}

function formatTime(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [trackingData, setTrackingData] = useState<{
    is_tracking: boolean;
    traveler: any;
    trip: any;
    latest: TrackingPoint | null;
    route: TrackingPoint[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customer/orders/${id}`);
      const orderData = res.data.data;
      setOrder(orderData);

      if (orderData.trip_id) {
        await fetchTracking(orderData.trip_id);
      }
    } catch {
      toast({ title: "Gagal memuat data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTracking = async (tripId: number) => {
    try {
      const res = await api.get(`/trips/${tripId}/tracking`);
      const rawRoute: any[] = Array.isArray(res.data.route) ? res.data.route : [];

      const route: TrackingPoint[] = rawRoute
        .map((p) => ({
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
          recorded_at: p.recorded_at ?? "",
        }))
        .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));

      const rawLatest = res.data.latest;
      const latest: TrackingPoint | null = rawLatest
        ? {
            latitude: Number(rawLatest.latitude),
            longitude: Number(rawLatest.longitude),
            recorded_at: rawLatest.recorded_at ?? "",
          }
        : route.length > 0
        ? route[route.length - 1]
        : null;

      setTrackingData({
        is_tracking: res.data.is_tracking ?? false,
        traveler: res.data.traveler,
        trip: res.data.trip,
        latest,
        route,
      });
    } catch {
      setTrackingData(null);
    }
  };

  const handleRefresh = async () => {
    if (!order?.trip_id) return;
    setRefreshing(true);
    await fetchTracking(order.trip_id);
    setRefreshing(false);
    toast({ title: "Data tracking diperbarui" });
  };

  // Auto-refresh setiap 15 detik jika tracking aktif
  useEffect(() => {
    if (!trackingData?.is_tracking || !order?.trip_id) return;

    const interval = setInterval(() => {
      fetchTracking(order.trip_id);
    }, 15000);

    return () => clearInterval(interval);
  }, [trackingData?.is_tracking, order?.trip_id]);

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
          <Button variant="outline" asChild>
            <Link to="/orders">Kembali</Link>
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  const tripData = trackingData?.trip;
  const traveler = trackingData?.traveler;

  return (
    <CustomerLayout>
      <div className="p-6 md:p-8 lg:p-10">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{order.sku}</p>
                <h1 className="text-xl font-bold">{order.name}</h1>
              </div>
              {trackingData?.is_tracking ? (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Tracking
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 text-sm font-medium border border-sky-200">
                  <Truck className="h-4 w-4" />
                  Dalam Perjalanan
                </span>
              )}
            </div>

            {/* Route */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 mb-4">
              <div className="flex-1 text-center">
                <p className="text-xs text-muted-foreground">Dari</p>
                <p className="font-semibold">{tripData?.from ?? order.trip?.city}</p>
              </div>
                <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <ArrowRight className="h-5 w-5 text-primary" />
                </motion.div>
              <div className="flex-1 text-center">
                <p className="text-xs text-muted-foreground">Ke</p>
                <p className="font-semibold">{tripData?.to ?? order.trip?.destination}</p>
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-muted-foreground">Estimasi Tiba</p>
                  <p className="font-medium">
                    {formatDate(tripData?.arrival ?? order.trip?.estimated_arrival_at)},{" "}
                    {formatTime(tripData?.arrival ?? order.trip?.estimated_arrival_at)}
                  </p>
                </div>
              </div>
              {trackingData?.latest && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-muted-foreground">Update Terakhir</p>
                    <p className="font-medium">{formatTime(trackingData.latest.recorded_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Traveler */}
          {traveler && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="rounded-2xl bg-card p-5 shadow-card">
              <h3 className="font-semibold mb-3">Traveler</h3>
              <div className="flex items-center gap-4">
                <img src={getAvatar(traveler.profile_photo, traveler.name)} alt=""
                  className="h-12 w-12 rounded-full bg-muted object-cover" />
                <div className="flex-1">
                  <p className="font-semibold">{traveler.name}</p>
                  {traveler.phone && (
                    <p className="text-sm text-muted-foreground">{traveler.phone}</p>
                  )}
                </div>
                {traveler.phone && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`tel:${traveler.phone}`}><Phone className="h-4 w-4 mr-1" /> Hubungi</a>
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Map */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Peta Perjalanan</h3>
              <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCcw className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Memuat..." : "Refresh"}
              </Button>
            </div>

            {trackingData && (trackingData.route.length > 0 || trackingData.latest) ? (
              <Suspense fallback={<div className="h-[400px] rounded-xl bg-muted animate-pulse" />}>
                <TripTrackingMap
                  route={trackingData.route}
                  latest={trackingData.latest}
                  isTracking={trackingData.is_tracking}
                  travelerName={traveler?.name}
                />
              </Suspense>
            ) : (
              <div className="h-[300px] rounded-xl bg-muted/50 flex items-center justify-center">
                <div className="text-center">
                  <Navigation className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Traveler belum memulai tracking</p>
                  <p className="text-xs text-muted-foreground mt-1">Peta akan muncul ketika traveler mengaktifkan tracking</p>
                </div>
              </div>
            )}

            {trackingData?.is_tracking && (
              <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs text-emerald-700 font-medium">Tracking aktif — lokasi diperbarui otomatis setiap 15 detik</p>
              </div>
            )}
          </motion.div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" asChild>
              <Link to={`/order/${order.id}`}>
                <Package className="h-5 w-5 mr-2" /> Detail Order
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}