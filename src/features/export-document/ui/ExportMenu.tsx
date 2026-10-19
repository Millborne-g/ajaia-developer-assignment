import { useEffect, useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { downloadBlob, sanitizeFilename } from '@/shared/lib/downloadBlob'
import { tiptapToMarkdown } from '@/shared/lib/tiptapToMarkdown'
import { printHtmlAsPdf } from '@/shared/lib/printHtmlAsPdf'
import { cn } from '@/shared/lib/cn'
import type { Json } from '@/shared/types'

interface ExportMenuProps {
  title: string
  getContent: () => Json
}

export function ExportMenu({ title, getContent }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  function exportMarkdown() {
    setError(null)
    try {
      const md = tiptapToMarkdown(getContent())
      const name = `${sanitizeFilename(title)}.md`
      downloadBlob(name, new Blob([md], { type: 'text/markdown;charset=utf-8' }))
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Markdown export failed')
    }
  }

  function exportPdf() {
    setError(null)
    try {
      printHtmlAsPdf(title, getContent())
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF export failed')
    }
  }

  return (
    <div className="relative shrink-0">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="rounded-lg"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setError(null)
          setOpen((v) => !v)
        }}
      >
        Export
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[99]"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <ul
            role="menu"
            className={cn(
              'absolute right-0 top-[calc(100%+4px)] z-[100]',
              'bg-surface border border-border rounded-lg shadow-menu',
              'list-none min-w-[160px] overflow-hidden p-1',
            )}
          >
            <li>
              <button
                role="menuitem"
                type="button"
                className="block w-full text-left px-3 py-2 text-sm bg-transparent border-none cursor-pointer text-foreground rounded hover:bg-subtle transition-colors duration-100"
                onClick={exportMarkdown}
              >
                Markdown (.md)
              </button>
            </li>
            <li>
              <button
                role="menuitem"
                type="button"
                className="block w-full text-left px-3 py-2 text-sm bg-transparent border-none cursor-pointer text-foreground rounded hover:bg-subtle transition-colors duration-100"
                onClick={exportPdf}
              >
                PDF (print)
              </button>
            </li>
          </ul>
        </>
      )}

      {error && (
        <p
          role="alert"
          className="absolute right-0 top-[calc(100%+8px)] z-[100] text-[0.75rem] text-danger whitespace-nowrap bg-surface border border-border rounded-md px-2 py-1 shadow-menu"
        >
          {error}
        </p>
      )}
    </div>
  )
}
