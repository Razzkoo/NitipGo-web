import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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

export default function AdminRoutes() {
  const navigate = useNavigate();
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
            <h1 className="text-2xl font-bold text-foreground">Kota & Rute</h1>
            <p className="text-muted-foreground">Kelola kota yang tersedia di platform</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kota
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-xl bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total Kota</p>
            <p className="text-2xl font-bold text-foreground">{cities.length}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Kota Aktif</p>
            <p className="text-2xl font-bold text-success">{cities.filter(c => c.active).length}</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total Traveler</p>
            <p className="text-2xl font-bold text-primary">{cities.reduce((sum, c) => sum + c.travelers, 0)}</p>
          </div>
        </div>

        {/* City List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
              <tbody>
                {cities.map((city) => (
                  <tr key={city.id} className="border-t border-border hover:bg-muted/30">
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        city.active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                      }`}>
                        {city.active ? "Aktif" : "Nonaktif"}
                      </span>
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
                  </tr>
                ))}
              </tbody>
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
    </MainLayout>
  );
}
