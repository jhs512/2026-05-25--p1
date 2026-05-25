import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { signIn } from '@/auth/session'

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
})

/** Renders the first validation issue's message, whatever its shape. */
function firstError(errors: unknown[]): string | null {
  if (errors.length === 0) return null
  const e = errors[0]
  if (typeof e === 'string') return e
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return String(e)
}

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onChange: loginSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        await signIn(value.email, value.password)
        onSuccess()
      } catch {
        setSubmitError('이메일 또는 비밀번호가 올바르지 않습니다.')
      }
    },
  })

  return (
    <form
      className="mx-auto flex max-w-sm flex-col gap-3 p-6"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <h1 className="text-xl font-semibold">로그인</h1>

      <form.Field name="email">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="login-email">이메일</label>
            <input
              id="login-email"
              type="email"
              className="rounded border p-2"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {firstError(field.state.meta.errors) && (
              <span role="alert" className="text-sm text-red-600">
                {firstError(field.state.meta.errors)}
              </span>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="login-password">비밀번호</label>
            <input
              id="login-password"
              type="password"
              className="rounded border p-2"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {firstError(field.state.meta.errors) && (
              <span role="alert" className="text-sm text-red-600">
                {firstError(field.state.meta.errors)}
              </span>
            )}
          </div>
        )}
      </form.Field>

      {submitError && (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      )}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <button type="submit" disabled={isSubmitting} className="rounded bg-slate-900 p-2 text-white">
            {isSubmitting ? '로그인 중…' : '로그인'}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
