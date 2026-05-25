import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Post } from '@/posts/post'
import { MyPostList } from '@/posts/MyPostList'

function post(id: number, title: string, visibility: Post['visibility']): Post {
  return {
    id,
    author: { id: 1, username: 'u', displayName: 'u', profileImageUrl: null },
    title,
    content: '본문',
    visibility,
    createdAt: '2026-05-25T00:00:00Z',
    modifiedAt: '2026-05-25T00:00:00Z',
  }
}

describe('MyPostList', () => {
  const posts = [post(1, '공개글', 'PUBLIC'), post(2, '링크글', 'UNLISTED'), post(3, '비공개글', 'PRIVATE')]

  it('shows each post with a visibility badge', () => {
    render(<MyPostList posts={posts} onOpen={vi.fn()} onEdit={vi.fn()} />)
    expect(screen.getByText('공개글')).toBeInTheDocument()
    expect(screen.getByText('공개')).toBeInTheDocument()
    expect(screen.getByText('링크 공개')).toBeInTheDocument()
    expect(screen.getByText('비공개')).toBeInTheDocument()
  })

  it('fires onOpen and onEdit with the post id', async () => {
    const onOpen = vi.fn()
    const onEdit = vi.fn()
    render(<MyPostList posts={[post(7, '내 글', 'PUBLIC')]} onOpen={onOpen} onEdit={onEdit} />)

    await userEvent.click(screen.getByRole('button', { name: '내 글' }))
    expect(onOpen).toHaveBeenCalledWith(7)

    await userEvent.click(screen.getByRole('button', { name: '수정' }))
    expect(onEdit).toHaveBeenCalledWith(7)
  })
})
