import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        {Icon && (
          <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Icon className="size-5" aria-hidden />
          </span>
        )}
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-2">
            {actionLabel}
          </Button>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

export function ProcessingState({ title, steps, done }: { title: string; steps: string[]; done: number }) {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
        {title}
      </div>
      <ul className="space-y-2 text-sm">
        {steps.map((step, index) => (
          <li
            key={step}
            className={cn(
              "flex items-center gap-2 transition-colors",
              index < done ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-full border text-[10px]",
                index < done ? "border-success bg-success text-success-foreground" : "border-border",
              )}
              aria-hidden
            >
              {index < done ? "✓" : ""}
            </span>
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
