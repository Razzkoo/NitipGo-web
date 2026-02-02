import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Package, Shield, Clock, Star, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import heroImage from "@/assets/hero-illustration.png";

// Mock data for available trips
const availableTrips = [
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
  },
];

const features = [
  {
    icon: Shield,
    title: "Aman & Terpercaya",
    description: "Semua traveler terverifikasi dan transaksi dijamin aman dengan sistem escrow.",
  },
  {
    icon: Clock,
    title: "Cepat & Efisien",
    description: "Barang dikirim langsung oleh traveler yang sedang bepergian ke tujuan Anda.",
  },
  {
    icon: MapPin,
    title: "Jangkauan Luas",
    description: "Ribuan rute perjalanan tersedia dari dan ke berbagai kota di Indonesia.",
  },
];

const howItWorksCustomer = [
  { step: 1, title: "Pilih Layanan", desc: "Titip beli atau kirim barang" },
  { step: 2, title: "Cari Traveler", desc: "Temukan traveler ke tujuan" },
  { step: 3, title: "Konfirmasi Order", desc: "Bayar dan tunggu konfirmasi" },
  { step: 4, title: "Terima Barang", desc: "Ambil di titik temu/mitra pos" },
];

const howItWorksTraveler = [
  { step: 1, title: "Daftar Rute", desc: "Input jadwal perjalananmu" },
  { step: 2, title: "Terima Order", desc: "Pilih order yang sesuai" },
  { step: 3, title: "Bawa Barang", desc: "Antar barang sekalian jalan" },
  { step: 4, title: "Dapat Penghasilan", desc: "Saldo masuk ke akunmu" },
];

const stats = [
  { value: "50K+", label: "Customer Puas" },
  { value: "10K+", label: "Mitra Traveler" },
  { value: "100+", label: "Kota Terjangkau" },
  { value: "4.9", label: "Rating Rata-rata" },
];

export default function Index() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container py-16 md:py-24 lg:py-32">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Package className="h-4 w-4" />
                <span>Sekalian Jalan, Nitip Barang!</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Kirim Barang <span className="text-gradient-primary">Lebih Mudah</span> dengan Traveler
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground">
                NitipGo mempertemukan Anda dengan traveler yang sedang bepergian ke kota tujuan. 
                Hemat biaya, cepat sampai, dan aman terpercaya.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/register">
                    Mulai Sekarang <ArrowRight className="ml-1 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/cara-kerja">Pelajari Lebih Lanjut</Link>
                </Button>
              </div>
              {/* Stats */}
              <div className="flex flex-wrap gap-6 pt-4">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={heroImage}
                  alt="NitipGo - Traveler membawa paket"
                  className="w-full h-auto"
                />
              </div>
              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute -left-4 bottom-8 hidden rounded-xl bg-card p-4 shadow-card-hover md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
                    <Shield className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">100% Aman</p>
                    <p className="text-xs text-muted-foreground">Garansi uang kembali</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="absolute -right-4 top-8 hidden rounded-xl bg-card p-4 shadow-card-hover md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Hemat 50%</p>
                    <p className="text-xs text-muted-foreground">Dari ekspedisi biasa</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Kenapa Pilih <span className="text-primary">NitipGo</span>?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Platform jasa titip yang menghubungkan Anda dengan traveler terpercaya
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-2xl bg-card p-6 shadow-card transition-all hover:shadow-card-hover"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary">
                  <feature.icon className="h-7 w-7 text-primary transition-colors group-hover:text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Cara Kerja <span className="text-primary">NitipGo</span>
            </h2>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Customer Flow */}
            <div className="rounded-2xl bg-card p-6 shadow-card md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Sebagai Customer</h3>
              </div>
              <div className="space-y-4">
                {howItWorksCustomer.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Traveler Flow */}
            <div className="rounded-2xl bg-card p-6 shadow-card md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Sebagai Traveler</h3>
              </div>
              <div className="space-y-4">
                {howItWorksTraveler.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Trips Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Perjalanan <span className="text-primary">Tersedia</span>
              </h2>
              <p className="mt-2 text-muted-foreground">
                Traveler siap membawa barang Anda
              </p>
            </div>
            <Button variant="outline" asChild className="mt-4 md:mt-0">
              <Link to="/perjalanan">Lihat Semua</Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableTrips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
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
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Tanggal</p>
                    <p className="font-medium text-foreground">{trip.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Kapasitas</p>
                    <p className="font-medium text-success">{trip.capacity}</p>
                  </div>
                </div>

                {/* Action */}
                <Button variant="soft" className="mt-4 w-full" asChild>
                  <Link to={`/perjalanan/${trip.id}`}>Lihat Detail</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="overflow-hidden rounded-3xl bg-gradient-primary p-8 text-center md:p-12 lg:p-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-2xl"
            >
              <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
                Siap Mulai Kirim atau Jadi Traveler?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Daftar sekarang dan nikmati kemudahan jasa titip dengan NitipGo. 
                Gratis untuk customer, dapat penghasilan untuk traveler!
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button variant="white" size="lg" asChild>
                  <Link to="/register">
                    Daftar Gratis <ArrowRight className="ml-1 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link to="/daftar-traveler">Jadi Traveler</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
