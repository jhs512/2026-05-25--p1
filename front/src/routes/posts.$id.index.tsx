import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { postQueryOptions, useDeletePost } from '@/posts/posts-data'
import { useAuth } from '@/auth/AuthProvider'
import { canManagePost } from '@/auth/session'
import { PostDetail } from '@/posts/PostDetail'

export const Route = createFileRoute('/posts/$id/')({
  component: PostDetailRoute,
})

function PostDetailRoute() {
  const { id } = Route.useParams()
  const postId = Number(id)
  const { member } = useAuth()
  const navigate = useNavigate()

  const { data: post, isPending, isError } = useQuery(postQueryOptions(postId))

  // The hook owns cache invalidation; this route owns where to go afterward.
  const del = useDeletePost(postId)

  if (isPending) return <p role="status" className="p-6">불러오는 중…</p>
  if (isError) return <p role="alert" className="p-6">게시글을 불러오지 못했습니다.</p>
  if (!post) return <p className="p-6">게시글이 없거나 접근 권한이 없습니다.</p>

  return (
    <PostDetail
      post={post}
      canManage={canManagePost(member, post.author.id)}
      onEdit={() => void navigate({ to: '/posts/$id/edit', params: { id } })}
      onDelete={() => {
        if (window.confirm('이 글을 삭제할까요?')) {
          del.mutate(undefined, { onSuccess: () => void navigate({ to: '/' }) })
        }
      }}
    />
  )
}
