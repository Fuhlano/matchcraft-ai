import { Link } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { profileCompleteness } from "@/lib/resume-builder";
import type { MasterProfile } from "@/lib/types";

export function ProfileCompleteness({ profile }: { profile: MasterProfile }) {
  const { percent, checks } = profileCompleteness(profile);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Perfil profissional</CardTitle>
        <p className="text-sm text-muted-foreground">{percent}% completo</p>
        <Progress value={percent} className="mt-2" aria-label="Completude do perfil" />
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
          {checks.map((check) => (
            <li key={check.label} className="flex items-center gap-2">
              {check.ok ? (
                <Check className="size-4 text-success" aria-hidden />
              ) : (
                <Minus className="size-4 text-primary" aria-hidden />
              )}
              <span className={check.ok ? "" : "text-muted-foreground"}>{check.label}</span>
            </li>
          ))}
        </ul>
        {percent < 100 && (
          <Button asChild variant="secondary" size="sm">
            <Link to="/profile">Completar perfil</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
