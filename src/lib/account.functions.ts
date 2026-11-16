import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Exclui a conta do usuário autenticado e todos os dados relacionados (LGPD). */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const tables = [
      "application_events",
      "applications",
      "resume_versions",
      "resumes",
      "matches",
      "job_requirements",
      "jobs",
      "languages",
      "projects",
      "certifications",
      "skills",
      "education",
      "experiences",
      "notifications",
      "ai_generations",
      "profiles",
    ] as const;

    for (const table of tables) {
      const column = table === "profiles" ? "id" : "user_id";
      await (supabaseAdmin.from(table) as any).delete().eq(column, userId);
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error("Não foi possível excluir a conta. Tente novamente.");
    return { ok: true as const };
  });
