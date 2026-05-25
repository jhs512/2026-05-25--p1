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

export type Post = {
  id: number
  author: PostAuthor
  title: string
  content: string
  visibility: PostVisibility
  createdAt: string
  modifiedAt: string
}
