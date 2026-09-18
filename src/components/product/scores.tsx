import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { matchLevel } from "@/lib/matching";
import { Progress } from "@/components/ui/progress";

interface MatchScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

/** Indicador circular de compatibilidade entre perfil e vaga. */
export function MatchScore({ score, size = "md", showLabel = true, className }: MatchScoreProps) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => setAnimated(score), 60);
    return () => window.clearTimeout(timer);
  }, [score]);

  const dimension = size === "lg" ? 168 : size === "md" ? 104 : 64;
  const stroke = size === "lg" ? 12 : size === "md" ? 8 : 6;
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;
  const level = matchLevel(score);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg width={dimension} height={dimension} className="-rotate-90" role="img" aria-label={`${score}% de compatibilidade`}>
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            strokeWidth={stroke}
            className="stroke-muted"
            fill="none"
          />
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out"
            style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-semibold tabular-nums",
              size === "lg" ? "text-5xl" : size === "md" ? "text-2xl" : "text-sm",
            )}
          >
            {score}%
          </span>
          {size === "lg" && (
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Match</span>
          )}
        </div>
      </div>
      {showLabel && <span className="text-sm text-muted-foreground">{level.label}</span>}
    </div>
  );
}

/** ATS Score estimado — compatibilidade estrutural, não garantia de aprovação. */
export function ATSScore({ score, label = "ATS Score estimado" }: { score: number; label?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-lg font-semibold tabular-nums">{score}/100</span>
      </div>
      <Progress value={score} aria-label={label} />
    </div>
  );
}
