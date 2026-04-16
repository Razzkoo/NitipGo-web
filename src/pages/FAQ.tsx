import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle, ChevronDown, Search, MessageSquare,
  Loader2, BookOpen, Package, CreditCard, Truck,
  Users, AlertCircle, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaqItem {
  id:       number;
  code?:    string;
  question: string;
  answer:   string;
  category: string;
}

// ─── Category icon map ────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  umum:         BookOpen,
  order:        Package,
  pembayaran:   CreditCard,
  pengiriman:   Truck,
  traveler:     Users,
  akun:         Users,
};

function getCategoryIcon(cat: string): React.ElementType {
  return CATEGORY_ICONS[cat.toLowerCase()] ?? HelpCircle;
}

// ─── Single FAQ accordion item ────────────────────────────────────────────────

function FaqAccordion({
  faq, isOpen, onToggle,
}: { faq: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`rounded-2xl border transition-all ${
      isOpen
        ? "border-primary/30 shadow-sm"
        : "border-border/60 bg-card hover:border-primary/20"
    }`}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span className={`text-sm font-semibold leading-relaxed flex-1 ${
          isOpen ? "text-primary" : "text-foreground"
        }`}>
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className={`h-5 w-5 ${isOpen ? "text-primary" : "text-muted-foreground"}`} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="h-px bg-border/60 mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Faq() {
  const [faqs,    setFaqs]   = useState<FaqItem[]>([]);
  const [loading, setLoading]= useState(true);
  const [search,  setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("semua");
  const [openId,  setOpenId] = useState<number | null>(null);

  useEffect(() => {
    api.get("/faqs")
      .then(res => setFaqs(res.data.data ?? []))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────

  // Ambil kategori unik dari data (urutan pertama kemunculan)
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    faqs.forEach(f => {
      const key = f.category.toLowerCase();
      if (!seen.has(key)) { seen.add(key); result.push(key); }
    });
    return result;
  }, [faqs]);

  // Filter berdasarkan kategori + search
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return faqs.filter(f => {
      const matchCat    = activeCategory === "semua" || f.category.toLowerCase() === activeCategory;
      const matchSearch = !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [faqs, activeCategory, search]);

  // Kelompokkan per kategori (hanya saat tab "semua")
  const grouped = useMemo(() => {
    if (activeCategory !== "semua") return null;
    const map: Record<string, FaqItem[]> = {};
    filtered.forEach(f => {
      const key = f.category.toLowerCase();
      if (!map[key]) map[key] = [];
      map[key].push(f);
    });
    return map;
  }, [filtered, activeCategory]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setOpenId(null);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setOpenId(null);
    if (val.trim()) setActiveCategory("semua");
  };

  return (
    <MainLayout>

      {/* ── Hero ── */}
      <section className="bg-gradient-hero py-14 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <HelpCircle className="h-4 w-4" /> Pusat Bantuan
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-3">
              Pertanyaan yang Sering <span className="text-primary">Ditanyakan</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Temukan jawaban dari pertanyaan umum seputar layanan NitipGo
            </p>
          </motion.div>

          {/* Search box */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mx-auto max-w-xl"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Cari pertanyaan..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="pl-12 h-12 rounded-2xl bg-card shadow-card border-border/60 text-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-12 md:py-16">
        <div className="container max-w-3xl">

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
            </div>
          ) : faqs.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold">FAQ belum tersedia</h3>
              <p className="text-sm text-muted-foreground">
                Silakan hubungi tim support kami untuk pertanyaan lebih lanjut.
              </p>
            </div>
          ) : (
            <>
              {/* Category tabs — hanya tampil kalau ada lebih dari 1 kategori */}
              {categories.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2 mb-8"
                >
                  {/* Tab Semua */}
                  <button
                    onClick={() => handleCategoryChange("semua")}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCategory === "semua"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-card border border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" /> Semua
                  </button>

                  {/* Tab per kategori */}
                  {categories.map(cat => {
                    const Icon  = getCategoryIcon(cat);
                    const label = cat.charAt(0).toUpperCase() + cat.slice(1);
                    return (
                      <button key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          activeCategory === cat
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-card border border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {/* Hasil pencarian info */}
              {search.trim() && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground mb-5">
                  <span className="font-semibold text-foreground">{filtered.length}</span> hasil untuk "
                  <span className="font-semibold text-foreground">{search}</span>"
                </motion.p>
              )}

              {/* Empty search */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-4 text-center">
                  <Search className="h-10 w-10 text-muted-foreground/30" />
                  <h3 className="text-lg font-semibold">Tidak ditemukan</h3>
                  <p className="text-sm text-muted-foreground">Coba kata kunci lain atau pilih kategori berbeda</p>
                  <Button variant="outline" size="sm" onClick={() => { setSearch(""); setActiveCategory("semua"); }}>
                    Reset Pencarian
                  </Button>
                </div>
              ) : grouped ? (
                /* ── Mode "Semua" — grouped by category ── */
                <div className="space-y-10">
                  {Object.entries(grouped).map(([cat, items]) => {
                    const Icon  = getCategoryIcon(cat);
                    const label = cat.charAt(0).toUpperCase() + cat.slice(1);
                    return (
                      <motion.div key={cat}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Category heading */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <h2 className="text-base font-bold text-foreground">{label}</h2>
                          <div className="h-px flex-1 bg-border/60" />
                          <span className="text-xs text-muted-foreground shrink-0">{items.length} pertanyaan</span>
                        </div>

                        <div className="space-y-3">
                          {items.map(faq => (
                            <FaqAccordion
                              key={faq.id}
                              faq={faq}
                              isOpen={openId === faq.id}
                              onToggle={() => setOpenId(prev => prev === faq.id ? null : faq.id)}
                            />
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* ── Mode kategori spesifik — flat list ── */
                <div className="space-y-3">
                  {filtered.map(faq => (
                    <motion.div key={faq.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <FaqAccordion
                        faq={faq}
                        isOpen={openId === faq.id}
                        onToggle={() => setOpenId(prev => prev === faq.id ? null : faq.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Still need help CTA ── */}
          {!loading && faqs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mt-14 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-accent/5 p-8 text-center"
            >
              <MessageSquare className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-2">Tidak menemukan jawaban?</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto leading-relaxed">
                Tim support kami siap membantu. Login untuk membuka tiket bantuan.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="hero" asChild>
                  <Link to="/login" state={{ redirect: "/customer/help" }}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Buka Tiket Bantuan
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/register">
                    Daftar Sekarang <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}

        </div>
      </section>

    </MainLayout>
  );
}