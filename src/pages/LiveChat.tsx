import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Circle, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";

interface Message {
  id: number;
  text: string;
  sender: "user" | "admin";
  time: string;
}

export default function LiveChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Halo 👋 Selamat datang di NitipGo Live Chat. Ada yang bisa kami bantu hari ini?",
      sender: "admin",
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // =====================================
  // 🧠 SMART AI (NO API, NO BACKEND)
  // =====================================
  const getSmartAIReply = (text: string) => {
    const msg = text.toLowerCase();

    if (msg.includes("halo") || msg.includes("hai")) {
      return "Halo 👋 Senang bisa membantu Anda. Ada yang ingin ditanyakan tentang layanan NitipGo?";
    }

    if (msg.includes("harga") || msg.includes("biaya")) {
      return "Untuk biaya pengiriman, kami menyesuaikan dengan rute, berat, dan jadwal perjalanan traveler 😊";
    }

    if (msg.includes("pesan") || msg.includes("order")) {
      return "Baik 👍 Silakan jelaskan detail pesanan Anda (asal, tujuan, dan waktu pengiriman).";
    }

    if (msg.includes("barang") || msg.includes("kirim")) {
      return "Barang apa yang ingin Anda kirim? Kami akan cek apakah sesuai dengan ketentuan NitipGo.";
    }

    if (msg.includes("lama") || msg.includes("waktu")) {
      return "Estimasi waktu pengiriman tergantung jadwal traveler. Biasanya lebih cepat dari ekspedisi biasa ✨";
    }

    if (msg.includes("terima kasih") || msg.includes("makasih")) {
      return "Sama-sama 🤍 Jika ada pertanyaan lain, jangan ragu untuk menghubungi kami lagi ya.";
    }

    return "Terima kasih atas pesan Anda 😊 Tim NitipGo siap membantu. Bisa dijelaskan lebih detail?";
  };

  // =====================================
  // SEND MESSAGE
  // =====================================
  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const adminMessage: Message = {
        id: Date.now() + 1,
        text: getSmartAIReply(userMessage.text),
        sender: "admin",
        time: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, adminMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <MainLayout showFooter={false}>
      <div className="min-h-[calc(100vh-80px)] flex flex-col bg-muted/30">
        {/* HEADER */}
        <div className="bg-card border-b sticky top-16 z-10">
          <div className="container py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card" />
                </div>
                <div>
                  <p className="font-semibold">NitipGo AI Support</p>
                  <div className="flex items-center gap-1 text-xs text-success">
                    <Circle className="h-2 w-2 fill-current" />
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto">
          <div className="container py-6 space-y-4 max-w-2xl">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${
                      msg.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        msg.sender === "user"
                          ? "bg-primary"
                          : "bg-gradient-primary"
                      }`}
                    >
                      {msg.sender === "user" ? (
                        <User className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      )}
                    </div>

                    <div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-md"
                            : "bg-card shadow-card rounded-tl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      <p
                        className={`text-xs text-muted-foreground mt-1 ${
                          msg.sender === "user" ? "text-right" : ""
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-card rounded-2xl px-4 py-3 shadow-card">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* INPUT */}
        <div className="bg-card border-t sticky bottom-0">
          <div className="container py-3 max-w-2xl">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan Anda..."
              />
              <Button onClick={handleSend} disabled={!input.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
