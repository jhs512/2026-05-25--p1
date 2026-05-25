import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Post } from '@/posts/post'

// Mock our own seam, never supabase-js (ADR-0002). The factory creates the
// fetchPosts mock and wires postsQueryOptions to it, so the real data-access
// module (and its supabase client import) is never loaded.
vi.mock('@/posts/posts-data', () => {
  const fetchPosts = vi.fn()
  return {
    fetchPosts,
    postsQueryOptions: { queryKey: ['posts'], queryFn: fetchPosts },
  }
})

import { fetchPosts } from '@/posts/posts-data'
import { PostsPage } from '@/posts/PostsPage'

function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const samplePosts: Post[] = [
  {
    id: 2,
    title: '최신 글',
    content: '가장 최근 본문',
    createdAt: '2026-05-25T00:00:00Z',
    modifiedAt: '2026-05-25T00:00:00Z',
  },
  {
    id: 1,
    title: '오래된 글',
    content: '예전 본문',
    createdAt: '2026-05-20T00:00:00Z',
    modifiedAt: '2026-05-20T00:00:00Z',
  },
]

describe('PostsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a loading state while Posts are being fetched', () => {
    // A promise that never resolves keeps the query pending.
    vi.mocked(fetchPosts).mockReturnValue(new Promise<Post[]>(() => {}))

    renderWithQuery(<PostsPage />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows an empty state when there are no Posts', async () => {
    vi.mocked(fetchPosts).mockResolvedValue([])

    renderWithQuery(<PostsPage />)

    expect(await screen.findByText('아직 게시글이 없습니다.')).toBeInTheDocument()
  })

  it('shows an error state when fetching Posts fails', async () => {
    vi.mocked(fetchPosts).mockRejectedValue(new Error('boom'))

    renderWithQuery(<PostsPage />)

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('renders each Post title and body once posts load', async () => {
    vi.mocked(fetchPosts).mockResolvedValue(samplePosts)

    renderWithQuery(<PostsPage />)

    expect(await screen.findByText('최신 글')).toBeInTheDocument()
    expect(screen.getByText('오래된 글')).toBeInTheDocument()
    expect(screen.getByText('가장 최근 본문')).toBeInTheDocument()
    expect(screen.getByText('예전 본문')).toBeInTheDocument()
  })
})
