import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import { DocsyncLogo } from '@/shared/ui/DocsyncLogo'

interface MobileTopBarProps {
  onMenuClick: () => void
}

/**
 * Mobile-only top bar (hidden on md+).
 */
export function MobileTopBar({ onMenuClick }: MobileTopBarProps) {
  return (
    <header className="flex items-center gap-3 px-4 h-[var(--height-header)] border-b border-border shrink-0 md:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="flex items-center justify-center w-8 h-8 rounded-md text-muted hover:bg-subtle hover:text-foreground transition-colors duration-150"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
        >
          <rect x="2" y="4" width="14" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="2" y="8.25" width="14" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="2" y="12.5" width="14" height="1.5" rx="0.75" fill="currentColor" />
        </svg>
      </button>

      <div className="flex-1 min-w-0">
        <DocsyncLogo />
      </div>

      <ThemeToggle />
    </header>
  )
}
