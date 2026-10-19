import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/shared/api/supabase'

interface AuthContextValue {
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setLoading(false)
      },
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// useSession is co-located with AuthProvider to share the private AuthContext.
// eslint-disable-next-line react-refresh/only-export-components
export function useSession(): AuthContextValue {
  return useContext(AuthContext)
}
