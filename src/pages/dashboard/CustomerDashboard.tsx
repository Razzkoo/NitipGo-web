import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Package, 
  Plus, 
  Clock, 
  CheckCircle, 
  MapPin,
  ArrowRight,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CountUp } from "@/components/ui/CountUp";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Mock data
const recentOrders = [
  {
    id: "ORD-001",
    item: "Sepatu Nike Air Max",
    from: "Jakarta",
    to: "Bandung",
    status: "in_progress" as const,
    traveler: "Andi Pratama",
    date: "15 Feb 2024",
  },
  {
    id: "ORD-002",
    item: "Oleh-oleh Jogja",
    from: "Yogyakarta",
    to: "Jakarta",
    status: "completed" as const,
    traveler: "Sari Dewi",
    date: "10 Feb 2024",
  },
];

const stats = [
  { label: "Total Order", value: 12, icon: Package, color: "text-primary", bgColor: "bg-primary/10" },
  { label: "Dalam Proses", value: 2, icon: Clock, color: "text-warning", bgColor: "bg-warning/10" },
  { label: "Selesai", value: 10, icon: CheckCircle, color: "text-success", bgColor: "bg-success/10" },
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

export default function CustomerDashboard() {
  const { toast } = useToast();
  const [showOrderModal, setShowOrderModal] = useState(false);

  return (
    <DashboardLayout role="customer">
      <div className="p-6 md:p-8 lg:p-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Dashboard Customer
            </h1>
            <p className="text-muted-foreground mt-1">
              Selamat datang kembali! Kelola pesanan Anda di sini.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Button variant="hero" asChild className="shadow-lg shadow-accent/30">
              <Link to="/order/new">
                <Plus className="h-5 w-5 mr-1" />
                Buat Order
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-3 mb-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-card p-6 shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    <CountUp end={stat.value} duration={1500} />
                  </p>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-4 md:grid-cols-2 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl bg-gradient-primary p-6 text-primary-foreground cursor-pointer"
          >
            <Link to="/order/new" className="block">
              <Package className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Titip Beli Barang</h3>
              <p className="text-primary-foreground/80 mb-4">
                Minta traveler membelikan barang dari kota lain
              </p>
              <Button variant="white" className="group shadow-lg">
                Mulai <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-6 text-accent-foreground cursor-pointer"
          >
            <Link to="/order/new" className="block">
              <MapPin className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Kirim Barang</h3>
              <p className="text-accent-foreground/80 mb-4">
                Titipkan barang Anda ke traveler yang bepergian
              </p>
              <Button variant="white" className="group shadow-lg">
                Mulai <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Order Terbaru</h2>
            <Button variant="ghost" asChild>
              <Link to="/history">Lihat Semua</Link>
            </Button>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">{order.id}</span>
                      <StatusBadge status={order.status} pulse={order.status === "in_progress"} size="sm" />
                    </div>
                    <p className="font-semibold text-foreground">{order.item}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>{order.from}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>{order.to}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Traveler</p>
                      <p className="font-medium text-foreground">{order.traveler}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/order/${order.id}`}>Detail</Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="Belum ada order"
              description="Mulai buat order pertama Anda dan temukan traveler terpercaya"
              actionLabel="Buat Order"
              actionHref="/order/new"
            />
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}