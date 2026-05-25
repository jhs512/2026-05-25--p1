import { createFileRoute } from '@tanstack/react-router'
import { redirectIfAuthed } from '@/auth/guards'

// Implemented in FS02.
export const Route = createFileRoute('/signup')({
  beforeLoad: ({ context }) => redirectIfAuthed(context.auth),
  component: () => <div className="p-6">회원가입 (준비중)</div>,
})
