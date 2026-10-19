import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-hover disabled:hover:bg-primary',
  secondary:
    'bg-subtle text-foreground border border-border hover:bg-background',
  ghost:
    'bg-transparent text-muted hover:bg-subtle hover:text-foreground',
  danger:
    'bg-danger text-white hover:opacity-85',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-[0.8125rem] px-3 h-[30px]',
  md: 'text-sm px-4 h-9',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-md cursor-pointer',
        'transition-colors duration-150 whitespace-nowrap',
        'disabled:opacity-55 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          className="inline-block w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  )
}
