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
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CountUp } from "@/components/ui/CountUp";
import { EmptyState } from "@/components/ui/EmptyState";

// Mock data
const stats = [
  { 
    label: "Total Transaksi", 
    value: 125500000, 
    change: "+12%",
    positive: true,
    icon: Wallet 
  },
  { 
    label: "Total Customer", 
    value: 8234, 
    change: "+8%",
    positive: true,
    icon: Users 
  },
  { 
    label: "Total Traveler", 
    value: 1542, 
    change: "+15%",
    positive: true,
    icon: MapPin 
  },
  { 
    label: "Order Bulan Ini", 
    value: 2891, 
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

const quickLinks = [
  { 
    href: "/admin/users", 
    icon: Users, 
    title: "Manajemen User", 
    desc: "Kelola akun",
    color: "bg-primary/10",
    iconColor: "text-primary"
  },
  { 
    href: "/admin/transactions", 
    icon: Package, 
    title: "Transaksi", 
    desc: "Monitor order",
    color: "bg-success/10",
    iconColor: "text-success"
  },
  { 
    href: "/admin/routes", 
    icon: MapPin, 
    title: "Kota & Rute", 
    desc: "Kelola lokasi",
    color: "bg-accent/10",
    iconColor: "text-accent"
  },
  { 
    href: "/admin/disputes", 
    icon: AlertTriangle, 
    title: "Dispute", 
    desc: "Tangani masalah",
    color: "bg-warning/10",
    iconColor: "text-warning"
  },
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
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)} M`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} jt`;
  }
  return value.toLocaleString("id-ID");
}

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 lg:p-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
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
              <div className="flex items-center justify-between mb-3">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"
                >
                  <stat.icon className="h-5 w-5 text-primary" />
                </motion.div>
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                  className={`flex items-center text-sm font-medium ${stat.positive ? 'text-success' : 'text-destructive'}`}
                >
                  {stat.positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {stat.change}
                </motion.span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stat.label === "Total Transaksi" ? (
                  <>Rp <CountUp end={stat.value / 1000000} decimals={1} duration={1500} /> jt</>
                ) : (
                  <CountUp end={stat.value} duration={1500} />
                )}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-card"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Aktivitas Terbaru</h2>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        activity.type === 'user' ? 'bg-primary/10' :
                        activity.type === 'order' ? 'bg-success/10' :
                        'bg-warning/10'
                      }`}
                    >
                      {activity.type === 'user' ? <Users className="h-4 w-4 text-primary" /> :
                       activity.type === 'order' ? <CheckCircle className="h-4 w-4 text-success" /> :
                       <AlertTriangle className="h-4 w-4 text-warning" />}
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle}
                title="Tidak ada aktivitas"
                description="Aktivitas terbaru akan muncul di sini"
                variant="compact"
              />
            )}
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
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/20 text-xs font-bold text-warning"
              >
                {pendingVerifications.length}
              </motion.span>
            </div>
            
            {pendingVerifications.length > 0 ? (
              <div className="space-y-3">
                {pendingVerifications.map((item, i) => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.type} • {item.date}</p>
                    </div>
                    <Button size="sm">Review</Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="Tidak ada verifikasi"
                description="Semua user sudah terverifikasi"
                variant="compact"
              />
            )}
            
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link to="/admin/verifications">Lihat Semua</Link>
            </Button>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mt-6 grid gap-4 md:grid-cols-4"
        >
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.href}
              variants={staggerItem}
              whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
            >
              <Link
                to={link.href}
                className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${link.color}`}
                >
                  <link.icon className={`h-6 w-6 ${link.iconColor}`} />
                </motion.div>
                <div>
                  <p className="font-semibold text-foreground">{link.title}</p>
                  <p className="text-sm text-muted-foreground">{link.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}