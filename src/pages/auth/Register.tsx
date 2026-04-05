import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Users, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerCustomer } from "@/lib/auth";
import { useAppSettings } from "@/components/layout/AppSettingsContent";
import api from "@/lib/api";

export default function Register() {
  const { appNameFirst, appNameLast } = useAppSettings();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleGoogleLogin = () => {
    const baseURL = api.defaults.baseURL ?? "http://localhost:8000/api";
    window.location.href = `${baseURL}/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await registerCustomer({
        name:     formData.name,
        email:    formData.email,
        phone:    formData.phone,
        password: formData.password,
        password_confirmation: formData.password,
      });

      await Swal.fire({
        icon:                "success",
        title:               "Registrasi Berhasil",
        text:                "Akun Anda sedang menunggu persetujuan admin.",
        confirmButtonColor:  "#16a34a",
        confirmButtonText:   "OK",
      });

      navigate("/login");

    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message;

      if (errors) {
        const firstError = Object.values(errors)[0] as string[];
        Swal.fire({
          icon:               "error",
          title:              "Registrasi Gagal",
          text:               firstError[0],
          confirmButtonColor: "#dc2626",
        });
      } else {
        Swal.fire({
          icon:               "error",
          title:              "Registrasi Gagal",
          text:               message ?? "Terjadi kesalahan, silakan coba lagi.",
          confirmButtonColor: "#dc2626",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Tombol kembali */}
      <Link
        to="/"
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      {/* Kiri — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              {appNameFirst}
              <span className="text-primary">{appNameLast}</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Buat Akun Baru
          </h1>
          <p className="mt-2 text-muted-foreground">
            Daftar dan mulai gunakan layanan {appNameFirst}{appNameLast}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama lengkap Anda"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                  disabled={isLoading}
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
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor HP</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-12"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-white"
                      style={{
                        animation: "loginDotBounce 0.7s ease-in-out infinite",
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </span>
              ) : (
                <>
                  Daftar sebagai Customer <ArrowRight className="ml-1 h-5 w-5" />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs text-muted-foreground">
                <span className="bg-background px-3">atau</span>
              </div>
            </div>

            {/* Google Button */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              disabled={isLoading}
              onClick={handleGoogleLogin}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Lanjutkan dengan Google
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Dengan mendaftar, Anda menyetujui{" "}
            <Link to="/syarat-ketentuan" className="text-primary hover:underline">
              Syarat & Ketentuan
            </Link>{" "}
            dan{" "}
            <Link to="/privasi" className="text-primary hover:underline">
              Kebijakan Privasi
            </Link>{" "}
            kami.
          </p>

          <p className="mt-4 text-center text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Masuk
            </Link>
          </p>

          <p className="mt-2 text-center text-muted-foreground">
            Ingin jadi Traveler?{" "}
            <Link to="/register/traveler" className="text-accent font-semibold hover:underline">
              Daftar di sini
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Kanan — Ilustrasi */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-primary p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-primary-foreground max-w-md"
        >
          <Users className="h-20 w-20 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">
            Kirim Barang Lebih Mudah
          </h2>
          <p className="text-primary-foreground/80">
            Daftar sebagai customer dan nikmati kemudahan mengirim atau titip beli barang ke berbagai kota dengan harga terjangkau.
          </p>
        </motion.div>
      </div>
    </div>
  );
}