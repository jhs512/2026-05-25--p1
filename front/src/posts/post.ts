/** A Post is a unit of user-authored textual content shown in the public
 * listing (see CONTEXT.md). DB snake_case columns are mapped to this
 * camelCase domain shape in the data-access module. */
export type Post = {
  id: number
  title: string
  content: string | null
  createdAt: string
  modifiedAt: string
}
