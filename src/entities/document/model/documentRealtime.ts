import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '@/shared/api/supabase'
import type { Json } from '@/shared/types'

const LIST_DEBOUNCE_MS = 300

export interface DocumentRemoteUpdate {
  id: string
  title: string
  content: Json
  updated_at: string
}

type Unsubscribe = () => void

function debounce(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return () => {
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn()
    }, ms)
  }
}

/**
 * Subscribe to document + share table changes relevant to the user's list.
 * Events are filtered by RLS; on any change, calls onChange (debounced).
 */
export function subscribeDocumentList(
  userId: string,
  onChange: () => void,
): Unsubscribe {
  const notify = debounce(onChange, LIST_DEBOUNCE_MS)

  const channel = supabase
    .channel(`docs-list:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'documents' },
      () => notify(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'document_shares' },
      () => notify(),
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to UPDATE events for a single document row.
 */
export function subscribeDocument(
  documentId: string,
  onUpdate: (update: DocumentRemoteUpdate) => void,
): Unsubscribe {
  const channel = supabase
    .channel(`doc:${documentId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'documents',
        filter: `id=eq.${documentId}`,
      },
      (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        const row = payload.new
        if (!row || typeof row !== 'object' || !('id' in row)) return

        onUpdate({
          id: String(row.id),
          title: typeof row.title === 'string' ? row.title : '',
          content: (row.content ?? null) as Json,
          updated_at:
            typeof row.updated_at === 'string' ? row.updated_at : '',
        })
      },
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
