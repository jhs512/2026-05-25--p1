import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { requireSession } from '@/auth/guards'
import { PostForm } from '@/posts/PostForm'
import { useCreatePost } from '@/posts/posts-data'

export const Route = createFileRoute('/posts/new')({
  beforeLoad: ({ context, location }) => requireSession(context.auth, location.href),
  component: NewPostRoute,
})

function NewPostRoute() {
  const navigate = useNavigate()
  const createPost = useCreatePost()
  return (
    <PostForm
      submitLabel="게시"
      onSubmit={async (value) => {
        const id = await createPost.mutateAsync(value)
        await navigate({ to: '/posts/$id', params: { id: String(id) } })
      }}
    />
  )
}
