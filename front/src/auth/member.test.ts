import { describe, it, expect } from 'vitest'
import type { Session } from '@supabase/supabase-js'
import { memberFromSession, isAdmin, canManagePost } from '@/auth/member'

function sessionWith(appMetadata: Record<string, unknown>): Session {
  // Only the fields memberFromSession reads matter; cast the rest.
  return { user: { app_metadata: appMetadata } } as unknown as Session
}

describe('memberFromSession', () => {
  it('returns null when there is no session', () => {
    expect(memberFromSession(null)).toBeNull()
  })

  it('returns null when claims lack a member_id', () => {
    expect(memberFromSession(sessionWith({ roles: ['MEMBER'] }))).toBeNull()
  })

  it('maps app_metadata claims to a CurrentMember', () => {
    const member = memberFromSession(
      sessionWith({
        member_id: 7,
        username: 'user1_ab12',
        display_name: 'user1',
        roles: ['MEMBER'],
        status: 'ACTIVE',
      }),
    )
    expect(member).toEqual({
      memberId: 7,
      username: 'user1_ab12',
      displayName: 'user1',
      roles: ['MEMBER'],
      status: 'ACTIVE',
    })
  })

  it('reads BLOCKED status', () => {
    const member = memberFromSession(sessionWith({ member_id: 1, status: 'BLOCKED' }))
    expect(member?.status).toBe('BLOCKED')
  })
})

describe('isAdmin', () => {
  it('is false for null and non-admin', () => {
    expect(isAdmin(null)).toBe(false)
    expect(isAdmin({ memberId: 1, username: 'u', displayName: 'u', roles: ['MEMBER'], status: 'ACTIVE' })).toBe(false)
  })
  it('is true when roles include ADMIN', () => {
    expect(isAdmin({ memberId: 1, username: 'a', displayName: 'a', roles: ['ADMIN', 'MEMBER'], status: 'ACTIVE' })).toBe(true)
  })
})

describe('canManagePost', () => {
  const author = { memberId: 5, username: 'u', displayName: 'u', roles: ['MEMBER'], status: 'ACTIVE' as const }
  it('is false for anonymous', () => {
    expect(canManagePost(null, 5)).toBe(false)
  })
  it('is true for the author', () => {
    expect(canManagePost(author, 5)).toBe(true)
  })
  it('is false for a different member', () => {
    expect(canManagePost(author, 99)).toBe(false)
  })
  it('is true for an admin on any post', () => {
    const admin = { ...author, roles: ['ADMIN', 'MEMBER'] }
    expect(canManagePost(admin, 99)).toBe(true)
  })
})
