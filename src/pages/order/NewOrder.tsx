import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Package, MapPin, Calendar, Upload, Info,
  ArrowRight, CheckCircle, AlertCircle, Star, User, Phone,
  Shield, ExternalLink, Navigation, Loader2,
} from "lucide-react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TripInfo {
  id: number;
  code: string;
  from: string;
  to: string;
  date: string;
  time: string;
  arrivalDate: string;
  arrivalTime: string;
  capacity: string;
  totalCapacity: string;
  capacityRaw: number;
  price: string;
  pricePerKg: number;
  notes: string;
  traveler: {
    id: number;
    name: string;
    phone: string;
    email: string;
    photo: string | null;
    city: string;
    province: string;
  };
  pickup: {
    id: number;
    name: string;
    address: string;
    time: string;
    mapUrl: string | null;
  } | null;
  collection: {
    id: number;
    name: string;
    address: string;
    time: string;
    mapUrl: string | null;
  } | null;
}

const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

function getAvatarUrl(traveler: TripInfo["traveler"]): string {
  if (traveler.photo) return `${BASE_URL}/storage/${traveler.photo}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(traveler.name)}`;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function NewOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("trip");
  const orderTypeFromURL = searchParams.get("type");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Trip data from API
  const [trip, setTrip] = useState<TripInfo | null>(null);
  const [userAddress, setUserAddress] = useState("");

  const [formData, setFormData] = useState({
    orderType: orderTypeFromURL === "kirim" ? "kirim" : "titip-beli",
    itemName: "",
    itemDescription: "",
    weight: "",
    estimatedPriceItem: "",
    quantity: 1,
    photo: null as File | null,
    notes: "",
    recipientName: "",
    recipientPhone: "",
    destinationAddress: "",
  });

  // ─── Fetch trip detail ───────────────────────────
  useEffect(() => {
    if (!tripId) {
      setLoadingTrip(false);
      return;
    }

    const fetchTrip = async () => {
      try {
        const res = await api.get(`/trips/${tripId}/detail`);
        const data = res.data.data;
        // Dummy pickup/collection with id for now
        setTrip({
          ...data,
          pickup: data.pickup ? { id: 1, ...data.pickup } : null,
          collection: data.collection ? { id: 1, ...data.collection } : null,
        });
      } catch {
        setErrorMsg("Gagal memuat data perjalanan");
      } finally {
        setLoadingTrip(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  // ─── Fetch user profile for address ──────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/customer/profile");
        setUserAddress(res.data.data?.address || "");
      } catch {}
    };
    fetchProfile();
  }, []);

  // ─── Helpers ─────────────────────────────────────
  const formatRupiah = (value: string) => {
    const number = value.replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID").format(Number(number));
  };

  const showError = (message: string) => {
    setErrorMsg(message);
    setTimeout(() => setErrorMsg(""), 3000);
  };

  // ─── Price calculation (no commission) ───────────
  const weightNum = parseFloat(formData.weight || "0");
  const pricePerKg = trip?.pricePerKg || 0;
  const itemPriceNum = parseFloat(formData.estimatedPriceItem.replace(/\./g, "") || "0");

  const shippingCost = weightNum * pricePerKg;
  const itemCost = formData.orderType === "titip-beli" ? itemPriceNum * formData.quantity : 0;
  const totalPrice = shippingCost + itemCost;

  // ─── Submit ──────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 1 validation
    if (step === 1) {
      if (!formData.photo) {
        showError("Foto barang wajib diupload");
        return;
      }
      if (!formData.itemName.trim()) {
        showError("Nama barang wajib diisi");
        return;
      }
      if (!formData.itemDescription.trim()) {
        showError("Deskripsi barang wajib diisi untuk menggambarkan jenis barang");
        return;
      }
      if (!formData.weight || parseFloat(formData.weight) <= 0) {
        showError("Berat barang wajib diisi");
        return;
      }
      if (!userAddress) {
        showError("Alamat Anda belum diisi. Silakan lengkapi di halaman Profil terlebih dahulu");
        return;
      }
      if (formData.orderType === "kirim") {
        if (!formData.recipientName.trim()) {
          showError("Nama penerima wajib diisi");
          return;
        }
        if (!formData.recipientPhone.trim()) {
          showError("Nomor telepon penerima wajib diisi");
          return;
        }
        if (!formData.destinationAddress.trim()) {
          showError("Alamat penerima wajib diisi");
          return;
        }
      }
      if (formData.orderType === "titip-beli") {
        if (!formData.estimatedPriceItem || itemPriceNum <= 0) {
          showError("Estimasi harga barang wajib diisi");
          return;
        }
      }
      setStep(2);
      return;
    }

    // Step 2 validation (titik COD)
    if (step === 2) {
      setStep(3);
      return;
    }

    // Step 3 — submit
    try {
      setLoading(true);

      const form = new FormData();
      form.append("trip_id", String(trip.id));
      form.append("order_type", formData.orderType);
      form.append("name", formData.itemName);
      form.append("description", formData.itemDescription);
      form.append("weight", formData.weight);

      if (formData.orderType === "titip-beli") {
        form.append("quantity", String(formData.quantity));
        form.append("item_price", formData.estimatedPriceItem.replace(/\./g, ""));
      }
      if (formData.orderType === "kirim") {
        form.append("recipient_name", formData.recipientName);
        form.append("recipient_phone", formData.recipientPhone);
        form.append("destination_address", formData.destinationAddress);
      }
      if (formData.notes) form.append("notes", formData.notes);
      if (formData.photo) form.append("photo", formData.photo);

      const res = await api.post("/customer/orders", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOrderNumber(res.data.data.sku);
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Terjadi kesalahan saat membuat order";
      const isValidation = err?.response?.status === 422;
      setErrorMsg(msg);
      if (!isValidation) setTimeout(() => setErrorMsg(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  // ─── Loading state ───────────────────────────────
  if (loadingTrip) {
    return (
      <CustomerLayout>
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  if (!trip) {
    return (
      <CustomerLayout>
        <div className="p-6 md:p-8 lg:p-10">
          <div className="max-w-md mx-auto text-center py-16">
            <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Perjalanan Tidak Ditemukan</h2>
            <p className="text-muted-foreground mb-6">Silakan pilih traveler terlebih dahulu dari daftar perjalanan.</p>
            <Button variant="hero" asChild>
              <Link to="/customer/trip">Cari Perjalanan</Link>
            </Button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  // ─── Render ──────────────────────────────────────
  const STEP_LABELS = ["Detail Barang", "Titik COD", "Konfirmasi"];

  return (
    <CustomerLayout>
      <div className="p-6 md:p-8 lg:p-10">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step > 1 ? "Langkah Sebelumnya" : "Kembali"}
        </Button>

        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          {!submitted && (
            <div className="flex items-center justify-center mb-10">
              {STEP_LABELS.map((label, i) => {
                const s = i + 1;
                const done = s < step;
                const active = s === step;
                return (
                  <div key={s} className="flex items-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                          done
                            ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                            : active
                            ? "bg-green-600 text-white shadow-[0_0_16px_rgba(22,163,74,0.45)] scale-110"
                            : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                        }`}
                      >
                        {done ? <CheckCircle className="h-4 w-4" /> : s}
                      </div>
                      <span
                        className={`text-xs font-medium hidden sm:block ${
                          active ? "text-green-600" : done ? "text-emerald-500" : "text-zinc-400"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div
                        className={`mx-2 mb-4 h-[2px] w-12 sm:w-14 rounded-full transition-all duration-500 ${
                          s < step ? "bg-emerald-400" : "bg-zinc-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!submitted ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl bg-card p-6 md:p-8 shadow-card"
            >
              {errorMsg && (
                <Alert className="mb-4">
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                {/* ── STEP 1: Detail Barang ── */}
                {step === 1 && (
                  <>
                    <h2 className="text-xl font-semibold mb-6">Detail Barang</h2>
                    <div className="space-y-5">
                      {/* Foto */}
                      <div className="space-y-2">
                        <Label>Foto Barang *</Label>
                        <label
                          htmlFor="uploadPhoto"
                          className="relative h-36 border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer block"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="uploadPhoto"
                            required
                            onChange={(e) =>
                              setFormData({ ...formData, photo: e.target.files?.[0] || null })
                            }
                          />
                          <div className="flex flex-col items-center justify-center h-full">
                            <Upload className="h-7 w-7 mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {formData.photo ? formData.photo.name : "Klik untuk upload foto"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Wajib upload foto agar traveler dapat memahami barang Anda dengan jelas
                            </p>
                          </div>
                        </label>
                      </div>

                      {/* Jenis Order */}
                      <div className="space-y-2">
                        <Label>Jenis Order</Label>
                        <Select
                          value={formData.orderType}
                          disabled={!!orderTypeFromURL}
                          onValueChange={(v) => setFormData({ ...formData, orderType: v })}
                        >
                          <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="titip-beli">Titip Beli Barang</SelectItem>
                            <SelectItem value="kirim">Kirim Barang</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Rute (auto dari trip) */}
                      <div className="space-y-2">
                        <Label>Rute Perjalanan</Label>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                          <div className="flex-1 text-center">
                            <p className="text-xs text-muted-foreground">Dari</p>
                            <p className="font-semibold">{trip.from}</p>
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <ArrowRight className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 text-center">
                            <p className="text-xs text-muted-foreground">Ke</p>
                            <p className="font-semibold">{trip.to}</p>
                          </div>
                        </div>
                      </div>

                      {/* Tanggal (auto dari trip) */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tanggal Berangkat</Label>
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{trip.date}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Estimasi Tiba</Label>
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{trip.arrivalDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Nama Barang */}
                      <div className="space-y-2">
                        <Label>Nama Barang *</Label>
                        <Input
                          placeholder="Masukkan nama barang"
                          value={formData.itemName}
                          onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                          className="h-12"
                          required
                        />
                      </div>

                      {/* Berat */}
                      <div className="space-y-2">
                        <Label>Estimasi Berat (kg) *</Label>
                        <Input
                          type="number"
                          min="1"
                          step="0.1"
                          placeholder="Masukkan berat barang"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          className="h-12"
                          required
                        />
                      </div>

                      {/* Titip Beli: Harga + Jumlah */}
                      {formData.orderType === "titip-beli" && (
                        <>
                          <div className="space-y-2">
                            <Label>Estimasi Harga Barang *</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                              <Input
                                placeholder="0"
                                value={formData.estimatedPriceItem}
                                onChange={(e) =>
                                  setFormData({ ...formData, estimatedPriceItem: formatRupiah(e.target.value) })
                                }
                                className="pl-10 h-12"
                                required
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Jumlah</Label>
                            <div className="flex items-center gap-4">
                              <button
                                type="button"
                                className="text-xl px-3 py-1 rounded-md border"
                                onClick={() =>
                                  setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })
                                }
                              >
                                −
                              </button>
                              <div className="px-4 py-1 rounded-md bg-muted text-lg font-medium">
                                {formData.quantity}
                              </div>
                              <button
                                type="button"
                                className="text-xl px-3 py-1 rounded-md border"
                                onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Deskripsi Barang */}
                      <div className="space-y-2">
                        <Label>Deskripsi Barang *</Label>
                        <Textarea
                          placeholder="Jelaskan detail barang (warna, ukuran, kondisi, jenis barang, dll)"
                          rows={4}
                          value={formData.itemDescription}
                          onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Wajib diisi untuk menggambarkan jenis barang Anda</p>
                      </div>

                      {/* Alamat Customer */}
                      <div className="space-y-2">
                        <Label>Alamat Anda *</Label>
                        {userAddress ? (
                          <div className="p-3 rounded-xl bg-muted/50 border">
                            <p className="text-sm">{userAddress}</p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 text-center space-y-2">
                            <p className="text-sm text-amber-700 font-medium">Alamat belum diisi</p>
                            <p className="text-xs text-amber-600">Lengkapi alamat di halaman Profil terlebih dahulu</p>
                            <Button size="sm" variant="outline" onClick={() => navigate("/profile")}>
                              Ke Halaman Profil
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Kirim: Info Penerima */}
                      {formData.orderType === "kirim" && (
                        <div className="space-y-4 rounded-xl border border-border p-4 bg-muted/20">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <Label className="text-sm font-semibold">Informasi Penerima</Label>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nama Penerima *</Label>
                              <Input
                                placeholder="Nama lengkap"
                                value={formData.recipientName}
                                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                className="h-12"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Nomor Telepon *</Label>
                              <Input
                                type="tel"
                                placeholder="08xxxxxxxxxx"
                                value={formData.recipientPhone}
                                onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                                className="h-12"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Alamat Penerima *</Label>
                            <Textarea
                              placeholder="Alamat lengkap penerima"
                              rows={3}
                              value={formData.destinationAddress}
                              onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ── STEP 2: Titik COD ── */}
                {step === 2 && (
                  <>
                    {/* Traveler Profile */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 mb-6">
                      <img
                        src={getAvatarUrl(trip.traveler)}
                        alt={trip.traveler.name}
                        className="h-14 w-14 rounded-full bg-muted object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{trip.traveler.name}</p>
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            <Shield className="h-3 w-3" /> Terverifikasi
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{trip.traveler.city}, {trip.traveler.province}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {trip.traveler.phone}
                          </span>
                          <span>{trip.from} → {trip.to}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{trip.price}</p>
                      </div>
                    </div>

                    {/* Collection Point (for kirim) */}
                    {formData.orderType === "kirim" && trip.collection && (
                      <>
                        <h2 className="text-xl font-semibold mb-4">Titik Pengumpulan</h2>
                        <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 mb-6">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                              <Navigation className="h-4 w-4 text-amber-600" />
                            </div>
                            <p className="font-semibold">{trip.collection.name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{trip.collection.address}</p>
                          <p className="text-xs text-muted-foreground mt-1">Jam: {trip.collection.time}</p>
                          {trip.collection.mapUrl && (
                            <a
                              href={trip.collection.mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" /> Buka Maps
                            </a>
                          )}
                        </div>
                      </>
                    )}

                    {/* Pickup Point */}
                    <h2 className="text-xl font-semibold mb-4">Titik Pengambilan</h2>
                    {trip.pickup ? (
                      <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-emerald-600" />
                          </div>
                          <p className="font-semibold">{trip.pickup.name}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{trip.pickup.address}</p>
                        <p className="text-xs text-muted-foreground mt-1">Jam: {trip.pickup.time}</p>
                        {trip.pickup.mapUrl && (
                          <a
                            href={trip.pickup.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> Buka Maps
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-muted/50 text-center text-sm text-muted-foreground mb-6">
                        Titik pengambilan belum ditentukan oleh traveler
                      </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label>Catatan Tambahan (Opsional)</Label>
                      <Textarea
                        placeholder="Instruksi khusus untuk traveler..."
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* ── STEP 3: Konfirmasi ── */}
                {step === 3 && (
                  <>
                    <h2 className="text-xl font-semibold mb-6">Konfirmasi Order</h2>
                    <div className="space-y-4">
                      {/* Detail Barang */}
                      <div className="p-4 rounded-xl bg-muted/50">
                        <h3 className="font-medium mb-3">Detail Barang</h3>
                        {formData.photo && (
                          <div className="w-full h-40 rounded-xl border bg-muted/30 overflow-hidden mb-3">
                            <img
                              src={URL.createObjectURL(formData.photo)}
                              alt="Foto barang"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Jenis Order</span>
                            <span>{formData.orderType === "titip-beli" ? "Titip Beli" : "Kirim Barang"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nama Barang</span>
                            <span>{formData.itemName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Berat</span>
                            <span>{formData.weight} kg</span>
                          </div>
                          {formData.orderType === "titip-beli" && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Estimasi Harga Barang</span>
                                <span>Rp {Number(formData.estimatedPriceItem.replace(/\./g, "")).toLocaleString("id-ID")}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Jumlah</span>
                                <span>{formData.quantity}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Alamat Anda</span>
                            <span className="text-right max-w-[60%]">{userAddress}</span>
                          </div>
                        </div>

                        {formData.orderType === "kirim" && (
                          <div className="mt-3 pt-3 border-t space-y-2 text-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-primary" />
                              <span className="font-medium">Informasi Penerima</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Nama</span>
                              <span>{formData.recipientName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Telepon</span>
                              <span>{formData.recipientPhone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Alamat</span>
                              <span className="text-right max-w-[60%]">{formData.destinationAddress}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Traveler */}
                      <div className="p-4 rounded-xl bg-muted/50">
                        <h3 className="font-medium mb-3">Traveler</h3>
                        <div className="flex items-center gap-4">
                          <img
                            src={getAvatarUrl(trip.traveler)}
                            alt={trip.traveler.name}
                            className="h-12 w-12 rounded-full bg-muted object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{trip.traveler.name}</p>
                            <p className="text-sm text-muted-foreground">{trip.from} → {trip.to}</p>
                            <p className="text-xs text-muted-foreground">Tiba: {trip.arrivalDate}, {trip.arrivalTime}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{trip.price}</p>
                          </div>
                        </div>
                      </div>

                      {/* Titik COD */}
                      {formData.orderType === "kirim" && trip.collection && (
                        <div className="p-4 rounded-xl bg-muted/50">
                          <h3 className="font-medium mb-2">Titik Pengumpulan</h3>
                          <p className="text-sm">{trip.collection.name}</p>
                          <p className="text-xs text-muted-foreground">{trip.collection.address} • Jam: {trip.collection.time}</p>
                        </div>
                      )}

                      {trip.pickup && (
                        <div className="p-4 rounded-xl bg-muted/50">
                          <h3 className="font-medium mb-2">Titik Pengambilan</h3>
                          <p className="text-sm">{trip.pickup.name}</p>
                          <p className="text-xs text-muted-foreground">{trip.pickup.address} • Jam: {trip.pickup.time}</p>
                        </div>
                      )}

                      {formData.notes && (
                        <div className="p-4 rounded-xl bg-muted/50">
                          <h3 className="font-medium mb-2">Catatan</h3>
                          <p className="text-sm text-muted-foreground">{formData.notes}</p>
                        </div>
                      )}

                      {/* Rincian Pembayaran */}
                      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                        <h3 className="font-medium mb-3">Rincian Pembayaran</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Biaya Pengiriman ({formData.weight} kg × Rp {pricePerKg.toLocaleString("id-ID")})</span>
                            <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
                          </div>
                          {formData.orderType === "titip-beli" && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Harga Barang ({formData.quantity} × Rp {itemPriceNum.toLocaleString("id-ID")})</span>
                              <span>Rp {itemCost.toLocaleString("id-ID")}</span>
                            </div>
                          )}
                          <div className="border-t my-2" />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total Pembayaran</span>
                            <span className="text-2xl font-bold text-primary">Rp {totalPrice.toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          <Info className="h-3 w-3 inline mr-1" />
                          Harga final akan dikonfirmasi oleh traveler
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <Button type="submit" variant="hero" size="lg" className="w-full mt-6" disabled={loading}>
                  {loading ? "Menyimpan..." : step < 3 ? "Lanjutkan" : "Buat Pesanan"}
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
              <h2 className="text-2xl font-bold mb-2">Order Berhasil Dibuat!</h2>
              <p className="text-muted-foreground mb-2">
                Order Anda telah dikirim ke traveler. Anda akan mendapat notifikasi setelah traveler mengonfirmasi.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                No. Order: <span className="font-semibold text-foreground">{orderNumber}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" asChild>
                  <Link to="/dashboard">
                    <Package className="h-5 w-5 mr-2" />
                    Ke Dashboard
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/customer/trip">Buat Order Lain</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}