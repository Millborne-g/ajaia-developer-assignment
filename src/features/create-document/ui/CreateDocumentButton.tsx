import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'
import { useCreateDocument } from '../model/useCreateDocument'

interface CreateDocumentButtonProps {
  userId: string
  onCreated?: () => void
  className?: string
}

export function CreateDocumentButton({
  userId,
  onCreated,
  className,
}: CreateDocumentButtonProps) {
  const navigate = useNavigate()
  const { create, loading } = useCreateDocument()

  async function handleClick() {
    const id = await create(userId)
    if (id) {
      onCreated?.()
      navigate(`/documents/${id}`)
    }
  }

  return (
    <Button
      onClick={handleClick}
      loading={loading}
      size="sm"
      className={className}
    >
      + New document
    </Button>
  )
}
