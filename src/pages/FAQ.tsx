import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqCategories = [
  { id: "umum", label: "Umum" },
  { id: "customer", label: "Customer" },
  { id: "traveler", label: "Traveler" },
  { id: "pembayaran", label: "Pembayaran" },
];

const faqs = [
  {
    category: "umum",
    question: "Apa itu NitipGo?",
    answer: "NitipGo adalah platform jasa titip dan logistik berbasis traveler yang menghubungkan customer yang ingin mengirim atau titip beli barang dengan mitra traveler yang sedang bepergian ke kota tujuan tertentu. Konsep kami adalah 'sekalian jalan, nitip barang'.",
  },
  {
    category: "umum",
    question: "Apakah NitipGo aman digunakan?",
    answer: "Ya, NitipGo sangat aman. Semua traveler harus melalui proses verifikasi identitas. Kami juga memiliki sistem rating & review, serta garansi uang kembali jika barang tidak sampai.",
  },
  {
    category: "umum",
    question: "Bagaimana cara mengambil barang?",
    answer: "Barang diambil di titik temu atau mitra pos yang telah ditentukan saat order. Kami tidak mengirim langsung ke rumah untuk menjaga keamanan dan efisiensi.",
  },
  {
    category: "customer",
    question: "Bagaimana cara memesan jasa titip?",
    answer: "Pilih jenis layanan (titip beli atau kirim barang), cari traveler yang sesuai rute dan tanggal, upload foto dan detail barang, pilih titik pengambilan, lakukan pembayaran, dan tunggu konfirmasi dari traveler.",
  },
  {
    category: "customer",
    question: "Berapa biaya pengiriman?",
    answer: "Biaya dihitung berdasarkan jarak, berat barang, dan komisi traveler. Anda akan melihat estimasi harga sebelum konfirmasi order. Umumnya lebih hemat 30-50% dibanding ekspedisi biasa.",
  },
  {
    category: "customer",
    question: "Bisa tracking barang saya?",
    answer: "Ya, Anda bisa memantau status pengiriman secara real-time dari dashboard. Status meliputi: Menunggu konfirmasi, Diproses, Dalam perjalanan, dan Sampai.",
  },
  {
    category: "traveler",
    question: "Bagaimana cara menjadi traveler?",
    answer: "Daftar akun sebagai traveler, lengkapi data diri dan verifikasi identitas (KTP/SIM), tunggu persetujuan admin, dan mulai input rute perjalanan Anda untuk menerima order.",
  },
  {
    category: "traveler",
    question: "Berapa penghasilan sebagai traveler?",
    answer: "Penghasilan bervariasi tergantung rute dan berat barang. Anda bisa mengatur tarif sendiri. Rata-rata traveler mendapat Rp 50.000 - Rp 200.000 per perjalanan.",
  },
  {
    category: "traveler",
    question: "Apakah bisa menolak order?",
    answer: "Ya, Anda bebas memilih order yang sesuai dengan preferensi Anda. Tidak ada kewajiban untuk menerima semua order yang masuk.",
  },
  {
    category: "pembayaran",
    question: "Metode pembayaran apa saja yang tersedia?",
    answer: "Kami menerima transfer bank, e-wallet (GoPay, OVO, Dana), kartu kredit/debit, dan virtual account dari berbagai bank.",
  },
  {
    category: "pembayaran",
    question: "Kapan traveler menerima pembayaran?",
    answer: "Pembayaran akan masuk ke saldo traveler setelah customer mengkonfirmasi barang telah diterima dengan baik. Proses pencairan ke rekening bank membutuhkan 1-2 hari kerja.",
  },
  {
    category: "pembayaran",
    question: "Bagaimana jika barang rusak atau hilang?",
    answer: "Kami memiliki garansi uang kembali. Laporkan masalah melalui fitur dispute di dashboard, tim kami akan menginvestigasi dan memberikan solusi dalam 3x24 jam.",
  },
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("umum");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const filteredFaqs = faqs.filter((faq) => faq.category === activeCategory);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <HelpCircle className="h-4 w-4" />
              <span>Pusat Bantuan</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground md:text-5xl">
              Pertanyaan yang Sering Diajukan
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Temukan jawaban untuk pertanyaan umum seputar layanan NitipGo
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {faqCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setOpenItems([]); }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFaqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl bg-card shadow-card overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(i)}
                    className="flex w-full items-center justify-between p-5 text-left"
                  >
                    <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground shrink-0 transition-transform",
                        openItems.includes(i) && "rotate-180"
                      )}
                    />
                  </button>
                  {openItems.includes(i) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="px-5 pb-5"
                    >
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center rounded-2xl bg-muted/50 p-8 md:p-12">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Masih punya pertanyaan?
            </h2>
            <p className="text-muted-foreground mb-6">
              Tim support kami siap membantu Anda 24/7
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/kontak">Hubungi Kami</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
