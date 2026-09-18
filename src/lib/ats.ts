import type { AtsBreakdown, ResumeContent } from "./types";
import { normalize } from "./matching";

export const ATS_MAX: AtsBreakdown = {
  structure: 20,
  keywords: 20,
  relevance: 20,
  clarity: 15,
  consistency: 10,
  quantified: 10,
  readability: 5,
};

export const ATS_LABEL: Record<keyof AtsBreakdown, string> = {
  structure: "Estrutura",
  keywords: "Palavras-chave",
  relevance: "Relevância",
  clarity: "Clareza",
  consistency: "Consistência",
  quantified: "Experiência quantificada",
  readability: "Legibilidade",
};

/**
 * ATS Score estimado: mede a compatibilidade estrutural e textual do currículo.
 * Não é garantia de aprovação em nenhum sistema de recrutamento específico.
 */
export function calculateAtsScore(
  resume: ResumeContent,
  jobKeywords: string[] = [],
): { score: number; breakdown: AtsBreakdown; tips: string[] } {
  const tips: string[] = [];

  // Estrutura
  let structure = 0;
  if (resume.name?.trim()) structure += 4;
  if (resume.contact?.filter(Boolean).length >= 2) structure += 4;
  else tips.push("Inclua pelo menos e-mail e telefone no cabeçalho.");
  if (resume.summary?.trim()) structure += 4;
  else tips.push("Adicione um resumo profissional no topo do currículo.");
  if (resume.experiences?.length) structure += 4;
  else tips.push("Adicione ao menos uma experiência profissional.");
  if (resume.education?.length || resume.certifications?.length) structure += 4;
  else tips.push("Inclua formação ou certificações.");

  // Palavras-chave da vaga presentes no texto
  const text = normalize(
    [
      resume.summary,
      ...resume.skills,
      ...resume.keywords,
      ...resume.experiences.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ]
      .filter(Boolean)
      .join(" "),
  );
  const kw = jobKeywords.map(normalize).filter(Boolean);
  const hits = kw.filter((k) => text.includes(k)).length;
  const keywords = kw.length ? Math.round((hits / kw.length) * ATS_MAX.keywords) : 12;
  if (kw.length && hits < kw.length)
    tips.push(`${kw.length - hits} palavra(s)-chave da vaga ainda não aparecem no currículo.`);

  // Relevância: bullets ligados às competências listadas
  const bullets = resume.experiences.flatMap((e) => e.bullets).filter(Boolean);
  const skillMentions = bullets.filter((b) =>
    resume.skills.some((s) => normalize(b).includes(normalize(s))),
  ).length;
  const relevance = bullets.length
    ? Math.min(ATS_MAX.relevance, Math.round((skillMentions / bullets.length) * ATS_MAX.relevance) + 6)
    : 6;
  if (relevance < ATS_MAX.relevance)
    tips.push("Cite competências da vaga dentro das descrições das experiências.");

  // Clareza: bullets curtos e objetivos
  const longBullets = bullets.filter((b) => b.split(" ").length > 32).length;
  const clarity = Math.max(
    0,
    ATS_MAX.clarity - Math.min(ATS_MAX.clarity, longBullets * 3) - (bullets.length === 0 ? 8 : 0),
  );
  if (longBullets) tips.push("Reduza bullets muito longos (acima de 30 palavras).");

  // Consistência de datas e títulos
  const periods = resume.experiences.map((e) => e.period).filter(Boolean);
  const consistentFormat = periods.length
    ? periods.every((p) => /\d{4}/.test(p)) && new Set(periods.map((p) => p.replace(/\d/g, "#"))).size <= 3
    : false;
  const consistency = consistentFormat ? ATS_MAX.consistency : periods.length ? 6 : 4;
  if (consistency < ATS_MAX.consistency) tips.push("Padronize o formato dos períodos (ex.: 01/2022 – atual).");

  // Resultados quantificados
  const withNumbers = bullets.filter((b) => /\d/.test(b)).length;
  const quantified = bullets.length
    ? Math.min(ATS_MAX.quantified, Math.round((withNumbers / bullets.length) * ATS_MAX.quantified) + 2)
    : 0;
  if (quantified < ATS_MAX.quantified)
    tips.push("Inclua métricas já existentes no seu histórico (%, volumes, prazos).");

  // Legibilidade: seções na ordem tradicional e uma coluna
  const readability = resume.experiences.length && resume.skills.length ? ATS_MAX.readability : 3;

  const breakdown: AtsBreakdown = {
    structure,
    keywords,
    relevance,
    clarity,
    consistency,
    quantified,
    readability,
  };
  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { score: Math.max(0, Math.min(100, score)), breakdown, tips };
}
