import { createContext, useContext, useState, ReactNode } from "react";

export type Order = {
  id: string;
  item: string;
  rejectReason?: string;
  description: string;
  from: string;
  to: string;
  meetingPoint: string;
 status: "waiting_payment" | "pending" | "processing" | "in_progress" | "cancelled" | "completed" | "rejected";
  statusLabel: string;
 traveler?: {
  name: string;
  phone: string;
} | null;
  date: string;
  price: string;
};

type OrderContextType = {
  orders: Order[];
  updateOrderStatus: (id: string, status: Order["status"], label: string) => void;
};

const initialOrders: Order[] = [
  {
    id: "ORD-001",
    item: "Sepatu Nike Air Max",
    description: "Ukuran 42, original, brand new",
    from: "Jakarta",
    to: "Bandung",
    meetingPoint: "Stasiun Gambir",
    status: "in_progress",
    statusLabel: "Dalam Perjalanan",
    traveler: { name: "Andi Pratama", phone: "0813-xxxx-2233" },
    date: "14 Feb 2026",
    price: "Rp 85.000",
  },
  {
    id: "ORD-202",
    item: "Oleh-oleh Bakpia Pathok",
    description: "Box besar, fragile, total 20 pcs",
    from: "Yogyakarta",
    to: "Jakarta",
    meetingPoint: "Stasiun Tugu Yogyakarta",
    status: "pending",
    statusLabel: "Menunggu Konfirmasi Traveler",
    traveler: { name: "Sari Dewi", phone: "0814-xxxx-5678" },
    date: "15 Feb 2026",
    price: "Rp 45.000",
  },
  {
    id: "ORD-205",
    item: "Laptop ASUS ROG",
    description: "Box besar, fragile, total 1 pcs",
    from: "Batam",
    to: "Yogyakarta",
    meetingPoint: "Bandara Hang Nadim Batam",
    status: "processing",
    statusLabel: "Sedang Diproses",
    traveler: { name: "Sudewi", phone: "0813-xxxx-5978" },
    date: "18 Aug 2026",
    price: "Rp 25.000.000",
  },

  {
  id: "ORD-000",
  item: "Titip Beli Parfum Zara",
  description: "Parfum 100ml, request box & bubble wrap",
  from: "Jakarta",
  to: "Semarang",
  meetingPoint: "Mall Grand Indonesia",
  status: "waiting_payment",
  statusLabel: "Menunggu Pembayaran",
  traveler: {
    name: "-",
    phone: "-",
  },
  date: "21 Feb 2026",
  price: "Rp 120.000",
},
{
  id: "ORD-008",
  item: "Elektronik",
  description: "Headphone Bose, baru",
  from: "Yogyakarta",
  to: "Batam",
  meetingPoint: "Bandara Adisutjipto",
  status: "rejected",
  statusLabel: "Ditolak Traveler",
  traveler: null, // ga ada traveler karena ditolak
  rejectReason: "Rute tidak sesuai",
  date: "14 Feb 2026",
  price: "Rp 0",
},
];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const updateOrderStatus = (id: string, status: Order["status"], label: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status, statusLabel: label } : o))
    );
  };

  return (
    <OrderContext.Provider value={{ orders, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used within OrderProvider");
  return context;
};