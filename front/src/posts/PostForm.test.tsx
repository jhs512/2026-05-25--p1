import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PostForm } from '@/posts/PostForm'

describe('PostForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('submits title, content and visibility', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<PostForm submitLabel="게시" onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('제목'), '새 글 제목')
    await userEvent.type(screen.getByLabelText('내용'), '본문입니다')
    await userEvent.selectOptions(screen.getByLabelText('공개 범위'), 'UNLISTED')
    await userEvent.click(screen.getByRole('button', { name: '게시' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: '새 글 제목',
        content: '본문입니다',
        visibility: 'UNLISTED',
      }),
    )
  })

  it('prefills from initial values in edit mode', () => {
    render(
      <PostForm
        submitLabel="수정"
        initial={{ title: '기존 제목', content: '기존 내용', visibility: 'PRIVATE' }}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('제목')).toHaveValue('기존 제목')
    expect(screen.getByLabelText('내용')).toHaveValue('기존 내용')
    expect(screen.getByLabelText('공개 범위')).toHaveValue('PRIVATE')
  })

  it('does not submit when the title is empty', async () => {
    const onSubmit = vi.fn()
    render(<PostForm submitLabel="게시" onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('내용'), '본문만 있음')
    await userEvent.click(screen.getByRole('button', { name: '게시' }))

    await waitFor(() => expect(screen.getByRole('button', { name: '게시' })).toBeEnabled())
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
