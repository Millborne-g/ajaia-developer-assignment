import { generateJSON } from '@tiptap/core'
import { marked } from 'marked'
import { tiptapExtensions } from '@/shared/lib/tiptapExtensions'
import type { Json } from '@/shared/types'

/**
 * Converts a Markdown string to a Tiptap-compatible JSON document.
 * Uses `marked` to parse Markdown to HTML, then Tiptap's generateJSON
 * to convert HTML to the editor's internal format.
 */
export function markdownToTiptap(markdown: string): Json {
  const html = marked.parse(markdown, { async: false }) as string
  return generateJSON(html, tiptapExtensions) as unknown as Json
}
