import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-surface rounded-xl shadow-dialog w-full max-w-[440px] overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 id="dialog-title" className="text-base font-semibold text-foreground m-0">
            {title}
          </h2>
          <button
            className="bg-transparent border-none cursor-pointer text-muted w-7 h-7 rounded flex items-center justify-center hover:bg-subtle hover:text-foreground transition-colors duration-150 text-base"
            onClick={onClose}
            aria-label="Close dialog"
            type="button"
          >
            ✕
          </button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
