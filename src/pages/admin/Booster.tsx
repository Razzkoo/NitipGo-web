import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Rocket,
  TrendingUp,
  Zap,
  Search,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Package,
  AlertCircle,
  Crown,
  ShieldCheck,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Download,
  LayoutDashboard,
  Wallet,
  Users,
  Banknote,
  Route,
  LogOut,
  Menu,
  Plus,
  Edit2,
  Save,
  XCircle,
  Hash,
  Calendar,
  Layers,
  ToggleLeft,
  ToggleRight,
  LoaderPinwheel
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const BASE_URL = "http://localhost:8000";



// ─── Admin Nav ──────────────────────────────────────────────────────────────────

// ─── StatusBadge ────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    active: {
      label: "Aktif",
      bg: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
      dot: "bg-green-500",
    },
    expired: {
      label: "Expired",
      bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    suspended: {
      label: "Diblokir",
      bg: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
      dot: "bg-red-500",
    },
  };
  const s = map[status] || map.expired;
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        s.bg,
      ].join(" ")}
    >
      <span className={["w-1.5 h-1.5 rounded-full animate-pulse", s.dot].join(" ")} />
      {s.label}
    </span>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────────────────

function StatCard({ stat, index }) {
  const colorMap = {
    primary: {
      bg: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20",
      icon: "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400",
      badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    },
    accent: {
      bg: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20",
      icon: "bg-orange-100 dark:bg-orange-900/40 text-orange-500 dark:text-orange-400",
      badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    },
    success: {
      bg: "from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/20",
      icon: "bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400",
      badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
    },
    warning: {
      bg: "from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/20",
      icon: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400",
      badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    },
  };
  const c = colorMap[stat.color];
  const isPositive = stat.change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={[
        "bg-gradient-to-br rounded-2xl p-5 border border-border shadow-card",
        "hover:shadow-card-hover transition-all duration-300 group",
        c.bg,
      ].join(" ")}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={[
            "p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300",
            c.icon,
          ].join(" ")}
        >
          <stat.icon className="h-5 w-5" />
        </div>
        <span
          className={[
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
            c.badge,
          ].join(" ")}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {Math.abs(stat.change)}%
        </span>
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
      <p className="text-sm text-muted-foreground">{stat.label}</p>
    </motion.div>
  );
}

// ─── PlanEditorCard ───────────────────────────────────────────────────────────────

