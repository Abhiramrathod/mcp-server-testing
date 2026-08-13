import { Link, useLocation } from 'react-router-dom'
import { navGroups } from '../data/nav'

export default function Sidebar() {
  const { pathname } = useLocation()
  return (
    <aside className="hidden md:block w-52 shrink-0 pt-6 pb-10">
      <div className="sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto pr-2 space-y-5">
        {navGroups.map(group => (
          <div key={group.title}>
            <p className="text-[10px] mb-1.5 font-semibold" style={{ color: 'var(--text-dim2)', letterSpacing: '0.3px' }}>
              {group.title.toUpperCase()}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = pathname === item.path
                return (
                  <Link key={item.path} to={item.path}
                    className="block text-xs px-2 py-1 rounded transition-colors no-underline"
                    style={{
                      color: active ? 'var(--accent)' : 'var(--text-dim)',
                      background: active ? 'var(--accent-dim)' : 'transparent',
                      border: active ? '1px solid var(--accent-glow)' : '1px solid transparent',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text)' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-dim)' }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
        <p className="text-[10px] pt-2" style={{ color: 'var(--text-dim2)', borderTop: '1px solid var(--border)' }}>
          v1.0.38 · Java 17+ · Apache 2.0
        </p>
      </div>
    </aside>
  )
}
