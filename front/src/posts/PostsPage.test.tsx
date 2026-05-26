import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactElement, ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Post } from '@/posts/post'

// Mock our own seam, never supabase-js (ADR-0002). searchPostsQueryOptions wires
// to the fetchPosts mock so the real data-access module is never loaded.
vi.mock('@/posts/posts-data', () => {
  const fetchPosts = vi.fn()
  return {
    fetchPosts,
    searchPostsQueryOptions: (q: { keyword?: string | null; sort?: string }) => ({
      queryKey: ['posts', 'search', q.keyword ?? null, q.sort ?? 'CREATED_AT_DESC'],
      queryFn: () => fetchPosts(q),
    }),
  }
})

// PostList renders a TanStack <Link>; this unit test has no Router context, so
// stub Link to a plain anchor with the resolved href. Real routing is covered by e2e.
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    params,
    className,
    children,
  }: {
    to: string
    params?: Record<string, string>
    className?: string
    children: ReactNode
  }) => (
    <a
      href={to.replace(/\$(\w+)/g, (_m, key) => params?.[key] ?? '')}
      className={className}
    >
      {children}
    </a>
  ),
}))

import { fetchPosts } from '@/posts/posts-data'
import { PostsPage } from '@/posts/PostsPage'

function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function renderPage(onSearch = vi.fn()) {
  return renderWithQuery(<PostsPage keyword="" sort="CREATED_AT_DESC" onSearch={onSearch} />)
}

const samplePosts: Post[] = [
  {
    id: 2,
    author: { id: 10, username: 'user1', displayName: '유저원', profileImageUrl: null },
    title: '최신 글',
    content: '가장 최근 본문',
    visibility: 'PUBLIC',
    createdAt: '2026-05-25T00:00:00Z',
    modifiedAt: '2026-05-25T00:00:00Z',
  },
  {
    id: 1,
    author: { id: 11, username: 'user2', displayName: '유저투', profileImageUrl: null },
    title: '오래된 글',
    content: '예전 본문',
    visibility: 'PUBLIC',
    createdAt: '2026-05-20T00:00:00Z',
    modifiedAt: '2026-05-20T00:00:00Z',
  },
]

describe('PostsPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows a loading state while Posts are being fetched', () => {
    vi.mocked(fetchPosts).mockReturnValue(new Promise<Post[]>(() => {}))
    renderPage()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows an empty state when there are no Posts', async () => {
    vi.mocked(fetchPosts).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText('아직 게시글이 없습니다.')).toBeInTheDocument()
  })

  it('shows an error state when fetching Posts fails', async () => {
    vi.mocked(fetchPosts).mockRejectedValue(new Error('boom'))
    renderPage()
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('renders each Post title, body and author once posts load', async () => {
    vi.mocked(fetchPosts).mockResolvedValue(samplePosts)
    renderPage()
    expect(await screen.findByText('최신 글')).toBeInTheDocument()
    expect(screen.getByText('오래된 글')).toBeInTheDocument()
    expect(screen.getByText('가장 최근 본문')).toBeInTheDocument()
    expect(screen.getByText('유저원')).toBeInTheDocument()
    expect(screen.getByText('유저투')).toBeInTheDocument()
  })

  it('links each Post to its detail route', async () => {
    vi.mocked(fetchPosts).mockResolvedValue(samplePosts)
    renderPage()

    const link = await screen.findByRole('link', { name: /최신 글/ })
    expect(link).toHaveAttribute('href', '/posts/2')
  })

  it('reports the keyword on search submit', async () => {
    vi.mocked(fetchPosts).mockResolvedValue([])
    const onSearch = vi.fn()
    renderPage(onSearch)

    await userEvent.type(screen.getByLabelText('검색어'), '한글')
    await userEvent.click(screen.getByRole('button', { name: '검색' }))

    expect(onSearch).toHaveBeenCalledWith({ keyword: '한글', sort: 'CREATED_AT_DESC' })
  })

  it('reports a sort change', async () => {
    vi.mocked(fetchPosts).mockResolvedValue([])
    const onSearch = vi.fn()
    renderPage(onSearch)

    await userEvent.selectOptions(screen.getByLabelText('정렬'), 'CREATED_AT_ASC')

    expect(onSearch).toHaveBeenCalledWith({ keyword: '', sort: 'CREATED_AT_ASC' })
  })
})
