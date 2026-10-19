import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockChannel, mockRemoveChannel, mockOn, mockSubscribe } = vi.hoisted(
  () => {
    const mockOn = vi.fn()
    const mockSubscribe = vi.fn()
    const mockChannel = {
      on: mockOn,
      subscribe: mockSubscribe,
    }
    mockOn.mockReturnValue(mockChannel)
    mockSubscribe.mockReturnValue(mockChannel)

    return {
      mockChannel,
      mockRemoveChannel: vi.fn(),
      mockOn,
      mockSubscribe,
    }
  },
)

vi.mock('@/shared/api/supabase', () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
    removeChannel: mockRemoveChannel,
  },
}))

import { supabase } from '@/shared/api/supabase'
import {
  subscribeDocumentList,
  subscribeDocument,
} from '../model/documentRealtime'

describe('documentRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOn.mockReturnValue(mockChannel)
    mockSubscribe.mockReturnValue(mockChannel)
  })

  describe('subscribeDocumentList', () => {
    it('registers postgres_changes on documents and document_shares', () => {
      const onChange = vi.fn()
      subscribeDocumentList('user-1', onChange)

      expect(supabase.channel).toHaveBeenCalledWith('docs-list:user-1')
      expect(mockOn).toHaveBeenCalledTimes(2)
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        expect.any(Function),
      )
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'document_shares' },
        expect.any(Function),
      )
      expect(mockSubscribe).toHaveBeenCalled()
    })

    it('unsubscribe removes the channel', () => {
      const unsubscribe = subscribeDocumentList('user-1', vi.fn())
      unsubscribe()
      expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannel)
    })

    it('debounces onChange calls', async () => {
      vi.useFakeTimers()
      const onChange = vi.fn()
      subscribeDocumentList('user-1', onChange)

      const documentsHandler = mockOn.mock.calls[0][2] as () => void
      documentsHandler()
      documentsHandler()
      documentsHandler()

      expect(onChange).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(300)
      expect(onChange).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })
  })

  describe('subscribeDocument', () => {
    it('registers UPDATE filter for the document id', () => {
      const onUpdate = vi.fn()
      subscribeDocument('doc-1', onUpdate)

      expect(supabase.channel).toHaveBeenCalledWith('doc:doc-1')
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: 'id=eq.doc-1',
        },
        expect.any(Function),
      )
    })

    it('maps payload.new into DocumentRemoteUpdate', () => {
      const onUpdate = vi.fn()
      subscribeDocument('doc-1', onUpdate)

      const handler = mockOn.mock.calls[0][2] as (payload: {
        new: Record<string, unknown>
      }) => void

      handler({
        new: {
          id: 'doc-1',
          title: 'Hello',
          content: { type: 'doc', content: [] },
          updated_at: '2026-01-02T00:00:00Z',
        },
      })

      expect(onUpdate).toHaveBeenCalledWith({
        id: 'doc-1',
        title: 'Hello',
        content: { type: 'doc', content: [] },
        updated_at: '2026-01-02T00:00:00Z',
      })
    })

    it('unsubscribe removes the channel', () => {
      const unsubscribe = subscribeDocument('doc-1', vi.fn())
      unsubscribe()
      expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannel)
    })
  })
})
