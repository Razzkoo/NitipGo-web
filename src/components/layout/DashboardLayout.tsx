import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { clearAuth } from "@/lib/auth";
import { 
  Package, 
  LayoutDashboard, 
  Clock, 
  User, 
  LogOut,
  Menu,
  X,
  Wallet,
  Users,
  Settings,
  AlertTriangle,
  Route,
  ChevronDown,
  Bell,
  Plane,
  Banknote,
  Star,
  Rocket,
  UserCheck,
  UserCog,
  Megaphone,
  Sparkles,
  Captions,
  BookText,
  BadgeInfo
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

type UserRole = "customer" | "traveler" | "admin";


interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: { name: string; href: string; icon: React.ElementType }[];
}

const customerNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Daftar Order", href: "/orders", icon: Package },
  { name: "Riwayat Order", href: "/history", icon: Clock },
  { name: "Profil", href: "/profile", icon: User },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

const travelerNavItems: NavItem[] = [
  { name: "Dashboard", href: "/traveler", icon: LayoutDashboard },
  { name: "Perjalanan", href: "/traveler/trip", icon: Plane },
  { name: "Order", href: "/traveler/orders", icon: Package },
  { name: "Laporan & Ulasan", href: "/traveler/report", icon: BookText },
  { name: "Saldo", href: "/traveler/wallet", icon: Wallet },
  { name: "Profil", href: "/traveler/profile", icon: User },
  { name: "Pengaturan", href: "/traveler/settings", icon: Settings },
];

const adminNavItems: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    name: "Manajemen Pengguna",
    href: "/admin/users",
    icon: Users,
    children: [
      { name: "Pengguna", href: "/admin/users", icon: UserCheck },
      { name: "Traveler", href: "/admin/travelers", icon: Plane},
    ],
  },
  { name: "Transaksi", href: "/admin/transactions", icon: Banknote },
  { name: "Rating", href: "/admin/rating", icon: Star },
  {
    name: "Langganan",
    href: "/admin/langganan",
    icon: Sparkles,
    children: [
      { name: "Booster", href: "/admin/boosters", icon: Rocket },
      { name: "Iklan", href: "/admin/ads", icon: Megaphone },
    ],
  },
  { name: "Kota & Rute", href: "/admin/routes", icon: Route },
  {
    name: "Laporan",
    href: "/admin/disputes",
    icon: BookText,
    children: [
      { name: "Dispute", href: "/admin/disputes", icon: AlertTriangle },
      { name: "Bantuan", href: "/admin/help", icon: BadgeInfo },
    ],
  },
  { name: "Saldo Platform", href: "/admin/wallet", icon: Wallet },
  { name: "Profil", href: "/admin/profile", icon: User },
  { name: "Pengaturan", href: "/admin/settings", icon: Settings },

];

