import { useState } from 'react'
import type { PostSort } from '@/posts/posts-data'

const SORT_LABELS: Record<PostSort, string> = {
  RELEVANCE: '관련도순',
  CREATED_AT_DESC: '최신순',
  CREATED_AT_ASC: '오래된순',
  MODIFIED_AT_DESC: '수정 최신순',
  MODIFIED_AT_ASC: '수정 오래된순',
}

export type SearchState = { keyword: string; sort: PostSort }

/** Search box + sort selector. Commits keyword on submit and sort on change. */
export function SearchBar({
  keyword,
  sort,
  onSearch,
}: {
  keyword: string
  sort: PostSort
  onSearch: (state: SearchState) => void
}) {
  const [text, setText] = useState(keyword)

  return (
    <form
      className="mx-auto flex max-w-2xl gap-2 p-6 pb-0"
      onSubmit={(e) => {
        e.preventDefault()
        onSearch({ keyword: text, sort })
      }}
    >
      <input
        aria-label="검색어"
        type="search"
        placeholder="제목·본문 검색"
        className="flex-1 rounded border p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <select
        aria-label="정렬"
        className="rounded border p-2"
        value={sort}
        onChange={(e) => onSearch({ keyword: text, sort: e.target.value as PostSort })}
      >
        {(Object.keys(SORT_LABELS) as PostSort[]).map((s) => (
          <option key={s} value={s}>
            {SORT_LABELS[s]}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded bg-slate-900 px-4 text-white">
        검색
      </button>
    </form>
  )
}
