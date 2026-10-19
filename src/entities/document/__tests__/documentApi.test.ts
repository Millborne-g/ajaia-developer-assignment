import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Tests for document API authorization logic using a mocked Supabase client.
 *
 * These tests verify that the API helper functions correctly propagate
 * errors from Supabase (which would occur when RLS policies reject
 * unauthorized access) and that successful responses are handled properly.
 *
 * Note: Actual RLS enforcement is guaranteed by the database policies in
 * supabase/migrations/001_initial_schema.sql, not by frontend code.
 * These tests verify the client-side error handling behaviour.
 */

// Use vi.hoisted so mock variables are available when vi.mock is hoisted
const { mockFrom } = vi.hoisted(() => {
  const mockFrom = vi.fn()
  return { mockFrom }
})

vi.mock('@/shared/api/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}))

const { mockFetchProfilesByIds } = vi.hoisted(() => ({
  mockFetchProfilesByIds: vi.fn(),
}))

vi.mock('@/entities/user/model/profileApi', () => ({
  fetchProfilesByIds: mockFetchProfilesByIds,
}))

// Import after mocking
import {
  fetchDocument,
  createDocument,
  updateDocumentContent,
  deleteDocument,
  fetchDocumentShares,
  shareDocument,
  fetchMyDocumentAccess,
} from '../model/documentApi'

/** Build a chainable mock that resolves to `finalResult` when awaited. */
function makeChain(finalResult: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(finalResult),
    // Awaiting the chain resolves the result (for non-.single() calls)
    then: (resolve: (v: unknown) => void) =>
      Promise.resolve(finalResult).then(resolve),
  }
  return chain
}

