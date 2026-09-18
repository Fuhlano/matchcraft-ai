import { AlertCircle, Check, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { MatchStatus } from "@/lib/types";

export function SkillBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Badge variant="secondary" className={cn("font-normal", className)}>
      {children}
    </Badge>
  );
}

const STATUS_STYLES: Record<MatchStatus, string> = {
  match: "border-success/30 bg-success/10 text-success",
  partial: "border-warning/30 bg-warning/10 text-warning",
  gap: "border-primary/30 bg-primary/10 text-primary",
};

const STATUS_ICON: Record<MatchStatus, React.ElementType> = {
  match: Check,
  partial: CircleDashed,
  gap: AlertCircle,
};

export function RequirementBadge({
  label,
  status,
  required,
}: {
  label: string;
  status: MatchStatus;
  required?: boolean;
}) {
  const Icon = STATUS_ICON[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
      {required && <span className="opacity-70">· obrigatório</span>}
    </span>
  );
}

export function GapBadge({ label, kind }: { label: string; kind: "critical" | "partial" | "desirable" }) {
  const map = {
    critical: { text: "Gap crítico", cls: "border-primary/30 bg-primary/10 text-primary" },
    partial: { text: "Gap parcial", cls: "border-warning/30 bg-warning/10 text-warning" },
    desirable: { text: "Gap desejável", cls: "border-border bg-muted text-muted-foreground" },
  }[kind];
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs", map.cls)}>
      <strong className="font-semibold">{label}</strong>
      <span className="opacity-80">{map.text}</span>
    </span>
  );
}
