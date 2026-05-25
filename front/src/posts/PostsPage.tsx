import { useQuery } from '@tanstack/react-query'
import { postsQueryOptions } from '@/posts/posts-data'
import { PostList } from '@/posts/PostList'

/** The `/` listing, with explicit loading, error, empty, and data states. */
export function PostsPage() {
  const { data, isPending, isError } = useQuery(postsQueryOptions)

  if (isPending) {
    return <p role="status">게시글을 불러오는 중…</p>
  }

  if (isError) {
    return <p role="alert">게시글을 불러오지 못했습니다.</p>
  }

  if (data.length === 0) {
    return <p>아직 게시글이 없습니다.</p>
  }

  return <PostList posts={data} />
}
