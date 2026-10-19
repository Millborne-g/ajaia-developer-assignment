import { supabase } from '@/shared/api/supabase'
import type { Profile } from './types'

export async function findProfileByEmail(
  email: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as Profile | null
}

export async function fetchProfilesByIds(ids: string[]): Promise<Profile[]> {
  if (ids.length === 0) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', ids)

  if (error) throw new Error(error.message)
  return (data ?? []) as Profile[]
}
