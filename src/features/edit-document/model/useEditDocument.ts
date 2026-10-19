import { useEffect, useRef, useState } from 'react'
import {
  updateDocumentContent,
  updateDocumentTitle,
} from '@/entities/document/model/documentApi'
import {
  DEFAULT_DOCUMENT_TITLE,
  extractTitleFromTiptap,
} from '@/shared/lib/documentTitle'
import type { Json } from '@/shared/types'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseEditDocumentOptions {
  /** Current document title; auto-title only runs while this is the default */
  currentTitle: string
  /** Called when an auto-derived title is persisted */
  onTitleAutoUpdated?: (newTitle: string) => void
}

export function useEditDocument(
  documentId: string,
  options: UseEditDocumentOptions = { currentTitle: DEFAULT_DOCUMENT_TITLE },
) {
  const { currentTitle, onTitleAutoUpdated } = options

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const hasPendingChanges = useRef(false)

  // Inline debounce: store the timer ref and documentId ref.
  // Using refs instead of useCallback+debounce avoids lint warnings
  // about refs being passed to functions during render.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const documentIdRef = useRef(documentId)
  const currentTitleRef = useRef(currentTitle)
  const lastAutoTitleRef = useRef<string | null>(null)
  const onTitleAutoUpdatedRef = useRef(onTitleAutoUpdated)

  useEffect(() => {
    documentIdRef.current = documentId
  }, [documentId])

  useEffect(() => {
    currentTitleRef.current = currentTitle
    // If the user renamed away from default, clear last auto title tracker
    if (currentTitle !== DEFAULT_DOCUMENT_TITLE) {
      lastAutoTitleRef.current = currentTitle
    }
  }, [currentTitle])

  useEffect(() => {
    onTitleAutoUpdatedRef.current = onTitleAutoUpdated
  }, [onTitleAutoUpdated])

  function onContentChange(content: Json) {
    hasPendingChanges.current = true
    setSaveStatus('idle')

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      const id = documentIdRef.current
      setSaveStatus('saving')
      setSaveError(null)

      const contentPromise = updateDocumentContent(id, content)

      // Auto-title only while still Untitled and content yields a usable title
      let titlePromise: Promise<void> = Promise.resolve()
      if (currentTitleRef.current === DEFAULT_DOCUMENT_TITLE) {
        const extracted = extractTitleFromTiptap(content)
        if (
          extracted !== null &&
          extracted !== lastAutoTitleRef.current
        ) {
          titlePromise = updateDocumentTitle(id, extracted)
            .then(() => {
              lastAutoTitleRef.current = extracted
              currentTitleRef.current = extracted
              onTitleAutoUpdatedRef.current?.(extracted)
            })
            .catch(() => {
              // Title update failure must not block content save status
            })
        }
      }

      Promise.all([contentPromise, titlePromise])
        .then(() => {
          setSaveStatus('saved')
          hasPendingChanges.current = false
        })
        .catch((err: unknown) => {
          setSaveStatus('error')
          setSaveError(
            err instanceof Error ? err.message : 'Failed to save document',
          )
        })
    }, 1500)
  }

  return { onContentChange, saveStatus, saveError, hasPendingChanges }
}
