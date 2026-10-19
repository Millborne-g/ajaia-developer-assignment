import { useState } from 'react'
import { createDocument } from '@/entities/document/model/documentApi'

export function useCreateDocument() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function create(userId: string): Promise<string | null> {
    setLoading(true)
    setError(null)
    try {
      const doc = await createDocument(userId)
      return doc.id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create document')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { create, loading, error }
}
