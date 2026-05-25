import { queryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/posts/post'

/** Raw shape of a `get_posts` result row as returned by PostgREST (ADR-0004:
 * the listing reads through the `get_posts` RPC, not a direct table query). */
type PostRow = {
  id: number
  author_id: number
  author_username: string | null
  author_display_name: string | null
  author_profile_image_url: string | null
  title: string
  content: string
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE'
  created_at: string
  modified_at: string
  score: number | null
  total_count: number
}

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

/** Reads Posts newest-first via the `get_posts` RPC. Authorization (which Posts
 * are visible) is enforced by RLS inside the function (ADR-0004). The only place
 * a Post listing query is constructed. */
export async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await supabase.rpc('get_posts', {
    p_keyword: null,
    p_author_id: null,
    p_sort: 'CREATED_AT_DESC',
    p_limit: 20,
    p_offset: 0,
  })

  if (error) throw error
  return (data as PostRow[]).map(toPost)
}

export const postsQueryOptions = queryOptions({
  queryKey: ['posts'],
  queryFn: fetchPosts,
})
