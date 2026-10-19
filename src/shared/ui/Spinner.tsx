import { cn } from '@/shared/lib/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-9 h-9 border-[3px]',
}

export function Spinner({ size = 'md', label = 'Loading…' }: SpinnerProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full border-2 border-border border-t-primary animate-spin',
        sizeClasses[size],
      )}
      role="status"
      aria-label={label}
    />
  )
}
