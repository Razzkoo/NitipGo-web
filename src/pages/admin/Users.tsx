import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Users, Shield, Ban, CheckCircle, Eye, MoreHorizontal } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const mockUsers = [
  { id: 1, name: "Budi Santoso", email: "budi@email.com", type: "customer", status: "active", joinDate: "10 Jan 2024", orders: 12 },
  { id: 2, name: "Andi Pratama", email: "andi@email.com", type: "traveler", status: "active", joinDate: "5 Jan 2024", trips: 45, verified: true },
  { id: 3, name: "Sari Dewi", email: "sari@email.com", type: "traveler", status: "pending", joinDate: "14 Feb 2024", trips: 0, verified: false },
  { id: 4, name: "Rina Kusuma", email: "rina@email.com", type: "customer", status: "suspended", joinDate: "20 Dec 2023", orders: 3 },
  { id: 5, name: "Dimas Wijaya", email: "dimas@email.com", type: "traveler", status: "active", joinDate: "1 Feb 2024", trips: 23, verified: true },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Aktif", className: "bg-success/20 text-success" },
  pending: { label: "Pending", className: "bg-warning/20 text-warning" },
  suspended: { label: "Suspended", className: "bg-destructive/20 text-destructive" },
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: string; user: any }>({
    open: false,
    action: "",
    user: null,
  });

  const filteredUsers = mockUsers.filter((user) => {
    const matchSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                       user.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || user.type === filter || user.status === filter;
    return matchSearch && matchFilter;
  });

  const handleAction = (action: string, user: any) => {
    setActionDialog({ open: true, action, user });
  };

  const confirmAction = () => {
    const { action, user } = actionDialog;
    toast({
      title: action === "verify" ? "User Terverifikasi" :
             action === "suspend" ? "User Di-suspend" :
             action === "activate" ? "User Diaktifkan" : "Aksi Berhasil",
      description: `${user.name} telah ${action === "verify" ? "diverifikasi" : action === "suspend" ? "di-suspend" : "diaktifkan"}.`,
    });
    setActionDialog({ open: false, action: "", user: null });
  };

  return (
    <MainLayout showFooter={false}>
      <div className="container py-6 md:py-10">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manajemen User</h1>
            <p className="text-muted-foreground">Kelola semua akun customer dan traveler</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "customer", "traveler", "pending"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Semua" : f === "customer" ? "Customer" : f === "traveler" ? "Traveler" : "Pending"}
              </Button>
            ))}
          </div>
        </div>

        {/* User List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card shadow-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Tipe</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Bergabung</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Aktivitas</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        user.type === "traveler" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                      }`}>
                        {user.type === "traveler" && user.verified && <Shield className="h-3 w-3" />}
                        {user.type === "traveler" ? "Traveler" : "Customer"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[user.status].className}`}>
                        {statusConfig[user.status].label}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{user.joinDate}</td>
                    <td className="p-4 text-sm text-foreground">
                      {user.type === "traveler" ? `${user.trips} trip` : `${user.orders} order`}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.type === "traveler" && !user.verified && (
                          <Button size="sm" onClick={() => handleAction("verify", user)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verifikasi
                          </Button>
                        )}
                        {user.status === "active" && (
                          <Button variant="outline" size="sm" onClick={() => handleAction("suspend", user)}>
                            <Ban className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        )}
                        {user.status === "suspended" && (
                          <Button variant="outline" size="sm" onClick={() => handleAction("activate", user)}>
                            Aktifkan
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* User Detail Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detail User</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{selectedUser.name}</p>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tipe</p>
                    <p className="font-medium capitalize">{selectedUser.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{selectedUser.status}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bergabung</p>
                    <p className="font-medium">{selectedUser.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Aktivitas</p>
                    <p className="font-medium">
                      {selectedUser.type === "traveler" ? `${selectedUser.trips} trip` : `${selectedUser.orders} order`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Action Confirmation Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={() => setActionDialog({ open: false, action: "", user: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.action === "verify" ? "Verifikasi User" :
                 actionDialog.action === "suspend" ? "Suspend User" : "Aktifkan User"}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.action === "verify" 
                  ? `Apakah Anda yakin ingin memverifikasi ${actionDialog.user?.name} sebagai traveler?`
                  : actionDialog.action === "suspend"
                  ? `Apakah Anda yakin ingin men-suspend akun ${actionDialog.user?.name}?`
                  : `Apakah Anda yakin ingin mengaktifkan kembali akun ${actionDialog.user?.name}?`
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ open: false, action: "", user: null })}>
                Batal
              </Button>
              <Button onClick={confirmAction}>
                Konfirmasi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
