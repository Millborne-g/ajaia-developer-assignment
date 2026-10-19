import type { Json } from '@/shared/types'

export interface Document {
  id: string
  title: string
  content: Json
  owner_id: string
  created_at: string
  updated_at: string
}

export interface DocumentShare {
  id: string
  document_id: string
  user_id: string
  permission: 'view' | 'edit'
  created_at: string
  /** Populated by fetchDocumentShares from profiles; not a DB column */
  email: string | null
}

export interface DocumentWithOwnership extends Document {
  isOwned: boolean
}
