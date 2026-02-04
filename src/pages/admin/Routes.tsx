import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Edit2, Check, X } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const initialCities = [
  { id: 1, name: "Jakarta", province: "DKI Jakarta", active: true, travelers: 245, orders: 1250 },
  { id: 2, name: "Bandung", province: "Jawa Barat", active: true, travelers: 189, orders: 890 },
  { id: 3, name: "Surabaya", province: "Jawa Timur", active: true, travelers: 156, orders: 720 },
  { id: 4, name: "Yogyakarta", province: "DI Yogyakarta", active: true, travelers: 134, orders: 650 },
  { id: 5, name: "Semarang", province: "Jawa Tengah", active: true, travelers: 98, orders: 420 },
  { id: 6, name: "Malang", province: "Jawa Timur", active: true, travelers: 87, orders: 380 },
  { id: 7, name: "Medan", province: "Sumatera Utara", active: true, travelers: 76, orders: 310 },
  { id: 8, name: "Bali", province: "Bali", active: true, travelers: 112, orders: 540 },
  { id: 9, name: "Makassar", province: "Sulawesi Selatan", active: false, travelers: 23, orders: 45 },
  { id: 10, name: "Palembang", province: "Sumatera Selatan", active: false, travelers: 18, orders: 32 },
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
  const [cities, setCities] = useState(initialCities);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCity, setNewCity] = useState({ name: "", province: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState({ name: "", province: "" });

  const handleAddCity = () => {
    if (newCity.name && newCity.province) {
      setCities([...cities, {
        id: Date.now(),
        name: newCity.name,
        province: newCity.province,
        active: true,
        travelers: 0,
        orders: 0,
      }]);
      toast({ title: "Kota Ditambahkan", description: `${newCity.name} berhasil ditambahkan.` });
      setNewCity({ name: "", province: "" });
      setShowAddDialog(false);
    }
  };

  const handleToggleActive = (id: number) => {
    setCities(cities.map(city => 
      city.id === id ? { ...city, active: !city.active } : city
    ));
    const city = cities.find(c => c.id === id);
    toast({
      title: city?.active ? "Kota Dinonaktifkan" : "Kota Diaktifkan",
      description: `${city?.name} telah ${city?.active ? "dinonaktifkan" : "diaktifkan"}.`,
    });
  };

  const handleEdit = (city: any) => {
    setEditingId(city.id);
    setEditValue({ name: city.name, province: city.province });
  };

  const handleSaveEdit = (id: number) => {
    setCities(cities.map(city =>
      city.id === id ? { ...city, ...editValue } : city
    ));
    toast({ title: "Kota Diperbarui" });
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
            <h1 className="text-2xl font-bold text-foreground">Kota & Rute</h1>
            <p className="text-muted-foreground">Kelola kota yang tersedia di platform</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kota
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
            <p className="text-sm text-muted-foreground">Total Kota</p>
            <p className="text-2xl font-bold text-foreground">
              <CountUp end={cities.length} duration={1000} />
            </p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow">
            <p className="text-sm text-muted-foreground">Kota Aktif</p>
            <p className="text-2xl font-bold text-success">
              <CountUp end={cities.filter(c => c.active).length} duration={1000} />
            </p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow">
            <p className="text-sm text-muted-foreground">Total Traveler</p>
            <p className="text-2xl font-bold text-primary">
              <CountUp end={cities.reduce((sum, c) => sum + c.travelers, 0)} duration={1500} />
            </p>
          </div>
        </motion.div>

        {/* City List */}
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
                  <th className="text-left p-4 font-medium text-muted-foreground">Kota</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Provinsi</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Traveler</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Order</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
                {cities.map((city) => (
                  <motion.tr 
                    key={city.id} 
                    variants={staggerItem}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      {editingId === city.id ? (
                        <Input
                          value={editValue.name}
                          onChange={(e) => setEditValue({ ...editValue, name: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">{city.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {editingId === city.id ? (
                        <Input
                          value={editValue.province}
                          onChange={(e) => setEditValue({ ...editValue, province: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        <span className="text-muted-foreground">{city.province}</span>
                      )}
                    </td>
                    <td className="p-4 text-foreground">{city.travelers}</td>
                    <td className="p-4 text-foreground">{city.orders}</td>
                    <td className="p-4">
                      <StatusBadge status={city.active ? "active" : "inactive"} size="sm" />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {editingId === city.id ? (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleSaveEdit(city.id)}>
                              <Check className="h-4 w-4 text-success" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(city)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(city.id)}
                            >
                              {city.active ? "Nonaktifkan" : "Aktifkan"}
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

        {/* Add City Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kota Baru</DialogTitle>
              <DialogDescription>Tambahkan kota baru ke dalam platform NitipGo</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nama Kota</label>
                <Input
                  placeholder="Contoh: Palembang"
                  value={newCity.name}
                  onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Provinsi</label>
                <Input
                  placeholder="Contoh: Sumatera Selatan"
                  value={newCity.province}
                  onChange={(e) => setNewCity({ ...newCity, province: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Batal</Button>
              <Button onClick={handleAddCity}>Tambah</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}