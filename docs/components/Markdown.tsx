import { useMemo } from 'react'
import { marked } from 'marked'

interface MarkdownProps {
  content: string
  className?: string
}

/**
 * Render Markdown content (descriptions from CRD OpenAPI schemas).
 *
 * Handles headings, bold, italic, lists, code blocks, and preserves
 * line breaks from the original YAML description fields.
 */
export function Markdown({ content, className = '' }: MarkdownProps) {
  const html = useMemo(() => {
    if (!content) return ''
    // Preprocess: convert single newlines to <br> for plain text sections
    // but preserve double newlines as paragraph breaks
    const processed = content
      .replace(/\n\n/g, '\n\n') // Keep paragraph breaks
      .replace(/\n/g, '  \n') // Convert single newlines to markdown line breaks
    return marked.parse(processed, { async: false, breaks: true })
  }, [content])

  if (!content) return null

  return <div className={`markdown ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}
