import type {
  JobAnalysis,
  MasterProfile,
  MatchBreakdownItem,
  MatchItem,
  MatchResult,
} from "./types";

/** Pesos do score de match — configuráveis em um único lugar. */
export const MATCH_WEIGHTS = {
  required: 30,
  skills: 25,
  experience: 20,
  responsibilities: 10,
  seniority: 5,
  educationLanguages: 5,
  preferences: 5,
} as const;

export const MATCH_LABELS: { min: number; label: string; tone: string }[] = [
  { min: 90, label: "Excelente compatibilidade", tone: "success" },
  { min: 75, label: "Alta compatibilidade", tone: "success" },
  { min: 60, label: "Compatibilidade moderada", tone: "warning" },
  { min: 40, label: "Baixa compatibilidade", tone: "warning" },
  { min: 0, label: "Pouca compatibilidade", tone: "muted" },
];

export function matchLevel(score: number) {
  return MATCH_LABELS.find((l) => score >= l.min) ?? MATCH_LABELS[MATCH_LABELS.length - 1]!;
}

/** Equivalências semânticas conhecidas (PT/EN e variações de produto). */
const SYNONYMS: string[][] = [
  ["power bi", "microsoft power bi", "powerbi"],
  ["data visualization", "visualizacao de dados", "data viz"],
  ["data analytics", "analise de dados", "analytics"],
  ["machine learning", "aprendizado de maquina", "ml"],
  ["sql", "t-sql", "pl/sql", "ansi sql"],
  ["excel", "microsoft excel", "planilhas"],
  ["etl", "elt", "pipeline de dados", "data pipeline"],
  ["gcp", "google cloud", "google cloud platform"],
  ["azure", "microsoft azure"],
  ["aws", "amazon web services"],
  ["javascript", "js"],
  ["typescript", "ts"],
  ["node", "node.js", "nodejs"],
  ["react", "react.js", "reactjs"],
  ["ingles", "english", "ingles avancado", "ingles fluente"],
  ["espanhol", "spanish"],
  ["stakeholder management", "gestao de stakeholders"],
  ["project management", "gestao de projetos"],
  ["comunicacao", "communication"],
  ["lideranca", "leadership"],
  ["scrum", "agile", "metodologias ageis", "agil"],
  ["business intelligence", "bi"],
  ["dashboards", "dashboard", "paineis"],
];

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9+#./ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function synonymSet(term: string): string[] {
  const n = normalize(term);
  const group = SYNONYMS.find((g) => g.includes(n));
  return group ? group : [n];
}

/** Similaridade aproximada entre dois termos (equivalência semântica simples). */
function termsEquivalent(a: string, b: string): boolean {
  const sa = synonymSet(a);
  const sb = synonymSet(b);
  if (sa.some((x) => sb.includes(x))) return true;
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length > 3 && nb.length > 3 && (na.includes(nb) || nb.includes(na))) return true;
  return false;
}

interface Evidence {
  status: "match" | "partial";
  sources: string[];
}

/** Procura o termo da vaga dentro do perfil e devolve de onde veio. */
function findEvidence(term: string, profile: MasterProfile): Evidence | null {
  const sources: string[] = [];
  let strong = false;

  for (const skill of profile.skills) {
    if (termsEquivalent(skill.name, term)) {
      sources.push(`Competências — ${skill.name}`);
      strong = true;
    }
  }
  for (const lang of profile.languages) {
    if (termsEquivalent(lang.name, term)) {
      sources.push(`Idiomas — ${lang.name} (${lang.level})`);
      strong = true;
    }
  }
  for (const cert of profile.certifications) {
    if (termsEquivalent(cert.name, term)) {
      sources.push(`Certificações — ${cert.name}`);
      strong = true;
    }
  }
  for (const exp of profile.experiences) {
    const haystack = normalize(
      [exp.role, exp.company, exp.description ?? "", ...(exp.bullets ?? [])].join(" "),
    );
    const variants = synonymSet(term);
    if (variants.some((v) => v.length > 2 && haystack.includes(v))) {
      sources.push(`Experiência — ${exp.role}${exp.company ? ` @ ${exp.company}` : ""}`);
    }
  }
  for (const project of profile.projects) {
    const haystack = normalize([project.name, project.description ?? "", ...project.tech].join(" "));
    if (synonymSet(term).some((v) => v.length > 2 && haystack.includes(v))) {
      sources.push(`Projetos — ${project.name}`);
    }
  }
  for (const ed of profile.education) {
    if (termsEquivalent(ed.course, term) || termsEquivalent(ed.level ?? "", term)) {
      sources.push(`Formação — ${ed.course}`);
      strong = true;
    }
  }

  if (sources.length === 0) return null;
  return { status: strong ? "match" : "partial", sources: Array.from(new Set(sources)) };
}

