import { motion } from "framer-motion";
import { Bell, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerLayout } from "@/components/layout/CustomerLayout";

export default function CustomerSettings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Pengaturan Disimpan",
      description: "Preferensi Anda telah berhasil disimpan.",
    });
  };

  const [openPassword, setOpenPassword] = useState(false);

  return (
    <CustomerLayout>
      <div className="p-6 md:p-8 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-lg bg-primary/10 p-2">
                <Settings className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">Pengaturan Akun</h1>
                <p className="text-sm text-muted-foreground">Kelola preferensi akun Anda</p>
              </div>
            </div>
          </div>
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
              <Button
              variant="outline" className="w-full justify-start"
                onClick={() => setOpenPassword(true)}
                    >
                    Ubah Password
              </Button>

            </div>
          </motion.div>

          <Button onClick={handleSave} className="w-full">
            Simpan Pengaturan
          </Button>
        </div>
      </div>

      <Dialog open={openPassword} onOpenChange={setOpenPassword}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Ubah Password</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Password Lama</Label>
        <Input type="password" />
      </div>

      <div className="space-y-1">
        <Label>Password Baru</Label>
        <Input type="password" />
      </div>

      <div className="space-y-1">
        <Label>Konfirmasi Password Baru</Label>
        <Input type="password" />
      </div>

      <Button className="w-full">Simpan Password</Button>
    </div>
  </DialogContent>
</Dialog>

    </CustomerLayout>
  );
}