describe('documentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── fetchDocument ──────────────────────────────────────────────────────────

  describe('fetchDocument', () => {
    it('returns a document when Supabase responds with data', async () => {
      const doc = {
        id: 'doc-1',
        title: 'My Doc',
        content: {},
        owner_id: 'user-1',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      }
      mockFrom.mockReturnValue(makeChain({ data: doc, error: null }))

      const result = await fetchDocument('doc-1')
      expect(result).toMatchObject({ id: 'doc-1', title: 'My Doc' })
    })

    it('throws an Error when Supabase returns an error (RLS rejection)', async () => {
      mockFrom.mockReturnValue(
        makeChain({ data: null, error: { message: 'Row level security violation' } }),
      )

      await expect(fetchDocument('private-doc')).rejects.toThrow(
        'Row level security violation',
      )
    })

    it('throws when a non-existent document is requested', async () => {
      mockFrom.mockReturnValue(
        makeChain({ data: null, error: { message: 'No rows found' } }),
      )

      await expect(fetchDocument('does-not-exist')).rejects.toThrow(
        'No rows found',
      )
    })
  })

  // ─── createDocument ─────────────────────────────────────────────────────────

  describe('createDocument', () => {
    it('returns a new document on success and inserts empty TipTap content by default', async () => {
      const newDoc = {
        id: 'new-doc-id',
        title: 'Untitled Document',
        content: {},
        owner_id: 'user-1',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      }
      const chain = makeChain({ data: newDoc, error: null })
      mockFrom.mockReturnValue(chain)

      const result = await createDocument('user-1')
      expect(result).toMatchObject({ id: 'new-doc-id', owner_id: 'user-1' })
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          owner_id: 'user-1',
          content: { type: 'doc', content: [{ type: 'paragraph' }] },
        }),
      )
    })

    it('inserts provided initial content (import path)', async () => {
      const imported = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello from file' }],
          },
        ],
      }
      const newDoc = {
        id: 'imported-doc',
        title: 'notes',
        content: imported,
        owner_id: 'user-1',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      }
      const chain = makeChain({ data: newDoc, error: null })
      mockFrom.mockReturnValue(chain)

      await createDocument('user-1', 'notes', imported)

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'notes',
          owner_id: 'user-1',
          content: imported,
        }),
      )
    })

    it('throws when insert fails (RLS prevents non-owner insert)', async () => {
      mockFrom.mockReturnValue(
        makeChain({
          data: null,
          error: { message: 'new row violates row-level security policy' },
        }),
      )

      await expect(createDocument('attacker-user-id')).rejects.toThrow(
        'row-level security policy',
      )
    })
  })

  // ─── updateDocumentContent ──────────────────────────────────────────────────

  describe('updateDocumentContent', () => {
    it('resolves without error on success', async () => {
      mockFrom.mockReturnValue(makeChain({ data: null, error: null }))

      await expect(
        updateDocumentContent('doc-1', { type: 'doc', content: [] }),
      ).resolves.toBeUndefined()
    })

    it('throws when update is rejected (unauthorized user)', async () => {
      mockFrom.mockReturnValue(
        makeChain({
          data: null,
          error: { message: 'permission denied for table documents' },
        }),
      )

      await expect(updateDocumentContent('doc-1', {})).rejects.toThrow(
        'permission denied',
      )
    })
  })

  // ─── deleteDocument ─────────────────────────────────────────────────────────

  describe('deleteDocument', () => {
    it('resolves without error when owner deletes', async () => {
      mockFrom.mockReturnValue(makeChain({ data: null, error: null }))

      await expect(deleteDocument('doc-1')).resolves.toBeUndefined()
    })

    it('throws when delete is rejected (non-owner cannot delete)', async () => {
      mockFrom.mockReturnValue(
        makeChain({
          data: null,
          error: { message: 'permission denied for table documents' },
        }),
      )

      await expect(deleteDocument('doc-1')).rejects.toThrow('permission denied')
    })
  })

  // ─── fetchDocumentShares ────────────────────────────────────────────────────

  describe('fetchDocumentShares', () => {
    it('enriches shares with profile emails', async () => {
      const shares = [
        {
          id: 'share-1',
          document_id: 'doc-1',
          user_id: 'user-2',
          permission: 'edit' as const,
          created_at: '2026-01-01T00:00:00Z',
        },
      ]
      mockFrom.mockReturnValue(makeChain({ data: shares, error: null }))
      mockFetchProfilesByIds.mockResolvedValue([
        {
          id: 'user-2',
          email: 'colleague@example.com',
          created_at: '2026-01-01T00:00:00Z',
        },
      ])

      const result = await fetchDocumentShares('doc-1')

      expect(mockFetchProfilesByIds).toHaveBeenCalledWith(['user-2'])
      expect(result).toEqual([
        {
          ...shares[0],
          email: 'colleague@example.com',
        },
      ])
    })

    it('sets email to null when profile is missing', async () => {
      const shares = [
        {
          id: 'share-1',
          document_id: 'doc-1',
          user_id: 'user-missing',
          permission: 'view' as const,
          created_at: '2026-01-01T00:00:00Z',
        },
      ]
      mockFrom.mockReturnValue(makeChain({ data: shares, error: null }))
      mockFetchProfilesByIds.mockResolvedValue([])

      const result = await fetchDocumentShares('doc-1')
      expect(result[0].email).toBeNull()
    })
  })

  // ─── shareDocument (permission) ─────────────────────────────────────────────

  describe('shareDocument with permission', () => {
    it('inserts a view share correctly', async () => {
      const chain = makeChain({ data: null, error: null })
      mockFrom.mockReturnValue(chain)

      await expect(
        shareDocument('doc-1', 'user-2', 'view'),
      ).resolves.toBeUndefined()

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ permission: 'view' }),
      )
    })

    it('inserts an edit share correctly', async () => {
      const chain = makeChain({ data: null, error: null })
      mockFrom.mockReturnValue(chain)

      await expect(
        shareDocument('doc-1', 'user-2', 'edit'),
      ).resolves.toBeUndefined()

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ permission: 'edit' }),
      )
    })
  })

  // ─── fetchMyDocumentAccess ──────────────────────────────────────────────────

  describe('fetchMyDocumentAccess', () => {
    it('returns owner when the doc owner_id matches userId', async () => {
      mockFrom.mockReturnValue(
        makeChain({ data: { owner_id: 'user-1' }, error: null }),
      )

      const result = await fetchMyDocumentAccess('doc-1', 'user-1')
      expect(result).toBe('owner')
    })

    it('returns edit when the user has an edit share', async () => {
      // First call: documents table → different owner
      // Second call: document_shares table → edit share
      mockFrom
        .mockReturnValueOnce(
          makeChain({ data: { owner_id: 'user-owner' }, error: null }),
        )
        .mockReturnValueOnce(
          makeChain({ data: { permission: 'edit' }, error: null }),
        )

      const result = await fetchMyDocumentAccess('doc-1', 'user-2')
      expect(result).toBe('edit')
    })

    it('returns view when the user has a view share', async () => {
      mockFrom
        .mockReturnValueOnce(
          makeChain({ data: { owner_id: 'user-owner' }, error: null }),
        )
        .mockReturnValueOnce(
          makeChain({ data: { permission: 'view' }, error: null }),
        )

      const result = await fetchMyDocumentAccess('doc-1', 'user-3')
      expect(result).toBe('view')
    })

    it('throws when no access row found', async () => {
      mockFrom
        .mockReturnValueOnce(
          makeChain({ data: { owner_id: 'user-owner' }, error: null }),
        )
        .mockReturnValueOnce(
          makeChain({ data: null, error: { message: 'No rows found' } }),
        )

      await expect(
        fetchMyDocumentAccess('doc-1', 'user-unrelated'),
      ).rejects.toThrow('No rows found')
    })
  })
})
