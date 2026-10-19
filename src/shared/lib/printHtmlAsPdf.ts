import { generateHTML } from '@tiptap/core'
import { tiptapExtensions } from '@/shared/lib/tiptapExtensions'
import type { Json } from '@/shared/types'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Prints document HTML via a same-page hidden iframe (no pop-up window)
 * so the browser print dialog can Save as PDF without being blocked.
 */
export function printHtmlAsPdf(title: string, content: Json | object): void {
  const bodyHtml = generateHTML(content as object, tiptapExtensions)
  const safeTitle = escapeHtml(title.trim() || 'Document')

  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.title = 'Print document'
  // Keep in layout but invisible — display:none can block printing in some browsers
  Object.assign(iframe.style, {
    position: 'fixed',
    right: '0',
    bottom: '0',
    width: '0',
    height: '0',
    border: '0',
    opacity: '0',
    pointerEvents: 'none',
  })
  document.body.appendChild(iframe)

  const frameDoc = iframe.contentDocument
  const frameWin = iframe.contentWindow
  if (!frameDoc || !frameWin) {
    iframe.remove()
    throw new Error('Could not prepare print view for PDF export.')
  }

  frameDoc.open()
  frameDoc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>
    @page { margin: 1in; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #111;
      max-width: 720px;
      margin: 0 auto;
      padding: 24px;
    }
    h1 { font-size: 22pt; margin: 0 0 0.6em; }
    h2 { font-size: 16pt; margin: 1.2em 0 0.4em; }
    h3 { font-size: 13pt; margin: 1em 0 0.35em; }
    p { margin: 0 0 0.75em; }
    ul, ol { margin: 0 0 0.75em; padding-left: 1.5em; }
    li { margin: 0.2em 0; }
    u { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>${safeTitle}</h1>
  ${bodyHtml}
</body>
</html>`)
  frameDoc.close()

  const cleanup = () => {
    iframe.remove()
  }

  frameWin.addEventListener('afterprint', cleanup)
  // Fallback cleanup if afterprint never fires (some browsers)
  window.setTimeout(cleanup, 60_000)

  // Call print synchronously in the click stack so browsers do not treat
  // it as an unsolicited dialog (and we never need window.open).
  try {
    frameWin.focus()
    frameWin.print()
  } catch {
    cleanup()
    throw new Error('Print dialog could not be opened.')
  }
}
