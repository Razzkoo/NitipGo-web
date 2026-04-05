import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Camera,
  Save,
  Star,
  Route,
  Package,
  Wallet,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { clearAuth } from "@/lib/storage";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TravelerProfileType {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  avatar: string;
  joinDate: string;
  stats: {
    total_trips: number;
    total_transactions: number;
    rating: number;
    total_withdraw: number;
  } | null;
}

// Helper
const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

export default function TravelerProfile() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<TravelerProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [favoriteRoutes, setFavoriteRoutes] = useState<any[]>([]);

  const reviews = [
    {
      id: 1,
      user: "Budi Santoso",
      rating: 5,
      text: "Traveler sangat ramah dan pengiriman cepat.",
      date: "2 hari lalu",
    },
    {
      id: 2,
      user: "Siti Aminah",
      rating: 4,
      text: "Barang sampai aman, komunikasi baik.",
      date: "1 minggu lalu",
    },
  ];

  // Fetch profile
useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/traveler/profile");
        const user = response.data.data;

        const joinDate = user.created_at
          ? new Date(user.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "—";

        setProfile({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          address: user.address ?? "",
          role: "traveler",
          avatar: user.profile_photo
            ? `${BASE_URL}/storage/${user.profile_photo}`
            : user.pass_photo
            ? `${BASE_URL}/storage/${user.pass_photo}`
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
          joinDate,
          stats: user.stats ?? null,
        });
      } catch (error: any) {
        toast({
          title: "Gagal mengambil profil",
          description: error?.response?.data?.message || "Silahkan coba lagi nanti",
          variant: "destructive",
        });
      }
    };

    fetchProfile();
  }, []);

  // Fetch favorite routes (terpisah)
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await api.get("/traveler/trips");
        const trips = res.data.trips ?? [];

        const routeMap: Record<string, any> = {};
        trips.forEach((trip: any) => {
          const key = `${trip.from}-${trip.to}`;
          if (!routeMap[key]) {
            routeMap[key] = { from: trip.from, to: trip.to, count: 0 };
          }
          routeMap[key].count++;
        });

        setFavoriteRoutes(
          Object.values(routeMap)
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 5)
        );
      } catch (e) {
        console.error("Failed fetch routes", e);
      }
    };

    fetchRoutes();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    try {
      const response = await api.put("/traveler/profile", {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      });

      const updatedUser = response.data.data;

      setProfile((prev: any) => ({
        ...prev,
        name: updatedUser.name,
        phone: updatedUser.phone ?? "",
        address: updatedUser.address ?? "",
      }));

      setIsEditing(false);

      toast({
        title: "Profil Disimpan",
        description: "Data profil traveler berhasil diperbarui.",
      });
    } catch (error: any) {
      toast({
        title: "Gagal menyimpan profil",
        description: error.response?.data?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", reject);
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, crop: any) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx?.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg");
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "File harus berupa gambar",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async () => {
    if (!preview || !croppedAreaPixels) return;

    try {
      setIsUploading(true);

      const croppedBlob = await getCroppedImg(preview, croppedAreaPixels);

      const formData = new FormData();
      formData.append("profile_photo", croppedBlob, "avatar.jpg");

      const response = await api.post("/traveler/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response.data.data;

      setProfile((prev: any) => ({
        ...prev,
        avatar: `${BASE_URL}/storage/${updatedUser.profile_photo}`,
      }));

      setShowAvatarDialog(false);
      setPreview(null);
      setSelectedFile(null);

      toast({
        title: "Foto berhasil diperbarui",
      });
    } catch {
      toast({
        title: "Gagal upload foto",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };


  const handleDeleteAccount = async () => {
    try {
      await api.delete("/traveler/profile");
      clearAuth();
      window.location.href = "/login";
    } catch (error) {
      toast({ title: "Gagal menghapus akun", variant: "destructive" });
    }
  };
  if (!profile) {
    return (
      <DashboardLayout role="traveler">
        <div className="p-10 text-muted-foreground">Loading profile...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="traveler">
      <div className="p-6 md:p-8 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-primary/10 p-2">
              <User className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Profil Saya</h1>
              <p className="text-sm text-muted-foreground">Kelola informasi akun, preferensi, dan pengaturan profil traveler Anda.</p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <motion.div className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-card">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-24 w-24 rounded-full"
                />
                <button
                  onClick={() => setShowAvatarDialog(true)}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{profile.name}</h2>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/20">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span className="text-sm">{profile.stats?.rating ?? 0}</span>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Bergabung pada {profile.joinDate}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs bg-accent/20 text-accent">
                    Mitra Traveler
                  </span>

                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nama Lengkap</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={profile.email} disabled />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nomor Telepon</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Alamat</Label>
                  <Input
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
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

          {/* Stats */}
        <motion.div className="space-y-4">
          {profile.stats && (
            <>
              <div className="rounded-2xl bg-card p-4 shadow-card flex items-center gap-4">
                <Route className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xl font-bold">{profile.stats.total_trips}</p>
                  <p className="text-xs text-muted-foreground">Total Trip</p>
                </div>
              </div>
              <div className="rounded-2xl bg-card p-4 shadow-card flex items-center gap-4">
                <Package className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xl font-bold">{profile.stats.total_transactions}</p>
                  <p className="text-xs text-muted-foreground">Order Selesai</p>
                </div>
              </div>
              <div className="rounded-2xl bg-card p-4 shadow-card flex items-center gap-4">
                <Star className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xl font-bold">{profile.stats.rating}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
              <div className="rounded-2xl bg-card p-4 shadow-card flex items-center gap-4">
                <Wallet className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xl font-bold">{profile.stats.total_withdraw}</p>
                  <p className="text-xs text-muted-foreground">Total Penarikan</p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

        {/* Upload Avatar Dialog */}
        <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ubah Foto Profil</DialogTitle>
              <DialogDescription>
                Pilih gambar baru untuk foto profil Anda.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {preview ? (
                <div className="relative w-64 h-64 mx-auto">
                  <Cropper
                    image={preview}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, croppedAreaPixels) => {
                      setCroppedAreaPixels(croppedAreaPixels);
                    }}
                  />
                </div>
              ) : null}

              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAvatarDialog(false);
                  setPreview(null);
                  setSelectedFile(null);
                }}>
                Batal
              </Button>
              <Button
                onClick={handleUploadAvatar}
                disabled={!selectedFile || isUploading}>
                {isUploading ? "Mengupload..." : "Simpan Foto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Favorite Routes & Reviews */}
        <div className="grid gap-6 lg:grid-cols-2 mt-6">

          {/* Favorite Routes */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4">Rute Favorit</h3>

            <div className="space-y-3">
              {favoriteRoutes.map((route) => (
                <div
                  key={`${route.from}-${route.to}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-primary" />
                    <span>{route.from}</span>
                    <span className="text-muted-foreground">→</span>
                    <span>{route.to}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {route.count}x
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4">Ulasan Terbaru</h3>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{review.user}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-warning text-warning" />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{review.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {review.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Dialog
          open={showDeleteDialog}
          onOpenChange={(open) => {
            setShowDeleteDialog(open);
            if (!open) setDeleteConfirmation("");
          }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Akun Traveler</DialogTitle>
              <DialogDescription>
                Tindakan ini tidak dapat dibatalkan.
                Untuk menghapus akun, ketik <b>Hapus Akun</b>.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <Label>Ketik "Hapus Akun"</Label>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Hapus Akun"
                className="mt-2"/>
              {deleteConfirmation &&
                deleteConfirmation !== "Hapus Akun" && (
                  <p className="text-sm text-destructive mt-2">
                    Teks tidak sesuai.
                  </p>
                )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== "Hapus Akun"}>
                <Trash2 className="h-4 w-4 mr-2" />
                Ya, Hapus Akun
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
