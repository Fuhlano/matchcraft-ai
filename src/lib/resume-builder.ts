import type { JobAnalysis, MasterProfile, MatchResult, ResumeContent } from "./types";
import { normalize } from "./matching";

function period(start?: string | null, end?: string | null, current?: boolean): string {
  const s = (start ?? "").trim();
  const e = current ? "atual" : (end ?? "").trim();
  if (!s && !e) return "";
  return [s, e].filter(Boolean).join(" – ");
}

/**
 * Monta o currículo a partir do perfil mestre, priorizando o que é relevante para a vaga.
 * Nunca cria informação nova: apenas seleciona, ordena e reaproveita o conteúdo existente.
 */
export function buildResumeContent(
  profile: MasterProfile,
  options: { analysis?: JobAnalysis | null; match?: MatchResult | null; jobTitle?: string } = {},
): ResumeContent {
  const { analysis, jobTitle } = options;
  const keywords = analysis
    ? Array.from(
        new Set([
          ...analysis.requiredSkills,
          ...analysis.technologies,
          ...analysis.desirableSkills,
          ...analysis.softSkills,
        ]),
      )
    : [];

  const relevanceOf = (text: string) => {
    const n = normalize(text);
    return keywords.reduce((acc, k) => (n.includes(normalize(k)) ? acc + 1 : acc), 0);
  };

  const experiences = [...profile.experiences]
    .sort((a, b) => {
      const rel = relevanceOf([b.role, b.description ?? "", ...(b.bullets ?? [])].join(" ")) -
        relevanceOf([a.role, a.description ?? "", ...(a.bullets ?? [])].join(" "));
      if (rel !== 0) return rel;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    })
    .map((e) => ({
      company: e.company,
      role: e.role,
      period: period(e.start_date, e.end_date, e.is_current),
      location: e.location ?? "",
      bullets: (e.bullets?.length ? e.bullets : splitDescription(e.description ?? "")).filter(Boolean),
    }));

  // Competências: as que a vaga cita e o perfil possui primeiro
  const skills = [...profile.skills]
    .sort((a, b) => relevanceOf(b.name) - relevanceOf(a.name) || a.sort_order - b.sort_order)
    .map((s) => s.name);

  const contact = [
    profile.profile.location,
    profile.profile.email,
    profile.profile.phone,
    profile.profile.linkedin_url,
    profile.profile.portfolio_url,
  ].filter((v): v is string => Boolean(v && v.trim()));

  return {
    name: profile.profile.full_name || "",
    headline: profile.profile.headline || jobTitle || "",
    contact,
    summary: profile.profile.summary || "",
    experiences,
    education: profile.education.map((e) => ({
      institution: e.institution,
      course: [e.level, e.course].filter(Boolean).join(" · "),
      period: period(e.start_date, e.end_date),
    })),
    skills,
    certifications: profile.certifications.map((c) =>
      [c.name, c.issuer].filter(Boolean).join(" — "),
    ),
    languages: profile.languages.map((l) => `${l.name} — ${l.level}`),
    keywords,
  };
}

function splitDescription(description: string): string[] {
  return description
    .split(/\n|(?<=\.)\s+/)
    .map((s) => s.replace(/^[\s•\-–*]+/, "").trim())
    .filter((s) => s.length > 8)
    .slice(0, 6);
}

export function profileCompleteness(profile: MasterProfile) {
  const checks = [
    { label: "Dados pessoais", ok: Boolean(profile.profile.full_name && profile.profile.email && profile.profile.location) },
    { label: "Resumo profissional", ok: Boolean(profile.profile.summary && profile.profile.summary.length > 40) },
    { label: "Experiência", ok: profile.experiences.length > 0 },
    { label: "Competências", ok: profile.skills.length >= 3 },
    { label: "Formação", ok: profile.education.length > 0 },
    { label: "Certificações", ok: profile.certifications.length > 0 },
    { label: "Idiomas", ok: profile.languages.length > 0 },
    { label: "Projetos", ok: profile.projects.length > 0 },
    { label: "Preferências", ok: Boolean(profile.profile.desired_role && profile.profile.work_model) },
  ];
  const done = checks.filter((c) => c.ok).length;
  return { percent: Math.round((done / checks.length) * 100), checks };
}
