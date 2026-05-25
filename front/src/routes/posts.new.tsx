import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { requireSession } from '@/auth/guards'
import { PostForm } from '@/posts/PostForm'
import { createPost } from '@/posts/posts-data'

export const Route = createFileRoute('/posts/new')({
  beforeLoad: ({ context, location }) => requireSession(context.auth, location.href),
  component: NewPostRoute,
})

function NewPostRoute() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return (
    <PostForm
      submitLabel="게시"
      onSubmit={async (value) => {
        const id = await createPost(value)
        await queryClient.invalidateQueries({ queryKey: ['posts'] })
        await navigate({ to: '/posts/$id', params: { id: String(id) } })
      }}
    />
  )
}
