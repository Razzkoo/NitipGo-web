import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Shield, MapPin,
  Package, Clock, CheckCircle, MessageSquare,
  Loader2, AlertCircle, Calendar, Phone, Mail,
  Send, ExternalLink,
} from "lucide-react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import fireGif from "@/assets/gif/fire.gif";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripDetail {
  id:             number;
  code:           string;
  from:           string;
  to:             string;
  date:           string;
  time:           string;
  arrivalDate:    string | null;
  arrivalTime:    string | null;
  capacity:       string;
  totalCapacity:  string;
  capacityRaw:    number;
  price:          string;
  pricePerKg:     number;
  notes:          string | null;
  is_boosted:     boolean;
  traveler: {
    id:       number;
    name:     string;
    phone:    string;
    email:    string;
    photo:    string | null;
    city:     string;
    province: string | null;
  };
  pickup:     { name: string; address: string; time: string | null; mapUrl: string | null } | null;
  collection: { name: string; address: string; time: string | null; mapUrl: string | null } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

function getAvatarUrl(traveler: TripDetail["traveler"]): string {
  if (traveler.photo) return `${BASE_URL}/storage/${traveler.photo}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(traveler.name)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerTripDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [trip,        setTrip]       = useState<TripDetail | null>(null);
  const [loading,     setLoading]    = useState(true);
  const [notFound,    setNotFound]   = useState(false);
  const [showContact, setShowContact]= useState(false);
  const [message,     setMessage]    = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/trips/${id}/detail`)
      .then(res => setTrip(res.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendMessage = () => {
    if (!message.trim() || !trip) return;
    toast({
      title: "Pesan Terkirim!",
      description: `Pesan Anda kepada ${trip.traveler.name} telah terkirim.`,
    });
    setMessage("");
    setShowContact(false);
  };

  // ── States ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-9 w-9 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  if (notFound || !trip) {
    return (
      <CustomerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground/40" />
          <h2 className="text-xl font-semibold">Perjalanan tidak ditemukan</h2>
          <Button variant="outline" onClick={() => navigate("/customer/trip")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Daftar
          </Button>
        </div>
      </CustomerLayout>
    );
  }

  const isFull = trip.capacityRaw <= 0;

  return (
    <CustomerLayout>
      <section className="py-8 md:py-12">
        <div className="container max-w-5xl">

          {/* Back */}
          <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>

          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

            {/* ── LEFT ─────────────────────────────────────────────────── */}
            <div className="space-y-5 min-w-0">

              {/* ── Route Card ── */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card shadow-card p-6">

                {/* Boosted banner — sama persis dengan TripDetail public */}
                {trip.is_boosted && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200">
                    <img src={fireGif} alt="boosted" className="h-6 w-6 object-contain shrink-0" />
                    <p className="text-xs font-semibold text-orange-700">
                      Traveler Terpilih — Direkomendasikan oleh NitipGo
                    </p>
                  </div>
                )}

                {/* Route */}
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4 mb-5">
                  <div className="flex-1 text-center min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Dari</p>
                    <p className="text-lg font-bold text-foreground truncate">{trip.from}</p>
                    <p className="text-sm text-muted-foreground">{trip.time}</p>
                  </div>
                  <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div className="flex-1 text-center min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Ke</p>
                    <p className="text-lg font-bold text-foreground truncate">{trip.to}</p>
                    {trip.arrivalTime && (
                      <p className="text-sm text-muted-foreground">{trip.arrivalTime}</p>
                    )}
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-muted/40 p-3 flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">Tanggal</p>
                      <p className="text-xs font-semibold text-foreground leading-tight">{trip.date}</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3 flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">Estimasi Tiba</p>
                      <p className="text-xs font-semibold text-foreground leading-tight">{trip.arrivalDate ?? "-"}</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3 flex items-start gap-2">
                    <Package className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">Kapasitas</p>
                      <p className={`text-xs font-semibold leading-tight ${!isFull ? "text-success" : "text-destructive"}`}>
                        {trip.capacity}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3 flex items-start gap-2">
                    <Package className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">Total</p>
                      <p className="text-xs font-semibold text-foreground leading-tight">{trip.totalCapacity}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Traveler Profile ── */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
                className="rounded-2xl bg-card shadow-card p-6">
                <h2 className="text-lg font-semibold mb-4">Profil Traveler</h2>

                <div className="flex items-start gap-4 mb-5">
                  <div className="relative shrink-0">
                    <img src={getAvatarUrl(trip.traveler)} alt={trip.traveler.name}
                      className="h-16 w-16 rounded-full bg-muted object-cover ring-2 ring-border" />
                    {/* Fire badge di foto — sama seperti TripDetail */}
                    {trip.is_boosted && (
                      <img src={fireGif} alt="boosted"
                        className="absolute -top-2 -right-1 h-7 w-7 object-contain"
                        style={{ transform: "rotate(15deg)" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-semibold text-foreground">{trip.traveler.name}</h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary shrink-0">
                        <Shield className="h-3 w-3" /> Terverifikasi
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {trip.traveler.city}{trip.traveler.province ? `, ${trip.traveler.province}` : ""}
                    </p>

                    {/* Kontak langsung tampil — tidak perlu login */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-sm text-foreground font-medium">{trip.traveler.phone}</span>
                      </div>
                      {trip.traveler.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-sm text-foreground font-medium">{trip.traveler.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted/50 p-4">
                  {[
                    { icon: Shield,        label: "Status",  value: "Terverifikasi", color: "text-primary" },
                    { icon: CheckCircle,   label: "Jaminan", value: "Escrow",        color: "text-success" },
                    { icon: MessageSquare, label: "Chat",    value: "Tersedia",      color: "text-accent"  },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <item.icon className={`h-5 w-5 mx-auto mb-1.5 ${item.color}`} />
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      <p className="text-xs font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ── Pickup & Collection ── */}
              {(trip.pickup || trip.collection) && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}
                  className="rounded-2xl bg-card shadow-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Titik Ambil &amp; Serah</h2>
                  <div className="space-y-3">

                    {trip.pickup && (
                      <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            <p className="text-sm font-semibold text-foreground">Titik Ambil Barang</p>
                          </div>
                          {trip.pickup.time && (
                            <span className="text-xs text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded-full">
                              {trip.pickup.time} WIB
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground">{trip.pickup.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{trip.pickup.address}</p>
                        {trip.pickup.mapUrl && (
                          <a href={trip.pickup.mapUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                            <ExternalLink className="h-3 w-3" /> Buka Maps
                          </a>
                        )}
                      </div>
                    )}

                    {trip.collection && (
                      <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-accent shrink-0" />
                            <p className="text-sm font-semibold text-foreground">Titik Serah Barang</p>
                          </div>
                          {trip.collection.time && (
                            <span className="text-xs text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded-full">
                              {trip.collection.time} WIB
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground">{trip.collection.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{trip.collection.address}</p>
                        {trip.collection.mapUrl && (
                          <a href={trip.collection.mapUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                            <ExternalLink className="h-3 w-3" /> Buka Maps
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Notes ── */}
              {trip.notes && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
                  className="rounded-2xl bg-card shadow-card p-6">
                  <h2 className="text-lg font-semibold mb-3">Catatan dari Traveler</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{trip.notes}</p>
                </motion.div>
              )}
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="sticky top-24 space-y-4">

                {/* Price & CTA */}
                <div className="rounded-2xl bg-card shadow-card p-5">

                  <div className="text-center pb-4 mb-4 border-b border-border">
                    <p className="text-xs text-muted-foreground mb-1">Mulai dari</p>
                    <p className="text-3xl font-bold text-primary">{trip.price}</p>
                  </div>

                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground shrink-0">Kapasitas</span>
                      <span className={`text-xs font-semibold text-right ${!isFull ? "text-success" : "text-destructive"}`}>
                        {trip.capacity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground shrink-0">Total</span>
                      <span className="text-xs font-semibold text-foreground text-right">{trip.totalCapacity}</span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs text-muted-foreground shrink-0">Berangkat</span>
                      <span className="text-xs font-semibold text-foreground text-right leading-tight">
                        {trip.date}<br />
                        <span className="text-muted-foreground font-normal">{trip.time}</span>
                      </span>
                    </div>
                    {trip.arrivalDate && (
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs text-muted-foreground shrink-0">Est. Tiba</span>
                        <span className="text-xs font-semibold text-foreground text-right leading-tight">
                          {trip.arrivalDate}
                          {trip.arrivalTime && (
                            <><br /><span className="text-muted-foreground font-normal">{trip.arrivalTime}</span></>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA — langsung ke order, tanpa redirect login */}
                  <div className="space-y-2.5">
                    {isFull ? (
                      <Button variant="outline" className="w-full" disabled>
                        Kapasitas Penuh
                      </Button>
                    ) : (
                      <Button variant="hero" className="w-full" asChild>
                        <Link to={`/order/new?trip=${trip.id}`}>
                          <Package className="h-4 w-4 mr-2" />
                          Ajukan Order
                        </Link>
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Pembayaran aman dengan sistem escrow NitipGo
                  </p>
                </div>

                {/* Tips */}
                <div className="rounded-2xl bg-muted/40 border border-border/50 p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Tips Sebelum Order</h3>
                  <div className="space-y-2.5">
                    {[
                      "Pastikan kapasitas mencukupi barang Anda",
                      "Cek titik ambil & serah sesuai lokasi Anda",
                      "Pembayaran melalui sistem escrow yang aman",
                      "Barang diasuransikan selama perjalanan",
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Contact Dialog ── */}
      <Dialog open={showContact} onOpenChange={setShowContact}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hubungi Traveler</DialogTitle>
            <DialogDescription>
              Kirim pesan kepada {trip.traveler.name} sebelum mengajukan order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <img src={getAvatarUrl(trip.traveler)} alt={trip.traveler.name}
                className="h-12 w-12 rounded-full bg-muted object-cover" />
              <div>
                <p className="font-semibold text-foreground">{trip.traveler.name}</p>
                <p className="text-sm text-muted-foreground">{trip.traveler.city}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span className="text-foreground">{trip.traveler.phone}</span>
              </div>
              {trip.traveler.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground">{trip.traveler.email}</span>
                </div>
              )}
            </div>
            <Textarea placeholder="Tulis pesan Anda... Contoh: Halo, saya ingin tanya tentang perjalanan ini..."
              value={message} onChange={e => setMessage(e.target.value)} rows={4} />
            <Button className="w-full" onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="h-4 w-4 mr-2" /> Kirim Pesan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </CustomerLayout>
  );
}