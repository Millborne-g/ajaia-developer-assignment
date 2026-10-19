import type { Editor } from '@tiptap/react'
import { cn } from '@/shared/lib/cn'

interface ToolbarProps {
  editor: Editor | null
}

interface ToolButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

function ToolButton({ onClick, active, disabled, title, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex items-center justify-center min-w-[32px] h-8 px-1.5',
        'border-none text-sm font-sans rounded-[5px] cursor-pointer shrink-0',
        'transition-colors duration-[120ms]',
        active
          ? 'bg-primary/15 text-primary'
          : 'bg-transparent text-muted hover:bg-subtle hover:text-foreground',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  return (
    <div
      className="flex items-center gap-0.5 px-3 py-1.5 bg-surface border-b border-border h-[var(--height-toolbar)] overflow-x-auto shrink-0"
      role="toolbar"
      aria-label="Formatting toolbar"
    >
      {/* Text formatting */}
      <ToolButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <u>U</u>
      </ToolButton>

      <div className="w-px h-5 bg-border mx-1 shrink-0" aria-hidden="true" />

      {/* Headings */}
      <ToolButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        H1
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        H2
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        H3
      </ToolButton>

      <div className="w-px h-5 bg-border mx-1 shrink-0" aria-hidden="true" />

      {/* Lists */}
      <ToolButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet list"
      >
        <ListBulletIcon />
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered list"
      >
        <ListNumberedIcon />
      </ToolButton>
    </div>
  )
}

function ListBulletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="2.5" cy="4.5" r="1.5" />
      <rect x="5.5" y="3.75" width="9" height="1.5" rx="0.75" />
      <circle cx="2.5" cy="8" r="1.5" />
      <rect x="5.5" y="7.25" width="9" height="1.5" rx="0.75" />
      <circle cx="2.5" cy="11.5" r="1.5" />
      <rect x="5.5" y="10.75" width="9" height="1.5" rx="0.75" />
    </svg>
  )
}

function ListNumberedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <text x="1" y="5.5" fontSize="5" fontFamily="monospace">1.</text>
      <rect x="5.5" y="3.75" width="9" height="1.5" rx="0.75" />
      <text x="1" y="9" fontSize="5" fontFamily="monospace">2.</text>
      <rect x="5.5" y="7.25" width="9" height="1.5" rx="0.75" />
      <text x="1" y="12.5" fontSize="5" fontFamily="monospace">3.</text>
      <rect x="5.5" y="10.75" width="9" height="1.5" rx="0.75" />
    </svg>
  )
}
