import type { Post } from '@/posts/post'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/** Presentational list of Posts rendered as shadcn Cards. */
export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      {posts.map((post) => (
        <li key={post.id}>
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
        </li>
      ))}
    </ul>
  )
}
