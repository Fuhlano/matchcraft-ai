export type SkillCategory = "hard" | "tool" | "tech" | "soft";

export interface Profile {
  id: string;
  full_name: string;
  headline: string | null;
  summary: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  seniority: string | null;
  area: string | null;
  desired_role: string | null;
  work_model: string | null;
  salary_expectation: string | null;
  interests: string[];
  ai_analysis_enabled: boolean;
  keep_version_history: boolean;
  onboarding_completed: boolean;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  bullets: string[];
  sort_order: number;
}

export interface Education {
  id: string;
  institution: string;
  course: string;
  level: string | null;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: string | null;
  sort_order: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string | null;
  issued_date: string | null;
  kind: string; // certification | course
  sort_order: number;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  tech: string[];
  sort_order: number;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

export interface MasterProfile {
  profile: Profile;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  projects: ProjectItem[];
  languages: LanguageItem[];
}

export interface JobAnalysis {
  requiredSkills: string[];
  desirableSkills: string[];
  technologies: string[];
  softSkills: string[];
  responsibilities: string[];
  keywords: string[];
  education: string[];
  languages: string[];
  seniority: string;
  area: string;
  experienceYears: number | null;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  work_model: string | null;
  seniority: string | null;
  area: string | null;
  salary: string | null;
  url: string | null;
  description: string;
  source: string;
  is_demo: boolean;
  analysis: JobAnalysis | null;
  analyzed_at: string | null;
  created_at: string;
}

export type MatchStatus = "match" | "partial" | "gap";

export interface MatchItem {
  label: string;
  status: MatchStatus;
  required: boolean;
  evidence: string[];
}

export interface MatchBreakdownItem {
  key: string;
  label: string;
  score: number;
  max: number;
  reason: string;
}

export interface MatchResult {
  score: number;
  level: string;
  breakdown: MatchBreakdownItem[];
  items: MatchItem[];
}

export interface ResumeBullet {
  text: string;
}

export interface ResumeExperience {
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
}

export interface ResumeContent {
  name: string;
  headline: string;
  contact: string[];
  summary: string;
  experiences: ResumeExperience[];
  education: { institution: string; course: string; period: string }[];
  skills: string[];
  certifications: string[];
  languages: string[];
  keywords: string[];
}

export interface AtsBreakdown {
  structure: number;
  keywords: number;
  relevance: number;
  clarity: number;
  consistency: number;
  quantified: number;
  readability: number;
}

export const APPLICATION_STATUSES = [
  "saved",
  "preparing",
  "applied",
  "interview",
  "test",
  "offer",
  "rejected",
  "closed",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  saved: "Salva",
  preparing: "Preparando candidatura",
  applied: "Candidatado",
  interview: "Entrevista",
  test: "Teste",
  offer: "Oferta",
  rejected: "Recusado",
  closed: "Encerrado",
};

export interface Application {
  id: string;
  job_id: string | null;
  resume_id: string | null;
  status: ApplicationStatus;
  notes: string | null;
  contact: string | null;
  next_action: string | null;
  next_action_date: string | null;
  applied_at: string | null;
  sort_order: number;
  created_at: string;
}
