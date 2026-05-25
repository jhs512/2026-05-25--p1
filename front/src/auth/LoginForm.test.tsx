import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock our auth seam, never supabase-js (ADR-0002).
vi.mock('@/auth/session', () => ({ signIn: vi.fn() }))
import { signIn } from '@/auth/session'
import { LoginForm } from '@/auth/LoginForm'

describe('LoginForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('signs in and calls onSuccess on a valid submit', async () => {
    vi.mocked(signIn).mockResolvedValue(undefined)
    const onSuccess = vi.fn()
    render(<LoginForm onSuccess={onSuccess} />)

    await userEvent.type(screen.getByLabelText('이메일'), 'user1@no-reply.com')
    await userEvent.type(screen.getByLabelText('비밀번호'), 'lldj123414')
    await userEvent.click(screen.getByRole('button', { name: /로그인/ }))

    await waitFor(() => expect(signIn).toHaveBeenCalledWith('user1@no-reply.com', 'lldj123414'))
    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows an error message when sign-in fails', async () => {
    vi.mocked(signIn).mockRejectedValue(new Error('invalid'))
    render(<LoginForm onSuccess={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('이메일'), 'user1@no-reply.com')
    await userEvent.type(screen.getByLabelText('비밀번호'), 'lldj123414')
    await userEvent.click(screen.getByRole('button', { name: /로그인/ }))

    expect(await screen.findByText(/올바르지 않습니다/)).toBeInTheDocument()
  })

  it('does not call signIn when the input is invalid', async () => {
    render(<LoginForm onSuccess={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('이메일'), 'notanemail')
    await userEvent.type(screen.getByLabelText('비밀번호'), '123')
    await userEvent.click(screen.getByRole('button', { name: /로그인/ }))

    await waitFor(() => expect(screen.getByRole('button', { name: /로그인/ })).toBeEnabled())
    expect(signIn).not.toHaveBeenCalled()
  })
})
