
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const menuItems = [
  { href: '/', label: 'ダッシュボード', icon: '▦' },
  { href: '/customers', label: '顧客管理', icon: '♙' },
  { href: '/deals', label: '商談管理', icon: '▤' },
  { href: '/activities', label: '営業活動', icon: '◷' },
  { href: '/reports', label: '売上分析', icon: '▥' },
]

export default function AppShell({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const currentPage = menuItems.find(item => item.href === pathname)

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <strong>SalesBoard</strong>
            <span>営業管理CRM</span>
          </div>
        </div>

        <div className="menu-heading">WORKSPACE</div>

        <nav className="navigation">
          {menuItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">AD</div>
          <div>
            <strong>管理者</strong>
            <span>Administrator</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            SalesBoard <span>/</span> {currentPage?.label}
          </div>
          <div className="topbar-right">
            <span className="demo-label">DEMO MODE</span>
            <div className="avatar small">AD</div>
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>
    </div>
  )
}
