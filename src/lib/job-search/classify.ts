/** Classificação determinística de vagas externas. Funções puras (cliente e servidor). */

export type EnglishRequirement = "required" | "desirable" | "not_required" | "not_mentioned" | "unclear";
export type WorkModel = "remote" | "hybrid" | "onsite" | "";
export type RemoteScope = "brazil" | "restricted" | "international" | "unspecified" | "";

export const ENGLISH_LABEL: Record<EnglishRequirement, string> = {
  required: "Inglês obrigatório",
  desirable: "Inglês desejável",
  not_required: "Inglês não exigido",
  not_mentioned: "Inglês não mencionado",
  unclear: "Inglês: inconclusivo",
};
export const WORK_MODEL_LABEL: Record<string, string> = {
  remote: "Remoto",
  hybrid: "Híbrido",
  onsite: "Presencial",
  "": "Modalidade não informada",
};
export const REMOTE_SCOPE_LABEL: Record<string, string> = {
  brazil: "Remoto — todo o Brasil",
  restricted: "Remoto — região restrita",
  international: "Remoto internacional",
  unspecified: "Remoto — sem restrição identificada",
  "": "",
};
export const CONTRACT_LABEL: Record<string, string> = {
  clt: "CLT",
  pj: "PJ",
  contractor: "Contractor internacional",
  freelancer: "Freelancer",
  temporario: "Temporário",
  estagio: "Estágio",
  aprendiz: "Aprendiz",
  "": "Contratação não informada",
};
export const SENIORITY_OPTIONS = [
  ["estagio", "Estágio"],
  ["trainee", "Trainee"],
  ["junior", "Júnior"],
  ["pleno", "Pleno"],
  ["senior", "Sênior"],
  ["especialista", "Especialista"],
  ["coordenacao", "Coordenação"],
  ["gerencia", "Gerência"],
  ["diretoria", "Diretoria"],
] as const;

export function fold(text: string): string {
  return (text ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const ENGLISH_WORD = /\b(ingles|english)\b/g;
const NOT_REQUIRED = /(nao (e )?(necessario|obrigatorio|exigido|requerido)|not required|no english required|sem necessidade de ingles)/;
const DESIRABLE = /(desejavel|diferencial|nice to have|preferred|preferable|is a plus|a plus|bonus|sera um diferencial|plus)/;
const REQUIRED = /(obrigatorio|necessario|imprescindivel|fluente|fluencia|avancado|required|must|fluent|proficien|requisito|advanced|business level|conversacao|intermediario|c1|b2)/;

/** Classifica a exigência de inglês. Ausência de menção NÃO vira "não exigido". */
export function classifyEnglish(description: string, title = ""): EnglishRequirement {
  const text = fold(`${title}\n${description}`);
  const matches = [...text.matchAll(ENGLISH_WORD)];
  if (matches.length === 0) {
    // Anúncio escrito em inglês sem menção explícita: inconclusivo, não "não exigido".
    return looksEnglish(text) ? "unclear" : "not_mentioned";
  }
  let sawDesirable = false;
  let sawRequired = false;
  for (const m of matches) {
    const i = m.index ?? 0;
    const window = text.slice(Math.max(0, i - 90), i + 90);
    if (NOT_REQUIRED.test(window)) return "not_required";
    if (DESIRABLE.test(window)) sawDesirable = true;
    else if (REQUIRED.test(window)) sawRequired = true;
  }
  if (sawRequired) return "required";
  if (sawDesirable) return "desirable";
  return "unclear";
}

export function looksEnglish(text: string): boolean {
  const words = fold(text).split(/\W+/).filter(Boolean);
  if (words.length < 30) return false;
  const en = new Set(["the", "and", "with", "you", "our", "will", "for", "experience", "team", "we", "are"]);
  const pt = new Set(["de", "e", "com", "para", "voce", "nossa", "experiencia", "equipe", "que", "os", "das"]);
  let e = 0;
  let p = 0;
  for (const w of words) {
    if (en.has(w)) e++;
    if (pt.has(w)) p++;
  }
  return e > p * 1.5 && e >= 5;
}

export function classifyWorkModel(text: string, hint = ""): WorkModel {
  const t = fold(`${hint}\n${text}`);
  if (/\b(hibrido|hybrid)\b/.test(t)) return "hybrid";
  if (/\b(remoto|remote|home office|homeoffice|teletrabalho|anywhere|work from home)\b/.test(t)) return "remote";
  if (/\b(presencial|on-site|onsite|on site|in-office|in office)\b/.test(t)) return "onsite";
  return "";
}

export function classifyRemoteScope(text: string, location = ""): RemoteScope {
  const t = fold(`${location}\n${text}`);
  if (/(worldwide|anywhere in the world|global|latam|latin america|international|internacional|qualquer pais)/.test(t))
    return "international";
  if (/(apenas|somente|exclusivamente) (para )?(residentes|candidatos|moradores)|must reside|must be based|residir em/.test(t))
    return "restricted";
  if (/(todo o brasil|todo brasil|qualquer lugar do brasil|anywhere in brazil|remote,? brazil|brasil \(remoto\)|remoto - brasil|brazil - remote)/.test(t))
    return "brazil";
  return "unspecified";
}

export function classifyContract(text: string, hint = ""): string {
  const t = fold(`${hint}\n${text}`);
  if (/\b(estagio|internship|intern)\b/.test(t)) return "estagio";
  if (/\b(jovem aprendiz|aprendiz|apprentice)\b/.test(t)) return "aprendiz";
  if (/\bclt\b/.test(t)) return "clt";
  if (/\b(pj|pessoa juridica)\b/.test(t)) return "pj";
  if (/\b(contractor|independent contractor)\b/.test(t)) return "contractor";
  if (/\b(freelance|freelancer)\b/.test(t)) return "freelancer";
  if (/\b(temporario|temporary|temp)\b/.test(t)) return "temporario";
  return "";
}

export function classifySeniority(title: string, description = ""): string {
  const t = fold(title);
  const rules: [RegExp, string][] = [
    [/\b(estagi|intern)/, "estagio"],
    [/\btrainee\b/, "trainee"],
    [/\b(diretor|director|vp|head of)\b/, "diretoria"],
    [/\b(gerente|manager)\b/, "gerencia"],
    [/\b(coordenador|coordenadora|coordinator|lead|lider)\b/, "coordenacao"],
    [/\b(especialista|specialist|principal|staff)\b/, "especialista"],
    [/\b(senior|sr\.?|iii)\b/, "senior"],
    [/\b(pleno|mid|ii)\b/, "pleno"],
    [/\b(junior|jr\.?|i)\b/, "junior"],
  ];
  for (const [re, v] of rules) if (re.test(t)) return v;
  const d = fold(description);
  for (const [re, v] of rules.slice(0, 7)) if (re.test(d.slice(0, 400))) return v;
  return "";
}

/** Hash estável para deduplicar a mesma vaga vinda de fontes diferentes. */
export function dedupeHash(title: string, company: string, location: string): string {
  const key = [title, company, location]
    .map((s) => fold(s).replace(/[^a-z0-9]+/g, " ").trim())
    .join("|");
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < key.length; i++) {
    const c = key.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 ^ c, 2246822519) >>> 0;
  }
  return `${h1.toString(16)}${h2.toString(16)}`;
}

