import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Eye, Pencil, Trash2, Ban, CheckCircle,
  X, Phone, Mail, Calendar, Activity, ShieldCheck,
  Home, CreditCard, MapPin, User, Plane, RefreshCw,
  ChevronRight, ChevronLeft
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

type TravelerStatus = "active" | "inactive";
type RequestStatus  = "pending" | "approved" | "rejected";

interface Traveler {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: TravelerStatus;
  city: string;
  province: string;
  address: string;
  birth_date: string;
  gender: "male" | "female";
  ktp_number: string;
  ktp_photo: string | null;
  selfie_with_ktp: string | null;
  pass_photo: string | null;
  sim_card_photo: string | null;
  profile_photo: string | null;
  trips_count: number;
  transactions_count: number;
  ratings_count: number;
  created_at: string;
}

interface TravelerRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  address: string;
  birth_date: string;
  gender: "male" | "female";
  ktp_number: string;
  ktp_photo: string | null;       
  selfie_with_ktp: string | null;
  pass_photo: string | null; 
  sim_card_photo: string | null;
  status_requested: RequestStatus;
  approved_at: string | null;
  created_at: string;
  approver?: { id: number; name: string; email: string } | null;
}

interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    current_page: number;
    last_page: number;
  };
  total?: number;
  current_page?: number;
  last_page?: number;
}

// ─── Animations ────────────────────────────────────────────────────────────────

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

