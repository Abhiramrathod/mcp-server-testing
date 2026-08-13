// Markdown building blocks. Every docs page is defined as structured "blocks"
// that render to React AND serialize to GitHub-flavored Markdown — so the
// "copy page as .md" button always matches what is displayed.

export type Block =
  | { t: 'p'; md: string }
  | { t: 'h2'; id: string; md: string }
  | { t: 'h3'; id: string; md: string }
  | { t: 'h4'; id: string; md: string }
  | { t: 'code'; lang: string; file?: string; code: string }
  | { t: 'table'; headers: string[]; rows: string[][] }
  | { t: 'list'; ordered?: boolean; items: string[] }
  | { t: 'callout'; kind: 'note' | 'tip' | 'warning' | 'info' | 'danger'; title?: string; md: string }
  | { t: 'tabs'; tabs: { label: string; lang: string; code: string }[] }
  | { t: 'quote'; md: string }
  | { t: 'rule' }
  | { t: 'html'; md: string }

export interface PageMeta {
  path: string
  title: string
  description: string
  section: string
  keywords?: string[]
  editPath?: string
  lastUpdated?: string
}

export function escapeMdCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

export function toMarkdown(blocks: Block[]): string {
  const out: string[] = []
  for (const b of blocks) {
    switch (b.t) {
      case 'p': out.push(b.md, ''); break
      case 'h2': out.push(`## ${b.md}`, ''); break
      case 'h3': out.push(`### ${b.md}`, ''); break
      case 'h4': out.push(`#### ${b.md}`, ''); break
      case 'quote': out.push(`> ${b.md}`, ''); break
      case 'rule': out.push('---', ''); break
      case 'callout': {
        const title = b.title ? ` **${b.title}**` : ''
        const label = { note: 'NOTE', tip: 'TIP', info: 'INFO', warning: 'WARNING', danger: 'DANGER' }[b.kind]
        out.push(`> ${label}${title}: ${b.md}`, ''); break
      }
      case 'list':
        for (const item of b.items) out.push(`${b.ordered ? '1. ' : '- '}${item}`)
        out.push('')
        break
      case 'table': {
        out.push(`| ${b.headers.map(escapeMdCell).join(' | ')} |`, `| ${b.headers.map(() => '---').join(' | ')} |`)
        for (const row of b.rows) out.push(`| ${row.map(escapeMdCell).join(' | ')} |`)
        out.push('')
        break
      }
      case 'code': {
        if (b.file) out.push(`\`${b.file}\``)
        out.push('```' + b.lang, b.code, '```', '')
        break
      }
      case 'tabs':
        out.push('<!-- tabs -->', '')
        for (const tab of b.tabs) {
          out.push(`### ${tab.label}`, '', '```' + tab.lang, tab.code, '```', '')
        }
        out.push('<!-- /tabs -->', '')
        break
      case 'html': out.push(b.md, ''); break
    }
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}

export function buildPageMd(meta: PageMeta, blocks: Block[]): string {
  const parts: string[] = []
  parts.push(`# ${meta.title}`)
  parts.push('')
  parts.push(`> ${meta.description}`)
  if (meta.keywords?.length) parts.push('')
  parts.push('')
  parts.push(toMarkdown(blocks))
  parts.push('---')
  parts.push('')
  parts.push(`_Generated documentation page. Source: [mcp-server-testing](https://github.com/Abhiramrathod/mcp-testing)._\n`)
  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}
