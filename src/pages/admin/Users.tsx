import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Users, Eye, Pencil, Trash2, Ban, CheckCircle,
  X, UserPlus, Phone, Mail, Calendar, Activity, ShieldCheck,
  Home, User, RefreshCw,
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

type UserStatus = "active" | "inactive";
type UserRole   = "customer" | "admin";
type ReqStatus  = "pending" | "approved" | "rejected";

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  address: string | null;
  profile_photo: string | null;
  created_at: string;
}

interface UserRequest {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  requested_role: UserRole;
  status_requested: ReqStatus;
  created_at: string;
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

const roleColors: Record<UserRole, string> = {
  customer: "bg-blue-50 text-blue-700 border border-blue-100",
  admin:    "bg-red-50 text-red-700 border border-red-100",
};

// Helper Avatar
const BASE_URL = (api.defaults.baseURL ?? "http://localhost:8000/api").replace("/api", "");

function Avatar({ name, role, photo, size = "md" }: { name: string; role: UserRole; photo?: string | null; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const src = photo
    ? `${BASE_URL}/storage/${photo}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

  return (
    <img
      src={src}
      alt={name}
      className={`${sz} rounded-full object-cover bg-muted shrink-0`}
    />
  );
}

// Helper ID
function generateDisplayId(id: number): string {
  const hash = ((id * 2654435761) >>> 0) % 10000;
  return hash.toString().padStart(4, "0");
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
    <button type="button" onClick={onClick}
      className={`h-8 rounded-full px-4 text-xs font-semibold transition-all duration-150 border ${
        active ? "bg-primary text-primary-foreground border-primary shadow-sm"
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
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// Helper google request
const isGoogleRegistered = (r: UserRequest): boolean => {
  return !r.phone;
};

const mapStatus = (status: string): UserStatus =>
  status === "non_active" ? "inactive" : status as UserStatus;

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const { toast } = useToast();

  // ── Tab
  const [activeTab, setActiveTab] = useState<"users" | "requests">("users");
  const [pendingCount, setPendingCount] = useState(0);

  // ── Users state
  const [users, setUsers]           = useState<UserData[]>([]);
  const [usersMeta, setUsersMeta]   = useState({ total: 0, current_page: 1, last_page: 1 });
  const [loadingUsers, setLoadingUsers] = useState(false);

  // ── Requests state
  const [requests, setRequests]         = useState<UserRequest[]>([]);
  const [requestsMeta, setRequestsMeta] = useState({ total: 0, current_page: 1, last_page: 1 });
  const [loadingRequests, setLoadingRequests] = useState(false);

  // ── Filters
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reqStatusFilter, setReqStatusFilter] = useState("all");
  const [page, setPage]               = useState(1);

  // ── Dialogs
  const [detailUser, setDetailUser]     = useState<UserData | null>(null);
  const [editingUser, setEditingUser]   = useState<UserData | null>(null);
  const [deleteUser, setDeleteUser]     = useState<UserData | null>(null);
  const [suspendUser, setSuspendUser]   = useState<UserData | null>(null);
  const [addUserOpen, setAddUserOpen]   = useState(false);
  const [deleteRequest, setDeleteRequest] = useState<UserRequest | null>(null);

  // ── Verify dialog
  const [verifyRequest, setVerifyRequest] = useState<UserRequest | null>(null);
  const [verifyAction, setVerifyAction] = useState<"approve" | "reject" | null>(null);
  const [verifyNotes, setVerifyNotes] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "", password: "", role: "customer", address: "" });
  const [editForm, setEditForm] = useState({ name: "", phone: "", role: "customer", status: "active", address: "" });
  const [isSaving, setIsSaving] = useState(false);

  // ── Fetch Users ────────────────────────────────────
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const isIdSearch = /^\d+$/.test(search.trim());

      const params: Record<string, any> = { page };
      if (search && !isIdSearch) params.search = search;
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter === "inactive" ? "non_active" : statusFilter;

      const res = await api.get("/admin/users", { params });
      const pagination = res.data.data;
      const raw = pagination.data ?? pagination;

      let mapped = (Array.isArray(raw) ? raw : []).map((u: any) => ({
        ...u,
        status: mapStatus(u.status),
      }));

      // Filter by display ID 
      if (isIdSearch && search.trim()) {
        mapped = mapped.filter((u: UserData) =>
          generateDisplayId(u.id).includes(search.trim())
        );
      }

