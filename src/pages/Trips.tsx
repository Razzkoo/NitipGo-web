import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, MapPin, Calendar, Star, ArrowRight, SlidersHorizontal, X } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock data for trips
const mockTrips = [
  {
    id: 1,
    traveler: "Andi Pratama",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=andi",
    from: "Jakarta",
    to: "Bandung",
    date: "2024-02-15",
    displayDate: "15 Feb 2024",
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
    date: "2024-02-16",
    displayDate: "16 Feb 2024",
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
    date: "2024-02-17",
    displayDate: "17 Feb 2024",
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
    date: "2024-02-18",
    displayDate: "18 Feb 2024",
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
    date: "2024-02-19",
    displayDate: "19 Feb 2024",
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
    date: "2024-02-20",
    displayDate: "20 Feb 2024",
    capacity: "4 kg tersisa",
    rating: 4.9,
    trips: 234,
    price: "Rp 45.000/kg",
  },
];

const cities = [
  "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang",
  "Malang", "Medan", "Makassar", "Bali", "Padang"
];

export default function Trips() {
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    from: "",
    to: "",
    date: "",
  });

  const filteredTrips = mockTrips.filter((trip) => {
    const matchFrom = !appliedFilters.from || trip.from.toLowerCase().includes(appliedFilters.from.toLowerCase());
    const matchTo = !appliedFilters.to || trip.to.toLowerCase().includes(appliedFilters.to.toLowerCase());
    const matchDate = !appliedFilters.date || trip.date === appliedFilters.date;
    return matchFrom && matchTo && matchDate;
  });

  const handleSearch = () => {
    setAppliedFilters({
      from: searchFrom,
      to: searchTo,
      date: searchDate,
    });
  };

  const handleApplyFilter = () => {
    setAppliedFilters({
      from: searchFrom,
      to: searchTo,
      date: searchDate,
    });
    setShowFilterDialog(false);
  };

  const handleResetFilter = () => {
    setSearchFrom("");
    setSearchTo("");
    setSearchDate("");
    setAppliedFilters({ from: "", to: "", date: "" });
    setShowFilterDialog(false);
  };

  const hasActiveFilters = appliedFilters.from || appliedFilters.to || appliedFilters.date;

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
            className="mx-auto max-w-4xl rounded-2xl bg-card p-4 shadow-card md:p-6"
          >
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
              <div className="relative">
                <Label className="text-xs text-muted-foreground mb-1 block">Kota Asal</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Dari mana?"
                    list="cities-from"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="pl-10 h-12"
                  />
                  <datalist id="cities-from">
                    {cities.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="relative">
                <Label className="text-xs text-muted-foreground mb-1 block">Kota Tujuan</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                  <Input
                    placeholder="Ke mana?"
                    list="cities-to"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="pl-10 h-12"
                  />
                  <datalist id="cities-to">
                    {cities.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="relative">
                <Label className="text-xs text-muted-foreground mb-1 block">Tanggal</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button variant="hero" size="lg" className="h-12 w-full md:w-auto" onClick={handleSearch}>
                  <Search className="h-5 w-5 mr-2" />
                  Cari
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredTrips.length}</span> perjalanan ditemukan
              </p>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  {appliedFilters.from && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      Dari: {appliedFilters.from}
                      <button onClick={() => setAppliedFilters({ ...appliedFilters, from: "" })}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {appliedFilters.to && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      Ke: {appliedFilters.to}
                      <button onClick={() => setAppliedFilters({ ...appliedFilters, to: "" })}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {appliedFilters.date && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      {appliedFilters.date}
                      <button onClick={() => setAppliedFilters({ ...appliedFilters, date: "" })}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilterDialog(true)}>
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
                    <span>{trip.displayDate}</span>
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
              <Button variant="outline" onClick={handleResetFilter}>
                Reset Pencarian
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Perjalanan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="filter-from">Kota Asal</Label>
              <Input
                id="filter-from"
                placeholder="Contoh: Jakarta"
                list="cities-filter-from"
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                className="mt-1.5"
              />
              <datalist id="cities-filter-from">
                {cities.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="filter-to">Kota Tujuan</Label>
              <Input
                id="filter-to"
                placeholder="Contoh: Bandung"
                list="cities-filter-to"
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
                className="mt-1.5"
              />
              <datalist id="cities-filter-to">
                {cities.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="filter-date">Tanggal</Label>
              <Input
                id="filter-date"
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={handleResetFilter} className="flex-1">
              Reset
            </Button>
            <Button onClick={handleApplyFilter} className="flex-1">
              Terapkan Filter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
