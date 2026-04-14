import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle, ChevronDown, MessageSquare, CheckCircle2,
  Search, AlertTriangle, Lightbulb, Bug, Star,
  Mail, Loader2, Clock, Send,
} from "lucide-react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface MyTicket {
  id: string;
  code: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  date: string;
  replies: { author: string; message: string; time: string; isAdmin: boolean }[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const categories = [
  {
    key: "Bug",
    icon: Bug,
    title: "Laporkan Bug",
    desc: "Ada fitur yang tidak berjalan?",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    key: "Saran",
    icon: Lightbulb,
    title: "Saran & Masukan",
    desc: "Ide untuk meningkatkan platform",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    key: "Apresiasi",
    icon: Star,
    title: "Apresiasi",
    desc: "Ceritakan pengalaman positifmu",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    key: "Lainnya",
    icon: AlertTriangle,
    title: "Lainnya",
    desc: "Pertanyaan atau hal lain seputar platform",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
];

const statusCfg: Record<string, { label: string; chip: string; dot: string }> = {
  open:        { label: "Menunggu",     chip: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-400" },
  in_progress: { label: "Diproses",    chip: "bg-blue-50 text-blue-700 border border-blue-200",    dot: "bg-blue-400" },
  resolved:    { label: "Selesai",     chip: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400" },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CustomerHelp() {
  const { toast } = useToast();

  // State
  const [faqs, setFaqs]                     = useState<FaqItem[]>([]);
  const [myTickets, setMyTickets]           = useState<MyTicket[]>([]);
  const [loadingFaqs, setLoadingFaqs]       = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [searchQ, setSearchQ]               = useState("");
  const [openFaq, setOpenFaq]               = useState<string | null>(null);
  const [tab, setTab]                       = useState<"help" | "history">("help");

  // Dialog
  const [dialogOpen, setDialogOpen]         = useState(false);
  const [activeCategory, setActiveCategory] = useState<typeof categories[0] | null>(null);
  const [subject, setSubject]               = useState("");
  const [message, setMessage]               = useState("");
  const [sending, setSending]               = useState(false);
  const [sent, setSent]                     = useState(false);

  // Selected ticket detail
  const [selectedTicket, setSelectedTicket] = useState<MyTicket | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    api.get("/faqs")
      .then(res => setFaqs(res.data.data ?? []))
      .catch(() => setFaqs([]))
      .finally(() => setLoadingFaqs(false));
  }, []);

  const fetchMyTickets = () => {
    setLoadingTickets(true);
    api.get("/customer/help/tickets")
      .then(res => setMyTickets(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingTickets(false));
  };

  useEffect(() => { fetchMyTickets(); }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const filteredFaqs = searchQ
    ? faqs.filter(f =>
        f.question.toLowerCase().includes(searchQ.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQ.toLowerCase())
      )
    : null;

  const groupedFaqs = faqs.reduce<Record<string, FaqItem[]>>((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const openDialog = (cat: typeof categories[0]) => {
    setActiveCategory(cat);
    setSubject(cat.key !== "Lainnya" ? cat.title : "");
    setMessage("");
    setSent(false);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSent(false);
    setSubject("");
    setMessage("");
    setActiveCategory(null);
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      await api.post("/customer/help/tickets", {
        subject:     subject,
        description: message,
        category:    "Umum",
        priority:    "medium",
      });
      setSent(true);
      fetchMyTickets();
      setTimeout(() => {
        closeDialog();
        toast({ title: "Pesan terkirim!", description: "Tim kami akan merespons dalam 1×24 jam." });
      }, 2000);
    } catch (err: any) {
      toast({ title: err?.response?.data?.message ?? "Gagal mengirim", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pusat Bantuan</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Sampaikan masukan, laporkan bug, atau tanyakan apapun tentang platform NitipGo.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari pertanyaan..." value={searchQ}
              onChange={e => setSearchQ(e.target.value)} className="pl-10 h-11 rounded-xl" />
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit mx-auto">
          {(["help", "history"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t ? "bg-card text-foreground shadow-sm ring-1 ring-border/60" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "help" ? "Bantuan" : `Riwayat (${myTickets.length})`}
            </button>
          ))}
        </div>

        {/* ── TAB: HELP ── */}
        {tab === "help" && (
          <>
            {/* Search Results */}
            {searchQ ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <p className="text-sm text-muted-foreground">{filteredFaqs?.length ?? 0} hasil untuk "{searchQ}"</p>
                {filteredFaqs?.length === 0 ? (
                  <div className="text-center py-10 rounded-2xl bg-card border border-border/60">
                    <HelpCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">Tidak ditemukan. Coba hubungi kami langsung.</p>
                    <Button variant="outline" size="sm" onClick={() => openDialog(categories[3])}>Kirim Pertanyaan</Button>
                  </div>
                ) : (
                  filteredFaqs?.map(faq => (
                    <div key={faq.id} className="rounded-2xl bg-card border border-border/60 px-5 py-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground mb-2 inline-block">{faq.category}</span>
                      <p className="text-sm font-semibold text-foreground mb-1">{faq.question}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  ))
                )}
              </motion.div>
            ) : (
              <>
                {/* Categories */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <h2 className="text-sm font-semibold text-foreground mb-3">Apa yang ingin kamu sampaikan?</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {categories.map((cat, i) => (
                      <motion.button key={i} whileHover={{ y: -2 }} onClick={() => openDialog(cat)}
                        className={`text-left rounded-2xl border bg-card hover:shadow-sm p-4 transition-all hover:border-primary/20 ${cat.border}`}>
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl mb-3 ${cat.bg}`}>
                          <cat.icon className={`h-4 w-4 ${cat.color}`} />
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-0.5">{cat.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{cat.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* FAQ */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <h2 className="text-sm font-semibold text-foreground mb-3">Pertanyaan Umum</h2>
                  {loadingFaqs ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : Object.keys(groupedFaqs).length === 0 ? (
                    <div className="text-center py-10 rounded-2xl bg-card border border-border/60">
                      <HelpCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Belum ada FAQ.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(groupedFaqs).map(([category, items]) => (
                        <div key={category}>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">{category}</p>
                          <div className="rounded-2xl bg-card border border-border/60 overflow-hidden divide-y divide-border/60">
                            {items.map(faq => {
                              const isOpen = openFaq === faq.id;
                              return (
                                <div key={faq.id}>
                                  <button onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors">
                                    <span className="text-sm font-medium text-foreground">{faq.question}</span>
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                  </button>
                                  <AnimatePresence>
                                    {isOpen && (
                                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <p className="text-sm text-muted-foreground leading-relaxed px-5 pb-4">{faq.answer}</p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Contact card */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="rounded-2xl bg-card border border-border/60 p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Masih punya pertanyaan?</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Tim kami siap membantu dalam 1×24 jam</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button size="sm" className="flex-1 sm:flex-none gap-1.5 text-xs" onClick={() => openDialog(categories[3])}>
                        <MessageSquare className="h-3.5 w-3.5" /> Kirim Pesan
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: "Waktu Respons", value: "< 24 jam" },
                      { label: "Jam Operasional", value: "08.00–22.00" },
                      { label: "Kepuasan", value: "98%" },
                    ].map((s, i) => (
                      <div key={i}>
                        <p className="text-sm font-bold text-foreground">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </>
        )}

        {/* ── TAB: HISTORY ── */}
        {tab === "history" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {loadingTickets ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : myTickets.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-card border border-border/60">
                <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground mb-1">Belum ada pesan</p>
                <p className="text-xs text-muted-foreground mb-4">Gunakan tab Bantuan untuk menyampaikan masukan</p>
                <Button size="sm" variant="outline" onClick={() => setTab("help")}>Kirim Pesan</Button>
              </div>
            ) : (
              myTickets.map(ticket => {
                const sCfg = statusCfg[ticket.status] ?? statusCfg.open;
                const isOpen = selectedTicket?.id === ticket.id;
                return (
                  <div key={ticket.id} className="rounded-2xl bg-card border border-border/60 overflow-hidden">
                    <button className="w-full text-left px-5 py-4 hover:bg-muted/20 transition-colors"
                      onClick={() => setSelectedTicket(isOpen ? null : ticket)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-[11px] font-mono text-muted-foreground">{ticket.code}</span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${sCfg.chip}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${sCfg.dot}`} />{sCfg.label}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-foreground mb-0.5 truncate">{ticket.subject}</p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" />{ticket.date}
                            {ticket.replies.length > 0 && <><span>·</span><MessageSquare className="h-3 w-3" />{ticket.replies.length} balasan</>}
                          </div>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-border/60">
                          {/* Pesan awal */}
                          <div className="px-5 py-3 bg-muted/20">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Pesanmu</p>
                            <p className="text-sm text-foreground/80 leading-relaxed">{ticket.description}</p>
                          </div>

                          {/* Percakapan */}
                          {ticket.replies.length > 0 && (
                            <div className="px-5 py-3 space-y-3 border-t border-border/60">
                              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Balasan</p>
                              {ticket.replies.map((r, i) => (
                                <div key={i} className={`flex gap-2 ${r.isAdmin ? "" : "flex-row-reverse"}`}>
                                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${r.isAdmin ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                    {r.author[0]}
                                  </div>
                                  <div className="flex-1 max-w-[80%]">
                                    <div className={`rounded-xl px-3 py-2 text-sm ${r.isAdmin ? "bg-primary/10 text-foreground" : "bg-muted text-foreground"}`}>
                                      {r.message}
                                    </div>
                                    <p className={`text-[10px] text-muted-foreground mt-0.5 ${r.isAdmin ? "" : "text-right"}`}>
                                      {r.isAdmin ? "Tim NitipGo" : "Kamu"} · {r.time}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {ticket.status === "resolved" && (
                            <div className="px-5 pb-4">
                              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <p className="text-xs text-emerald-700">Pesan ini sudah diselesaikan oleh tim kami.</p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {/* ── SEND DIALOG ── */}
        <Dialog open={dialogOpen} onOpenChange={v => { if (!v) closeDialog(); }}>
          <DialogContent className="max-w-md rounded-2xl">
            <AnimatePresence mode="wait">
              {!sent ? (
                <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <DialogHeader className="mb-4">
                    {activeCategory && (
                      <div className={`inline-flex items-center gap-2 w-fit mb-2 px-3 py-1.5 rounded-xl ${activeCategory.bg}`}>
                        <activeCategory.icon className={`h-4 w-4 ${activeCategory.color}`} />
                        <span className={`text-sm font-semibold ${activeCategory.color}`}>{activeCategory.title}</span>
                      </div>
                    )}
                    <DialogTitle className="text-base">{activeCategory?.title ?? "Kirim Pesan"}</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sampaikan masukan atau pertanyaanmu. Tim kami akan membaca dan merespons.
                    </p>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium">Subjek</p>
                      <Input placeholder="Tulis subjek singkat..." value={subject}
                        onChange={e => setSubject(e.target.value)} className="rounded-xl" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium">Pesan</p>
                      <Textarea placeholder="Ceritakan secara detail..." value={message}
                        onChange={e => setMessage(e.target.value)} rows={4} className="resize-none rounded-xl" />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <Button variant="outline" onClick={closeDialog}>Batal</Button>
                      <Button disabled={!subject.trim() || !message.trim() || sending} onClick={handleSend}
                        className="gap-1.5">
                        {sending
                          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Mengirim...</>
                          : <><Send className="h-3.5 w-3.5" />Kirim Pesan</>}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-8 space-y-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">Pesan Terkirim!</h3>
                  <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                    Terima kasih! Tim kami akan membaca dan merespons dalam 1×24 jam.
                    Kamu bisa cek balasan di tab <strong>Riwayat</strong>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
        </Dialog>

      </div>
    </CustomerLayout>
  );
}