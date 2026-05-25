import { createFileRoute } from '@tanstack/react-router'
import { requireSession } from '@/auth/guards'

// Implemented in FS07.
export const Route = createFileRoute('/me/posts')({
  beforeLoad: ({ context, location }) => requireSession(context.auth, location.href),
  component: () => <div className="p-6">내글 보기 (준비중)</div>,
})
