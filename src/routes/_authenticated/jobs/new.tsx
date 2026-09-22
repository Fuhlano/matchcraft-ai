import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessingState } from "@/components/product/states";
import { supabase } from "@/integrations/supabase/client";
import { fetchJobUrl } from "@/lib/ai.functions";
import { analyzeJob, saveMatch } from "@/lib/job-actions";
import { notify, requireUserId, useInvalidate, useMasterProfile } from "@/lib/queries";
import type { Job } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/jobs/new")({
  head: () => ({
    meta: [
      { title: "Adicionar vaga — MatchCV" },
      {
        name: "description",
        content: "Cole a descrição, informe uma URL pública ou preencha os dados da vaga manualmente.",
      },
      { property: "og:title", content: "Adicionar vaga — MatchCV" },
      { property: "og:description", content: "Analise uma vaga e calcule sua compatibilidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewJob,
});

const STEPS = ["Salvando vaga", "Extraindo requisitos", "Calculando compatibilidade"];

function NewJob() {
  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const { data: profile } = useMasterProfile();
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    work_model: "",
    seniority: "",
    salary: "",
    url: "",
    description: "",
  });
  const [pasted, setPasted] = useState("");
  const [url, setUrl] = useState("");

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function createJob(input: Partial<Job> & { description: string; source: string }) {
    if (!profile) throw new Error("Perfil ainda carregando. Tente novamente em instantes.");
    if (input.description.trim().length < 50) {
      throw new Error("A descrição da vaga é muito curta para uma análise confiável.");
    }
    setProcessing(true);
    setStep(0);
    try {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          user_id: userId,
          title: input.title || "Vaga sem título",
          company: input.company ?? "",
          location: input.location ?? "",
          work_model: input.work_model ?? "",
          seniority: input.seniority ?? "",
          salary: input.salary ?? "",
          url: input.url ?? "",
          description: input.description,
          source: input.source,
        })
        .select("*")
        .single();
      if (error) throw error;

      const job = data as Job;
      setStep(1);
      const analysis = await analyzeJob(job, profile.profile.ai_analysis_enabled);

      setStep(2);
      await saveMatch(profile, { ...job, analysis }, analysis);

      // Completa o cabeçalho da vaga com o que foi identificado, sem sobrescrever o que você informou.
      const patch: Record<string, string> = {};
      if (!job.title || job.title === "Vaga sem título") patch['title'] = form.title || job.title;
      if (!job.seniority && analysis.seniority) patch['seniority'] = analysis.seniority;
      if (!job.area && analysis.area) patch['area'] = analysis.area;
      if (Object.keys(patch).length) await supabase.from("jobs").update(patch).eq("id", job.id);

      await notify("Análise concluída", `${job.title} — requisitos extraídos e match calculado.`);
      invalidate(["jobs", "notifications", "match"]);
      toast.success("Vaga analisada.");
      navigate({ to: "/jobs/$jobId", params: { jobId: job.id } });
    } catch (error) {
      setProcessing(false);
      toast.error(error instanceof Error ? error.message : "Não foi possível analisar a vaga.");
    }
  }

  async function handleUrl() {
    const parsed = z.string().url("Informe uma URL válida.").safeParse(url.trim());
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setProcessing(true);
    setStep(0);
    const result = await fetchJobUrl({ data: { url: parsed.data } });
    setProcessing(false);
    if (!result.ok) {
      toast.error(`${result.reason} Cole a descrição manualmente.`);
      return;
    }
    await createJob({ description: result.text, url: parsed.data, source: "url", title: form.title });
  }

  if (processing) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <ProcessingState title="Analisando a vaga" steps={STEPS} done={step} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Adicionar vaga"
        description="Extraímos os requisitos da descrição e comparamos com o seu perfil profissional."
      />

      <Tabs defaultValue="paste">
        <TabsList className="mb-4">
          <TabsTrigger value="paste">Colar descrição</TabsTrigger>
          <TabsTrigger value="url">URL pública</TabsTrigger>
          <TabsTrigger value="manual">Preencher manualmente</TabsTrigger>
        </TabsList>

        <TabsContent value="paste">
          <Card>
            <CardHeader>
              <CardTitle>Colar descrição da vaga</CardTitle>
              <CardDescription>
                Cole o texto completo do anúncio. Quanto mais completo, melhor a identificação dos requisitos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="paste-title">Cargo (opcional)</Label>
                <Input
                  id="paste-title"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  maxLength={120}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paste-company">Empresa (opcional)</Label>
                <Input
                  id="paste-company"
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  maxLength={120}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paste-description">Descrição da vaga</Label>
                <Textarea
                  id="paste-description"
                  value={pasted}
                  onChange={(e) => setPasted(e.target.value)}
                  rows={12}
                  maxLength={20000}
                  placeholder="Responsabilidades, requisitos obrigatórios, diferenciais..."
                />
              </div>
              <Button
                onClick={() =>
                  createJob({
                    description: pasted,
                    title: form.title,
                    company: form.company,
                    source: "paste",
                  })
                }
              >
                Analisar vaga
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url">
          <Card>
            <CardHeader>
              <CardTitle>Importar de uma URL pública</CardTitle>
              <CardDescription>
                Lemos apenas páginas públicas. Não acessamos conteúdo protegido por login ou verificação
                anti-robô.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="job-url">URL da vaga</Label>
                <Input
                  id="job-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                />
              </div>
              <Button onClick={handleUrl}>Importar e analisar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Preencher manualmente</CardTitle>
              <CardDescription>Informe os dados da vaga que você já conhece.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field id="m-title" label="Cargo" value={form.title} onChange={(v) => set("title", v)} />
              <Field id="m-company" label="Empresa" value={form.company} onChange={(v) => set("company", v)} />
              <Field
                id="m-location"
                label="Localização"
                value={form.location}
                onChange={(v) => set("location", v)}
              />
              <Field
                id="m-model"
                label="Modelo de trabalho"
                value={form.work_model}
                onChange={(v) => set("work_model", v)}
                placeholder="Remoto, híbrido ou presencial"
              />
              <Field
                id="m-seniority"
                label="Senioridade"
                value={form.seniority}
                onChange={(v) => set("seniority", v)}
              />
              <Field id="m-salary" label="Faixa salarial" value={form.salary} onChange={(v) => set("salary", v)} />
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="m-url">Link da vaga</Label>
                <Input id="m-url" value={form.url} onChange={(e) => set("url", e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="m-description">Descrição, requisitos e diferenciais</Label>
                <Textarea
                  id="m-description"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={10}
                  maxLength={20000}
                />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={() => createJob({ ...form, source: "manual" })}>Salvar e analisar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={160}
      />
    </div>
  );
}
