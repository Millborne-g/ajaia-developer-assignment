import { supabase } from '@/shared/api/supabase'
import { EMPTY_TIPTAP_DOC } from '@/shared/lib/emptyTiptapDoc'
import { DEFAULT_DOCUMENT_TITLE } from '@/shared/lib/documentTitle'
import { fetchProfilesByIds } from '@/entities/user/model/profileApi'
import type { Json } from '@/shared/types'
import type { Document, DocumentShare } from './types'

// ─── Documents ────────────────────────────────────────────────────────────────

export async function fetchOwnedDocuments(userId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as Document[]
}

export async function fetchSharedDocuments(userId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('document_shares')
    .select('document_id, documents(*)')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  // Flatten nested join result
  return (data ?? []).map(
    (row: { document_id: string; documents: unknown }) =>
      row.documents as Document,
  )
}

export async function fetchDocument(id: string): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Document
}

export async function createDocument(
  ownerId: string,
  title = DEFAULT_DOCUMENT_TITLE,
  content: Json = EMPTY_TIPTAP_DOC,
): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .insert({ title, owner_id: ownerId, content })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Document
}

export async function updateDocumentTitle(
  id: string,
  title: string,
): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({ title })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function updateDocumentContent(
  id: string,
  content: Json,
): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({ content })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Shares ───────────────────────────────────────────────────────────────────

export async function fetchDocumentShares(
  documentId: string,
): Promise<DocumentShare[]> {
  const { data, error } = await supabase
    .from('document_shares')
    .select('*')
    .eq('document_id', documentId)

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as Omit<DocumentShare, 'email'>[]
  const userIds = [...new Set(rows.map((row) => row.user_id))]
  const profiles = await fetchProfilesByIds(userIds)
  const emailByUserId = new Map(profiles.map((p) => [p.id, p.email]))

  return rows.map((row) => ({
    ...row,
    email: emailByUserId.get(row.user_id) ?? null,
  }))
}

export async function shareDocument(
  documentId: string,
  userId: string,
  permission: 'view' | 'edit' = 'edit',
): Promise<void> {
  const { error } = await supabase
    .from('document_shares')
    .insert({ document_id: documentId, user_id: userId, permission })

  if (error) {
    if (error.code === '23505') {
      throw new Error('This user already has access to the document.')
    }
    throw new Error(error.message)
  }
}

export async function revokeShare(shareId: string): Promise<void> {
  const { error } = await supabase
    .from('document_shares')
    .delete()
    .eq('id', shareId)

  if (error) throw new Error(error.message)
}

/**
 * Returns the calling user's access level for a document.
 * 'owner' → owns the doc; 'edit' / 'view' → share permission; throws if no access.
 */
export async function fetchMyDocumentAccess(
  documentId: string,
  userId: string,
): Promise<'owner' | 'edit' | 'view'> {
  // Check ownership first
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('owner_id')
    .eq('id', documentId)
    .single()

  if (docError) throw new Error(docError.message)
  if ((doc as { owner_id: string }).owner_id === userId) return 'owner'

  // Check share row for this user
  const { data: share, error: shareError } = await supabase
    .from('document_shares')
    .select('permission')
    .eq('document_id', documentId)
    .eq('user_id', userId)
    .single()

  if (shareError) throw new Error(shareError.message)
  return (share as { permission: 'view' | 'edit' }).permission
}

/**
 * Changes an existing share's permission by revoking + re-inserting.
 * Schema intentionally disallows UPDATE on document_shares.
 */
export async function updateSharePermission(
  shareId: string,
  documentId: string,
  userId: string,
  permission: 'view' | 'edit',
): Promise<void> {
  await revokeShare(shareId)
  await shareDocument(documentId, userId, permission)
}