      setUsers(mapped);
      setUsersMeta({
        total:        isIdSearch ? mapped.length : (pagination.total ?? 0),
        current_page: pagination.current_page ?? 1,
        last_page:    pagination.last_page    ?? 1,
      });

      const pendingRes = await api.get("/admin/user-requests", {
        params: { status: "pending", page: 1 }
      });
      setPendingCount(pendingRes.data.data?.total ?? 0);
    } catch {
      toast({ title: "Gagal memuat data pengguna", variant: "destructive" });
    } finally {
      setLoadingUsers(false);
    }
  };

  // ── Fetch Requests ─────────────────────────────────
  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const params: Record<string, any> = { page };
      if (search) params.search = search;
      if (reqStatusFilter !== "all") params.status = reqStatusFilter;

      const res = await api.get("/admin/user-requests", { params });
      const pagination = res.data.data;
      const raw = pagination.data ?? pagination;

      setRequests(Array.isArray(raw) ? raw : []);
      setRequestsMeta({
        total:        pagination.total        ?? 0,
        current_page: pagination.current_page ?? 1,
        last_page:    pagination.last_page    ?? 1,
      });

      const pendingRes = await api.get("/admin/user-requests", {
        params: { status: "pending", page: 1 }
      });
      setPendingCount(pendingRes.data.data?.total ?? 0);
    } catch {
      toast({ title: "Gagal memuat permintaan data", variant: "destructive" });
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter, reqStatusFilter, activeTab]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    else fetchRequests();
  }, [activeTab, page, search, roleFilter, statusFilter, reqStatusFilter]);

  // ── Handlers: Users ────────────────────────────────

  const handleAddUser = async () => {
    setIsSaving(true);
    try {
      await api.post("/admin/users", {
        name:     addForm.name,
        email:    addForm.email,
        phone:    addForm.phone,
        password: addForm.password,
        role:     addForm.role,
        address:  addForm.address || null,
      });
      toast({ title: "Pengguna Ditambahkan", description: `${addForm.name} berhasil ditambahkan.` });
      setAddUserOpen(false);
      setAddForm({ name: "", email: "", phone: "", password: "", role: "customer", address: "" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: err.response?.data?.message ?? "Gagal menambah pengguna", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (u: UserData) => {
    setEditingUser(u);
    setEditForm({
      name:    u.name,
      phone:   u.phone ?? "",
      role:    u.role,
      status:  u.status,
      address: u.address ?? "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        name:    editForm.name,
        phone:   editForm.phone,
        role:    editForm.role,
        status:  editForm.status === "inactive" ? "non_active" : editForm.status, // convert status to backend
        address: editForm.address || null,
      });
      toast({ title: "Data Diperbarui", description: `Data ${editingUser.name} berhasil diperbarui.` });
      fetchUsers();
      setEditingUser(null);
    } catch (err: any) {
      toast({ title: err.response?.data?.message ?? "Gagal menyimpan", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (u: UserData, status: string) => {
    try {
      await api.patch(`/admin/users/${u.id}/status`, { status });
      toast({ title: status === "active" ? "User Diaktifkan" : "User Disuspend" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: err.response?.data?.message ?? "Gagal ubah status", variant: "destructive" });
    } finally {
      setSuspendUser(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;
    try {
      await api.delete(`/admin/users/${deleteUser.id}`);
      toast({ title: "Pengguna dihapus", description: `${deleteUser.name} berhasil dihapus.` });
      fetchUsers();
    } catch (err: any) {
      toast({ title: err.response?.data?.message ?? "Gagal menghapus", variant: "destructive" });
    } finally {
      setDeleteUser(null);
    }
  };

  // ── Handlers: Requests ─────────────────────────────

  const handleConfirmDeleteRequest = async () => {
    if (!deleteRequest) return;
    try {
      await api.delete(`/admin/user-requests/${deleteRequest.id}`);
      toast({ title: "Permintaan Dihapus" });
      fetchRequests();
    } catch (err: any) {
      toast({ title: err.response?.data?.message ?? "Gagal menghapus", variant: "destructive" });
    } finally {
      setDeleteRequest(null);
    }
  };

  // Handle verify 
  const handleVerifyApprove = async () => {
    if (!verifyRequest) return;
    const isGoogle = isGoogleRegistered(verifyRequest);
    if (isGoogle && !verifyNotes.trim()) return;

    setIsVerifying(true);
    try {
      await api.post(`/admin/user-requests/${verifyRequest.id}/approve`);
      toast({ title: "Permintaan Disetujui", description: `${verifyRequest.name} berhasil di-approve.` });
      fetchRequests();
      setVerifyRequest(null);
      setVerifyAction(null);
      setVerifyNotes("");
    } catch (err: any) {
      toast({ title: err.response?.data?.message ?? "Gagal disetujui", variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyReject = async () => {
    if (!verifyRequest || !verifyNotes.trim()) return;

    setIsVerifying(true);
    try {
      await api.patch(`/admin/user-requests/${verifyRequest.id}/reject`);
      toast({ title: "Permintaan Ditolak", description: `${verifyRequest.name} ditolak.` });
      fetchRequests();
      setVerifyRequest(null);
      setVerifyAction(null);
      setVerifyNotes("");
    } catch (err: any) {
      toast({ title: err.response?.data?.message ?? "Gagal menolak", variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-6 md:p-8 lg:p-10 space-y-6">

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Manajemen Pengguna</h1>
              <p className="text-sm text-muted-foreground">Monitoring dan kontrol akun pengguna</p>
            </div>
          </div>
          {activeTab === "users" && (
            <Button onClick={() => setAddUserOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" /> Tambah Pengguna
            </Button>
          )}
        </div>

        {/* TAB */}
        <div className="flex gap-1 p-1 rounded-full border border-border bg-muted w-fit">
          {(["users", "requests"] as const).map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSearch(""); }}
              className={`relative px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "users" ? "Daftar User" : "Permintaan Daftar"}

              {tab === "requests" && pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* FILTER */}
        <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input placeholder="Cari nama atau email, atau ID..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {activeTab === "users" && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-1.5 flex-1">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Role</p>
                <div className="flex flex-wrap gap-2">
                  {[["all","Semua"],["customer","Customer"],["admin","Admin"]].map(([v,l]) => (
                    <FilterChip key={v} label={l} active={roleFilter === v} onClick={() => setRoleFilter(v)} />
                  ))}
                </div>
              </div>
              <div className="hidden sm:block w-px bg-zinc-100" />
              <div className="space-y-1.5 flex-1">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Status</p>
                <div className="flex flex-wrap gap-2">
                  {[["all","Semua"],["active","Aktif"],["inactive","Non-aktif"]].map(([v,l]) => (
                    <FilterChip key={v} label={l} active={statusFilter === v} onClick={() => setStatusFilter(v)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Status</p>
              <div className="flex flex-wrap gap-2">
                {[["all","Semua"],["pending","Pending"],["approved","Disetujui"],["rejected","Ditolak"]].map(([v,l]) => (
                  <FilterChip key={v} label={l} active={reqStatusFilter === v} onClick={() => setReqStatusFilter(v)} />
                ))}
              </div>
            </div>
          )}

          <button onClick={() => activeTab === "users" ? fetchUsers() : fetchRequests()}
            className="h-8 rounded-full px-3 text-xs font-semibold border border-zinc-200 text-zinc-500 hover:bg-zinc-50 flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {/* ── TAB: USERS ── */}
        {activeTab === "users" && (
          <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
              <p className="text-xs font-medium text-zinc-500">
                Total <span className="text-zinc-900 font-bold">{usersMeta.total}</span> pengguna
              </p>
            </div>

            {loadingUsers ? (
              <div className="p-10 text-center text-muted-foreground animate-pulse">Memuat data...</div>
            ) : users.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px]">
                    <thead>
                      <tr className="border-b border-zinc-100">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[32%]">Pengguna</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[12%]">Role</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[13%]">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[14%]">Bergabung</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[18%]">Aksi</th>
                      </tr>
                    </thead>
                    <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
                      {users.map((u) => (
                        <motion.tr key={u.id} variants={staggerItem} className="border-b border-zinc-50 hover:bg-zinc-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={u.name} role={u.role} photo={u.profile_photo} size="sm" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 truncate">{u.name}</p>
                                <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleColors[u.role]}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex justify-center">
                              <StatusBadge status={u.status} size="sm" />
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center text-xs text-zinc-500">{formatDate(u.created_at)}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex justify-center gap-1">
                              <ActionBtn icon={Eye} title="Detail" onClick={() => setDetailUser(u)} />
                              <ActionBtn icon={Pencil} title="Edit" onClick={() => handleEditClick(u)} />
                              {u.status === "active" ? (
                                <ActionBtn icon={Ban} title={u.role === "admin" ? "Admin tidak bisa di-suspend" : "Suspend"}
                                  disabled={u.role === "admin"} color="amber" onClick={() => setSuspendUser(u)} />
                              ) : (
                                <ActionBtn icon={CheckCircle} title="Aktifkan" color="green"
                                  onClick={() => handleUpdateStatus(u, "active")} />
                              )}
                              <ActionBtn icon={Trash2} title="Hapus" color="red" onClick={() => setDeleteUser(u)} />
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
                {usersMeta.last_page > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
                    <span className="text-xs text-zinc-500"> Halaman <span className="font-semibold text-zinc-900">{page}</span> dari{" "}
                      <span className="font-semibold text-zinc-900">{usersMeta.last_page}</span>
                    </span>
                    <Button variant="outline" size="sm" disabled={page === usersMeta.last_page} onClick={() => setPage(p => p + 1)}>Berikutnya</Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState icon={Users} title="Tidak ada user ditemukan" description="Coba ubah filter pencarian Anda" />
            )}
          </div>
        )}

        {/* ── TAB: REQUESTS ── */}
        {activeTab === "requests" && (
          <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
              <p className="text-xs font-medium text-zinc-500">
                Total <span className="text-zinc-900 font-bold">{requestsMeta.total}</span> permintaan
              </p>
            </div>

            {loadingRequests ? (
              <div className="p-10 text-center text-muted-foreground animate-pulse">Memuat data...</div>
            ) : requests.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-zinc-100">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[32%]">Pemohon</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[12%]">Role</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[13%]">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[14%]">Tanggal Daftar</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide w-[18%]">Aksi</th>
                      </tr>
                    </thead>
                    <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
                      {requests.map((r) => (
                        <motion.tr key={r.id} variants={staggerItem} className="border-b border-zinc-50 hover:bg-zinc-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={r.name} role={r.requested_role} size="sm" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 truncate">{r.name}</p>
                                <p className="text-xs text-zinc-400 truncate">{r.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleColors[r.requested_role]}`}>
                              {r.requested_role}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                                r.status_requested === "pending"  ? "bg-amber-50 text-amber-700 border-amber-100"
                                : r.status_requested === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-red-50 text-red-600 border-red-100"
                              }`}>
                                {r.status_requested === "pending" ? "Pending" : r.status_requested === "approved" ? "Disetujui" : "Ditolak"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center text-xs text-zinc-500">{formatDate(r.created_at)}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex justify-center gap-1">
                              {r.status_requested === "pending" && (
                                <button
                                  onClick={() => { setVerifyRequest(r); setVerifyAction(null); setVerifyNotes(""); }}
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
              <EmptyState icon={Users} title="Tidak ada permintaan ditemukan" description="Coba ubah filter pencarian Anda" />
            )}
          </div>
        )}

        {/* ── DETAIL USER DIALOG ── */}
        <Dialog open={!!detailUser} onOpenChange={() => setDetailUser(null)}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            {detailUser && (
              <>
                <div className="px-6 pt-6 pb-4" style={{ background: detailUser.role === "admin" ? "rgb(245,243,255)" : "rgb(239,246,255)" }}>
                  <div className="flex items-center gap-4">
                    <Avatar name={detailUser.name} role={detailUser.role} photo={detailUser.profile_photo} size="lg" />
                    <div>
                      <h3 className="font-bold text-zinc-900 text-lg">{detailUser.name}</h3>
                      <p className="text-sm text-zinc-500">{detailUser.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleColors[detailUser.role]}`}>
                          {detailUser.role}
                        </span>
                        <StatusBadge status={detailUser.status} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow icon={Phone}       label="Telepon"   value={detailUser.phone ?? "-"} />
                    <InfoRow icon={Calendar}    label="Bergabung" value={formatDate(detailUser.created_at)} />
                    <InfoRow icon={Home}        label="Alamat"    value={detailUser.address ?? "-"} />
                    <InfoRow icon={ShieldCheck} label="ID User" value={`${generateDisplayId(detailUser.id)}`} />
                  </div>
                </div>
                <DialogFooter className="px-6 pb-5">
                  <Button variant="outline" className="w-full" onClick={() => setDetailUser(null)}>Tutup</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── ADD USER DIALOG ── */}
        <Dialog open={addUserOpen} onOpenChange={() => setAddUserOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">Isi data lengkap pengguna baru</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <FormField label="Nama Lengkap" icon={User}>
                <Input placeholder="Nama lengkap" value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="h-10 rounded-xl border-zinc-200" />
              </FormField>
              <FormField label="Email" icon={Mail}>
                <Input type="email" placeholder="contoh@email.com" value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="h-10 rounded-xl border-zinc-200" />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="No. Telepon" icon={Phone}>
                  <Input placeholder="08xxxxxxxxxx" value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="h-10 rounded-xl border-zinc-200" />
                </FormField>
                <FormField label="Role" icon={ShieldCheck}>
                  <Select value={addForm.role} onValueChange={(v) => setAddForm({ ...addForm, role: v })}>
                    <SelectTrigger className="h-10 rounded-xl border-zinc-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <FormField label="Password" icon={ShieldCheck}>
                <Input type="password" placeholder="Min. 8 karakter" value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="h-10 rounded-xl border-zinc-200" />
              </FormField>
              <FormField label="Alamat" icon={Home}>
                <Input placeholder="Alamat lengkap (opsional)" value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  className="h-10 rounded-xl border-zinc-200" />
              </FormField>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setAddUserOpen(false)} className="flex-1">Batal</Button>
              <Button onClick={handleAddUser} className="flex-1" disabled={isSaving || !addForm.name || !addForm.email || !addForm.phone || !addForm.password}>
                {isSaving ? "Menyimpan..." : "Tambah User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── EDIT USER DIALOG ── */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <Pencil className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <DialogTitle>Edit Pengguna</DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">Perbarui data pengguna</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-3 rounded-xl bg-zinc-50 border border-zinc-100 p-3">
                  <Avatar name={editingUser.name} role={editingUser.role} photo={editingUser.profile_photo} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{editingUser.name}</p>
                    <p className="text-xs text-zinc-400">{editingUser.email}</p>
                  </div>
                </div>
                <FormField label="Nama Lengkap" icon={User}>
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="h-10 rounded-xl border-zinc-200" />
                </FormField>
                <FormField label="Email" icon={Mail}>
                  <Input value={editingUser.email} disabled
                    className="h-10 rounded-xl border-zinc-200 bg-zinc-50 cursor-not-allowed text-zinc-400" />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="No. Telepon" icon={Phone}>
                    <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="h-10 rounded-xl border-zinc-200" />
                  </FormField>
                  <FormField label="Role" icon={ShieldCheck}>
                    <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                      <SelectTrigger className="h-10 rounded-xl border-zinc-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
                <FormField label="Status" icon={Activity}>
                  <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                    <SelectTrigger className="h-10 rounded-xl border-zinc-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Non-aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Alamat" icon={Home}>
                  <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="h-10 rounded-xl border-zinc-200" />
                </FormField>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">Batal</Button>
              <Button onClick={handleSaveEdit} disabled={isSaving} className="flex-1">
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── SUSPEND DIALOG ── */}
        <Dialog open={!!suspendUser} onOpenChange={() => setSuspendUser(null)}>
          <DialogContent className="max-w-sm">
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                <Ban className="h-7 w-7 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">Suspend Pengguna?</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Akun <span className="font-semibold text-zinc-800">{suspendUser?.name}</span> akan dinonaktifkan.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSuspendUser(null)} className="flex-1">Batal</Button>
              <Button onClick={() => suspendUser && handleUpdateStatus(suspendUser, "non_active")}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
                Ya, Suspend
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── DELETE USER DIALOG ── */}
        <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
          <DialogContent className="max-w-sm">
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="h-7 w-7 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">Hapus Pengguna?</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Akun <span className="font-semibold text-zinc-800">{deleteUser?.name}</span> akan dihapus permanen.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteUser(null)} className="flex-1">Batal</Button>
              <Button variant="destructive" onClick={handleConfirmDelete} className="flex-1">Ya, Hapus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── VERIFY REQUEST DIALOG ── */}
        <Dialog open={!!verifyRequest} onOpenChange={() => {
          setVerifyRequest(null);
          setVerifyAction(null);
          setVerifyNotes("");
        }}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            {verifyRequest && (() => {
              const isGoogle = isGoogleRegistered(verifyRequest);
              return (
                <>
                  {/* Header */}
                  <div className="px-6 pt-6 pb-4 bg-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900">Verifikasi Pendaftaran</h3>
                        <p className="text-xs text-zinc-500">{verifyRequest.name} · {verifyRequest.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* Biodata */}
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Biodata Diri</p>
                      <div className="grid grid-cols-2 gap-3">
                        <InfoRow icon={User} label="Nama Lengkap" value={verifyRequest.name} />
                        <InfoRow icon={Mail} label="Email" value={verifyRequest.email} />
                        <InfoRow icon={Phone} label="Telepon" value={verifyRequest.phone ?? "Belum diisi"} />
                        <InfoRow icon={ShieldCheck} label="Role" value={verifyRequest.requested_role} />
                        <InfoRow icon={Calendar} label="Tanggal Daftar" value={formatDate(verifyRequest.created_at)} />
                      </div>
                    </div>

                    {/* Metode Pendaftaran */}
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Metode Pendaftaran</p>
                      {isGoogle ? (
                        <div className="flex items-center gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 p-3.5">
                          <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <div>
                            <p className="text-sm font-semibold text-blue-700">Daftar dengan Google</p>
                            <p className="text-xs text-blue-600 mt-0.5">Nomor telepon belum tersedia, wajib dilengkapi saat approve</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3.5">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 shrink-0">
                            <User className="h-3.5 w-3.5 text-emerald-700" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-emerald-700">Daftar Manual</p>
                            <p className="text-xs text-emerald-600 mt-0.5">Data lengkap telah diisi oleh pengguna</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Section */}
                    {!verifyAction && (
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => setVerifyAction("approve")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1.5" /> Setujui
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setVerifyAction("reject")}
                        >
                          <X className="h-4 w-4 mr-1.5" /> Tolak
                        </Button>
                      </div>
                    )}

                    {/* Approve Form */}
                    {verifyAction === "approve" && (
                      <div className="space-y-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <p className="text-sm font-semibold text-emerald-700">Setujui Pendaftaran</p>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                            Catatan {isGoogle ? "*" : "(opsional)"}
                          </label>
                          <textarea
                            value={verifyNotes}
                            onChange={(e) => setVerifyNotes(e.target.value)}
                            rows={3}
                            placeholder={isGoogle
                              ? "Wajib diisi — contoh: Nomor HP pengguna 08xxxxxxxxxx"
                              : "Opsional — tambahkan catatan jika diperlukan"
                            }
                            className="flex w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 resize-none"
                          />
                          {isGoogle && (
                            <p className="text-xs text-emerald-600">Wajib diisi karena nomor HP belum tersedia dari pendaftaran Google</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => { setVerifyAction(null); setVerifyNotes(""); }}>
                            Kembali
                          </Button>
                          <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={isVerifying || (isGoogle && !verifyNotes.trim())}
                            onClick={handleVerifyApprove}
                          >
                            {isVerifying ? "Memproses..." : "Konfirmasi Setujui"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Reject Form */}
                    {verifyAction === "reject" && (
                      <div className="space-y-3 rounded-xl border-2 border-red-200 bg-red-50 p-4">
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4 text-red-500" />
                          <p className="text-sm font-semibold text-red-600">Tolak Pendaftaran</p>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                            Alasan Penolakan *
                          </label>
                          <textarea
                            value={verifyNotes}
                            onChange={(e) => setVerifyNotes(e.target.value)}
                            rows={3}
                            placeholder="Wajib diisi — contoh: Data tidak valid, email mencurigakan..."
                            className="flex w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 resize-none"
                          />
                          <p className="text-xs text-red-500">Wajib diisi sebagai alasan penolakan</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => { setVerifyAction(null); setVerifyNotes(""); }}>
                            Kembali
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            disabled={isVerifying || !verifyNotes.trim()}
                            onClick={handleVerifyReject}
                          >
                            {isVerifying ? "Memproses..." : "Konfirmasi Tolak"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
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
                <h3 className="font-bold text-zinc-900 text-lg">Hapus Permintaan?</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Permintaan dari <span className="font-semibold text-zinc-800">{deleteRequest?.name}</span> akan dihapus permanen.
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

function ActionBtn({ icon: Icon, title, onClick, disabled, color }: {
  icon: React.ElementType; title: string; onClick?: () => void;
  disabled?: boolean; color?: "red" | "green" | "amber";
}) {
  const colorMap = {
    red:   "hover:bg-red-50 hover:text-red-600",
    green: "hover:bg-emerald-50 hover:text-emerald-600",
    amber: "hover:bg-amber-50 hover:text-amber-600",
  };
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-all
        ${disabled ? "cursor-not-allowed opacity-30" : color ? colorMap[color] : "hover:bg-zinc-100 hover:text-zinc-800"}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}