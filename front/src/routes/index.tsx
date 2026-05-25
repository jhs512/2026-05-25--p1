import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PostsPage } from '@/posts/PostsPage'
import type { PostSort } from '@/posts/posts-data'

const SORTS: PostSort[] = [
  'RELEVANCE',
  'CREATED_AT_DESC',
  'CREATED_AT_ASC',
  'MODIFIED_AT_DESC',
  'MODIFIED_AT_ASC',
]

type IndexSearch = { q?: string; sort?: PostSort }

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): IndexSearch => ({
    q: typeof search.q === 'string' && search.q !== '' ? search.q : undefined,
    sort: SORTS.includes(search.sort as PostSort) ? (search.sort as PostSort) : undefined,
  }),
  component: IndexRoute,
})

function IndexRoute() {
  const { q, sort } = Route.useSearch()
  const navigate = useNavigate()
  return (
    <PostsPage
      keyword={q ?? ''}
      sort={sort ?? 'CREATED_AT_DESC'}
      onSearch={({ keyword, sort }) =>
        void navigate({
          to: '/',
          search: {
            q: keyword.trim() === '' ? undefined : keyword.trim(),
            sort: sort === 'CREATED_AT_DESC' ? undefined : sort,
          },
        })
      }
    />
  )
}
