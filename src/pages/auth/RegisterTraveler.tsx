import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from "react-easy-crop";
import {
  Package, ArrowLeft, ArrowRight, CheckCircle, User, Mail,
  Lock, Phone, MapPin, Eye, EyeOff, Upload, FileCheck,
  AlertCircle, Calendar, CreditCard, Plane, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { registerTraveler } from "@/lib/auth";
import { useAppSettings } from "@/components/layout/AppSettingsContent";

const STEP_LABELS = ["Syarat & Ketentuan", "Biodata Diri", "Data Pendukung", "Konfirmasi"];

type PhotoField = "ktp_photo" | "pass_photo" | "selfie_with_ktp" | "sim_card_photo";

export default function RegisterTraveler() {
  const { appNameFirst, appNameLast } = useAppSettings();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "", gender: "", birth_date: "", ktp_number: "",
    phone: "", address: "", city: "", province: "", email: "", password: "",
  });

  const [photos, setPhotos] = useState<Record<PhotoField, File | null>>({
    ktp_photo: null, pass_photo: null, selfie_with_ktp: null, sim_card_photo: null,
  });
  const [previews, setPreviews] = useState<Record<PhotoField, string | null>>({
    ktp_photo: null, pass_photo: null, selfie_with_ktp: null, sim_card_photo: null,
  });

  // Crop dialog states
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropField, setCropField] = useState<PhotoField | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // ── Crop helpers ────────────────────────────────────
  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", reject);
      img.setAttribute("crossOrigin", "anonymous");
      img.src = url;
    });

  const getCroppedImg = async (imageSrc: string, cropPx: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = cropPx.width;
    canvas.height = cropPx.height;
    ctx?.drawImage(image, cropPx.x, cropPx.y, cropPx.width, cropPx.height, 0, 0, cropPx.width, cropPx.height);
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), "image/jpeg"));
  };

  // Open crop dialog
  const openCropDialog = (field: PhotoField, file?: File) => {
    setCropField(field);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);

    if (file) {
      setCropSrc(URL.createObjectURL(file));
    } else if (previews[field]) {
      setCropSrc(previews[field]);
    }
    setCropDialogOpen(true);
  };

  // Handle file input change → langsung buka crop dialog
  const handleFileInput = (field: PhotoField, file: File | null) => {
    if (!file) return;
    openCropDialog(field, file);
  };

  // Save crop
  const handleSaveCrop = async () => {
    if (!cropSrc || !croppedAreaPixels || !cropField) return;
    setIsUploading(true);
    try {
      const blob = await getCroppedImg(cropSrc, croppedAreaPixels);
      const file = new File([blob], `${cropField}.jpg`, { type: "image/jpeg" });
      setPhotos((prev) => ({ ...prev, [cropField]: file }));
      setPreviews((prev) => ({ ...prev, [cropField]: URL.createObjectURL(blob) }));
      setCropDialogOpen(false);
      setCropSrc(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1 && !agreed) {
      setErrorMsg("Anda harus menyetujui syarat dan ketentuan untuk melanjutkan.");
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => form.append(key, value));
      form.append("password_confirmation", formData.password);
      Object.entries(photos).forEach(([key, file]) => { if (file) form.append(key, file); });
      await registerTraveler(form);
      setSubmitted(true);
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message;
      if (errors) {
        const first = Object.values(errors)[0] as string[];
        setErrorMsg(first[0]);
      } else {
        setErrorMsg(message ?? "Terjadi kesalahan, silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const docChecklist = [
    { label: "Nama Lengkap",      value: formData.name },
    { label: "Email",             value: formData.email },
    { label: "Nomor Telepon",     value: formData.phone },
    { label: "Nomor KTP",         value: formData.ktp_number },
    { label: "Tanggal Lahir",     value: formData.birth_date },
    { label: "Jenis Kelamin", value: formData.gender === "male" ? "Laki-laki" : formData.gender === "female" ? "Perempuan" : "" },
    { label: "Kota",              value: formData.city },
    { label: "Provinsi",          value: formData.province },
    { label: "Foto KTP",          value: photos.ktp_photo?.name },
    { label: "Pas Foto",          value: photos.pass_photo?.name },
    { label: "Selfie dengan KTP", value: photos.selfie_with_ktp?.name },
    { label: "Foto SIM",          value: photos.sim_card_photo?.name },
  ];

  // Aspect ratio per field
  const aspectRatio: Record<PhotoField, number> = {
    ktp_photo: 16 / 9,
    pass_photo: 3 / 4,
    selfie_with_ktp: 3 / 4,
    sim_card_photo: 16 / 9,
  };

  // Success
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-card p-10 shadow-card text-center max-w-md w-full"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-muted-foreground mb-2">
            Terima kasih telah mendaftar sebagai Traveler di{" "}
            <span className="font-semibold">{appNameFirst}{appNameLast}</span>.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Data Anda sedang dalam proses verifikasi oleh admin dalam <strong>1–3 hari kerja</strong>.
          </p>
          <Button variant="hero" className="w-full" onClick={() => navigate("/login")}>
            Ke Halaman Login <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b border-border h-16 flex items-center px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            {appNameFirst}<span className="text-primary">{appNameLast}</span>
          </span>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* back button */}
        <div className="mb-6">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Halaman Daftar
          </Link>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-10">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            const done = s < step;
            const active = s === step;
            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`
                    flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300
                    ${done   ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                    : active ? "bg-green-600 text-white shadow-[0_0_16px_rgba(22,163,74,0.45)] scale-110"
                    :          "bg-zinc-100 text-zinc-400 border border-zinc-200"}
                  `}>
                    {done ? <CheckCircle className="h-4 w-4" /> : s}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    active ? "text-green-600" : done ? "text-emerald-500" : "text-zinc-400"
                  }`}>{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`mx-2 mb-4 h-[2px] w-10 sm:w-12 rounded-full transition-all duration-500 ${
                    s < step ? "bg-emerald-400" : "bg-zinc-200"
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl bg-card p-6 md:p-8 shadow-card"
          >

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <FileCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Syarat & Ketentuan</h2>
                    <p className="text-sm text-muted-foreground">Baca dengan seksama sebelum mendaftar</p>
                  </div>
                </div>

                <div className="h-96 overflow-y-auto rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground space-y-4 mb-6">
                  <h3 className="font-semibold text-foreground text-base">Syarat Menjadi Traveler di {appNameFirst}{appNameLast}</h3>
                  {[
                    { title: "1. Persyaratan Umum", items: ["WNI berusia minimal 18 tahun.", "Memiliki KTP yang masih berlaku.", "Memiliki SIM yang masih berlaku.", "Memiliki nomor telepon aktif.", "Memiliki alamat email aktif."] },
                    { title: "2. Dokumen yang Diperlukan", items: ["Pas foto terbaru latar belakang polos.", "Foto KTP yang jelas dan terbaca.", "Foto selfie sambil memegang KTP.", "Foto SIM yang masih berlaku."] },
                    { title: "3. Kewajiban Traveler", items: ["Bertanggung jawab penuh atas barang titipan.", "Mengantarkan barang sesuai kesepakatan.", "Menjaga kondisi barang agar tidak rusak.", "Memberikan informasi perjalanan yang akurat.", "Merespons pesan customer dalam waktu wajar.", "Melaporkan kendala dalam pengiriman."] },
                    { title: "4. Larangan", items: ["Dilarang menerima barang ilegal atau berbahaya.", "Dilarang membuka atau merusak barang titipan.", "Dilarang memberikan informasi palsu.", "Dilarang melakukan penipuan terhadap customer."] },
                    { title: "5. Proses Verifikasi", items: ["Verifikasi oleh admin dalam 1–3 hari kerja.", "Admin berhak menolak jika dokumen tidak memenuhi syarat.", "Akun dapat dinonaktifkan jika ada pelanggaran."] },
                    { title: "6. Kebijakan Komisi", items: ["Platform memotong komisi dari setiap transaksi.", "Besaran komisi ditentukan sistem dan dapat berubah.", "Pembayaran dilakukan setelah order selesai dikonfirmasi."] },
                    { title: "7. Privasi Data", items: ["Data pribadi dijaga kerahasiaannya.", "Data hanya digunakan untuk keperluan verifikasi dan operasional."] },
                  ].map(({ title, items }) => (
                    <div key={title} className="space-y-1">
                      <p className="font-semibold text-foreground">{title}</p>
                      <ul className="list-disc pl-5 space-y-1">{items.map(i => <li key={i}>{i}</li>)}</ul>
                    </div>
                  ))}
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded border-border accent-green-600 cursor-pointer"
                  />
                  <span className="text-sm text-foreground">
                    Saya telah membaca dan menyetujui{" "}
                    <span className="font-semibold text-primary">Syarat, Ketentuan</span> dan{" "}
                    <span className="font-semibold text-primary">Kebijakan Privasi</span> yang berlaku.
                  </span>
                </label>
              </>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Biodata Diri</h2>
                    <p className="text-sm text-muted-foreground">Isi data diri dengan lengkap dan benar</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="name" placeholder="Sesuai KTP" value={formData.name} onChange={handleChange} className="pl-10 h-12" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Jenis Kelamin</Label>
                      <select id="gender" value={formData.gender} onChange={handleChange} className="h-12 w-full rounded-lg border bg-background px-3 text-sm" required>
                        <option value="">Pilih jenis kelamin</option>
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Tanggal Lahir</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="birth_date" type="date" value={formData.birth_date} onChange={handleChange} className="pl-10 h-12" required />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ktp_number">Nomor KTP</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="ktp_number" placeholder="16 digit NIK" value={formData.ktp_number} onChange={handleChange} className="pl-10 h-12" maxLength={16} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" type="tel" placeholder="08xxxxxxxxxx" value={formData.phone} onChange={handleChange} className="pl-10 h-12" required />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat Lengkap</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Textarea id="address" placeholder="Jalan, RT/RW, Kelurahan, Kecamatan" value={formData.address} onChange={handleChange} className="pl-10 min-h-[80px]" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Kota / Kabupaten</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="city" placeholder="Nama kota" value={formData.city} onChange={handleChange} className="pl-10 h-12" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Provinsi</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="province" placeholder="Nama provinsi" value={formData.province} onChange={handleChange} className="pl-10 h-12" required />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="nama@email.com" value={formData.email} onChange={handleChange} className="pl-10 h-12" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="Minimal 8 karakter" value={formData.password} onChange={handleChange} className="pl-10 pr-10 h-12" minLength={8} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 3: Data Pendukung dengan Grid Layout ── */}
            {step === 3 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Data Pendukung</h2>
                    <p className="text-sm text-muted-foreground">Klik foto untuk upload atau edit dokumen</p>
                  </div>
                </div>

                {/* Grid layout sesuai referensi foto */}
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: "1fr 1fr",
                    gridTemplateRows: "auto auto auto",
                  }}
                >
                  {/* div1: Foto KTP — spans 2 kolom, 2 baris */}
                  <PhotoCard
                    field="ktp_photo"
                    label="Foto KTP"
                    preview={previews.ktp_photo}
                    style={{ gridColumn: "1 / 3", gridRow: "1 / 3" }}
                    className="aspect-video"
                    onOpen={() => {
                      if (previews.ktp_photo) {
                        openCropDialog("ktp_photo");
                      } else {
                        document.getElementById("input-ktp_photo")?.click();
                      }
                    }}
                  />
                  <input id="input-ktp_photo" type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleFileInput("ktp_photo", e.target.files?.[0] ?? null)} />

                  {/* div2: Pas Foto — 1 kolom, 1 baris */}
                  <PhotoCard
                    field="pass_photo"
                    label="Pas Foto 3×4"
                    preview={previews.pass_photo}
                    style={{ gridColumn: "1 / 2", gridRow: "3 / 4" }}
                    className="aspect-[3/4]"
                    onOpen={() => {
                      if (previews.pass_photo) {
                        openCropDialog("pass_photo");
                      } else {
                        document.getElementById("input-pass_photo")?.click();
                      }
                    }}
                  />
                  <input id="input-pass_photo" type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleFileInput("pass_photo", e.target.files?.[0] ?? null)} />

                  {/* div3: Selfie KTP — 1 kolom, 1 baris (ukuran sama dengan pas foto) */}
                  <PhotoCard
                    field="selfie_with_ktp"
                    label="Selfie dengan KTP"
                    preview={previews.selfie_with_ktp}
                    style={{ gridColumn: "2 / 3", gridRow: "3 / 4" }}
                    className="aspect-[3/4]"
                    onOpen={() => {
                      if (previews.selfie_with_ktp) {
                        openCropDialog("selfie_with_ktp");
                      } else {
                        document.getElementById("input-selfie_with_ktp")?.click();
                      }
                    }}
                  />
                  <input id="input-selfie_with_ktp" type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleFileInput("selfie_with_ktp", e.target.files?.[0] ?? null)} />

                  {/* div4: Foto SIM — spans 2 kolom */}
                  <PhotoCard
                    field="sim_card_photo"
                    label="Foto Kartu SIM"
                    preview={previews.sim_card_photo}
                    style={{ gridColumn: "1 / 3", gridRow: "4 / 5" }}
                    className="aspect-video"
                    onOpen={() => {
                      if (previews.sim_card_photo) {
                        openCropDialog("sim_card_photo");
                      } else {
                        document.getElementById("input-sim_card_photo")?.click();
                      }
                    }}
                  />
                  <input id="input-sim_card_photo" type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleFileInput("sim_card_photo", e.target.files?.[0] ?? null)} />
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Klik pada area foto untuk upload. Klik lagi untuk mengedit foto yang sudah diupload.
                </p>
              </>
            )}

            {/* ── STEP 4: Konfirmasi ── */}
            {step === 4 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Plane className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Konfirmasi Pendaftaran</h2>
                    <p className="text-sm text-muted-foreground">Periksa kelengkapan sebelum mendaftar</p>
                  </div>
                </div>

                {/* Checklist */}
                <div className="rounded-xl border border-border bg-muted/30 p-5 mb-5">
                  <h3 className="font-semibold text-foreground mb-4">Kelengkapan Dokumen</h3>
                  <div className="space-y-2">
                    {docChecklist.map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <div className="flex items-center gap-2">
                          {value ? (
                            <>
                              <span className="text-foreground text-right max-w-[160px] truncate">{value}</span>
                              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                            </>
                          ) : (
                            <div className="flex items-center gap-1 text-red-500">
                              <AlertCircle className="h-4 w-4" />
                              <span>Belum diisi</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Admin */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 shrink-0 mt-0.5">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-800 text-sm">Perlu Persetujuan Admin</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Pendaftaran akan ditinjau admin dalam <strong>1–3 hari kerja</strong>. Notifikasi dikirim via email setelah disetujui.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tombol Daftar */}
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={isLoading || docChecklist.some(d => !d.value)}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span key={i} className="h-1.5 w-1.5 rounded-full bg-white"
                          style={{ animation: "loginDotBounce 0.7s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </span>
                  ) : (
                    <> Daftar sebagai Traveler <ArrowRight className="ml-2 h-4 w-4" /> </>
                  )}
                </Button>

                {docChecklist.some(d => !d.value) && (
                  <p className="text-xs text-red-500 text-center mt-3 flex items-center justify-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Lengkapi semua data yang belum diisi
                  </p>
                )}
              </>
            )}

            {/* ── Tombol Navigasi step 1–3 dan Sebelumnya di step 4 ── */}
            {step < 4 ? (
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(step - 1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Sebelumnya
                  </Button>
                )}
                <Button variant="hero" size="lg" className="flex-1" onClick={handleNext}>
                  Lanjutkan <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              // Tombol Sebelumnya di step 4
              <div className="mt-4">
                <Button variant="outline" size="lg" className="w-full" onClick={() => setStep(3)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Halaman Sebelumnya
                </Button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">Masuk</Link>
        </p>
      </div>

      {/* ── Crop Dialog ── */}
      <Dialog open={cropDialogOpen} onOpenChange={(open) => {
        setCropDialogOpen(open);
        if (!open) setCropSrc(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Foto</DialogTitle>
            <DialogDescription>
              Sesuaikan posisi dan ukuran foto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {cropSrc && (
              <div className="relative w-full h-64 rounded-xl overflow-hidden bg-black">
                <Cropper
                  image={cropSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={cropField ? aspectRatio[cropField] : 1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                />
              </div>
            )}

            {/* Ganti foto */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Ganti foto</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setCropSrc(URL.createObjectURL(file));
                }}
              />
            </div>

            {/* Zoom slider */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Zoom</Label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-green-600"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setCropDialogOpen(false); setCropSrc(null); }}>
              Batal
            </Button>
            <Button onClick={handleSaveCrop} disabled={!croppedAreaPixels || isUploading}>
              {isUploading ? "Menyimpan..." : (
                <><Camera className="h-4 w-4 mr-2" /> Simpan Foto</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Komponen PhotoCard ───────────────────────────────
function PhotoCard({
  field, label, preview, style, className, onOpen,
}: {
  field: PhotoField;
  label: string;
  preview: string | null;
  style?: React.CSSProperties;
  className?: string;
  onOpen: () => void;
}) {
  return (
    <div style={style} className={`relative rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer group ${className}`}
      onClick={onOpen}
    >
      {preview ? (
        <>
          <img src={preview} alt={label} className="w-full h-full object-cover" />
          {/* Overlay edit */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <p className="text-white text-xs font-medium">Edit Foto</p>
          </div>
          {/* Badge sudah upload */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            <CheckCircle className="h-3 w-3" /> Terupload
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 min-h-[120px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground text-center">{label}</p>
          <p className="text-xs text-muted-foreground text-center">Klik untuk upload</p>
        </div>
      )}

      {/* Label di bawah */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pointer-events-none">
        <p className="text-white text-xs font-medium">{label}</p>
      </div>
    </div>
  );
}