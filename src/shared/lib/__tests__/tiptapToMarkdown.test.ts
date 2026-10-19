import { describe, it, expect } from 'vitest'
import { tiptapToMarkdown } from '../tiptapToMarkdown'
import { EMPTY_TIPTAP_DOC } from '../emptyTiptapDoc'
import type { Json } from '@/shared/types'

describe('tiptapToMarkdown', () => {
  it('exports an empty doc as a newline', () => {
    expect(tiptapToMarkdown(EMPTY_TIPTAP_DOC)).toBe('\n')
  })

  it('converts a plain paragraph', () => {
    const doc: Json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello world' }],
        },
      ],
    }
    expect(tiptapToMarkdown(doc)).toBe('Hello world\n')
  })

  it('converts heading levels 1–3', () => {
    const doc: Json = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'One' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Two' }],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Three' }],
        },
      ],
    }
    expect(tiptapToMarkdown(doc)).toBe('# One\n\n## Two\n\n### Three\n')
  })

  it('converts bold and italic marks', () => {
    const doc: Json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This is ' },
            { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' and ' },
            { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
            { type: 'text', text: '.' },
          ],
        },
      ],
    }
    expect(tiptapToMarkdown(doc)).toBe('This is **bold** and *italic*.\n')
  })

  it('converts underline as HTML u tags', () => {
    const doc: Json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'under',
              marks: [{ type: 'underline' }],
            },
          ],
        },
      ],
    }
    expect(tiptapToMarkdown(doc)).toBe('<u>under</u>\n')
  })

  it('converts a bullet list', () => {
    const doc: Json = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'item one' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'item two' }],
                },
              ],
            },
          ],
        },
      ],
    }
    expect(tiptapToMarkdown(doc)).toBe('- item one\n- item two\n')
  })

  it('converts an ordered list', () => {
    const doc: Json = {
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'first' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'second' }],
                },
              ],
            },
          ],
        },
      ],
    }
    expect(tiptapToMarkdown(doc)).toBe('1. first\n2. second\n')
  })
})
