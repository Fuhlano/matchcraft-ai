import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { passesFilters, type SearchFilters } from "./classify";

const Str = z.string().trim().max(80);
const FiltersSchema = z.object({
  roles: z.array(Str).max(10).default([]),
  areas: z.array(Str).max(16).default([]),
  seniorities: z.array(Str).max(10).default([]),
  workModels: z.array(z.enum(["remote", "hybrid", "onsite"])).default([]),
  remoteScopes: z.array(z.enum(["brazil", "restricted", "international", "unspecified"])).default([]),
  country: Str.default(""),
  state: Str.default(""),
  city: Str.default(""),
  radiusKm: z.number().int().min(0).max(500).nullable().default(null),
  english: z.enum(["any", "required", "desirable", "none"]).default("any"),
  otherLanguages: z.array(Str).max(5).default([]),
  contracts: z.array(Str).max(8).default([]),
  salaryMin: z.number().min(0).max(10_000_000).nullable().default(null),
  currency: Str.default("BRL"),
  salaryPeriod: z.enum(["month", "year", "hour"]).default("month"),
  postedWithinDays: z.number().int().min(1).max(365).nullable().default(null),
  sources: z.array(z.enum(["jooble", "adzuna", "greenhouse", "lever"])).default([]),
  greenhouseBoards: z.array(z.string().trim().regex(/^[a-z0-9_-]{1,60}$/i)).max(8).default([]),
  leverBoards: z.array(z.string().trim().regex(/^[a-z0-9_-]{1,60}$/i)).max(8).default([]),
});

const CACHE_MINUTES = 30;
const MAX_SEARCHES_PER_HOUR = 30;

function hashFilters(f: unknown) {
  const s = JSON.stringify(f);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return String(h);
}

type ExtRow = import("@/integrations/supabase/types").Database["public"]["Tables"]["external_jobs"]["Row"];
const getRows = async (): Promise<ExtRow[]> => [];

export const getSourcesStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { providerConfigured } = await import("./providers.server");
    const { data } = await context.supabase.from("job_sources").select("*").order("id");
    return (data ?? []).map((s) => ({ ...s, configured: providerConfigured(s.id) }));
  });

export const searchExternalJobs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ filters: FiltersSchema, force: z.boolean().default(false) }).parse(input))
  .handler(async ({ data, context }) => {
    const filters = data.filters as SearchFilters;
    const { supabase, userId } = context;
    const filtersHash = hashFilters(filters);

    // Cache: reutiliza resultado recente para os mesmos filtros.
    if (!data.force) {
      const since = new Date(Date.now() - CACHE_MINUTES * 60_000).toISOString();
      const { data: cached } = await supabase
        .from("job_search_history").select("*").eq("filters_hash", filtersHash).gte("created_at", since)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (cached) {
        const { data: rows } = await supabase.from("external_jobs").select("*").in("id", cached.result_ids).eq("status", "open");
        return { jobs: rows ?? [], sources: cached.sources as { source: string; status: string; message: string; count: number }[], cached: true, searchedAt: cached.created_at };
      }
    }

    // Proteção contra uso abusivo.
    const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
    const { count } = await supabase.from("job_search_history").select("id", { count: "exact", head: true }).gte("created_at", hourAgo);
    if ((count ?? 0) >= MAX_SEARCHES_PER_HOUR) throw new Error("Muitas buscas na última hora. Tente novamente em alguns minutos.");

    const { PROVIDERS } = await import("./providers.server");
    const wanted = filters.sources.length ? filters.sources : Object.keys(PROVIDERS);
    const results = await Promise.all(
      wanted.map(async (id) => {
        try {
          return await PROVIDERS[id]!(filters);
        } catch (e) {
          console.error(`[job-search] ${id} falhou`, e);
          return { source: id, status: "error" as const, message: (e as Error).message, jobs: [] };
        }
      }),
    );

    // Deduplicação: hash (título+empresa+local) e URL canônica.
    const byHash = new Map<string, (typeof results)[number]["jobs"][number] & { also: Set<string> }>();
    const seenUrl = new Map<string, string>();
    for (const r of results)
      for (const j of r.jobs) {
        if (!j.title || !j.url) continue;
        const hashFromUrl = seenUrl.get(j.canonical_url);
        const key = hashFromUrl ?? j.dedupe_hash;
        const prev = byHash.get(key);
        if (prev) { if (prev.source !== j.source) prev.also.add(j.source); continue; }
        byHash.set(key, { ...j, dedupe_hash: key, also: new Set() });
        seenUrl.set(j.canonical_url, key);
      }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const rows = [...byHash.values()].map(({ also, ...j }) => ({
      ...j, also_seen_in: [...also], status: "open", last_seen_at: now, last_checked_at: now,
    }));

    let stored: Awaited<ReturnType<typeof getRows>> = [];
    if (rows.length) {
      const { data: up, error } = await supabaseAdmin.from("external_jobs").upsert(rows, { onConflict: "dedupe_hash" }).select("*");
      if (error) { console.error("[job-search] upsert", error); throw new Error("Não foi possível salvar as vagas encontradas."); }
      stored = up ?? [];
    }

    // Vagas de páginas de carreira que sumiram do board consultado: encerradas (evidência direta).
    for (const r of results) {
      if (!("boardsChecked" in r) || !r.boardsChecked) continue;
      const returned = new Set(r.jobs.map((j) => j.external_id));
      for (const b of r.boardsChecked) {
        const { data: existing } = await supabaseAdmin.from("external_jobs").select("id, external_id")
          .eq("source", r.source).like("external_id", `${b}:%`).eq("status", "open");
        // Só marca como encerrada se a vaga não aparece no board completo (sem filtro de cargo).
        const stale = (existing ?? []).filter((e) => !returned.has(e.external_id));
        if (stale.length && !filters.roles.length)
          await supabaseAdmin.from("external_jobs").update({ status: "closed", last_checked_at: now }).in("id", stale.map((s) => s.id));
      }
    }

    const visible = stored.filter((j) => passesFilters(j, filters));
    const sources = results.map((r) => ({ source: r.source, status: r.status, message: r.message ?? "", count: r.jobs.length }));
    await supabase.from("job_search_history").insert({
      user_id: userId, filters_hash: filtersHash, filters: filters as never,
      result_ids: visible.map((j) => j.id), sources: sources as never,
    });
    return { jobs: visible, sources, cached: false, searchedAt: now };
  });
