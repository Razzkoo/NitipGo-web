import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star, MapPin, Calendar, Package, Shield, Clock, MessageSquare, CheckCircle, Phone, Mail, Send } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock trip data
const mockTrips: Record<string, any> = {
  "1": {
    id: 1,
    traveler: "Andi Pratama",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=andi",
    from: "Jakarta",
    to: "Bandung",
    date: "15 Feb 2024",
    time: "08:00 WIB",
    arrivalTime: "12:00 WIB",
    capacity: "5 kg tersisa",
    totalCapacity: "10 kg",
    rating: 4.9,
    trips: 127,
    price: "Rp 25.000/kg",
    bio: "Traveler berpengalaman dengan rating tinggi. Rutin melakukan perjalanan Jakarta-Bandung setiap minggu.",
    verified: true,
    responseTime: "< 1 jam",
    completionRate: "99%",
    phone: "0813-xxxx-1234",
    email: "andi.p@email.com",
    reviews: [
      { name: "Budi S.", rating: 5, comment: "Barang sampai tepat waktu, kondisi bagus!", date: "10 Feb 2024" },
      { name: "Rina K.", rating: 5, comment: "Komunikasi bagus, sangat recommended!", date: "5 Feb 2024" },
    ],
  },
  "2": {
    id: 2,
    traveler: "Sari Dewi",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sari",
    from: "Surabaya",
    to: "Malang",
    date: "16 Feb 2024",
    time: "09:00 WIB",
    arrivalTime: "11:00 WIB",
    capacity: "3 kg tersisa",
    totalCapacity: "5 kg",
    rating: 4.8,
    trips: 89,
    price: "Rp 20.000/kg",
    bio: "Sering bepergian Surabaya-Malang untuk urusan bisnis. Senang membantu!",
    verified: true,
    responseTime: "< 30 menit",
    completionRate: "98%",
    phone: "0814-xxxx-5678",
    email: "sari.d@email.com",
    reviews: [
      { name: "Dimas W.", rating: 5, comment: "Pelayanan sangat memuaskan!", date: "12 Feb 2024" },
    ],
  },
  "3": {
    id: 3,
    traveler: "Budi Santoso",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=budi",
    from: "Yogyakarta",
    to: "Semarang",
    date: "17 Feb 2024",
    time: "07:00 WIB",
    arrivalTime: "10:00 WIB",
    capacity: "8 kg tersisa",
    totalCapacity: "12 kg",
    rating: 5.0,
    trips: 203,
    price: "Rp 18.000/kg",
    bio: "Top rated traveler dengan pengalaman 3 tahun. Jaminan barang aman sampai tujuan.",
    verified: true,
    responseTime: "< 15 menit",
    completionRate: "100%",
    phone: "0815-xxxx-9012",
    email: "budi.s@email.com",
    reviews: [
      { name: "Maya P.", rating: 5, comment: "Best traveler! Sangat profesional.", date: "14 Feb 2024" },
      { name: "Ahmad F.", rating: 5, comment: "Sudah 5x pakai jasa Mas Budi, selalu puas!", date: "8 Feb 2024" },
    ],
  },
};

// Default for unknown IDs
const defaultTrip = {
  id: 0,
  traveler: "Traveler",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
  from: "Kota Asal",
  to: "Kota Tujuan",
  date: "TBD",
  time: "TBD",
  arrivalTime: "TBD",
  capacity: "5 kg tersisa",
  totalCapacity: "10 kg",
  rating: 4.5,
  trips: 50,
  price: "Rp 25.000/kg",
  bio: "Traveler terpercaya siap membantu pengiriman barang Anda.",
  verified: true,
  responseTime: "< 1 jam",
  completionRate: "95%",
  phone: "0812-xxxx-xxxx",
  email: "traveler@email.com",
  reviews: [],
};

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const trip = mockTrips[id || ""] || defaultTrip;
  
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      toast({
        title: "Pesan Terkirim!",
        description: `Pesan Anda kepada ${trip.traveler} telah terkirim. Mohon tunggu balasan.`,
      });
      setMessage("");
      setShowContactDialog(false);
    }
  };

  return (
    <MainLayout>
      <section className="py-8 md:py-12">
        <div className="container">
          {/* Back button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>
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
                      <p className="text-xs text-muted-foreground">Tanggal</p>
                      <p className="font-medium text-foreground">{trip.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Kapasitas</p>
                      <p className="font-medium text-success">{trip.capacity}</p>
                    </div>
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
                <h2 className="text-lg font-semibold text-foreground mb-4">Profil Traveler</h2>
                <div className="flex items-start gap-4 mb-6">
                  <img
                    src={trip.avatar}
                    alt={trip.traveler}
                    className="h-16 w-16 rounded-full bg-muted"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{trip.traveler}</h3>
                      {trip.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          <Shield className="h-3 w-3" /> Terverifikasi
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        {trip.rating}
                      </span>
                      <span>•</span>
                      <span>{trip.trips} trip selesai</span>
                    </div>
                    <p className="mt-3 text-muted-foreground">{trip.bio}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="text-center">
                    <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Respons</p>
                    <p className="font-medium text-foreground">{trip.responseTime}</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Completion</p>
                    <p className="font-medium text-foreground">{trip.completionRate}</p>
                  </div>
                  <div className="text-center">
                    <Star className="h-5 w-5 text-warning mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="font-medium text-foreground">{trip.rating}/5.0</p>
                  </div>
                </div>
              </motion.div>

              {/* Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-card p-6 shadow-card"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">Ulasan Customer</h2>
                {trip.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {trip.reviews.map((review: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{review.name}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, j) => (
                              <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                        <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Belum ada ulasan</p>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky top-24 rounded-2xl bg-card p-6 shadow-card"
              >
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground">Mulai dari</p>
                  <p className="text-3xl font-bold text-primary">{trip.price}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kapasitas Tersedia</span>
                    <span className="font-medium text-foreground">{trip.capacity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Kapasitas</span>
                    <span className="font-medium text-foreground">{trip.totalCapacity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimasi Tiba</span>
                    <span className="font-medium text-foreground">{trip.arrivalTime}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button variant="hero" className="w-full" asChild>
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

      {/* Contact Traveler Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hubungi Traveler</DialogTitle>
            <DialogDescription>
              Kirim pesan ke {trip.traveler} sebelum mengajukan order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Traveler info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <img
                src={trip.avatar}
                alt={trip.traveler}
                className="h-12 w-12 rounded-full bg-muted"
              />
              <div>
                <p className="font-semibold text-foreground">{trip.traveler}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  <span>{trip.rating}</span>
                  <span>•</span>
                  <span>{trip.trips} trip</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{trip.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{trip.email}</span>
              </div>
            </div>

            {/* Message Input */}
            <div>
              <Textarea
                placeholder="Tulis pesan Anda di sini... Contoh: Halo, saya ingin tanya tentang perjalanan ke Bandung..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Button className="w-full" onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Kirim Pesan
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Pesan akan dikirim melalui sistem NitipGo. Traveler biasanya merespons dalam {trip.responseTime}.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
