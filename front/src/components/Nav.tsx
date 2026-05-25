import { Link } from '@tanstack/react-router'
import type { CurrentMember } from '@/auth/member'

/** Session-reactive top navigation (presentational). Renders the signed-in menu
 * when a Member is present, otherwise the signed-out menu. */
export function Nav({
  member,
  onLogout,
}: {
  member: CurrentMember | null
  onLogout: () => void
}) {
  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-2xl items-center gap-4 p-4 text-sm">
        <Link to="/" className="font-semibold">
          게시판
        </Link>
        <div className="ml-auto flex items-center gap-3">
          {member ? (
            <>
              <Link to="/posts/new">글쓰기</Link>
              <Link to="/me/posts">내글</Link>
              <Link to="/me">내정보</Link>
              <span className="text-muted-foreground">{member.displayName}</span>
              <button type="button" onClick={onLogout} className="underline">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login">로그인</Link>
              <Link to="/signup">회원가입</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
