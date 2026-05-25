import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type { CurrentMember } from '@/auth/member'
export { memberFromSession, isAdmin, canManagePost } from '@/auth/member'

/** The auth seam the app owns (ADR-0002: mock here, never supabase-js). Thin
 * wrappers over supabase.auth that throw on error so callers handle one shape. */

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

/** Subscribe to session changes; returns an unsubscribe function. */
export function onAuthChange(cb: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session))
  return () => data.subscription.unsubscribe()
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<void> {
  // displayName flows into raw_user_meta_data.name; handle_new_user uses it as
  // the Member's display_name. username is auto-generated server-side.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: displayName } },
  })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
