import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { requireSession } from '@/auth/guards'
import { useAuth } from '@/auth/AuthProvider'
import { canManagePost } from '@/auth/member'
import { PostForm } from '@/posts/PostForm'
import { postQueryOptions, modifyPost } from '@/posts/posts-data'

export const Route = createFileRoute('/posts/$id/edit')({
  beforeLoad: ({ context, location }) => requireSession(context.auth, location.href),
  component: EditPostRoute,
})

function EditPostRoute() {
  const { id } = Route.useParams()
  const postId = Number(id)
  const { member } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: post, isPending, isError } = useQuery(postQueryOptions(postId))

  if (isPending) return <p role="status" className="p-6">불러오는 중…</p>
  if (isError) return <p role="alert" className="p-6">게시글을 불러오지 못했습니다.</p>
  if (!post) return <p className="p-6">게시글이 없거나 접근 권한이 없습니다.</p>
  if (!canManagePost(member, post.author.id)) return <p className="p-6">수정 권한이 없습니다.</p>

  return (
    <PostForm
      submitLabel="수정"
      initial={{ title: post.title, content: post.content, visibility: post.visibility }}
      onSubmit={async (value) => {
        await modifyPost(postId, value)
        await queryClient.invalidateQueries({ queryKey: ['post', postId] })
        await queryClient.invalidateQueries({ queryKey: ['posts'] })
        await navigate({ to: '/posts/$id', params: { id } })
      }}
    />
  )
}
