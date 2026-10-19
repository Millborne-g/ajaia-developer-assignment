import { useState } from 'react'
import { updateDocumentTitle } from '@/entities/document/model/documentApi'

export function useRenameDocument() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function rename(id: string, title: string): Promise<boolean> {
    const trimmed = title.trim()
    if (!trimmed) {
      setError('Title cannot be empty.')
      return false
    }
    setLoading(true)
    setError(null)
    try {
      await updateDocumentTitle(id, trimmed)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename document')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { rename, loading, error }
}
