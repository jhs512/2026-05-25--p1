import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { AuthProvider, useAuth } from '@/auth/AuthProvider'
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import './index.css'

// Auth is injected as router context at render time (ADR-0006); the default
// here is a placeholder overridden by RouterProvider below.
const router = createRouter({
  routeTree,
  context: { auth: undefined! },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()

/** Waits for the initial session lookup, then drives the router with the live
 * auth context so beforeLoad guards see a resolved session. */
function InnerApp() {
  const auth = useAuth()
  if (auth.isLoading) return null
  return <RouterProvider router={router} context={{ auth }} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
