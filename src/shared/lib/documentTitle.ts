/** Default title assigned when a document is created without a custom name. */
export const DEFAULT_DOCUMENT_TITLE = 'Untitled Document'

const MAX_TITLE_LENGTH = 60

interface TiptapNode {
  type?: string
  text?: string
  content?: TiptapNode[]
}

function collectText(node: TiptapNode): string {
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text
  }
  if (!node.content?.length) return ''
  return node.content.map(collectText).join('')
}

function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text
  const slice = text.slice(0, max)
  const lastSpace = slice.lastIndexOf(' ')
  if (lastSpace > max * 0.5) {
    return slice.slice(0, lastSpace).trimEnd()
  }
  return slice.trimEnd()
}

/**
 * Derive a short document title from TipTap JSON.
 * Prefers the first non-empty heading, else the first non-empty paragraph.
 * Returns null when there is no usable text.
 */
export function extractTitleFromTiptap(content: unknown): string | null {
  if (
    content === null ||
    typeof content !== 'object' ||
    Array.isArray(content)
  ) {
    return null
  }

  const doc = content as TiptapNode
  if (doc.type !== 'doc' || !Array.isArray(doc.content)) {
    return null
  }

  let firstParagraph: string | null = null

  for (const node of doc.content) {
    if (node.type !== 'heading' && node.type !== 'paragraph') continue

    const raw = collectText(node).replace(/\s+/g, ' ').trim()
    if (!raw) continue

    if (node.type === 'heading') {
      return truncateAtWord(raw, MAX_TITLE_LENGTH)
    }

    if (firstParagraph === null) {
      firstParagraph = truncateAtWord(raw, MAX_TITLE_LENGTH)
    }
  }

  return firstParagraph
}
