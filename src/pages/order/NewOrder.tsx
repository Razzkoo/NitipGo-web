import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, MapPin, Calendar, Upload, Info, ArrowRight, CheckCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const pickupPoints = [
  { id: "1", name: "Mitra Pos Cikini", address: "Jl. Cikini Raya No. 45" },
  { id: "2", name: "Mitra Pos Menteng", address: "Jl. Menteng Raya No. 12" },
  { id: "3", name: "Titik Temu Stasiun Gambir", address: "Lobi Utama Stasiun" },
];

export default function NewOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("trip");
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    orderType: "titip-beli",
    itemName: "",
    itemDescription: "",
    weight: "",
    photo: null as File | null,
    pickupPoint: "",
    notes: "",
  });

  // Mock calculation
  const estimatedPrice = formData.weight ? parseInt(formData.weight) * 25000 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      console.log("Order submitted:", formData);
      setSubmitted(true);
    }
  };

  return (
    <MainLayout>
      <section className="py-8 md:py-12">
        <div className="container">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step > 1 ? "Langkah Sebelumnya" : "Kembali"}
          </Button>

          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            {!submitted && (
              <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                        s <= step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s}
                    </div>
                    {s < 3 && (
                      <div className={`w-12 h-1 mx-2 ${s < step ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {!submitted ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl bg-card p-6 md:p-8 shadow-card"
              >
                <form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <>
                      <h2 className="text-xl font-semibold text-foreground mb-6">
                        Detail Barang
                      </h2>
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label>Jenis Order</Label>
                          <Select
                            value={formData.orderType}
                            onValueChange={(value) => setFormData({ ...formData, orderType: value })}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="titip-beli">Titip Beli Barang</SelectItem>
                              <SelectItem value="kirim">Kirim / Titip Barang</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="itemName">Nama Barang</Label>
                          <Input
                            id="itemName"
                            placeholder="Contoh: Sepatu Nike Air Max"
                            value={formData.itemName}
                            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                            className="h-12"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="itemDescription">Deskripsi Barang</Label>
                          <Textarea
                            id="itemDescription"
                            placeholder="Jelaskan detail barang (warna, ukuran, kondisi, dll)"
                            rows={4}
                            value={formData.itemDescription}
                            onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="weight">Estimasi Berat (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            min="0.1"
                            step="0.1"
                            placeholder="Contoh: 1.5"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            className="h-12"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Foto Barang (Opsional)</Label>
                          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Klik untuk upload atau drag & drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG hingga 5MB
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h2 className="text-xl font-semibold text-foreground mb-6">
                        Titik Pengambilan
                      </h2>
                      <div className="space-y-5">
                        <div className="space-y-3">
                          {pickupPoints.map((point) => (
                            <label
                              key={point.id}
                              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                                formData.pickupPoint === point.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/30"
                              }`}
                            >
                              <input
                                type="radio"
                                name="pickupPoint"
                                value={point.id}
                                checked={formData.pickupPoint === point.id}
                                onChange={(e) => setFormData({ ...formData, pickupPoint: e.target.value })}
                                className="mt-1"
                                required
                              />
                              <div>
                                <p className="font-medium text-foreground">{point.name}</p>
                                <p className="text-sm text-muted-foreground">{point.address}</p>
                              </div>
                            </label>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                          <Textarea
                            id="notes"
                            placeholder="Instruksi khusus untuk traveler..."
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <h2 className="text-xl font-semibold text-foreground mb-6">
                        Konfirmasi Order
                      </h2>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-muted/50">
                          <h3 className="font-medium text-foreground mb-3">Detail Barang</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Jenis Order</span>
                              <span className="text-foreground">{formData.orderType === "titip-beli" ? "Titip Beli" : "Kirim Barang"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Nama Barang</span>
                              <span className="text-foreground">{formData.itemName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Berat</span>
                              <span className="text-foreground">{formData.weight} kg</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/50">
                          <h3 className="font-medium text-foreground mb-3">Titik Pengambilan</h3>
                          <p className="text-foreground">{pickupPoints.find(p => p.id === formData.pickupPoint)?.name}</p>
                          <p className="text-sm text-muted-foreground">{pickupPoints.find(p => p.id === formData.pickupPoint)?.address}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-foreground">Estimasi Biaya</span>
                            <span className="text-2xl font-bold text-primary">Rp {estimatedPrice.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            <Info className="h-3 w-3 inline mr-1" />
                            Harga final akan dikonfirmasi oleh traveler
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <Button type="submit" variant="hero" size="lg" className="w-full mt-6">
                    {step < 3 ? (
                      <>Lanjutkan <ArrowRight className="h-5 w-5 ml-1" /></>
                    ) : (
                      <>Konfirmasi & Bayar</>
                    )}
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
                  Order Berhasil Dibuat!
                </h2>
                <p className="text-muted-foreground mb-2">
                  Order Anda telah dikirim ke traveler. Anda akan mendapat notifikasi setelah traveler mengonfirmasi.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  No. Order: <span className="font-semibold text-foreground">ORD-{Date.now().toString().slice(-6)}</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="hero" asChild>
                    <Link to="/dashboard">
                      <Package className="h-5 w-5 mr-2" />
                      Ke Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/perjalanan">Buat Order Lain</Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
