import { createFileRoute, useRouter } from '@tanstack/react-router'
import { redirectIfAuthed } from '@/auth/guards'
import { LoginForm } from '@/auth/LoginForm'

type LoginSearch = { redirect?: string }

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: ({ context }) => redirectIfAuthed(context.auth),
  component: LoginRoute,
})

function LoginRoute() {
  const router = useRouter()
  const { redirect } = Route.useSearch()
  return (
    <LoginForm
      onSuccess={() => {
        // redirect is an arbitrary path captured by the guard; use the history
        // API to avoid the typed-route constraint on navigate({ to }).
        router.history.push(redirect ?? '/')
      }}
    />
  )
}
