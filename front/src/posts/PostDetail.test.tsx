import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Post } from '@/posts/post'
import { PostDetail } from '@/posts/PostDetail'

const post: Post = {
  id: 1,
  author: { id: 5, username: 'user1_ab', displayName: 'user1', profileImageUrl: null },
  title: '제목',
  content: '본문 내용',
  visibility: 'PUBLIC',
  createdAt: '2026-05-25T00:00:00Z',
  modifiedAt: '2026-05-25T00:00:00Z',
}

describe('PostDetail', () => {
  it('renders title, content and author', () => {
    render(<PostDetail post={post} canManage={false} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('heading', { name: '제목' })).toBeInTheDocument()
    expect(screen.getByText('본문 내용')).toBeInTheDocument()
    expect(screen.getByText('user1')).toBeInTheDocument()
    expect(screen.getByText('@user1_ab')).toBeInTheDocument()
  })

  it('hides edit/delete when the viewer cannot manage the post', () => {
    render(<PostDetail post={post} canManage={false} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument()
  })

  it('shows edit/delete and fires callbacks when the viewer can manage', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(<PostDetail post={post} canManage onEdit={onEdit} onDelete={onDelete} />)

    await userEvent.click(screen.getByRole('button', { name: '수정' }))
    expect(onEdit).toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: '삭제' }))
    expect(onDelete).toHaveBeenCalled()
  })
})
