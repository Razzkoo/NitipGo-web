import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ArrowRight, MapPin, Shield, Clock, Star, Users,
  TrendingUp, Sparkles, X, CheckCircle, CheckCircle2,
  Megaphone, BarChart2, Globe, Zap, ChevronLeft,
  ChevronRight, Building2, FileText, Link2, Upload,
  Loader2, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/MainLayout";
import { CountUp } from "@/components/ui/CountUp";
import heroImage from "@/assets/hero-illustration.png";
import { useAppSettings } from "@/components/layout/AppSettingsContent";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LiveAd {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string;
  partnerName: string;
  package: string;
  slotIndex: number;
}

interface PackageInfo {
  days: number;
  price: number;
  label: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const availableTrips = [
  { id: 1, traveler: "Andi Pratama", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=andi", from: "Jakarta", to: "Bandung", date: "15 Feb 2024", capacity: "5 kg tersisa", rating: 4.9, trips: 127 },
  { id: 2, traveler: "Sari Dewi",    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sari",  from: "Surabaya", to: "Malang",   date: "16 Feb 2024", capacity: "3 kg tersisa", rating: 4.8, trips: 89 },
  { id: 3, traveler: "Budi Santoso", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=budi",  from: "Yogyakarta", to: "Semarang", date: "17 Feb 2024", capacity: "8 kg tersisa", rating: 5.0, trips: 203 },
];

const features = [
  { icon: Shield,  title: "Aman & Terpercaya", description: "Semua traveler terverifikasi dan transaksi dijamin aman dengan sistem escrow." },
  { icon: Clock,   title: "Cepat & Efisien",   description: "Barang dikirim langsung oleh traveler yang sedang bepergian ke tujuan Anda." },
  { icon: MapPin,  title: "Jangkauan Luas",    description: "Ribuan rute perjalanan tersedia dari dan ke berbagai kota di Indonesia." },
];

const howItWorksCustomer = [
  { step: 1, title: "Pilih Layanan",    desc: "Titip beli atau kirim barang" },
  { step: 2, title: "Cari Traveler",    desc: "Temukan traveler ke tujuan" },
  { step: 3, title: "Konfirmasi Order", desc: "Bayar dan tunggu konfirmasi" },
  { step: 4, title: "Terima Barang",    desc: "Ambil di titik temu/mitra pos" },
];

const howItWorksTraveler = [
  { step: 1, title: "Daftar Rute",      desc: "Input jadwal perjalananmu" },
  { step: 2, title: "Terima Order",     desc: "Pilih order yang sesuai" },
  { step: 3, title: "Bawa Barang",      desc: "Antar barang sekalian jalan" },
  { step: 4, title: "Dapat Penghasilan",desc: "Saldo masuk ke akunmu" },
];

const stats = [
  { value: 50,  suffix: "K+", label: "Customer Puas" },
  { value: 10,  suffix: "K+", label: "Mitra Traveler" },
  { value: 100, suffix: "+",  label: "Kota Terjangkau" },
  { value: 4.9, decimals: 1,  label: "Rating Rata-rata" },
];

const AD_TERMS = [
  "Iklan harus sesuai nilai dan layanan platform NitipGo.",
  "Konten tidak boleh mengandung SARA, penipuan, atau produk ilegal.",
  "Materi iklan dalam format JPG/PNG, min. 1200×400px.",
  "Iklan melalui review tim NitipGo maks. 2×24 jam.",
  "Tarif dihitung per paket dan dibayar di muka.",
  "NitipGo berhak menurunkan iklan yang melanggar tanpa pengembalian biaya.",
];

// ─── Animations ───────────────────────────────────────────────────────────────

const containerV: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};
const itemV: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

// ─── Fallback dummy ads (shown while API loads or if no ads) ─────────────────

const DUMMY_ADS: LiveAd[] = [
  {
    id: -1, slotIndex: 1, package: "premium", partnerName: "Tokopedia",
    title: "Belanja Bebas Ongkir",
    description: "Gratis ongkir ke seluruh Indonesia. Nikmati ribuan produk pilihan.",
    imageUrl: null, linkUrl: "#",
  },
  {
    id: -2, slotIndex: 2, package: "standard", partnerName: "BNI",
    title: "Cashback 10% Setiap Transaksi",
    description: "Bayar lebih hemat dengan BNI Mobile Banking. Berlaku akhir bulan.",
    imageUrl: null, linkUrl: "#",
  },
  {
    id: -3, slotIndex: 3, package: "basic", partnerName: "Traveloka",
    title: "Hotel & Tiket Murah",
    description: "Penginapan dan tiket terbaik di 200+ kota di Indonesia.",
    imageUrl: null, linkUrl: "#",
  },
];

// ─── Ad Carousel ─────────────────────────────────────────────────────────────

function AdCarousel({ ads, onClickAdvertise }: { ads: LiveAd[]; onClickAdvertise: () => void }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filter hanya real ads (bukan dummy)
  const realAds = ads.filter(a => a.id > 0);
  // Total slot: real ads + 1 CTA
  const totalSlots = realAds.length + 1;

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % totalSlots);
    }, 6500);
  };

  useEffect(() => {
    setCurrent(0);
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [totalSlots]);

  const pause = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resume = () => { startTimer(); };
  const prev = () => { pause(); setCurrent(c => (c - 1 + totalSlots) % totalSlots); resume(); };
  const next = () => { pause(); setCurrent(c => (c + 1) % totalSlots); resume(); };

  const AD_GRADIENTS = [
    "from-[#03AC0E] to-[#025a07]",
    "from-[#f97316] to-[#c2410c]",
    "from-[#2563eb] to-[#1e40af]",
  ];

  return (
    <div className="space-y-4">
      {/* Label */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/60" />
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 py-1 rounded-full bg-muted/60 border border-border/40">
          <Megaphone className="h-3 w-3" /> Iklan
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      {/* Carousel */}
      <div className="relative rounded-2xl overflow-hidden"
        onMouseEnter={pause} onMouseLeave={resume}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {current < realAds.length ? (
              /* ── Real Ad Slot ── */
              (() => {
                const ad = realAds[current];
                return (
                  <a
                    href={ad.linkUrl !== "#" ? ad.linkUrl : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex overflow-hidden rounded-2xl min-h-[220px] md:min-h-[240px] shadow-lg group cursor-pointer bg-zinc-900"
                  >
                    {/* Foto iklan sebagai background penuh */}
                    {ad.imageUrl ? (
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      // Fallback jika tidak ada gambar: background gelap polos
                      <div className="absolute inset-0 bg-zinc-800" />
                    )}

                    {/* Dark gradient overlay agar teks terbaca */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                    {/* Konten teks di atas foto */}
                    <div className="relative z-10 flex flex-col justify-end p-6 md:p-8 w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm">
                          {ad.partnerName}
                        </span>
                        <span className="text-[9px] text-white/50 bg-black/30 px-1.5 py-0.5 rounded backdrop-blur-sm">
                          Iklan
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white leading-tight mb-1.5 drop-shadow-md">
                        {ad.title}
                      </h3>
                      {ad.description && (
                        <p className="text-sm text-white/80 leading-relaxed line-clamp-2 mb-4 drop-shadow-sm max-w-lg">
                          {ad.description}
                        </p>
                      )}
                      <div>
                        <span className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-white/20">
                          Lihat Penawaran <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })()
            ) : (
              /* ── CTA Slot "Pasang Iklan" ── */
              <button onClick={onClickAdvertise}
                className="relative w-full overflow-hidden rounded-2xl border border-dashed border-border hover:border-primary/40 bg-muted/30 hover:bg-primary/3 min-h-[200px] flex flex-col items-center justify-center gap-4 p-8 transition-all group cursor-pointer">
                <div className="relative z-10 flex flex-col items-center gap-3 text-center max-w-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Megaphone className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">Pasang Iklan di Sini</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      Jangkau ribuan customer & traveler aktif NitipGo setiap hari
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <BarChart2 className="h-3.5 w-3.5" /> Jangkauan Luas
                    </span>
                    <span className="text-border">·</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <Zap className="h-3.5 w-3.5" /> Tayang Cepat
                    </span>
                    <span className="text-border">·</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" /> 50K+ User
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2 rounded-xl group-hover:bg-primary/90 transition-colors shadow-sm">
                    Pelajari & Daftar <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Arrow Controls — hanya tampil jika ada lebih dari 1 slot */}
        {totalSlots > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition z-20">
              <ChevronLeft className="h-4 w-4 text-white" />
            </button>
            <button onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition z-20">
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {totalSlots > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalSlots }).map((_, i) => (
            <button key={i} onClick={() => { pause(); setCurrent(i); resume(); }}
              className={`rounded-full transition-all ${
                i === current
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-border hover:bg-primary/40"
              }`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Ad Registration Modal (4 Steps) ─────────────────────────────────────────

const STEP_LABELS = ["Ketentuan", "Informasi", "Pembayaran", "Selesai"];

function AdModal({ open, onClose, packages, nextStartDate, liveCount, maxSlots }: {
  open: boolean;
  onClose: () => void;
  packages: Record<string, PackageInfo>;
  nextStartDate: string;
  liveCount: number;
  maxSlots: number;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);

  // Step 2 form
  const [form, setForm] = useState({
    partnerName: "", partnerContact: "", title: "", description: "",
    imageFile: null as File | null, imageUrl: "", linkUrl: "",
    package: "basic" as string,
  });

  // Step 3 payment
  const [paying, setPaying]   = useState(false);
  const [adId, setAdId]       = useState<number | null>(null);

  const reset = () => {
    setStep(1); setAgreed(false);
    setForm({ partnerName: "", partnerContact: "", title: "", description: "", imageFile: null, imageUrl: "", linkUrl: "", package: "basic" });
    setPaying(false); setAdId(null);
  };

  const close = () => { reset(); onClose(); };

  const slotsAvailable = liveCount < maxSlots;

  // ── Step 3: Submit form + get snap token
  const handlePay = async () => {
    setPaying(true);
    try {
      const fd = new FormData();
      fd.append("partner_name",    form.partnerName);
      fd.append("partner_contact", form.partnerContact);
      fd.append("title",           form.title);
      fd.append("description",     form.description);
      fd.append("link_url",        form.linkUrl);
      fd.append("package",         form.package);
      if (form.imageFile)        fd.append("image",     form.imageFile);
      else if (form.imageUrl)    fd.append("image_url", form.imageUrl);

      const res = await api.post("/advertisements", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { snap_token, snap_url, client_key, ad_id } = res.data;
      if (!snap_token || !snap_url || !client_key) {
        throw new Error("Invalid payment response from server");
      }

      setAdId(ad_id);

      const existingScript = document.querySelector('script[src*="snap"]');
      if (existingScript) existingScript.remove();

      const script = document.createElement("script");
      script.src = snap_url;
      script.setAttribute("data-client-key", client_key);

      script.onerror = () => {
        toast({ title: "Gagal memuat payment gateway", variant: "destructive" });
        setPaying(false);
      };

      script.onload = () => {
        if (!(window as any).snap) {
          toast({ title: "Payment gateway tidak tersedia", variant: "destructive" });
          setPaying(false);
          return;
        }

        // ── KUNCI: close dialog
        onClose();

        // delay dialog
        setTimeout(() => {
          (window as any).snap.pay(snap_token, {
            onSuccess: async () => {
              if (ad_id) await api.post(`/advertisements/${ad_id}/sync`).catch(() => {});
              // Reset step 4 
              setStep(4);
              toast({ 
                title: "Iklan Berhasil Didaftarkan!", 
                description: "Tim kami akan mereview iklan Anda dalam 1×24 jam." 
              });
            },
            onPending: () => {
              toast({ title: "Pembayaran sedang diproses..." });
            },
            onError: () => {
              toast({ title: "Pembayaran gagal", variant: "destructive" });
              setPaying(false);
            },
            onClose: async () => {
              if (ad_id) {
                const sync = await api.post(`/advertisements/${ad_id}/sync`).catch(() => null);
                if (sync?.data?.paid) {
                  toast({ title: "Pembayaran berhasil! Iklan sedang direview." });
                }
              }
              setPaying(false);
            },
          });
        }, 300);
      };

      document.head.appendChild(script);

    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Gagal membuat iklan";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
      setPaying(false);
    }
  };

  const selectedPkg = packages[form.package] ?? Object.values(packages)[0];

  const step2Valid = form.partnerName.trim() && form.title.trim() && form.linkUrl.trim() && form.package;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) close(); }}>
      <DialogContent className="max-w-lg p-0 gap-0 rounded-2xl overflow-hidden">
        <div className="overflow-y-auto max-h-[90vh]">

          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary to-primary/80 px-6 pt-5 pb-6 overflow-hidden">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-white/10 blur-xl" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 mb-2.5">
                  <Megaphone className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Pasang Iklan di NitipGo</h2>
                <p className="text-sm text-white/70 mt-0.5">Jangkau ribuan pengguna aktif setiap hari</p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="relative mt-4 flex items-center gap-0">
              {STEP_LABELS.map((label, i) => {
                const s = i + 1;
                const done = step > s;
                const active = step === s;
                return (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        done ? "bg-white text-primary" : active ? "bg-white text-primary ring-2 ring-white/50 ring-offset-1 ring-offset-primary" : "bg-white/20 text-white/60"
                      }`}>
                        {done ? <CheckCircle className="h-4 w-4" /> : s}
                      </div>
                      <span className={`text-[9px] mt-1 font-medium ${active ? "text-white" : "text-white/50"}`}>{label}</span>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div className={`flex-1 h-px mx-1 mb-4 ${step > s ? "bg-white" : "bg-white/20"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 divide-x divide-border/60 border-b border-border/60 bg-muted/30">
            {[
              { icon: Users,    label: "Pengguna Aktif", value: "50K+" },
              { icon: Globe,    label: "Kota",           value: "100+" },
              { icon: BarChart2,label: "Tayangan/Hari",  value: "10K+" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center py-2.5 px-2 text-center">
                <s.icon className="h-3.5 w-3.5 text-primary mb-0.5" />
                <p className="text-sm font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Ketentuan ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="px-6 py-5 space-y-4">

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Syarat & Ketentuan</p>
                  <div className="space-y-2.5">
                    {AD_TERMS.map((t, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground/80 leading-relaxed">{t}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Queue info */}
                <div className={`rounded-xl px-4 py-3 border ${slotsAvailable ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                  <p className={`text-xs font-semibold mb-1 ${slotsAvailable ? "text-emerald-700" : "text-amber-700"}`}>
                    Slot Iklan Saat Ini
                  </p>
                  <p className={`text-sm ${slotsAvailable ? "text-emerald-600" : "text-amber-600"}`}>
                    {slotsAvailable
                      ? `${maxSlots - liveCount} slot tersedia — iklan Anda bisa tayang mulai ${nextStartDate}`
                      : `Semua slot penuh. Iklan masuk antrian dan tayang mulai ${nextStartDate}`}
                  </p>
                </div>

                {/* Agree */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${agreed ? "border-primary bg-primary" : "border-border group-hover:border-primary/60"}`}
                    onClick={() => setAgreed(v => !v)}>
                    {agreed && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Saya telah membaca dan menyetujui semua syarat & ketentuan di atas.
                  </p>
                </label>

                <div className="flex gap-2">
                  <button onClick={close}
                    className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/40 transition">
                    Batal
                  </button>
                  <button onClick={() => setStep(2)} disabled={!agreed}
                    className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5">
                    Lanjutkan <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Info Iklan ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="px-6 py-5 space-y-4">

                {/* Mitra */}
                <div className="rounded-xl bg-muted/30 border border-border/50 p-3.5 space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Informasi Mitra</p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" /> Nama Perusahaan / Mitra <span className="text-red-500">*</span>
                    </label>
                    <Input placeholder="Contoh: PT. Maju Jaya" value={form.partnerName}
                      onChange={e => setForm({ ...form, partnerName: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-3 w-3" /> Email / Kontak
                    </label>
                    <Input placeholder="marketing@perusahaan.com" value={form.partnerContact}
                      onChange={e => setForm({ ...form, partnerContact: e.target.value })} className="rounded-xl" />
                  </div>
                </div>

                {/* Konten */}
                <div className="rounded-xl bg-muted/30 border border-border/50 p-3.5 space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Konten Iklan</p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Megaphone className="h-3 w-3" /> Judul Iklan <span className="text-red-500">*</span>
                    </label>
                    <Input placeholder="Promo spesial untuk Anda!" value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-3 w-3" /> Deskripsi Singkat
                    </label>
                    <textarea rows={2} placeholder="Ceritakan promo atau penawaran Anda..."
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      className="flex w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Upload className="h-3 w-3" /> Gambar Iklan (opsional)
                    </label>
                    <Input type="file" accept="image/*"
                      onChange={e => setForm({ ...form, imageFile: e.target.files?.[0] ?? null })}
                      className="rounded-xl" />
                    <p className="text-[10px] text-muted-foreground">JPG/PNG, min. 1200×400px. Atau isi URL di bawah.</p>
                    <Input placeholder="https://... (URL gambar)" value={form.imageUrl}
                      onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Link2 className="h-3 w-3" /> URL Tujuan Iklan <span className="text-red-500">*</span>
                    </label>
                    <Input placeholder="https://perusahaan.com/promo" value={form.linkUrl}
                      onChange={e => setForm({ ...form, linkUrl: e.target.value })} className="rounded-xl" />
                  </div>
                </div>

                {/* Paket */}
                <div className="rounded-xl bg-muted/30 border border-border/50 p-3.5 space-y-2.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pilih Paket</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(packages).map(([key, pkg]) => (
                      <button key={key} type="button" onClick={() => setForm({ ...form, package: key })}
                        className={`rounded-xl border-2 p-3 text-center transition-all ${
                          form.package === key
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/30"
                        }`}>
                        <p className="text-xs font-bold text-foreground capitalize">{pkg.label}</p>
                        <p className="text-lg font-black text-foreground">{pkg.days}<span className="text-xs font-normal"> hari</span></p>
                        <p className="text-xs font-semibold text-primary mt-0.5">{formatRupiah(pkg.price)}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setStep(1)}
                    className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/40 transition flex items-center justify-center gap-1.5">
                    <ChevronLeft className="h-4 w-4" /> Kembali
                  </button>
                  <button onClick={() => setStep(3)} disabled={!step2Valid}
                    className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5">
                    Ke Pembayaran <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Pembayaran ── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="px-6 py-5 space-y-4">

                {/* Summary */}
                <div className="rounded-xl bg-muted/30 border border-border/50 p-4 space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ringkasan Iklan</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mitra</span>
                      <span className="font-semibold">{form.partnerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Judul Iklan</span>
                      <span className="font-semibold line-clamp-1 max-w-[180px] text-right">{form.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paket</span>
                      <span className="font-semibold">{selectedPkg?.label} ({selectedPkg?.days} hari)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mulai Tayang</span>
                      <span className="font-semibold">{nextStartDate}</span>
                    </div>
                  </div>
                  <div className="border-t border-border/60 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-foreground">Total Pembayaran</span>
                    <span className="text-xl font-black text-primary">{formatRupiah(selectedPkg?.price ?? 0)}</span>
                  </div>
                </div>

                {/* Payment info */}
                <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 flex items-start gap-2.5">
                  <CreditCard className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-primary mb-0.5">Pembayaran via Midtrans</p>
                    <p className="text-xs text-muted-foreground">
                      Transfer bank, e-wallet (GoPay, OVO, Dana), QRIS, kartu kredit/debit
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setStep(2)}
                    className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/40 transition flex items-center justify-center gap-1.5">
                    <ChevronLeft className="h-4 w-4" /> Kembali
                  </button>
                  <button onClick={handlePay} disabled={paying}
                    className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition flex items-center justify-center gap-1.5">
                    {paying
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
                      : <><CreditCard className="h-4 w-4" /> Bayar Sekarang</>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Berhasil ── */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center px-6 py-10 space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground">Iklan Berhasil Didaftarkan!</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
                    Terima kasih! Iklan <strong>{form.title}</strong> sedang dalam proses review oleh tim NitipGo. Iklan akan tayang maksimal 2×24 jam.
                  </p>
                </div>
                <div className="rounded-xl bg-muted/40 border border-border/50 px-4 py-3 w-full text-left space-y-1.5">
                  <p className="text-xs text-muted-foreground">Mulai tayang: <span className="font-semibold text-foreground">{nextStartDate}</span></p>
                  <p className="text-xs text-muted-foreground">Paket: <span className="font-semibold text-foreground">{selectedPkg?.label} · {selectedPkg?.days} hari</span></p>
                  <p className="text-xs text-muted-foreground">Email konfirmasi dikirim ke: <span className="font-semibold text-foreground">{form.partnerContact || "-"}</span></p>
                </div>
                <button onClick={close}
                  className="h-11 px-8 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition">
                  Selesai
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Index() {
  const { appNameFirst, appNameLast } = useAppSettings();

  const [liveAds, setLiveAds]         = useState<LiveAd[]>(DUMMY_ADS);
  const [packages, setPackages]       = useState<Record<string, PackageInfo>>({
    basic:    { days: 7,  price: 150_000, label: "Basic" },
    standard: { days: 14, price: 250_000, label: "Standard" },
    premium:  { days: 30, price: 450_000, label: "Premium" },
  });
  const [nextStartDate, setNextStartDate] = useState("");
  const [liveCount, setLiveCount]     = useState(0);
  const [maxSlots]                    = useState(3);
  const [adModalOpen, setAdModalOpen] = useState(false);

  useEffect(() => {
    // Fetch live ads
    api.get("/advertisements/live").then(res => {
      if (res.data.data?.length) setLiveAds(res.data.data);
    }).catch(() => {});

    // Fetch packages info
    api.get("/advertisements/packages").then(res => {
      if (res.data.packages) setPackages(res.data.packages);
      setNextStartDate(res.data.next_start_date ?? "");
      setLiveCount(res.data.live_count ?? 0);
    }).catch(() => {});
  }, []);

  return (
    <MainLayout>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="container relative py-16 md:py-24 lg:py-32">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div variants={containerV} initial="hidden" animate="visible" className="space-y-6">
              <motion.div variants={itemV}>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" /><span>Sekalian Jalan, Nitip Barang!</span>
                </div>
              </motion.div>
              <motion.h1 variants={itemV} className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Kirim Barang <span className="text-gradient-primary">Lebih Mudah</span> dengan Traveler
              </motion.h1>
              <motion.p variants={itemV} className="max-w-lg text-lg text-muted-foreground">
                {appNameFirst}{appNameLast} mempertemukan Anda dengan traveler yang sedang bepergian ke kota tujuan. Hemat biaya, cepat sampai, dan aman terpercaya.
              </motion.p>
              <motion.div variants={itemV} className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg" asChild className="group shadow-lg shadow-accent/25">
                  <Link to="/register">Mulai Sekarang <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" /></Link>
                </Button>
                <Button variant="outline" size="lg" asChild><Link to="/cara-kerja">Pelajari Lebih Lanjut</Link></Button>
              </motion.div>
              <motion.div variants={itemV} className="flex flex-wrap gap-6 pt-4">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      <CountUp end={stat.value} suffix={stat.suffix || ""} decimals={stat.decimals || 0} duration={2000} />
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.3 }} className="relative">
              <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img src={heroImage} alt="NitipGo" className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -left-4 bottom-8 hidden md:block">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="rounded-xl bg-card p-4 shadow-card-hover backdrop-blur-sm border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20"><Shield className="h-5 w-5 text-success" /></div>
                    <div><p className="text-sm font-semibold">100% Aman</p><p className="text-xs text-muted-foreground">Garansi uang kembali</p></div>
                  </div>
                </motion.div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 1 }}
                className="absolute -right-4 top-8 hidden md:block">
                <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="rounded-xl bg-card p-4 shadow-card-hover backdrop-blur-sm border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20"><TrendingUp className="h-5 w-5 text-accent" /></div>
                    <div><p className="text-sm font-semibold">Hemat 50%</p><p className="text-xs text-muted-foreground">Dari ekspedisi biasa</p></div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">Kenapa Pilih <span className="text-primary">{appNameFirst}{appNameLast}</span>?</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Platform jasa titip yang menghubungkan Anda dengan traveler terpercaya</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }} whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group rounded-2xl bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary transition-colors">
                  <f.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
                <p className="text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">Cara Kerja <span className="text-primary">{appNameFirst}{appNameLast}</span></h2>
          </motion.div>
          <div className="grid gap-12 lg:grid-cols-2">
            {[
              { title: "Sebagai Customer", icon: Users,  flow: howItWorksCustomer, color: "bg-primary", iconBg: "bg-primary/10", iconColor: "text-primary" },
              { title: "Sebagai Traveler", icon: MapPin, flow: howItWorksTraveler, color: "bg-accent",   iconBg: "bg-accent/20",  iconColor: "text-accent" },
            ].map((section, si) => (
              <motion.div key={si} initial={{ opacity: 0, x: si === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="rounded-2xl bg-card p-6 shadow-card md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${section.iconBg}`}>
                    <section.icon className={`h-6 w-6 ${section.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold">{section.title}</h3>
                </div>
                <div className="space-y-4">
                  {section.flow.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: si === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${section.color} text-sm font-semibold text-white`}>
                        {item.step}
                      </div>
                      <div><p className="font-semibold">{item.title}</p><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Available Trips ── */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">Perjalanan <span className="text-primary">Tersedia</span></h2>
              <p className="mt-2 text-muted-foreground">Traveler siap membawa barang Anda</p>
            </div>
            <Button variant="outline" asChild className="mt-4 md:mt-0"><Link to="/perjalanan">Lihat Semua</Link></Button>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableTrips.map((trip, i) => (
              <motion.div key={trip.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }} whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="group rounded-2xl bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="mb-4 flex items-center gap-3">
                  <img src={trip.avatar} alt={trip.traveler} className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1">
                    <p className="font-semibold">{trip.traveler}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-warning text-warning" />{trip.rating}<span>•</span>{trip.trips} trip
                    </div>
                  </div>
                </div>
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-muted/50 p-3">
                  <div className="flex-1 text-center"><p className="text-xs text-muted-foreground">Dari</p><p className="font-semibold">{trip.from}</p></div>
                  <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </motion.div>
                  <div className="flex-1 text-center"><p className="text-xs text-muted-foreground">Ke</p><p className="font-semibold">{trip.to}</p></div>
                </div>
                <div className="flex items-center justify-between text-sm mb-4">
                  <div><p className="text-muted-foreground">Tanggal</p><p className="font-medium">{trip.date}</p></div>
                  <div className="text-right"><p className="text-muted-foreground">Kapasitas</p><p className="font-medium text-success">{trip.capacity}</p></div>
                </div>
                <Button variant="soft" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                  <Link to={`/perjalanan/${trip.id}`}>Lihat Detail</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ad Carousel Section ── */}
      <section className="py-10 md:py-14">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <AdCarousel ads={liveAds} onClickAdvertise={() => setAdModalOpen(true)} />
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="overflow-hidden rounded-3xl bg-gradient-primary p-8 text-center md:p-12 lg:p-16 relative">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            </div>
            <div className="mx-auto max-w-2xl relative">
              <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">Siap Mulai Kirim Barang?</h2>
              <p className="mt-4 text-primary-foreground/80">
                Daftar sekarang dan nikmati kemudahan jasa titip dengan NitipGo. Gratis untuk customer, dapat penghasilan untuk traveler!
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button variant="white" size="lg" asChild className="shadow-lg hover:shadow-xl">
                  <Link to="/register/traveler" className="group">Daftar Gratis <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" /></Link>
                </Button>
                <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link to="/cara-kerja">Pelajari Lebih Lanjut</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Ad Modal ── */}
      <AdModal
        open={adModalOpen}
        onClose={() => setAdModalOpen(false)}
        packages={packages}
        nextStartDate={nextStartDate}
        liveCount={liveCount}
        maxSlots={maxSlots}
      />

    </MainLayout>
  );
}