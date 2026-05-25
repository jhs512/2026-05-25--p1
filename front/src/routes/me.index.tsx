import { createFileRoute } from '@tanstack/react-router'
import { requireSession } from '@/auth/guards'

// Implemented in FS06.
export const Route = createFileRoute('/me/')({
  beforeLoad: ({ context, location }) => requireSession(context.auth, location.href),
  component: () => <div className="p-6">내정보 (준비중)</div>,
})
