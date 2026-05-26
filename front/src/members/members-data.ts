import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/** Cache key for the current Member's editable profile. Defined once so the read
 * query and the write hook stay in lockstep. */
export const memberKeys = {
  mine: (memberId: number) => ['my-member', memberId] as const,
}

/** The current Member's editable profile (read from the members table for fields
 * not carried in the JWT, e.g. profile_image_url). */
export type MyMember = {
  id: number
  username: string
  displayName: string
  profileImageUrl: string | null
}

/** Reads the current Member's own row (filtered by id so an ADMIN, whose RLS
 * exposes all members, still gets exactly their own). The row is typed by the
 * generated Database schema (createClient<Database>), so no manual row type. */
export async function fetchMyMember(memberId: number): Promise<MyMember | null> {
  const { data, error } = await supabase
    .from('members')
    .select('id, username, display_name, profile_image_url')
    .eq('id', memberId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    profileImageUrl: data.profile_image_url,
  }
}

export function myMemberQueryOptions(memberId: number) {
  return queryOptions({
    queryKey: memberKeys.mine(memberId),
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

/** Update the current Member's profile, then refresh the cached profile. */
export function useUpdateMyMember(memberId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: MemberProfileInput) => modifyMember(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.mine(memberId) }),
  })
}
