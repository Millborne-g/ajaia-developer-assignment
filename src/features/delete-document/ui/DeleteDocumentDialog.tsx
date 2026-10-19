import { Dialog } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'

interface DeleteDocumentDialogProps {
  open: boolean
  documentTitle: string
  loading?: boolean
  error?: string | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteDocumentDialog({
  open,
  documentTitle,
  loading = false,
  error = null,
  onClose,
  onConfirm,
}: DeleteDocumentDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Delete document">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-foreground m-0 leading-relaxed">
          Delete <strong className="font-semibold">{documentTitle}</strong>? This
          cannot be undone.
        </p>
        {error && <ErrorMessage message={error} />}
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            type="button"
            loading={loading}
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
