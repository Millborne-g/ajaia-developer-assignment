import { useEffect, useState } from 'react'
import {
  joinDocumentPresence,
  type PresencePeer,
} from '@/entities/document/model/documentPresence'

interface UseDocumentPresenceArgs {
  documentId: string | undefined
  userId: string
  email: string
}

/** Presence for header avatars only (no remote carets). */
export function useDocumentPresence({
  documentId,
  userId,
  email,
}: UseDocumentPresenceArgs): { peers: PresencePeer[] } {
  const [peers, setPeers] = useState<PresencePeer[]>([])

  useEffect(() => {
    if (!documentId || !userId) {
      return
    }

    const handle = joinDocumentPresence({
      documentId,
      userId,
      email,
      onPeersChange: setPeers,
    })

    return () => {
      handle.leave()
    }
  }, [documentId, userId, email])

  return { peers }
}

export type { PresencePeer }
