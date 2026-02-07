import { motion } from "framer-motion";
import { Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function CustomerSettings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Pengaturan Disimpan",
      description: "Preferensi Anda telah berhasil disimpan.",
    });
  };

  return (
    <DashboardLayout role="customer">
      <div className="p-6 md:p-8 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Pengaturan</h1>
          <p className="text-muted-foreground mt-1">Kelola preferensi akun Anda</p>
        </motion.div>

        <div className="grid gap-6 max-w-2xl">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Notifikasi</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Notifikasi Email</p>
                  <p className="text-sm text-muted-foreground">Terima update order via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Notifikasi Push</p>
                  <p className="text-sm text-muted-foreground">Notifikasi langsung di browser</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-card p-6 shadow-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-primary" />
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
