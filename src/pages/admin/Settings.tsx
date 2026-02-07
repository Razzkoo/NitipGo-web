import { useState } from "react";
import { motion } from "framer-motion";
import { Percent, Save, RotateCcw, Shield } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    commissionRate: 10,
    minWithdrawal: 50000,
    autoVerifyTraveler: false,
    maintenanceMode: false,
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);
    toast({
      title: "Pengaturan Disimpan",
      description: "Perubahan telah berhasil diterapkan.",
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings({
      commissionRate: 10,
      minWithdrawal: 50000,
      autoVerifyTraveler: false,
      maintenanceMode: false,
    });
    setHasChanges(false);
    toast({ title: "Pengaturan Direset", description: "Kembali ke nilai default." });
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
            <p className="text-muted-foreground">Konfigurasi sistem platform NitipGo</p>
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

        <div className="max-w-2xl space-y-6">
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
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
