import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type UserRole = "customer" | "traveler";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("customer");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock register - would connect to auth system
    console.log("Register attempt:", { ...formData, role });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
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
              Nitip<span className="text-primary">Go</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Buat Akun Baru
          </h1>
          <p className="mt-2 text-muted-foreground">
            Daftar dan mulai gunakan layanan NitipGo
          </p>

          {/* Role Selection */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all",
                role === "customer"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              <Users className="h-5 w-5" />
              <span className="font-semibold">Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("traveler")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all",
                role === "traveler"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:border-accent/50"
              )}
            >
              <MapPin className="h-5 w-5" />
              <span className="font-semibold">Traveler</span>
            </button>
          </div>

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
                  required
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
              variant={role === "customer" ? "hero" : "default"}
              size="lg"
              className={cn("w-full", role === "traveler" && "bg-gradient-to-r from-accent to-accent/90")}
            >
              Daftar sebagai {role === "customer" ? "Customer" : "Traveler"}{" "}
              <ArrowRight className="ml-1 h-5 w-5" />
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
        </motion.div>
      </div>

      {/* Right side - Illustration */}
      <div className={cn(
        "hidden lg:flex flex-1 items-center justify-center p-12",
        role === "customer" ? "bg-gradient-primary" : "bg-gradient-to-br from-accent to-accent/80"
      )}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-primary-foreground max-w-md"
        >
          {role === "customer" ? (
            <>
              <Users className="h-20 w-20 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-4">
                Kirim Barang Lebih Mudah
              </h2>
              <p className="text-primary-foreground/80">
                Daftar sebagai customer dan nikmati kemudahan mengirim atau titip beli barang ke berbagai kota dengan harga terjangkau.
              </p>
            </>
          ) : (
            <>
              <MapPin className="h-20 w-20 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-4">
                Dapat Penghasilan Tambahan
              </h2>
              <p className="text-primary-foreground/80">
                Jadikan perjalanan Anda lebih produktif. Bawa barang sekalian jalan dan dapatkan penghasilan tambahan.
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
