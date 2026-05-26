import { queryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/** The current Member's editable profile (read from the members table for fields
 * not carried in the JWT, e.g. profile_image_url). */
export type MyMember = {
  id: number
  username: string
  displayName: string
  profileImageUrl: string | null
}

type MemberRow = {
  id: number
  username: string
  display_name: string
  profile_image_url: string | null
}

/** Reads the current Member's own row (filtered by id so an ADMIN, whose RLS
 * exposes all members, still gets exactly their own). */
export async function fetchMyMember(memberId: number): Promise<MyMember | null> {
  const { data, error } = await supabase
    .from('members')
    .select('id, username, display_name, profile_image_url')
    .eq('id', memberId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const row = data as MemberRow
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    profileImageUrl: row.profile_image_url,
  }
}

export function myMemberQueryOptions(memberId: number) {
  return queryOptions({
    queryKey: ['my-member', memberId],
    queryFn: () => fetchMyMember(memberId),
  })
}

export type MemberProfileInput = {
  username: string
  displayName: string
  profileImageUrl: string | null
}

/** Updates the current Member's profile via modify_member RPC (self only,
 * ACTIVE only, roles/status/email immutable — enforced server-side). */
export async function modifyMember(input: MemberProfileInput): Promise<void> {
  const { error } = await supabase.rpc('modify_member', {
    p_username: input.username,
    p_display_name: input.displayName,
    // generated arg type is `string` (DEFAULT NULL); the function assigns it
    // straight to the column, so omitting it (undefined) clears the image just
    // like an explicit null would.
    p_profile_image_url: input.profileImageUrl ?? undefined,
  })
  if (error) throw error
}
