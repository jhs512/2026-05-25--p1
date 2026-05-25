import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { supabase } from '@/lib/supabase'
import { createPost, fetchPost, modifyPost, deletePost } from '@/posts/posts-data'

// Exercises the write path through the real stack as a logged-in Member
// (PostgREST + JWT + create/modify/delete_post RPC + RLS). No mocks (ADR-0002).
// Self-cleaning: the Post is deleted at the end.

beforeAll(async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: 'user1@no-reply.com',
    password: 'lldj123414',
  })
  if (error) throw error
})

afterAll(async () => {
  await supabase.auth.signOut()
})

describe('Post write lifecycle (authed, real RPCs)', () => {
  it('creates, reads, modifies and deletes a Post', async () => {
    const id = await createPost({
      title: '통합 테스트 글',
      content: '통합 테스트 본문',
      visibility: 'UNLISTED',
    })
    expect(id).toEqual(expect.any(Number))

    const created = await fetchPost(id)
    expect(created?.title).toBe('통합 테스트 글')
    expect(created?.visibility).toBe('UNLISTED')
    expect(created?.author.username).toBeTruthy()

    await modifyPost(id, {
      title: '수정된 통합 글',
      content: '수정 본문',
      visibility: 'PUBLIC',
    })
    const modified = await fetchPost(id)
    expect(modified?.title).toBe('수정된 통합 글')
    expect(modified?.visibility).toBe('PUBLIC')

    await deletePost(id)
    expect(await fetchPost(id)).toBeNull()
  })
})
