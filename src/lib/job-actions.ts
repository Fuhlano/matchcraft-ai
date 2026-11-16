import { supabase } from "@/integrations/supabase/client";
import { analyzeJobAI } from "./ai.functions";
import { analyzeJobLocally } from "./job-parser";
import { calculateMatch } from "./matching";
import { requireUserId } from "./queries";
import type { Job, JobAnalysis, MasterProfile } from "./types";

/** Analisa a vaga (IA quando habilitada, senão parser determinístico) e persiste o resultado. */
export async function analyzeJob(job: Job, aiEnabled: boolean): Promise<JobAnalysis> {
  let analysis: JobAnalysis;
  if (aiEnabled) {
    try {
      analysis = (await analyzeJobAI({
        data: { title: job.title, description: job.description },
      })) as JobAnalysis;
    } catch {
      analysis = analyzeJobLocally(job.description, job.title);
    }
  } else {
    analysis = analyzeJobLocally(job.description, job.title);
  }

  const { error } = await supabase
    .from("jobs")
    .update({ analysis: analysis as never, analyzed_at: new Date().toISOString() })
    .eq("id", job.id);
  if (error) throw error;

  await supabase.from("job_requirements").delete().eq("job_id", job.id);
  const userId = await requireUserId();
  const rows = [
    ...analysis.requiredSkills.map((label) => ({ label, kind: "skill", required: true })),
    ...analysis.desirableSkills.map((label) => ({ label, kind: "skill", required: false })),
    ...analysis.technologies.map((label) => ({ label, kind: "tech", required: false })),
    ...analysis.softSkills.map((label) => ({ label, kind: "soft", required: false })),
  ].map((row) => ({ ...row, job_id: job.id, user_id: userId }));
  if (rows.length) await supabase.from("job_requirements").insert(rows);

  return analysis;
}

/** Calcula e salva o match entre o perfil mestre e a vaga analisada. */
export async function saveMatch(profile: MasterProfile, job: Job, analysis: JobAnalysis) {
  const result = calculateMatch(profile, {
    title: job.title,
    location: job.location,
    work_model: job.work_model,
    seniority: job.seniority,
    analysis,
  });
  const userId = await requireUserId();
  const { data: existing } = await supabase
    .from("matches")
    .select("id")
    .eq("job_id", job.id)
    .maybeSingle();

  const payload = {
    user_id: userId,
    job_id: job.id,
    score: result.score,
    breakdown: { items: result.breakdown, level: result.level } as never,
    details: { items: result.items } as never,
  };

  if (existing) {
    await supabase.from("matches").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("matches").insert(payload);
  }
  return result;
}