export function canonicalUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "source"].forEach((k) =>
      u.searchParams.delete(k),
    );
    return `${u.host}${u.pathname.replace(/\/$/, "")}${u.search}`.toLowerCase();
  } catch {
    return url;
  }
}

export interface SearchFilters {
  roles: string[];
  areas: string[];
  seniorities: string[];
  workModels: ("remote" | "hybrid" | "onsite")[];
  remoteScopes: ("brazil" | "restricted" | "international" | "unspecified")[];
  country: string;
  state: string;
  city: string;
  radiusKm: number | null;
  english: "any" | "required" | "desirable" | "none";
  otherLanguages: string[];
  contracts: string[];
  salaryMin: number | null;
  currency: string;
  salaryPeriod: "month" | "year" | "hour";
  postedWithinDays: number | null;
  sources: string[];
  greenhouseBoards: string[];
  leverBoards: string[];
}

export const DEFAULT_FILTERS: SearchFilters = {
  roles: [],
  areas: [],
  seniorities: [],
  workModels: [],
  remoteScopes: [],
  country: "Brasil",
  state: "",
  city: "",
  radiusKm: null,
  english: "any",
  otherLanguages: [],
  contracts: [],
  salaryMin: null,
  currency: "BRL",
  salaryPeriod: "month",
  postedWithinDays: null,
  sources: ["jooble", "adzuna", "greenhouse", "lever"],
  greenhouseBoards: [],
  leverBoards: [],
};

export interface FilterableJob {
  work_model: string | null;
  remote_scope: string | null;
  english_requirement: string;
  seniority: string | null;
  contract_type: string | null;
  posted_at: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: string | null;
  status: string;
}

/** Filtros explícitos do usuário são eliminatórios. Dado ausente não elimina (exceto onde indicado). */
export function passesFilters(job: FilterableJob, f: SearchFilters, now = Date.now()): boolean {
  if (job.status !== "open") return false;
  if (f.workModels.length) {
    // Modalidade escolhida explicitamente: vaga sem modalidade identificada não é garantida → mantém só se identificada.
    if (!job.work_model || !f.workModels.includes(job.work_model as never)) return false;
    if (job.work_model === "remote" && f.remoteScopes.length && !f.remoteScopes.includes((job.remote_scope || "unspecified") as never))
      return false;
  }
  if (f.english === "required" && job.english_requirement !== "required") return false;
  if (f.english === "desirable" && !["desirable", "required"].includes(job.english_requirement)) return false;
  if (f.english === "none" && !["not_required", "not_mentioned"].includes(job.english_requirement)) return false;
  if (f.seniorities.length && job.seniority && !f.seniorities.includes(job.seniority)) return false;
  if (f.contracts.length && job.contract_type && !f.contracts.includes(job.contract_type)) return false;
  if (f.postedWithinDays && job.posted_at) {
    const age = (now - new Date(job.posted_at).getTime()) / 86_400_000;
    if (age > f.postedWithinDays) return false;
  }
  if (f.salaryMin && job.salary_max != null && (!job.salary_period || job.salary_period === f.salaryPeriod)) {
    if (job.salary_max < f.salaryMin) return false;
  }
  return true;
}
