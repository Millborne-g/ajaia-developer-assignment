import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/shared/api/supabase'
import { Spinner } from '@/shared/ui/Spinner'

/**
 * Handles the OAuth / magic-link callback from Supabase Auth.
 * Supabase reads the hash fragment and sets the session automatically
 * via onAuthStateChange; we just redirect to "/" once the session is ready.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/', { replace: true })
      }
    })

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/', { replace: true })
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted text-sm">
      <Spinner size="lg" label="Completing sign-in…" />
      <p>Completing sign-in…</p>
    </div>
  )
}
