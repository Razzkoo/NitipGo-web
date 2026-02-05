 import { motion } from "framer-motion";
 import { Bell, UserCheck, AlertTriangle, Shield, Settings, Trash2 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { useToast } from "@/hooks/use-toast";
 
 const notifications = [
   {
     id: 1,
     type: "verification",
     title: "Verifikasi Baru",
     message: "3 akun traveler baru menunggu verifikasi identitas.",
     time: "15 menit lalu",
     read: false,
     icon: UserCheck,
     color: "text-primary",
   },
   {
     id: 2,
     type: "dispute",
     title: "Dispute Baru",
     message: "Customer melaporkan masalah dengan order ORD-456.",
     time: "1 jam lalu",
     read: false,
     icon: AlertTriangle,
     color: "text-destructive",
   },
   {
     id: 3,
     type: "security",
     title: "Aktivitas Mencurigakan",
     message: "Terdeteksi login dari lokasi tidak biasa pada akun admin.",
     time: "3 jam lalu",
     read: true,
     icon: Shield,
     color: "text-warning",
   },
   {
     id: 4,
     type: "system",
     title: "Update Sistem",
     message: "Pembaruan sistem berhasil diterapkan. Versi 2.1.0",
     time: "1 hari lalu",
     read: true,
     icon: Settings,
     color: "text-muted-foreground",
   },
 ];
 
 export default function AdminNotifications() {
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
     <DashboardLayout role="admin">
       <div className="p-6 md:p-8 lg:p-10">
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
         >
           <div>
             <h1 className="text-2xl font-bold text-foreground md:text-3xl">Notifikasi Admin</h1>
             <p className="text-muted-foreground mt-1">Update sistem dan aktivitas penting</p>
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
                 !notif.read ? "border-l-4 border-destructive" : ""
               }`}
             >
               <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                 notif.read ? "bg-muted" : "bg-destructive/10"
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