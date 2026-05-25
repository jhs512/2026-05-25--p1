import { createFileRoute } from '@tanstack/react-router'
import { PostsPage } from '@/posts/PostsPage'

export const Route = createFileRoute('/')({
  component: PostsPage,
})
