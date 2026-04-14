import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Route, Users, Package } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CountUp } from "@/components/ui/CountUp";
import api from "@/lib/api";

interface RouteData {
  fromCity: string;
  toCity: string;
  total_trips: number;
  travelers: number;
  active_trips: number;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const staggerItem = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export default function AdminRoutes() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [stats, setStats] = useState({
    total_routes: 0, total_trips: 0, active_trips: 0, total_travelers: 0
  });

  useEffect(() => {
    api.get("/admin/routes")
      .then(res => {
        setRoutes(res.data.data ?? []);
        if (res.data.stats) setStats(res.data.stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false)); 
  }, []);

  // Filter route
  const filteredRoutes = routes.filter(r => {
    if (filter === "active") return r.active_trips > 0;
    if (filter === "inactive") return r.active_trips === 0;
    return true;
  });

  const totalTravelers = routes.reduce((sum, r) => sum + r.travelers, 0);
  const totalTrips = routes.reduce((sum, r) => sum + r.total_trips, 0);
  const activeTrips = routes.reduce((sum, r) => sum + r.active_trips, 0);

  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 lg:p-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-primary/10 p-2">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                Rute Perjalanan
              </h1>
              <p className="text-sm text-muted-foreground">
                Daftar rute yang dibuat oleh traveler
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-3 md:grid-cols-3 mb-6"
        >
          {[
            { label: "Total Rute", value: stats.total_routes, icon: <Route className="h-4 w-4" />, suffix: "rute" },
            { label: "Total Perjalanan", value: stats.total_trips, icon: <Package className="h-4 w-4" />, suffix: `trip (${activeTrips} aktif)` },
            { label: "Total Traveler", value: stats.total_travelers, icon: <Users className="h-4 w-4" />, suffix: "orang" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 + 0.15 }}
              className="group rounded-2xl bg-card border border-border/60 p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{stat.label}</span>
                <span className="text-muted-foreground/50 group-hover:text-primary/60 transition-colors">{stat.icon}</span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-semibold tracking-tight text-foreground leading-none">
                  <CountUp key={stat.value} end={stat.value} duration={1000} />
                </p>
                <span className="text-xs text-muted-foreground mb-0.5 leading-none">{stat.suffix}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
              {/* Filter Tabs */}
              <div className="flex gap-2 mb-4">
                {[
                  { key: "all",      label: "Semua Rute" },
                  { key: "active",   label: "Aktif" },
                  { key: "inactive", label: "Tidak Aktif" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as any)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      filter === key
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:border-primary/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : routes.length === 0 ? (
          <div className="rounded-2xl bg-card p-12 shadow-card text-center">
            <Route className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Belum ada rute perjalanan</p>
            <p className="text-xs text-muted-foreground mt-1">Rute akan muncul setelah traveler membuat perjalanan</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden md:block rounded-2xl bg-card shadow-card overflow-hidden"
            >

              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Kota Asal</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Kota Tujuan</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Total Trip</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Trip Aktif</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Traveler</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
                  {filteredRoutes.map((route, i) => (
                    <motion.tr
                      key={`${route.fromCity}-${route.toCity}`}
                      variants={staggerItem}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{route.fromCity}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-primary" />
                          <span className="font-medium text-primary">{route.toCity}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{route.total_trips}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1">
                          {route.active_trips > 0 && (
                            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                          )}
                          {route.active_trips}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{route.travelers}</td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </motion.div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredRoutes.map((route) => (
                <div
                  key={`${route.fromCity}-${route.toCity}`}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{route.fromCity}</span>
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">{route.toCity}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{route.total_trips} trip</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/60" />
                    <span className="flex items-center gap-1">
                      {route.active_trips > 0 && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
                      {route.active_trips} aktif
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/60" />
                    <span>{route.travelers} traveler</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}