function Avatar({ name, photo, size = "md" }: { name: string; photo?: string | null; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const src = photo
    ? `${BASE_URL}/storage/${photo}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

  return (
    <img
      src={src}
      alt={name}
      className={`${sz} rounded-full object-cover bg-muted shrink-0`}/>
  );
}

function FormField({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </label>
      {children}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 rounded-full px-4 text-xs font-semibold transition-all duration-150 border ${
        active
          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      {label}
    </button>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-zinc-500" />
      </div>
      <div>
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="text-sm font-semibold text-zinc-900">{value || "-"}</p>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminTravelers() {
  const { toast } = useToast();

  // ── Tab: travelers vs requests
  const [activeTab, setActiveTab] = useState<"travelers" | "requests">("travelers");

  // ── Travelers state
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [travelersMeta, setTravelersMeta] = useState({ total: 0, current_page: 1, last_page: 1 });
  const [loadingTravelers, setLoadingTravelers] = useState(false);

  // ── Requests state
  const [requests, setRequests] = useState<TravelerRequest[]>([]);
  const [requestsMeta, setRequestsMeta] = useState({ total: 0, current_page: 1, last_page: 1 });
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // ── Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // ── Dialogs
  const [detailTraveler, setDetailTraveler]     = useState<Traveler | null>(null);
  const [detailRequest, setDetailRequest]       = useState<TravelerRequest | null>(null);
  const [editingTraveler, setEditingTraveler]   = useState<Traveler | null>(null);
  const [deleteTraveler, setDeleteTraveler]     = useState<Traveler | null>(null);
  const [suspendTraveler, setSuspendTraveler]   = useState<Traveler | null>(null);
  const [deleteRequest, setDeleteRequest]       = useState<TravelerRequest | null>(null);

  // ─── verification traveler

  const [verifyRequest, setVerifyRequest]         = useState<TravelerRequest | null>(null);
  const [verifyStep, setVerifyStep]               = useState<1 | 2 | 3>(1);
  const [biodataChecked, setBiodataChecked]       = useState(false);
  const [biodataValid, setBiodataValid]           = useState<boolean | null>(null);
  const [biodataNotes, setBiodataNotes]           = useState("");
  const [dokumenChecked, setDokumenChecked]       = useState(false);
  const [dokumenValid, setDokumenValid]           = useState<boolean | null>(null);
  const [dokumenNotes, setDokumenNotes]           = useState("");
  const [isApproving, setIsApproving]             = useState(false);
  const [previewPhoto, setPreviewPhoto]           = useState<{ src: string; label: string } | null>(null);

  // Action after rejected
  const [rejectDialog, setRejectDialog] = useState<TravelerRequest | null>(null);
  const [rejectForm, setRejectForm] = useState({ reason: "", solution: "" });
  const [isRejecting, setIsRejecting] = useState(false);

  // Helper convert response
  const mapTravelerStatus = (status: string): TravelerStatus => {
    return status === "non_active" ? "inactive" : status as TravelerStatus;
  };

  const [editForm, setEditForm] = useState({
    name: "", phone: "", city: "", province: "", address: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Traveler
  const fetchTravelers = async () => {
    setLoadingTravelers(true);
    try {
      const params: Record<string, any> = { page };
      if (search) params.search = search;
      if (statusFilter !== "all") {
        params.status = statusFilter === "inactive" ? "non_active" : statusFilter;
      }

      const res = await api.get("/admin/travelers", { params });
      const pagination = res.data.data;
      const raw = pagination.data ?? pagination;

      setTravelers(
        (Array.isArray(raw) ? raw : []).map((t: any) => ({
          ...t,
          status: mapTravelerStatus(t.status),
        }))
      );
      setTravelersMeta({
        total:        pagination.total        ?? 0,
        current_page: pagination.current_page ?? 1,
        last_page:    pagination.last_page    ?? 1,
      });

      const pendingRes = await api.get("/admin/traveler-requests", {
        params: { status: "pending", page: 1 }
      });
      setPendingCount(pendingRes.data.data?.total ?? 0);

    } catch {
      toast({ title: "Gagal memuat data traveler", variant: "destructive" });
    } finally {
      setLoadingTravelers(false);
    }
  };

  // Fetch Request
  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const params: Record<string, any> = { page };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await api.get("/admin/traveler-requests", { params });
      const pagination = res.data.data;
      const raw = pagination.data ?? pagination;

      setRequests(Array.isArray(raw) ? raw : []);
      setRequestsMeta({
        total:        pagination.total        ?? 0,
        current_page: pagination.current_page ?? 1,
        last_page:    pagination.last_page    ?? 1,
      });

      const pendingRes = await api.get("/admin/traveler-requests", {
        params: { status: "pending", page: 1 }
      });
      setPendingCount(pendingRes.data.data?.total ?? 0);

    } catch {
      toast({ title: "Gagal memuat data request", variant: "destructive" });
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, activeTab]);

  useEffect(() => {
    if (activeTab === "travelers") fetchTravelers();
    else fetchRequests();
  }, [activeTab, page, search, statusFilter]);

  // ── Handlers: Traveler ─────────────────────────────

  const handleUpdateStatus = async (t: Traveler, status: TravelerStatus) => {
    try {
      // Convert status
      const backendStatus = status === "inactive" ? "non_active" : status;

      await api.patch(`/admin/travelers/${t.id}/status`, { status: backendStatus });
      toast({ title: status === "active" ? "Traveler Diaktifkan" : "Traveler Disuspend" });
      fetchTravelers();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({ title: error.response?.data?.message ?? "Gagal ubah status", variant: "destructive" });
    } finally {
      setSuspendTraveler(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTraveler) return;
    try {
      await api.delete(`/admin/travelers/${deleteTraveler.id}`);
      toast({ title: "Traveler Dihapus", description: `${deleteTraveler.name} berhasil dihapus.` });
      fetchTravelers();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({ title: error.response?.data?.message ?? "Gagal menghapus", variant: "destructive" });
    } finally {
      setDeleteTraveler(null);
    }
  };

  const handleEditClick = (t: Traveler) => {
    setEditingTraveler(t);
    setEditForm({ name: t.name, phone: t.phone, city: t.city, province: t.province, address: t.address });
  };

  const handleSaveEdit = async () => {
    if (!editingTraveler) return;
    setIsSaving(true);
    try {
      await api.put(`/admin/travelers/${editingTraveler.id}`, {
        ...editForm,
        birth_date:      editingTraveler.birth_date,
        gender:          editingTraveler.gender,
        ktp_number:      editingTraveler.ktp_number,
        status:          editingTraveler.status,
      });
      toast({ title: "Data Diperbarui", description: `Data ${editingTraveler.name} berhasil diperbarui.` });
      fetchTravelers();
      setEditingTraveler(null);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({ title: error.response?.data?.message ?? "Gagal menyimpan", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  function PhotoDocCard({
    label, val, baseUrl, aspectClass, onPreview,
  }: {
    label: string;
    val: string | null;
    baseUrl: string;
    aspectClass: string;
    onPreview: (src: string) => void;
  }) {
    const src = val ? `${baseUrl}/storage/${val}` : null;
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{label}</p>
        {src ? (
          <button
            type="button"
            onClick={() => onPreview(src)}
            className={`relative ${aspectClass} w-full rounded-xl overflow-hidden border-2 border-zinc-200 group hover:border-blue-400 transition-colors block`}
          >
            <img
              src={src}
              alt={label}
              className="w-full h-full object-cover transition group-hover:scale-105 duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30">
              <div className="flex items-center gap-1.5 bg-white/90 rounded-full px-3 py-1.5">
                <Eye className="h-3.5 w-3.5 text-zinc-700" />
                <span className="text-xs font-semibold text-zinc-700">Perbesar</span>
              </div>
            </div>
            <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              ✓ Ada
            </div>
          </button>
        ) : (
          <div className={`relative ${aspectClass} w-full rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center gap-1`}>
            <X className="h-5 w-5 text-zinc-300" />
            <p className="text-xs text-zinc-400 font-medium">Tidak ada foto</p>
          </div>
        )}
      </div>
    );
  }

  // ── Handlers: Request ──────────────────────────────

  // APPROVAL
  const handleApproveRequest = async (r: TravelerRequest) => {
    setIsApproving(true);
    try {
      await api.post(`/admin/traveler-requests/${r.id}/approve`);
      toast({ title: "Permintaan Disetujui", description: `${r.name} berhasil disetujui.` });
      fetchRequests();
      setDetailRequest(null);
      setVerifyRequest(null);
      setVerifyStep(1);
      setBiodataChecked(false);
      setBiodataValid(null);
      setBiodataNotes("");
      setDokumenChecked(false);
      setDokumenValid(null);
      setDokumenNotes("");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({ title: error.response?.data?.message ?? "Gagal disetujui", variant: "destructive" });
    } finally {
      setIsApproving(false);
    }
  };

  const openVerifyDialog = (r: TravelerRequest) => {
    setVerifyRequest(r);
    setVerifyStep(1);
    setBiodataChecked(false);
    setBiodataValid(null);
    setBiodataNotes("");
    setDokumenChecked(false);
    setDokumenValid(null);
    setDokumenNotes("");
  };

  const closeVerifyDialog = () => {
    setVerifyRequest(null);
    setVerifyStep(1);
    setBiodataChecked(false);
    setBiodataValid(null);
    setBiodataNotes("");
    setDokumenChecked(false);
    setDokumenValid(null);
    setDokumenNotes("");
  };

  // REJECTED
  const handleRejectRequest = async () => {
    if (!rejectDialog) return;
    setIsRejecting(true);
    try {
      await api.patch(`/admin/traveler-requests/${rejectDialog.id}/reject`, {
        reason:   rejectForm.reason,
        solution: rejectForm.solution,
      });
      toast({ title: "Request Ditolak", description: `${rejectDialog.name} ditolak dan email terkirim.` });
      fetchRequests();
      setDetailRequest(null);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({ title: error.response?.data?.message ?? "Gagal menolak request", variant: "destructive" });
    } finally {
      setIsRejecting(false);
      setRejectDialog(null);
      setRejectForm({ reason: "", solution: "" });
    }
  };

  const handleConfirmDeleteRequest = async () => {
    if (!deleteRequest) return;
    try {
      await api.delete(`/admin/traveler-requests/${deleteRequest.id}`);
      toast({ title: "Request Dihapus" });
      fetchRequests();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({ title: error.response?.data?.message ?? "Gagal menghapus", variant: "destructive" });
    } finally {
      setDeleteRequest(null);
    }
  };

  // ── Filter chips config ────────────────────────────
  const travelerFilters = [
    { label: `Semua`, value: "all" },
    { label: `Aktif`, value: "active" },
    { label: `Non-aktif`, value: "inactive" },
  ];

  const requestFilters = [
    { label: `Semua`, value: "all" },
    { label: `Pending`, value: "pending" },
    { label: `Disetujui`, value: "approved" },
    { label: `Ditolak`, value: "rejected" },
  ];

  const filters = activeTab === "travelers" ? travelerFilters : requestFilters;

  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 lg:p-10 space-y-6">

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-emerald-100 p-2">
              <Plane className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Manajemen Traveler</h1>
              <p className="text-sm text-muted-foreground">Verifikasi dan kontrol akun traveler</p>
            </div>
          </div>
        </div>

        {/* TAB */}
        <div className="flex gap-1 p-1 rounded-full border border-border bg-muted w-fit">
          {(["travelers", "requests"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setStatusFilter("all"); setSearch(""); }}
              className={`relative px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}>
              {tab === "travelers" ? "Traveler Aktif" : "Permintaan Daftar"}

              {tab === "requests" && pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* FILTER SECTION */}
        <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Cari nama, email, telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <FilterChip key={f.value} label={f.label} active={statusFilter === f.value} onClick={() => setStatusFilter(f.value)} />
            ))}
            <button
              onClick={() => activeTab === "travelers" ? fetchTravelers() : fetchRequests()}
              className="h-8 rounded-full px-3 text-xs font-semibold border border-zinc-200 text-zinc-500 hover:bg-zinc-50 flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* ── TAB: TRAVELERS ── */}
        {activeTab === "travelers" && (
          <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
              <p className="text-xs font-medium text-zinc-500">
                Total <span className="text-zinc-900 font-bold">{travelersMeta.total}</span> traveler
              </p>
            </div>

            {loadingTravelers ? (
              <div className="p-10 text-center text-muted-foreground animate-pulse">Memuat data...</div>
            ) : travelers.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-zinc-100">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[28%]">Traveler</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[15%]">Lokasi</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[12%]">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[10%]">Trip</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[12%]">Bergabung</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[18%]">Aksi</th>
                      </tr>
                    </thead>
                    <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
                      {travelers.map((t) => (
                        <motion.tr key={t.id} variants={staggerItem} className="border-b border-zinc-50 hover:bg-zinc-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={t.name} photo={t.profile_photo ?? t.pass_photo} size="sm" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 truncate">{t.name}</p>
                                <p className="text-xs text-zinc-400 truncate">{t.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <p className="text-xs font-medium text-zinc-700">{t.city}</p>
                            <p className="text-[10px] text-zinc-400">{t.province}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex justify-center">
                              <StatusBadge status={t.status} size="sm" />
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="text-xs font-medium text-zinc-700">{t.trips_count ?? 0} trip</span>
                          </td>
                          <td className="px-4 py-3.5 text-center text-xs text-zinc-500">{formatDate(t.created_at)}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex justify-center gap-1">
                              <ActionBtn icon={Eye} title="Detail" onClick={() => setDetailTraveler(t)} />
                              <ActionBtn icon={Pencil} title="Edit" onClick={() => handleEditClick(t)} />
                              {t.status === "active" ? (
                                <ActionBtn icon={Ban} title="Suspend" color="amber" onClick={() => setSuspendTraveler(t)} />
                              ) : (
                                <ActionBtn icon={CheckCircle} title="Aktifkan" color="green" onClick={() => handleUpdateStatus(t, "active")} />
                              )}
                              <ActionBtn icon={Trash2} title="Hapus" color="red" onClick={() => setDeleteTraveler(t)} />
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
                {travelersMeta.last_page > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
                  <span className="text-xs text-zinc-500">Halaman <span className="font-semibold text-zinc-900">{page}</span> dari{" "}
                    <span className="font-semibold text-zinc-900">{travelersMeta.last_page}</span>
                  </span>
                  <Button variant="outline" size="sm" disabled={page === travelersMeta.last_page} onClick={() => setPage(p => p + 1)}>Berikutnya</Button>
                </div>
              )}
              </>
            ) : (
              <EmptyState icon={Plane} title="Tidak ada traveler ditemukan" description="Coba ubah filter pencarian Anda" />
            )}
          </div>
        )}

        {/* ── TAB: REQUESTS ── */}
        {activeTab === "requests" && (
          <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
              <p className="text-xs font-medium text-zinc-500">
                Total <span className="text-zinc-900 font-bold">{requestsMeta.total}</span> permintaan
              </p>
            </div>

            {loadingRequests ? (
              <div className="p-10 text-center text-muted-foreground animate-pulse">Memuat data...</div>
            ) : requests.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-zinc-100">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[28%]">Pemohon</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[15%]">Lokasi</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[12%]">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[12%]">Tanggal Daftar</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[18%]">Aksi</th>
                      </tr>
                    </thead>
                    <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
                      {requests.map((r) => (
                        <motion.tr key={r.id} variants={staggerItem} className="border-b border-zinc-50 hover:bg-zinc-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={r.name} photo={r.pass_photo} size="sm" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 truncate">{r.name}</p>
                                <p className="text-xs text-zinc-400 truncate">{r.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <p className="text-xs font-medium text-zinc-700">{r.city}</p>
                            <p className="text-[10px] text-zinc-400">{r.province}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                                r.status_requested === "pending"
                                  ? "bg-amber-50 text-amber-700 border-amber-100"
                                  : r.status_requested === "approved"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : "bg-red-50 text-red-600 border-red-100"
                              }`}>
                                {r.status_requested === "pending" ? "Pending"
                                  : r.status_requested === "approved" ? "Disetujui"
                                  : "Ditolak"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center text-xs text-zinc-500">{formatDate(r.created_at)}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex justify-center gap-1">
                              <ActionBtn icon={Eye} title="Detail" onClick={() => setDetailRequest(r)} />
                              {r.status_requested === "pending" && (
                                <button
                                  onClick={() => openVerifyDialog(r)}
                                  className="flex items-center gap-1 rounded-lg bg-blue-500 hover:bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white transition">
                                  <ShieldCheck className="h-3.5 w-3.5" />Verifikasi
                                </button>
                              )}
                              {r.status_requested === "rejected" && (
                                <ActionBtn icon={Trash2} title="Hapus" color="red" onClick={() => setDeleteRequest(r)} />
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
                {requestsMeta.last_page > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
                    <span className="text-xs text-zinc-500">Halaman <span className="font-semibold text-zinc-900">{page}</span> dari{" "}
                      <span className="font-semibold text-zinc-900">{requestsMeta.last_page}</span>
                    </span>
                    <Button variant="outline" size="sm" disabled={page === requestsMeta.last_page} onClick={() => setPage(p => p + 1)}>Berikutnya</Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState icon={Plane} title="Tidak ada permintaan ditemukan" description="Coba ubah filter pencarian Anda" />
            )}
          </div>
        )}

        {/* ── DETAIL TRAVELER DIALOG ── */}
        <Dialog open={!!detailTraveler} onOpenChange={() => setDetailTraveler(null)}>
          <DialogContent className="max-w-lg p-0 overflow-hidden">
            {detailTraveler && (
              <>
                <div className="px-6 pt-6 pb-4 bg-emerald-50">
                  <div className="flex items-center gap-4">
                    <Avatar name={detailTraveler.name} photo={detailTraveler.profile_photo ?? detailTraveler.pass_photo} size="lg" />
                    <div>
                      <h3 className="font-bold text-zinc-900 text-lg leading-tight">{detailTraveler.name}</h3>
                      <p className="text-sm text-zinc-500">{detailTraveler.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={detailTraveler.status} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Data Diri</p>
                    <div className="grid grid-cols-2 gap-3">
                      <InfoRow icon={Phone} label="Telepon" value={detailTraveler.phone} />
                      <InfoRow icon={User} label="Jenis Kelamin" value={detailTraveler.gender === "male" ? "Laki-laki" : "Perempuan"} />
                      <InfoRow icon={Calendar} label="Tanggal Lahir" value={formatDate(detailTraveler.birth_date)} />
                      <InfoRow icon={Activity} label="Total Trip" value={`${detailTraveler.trips_count ?? 0} trip`} />
                      <InfoRow icon={Calendar} label="Bergabung" value={formatDate(detailTraveler.created_at)} />
                      <InfoRow icon={ShieldCheck} label="ID" value={`#${detailTraveler.id.toString().padStart(4, "0")}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Lokasi</p>
                    <div className="grid grid-cols-2 gap-3">
                      <InfoRow icon={MapPin} label="Kota" value={detailTraveler.city} />
                      <InfoRow icon={MapPin} label="Provinsi" value={detailTraveler.province} />
                    </div>
                    <div className="mt-3">
                      <InfoRow icon={Home} label="Alamat" value={detailTraveler.address} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Identitas</p>
                    <InfoRow icon={CreditCard} label="Nomor KTP / NIK" value={detailTraveler.ktp_number} />
                  </div>

                  {/* Foto Dokumen — di Detail Traveler Dialog */}
                  {(detailTraveler.ktp_photo || detailTraveler.pass_photo || detailTraveler.selfie_with_ktp || detailTraveler.sim_card_photo) && (
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Foto Dokumen</p>
                      <div className="grid grid-cols-2 gap-3">
                        <PhotoDocCard
                          label="Foto KTP"
                          val={detailTraveler.ktp_photo}
                          baseUrl={BASE_URL}
                          aspectClass="aspect-video"
                          onPreview={(src) => setPreviewPhoto({ src, label: "Foto KTP" })}
                        />
                        <PhotoDocCard
                          label="Foto Kartu SIM"
                          val={detailTraveler.sim_card_photo}
                          baseUrl={BASE_URL}
                          aspectClass="aspect-video"
                          onPreview={(src) => setPreviewPhoto({ src, label: "Foto Kartu SIM" })}
                        />
                        <PhotoDocCard
                          label="Pas Foto 3×4"
                          val={detailTraveler.pass_photo}
                          baseUrl={BASE_URL}
                          aspectClass="aspect-[3/4]"
                          onPreview={(src) => setPreviewPhoto({ src, label: "Pas Foto 3×4" })}
                        />
                        <PhotoDocCard
                          label="Selfie + KTP"
                          val={detailTraveler.selfie_with_ktp}
                          baseUrl={BASE_URL}
                          aspectClass="aspect-[3/4]"
                          onPreview={(src) => setPreviewPhoto({ src, label: "Selfie + KTP" })}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter className="px-6 pb-5">
                  <Button variant="outline" className="w-full" onClick={() => setDetailTraveler(null)}>Tutup</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── DETAIL REQUEST DIALOG ── */}
        <Dialog open={!!detailRequest} onOpenChange={() => setDetailRequest(null)}>
          <DialogContent className="max-w-lg p-0 overflow-hidden">
            {detailRequest && (
              <>
                <div className="px-6 pt-6 pb-4 bg-amber-50">
                  <div className="flex items-center gap-4">
                    <Avatar name={detailRequest.name} photo={detailRequest.pass_photo} size="lg" />
                    <div>
                      <h3 className="font-bold text-zinc-900 text-lg">{detailRequest.name}</h3>
                      <p className="text-sm text-zinc-500">{detailRequest.email}</p>
                      <span className={`inline-flex items-center mt-2 gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        detailRequest.status_requested === "pending"
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : detailRequest.status_requested === "approved"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-red-100 text-red-600 border-red-200"
                      }`}>
                        {detailRequest.status_requested === "pending" ? "Pending"
                          : detailRequest.status_requested === "approved" ? "Disetujui"
                          : "Ditolak"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Data Diri</p>
                    <div className="grid grid-cols-2 gap-3">
                      <InfoRow icon={Phone} label="Telepon" value={detailRequest.phone} />
                      <InfoRow icon={User} label="Jenis Kelamin" value={detailRequest.gender === "male" ? "Laki-laki" : "Perempuan"} />
                      <InfoRow icon={Calendar} label="Tanggal Lahir" value={formatDate(detailRequest.birth_date)} />
                      <InfoRow icon={Calendar} label="Tanggal Daftar" value={formatDate(detailRequest.created_at)} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Lokasi</p>
                    <div className="grid grid-cols-2 gap-3">
                      <InfoRow icon={MapPin} label="Kota" value={detailRequest.city} />
                      <InfoRow icon={MapPin} label="Provinsi" value={detailRequest.province} />
                    </div>
                    <div className="mt-3">
                      <InfoRow icon={Home} label="Alamat" value={detailRequest.address} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Identitas</p>
                    <InfoRow icon={CreditCard} label="Nomor KTP / NIK" value={detailRequest.ktp_number} />
                  </div>
                  {/* Foto Dokumen — di Detail Request Dialog */}
                  {(detailRequest.ktp_photo || detailRequest.pass_photo || detailRequest.selfie_with_ktp || detailRequest.sim_card_photo) && (
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Foto Dokumen</p>
                      <div className="grid grid-cols-2 gap-3">
                        <PhotoDocCard
                          label="Foto KTP"
                          val={detailRequest.ktp_photo}
                          baseUrl={BASE_URL}
                          aspectClass="aspect-video"
                          onPreview={(src) => setPreviewPhoto({ src, label: "Foto KTP" })}
                        />
                        <PhotoDocCard
                          label="Foto Kartu SIM"
                          val={detailRequest.sim_card_photo}
                          baseUrl={BASE_URL}
                          aspectClass="aspect-video"
                          onPreview={(src) => setPreviewPhoto({ src, label: "Foto Kartu SIM" })}
                        />
                        <PhotoDocCard
                          label="Pas Foto 3×4"
                          val={detailRequest.pass_photo}
                          baseUrl={BASE_URL}
                          aspectClass="aspect-[3/4]"
                          onPreview={(src) => setPreviewPhoto({ src, label: "Pas Foto 3×4" })}
                        />
                        <PhotoDocCard
                          label="Selfie + KTP"
                          val={detailRequest.selfie_with_ktp}
                          baseUrl={BASE_URL}
                          aspectClass="aspect-[3/4]"
                          onPreview={(src) => setPreviewPhoto({ src, label: "Selfie + KTP" })}
                        />
                      </div>
                    </div>
                  )}
                  {detailRequest.approver && (
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Diproses Oleh</p>
                      <InfoRow icon={ShieldCheck} label="Admin" value={detailRequest.approver.name} />
                    </div>
                  )}
                </div>

                <DialogFooter className="px-6 pb-5 flex gap-2">
                  {detailRequest.status_requested === "pending" && (
                    <>
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => { setDetailRequest(null); openVerifyDialog(detailRequest); }}
                      >
                        <ShieldCheck className="h-4 w-4 mr-1.5" /> Verifikasi
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setDetailRequest(null)}>
                        Tutup
                      </Button>
                    </>
                  )}

                  {/* Rejected: hanya tutup — tidak ada approve ulang */}
                  {detailRequest.status_requested === "rejected" && (
                    <Button variant="outline" className="w-full" onClick={() => setDetailRequest(null)}>
                      Tutup
                    </Button>
                  )}

                  {detailRequest.status_requested === "approved" && (
                    <Button variant="outline" className="w-full" onClick={() => setDetailRequest(null)}>Tutup</Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── EDIT TRAVELER DIALOG ── */}
        <Dialog open={!!editingTraveler} onOpenChange={() => setEditingTraveler(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <Pencil className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <DialogTitle>Edit Traveler</DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">Perbarui data traveler</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {editingTraveler && (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-3 rounded-xl bg-zinc-50 border border-zinc-100 p-3">
                  <Avatar name={editingTraveler.name} photo={editingTraveler.profile_photo ?? editingTraveler.pass_photo} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{editingTraveler.name}</p>
                    <p className="text-xs text-zinc-400">{editingTraveler.email}</p>
                  </div>
                </div>
                <FormField label="Nama Lengkap" icon={User}>
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="h-10 rounded-xl border-zinc-200" />
                </FormField>
                <FormField label="Email" icon={Mail}>
                  <Input value={editingTraveler.email} disabled
                    className="h-10 rounded-xl border-zinc-200 bg-zinc-50 cursor-not-allowed text-zinc-400" />
                </FormField>
                <FormField label="No. Telepon" icon={Phone}>
                  <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="h-10 rounded-xl border-zinc-200" />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Kota" icon={MapPin}>
                    <Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="h-10 rounded-xl border-zinc-200" />
                  </FormField>
                  <FormField label="Provinsi" icon={MapPin}>
                    <Input value={editForm.province} onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                      className="h-10 rounded-xl border-zinc-200" />
                  </FormField>
                </div>
                <FormField label="Alamat Lengkap" icon={Home}>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    rows={2}
                    className="flex w-full rounded-xl border border-zinc-200 bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </FormField>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditingTraveler(null)} className="flex-1">Batal</Button>
              <Button onClick={handleSaveEdit} disabled={isSaving} className="flex-1">
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── SUSPEND DIALOG ── */}
        <Dialog open={!!suspendTraveler} onOpenChange={() => setSuspendTraveler(null)}>
          <DialogContent className="max-w-sm">
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                <Ban className="h-7 w-7 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">Suspend Traveler?</h3>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Akun <span className="font-semibold text-zinc-800">{suspendTraveler?.name}</span> akan dinonaktifkan.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSuspendTraveler(null)} className="flex-1">Batal</Button>
              <Button
                onClick={() => suspendTraveler && handleUpdateStatus(suspendTraveler, "inactive")}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              >
                Ya, Suspend
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── DIALOG PREVIEW FOTO ── */}
        <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
          <DialogContent className="max-w-2xl p-2 bg-black/95">
            {previewPhoto && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2 pt-1">
                  <p className="text-white text-sm font-medium">{previewPhoto.label}</p>
                  <button onClick={() => setPreviewPhoto(null)} className="text-zinc-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <img
                  src={previewPhoto.src}
                  alt={previewPhoto.label}
                  className="w-full max-h-[75vh] object-contain rounded-lg"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ── DIALOG VERIFIKASI REQUEST ── */}
        <Dialog open={!!verifyRequest} onOpenChange={closeVerifyDialog}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden">
            {verifyRequest && (
              <>
                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-zinc-100 bg-zinc-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900">Verifikasi Pendaftaran Traveler</h3>
                        <p className="text-xs text-zinc-500">{verifyRequest.name} · {verifyRequest.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-1">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            s < verifyStep ? "bg-emerald-500 text-white"
                            : s === verifyStep ? "bg-blue-600 text-white"
                            : "bg-zinc-200 text-zinc-400"
                          }`}>
                            {s < verifyStep ? <CheckCircle className="h-4 w-4" /> : s}
                          </div>
                          {s < 3 && <div className={`h-px w-4 ${s < verifyStep ? "bg-emerald-400" : "bg-zinc-200"}`} />}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-8 mt-3">
                    {["Biodata", "Data Pendukung", "Konfirmasi"].map((label, i) => (
                      <span key={label} className={`text-xs font-medium ${
                        i + 1 === verifyStep ? "text-blue-600" : i + 1 < verifyStep ? "text-emerald-600" : "text-zinc-400"
                      }`}>{label}</span>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">

                  {/* ── STEP 1: Biodata ── */}
                  {verifyStep === 1 && (
                    <div className="space-y-5">
                      <p className="text-sm font-semibold text-zinc-700">Periksa kelengkapan biodata pemohon:</p>
                      <div className="grid grid-cols-2 gap-3">
                        <InfoRow icon={User} label="Nama Lengkap" value={verifyRequest.name} />
                        <InfoRow icon={Mail} label="Email" value={verifyRequest.email} />
                        <InfoRow icon={Phone} label="Telepon" value={verifyRequest.phone} />
                        <InfoRow icon={User} label="Jenis Kelamin" value={verifyRequest.gender === "male" ? "Laki-laki" : "Perempuan"} />
                        <InfoRow icon={Calendar} label="Tanggal Lahir" value={formatDate(verifyRequest.birth_date)} />
                        <InfoRow icon={CreditCard} label="Nomor KTP / NIK" value={verifyRequest.ktp_number} />
                        <InfoRow icon={MapPin} label="Kota" value={verifyRequest.city} />
                        <InfoRow icon={MapPin} label="Provinsi" value={verifyRequest.province} />
                      </div>
                      <div>
                        <InfoRow icon={Home} label="Alamat Lengkap" value={verifyRequest.address} />
                      </div>

                      {/* Pilihan Valid / Tidak Valid */}
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Hasil Pemeriksaan Biodata</p>
                        <div className="grid grid-cols-2 gap-3">
                          <label className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 p-3.5 transition-all ${
                            biodataValid === true ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                          }`}>
                            <input
                              type="radio"
                              name="biodataValid"
                              checked={biodataValid === true}
                              onChange={() => { setBiodataValid(true); setBiodataNotes(""); setBiodataChecked(true); }}
                              className="accent-emerald-600"
                            />
                            <div>
                              <p className="text-sm font-semibold text-emerald-700">✓ Valid & Sesuai</p>
                              <p className="text-xs text-zinc-400">Semua biodata benar</p>
                            </div>
                          </label>
                          <label className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 p-3.5 transition-all ${
                            biodataValid === false ? "border-red-400 bg-red-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                          }`}>
                            <input
                              type="radio"
                              name="biodataValid"
                              checked={biodataValid === false}
                              onChange={() => { setBiodataValid(false); setBiodataChecked(false); }}
                              className="accent-red-500"
                            />
                            <div>
                              <p className="text-sm font-semibold text-red-600">✕ Tidak Valid</p>
                              <p className="text-xs text-zinc-400">Ada data yang bermasalah</p>
                            </div>
                          </label>
                        </div>

                        {/* Input keterangan jika tidak valid */}
                        {biodataValid === false && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                              Keterangan Ketidaksesuaian *
                            </label>
                            <textarea
                              value={biodataNotes}
                              onChange={(e) => {
                                setBiodataNotes(e.target.value);
                                setBiodataChecked(e.target.value.trim().length > 0);
                              }}
                              rows={3}
                              placeholder="Contoh: Nama tidak sesuai dengan KTP, tanggal lahir tidak valid..."
                              className="flex w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 resize-none"
                            />
                            <p className="text-xs text-red-500">Wajib diisi sebelum melanjutkan</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── STEP 2: Foto Dokumen ── */}
                  {verifyStep === 2 && (
                    <div className="space-y-5">
                      <p className="text-sm font-semibold text-zinc-700">Periksa foto dokumen yang dikirimkan pemohon:</p>
                      <div className="grid grid-cols-2 gap-3">
                        <PhotoDocCard label="Foto KTP" val={verifyRequest.ktp_photo} baseUrl={BASE_URL} aspectClass="aspect-video"
                          onPreview={(src) => setPreviewPhoto({ src, label: "Foto KTP" })} />
                        <PhotoDocCard label="Foto Kartu SIM" val={verifyRequest.sim_card_photo} baseUrl={BASE_URL} aspectClass="aspect-video"
                          onPreview={(src) => setPreviewPhoto({ src, label: "Foto Kartu SIM" })} />
                        <PhotoDocCard label="Pas Foto 3×4" val={verifyRequest.pass_photo} baseUrl={BASE_URL} aspectClass="aspect-[3/4]"
                          onPreview={(src) => setPreviewPhoto({ src, label: "Pas Foto 3×4" })} />
                        <PhotoDocCard label="Selfie + KTP" val={verifyRequest.selfie_with_ktp} baseUrl={BASE_URL} aspectClass="aspect-[3/4]"
                          onPreview={(src) => setPreviewPhoto({ src, label: "Selfie + KTP" })} />
                      </div>

                      {(!verifyRequest.ktp_photo || !verifyRequest.selfie_with_ktp || !verifyRequest.pass_photo || !verifyRequest.sim_card_photo) && (
                        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                          <X className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700">Beberapa foto dokumen tidak tersedia. Pertimbangkan untuk menolak pendaftaran ini.</p>
                        </div>
                      )}

                      {/* Pilihan Valid / Tidak Valid */}
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Hasil Pemeriksaan Dokumen</p>
                        <div className="grid grid-cols-2 gap-3">
                          <label className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 p-3.5 transition-all ${
                            dokumenValid === true ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                          }`}>
                            <input
                              type="radio"
                              name="dokumenValid"
                              checked={dokumenValid === true}
                              onChange={() => { setDokumenValid(true); setDokumenNotes(""); setDokumenChecked(true); }}
                              className="accent-emerald-600"
                            />
                            <div>
                              <p className="text-sm font-semibold text-emerald-700">✓ Valid & Sesuai</p>
                              <p className="text-xs text-zinc-400">Semua dokumen jelas</p>
                            </div>
                          </label>
                          <label className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 p-3.5 transition-all ${
                            dokumenValid === false ? "border-red-400 bg-red-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                          }`}>
                            <input
                              type="radio"
                              name="dokumenValid"
                              checked={dokumenValid === false}
                              onChange={() => { setDokumenValid(false); setDokumenChecked(false); }}
                              className="accent-red-500"
                            />
                            <div>
                              <p className="text-sm font-semibold text-red-600">✕ Tidak Valid</p>
                              <p className="text-xs text-zinc-400">Ada dokumen bermasalah</p>
                            </div>
                          </label>
                        </div>

                        {/* Input keterangan jika tidak valid */}
                        {dokumenValid === false && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                              Keterangan Ketidaksesuaian *
                            </label>
                            <textarea
                              value={dokumenNotes}
                              onChange={(e) => {
                                setDokumenNotes(e.target.value);
                                setDokumenChecked(e.target.value.trim().length > 0);
                              }}
                              rows={3}
                              placeholder="Contoh: Foto KTP buram dan tidak terbaca, selfie tidak jelas..."
                              className="flex w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 resize-none"
                            />
                            <p className="text-xs text-red-500">Wajib diisi sebelum melanjutkan</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── STEP 3: Konfirmasi ── */}
                  {verifyStep === 3 && (
                    <div className="space-y-5">
                      <div className="flex flex-col items-center text-center gap-3 py-4">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                          biodataValid && dokumenValid ? "bg-emerald-100" : "bg-red-100"
                        }`}>
                          {biodataValid && dokumenValid
                            ? <CheckCircle className="h-8 w-8 text-emerald-600" />
                            : <X className="h-8 w-8 text-red-500" />
                          }
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 text-lg">
                            {biodataValid && dokumenValid ? "Verifikasi Selesai" : "Ditemukan Ketidaksesuaian"}
                          </h4>
                          <p className="text-sm text-zinc-500 mt-1">
                            {biodataValid && dokumenValid
                              ? <>Biodata dan dokumen <strong>{verifyRequest.name}</strong> telah diperiksa dan dinyatakan valid.</>
                              : <>Terdapat data yang tidak valid pada pendaftaran <strong>{verifyRequest.name}</strong>.</>
                            }
                          </p>
                        </div>
                      </div>

                      {/* Ringkasan */}
                      <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 space-y-3">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Ringkasan Verifikasi</p>

                        {/* Biodata */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-600">Biodata Diri</span>
                            {biodataValid
                              ? <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle className="h-4 w-4" /> Terverifikasi</span>
                              : <span className="flex items-center gap-1 text-red-500 font-semibold"><X className="h-4 w-4" /> Tidak Terverifikasi</span>
                            }
                          </div>
                          {!biodataValid && biodataNotes && (
                            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                              {biodataNotes}
                            </p>
                          )}
                        </div>

                        {/* Dokumen */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-600">Foto Dokumen</span>
                            {dokumenValid
                              ? <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle className="h-4 w-4" /> Terverifikasi</span>
                              : <span className="flex items-center gap-1 text-red-500 font-semibold"><X className="h-4 w-4" /> Tidak Terverifikasi</span>
                            }
                          </div>
                          {!dokumenValid && dokumenNotes && (
                            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                              {dokumenNotes}
                            </p>
                          )}
                        </div>

                        {/* Status hasil */}
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-zinc-200 mt-1">
                          <span className="text-zinc-600">Status setelah diproses</span>
                          {biodataValid && dokumenValid
                            ? <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Aktif</span>
                            : <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">Ditolak</span>
                          }
                        </div>
                      </div>

                      {/* Info sesuai kondisi */}
                      {biodataValid && dokumenValid ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                          <p className="text-xs text-amber-700">
                            Setelah di-approve, akun traveler akan langsung <strong>aktif</strong> dan dapat login serta menerima order.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                          <p className="text-xs text-red-700">
                            Keterangan di atas akan dikirimkan sebagai alasan penolakan ke email pemohon. Pastikan keterangan sudah jelas.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 pt-3 border-t border-zinc-100 flex gap-2">
                  {verifyStep === 1 && (
                    <>
                      <Button variant="outline" onClick={closeVerifyDialog} className="flex-1">Batal</Button>
                      <Button
                        onClick={() => setVerifyStep(2)}
                        disabled={biodataValid === null || (biodataValid === false && !biodataNotes.trim())}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Lanjut ke Dokumen <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </>
                  )}
                  {verifyStep === 2 && (
                    <>
                      <Button variant="outline" onClick={() => setVerifyStep(1)} className="flex-1">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
                      </Button>
                      <Button
                        onClick={() => setVerifyStep(3)}
                        disabled={dokumenValid === null || (dokumenValid === false && !dokumenNotes.trim())}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Lanjut ke Konfirmasi <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </>
                  )}
                  {verifyStep === 3 && (
                    <>
                      <Button variant="outline" onClick={() => setVerifyStep(2)} className="flex-1">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
                      </Button>

                      {/* Tombol Tolak — hanya muncul jika ada yang tidak valid */}
                      {(!biodataValid || !dokumenValid) && (
                        <Button
                          variant="outline"
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          disabled={isApproving}
                          onClick={() => {
                            // Gabungkan keterangan dari step 1 dan 2
                            const combinedReason = [
                              !biodataValid && biodataNotes ? `Biodata: ${biodataNotes}` : "",
                              !dokumenValid && dokumenNotes ? `Dokumen: ${dokumenNotes}` : "",
                            ].filter(Boolean).join("\n");

                            const combinedSolution = [
                              !biodataValid ? "Perbaiki data biodata yang tidak sesuai dan daftarkan ulang." : "",
                              !dokumenValid ? "Unggah ulang foto dokumen yang jelas dan terbaca." : "",
                            ].filter(Boolean).join(" ");

                            closeVerifyDialog();
                            setRejectDialog(verifyRequest);
                            setRejectForm({
                              reason:   combinedReason,
                              solution: combinedSolution,
                            });
                          }}
                        >
                          <X className="h-4 w-4 mr-1.5" /> Tolak
                        </Button>
                      )}

                      {/* Tombol Approve — hanya muncul jika semua valid */}
                      {biodataValid && dokumenValid && (
                        <Button
                          onClick={() => handleApproveRequest(verifyRequest)}
                          disabled={isApproving}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {isApproving ? "Memproses..." : <><CheckCircle className="h-4 w-4 mr-1.5" /> Approve</>}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── REJECT TRAVELER DIALOG ── */}
        <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                  <X className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <DialogTitle>Tolak Pendaftaran</DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    Alasan penolakan dari hasil verifikasi untuk <strong>{rejectDialog?.name}</strong>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <FormField label="Alasan Penolakan" icon={X}>
                <textarea
                  value={rejectForm.reason}
                  readOnly                    
                  rows={3}
                  className="flex w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm resize-none cursor-not-allowed text-zinc-600"
                />
              </FormField>
              <FormField label="Solusi / Langkah Perbaikan" icon={CheckCircle}>
                <textarea
                  value={rejectForm.solution}
                  readOnly                    
                  rows={3}
                  className="flex w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm resize-none cursor-not-allowed text-zinc-600"
                />
              </FormField>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-700">
                  Alasan dan solusi ini diambil dari hasil verifikasi dan akan dikirim ke email <strong>{rejectDialog?.email}</strong> secara otomatis.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setRejectDialog(null)} className="flex-1">Batal</Button>
              <Button
                variant="destructive"
                onClick={handleRejectRequest}
                disabled={isRejecting || !rejectForm.reason.trim()}
                className="flex-1"
              >
                {isRejecting ? "Mengirim..." : "Tolak & Kirim Email"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── DELETE TRAVELER DIALOG ── */}
        <Dialog open={!!deleteTraveler} onOpenChange={() => setDeleteTraveler(null)}>
          <DialogContent className="max-w-sm">
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="h-7 w-7 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">Hapus Traveler?</h3>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Akun <span className="font-semibold text-zinc-800">{deleteTraveler?.name}</span> akan dihapus permanen.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteTraveler(null)} className="flex-1">Batal</Button>
              <Button variant="destructive" onClick={handleConfirmDelete} className="flex-1">Ya, Hapus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── DELETE REQUEST DIALOG ── */}
        <Dialog open={!!deleteRequest} onOpenChange={() => setDeleteRequest(null)}>
          <DialogContent className="max-w-sm">
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="h-7 w-7 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">Hapus Request?</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Request dari <span className="font-semibold text-zinc-800">{deleteRequest?.name}</span> akan dihapus permanen.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteRequest(null)} className="flex-1">Batal</Button>
              <Button variant="destructive" onClick={handleConfirmDeleteRequest} className="flex-1">Ya, Hapus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}

// ─── Micro components ──────────────────────────────────────────────────────────

function ActionBtn({
  icon: Icon, title, onClick, disabled, color,
}: {
  icon: React.ElementType; title: string; onClick?: () => void;
  disabled?: boolean; color?: "red" | "green" | "amber";
}) {
  const colorMap = {
    red: "hover:bg-red-50 hover:text-red-600",
    green: "hover:bg-emerald-50 hover:text-emerald-600",
    amber: "hover:bg-amber-50 hover:text-amber-600",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-all
        ${disabled ? "cursor-not-allowed opacity-30" : color ? colorMap[color] : "hover:bg-zinc-100 hover:text-zinc-800"}
      `}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}