import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type {
  Application,
  Certification,
  Education,
  Experience,
  Job,
  LanguageItem,
  MasterProfile,
  Profile,
  ProjectItem,
  Skill,
} from "./types";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Entre novamente.");
  return data.user.id;
}

export async function fetchMasterProfile(): Promise<MasterProfile> {
  const userId = await requireUserId();
  const [profile, experiences, education, skills, certifications, projects, languages] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("experiences").select("*").order("sort_order"),
    supabase.from("education").select("*").order("sort_order"),
    supabase.from("skills").select("*").order("sort_order"),
    supabase.from("certifications").select("*").order("sort_order"),
    supabase.from("projects").select("*").order("sort_order"),
    supabase.from("languages").select("*").order("created_at"),
  ]);

  const base: Profile = (profile.data as Profile | null) ?? {
    id: userId,
    full_name: "",
    headline: "",
    summary: "",
    email: "",
    phone: "",
    location: "",
    linkedin_url: "",
    portfolio_url: "",
    github_url: "",
    seniority: "",
    area: "",
    desired_role: "",
    work_model: "",
    salary_expectation: "",
    interests: [],
    ai_analysis_enabled: true,
    keep_version_history: true,
    onboarding_completed: false,
  };

  return {
    profile: base,
    experiences: (experiences.data ?? []) as Experience[],
    education: (education.data ?? []) as Education[],
    skills: (skills.data ?? []) as Skill[],
    certifications: (certifications.data ?? []) as Certification[],
    projects: (projects.data ?? []) as ProjectItem[],
    languages: (languages.data ?? []) as LanguageItem[],
  };
}

export function useMasterProfile() {
  return useQuery({ queryKey: ["master-profile"], queryFn: fetchMasterProfile });
}

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, matches(score, breakdown, details)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as (Job & { matches: { score: number }[] })[];
    },
  });
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).maybeSingle();
      if (error) throw error;
      return data as Job | null;
    },
  });
}

export function useMatch(jobId: string) {
  return useQuery({
    queryKey: ["match", jobId],
    queryFn: async () => {
      const { data, error } = await supabase.from("matches").select("*").eq("job_id", jobId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useResumes() {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, jobs(id, title, company, location), resumes(id, title, ats_score)")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as (Application & {
        jobs: { id: string; title: string; company: string; location: string | null } | null;
        resumes: { id: string; title: string; ats_score: number } | null;
      })[];
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export async function notify(title: string, body = "") {
  const userId = await requireUserId();
  await supabase.from("notifications").insert({ user_id: userId, title, body });
}

export function useInvalidate() {
  const queryClient = useQueryClient();
  return (keys: string[]) => {
    keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  };
}

export { requireUserId };
