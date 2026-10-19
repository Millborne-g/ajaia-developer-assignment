import type { Json } from '@/shared/types'

interface TipTapMark {
  type: string
}

interface TipTapNode {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: TipTapMark[]
  content?: TipTapNode[]
}

function applyMarks(text: string, marks: TipTapMark[] | undefined): string {
  if (!marks?.length) return text
  let out = text
  // Apply innermost-first: underline → italic → bold for readable nesting
  const types = new Set(marks.map((m) => m.type))
  if (types.has('underline')) out = `<u>${out}</u>`
  if (types.has('italic')) out = `*${out}*`
  if (types.has('bold')) out = `**${out}**`
  if (types.has('code')) out = `\`${out}\``
  if (types.has('strike')) out = `~~${out}~~`
  return out
}

function inlineToMarkdown(nodes: TipTapNode[] | undefined): string {
  if (!nodes?.length) return ''
  return nodes
    .map((node) => {
      if (node.type === 'hardBreak') return '  \n'
      if (node.type === 'text') return applyMarks(node.text ?? '', node.marks)
      if (node.content) return inlineToMarkdown(node.content)
      return ''
    })
    .join('')
}

function listItemToMarkdown(node: TipTapNode, ordered: boolean, index: number): string {
  const prefix = ordered ? `${index}. ` : '- '
  const blocks = node.content ?? []
  if (blocks.length === 0) return `${prefix}\n`

  const lines: string[] = []
  blocks.forEach((block, i) => {
    if (block.type === 'paragraph') {
      const text = inlineToMarkdown(block.content)
      lines.push(i === 0 ? `${prefix}${text}` : `  ${text}`)
    } else if (block.type === 'bulletList' || block.type === 'orderedList') {
      const nested = blockToMarkdown(block)
        .split('\n')
        .filter((l) => l.length > 0)
        .map((l) => `  ${l}`)
        .join('\n')
      if (nested) lines.push(nested)
    } else {
      const text = blockToMarkdown(block)
      lines.push(i === 0 ? `${prefix}${text}` : `  ${text}`)
    }
  })
  return lines.join('\n')
}

function blockToMarkdown(node: TipTapNode): string {
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map(blockToMarkdown).join('\n\n').trim() + '\n'

    case 'paragraph':
      return inlineToMarkdown(node.content)

    case 'heading': {
      const level = Math.min(Math.max(Number(node.attrs?.level) || 1, 1), 6)
      return `${'#'.repeat(level)} ${inlineToMarkdown(node.content)}`
    }

    case 'bulletList':
      return (node.content ?? [])
        .map((item) => listItemToMarkdown(item, false, 0))
        .join('\n')

    case 'orderedList':
      return (node.content ?? [])
        .map((item, i) => listItemToMarkdown(item, true, i + 1))
        .join('\n')

    case 'blockquote': {
      const inner = (node.content ?? []).map(blockToMarkdown).join('\n')
      return inner
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
    }

    case 'codeBlock': {
      const code = inlineToMarkdown(node.content)
      const lang = typeof node.attrs?.language === 'string' ? node.attrs.language : ''
      return `\`\`\`${lang}\n${code}\n\`\`\``
    }

    case 'horizontalRule':
      return '---'

    default:
      if (node.content) return (node.content ?? []).map(blockToMarkdown).join('\n\n')
      return ''
  }
}

/**
 * Converts TipTap JSON document content to a Markdown string.
 * Supports paragraphs, H1–H3, bold/italic/underline, bullet/ordered lists, hard breaks.
 */
export function tiptapToMarkdown(content: Json | object): string {
  const root = content as TipTapNode
  if (!root || typeof root !== 'object') return '\n'
  if (root.type !== 'doc') {
    return blockToMarkdown({ type: 'doc', content: [root] })
  }
  const md = blockToMarkdown(root)
  return md.endsWith('\n') ? md : `${md}\n`
}
