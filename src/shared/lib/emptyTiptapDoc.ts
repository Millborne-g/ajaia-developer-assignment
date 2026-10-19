import type { Json } from '@/shared/types'

/** Canonical empty TipTap document (valid ProseMirror JSON). */
export const EMPTY_TIPTAP_DOC: Json = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

/**
 * Coerce stored JSONB into valid TipTap doc JSON.
 * Legacy rows may be `{}` or null from the original schema default.
 */
export function normalizeTiptapContent(content: unknown): object {
  if (
    content !== null &&
    typeof content === 'object' &&
    !Array.isArray(content) &&
    'type' in content &&
    (content as { type: unknown }).type === 'doc'
  ) {
    return content as object
  }
  return EMPTY_TIPTAP_DOC as object
}
