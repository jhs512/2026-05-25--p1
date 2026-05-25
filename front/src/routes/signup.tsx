import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { redirectIfAuthed } from '@/auth/guards'
import { SignupForm } from '@/auth/SignupForm'

export const Route = createFileRoute('/signup')({
  beforeLoad: ({ context }) => redirectIfAuthed(context.auth),
  component: SignupRoute,
})

function SignupRoute() {
  const navigate = useNavigate()
  return <SignupForm onSuccess={() => void navigate({ to: '/' })} />
}
