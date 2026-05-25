import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { fetchPosts } from '@/posts/posts-data'

// Real clients against the local stack — no mocks (ADR-0002).
const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const secretKey = import.meta.env.SUPABASE_SECRET_KEY as string

const anon = createClient(url, anonKey, { auth: { persistSession: false } })
// service_role-level client; bypasses RLS. Used only for setup/teardown.
const admin = createClient(url, secretKey, { auth: { persistSession: false } })

const MARKER = '__integration-test-post__'
let seededId: number

beforeAll(async () => {
  // posts.author_id is NOT NULL and references a Member, so the fixture needs a
  // real Member id. service_role bypasses RLS for this setup.
  const { data: member, error: memberError } = await admin
    .from('members')
    .select('id')
    .limit(1)
    .single()
  if (memberError) throw memberError

  const { data, error } = await admin
    .from('posts')
    .insert({
      author_id: member.id,
      title: MARKER,
      content: 'integration fixture',
      visibility: 'PUBLIC',
    })
    .select('id')
    .single()
  if (error) throw error
  seededId = data.id as number
})

afterAll(async () => {
  await admin.from('posts').delete().eq('id', seededId)
})

describe('public.posts RLS boundary (anon)', () => {
  it('lets anon SELECT posts', async () => {
    const { data, error } = await anon.from('posts').select('id, title')
    expect(error).toBeNull()
    expect(data?.some((p) => p.title === MARKER)).toBe(true)
  })

  it('rejects anon INSERT', async () => {
    const { error } = await anon.from('posts').insert({ title: 'sneaky insert' })
    expect(error).not.toBeNull()
  })

  it('does not let anon UPDATE a post', async () => {
    await anon.from('posts').update({ title: 'hacked' }).eq('id', seededId)
    // Confirm via admin that the row is unchanged.
    const { data } = await admin.from('posts').select('title').eq('id', seededId).single()
    expect(data?.title).toBe(MARKER)
  })

  it('does not let anon DELETE a post', async () => {
    await anon.from('posts').delete().eq('id', seededId)
    // Confirm via admin that the row still exists.
    const { data } = await admin.from('posts').select('id').eq('id', seededId).single()
    expect(data?.id).toBe(seededId)
  })
})

describe('fetchPosts (data access via get_posts RPC)', () => {
  it('returns Posts newest-first with the camelCase Post shape including author', async () => {
    const posts = await fetchPosts()

    expect(posts.length).toBeGreaterThan(0)

    const first = posts[0]
    expect(first).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        title: expect.any(String),
        content: expect.any(String),
        visibility: expect.any(String),
        createdAt: expect.any(String),
        modifiedAt: expect.any(String),
      }),
    )
    expect(first.author).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        username: expect.any(String),
        displayName: expect.any(String),
      }),
    )

    const times = posts.map((p) => new Date(p.createdAt).getTime())
    const newestFirst = [...times].sort((a, b) => b - a)
    expect(times).toEqual(newestFirst)
  })

  it('returns only PUBLIC Posts to the anon client (UNLISTED/PRIVATE hidden)', async () => {
    const posts = await fetchPosts()
    expect(posts.every((p) => p.visibility === 'PUBLIC')).toBe(true)
  })
})
