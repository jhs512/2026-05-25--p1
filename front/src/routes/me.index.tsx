import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { requireSession } from '@/auth/guards'
import { useAuth } from '@/auth/AuthProvider'
import { signOut } from '@/auth/session'
import { myMemberQueryOptions, modifyMember } from '@/members/members-data'
import { ProfileForm } from '@/members/ProfileForm'

export const Route = createFileRoute('/me/')({
  beforeLoad: ({ context, location }) => requireSession(context.auth, location.href),
  component: MeRoute,
})

function MeRoute() {
  const { member } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const memberId = member!.memberId

  const { data, isPending, isError } = useQuery(myMemberQueryOptions(memberId))

  if (isPending) return <p role="status" className="p-6">불러오는 중…</p>
  if (isError || !data) return <p role="alert" className="p-6">프로필을 불러오지 못했습니다.</p>

  return (
    <div>
      <ProfileForm
        initial={{
          username: data.username,
          displayName: data.displayName,
          profileImageUrl: data.profileImageUrl ?? '',
        }}
        onSubmit={async (value) => {
          await modifyMember({
            username: value.username,
            displayName: value.displayName,
            profileImageUrl: value.profileImageUrl.trim() === '' ? null : value.profileImageUrl.trim(),
          })
          await queryClient.invalidateQueries({ queryKey: ['my-member', memberId] })
        }}
      />
      <div className="mx-auto max-w-sm px-6">
        <button
          type="button"
          className="text-sm underline"
          onClick={async () => {
            await signOut()
            await navigate({ to: '/' })
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
