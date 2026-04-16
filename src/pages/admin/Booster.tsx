import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, TrendingUp, Zap, Search, Eye, Ban, CheckCircle,
  Clock, Star, ChevronDown, ChevronUp, Package, AlertCircle,
  Crown, ShieldCheck, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Plus, Edit2, Save, XCircle, Hash, Calendar, Layers,
  ToggleLeft, ToggleRight, LoaderPinwheel, FileText,
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

const BASE_URL = "http://localhost:8000";

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; dot: string }> = {
    active:    { label: "Aktif",    bg: "bg-green-100 text-green-700 border border-green-200",  dot: "bg-green-500"  },
    expired:   { label: "Expired",  bg: "bg-amber-100 text-amber-700 border border-amber-200",  dot: "bg-amber-500"  },
    suspended: { label: "Diblokir", bg: "bg-red-100 text-red-700 border border-red-200",        dot: "bg-red-500"    },
  };
  const s = map[status] ?? map.expired;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ stat, index }: { stat: any; index: number }) {
  const colorMap: Record<string, any> = {
    primary: { bg: "from-green-50 to-emerald-50",  icon: "bg-green-100 text-green-600",   badge: "bg-green-100 text-green-700"   },
    accent:  { bg: "from-orange-50 to-amber-50",   icon: "bg-orange-100 text-orange-500", badge: "bg-orange-100 text-orange-700" },
    success: { bg: "from-teal-50 to-cyan-50",      icon: "bg-teal-100 text-teal-600",     badge: "bg-teal-100 text-teal-700"     },
    warning: { bg: "from-yellow-50 to-orange-50",  icon: "bg-yellow-100 text-yellow-600", badge: "bg-yellow-100 text-yellow-700" },
  };
  const c = colorMap[stat.color];
  const isPos = stat.change > 0;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
      className={`bg-gradient-to-br rounded-2xl p-5 border border-border shadow-card hover:shadow-card-hover transition-all group ${c.bg}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform ${c.icon}`}>
          <stat.icon className="h-5 w-5" />
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.badge}`}>
          {isPos ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(stat.change)}%
        </span>
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
      <p className="text-sm text-muted-foreground">{stat.label}</p>
    </motion.div>
  );
}

// ─── PlanEditorCard ───────────────────────────────────────────────────────────

function PlanEditorCard({ plan, index, onSave }: { plan: any; index: number; onSave: (p: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({ ...plan });
  const [saved, setSaved]     = useState(false);

  const handleSave   = () => { onSave(draft); setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleCancel = () => { setDraft({ ...plan }); setEditing(false); };

  const Field = ({ label, icon: Icon, field, type = "text", prefix = "", suffix = "" }: any) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon className="h-3 w-3" />{label}
      </label>
      {editing ? (
        <div className="flex items-center gap-1.5">
          {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
          <input type={type} value={draft[field]}
            onChange={e => setDraft((p: any) => ({ ...p, [field]: type === "number" ? Number(e.target.value) : e.target.value }))}
            className="flex-1 px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 w-full" />
          {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
        </div>
      ) : (
        <p className="text-sm font-semibold text-foreground">
          {prefix}{typeof plan[field] === "number" ? plan[field].toLocaleString("id-ID") : plan[field]}{suffix}
        </p>
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.08 }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all">
      <div className="h-1.5 w-full" style={{ backgroundColor: plan.color }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl" style={{ backgroundColor: plan.color + "22" }}>
              <Rocket className="h-4 w-4" style={{ color: plan.color }} />
            </div>
            <div>
              {editing ? (
                <input type="text" value={draft.name}
                  onChange={e => setDraft((p: any) => ({ ...p, name: e.target.value }))}
                  className="text-base font-bold bg-background border border-border rounded-lg px-2 py-0.5 text-foreground focus:outline-none w-36" />
              ) : (
                <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">{plan.count} pengguna aktif</p>
            </div>
          </div>
          <button onClick={() => onSave({ ...plan, active: !plan.active })}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: plan.active ? plan.color : undefined }}>
            {plan.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
            <span className={plan.active ? "" : "text-muted-foreground"}>{plan.active ? "Aktif" : "Nonaktif"}</span>
          </button>
        </div>

        {editing ? (
          <textarea value={draft.description}
            onChange={e => setDraft((p: any) => ({ ...p, description: e.target.value }))}
            rows={2} className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none resize-none mb-4" />
        ) : (
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{plan.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Harga"      icon={Hash}     field="price"    type="number" prefix="Rp " />
          <Field label="Durasi"     icon={Calendar} field="duration" type="number" suffix=" hari" />
          <Field label="Maks. Slot" icon={Layers}   field="slots"    type="number" suffix=" slot" />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1"><Crown className="h-3 w-3" />Pengguna Aktif</label>
            <p className="text-sm font-semibold text-foreground">{plan.count}</p>
          </div>
        </div>

        <div className="border-t border-border mb-4" />
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: plan.color }}>
                <Save className="h-3.5 w-3.5" /> Simpan
              </button>
              <button onClick={handleCancel}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-muted text-muted-foreground hover:bg-muted/80">
                <XCircle className="h-3.5 w-3.5" /> Batal
              </button>
            </>
          ) : (
            <button onClick={() => { setDraft({ ...plan }); setEditing(true); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border hover:bg-muted transition-colors"
              style={{ borderColor: plan.color + "55", color: plan.color }}>
              <Edit2 className="h-3.5 w-3.5" />
              {saved ? "Tersimpan ✓" : "Edit Paket"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── DetailModal ──────────────────────────────────────────────────────────────

function DetailModal({ traveler, onClose, onSuspend, onActivate }: any) {
  if (!traveler) return null;
  const progress = Math.max(0, Math.min(100, (traveler.daysLeft / 30) * 100));
  return (
    <Dialog open={!!traveler} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
        {/* Color top bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: traveler.planColor }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <img src={traveler.avatar} alt={traveler.name} className="h-12 w-12 rounded-full bg-muted ring-2 ring-border object-cover" />
              <div>
                <h3 className="font-bold text-foreground">{traveler.name}</h3>
                <p className="text-xs text-muted-foreground">{traveler.phone}</p>
              </div>
            </div>
            <StatusBadge status={traveler.status} />
          </div>

          <div className="space-y-2">
            {[
              { label: "Paket Booster",  value: <span className="font-semibold text-sm" style={{ color: traveler.planColor }}>{traveler.plan}</span> },
              { label: "Bergabung",      value: <span className="text-sm font-medium text-foreground">{traveler.joinDate}</span> },
              { label: "Periode",        value: <span className="text-sm font-medium text-foreground">{traveler.startDate} s/d {traveler.endDate}</span> },
              { label: "Order Didapat",  value: <span className="text-sm font-semibold text-foreground">{traveler.ordersGained} order</span> },
              { label: "Rating",         value: (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                  {traveler.rating > 0 ? traveler.rating : <span className="text-muted-foreground">Belum ada</span>}
                </span>
              )},
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-xl">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                {row.value}
              </div>
            ))}
            <div className="px-3 py-2.5 bg-muted/50 rounded-xl">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Sisa Waktu Booster</span>
                <span className="font-semibold text-foreground">{traveler.daysLeft} hari</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full" style={{ backgroundColor: traveler.planColor }} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            {traveler.status === "active" && (
              <button onClick={() => { onSuspend(traveler.id); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-100 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-200 transition-colors">
                <Ban className="h-4 w-4" /> Suspend
              </button>
            )}
            {traveler.status === "suspended" && (
              <button onClick={() => { onActivate(traveler.id); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-100 text-green-600 rounded-xl text-sm font-semibold hover:bg-green-200 transition-colors">
                <CheckCircle className="h-4 w-4" /> Aktifkan
              </button>
            )}
            <button onClick={onClose}
              className="flex-1 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors">
              Tutup
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Preset colors ────────────────────────────────────────────────────────────

const PRESET_COLORS = ["#22c55e", "#f97316", "#8b5cf6", "#3b82f6", "#ef4444", "#f59e0b"];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BoosterMonitoringPage() {
  const { toast } = useToast();

  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter]     = useState("all");
  const [selectedTraveler, setSelectedTraveler] = useState<any>(null);
  const [sortBy, setSortBy]             = useState("daysLeft");
  const [sortDir, setSortDir]           = useState<"asc" | "desc">("asc");
  const [currentTime, setCurrentTime]   = useState(new Date());

  const [data, setData]                 = useState<any[]>([]);
  const [boosterPlans, setBoosterPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingData, setLoadingData]   = useState(true);

  // ── Add plan dialog state ─────────────────────────────────────────────────
  const [showAdd, setShowAdd]   = useState(false);
  const [adding, setAdding]     = useState(false);
  const [newPlan, setNewPlan]   = useState({
    name: "", price: 0, duration: 7, slots: 5,
    priority: 1, color: "#22c55e", description: "", active: true,
  });

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await api.get("/admin/boosters");
      setBoosterPlans((res.data.data ?? []).map((b: any) => ({
        id: b.id, name: b.name, price: Number(b.price), duration: b.duration,
        slots: b.slots, color: b.color ?? "#22c55e",
        count: b.traveler_boosters_count ?? 0, active: b.active, description: b.description ?? "",
      })));
    } catch { toast({ title: "Gagal memuat paket booster", variant: "destructive" }); }
    finally { setLoadingPlans(false); }
  };

  const fetchMonitoring = async () => {
    setLoadingData(true);
    try {
      const res = await api.get("/admin/boosters/monitoring");
      const raw = res.data.data?.data ?? res.data.data ?? [];
      setData(raw.map((tb: any) => ({
        id:           tb.id,
        name:         tb.traveler?.name ?? "Unknown",
        avatar:       tb.traveler?.photo
          ? `${BASE_URL}/storage/${tb.traveler.photo}`
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tb.traveler?.name ?? "user")}`,
        plan:         tb.plan,
        planColor:    tb.plan_color ?? "#22c55e",
        status:       tb.status,
        startDate:    tb.start_date,
        endDate:      tb.end_date,
        ordersGained: tb.orders_gained ?? 0,
        rating:       tb.traveler?.rating ?? 0,
        daysLeft:     tb.days_left ?? 0,
        phone:        tb.traveler?.phone ?? "-",
        joinDate:     tb.traveler?.created_at
          ? new Date(tb.traveler.created_at).toLocaleDateString("id-ID")
          : "-",
      })));
    } catch { toast({ title: "Gagal memuat data monitoring", variant: "destructive" }); }
    finally { setLoadingData(false); }
  };

  const handleCreatePlan = async () => {
    if (!newPlan.name || !newPlan.price) return;
    setAdding(true);
    try {
      await api.post("/admin/boosters", newPlan);
      toast({ title: "Paket booster berhasil dibuat" });
      setShowAdd(false);
      setNewPlan({ name: "", price: 0, duration: 7, slots: 5, priority: 1, color: "#22c55e", description: "", active: true });
      fetchPlans();
    } catch { toast({ title: "Gagal membuat paket", variant: "destructive" }); }
    finally { setAdding(false); }
  };

  const handlePlanSave = async (updatedPlan: any) => {
    try {
      if ("active" in updatedPlan && Object.keys(updatedPlan).length <= 2) {
        await api.patch(`/admin/boosters/${updatedPlan.id}/toggle`);
      } else {
        await api.put(`/admin/boosters/${updatedPlan.id}`, {
          name: updatedPlan.name, price: updatedPlan.price,
          duration: updatedPlan.duration, slots: updatedPlan.slots,
          color: updatedPlan.color, description: updatedPlan.description, active: updatedPlan.active,
        });
      }
      toast({ title: "Paket berhasil diperbarui" });
      fetchPlans();
    } catch { toast({ title: "Gagal memperbarui paket", variant: "destructive" }); }
  };

  const handleSuspend = async (id: string) => {
    try {
      await api.patch(`/admin/boosters/traveler/${id}/status`, { status: "suspended" });
      setData(prev => prev.map(t => t.id === id ? { ...t, status: "suspended" } : t));
      toast({ title: "Booster berhasil disuspend" });
    } catch { toast({ title: "Gagal suspend", variant: "destructive" }); }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.patch(`/admin/boosters/traveler/${id}/status`, { status: "active" });
      setData(prev => prev.map(t => t.id === id ? { ...t, status: "active" } : t));
      toast({ title: "Booster berhasil diaktifkan" });
    } catch { toast({ title: "Gagal mengaktifkan", variant: "destructive" }); }
  };

  useEffect(() => { fetchPlans(); fetchMonitoring(); }, []);
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Filter & sort ─────────────────────────────────────────────────────────

  const filtered = data
    .filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchPlan   = planFilter === "all" || t.plan === planFilter;
      return matchSearch && matchStatus && matchPlan;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === "daysLeft")     cmp = a.daysLeft - b.daysLeft;
      if (sortBy === "ordersGained") cmp = b.ordersGained - a.ordersGained;
      if (sortBy === "rating")       cmp = b.rating - a.rating;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const nearExpiry = filtered.filter(t => t.status === "active" && t.daysLeft <= 5);

  const boosterStats = [
    { id: 1, label: "Booster Aktif",      value: data.filter(t => t.status === "active").length,  change: +12, icon: Rocket,    color: "primary" },
    { id: 2, label: "Total Booster",      value: data.length,                                      change: +8,  icon: Zap,       color: "accent"  },
    { id: 3, label: "Pendapatan Booster", value: "Rp " + (boosterPlans.reduce((s, p) => s + (p.count ?? 0) * Number(p.price), 0) / 1_000_000).toFixed(1) + "Jt", change: +18, icon: TrendingUp, color: "success" },
    { id: 4, label: "Expired",            value: data.filter(t => t.status === "expired").length,  change: -3,  icon: Clock,     color: "warning" },
  ];

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return null;
    return sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />;
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-4 lg:p-6 space-y-6">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-primary rounded-xl shadow-button shrink-0">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground leading-tight">Booster Monitoring</h1>
              <p className="text-sm text-muted-foreground">Pantau dan kelola traveler pengguna booster</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Live Update</p>
              <p className="text-sm font-mono font-semibold text-foreground tabular-nums">
                {currentTime.toLocaleTimeString("id-ID")}
              </p>
            </div>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="p-2 bg-primary/10 rounded-xl">
              <LoaderPinwheel className="h-5 w-5 text-primary" />
            </motion.div>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {boosterStats.map((s, i) => <StatCard key={s.id} stat={s} index={i} />)}
        </div>

        {/* ── Paket Manager ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-foreground">Manajemen Paket Booster</h2>
              <p className="text-xs text-muted-foreground">Atur harga, durasi, dan slot order</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground px-2.5 py-1 bg-muted rounded-full">
                {boosterPlans.filter(p => p.active).length}/{boosterPlans.length} aktif
              </span>
              <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" /> Tambah Paket
              </Button>
            </div>
          </div>
          {loadingPlans ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {boosterPlans.map((plan, i) => (
                <PlanEditorCard key={plan.id} plan={plan} index={i} onSave={handlePlanSave} />
              ))}
            </div>
          )}
        </div>

        {/* ── Tabel ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Cari nama traveler..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "active", "expired", "suspended"].map(f => (
                  <button key={f} onClick={() => setStatusFilter(f)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${statusFilter === f ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/30"}`}>
                    {f === "all" ? "Semua" : f === "active" ? "Aktif" : f === "expired" ? "Expired" : "Diblokir"}
                  </button>
                ))}
                <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
                  className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm text-foreground focus:outline-none cursor-pointer">
                  <option value="all">Semua Paket</option>
                  {boosterPlans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filtered.length}</span> dari {data.length} traveler
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-green-500" />{data.filter(t => t.status === "active").length}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-amber-500" />{data.filter(t => t.status === "expired").length}</span>
                <span className="flex items-center gap-1"><Ban className="h-3.5 w-3.5 text-red-500" />{data.filter(t => t.status === "suspended").length}</span>
              </div>
            </div>
          </div>

          {nearExpiry.length > 0 && (
            <div className="px-5 py-3 bg-amber-50 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700 font-medium">
                  {nearExpiry.length} traveler akan expired ≤5 hari: {nearExpiry.map(t => t.name).join(", ")}
                </p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Traveler", "Paket", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                  {[
                    { label: "Sisa Waktu", col: "daysLeft"     },
                    { label: "Order",      col: "ordersGained" },
                    { label: "Rating",     col: "rating"       },
                  ].map(h => (
                    <th key={h.col} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      <button onClick={() => toggleSort(h.col)} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        {h.label} <SortIcon col={h.col} />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingData && (
                  <tr><td colSpan={7} className="py-16 text-center">
                    <LoaderPinwheel className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </td></tr>
                )}
                {!loadingData && filtered.map((t, i) => {
                  const pct = Math.min(100, (t.daysLeft / 30) * 100);
                  return (
                    <motion.tr key={t.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={t.avatar} alt={t.name} className="h-8 w-8 rounded-full bg-muted ring-1 ring-border object-cover shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{t.name}</p>
                            <p className="text-xs text-muted-foreground">{t.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: t.planColor, backgroundColor: t.planColor + "22" }}>
                          <Rocket className="h-3 w-3" />{t.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {t.status === "expired" ? (
                          <span className="text-xs text-amber-500 font-semibold">Berakhir</span>
                        ) : t.status === "suspended" ? (
                          <span className="text-xs text-red-500 font-semibold">Disuspend</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: t.planColor }} />
                            </div>
                            <span className={`text-xs font-semibold ${t.daysLeft <= 3 ? "text-red-500" : t.daysLeft <= 5 ? "text-amber-500" : "text-foreground"}`}>
                              {t.daysLeft}h
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">{t.ordersGained}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                          <span className={`text-sm font-semibold ${t.rating > 0 && t.rating < 4 ? "text-red-500" : "text-foreground"}`}>
                            {t.rating > 0 ? t.rating : <span className="text-muted-foreground text-xs">—</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedTraveler(t)}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          {t.status === "active" && (
                            <button onClick={() => handleSuspend(t.id)}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-muted-foreground hover:text-red-500 transition-colors">
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                          {t.status === "suspended" && (
                            <button onClick={() => handleActivate(t.id)}
                              className="p-1.5 rounded-lg hover:bg-green-100 text-muted-foreground hover:text-green-500 transition-colors">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {!loadingData && filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-16 text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">Tidak ada data</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Coba ubah filter pencarian</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs text-muted-foreground">Total order: <span className="font-semibold text-foreground">{filtered.reduce((a, t) => a + t.ordersGained, 0)}</span></p>
              <p className="text-xs text-muted-foreground">Rata-rata rating: <span className="font-semibold text-foreground">
                {filtered.filter(t => t.rating > 0).length > 0
                  ? (filtered.filter(t => t.rating > 0).reduce((a, t) => a + t.rating, 0) / filtered.filter(t => t.rating > 0).length).toFixed(1)
                  : "—"}
              </span></p>
            </div>
          )}
        </motion.div>

        {/* ── Detail Modal — pakai Dialog shadcn ── */}
        <DetailModal traveler={selectedTraveler} onClose={() => setSelectedTraveler(null)}
          onSuspend={handleSuspend} onActivate={handleActivate} />

        {/* ── Tambah Paket — pakai Dialog shadcn agar overlay full viewport ── */}
        <Dialog open={showAdd} onOpenChange={v => { if (!v) setShowAdd(false); }}>
          <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl max-h-[90vh] overflow-y-auto">

            {/* Top color bar — menyentuh tepi atas DialogContent */}
            <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: newPlan.color }} />

            <div className="p-6">
              <DialogHeader className="mb-5 p-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl shrink-0" style={{ backgroundColor: newPlan.color + "20" }}>
                    <Rocket className="h-5 w-5" style={{ color: newPlan.color }} />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold">Tambah Paket Booster</DialogTitle>
                    <DialogDescription className="text-xs mt-0.5">Buat paket booster baru untuk traveler</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Info paket */}
                <div className="rounded-xl bg-muted/40 border border-border/60 p-3.5 space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Informasi Paket</p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Hash className="h-3 w-3" /> Nama Paket <span className="text-red-500">*</span>
                    </label>
                    <Input placeholder="Contoh: Premium Boost" value={newPlan.name}
                      onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} className="h-9 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Hash className="h-3 w-3" /> Harga (Rp) <span className="text-red-500">*</span>
                      </label>
                      <Input type="number" placeholder="150000" value={newPlan.price || ""}
                        onChange={e => setNewPlan({ ...newPlan, price: Number(e.target.value) })} className="h-9 rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" /> Durasi (Hari)
                      </label>
                      <Input type="number" placeholder="7" value={newPlan.duration || ""}
                        onChange={e => setNewPlan({ ...newPlan, duration: Number(e.target.value) })} className="h-9 rounded-lg" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Layers className="h-3 w-3" /> Maks. Slot
                      </label>
                      <Input type="number" placeholder="5" value={newPlan.slots || ""}
                        onChange={e => setNewPlan({ ...newPlan, slots: Number(e.target.value) })} className="h-9 rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Crown className="h-3 w-3" /> Prioritas
                      </label>
                      <Input type="number" placeholder="1" value={newPlan.priority || ""}
                        onChange={e => setNewPlan({ ...newPlan, priority: Number(e.target.value) })} className="h-9 rounded-lg" />
                    </div>
                  </div>
                </div>

                {/* Warna & Deskripsi */}
                <div className="rounded-xl bg-muted/40 border border-border/60 p-3.5 space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tampilan</p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Warna Tema</label>
                    <div className="flex items-center gap-2.5">
                      <input type="color" value={newPlan.color}
                        onChange={e => setNewPlan({ ...newPlan, color: e.target.value })}
                        className="h-9 w-12 rounded-lg border border-border cursor-pointer p-0.5 bg-background" />
                      <div className="flex items-center gap-2">
                        {PRESET_COLORS.map(c => (
                          <button key={c} type="button" onClick={() => setNewPlan({ ...newPlan, color: c })}
                            className="w-8 h-8 rounded-full transition-all hover:scale-110 focus:outline-none shrink-0"
                            style={{
                              backgroundColor: c,
                              boxShadow: newPlan.color === c ? `0 0 0 3px var(--background), 0 0 0 5px ${c}` : "none",
                            }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-3 w-3" /> Deskripsi
                    </label>
                    <textarea placeholder="Deskripsi singkat paket booster..." rows={2}
                      value={newPlan.description} onChange={e => setNewPlan({ ...newPlan, description: e.target.value })}
                      className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  </div>
                </div>

                {/* Preview */}
                {newPlan.name && (
                  <div className="rounded-xl border border-border bg-muted/30 p-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: newPlan.color + "20" }}>
                      <Rocket className="h-4 w-4" style={{ color: newPlan.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{newPlan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Rp {Number(newPlan.price).toLocaleString("id-ID")} · {newPlan.duration} hari · {newPlan.slots} slot
                      </p>
                    </div>
                    <div className="ml-auto shrink-0 h-3 w-3 rounded-full" style={{ backgroundColor: newPlan.color }} />
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-2 pt-5 mt-0">
                <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1 h-10">Batal</Button>
                <Button onClick={handleCreatePlan}
                  disabled={!newPlan.name || !newPlan.price || adding}
                  className="flex-1 h-10 text-white"
                  style={{ backgroundColor: newPlan.color }}>
                  {adding
                    ? <><LoaderPinwheel className="h-4 w-4 mr-1.5 animate-spin" />Menyimpan...</>
                    : <><Save className="h-4 w-4 mr-1.5" />Buat Paket</>}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}