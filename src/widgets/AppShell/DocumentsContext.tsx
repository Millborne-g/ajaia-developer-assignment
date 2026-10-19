import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchOwnedDocuments,
  fetchSharedDocuments,
  deleteDocument,
} from '@/entities/document/model/documentApi'
import type { Document } from '@/entities/document/model/types'
import { useDocumentListRealtime } from '@/features/realtime-documents/model/useDocumentListRealtime'

interface DocumentsContextValue {
  userId: string
  ownedDocs: Document[]
  sharedDocs: Document[]
  loading: boolean
  error: string | null
  reload: (opts?: { silent?: boolean }) => Promise<void>
  removeOwned: (id: string) => void
  renameOwned: (id: string, title: string) => void
  deleteOwned: (id: string) => Promise<void>
}

const DocumentsContext = createContext<DocumentsContextValue | null>(null)

interface DocumentsProviderProps {
  userId: string
  children: ReactNode
}

export function DocumentsProvider({ userId, children }: DocumentsProviderProps) {
  const [ownedDocs, setOwnedDocs] = useState<Document[]>([])
  const [sharedDocs, setSharedDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true)
    setError(null)
    try {
      const [owned, shared] = await Promise.all([
        fetchOwnedDocuments(userId),
        fetchSharedDocuments(userId),
      ])
      setOwnedDocs(owned)
      setSharedDocs(shared)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload()
  }, [reload])

  useDocumentListRealtime(userId, () => {
    void reload({ silent: true })
  })

  const removeOwned = useCallback((id: string) => {
    setOwnedDocs((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const renameOwned = useCallback((id: string, title: string) => {
    setOwnedDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, title } : d)),
    )
  }, [])

  const deleteOwned = useCallback(async (id: string) => {
    await deleteDocument(id)
    setOwnedDocs((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      userId,
      ownedDocs,
      sharedDocs,
      loading,
      error,
      reload,
      removeOwned,
      renameOwned,
      deleteOwned,
    }),
    [
      userId,
      ownedDocs,
      sharedDocs,
      loading,
      error,
      reload,
      removeOwned,
      renameOwned,
      deleteOwned,
    ],
  )

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useDocuments() {
  const ctx = useContext(DocumentsContext)
  if (!ctx) {
    throw new Error('useDocuments must be used within DocumentsProvider')
  }
  return ctx
}
