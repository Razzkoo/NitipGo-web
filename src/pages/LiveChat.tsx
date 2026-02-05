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
 
 const autoResponses = [
   "Terima kasih atas pertanyaan Anda! Tim kami sedang memproses...",
   "Hai! Ada yang bisa kami bantu? Tim support kami siap membantu Anda 24/7.",
   "Untuk informasi lebih lanjut tentang layanan kami, silakan kunjungi halaman FAQ.",
   "Kami akan segera menghubungi Anda. Mohon tunggu sebentar ya!",
   "Terima kasih telah menghubungi NitipGo! Pesanan Anda dalam proses.",
 ];
 
 export default function LiveChat() {
   const [messages, setMessages] = useState<Message[]>([
     {
       id: 1,
       text: "Halo! Selamat datang di NitipGo Live Chat. Ada yang bisa kami bantu hari ini?",
       sender: "admin",
       time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
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
   }, [messages]);
 
   const handleSend = () => {
     if (!input.trim()) return;
 
     const userMessage: Message = {
       id: messages.length + 1,
       text: input,
       sender: "user",
       time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
     };
 
     setMessages((prev) => [...prev, userMessage]);
     setInput("");
     setIsTyping(true);
 
     // Simulate admin response
     setTimeout(() => {
       setIsTyping(false);
       const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)];
       const adminMessage: Message = {
         id: messages.length + 2,
         text: randomResponse,
         sender: "admin",
         time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
       };
       setMessages((prev) => [...prev, adminMessage]);
     }, 1500);
   };
 
   const handleKeyPress = (e: React.KeyboardEvent) => {
     if (e.key === "Enter") {
       handleSend();
     }
   };
 
   return (
     <MainLayout showFooter={false}>
       <div className="min-h-[calc(100vh-80px)] flex flex-col bg-muted/30">
         {/* Header */}
         <div className="bg-card border-b border-border sticky top-16 z-10">
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
                   <p className="font-semibold text-foreground">NitipGo Support</p>
                   <div className="flex items-center gap-1 text-xs text-success">
                     <Circle className="h-2 w-2 fill-current" />
                     <span>Online</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
 
         {/* Messages */}
         <div className="flex-1 overflow-y-auto">
           <div className="container py-6 space-y-4 max-w-2xl">
             <AnimatePresence>
               {messages.map((message) => (
                 <motion.div
                   key={message.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0 }}
                   className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                 >
                   <div className={`flex gap-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                     <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                       message.sender === "user" ? "bg-primary" : "bg-gradient-primary"
                     }`}>
                       {message.sender === "user" ? (
                         <User className="h-4 w-4 text-primary-foreground" />
                       ) : (
                         <Bot className="h-4 w-4 text-primary-foreground" />
                       )}
                     </div>
                     <div>
                       <div className={`rounded-2xl px-4 py-2.5 ${
                         message.sender === "user"
                           ? "bg-primary text-primary-foreground rounded-tr-md"
                           : "bg-card shadow-card rounded-tl-md"
                       }`}>
                         <p className="text-sm">{message.text}</p>
                       </div>
                       <p className={`text-xs text-muted-foreground mt-1 ${
                         message.sender === "user" ? "text-right" : ""
                       }`}>
                         {message.time}
                       </p>
                     </div>
                   </div>
                 </motion.div>
               ))}
             </AnimatePresence>
 
             {/* Typing indicator */}
             {isTyping && (
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex gap-2"
               >
                 <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                   <Bot className="h-4 w-4 text-primary-foreground" />
                 </div>
                 <div className="bg-card shadow-card rounded-2xl rounded-tl-md px-4 py-3">
                   <div className="flex gap-1">
                     <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                     <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                     <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                   </div>
                 </div>
               </motion.div>
             )}
             <div ref={messagesEndRef} />
           </div>
         </div>
 
         {/* Input */}
         <div className="bg-card border-t border-border sticky bottom-0">
           <div className="container py-4 max-w-2xl">
             <div className="flex gap-3">
               <Input
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyPress={handleKeyPress}
                 placeholder="Ketik pesan Anda..."
                 className="flex-1"
               />
               <Button onClick={handleSend} disabled={!input.trim()} className="px-4">
                 <Send className="h-5 w-5" />
               </Button>
             </div>
           </div>
         </div>
       </div>
     </MainLayout>
   );
 }