import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, MapPin, Calendar, Star, ArrowRight, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import api from "@/lib/api";
import fireGif from "@/assets/gif/fire.gif";

interface TripData {
  id: number;
  code: string;
  from: string;
  to: string;
  date: string;
  displayDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  capacity: string;
  capacityRaw: number;
  price: string;
  pricePerKg: number;
  notes: string;
  is_boosted: boolean; 
  canOrder: boolean;
  departureAtRaw: string;
  traveler: {
    id: number;
    name: string;
    phone: string;
    photo: string | null;
    city: string;
  };
  pickup: { name: string; address: string; time: string; mapUrl: string | null } | null;
  collection: { name: string; address: string; time: string; mapUrl: string | null } | null;
}

const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

function getAvatarUrl(traveler: TripData["traveler"]): string {
  if (traveler.photo) return `${BASE_URL}/storage/${traveler.photo}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(traveler.name)}`;
}

export default function Trips() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 6;
  const totalPages = Math.ceil(trips.length / perPage);
  const paginatedTrips = trips.slice((page - 1) * perPage, page * perPage);

  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  const fetchTrips = async (from = "", to = "", date = "") => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (date) params.date = date;

      const res = await api.get("/trips/available", { params });
      setTrips(res.data.data ?? []);
      setCities(res.data.cities ?? []);
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSearch = () => {
    fetchTrips(searchFrom, searchTo, searchDate);
    setPage(1);
  };

  const handleApplyFilter = () => {
    fetchTrips(searchFrom, searchTo, searchDate);
    setShowFilterDialog(false);
    setPage(1);
  };

  const handleResetFilter = () => {
    setSearchFrom("");
    setSearchTo("");
    setSearchDate("");
    fetchTrips();
    setShowFilterDialog(false);
    setPage(1);
  };

  const hasActiveFilters = searchFrom || searchTo || searchDate;

  return (
    <CustomerLayout>
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
              <div>
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
              <div>
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
              <div>
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
                <span className="font-semibold text-foreground">{trips.length}</span> perjalanan ditemukan
              </p>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  {searchFrom && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      Dari: {searchFrom}
                      <button onClick={() => { setSearchFrom(""); fetchTrips("", searchTo, searchDate); }}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {searchTo && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      Ke: {searchTo}
                      <button onClick={() => { setSearchTo(""); fetchTrips(searchFrom, "", searchDate); }}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {searchDate && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      {searchDate}
                      <button onClick={() => { setSearchDate(""); fetchTrips(searchFrom, searchTo, ""); }}>
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

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedTrips.map((trip, i) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group rounded-2xl bg-card p-5 shadow-card transition-all hover:shadow-card-hover"
                  >
                    {/* Traveler Info */}
                      <div className="mb-4 flex items-center gap-3 relative">
                        <img
                          src={getAvatarUrl(trip.traveler)}
                          alt={trip.traveler.name}
                          className="h-12 w-12 rounded-full bg-muted object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{trip.traveler.name}</p>
                          <p className="text-sm text-muted-foreground">{trip.traveler.city}</p>
                        </div>

                        {trip.is_boosted && (
                          <div
                            className="absolute -top-2 -right-1"
                            style={{ transform: "rotate(15deg)", transformOrigin: "bottom center" }}
                          >
                            <img src={fireGif} alt="boosted" className="h-12 w-12 object-contain" />
                          </div>
                        )}
                      </div>

                    {/* Route */}
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-muted/50 p-3">
                      <div className="flex-1 text-center">
                        <p className="text-xs text-muted-foreground">Dari</p>
                        <p className="font-semibold text-foreground">{trip.from}</p>
                      </div>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <ArrowRight className="h-5 w-5 text-primary" />
                        </motion.div>
                      <div className="flex-1 text-center">
                        <p className="text-xs text-muted-foreground">Ke</p>
                        <p className="font-semibold text-foreground">{trip.to}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>Tiba:</span>
                        <span>{trip.arrivalDate}</span>
                      </div>
                      <span className={`font-medium ${trip.capacityRaw > 0 ? "text-success" : "text-destructive"}`}>
                        {trip.capacity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">Mulai dari</span>
                      <span className="text-lg font-bold text-primary">{trip.price}</span>
                    </div>

                    {!trip.canOrder && (
                      <div className="mb-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5">
                        <p className="text-xs text-rose-600 text-center">
                          Sudah melewati batas waktu pemesanan
                        </p>
                      </div>
                    )}
                    {trip.canOrder ? (
                      <Button variant="soft" className="w-full" asChild>
                        <Link to={`/customer/trip/${trip.id}`}>Pilih Traveler</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Sudah Berangkat
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Halaman <span className="font-semibold text-foreground">{page}</span> dari <span className="font-semibold text-foreground">{totalPages}</span>
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {trips.length === 0 && (
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
            </>
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
    </CustomerLayout>
  );
}