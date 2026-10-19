import { useState } from 'react'
import type { Document } from '../model/types'
import { cn } from '@/shared/lib/cn'

interface DocumentCardProps {
  document: Document
  isOwned: boolean
  collapsed?: boolean
  onOpen: (id: string) => void
  onRename?: (id: string, currentTitle: string) => void
  onDelete?: (id: string) => void
  onShare?: (id: string) => void
}

export function DocumentCard({
  document,
  isOwned,
  collapsed = false,
  onOpen,
  onRename,
  onDelete,
  onShare,
}: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const formattedDate = new Date(document.updated_at).toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric', year: 'numeric' },
  )

  if (collapsed) {
    return (
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onOpen(document.id)}
          title={document.title}
          aria-label={`Open ${document.title}`}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg',
            'bg-transparent border-none cursor-pointer text-[1.25rem]',
            'text-muted hover:bg-subtle hover:text-foreground',
            'transition-colors duration-150',
          )}
        >
          <span aria-hidden="true">📄</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center rounded-lg border border-border bg-surface overflow-visible relative transition-[border-color,box-shadow] duration-150 hover:border-primary hover:shadow-[0_2px_8px_var(--color-primary-alpha)]">
      <button
        className="flex-1 flex items-center gap-3 px-4 py-3.5 bg-transparent border-none cursor-pointer text-left min-w-0"
        onClick={() => onOpen(document.id)}
        type="button"
        aria-label={`Open ${document.title}`}
      >
        <span className="text-[1.4rem] shrink-0" aria-hidden="true">
          📄
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-foreground truncate">
            {document.title}
          </span>
          <span className="text-xs text-muted mt-0.5">
            Edited {formattedDate}
          </span>
        </div>
      </button>

      {isOwned && (
        <div className="relative shrink-0 pr-2">
          <button
            className="bg-transparent border-none cursor-pointer text-muted text-[1.2rem] w-[30px] h-[30px] flex items-center justify-center rounded tracking-widest hover:bg-subtle hover:text-foreground transition-colors duration-150"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((v) => !v)
            }}
            aria-label="Document options"
            type="button"
          >
            ⋯
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-[99]"
                onClick={() => setMenuOpen(false)}
              />
              <ul
                className="absolute right-0 top-[calc(100%+4px)] bg-surface border border-border rounded-lg shadow-menu list-none min-w-[140px] z-[100] overflow-hidden p-1"
                role="menu"
              >
                {onRename && (
                  <li>
                    <button
                      role="menuitem"
                      type="button"
                      className="block w-full text-left px-3 py-2 text-sm bg-transparent border-none cursor-pointer text-foreground rounded hover:bg-subtle transition-colors duration-100"
                      onClick={() => {
                        setMenuOpen(false)
                        onRename(document.id, document.title)
                      }}
                    >
                      Rename
                    </button>
                  </li>
                )}
                {onShare && (
                  <li>
                    <button
                      role="menuitem"
                      type="button"
                      className="block w-full text-left px-3 py-2 text-sm bg-transparent border-none cursor-pointer text-foreground rounded hover:bg-subtle transition-colors duration-100"
                      onClick={() => {
                        setMenuOpen(false)
                        onShare(document.id)
                      }}
                    >
                      Share
                    </button>
                  </li>
                )}
                {onDelete && (
                  <li>
                    <button
                      role="menuitem"
                      type="button"
                      className="block w-full text-left px-3 py-2 text-sm bg-transparent border-none cursor-pointer text-danger rounded hover:bg-danger/10 transition-colors duration-100"
                      onClick={() => {
                        setMenuOpen(false)
                        onDelete(document.id)
                      }}
                    >
                      Delete
                    </button>
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
