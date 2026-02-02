import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, MapPin, Calendar, Star, ArrowRight, Filter, SlidersHorizontal } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock data for trips
const mockTrips = [
  {
    id: 1,
    traveler: "Andi Pratama",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=andi",
    from: "Jakarta",
    to: "Bandung",
    date: "15 Feb 2024",
    capacity: "5 kg tersisa",
    rating: 4.9,
    trips: 127,
    price: "Rp 25.000/kg",
  },
  {
    id: 2,
    traveler: "Sari Dewi",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sari",
    from: "Surabaya",
    to: "Malang",
    date: "16 Feb 2024",
    capacity: "3 kg tersisa",
    rating: 4.8,
    trips: 89,
    price: "Rp 20.000/kg",
  },
  {
    id: 3,
    traveler: "Budi Santoso",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=budi",
    from: "Yogyakarta",
    to: "Semarang",
    date: "17 Feb 2024",
    capacity: "8 kg tersisa",
    rating: 5.0,
    trips: 203,
    price: "Rp 18.000/kg",
  },
  {
    id: 4,
    traveler: "Rina Kusuma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rina",
    from: "Jakarta",
    to: "Surabaya",
    date: "18 Feb 2024",
    capacity: "10 kg tersisa",
    rating: 4.7,
    trips: 156,
    price: "Rp 35.000/kg",
  },
  {
    id: 5,
    traveler: "Dimas Wijaya",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dimas",
    from: "Medan",
    to: "Padang",
    date: "19 Feb 2024",
    capacity: "6 kg tersisa",
    rating: 4.6,
    trips: 78,
    price: "Rp 30.000/kg",
  },
  {
    id: 6,
    traveler: "Maya Putri",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya",
    from: "Bali",
    to: "Jakarta",
    date: "20 Feb 2024",
    capacity: "4 kg tersisa",
    rating: 4.9,
    trips: 234,
    price: "Rp 45.000/kg",
  },
];

export default function Trips() {
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  const filteredTrips = mockTrips.filter((trip) => {
    const matchFrom = !searchFrom || trip.from.toLowerCase().includes(searchFrom.toLowerCase());
    const matchTo = !searchTo || trip.to.toLowerCase().includes(searchTo.toLowerCase());
    return matchFrom && matchTo;
  });

  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-hero py-12 md:py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Perjalanan <span className="text-primary">Tersedia</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Temukan traveler yang akan bepergian ke kota tujuan Anda
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-3xl rounded-2xl bg-card p-4 shadow-card md:p-6"
          >
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Kota asal"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                <Input
                  placeholder="Kota tujuan"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button variant="hero" size="lg" className="h-12">
                <Search className="h-5 w-5 mr-2" />
                Cari
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredTrips.length}</span> perjalanan ditemukan
            </p>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group rounded-2xl bg-card p-5 shadow-card transition-all hover:shadow-card-hover"
              >
                {/* Traveler Info */}
                <div className="mb-4 flex items-center gap-3">
                  <img
                    src={trip.avatar}
                    alt={trip.traveler}
                    className="h-12 w-12 rounded-full bg-muted"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{trip.traveler}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span>{trip.rating}</span>
                      <span>•</span>
                      <span>{trip.trips} trip</span>
                    </div>
                  </div>
                </div>

                {/* Route */}
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-muted/50 p-3">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground">Dari</p>
                    <p className="font-semibold text-foreground">{trip.from}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground">Ke</p>
                    <p className="font-semibold text-foreground">{trip.to}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{trip.date}</span>
                  </div>
                  <span className="font-medium text-success">{trip.capacity}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Mulai dari</span>
                  <span className="text-lg font-bold text-primary">{trip.price}</span>
                </div>

                {/* Action */}
                <Button variant="soft" className="w-full" asChild>
                  <Link to={`/perjalanan/${trip.id}`}>Pilih Traveler</Link>
                </Button>
              </motion.div>
            ))}
          </div>

          {filteredTrips.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Tidak ada perjalanan ditemukan
              </h3>
              <p className="text-muted-foreground mb-6">
                Coba ubah filter pencarian atau cek kembali nanti
              </p>
              <Button variant="outline" onClick={() => { setSearchFrom(""); setSearchTo(""); }}>
                Reset Pencarian
              </Button>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
