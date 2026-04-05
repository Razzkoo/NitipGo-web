import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Package, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppSettings } from "./AppSettingsContent";

const navLinks = [
  { name: "Beranda", href: "/" },
  { name: "Cara Kerja", href: "/cara-kerja" },
  { name: "Perjalanan", href: "/perjalanan" },
  { name: "FAQ", href: "/faq" },
];

export function Header() {
  const {appNameFirst, appNameLast} = useAppSettings();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
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
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                location.pathname === link.href
                  ? "text-primary bg-primary-light"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild>
            <Link to="/login">Masuk</Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/register">Daftar Sekarang</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/50 bg-card md:hidden"
          >
            <nav className="container flex flex-col gap-2 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    location.pathname === link.href
                      ? "text-primary bg-primary-light"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="my-2 border-border" />
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Masuk
              </Link>
              <Button variant="hero" className="mx-4" asChild>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  Daftar Sekarang
                </Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
