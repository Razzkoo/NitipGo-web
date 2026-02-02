import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-12 w-12 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-lg font-bold">
              ?
            </div>
          </div>
        </div>
        
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-muted-foreground mb-8">
          Maaf, halaman yang Anda cari tidak ada atau mungkin sudah dipindahkan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="hero" asChild>
            <Link to="/">
              <Home className="h-5 w-5 mr-2" />
              Kembali ke Beranda
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Halaman Sebelumnya
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
