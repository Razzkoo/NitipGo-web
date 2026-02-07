import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Edit2, Check, X, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CountUp } from "@/components/ui/CountUp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const initialRoutes = [
  { id: 1, fromCity: "Jakarta", toCity: "Bandung", active: true, travelers: 245, orders: 1250 },
  { id: 2, fromCity: "Bandung", toCity: "Jakarta", active: true, travelers: 189, orders: 890 },
  { id: 3, fromCity: "Surabaya", toCity: "Malang", active: true, travelers: 156, orders: 720 },
  { id: 4, fromCity: "Yogyakarta", toCity: "Semarang", active: true, travelers: 134, orders: 650 },
  { id: 5, fromCity: "Semarang", toCity: "Solo", active: true, travelers: 98, orders: 420 },
  { id: 6, fromCity: "Malang", toCity: "Surabaya", active: true, travelers: 87, orders: 380 },
  { id: 7, fromCity: "Medan", toCity: "Padang", active: true, travelers: 76, orders: 310 },
  { id: 8, fromCity: "Bali", toCity: "Jakarta", active: true, travelers: 112, orders: 540 },
  { id: 9, fromCity: "Makassar", toCity: "Manado", active: false, travelers: 23, orders: 45 },
  { id: 10, fromCity: "Palembang", toCity: "Lampung", active: false, travelers: 18, orders: 32 },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export default function AdminRoutes() {
  const { toast } = useToast();
  const [routes, setRoutes] = useState(initialRoutes);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRoute, setNewRoute] = useState({ fromCity: "", toCity: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState({ fromCity: "", toCity: "" });

  const handleAddRoute = () => {
    if (newRoute.fromCity && newRoute.toCity) {
      setRoutes([...routes, {
        id: Date.now(),
        fromCity: newRoute.fromCity,
        toCity: newRoute.toCity,
        active: true,
        travelers: 0,
        orders: 0,
      }]);
      toast({ title: "Rute Ditambahkan", description: `Rute ${newRoute.fromCity} → ${newRoute.toCity} berhasil ditambahkan.` });
      setNewRoute({ fromCity: "", toCity: "" });
      setShowAddDialog(false);
    }
  };

  const handleToggleActive = (id: number) => {
    setRoutes(routes.map(route => 
      route.id === id ? { ...route, active: !route.active } : route
    ));
    const route = routes.find(r => r.id === id);
    toast({
      title: route?.active ? "Rute Dinonaktifkan" : "Rute Diaktifkan",
      description: `Rute ${route?.fromCity} → ${route?.toCity} telah ${route?.active ? "dinonaktifkan" : "diaktifkan"}.`,
    });
  };

  const handleEdit = (route: any) => {
    setEditingId(route.id);
    setEditValue({ fromCity: route.fromCity, toCity: route.toCity });
  };

  const handleSaveEdit = (id: number) => {
    setRoutes(routes.map(route =>
      route.id === id ? { ...route, ...editValue } : route
    ));
    toast({ title: "Rute Diperbarui" });
    setEditingId(null);
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rute Perjalanan</h1>
            <p className="text-muted-foreground">Kelola rute perjalanan yang tersedia di platform</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Rute
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-3 mb-6"
        >
          <div className="rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow">
            <p className="text-sm text-muted-foreground">Total Rute</p>
            <p className="text-2xl font-bold text-foreground">
              <CountUp end={routes.length} duration={1000} />
            </p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow">
            <p className="text-sm text-muted-foreground">Rute Aktif</p>
            <p className="text-2xl font-bold text-success">
              <CountUp end={routes.filter(r => r.active).length} duration={1000} />
            </p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow">
            <p className="text-sm text-muted-foreground">Total Traveler</p>
            <p className="text-2xl font-bold text-primary">
              <CountUp end={routes.reduce((sum, r) => sum + r.travelers, 0)} duration={1500} />
            </p>
          </div>
        </motion.div>

        {/* Route List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card shadow-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Kota Asal</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Kota Tujuan</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Traveler</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Order</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
                {routes.map((route) => (
                  <motion.tr 
                    key={route.id} 
                    variants={staggerItem}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      {editingId === route.id ? (
                        <Input
                          value={editValue.fromCity}
                          onChange={(e) => setEditValue({ ...editValue, fromCity: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{route.fromCity}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {editingId === route.id ? (
                        <Input
                          value={editValue.toCity}
                          onChange={(e) => setEditValue({ ...editValue, toCity: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-primary" />
                          <span className="font-medium text-primary">{route.toCity}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-foreground">{route.travelers}</td>
                    <td className="p-4 text-foreground">{route.orders}</td>
                    <td className="p-4">
                      <StatusBadge status={route.active ? "active" : "inactive"} size="sm" />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {editingId === route.id ? (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleSaveEdit(route.id)}>
                              <Check className="h-4 w-4 text-success" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(route)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(route.id)}
                            >
                              {route.active ? "Nonaktifkan" : "Aktifkan"}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </motion.div>

        {/* Add Route Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Rute Baru</DialogTitle>
              <DialogDescription>Tambahkan rute perjalanan baru ke dalam platform NitipGo</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="from-city">Kota Asal</Label>
                <Input
                  id="from-city"
                  placeholder="Contoh: Jakarta"
                  value={newRoute.fromCity}
                  onChange={(e) => setNewRoute({ ...newRoute, fromCity: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="to-city">Kota Tujuan</Label>
                <Input
                  id="to-city"
                  placeholder="Contoh: Bandung"
                  value={newRoute.toCity}
                  onChange={(e) => setNewRoute({ ...newRoute, toCity: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Batal</Button>
              <Button onClick={handleAddRoute}>Tambah Rute</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
