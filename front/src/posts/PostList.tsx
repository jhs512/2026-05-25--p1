import { Link } from '@tanstack/react-router'
import type { Post } from '@/posts/post'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/** Presentational list of Posts rendered as shadcn Cards. Each card is a single
 * anchor to the Post's detail route, so the whole card is clickable and behaves
 * like a real link (open-in-new-tab, copy address, screen-reader "link", SEO). */
export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            to="/posts/$id"
            params={{ id: String(post.id) }}
            className="block rounded-xl transition-colors hover:bg-accent/40"
          >
            <Card>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <p className="text-muted-foreground text-sm">
                  {post.author.displayName}
                  <span className="ml-1 opacity-70">@{post.author.username}</span>
                </p>
              </CardHeader>
              <CardContent className="text-muted-foreground whitespace-pre-line">
                {post.content}
              </CardContent>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  )
}
