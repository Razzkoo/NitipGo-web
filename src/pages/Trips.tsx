import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, MapPin, Calendar, ArrowRight,
  SlidersHorizontal, X, Loader2, Package,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/lib/api";
import fireGif from "@/assets/gif/fire.gif";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripData {
  id:             number;
  code:           string;
  from:           string;
  to:             string;
  date:           string;
  displayDate:    string;
  departureTime:  string;
  arrivalDate:    string | null;
  arrivalTime:    string | null;
  capacity:       string;
  capacityRaw:    number;
  price:          string;
  pricePerKg:     number;
  notes:          string | null;
  is_boosted:     boolean;
  canOrder:       boolean;
  departureAtRaw: string;
  traveler: {
    id: number; name: string; phone: string;
    photo: string | null; city: string;
  };
  pickup:     { name: string; address: string; time: string | null; mapUrl: string | null } | null;
  collection: { name: string; address: string; time: string | null; mapUrl: string | null } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

function getAvatarUrl(traveler: TripData["traveler"]): string {
  if (traveler.photo) return `${BASE_URL}/storage/${traveler.photo}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(traveler.name)}`;
}

const PER_PAGE = 9;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Trips() {
  const [trips,   setTrips]   = useState<TripData[]>([]);
  const [cities,  setCities]  = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);

  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo,   setSearchTo]   = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const totalPages     = Math.ceil(trips.length / PER_PAGE);
  const paginatedTrips = trips.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const hasFilters     = searchFrom || searchTo || searchDate;

  const fetchTrips = async (from = "", to = "", date = "") => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to)   params.to   = to;
      if (date) params.date = date;
      const res = await api.get("/trips/available", { params });
      setTrips(res.data.data   ?? []);
      setCities(res.data.cities ?? []);
    } catch { setTrips([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleSearch = () => { fetchTrips(searchFrom, searchTo, searchDate); setPage(1); };
  const handleApply  = () => { fetchTrips(searchFrom, searchTo, searchDate); setShowFilter(false); setPage(1); };
  const handleReset  = () => {
    setSearchFrom(""); setSearchTo(""); setSearchDate("");
    fetchTrips(); setShowFilter(false); setPage(1);
  };

  return (
    <MainLayout>

      {/* ── Hero / Search ── */}
      <section className="bg-gradient-hero py-12 md:py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Perjalanan <span className="text-primary">Tersedia</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Temukan traveler yang akan bepergian ke kota tujuan Anda
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mx-auto max-w-4xl rounded-2xl bg-card p-4 shadow-card md:p-6">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Kota Asal</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Dari mana?" list="cf" value={searchFrom}
                    onChange={e => setSearchFrom(e.target.value)} className="pl-10 h-12" />
                  <datalist id="cf">{cities.map(c => <option key={c} value={c} />)}</datalist>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Kota Tujuan</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                  <Input placeholder="Ke mana?" list="ct" value={searchTo}
                    onChange={e => setSearchTo(e.target.value)} className="pl-10 h-12" />
                  <datalist id="ct">{cities.map(c => <option key={c} value={c} />)}</datalist>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Tanggal</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input type="date" value={searchDate}
                    onChange={e => setSearchDate(e.target.value)} className="pl-10 h-12" />
                </div>
              </div>
              <div className="flex items-end">
                <Button variant="hero" size="lg" className="h-12 w-full md:w-auto" onClick={handleSearch}>
                  <Search className="h-5 w-5 mr-2" /> Cari
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="py-12 md:py-16">
        <div className="container">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{trips.length}</span> perjalanan ditemukan
              </p>
              {hasFilters && (
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
            <Button variant="outline" size="sm" onClick={() => setShowFilter(true)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-20">
              <MapPin className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Tidak ada perjalanan ditemukan</h3>
              <p className="text-muted-foreground mb-6">Coba ubah filter pencarian atau cek kembali nanti</p>
              <Button variant="outline" onClick={handleReset}>Reset Pencarian</Button>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {paginatedTrips.map((trip, i) => (
                  <motion.div key={trip.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                    className="group relative rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden">

                    {trip.is_boosted && (
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-orange-400/60 pointer-events-none z-10" />
                    )}

                    <div className="p-5">
                      {/* Traveler */}
                      <div className="flex items-center gap-3 mb-4 relative">
                        <div className="relative shrink-0">
                          <img src={getAvatarUrl(trip.traveler)} alt={trip.traveler.name}
                            className="h-12 w-12 rounded-full bg-muted object-cover ring-2 ring-border" />
                          {trip.is_boosted && (
                            <img src={fireGif} alt="boosted"
                              className="absolute -top-3 -right-2 h-8 w-8 object-contain"
                              style={{ transform: "rotate(15deg)" }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{trip.traveler.name}</p>
                          <p className="text-xs text-muted-foreground">{trip.traveler.city}</p>
                        </div>
                        {trip.is_boosted && (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600 border border-orange-200">
                            🔥 Top
                          </span>
                        )}
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3 mb-4">
                        <div className="flex-1 text-center">
                          <p className="text-[10px] text-muted-foreground mb-0.5">Dari</p>
                          <p className="font-bold text-foreground text-sm">{trip.from}</p>
                        </div>
                        <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                          <ArrowRight className="h-4 w-4 text-primary" />
                        </motion.div>
                        <div className="flex-1 text-center">
                          <p className="text-[10px] text-muted-foreground mb-0.5">Ke</p>
                          <p className="font-bold text-foreground text-sm">{trip.to}</p>
                        </div>
                      </div>

                      {/* Date & Arrival */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="rounded-lg bg-muted/40 px-3 py-2">
                          <p className="text-[10px] text-muted-foreground mb-0.5">Berangkat</p>
                          <p className="text-xs font-semibold text-foreground">{trip.displayDate}</p>
                          <p className="text-[10px] text-muted-foreground">{trip.departureTime} WIB</p>
                        </div>
                        {trip.arrivalDate ? (
                          <div className="rounded-lg bg-muted/40 px-3 py-2">
                            <p className="text-[10px] text-muted-foreground mb-0.5">Estimasi Tiba</p>
                            <p className="text-xs font-semibold text-foreground">{trip.arrivalDate}</p>
                            {trip.arrivalTime && <p className="text-[10px] text-muted-foreground">{trip.arrivalTime} WIB</p>}
                          </div>
                        ) : (
                          <div className="rounded-lg bg-muted/40 px-3 py-2 flex flex-col justify-center">
                            <p className="text-[10px] text-muted-foreground mb-0.5">Kapasitas</p>
                            <p className={`text-xs font-semibold ${trip.capacityRaw > 0 ? "text-success" : "text-destructive"}`}>
                              {trip.capacity}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Pickup/Collection preview */}
                      {(trip.pickup || trip.collection) && (
                        <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2 mb-3 space-y-1">
                          {trip.pickup && (
                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0 mt-0.5 text-primary" />
                              <span className="truncate">
                                Titik ambil: <span className="font-medium text-foreground">{trip.pickup.name}</span>
                                {trip.pickup.time ? ` · ${trip.pickup.time}` : ""}
                              </span>
                            </div>
                          )}
                          {trip.collection && (
                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                              <Package className="h-3 w-3 shrink-0 mt-0.5 text-accent" />
                              <span className="truncate">
                                Titik pengumpulan: <span className="font-medium text-foreground">{trip.collection.name}</span>
                                {trip.collection.time ? ` · ${trip.collection.time}` : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground">Mulai dari</span>
                        <span className="text-lg font-bold text-primary">{trip.price}</span>
                      </div>

                      {!trip.canOrder && (
                        <div className="mb-2.5 rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-center">
                          <p className="text-xs text-rose-600">Sudah melewati batas waktu pemesanan</p>
                        </div>
                      )}

                      {/* Lihat Detail — public, tidak butuh login */}
                      <Button variant="soft"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        asChild>
                        <Link to={`/perjalanan/${trip.id}`}>
                          Lihat Detail
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button disabled={page === 1}
                    onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition">
                    <ArrowRight className="h-4 w-4 rotate-180" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={`h-9 w-9 rounded-xl text-sm font-semibold transition-all ${
                          p === page
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted border border-border"
                        }`}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <button disabled={page === totalPages}
                    onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Filter Dialog */}
      <Dialog open={showFilter} onOpenChange={setShowFilter}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Filter Perjalanan</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Kota Asal</Label>
              <Input placeholder="Contoh: Jakarta" list="cf2" value={searchFrom}
                onChange={e => setSearchFrom(e.target.value)} />
              <datalist id="cf2">{cities.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div className="space-y-1.5">
              <Label>Kota Tujuan</Label>
              <Input placeholder="Contoh: Bandung" list="ct2" value={searchTo}
                onChange={e => setSearchTo(e.target.value)} />
              <datalist id="ct2">{cities.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal</Label>
              <Input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
            <Button onClick={handleApply} className="flex-1">Terapkan</Button>
          </div>
        </DialogContent>
      </Dialog>

    </MainLayout>
  );
}