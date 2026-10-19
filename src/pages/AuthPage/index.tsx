import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/shared/api/supabase'
import { AuthForm } from '@/features/auth/ui/AuthForm'

export function AuthPage() {
  const navigate = useNavigate()

  // If user is already signed in, go to dashboard
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/')
    })
  }, [navigate])

  return <AuthForm />
}
