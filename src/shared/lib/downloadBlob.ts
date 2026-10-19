/** Trigger a browser file download from a Blob. */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Sanitize a document title into a safe download basename. */
export function sanitizeFilename(title: string, fallback = 'document'): string {
  const cleaned = title
    .trim()
    .replace(/[<>:"/\\|?*]/g, '')
    // eslint-disable-next-line no-control-regex -- strip ASCII control chars from filenames
    .replace(/[\x00-\x1f]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 120)
  return cleaned.length > 0 ? cleaned : fallback
}
