import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, ArrowRight, Plus, Plane, Package, CreditCard } from "lucide-react";
import api from "@/lib/api";
import { Dialog, DialogContent, DialogFooter,} from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnimatedProgress } from "@/components/ui/AnimatedProgress";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/hooks/use-toast";

type Trip = {
  id: number;
  from: string;
  to: string;
  date: string;
  orders: number;
  capacity: string;
  capacityPercent: number;
  active: boolean;
  status: string;
};

export default function TripList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [showNoAccountDialog, setShowNoAccountDialog] = useState(false);

  useEffect(() => {
    api.get("/traveler/payout-accounts")
      .then(res => {
        const accounts = res.data.data ?? [];
        setHasAccount(accounts.length > 0);
      })
      .catch(() => setHasAccount(false));
  }, []);

  const handleAddTrip = () => {
    if (hasAccount === false) {
      setShowNoAccountDialog(true);
    } else {
      navigate("/traveler/trip/new");
    }
  };

  useEffect(() => {
    api.get("/traveler/trips")
      .then(res => setTrips(res.data.trips))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="traveler">
      <div className="p-6 md:p-8 lg:p-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-primary/10 p-2">
              <Plane className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                Daftar Perjalanan
              </h1>
              <p className="text-sm text-muted-foreground">
                Kelola perjalananmu dan lihat detail order yang sedang berjalan
              </p>
            </div>
          </div>

          <Button onClick={handleAddTrip} className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Perjalanan
          </Button>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Belum ada perjalanan"
            description="Tambahkan perjalanan pertama Anda"
            actionLabel="Tambah Perjalanan"
            onAction={handleAddTrip}
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            className="grid gap-5 md:grid-cols-2"
          >
            <AnimatePresence>
              {trips.map(trip => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl bg-card p-5 shadow-card hover:shadow-card-hover transition-all ${
                    trip.status === "expired" ? "opacity-70" : ""
                  }`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <StatusBadge status={trip.status === "expired" ? "expired" : trip.active ? "active" : "inactive"} />
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {trip.date}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 text-center">
                      <p className="text-xs text-muted-foreground">Dari</p>
                      <p className="font-semibold">{trip.from}</p>
                    </div>

                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </motion.div>

                    <div className="flex-1 text-center">
                      <p className="text-xs text-muted-foreground">Ke</p>
                      <p className="font-semibold">{trip.to}</p>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Kapasitas</span>
                      <span className="font-medium">{trip.capacity}</span>
                    </div>
                    <AnimatedProgress value={trip.capacityPercent} size="sm" />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {trip.orders} order
                    </span>

                    <div className="flex items-center gap-2">
                      {trip.status === "expired" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await api.delete(`/traveler/trips/${trip.id}`);
                              setTrips((prev) => prev.filter((t) => t.id !== trip.id));
                              toast({ title: "Perjalanan berhasil dihapus" });
                            } catch (err: any) {
                              toast({
                                title: err?.response?.data?.message ?? "Gagal menghapus",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Hapus
                        </Button>
                      )}
                      <Button variant="soft" size="sm" asChild>
                        <Link to={`/traveler/trip/${trip.id}`}>Detail</Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* DIALOG: BELUM PUNYA REKENING */}
      <Dialog open={showNoAccountDialog} onOpenChange={setShowNoAccountDialog}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <CreditCard className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-lg">Rekening Belum Tersedia</h3>
              <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                Anda belum memiliki rekening pembayaran. Customer membutuhkan rekening Anda untuk melakukan pembayaran order. Silakan tambahkan rekening terlebih dahulu.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowNoAccountDialog(false)} className="flex-1">
              Nanti Saja
            </Button>
            <Button onClick={() => navigate("/traveler/wallet")} className="flex-1">
              <CreditCard className="h-4 w-4 mr-1.5" />
              Tambah Rekening
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </DashboardLayout>
  );
}