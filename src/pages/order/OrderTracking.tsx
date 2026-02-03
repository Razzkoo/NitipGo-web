import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, Truck, ArrowRight } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";

// Mock tracking data
const trackingData: Record<string, any> = {
  "ORD-001": {
    id: "ORD-001",
    item: "Sepatu Nike Air Max",
    from: "Jakarta",
    to: "Bandung",
    status: "in_transit",
    traveler: "Andi Pratama",
    currentLocation: "Tol Cipularang KM 45",
    estimatedArrival: "16:00 WIB",
    progress: 65,
    updates: [
      { time: "12:30", status: "Traveler memulai perjalanan", location: "Jakarta" },
      { time: "13:15", status: "Memasuki Tol Cipularang", location: "Padalarang" },
      { time: "14:00", status: "Dalam perjalanan", location: "KM 45 Cipularang" },
    ],
  },
};

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tracking = trackingData[id || ""] || {
    id: id || "Unknown",
    item: "Order",
    from: "Asal",
    to: "Tujuan",
    status: "pending",
    traveler: "Traveler",
    currentLocation: "-",
    estimatedArrival: "-",
    progress: 0,
    updates: [],
  };

  return (
    <MainLayout>
      <section className="py-8 md:py-12">
        <div className="container">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-card p-6 shadow-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">{tracking.id}</p>
                  <h1 className="text-xl font-bold text-foreground">{tracking.item}</h1>
                </div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-info/20 text-info text-sm font-medium">
                  <Truck className="h-4 w-4" />
                  Dalam Perjalanan
                </span>
              </div>

              {/* Route */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Dari</p>
                  <p className="font-semibold text-foreground">{tracking.from}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-xs text-muted-foreground">Ke</p>
                  <p className="font-semibold text-foreground">{tracking.to}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-primary">{tracking.progress}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tracking.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-primary rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-muted-foreground">Lokasi Saat Ini</p>
                    <p className="font-medium text-foreground">{tracking.currentLocation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-muted-foreground">Estimasi Tiba</p>
                    <p className="font-medium text-foreground">{tracking.estimatedArrival}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Live Updates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-card p-6 shadow-card"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6">Update Perjalanan</h2>
              <div className="space-y-4">
                {tracking.updates.map((update: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      </div>
                      {i < tracking.updates.length - 1 && (
                        <div className="w-0.5 h-8 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">{update.status}</p>
                        <span className="text-sm text-muted-foreground">{update.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{update.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <Link to={`/order/${tracking.id}`}>
                  <Package className="h-5 w-5 mr-2" />
                  Detail Order
                </Link>
              </Button>
              <Button variant="hero" className="flex-1">
                <MapPin className="h-5 w-5 mr-2" />
                Lihat di Peta
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
