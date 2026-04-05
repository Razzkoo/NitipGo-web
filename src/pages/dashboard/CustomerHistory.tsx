import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Clock,
  Package,
  ArrowRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerLayout } from "@/components/layout/CustomerLayout";

interface HistoryOrder {
  id: string;
  item: string;
  from: string;
  to: string;
  status: "completed" | "cancelled" | "rejected";
  traveler?: string;
  travelerAvatar?: string;
  travelerPhone?: string;
  date: string;
  price: string;
  rating: number;
  hasRated: boolean;
  rejectReason?: string; // optional
}

const historyOrders = [
  {
    id: "ORD-002",
    item: "Oleh-oleh Jogja",
    from: "Yogyakarta",
    to: "Jakarta",
    status: "completed" as const,
    traveler: "Sari Dewi",
    travelerAvatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=sari",
    travelerPhone: "0814-xxxx-5678",
    date: "10 Feb 2024",
    price: "Rp 50.000",
    rating: 0,
    hasRated: false,
  },
  {
    id: "ORD-003",
    item: "Sepatu Adidas",
    from: "Surabaya",
    to: "Jakarta",
    status: "completed" as const,
    traveler: "Budi Santoso",
    travelerAvatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=budi",
    travelerPhone: "0815-xxxx-9012",
    date: "5 Feb 2024",
    price: "Rp 65.000",
    rating: 4,
    hasRated: true,
  },
  {
    id: "ORD-004",
    item: "Elektronik",
    from: "Bandung",
    to: "Jakarta",
    status: "cancelled" as const,
    traveler: "-",
    travelerAvatar: "",
    travelerPhone: "",
    date: "1 Feb 2024",
    price: "Rp 0",
    rating: 0,
    hasRated: false,
  },
  {
    id: "ORD-008",
    item: "Elektronik",
    from: "Yogyakarta",
    to: "Batam",
    status: "rejected" as const,
    traveler: "-", 
    travelerAvatar: "",
    travelerPhone: "",
    date: "14 Feb 2026",
    price: "Rp 0",
    rating: 0,
    hasRated: false,
    rejectReason: "Rute tidak sesuai", 
  },
];

export default function CustomerHistory() {
  const { toast } = useToast();

  const [ratingDialog, setRatingDialog] = useState<{
    open: boolean;
    orderId: string;
    rating: number;
    note: string;
  }>({
    open: false,
    orderId: "",
    rating: 0,
    note: "",
  });

  const [activeTab, setActiveTab] = useState<"all" | "completed" | "cancelled" | "rejected">("all");

// filter history orders sesuai tab
const filteredOrders =
  activeTab === "all"
    ? historyOrders
    : historyOrders.filter(o => o.status === activeTab);

  return (
    <CustomerLayout>
      <div className="p-6 md:p-8 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-lg bg-primary/10 p-2">
                <Clock className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                  Riwayat Order
                </h1>
                <p className="text-sm text-muted-foreground">
                  Lihat riwayat order yang sudah selesai, dibatalkan, atau ditolak
                </p>
              </div>
            </div>
          </div>
        </motion.div>

          <div className="flex gap-2 mb-6">
            {[
              { label: "Semua", status: "all" },
              { label: "Selesai", status: "completed" },
              { label: "Dibatalkan", status: "cancelled" },
              { label: "Ditolak", status: "rejected" },
            ].map(tab => (
              <Button
                key={tab.status}
                size="sm"
                variant={activeTab === tab.status ? "hero" : "outline"}
                onClick={() => setActiveTab(tab.status as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

        {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl bg-card p-5 shadow-card"
            >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* LEFT */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {order.id}
                      </span>
                      <StatusBadge
                        status={order.status}
                        size="sm"
                      />
                    </div>

                    <p className="font-semibold text-lg text-foreground">
                      {order.item}
                    </p>

                     {order.status === "rejected" && order.rejectReason && (
                        <div className="mt-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                          <span className="font-medium">Alasan ditolak:</span> {order.rejectReason}
                        </div>
                      )}

                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>{order.from}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>{order.to}</span>
                    </div>

                    {order.traveler !== "-" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Traveler:{" "}
                        <span className="font-medium text-foreground">
                          {order.traveler}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="text-left md:text-right">
                      <p className="text-sm text-muted-foreground">
                        {order.date}
                      </p>
                      <p className="font-semibold text-primary">
                        {order.price}
                      </p>

                      {order.hasRated && order.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          {Array.from({
                            length: order.rating,
                          }).map((_, j) => (
                            <Star
                              key={j}
                              className="h-3 w-3 fill-warning text-warning"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                     <Button variant="outline" size="sm" asChild>
                    <Link
                      to={
                        order.status === "rejected"
                          ? `/order/${order.id}/rejected`
                          : order.status === "cancelled"
                          ? `/order/${order.id}/cancelled`
                          : `/order/${order.id}`
                      }
                    >
                      Detail
                    </Link>
                    </Button>

                      {order.status === "completed" &&
                        !order.hasRated && (
                          <Button
                            size="sm"
                            onClick={() =>
                              setRatingDialog({
                                open: true,
                                orderId: order.id,
                                rating: 0,
                                note: "",
                              })
                            }
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Beri Rating
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
             </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="Tidak ada order"
              description="Tidak ada order dengan status ini"
            />
          )}
      </div>

      {/* ===== POPUP RATING ===== */}
      <Dialog
        open={ratingDialog.open}
        onOpenChange={(open) =>
          setRatingDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Beri Rating</DialogTitle>
            <DialogDescription>
              Order {ratingDialog.orderId}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center gap-2 my-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                onClick={() =>
                  setRatingDialog((prev) => ({
                    ...prev,
                    rating: i + 1,
                  }))
                }
              >
                <Star
                  className={`h-6 w-6 ${
                    ratingDialog.rating >= i + 1
                      ? "fill-warning text-warning"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Tulis catatan (opsional)"
            value={ratingDialog.note}
            onChange={(e) =>
              setRatingDialog((prev) => ({
                ...prev,
                note: e.target.value,
              }))
            }
          />

          <Button
            className="w-full mt-4"
            onClick={() => {
              toast({
                title: "Rating terkirim",
                description:
                  "Terima kasih atas penilaianmu 🙏",
              });

              setRatingDialog({
                open: false,
                orderId: "",
                rating: 0,
                note: "",
              });
            }}>
            Kirim Rating
          </Button>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
