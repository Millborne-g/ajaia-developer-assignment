import type { InputHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label className="text-[0.8125rem] font-medium text-muted" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className={cn(
          'font-sans text-sm px-3 py-2 w-full outline-none',
          'border rounded-md transition-colors duration-150',
          'bg-background text-foreground',
          'border-border focus:border-primary',
          'focus:ring-2 focus:ring-[var(--color-primary-alpha)]',
          error ? 'border-danger focus:ring-[rgba(199,70,70,0.15)]' : '',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : null}
    </div>
  )
}
