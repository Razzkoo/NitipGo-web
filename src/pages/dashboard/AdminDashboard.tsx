import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard,
  Users,
  Package,
  MapPin,
  Wallet,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";

// Mock data
const stats = [
  { 
    label: "Total Transaksi", 
    value: "Rp 125.5 jt", 
    change: "+12%",
    positive: true,
    icon: Wallet 
  },
  { 
    label: "Total Customer", 
    value: "8,234", 
    change: "+8%",
    positive: true,
    icon: Users 
  },
  { 
    label: "Total Traveler", 
    value: "1,542", 
    change: "+15%",
    positive: true,
    icon: MapPin 
  },
  { 
    label: "Order Bulan Ini", 
    value: "2,891", 
    change: "-3%",
    positive: false,
    icon: Package 
  },
];

const recentActivity = [
  { type: "user", message: "Budi Santoso mendaftar sebagai traveler", time: "5 menit lalu" },
  { type: "order", message: "Order ORD-1234 selesai dikonfirmasi", time: "12 menit lalu" },
  { type: "dispute", message: "Dispute baru dari customer Rina", time: "30 menit lalu" },
  { type: "user", message: "Maya Putri terverifikasi sebagai traveler", time: "1 jam lalu" },
];

const pendingVerifications = [
  { id: 1, name: "Ahmad Fauzi", type: "Traveler", date: "Hari ini" },
  { id: 2, name: "Dewi Lestari", type: "Traveler", date: "Hari ini" },
  { id: 3, name: "Riko Pratama", type: "Traveler", date: "Kemarin" },
];

export default function AdminDashboard() {
  return (
    <MainLayout showFooter={false}>
      <div className="container py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola platform NitipGo dari sini.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Button variant="outline" asChild>
              <Link to="/admin/settings">
                <Settings className="h-5 w-5 mr-2" />
                Pengaturan
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
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <span className={`flex items-center text-sm font-medium ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                  {stat.positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-card"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Aktivitas Terbaru</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    activity.type === 'user' ? 'bg-primary/10' :
                    activity.type === 'order' ? 'bg-success/10' :
                    'bg-warning/10'
                  }`}>
                    {activity.type === 'user' ? <Users className="h-4 w-4 text-primary" /> :
                     activity.type === 'order' ? <CheckCircle className="h-4 w-4 text-success" /> :
                     <AlertTriangle className="h-4 w-4 text-warning" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pending Verifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Verifikasi Pending</h2>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/20 text-xs font-bold text-warning">
                {pendingVerifications.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingVerifications.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.type} • {item.date}</p>
                  </div>
                  <Button size="sm">Review</Button>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link to="/admin/verifications">Lihat Semua</Link>
            </Button>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 grid gap-4 md:grid-cols-4"
        >
          <Link
            to="/admin/users"
            className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Manajemen User</p>
              <p className="text-sm text-muted-foreground">Kelola akun</p>
            </div>
          </Link>
          
          <Link
            to="/admin/transactions"
            className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Package className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Transaksi</p>
              <p className="text-sm text-muted-foreground">Monitor order</p>
            </div>
          </Link>
          
          <Link
            to="/admin/routes"
            className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <MapPin className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Kota & Rute</p>
              <p className="text-sm text-muted-foreground">Kelola lokasi</p>
            </div>
          </Link>
          
          <Link
            to="/admin/disputes"
            className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Dispute</p>
              <p className="text-sm text-muted-foreground">Tangani masalah</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </MainLayout>
  );
}
