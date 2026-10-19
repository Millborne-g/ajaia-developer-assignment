/** High-contrast palette that remains readable in light and dark themes. */
const PRESENCE_COLORS = [
  '#0F766E', // teal
  '#B45309', // amber
  '#1D4ED8', // blue
  '#BE123C', // rose
  '#7C3AED', // violet
  '#047857', // green
  '#C2410C', // orange
  '#0E7490', // cyan
] as const

/** Stable color for a user id (same id → same color). */
export function colorFromUserId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return PRESENCE_COLORS[hash % PRESENCE_COLORS.length]
}

/** Initials from an email local-part (e.g. "jane.doe@x.com" → "JD"). */
export function initialsFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim() ?? ''
  if (!local) return '?'

  const parts = local.split(/[._+-]+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return local.slice(0, 2).toUpperCase()
}
