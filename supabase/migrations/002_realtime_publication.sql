-- Enable Supabase Realtime Postgres Changes for document list + editor sync.
-- Safe to re-run: only adds a table if it is not already in the publication.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'documents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'document_shares'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.document_shares;
  END IF;
END $$;
