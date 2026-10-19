import { useEffect, useRef } from 'react'
import {
  subscribeDocument,
  type DocumentRemoteUpdate,
} from '@/entities/document/model/documentRealtime'

/**
 * Subscribe to remote updates for an open document.
 * Caller decides whether to apply content (e.g. skip when dirty).
 */
export function useDocumentRealtime(
  documentId: string | undefined,
  onRemoteUpdate: (update: DocumentRemoteUpdate) => void,
) {
  const onRemoteUpdateRef = useRef(onRemoteUpdate)

  useEffect(() => {
    onRemoteUpdateRef.current = onRemoteUpdate
  }, [onRemoteUpdate])

  useEffect(() => {
    if (!documentId) return

    return subscribeDocument(documentId, (update) => {
      onRemoteUpdateRef.current(update)
    })
  }, [documentId])
}
