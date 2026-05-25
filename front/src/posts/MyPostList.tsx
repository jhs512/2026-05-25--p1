import { VISIBILITY_LABELS } from '@/posts/post'
import type { Post } from '@/posts/post'

/** The author's own Posts with a Visibility badge. View/Edit are callbacks so
 * this renders without a router; the route wires navigation. */
export function MyPostList({
  posts,
  onOpen,
  onEdit,
}: {
  posts: Post[]
  onOpen: (id: number) => void
  onEdit: (id: number) => void
}) {
  return (
    <ul className="mx-auto flex max-w-2xl flex-col gap-3 p-6">
      {posts.map((post) => (
        <li key={post.id} className="rounded border p-4">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onOpen(post.id)} className="font-semibold underline">
              {post.title}
            </button>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
              {VISIBILITY_LABELS[post.visibility]}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{post.content}</p>
          <button type="button" onClick={() => onEdit(post.id)} className="mt-2 text-sm underline">
            수정
          </button>
        </li>
      ))}
    </ul>
  )
}
