import type { Post } from '@/posts/post'

/** Presentational Post detail. Edit/Delete are callbacks (not Links) so this
 * renders without a router — the route wires navigation/deletion. */
export function PostDetail({
  post,
  canManage,
  onEdit,
  onDelete,
}: {
  post: Post
  canManage: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {post.author.displayName}
        <span className="ml-1 opacity-70">@{post.author.username}</span>
        <span className="mx-1">·</span>
        <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString('ko-KR')}</time>
      </p>
      <div className="mt-4 whitespace-pre-line">{post.content}</div>
      {canManage && (
        <div className="mt-6 flex gap-3 text-sm">
          <button type="button" onClick={onEdit} className="underline">
            수정
          </button>
          <button type="button" onClick={onDelete} className="text-red-600 underline">
            삭제
          </button>
        </div>
      )}
    </article>
  )
}
