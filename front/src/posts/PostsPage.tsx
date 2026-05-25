import { useQuery } from '@tanstack/react-query'
import { searchPostsQueryOptions, type PostSort } from '@/posts/posts-data'
import { PostList } from '@/posts/PostList'
import { SearchBar, type SearchState } from '@/posts/SearchBar'

/** The `/` listing: search/sort bar over the visible Posts. Keyword and sort are
 * owned by the route (URL); this component receives them and reports changes. */
export function PostsPage({
  keyword,
  sort,
  onSearch,
}: {
  keyword: string
  sort: PostSort
  onSearch: (state: SearchState) => void
}) {
  const { data, isPending, isError } = useQuery(searchPostsQueryOptions({ keyword, sort }))

  return (
    <div>
      <SearchBar keyword={keyword} sort={sort} onSearch={onSearch} />
      {isPending ? (
        <p role="status" className="p-6">게시글을 불러오는 중…</p>
      ) : isError ? (
        <p role="alert" className="p-6">게시글을 불러오지 못했습니다.</p>
      ) : data.length === 0 ? (
        <p className="p-6">{keyword ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}</p>
      ) : (
        <PostList posts={data} />
      )}
    </div>
  )
}
