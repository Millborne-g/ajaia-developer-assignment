import type { ReactNode } from 'react'
import type { Editor } from '@tiptap/react'
import { Toolbar } from '@/features/edit-document/ui/Toolbar'

interface EditorLayoutProps {
  editor: Editor | null
  readOnly?: boolean
  children: ReactNode
}

/**
 * Toolbar + scrollable editor region. Page chrome (title / share) lives in EditorPage.
 * When readOnly is true the Toolbar is hidden and a "View only" label shows in its place.
 */
export function EditorLayout({ editor, readOnly = false, children }: EditorLayoutProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
      {readOnly ? (
        <div className="flex items-center px-4 h-[var(--height-toolbar)] bg-surface border-b border-border shrink-0">
          <span className="text-xs text-muted">View only</span>
        </div>
      ) : (
        <Toolbar editor={editor} />
      )}
      <main className="flex-1 overflow-hidden flex flex-col min-h-0">
        {children}
      </main>
      {!readOnly && (
        <p className="text-center text-xs text-muted py-3 shrink-0">
          Changes save automatically.
        </p>
      )}
    </div>
  )
}
