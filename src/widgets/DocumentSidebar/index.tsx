import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { DocumentCard } from '@/entities/document/ui/DocumentCard'
import { CreateDocumentButton } from '@/features/create-document/ui/CreateDocumentButton'
import { ImportButton } from '@/features/import-document/ui/ImportButton'
import { RenameDialog } from '@/features/rename-document/ui/RenameDialog'
import { ShareDialog } from '@/features/share-document/ui/ShareDialog'
import { DeleteDocumentDialog } from '@/features/delete-document/ui/DeleteDocumentDialog'
import { Spinner } from '@/shared/ui/Spinner'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import { DocsyncLogo } from '@/shared/ui/DocsyncLogo'
import { useSignOut } from '@/features/auth/model/useAuth'
import { useDocuments } from '@/widgets/AppShell/DocumentsContext'
import { cn } from '@/shared/lib/cn'

interface DocumentSidebarProps {
  session: Session
  collapsed?: boolean
  onCollapseToggle?: () => void
  onClose?: () => void
}

export function DocumentSidebar({
  session,
  collapsed = false,
  onCollapseToggle,
  onClose,
}: DocumentSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useSignOut()
  const {
    userId,
    ownedDocs,
    sharedDocs,
    loading,
    error,
    reload,
    deleteOwned,
    renameOwned,
  } = useDocuments()

  const [renameState, setRenameState] = useState<{
    open: boolean
    id: string
    title: string
  }>({ open: false, id: '', title: '' })

  const [shareDocId, setShareDocId] = useState<string | null>(null)

  const [deleteState, setDeleteState] = useState<{
    open: boolean
    id: string
    title: string
  }>({ open: false, id: '', title: '' })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    onClose?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  function openDeleteDialog(id: string, title: string) {
    setDeleteError(null)
    setDeleteState({ open: true, id, title })
  }

  function closeDeleteDialog() {
    if (deleteLoading) return
    setDeleteState((s) => ({ ...s, open: false }))
    setDeleteError(null)
  }

  async function confirmDelete() {
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await deleteOwned(deleteState.id)
      setDeleteState({ open: false, id: '', title: '' })
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete document',
      )
    } finally {
      setDeleteLoading(false)
    }
  }

  function navigateTo(path: string) {
    navigate(path)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className={cn(
          'flex items-center border-b border-border shrink-0',
          collapsed ? 'justify-center px-2 py-3.5' : 'justify-between px-4 py-3.5',
        )}
      >
        {!collapsed && <DocsyncLogo />}
        {onClose && !collapsed && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="md:hidden flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-subtle hover:text-foreground transition-colors duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {collapsed && <DocsyncLogo iconOnly />}
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-2 px-3 py-3 border-b border-border shrink-0">
          <CreateDocumentButton
            userId={userId}
            onCreated={() => void reload({ silent: true })}
            className="w-full justify-center rounded-full"
          />
          <ImportButton
            userId={userId}
            onImported={() => void reload({ silent: true })}
          />
        </div>
      )}

      <nav
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden py-3 flex flex-col gap-4',
          collapsed && 'sidebar-nav-collapsed',
        )}
      >
        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : error ? (
          <div className={cn('px-3', collapsed && 'hidden')}>
            <ErrorMessage message={error} />
          </div>
        ) : (
          <>
            <section>
              {!collapsed && (
                <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-muted px-3 pb-1.5">
                  Recent
                </h2>
              )}
              {!collapsed && ownedDocs.length === 0 ? (
                <p className="text-[0.8125rem] text-muted px-3">
                  No documents yet. Create one!
                </p>
              ) : (
                <ul
                  className={cn(
                    'list-none flex flex-col gap-1',
                    collapsed ? 'px-0 items-center' : 'px-2',
                  )}
                >
                  {ownedDocs.map((doc) => (
                    <li key={doc.id} className={collapsed ? 'w-full' : undefined}>
                      <DocumentCard
                        document={doc}
                        isOwned={true}
                        collapsed={collapsed}
                        onOpen={(id) => navigateTo(`/documents/${id}`)}
                        onRename={(id, title) =>
                          setRenameState({ open: true, id, title })
                        }
                        onDelete={(id) => openDeleteDialog(id, doc.title)}
                        onShare={(id) => setShareDocId(id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {sharedDocs.length > 0 && (
              <section>
                {!collapsed && (
                  <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-muted px-3 pb-1.5">
                    Shared with me
                  </h2>
                )}
                <ul
                  className={cn(
                    'list-none flex flex-col gap-1',
                    collapsed ? 'px-0 items-center' : 'px-2',
                  )}
                >
                  {sharedDocs.map((doc) => (
                    <li key={doc.id} className={collapsed ? 'w-full' : undefined}>
                      <DocumentCard
                        document={doc}
                        isOwned={false}
                        collapsed={collapsed}
                        onOpen={(id) => navigateTo(`/documents/${id}`)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </nav>

      <div
        className={cn(
          'hidden md:flex border-t border-border shrink-0',
          collapsed
            ? 'flex-col items-center gap-2 px-2 py-3'
            : 'items-center justify-between gap-2 px-3 py-2.5',
        )}
      >
        <ThemeToggle />
        {!collapsed && (
          <span
            className="text-[0.75rem] text-muted truncate flex-1 min-w-0"
            title={session.user.email ?? ''}
          >
            {session.user.email}
          </span>
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-[0.75rem] bg-transparent border border-border rounded-md px-2 py-1 cursor-pointer text-muted hover:bg-subtle hover:text-foreground transition-colors duration-150 whitespace-nowrap shrink-0"
            title="Sign out"
          >
            Sign out
          </button>
        )}
        {collapsed && (
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex items-center justify-center w-8 h-8 rounded-md text-muted hover:bg-subtle hover:text-foreground transition-colors duration-150"
            title="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={onCollapseToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted hover:bg-subtle hover:text-foreground transition-colors duration-150 shrink-0"
        >
          {collapsed ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      <RenameDialog
        open={renameState.open}
        documentId={renameState.id}
        currentTitle={renameState.title}
        onClose={() => setRenameState((s) => ({ ...s, open: false }))}
        onRenamed={(newTitle) => {
          renameOwned(renameState.id, newTitle)
        }}
      />

      {shareDocId && (
        <ShareDialog
          open={shareDocId !== null}
          documentId={shareDocId}
          ownerEmail={session.user.email ?? undefined}
          onClose={() => setShareDocId(null)}
        />
      )}

      <DeleteDocumentDialog
        open={deleteState.open}
        documentTitle={deleteState.title}
        loading={deleteLoading}
        error={deleteError}
        onClose={closeDeleteDialog}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
