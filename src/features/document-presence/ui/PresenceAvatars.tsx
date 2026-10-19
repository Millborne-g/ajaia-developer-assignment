import { cn } from '@/shared/lib/cn'
import { initialsFromEmail } from '@/shared/lib/presenceColor'
import type { PresencePeer } from '@/entities/document/model/documentPresence'

interface PresenceAvatarsProps {
  peers: PresencePeer[]
}

/**
 * Header cluster of other users currently on the document.
 * Hidden when nobody else is present.
 */
export function PresenceAvatars({ peers }: PresenceAvatarsProps) {
  if (peers.length === 0) return null

  const label =
    peers.length === 1 ? '1 other editing' : `${peers.length} others editing`

  return (
    <div
      className="flex items-center gap-2 min-w-0"
      aria-label={label}
    >
      <div className="flex items-center -space-x-2">
        {peers.map((peer) => (
          <span
            key={peer.userId}
            title={peer.email}
            className={cn(
              'inline-flex items-center justify-center w-7 h-7 rounded-full',
              'text-[0.65rem] font-semibold text-white border-2 border-surface',
              'shrink-0 shadow-sm',
            )}
            style={{ backgroundColor: peer.color }}
          >
            {initialsFromEmail(peer.email)}
          </span>
        ))}
      </div>
      <span className="text-[0.75rem] text-muted whitespace-nowrap hidden sm:inline">
        {label}
      </span>
    </div>
  )
}
