import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GapBadge, SkillBadge } from "@/components/product/badges";
import { EmptyState } from "@/components/product/states";
import { useJobs } from "@/lib/queries";
import type { MatchItem } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Meu mercado — MatchCV" },
      {
        name: "description",
        content: "Competências mais solicitadas, gaps recorrentes e cargos compatíveis nas vagas que você analisou.",
      },
      { property: "og:title", content: "Meu mercado — MatchCV" },
      { property: "og:description", content: "Insights das vagas que você analisou." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Insights,
});

function Insights() {
  const { data: jobs } = useJobs();
  const analyzed = (jobs ?? []).filter((job) => job.analysis);

  const count = (values: string[], map: Map<string, number>) => {
    for (const value of values) {
      const key = value.trim();
      if (key) map.set(key, (map.get(key) ?? 0) + 1);
    }
  };

  const skills = new Map<string, number>();
  const soft = new Map<string, number>();
  const keywords = new Map<string, number>();
  const gaps = new Map<string, number>();
  const partial = new Map<string, number>();
  const roles = new Map<string, number>();

  for (const job of analyzed) {
    count(job.analysis!.requiredSkills, skills);
    count(job.analysis!.technologies, skills);
    count(job.analysis!.softSkills, soft);
    count(job.analysis!.keywords, keywords);
    const score = job.matches?.[0]?.score ?? 0;
    if (score >= 75) count([job.title], roles);
    const items = ((job.matches?.[0] as { details?: { items?: MatchItem[] } } | undefined)?.details?.items ??
      []) as MatchItem[];
    count(
      items.filter((i) => i.status === "gap").map((i) => i.label),
      gaps,
    );
    count(
      items.filter((i) => i.status === "partial").map((i) => i.label),
      partial,
    );
  }

  const top = (map: Map<string, number>, limit = 12) =>
    [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);

  if (analyzed.length === 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Meu mercado" description="Insights a partir das vagas que você analisou." />
        <EmptyState
          title="Ainda sem dados suficientes"
          description="Analise algumas vagas para ver competências mais solicitadas, gaps recorrentes e cargos compatíveis."
          actionLabel="Analisar vaga"
          actionTo="/jobs/new"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Meu mercado"
        description={`Baseado em ${analyzed.length} ${analyzed.length === 1 ? "vaga analisada" : "vagas analisadas"}. Estes dados descrevem os anúncios, não uma previsão de contratação.`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel
          title="Competências mais solicitadas"
          description="Itens que aparecem com mais frequência nos requisitos."
        >
          {top(skills).map(([label, n]) => (
            <SkillBadge key={label}>
              {label} · {n}
            </SkillBadge>
          ))}
        </Panel>

        <Panel title="Competências a desenvolver" description="Requisitos que não encontramos no seu perfil.">
          {top(gaps).map(([label]) => (
            <GapBadge key={label} label={label} kind="critical" />
          ))}
        </Panel>

        <Panel
          title="Correspondências parciais"
          description="Você tem algo próximo — vale revisar a terminologia usada no currículo."
        >
          {top(partial).map(([label]) => (
            <GapBadge key={label} label={label} kind="partial" />
          ))}
        </Panel>

        <Panel title="Soft skills recorrentes" description="Comportamentos citados nas descrições.">
          {top(soft).map(([label, n]) => (
            <SkillBadge key={label}>
              {label} · {n}
            </SkillBadge>
          ))}
        </Panel>

        <Panel title="Cargos mais compatíveis" description="Vagas com compatibilidade estimada de 75% ou mais.">
          {top(roles).map(([label]) => (
            <SkillBadge key={label}>{label}</SkillBadge>
          ))}
        </Panel>

        <Panel title="Termos recorrentes" description="Vocabulário frequente nos anúncios do seu mercado.">
          {top(keywords, 20).map(([label]) => (
            <SkillBadge key={label}>{label}</SkillBadge>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const isEmpty = !Array.isArray(children) || children.length === 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        {isEmpty ? <p className="text-sm text-muted-foreground">Nada identificado até agora.</p> : children}
      </CardContent>
    </Card>
  );
}
