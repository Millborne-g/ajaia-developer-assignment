import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useBlocker } from 'react-router-dom'
import { useEditor } from '@tiptap/react'
import type { Session } from '@supabase/supabase-js'
import {
  fetchDocument,
  fetchMyDocumentAccess,
} from '@/entities/document/model/documentApi'
import type { Document } from '@/entities/document/model/types'
import { TiptapEditor } from '@/features/edit-document/ui/TiptapEditor'
import {
  useEditDocument,
  type SaveStatus,
} from '@/features/edit-document/model/useEditDocument'
import { useDocumentRealtime } from '@/features/realtime-documents/model/useDocumentRealtime'
import { useDocumentPresence } from '@/features/document-presence/model/useDocumentPresence'
import { PresenceAvatars } from '@/features/document-presence/ui/PresenceAvatars'
import { RenameDialog } from '@/features/rename-document/ui/RenameDialog'
import { tiptapExtensions } from '@/shared/lib/tiptapExtensions'
import { normalizeTiptapContent } from '@/shared/lib/emptyTiptapDoc'
import { DEFAULT_DOCUMENT_TITLE } from '@/shared/lib/documentTitle'
import { EditorLayout } from '@/widgets/EditorLayout'
import { Spinner } from '@/shared/ui/Spinner'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { ShareDialog } from '@/features/share-document/ui/ShareDialog'
import { ExportMenu } from '@/features/export-document/ui/ExportMenu'
import { Button } from '@/shared/ui/Button'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import { cn } from '@/shared/lib/cn'
import type { Json } from '@/shared/types'

interface EditorPageProps {
  session: Session
}

function SaveIndicator({
  status,
  error,
}: {
  status: SaveStatus
  error: string | null
}) {
  if (status === 'saving') {
    return (
      <span className="text-[0.8125rem] text-muted shrink-0 whitespace-nowrap">
        Saving…
      </span>
    )
  }
  if (status === 'saved') {
    return (
      <span className="text-[0.8125rem] text-muted shrink-0 whitespace-nowrap">
        Saved
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className={cn('text-[0.8125rem] text-danger shrink-0 whitespace-nowrap')}>
        {error ?? 'Save failed'}
      </span>
    )
  }
  return null
}

