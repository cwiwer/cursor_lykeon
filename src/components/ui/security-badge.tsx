import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

interface SecurityBadgeProps {
  level: "secure" | "warning" | "error";
  message: string;
  className?: string;
}

export function SecurityBadge({ level, message, className }: SecurityBadgeProps) {
  const variants = {
    secure: {
      icon: CheckCircle,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    },
    warning: {
      icon: AlertTriangle,
      className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    },
    error: {
      icon: Shield,
      className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    },
  };

  const variant = variants[level];
  const Icon = variant.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "transition-all duration-200 hover:scale-105",
        variant.className,
        className
      )}
    >
      <Icon className="w-3 h-3 mr-1" />
      {message}
    </Badge>
  );
}