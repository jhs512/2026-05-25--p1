import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { signUp } from '@/auth/session'

// eslint-disable-next-line react-refresh/only-export-components -- schema co-located with its form
export const signupSchema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
  displayName: z.string().trim().min(1, '표시이름은 필수입니다.').max(50, '표시이름은 50자를 넘을 수 없습니다.'),
})

function firstError(errors: unknown[]): string | null {
  if (errors.length === 0) return null
  const e = errors[0]
  if (typeof e === 'string') return e
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return String(e)
}

export function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { email: '', password: '', displayName: '' },
    validators: { onChange: signupSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        await signUp(value.email, value.password, value.displayName.trim())
        onSuccess()
      } catch {
        setSubmitError('가입에 실패했습니다. 이미 가입된 이메일일 수 있습니다.')
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
      <h1 className="text-xl font-semibold">회원가입</h1>

      <form.Field name="email">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="signup-email">이메일</label>
            <input
              id="signup-email"
              type="email"
              className="rounded border p-2"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {firstError(field.state.meta.errors) && (
              <span role="alert" className="text-sm text-red-600">{firstError(field.state.meta.errors)}</span>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="signup-password">비밀번호</label>
            <input
              id="signup-password"
              type="password"
              className="rounded border p-2"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {firstError(field.state.meta.errors) && (
              <span role="alert" className="text-sm text-red-600">{firstError(field.state.meta.errors)}</span>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="displayName">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="signup-display-name">표시이름</label>
            <input
              id="signup-display-name"
              type="text"
              className="rounded border p-2"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {firstError(field.state.meta.errors) && (
              <span role="alert" className="text-sm text-red-600">{firstError(field.state.meta.errors)}</span>
            )}
          </div>
        )}
      </form.Field>

      {submitError && <p role="alert" className="text-sm text-red-600">{submitError}</p>}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <button type="submit" disabled={isSubmitting} className="rounded bg-slate-900 p-2 text-white">
            {isSubmitting ? '가입 중…' : '회원가입'}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
