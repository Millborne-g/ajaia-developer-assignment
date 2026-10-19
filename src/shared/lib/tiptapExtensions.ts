import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

/**
 * Shared Tiptap extension list used by both the editor and the
 * markdownToTiptap converter to ensure consistent JSON generation.
 */
export const tiptapExtensions = [StarterKit, Underline]
