/**
 * Zero-dependency utility for conditionally joining Tailwind class strings.
 * Filters out falsy values so conditional classes work cleanly.
 *
 * @example
 * cn('flex items-center', isActive && 'bg-primary', undefined)
 * // → 'flex items-center bg-primary'
 */
export function cn(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(' ')
}
