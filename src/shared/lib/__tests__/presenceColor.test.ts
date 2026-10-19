import { describe, it, expect } from 'vitest'
import { colorFromUserId, initialsFromEmail } from '../presenceColor'

describe('colorFromUserId', () => {
  it('returns a stable color for the same id', () => {
    expect(colorFromUserId('user-abc')).toBe(colorFromUserId('user-abc'))
  })

  it('returns a hex color string', () => {
    expect(colorFromUserId('user-1')).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })
})

describe('initialsFromEmail', () => {
  it('uses first letters of dotted local-part', () => {
    expect(initialsFromEmail('jane.doe@example.com')).toBe('JD')
  })

  it('uses first two chars of a single token', () => {
    expect(initialsFromEmail('alice@example.com')).toBe('AL')
  })

  it('returns ? for empty email', () => {
    expect(initialsFromEmail('')).toBe('?')
  })
})
