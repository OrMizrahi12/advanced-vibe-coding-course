CREATE TABLE IF NOT EXISTS public.release_votes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  version text NOT NULL UNIQUE,
  env text NOT NULL,
  status text NOT NULL,
  votes integer NOT NULL DEFAULT 0
);
INSERT INTO public.release_votes (version, env, status, votes) VALUES
  ('v1.4.0', 'prod',    'shipped', 42),
  ('v1.5.0', 'staging', 'blocked', 19),
  ('v1.6.0', 'dev',     'planned',  7)
ON CONFLICT (version) DO NOTHING;
