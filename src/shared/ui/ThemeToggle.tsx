import { useTheme } from '@/app/theme'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-foreground transition-colors duration-150 text-base shrink-0"
    >
      {isDark ? '☀' : '🌙'}
    </button>
  )
}
