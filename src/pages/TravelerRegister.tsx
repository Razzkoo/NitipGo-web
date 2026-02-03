import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, User, Mail, Phone, MapPin, FileText, ArrowRight, CheckCircle, Shield, Wallet, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MainLayout } from "@/components/layout/MainLayout";

const benefits = [
  { icon: Wallet, title: "Dapat Penghasilan", desc: "Ubah perjalanan Anda menjadi peluang cuan" },
  { icon: Clock, title: "Fleksibel", desc: "Atur jadwal sesuai kenyamanan Anda" },
  { icon: Shield, title: "Aman & Terlindungi", desc: "Asuransi dan jaminan untuk setiap perjalanan" },
];

export default function TravelerRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    idNumber: "",
    bio: "",
    agreeTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      console.log("Traveler registration:", formData);
      setSubmitted(true);
      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate("/traveler"), 2000);
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-12 md:py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Jadi <span className="text-primary">Mitra Traveler</span> NitipGo
            </h1>
            <p className="mt-4 text-muted-foreground">
              Sekalian jalan, dapat penghasilan! Daftarkan diri Anda sebagai mitra traveler dan mulai terima order pengiriman.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
                  <benefit.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-12 md:py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            {!submitted ? (
              <div className="rounded-2xl bg-card p-6 md:p-8 shadow-card">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    1
                  </div>
                  <div className={`h-1 w-12 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    2
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {step === 1 && (
                    <>
                      <h2 className="text-xl font-semibold text-foreground mb-4">Informasi Dasar</h2>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nama Lengkap</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="fullName"
                            placeholder="Sesuai KTP"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="nama@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Nomor HP (WhatsApp)</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="phone"
                            placeholder="08xxxxxxxxxx"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Kota Domisili</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="city"
                            placeholder="Kota tempat tinggal"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h2 className="text-xl font-semibold text-foreground mb-4">Verifikasi & Profil</h2>
                      <div className="space-y-2">
                        <Label htmlFor="idNumber">Nomor KTP</Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="idNumber"
                            placeholder="16 digit nomor KTP"
                            value={formData.idNumber}
                            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio / Deskripsi</Label>
                        <Textarea
                          id="bio"
                          placeholder="Ceritakan sedikit tentang diri Anda dan pengalaman perjalanan..."
                          rows={4}
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        />
                      </div>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeTerms}
                          onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                        />
                        <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                          Saya menyetujui{" "}
                          <Link to="/syarat-ketentuan" className="text-primary hover:underline">
                            Syarat & Ketentuan
                          </Link>{" "}
                          serta{" "}
                          <Link to="/privasi" className="text-primary hover:underline">
                            Kebijakan Privasi
                          </Link>{" "}
                          NitipGo
                        </label>
                      </div>
                    </>
                  )}

                  <div className="flex gap-3">
                    {step === 2 && (
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                        Kembali
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="hero"
                      className="flex-1"
                      disabled={step === 2 && !formData.agreeTerms}
                    >
                      {step === 1 ? "Lanjutkan" : "Daftar Sekarang"}
                      <ArrowRight className="h-5 w-5 ml-1" />
                    </Button>
                  </div>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Sudah jadi mitra?{" "}
                  <Link to="/login" className="text-primary font-semibold hover:underline">
                    Masuk di sini
                  </Link>
                </p>
              </div>
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
                  Pendaftaran Berhasil!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Selamat bergabung sebagai Mitra Traveler NitipGo! Anda akan dialihkan ke dashboard dalam beberapa detik...
                </p>
                <Button variant="hero" asChild>
                  <Link to="/traveler">
                    Ke Dashboard Traveler <ArrowRight className="h-5 w-5 ml-1" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
