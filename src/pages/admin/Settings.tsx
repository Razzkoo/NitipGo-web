import { useState, useEffect } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Percent, Save, RotateCcw, Shield, Settings } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAppSettings} from "@/components/layout/AppSettingsContent";

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { setAppName } = useAppSettings();
  const [settings, setSettings] = useState({
    commissionRate: 10,
    minWithdrawal: 50000,
    autoVerifyTraveler: false,
    maintenanceMode: false,
    appNameFirst: "Nitip",
    appNameLast: "Go",
    financialSystemEnabled: true,
    maxPendingDays: 3,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/admin/settings");
        const data = res.data.data;
        setSettings(data);
        setAppName(data.appNameFirst, data.appNameLast);
      } catch (err) {
        toast({
          title: "Gagal memuat pengaturan",
          description: "Tidak bisa mengambil data dari server",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [setAppName]);

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await api.put("/admin/settings", settings);
      setAppName(settings.appNameFirst, settings.appNameLast);

      toast({
        title: "Pengaturan Disimpan",
        description: "Perubahan telah berhasil diterapkan.",
      });

      setHasChanges(false);
    } catch (err) {
      toast({
        title: "Gagal menyimpan",
        description: "Terjadi kesalahan saat menyimpan",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    setHasChanges(false);

    try {
      const res = await api.get("/admin/settings");
      setSettings(res.data.data);
    } catch {
      toast({
        title: "Gagal reset",
        description: "Tidak bisa memuat ulang data",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="p-10">Loading settings...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-primary/10 p-2">
              <Settings className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold leading-tight">
                Pengaturan
              </h1>
              <p className="text-sm text-muted-foreground">
                Konfigurasi terkait komisi, transaksi, dan sistem finansial NitipGo
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Simpan
            </Button>
          </div>
        </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">
          {/* Commission Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="rounded-2xl bg-card p-6 shadow-card hover:shadow-card-hover transition-all"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"
              >
                <Percent className="h-5 w-5 text-primary" />
              </motion.div>
              <h2 className="text-lg font-semibold text-foreground">Komisi & Transaksi</h2>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission">Komisi Platform (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    max="50"
                    value={settings.commissionRate}
                    onChange={(e) => handleChange("commissionRate", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Persentase dari setiap transaksi</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minWithdrawal">Min. Penarikan (Rp)</Label>
                  <Input
                    id="minWithdrawal"
                    type="number"
                    min="10000"
                    step="10000"
                    value={settings.minWithdrawal}
                    onChange={(e) => handleChange("minWithdrawal", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Minimum saldo untuk ditarik</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* System Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="rounded-2xl bg-card p-6 shadow-card hover:shadow-card-hover transition-all"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10"
              >
                <Shield className="h-5 w-5 text-accent" />
              </motion.div>
              <h2 className="text-lg font-semibold text-foreground">Sistem</h2>
            </div>
            <div className="space-y-4">
              {/* App Name Settings */}
                  <p className="font-medium text-foreground">Nama Aplikasi</p>
                  <p className="text-sm text-muted-foreground">
                    Digunakan untuk identitas platform
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="appFirst">First Name</Label>
                      <Input
                        id="appFirst"
                        value={settings.appNameFirst}
                        onChange={(e) => handleChange("appNameFirst", e.target.value)}
                        placeholder="Nitip"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="appLast">Last Name</Label>
                      <Input
                        id="appLast"
                        value={settings.appNameLast}
                        onChange={(e) => handleChange("appNameLast", e.target.value)}
                        placeholder="Go"
                      />
                    </div>
                  </div>
              <motion.div 
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">Notifikasi Verifikasi Pengguna</p>
                  <p className="text-sm text-muted-foreground">Notifikasi pengguna baru</p>
                </div>
                <Switch
                  checked={settings.autoVerifyTraveler}
                  onCheckedChange={(checked) => handleChange("autoVerifyTraveler", checked)}
                />
              </motion.div>
              <motion.div 
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">Mode Maintenance</p>
                  <p className="text-sm text-muted-foreground">Nonaktifkan platform sementara</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
                />
              </motion.div>
            </div>
            
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card p-6 shadow-card border border-destructive/30">
          <div className="flex items-start gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Express System</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                  Danger Zone
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Kontrol cepat & darurat platform
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sistem Finansial</p>
                <p className="text-sm text-muted-foreground">
                  Matikan untuk menghentikan transaksi
                </p>
              </div>
              <Switch
                checked={settings.financialSystemEnabled}
                onCheckedChange={(v) => handleChange("financialSystemEnabled", v)}
              />
            </div>

            <div className="space-y-2">
              <Label>Batas Pending (hari)</Label>
              <Input
                type="number"
                min="1"
                max="30"
                value={settings.maxPendingDays}
                onChange={(e) => handleChange("maxPendingDays", parseInt(e.target.value))}/>
              <p className="text-xs text-muted-foreground">
                Transaksi pending lebih dari batas akan otomatis dibatalkan
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </DashboardLayout>
  );
}
