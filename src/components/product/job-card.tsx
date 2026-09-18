import { Link } from "@tanstack/react-router";
import { Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MatchScore } from "./scores";
import type { Job } from "@/lib/types";

export function JobCard({ job, score }: { job: Job; score?: number | null }) {
  const analysis = job.analysis;
  const topSkills = analysis ? [...analysis.requiredSkills, ...analysis.technologies].slice(0, 4) : [];

  return (
    <Card className="transition-shadow hover:shadow-[var(--shadow-soft)]">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{job.title || "Vaga sem título"}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
              <Building2 className="size-3.5 shrink-0" aria-hidden />
              {job.company || "Empresa não informada"}
            </p>
            {job.location && (
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                {job.location}
                {job.work_model ? ` • ${job.work_model}` : ""}
              </p>
            )}
          </div>
          {typeof score === "number" ? (
            <MatchScore score={score} size="sm" showLabel={false} />
          ) : (
            <Badge variant="outline">Sem análise</Badge>
          )}
        </div>

        {topSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="font-normal">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          {job.is_demo && <Badge variant="outline">Dados de demonstração</Badge>}
          <Button asChild size="sm" variant="secondary" className="ml-auto">
            <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
              Ver vaga
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
