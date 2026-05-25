import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/auth/session', () => ({ signUp: vi.fn() }))
import { signUp } from '@/auth/session'
import { SignupForm } from '@/auth/SignupForm'

describe('SignupForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('signs up with email, password, display name and calls onSuccess', async () => {
    vi.mocked(signUp).mockResolvedValue(undefined)
    const onSuccess = vi.fn()
    render(<SignupForm onSuccess={onSuccess} />)

    await userEvent.type(screen.getByLabelText('이메일'), 'new@no-reply.com')
    await userEvent.type(screen.getByLabelText('비밀번호'), 'lldj123414')
    await userEvent.type(screen.getByLabelText('표시이름'), '새회원')
    await userEvent.click(screen.getByRole('button', { name: /회원가입/ }))

    await waitFor(() => expect(signUp).toHaveBeenCalledWith('new@no-reply.com', 'lldj123414', '새회원'))
    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows an error when sign-up fails', async () => {
    vi.mocked(signUp).mockRejectedValue(new Error('dup'))
    render(<SignupForm onSuccess={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('이메일'), 'dup@no-reply.com')
    await userEvent.type(screen.getByLabelText('비밀번호'), 'lldj123414')
    await userEvent.type(screen.getByLabelText('표시이름'), '중복')
    await userEvent.click(screen.getByRole('button', { name: /회원가입/ }))

    expect(await screen.findByText(/가입에 실패/)).toBeInTheDocument()
  })

  it('does not submit when display name is empty', async () => {
    render(<SignupForm onSuccess={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('이메일'), 'x@no-reply.com')
    await userEvent.type(screen.getByLabelText('비밀번호'), 'lldj123414')
    await userEvent.click(screen.getByRole('button', { name: /회원가입/ }))

    await waitFor(() => expect(screen.getByRole('button', { name: /회원가입/ })).toBeEnabled())
    expect(signUp).not.toHaveBeenCalled()
  })
})
