-- Idempotent RLS remediation for public.release_votes (Issue #1)
ALTER TABLE public.release_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_release_votes" ON public.release_votes;

CREATE POLICY "authenticated_read_release_votes"
  ON public.release_votes
  FOR SELECT
  TO authenticated
  USING (true);
