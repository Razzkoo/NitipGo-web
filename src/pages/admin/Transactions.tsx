import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Package, Eye, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CountUp } from "@/components/ui/CountUp";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const mockTransactions = [
  { id: "TRX-001", orderId: "ORD-001", customer: "Budi Santoso", traveler: "Andi Pratama", route: "Jakarta → Bandung", amount: "Rp 45.000", commission: "Rp 4.500", status: "completed" as const, date: "15 Feb 2024" },
  { id: "TRX-002", orderId: "ORD-002", customer: "Rina Kusuma", traveler: "Sari Dewi", route: "Yogyakarta → Jakarta", amount: "Rp 50.000", commission: "Rp 5.000", status: "completed" as const, date: "14 Feb 2024" },
  { id: "TRX-003", orderId: "ORD-003", customer: "Maya Putri", traveler: "Dimas Wijaya", route: "Surabaya → Malang", amount: "Rp 30.000", commission: "Rp 3.000", status: "in_progress" as const, date: "15 Feb 2024" },
  { id: "TRX-004", orderId: "ORD-004", customer: "Ahmad Fauzi", traveler: "Andi Pratama", route: "Jakarta → Semarang", amount: "Rp 75.000", commission: "Rp 7.500", status: "pending" as const, date: "15 Feb 2024" },
  { id: "TRX-005", orderId: "ORD-005", customer: "Dewi Lestari", traveler: "Budi Santoso", route: "Bandung → Jakarta", amount: "Rp 35.000", commission: "Rp 3.500", status: "cancelled" as const, date: "13 Feb 2024" },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export default function AdminTransactions() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const filteredTx = mockTransactions.filter((tx) => {
    const matchSearch = tx.id.toLowerCase().includes(search.toLowerCase()) ||
                       tx.customer.toLowerCase().includes(search.toLowerCase()) ||
                       tx.traveler.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || tx.status === filter;
    return matchSearch && matchFilter;
  });

  const totalAmount = mockTransactions.filter(t => t.status === "completed").reduce((sum, t) => sum + parseInt(t.amount.replace(/\D/g, "")), 0);
  const totalCommission = mockTransactions.filter(t => t.status === "completed").reduce((sum, t) => sum + parseInt(t.commission.replace(/\D/g, "")), 0);

  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Transaksi</h1>
            <p className="text-muted-foreground">Monitor semua transaksi platform</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-3 mb-6"
        >
          <div className="rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow">
            <p className="text-sm text-muted-foreground">Total Transaksi</p>
            <p className="text-2xl font-bold text-foreground">
              <CountUp end={mockTransactions.length} duration={1000} />
            </p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow">
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-bold text-primary">
              Rp <CountUp end={totalAmount} duration={1500} />
            </p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow">
            <p className="text-sm text-muted-foreground">Total Komisi</p>
            <p className="text-2xl font-bold text-success">
              Rp <CountUp end={totalCommission} duration={1500} />
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari ID transaksi atau nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "in_progress", "completed", "cancelled"].map((f) => (
              <motion.div key={f} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "Semua" : f === "pending" ? "Pending" : f === "in_progress" ? "Diproses" : f === "completed" ? "Selesai" : "Dibatalkan"}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card shadow-card overflow-hidden"
        >
          {filteredTx.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Rute</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Traveler</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
                  {filteredTx.map((tx) => (
                    <motion.tr 
                      key={tx.id} 
                      variants={staggerItem}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-medium text-foreground">{tx.id}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-foreground">{tx.route}</p>
                      </td>
                      <td className="p-4 text-foreground">{tx.customer}</td>
                      <td className="p-4 text-foreground">{tx.traveler}</td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">{tx.amount}</p>
                        <p className="text-xs text-success">+{tx.commission}</p>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={tx.status} pulse={tx.status === "in_progress"} size="sm" />
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTx(tx)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="Tidak ada transaksi ditemukan"
              description="Coba ubah filter pencarian Anda"
            />
          )}
        </motion.div>

        {/* Transaction Detail Dialog */}
        <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detail Transaksi</DialogTitle>
            </DialogHeader>
            {selectedTx && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <span className="font-medium">{selectedTx.id}</span>
                  <StatusBadge status={selectedTx.status} />
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground">Dari</p>
                    <p className="font-semibold">{selectedTx.route.split(" → ")[0]}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary" />
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground">Ke</p>
                    <p className="font-semibold">{selectedTx.route.split(" → ")[1]}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{selectedTx.customer}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Traveler</p>
                    <p className="font-medium">{selectedTx.traveler}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium text-primary">{selectedTx.amount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Komisi Platform</p>
                    <p className="font-medium text-success">{selectedTx.commission}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tanggal</p>
                    <p className="font-medium">{selectedTx.date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order ID</p>
                    <p className="font-medium">{selectedTx.orderId}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}