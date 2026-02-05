import { Link } from "react-router-dom";
import { Package, MapPin, Phone, Mail, Instagram, Twitter, Facebook, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = {
  layanan: [
    { name: "Titip Beli", href: "/order/new" },
    { name: "Kirim Barang", href: "/order/new" },
    { name: "Jadi Traveler", href: "/daftar-traveler" },
  ],
  perusahaan: [
    { name: "Tentang Kami", href: "/cara-kerja" },
    { name: "Cara Kerja", href: "/cara-kerja" },
    { name: "FAQ", href: "/faq" },
    { name: "Kontak", href: "/kontak" },
  ],
  legal: [
    { name: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
    { name: "Kebijakan Privasi", href: "/privasi" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/10 bg-footer">
      <div className="container py-12 md:py-16 text-footer">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-white">
                Nitip<span className="text-primary">Go</span>
              </span>
            </Link>
            <p className="text-sm text-white/70 max-w-xs">
              Platform jasa titip & logistik berbasis traveler. Sekalian jalan, nitip barang!
            </p>
            <div className="flex gap-3">
              <Link
                to="/social/instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-110"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                to="/social/twitter"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-110"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                to="/social/facebook"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-110"
              >
                <Facebook className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Layanan */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Layanan</h3>
            <ul className="space-y-3">
              {footerLinks.layanan.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Perusahaan */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Perusahaan</h3>
            <ul className="space-y-3">
              {footerLinks.perusahaan.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Kontak Kami</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Mail className="h-4 w-4 text-primary" />
                <span>hello@nitipgo.id</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Phone className="h-4 w-4 text-primary" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/70">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>Jakarta, Indonesia</span>
              </li>
              <li className="pt-2">
                <Button asChild variant="hero" size="sm" className="w-full shadow-lg shadow-accent/30 hover:shadow-accent/50">
                  <Link to="/live-chat">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Mulai Chat
                  </Link>
                </Button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/60">
            © 2025 NitipGo. Hak Cipta Dilindungi.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-white/60 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
