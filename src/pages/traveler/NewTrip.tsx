import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Package, ArrowRight, CheckCircle, Plus, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const cities = [
  "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang",
  "Malang", "Medan", "Makassar", "Bali", "Palembang"
];

interface PickupPoint {
  id: number;
  location: string;
  time: string;
}

export default function NewTrip() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    departureTime: "",
    arrivalTime: "",
    capacity: "",
    pricePerKg: "",
    notes: "",
  });
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([
    { id: 1, location: "", time: "" }
  ]);

  const handleAddPickupPoint = () => {
    if (pickupPoints.length < 3) {
      setPickupPoints([
        ...pickupPoints,
        { id: Date.now(), location: "", time: "" }
      ]);
    }
  };

  const handleRemovePickupPoint = (id: number) => {
    if (pickupPoints.length > 1) {
      setPickupPoints(pickupPoints.filter(p => p.id !== id));
    }
  };

  const handlePickupChange = (id: number, field: 'location' | 'time', value: string) => {
    setPickupPoints(pickupPoints.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New trip:", formData, "Pickup points:", pickupPoints);
    toast({
      title: "Perjalanan Ditambahkan!",
      description: "Perjalanan Anda sudah aktif dan bisa menerima order.",
    });
    setSubmitted(true);
    setTimeout(() => navigate("/traveler"), 2000);
  };

  return (
    <DashboardLayout role="traveler">
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Tambah Perjalanan Baru
            </h1>
            <p className="mt-2 text-muted-foreground">
              Daftarkan jadwal perjalanan Anda dan mulai terima order
            </p>
          </motion.div>

          {!submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-card p-6 md:p-8 shadow-card"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Route */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="from">Kota Asal</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="from"
                        list="cities"
                        placeholder="Pilih kota"
                        value={formData.from}
                        onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>
                  <motion.div 
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
                  >
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div className="space-y-2">
                    <Label htmlFor="to">Kota Tujuan</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                      <Input
                        id="to"
                        list="cities"
                        placeholder="Pilih kota"
                        value={formData.to}
                        onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>
                  <datalist id="cities">
                    {cities.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>

                {/* Date & Time */}
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal Keberangkatan</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departureTime">Jam Berangkat</Label>
                    <Input
                      id="departureTime"
                      type="time"
                      value={formData.departureTime}
                      onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arrivalTime">Estimasi Tiba</Label>
                    <Input
                      id="arrivalTime"
                      type="time"
                      value={formData.arrivalTime}
                      onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                {/* Pickup Points */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Pos Pengambilan Barang</Label>
                    {pickupPoints.length < 3 && (
                      <Button type="button" variant="ghost" size="sm" onClick={handleAddPickupPoint}>
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah Pos
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tambahkan 1-3 titik pengambilan barang dalam perjalanan ini
                  </p>
                  {pickupPoints.map((point, index) => (
                    <motion.div
                      key={point.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-muted/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pos {index + 1}</span>
                        {pickupPoints.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleRemovePickupPoint(point.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Lokasi</Label>
                          <Input
                            placeholder="Contoh: Mall Grand Indonesia"
                            value={point.location}
                            onChange={(e) => handlePickupChange(point.id, 'location', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Jam</Label>
                          <Input
                            type="time"
                            value={point.time}
                            onChange={(e) => handlePickupChange(point.id, 'time', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Capacity & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Kapasitas (kg)</Label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        placeholder="10"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricePerKg">Harga per Kg (Rp)</Label>
                    <Input
                      id="pricePerKg"
                      type="number"
                      min="1000"
                      step="1000"
                      placeholder="25000"
                      value={formData.pricePerKg}
                      onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Info tambahan tentang perjalanan Anda..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Tambah Perjalanan
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-card p-8 shadow-card text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20 mx-auto mb-6"
              >
                <CheckCircle className="h-10 w-10 text-success" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Perjalanan Berhasil Ditambahkan!
              </h2>
              <p className="text-muted-foreground mb-6">
                Perjalanan {formData.from} → {formData.to} sudah aktif. Anda akan dialihkan ke dashboard...
              </p>
              <Button variant="hero" asChild>
                <Link to="/traveler">Ke Dashboard</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