// Mobile 
const mobileBottomNav: Record<UserRole, NavItem[]> = {
  customer: [
    { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
    { name: "Order", href: "/orders", icon: Package },
    { name: "Riwayat", href: "/history", icon: Clock },
    { name: "Profil", href: "/profile", icon: User },
  ],
  traveler: [
    { name: "Beranda", href: "/traveler", icon: LayoutDashboard },
    { name: "Perjalanan", href: "/traveler/trip", icon: Plane },
    { name: "Order", href: "/traveler/orders", icon: Package },
    { name: "Saldo", href: "/traveler/wallet", icon: Wallet },
    { name: "Laporan", href: "/traveler/report", icon: BookText },
  ],
  admin: [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Pengguna", href: "/admin/users", icon: Users },
    { name: "Transaksi", href: "/admin/transactions", icon: Banknote },
    { name: "Saldo", href: "/admin/wallet", icon: Wallet },
    { name: "Lainnya", href: "#", icon: Menu }, // trigger sidebar
  ],
};

const roleConfig = {
  customer: {
    label: "Customer",
    color: "bg-primary/20 text-primary",
    items: customerNavItems,
  },
  traveler: {
    label: "Traveler",
    color: "bg-accent/20 text-accent",
    items: travelerNavItems,
  },
  admin: {
    label: "Admin",
    color: "bg-destructive/20 text-destructive",
    items: adminNavItems,
  },
};

const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

function getAvatarUrl(user: any): string {
  if (!user) return "";
  if (user.profile_photo) {
    return `${BASE_URL}/storage/${user.profile_photo}`;
  }
  if (user.pass_photo) {
    return `${BASE_URL}/storage/${user.pass_photo}`;
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name ?? "user")}`;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { appNameFirst, appNameLast} = useAppSettings();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const location = useLocation();
  const navigate = useNavigate();
  const config = roleConfig[role];
  const handleLogout = async () => {
  try {
      await api.post("/auth/logout");
    } catch {
    }
    clearAuth();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
  const fetchUser = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await api.get("/auth/me");
      setUser(response.data.data);
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 401) {
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


  const isActiveLink = (href: string) => {
    if (href === "/dashboard" || href === "/traveler" || href === "/admin") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  // Helper
  const isAnyChildActive = (item: NavItem) => {
    return item.children?.some((child) => isActiveLink(child.href)) ?? false;
  };

  const toggleDropdown = (href: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const isDropdownOpen = (item: NavItem) => {
    return openDropdowns[item.href] ?? isAnyChildActive(item);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              {appNameFirst}<span className="text-primary">{appNameLast}</span>
            </span>
          </Link>
          <button
            className="lg:hidden p-2 hover:bg-muted rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {config.items.map((item, i) => {
            const isActive = isActiveLink(item.href);

            if (item.children && item.children.length > 0) {
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {/* Parent Button */}
                  <button
                    onClick={() => toggleDropdown(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      isAnyChildActive(item)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 text-left">{item.name}</span>
                    <motion.div
                      animate={{ rotate: isDropdownOpen(item) ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </button>

                  {/* Children */}
                  <AnimatePresence initial={false}>
                    {isDropdownOpen(item) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-3">
                          {item.children.map((child) => {
                            const childActive = isActiveLink(child.href);
                            return (
                              <Link
                                key={child.href}
                                to={child.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                  childActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                              >
                                <child.icon className="h-4 w-4 shrink-0" />
                                <span>{child.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-2 h-2 w-2 rounded-full bg-primary-foreground"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span>Keluar</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-lg border-b border-border">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Page Title - Hidden on mobile */}
            <div className="hidden lg:block" />

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to={
                  role === "customer" ? "/notifications" :
                  role === "traveler" ? "/traveler/notifications" :
                  "/admin/notifications"
                }>
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                </Link>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors">
                    {user ? (
                      <img
                        src={getAvatarUrl(user)}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover bg-muted"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    )}
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",config.color)}>{config.label}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
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
                    <Link to={
                      role === "customer" ? "/profile" :
                      role === "traveler" ? "/traveler/profile" :
                      "/admin/profile"
                    } className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={
                      role === "customer" ? "/settings" :
                      role === "traveler" ? "/traveler/settings" :
                      "/admin/settings"
                    } className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Pengaturan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Keluar
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content with Animation */}
        <motion.main
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-auto pb-20 lg:pb-0"
      >
          {children}
        </motion.main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around px-1 py-1.5">
          {mobileBottomNav[role].map((item) => {
            // Item "Lainnya" untuk admin → trigger sidebar
            if (item.href === "#") {
              return (
                <button
                  key="more"
                  onClick={() => setSidebarOpen(true)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-0"
                >
                  <div className="flex items-center justify-center w-10 h-7 rounded-xl">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">{item.name}</span>
                </button>
              );
            }

            const isActive = isActiveLink(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-0"
              >
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={cn(
                    "flex items-center justify-center w-10 h-7 rounded-xl transition-all",
                    isActive ? "bg-primary/15" : ""
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                </motion.div>
                <span className={cn(
                  "text-[10px] font-medium truncate max-w-[56px] text-center",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}