import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CheckCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ChatTraveler() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = [
    {
      from: "traveler",
      text: "Halo kak, barang sudah saya ambil ya. Sekarang otw 🙏",
      time: "12:30",
    },
    {
      from: "user",
      text: "Siap kak, ditunggu. Hati-hati di jalan 😊",
      time: "12:31",
    },
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <DashboardLayout role="customer">
      <div className="flex flex-col h-[calc(100vh-4rem)]">

        {/* Header */}
        <div className="flex items-center gap-3 border-b px-6 py-4 bg-card">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="font-semibold text-foreground">Chat Traveler</p>
            <p className="text-xs text-muted-foreground">Order {orderId}</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-muted/30">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.from === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.from === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card text-foreground rounded-bl-md"
                }`}
              >
                <p>{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-70">
                  <span>{msg.time}</span>
                  {msg.from === "user" && (
                    <CheckCheck className="h-3 w-3" />
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-card px-6 py-4">
          <div className="flex items-end gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan ke traveler..."
              className="resize-none min-h-[44px] max-h-32"
            />
            <Button size="icon" disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Pesan ini akan dikirim langsung ke traveler
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
