import { useState, type FormEvent } from 'react'
import { Dialog } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { useRenameDocument } from '../model/useRenameDocument'

interface RenameDialogProps {
  open: boolean
  documentId: string
  currentTitle: string
  onClose: () => void
  onRenamed: (newTitle: string) => void
}

export function RenameDialog({
  open,
  documentId,
  currentTitle,
  onClose,
  onRenamed,
}: RenameDialogProps) {
  const [title, setTitle] = useState(currentTitle)
  const { rename, loading, error } = useRenameDocument()

  const handleOpen = () => setTitle(currentTitle)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ok = await rename(documentId, title)
    if (ok) {
      onRenamed(title.trim())
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Rename document">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="doc-title"
          label="Document title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          onFocus={() => handleOpen()}
          placeholder="Untitled Document"
          maxLength={200}
        />
        {error && <ErrorMessage message={error} />}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Rename
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
