import { queryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/posts/post'

/** Raw shape of a `public.posts` row as returned by PostgREST. */
type PostRow = {
  id: number
  title: string
  content: string | null
  created_at: string
  modified_at: string
}

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    modifiedAt: row.modified_at,
  }
}

/** Reads all Posts newest-first. The only place a Post query is constructed. */
export async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, content, created_at, modified_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as PostRow[]).map(toPost)
}

export const postsQueryOptions = queryOptions({
  queryKey: ['posts'],
  queryFn: fetchPosts,
})
