import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CardsSkeleton, EmptyState } from "@/components/product/states";
import { supabase } from "@/integrations/supabase/client";
import { requireUserId, useInvalidate, useResumes } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/resumes/")({
  head: () => ({
    meta: [
      { title: "Currículos — MatchCV" },
      { name: "description", content: "Biblioteca de currículos adaptados por vaga, com ATS Score estimado." },
      { property: "og:title", content: "Currículos — MatchCV" },
      { property: "og:description", content: "Seus currículos adaptados por vaga." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResumesPage,
});

function ResumesPage() {
  const { data, isLoading } = useResumes();
  const invalidate = useInvalidate();
  const [q, setQ] = useState("");
  const [minAts, setMinAts] = useState(0);
  const list = (data ?? []).filter(
    (r) => `${r.title} ${r.company ?? ""}`.toLowerCase().includes(q.toLowerCase()) && r.ats_score >= minAts,
  );

  async function duplicate(id: string) {
    const r = data?.find((x) => x.id === id);
    if (!r) return;
    const userId = await requireUserId();
    await supabase.from("resumes").insert({
      user_id: userId, job_id: r.job_id, title: `${r.title} (cópia)`, company: r.company,
      template: r.template, content: r.content, ats_score: r.ats_score, ats_breakdown: r.ats_breakdown,
    });
    invalidate(["resumes"]);
    toast.success("Currículo duplicado.");
  }
  async function remove(id: string) {
    await supabase.from("applications").update({ resume_id: null }).eq("resume_id", id);
    await supabase.from("resume_versions").delete().eq("resume_id", id);
    await supabase.from("resumes").delete().eq("id", id);
    invalidate(["resumes"]);
    toast.success("Currículo excluído.");
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Currículos" description="Versões adaptadas para cada vaga analisada." />
      <div className="mb-5 flex flex-wrap gap-3">
        <Input aria-label="Buscar por cargo ou empresa" placeholder="Cargo ou empresa" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Input aria-label="ATS mínimo" type="number" min={0} max={100} value={minAts} onChange={(e) => setMinAts(Number(e.target.value) || 0)} className="w-32" />
      </div>
      {isLoading ? <CardsSkeleton /> : list.length === 0 ? (
        <EmptyState title="Nenhum currículo ainda" description="Analise uma vaga e use “Gerar currículo” para criar a primeira versão." actionLabel="Analisar vaga" actionTo="/jobs/new" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-3 p-5">
                <Link to="/resumes/$resumeId" params={{ resumeId: r.id }} className="font-semibold hover:underline">{r.title}</Link>
                <p className="text-sm text-muted-foreground">ATS Score estimado {r.ats_score}/100 · {new Date(r.updated_at).toLocaleDateString("pt-BR")}</p>
                <div className="flex gap-1">
                  <Button asChild size="sm" variant="outline"><Link to="/resumes/$resumeId" params={{ resumeId: r.id }}>Abrir</Link></Button>
                  <Button size="icon" variant="ghost" aria-label="Duplicar" onClick={() => duplicate(r.id)}><Copy className="size-4" /></Button>
                  <Button size="icon" variant="ghost" aria-label="Excluir" onClick={() => remove(r.id)}><Trash2 className="size-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
