import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Package, ArrowRight, CheckCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const cities = [
  "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang",
  "Malang", "Medan", "Makassar", "Bali", "Palembang"
];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New trip:", formData);
    toast({
      title: "Perjalanan Ditambahkan!",
      description: "Perjalanan Anda sudah aktif dan bisa menerima order.",
    });
    setSubmitted(true);
    setTimeout(() => navigate("/traveler"), 2000);
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
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
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20 mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-success" />
                </div>
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
      </section>
    </MainLayout>
  );
}
