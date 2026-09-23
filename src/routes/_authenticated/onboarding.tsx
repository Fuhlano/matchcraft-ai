import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileUp, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ProcessingState } from "@/components/product/states";
import { supabase } from "@/integrations/supabase/client";
import { extractTextFromFile } from "@/lib/file-extract";
import { parseResumeAI, type ParsedResume } from "@/lib/ai.functions";
import { notify, requireUserId, useInvalidate } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Vamos começar — MatchCV" },
      { name: "description", content: "Monte seu perfil profissional mestre importando seu currículo atual." },
      { property: "og:title", content: "Vamos começar — MatchCV" },
      { property: "og:description", content: "Importe seu currículo e revise seu perfil profissional." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const PARSE_STEPS = ["Lendo o arquivo", "Estruturando as informações", "Preparando para revisão"];

function Onboarding() {
  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [parseStep, setParseStep] = useState(0);

  const [career, setCareer] = useState({
    full_name: "",
    desired_role: "",
    area: "",
    seniority: "",
    work_model: "",
    location: "",
  });
  const [parsed, setParsed] = useState<ParsedResume | null>(null);

  const setC = (key: keyof typeof career, value: string) => setCareer((c) => ({ ...c, [key]: value }));

  async function handleFile(file: File) {
    setProcessing(true);
    setParseStep(0);
    try {
      const text = await extractTextFromFile(file);
      if (text.trim().length < 80) {
        throw new Error("Não conseguimos ler texto suficiente deste arquivo. Tente um PDF com texto selecionável ou comece do zero.");
      }
      setParseStep(1);
      const result = (await parseResumeAI({ data: { text } })) as ParsedResume;
      setParseStep(2);
      setParsed(result);
      if (result.fullName && !career.full_name) setC("full_name", result.fullName);
      setStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível processar o arquivo.");
    } finally {
      setProcessing(false);
    }
  }

  async function saveProfile() {
    setProcessing(true);
    try {
      const userId = await requireUserId();
      const p = parsed;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: career.full_name || p?.fullName || "",
          headline: p?.headline ?? "",
          summary: p?.summary ?? "",
          email: p?.email ?? "",
          phone: p?.phone ?? "",
          location: career.location || p?.location || "",
          linkedin_url: p?.linkedin ?? "",
          portfolio_url: p?.portfolio ?? "",
          github_url: p?.github ?? "",
          desired_role: career.desired_role,
          area: career.area,
          seniority: career.seniority,
          work_model: career.work_model,
          onboarding_completed: true,
        })
        .eq("id", userId);
      if (error) throw error;

      if (p) {
        const insert = async (table: string, rows: Record<string, unknown>[]) => {
          if (!rows.length) return;
          const { error: insertError } = await supabase
            .from(table as "experiences")
            .insert(rows.map((row) => ({ ...row, user_id: userId })) as never);
          if (insertError) throw insertError;
        };

        await insert(
          "experiences",
          p.experiences.map((e, index) => ({
            company: e.company,
            role: e.role,
            location: e.location,
            start_date: e.startDate,
            end_date: e.endDate,
            is_current: e.isCurrent,
            bullets: e.bullets ?? [],
            sort_order: index,
          })),
        );
        await insert(
          "education",
          p.education.map((e, index) => ({
            institution: e.institution,
            course: e.course,
            level: e.level,
            start_date: e.startDate,
            end_date: e.endDate,
            sort_order: index,
          })),
        );
        await insert(
          "skills",
          p.skills.map((s, index) => ({ name: s.name, category: s.category, sort_order: index })),
        );
        await insert(
          "certifications",
          p.certifications.map((c, index) => ({
            name: c.name,
            issuer: c.issuer,
            issued_date: c.issuedDate,
            kind: c.kind,
            sort_order: index,
          })),
        );
        await insert(
          "projects",
          p.projects.map((pr, index) => ({
            name: pr.name,
            description: pr.description,
            tech: pr.tech ?? [],
            sort_order: index,
          })),
        );
        await insert(
          "languages",
          p.languages.map((l) => ({ name: l.name, level: l.level })),
        );
      }

      await notify("Perfil criado", "Seu perfil profissional mestre está pronto para ser usado nas análises.");
      invalidate(["master-profile", "notifications"]);
      toast.success("Perfil salvo.");
      navigate({ to: "/profile" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o perfil.");
    } finally {
      setProcessing(false);
    }
  }

  if (processing && step === 2) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <ProcessingState title="Lendo seu currículo" steps={PARSE_STEPS} done={parseStep} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Vamos começar."
        description="Em três passos montamos seu perfil profissional mestre — a base de todas as análises."
      />
      <Progress value={(step / 3) * 100} className="mb-6" />

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Seus dados de carreira</CardTitle>
            <CardDescription>Usamos essas informações para priorizar vagas e conteúdos.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="o-name">Nome completo</Label>
              <Input id="o-name" value={career.full_name} onChange={(e) => setC("full_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-role">Cargo desejado</Label>
              <Input
                id="o-role"
                value={career.desired_role}
                onChange={(e) => setC("desired_role", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-area">Área</Label>
              <Input id="o-area" value={career.area} onChange={(e) => setC("area", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-seniority">Senioridade</Label>
              <Input
                id="o-seniority"
                value={career.seniority}
                onChange={(e) => setC("seniority", e.target.value)}
                placeholder="Júnior, pleno, sênior..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-model">Modelo de trabalho preferido</Label>
              <Input
                id="o-model"
                value={career.work_model}
                onChange={(e) => setC("work_model", e.target.value)}
                placeholder="Remoto, híbrido ou presencial"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="o-location">Localização</Label>
              <Input
                id="o-location"
                value={career.location}
                onChange={(e) => setC("location", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={() => setStep(2)} disabled={!career.full_name.trim()}>
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Importar seu currículo</CardTitle>
            <CardDescription>
              Aceitamos PDF e DOCX. Preservamos o máximo possível do conteúdo original e você revisa tudo antes
              de salvar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label
              htmlFor="resume-file"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center transition-colors hover:bg-muted/50"
            >
              <FileUp className="size-6 text-muted-foreground" aria-hidden />
              <span className="text-sm font-medium">Selecionar arquivo PDF ou DOCX</span>
              <span className="text-xs text-muted-foreground">O arquivo é lido no seu navegador</span>
              <Input
                id="resume-file"
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                <Pencil className="size-4" aria-hidden />
                Começar do zero
              </Button>
              <Button variant="ghost" onClick={() => setStep(1)}>
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Revisar antes de salvar</CardTitle>
            <CardDescription>
              Confira o que foi identificado. Depois de salvar, você pode editar tudo no perfil profissional.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsed ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="r-summary">Resumo profissional</Label>
                  <Textarea
                    id="r-summary"
                    rows={5}
                    value={parsed.summary}
                    onChange={(e) => setParsed({ ...parsed, summary: e.target.value })}
                  />
                </div>
                <Summary label="Experiências" items={parsed.experiences.map((e) => `${e.role} — ${e.company}`)} />
                <Summary
                  label="Formação"
                  items={parsed.education.map((e) => `${e.course} — ${e.institution}`)}
                />
                <Summary label="Competências" items={parsed.skills.map((s) => s.name)} />
                <Summary label="Certificações e cursos" items={parsed.certifications.map((c) => c.name)} />
                <Summary label="Idiomas" items={parsed.languages.map((l) => `${l.name} — ${l.level}`)} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Você vai montar o perfil manualmente. Salvamos seus dados de carreira e, em seguida, você
                adiciona experiências, competências e formação.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={saveProfile} disabled={processing}>
                Salvar perfil mestre
              </Button>
              <Button variant="ghost" onClick={() => setStep(2)}>
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Summary({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">Nada identificado.</p>
      ) : (
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm">
          {items.slice(0, 12).map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
