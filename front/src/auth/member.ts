import type { Session } from '@supabase/supabase-js'

/** The current Member, derived from the JWT app_metadata claims carried in the
 * session — no DB round-trip (ADR-0003). Identity and authorization for the UI
 * come from here. */
export type CurrentMember = {
  memberId: number
  username: string
  displayName: string
  roles: string[]
  status: 'ACTIVE' | 'BLOCKED'
}

/** Maps a Supabase session to the CurrentMember by reading app_metadata claims.
 * Returns null when there is no session or the claims lack a member_id (e.g. a
 * token minted before the Member was provisioned). Pure — no supabase import. */
export function memberFromSession(session: Session | null): CurrentMember | null {
  if (!session) return null
  const meta = (session.user.app_metadata ?? {}) as Record<string, unknown>
  const memberId = meta.member_id
  if (typeof memberId !== 'number') return null
  return {
    memberId,
    username: typeof meta.username === 'string' ? meta.username : '',
    displayName: typeof meta.display_name === 'string' ? meta.display_name : '',
    roles: Array.isArray(meta.roles) ? (meta.roles as string[]) : [],
    status: meta.status === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE',
  }
}

export function isAdmin(member: CurrentMember | null): boolean {
  return member !== null && member.roles.includes('ADMIN')
}

/** Whether `member` may edit/delete the Post authored by `authorId`. Mirrors the
 * server rule (author or ADMIN); the UI uses it only to show/hide controls — the
 * real boundary is the modify_post/delete_post RPC. */
export function canManagePost(member: CurrentMember | null, authorId: number): boolean {
  if (!member) return false
  return member.memberId === authorId || isAdmin(member)
}
