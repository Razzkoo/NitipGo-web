import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle, MessageSquare, CheckCircle, Clock,
  AlertCircle, Eye, ChevronDown, Search,
  User, Calendar, Tag, Send, X, Plus, Pencil, Trash2, Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CountUp } from "@/components/ui/CountUp";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type TicketStatus = "open" | "in_progress" | "resolved";

interface Ticket {
  id: string;
  code: string;
  subject: string;
  description: string;
  customer: string;
  email: string;
  status: TicketStatus;
  priority: string;
  category: string;
  date: string;
  resolvedAt?: string;
  replies: { author: string; message: string; time: string; isAdmin: boolean }[];
}

interface FaqItem {
  id: string;
  code?: string;
  question: string;
  answer: string;
  category: string;
  is_active?: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const statusCfg: Record<TicketStatus, { label: string; chip: string; dot: string; bar: string; icon: React.ElementType }> = {
  open:        { label: "Baru",         icon: AlertCircle, chip: "bg-red-50 text-red-700 border border-red-200",         dot: "bg-red-400",     bar: "bg-red-400" },
  in_progress: { label: "Dalam Proses", icon: Clock,       chip: "bg-amber-50 text-amber-700 border border-amber-200",   dot: "bg-amber-400",   bar: "bg-amber-400" },
  resolved:    { label: "Selesai",      icon: CheckCircle, chip: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400", bar: "bg-emerald-400" },
};

// Template respons cepat
const templates = [
  { label: "Konfirmasi diterima",     text: "Halo [nama], pesan Anda sudah kami terima. Tim kami sedang meninjau dan akan merespons dalam 1×24 jam. Terima kasih." },
  { label: "Sedang ditindaklanjuti",  text: "Halo [nama], kami sedang memproses masukan Anda dan akan segera memberikan kabar. Mohon ditunggu." },
  { label: "Terima kasih masukan",    text: "Halo [nama], terima kasih atas masukan berharganya! Kami akan terus meningkatkan platform NitipGo berdasarkan saran dari pengguna." },
  { label: "Bug diterima",            text: "Halo [nama], terima kasih sudah melaporkan bug ini. Tim teknis kami sedang menyelidiki dan akan segera diperbaiki." },
];

const listContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const listItem      = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.22 } } };

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminHelp() {
  const { toast } = useToast();

  // Tickets
  const [tickets, setTickets]               = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [stats, setStats]                   = useState({ open: 0, in_progress: 0, resolved: 0, total: 0 });
  const [filterStatus, setFilterStatus]     = useState<TicketStatus | "all">("all");
  const [search, setSearch]                 = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText]           = useState("");
  const [sendingReply, setSendingReply]     = useState(false);
  const [resolving, setResolving]           = useState(false);

  // FAQ
  const [faqs, setFaqs]               = useState<FaqItem[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [openFaqIdx, setOpenFaqIdx]   = useState<number | null>(null);
  const [faqDialog, setFaqDialog]     = useState(false);
  const [editFaqId, setEditFaqId]     = useState<string | null>(null);
  const [faqForm, setFaqForm]         = useState({ question: "", answer: "", category: "Umum" });
  const [savingFaq, setSavingFaq]     = useState(false);

  const [tab, setTab] = useState<"tickets" | "faq">("tickets");

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchTickets = (s = "", status: string = "all") => {
    setLoadingTickets(true);
    const params: Record<string, string> = {};
    if (s) params.search = s;
    if (status !== "all") params.status = status;
    api.get("/admin/help/tickets", { params })
      .then(res => {
        setTickets(res.data.data?.data ?? []);
        setStats(res.data.stats ?? { open: 0, in_progress: 0, resolved: 0, total: 0 });
      })
      .catch(() => {})
      .finally(() => setLoadingTickets(false));
  };

  const fetchFaqs = () => {
    setLoadingFaqs(true);
    api.get("/admin/help/faqs")
      .then(res => setFaqs(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingFaqs(false));
  };

  useEffect(() => { fetchTickets(); fetchFaqs(); }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const applyFilter = (f: TicketStatus | "all") => {
    setFilterStatus(f);
    fetchTickets(search, f);
  };

  const applySearch = () => fetchTickets(search, filterStatus);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);
    try {
      await api.post(`/admin/help/tickets/${selectedTicket.id}/reply`, { message: replyText });
      toast({ title: "Balasan terkirim" });
      setReplyText("");
      // Refresh tiket terpilih
      await fetchTickets(search, filterStatus);
      // Update selectedTicket dengan data baru
      const res = await api.get("/admin/help/tickets");
      const all: Ticket[] = res.data.data?.data ?? [];
      const updated = all.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    } catch {
      toast({ title: "Gagal mengirim balasan", variant: "destructive" });
    } finally {
      setSendingReply(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket) return;
    setResolving(true);
    try {
      await api.patch(`/admin/help/tickets/${selectedTicket.id}/resolve`);
      toast({ title: "Tiket diselesaikan" });
      setSelectedTicket({ ...selectedTicket, status: "resolved" });
      fetchTickets(search, filterStatus);
    } catch {
      toast({ title: "Gagal menyelesaikan", variant: "destructive" });
    } finally {
      setResolving(false);
    }
  };

  const useTemplate = (text: string) => {
    if (selectedTicket) setReplyText(text.replace("[nama]", selectedTicket.customer));
  };

  const handleSaveFaq = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;
    setSavingFaq(true);
    try {
      if (editFaqId) {
        await api.put(`/admin/help/faqs/${editFaqId}`, faqForm);
        toast({ title: "FAQ diperbarui" });
      } else {
        await api.post("/admin/help/faqs", faqForm);
        toast({ title: "FAQ ditambahkan" });
      }
      fetchFaqs();
      closeFaqDialog();
    } catch {
      toast({ title: "Gagal menyimpan FAQ", variant: "destructive" });
    } finally {
      setSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      await api.delete(`/admin/help/faqs/${id}`);
      toast({ title: "FAQ dihapus" });
      fetchFaqs();
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  const openFaqDialogAdd = () => {
    setEditFaqId(null);
    setFaqForm({ question: "", answer: "", category: "Umum" });
    setFaqDialog(true);
  };

  const openFaqDialogEdit = (faq: FaqItem) => {
    setEditFaqId(faq.id);
    setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category });
    setFaqDialog(true);
  };

  const closeFaqDialog = () => {
    setFaqDialog(false);
    setEditFaqId(null);
    setFaqForm({ question: "", answer: "", category: "Umum" });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout role="admin">
      <div className="p-4 sm:p-6 md:p-8 space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-primary/10 p-2 shrink-0">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">Manajemen Bantuan</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Kelola pesan masukan & FAQ dari customer</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { label: "Pesan Baru",   value: stats.open,        icon: AlertCircle,  iconBg: "bg-red-50",     iconColor: "text-red-500",     accent: "bg-red-400" },
            { label: "Diproses",     value: stats.in_progress, icon: Clock,        iconBg: "bg-amber-50",   iconColor: "text-amber-500",   accent: "bg-amber-400" },
            { label: "Selesai",      value: stats.resolved,    icon: CheckCircle,  iconBg: "bg-emerald-50", iconColor: "text-emerald-500", accent: "bg-emerald-400" },
            { label: "Total Pesan",  value: stats.total,       icon: MessageSquare,iconBg: "bg-primary/10", iconColor: "text-primary",     accent: "bg-primary" },
          ] as const).map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="relative overflow-hidden rounded-2xl bg-card border border-border/60 p-4 shadow-sm">
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${s.accent}`} />
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.iconBg} mb-3`}>
                <s.icon className={`h-4 w-4 ${s.iconColor}`} />
              </div>
              <p className="text-xl font-bold text-foreground leading-none mb-1">
                <CountUp key={s.value} end={s.value} duration={800} />
              </p>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit">
          {(["tickets", "faq"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "tickets" ? "Pesan Masuk" : "Kelola FAQ"}
            </button>
          ))}
        </div>

        {/* ── TICKETS TAB ── */}
        {tab === "tickets" && (
          <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">

            {/* Left: List */}
            <div className="space-y-4 min-w-0">
              {/* Filter & Search */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Cari pesan atau nama customer..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && applySearch()}
                    className="pl-9 h-9 text-sm" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {(["all", "open", "in_progress", "resolved"] as const).map(f => (
                    <button key={f} onClick={() => applyFilter(f)}
                      className={`h-9 px-3 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${filterStatus === f ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/30"}`}>
                      {f === "all" ? "Semua" : f === "open" ? "Baru" : f === "in_progress" ? "Proses" : "Selesai"}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              {loadingTickets ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
              ) : tickets.length === 0 ? (
                <EmptyState icon={MessageSquare} title="Tidak ada pesan" description="Tidak ada pesan sesuai filter" />
              ) : (
                <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-2">
                  {tickets.map(ticket => {
                    const sCfg = statusCfg[ticket.status] ?? statusCfg.open;
                    const SIcon = sCfg.icon;
                    const isSelected = selectedTicket?.id === ticket.id;
                    return (
                      <motion.div key={ticket.id} variants={listItem}
                        onClick={() => setSelectedTicket(isSelected ? null : ticket)}
                        className={`relative rounded-2xl bg-card border transition-all cursor-pointer overflow-hidden hover:shadow-sm ${isSelected ? "border-primary/40 ring-1 ring-primary/10" : "border-border/60 hover:border-primary/20"}`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${sCfg.bar}`} />
                        <div className="pl-5 pr-4 py-3.5">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-mono text-muted-foreground">{ticket.code}</span>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${sCfg.chip}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${sCfg.dot}`} />{sCfg.label}
                              </span>
                            </div>
                            <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          </div>
                          <p className="text-sm font-semibold text-foreground mb-1 line-clamp-1">{ticket.subject}</p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{ticket.customer}</span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1"><Tag className="h-3 w-3" />{ticket.category}</span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{ticket.date}</span>
                          </div>
                          {ticket.replies.length > 0 && (
                            <p className="text-[11px] text-muted-foreground mt-1">{ticket.replies.length} balasan</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Right: Detail */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden sticky top-4">
              {!selectedTicket ? (
                <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">Pilih pesan untuk melihat detail</p>
                  <p className="text-xs text-muted-foreground mt-1">Klik salah satu pesan di kiri</p>
                </div>
              ) : (() => {
                const sCfg = statusCfg[selectedTicket.status] ?? statusCfg.open;
                return (
                  <>
                    {/* Ticket Header */}
                    <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-mono text-muted-foreground mb-1">{selectedTicket.code}</p>
                          <p className="text-sm font-bold text-foreground leading-snug">{selectedTicket.subject}</p>
                        </div>
                        <button onClick={() => setSelectedTicket(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${sCfg.chip}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sCfg.dot}`} />{sCfg.label}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground border border-border">
                          {selectedTicket.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-medium">{selectedTicket.customer}</span>
                        {selectedTicket.email ? ` · ${selectedTicket.email}` : ""}
                        {" · "}{selectedTicket.date}
                      </p>
                    </div>

                    {/* Pesan customer */}
                    <div className="px-5 py-3 border-b border-border/60 bg-muted/10">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1.5">Pesan Customer</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">{selectedTicket.description}</p>
                    </div>

                    {/* Percakapan */}
                    <div className="px-5 py-3 border-b border-border/60 max-h-52 overflow-y-auto">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">Percakapan</p>
                      {selectedTicket.replies.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Belum ada balasan.</p>
                      ) : (
                        <div className="space-y-3">
                          {selectedTicket.replies.map((r, i) => (
                            <div key={i} className={`flex gap-2 ${r.isAdmin ? "flex-row-reverse" : ""}`}>
                              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${r.isAdmin ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                {r.author[0]}
                              </div>
                              <div className="flex-1 max-w-[82%]">
                                <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${r.isAdmin ? "bg-primary/10 text-foreground" : "bg-muted text-foreground"}`}>
                                  {r.message}
                                </div>
                                <p className={`text-[10px] text-muted-foreground mt-0.5 ${r.isAdmin ? "text-right" : ""}`}>
                                  {r.author} · {r.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Template cepat */}
                    <div className="px-5 py-3 border-b border-border/60">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">Template Cepat</p>
                      <div className="flex flex-col gap-1">
                        {templates.map((t, i) => (
                          <button key={i} onClick={() => useTemplate(t.text)}
                            className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition border border-border/40">
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reply box */}
                    <div className="px-5 py-4 space-y-2">
                      <Textarea placeholder="Tulis balasan untuk customer..." value={replyText}
                        onChange={e => setReplyText(e.target.value)} rows={3}
                        className="text-sm resize-none rounded-xl" />
                      <div className="flex gap-2">
                        {selectedTicket.status !== "resolved" && (
                          <Button size="sm" variant="outline" onClick={handleResolve} disabled={resolving} className="text-xs gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5" />
                            {resolving ? "Memproses..." : "Tandai Selesai"}
                          </Button>
                        )}
                        <Button size="sm" onClick={handleSendReply}
                          disabled={!replyText.trim() || sendingReply || selectedTicket.status === "resolved"}
                          className="text-xs gap-1.5 ml-auto">
                          <Send className="h-3.5 w-3.5" />
                          {sendingReply ? "Mengirim..." : "Kirim Balasan"}
                        </Button>
                      </div>
                      {selectedTicket.status === "resolved" && (
                        <p className="text-xs text-muted-foreground text-center">Tiket sudah selesai — tidak bisa dibalas.</p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── FAQ TAB ── */}
        {tab === "faq" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{faqs.length} FAQ tersedia</p>
              <Button size="sm" onClick={openFaqDialogAdd} className="gap-1.5">
                <Plus className="h-4 w-4" /> Tambah FAQ
              </Button>
            </div>

            {loadingFaqs ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : faqs.length === 0 ? (
              <EmptyState icon={HelpCircle} title="Belum ada FAQ" description="Tambahkan FAQ untuk membantu customer" />
            ) : (
              <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-2">
                {faqs.map((faq, i) => (
                  <motion.div key={faq.id} variants={listItem}
                    className="rounded-2xl bg-card border border-border/60 overflow-hidden">
                    <div className="px-5 py-4 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          {faq.code && <span className="text-[10px] font-mono text-muted-foreground">{faq.code}</span>}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground border border-border">
                            {faq.category}
                          </span>
                          {faq.is_active === false && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-red-50 text-red-600 border border-red-200">
                              Nonaktif
                            </span>
                          )}
                        </div>
                        <button className="w-full text-left flex items-start justify-between gap-2"
                          onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}>
                          <p className="text-sm font-semibold text-foreground">{faq.question}</p>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform ${openFaqIdx === i ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {openFaqIdx === i && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-sm text-muted-foreground mt-2 leading-relaxed overflow-hidden">
                              {faq.answer}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openFaqDialogEdit(faq)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteFaq(faq.id)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* FAQ Dialog */}
        <Dialog open={faqDialog} onOpenChange={v => { if (!v) closeFaqDialog(); }}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>{editFaqId ? "Edit FAQ" : "Tambah FAQ"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium">Pertanyaan</p>
                <Input placeholder="Tulis pertanyaan..." value={faqForm.question}
                  onChange={e => setFaqForm({ ...faqForm, question: e.target.value })} className="rounded-xl" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium">Jawaban</p>
                <Textarea placeholder="Tulis jawaban..." rows={4} value={faqForm.answer}
                  onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="resize-none rounded-xl" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium">Kategori</p>
                <select value={faqForm.category} onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm">
                  {["Umum", "Order", "Pembayaran", "Pengiriman", "Akun"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Button variant="outline" onClick={closeFaqDialog}>Batal</Button>
                <Button onClick={handleSaveFaq} disabled={!faqForm.question.trim() || !faqForm.answer.trim() || savingFaq}>
                  {savingFaq
                    ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Menyimpan...</>
                    : "Simpan FAQ"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}