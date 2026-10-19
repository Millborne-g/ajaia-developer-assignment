import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFrom } = vi.hoisted(() => {
  const mockFrom = vi.fn()
  return { mockFrom }
})

vi.mock('@/shared/api/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}))

import { fetchProfilesByIds } from '../model/profileApi'

function makeChain(finalResult: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(finalResult),
    then: (resolve: (v: unknown) => void) =>
      Promise.resolve(finalResult).then(resolve),
  }
  return chain
}

describe('fetchProfilesByIds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns [] without querying when ids is empty', async () => {
    const result = await fetchProfilesByIds([])
    expect(result).toEqual([])
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('returns profiles for the given ids', async () => {
    const profiles = [
      { id: 'u1', email: 'a@example.com', created_at: '2026-01-01T00:00:00Z' },
      { id: 'u2', email: 'b@example.com', created_at: '2026-01-01T00:00:00Z' },
    ]
    mockFrom.mockReturnValue(makeChain({ data: profiles, error: null }))

    const result = await fetchProfilesByIds(['u1', 'u2'])
    expect(result).toEqual(profiles)
    expect(mockFrom).toHaveBeenCalledWith('profiles')
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(
      makeChain({ data: null, error: { message: 'permission denied' } }),
    )

    await expect(fetchProfilesByIds(['u1'])).rejects.toThrow('permission denied')
  })
})
