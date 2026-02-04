import { cn } from "@/lib/utils";

type StatusType = "pending" | "in_progress" | "completed" | "cancelled" | "active" | "inactive" | "verified";

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
  in_progress: {
    label: "Dalam Proses",
    className: "bg-info/20 text-info border-info/30",
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
  verified: {
    label: "Terverifikasi",
    className: "bg-primary/20 text-primary border-primary/30",
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
              status === "pending" && "bg-warning",
              status === "active" && "bg-success"
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              status === "in_progress" && "bg-info",
              status === "pending" && "bg-warning",
              status === "active" && "bg-success"
            )}
          />
        </span>
      )}
      {displayLabel}
    </span>
  );
}