const SENIORITY_RANK: Record<string, number> = {
  estagio: 0,
  estagiario: 0,
  trainee: 1,
  junior: 2,
  pleno: 3,
  "mid-level": 3,
  senior: 4,
  especialista: 5,
  lead: 5,
  "tech lead": 5,
  coordenador: 5,
  gerente: 6,
  principal: 6,
};

function seniorityRank(value?: string | null): number | null {
  if (!value) return null;
  const n = normalize(value);
  for (const key of Object.keys(SENIORITY_RANK)) {
    if (n.includes(key)) return SENIORITY_RANK[key]!;
  }
  return null;
}

function totalYears(profile: MasterProfile): number {
  let months = 0;
  for (const exp of profile.experiences) {
    const start = parseDate(exp.start_date);
    const end = exp.is_current ? new Date() : parseDate(exp.end_date);
    if (!start) continue;
    const to = end ?? new Date();
    months += Math.max(0, (to.getFullYear() - start.getFullYear()) * 12 + (to.getMonth() - start.getMonth()));
  }
  return Math.round((months / 12) * 10) / 10;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const iso = /^(\d{4})-(\d{2})/.exec(value);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, 1);
  const br = /^(\d{2})\/(\d{4})$/.exec(value.trim());
  if (br) return new Date(Number(br[2]), Number(br[1]) - 1, 1);
  const year = /^(\d{4})$/.exec(value.trim());
  if (year) return new Date(Number(year[1]), 0, 1);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function ratio(got: number, total: number): number {
  if (total <= 0) return 1;
  return Math.max(0, Math.min(1, got / total));
}

export interface MatchJobInput {
  title: string;
  location?: string | null;
  work_model?: string | null;
  seniority?: string | null;
  analysis: JobAnalysis;
}

