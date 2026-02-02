import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Package, 
  Plus, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  MapPin,
  Star,
  ArrowRight,
  Bell,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";

// Mock data
const recentOrders = [
  {
    id: "ORD-001",
    item: "Sepatu Nike Air Max",
    from: "Jakarta",
    to: "Bandung",
    status: "in_progress",
    traveler: "Andi Pratama",
    date: "15 Feb 2024",
  },
  {
    id: "ORD-002",
    item: "Oleh-oleh Jogja",
    from: "Yogyakarta",
    to: "Jakarta",
    status: "completed",
    traveler: "Sari Dewi",
    date: "10 Feb 2024",
  },
];

const stats = [
  { label: "Total Order", value: "12", icon: Package, color: "text-primary" },
  { label: "Dalam Proses", value: "2", icon: Clock, color: "text-warning" },
  { label: "Selesai", value: "10", icon: CheckCircle, color: "text-success" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Menunggu", className: "bg-warning/20 text-warning" },
  in_progress: { label: "Dalam Proses", className: "bg-info/20 text-info" },
  completed: { label: "Selesai", className: "bg-success/20 text-success" },
};

export default function CustomerDashboard() {
  return (
    <MainLayout showFooter={false}>
      <div className="container py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Dashboard Customer
            </h1>
            <p className="text-muted-foreground mt-1">
              Selamat datang kembali! Kelola pesanan Anda di sini.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="hero" asChild>
              <Link to="/order/new">
                <Plus className="h-5 w-5 mr-1" />
                Buat Order
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-card p-6 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-gradient-primary p-6 text-primary-foreground"
          >
            <Package className="h-10 w-10 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Titip Beli Barang</h3>
            <p className="text-primary-foreground/80 mb-4">
              Minta traveler membelikan barang dari kota lain
            </p>
            <Button variant="white" asChild>
              <Link to="/order/titip-beli">
                Mulai <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-6 text-accent-foreground"
          >
            <MapPin className="h-10 w-10 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Kirim Barang</h3>
            <p className="text-accent-foreground/80 mb-4">
              Titipkan barang Anda ke traveler yang bepergian
            </p>
            <Button variant="white" asChild>
              <Link to="/order/kirim">
                Mulai <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Order Terbaru</h2>
            <Button variant="ghost" asChild>
              <Link to="/orders">Lihat Semua</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-muted-foreground">{order.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].className}`}>
                      {statusConfig[order.status].label}
                    </span>
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
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
