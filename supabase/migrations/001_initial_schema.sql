-- ============================================================
-- Ajaia Collaborative Document Editor — Initial Schema
-- ============================================================
-- Apply this migration in the Supabase SQL Editor (or via the
-- Supabase CLI: supabase db push).
--
-- Cross-table RLS checks use SECURITY DEFINER helpers so that
-- documents ↔ document_shares policies do not recurse infinitely.
-- ============================================================

-- ─── Helper functions (SECURITY DEFINER — bypass RLS) ─────────────────────────

CREATE OR REPLACE FUNCTION public.is_document_owner(doc_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.documents
    WHERE id = doc_id AND owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.has_document_share(
  doc_id UUID,
  required_permission TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.document_shares
    WHERE document_id = doc_id
      AND user_id = auth.uid()
      AND (
        required_permission IS NULL
        OR permission = required_permission
      )
  );
$$;

-- ─── profiles ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_profiles" ON public.profiles;
CREATE POLICY "authenticated_read_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "no_direct_insert_profiles" ON public.profiles;
CREATE POLICY "no_direct_insert_profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (false);

-- ─── documents ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.documents (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT        NOT NULL DEFAULT 'Untitled Document',
  content    JSONB       NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}',
  owner_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_owner_id_idx
  ON public.documents (owner_id);

CREATE INDEX IF NOT EXISTS documents_updated_at_idx
  ON public.documents (updated_at DESC);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- ─── document_shares ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.document_shares (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID        NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission  TEXT        NOT NULL DEFAULT 'edit'
                          CHECK (permission IN ('view', 'edit')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, user_id)
);

CREATE INDEX IF NOT EXISTS document_shares_document_id_idx
  ON public.document_shares (document_id);

CREATE INDEX IF NOT EXISTS document_shares_user_id_idx
  ON public.document_shares (user_id);

ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

-- ─── documents RLS policies ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "owner_select_documents" ON public.documents;
CREATE POLICY "owner_select_documents"
  ON public.documents FOR SELECT
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "shared_select_documents" ON public.documents;
CREATE POLICY "shared_select_documents"
  ON public.documents FOR SELECT
  USING (public.has_document_share(id));

DROP POLICY IF EXISTS "owner_insert_documents" ON public.documents;
CREATE POLICY "owner_insert_documents"
  ON public.documents FOR INSERT
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "owner_or_editor_update_documents" ON public.documents;
CREATE POLICY "owner_or_editor_update_documents"
  ON public.documents FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR public.has_document_share(id, 'edit')
  );

DROP POLICY IF EXISTS "owner_delete_documents" ON public.documents;
CREATE POLICY "owner_delete_documents"
  ON public.documents FOR DELETE
  USING (owner_id = auth.uid());

-- ─── document_shares RLS policies ─────────────────────────────────────────────

DROP POLICY IF EXISTS "owner_select_shares" ON public.document_shares;
CREATE POLICY "owner_select_shares"
  ON public.document_shares FOR SELECT
  USING (public.is_document_owner(document_id));

DROP POLICY IF EXISTS "shared_user_select_own_share" ON public.document_shares;
CREATE POLICY "shared_user_select_own_share"
  ON public.document_shares FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "owner_insert_shares" ON public.document_shares;
CREATE POLICY "owner_insert_shares"
  ON public.document_shares FOR INSERT
  WITH CHECK (public.is_document_owner(document_id));

DROP POLICY IF EXISTS "owner_delete_shares" ON public.document_shares;
CREATE POLICY "owner_delete_shares"
  ON public.document_shares FOR DELETE
  USING (public.is_document_owner(document_id));

-- UPDATE is intentionally not allowed; use delete-then-insert to change permissions

-- ─── Functions & Triggers ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS documents_updated_at ON public.documents;
CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
