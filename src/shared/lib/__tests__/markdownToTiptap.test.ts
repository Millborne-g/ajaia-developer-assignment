import { describe, it, expect } from 'vitest'
import { markdownToTiptap } from '../markdownToTiptap'

/**
 * Unit tests for the Markdown → Tiptap JSON converter.
 *
 * These tests verify that the converter correctly transforms
 * Markdown content into the JSON structure that Tiptap expects,
 * without requiring a browser or network connection.
 */
describe('markdownToTiptap', () => {
  it('returns a doc node as the root type', () => {
    const result = markdownToTiptap('Hello')
    expect(result).toMatchObject({ type: 'doc' })
  })

  it('converts a plain paragraph', () => {
    const result = markdownToTiptap('Hello world')
    expect(result).toMatchObject({
      type: 'doc',
      content: expect.arrayContaining([
        expect.objectContaining({ type: 'paragraph' }),
      ]),
    })
  })

  it('converts a Markdown heading (# H1) to a heading node of level 1', () => {
    const result = markdownToTiptap('# Heading One')
    const content = (result as { type: string; content: Array<{ type: string; attrs?: { level: number } }> }).content
    const heading = content.find((n) => n.type === 'heading')
    expect(heading).toBeDefined()
    expect(heading?.attrs?.level).toBe(1)
  })

  it('converts a Markdown heading (## H2) to a heading node of level 2', () => {
    const result = markdownToTiptap('## Heading Two')
    const content = (result as { type: string; content: Array<{ type: string; attrs?: { level: number } }> }).content
    const heading = content.find((n) => n.type === 'heading')
    expect(heading?.attrs?.level).toBe(2)
  })

  it('converts an unordered list to a bulletList node', () => {
    const result = markdownToTiptap('- item one\n- item two')
    const content = (result as { type: string; content: Array<{ type: string }> }).content
    const list = content.find((n) => n.type === 'bulletList')
    expect(list).toBeDefined()
  })

  it('converts an ordered list to an orderedList node', () => {
    const result = markdownToTiptap('1. first\n2. second')
    const content = (result as { type: string; content: Array<{ type: string }> }).content
    const list = content.find((n) => n.type === 'orderedList')
    expect(list).toBeDefined()
  })

  it('converts bold text (**text**) to inline mark', () => {
    const result = markdownToTiptap('This is **bold** text')
    const json = JSON.stringify(result)
    expect(json).toContain('"bold"')
  })

  it('converts italic text (*text*) to inline mark', () => {
    const result = markdownToTiptap('This is *italic* text')
    const json = JSON.stringify(result)
    expect(json).toContain('"italic"')
  })

  it('handles an empty string without throwing', () => {
    expect(() => markdownToTiptap('')).not.toThrow()
  })

  it('handles a string with only whitespace without throwing', () => {
    expect(() => markdownToTiptap('   \n   ')).not.toThrow()
  })

  it('handles a multi-section document with headings and lists', () => {
    const md = `# Title\n\nSome paragraph.\n\n## Section\n\n- item a\n- item b`
    const result = markdownToTiptap(md)
    expect(result).toMatchObject({ type: 'doc' })
    const json = JSON.stringify(result)
    expect(json).toContain('"heading"')
    expect(json).toContain('"bulletList"')
  })
})
