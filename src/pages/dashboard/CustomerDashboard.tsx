import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight, MapPin, Package, Shield, Clock,
  Star, Users, TrendingUp, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { CountUp } from "@/components/ui/CountUp";
import heroImage from "@/assets/hero-illustration.png";
import api from "@/lib/api";
import fireGif from "@/assets/gif/fire.gif";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripData {
  id:             number;
  code:           string;
  from:           string;
  to:             string;
  displayDate:    string;
  departureTime:  string;
  arrivalDate:    string | null;
  arrivalTime:    string | null;
  capacity:       string;
  capacityRaw:    number;
  price:          string;
  is_boosted:     boolean;
  canOrder:       boolean;
  traveler: {
    id:    number;
    name:  string;
    photo: string | null;
    city:  string;
    phone: string;
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

// ─── Static Data ──────────────────────────────────────────────────────────────

const features = [
  { icon: Shield,  title: "Aman & Terpercaya", description: "Semua traveler terverifikasi dan transaksi dijamin aman dengan sistem escrow." },
  { icon: Clock,   title: "Cepat & Efisien",   description: "Barang dikirim langsung oleh traveler yang sedang bepergian ke tujuan Anda." },
  { icon: MapPin,  title: "Jangkauan Luas",    description: "Ribuan rute perjalanan tersedia dari dan ke berbagai kota di Indonesia." },
];

const howItWorksCustomer = [
  { step: 1, title: "Pilih Layanan",    desc: "Titip beli atau kirim barang" },
  { step: 2, title: "Cari Traveler",    desc: "Temukan traveler ke tujuan" },
  { step: 3, title: "Konfirmasi Order", desc: "Bayar dan tunggu konfirmasi" },
  { step: 4, title: "Terima Barang",    desc: "Ambil di titik temu/mitra pos" },
];

const howItWorksTraveler = [
  { step: 1, title: "Daftar Rute",       desc: "Input jadwal perjalananmu" },
  { step: 2, title: "Terima Order",      desc: "Pilih order yang sesuai" },
  { step: 3, title: "Bawa Barang",       desc: "Antar barang sekalian jalan" },
  { step: 4, title: "Dapat Penghasilan", desc: "Saldo masuk ke akunmu" },
];

const stats = [
  { value: 50,  suffix: "K+", label: "Customer Puas"    },
  { value: 10,  suffix: "K+", label: "Mitra Traveler"   },
  { value: 100, suffix: "+",  label: "Kota Terjangkau"  },
  { value: 4.9, decimals: 1,  label: "Rating Rata-rata" },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerDashboard() {
  const [availableTrips, setAvailableTrips] = useState<TripData[]>([]);

  useEffect(() => {
    api.get("/trips/available")
      .then(res => setAvailableTrips((res.data.data ?? []).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <CustomerLayout showFooter={true}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="container relative py-16 md:py-24 lg:py-32">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <motion.div variants={itemVariants}>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span>Sekalian Jalan, Nitip Barang!</span>
                </div>
              </motion.div>

              <motion.h1 variants={itemVariants}
                className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Kirim Barang <span className="text-gradient-primary">Lebih Mudah</span> dengan Traveler
              </motion.h1>

              <motion.p variants={itemVariants} className="max-w-lg text-lg text-muted-foreground">
                NitipGo mempertemukan Anda dengan traveler yang sedang bepergian ke kota tujuan.
                Hemat biaya, cepat sampai, dan aman terpercaya.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg" asChild className="group shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30">
                  <Link to="/customer/trip">
                    Mulai Sekarang
                    <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/help">Pelajari Lebih Lanjut</Link>
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-6 pt-4">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      <CountUp end={stat.value} suffix={stat.suffix || ""} decimals={stat.decimals || 0} duration={2000} />
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.3 }} className="relative">
              <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img src={heroImage} alt="NitipGo" className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -left-4 bottom-8 hidden md:block">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="rounded-xl bg-card p-4 shadow-card-hover backdrop-blur-sm border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
                      <Shield className="h-5 w-5 text-success" />
                    </div>
                    <div><p className="text-sm font-semibold">100% Aman</p><p className="text-xs text-muted-foreground">Garansi uang kembali</p></div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 1 }}
                className="absolute -right-4 top-8 hidden md:block">
                <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="rounded-xl bg-card p-4 shadow-card-hover backdrop-blur-sm border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <div><p className="text-sm font-semibold">Hemat 50%</p><p className="text-xs text-muted-foreground">Dari ekspedisi biasa</p></div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Kenapa Pilih <span className="text-primary">NitipGo</span>?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Platform jasa titip yang menghubungkan Anda dengan traveler terpercaya
            </p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }} whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group rounded-2xl bg-card p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary transition-colors duration-300">
                  <feature.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Cara Kerja <span className="text-primary">NitipGo</span>
            </h2>
          </motion.div>
          <div className="grid gap-12 lg:grid-cols-2">
            {[
              { title: "Sebagai Customer", icon: Users,  flow: howItWorksCustomer, color: "bg-primary", iconBg: "bg-primary/10", iconColor: "text-primary" },
              { title: "Sebagai Traveler", icon: MapPin, flow: howItWorksTraveler, color: "bg-accent",  iconBg: "bg-accent/20",  iconColor: "text-accent"  },
            ].map((section, si) => (
              <motion.div key={si} initial={{ opacity: 0, x: si === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="rounded-2xl bg-card p-6 shadow-card md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${section.iconBg}`}>
                    <section.icon className={`h-6 w-6 ${section.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold">{section.title}</h3>
                </div>
                <div className="space-y-4">
                  {section.flow.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: si === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${section.color} text-sm font-semibold text-white`}>
                        {item.step}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Perjalanan Tersedia — sama persis dengan Index.tsx ── */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Perjalanan <span className="text-primary">Tersedia</span>
              </h2>
              <p className="mt-2 text-muted-foreground">Traveler siap membawa barang Anda</p>
            </div>
            <Button variant="outline" asChild className="mt-4 md:mt-0">
              {/* Customer sudah login → ke halaman customer */}
              <Link to="/customer/trip">Lihat Semua</Link>
            </Button>
          </motion.div>

          {availableTrips.length === 0 ? (
            /* Skeleton loading */
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl bg-card p-5 shadow-card animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-muted shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-2.5 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-16 bg-muted rounded-xl mb-4" />
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="h-14 bg-muted rounded-lg" />
                    <div className="h-14 bg-muted rounded-lg" />
                  </div>
                  <div className="h-3 bg-muted rounded w-full mb-4" />
                  <div className="h-10 bg-muted rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableTrips.map((trip, i) => (
                <motion.div key={trip.id}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.25 } }}
                  className="group relative rounded-2xl bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">

                  {/* Boosted ring */}
                  {trip.is_boosted && (
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-orange-400/60 pointer-events-none z-10" />
                  )}

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
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
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

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-muted-foreground">Mulai dari</span>
                    <span className="text-lg font-bold text-primary">{trip.price}</span>
                  </div>

                  {/* CTA — customer sudah login → langsung ke detail customer */}
                  <Button variant="soft"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    asChild>
                    <Link to={`/customer/trip/${trip.id}`}>Pilih Traveler</Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-3xl bg-gradient-primary p-8 text-center md:p-12 lg:p-16 relative">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            </div>
            <div className="mx-auto max-w-2xl relative">
              <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
                Siap Mulai Kirim Barang?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Nikmati kemudahan jasa titip dengan NitipGo.
                Gratis untuk customer, dapat penghasilan untuk traveler!
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button variant="white" size="lg" asChild className="shadow-lg hover:shadow-xl">
                  <Link to="/customer/trip" className="group">
                    Buat Order Sekarang
                    <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  asChild>
                  <Link to="/customer/trip">Cari Traveler</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </CustomerLayout>
  );
}