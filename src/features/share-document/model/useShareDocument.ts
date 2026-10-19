import { useState } from 'react'
import { findProfileByEmail } from '@/entities/user/model/profileApi'
import {
  shareDocument,
  revokeShare,
  fetchDocumentShares,
  updateSharePermission,
} from '@/entities/document/model/documentApi'
import type { DocumentShare } from '@/entities/document/model/types'

export function useShareDocument() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function share(
    documentId: string,
    email: string,
    permission: 'view' | 'edit' = 'edit',
  ): Promise<boolean> {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const profile = await findProfileByEmail(email)
      if (!profile) {
        setError('No user found with that email address.')
        return false
      }
      await shareDocument(documentId, profile.id, permission)
      setSuccess(`Document shared with ${email}.`)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share document')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { share, loading, error, success }
}

export function useDocumentShares(documentId: string) {
  const [shares, setShares] = useState<DocumentShare[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDocumentShares(documentId)
      setShares(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shares')
    } finally {
      setLoading(false)
    }
  }

  async function revoke(shareId: string) {
    try {
      await revokeShare(shareId)
      setShares((prev) => prev.filter((s) => s.id !== shareId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke share')
    }
  }

  async function changePermission(
    shareId: string,
    userId: string,
    newPermission: 'view' | 'edit',
  ) {
    try {
      await updateSharePermission(shareId, documentId, userId, newPermission)
      // Re-fetch since we did delete+insert (new share row, new id)
      const data = await fetchDocumentShares(documentId)
      setShares(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to change permission',
      )
    }
  }

  return { shares, loading, error, load, revoke, changePermission }
}
