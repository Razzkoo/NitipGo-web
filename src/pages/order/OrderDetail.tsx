 import { useParams, useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import { ArrowLeft, MapPin, Star, MessageSquare, CheckCircle, Clock, ArrowRight, Phone, RefreshCw } from "lucide-react";
 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { Button } from "@/components/ui/button";
 import { useState } from "react";
 import { useToast } from "@/hooks/use-toast";
 
 // Mock order data
 const mockOrders: Record<string, any> = {
   "ORD-001": {
     id: "ORD-001",
     item: "Sepatu Nike Air Max",
     description: "Nike Air Max 90, warna putih, size 42",
     weight: "1.5 kg",
     from: "Jakarta",
     to: "Bandung",
     status: "in_progress",
     traveler: {
       name: "Andi Pratama",
       avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=andi",
       phone: "0812-3456-7890",
       rating: 4.9,
     },
     pickupPoint: "Mitra Pos Cikini, Jl. Cikini Raya No. 45",
     price: "Rp 45.000",
     createdAt: "15 Feb 2024, 10:30",
     estimatedArrival: "15 Feb 2024, 16:00",
     timeline: [
       { status: "Order dibuat", time: "15 Feb, 10:30", completed: true },
       { status: "Dikonfirmasi traveler", time: "15 Feb, 10:45", completed: true },
       { status: "Barang diambil", time: "15 Feb, 12:00", completed: true },
       { status: "Dalam perjalanan", time: "15 Feb, 12:30", completed: true },
       { status: "Sampai tujuan", time: "-", completed: false },
     ],
   },
   "ORD-002": {
     id: "ORD-002",
     item: "Oleh-oleh Jogja",
     description: "Bakpia Pathok, 5 kotak",
     weight: "2 kg",
     from: "Yogyakarta",
     to: "Jakarta",
     status: "completed",
     traveler: {
       name: "Sari Dewi",
       avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sari",
       phone: "0813-4567-8901",
       rating: 4.8,
     },
     pickupPoint: "Titik Temu Stasiun Gambir",
     price: "Rp 50.000",
     createdAt: "10 Feb 2024, 08:00",
     estimatedArrival: "10 Feb 2024, 14:00",
     timeline: [
       { status: "Order dibuat", time: "10 Feb, 08:00", completed: true },
       { status: "Dikonfirmasi traveler", time: "10 Feb, 08:15", completed: true },
       { status: "Barang diambil", time: "10 Feb, 09:00", completed: true },
       { status: "Dalam perjalanan", time: "10 Feb, 09:30", completed: true },
       { status: "Sampai tujuan", time: "10 Feb, 13:45", completed: true },
     ],
   },
 };
 
 const statusConfig: Record<string, { label: string; className: string }> = {
   pending: { label: "Menunggu Konfirmasi", className: "bg-warning/20 text-warning" },
   in_progress: { label: "Dalam Proses", className: "bg-info/20 text-info" },
   completed: { label: "Selesai", className: "bg-success/20 text-success" },
   cancelled: { label: "Dibatalkan", className: "bg-destructive/20 text-destructive" },
 };
 
 export default function OrderDetail() {
   const { id } = useParams();
   const navigate = useNavigate();
   const { toast } = useToast();
   const orderId = id?.toUpperCase() || "ORD-001";
   const order = mockOrders[orderId] || mockOrders["ORD-001"];
   const [showRating, setShowRating] = useState(false);
   const [rating, setRating] = useState(0);
 
   const handleConfirmReceived = () => {
     toast({
       title: "Barang Dikonfirmasi",
       description: "Terima kasih! Silakan beri rating untuk traveler.",
     });
     setShowRating(true);
   };
 
   const handleSubmitRating = () => {
     toast({
       title: "Rating Terkirim",
       description: `Anda memberi rating ${rating} bintang untuk ${order.traveler.name}`,
     });
     setShowRating(false);
     navigate("/dashboard");
   };
 
   const handleUpdateStatus = () => {
     toast({
       title: "Status Diperbarui",
       description: "Status pengiriman berhasil diperbarui.",
     });
   };
 
   const handleChatTraveler = () => {
     toast({
       title: "Membuka Chat",
       description: `Memulai percakapan dengan ${order.traveler.name}`,
     });
   };
 
   return (
     <DashboardLayout role="customer">
       <div className="p-6 md:p-8 lg:p-10">
         <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
           <ArrowLeft className="h-4 w-4 mr-2" />
           Kembali
         </Button>
 
         <div className="grid gap-6 lg:grid-cols-3">
           {/* Main Content */}
           <div className="lg:col-span-2 space-y-6">
             {/* Order Header */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="rounded-2xl bg-card p-6 shadow-card"
             >
               <div className="flex items-start justify-between mb-4">
                 <div>
                   <p className="text-sm text-muted-foreground mb-1">{order.id}</p>
                   <h1 className="text-xl font-bold text-foreground">{order.item}</h1>
                 </div>
                 <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[order.status].className}`}>
                   {statusConfig[order.status].label}
                 </span>
               </div>
 
               <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 mb-4">
                 <div className="flex-1 text-center">
                   <p className="text-xs text-muted-foreground mb-1">Dari</p>
                   <p className="font-semibold text-foreground">{order.from}</p>
                 </div>
                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                   <ArrowRight className="h-5 w-5 text-primary" />
                 </div>
                 <div className="flex-1 text-center">
                   <p className="text-xs text-muted-foreground mb-1">Ke</p>
                   <p className="font-semibold text-foreground">{order.to}</p>
                 </div>
               </div>
 
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <p className="text-muted-foreground">Berat</p>
                   <p className="font-medium text-foreground">{order.weight}</p>
                 </div>
                 <div>
                   <p className="text-muted-foreground">Biaya</p>
                   <p className="font-medium text-primary">{order.price}</p>
                 </div>
                 <div>
                   <p className="text-muted-foreground">Dibuat</p>
                   <p className="font-medium text-foreground">{order.createdAt}</p>
                 </div>
                 <div>
                   <p className="text-muted-foreground">Estimasi Tiba</p>
                   <p className="font-medium text-foreground">{order.estimatedArrival}</p>
                 </div>
               </div>
             </motion.div>
 
             {/* Timeline */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="rounded-2xl bg-card p-6 shadow-card"
             >
               <h2 className="text-lg font-semibold text-foreground mb-6">Status Pengiriman</h2>
               <div className="space-y-4">
                 {order.timeline.map((item: any, i: number) => (
                   <div key={i} className="flex gap-4">
                     <div className="flex flex-col items-center">
                       <div className={`flex h-8 w-8 items-center justify-center rounded-full ${item.completed ? "bg-success" : "bg-muted"}`}>
                         {item.completed ? (
                           <CheckCircle className="h-4 w-4 text-success-foreground" />
                         ) : (
                           <Clock className="h-4 w-4 text-muted-foreground" />
                         )}
                       </div>
                       {i < order.timeline.length - 1 && (
                         <div className={`w-0.5 h-8 ${item.completed ? "bg-success" : "bg-muted"}`} />
                       )}
                     </div>
                     <div className="flex-1 pb-4">
                       <p className={`font-medium ${item.completed ? "text-foreground" : "text-muted-foreground"}`}>
                         {item.status}
                       </p>
                       <p className="text-sm text-muted-foreground">{item.time}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </motion.div>
 
             {/* Rating Section */}
             {showRating && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="rounded-2xl bg-card p-6 shadow-card border-2 border-primary"
               >
                 <h2 className="text-lg font-semibold text-foreground mb-4">Beri Rating</h2>
                 <p className="text-muted-foreground mb-4">Bagaimana pengalaman Anda dengan {order.traveler.name}?</p>
                 <div className="flex gap-2 mb-6">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <button key={star} onClick={() => setRating(star)} className="p-1">
                       <Star className={`h-8 w-8 ${star <= rating ? "fill-warning text-warning" : "text-muted"}`} />
                     </button>
                   ))}
                 </div>
                 <Button variant="hero" onClick={handleSubmitRating} disabled={rating === 0}>
                   Kirim Rating
                 </Button>
               </motion.div>
             )}
           </div>
 
           {/* Sidebar */}
           <div className="space-y-6">
             {/* Traveler Card */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="rounded-2xl bg-card p-6 shadow-card"
             >
               <h2 className="text-lg font-semibold text-foreground mb-4">Traveler</h2>
               <div className="flex items-center gap-4 mb-4">
                 <img
                   src={order.traveler.avatar}
                   alt={order.traveler.name}
                   className="h-14 w-14 rounded-full bg-muted"
                 />
                 <div>
                   <p className="font-semibold text-foreground">{order.traveler.name}</p>
                   <div className="flex items-center gap-1 text-sm text-muted-foreground">
                     <Star className="h-4 w-4 fill-warning text-warning" />
                     <span>{order.traveler.rating}</span>
                   </div>
                 </div>
               </div>
               <div className="space-y-2">
                 <Button variant="outline" className="w-full" onClick={handleChatTraveler}>
                   <MessageSquare className="h-4 w-4 mr-2" />
                   Chat Traveler
                 </Button>
                 <Button
                   variant="ghost"
                   className="w-full"
                   onClick={() => {
                     toast({
                       title: "Nomor Disalin",
                       description: `Nomor ${order.traveler.phone} disalin ke clipboard`,
                     });
                   }}
                 >
                   <Phone className="h-4 w-4 mr-2" />
                   {order.traveler.phone}
                 </Button>
               </div>
             </motion.div>
 
             {/* Pickup Point */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="rounded-2xl bg-card p-6 shadow-card"
             >
               <h2 className="text-lg font-semibold text-foreground mb-4">Titik Pengambilan</h2>
               <div className="flex items-start gap-3">
                 <MapPin className="h-5 w-5 text-primary mt-0.5" />
                 <p className="text-muted-foreground">{order.pickupPoint}</p>
               </div>
             </motion.div>
 
             {/* Actions */}
             {order.status === "in_progress" && !showRating && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.4 }}
                 className="rounded-2xl bg-gradient-primary p-6 space-y-3"
               >
                 <p className="text-primary-foreground/80 mb-4">
                   Sudah menerima barang? Konfirmasi untuk menyelesaikan order.
                 </p>
                 <Button variant="white" className="w-full shadow-lg" onClick={handleConfirmReceived}>
                   <CheckCircle className="h-5 w-5 mr-2" />
                   Konfirmasi Barang Diterima
                 </Button>
                 <Button
                   variant="ghost"
                   className="w-full text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
                   onClick={handleUpdateStatus}
                 >
                   <RefreshCw className="h-4 w-4 mr-2" />
                   Refresh Status
                 </Button>
               </motion.div>
             )}
           </div>
         </div>
       </div>
     </DashboardLayout>
   );
 }