import type { Json } from '@/shared/types'

interface TiptapNode {
  type: string
  content?: TiptapNode[]
  text?: string
}

/**
 * Converts plain text to a Tiptap-compatible JSON document.
 * Each non-empty line becomes a paragraph node with a text child.
 * Blank lines are preserved as empty paragraph nodes for visual separation.
 */
export function txtToTiptap(text: string): Json {
  const lines = text.split('\n')
  const content: TiptapNode[] = lines.map((line) => {
    const trimmed = line.trim()
    if (!trimmed) {
      // Empty paragraph — omit content field, matching Tiptap canonical JSON
      return { type: 'paragraph' }
    }
    return {
      type: 'paragraph',
      content: [{ type: 'text', text: line }],
    }
  })

  return {
    type: 'doc',
    content,
  } as unknown as Json
}
