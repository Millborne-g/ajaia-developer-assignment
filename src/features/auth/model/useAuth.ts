import { useState } from 'react'
import { supabase } from '@/shared/api/supabase'

interface AuthState {
  loading: boolean
  error: string | null
}

export function useSignIn() {
  const [state, setState] = useState<AuthState>({ loading: false, error: null })

  async function signIn(email: string, password: string) {
    setState({ loading: true, error: null })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setState({ loading: false, error: error.message })
      return false
    }
    setState({ loading: false, error: null })
    return true
  }

  return { ...state, signIn }
}

export function useSignUp() {
  const [state, setState] = useState<AuthState>({ loading: false, error: null })

  async function signUp(
    email: string,
    password: string,
  ): Promise<{ ok: boolean; hasSession: boolean }> {
    setState({ loading: true, error: null })
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setState({ loading: false, error: error.message })
      return { ok: false, hasSession: false }
    }
    setState({ loading: false, error: null })
    return { ok: true, hasSession: data.session != null }
  }

  return { ...state, signUp }
}

export function useSignOut() {
  async function signOut() {
    await supabase.auth.signOut()
  }
  return { signOut }
}
