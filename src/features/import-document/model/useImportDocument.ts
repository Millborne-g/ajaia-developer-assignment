import { useState } from 'react'
import { createDocument } from '@/entities/document/model/documentApi'
import { markdownToTiptap } from '@/shared/lib/markdownToTiptap'
import { txtToTiptap } from '@/shared/lib/txtToTiptap'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['.txt', '.md', 'text/plain', 'text/markdown']

function validateFile(file: File): string | null {
  const extension = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
  const isAllowedExt = extension === '.txt' || extension === '.md'
  const isAllowedMime =
    file.type === 'text/plain' ||
    file.type === 'text/markdown' ||
    file.type === ''

  if (!isAllowedExt || !isAllowedMime) {
    return `Unsupported file type. Please upload a .txt or .md file.`
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File exceeds the 5 MB size limit.'
  }
  if (file.size === 0) {
    return 'File is empty.'
  }
  return null
}

export const ALLOWED_TYPES_DISPLAY = ALLOWED_TYPES

export function useImportDocument() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function importFile(
    file: File,
    userId: string,
  ): Promise<string | null> {
    setLoading(true)
    setError(null)

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return null
    }

    try {
      const text = await file.text()
      if (!text.trim()) {
        setError('File contains no readable text.')
        return null
      }

      const baseName = file.name.replace(/\.[^.]+$/, '') || 'Imported Document'
      const extension = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')

      const content =
        extension === '.md' ? markdownToTiptap(text) : txtToTiptap(text)

      // Single insert with converted content — avoids empty→update race that
      // can leave an orphan empty doc or let autosave wipe imported body.
      const doc = await createDocument(userId, baseName, content)

      return doc.id
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to import document.',
      )
      return null
    } finally {
      setLoading(false)
    }
  }

  return { importFile, loading, error }
}
