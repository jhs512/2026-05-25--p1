import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileForm } from '@/members/ProfileForm'

const initial = { username: 'user1_ab', displayName: 'user1', profileImageUrl: '' }

describe('ProfileForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('prefills the current profile', () => {
    render(<ProfileForm initial={initial} onSubmit={vi.fn()} />)
    expect(screen.getByLabelText('username')).toHaveValue('user1_ab')
    expect(screen.getByLabelText('표시이름')).toHaveValue('user1')
  })

  it('submits edited profile values', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ProfileForm initial={initial} onSubmit={onSubmit} />)

    const displayName = screen.getByLabelText('표시이름')
    await userEvent.clear(displayName)
    await userEvent.type(displayName, '유저원')
    await userEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        username: 'user1_ab',
        displayName: '유저원',
        profileImageUrl: '',
      }),
    )
    expect(await screen.findByText('저장되었습니다.')).toBeInTheDocument()
  })

  it('does not submit when username is cleared', async () => {
    const onSubmit = vi.fn()
    render(<ProfileForm initial={initial} onSubmit={onSubmit} />)

    await userEvent.clear(screen.getByLabelText('username'))
    await userEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => expect(screen.getByRole('button', { name: '저장' })).toBeEnabled())
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
