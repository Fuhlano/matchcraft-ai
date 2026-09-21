import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardsSkeleton, EmptyState } from "@/components/product/states";
import { JobCard } from "@/components/product/job-card";
import { useJobs } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/jobs/")({
  head: () => ({
    meta: [
      { title: "Minhas vagas — MatchCV" },
      { name: "description", content: "Vagas salvas e analisadas, ordenadas por compatibilidade estimada." },
      { property: "og:title", content: "Minhas vagas — MatchCV" },
      { property: "og:description", content: "Vagas salvas e analisadas com score de compatibilidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const { data: jobs, isLoading } = useJobs();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"score" | "recent">("score");

  const filtered = (jobs ?? [])
    .filter((job) =>
      `${job.title} ${job.company} ${job.location ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => {
      if (sort === "recent") return a.created_at < b.created_at ? 1 : -1;
      return (b.matches?.[0]?.score ?? -1) - (a.matches?.[0]?.score ?? -1);
    });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Minhas vagas"
        description="Vagas salvas com a compatibilidade estimada em relação ao seu perfil."
        actions={
          <Button asChild>
            <Link to="/jobs/new">Adicionar vaga</Link>
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1 space-y-1.5">
          <Label htmlFor="job-search">Buscar</Label>
          <Input
            id="job-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cargo, empresa ou local"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="job-sort">Ordenar por</Label>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger id="job-sort" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Maior compatibilidade</SelectItem>
              <SelectItem value="recent">Mais recentes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <CardsSkeleton count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma vaga por aqui"
          description="Cole uma descrição de vaga, informe uma URL pública ou preencha os dados manualmente."
          actionLabel="Adicionar vaga"
          actionTo="/jobs/new"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} score={job.matches?.[0]?.score ?? null} />
          ))}
        </div>
      )}
    </div>
  );
}