export function EditorPage({ session }: EditorPageProps) {
  const { id } = useParams<{ id: string }>()

  const [document, setDocument] = useState<Document | null>(null)
  const [docTitle, setDocTitle] = useState(DEFAULT_DOCUMENT_TITLE)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)

  // 'owner' | 'edit' → canEdit; 'view' → read-only
  const [access, setAccess] = useState<'owner' | 'edit' | 'view'>('edit')
  const canEdit = access === 'owner' || access === 'edit'

  // Block autosave until fetched content is applied — empty TipTap must not
  // overwrite imported / loaded body via debounced save.
  const contentReadyRef = useRef(false)
  const canEditRef = useRef(canEdit)
  const onContentChangeRef = useRef<
    ((content: Json) => void) | null
  >(null)

  const { onContentChange, saveStatus, saveError, hasPendingChanges } =
    useEditDocument(id ?? '', {
      currentTitle: docTitle,
      onTitleAutoUpdated: (newTitle) => {
        setDocTitle(newTitle)
        setDocument((prev) => (prev ? { ...prev, title: newTitle } : prev))
      },
    })

  useEffect(() => {
    canEditRef.current = canEdit
  }, [canEdit])

  useEffect(() => {
    onContentChangeRef.current = onContentChange
  }, [onContentChange])

  useEffect(() => {
    contentReadyRef.current = false
  }, [id])

  const editor = useEditor({
    extensions: tiptapExtensions,
    immediatelyRender: false,
    content: undefined,
    editable: true, // will be set after access resolves
    onUpdate: ({ editor: ed }) => {
      if (canEditRef.current && contentReadyRef.current) {
        onContentChangeRef.current?.(ed.getJSON() as unknown as Json)
      }
    },
    editorProps: {
      attributes: {
        class: 'editor-canvas',
        'aria-label': 'Document editor',
      },
    },
  })

  // Keep editor editability in sync with access
  useEffect(() => {
    if (!editor) return
    editor.setEditable(canEdit)
  }, [editor, canEdit])

  const { peers } = useDocumentPresence({
    documentId: id,
    userId: session.user.id,
    email: session.user.email ?? 'anon',
  })

  useEffect(() => {
    if (!id) return
    contentReadyRef.current = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setFetchError(null)

    Promise.all([
      fetchDocument(id),
      fetchMyDocumentAccess(id, session.user.id),
    ])
      .then(([doc, userAccess]) => {
        const normalized = {
          ...doc,
          content: normalizeTiptapContent(doc.content) as Document['content'],
        }
        setDocument(normalized)
        setDocTitle(normalized.title)
        setAccess(userAccess)
      })
      .catch((err) =>
        setFetchError(err instanceof Error ? err.message : 'Not found'),
      )
      .finally(() => setLoading(false))
  }, [id, session.user.id])

  useEffect(() => {
    if (!editor || !document?.content) return
    editor.commands.setContent(normalizeTiptapContent(document.content), {
      emitUpdate: false,
    })
    contentReadyRef.current = true
  }, [editor, document?.id, document?.content])

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasPendingChanges.current) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasPendingChanges])

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname &&
      hasPendingChanges.current,
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    const leave = window.confirm(
      'You have unsaved changes. Leave anyway?',
    )
    if (leave) {
      blocker.proceed()
    } else {
      blocker.reset()
    }
  }, [blocker])

  useDocumentRealtime(id, (update) => {
    if (!renameOpen && update.title && update.title !== docTitle) {
      setDocTitle(update.title)
      setDocument((prev) => (prev ? { ...prev, title: update.title } : prev))
    }

    if (hasPendingChanges.current) return

    const normalized = normalizeTiptapContent(update.content)
    setDocument((prev) =>
      prev
        ? {
            ...prev,
            content: normalized as Document['content'],
            title: renameOpen ? prev.title : update.title || prev.title,
            updated_at: update.updated_at || prev.updated_at,
          }
        : prev,
    )

    if (editor) {
      editor.commands.setContent(normalized, { emitUpdate: false })
    }
  })

  const isOwner = access === 'owner'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-screen bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  if (fetchError || !document) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-screen p-6 bg-background">
        <ErrorMessage message={fetchError ?? 'Document not found'} />
        <Link to="/" className="text-sm text-muted">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="flex items-center gap-3 px-4 sm:px-5 h-[var(--height-header)] border-b border-border bg-surface shrink-0">
        <Link
          to="/"
          className="text-sm text-muted no-underline px-2 py-1.5 rounded-md hover:bg-subtle hover:text-foreground transition-colors duration-150 whitespace-nowrap"
        >
          ← Dashboard
        </Link>
        <span className="w-px h-5 bg-border shrink-0" aria-hidden="true" />
        {canEdit ? (
          <button
            type="button"
            onClick={() => setRenameOpen(true)}
            aria-label="Rename document"
            title="Rename document"
            className="font-display text-[1.05rem] font-semibold text-foreground truncate text-left bg-transparent border-none cursor-pointer rounded-md px-1.5 py-0.5 hover:bg-subtle transition-colors duration-150 min-w-0 max-w-[40vw]"
          >
            {docTitle}
          </button>
        ) : (
          <span className="font-display text-[1.05rem] font-semibold text-foreground truncate px-1.5 py-0.5 min-w-0 max-w-[40vw]">
            {docTitle}
          </span>
        )}

        <div className="flex-1" />

        <PresenceAvatars peers={peers} />
        {canEdit && <SaveIndicator status={saveStatus} error={saveError} />}
        <ExportMenu
          title={docTitle}
          getContent={() =>
            (editor?.getJSON() ?? document.content) as unknown as Json
          }
        />
        <ThemeToggle />
        {isOwner && (
          <Button
            size="sm"
            className="rounded-lg"
            onClick={() => setShareOpen(true)}
          >
            Share
          </Button>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <EditorLayout editor={editor} readOnly={!canEdit}>
          <TiptapEditor editor={editor} />
        </EditorLayout>
      </div>

      {canEdit && (
        <RenameDialog
          open={renameOpen}
          documentId={document.id}
          currentTitle={docTitle}
          onClose={() => setRenameOpen(false)}
          onRenamed={(newTitle) => {
            setDocTitle(newTitle)
            setDocument((prev) => (prev ? { ...prev, title: newTitle } : prev))
          }}
        />
      )}

      {isOwner && (
        <ShareDialog
          open={shareOpen}
          documentId={document.id}
          ownerEmail={session.user.email ?? undefined}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  )
}
