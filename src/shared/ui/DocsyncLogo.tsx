import { cn } from '@/shared/lib/cn'

interface DocsyncLogoProps {
  /** Hide the wordmark (icon only) */
  iconOnly?: boolean
  className?: string
}

export function DocsyncLogo({ iconOnly = false, className }: DocsyncLogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5 min-w-0', className)}>
      <span
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-on-primary shrink-0"
        aria-hidden="true"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 2.5h5.5L13 6v7.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M9 2.5V6h3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M5.5 9h5M5.5 11.5h3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!iconOnly && (
        <span className="text-[0.9375rem] font-semibold text-foreground truncate">
          Docsync
        </span>
      )}
    </div>
  )
}
