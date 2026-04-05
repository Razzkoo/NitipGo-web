import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { clearAuth } from "@/lib/auth";
import {
  Package, LayoutDashboard, Clock, User, LogOut,
  Menu, X, Settings, Bell, ChevronDown, ShoppingBag,
  HelpCircle,
  Plane, House
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSettings } from "@/components/layout/AppSettingsContent";
import { Footer } from "@/components/layout/Footer";

// ─── Nav Config ────────────────────────────────────────────────────────────────

const navLinks = [
  { name: "Beranda", href: "/dashboard", icon: House },
  { name: "Perjalanan", href: "/customer/trip", icon: Plane },
  { name: "Daftar Order", href: "/orders", icon: ShoppingBag },
  { name: "Riwayat", href: "/history", icon: Clock },
  { name: "Bantuan", href: "/help", icon: HelpCircle },
];

const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

function getAvatarUrl(user: any): string {
  if (!user) return "";
  if (user.profile_photo) {
    return `${BASE_URL}/storage/${user.profile_photo}`;
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name ?? "user")}`;
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface CustomerLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function CustomerLayout({ children, showFooter = true }: CustomerLayoutProps) {
  const { appNameFirst, appNameLast } = useAppSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.data);
      } catch (error: any) {
        if (error.response?.status === 401) {
          const tokenStillExists = localStorage.getItem("access_token");
          if (!tokenStillExists) {
            navigate("/login", { replace: true });
          }
        }
      }
    };
    const timer = setTimeout(fetchUser, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearAuth();
    navigate("/login", { replace: true });
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">

      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container flex h-16 items-center justify-between md:h-20">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              {appNameFirst}<span className="text-primary">{appNameLast}</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive(link.href)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden items-center gap-2 md:flex">

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
              </Link>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-muted transition-colors">
                  {user ? (
                    <img
                      src={getAvatarUrl(user)}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover bg-muted"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  )}
                  <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <span className={cn(
                    "inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium",
                    user?.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  )}>
                    {user?.status === "active" ? "Aktif" : "Non-aktif"}
                  </span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Pengaturan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
              </Link>
            </Button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border/50 bg-card md:hidden"
            >
              <nav className="container flex flex-col gap-1 py-3">
                {/* User Info */}
                {user && (
                  <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-muted/50">
                    <img
                      src={getAvatarUrl(user)}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover bg-muted"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                {/* Nav Links */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive(link.href)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                ))}

                <hr className="my-2 border-border" />

                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                >
                  <User className="h-5 w-5" />
                  Profil
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                >
                  <Settings className="h-5 w-5" />
                  Pengaturan
                </Link>

                <hr className="my-2 border-border" />

                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Keluar
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page Content ── */}
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 pt-16 md:pt-20"
      >
        {children}
      </motion.main>

      {/* ── Footer ── */}
      {showFooter && <Footer />}
    </div>
  );
}