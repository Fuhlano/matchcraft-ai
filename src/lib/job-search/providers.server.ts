/** Adaptadores de provedores de vagas. Executa apenas no servidor; credenciais vêm de process.env. */
import {
  canonicalUrl, classifyContract, classifyEnglish, classifyRemoteScope, classifySeniority,
  classifyWorkModel, dedupeHash, type SearchFilters,
} from "./classify";

export interface NormalizedJob {
  source: string;
  external_id: string;
  dedupe_hash: string;
  canonical_url: string;
  title: string;
  company: string;
  logo_url: string;
  description: string;
  summary: string;
  seniority: string;
  location: string;
  country: string;
  work_model: string;
  remote_scope: string;
  contract_type: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  salary_period: string;
  english_requirement: string;
  languages: { name: string; requirement: string }[];
  posted_at: string | null;
  source_updated_at: string | null;
  url: string;
  apply_url: string;
}

export interface ProviderResult {
  source: string;
  status: "ok" | "not_configured" | "error" | "skipped";
  message?: string | undefined;
  jobs: NormalizedJob[];
  /** Para fontes de carreira: board consultado com sucesso (permite marcar vagas encerradas). */
  boardsChecked?: string[] | undefined;
}

export function stripHtml(html: string): string {
  return (html ?? "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&")
    .replace(/<(br|\/p|\/li|\/h\d)[^>]*>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
}

function otherLanguages(text: string) {
  const t = text.toLowerCase();
  const out: { name: string; requirement: string }[] = [];
  const map: [RegExp, string][] = [[/espanhol|spanish/, "Espanhol"], [/franc[eê]s|french/, "Francês"], [/alem[aã]o|german/, "Alemão"]];
  for (const [re, name] of map) {
    const m = t.match(re);
    if (!m) continue;
    const i = m.index ?? 0;
    const w = t.slice(Math.max(0, i - 80), i + 80);
    out.push({ name, requirement: /desej|diferencial|plus|nice/.test(w) ? "desirable" : /obrigat|fluen|required|avan/.test(w) ? "required" : "unclear" });
  }
  return out;
}

function normalize(p: {
  source: string; external_id: string; title: string; company: string; description: string; location: string;
  url: string; apply_url?: string; posted_at?: string | null; updated_at?: string | null; logo_url?: string;
  salary_min?: number | null; salary_max?: number | null; currency?: string; salary_period?: string;
  workHint?: string; contractHint?: string;
}): NormalizedJob {
  const description = p.description.slice(0, 20000);
  const work = classifyWorkModel(description, `${p.workHint ?? ""} ${p.location}`);
  return {
    source: p.source,
    external_id: p.external_id,
    dedupe_hash: dedupeHash(p.title, p.company, p.location),
    canonical_url: canonicalUrl(p.url),
    title: p.title.trim(),
    company: p.company.trim() || "Não informado",
    logo_url: p.logo_url ?? "",
    description,
    summary: description.replace(/\s+/g, " ").slice(0, 280),
    seniority: classifySeniority(p.title, description),
    location: p.location || "Não informado",
    country: /brasil|brazil|\bbr\b|são paulo|sao paulo|rio de janeiro/i.test(p.location) ? "Brasil" : "",
    work_model: work,
    remote_scope: work === "remote" ? classifyRemoteScope(description, p.location) : "",
    contract_type: classifyContract(description, p.contractHint ?? ""),
    salary_min: p.salary_min ?? null,
    salary_max: p.salary_max ?? p.salary_min ?? null,
    currency: p.currency ?? "",
    salary_period: p.salary_period ?? "",
    english_requirement: classifyEnglish(description, p.title),
    languages: otherLanguages(description),
    posted_at: p.posted_at ?? null,
    source_updated_at: p.updated_at ?? null,
    url: p.url,
    apply_url: p.apply_url || p.url,
  };
}

function keywordQuery(f: SearchFilters): string {
  return f.roles.slice(0, 3).join(" OR ") || f.areas[0] || "";
}

function titleMatches(title: string, roles: string[]): boolean {
  if (!roles.length) return true;
  const t = title.toLowerCase();
  return roles.some((r) => r.toLowerCase().split(/\s+/).filter((w) => w.length > 3).some((w) => t.includes(w)));
}

async function safeFetch(url: string, init?: RequestInit, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, headers: { "User-Agent": "MatchCV/1.0", ...(init?.headers ?? {}) } });
  } finally {
    clearTimeout(id);
  }
}

