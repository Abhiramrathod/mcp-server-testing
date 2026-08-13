// Global documentation navigation tree. Drives the sidebar, breadcrumbs,
// prev/next footer, and page search index.

export interface NavLeaf {
  path: string
  label: string
  short?: string
}

export interface NavGroup {
  title: string
  items: NavLeaf[]
}

export const navGroups: NavGroup[] = [
  {
    title: 'Getting Started',
    items: [
      { path: '/quickstart', label: 'Quick Start' },
      { path: '/installation', label: 'Installation' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { path: '/architecture', label: 'Architecture' },
      { path: '/transports', label: 'Transports & Protocols' },
      { path: '/lifecycle', label: 'Client Lifecycle' },
    ],
  },
  {
    title: 'Testing Guides',
    items: [
      { path: '/integration-testing', label: 'Integration Testing' },
      { path: '/tools-testing', label: 'Tools' },
      { path: '/resources-testing', label: 'Resources' },
      { path: '/prompts-testing', label: 'Prompts' },
      { path: '/performance', label: 'Performance & Exchanges' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { path: '/api-reference', label: 'API Reference' },
      { path: '/modules', label: 'Modules' },
      { path: '/examples', label: 'Examples' },
      { path: '/glossary', label: 'Glossary' },
    ],
  },
  {
    title: 'Project',
    items: [
      { path: '/faq', label: 'FAQ' },
      { path: '/changelog', label: 'Changelog' },
    ],
  },
]

export const allNavLeaves: NavLeaf[] = navGroups.flatMap(g => g.items)

export function findNavIndex(path: string): number {
  return allNavLeaves.findIndex(l => l.path === path)
}

export function prevNext(path: string): { prev?: NavLeaf; next?: NavLeaf } {
  const idx = findNavIndex(path)
  if (idx < 0) return {}
  return {
    prev: idx > 0 ? allNavLeaves[idx - 1] : undefined,
    next: idx < allNavLeaves.length - 1 ? allNavLeaves[idx + 1] : undefined,
  }
}

export function findGroup(path: string): NavGroup | undefined {
  return navGroups.find(g => g.items.some(i => i.path === path))
}

export function crumbTrail(path: string): { label: string; path?: string }[] {
  const group = findGroup(path)
  const leaf = allNavLeaves.find(l => l.path === path)
  if (!group || !leaf) return [{ label: 'Docs' }]
  return [{ label: 'Docs', path: '/' }, { label: group.title }, { label: leaf.label }]
}
