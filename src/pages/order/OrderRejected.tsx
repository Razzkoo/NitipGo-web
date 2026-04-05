import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { XCircle, ArrowLeft, RefreshCcw, AlertTriangle } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "../../context/OrderContext";

export default function CustomerRejectedOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders } = useOrders();

  const [open, setOpen] = useState(false);
  const [report, setReport] = useState("");

  // Cari order berdasarkan ID
  const order = orders.find((o) => o.id === orderId && o.status === "rejected");

  if (!order) {
    return (
      <DashboardLayout role="customer">
        <div className="p-6 md:p-8 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-center text-muted-foreground">
              Order tidak ditemukan atau bukan order yang ditolak.
            </p>
            <div className="mt-4 text-center">
              <Button onClick={() => navigate("/history")}>Kembali ke History</Button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="customer">
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Order Ditolak</h1>
            <p className="text-sm text-muted-foreground">
              Order ID: <span className="font-medium">{order.id}</span>
            </p>
          </div>
        </motion.div>

        {/* STATUS HIGHLIGHT */}
        <Card className="border-destructive/30 bg-destructive/5">
          <div className="flex gap-4 p-6">
            <AlertTriangle className="h-5 w-5 text-destructive mt-1" />
            <div className="space-y-1">
              <h3 className="font-semibold">Traveler menolak order ini</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Traveler tidak dapat melanjutkan order ini. Kamu dapat membuat order baru atau menghubungi layanan
                pelanggan untuk informasi lebih lanjut.
              </p>
            </div>
          </div>
        </Card>

        {/* ORDER SUMMARY */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Ringkasan Order</h3>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="destructive">Ditolak</Badge>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-muted-foreground">Item</span>
              <span className="font-medium">{order.item}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Rute</span>
              <span className="font-medium">{order.from} → {order.to}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal</span>
              <span className="font-medium">{order.date}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Harga</span>
              <span className="font-medium">{order.price || "Tidak dikenakan biaya"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Alasan Penolakan</span>
              <span className="font-medium text-muted-foreground">{order.rejectReason || "Tidak ada keterangan"}</span>
            </div>
          </div>
        </Card>

        {/* ACTIONS */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button asChild>
            <Link to="/order/new">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Buat Order Baru
            </Link>
          </Button>

          <Button variant="outline" onClick={() => setOpen(true)}>
            Laporkan Masalah
          </Button>

          <Button variant="outline" asChild>
            <Link to="/history">
              Kembali
            </Link>
          </Button>
        </motion.div>

        {/* REPORT MODAL */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Laporkan Masalah</DialogTitle>
              <DialogDescription>
                Ceritakan kendala yang kamu alami agar kami bisa meningkatkan layanan.
              </DialogDescription>
            </DialogHeader>

            <Textarea
              placeholder="Tuliskan laporan kamu di sini..."
              value={report}
              onChange={(e) => setReport(e.target.value)}
              className="min-h-[120px]"
            />

            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button
                disabled={!report.trim()}
                onClick={() => {
                  console.log("Laporan:", report);
                  setOpen(false);
                  setReport("");
                }}
              >
                Kirim Laporan
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}