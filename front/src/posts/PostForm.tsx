import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { VISIBILITY_LABELS, type PostVisibility } from '@/posts/post'
import type { PostInput } from '@/posts/posts-data'

export const postSchema = z.object({
  title: z.string().trim().min(1, '제목은 필수입니다.').max(200, '제목은 200자를 넘을 수 없습니다.'),
  content: z.string().trim().min(1, '내용은 필수입니다.'),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']),
})

function firstError(errors: unknown[]): string | null {
  if (errors.length === 0) return null
  const e = errors[0]
  if (typeof e === 'string') return e
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return String(e)
}

/** Shared create/edit form for a Post. `initial` prefills it for edit mode. */
export function PostForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: PostInput
  submitLabel: string
  onSubmit: (value: PostInput) => Promise<void>
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: initial ?? { title: '', content: '', visibility: 'PUBLIC' as PostVisibility },
    validators: { onChange: postSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        await onSubmit(value)
      } catch {
        setSubmitError('저장에 실패했습니다.')
      }
    },
  })

  return (
    <form
      className="mx-auto flex max-w-2xl flex-col gap-3 p-6"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field name="title">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="post-title">제목</label>
            <input
              id="post-title"
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

      <form.Field name="content">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="post-content">내용</label>
            <textarea
              id="post-content"
              rows={10}
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

      <form.Field name="visibility">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="post-visibility">공개 범위</label>
            <select
              id="post-visibility"
              className="rounded border p-2"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value as PostVisibility)}
              onBlur={field.handleBlur}
            >
              {(Object.keys(VISIBILITY_LABELS) as PostVisibility[]).map((v) => (
                <option key={v} value={v}>
                  {VISIBILITY_LABELS[v]}
                </option>
              ))}
            </select>
          </div>
        )}
      </form.Field>

      {submitError && <p role="alert" className="text-sm text-red-600">{submitError}</p>}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <button type="submit" disabled={isSubmitting} className="rounded bg-slate-900 p-2 text-white">
            {isSubmitting ? '저장 중…' : submitLabel}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
