import { queryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Post, PostVisibility } from '@/posts/post'

/** Common columns shared by get_posts and get_post rows (author-joined Post). */
type PostAuthorRow = {
  id: number
  author_id: number
  author_username: string | null
  author_display_name: string | null
  author_profile_image_url: string | null
  title: string
  content: string
  visibility: PostVisibility
  created_at: string
  modified_at: string
}

/** get_posts adds relevance score and the total row count for paging. */
type PostListRow = PostAuthorRow & {
  score: number | null
  total_count: number
}

function toPost(row: PostAuthorRow): Post {
  return {
    id: row.id,
    author: {
      id: row.author_id,
      username: row.author_username ?? '',
      displayName: row.author_display_name ?? '',
      profileImageUrl: row.author_profile_image_url,
    },
    title: row.title,
    content: row.content,
    visibility: row.visibility,
    createdAt: row.created_at,
    modifiedAt: row.modified_at,
  }
}

/** Reads Posts via the get_posts RPC; RLS inside the function decides which Posts
 * are visible (ADR-0004). The only place a Post listing query is constructed. */
export async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await supabase.rpc('get_posts', {
    p_keyword: null,
    p_author_id: null,
    p_sort: 'CREATED_AT_DESC',
    p_limit: 20,
    p_offset: 0,
  })

  if (error) throw error
  return (data as PostListRow[]).map(toPost)
}

export const postsQueryOptions = queryOptions({
  queryKey: ['posts'],
  queryFn: fetchPosts,
})

/** Reads a single Post via get_post (SECURITY DEFINER, ADR-0004): PUBLIC/UNLISTED
 * to anyone, PRIVATE only to its Author or an admin. Returns null when not
 * visible or missing. */
export async function fetchPost(id: number): Promise<Post | null> {
  const { data, error } = await supabase.rpc('get_post', { p_post_id: id })
  if (error) throw error
  const rows = (data ?? []) as PostAuthorRow[]
  return rows.length > 0 ? toPost(rows[0]) : null
}

export function postQueryOptions(id: number) {
  return queryOptions({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
  })
}

export type PostInput = {
  title: string
  content: string
  visibility: PostVisibility
}

/** Creates a Post via create_post RPC (logged-in ACTIVE Member; author = caller,
 * enforced server-side). Returns the new Post's id. */
export async function createPost(input: PostInput): Promise<number> {
  const { data, error } = await supabase.rpc('create_post', {
    p_title: input.title,
    p_content: input.content,
    p_visibility: input.visibility,
  })
  if (error) throw error
  return (data as { id: number }).id
}

/** Updates a Post via modify_post RPC (author or admin only, enforced server-side). */
export async function modifyPost(id: number, input: PostInput): Promise<void> {
  const { error } = await supabase.rpc('modify_post', {
    p_post_id: id,
    p_title: input.title,
    p_content: input.content,
    p_visibility: input.visibility,
  })
  if (error) throw error
}

/** Deletes a Post via delete_post RPC (author or admin only, enforced server-side). */
export async function deletePost(id: number): Promise<void> {
  const { error } = await supabase.rpc('delete_post', { p_post_id: id })
  if (error) throw error
}
