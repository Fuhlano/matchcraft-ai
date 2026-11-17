CREATE TABLE public.job_sources (
  id text PRIMARY KEY,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'api',
  requires_credentials boolean NOT NULL DEFAULT false,
  docs_url text DEFAULT '',
  notes text DEFAULT '',
  enabled boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.job_sources TO authenticated;
GRANT ALL ON public.job_sources TO service_role;
ALTER TABLE public.job_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read sources" ON public.job_sources FOR SELECT TO authenticated USING (true);
INSERT INTO public.job_sources (id, name, kind, requires_credentials, docs_url, notes) VALUES
 ('jooble','Jooble','aggregator',true,'https://jooble.org/api/about','Requer JOOBLE_API_KEY'),
 ('adzuna','Adzuna','aggregator',true,'https://developer.adzuna.com/','Requer ADZUNA_APP_ID e ADZUNA_APP_KEY; Brasil disponível (país br)'),
 ('greenhouse','Greenhouse (páginas de carreira)','careers',false,'https://developers.greenhouse.io/job-board.html','API pública por empresa'),
 ('lever','Lever (páginas de carreira)','careers',false,'https://github.com/lever/postings-api','API pública por empresa');

CREATE TABLE public.external_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  external_id text NOT NULL,
  dedupe_hash text NOT NULL UNIQUE,
  canonical_url text DEFAULT '',
  title text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  logo_url text DEFAULT '',
  description text NOT NULL DEFAULT '',
  summary text DEFAULT '',
  area text DEFAULT '',
  seniority text DEFAULT '',
  location text DEFAULT '',
  country text DEFAULT '',
  work_model text DEFAULT '',
  remote_scope text DEFAULT '',
  contract_type text DEFAULT '',
  salary_min numeric,
  salary_max numeric,
  currency text DEFAULT '',
  salary_period text DEFAULT '',
  english_requirement text NOT NULL DEFAULT 'not_mentioned',
  languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills text[] NOT NULL DEFAULT '{}',
  posted_at timestamptz,
  source_updated_at timestamptz,
  expires_at timestamptz,
  url text DEFAULT '',
  apply_url text DEFAULT '',
  also_seen_in text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'open',
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  last_checked_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX external_jobs_source_idx ON public.external_jobs(source, external_id);
CREATE INDEX external_jobs_posted_idx ON public.external_jobs(posted_at DESC);
GRANT SELECT ON public.external_jobs TO authenticated;
GRANT ALL ON public.external_jobs TO service_role;
ALTER TABLE public.external_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read external jobs" ON public.external_jobs FOR SELECT TO authenticated USING (true);

CREATE TABLE public.job_user_preferences (
  user_id uuid PRIMARY KEY,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  use_profile boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_user_preferences TO authenticated;
GRANT ALL ON public.job_user_preferences TO service_role;
ALTER TABLE public.job_user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prefs" ON public.job_user_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_job_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  external_job_id uuid NOT NULL REFERENCES public.external_jobs(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'new',
  saved_job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  score integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, external_job_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_job_interactions TO authenticated;
GRANT ALL ON public.user_job_interactions TO service_role;
ALTER TABLE public.user_job_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own interactions" ON public.user_job_interactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.job_search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  filters_hash text NOT NULL DEFAULT '',
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_ids uuid[] NOT NULL DEFAULT '{}',
  sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX job_search_history_user_idx ON public.job_search_history(user_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.job_search_history TO authenticated;
GRANT ALL ON public.job_search_history TO service_role;
ALTER TABLE public.job_search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own history" ON public.job_search_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);