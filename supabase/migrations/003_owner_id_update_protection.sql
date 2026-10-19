-- Pin documents.owner_id on UPDATE so edit-share users cannot reassign ownership.
-- The previous policy had USING only (no WITH CHECK), which allowed changing owner_id
-- on any row the caller was allowed to update.
--
-- Safe to re-run: drops and recreates the same policy name.

DROP POLICY IF EXISTS "owner_or_editor_update_documents" ON public.documents;
CREATE POLICY "owner_or_editor_update_documents"
  ON public.documents FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR public.has_document_share(id, 'edit')
  )
  WITH CHECK (
    owner_id = (SELECT d.owner_id FROM public.documents AS d WHERE d.id = documents.id)
  );