/** Motor de match híbrido: comparação determinística + equivalência semântica de termos. */
export function calculateMatch(profile: MasterProfile, job: MatchJobInput): MatchResult {
  const analysis = job.analysis;
  const items: MatchItem[] = [];

  const evaluate = (terms: string[], required: boolean) => {
    const seen = new Set<string>();
    for (const term of terms) {
      const key = normalize(term);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const evidence = findEvidence(term, profile);
      items.push({
        label: term,
        required,
        status: evidence ? evidence.status : "gap",
        evidence: evidence?.sources ?? [],
      });
    }
  };

  evaluate(analysis.requiredSkills ?? [], true);
  evaluate([...(analysis.technologies ?? []), ...(analysis.desirableSkills ?? []), ...(analysis.softSkills ?? [])], false);

  const requiredItems = items.filter((i) => i.required);
  const optionalItems = items.filter((i) => !i.required);

  const scoreOf = (list: MatchItem[]) =>
    list.reduce((acc, i) => acc + (i.status === "match" ? 1 : i.status === "partial" ? 0.5 : 0), 0);

  const requiredRatio = ratio(scoreOf(requiredItems), requiredItems.length);
  const skillsRatio = ratio(scoreOf(optionalItems), optionalItems.length);

  // Experiência relevante: anos + aderência do cargo
  const years = totalYears(profile);
  const neededYears = analysis.experienceYears ?? 3;
  const yearsRatio = ratio(years, neededYears);
  const titleHit = profile.experiences.some((e) => termsEquivalent(e.role, job.title)) ? 1 : 0.6;
  const experienceRatio = Math.min(1, yearsRatio * 0.6 + titleHit * 0.4);

  // Responsabilidades: sobreposição de termos com o histórico do perfil
  const profileText = normalize(
    profile.experiences
      .map((e) => [e.role, e.description ?? "", ...(e.bullets ?? [])].join(" "))
      .join(" ") +
      " " +
      (profile.profile.summary ?? ""),
  );
  const responsibilities = analysis.responsibilities ?? [];
  const respHits = responsibilities.filter((r) => {
    const words = normalize(r)
      .split(" ")
      .filter((w) => w.length > 4);
    if (words.length === 0) return false;
    const hits = words.filter((w) => profileText.includes(w)).length;
    return hits / words.length >= 0.3;
  }).length;
  const responsibilitiesRatio = ratio(respHits, responsibilities.length);

  // Senioridade
  const jobRank = seniorityRank(job.seniority || analysis.seniority);
  const profileRank = seniorityRank(profile.profile.seniority);
  let seniorityRatio = 0.6;
  if (jobRank === null || profileRank === null) seniorityRatio = 0.6;
  else {
    const diff = Math.abs(jobRank - profileRank);
    seniorityRatio = diff === 0 ? 1 : diff === 1 ? 0.7 : diff === 2 ? 0.4 : 0.15;
  }

  // Formação e idiomas
  const eduTerms = [...(analysis.education ?? []), ...(analysis.languages ?? [])];
  const eduHits = eduTerms.filter((t) => findEvidence(t, profile) !== null).length;
  const eduRatio = ratio(eduHits, eduTerms.length);
  evaluate(analysis.languages ?? [], true);

  // Preferências (localização e modelo de trabalho) — nunca atributos protegidos
  let prefRatio = 0.6;
  const prefs: string[] = [];
  const wantedModel = normalize(profile.profile.work_model ?? "");
  const jobModel = normalize(job.work_model ?? "");
  if (wantedModel && jobModel) {
    const ok = wantedModel === jobModel || jobModel.includes("remoto") || wantedModel.includes("indiferente");
    prefs.push(ok ? "Modelo de trabalho compatível" : "Modelo de trabalho diferente do desejado");
    prefRatio = ok ? 1 : 0.3;
  }
  const profileLoc = normalize(profile.profile.location ?? "");
  const jobLoc = normalize(job.location ?? "");
  if (profileLoc && jobLoc) {
    const sameCity = jobLoc.includes(profileLoc.split(" ")[0] ?? "") || jobLoc.includes("remoto");
    prefs.push(sameCity ? "Localização compatível" : "Localização diferente");
    prefRatio = (prefRatio + (sameCity ? 1 : 0.3)) / 2;
  }

  const breakdown: MatchBreakdownItem[] = [
    {
      key: "required",
      label: "Requisitos obrigatórios",
      score: round(requiredRatio * MATCH_WEIGHTS.required),
      max: MATCH_WEIGHTS.required,
      reason: requiredItems.length
        ? `${requiredItems.filter((i) => i.status === "match").length} de ${requiredItems.length} requisitos identificados no seu perfil.`
        : "Nenhum requisito obrigatório identificado na descrição.",
    },
    {
      key: "skills",
      label: "Competências técnicas",
      score: round(skillsRatio * MATCH_WEIGHTS.skills),
      max: MATCH_WEIGHTS.skills,
      reason: optionalItems.length
        ? `${optionalItems.filter((i) => i.status !== "gap").length} de ${optionalItems.length} competências citadas aparecem no seu perfil.`
        : "Nenhuma competência adicional identificada.",
    },
    {
      key: "experience",
      label: "Experiência relevante",
      score: round(experienceRatio * MATCH_WEIGHTS.experience),
      max: MATCH_WEIGHTS.experience,
      reason: `Você registrou aproximadamente ${years} anos de experiência; a vaga indica cerca de ${neededYears} anos.`,
    },
    {
      key: "responsibilities",
      label: "Responsabilidades",
      score: round(responsibilitiesRatio * MATCH_WEIGHTS.responsibilities),
      max: MATCH_WEIGHTS.responsibilities,
      reason: responsibilities.length
        ? `${respHits} de ${responsibilities.length} responsabilidades têm correspondência no seu histórico.`
        : "Nenhuma responsabilidade estruturada identificada.",
    },
    {
      key: "seniority",
      label: "Senioridade",
      score: round(seniorityRatio * MATCH_WEIGHTS.seniority),
      max: MATCH_WEIGHTS.seniority,
      reason:
        jobRank === null || profileRank === null
          ? "Senioridade não informada em um dos lados; usado valor neutro."
          : `Senioridade da vaga (${job.seniority || analysis.seniority}) comparada com a do seu perfil (${profile.profile.seniority}).`,
    },
    {
      key: "educationLanguages",
      label: "Formação e idiomas",
      score: round(eduRatio * MATCH_WEIGHTS.educationLanguages),
      max: MATCH_WEIGHTS.educationLanguages,
      reason: eduTerms.length
        ? `${eduHits} de ${eduTerms.length} exigências de formação/idioma identificadas no perfil.`
        : "Nenhuma exigência de formação ou idioma identificada.",
    },
    {
      key: "preferences",
      label: "Preferências pessoais",
      score: round(prefRatio * MATCH_WEIGHTS.preferences),
      max: MATCH_WEIGHTS.preferences,
      reason: prefs.length ? prefs.join(" · ") : "Preferências não informadas; usado valor neutro.",
    },
  ];

  const score = Math.max(0, Math.min(100, Math.round(breakdown.reduce((a, b) => a + b.score, 0))));

  return { score, level: matchLevel(score).label, breakdown, items: dedupeItems(items) };
}

function dedupeItems(items: MatchItem[]): MatchItem[] {
  const map = new Map<string, MatchItem>();
  for (const item of items) {
    const key = normalize(item.label);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, item);
      continue;
    }
    map.set(key, {
      ...existing,
      required: existing.required || item.required,
      status: rank(existing.status) >= rank(item.status) ? existing.status : item.status,
      evidence: Array.from(new Set([...existing.evidence, ...item.evidence])),
    });
  }
  return Array.from(map.values());
}

function rank(status: MatchItem["status"]): number {
  return status === "match" ? 2 : status === "partial" ? 1 : 0;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
