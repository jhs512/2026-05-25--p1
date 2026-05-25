import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { CurrentMember } from '@/auth/member'
import { getCurrentSession, onAuthChange, memberFromSession } from '@/auth/session'

export type AuthState = {
  /** The current Member, or null when signed out. */
  member: CurrentMember | null
  /** True until the initial session lookup resolves; routes wait on this so
   * protected-route guards don't fire before the session is known. */
  isLoading: boolean
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<CurrentMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    getCurrentSession().then((session) => {
      if (!active) return
      setMember(memberFromSession(session))
      setIsLoading(false)
    })
    const unsubscribe = onAuthChange((session) => {
      setMember(memberFromSession(session))
      setIsLoading(false)
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ member, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
