import { redirect } from '@tanstack/react-router'
import type { AuthState } from '@/auth/AuthProvider'

/** Router context carried through beforeLoad (ADR-0006). */
export type RouterContext = {
  auth: AuthState
}

/** beforeLoad guard for protected routes: redirect to /login (remembering where
 * the user was headed) when there is no Member. */
export function requireSession(auth: AuthState, redirectTo: string): void {
  if (!auth.member) {
    throw redirect({ to: '/login', search: { redirect: redirectTo } })
  }
}

/** beforeLoad guard for /login and /signup: bounce to / when already signed in. */
export function redirectIfAuthed(auth: AuthState): void {
  if (auth.member) {
    throw redirect({ to: '/' })
  }
}
