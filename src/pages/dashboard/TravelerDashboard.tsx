import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/api";
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
  CheckCircle,
  Clock,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CountUp } from "@/components/ui/CountUp";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnimatedProgress } from "@/components/ui/AnimatedProgress";

type Trip = {
  id: number;
  from: string;
  to: string;
  date: string;
  orders: number;
  capacity: string;
  capacityPercent: number;
};

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
  { label: "Total Trip", value: 45, icon: MapPin, color: "text-primary", bgColor: "bg-primary/10" },
  { label: "Order Selesai", value: 127, icon: Package, color: "text-success", bgColor: "bg-success/10" },
  { label: "Saldo", value: 2500000, prefix: "Rp ", suffix: "", icon: Wallet, color: "text-accent", bgColor: "bg-accent/10", formatK: true },
  { label: "Rating", value: 4.9, decimals: 1, icon: Star, color: "text-warning", bgColor: "bg-warning/10" },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} jt`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}

export default function TravelerDashboard() {
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    api.get("/traveler/trips")
      .then(res => {
    
        setUpcomingTrips((res.data.trips ?? []).slice(0, 2));
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingTrips(false));
  }, []);


  return (
    <DashboardLayout role="traveler">
      <div className="p-6 md:p-8 lg:p-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-primary/10 p-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                Dashboard Traveler
              </h1>
              <p className="text-sm text-muted-foreground">
                Kelola perjalanan dan order Anda di sini.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-card p-5 shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.formatK ? (
                      <>Rp <CountUp end={stat.value / 1000000} decimals={1} duration={1500} /> jt</>
                    ) : (
                      <CountUp 
                        end={stat.value} 
                        decimals={stat.decimals || 0}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                        duration={1500} 
                      />
                    )}
                  </p>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgColor}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

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
                <Link to="/traveler/trip">Semua</Link>
              </Button>
            </div>

            {loadingTrips ? (
                  <p className="text-sm text-muted-foreground">Loading trips...</p>
                ) : upcomingTrips.length > 0 ? (
              <div className="space-y-4">
                {upcomingTrips.map((trip, i) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
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
                      <motion.div 
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10"
                      >
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </motion.div>
                      <div className="flex-1 text-center">
                        <p className="text-xs text-muted-foreground">Ke</p>
                        <p className="font-semibold text-foreground">{trip.to}</p>
                      </div>
                    </div>
                    
                    {/* Animated Progress Bar */}
                    <div className="mb-3">
                      <AnimatedProgress value={trip.capacityPercent} size="sm" />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{trip.orders}</span> order masuk
                      </span>
                      <Button variant="soft" size="sm" asChild>
                        <Link to={`/traveler/trip/${trip.id}`}>Kelola</Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MapPin}
                title="Belum ada perjalanan"
                description="Tambahkan perjalanan Anda dan mulai terima order"
                actionLabel="Tambah Perjalanan"
                actionHref="/traveler/trip/new"
                variant="compact"
              />
            )}
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

            {pendingOrders.length > 0 ? (
              <div className="space-y-4">
                {pendingOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
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
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="Tidak ada order menunggu"
                description="Order baru akan muncul di sini"
                variant="compact"
              />
            )}
          </motion.div>
        </div>

        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          className="mt-6 rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-6 text-accent-foreground relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative">
            <div>
              <p className="text-accent-foreground/80">Total Saldo</p>
              <p className="text-3xl font-bold mt-1">
                Rp <CountUp end={2500000} duration={2000} suffix="" />
              </p>
              <p className="text-sm text-accent-foreground/70 mt-1 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +Rp 450.000 bulan ini
              </p>
            </div>
            <Button variant="white" size="lg" asChild className="shadow-lg">
              <Link to="/traveler/wallet" className="group">
                <Wallet className="h-5 w-5 mr-2" />
                Tarik Saldo
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}