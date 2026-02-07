import { motion } from "framer-motion";
import { Bell, Wallet, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function TravelerSettings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Pengaturan Disimpan",
      description: "Preferensi Anda telah berhasil disimpan.",
    });
  };

  return (
    <DashboardLayout role="traveler">
      <div className="p-6 md:p-8 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Pengaturan</h1>
          <p className="text-muted-foreground mt-1">Kelola preferensi akun traveler</p>
        </motion.div>

        <div className="grid gap-6 max-w-2xl">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">Notifikasi</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Order Baru</p>
                  <p className="text-sm text-muted-foreground">Notifikasi saat ada order masuk</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Pembayaran Masuk</p>
                  <p className="text-sm text-muted-foreground">Notifikasi saldo masuk</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </motion.div>

          {/* Wallet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">Pembayaran</h2>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/traveler/wallet">Kelola Rekening Bank</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/traveler/wallet">Riwayat Penarikan</Link>
              </Button>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">Keamanan</h2>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Ubah Password
              </Button>
            </div>
          </motion.div>

          <Button onClick={handleSave} className="w-full">
            Simpan Pengaturan
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
