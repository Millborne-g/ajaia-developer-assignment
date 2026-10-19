import { useEffect, useRef } from 'react'
import { subscribeDocumentList } from '@/entities/document/model/documentRealtime'

/**
 * Keep the document list in sync via Supabase Realtime Postgres Changes.
 */
export function useDocumentListRealtime(
  userId: string,
  onRefresh: () => void,
) {
  const onRefreshRef = useRef(onRefresh)

  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    if (!userId) return

    return subscribeDocumentList(userId, () => {
      onRefreshRef.current()
    })
  }, [userId])
}