function PlanEditorCard({ plan, index, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...plan });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setDraft({ ...plan });
    setEditing(false);
  };

  const Field = ({ label, icon: Icon, field, type = "text", prefix, suffix }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </label>
      {editing ? (
        <div className="flex items-center gap-1.5">
          {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
          <input
            type={type}
            value={draft[field]}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                [field]: type === "number" ? Number(e.target.value) : e.target.value,
              }))
            }
            className="flex-1 px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-full"
          />
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.08 }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      {/* Card Top Bar */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: plan.color }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: plan.color + "22" }}
            >
              <Rocket className="h-4 w-4" style={{ color: plan.color }} />
            </div>
            <div>
              {editing ? (
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                  className="text-base font-bold bg-background border border-border rounded-lg px-2 py-0.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 w-36"
                />
              ) : (
                <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {plan.count} pengguna aktif
              </p>
            </div>
          </div>

          {/* Toggle active */}
          <button
            onClick={() => onSave({ ...plan, active: !plan.active })}
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: plan.active ? plan.color : undefined }}
            title={plan.active ? "Nonaktifkan paket" : "Aktifkan paket"}
          >
            {plan.active ? (
              <ToggleRight className="h-5 w-5" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-muted-foreground" />
            )}
            <span className={plan.active ? "" : "text-muted-foreground"}>
              {plan.active ? "Aktif" : "Nonaktif"}
            </span>
          </button>
        </div>

        {/* Description */}
        {editing ? (
          <textarea
            value={draft.description}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none mb-4"
          />
        ) : (
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            {plan.description}
          </p>
        )}

        {/* Fields */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Harga" icon={Hash} field="price" type="number" prefix="Rp " suffix="" />
          <Field label="Durasi" icon={Calendar} field="duration" type="number" prefix="" suffix=" hari" />
          <Field label="Maks. Slot Order" icon={Layers} field="slots" type="number" prefix="" suffix=" slot" />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Pengguna Aktif
            </label>
            <p className="text-sm font-semibold text-foreground">{plan.count}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-4" />

        {/* Action Buttons */}
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: plan.color }}
              >
                <Save className="h-3.5 w-3.5" />
                Simpan
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                <XCircle className="h-3.5 w-3.5" />
                Batal
              </button>
            </>
          ) : (
            <button
              onClick={() => { setDraft({ ...plan }); setEditing(true); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border transition-colors hover:bg-muted"
              style={{ borderColor: plan.color + "55", color: plan.color }}
            >
              <Edit2 className="h-3.5 w-3.5" />
              {saved ? "Tersimpan" : "Edit Paket"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── DetailModal ─────────────────────────────────────────────────────────────────

function DetailModal({ traveler, onClose, onSuspend, onActivate }) {
  if (!traveler) return null;
  const maxDays = traveler.plan === "Basic Boost" ? 7 : traveler.plan === "Pro Boost" ? 14 : 30;
  const progress = Math.max(0, Math.min(100, (traveler.daysLeft / maxDays) * 100));

  const infoRows = [
    {
      label: "Paket Booster",
      value: (
        <span className="font-semibold text-sm" style={{ color: traveler.planColor }}>
          {traveler.plan}
        </span>
      ),
    },
    {
      label: "Nomor HP",
      value: <span className="text-sm font-medium text-foreground">{traveler.phone}</span>,
    },
    {
      label: "Bergabung",
      value: <span className="text-sm font-medium text-foreground">{traveler.joinDate}</span>,
    },
    {
      label: "Periode",
      value: (
        <span className="text-sm font-medium text-foreground">
          {traveler.startDate} s/d {traveler.endDate}
        </span>
      ),
    },
    {
      label: "Order Didapat",
      value: (
        <span className="text-sm font-semibold text-foreground">
          {traveler.ordersGained} order
        </span>
      ),
    },
    {
      label: "Rating",
      value: (
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
          {traveler.rating}
        </span>
      ),
    },
    {
      label: "Total Revenue",
      value: <span className="text-sm font-bold text-primary">{traveler.revenue}</span>,
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <img
                src={traveler.avatar}
                alt={traveler.name}
                className="h-12 w-12 rounded-full bg-muted ring-2 ring-border"
              />
              <div>
                <h3 className="font-bold text-foreground">{traveler.name}</h3>
                <p className="text-xs text-muted-foreground">{traveler.id}</p>
              </div>
            </div>
            <StatusBadge status={traveler.status} />
          </div>

          <div className="space-y-2.5">
            {infoRows.map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-xl"
              >
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
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: traveler.planColor }}
                />
              </div>
            </div>

            <div className="px-3 py-2.5 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground mb-2">Rute Aktif</p>
              <div className="flex flex-wrap gap-1.5">
                {traveler.routes.map((r, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            {traveler.status === "active" && (
              <button
                onClick={() => { onSuspend(traveler.id); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <Ban className="h-4 w-4" />
                Suspend
              </button>
            )}
            {traveler.status === "suspended" && (
              <button
                onClick={() => { onActivate(traveler.id); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl text-sm font-semibold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Aktifkan
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── BoosterMonitoringPage ────────────────────────────────────────────────────────

function BoosterMonitoringPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [selectedTraveler, setSelectedTraveler] = useState(null);
  const [sortBy, setSortBy] = useState("daysLeft");
  const [sortDir, setSortDir] = useState("asc");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [data, setData] = useState([]);
  const [boosterPlans, setBoosterPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [addingPlan, setAddingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: 0,
    duration: 7,
    slots: 5,
    priority: 1,
    color: "#22c55e",
    description: "",
    active: true,
  });

  const boosterStats = [
    {
      id: 1,
      label: "Total Booster Aktif",
      value: data.filter((t) => t.status === "active").length,
      change: +12,
      icon: Rocket,
      color: "primary",
    },
    {
      id: 2,
      label: "Total Booster",
      value: data.length,
      change: +8,
      icon: Zap,
      color: "accent",
    },
    {
      id: 3,
      label: "Pendapatan Booster",
      value:
        "Rp " +
        (
          boosterPlans.reduce(
            (sum, p) => sum + (p.count ?? 0) * Number(p.price),
            0
          ) / 1_000_000
        ).toFixed(1) +
        "Jt",
      change: +18,
      icon: TrendingUp,
      color: "success",
    },
    {
      id: 4,
      label: "Expired",
      value: data.filter((t) => t.status === "expired").length,
      change: -3,
      icon: Clock,
      color: "warning",
    },
  ];

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await api.get("/admin/boosters");
      setBoosterPlans(
        (res.data.data ?? []).map((b: any) => ({
          id: b.id,
          name: b.name,
          price: Number(b.price),
          duration: b.duration,
          slots: b.slots,
          color: b.color ?? "#22c55e",
          count: b.traveler_boosters_count ?? 0,
          active: b.active,
          description: b.description ?? "",
        }))
      );
    } catch {
      toast({ title: "Gagal memuat paket booster", variant: "destructive" });
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchMonitoring = async () => {
    setLoadingData(true);
    try {
      const res = await api.get("/admin/boosters/monitoring");
      const raw = res.data.data?.data ?? res.data.data ?? [];
      setData(
        raw.map((tb: any) => ({
          id: tb.id,
          name: tb.traveler?.name ?? "Unknown",
          avatar: tb.traveler?.photo
            ? `${BASE_URL}/storage/${tb.traveler.photo}`
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tb.traveler?.name ?? "user")}`,
          plan: tb.plan,
          planColor: tb.plan_color ?? "#22c55e",
          status: tb.status,
          startDate: tb.start_date,
          endDate: tb.end_date,
          ordersGained: tb.orders_gained ?? 0,
          rating: tb.traveler?.rating ?? 0,
          routes: [],
          daysLeft: tb.days_left ?? 0,
          phone: tb.traveler?.phone ?? "-",
          joinDate: tb.traveler?.created_at
            ? new Date(tb.traveler.created_at).toLocaleDateString("id-ID")
            : "-",
        }))
      );
    } catch {
      toast({ title: "Gagal memuat data monitoring", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  // Create packet booster
  const handleCreatePlan = async () => {
    if (!newPlan.name || !newPlan.price) return;
    setAddingPlan(true);
    try {
      await api.post("/admin/boosters", newPlan);
      toast({ title: "Paket booster berhasil dibuat" });
      setShowAddPlan(false);
      setNewPlan({ name: "", price: 0, duration: 7, slots: 5, priority: 1, color: "#22c55e", description: "", active: true });
      fetchPlans();
    } catch {
      toast({ title: "Gagal membuat paket", variant: "destructive" });
    } finally {
      setAddingPlan(false);
    }
  };

  const handlePlanSave = async (updatedPlan) => {
    try {
      if (Object.keys(updatedPlan).length <= 2 && "active" in updatedPlan) {
        await api.patch(`/admin/boosters/${updatedPlan.id}/toggle`);
      } else {
        await api.put(`/admin/boosters/${updatedPlan.id}`, {
          name: updatedPlan.name,
          price: updatedPlan.price,
          duration: updatedPlan.duration,
          slots: updatedPlan.slots,
          color: updatedPlan.color,
          description: updatedPlan.description,
          active: updatedPlan.active,
        });
      }
      toast({ title: "Paket berhasil diperbarui" });
      fetchPlans();
    } catch {
      toast({ title: "Gagal memperbarui paket", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchMonitoring();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSuspend = async (id) => {
    try {
      await api.patch(`/admin/boosters/traveler/${id}/status`, { status: "suspended" });
      setData((prev) => prev.map((t) => (t.id === id ? { ...t, status: "suspended" } : t)));
      toast({ title: "Booster berhasil disuspend" });
    } catch {
      toast({ title: "Gagal suspend booster", variant: "destructive" });
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.patch(`/admin/boosters/traveler/${id}/status`, { status: "active" });
      setData((prev) => prev.map((t) => (t.id === id ? { ...t, status: "active" } : t)));
      toast({ title: "Booster berhasil diaktifkan" });
    } catch {
      toast({ title: "Gagal mengaktifkan booster", variant: "destructive" });
    }
  };
  

  const filtered = data
    .filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchPlan = planFilter === "all" || t.plan === planFilter;
      return matchSearch && matchStatus && matchPlan;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === "daysLeft") cmp = a.daysLeft - b.daysLeft;
      else if (sortBy === "ordersGained") cmp = b.ordersGained - a.ordersGained;
      else if (sortBy === "rating") cmp = b.rating - a.rating;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  };

  function SortIcon({ col }) {
    if (sortBy !== col) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5" />
    );
  }


  const nearExpiry = filtered.filter((t) => t.status === "active" && t.daysLeft <= 5);

  const tableHeaders = [
    { label: "Traveler", col: null },
    { label: "Paket", col: null },
    { label: "Status", col: null },
    { label: "Rute", col: null },
    { label: "Sisa Waktu", col: "daysLeft" },
    { label: "Order", col: "ordersGained" },
    { label: "Rating", col: "rating" },
    { label: "Order", col: null },
    { label: "Aksi", col: null },
  ];

  return (
    <DashboardLayout role="admin">
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-primary rounded-xl shadow-button flex-shrink-0">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Booster Monitoring
            </h1>
            <p className="text-sm text-muted-foreground">
              Pantau dan kelola semua traveler yang menggunakan fitur booster
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Live Update</p>
            <p className="text-sm font-mono font-semibold text-foreground tabular-nums">
              {currentTime.toLocaleTimeString("id-ID")}
            </p>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="p-2 bg-primary/10 rounded-xl"
          >
            <LoaderPinwheel className="h-5 w-5 text-primary" />
          </motion.div>

        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {boosterStats.map((s, i) => (
          <StatCard key={s.id} stat={s} index={i} />
        ))}
      </div>

      {/* Boost Plan Editor */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="flex items-center justify-between mb-3"
        >
          <div>
            <h2 className="font-semibold text-foreground">Manajemen Paket Booster</h2>
            <p className="text-xs text-muted-foreground">
              Atur harga, durasi, dan slot order untuk setiap paket booster
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground px-2.5 py-1 bg-muted rounded-full font-medium">
              {boosterPlans.filter((p) => p.active).length} dari {boosterPlans.length} paket aktif
            </span>
            <button
              onClick={() => setShowAddPlan(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Tambah Paket
            </button>
          </div>
        </motion.div>
        {loadingPlans ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {boosterPlans.map((plan, i) => (
              <PlanEditorCard
                key={plan.id}
                plan={plan}
                index={i}
                onSave={handlePlanSave}
              />
            ))}
          </div>
        )}
      </div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-card border border-border rounded-2xl shadow-card overflow-hidden"
      >
        {/* Controls */}
        <div className="p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari nama traveler atau ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition-all"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="expired">Expired</option>
                <option value="suspended">Diblokir</option>
              </select>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition-all"
              >
                <option value="all">Semua Paket</option>
                {boosterPlans.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-muted-foreground">
              Menampilkan{" "}
              <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              dari {data.length} traveler
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                {data.filter((t) => t.status === "active").length} aktif
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                {data.filter((t) => t.status === "expired").length} expired
              </span>
              <span className="flex items-center gap-1">
                <Ban className="h-3.5 w-3.5 text-red-500" />
                {data.filter((t) => t.status === "suspended").length} diblokir
              </span>
            </div>
          </div>
        </div>

        {/* Near-expiry warning */}
        <AnimatePresence>
          {nearExpiry.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 py-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800/30"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                  {nearExpiry.length} traveler akan expired dalam 5 hari:{" "}
                  {nearExpiry.map((t) => t.name).join(", ")}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {tableHeaders.map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h.col ? (
                      <button
                        onClick={() => toggleSort(h.col)}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        {h.label}
                        <SortIcon col={h.col} />
                      </button>
                    ) : (
                      h.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingData && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex justify-center">
                      <LoaderPinwheel className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  </td>
                </tr>
              )}
              <AnimatePresence>
                {filtered.map((t, i) => {
                  const maxDays =
                    t.plan === "Basic Boost" ? 7 : t.plan === "Pro Boost" ? 14 : 30;
                  const pct = Math.min(100, (t.daysLeft / maxDays) * 100);
                  return (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Traveler */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={t.avatar}
                            alt={t.name}
                            className="h-8 w-8 rounded-full bg-muted flex-shrink-0 ring-1 ring-border"
                          />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{t.name}</p>
                            <p className="text-xs text-muted-foreground">{t.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Paket */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: t.planColor, backgroundColor: t.planColor + "22" }}
                        >
                          <Rocket className="h-3 w-3" />
                          {t.plan}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={t.status} />
                      </td>

                      {/* Rute */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          {t.routes.map((r, ri) => (
                            <span
                              key={ri}
                              className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md w-fit whitespace-nowrap"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Sisa Waktu */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {t.status === "expired" ? (
                          <span className="text-xs text-amber-500 font-semibold">Berakhir</span>
                        ) : t.status === "suspended" ? (
                          <span className="text-xs text-red-500 font-semibold">Disuspend</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${pct}%`, backgroundColor: t.planColor }}
                              />
                            </div>
                            <span
                              className={[
                                "text-xs font-semibold",
                                t.daysLeft <= 3
                                  ? "text-red-500"
                                  : t.daysLeft <= 5
                                  ? "text-amber-500"
                                  : "text-foreground",
                              ].join(" ")}
                            >
                              {t.daysLeft}h
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Order */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">
                            {t.ordersGained}
                          </span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                          <span
                            className={[
                              "text-sm font-semibold",
                              t.rating < 4 ? "text-red-500" : "text-foreground",
                            ].join(" ")}
                          >
                            {t.rating}
                          </span>
                        </div>
                      </td>

                      {/* Order */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-primary">
                          {t.ordersGained} order
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedTraveler(t)}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {t.status === "active" && (
                            <button
                              onClick={() => handleSuspend(t.id)}
                              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors"
                              title="Suspend"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                          {t.status === "suspended" && (
                            <button
                              onClick={() => handleActivate(t.id)}
                              className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-muted-foreground hover:text-green-500 transition-colors"
                              title="Aktifkan"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-muted/50 rounded-2xl">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Tidak ada data ditemukan
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Coba ubah filter atau kata kunci pencarian
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-muted-foreground">
              Total order:{" "}
              <span className="font-semibold text-foreground">
                {filtered.reduce((acc, t) => acc + t.ordersGained, 0)}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Rata-rata order:{" "}
              <span className="font-semibold text-foreground">
                {(
                  filtered.reduce((acc, t) => acc + t.ordersGained, 0) / (filtered.length || 1)
                ).toFixed(1)}
              </span>
            </p>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      {selectedTraveler && (
        <DetailModal
          traveler={selectedTraveler}
          onClose={() => setSelectedTraveler(null)}
          onSuspend={handleSuspend}
          onActivate={handleActivate}
        />
      )}

      {/* DIALOG TAMBAH PAKET BOOSTER */}
      <AnimatePresence>
        {showAddPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAddPlan(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top bar warna */}
              <div className="h-1.5 w-full" style={{ backgroundColor: newPlan.color }} />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: newPlan.color + "20" }}>
                      <Rocket className="h-5 w-5" style={{ color: newPlan.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Tambah Paket Booster</h3>
                      <p className="text-xs text-gray-500">Buat paket booster baru untuk traveler</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddPlan(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Nama */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Hash className="h-3 w-3" /> Nama Paket
                    </label>
                    <input
                      type="text"
                      placeholder="contoh: Premium Boost"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                      style={{ "--tw-ring-color": newPlan.color + "60" } as React.CSSProperties}
                    />
                  </div>

                  {/* Harga & Durasi */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Hash className="h-3 w-3" /> Harga (Rp)
                      </label>
                      <input
                        type="number"
                        placeholder="15000"
                        value={newPlan.price || ""}
                        onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Durasi (Hari)
                      </label>
                      <input
                        type="number"
                        placeholder="7"
                        value={newPlan.duration || ""}
                        onChange={(e) => setNewPlan({ ...newPlan, duration: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Slot & Priority */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Layers className="h-3 w-3" /> Maks. Slot
                      </label>
                      <input
                        type="number"
                        placeholder="5"
                        value={newPlan.slots || ""}
                        onChange={(e) => setNewPlan({ ...newPlan, slots: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Crown className="h-3 w-3" /> Prioritas
                      </label>
                      <input
                        type="number"
                        placeholder="1"
                        value={newPlan.priority || ""}
                        onChange={(e) => setNewPlan({ ...newPlan, priority: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Warna */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Warna Tema
                    </label>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={newPlan.color}
                        onChange={(e) => setNewPlan({ ...newPlan, color: e.target.value })}
                        className="h-9 w-14 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                      />
                      <div className="flex items-center gap-2">
                        {["#22c55e", "#f97316", "#8b5cf6", "#3b82f6", "#ef4444", "#f59e0b"].map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewPlan({ ...newPlan, color: c })}
                            className="w-8 h-8 rounded-full transition-all hover:scale-110 focus:outline-none"
                            style={{
                              backgroundColor: c,
                              boxShadow: newPlan.color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : "none",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Deskripsi
                    </label>
                    <textarea
                      placeholder="Deskripsi singkat paket booster..."
                      rows={2}
                      value={newPlan.description}
                      onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Preview */}
                {newPlan.name && (
                  <div className="mt-4 p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: newPlan.color + "20" }}>
                      <Rocket className="h-4 w-4" style={{ color: newPlan.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{newPlan.name}</p>
                      <p className="text-xs text-gray-500">
                        Rp {Number(newPlan.price).toLocaleString("id-ID")} • {newPlan.duration} hari • {newPlan.slots} slot
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setShowAddPlan(false)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleCreatePlan}
                    disabled={!newPlan.name || !newPlan.price || addingPlan}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
                    style={{ backgroundColor: newPlan.color }}
                  >
                    {addingPlan ? (
                      <LoaderPinwheel className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {addingPlan ? "Menyimpan..." : "Buat Paket"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </DashboardLayout>
  );
}
export default BoosterMonitoringPage;