/* eslint-disable react-refresh/only-export-components -- route module exports createBrowserRouter instance */
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
  useOutletContext,
} from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { EditorPage } from '@/pages/EditorPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { Spinner } from '@/shared/ui/Spinner'
import { useSession } from './providers'

interface ProtectedContext {
  session: Session
}

function ProtectedOutlet() {
  const { session, loading } = useSession()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <Outlet context={{ session } satisfies ProtectedContext} />
}

function DashboardRoute() {
  const { session } = useOutletContext<ProtectedContext>()
  return <DashboardPage session={session} />
}

function EditorRoute() {
  const { session } = useOutletContext<ProtectedContext>()
  return <EditorPage session={session} />
}

export const router = createBrowserRouter([
  { path: '/auth', element: <AuthPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  {
    element: <ProtectedOutlet />,
    children: [
      { index: true, element: <DashboardRoute /> },
      { path: 'documents/:id', element: <EditorRoute /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
