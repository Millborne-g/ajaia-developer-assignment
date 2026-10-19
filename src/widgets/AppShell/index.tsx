import { useState, useEffect, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { DocumentSidebar } from '@/widgets/DocumentSidebar'
import { MobileTopBar } from './MobileTopBar'
import { DocumentsProvider } from './DocumentsContext'
import { cn } from '@/shared/lib/cn'

interface AppShellProps {
  session: Session
  children: ReactNode
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem('sidebar_collapsed') === 'true'
  } catch {
    return false
  }
}

export function AppShell({ session, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed)

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  function openDrawer() {
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
  }

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('sidebar_collapsed', String(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  return (
    <DocumentsProvider userId={session.user.id}>
      <div className="h-dvh flex overflow-hidden bg-background p-2 sm:p-3 gap-3">
        {drawerOpen && (
          <div
            className="fixed inset-0 z-20 bg-foreground/30 md:hidden"
            aria-hidden="true"
            onClick={closeDrawer}
          />
        )}

        <aside
          className={cn(
            'flex flex-col shrink-0 rounded-2xl border border-border bg-surface shadow-card overflow-hidden h-full transition-[width] duration-200',
            collapsed ? 'md:w-16' : 'md:w-64',
            drawerOpen
              ? 'flex fixed left-2 top-2 bottom-2 z-30 w-72 md:static'
              : 'hidden md:flex',
          )}
        >
          <DocumentSidebar
            session={session}
            collapsed={collapsed}
            onCollapseToggle={toggleCollapsed}
            onClose={closeDrawer}
          />
        </aside>

        <div className="flex-1 flex flex-col rounded-2xl border border-border bg-surface shadow-card overflow-hidden h-full min-w-0">
          <MobileTopBar onMenuClick={openDrawer} />
          {children}
        </div>
      </div>
    </DocumentsProvider>
  )
}
