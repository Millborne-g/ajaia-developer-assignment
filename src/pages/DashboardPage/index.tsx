import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { AppShell } from '@/widgets/AppShell'
import { useDocuments } from '@/widgets/AppShell/DocumentsContext'
import { useCreateDocument } from '@/features/create-document/model/useCreateDocument'
import { Spinner } from '@/shared/ui/Spinner'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { cn } from '@/shared/lib/cn'
import type { Document } from '@/entities/document/model/types'

interface DashboardPageProps {
  session: Session
}

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function relativeEdited(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Edited just now'
  if (mins < 60) return `Edited ${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Edited ${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Edited yesterday'
  if (days < 7) return `Edited ${days}d ago`
  return `Edited ${new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}

function displayName(email: string | undefined): string {
  if (!email) return 'there'
  const local = email.split('@')[0] ?? email
  const part = local.split(/[._+-]+/)[0] ?? local
  return part.charAt(0).toUpperCase() + part.slice(1)
}

function DashboardMain({ session }: { session: Session }) {
  const navigate = useNavigate()
  const { ownedDocs, sharedDocs, loading, error, reload } = useDocuments()
  const { create, loading: creating } = useCreateDocument()
  const [query, setQuery] = useState('')

  const greeting = greetingForHour(new Date().getHours())
  const name = displayName(session.user.email)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const all: Array<Document & { isOwned: boolean }> = [
      ...ownedDocs.map((d) => ({ ...d, isOwned: true })),
      ...sharedDocs.map((d) => ({ ...d, isOwned: false })),
    ]
    if (!q) return all
    return all.filter((d) => d.title.toLowerCase().includes(q))
  }, [ownedDocs, sharedDocs, query])

  async function handleCreate() {
    const id = await create(session.user.id)
    if (id) {
      void reload({ silent: true })
      navigate(`/documents/${id}`)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-7 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            {greeting}
          </h1>
          <p className="text-muted text-sm mt-1">{name}</p>
        </div>
        <label className="relative w-full sm:w-64 shrink-0">
          <span className="sr-only">Search documents</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents…"
            className={cn(
              'w-full h-10 rounded-full border border-border bg-subtle px-4 text-sm',
              'text-foreground placeholder:text-muted outline-none',
              'focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-alpha)]',
            )}
          />
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={creating}
            className={cn(
              'min-h-[180px] rounded-2xl border border-dashed border-border',
              'bg-transparent text-muted hover:border-primary hover:text-foreground',
              'flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-sm font-medium">
              {creating ? 'Creating…' : 'New document'}
            </span>
          </button>

          {filtered.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => navigate(`/documents/${doc.id}`)}
              className={cn(
                'min-h-[180px] rounded-2xl border border-border bg-background',
                'p-5 text-left cursor-pointer transition-[border-color,box-shadow]',
                'hover:border-primary hover:shadow-card flex flex-col gap-4',
              )}
            >
              <div className="flex-1 space-y-2 opacity-50" aria-hidden="true">
                <div className="h-2 w-4/5 rounded bg-border" />
                <div className="h-2 w-full rounded bg-border" />
                <div className="h-2 w-3/5 rounded bg-border" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground truncate">
                  {doc.title}
                </p>
                <p className="text-xs text-muted mt-1">
                  {relativeEdited(doc.updated_at)}
                  {!doc.isOwned ? ' · Shared' : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  )
}

export function DashboardPage({ session }: DashboardPageProps) {
  return (
    <AppShell session={session}>
      <DashboardMain session={session} />
    </AppShell>
  )
}
