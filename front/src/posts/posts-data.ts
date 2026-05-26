import { queryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import type { Post, PostVisibility } from '@/posts/post'

/** Author-joined Post row, taken straight from the generated DB types so a
 * get_posts/get_post column change surfaces here at compile time. get_posts rows
 * carry extra score/total_count fields, which toPost simply ignores. */
type PostRow = Database['public']['Functions']['get_post']['Returns'][number]

function toPost(row: PostRow): Post {
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

export type PostSort =
  | 'RELEVANCE'
  | 'CREATED_AT_DESC'
  | 'CREATED_AT_ASC'
  | 'MODIFIED_AT_DESC'
  | 'MODIFIED_AT_ASC'

export type PostsQuery = {
  keyword?: string | null
  authorId?: number | null
  sort?: PostSort
  limit?: number
  offset?: number
}

/** Reads Posts via the get_posts RPC; RLS inside the function decides which Posts
 * are visible (ADR-0004). The only place a Post listing query is constructed. */
export async function fetchPosts(query: PostsQuery = {}): Promise<Post[]> {
  const { data, error } = await supabase.rpc('get_posts', {
    p_keyword: query.keyword ?? undefined,
    p_author_id: query.authorId ?? undefined,
    p_sort: query.sort ?? 'CREATED_AT_DESC',
    p_limit: query.limit ?? 20,
    p_offset: query.offset ?? 0,
  })

  if (error) throw error
  return (data ?? []).map(toPost)
}

export const postsQueryOptions = queryOptions({
  queryKey: ['posts'],
  queryFn: () => fetchPosts(),
})

/** The `/` listing query, keyed by keyword + sort so search/sort state is
 * reflected in the cache and the URL (the route owns the params). */
export function searchPostsQueryOptions(query: { keyword?: string | null; sort?: PostSort }) {
  const keyword = query.keyword ?? null
  const sort = query.sort ?? 'CREATED_AT_DESC'
  return queryOptions({
    queryKey: ['posts', 'search', keyword, sort],
    queryFn: () => fetchPosts({ keyword, sort }),
  })
}

/** The current Member's own Posts (all visibilities, since RLS lets the author
 * see their own UNLISTED/PRIVATE). */
export function myPostsQueryOptions(authorId: number) {
  return queryOptions({
    queryKey: ['posts', 'author', authorId],
    queryFn: () => fetchPosts({ authorId }),
  })
}

/** Reads a single Post via get_post (SECURITY DEFINER, ADR-0004): PUBLIC/UNLISTED
 * to anyone, PRIVATE only to its Author or an admin. Returns null when not
 * visible or missing. */
export async function fetchPost(id: number): Promise<Post | null> {
  const { data, error } = await supabase.rpc('get_post', { p_post_id: id })
  if (error) throw error
  const rows = data ?? []
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
  return data.id
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
