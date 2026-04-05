import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Package, ArrowRight, ArrowLeft, CheckCircle, CreditCard, Wallet, Info } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import api from "@/lib/api";
// Provider logo
import logoBni from "@/assets/providers/BNI.png";
import logoDana from "@/assets/providers/Dana.png";
import logoGopay from "@/assets/providers/Gopay.png";
import logoMandiri from "@/assets/providers/Mandiri.png";
import logoOvo from "@/assets/providers/OVO.png";
import logoBca from "@/assets/providers/BCA.png";

// Payout Account
interface PayoutAccount {
  id: number;
  payout_type: "bank" | "e_wallet";
  provider: string;
  account_name: string;
  account_number: string;
  is_default: boolean;
}

const providerLabels: Record<string, string> = {
  bca: "BCA", bni: "BNI", mandiri: "Mandiri",
  ovo: "OVO", dana: "DANA", gopay: "GoPay",
};


// Helper : Disclaimer pickup and collections point
function SafetyTip() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition shrink-0"
          title="Tips keamanan"
        >
          <span className="text-xs font-bold">?</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="top">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold text-zinc-900">Tips Keamanan Pemilihan Lokasi</p>
          </div>
          <ul className="space-y-2 text-xs text-zinc-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              Pilih lokasi yang <strong>mudah ditemukan</strong> seperti minimarket (Indomaret, Alfamart), SPBU, atau pusat perbelanjaan.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              Pastikan lokasi <strong>ramai dan terang</strong>, hindari gang sempit atau tempat sepi.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              Sertakan <strong>URL Google Maps</strong> agar customer mudah menemukan lokasi.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              Pilih jam yang <strong>wajar</strong> (08:00–21:00) untuk kenyamanan kedua pihak.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              <strong>Dilarang</strong> meminta customer datang ke alamat pribadi atau lokasi tidak jelas.
            </li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
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
    arrivalDate: "",
    capacity: "",
    pricePerKg: "",
    notes: "",
  });

  // Collections
  const [collection, setCollection] = useState({
    name: "", location: "", mapUrl: "", time: "",
  });

  // Pickup
  const [pickup, setPickup] = useState({
    name: "", location: "", mapUrl: "", time: "",
  });

  // Payout accounts
  const [payoutAccounts, setPayoutAccounts] = useState<PayoutAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    api.get("/traveler/payout-accounts")
      .then(res => {
        setPayoutAccounts(res.data.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingAccounts(false));
  }, []);

  // Provider mapping
  const providerLogos: Record<string, string> = {
    bca: logoBca,
    bni: logoBni,
    mandiri: logoMandiri,
    ovo: logoOvo,
    dana: logoDana,
    gopay: logoGopay,
  };

  //submit trip
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.from.trim() || !formData.to.trim()) {
      toast({ title: "Kota asal dan tujuan wajib diisi", variant: "destructive" });
      return;
    }

    if (!collection.name || !collection.location || !collection.time) {
      toast({ title: "Data pos pengumpulan belum lengkap", variant: "destructive" });
      return;
    }

    if (!pickup.name || !pickup.location || !pickup.time) {
      toast({ title: "Data pos pengambilan belum lengkap", variant: "destructive" });
      return;
    }

    if (payoutAccounts.length === 0) {
      toast({ title: "Tambahkan rekening pembayaran terlebih dahulu", variant: "destructive" });
      return;
    }

    try {
      await api.post("/traveler/trips", {
        from: formData.from,
        to: formData.to,
        date: formData.date,
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
        arrivalDate: formData.arrivalDate,
        capacity: parseInt(formData.capacity || "0", 10),
        pricePerKg: parseInt(formData.pricePerKg || "0", 10),
        notes: formData.notes,
        collection: {
          name: collection.name,
          location: collection.location,
          mapUrl: collection.mapUrl || null,
          time: collection.time,
        },
        pickup: {
          name: pickup.name,
          location: pickup.location,
          mapUrl: pickup.mapUrl || null,
          time: pickup.time,
        },
      });

      toast({ title: "Perjalanan berhasil dibuat" });
      setSubmitted(true);
      setTimeout(() => navigate("/traveler/trip"), 1500);
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message;
      const isValidation = err?.response?.status === 422;

      toast({
        title: isValidation ? "Data belum sesuai" : "Gagal membuat perjalanan",
        description: message,
        variant: isValidation ? "default" : "destructive",
      });
    }
  };

  const formatRupiah = (value: string | number) => {
    if (!value) return "";
    const number = String(value).replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID").format(Number(number));
  };

  const openMap = (url: string) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  return (
    <DashboardLayout role="traveler">
      <div className="p-6 md:p-8 lg:p-10">
        <Link
          to="/traveler/trip"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />Kembali</Link>
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
              className="rounded-2xl bg-card p-6 md:p-8 shadow-card">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Route - Input Bebas */}
                <div className="space-y-2">
                  <Label>Rute Perjalanan</Label>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Kota asal"
                        value={formData.from}
                        onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </motion.div>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                      <Input
                        placeholder="Kota tujuan"
                        value={formData.to}
                        onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

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

                <div className="space-y-2">
                  <Label htmlFor="arrivalDate">Tanggal Tiba</Label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="arrivalDate"
                      type="date"
                      value={formData.arrivalDate}
                      onChange={(e) =>
                        setFormData({ ...formData, arrivalDate: e.target.value })
                      }
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

                {/* Collections */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label>Pos Pengumpulan Barang</Label>
                    <SafetyTip />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Titik dimana customer mengumpulkan barang sebelum perjalanan
                  </p>
                  <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Nama Pos</Label>
                        <Input placeholder="Contoh: Indomaret Jl. Ahmad Yani"
                          value={collection.name}
                          onChange={(e) => setCollection({ ...collection, name: e.target.value })}
                          className="mt-1" required />
                      </div>
                      <div>
                        <Label className="text-xs">Jam</Label>
                        <Input type="time" value={collection.time}
                          onChange={(e) => setCollection({ ...collection, time: e.target.value })}
                          className="mt-1" required />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Alamat / Lokasi</Label>
                        <Input placeholder="Alamat lengkap pos pengumpulan"
                          value={collection.location}
                          onChange={(e) => setCollection({ ...collection, location: e.target.value })}
                          className="mt-1" required />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">URL Google Maps</Label>
                        <div className="flex gap-2">
                          <Input placeholder="https://maps.google.com/..."
                            value={collection.mapUrl}
                            onChange={(e) => setCollection({ ...collection, mapUrl: e.target.value })} />
                          {collection.mapUrl && (
                            <Button type="button" variant="outline" onClick={() => openMap(collection.mapUrl)}>
                              Lihat Maps
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pickups) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label>Pos Pengambilan Barang</Label>
                    <SafetyTip />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Titik dimana customer mengambil barang di kota tujuan
                  </p>
                  <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Nama Pos</Label>
                        <Input placeholder="Contoh: Alfamart Jl. Sudirman"
                          value={pickup.name}
                          onChange={(e) => setPickup({ ...pickup, name: e.target.value })}
                          className="mt-1" required />
                      </div>
                      <div>
                        <Label className="text-xs">Jam</Label>
                        <Input type="time" value={pickup.time}
                          onChange={(e) => setPickup({ ...pickup, time: e.target.value })}
                          className="mt-1" required />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Alamat / Lokasi</Label>
                        <Input placeholder="Alamat lengkap pos pengambilan"
                          value={pickup.location}
                          onChange={(e) => setPickup({ ...pickup, location: e.target.value })}
                          className="mt-1" required />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">URL Google Maps</Label>
                        <div className="flex gap-2">
                          <Input placeholder="https://maps.google.com/..."
                            value={pickup.mapUrl}
                            onChange={(e) => setPickup({ ...pickup, mapUrl: e.target.value })} />
                          {pickup.mapUrl && (
                            <Button type="button" variant="outline" onClick={() => openMap(pickup.mapUrl)}>
                              Lihat Maps
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
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
                        required/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricePerKg">Harga per Kg</Label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        Rp
                      </span>
                      <Input
                        id="pricePerKg"
                        inputMode="numeric"
                        placeholder="25.000"
                        value={formatRupiah(formData.pricePerKg)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          setFormData({ ...formData, pricePerKg: raw });
                        }}
                        className="pl-10 h-12"
                        required/>
                    </div>
                  </div>
                </div>

                {/* Payout accounts */}
                <div className="space-y-2">
                  <Label>Rekening Pembayaran</Label>
                  <p className="text-xs text-muted-foreground">
                    Customer akan transfer ke salah satu rekening ini untuk membayar order
                  </p>

                  {loadingAccounts ? (
                    <div className="p-4 rounded-xl bg-muted/50 animate-pulse text-sm text-muted-foreground">
                      Memuat rekening...
                    </div>
                  ) : payoutAccounts.length === 0 ? (
                    <div className="p-4 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 text-center space-y-3">
                      <CreditCard className="h-8 w-8 text-amber-400 mx-auto" />
                      <p className="text-sm text-amber-700 font-medium">Belum ada rekening pembayaran</p>
                      <p className="text-xs text-amber-600">Tambahkan rekening terlebih dahulu di halaman Saldo</p>
                      <Button size="sm" variant="outline" onClick={() => navigate("/traveler/wallet")}>
                        <Wallet className="h-4 w-4 mr-1.5" />
                        Tambah Rekening
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {payoutAccounts.map((acc) => (
                        <div
                          key={acc.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border ${
                            acc.is_default
                              ? "border-primary/30 bg-primary/5"
                              : "border-zinc-100 bg-zinc-50/50"
                          }`}
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-zinc-100 shrink-0 overflow-hidden">
                            {providerLogos[acc.provider] ? (
                              <img src={providerLogos[acc.provider]} alt={acc.provider} className="h-6 w-6 object-contain" />
                            ) : (
                              <CreditCard className="h-4 w-4 text-zinc-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">
                                {providerLabels[acc.provider] ?? acc.provider.toUpperCase()}
                              </span>
                              {acc.is_default && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                                  Utama
                                </span>
                              )}
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                acc.payout_type === "bank" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                              }`}>
                                {acc.payout_type === "bank" ? "Bank" : "E-Wallet"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {acc.account_name} · {acc.account_number}
                            </p>
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        Kelola rekening di halaman <button type="button" onClick={() => navigate("/traveler/wallet")} className="text-primary font-medium hover:underline">Saldo</button>
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Info tambahan tentang perjalanan Anda..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}/>
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
