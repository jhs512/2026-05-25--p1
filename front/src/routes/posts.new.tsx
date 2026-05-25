import { createFileRoute } from '@tanstack/react-router'
import { requireSession } from '@/auth/guards'

// Implemented in FS04.
export const Route = createFileRoute('/posts/new')({
  beforeLoad: ({ context, location }) => requireSession(context.auth, location.href),
  component: () => <div className="p-6">글쓰기 (준비중)</div>,
})
