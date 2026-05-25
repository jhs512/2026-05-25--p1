/** A Post is a unit of Member-authored textual content shown in the listing
 * (see CONTEXT.md). DB snake_case columns are mapped to this camelCase domain
 * shape in the data-access module. */

/** The public profile of a Post's Author. */
export type PostAuthor = {
  id: number
  username: string
  displayName: string
  profileImageUrl: string | null
}

/** A Post's sharing level (CONTEXT.md). Not a draft/published lifecycle. */
export type PostVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE'

/** Korean labels for each Visibility, shown in selectors and badges. */
export const VISIBILITY_LABELS: Record<PostVisibility, string> = {
  PUBLIC: '공개',
  UNLISTED: '링크 공개',
  PRIVATE: '비공개',
}

export type Post = {
  id: number
  author: PostAuthor
  title: string
  content: string
  visibility: PostVisibility
  createdAt: string
  modifiedAt: string
}
