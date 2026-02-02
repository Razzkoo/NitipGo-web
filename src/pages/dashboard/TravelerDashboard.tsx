import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Plus, 
  Package, 
  Wallet,
  TrendingUp,
  Calendar,
  Star,
  ArrowRight,
  Bell,
  User,
  CheckCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";

// Mock data
const upcomingTrips = [
  {
    id: 1,
    from: "Jakarta",
    to: "Bandung",
    date: "20 Feb 2024",
    orders: 3,
    capacity: "5 kg tersisa",
  },
  {
    id: 2,
    from: "Jakarta",
    to: "Surabaya",
    date: "25 Feb 2024",
    orders: 1,
    capacity: "8 kg tersisa",
  },
];

const pendingOrders = [
  {
    id: "ORD-101",
    customer: "Budi Santoso",
    item: "Sepatu Sneakers",
    weight: "1.5 kg",
    price: "Rp 45.000",
    route: "Jakarta → Bandung",
  },
  {
    id: "ORD-102",
    customer: "Rina Kusuma",
    item: "Buku Koleksi",
    weight: "2 kg",
    price: "Rp 50.000",
    route: "Jakarta → Bandung",
  },
];

const stats = [
  { label: "Total Trip", value: "45", icon: MapPin, color: "text-primary" },
  { label: "Order Selesai", value: "127", icon: Package, color: "text-success" },
  { label: "Saldo", value: "Rp 2.5 jt", icon: Wallet, color: "text-accent" },
  { label: "Rating", value: "4.9", icon: Star, color: "text-warning" },
];

export default function TravelerDashboard() {
  return (
    <MainLayout showFooter={false}>
      <div className="container py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Dashboard Traveler
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola perjalanan dan order Anda di sini.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button className="bg-gradient-to-r from-accent to-accent/90 text-accent-foreground" asChild>
              <Link to="/traveler/trip/new">
                <Plus className="h-5 w-5 mr-1" />
                Tambah Perjalanan
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-card p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Trips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Perjalanan Mendatang</h2>
              <Button variant="ghost" asChild>
                <Link to="/traveler/trips">Semua</Link>
              </Button>
            </div>

            <div className="space-y-4">
              {upcomingTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-4 rounded-xl bg-muted/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{trip.date}</span>
                    </div>
                    <span className="text-sm font-medium text-success">{trip.capacity}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{trip.orders}</span> order masuk
                    </span>
                    <Button variant="soft" size="sm" asChild>
                      <Link to={`/traveler/trip/${trip.id}`}>Kelola</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pending Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Order Menunggu</h2>
              <Button variant="ghost" asChild>
                <Link to="/traveler/orders">Semua</Link>
              </Button>
            </div>

            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{order.id}</span>
                    <span className="text-sm font-medium text-primary">{order.price}</span>
                  </div>
                  <p className="font-semibold text-foreground mb-1">{order.item}</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {order.customer} • {order.weight}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{order.route}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Tolak</Button>
                      <Button size="sm">Terima</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-6 text-accent-foreground"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-accent-foreground/80">Total Saldo</p>
              <p className="text-3xl font-bold mt-1">Rp 2.500.000</p>
              <p className="text-sm text-accent-foreground/70 mt-1">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                +Rp 450.000 bulan ini
              </p>
            </div>
            <Button variant="white" size="lg" asChild>
              <Link to="/traveler/wallet">
                <Wallet className="h-5 w-5 mr-2" />
                Tarik Saldo
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
