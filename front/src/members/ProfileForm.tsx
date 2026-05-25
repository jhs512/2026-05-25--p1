import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

export const profileSchema = z.object({
  username: z.string().trim().min(1, 'username은 필수입니다.').max(50, 'username은 50자를 넘을 수 없습니다.'),
  displayName: z.string().trim().min(1, '표시이름은 필수입니다.').max(50, '표시이름은 50자를 넘을 수 없습니다.'),
  profileImageUrl: z.string(),
})

export type ProfileFormValue = z.infer<typeof profileSchema>

function firstError(errors: unknown[]): string | null {
  if (errors.length === 0) return null
  const e = errors[0]
  if (typeof e === 'string') return e
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return String(e)
}

export function ProfileForm({
  initial,
  onSubmit,
}: {
  initial: ProfileFormValue
  onSubmit: (value: ProfileFormValue) => Promise<void>
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const form = useForm({
    defaultValues: initial,
    validators: { onChange: profileSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      setSaved(false)
      try {
        await onSubmit(value)
        setSaved(true)
      } catch {
        setSubmitError('저장에 실패했습니다. username이 이미 사용 중일 수 있습니다.')
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
      <h1 className="text-xl font-semibold">내정보</h1>

      <form.Field name="username">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-username">username</label>
            <input
              id="profile-username"
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

      <form.Field name="displayName">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-display-name">표시이름</label>
            <input
              id="profile-display-name"
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

      <form.Field name="profileImageUrl">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-image-url">프로필 이미지 URL</label>
            <input
              id="profile-image-url"
              type="text"
              className="rounded border p-2"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      </form.Field>

      {submitError && <p role="alert" className="text-sm text-red-600">{submitError}</p>}
      {saved && <p className="text-sm text-green-600">저장되었습니다.</p>}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <button type="submit" disabled={isSubmitting} className="rounded bg-slate-900 p-2 text-white">
            {isSubmitting ? '저장 중…' : '저장'}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
