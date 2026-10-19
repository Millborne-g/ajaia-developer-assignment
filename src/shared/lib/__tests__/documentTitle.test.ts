import { describe, it, expect } from 'vitest'
import {
  DEFAULT_DOCUMENT_TITLE,
  extractTitleFromTiptap,
} from '../documentTitle'

describe('DEFAULT_DOCUMENT_TITLE', () => {
  it('is Untitled Document', () => {
    expect(DEFAULT_DOCUMENT_TITLE).toBe('Untitled Document')
  })
})

describe('extractTitleFromTiptap', () => {
  it('returns null for empty doc', () => {
    expect(
      extractTitleFromTiptap({
        type: 'doc',
        content: [{ type: 'paragraph' }],
      }),
    ).toBeNull()
  })

  it('returns null for invalid content', () => {
    expect(extractTitleFromTiptap(null)).toBeNull()
    expect(extractTitleFromTiptap({})).toBeNull()
    expect(extractTitleFromTiptap([])).toBeNull()
  })

  it('prefers first heading over paragraph', () => {
    expect(
      extractTitleFromTiptap({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Body text' }],
          },
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'My Heading' }],
          },
        ],
      }),
    ).toBe('My Heading')
  })

  it('uses first non-empty paragraph when no heading', () => {
    expect(
      extractTitleFromTiptap({
        type: 'doc',
        content: [
          { type: 'paragraph' },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Hello ' },
              { type: 'text', text: 'world', marks: [{ type: 'bold' }] },
            ],
          },
        ],
      }),
    ).toBe('Hello world')
  })

  it('truncates long text at a word boundary', () => {
    const long =
      'This is a fairly long sentence that should be truncated before sixty characters somehow'
    const result = extractTitleFromTiptap({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: long }],
        },
      ],
    })
    expect(result).not.toBeNull()
    expect(result!.length).toBeLessThanOrEqual(60)
    expect(long.startsWith(result!)).toBe(true)
    expect(result).not.toMatch(/\s$/)
  })

  it('collapses whitespace', () => {
    expect(
      extractTitleFromTiptap({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '  Hello   \n  world  ' }],
          },
        ],
      }),
    ).toBe('Hello world')
  })
})
