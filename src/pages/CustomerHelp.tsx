import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  XCircle,
  Clock,
  UserX,
  CreditCard,
  ChevronDown,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function CustomerHelp() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);
  const [sent, setSent] = useState(false);

  const faqs = [
    {
      q: "Kenapa order saya dibatalkan?",
      a: "Order dibatalkan karena tidak ada traveler yang mengambil order hingga batas waktu yang ditentukan.",
    },
    {
      q: "Apakah saya dikenakan biaya?",
      a: "Tidak. Order yang dibatalkan tidak akan dikenakan biaya apa pun.",
    },
    {
      q: "Berapa lama menunggu traveler?",
      a: "Biasanya traveler mengambil order dalam beberapa jam. Jika terlalu lama, sistem akan membatalkan otomatis.",
    },
    {
      q: "Bagaimana jika saya mengalami masalah lain?",
      a: "Kamu bisa langsung menghubungi kami melalui tombol Laporkan Masalah.",
    },
  ];

  return (
    <DashboardLayout role="customer">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* BACK */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Pusat Bantuan</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Kami siap membantu kamu menyelesaikan masalah seputar order.
          </p>
        </motion.div>

        {/* QUICK HELP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: XCircle,
              title: "Order Dibatalkan",
              desc: "Penjelasan pembatalan & solusi",
              color: "text-destructive",
            },
            {
              icon: Clock,
              title: "Order Lama",
              desc: "Traveler belum mengambil order",
            },
            {
              icon: UserX,
              title: "Traveler Bermasalah",
              desc: "Kendala selama proses",
            },
            {
              icon: CreditCard,
              title: "Pembayaran",
              desc: "Biaya, refund, dan info lain",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 h-full hover:shadow-md transition">
                <item.icon
                  className={`h-6 w-6 mb-2 ${
                    item.color || "text-muted-foreground"
                  }`}
                />
                <h3 className="font-semibold text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {item.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">
            Pertanyaan yang Sering Ditanyakan
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() =>
                    setActiveFaq(activeFaq === i ? null : i)
                  }
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="text-sm font-medium">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      activeFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-muted-foreground mt-2 overflow-hidden"
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Separator className="mt-3" />
              </div>
            ))}
          </div>
        </Card>

        {/* CONTACT */}
        <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary" />
            <div>
              <h4 className="font-semibold text-sm">
                Masih butuh bantuan?
              </h4>
              <p className="text-xs text-muted-foreground">
                Hubungi tim kami dan jelaskan masalahmu
              </p>
            </div>
          </div>

          <Button onClick={() => setOpen(true)}>
            Laporkan Masalah
          </Button>
        </Card>

        {/* MODAL LAPORAN */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <AnimatePresence mode="wait">

              {!sent ? (
                /* FORM */
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <DialogHeader className="space-y-1">
                    <DialogTitle className="text-lg">
                      Laporkan Masalah
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      Jelaskan kendala yang kamu alami agar kami bisa membantu lebih cepat.
                    </p>
                  </DialogHeader>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Deskripsi Masalah
                    </label>
                    <Textarea
                      placeholder="Contoh: order saya dibatalkan padahal sudah menunggu lama..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tuliskan dengan jelas dan lengkap ya agar tim kami bisa segera membantu menyelesaikan masalahmu.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      disabled={!message.trim()}
                      onClick={() => {
                        console.log("Laporan:", message);
                        setSent(true);
                        setTimeout(() => {
                          setOpen(false);
                          setSent(false);
                          setMessage("");
                        }, 1800);
                      }}
                    >
                      Kirim Laporan
                    </Button>
                  </div>
                </motion.div>
              ) : (
                /* SUCCESS */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center py-10 space-y-3"
                >
                  <CheckCircle2 className="h-14 w-14 text-success" />
                  <h3 className="font-semibold text-lg">
                    Laporan Terkirim!
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Terima kasih sudah melapor. Tim kami akan segera menindaklanjuti masalahmu.
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
