import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { JobAnalysis } from "./types";

const AnalyzeJobInput = z.object({
  title: z.string().default(""),
  description: z.string().min(20, "Descrição muito curta para análise."),
});

export interface ParsedResume {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  github: string;
  headline: string;
  summary: string;
  experiences: {
    company: string;
    role: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    bullets: string[];
  }[];
  education: { institution: string; course: string; level: string; startDate: string; endDate: string }[];
  skills: { name: string; category: "hard" | "tool" | "tech" | "soft" }[];
  certifications: { name: string; issuer: string; issuedDate: string; kind: "certification" | "course" }[];
  projects: { name: string; description: string; tech: string[] }[];
  languages: { name: string; level: string }[];
}

/** analyzeJob(): estrutura requisitos, competências e responsabilidades da vaga. */
export const analyzeJobAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnalyzeJobInput.parse(input))
  .handler(async ({ data }) => {
    const { askJson, NO_INVENTION_RULE } = await import("./ai.server");
    const system = `Você é um especialista em recrutamento e ATS. Extraia de forma estruturada apenas o que está na descrição da vaga. ${NO_INVENTION_RULE}
Formato JSON:
{"requiredSkills":[],"desirableSkills":[],"technologies":[],"softSkills":[],"responsibilities":[],"keywords":[],"education":[],"languages":[],"seniority":"","area":"","experienceYears":null}
Não inclua atributos pessoais protegidos (idade, gênero, raça, religião, deficiência, orientação sexual).`;
    const result = await askJson<JobAnalysis>(
      system,
      `Cargo: ${data.title}\n\nDescrição da vaga:\n${data.description.slice(0, 12000)}`,
    );
    return sanitizeAnalysis(result);
  });

/** parseResume(): converte o texto do currículo em perfil estruturado. */
export const parseResumeAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ text: z.string().min(30) }).parse(input))
  .handler(async ({ data }) => {
    const { askJson, NO_INVENTION_RULE } = await import("./ai.server");
    const system = `Você extrai dados de currículos preservando ao máximo o conteúdo original. ${NO_INVENTION_RULE}
Se um dado não existir no texto, devolva string vazia ou lista vazia. Formato JSON:
{"fullName":"","email":"","phone":"","location":"","linkedin":"","portfolio":"","github":"","headline":"","summary":"","experiences":[{"company":"","role":"","location":"","startDate":"","endDate":"","isCurrent":false,"bullets":[]}],"education":[{"institution":"","course":"","level":"","startDate":"","endDate":""}],"skills":[{"name":"","category":"hard"}],"certifications":[{"name":"","issuer":"","issuedDate":"","kind":"certification"}],"projects":[{"name":"","description":"","tech":[]}],"languages":[{"name":"","level":""}]}`;
    const parsed = await askJson<ParsedResume>(system, data.text.slice(0, 20000));
    return {
      ...parsed,
      experiences: parsed.experiences ?? [],
      education: parsed.education ?? [],
      skills: parsed.skills ?? [],
      certifications: parsed.certifications ?? [],
      projects: parsed.projects ?? [],
      languages: parsed.languages ?? [],
    } satisfies ParsedResume;
  });

const RewriteInput = z.object({
  action: z.enum(["summary", "experience", "keywords", "concise", "results", "trim"]),
  text: z.string().min(5),
  context: z.string().default(""),
});

/** rewriteExperience()/generateResumeSummary(): sugestões sem criar fatos. */
export const rewriteTextAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RewriteInput.parse(input))
  .handler(async ({ data }) => {
    const { askJson, NO_INVENTION_RULE } = await import("./ai.server");
    const instructions: Record<string, string> = {
      summary: "Reescreva o resumo profissional destacando o que é relevante para a vaga.",
      experience: "Reescreva a descrição da experiência em bullets objetivos e orientados a entrega.",
      keywords: "Reaproveite a terminologia da vaga nos trechos onde o conteúdo já corresponde.",
      concise: "Torne o texto mais objetivo, sem perder informação relevante.",
      results: "Destaque os resultados já informados; não crie números novos.",
      trim: "Remova conteúdo irrelevante para esta vaga, mantendo o que é verdadeiro e útil.",
    };
    const system = `Você é um especialista em currículos ATS-friendly. ${instructions[data.action]} ${NO_INVENTION_RULE}
Formato JSON: {"suggestion":"","missingInfo":["itens que melhorariam o texto mas não existem no material recebido"]}`;
    return await askJson<{ suggestion: string; missingInfo: string[] }>(
      system,
      `Contexto da vaga:\n${data.context.slice(0, 4000)}\n\nTexto original:\n${data.text.slice(0, 6000)}`,
    );
  });

/** Busca o texto de uma página pública de vaga. Não contorna login nem CAPTCHA. */
export const fetchJobUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ url: z.string().url() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const response = await fetch(data.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MatchCV/1.0)" },
        redirect: "follow",
      });
      if (!response.ok) {
        return { ok: false as const, reason: `A página respondeu com status ${response.status}.` };
      }
      const html = await response.text();
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, "\n")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/\n{2,}/g, "\n")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join("\n");
      if (text.length < 400) {
        return { ok: false as const, reason: "A página não expõe a descrição publicamente." };
      }
      return { ok: true as const, text: text.slice(0, 15000) };
    } catch {
      return { ok: false as const, reason: "Não foi possível acessar essa URL." };
    }
  });

function sanitizeAnalysis(a: Partial<JobAnalysis>): JobAnalysis {
  const arr = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()) : []);
  return {
    requiredSkills: arr(a.requiredSkills),
    desirableSkills: arr(a.desirableSkills),
    technologies: arr(a.technologies),
    softSkills: arr(a.softSkills),
    responsibilities: arr(a.responsibilities),
    keywords: arr(a.keywords),
    education: arr(a.education),
    languages: arr(a.languages),
    seniority: typeof a.seniority === "string" ? a.seniority : "",
    area: typeof a.area === "string" ? a.area : "",
    experienceYears: typeof a.experienceYears === "number" ? a.experienceYears : null,
  };
}
