import { test, expect } from '@playwright/test'

// Happy path: a brand-new visitor signs up, writes a Post, and sees it in the
// listing — exercising the full auth + create path through real Supabase.
test('회원가입 → 글쓰기 → 목록·상세에서 확인', async ({ page }) => {
  const stamp = Date.now()
  const email = `e2e-${stamp}@no-reply.com`
  const title = `E2E 글 ${stamp}`

  // 회원가입 (확인메일 없이 즉시 로그인)
  await page.goto('/signup')
  await page.getByLabel('이메일').fill(email)
  await page.getByLabel('비밀번호').fill('lldj123414')
  await page.getByLabel('표시이름').fill('E2E사용자')
  await page.getByRole('button', { name: '회원가입' }).click()

  // 메인으로 이동 + 로그인 상태
  await expect(page).toHaveURL('http://localhost:5173/')
  await expect(page.getByText('E2E사용자')).toBeVisible()

  // 글쓰기
  await page.getByRole('link', { name: '글쓰기' }).click()
  await page.getByLabel('제목').fill(title)
  await page.getByLabel('내용').fill('E2E happy path 본문입니다.')
  await page.getByRole('button', { name: '게시' }).click()

  // 상세에서 확인
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await expect(page.getByText('E2E happy path 본문입니다.')).toBeVisible()

  // 목록에서 확인
  await page.getByRole('link', { name: '게시판' }).click()
  await expect(page.getByText(title)).toBeVisible()
})
