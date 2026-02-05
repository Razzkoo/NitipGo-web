 import { motion } from "framer-motion";
 import { Bell, Package, CheckCircle, Clock, Wallet, Trash2 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { useToast } from "@/hooks/use-toast";
 
 const notifications = [
   {
     id: 1,
     type: "order",
     title: "Order Baru",
     message: "Ada order baru dari Jakarta ke Bandung yang cocok dengan rute Anda.",
     time: "10 menit lalu",
     read: false,
     icon: Package,
     color: "text-accent",
   },
   {
     id: 2,
     type: "payment",
     title: "Pembayaran Masuk",
     message: "Saldo Rp 45.000 telah ditambahkan ke wallet Anda.",
     time: "2 jam lalu",
     read: false,
     icon: Wallet,
     color: "text-success",
   },
   {
     id: 3,
     type: "reminder",
     title: "Pengingat Trip",
     message: "Trip Anda ke Bandung dimulai besok. Pastikan semua barang sudah siap.",
     time: "5 jam lalu",
     read: true,
     icon: Clock,
     color: "text-warning",
   },
   {
     id: 4,
     type: "complete",
     title: "Order Selesai",
     message: "Customer telah mengkonfirmasi penerimaan barang. Rating: 5 bintang!",
     time: "1 hari lalu",
     read: true,
     icon: CheckCircle,
     color: "text-success",
   },
 ];
 
 export default function TravelerNotifications() {
   const { toast } = useToast();
 
   const handleMarkAllRead = () => {
     toast({
       title: "Semua Dibaca",
       description: "Semua notifikasi telah ditandai sebagai dibaca.",
     });
   };
 
   const handleDelete = (id: number) => {
     toast({
       title: "Notifikasi Dihapus",
       description: "Notifikasi berhasil dihapus.",
     });
   };
 
   return (
     <DashboardLayout role="traveler">
       <div className="p-6 md:p-8 lg:p-10">
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
         >
           <div>
             <h1 className="text-2xl font-bold text-foreground md:text-3xl">Notifikasi</h1>
             <p className="text-muted-foreground mt-1">Update terbaru untuk perjalanan & order Anda</p>
           </div>
           <Button variant="outline" onClick={handleMarkAllRead} className="mt-4 md:mt-0">
             Tandai Semua Dibaca
           </Button>
         </motion.div>
 
         <div className="space-y-3">
           {notifications.map((notif, i) => (
             <motion.div
               key={notif.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.05 }}
               className={`rounded-2xl bg-card p-4 shadow-card flex items-start gap-4 ${
                 !notif.read ? "border-l-4 border-accent" : ""
               }`}
             >
               <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                 notif.read ? "bg-muted" : "bg-accent/10"
               }`}>
                 <notif.icon className={`h-5 w-5 ${notif.read ? "text-muted-foreground" : notif.color}`} />
               </div>
               <div className="flex-1 min-w-0">
                 <div className="flex items-start justify-between gap-2">
                   <div>
                     <p className={`font-medium ${notif.read ? "text-muted-foreground" : "text-foreground"}`}>
                       {notif.title}
                     </p>
                     <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                   </div>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="shrink-0 text-muted-foreground hover:text-destructive"
                     onClick={() => handleDelete(notif.id)}
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 </div>
                 <p className="text-xs text-muted-foreground mt-2">{notif.time}</p>
               </div>
             </motion.div>
           ))}
         </div>
       </div>
     </DashboardLayout>
   );
 }