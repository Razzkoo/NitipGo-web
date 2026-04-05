import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Cropper from "react-easy-crop";
import {
  User, Mail, Phone, Shield, Camera, Save,
  Users, Package, Settings, Trash2, MapPin, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { clearAuth } from "@/lib/auth";
import api from "@/lib/api";

interface AdminStats {
  settings_updated: number;
  travelers_approved: number;
}

interface AdminProfileType {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  status: string;
  profile_photo: string | null;
  avatar: string;
  joinDate: string;
  stats: AdminStats | null;
}

export default function AdminProfile() {
  const { toast } = useToast();

  const [profile, setProfile] = useState<AdminProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPassword, setFormPassword] = useState("");

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Avatar crop states
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // data storage 
  const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

  // ID Display
  function generateDisplayId(id: number): string {
    const hash = ((id * 2654435761) >>> 0) % 10000;
    return hash.toString().padStart(4, "0");
  }

  // FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/admin/profile");
        const user = response.data.data;

        const joinDate = user.created_at
          ? new Date(user.created_at).toLocaleDateString("id-ID", {
              day: "numeric", month: "long", year: "numeric",
            })
          : "—";

        const mapped: AdminProfileType = {
          id:            user.id,
          name:          user.name,
          email:         user.email,
          phone:         user.phone ?? "",
          address:       user.address ?? "",
          role:          user.role,
          status:        user.status,
          profile_photo: user.profile_photo,
          avatar: user.profile_photo
            ? `${BASE_URL}/storage/${user.profile_photo}`
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
          joinDate,
          stats: user.stats ?? null,
        };

        setProfile(mapped);
        setFormName(mapped.name);
        setFormPhone(mapped.phone);
        setFormAddress(mapped.address);
      } catch {
        toast({ title: "Gagal mengambil profil", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  // HANDLE SAVE PROFILE
  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);

    try {
      const payload: Record<string, any> = {
        name:    formName,
        phone:   formPhone,
        address: formAddress,
      };

      if (formPassword.trim()) {
        payload.password = formPassword;
      }

      const response = await api.put("/admin/profile", payload);
      const updated = response.data.data;

      setProfile((prev) => prev ? {
        ...prev,
        name:    updated.name,
        phone:   updated.phone ?? "",
        address: updated.address ?? "",
      } : prev);

      setFormPassword("");
      setIsEditing(false);

      toast({ title: "Profil berhasil diperbarui" });
    } catch (error: any) {
      toast({
        title: "Gagal menyimpan profil",
        description: error.response?.data?.message ?? "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!profile) return;
    setFormName(profile.name);
    setFormPhone(profile.phone);
    setFormAddress(profile.address);
    setFormPassword("");
    setIsEditing(false);
  };

  // ─── Avatar Crop & Upload ─────────────────────────
  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", reject);
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, cropPx: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width  = cropPx.width;
    canvas.height = cropPx.height;
    ctx?.drawImage(image, cropPx.x, cropPx.y, cropPx.width, cropPx.height, 0, 0, cropPx.width, cropPx.height);
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), "image/jpeg"));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "File harus berupa gambar", variant: "destructive" });
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async () => {
    if (!preview || !croppedAreaPixels) return;
    setIsUploading(true);

    try {
      const croppedBlob = await getCroppedImg(preview, croppedAreaPixels);
      const formData = new FormData();
      formData.append("profile_photo", croppedBlob, "avatar.jpg");

      const response = await api.post("/admin/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const photoPath = response.data.data.profile_photo;

     setProfile((prev) => prev ? {
        ...prev,
        profile_photo: photoPath,
        avatar: `${BASE_URL}/storage/${photoPath}`,
      } : prev);

      setShowAvatarDialog(false);
      setPreview(null);
      setSelectedFile(null);

      toast({ title: "Foto profil berhasil diperbarui" });
    } catch {
      toast({ title: "Gagal upload foto", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  // HANDLE DELETE ACCOUNT ADMIN
  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {

      await api.delete("/admin/profile");

      clearAuth();
      window.location.href = "/login";
    } catch (error: any) {
      const message = error.response?.data?.message ?? "Gagal menghapus akun";
      toast({ title: message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // LOADING STATE
  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="p-10 text-muted-foreground animate-pulse">
          Memuat profil...
        </div>
      </DashboardLayout>
    );
  }

  // RESPONSE ACCOUNT NOT FOUND
  if (!profile) {
    return (
      <DashboardLayout role="admin">
        <div className="p-10 text-destructive">Profil tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 lg:p-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-primary/10 p-2">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Profil Admin</h1>
              <p className="text-sm text-muted-foreground">
                Kelola informasi akun dan pengaturan profil Anda
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ── Profile Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-card"
          >
            {/* Avatar + Info */}
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="relative w-fit">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-24 w-24 rounded-full object-cover bg-muted"
                />
                <button
                  onClick={() => setShowAvatarDialog(true)}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div>
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ID: <span className="font-semibold text-foreground">{generateDisplayId(profile.id)}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Bergabung pada {profile.joinDate}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive">
                    <Shield className="h-3 w-3 mr-1" />
                    {profile.role}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    profile.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {profile.status === "active" ? "Aktif" : "Non-aktif"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email tidak dapat diubah
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <div className="relative mt-1.5">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="role"
                      value={profile.role}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Alamat</Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="Alamat lengkap"
                  />
                </div>
              </div>

              {/* Password — hanya muncul saat edit */}
              {isEditing && (
                <div>
                  <Label htmlFor="password">Password Baru</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Kosongkan jika tidak ingin mengubah"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Menyimpan...
                      </span>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Simpan
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Batal
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profil
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Akun
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {/* ── Sidebar ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Stats */}
            {profile.stats && (
              <div className="rounded-2xl bg-card p-5 shadow-card">
                <h3 className="font-semibold mb-4">Statistik</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Settings diperbarui</span>
                    <span className="font-semibold">{profile.stats.settings_updated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Traveler disetujui</span>
                    <span className="font-semibold">{profile.stats.travelers_approved}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="rounded-2xl bg-card p-5 shadow-card">
              <h3 className="font-semibold mb-4">Akses Cepat</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    Kelola Users
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/admin/transactions">
                    <Package className="h-4 w-4 mr-2" />
                    Kelola Transaksi
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/admin/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Pengaturan Sistem
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Dialog: Upload Avatar ── */}
      <Dialog open={showAvatarDialog} onOpenChange={(open) => {
        setShowAvatarDialog(open);
        if (!open) { setPreview(null); setSelectedFile(null); }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Foto Profil</DialogTitle>
            <DialogDescription>
              Pilih dan crop gambar untuk foto profil Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {preview && (
              <div className="relative w-64 h-64 mx-auto rounded-xl overflow-hidden">
                <Cropper
                  image={preview}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                />
              </div>
            )}
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAvatarDialog(false);
              setPreview(null);
              setSelectedFile(null);
            }}>
              Batal
            </Button>
            <Button
              onClick={handleUploadAvatar}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? "Mengupload..." : "Simpan Foto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Hapus Akun ── */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => {
        setShowDeleteDialog(open);
        if (!open) setDeleteConfirmation("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Akun Admin</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Untuk menghapus akun,
              ketik <b>Hapus Akun</b> pada kolom di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <Label>Ketik "Hapus Akun"</Label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Hapus Akun"
              className="mt-2"
            />
            {deleteConfirmation && deleteConfirmation !== "Hapus Akun" && (
              <p className="text-sm text-destructive mt-2">Teks tidak sesuai.</p>
            )}
            {/* Info bahwa admin tidak bisa hapus akun sendiri */}
            <p className="text-xs text-muted-foreground mt-3">
              Catatan: Akun admin tidak dapat dihapus sendiri sesuai kebijakan sistem.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== "Hapus Akun" || isDeleting}
            >
              {isDeleting ? (
                "Menghapus..."
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Ya, Hapus Akun
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}