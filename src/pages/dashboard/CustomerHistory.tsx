 import { motion } from "framer-motion";
 import { Link } from "react-router-dom";
 import { Clock, Package, ArrowRight, Star, CheckCircle, XCircle } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { StatusBadge } from "@/components/ui/StatusBadge";
 import { EmptyState } from "@/components/ui/EmptyState";
 
const historyOrders = [
  {
    id: "ORD-002",
    item: "Oleh-oleh Jogja",
    from: "Yogyakarta",
    to: "Jakarta",
    status: "completed" as const,
    traveler: "Sari Dewi",
    date: "10 Feb 2024",
    price: "Rp 50.000",
    rating: 0, // Not rated yet
    hasRated: false,
  },
  {
    id: "ORD-003",
    item: "Sepatu Adidas",
    from: "Surabaya",
    to: "Jakarta",
    status: "completed" as const,
    traveler: "Budi Santoso",
    date: "5 Feb 2024",
    price: "Rp 65.000",
    rating: 4,
    hasRated: true,
  },
  {
    id: "ORD-004",
    item: "Elektronik",
    from: "Bandung",
    to: "Jakarta",
    status: "cancelled" as const,
    traveler: "-",
    date: "1 Feb 2024",
    price: "Rp 0",
    rating: 0,
    hasRated: false,
  },
];
 
 export default function CustomerHistory() {
   return (
     <DashboardLayout role="customer">
       <div className="p-6 md:p-8 lg:p-10">
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-8"
         >
           <h1 className="text-2xl font-bold text-foreground md:text-3xl">Riwayat Order</h1>
           <p className="text-muted-foreground mt-1">Lihat semua order yang sudah selesai</p>
         </motion.div>
 
         {historyOrders.length > 0 ? (
           <div className="space-y-4">
             {historyOrders.map((order, i) => (
               <motion.div
                 key={order.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.05 }}
                 className="rounded-2xl bg-card p-5 shadow-card"
               >
                 <div className="flex flex-col md:flex-row md:items-center gap-4">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                       <span className="text-sm font-medium text-muted-foreground">{order.id}</span>
                       <StatusBadge status={order.status} size="sm" />
                     </div>
                     <p className="font-semibold text-foreground text-lg">{order.item}</p>
                     <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                       <span>{order.from}</span>
                       <ArrowRight className="h-3 w-3" />
                       <span>{order.to}</span>
                     </div>
                   </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="text-left md:text-right">
                        <p className="text-sm text-muted-foreground">{order.date}</p>
                        <p className="font-semibold text-primary">{order.price}</p>
                        {order.hasRated && order.rating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: order.rating }).map((_, j) => (
                              <Star key={j} className="h-3 w-3 fill-warning text-warning" />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/order/${order.id}`}>Detail</Link>
                        </Button>
                        {order.status === "completed" && !order.hasRated && (
                          <Button variant="default" size="sm" asChild>
                            <Link to={`/order/${order.id}`}>
                              <Star className="h-3 w-3 mr-1" />
                              Beri Rating
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                 </div>
               </motion.div>
             ))}
           </div>
         ) : (
           <EmptyState
             icon={Clock}
             title="Belum ada riwayat"
             description="Order yang sudah selesai akan muncul di sini"
           />
         )}
       </div>
     </DashboardLayout>
   );
 }