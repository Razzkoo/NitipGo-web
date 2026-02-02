import { motion } from "framer-motion";
import { Users, MapPin, Package, CreditCard, Search, CheckCircle, Star, Truck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";

const customerSteps = [
  {
    icon: Package,
    title: "Pilih Jenis Layanan",
    description: "Tentukan apakah Anda ingin titip beli barang atau kirim/titip barang ke kota tujuan.",
  },
  {
    icon: Search,
    title: "Cari Traveler",
    description: "Temukan mitra traveler yang akan bepergian ke kota tujuan Anda sesuai tanggal yang diinginkan.",
  },
  {
    icon: CreditCard,
    title: "Konfirmasi & Bayar",
    description: "Isi detail barang, pilih titik pengambilan, dan lakukan pembayaran dengan aman.",
  },
  {
    icon: Truck,
    title: "Tracking Real-time",
    description: "Pantau status pengiriman barang Anda dari mulai diterima hingga sampai tujuan.",
  },
  {
    icon: CheckCircle,
    title: "Terima Barang",
    description: "Ambil barang di titik temu atau mitra pos yang telah ditentukan.",
  },
];

const travelerSteps = [
  {
    icon: Users,
    title: "Daftar & Verifikasi",
    description: "Buat akun sebagai traveler dan lengkapi proses verifikasi identitas untuk mulai menerima order.",
  },
  {
    icon: MapPin,
    title: "Input Rute Perjalanan",
    description: "Masukkan rute perjalanan Anda: kota asal, kota tujuan, tanggal berangkat & tiba.",
  },
  {
    icon: Package,
    title: "Tentukan Kapasitas",
    description: "Atur kapasitas barang yang bisa Anda bawa (dalam kg atau slot) untuk perjalanan tersebut.",
  },
  {
    icon: CheckCircle,
    title: "Terima Order",
    description: "Lihat dan pilih order yang masuk sesuai dengan rute dan kapasitas yang tersedia.",
  },
  {
    icon: CreditCard,
    title: "Selesaikan & Terima Bayaran",
    description: "Antarkan barang ke tujuan dan saldo akan masuk ke akun Anda setelah konfirmasi.",
  },
];

export default function HowItWorks() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl"
          >
            <h1 className="text-4xl font-bold text-foreground md:text-5xl">
              Cara Kerja <span className="text-primary">NitipGo</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Proses mudah dan aman untuk customer maupun traveler. Pahami alurnya dan mulai gunakan layanan kami.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Customer Flow */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Users className="h-4 w-4" />
              <span>Untuk Customer</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Langkah Mudah Kirim Barang
            </h2>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border hidden lg:block" />
            
            <div className="space-y-8">
              {customerSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`flex items-center gap-6 ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                    <div className={`rounded-2xl bg-card p-6 shadow-card inline-block max-w-md ${i % 2 === 0 ? "lg:ml-auto" : "lg:mr-auto"}`}>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary shadow-lg">
                    <step.icon className="h-7 w-7 text-primary-foreground" />
                    <span className="absolute -bottom-6 text-sm font-bold text-primary">{i + 1}</span>
                  </div>
                  
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Traveler Flow */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent mb-4">
              <MapPin className="h-4 w-4" />
              <span>Untuk Traveler</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Dapat Penghasilan Sambil Jalan
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {travelerSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative rounded-2xl bg-card p-6 shadow-card"
              >
                <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {i + 1}
                </div>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20">
                  <step.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl mb-4">
            Siap Mencoba?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Daftar sekarang dan mulai kirim barang atau dapat penghasilan tambahan sebagai traveler.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="lg" asChild>
              <Link to="/register">
                Daftar Sekarang <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/faq">Lihat FAQ</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
