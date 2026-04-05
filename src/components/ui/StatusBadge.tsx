import { cn } from "@/lib/utils";

export type StatusType = "pending" | "suspended" | "processing" | "confirmed" | "accept" | "rejected" | "in_progress" | "on_progress" | "on_the_way" | "finished" | "completed" | "cancelled" | "active" | "inactive" | "expired" | "verified" | "waiting_payment";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  pulse?: boolean;
  size?: "sm" | "md";
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: {
    label: "Menunggu",
    className: "bg-warning/20 text-warning border-warning/30",
  },
   waiting_payment: {
    label: "Menunggu Pembayaran",
    className: "bg-warning/20 text-warning border-warning/30",
  },
  in_progress: {
    label: "Dalam Perjalanan",
    className: "bg-info/20 text-info border-info/30",
  },
  on_progress: {
    label: "Dalam Proses",  
    className: "bg-violet-50 text-violet-700 border-violet-100",
  },
  on_the_way: {
    label: "Dalam Perjalanan",
    className: "bg-sky-50 text-sky-700 border-sky-100",
  },
  finished: {
    label: "Selesai",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  processing: {
  label: "Sedang Diproses",
  className: "bg-orange-500/20 text-orange-500 border-orange-500/30",
  },
  confirmed: {
    label: "Dikonfirmasi",
    className: "bg-success/20 text-success border-success/30",
  },
  accept: {
    label: "Diterima",
    className: "bg-success/20 text-success border-success/30",
  },
  rejected: {
    label: "Ditolak",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  completed: {
    label: "Selesai",
    className: "bg-success/20 text-success border-success/30",
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  active: {
    label: "Aktif",
    className: "bg-success/20 text-success border-success/30",
  },
  inactive: {
    label: "Tidak Aktif",
    className: "bg-muted text-muted-foreground border-border",
  },
  expired: {
    label: "Kedaluwarsa",
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
  verified: {
    label: "Terverifikasi",
    className: "bg-primary/20 text-primary border-primary/30",
  },
  suspended: {
    label: "Dinonaktifkan",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function StatusBadge({ status, label, pulse = false, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        config.className,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              status === "in_progress" && "bg-info",
              status === "waiting_payment" && "bg-warning",
              status === "processing" && "bg-orange-500",
              status === "pending" && "bg-warning",
              status === "active" && "bg-success",
              status === "suspended" && "bg-muted",
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              status === "in_progress" && "bg-info",
              status === "waiting_payment" && "bg-warning",
              status === "processing" && "bg-orange-500",
              status === "pending" && "bg-warning",
              status === "active" && "bg-success",
              status === "suspended" && "bg-muted"
            )}
          />
        </span>
      )}
      {displayLabel}
    </span>
  );
}