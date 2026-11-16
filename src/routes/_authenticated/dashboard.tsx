import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, FileText, Kanban, Target } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardsSkeleton, EmptyState } from "@/components/product/states";
import { JobCard } from "@/components/product/job-card";
import { ProfileCompleteness } from "@/components/product/profile-completeness";
import { GapBadge, SkillBadge } from "@/components/product/badges";
import { useApplications, useJobs, useMasterProfile, useResumes } from "@/lib/queries";
import { APPLICATION_STATUS_LABEL } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MatchCV" },
      { name: "description", content: "Match médio, vagas salvas, candidaturas e currículos gerados." },
      { property: "og:title", content: "Dashboard — MatchCV" },
      { property: "og:description", content: "Acompanhe seus matches, currículos e candidaturas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: profile } = useMasterProfile();
  const { data: jobs, isLoading } = useJobs();
  const { data: resumes } = useResumes();
  const { data: applications } = useApplications();

  const scored = (jobs ?? []).map((job) => ({ job, score: job.matches?.[0]?.score ?? null }));
  const withScore = scored.filter((s) => s.score !== null) as { job: (typeof scored)[number]["job"]; score: number }[];
  const avgMatch = withScore.length
    ? Math.round(withScore.reduce((acc, s) => acc + s.score, 0) / withScore.length)
    : null;
  const avgAts = resumes?.length
    ? Math.round(resumes.reduce((acc, r) => acc + (r.ats_score ?? 0), 0) / resumes.length)
    : null;

  const recommended = [...withScore].sort((a, b) => b.score - a.score).slice(0, 4);

  const skillCount = new Map<string, number>();
  const gapCount = new Map<string, number>();
  for (const job of jobs ?? []) {
    for (const skill of job.analysis?.requiredSkills ?? []) {
      skillCount.set(skill, (skillCount.get(skill) ?? 0) + 1);
    }
    const details = (job.matches?.[0] as { details?: { items?: { label: string; status: string }[] } } | undefined)
      ?.details;
    for (const item of details?.items ?? []) {
      if (item.status === "gap") gapCount.set(item.label, (gapCount.get(item.label) ?? 0) + 1);
    }
  }
  const topSkills = [...skillCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topGaps = [...gapCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  const statusCount = new Map<string, number>();
  for (const app of applications ?? []) {
    statusCount.set(app.status, (statusCount.get(app.status) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`Olá${profile?.profile.full_name ? `, ${profile.profile.full_name.split(" ")[0]}` : ""}`}
        description="Compatibilidade estimada entre seu perfil e os requisitos das vagas analisadas."
        actions={
          <Button asChild>
            <Link to="/jobs/new">Encontrar meu Match</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Target} label="Match médio" value={avgMatch === null ? "—" : `${avgMatch}%`} />
        <Metric icon={Briefcase} label="Vagas analisadas" value={String(jobs?.length ?? 0)} />
        <Metric
          icon={FileText}
          label="Currículos gerados"
          value={String(resumes?.length ?? 0)}
          hint={avgAts === null ? undefined : `ATS médio ${avgAts}/100`}
        />
        <Metric icon={Kanban} label="Candidaturas" value={String(applications?.length ?? 0)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Vagas mais compatíveis</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/jobs">Ver todas</Link>
              </Button>
            </div>
            {isLoading ? (
              <CardsSkeleton count={2} />
            ) : recommended.length === 0 ? (
              <EmptyState
                title="Vamos começar."
                description="Adicione uma vaga para calcular sua compatibilidade e ver onde seu perfil combina."
                actionLabel="Analisar vaga"
                actionTo="/jobs/new"
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {recommended.map(({ job, score }) => (
                  <JobCard key={job.id} job={job} score={score} />
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Competências mais solicitadas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {topSkills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Analise vagas para ver este resumo.</p>
                ) : (
                  topSkills.map(([skill, count]) => (
                    <SkillBadge key={skill}>
                      {skill} · {count}
                    </SkillBadge>
                  ))
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Principais gaps</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {topGaps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum gap identificado nas vagas analisadas até agora.
                  </p>
                ) : (
                  topGaps.map(([gap]) => <GapBadge key={gap} label={gap} kind="critical" />)
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        <aside className="space-y-4">
          {profile && <ProfileCompleteness profile={profile} />}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Candidaturas por status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              {statusCount.size === 0 ? (
                <p className="text-muted-foreground">Nenhuma candidatura registrada.</p>
              ) : (
                [...statusCount.entries()].map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {APPLICATION_STATUS_LABEL[status as keyof typeof APPLICATION_STATUS_LABEL] ?? status}
                    </span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string | undefined;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Icon className="size-4 text-muted-foreground" aria-hidden />
        </div>
        <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
