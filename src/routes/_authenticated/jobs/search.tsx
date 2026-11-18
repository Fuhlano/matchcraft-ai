import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Bookmark, CheckCircle2, ExternalLink, Eye, Loader2, RefreshCw, Search, ThumbsDown, UserRound, X } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState } from "@/components/product/states";
import { supabase } from "@/integrations/supabase/client";
import { requireUserId, useMasterProfile } from "@/lib/queries";
import { analyzeJobLocally } from "@/lib/job-parser";
import { calculateMatch, SYNONYMS } from "@/lib/matching";
import type { MasterProfile } from "@/lib/types";
import {
  CONTRACT_LABEL, DEFAULT_FILTERS, ENGLISH_LABEL, REMOTE_SCOPE_LABEL, SENIORITY_OPTIONS, WORK_MODEL_LABEL,
  type SearchFilters,
} from "@/lib/job-search/classify";
import { getSourcesStatus, searchExternalJobs } from "@/lib/job-search/search.functions";
import type { Database } from "@/integrations/supabase/types";

type ExtJob = Database["public"]["Tables"]["external_jobs"]["Row"];

export const Route = createFileRoute("/_authenticated/jobs/search")({
  head: () => ({
    meta: [
      { title: "Encontrar vagas — MatchCV" },
      { name: "description", content: "Busque vagas reais em fontes externas usando seu perfil profissional." },
      { property: "og:title", content: "Encontrar vagas — MatchCV" },
      { property: "og:description", content: "Vagas reais compatíveis com seu perfil, com explicação do match." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchPage,
});

const AREAS = [
  "Tecnologia e Desenvolvimento", "Dados, BI e Analytics", "Gestão de Projetos e PMO", "Produto e Agilidade",
  "Processos e Requisitos", "Engenharia", "Financeiro e Contabilidade", "Administrativo", "Recursos Humanos",
  "Comercial e Vendas", "Marketing e Design", "Atendimento e Customer Success", "Jurídico", "Saúde",
  "Logística e Operações", "Outras",
];
const ROLE_SUGGESTIONS = [
  "Analista de Dados", "Data Analyst", "Analista de BI", "Analista de Processos", "Analista de Requisitos",
  "Business Analyst", "Product Owner", "Product Manager", "Analista de Projetos", "Desenvolvedor Front-end",
  "Desenvolvedor Back-end", "Engenheiro de Software", "Scrum Master", "Customer Success",
];
const STATUS_LABEL: Record<string, string> = {
  new: "Nova", viewed: "Visualizada", favorite: "Favoritada", applied: "Candidatura realizada", dismissed: "Não tenho interesse",
};

function seniorityKey(s: string | null | undefined) {
  const t = (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return SENIORITY_OPTIONS.find(([k, l]) => t.includes(k) || t.includes(l.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")))?.[0];
}

function parseSalary(s: string | null | undefined): number | null {
  const digits = (s ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

/** Monta filtros a partir do perfil existente (sem alterar o perfil). */
function filtersFromProfile(mp: MasterProfile): SearchFilters {
  const p = mp.profile;
  const roles = [p.desired_role, p.headline, mp.experiences[0]?.role].filter((x): x is string => !!x && x.length < 60);
  const related = roles.flatMap((r) => {
    const low = r.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return SYNONYMS.find((g) => g.includes(low))?.filter((x) => x !== low) ?? [];
  });
  const wm = (p.work_model ?? "").toLowerCase();
  const loc = (p.location ?? "").split(/[,-]/).map((s) => s.trim());
  return {
    ...DEFAULT_FILTERS,
    roles: [...new Set([...roles, ...related])].slice(0, 5),
    areas: p.area ? [p.area] : [],
    seniorities: seniorityKey(p.seniority) ? [seniorityKey(p.seniority)!] : [],
    workModels: wm.includes("remot") ? ["remote"] : wm.includes("híbr") || wm.includes("hibr") ? ["hybrid"] : wm.includes("presen") ? ["onsite"] : [],
    city: loc[0] ?? "",
    state: loc[1] ?? "",
    salaryMin: parseSalary(p.salary_expectation),
  };
}

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function TagInput({ id, values, onChange, suggestions, placeholder }: {
  id: string; values: string[]; onChange: (v: string[]) => void; suggestions: string[]; placeholder: string;
}) {
  const [text, setText] = useState("");
  const add = (v: string) => { const t = v.trim(); if (t && !values.includes(t)) onChange([...values, t]); setText(""); };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="gap-1">
            {v}
            <button type="button" aria-label={`Remover ${v}`} onClick={() => onChange(values.filter((x) => x !== v))}>
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input id={id} list={`${id}-list`} value={text} placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(text); } }}
        onBlur={() => text && add(text)} />
      <datalist id={`${id}-list`}>{suggestions.filter((s) => !values.includes(s)).map((s) => <option key={s} value={s} />)}</datalist>
    </div>
  );
}

function SearchPage() {
  const { data: mp } = useMasterProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const search = useServerFn(searchExternalJobs);
  const sourcesFn = useServerFn(getSourcesStatus);
  const { data: sources } = useQuery({ queryKey: ["job-sources"], queryFn: () => sourcesFn() });
  const [useProfile, setUseProfile] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ jobs: ExtJob[]; sources: any[]; cached: boolean; searchedAt: string } | null>(null);
  const [sort, setSort] = useState<"score" | "recent" | "salary">("score");
  const [hideDismissed, setHideDismissed] = useState(true);
  const [detail, setDetail] = useState<ExtJob | null>(null);
  const set = <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) => setFilters((f) => ({ ...f, [k]: v }));

  const { data: interactions } = useQuery({
    queryKey: ["job-interactions"],
    queryFn: async () => {
      const { data } = await supabase.from("user_job_interactions").select("*");
      return new Map((data ?? []).map((i) => [i.external_job_id, i]));
    },
  });

  // Preferências salvas → senão, perfil.
  useEffect(() => {
    if (!mp || loaded) return;
    (async () => {
      const { data } = await supabase.from("job_user_preferences").select("*").maybeSingle();
      if (data && Object.keys(data.filters as object).length) {
        setFilters({ ...DEFAULT_FILTERS, ...(data.filters as Partial<SearchFilters>) });
        setUseProfile(data.use_profile);
      } else setFilters(filtersFromProfile(mp));
      setLoaded(true);
    })();
  }, [mp, loaded]);

  const scored = useMemo(() => {
    if (!result || !mp) return [];
    return result.jobs.map((job) => {
      const analysis = analyzeJobLocally(job.description, job.title);
      const match = calculateMatch(mp, { title: job.title, location: job.location, work_model: job.work_model, seniority: job.seniority, analysis });
      const lowConfidence = job.description.length < 400;
      return { job, match, analysis, lowConfidence };
    });
  }, [result, mp]);

  const list = useMemo(() => {
    const arr = scored.filter((s) => !(hideDismissed && interactions?.get(s.job.id)?.status === "dismissed"));
    if (sort === "recent") arr.sort((a, b) => (b.job.posted_at ?? "").localeCompare(a.job.posted_at ?? ""));
    else if (sort === "salary") arr.sort((a, b) => (b.job.salary_max ?? -1) - (a.job.salary_max ?? -1));
    else arr.sort((a, b) => b.match.score - a.match.score);
    return arr;
  }, [scored, sort, hideDismissed, interactions]);

  async function run(force = false) {
    if (!filters.roles.length && !filters.areas.length) { toast.error("Informe ao menos um cargo ou uma área."); return; }
    setLoading(true);
    try {
      const userId = await requireUserId();
      await supabase.from("job_user_preferences").upsert({ user_id: userId, filters: filters as never, use_profile: useProfile, updated_at: new Date().toISOString() });
      const r = await search({ data: { filters, force } });
      setResult(r as never);
      if (!r.jobs.length) toast.info("Nenhuma vaga encontrada com esses filtros.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setLoading(false); }
  }

  async function setStatus(job: ExtJob, status: string, score?: number) {
    const userId = await requireUserId();
    const prev = interactions?.get(job.id);
    let saved_job_id = prev?.saved_job_id ?? null;
    if ((status === "favorite" || status === "applied") && !saved_job_id) {
      const { data, error } = await supabase.from("jobs").insert({
        user_id: userId, title: job.title, company: job.company, location: job.location ?? "", work_model: job.work_model ?? "",
        seniority: job.seniority ?? "", url: job.apply_url || job.url || "", description: job.description || job.summary || job.title,
        source: job.source, salary: job.salary_max ? `${job.currency} ${job.salary_min ?? ""}–${job.salary_max}` : "",
      }).select("id").single();
      if (error) { toast.error("Não foi possível salvar a vaga."); return; }
      saved_job_id = data.id;
      await supabase.from("applications").insert({ user_id: userId, job_id: data.id, status: status === "applied" ? "applied" : "saved", applied_at: status === "applied" ? new Date().toISOString().slice(0, 10) : null });
    } else if (status === "applied" && saved_job_id) {
      await supabase.from("applications").update({ status: "applied", applied_at: new Date().toISOString().slice(0, 10) }).eq("job_id", saved_job_id);
    }
    await supabase.from("user_job_interactions").upsert(
      { user_id: userId, external_job_id: job.id, status, saved_job_id, score: score ?? prev?.score ?? null, updated_at: new Date().toISOString() },
      { onConflict: "user_id,external_job_id" },
    );
    qc.invalidateQueries({ queryKey: ["job-interactions"] });
    qc.invalidateQueries({ queryKey: ["jobs"] });
    qc.invalidateQueries({ queryKey: ["applications"] });
    if (status === "favorite") toast.success("Vaga salva em Minhas vagas e Candidaturas.");
    if (status === "applied") toast.success("Candidatura registrada.");
  }

  const p = mp?.profile;
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Encontrar vagas" description="Vagas reais de fontes externas, comparadas com o seu perfil. O score é uma compatibilidade estimada, não uma garantia." />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="surface-card space-y-5 self-start rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="use-profile" className="flex items-center gap-2"><UserRound className="size-4" />Utilizar meu perfil profissional</Label>
            <Switch id="use-profile" checked={useProfile} onCheckedChange={(v) => { setUseProfile(v); if (v && mp) setFilters(filtersFromProfile(mp)); }} />
          </div>
          {useProfile && p && (
            <div className="space-y-1 rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <p><b>Cargo:</b> {p.desired_role || p.headline || "Não informado"}</p>
              <p><b>Área:</b> {p.area || "Não informado"} · <b>Senioridade:</b> {p.seniority || "Não informado"}</p>
              <p><b>Experiências:</b> {mp.experiences.length} · <b>Competências:</b> {mp.skills.slice(0, 6).map((s) => s.name).join(", ") || "—"}</p>
              <p><b>Formação:</b> {mp.education[0]?.course || "Não informado"}</p>
              <p><b>Idiomas:</b> {mp.languages.map((l) => `${l.name} (${l.level})`).join(", ") || "Não informado"}</p>
              <p><b>Local:</b> {p.location || "Não informado"} · <b>Pretensão:</b> {p.salary_expectation || "Não informada"}</p>
              <p className="pt-1">Alterar filtros não modifica seu currículo.</p>
            </div>
          )}
          {mp && <Button variant="outline" size="sm" className="w-full" onClick={() => { setFilters(filtersFromProfile(mp)); setUseProfile(true); }}>Usar meu perfil novamente</Button>}

          <div className="space-y-1.5"><Label htmlFor="roles">Cargo desejado</Label>
            <TagInput id="roles" values={filters.roles} onChange={(v) => set("roles", v)} suggestions={ROLE_SUGGESTIONS} placeholder="Digite e pressione Enter" /></div>

          <fieldset className="space-y-1.5"><legend className="text-sm font-medium">Área profissional</legend>
            <TagInput id="areas" values={filters.areas} onChange={(v) => set("areas", v)} suggestions={AREAS} placeholder="Escolha ou digite uma área" /></fieldset>

          <fieldset><legend className="mb-1.5 text-sm font-medium">Senioridade <span className="text-xs text-muted-foreground">(vazio = qualquer nível)</span></legend>
            <div className="flex flex-wrap gap-1.5">{SENIORITY_OPTIONS.map(([k, l]) => (
              <Button key={k} type="button" size="sm" variant={filters.seniorities.includes(k) ? "default" : "outline"} aria-pressed={filters.seniorities.includes(k)} onClick={() => set("seniorities", toggle(filters.seniorities, k))}>{l}</Button>
            ))}</div></fieldset>

          <fieldset><legend className="mb-1.5 text-sm font-medium">Modalidade <span className="text-xs text-muted-foreground">(eliminatório)</span></legend>
            <div className="flex flex-wrap gap-1.5">{(["remote", "hybrid", "onsite"] as const).map((k) => (
              <Button key={k} type="button" size="sm" variant={filters.workModels.includes(k) ? "default" : "outline"} aria-pressed={filters.workModels.includes(k)} onClick={() => set("workModels", toggle(filters.workModels, k))}>{WORK_MODEL_LABEL[k]}</Button>
            ))}</div>
            {filters.workModels.includes("remote") && (
              <div className="mt-2 space-y-1.5">{(["brazil", "restricted", "international", "unspecified"] as const).map((k) => (
                <label key={k} className="flex items-center gap-2 text-sm"><Checkbox checked={filters.remoteScopes.includes(k)} onCheckedChange={() => set("remoteScopes", toggle(filters.remoteScopes, k))} />{REMOTE_SCOPE_LABEL[k]}</label>
              ))}</div>
            )}</fieldset>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label htmlFor="city">Cidade</Label><Input id="city" value={filters.city} onChange={(e) => set("city", e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="state">Estado</Label><Input id="state" value={filters.state} onChange={(e) => set("state", e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="country">País</Label><Input id="country" value={filters.country} onChange={(e) => set("country", e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="radius">Raio (km)</Label><Input id="radius" type="number" min={0} value={filters.radiusKm ?? ""} onChange={(e) => set("radiusKm", e.target.value ? Number(e.target.value) : null)} /></div>
          </div>

          <div className="space-y-1.5"><Label htmlFor="english">Inglês</Label>
            <Select value={filters.english} onValueChange={(v) => set("english", v as SearchFilters["english"])}>
              <SelectTrigger id="english"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Não aplicar filtro</SelectItem>
                <SelectItem value="required">Inglês obrigatório</SelectItem>
                <SelectItem value="desirable">Inglês desejável</SelectItem>
                <SelectItem value="none">Sem exigência de inglês identificada</SelectItem>
              </SelectContent>
            </Select></div>

          <fieldset><legend className="mb-1.5 text-sm font-medium">Contratação</legend>
            <div className="flex flex-wrap gap-1.5">{Object.entries(CONTRACT_LABEL).filter(([k]) => k).map(([k, l]) => (
              <Button key={k} type="button" size="sm" variant={filters.contracts.includes(k) ? "default" : "outline"} aria-pressed={filters.contracts.includes(k)} onClick={() => set("contracts", toggle(filters.contracts, k))}>{l}</Button>
            ))}</div></fieldset>

          <div className="grid grid-cols-[1fr_110px] gap-2">
            <div className="space-y-1.5"><Label htmlFor="salary">Remuneração mínima (opcional)</Label>
              <Input id="salary" type="number" min={0} value={filters.salaryMin ?? ""} onChange={(e) => set("salaryMin", e.target.value ? Number(e.target.value) : null)} /></div>
            <div className="space-y-1.5"><Label htmlFor="period">Período</Label>
              <Select value={filters.salaryPeriod} onValueChange={(v) => set("salaryPeriod", v as SearchFilters["salaryPeriod"])}>
                <SelectTrigger id="period"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="month">Mês</SelectItem><SelectItem value="year">Ano</SelectItem><SelectItem value="hour">Hora</SelectItem></SelectContent>
              </Select></div>
          </div>
          <p className="-mt-3 text-xs text-muted-foreground">Vagas sem salário divulgado não são eliminadas.</p>

          <div className="space-y-1.5"><Label htmlFor="posted">Data de publicação</Label>
            <Select value={String(filters.postedWithinDays ?? "any")} onValueChange={(v) => set("postedWithinDays", v === "any" ? null : Number(v))}>
              <SelectTrigger id="posted"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Últimas 24 horas</SelectItem><SelectItem value="3">Últimos 3 dias</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem><SelectItem value="15">Últimos 15 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem><SelectItem value="any">Qualquer data</SelectItem>
              </SelectContent>
            </Select></div>

          <fieldset className="space-y-2"><legend className="mb-1.5 text-sm font-medium">Fontes</legend>
            {(sources ?? []).map((s) => (
              <label key={s.id} className="flex items-start gap-2 text-sm">
                <Checkbox checked={filters.sources.includes(s.id as never)} disabled={!s.configured} onCheckedChange={() => set("sources", toggle(filters.sources, s.id as never))} />
                <span>{s.name}{!s.configured && <span className="block text-xs text-muted-foreground">Configuração pendente</span>}</span>
              </label>
            ))}
            {filters.sources.includes("greenhouse") && (
              <div className="space-y-1.5"><Label htmlFor="gh">Empresas no Greenhouse</Label>
                <TagInput id="gh" values={filters.greenhouseBoards} onChange={(v) => set("greenhouseBoards", v.map((x) => x.toLowerCase()))} suggestions={["stone", "gympass", "quintoandar", "loft"]} placeholder="ID da página de carreiras (ex.: stone)" /></div>
            )}
            {filters.sources.includes("lever") && (
              <div className="space-y-1.5"><Label htmlFor="lv">Empresas no Lever</Label>
                <TagInput id="lv" values={filters.leverBoards} onChange={(v) => set("leverBoards", v.map((x) => x.toLowerCase()))} suggestions={["spotify", "palantir"]} placeholder="ID da página de carreiras (ex.: spotify)" /></div>
            )}
          </fieldset>

          <Button className="w-full" onClick={() => run(false)} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Encontrar meu Match
          </Button>
        </aside>

        <section aria-live="polite">
          {result && (
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {result.sources.map((s) => (
                <Badge key={s.source} variant={s.status === "ok" ? "secondary" : "outline"} title={s.message}>
                  {s.source}: {s.status === "ok" ? `${s.count} vagas` : s.status === "not_configured" ? "configuração pendente" : s.status === "skipped" ? "sem empresas" : "erro"}
                </Badge>
              ))}
              {result.cached && <span>Resultado em cache</span>}
              <Button variant="ghost" size="sm" onClick={() => run(true)} disabled={loading}><RefreshCw className="size-3.5" />Atualizar</Button>
              <div className="ml-auto flex items-center gap-2">
                <label className="flex items-center gap-1.5"><Checkbox checked={hideDismissed} onCheckedChange={(v) => setHideDismissed(!!v)} />Ocultar "sem interesse"</label>
                <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                  <SelectTrigger className="h-8 w-48" aria-label="Ordenar"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="score">Maior compatibilidade</SelectItem><SelectItem value="recent">Mais recentes</SelectItem><SelectItem value="salary">Maior remuneração divulgada</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          )}
          {!result ? (
            <EmptyState title="Configure e busque" description="Usamos seu perfil para sugerir cargos e filtros. Só enviamos às fontes cargo, local e salário — nunca seu currículo." />
          ) : list.length === 0 ? (
            <EmptyState title="Nenhuma vaga encontrada" description="Tente ampliar cargos, remover filtros eliminatórios ou adicionar empresas nas fontes." />
          ) : (
            <div className="grid gap-3 xl:grid-cols-2">
              {list.map(({ job, match, lowConfidence }) => {
                const st = interactions?.get(job.id)?.status ?? "new";
                const matched = match.items.filter((i) => i.status === "match").slice(0, 4);
                const missing = match.items.filter((i) => i.status === "gap").slice(0, 3);
                return (
                  <article key={job.id} className="surface-card flex flex-col gap-3 rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold leading-tight">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company} · {job.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-primary">{match.score}%</p>
                        <p className="text-[11px] text-muted-foreground">{match.level}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <Badge variant="outline">{job.work_model === "remote" && job.remote_scope ? REMOTE_SCOPE_LABEL[job.remote_scope] : WORK_MODEL_LABEL[job.work_model ?? ""]}</Badge>
                      <Badge variant="outline">{CONTRACT_LABEL[job.contract_type ?? ""]}</Badge>
                      <Badge variant="outline">{ENGLISH_LABEL[job.english_requirement as keyof typeof ENGLISH_LABEL]}</Badge>
                      <Badge variant="outline">{job.salary_max ? `${job.currency} ${job.salary_min ?? ""}–${job.salary_max}` : "Remuneração não divulgada"}</Badge>
                      {job.seniority && <Badge variant="outline">{SENIORITY_OPTIONS.find(([k]) => k === job.seniority)?.[1]}</Badge>}
                      <Badge variant="secondary">{job.source}{job.also_seen_in.length ? ` +${job.also_seen_in.join(", ")}` : ""}</Badge>
                      {st !== "new" && <Badge>{STATUS_LABEL[st]}</Badge>}
                    </div>
                    {matched.length > 0 && <p className="text-xs"><span className="font-medium">Combina:</span> {matched.map((i) => i.label).join(", ")}</p>}
                    {missing.length > 0 && <p className="text-xs"><span className="font-medium">Falta:</span> {missing.map((i) => i.label).join(", ")}</p>}
                    {lowConfidence && <p className="text-xs text-muted-foreground">Descrição curta na fonte — análise menos confiável.</p>}
                    <p className="text-xs text-muted-foreground">Publicada: {job.posted_at ? new Date(job.posted_at).toLocaleDateString("pt-BR") : "Não informado"}</p>
                    <div className="mt-auto flex flex-wrap gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => { setDetail(job); if (st === "new") setStatus(job, "viewed", match.score); }}><Eye className="size-3.5" />Ver vaga</Button>
                      <Button size="sm" variant="outline" asChild><a href={job.apply_url || job.url || "#"} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-3.5" />Candidatura oficial</a></Button>
                      <Button size="sm" variant="outline" onClick={() => setStatus(job, "favorite", match.score)}><Bookmark className="size-3.5" />Salvar</Button>
                      <Button size="sm" variant="outline" onClick={() => setStatus(job, "applied", match.score)}><CheckCircle2 className="size-3.5" />Já me candidatei</Button>
                      <Button size="sm" variant="ghost" onClick={() => setStatus(job, "dismissed", match.score)}><ThumbsDown className="size-3.5" />Sem interesse</Button>
                      {interactions?.get(job.id)?.saved_job_id && (
                        <Button size="sm" onClick={() => navigate({ to: "/jobs/$jobId", params: { jobId: interactions.get(job.id)!.saved_job_id! } })}>Analisar e gerar currículo</Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {detail && (() => {
            const s = scored.find((x) => x.job.id === detail.id);
            return (
              <>
                <SheetHeader><SheetTitle>{detail.title}</SheetTitle></SheetHeader>
                <div className="space-y-4 px-4 pb-8 text-sm">
                  <p className="text-muted-foreground">{detail.company} · {detail.location} · Fonte: {detail.source}</p>
                  {s && (
                    <div className="rounded-md border p-3">
                      <p className="font-medium">Compatibilidade estimada: {s.match.score}% ({s.match.level})</p>
                      <ul className="mt-2 space-y-1 text-xs">{s.match.breakdown.map((b) => <li key={b.key}><b>{b.label}</b>: {b.score}/{b.max} — {b.reason}</li>)}</ul>
                      <p className="mt-2 text-xs"><b>Obrigatórios atendidos:</b> {s.match.items.filter((i) => i.required && i.status === "match").length}/{s.match.items.filter((i) => i.required).length}</p>
                      <p className="text-xs"><b>Confirmar:</b> {s.match.items.filter((i) => i.status === "partial").map((i) => i.label).join(", ") || "—"}</p>
                    </div>
                  )}
                  <p className="text-xs"><b>Inglês:</b> {ENGLISH_LABEL[detail.english_requirement as keyof typeof ENGLISH_LABEL]} · <b>Outros idiomas:</b> {(detail.languages as { name: string }[]).map((l) => l.name).join(", ") || "Não mencionado"}</p>
                  <div className="whitespace-pre-line text-sm leading-relaxed">{detail.description || "Descrição não informada pela fonte."}</div>
                  <Button asChild><a href={detail.apply_url || detail.url || "#"} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />Ir para a candidatura oficial</a></Button>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
