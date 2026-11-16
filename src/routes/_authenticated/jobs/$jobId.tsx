import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MatchScore } from "@/components/product/scores";
import { GapAnalysis, MatchBreakdown, MatchEvidence } from "@/components/product/match-breakdown";
import { RequirementBadge } from "@/components/product/badges";
import { supabase } from "@/integrations/supabase/client";
import { analyzeJob, saveMatch } from "@/lib/job-actions";
import { buildResumeContent } from "@/lib/resume-builder";
import { calculateAtsScore } from "@/lib/ats";
import { matchLevel } from "@/lib/matching";
import { notify, requireUserId, useInvalidate, useJob, useMasterProfile, useMatch } from "@/lib/queries";
import type { MatchBreakdownItem, MatchItem, MatchResult } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/jobs/$jobId")({
  head: () => ({
    meta: [
      { title: "Análise da vaga — MatchCV" },
      { name: "description", content: "Compatibilidade estimada, requisitos atendidos e gaps desta vaga." },
      { property: "og:title", content: "Análise da vaga — MatchCV" },
      { property: "og:description", content: "Veja onde seu perfil combina com esta vaga e o que falta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JobDetail,
});

function JobDetail() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const { data: job, isLoading } = useJob(jobId);
  const { data: match } = useMatch(jobId);
  const { data: profile } = useMasterProfile();
  const [busy, setBusy] = useState(false);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!job) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-muted-foreground">Vaga não encontrada.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/jobs">Voltar para minhas vagas</Link>
        </Button>
      </div>
    );
  }

  const breakdown = ((match?.breakdown as { items?: MatchBreakdownItem[] } | null)?.items ?? []) as
    MatchBreakdownItem[];
  const items = ((match?.details as { items?: MatchItem[] } | null)?.items ?? []) as MatchItem[];
  const score = match?.score ?? null;
  const result: MatchResult | null =
    score === null ? null : { score, level: matchLevel(score).label, breakdown, items };

  async function reanalyze() {
    if (!profile || !job) return;
    setBusy(true);
    try {
      const analysis = await analyzeJob(job, profile.profile.ai_analysis_enabled);
      await saveMatch(profile, { ...job, analysis }, analysis);
      invalidate(["jobs", "job", "match"]);
      toast.success("Análise atualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível reanalisar.");
    } finally {
      setBusy(false);
    }
  }

  async function generateResume() {
    if (!profile || !job) return;
    if (!profile.experiences.length && !profile.skills.length) {
      toast.error("Complete seu perfil profissional antes de gerar um currículo.");
      return;
    }
    setBusy(true);
    try {
      const content = buildResumeContent(profile, {
        analysis: job.analysis,
        match: result,
        jobTitle: job.title,
      });
      const ats = calculateAtsScore(content, job.analysis?.keywords ?? []);
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: userId,
          job_id: job.id,
          title: `${job.title}${job.company ? ` — ${job.company}` : ""}`,
          company: job.company,
          template: "classic",
          content: content as never,
          ats_score: ats.score,
          ats_breakdown: ats.breakdown as never,
        })
        .select("id")
        .single();
      if (error) throw error;
      await supabase.from("resume_versions").insert({
        user_id: userId,
        resume_id: data.id,
        version: 1,
        content: content as never,
        ats_score: ats.score,
        note: "Versão inicial gerada a partir do perfil mestre",
      });
      await notify("Currículo gerado", `${job.title} — ATS Score estimado ${ats.score}/100.`);
      invalidate(["resumes", "notifications"]);
      navigate({ to: "/resumes/$resumeId", params: { resumeId: data.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar o currículo.");
    } finally {
      setBusy(false);
    }
  }

  async function saveApplication() {
    if (!job) return;
    const userId = await requireUserId();
    const { error } = await supabase
      .from("applications")
      .insert({ user_id: userId, job_id: job.id, status: "saved" });
    if (error) {
      toast.error("Não foi possível salvar a candidatura.");
      return;
    }
    invalidate(["applications"]);
    toast.success("Vaga adicionada às suas candidaturas.");
  }

  async function removeJob() {
    if (!job) return;
    await supabase.from("matches").delete().eq("job_id", job.id);
    await supabase.from("job_requirements").delete().eq("job_id", job.id);
    await supabase.from("jobs").delete().eq("id", job.id);
    invalidate(["jobs"]);
    navigate({ to: "/jobs" });
  }

  const analysis = job.analysis;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={job.title}
        description={[job.company, job.location, job.work_model, job.seniority].filter(Boolean).join(" • ")}
        actions={
          <>
            <Button variant="outline" onClick={reanalyze} disabled={busy}>
              <RefreshCw className="size-4" aria-hidden />
              Reanalisar
            </Button>
            <Button variant="outline" onClick={saveApplication}>
              Salvar candidatura
            </Button>
            <Button onClick={generateResume} disabled={busy}>
              Gerar currículo
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Excluir vaga">
                  <Trash2 className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir esta vaga?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A análise e o match desta vaga também serão removidos. Currículos já gerados permanecem na
                    sua biblioteca.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={removeJob}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {result ? (
            <>
              <MatchBreakdown match={result} />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Onde seu perfil combina</CardTitle>
                </CardHeader>
                <CardContent>
                  <MatchEvidence items={items} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">O que falta</CardTitle>
                </CardHeader>
                <CardContent>
                  <GapAnalysis items={items} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Esta vaga ainda não tem match calculado. Use “Reanalisar” para gerar a análise.
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Descrição original</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {job.description}
              </p>
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  Abrir anúncio original
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-6">
              {score === null ? (
                <p className="text-sm text-muted-foreground">Sem match calculado</p>
              ) : (
                <>
                  <MatchScore score={score} size="lg" />
                  <p className="text-center text-xs text-muted-foreground">
                    Compatibilidade estimada entre o seu perfil e os requisitos identificados. Não é previsão
                    de contratação.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {analysis && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Requisitos obrigatórios</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5">
                  {analysis.requiredSkills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum identificado na descrição.</p>
                  ) : (
                    analysis.requiredSkills.map((skill) => (
                      <RequirementBadge key={skill} label={skill} status="gap" required />
                    ))
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Diferenciais</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5">
                  {analysis.desirableSkills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum identificado na descrição.</p>
                  ) : (
                    analysis.desirableSkills.map((skill) => (
                      <RequirementBadge key={skill} label={skill} status="gap" required={false} />
                    ))
                  )}
                </CardContent>
              </Card>
              {analysis.responsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Responsabilidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      {analysis.responsibilities.slice(0, 8).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {analysis.keywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Palavras-chave da vaga</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1.5">
                    {analysis.keywords.slice(0, 20).map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="font-normal">
                        {keyword}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
