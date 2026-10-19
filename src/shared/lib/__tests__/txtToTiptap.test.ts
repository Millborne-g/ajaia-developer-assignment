import { describe, it, expect } from 'vitest'
import { txtToTiptap } from '../txtToTiptap'

describe('txtToTiptap', () => {
  it('returns a doc node as the root type', () => {
    const result = txtToTiptap('Hello')
    expect(result).toMatchObject({ type: 'doc' })
  })

  it('converts each line to a paragraph node', () => {
    const result = txtToTiptap('line one\nline two')
    const content = (result as { content: Array<{ type: string }> }).content
    expect(content).toHaveLength(2)
    expect(content.every((n) => n.type === 'paragraph')).toBe(true)
  })

  it('preserves blank lines as empty paragraphs', () => {
    const result = txtToTiptap('first\n\nsecond')
    const content = (result as { content: Array<{ type: string; content?: unknown[] }> }).content
    // blank line becomes a paragraph with no content
    const emptyParagraph = content[1]
    expect(emptyParagraph?.content).toBeUndefined()
  })

  it('produces text nodes with the correct text', () => {
    const result = txtToTiptap('Hello world')
    const content = (result as { content: Array<{ content: Array<{ type: string; text: string }> }> }).content
    expect(content[0]?.content[0]).toMatchObject({ type: 'text', text: 'Hello world' })
  })

  it('handles an empty string', () => {
    const result = txtToTiptap('')
    expect(result).toMatchObject({ type: 'doc' })
  })
})
