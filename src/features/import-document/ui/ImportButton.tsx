import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'
import { useImportDocument } from '../model/useImportDocument'

interface ImportButtonProps {
  userId: string
  onImported?: () => void
}

export function ImportButton({ userId, onImported }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { importFile, loading, error } = useImportDocument()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const id = await importFile(file, userId)
    if (inputRef.current) inputRef.current.value = ''

    if (id) {
      onImported?.()
      navigate(`/documents/${id}`)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md"
        className="hidden"
        id="import-file-input"
        onChange={handleFileChange}
        aria-label="Import .txt or .md file"
      />
      <Button
        variant="secondary"
        size="sm"
        loading={loading}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        ↑ Import file
      </Button>
      {error && (
        <p className="text-xs text-danger m-0">{error}</p>
      )}
      <p className="text-[0.7rem] text-muted m-0">Supported: .txt, .md (max 5 MB)</p>
    </div>
  )
}
