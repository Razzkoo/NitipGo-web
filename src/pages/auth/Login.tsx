import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppSettings } from "@/components/layout/AppSettingsContent";
import { login, saveAuth } from "@/lib/auth";

export default function Login() {
  const { appNameFirst, appNameLast } = useAppSettings();
  const navigate = useNavigate();

  const [showPassword, setShowPassword]     = useState(false);
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [isLoading, setIsLoading]           = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [alertMessage, setAlertMessage]     = useState<string | null>(null);
  const [maintenanceError, setMaintenanceError] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);
  const [countdown, setCountdown]           = useState(0);
  const countdownRef                        = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer realtime
  useEffect(() => {
    if (countdown <= 0) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (rateLimitError) setRateLimitError(false);
      return;
    }

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setRateLimitError(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [countdown]);

  const extractSeconds = (message: string): number => {
    const match = message.match(/(\d+)\s*detik/);
    return match ? parseInt(match[1]) : 120;
  };

  // Google callback effect
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");

      if (error === "pending_approval") {
        setPendingApproval(true);
        window.history.replaceState({}, "", "/login");
      } else if (error === "google_cancelled") {
        setAlertMessage("Login dengan Google dibatalkan.");
        window.history.replaceState({}, "", "/login");
      } else if (error === "google_failed") {
        setAlertMessage("Login dengan Google gagal. Silakan coba lagi.");
        window.history.replaceState({}, "", "/login");
      }
    }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMessage(null);
    setMaintenanceError(false);
    setRateLimitError(false);
    setIsLoading(true);

    try {
      const res = await login(email, password);

      const { access_token, refresh_token, user, role } = res.data;

      const userData = { ...user, role: role ?? user.role };
      saveAuth({ access_token, refresh_token, user: userData });

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "traveler") {
        navigate("/traveler");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      const status  = error.response?.status;
      const message = error.response?.data?.message ?? "Terjadi kesalahan. Coba lagi.";

      if (status === 503) {
        setMaintenanceError(true);
        setAlertMessage(message);
      } else if (status === 429) {
        setRateLimitError(true);
        setAlertMessage(message);
        setCountdown(extractSeconds(message));
      } else if (status === 401) {
        setAlertMessage("Email atau password salah.");
      } else if (status === 403) {
        setAlertMessage(message);
      } else {
        setAlertMessage("Email atau password salah.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Link
        to="/"
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
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
            Selamat Datang Kembali
          </h1>
          <p className="mt-2 text-muted-foreground">
            Masuk ke akun {appNameFirst}{appNameLast} Anda
          </p>

          {/* Alert message */}
          {pendingApproval && (
            <div className="mt-4 rounded-xl border border-blue-300 bg-blue-50 p-4 text-center">
              <p className="font-semibold text-blue-700">Menunggu Persetujuan Admin</p>
              <p className="text-sm text-blue-600 mt-1">
                Akun Google Anda sudah terdaftar dan sedang dalam proses review. Kami akan menghubungi Anda melalui email setelah disetujui.
              </p>
            </div>
          )}

          {maintenanceError && (
            <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-center">
              <p className="font-semibold text-red-700">{alertMessage}</p>
              <p className="text-sm text-red-600 mt-1">
                Silakan coba lagi nanti atau hubungi admin.
              </p>
            </div>
          )}

          {/* Alert rate limit + countdown realtime */}
          {rateLimitError && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-center">
              <p className="font-semibold text-amber-700">Terlalu banyak percobaan!</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-600">
                  Coba lagi dalam{" "}
                  <span className="font-bold text-amber-700 tabular-nums">
                    {countdown}
                  </span>{" "}
                  detik
                </p>
              </div>
            </div>
          )}

          {/* Alert error biasa — hanya tampil jika bukan maintenance/rateLimit */}
          {alertMessage && !maintenanceError && !rateLimitError && (
            <div className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {alertMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                  disabled={isLoading || rateLimitError}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                  disabled={isLoading || rateLimitError}
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
              disabled={isLoading || rateLimitError}
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
              ) : rateLimitError ? (
                // Tombol disabled dengan countdown
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tunggu {countdown} detik
                </span>
              ) : (
                <>
                  Masuk <ArrowRight className="ml-1 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-muted-foreground">
            Belum punya akun?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-primary p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-primary-foreground max-w-md"
        >
          <Package className="h-20 w-20 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Sekalian Jalan, Nitip Barang!</h2>
          <p className="text-primary-foreground/80">
            Platform jasa titip terpercaya yang menghubungkan Anda dengan
            traveler ke berbagai kota di Indonesia.
          </p>
        </motion.div>
      </div>
    </div>
  );
}