import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ATSScore } from "@/components/product/scores";
import { ResumePreview, type ResumeTemplate } from "@/components/product/resume-preview";
import { supabase } from "@/integrations/supabase/client";
import { calculateAtsScore, ATS_LABEL, ATS_MAX } from "@/lib/ats";
import { rewriteTextAI } from "@/lib/ai.functions";
import { exportResumeDocx, exportResumePdf } from "@/lib/export-resume";
import { notify, requireUserId, useInvalidate, useMasterProfile } from "@/lib/queries";
import type { AtsBreakdown, ResumeContent } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/resumes/$resumeId")({
  head: () => ({
    meta: [
      { title: "Editor de currículo — MatchCV" },
      { name: "description", content: "Edite, otimize e exporte o currículo adaptado para a vaga." },
      { property: "og:title", content: "Editor de currículo — MatchCV" },
      { property: "og:description", content: "Currículo ATS-friendly com ATS Score estimado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResumeEditor,
});

type Suggestion = { field: string; text: string; missing: string[] };

function ResumeEditor() {
  const { resumeId } = Route.useParams();
  const invalidate = useInvalidate();
  const { data: profile } = useMasterProfile();
  const { data: resume, isLoading } = useQuery({
    queryKey: ["resume", resumeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("resumes").select("*, jobs(title, description, analysis)").eq("id", resumeId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: versions } = useQuery({
    queryKey: ["resume-versions", resumeId],
    queryFn: async () => (await supabase.from("resume_versions").select("*").eq("resume_id", resumeId).order("version", { ascending: false })).data ?? [],
  });
  const [content, setContent] = useState<ResumeContent | null>(null);
  const [template, setTemplate] = useState<ResumeTemplate>("classic");
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (resume) { setContent(resume.content as unknown as ResumeContent); setTemplate(resume.template as ResumeTemplate); }
  }, [resume]);

  if (isLoading || !content || !resume) return <Skeleton className="h-96 w-full" />;
  const job = resume.jobs as { title: string; description: string; analysis: { keywords?: string[] } | null } | null;
  const ats = calculateAtsScore(content, job?.analysis?.keywords ?? []);

  async function ask(action: "summary" | "experience" | "keywords" | "concise" | "results" | "trim", field: string, text: string) {
    if (!profile?.profile.ai_analysis_enabled) { toast.error("A IA está desativada nas configurações."); return; }
    if (text.trim().length < 5) { toast.error("Não há texto suficiente para otimizar."); return; }
    setBusy(true);
    try {
      const r = await rewriteTextAI({ data: { action, text, context: job?.description ?? "" } });
      setSuggestion({ field, text: r.suggestion, missing: r.missingInfo ?? [] });
    } catch { toast.error("Não foi possível gerar a sugestão."); } finally { setBusy(false); }
  }

  function apply() {
    if (!suggestion || !content) return;
    if (suggestion.field === "summary") setContent({ ...content, summary: suggestion.text });
    else {
      const i = Number(suggestion.field);
      const exps = [...content.experiences];
      exps[i] = { ...exps[i]!, bullets: suggestion.text.split("\n").map((s) => s.replace(/^[•\-\s]+/, "").trim()).filter(Boolean) };
      setContent({ ...content, experiences: exps });
    }
    setSuggestion(null);
  }

  async function save() {
    if (!content) return;
    const userId = await requireUserId();
    await supabase.from("resumes").update({ content: content as never, template, ats_score: ats.score, ats_breakdown: ats.breakdown as never }).eq("id", resumeId);
    if (profile?.profile.keep_version_history) {
      const next = (versions?.[0]?.version ?? 0) + 1;
      await supabase.from("resume_versions").insert({ user_id: userId, resume_id: resumeId, version: next, content: content as never, ats_score: ats.score, note: "Edição manual" });
    }
    invalidate(["resumes", "resume", "resume-versions"]);
    toast.success("Currículo salvo.");
  }

  async function restore(v: { content: unknown }) { setContent(v.content as ResumeContent); toast.info("Versão carregada. Salve para manter."); }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={resume.title} description="Edite à esquerda e confira o resultado à direita."
        actions={<>
          <Select value={template} onValueChange={(v) => setTemplate(v as ResumeTemplate)}>
            <SelectTrigger className="w-36" aria-label="Template"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="classic">Classic</SelectItem><SelectItem value="modern">Modern</SelectItem><SelectItem value="minimal">Minimal</SelectItem></SelectContent>
          </Select>
          <Button variant="outline" onClick={() => { exportResumePdf(); notify("Exportação", "PDF gerado."); }}>Exportar PDF</Button>
          <Button variant="outline" onClick={() => exportResumeDocx(content, resume.title)}>Exportar DOCX</Button>
          <Button onClick={save}>Salvar versão</Button>
        </>} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-4 print:hidden">
          <Card><CardContent className="space-y-3 p-5">
            <ATSScore score={ats.score} />
            {(Object.keys(ATS_MAX) as (keyof AtsBreakdown)[]).map((k) => (
              <div key={k} className="flex justify-between text-sm"><span className="text-muted-foreground">{ATS_LABEL[k]}</span><span className="tabular-nums">{ats.breakdown[k]}/{ATS_MAX[k]}</span></div>
            ))}
            {ats.tips.length > 0 && <ul className="list-disc pl-4 text-xs text-muted-foreground">{ats.tips.map((t) => <li key={t}>{t}</li>)}</ul>}
          </CardContent></Card>

          {suggestion && (
            <Card className="border-primary/40"><CardHeader><CardTitle className="text-base">Sugestão da IA</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="whitespace-pre-wrap text-sm">{suggestion.text}</p>
                {suggestion.missing.length > 0 && (
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p className="font-medium">Você possui essa informação?</p>
                    <ul className="list-disc pl-4 text-muted-foreground">{suggestion.missing.map((m) => <li key={m}>{m}</li>)}</ul>
                    <p className="mt-1 text-xs text-muted-foreground">Se sim, adicione no seu perfil profissional. Nada foi inventado.</p>
                  </div>
                )}
                <div className="flex gap-2"><Button size="sm" onClick={apply}>Aplicar</Button><Button size="sm" variant="ghost" onClick={() => setSuggestion(null)}>Manter como está</Button></div>
              </CardContent></Card>
          )}

          <Card><CardContent className="space-y-2 p-5">
            <Label htmlFor="sum">Resumo profissional</Label>
            <Textarea id="sum" rows={5} value={content.summary} onChange={(e) => setContent({ ...content, summary: e.target.value })} />
            <div className="flex flex-wrap gap-1">
              <Button size="sm" variant="outline" disabled={busy} onClick={() => ask("summary", "summary", content.summary)}><Sparkles className="size-3.5" />Melhorar resumo</Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => ask("keywords", "summary", content.summary)}>Adicionar palavras-chave</Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => ask("concise", "summary", content.summary)}>Tornar objetivo</Button>
            </div>
          </CardContent></Card>

          {content.experiences.map((exp, i) => (
            <Card key={i}><CardContent className="space-y-2 p-5">
              <Label htmlFor={`exp-${i}`}>{exp.role} — {exp.company}</Label>
              <Textarea id={`exp-${i}`} rows={5} value={exp.bullets.join("\n")} onChange={(e) => {
                const exps = [...content.experiences]; exps[i] = { ...exp, bullets: e.target.value.split("\n") }; setContent({ ...content, experiences: exps });
              }} />
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="outline" disabled={busy} onClick={() => ask("experience", String(i), exp.bullets.join("\n"))}>Melhorar experiência</Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => ask("results", String(i), exp.bullets.join("\n"))}>Destacar resultados</Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => ask("trim", String(i), exp.bullets.join("\n"))}>Reduzir irrelevante</Button>
              </div>
            </CardContent></Card>
          ))}

          <Card><CardHeader><CardTitle className="text-base">Versões</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(versions ?? []).map((v) => (
                <div key={v.id} className="flex items-center justify-between"><span>v{v.version} · ATS {v.ats_score} · {new Date(v.created_at).toLocaleString("pt-BR")}</span><Button size="sm" variant="ghost" onClick={() => restore(v)}>Restaurar</Button></div>
              ))}
            </CardContent></Card>
        </div>
        <div className="lg:sticky lg:top-20 lg:self-start"><ResumePreview resume={content} template={template} /></div>
      </div>
    </div>
  );
}
