import { useState, type FormEvent, useEffect, useRef } from 'react'
import { Dialog } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { Spinner } from '@/shared/ui/Spinner'
import { initialsFromEmail } from '@/shared/lib/presenceColor'
import {
  useShareDocument,
  useDocumentShares,
} from '../model/useShareDocument'

interface ShareDialogProps {
  open: boolean
  documentId: string
  ownerEmail?: string
  onClose: () => void
}

export function ShareDialog({
  open,
  documentId,
  ownerEmail,
  onClose,
}: ShareDialogProps) {
  const [email, setEmail] = useState('')
  const [invitePermission, setInvitePermission] = useState<'view' | 'edit'>('edit')
  const { share, loading, error, success } = useShareDocument()
  const {
    shares,
    loading: sharesLoading,
    error: sharesError,
    load,
    revoke,
    changePermission,
  } = useDocumentShares(documentId)

  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      void load()
      setEmail('')
      setInvitePermission('edit')
    }
    wasOpenRef.current = open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ok = await share(documentId, email, invitePermission)
    if (ok) {
      setEmail('')
      void load()
    }
  }

  const permLabel = (p: 'view' | 'edit') => (p === 'edit' ? 'Can edit' : 'Can view')

  return (
    <Dialog open={open} onClose={onClose} title="Share document">
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.8125rem] font-medium text-muted">
              Add people
            </span>
            <div className="flex gap-2 items-stretch">
              <div className="flex-1 min-w-0">
                <Input
                  id="share-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                />
              </div>
              <select
                value={invitePermission}
                onChange={(e) =>
                  setInvitePermission(e.target.value as 'view' | 'edit')
                }
                className="shrink-0 self-end mb-[1px] h-[38px] px-2 rounded-md border border-border bg-subtle text-xs text-muted cursor-pointer hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors duration-150"
                aria-label="Permission level"
              >
                <option value="edit">Can edit</option>
                <option value="view">Can view</option>
              </select>
            </div>
          </div>
          {error && <ErrorMessage message={error} />}
          {success && (
            <p className="text-sm text-success">{success}</p>
          )}
          <Button type="submit" loading={loading} className="w-full justify-center">
            Share
          </Button>
        </form>

        <div className="flex flex-col gap-2.5">
          <h3 className="text-[0.8125rem] font-semibold text-muted">
            People with access
          </h3>

          {ownerEmail && (
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-subtle text-sm">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary text-[0.7rem] font-semibold shrink-0">
                {initialsFromEmail(ownerEmail)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-foreground truncate">{ownerEmail}</p>
                <p className="text-xs text-muted">Owner</p>
              </div>
            </div>
          )}

          {sharesLoading ? (
            <div className="flex justify-center p-3">
              <Spinner />
            </div>
          ) : sharesError ? (
            <ErrorMessage message={sharesError} />
          ) : shares.length === 0 ? (
            <p className="text-sm text-muted">No one else has access yet.</p>
          ) : (
            <ul className="list-none flex flex-col gap-1.5">
              {shares.map((shareItem) => (
                <li
                  key={shareItem.id}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-subtle text-sm"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/25 text-foreground text-[0.7rem] font-semibold shrink-0">
                    {initialsFromEmail(shareItem.email ?? '?')}
                  </span>
                  <span
                    className="flex-1 text-foreground truncate"
                    title={shareItem.email ?? undefined}
                  >
                    {shareItem.email ?? 'Unknown user'}
                  </span>
                  <select
                    value={shareItem.permission}
                    onChange={(e) =>
                      void changePermission(
                        shareItem.id,
                        shareItem.user_id,
                        e.target.value as 'view' | 'edit',
                      )
                    }
                    className="shrink-0 h-[28px] px-2 rounded-md border border-border bg-background text-xs text-muted cursor-pointer hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors duration-150"
                    aria-label={`Permission for ${shareItem.email ?? 'user'}`}
                    title={permLabel(shareItem.permission)}
                  >
                    <option value="edit">Can edit</option>
                    <option value="view">Can view</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void revoke(shareItem.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Dialog>
  )
}
