import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Package, Eye, ArrowRight } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const mockTransactions = [
  { id: "TRX-001", orderId: "ORD-001", customer: "Budi Santoso", traveler: "Andi Pratama", route: "Jakarta → Bandung", amount: "Rp 45.000", commission: "Rp 4.500", status: "completed", date: "15 Feb 2024" },
  { id: "TRX-002", orderId: "ORD-002", customer: "Rina Kusuma", traveler: "Sari Dewi", route: "Yogyakarta → Jakarta", amount: "Rp 50.000", commission: "Rp 5.000", status: "completed", date: "14 Feb 2024" },
  { id: "TRX-003", orderId: "ORD-003", customer: "Maya Putri", traveler: "Dimas Wijaya", route: "Surabaya → Malang", amount: "Rp 30.000", commission: "Rp 3.000", status: "in_progress", date: "15 Feb 2024" },
  { id: "TRX-004", orderId: "ORD-004", customer: "Ahmad Fauzi", traveler: "Andi Pratama", route: "Jakarta → Semarang", amount: "Rp 75.000", commission: "Rp 7.500", status: "pending", date: "15 Feb 2024" },
  { id: "TRX-005", orderId: "ORD-005", customer: "Dewi Lestari", traveler: "Budi Santoso", route: "Bandung → Jakarta", amount: "Rp 35.000", commission: "Rp 3.500", status: "cancelled", date: "13 Feb 2024" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning/20 text-warning" },
  in_progress: { label: "Diproses", className: "bg-info/20 text-info" },
  completed: { label: "Selesai", className: "bg-success/20 text-success" },
  cancelled: { label: "Dibatalkan", className: "bg-destructive/20 text-destructive" },
};

export default function AdminTransactions() {
  const navigate = useNavigate();
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
    <MainLayout showFooter={false}>
      <div className="container py-6 md:py-10">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Transaksi</h1>
            <p className="text-muted-foreground">Monitor semua transaksi platform</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-xl bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total Transaksi</p>
            <p className="text-2xl font-bold text-foreground">{mockTransactions.length}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-bold text-primary">Rp {totalAmount.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total Komisi</p>
            <p className="text-2xl font-bold text-success">Rp {totalCommission.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
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
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Semua" : statusConfig[f]?.label || f}
              </Button>
            ))}
          </div>
        </div>

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card shadow-card overflow-hidden"
        >
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
              <tbody>
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className="border-t border-border hover:bg-muted/30">
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[tx.status].className}`}>
                        {statusConfig[tx.status].label}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTx(tx)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[selectedTx.status].className}`}>
                    {statusConfig[selectedTx.status].label}
                  </span>
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
    </MainLayout>
  );
}
