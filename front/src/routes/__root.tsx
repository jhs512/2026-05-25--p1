import { createRootRouteWithContext, Outlet, useNavigate } from '@tanstack/react-router'
import type { RouterContext } from '@/auth/guards'
import { useAuth } from '@/auth/AuthProvider'
import { signOut } from '@/auth/session'
import { Nav } from '@/components/Nav'

function RootLayout() {
  const { member } = useAuth()
  const navigate = useNavigate()
  return (
    <>
      <Nav
        member={member}
        onLogout={async () => {
          await signOut()
          await navigate({ to: '/' })
        }}
      />
      <Outlet />
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})
