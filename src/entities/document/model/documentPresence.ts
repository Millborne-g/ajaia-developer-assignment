import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/shared/api/supabase'
import { colorFromUserId } from '@/shared/lib/presenceColor'

/** Who else is on the document (avatars only — no caret positions). */
export interface PresencePeer {
  userId: string
  email: string
  color: string
  updatedAt: number
}

type PresenceState = PresencePeer

interface JoinDocumentPresenceArgs {
  documentId: string
  userId: string
  email: string
  onPeersChange: (peers: PresencePeer[]) => void
}

export interface DocumentPresenceHandle {
  leave: () => void
}

function parsePresenceState(
  state: Record<string, unknown[]>,
  selfUserId: string,
): PresencePeer[] {
  const peers: PresencePeer[] = []

  for (const metas of Object.values(state)) {
    const meta = metas?.[metas.length - 1] as PresenceState | undefined
    if (!meta?.userId || meta.userId === selfUserId) continue

    peers.push({
      userId: meta.userId,
      email: typeof meta.email === 'string' ? meta.email : 'Unknown',
      color:
        typeof meta.color === 'string'
          ? meta.color
          : colorFromUserId(meta.userId),
      updatedAt: typeof meta.updatedAt === 'number' ? meta.updatedAt : 0,
    })
  }

  return peers
}

/**
 * Join a document presence channel for header avatars (no caret tracking).
 */
export function joinDocumentPresence({
  documentId,
  userId,
  email,
  onPeersChange,
}: JoinDocumentPresenceArgs): DocumentPresenceHandle {
  const color = colorFromUserId(userId)
  let channel: RealtimeChannel | null = null

  function emitPeers() {
    if (!channel) return
    const state = channel.presenceState() as Record<string, unknown[]>
    onPeersChange(parsePresenceState(state, userId))
  }

  channel = supabase.channel(`presence:doc:${documentId}`, {
    config: { presence: { key: userId } },
  })

  channel
    .on('presence', { event: 'sync' }, () => emitPeers())
    .on('presence', { event: 'join' }, () => emitPeers())
    .on('presence', { event: 'leave' }, () => emitPeers())
    .subscribe(async (status) => {
      if (status !== 'SUBSCRIBED' || !channel) return
      await channel.track({
        userId,
        email,
        color,
        updatedAt: Date.now(),
      } satisfies PresenceState)
    })

  return {
    leave() {
      if (!channel) return
      const ch = channel
      channel = null
      void ch.untrack()
      void supabase.removeChannel(ch)
      onPeersChange([])
    },
  }
}