/** Jooble — envia somente palavras‑chave, local, raio e salário. */
async function jooble(f: SearchFilters): Promise<ProviderResult> {
  const key = process.env["JOOBLE_API_KEY"];
  if (!key) return { source: "jooble", status: "not_configured", message: "Chave JOOBLE_API_KEY pendente", jobs: [] };
  const res = await safeFetch(`https://jooble.org/api/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keywords: keywordQuery(f) || "vaga",
      location: [f.city, f.state].filter(Boolean).join(", ") || f.country || "Brasil",
      radius: f.radiusKm ? String(f.radiusKm) : undefined,
      salary: f.salaryMin ?? undefined,
      page: "1",
      ResultOnPage: "40",
    }),
  });
  if (!res.ok) return { source: "jooble", status: "error", message: `Jooble respondeu ${res.status}`, jobs: [] };
  const data = (await res.json()) as { jobs?: any[] };
  return {
    source: "jooble",
    status: "ok",
    jobs: (data.jobs ?? []).map((j) =>
      normalize({
        source: "jooble", external_id: String(j.id ?? j.link), title: j.title ?? "", company: j.company ?? "",
        description: stripHtml(j.snippet ?? ""), location: j.location ?? "", url: j.link ?? "",
        updated_at: j.updated ? new Date(j.updated).toISOString() : null,
        posted_at: j.updated ? new Date(j.updated).toISOString() : null, contractHint: j.type ?? "",
      }),
    ),
  };
}

/** Adzuna — Brasil (country=br). */
async function adzuna(f: SearchFilters): Promise<ProviderResult> {
  const id = process.env["ADZUNA_APP_ID"];
  const key = process.env["ADZUNA_APP_KEY"];
  if (!id || !key) return { source: "adzuna", status: "not_configured", message: "ADZUNA_APP_ID / ADZUNA_APP_KEY pendentes", jobs: [] };
  const q = new URLSearchParams({ app_id: id, app_key: key, results_per_page: "40", what_or: f.roles.join(" ") || f.areas.join(" ") });
  const where = [f.city, f.state].filter(Boolean).join(", ");
  if (where) q.set("where", where);
  if (f.radiusKm) q.set("distance", String(f.radiusKm));
  if (f.postedWithinDays) q.set("max_days_old", String(f.postedWithinDays));
  if (f.salaryMin && f.salaryPeriod === "year") q.set("salary_min", String(f.salaryMin));
  const res = await safeFetch(`https://api.adzuna.com/v1/api/jobs/br/search/1?${q}`, { headers: { Accept: "application/json" } });
  if (!res.ok) return { source: "adzuna", status: "error", message: `Adzuna respondeu ${res.status}`, jobs: [] };
  const data = (await res.json()) as { results?: any[] };
  return {
    source: "adzuna",
    status: "ok",
    jobs: (data.results ?? []).map((j) =>
      normalize({
        source: "adzuna", external_id: String(j.id), title: j.title ?? "", company: j.company?.display_name ?? "",
        description: stripHtml(j.description ?? ""), location: j.location?.display_name ?? "", url: j.redirect_url ?? "",
        posted_at: j.created ?? null, salary_min: j.salary_min ?? null, salary_max: j.salary_max ?? null,
        currency: j.salary_min ? "BRL" : "", salary_period: j.salary_min ? "year" : "",
        contractHint: `${j.contract_type ?? ""} ${j.contract_time ?? ""}`,
      }),
    ),
  };
}

/** Greenhouse — API pública de job boards, por empresa. */
async function greenhouse(f: SearchFilters): Promise<ProviderResult> {
  const boards = f.greenhouseBoards.slice(0, 8);
  if (!boards.length) return { source: "greenhouse", status: "skipped", message: "Nenhuma empresa Greenhouse informada", jobs: [] };
  const jobs: NormalizedJob[] = [];
  const checked: string[] = [];
  const errors: string[] = [];
  await Promise.all(boards.map(async (b) => {
    try {
      const res = await safeFetch(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(b)}/jobs?content=true`);
      if (!res.ok) { errors.push(`${b}: ${res.status}`); return; }
      const data = (await res.json()) as { jobs?: any[] };
      checked.push(b);
      for (const j of data.jobs ?? []) {
        if (!titleMatches(j.title ?? "", f.roles)) continue;
        jobs.push(normalize({
          source: "greenhouse", external_id: `${b}:${j.id}`, title: j.title ?? "", company: j.company_name ?? b,
          description: stripHtml(j.content ?? ""), location: j.location?.name ?? "", url: j.absolute_url ?? "",
          posted_at: j.first_published ?? j.updated_at ?? null, updated_at: j.updated_at ?? null,
        }));
      }
    } catch (e) { errors.push(`${b}: ${(e as Error).message}`); }
  }));
  return { source: "greenhouse", status: checked.length ? "ok" : "error", message: errors.join("; ") || undefined, jobs, boardsChecked: checked };
}

/** Lever — API pública de postings, por empresa. */
async function lever(f: SearchFilters): Promise<ProviderResult> {
  const boards = f.leverBoards.slice(0, 8);
  if (!boards.length) return { source: "lever", status: "skipped", message: "Nenhuma empresa Lever informada", jobs: [] };
  const jobs: NormalizedJob[] = [];
  const checked: string[] = [];
  const errors: string[] = [];
  await Promise.all(boards.map(async (b) => {
    try {
      const res = await safeFetch(`https://api.lever.co/v0/postings/${encodeURIComponent(b)}?mode=json`);
      if (!res.ok) { errors.push(`${b}: ${res.status}`); return; }
      const data = (await res.json()) as any[];
      checked.push(b);
      for (const j of data ?? []) {
        if (!titleMatches(j.text ?? "", f.roles)) continue;
        const lists = (j.lists ?? []).map((l: any) => `${l.text}\n${stripHtml(l.content ?? "")}`).join("\n\n");
        jobs.push(normalize({
          source: "lever", external_id: `${b}:${j.id}`, title: j.text ?? "", company: b,
          description: `${j.descriptionPlain ?? ""}\n\n${lists}\n\n${j.additionalPlain ?? ""}`,
          location: j.categories?.location ?? "", url: j.hostedUrl ?? "", apply_url: j.applyUrl ?? j.hostedUrl,
          posted_at: j.createdAt ? new Date(j.createdAt).toISOString() : null,
          workHint: j.workplaceType ?? "", contractHint: j.categories?.commitment ?? "",
          salary_min: j.salaryRange?.min ?? null, salary_max: j.salaryRange?.max ?? null,
          currency: j.salaryRange?.currency ?? "",
          salary_period: j.salaryRange?.interval === "per-year-salary" ? "year" : j.salaryRange?.interval === "per-month-salary" ? "month" : j.salaryRange ? "" : "",
        }));
      }
    } catch (e) { errors.push(`${b}: ${(e as Error).message}`); }
  }));
  return { source: "lever", status: checked.length ? "ok" : "error", message: errors.join("; ") || undefined, jobs, boardsChecked: checked };
}

export const PROVIDERS: Record<string, (f: SearchFilters) => Promise<ProviderResult>> = { jooble, adzuna, greenhouse, lever };

export function providerConfigured(id: string): boolean {
  if (id === "jooble") return !!process.env["JOOBLE_API_KEY"];
  if (id === "adzuna") return !!process.env["ADZUNA_APP_ID"] && !!process.env["ADZUNA_APP_KEY"];
  return true;
}
