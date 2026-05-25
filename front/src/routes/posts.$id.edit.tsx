import { createFileRoute } from '@tanstack/react-router'
import { requireSession } from '@/auth/guards'

// Implemented in FS05.
export const Route = createFileRoute('/posts/$id/edit')({
  beforeLoad: ({ context, location }) => requireSession(context.auth, location.href),
  component: () => <div className="p-6">수정 (준비중)</div>,
})
