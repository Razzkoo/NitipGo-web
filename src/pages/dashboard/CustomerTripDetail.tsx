import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Star, MapPin, Calendar, Package,
  Shield, Clock, MessageSquare, CheckCircle, Phone, Mail,
  Send, Loader2, Navigation, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import api from "@/lib/api";

interface TripDetail {
  id: number;
  code: string;
  from: string;
  to: string;
  date: string;
  time: string;
  arrivalDate: string;
  arrivalTime: string;
  capacity: string;
  totalCapacity: string;
  capacityRaw: number;
  price: string;
  pricePerKg: number;
  notes: string;
  traveler: {
    id: number;
    name: string;
    phone: string;
    email: string;
    photo: string | null;
    city: string;
    province: string;
  };
  pickup: {
    name: string;
    address: string;
    time: string;
    mapUrl: string | null;
  } | null;
  collection: {
    name: string;
    address: string;
    time: string;
    mapUrl: string | null;
  } | null;
}

const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

function getAvatarUrl(traveler: TripDetail["traveler"]): string {
  if (traveler.photo) return `${BASE_URL}/storage/${traveler.photo}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(traveler.name)}`;
}

export default function CustomerTripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id) fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/trips/${id}/detail`);
      setTrip(res.data.data);
    } catch {
      toast({ title: "Gagal memuat data perjalanan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && trip) {
      toast({
        title: "Pesan Terkirim!",
        description: `Pesan Anda kepada ${trip.traveler.name} telah terkirim.`,
      });
      setMessage("");
      setShowContactDialog(false);
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

  if (!trip) {
    return (
      <CustomerLayout>
        <div className="container py-16 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Perjalanan tidak ditemukan</h2>
          <Button variant="outline" onClick={() => navigate("/customer/trip")}>
            Kembali ke Daftar
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <section className="py-8 md:py-12">
        <div className="container">
          <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Route Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card p-6 shadow-card"
              >
                <div className="flex items-center gap-4 mb-6 rounded-xl bg-muted/50 p-4">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Dari</p>
                    <p className="text-xl font-bold text-foreground">{trip.from}</p>
                    <p className="text-sm text-muted-foreground">{trip.time}</p>
                  </div>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </motion.div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Ke</p>
                    <p className="text-xl font-bold text-foreground">{trip.to}</p>
                    <p className="text-sm text-muted-foreground">{trip.arrivalTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tanggal Berangkat</p>
                      <p className="font-medium">{trip.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Estimasi Tiba</p>
                      <p className="font-medium">{trip.arrivalDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Kapasitas</p>
                      <p className={`font-medium ${trip.capacityRaw > 0 ? "text-success" : "text-destructive"}`}>
                        {trip.capacity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Kontak Traveler</p>
                      <p className="font-medium">{trip.traveler.phone}</p>
                    </div>
                  </div>
                </div>

                {trip.notes && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Catatan Traveler</p>
                    <p className="text-sm">{trip.notes}</p>
                  </div>
                )}
              </motion.div>

              {/* Titik Pengumpulan & Pengambilan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-2xl bg-card p-6 shadow-card"
              >
                <h2 className="text-lg font-semibold mb-4">Lokasi Pengumpulan & Pengambilan</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Collection */}
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Navigation className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pos Pengumpulan</p>
                        <p className="text-sm font-semibold">{trip.collection?.name ?? "Belum ditentukan"}</p>
                      </div>
                    </div>
                    {trip.collection && (
                      <>
                        <p className="text-sm text-muted-foreground mb-1">{trip.collection.address}</p>
                        <p className="text-xs text-muted-foreground">Jam: {trip.collection.time}</p>
                        {trip.collection.mapUrl && (
                          <a href={trip.collection.mapUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                            <ExternalLink className="h-3 w-3" /> Buka Maps
                          </a>
                        )}
                      </>
                    )}
                  </div>

                  {/* Pickup */}
                  <div className="p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pos Pengambilan</p>
                        <p className="text-sm font-semibold">{trip.pickup?.name ?? "Belum ditentukan"}</p>
                      </div>
                    </div>
                    {trip.pickup && (
                      <>
                        <p className="text-sm text-muted-foreground mb-1">{trip.pickup.address}</p>
                        <p className="text-xs text-muted-foreground">Jam: {trip.pickup.time}</p>
                        {trip.pickup.mapUrl && (
                          <a href={trip.pickup.mapUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                            <ExternalLink className="h-3 w-3" /> Buka Maps
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Traveler Profile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-card p-6 shadow-card"
              >
                <h2 className="text-lg font-semibold mb-4">Profil Traveler</h2>
                <div className="flex items-start gap-4">
                  <img
                    src={getAvatarUrl(trip.traveler)}
                    alt={trip.traveler.name}
                    className="h-16 w-16 rounded-full bg-muted object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{trip.traveler.name}</h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <Shield className="h-3 w-3" /> Terverifikasi
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-medium text-foreground">4.9</span>
                      <span>• {trip.traveler.city}, {trip.traveler.province}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-24 rounded-2xl bg-card p-6 shadow-card"
              >
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground">Mulai dari</p>
                  <p className="text-3xl font-bold text-primary">{trip.price}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kapasitas Tersedia</span>
                    <span className={`font-medium ${trip.capacityRaw > 0 ? "text-success" : "text-destructive"}`}>
                      {trip.capacity}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Kapasitas</span>
                    <span className="font-medium">{trip.totalCapacity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimasi Tiba</span>
                    <span className="font-medium">{trip.arrivalTime}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button variant="hero" className="w-full" asChild disabled={trip.capacityRaw <= 0}>
                    <Link to={`/order/new?trip=${trip.id}`}>
                      <Package className="h-5 w-5 mr-2" />
                      Ajukan Order
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowContactDialog(true)}>
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Hubungi Traveler
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Pembayaran aman dengan sistem escrow NitipGo
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hubungi Traveler</DialogTitle>
            <DialogDescription>
              Kirim pesan ke {trip.traveler.name} sebelum mengajukan order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <img
                src={getAvatarUrl(trip.traveler)}
                alt={trip.traveler.name}
                className="h-12 w-12 rounded-full bg-muted object-cover"
              />
              <div>
                <p className="font-semibold">{trip.traveler.name}</p>
                <p className="text-sm text-muted-foreground">{trip.traveler.city}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{trip.traveler.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{trip.traveler.email}</span>
              </div>
            </div>

            <Textarea
              placeholder="Tulis pesan Anda... Contoh: Halo, saya ingin tanya tentang perjalanan ini..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />

            <Button className="w-full" onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Kirim Pesan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}