import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  LayoutDashboard, 
  ShoppingBag, 
  Clock, 
  User, 
  LogOut,
  Menu,
  X,
  MapPin,
  Wallet,
  Users,
  Settings,
  AlertTriangle,
  Route,
  ChevronDown,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserRole = "customer" | "traveler" | "admin";

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const customerNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Order Saya", href: "/orders", icon: ShoppingBag },
  { name: "Riwayat", href: "/history", icon: Clock },
  { name: "Profil", href: "/profile", icon: User },
];

const travelerNavItems: NavItem[] = [
  { name: "Dashboard", href: "/traveler", icon: LayoutDashboard },
  { name: "Perjalanan", href: "/traveler/trips", icon: MapPin },
  { name: "Order Masuk", href: "/traveler/orders", icon: Package },
  { name: "Saldo", href: "/traveler/wallet", icon: Wallet },
  { name: "Profil", href: "/traveler/profile", icon: User },
];

const adminNavItems: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Transaksi", href: "/admin/transactions", icon: Package },
  { name: "Kota & Rute", href: "/admin/routes", icon: Route },
  { name: "Dispute", href: "/admin/disputes", icon: AlertTriangle },
  { name: "Pengaturan", href: "/admin/settings", icon: Settings },
];

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

// Mock user data
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
};

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const config = roleConfig[role];

  const isActiveLink = (href: string) => {
    if (href === "/dashboard" || href === "/traveler" || href === "/admin") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
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
              Nitip<span className="text-primary">Go</span>
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
        <nav className="flex-1 p-4 space-y-1">
          {config.items.map((item, i) => {
            const isActive = isActiveLink(item.href);
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
                  <item.icon className="h-5 w-5" />
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
            asChild
          >
            <Link to="/">
              <LogOut className="h-5 w-5" />
              <span>Keluar</span>
            </Link>
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors">
                    <img
                      src={mockUser.avatar}
                      alt={mockUser.name}
                      className="h-8 w-8 rounded-full bg-muted"
                    />
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-foreground">{mockUser.name}</p>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", config.color)}>
                        {config.label}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{mockUser.name}</p>
                    <p className="text-xs text-muted-foreground">{mockUser.email}</p>
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
                  <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
                    <Link to="/" className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Keluar
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content with Animation */}
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}