import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Loader2, Clock } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import api from "@/lib/api";

export default function IklanSukses() {
  const [params] = useSearchParams();
  const orderId           = params.get("order_id");
  const transactionStatus = params.get("transaction_status");

  const [status, setStatus] = useState<"loading" | "paid" | "pending">("loading");

  useEffect(() => {
    const sync = async () => {
        if (!orderId) { setStatus("pending"); return; }
        
        try {
        // Always sync backend
        const res = await api.post("/advertisements/sync-by-order", { order_id: orderId });
        setStatus(res.data.paid ? "paid" : "pending");
        } catch {
        // Fallback from query param
        if (transactionStatus === "settlement" || transactionStatus === "capture") {
            setStatus("paid");
        } else {
            setStatus("pending");
        }
        }
    };

    sync();
    }, [orderId, transactionStatus]);

  return (
    <MainLayout>
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">

          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Memverifikasi pembayaran...</p>
            </div>
          )}

          {status === "paid" && (
            <>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 mx-auto">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Pembayaran Berhasil!</h1>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  Iklan Anda sedang dalam proses review oleh tim NitipGo dan akan tayang maksimal 2×24 jam.
                </p>
              </div>
              {orderId && (
                <div className="rounded-xl bg-muted/40 border border-border/50 px-4 py-3 text-left space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Order ID: <span className="font-semibold text-foreground">{orderId}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Status: <span className="font-semibold text-emerald-600">Lunas</span>
                  </p>
                </div>
              )}
              <Link to="/"
                className="inline-flex items-center justify-center h-11 px-8 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition">
                Kembali ke Beranda
              </Link>
            </>
          )}

          {status === "pending" && (
            <>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 mx-auto">
                <Clock className="h-12 w-12 text-amber-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Pembayaran Diproses</h1>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  Pembayaran Anda sedang diverifikasi. Iklan akan aktif setelah pembayaran dikonfirmasi oleh sistem.
                </p>
              </div>
              {orderId && (
                <div className="rounded-xl bg-muted/40 border border-border/50 px-4 py-3 text-left">
                  <p className="text-xs text-muted-foreground">
                    Order ID: <span className="font-semibold text-foreground">{orderId}</span>
                  </p>
                </div>
              )}
              <Link to="/"
                className="inline-flex items-center justify-center h-11 px-8 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition">
                Kembali ke Beranda
              </Link>
            </>
          )}

        </div>
      </div>
    </MainLayout>
  );
}