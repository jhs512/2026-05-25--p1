import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { requireSession } from '@/auth/guards'
import { useAuth } from '@/auth/AuthProvider'
import { myPostsQueryOptions } from '@/posts/posts-data'
import { MyPostList } from '@/posts/MyPostList'

export const Route = createFileRoute('/me/posts')({
  beforeLoad: ({ context, location }) => requireSession(context.auth, location.href),
  component: MyPostsRoute,
})

function MyPostsRoute() {
  const { member } = useAuth()
  const navigate = useNavigate()
  const { data, isPending, isError } = useQuery(myPostsQueryOptions(member!.memberId))

  if (isPending) return <p role="status" className="p-6">불러오는 중…</p>
  if (isError) return <p role="alert" className="p-6">글을 불러오지 못했습니다.</p>
  if (data.length === 0) return <p className="p-6">아직 쓴 글이 없습니다.</p>

  return (
    <MyPostList
      posts={data}
      onOpen={(id) => void navigate({ to: '/posts/$id', params: { id: String(id) } })}
      onEdit={(id) => void navigate({ to: '/posts/$id/edit', params: { id: String(id) } })}
    />
  )
}
