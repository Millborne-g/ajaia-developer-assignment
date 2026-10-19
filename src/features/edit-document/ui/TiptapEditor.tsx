import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'

interface TiptapEditorProps {
  editor: Editor | null
}

export function TiptapEditor({ editor }: TiptapEditorProps) {
  return (
    /* Outer scroll area — uses theme background colour */
    <div className="flex-1 overflow-y-auto flex justify-center px-6 py-10 bg-background">
      {/* Paper width constraint */}
      <div className="w-full max-w-[760px]">
        <EditorContent editor={editor} className="w-full" />
      </div>
    </div>
  )
}
