-- Sample Posts for local development. Seed runs with elevated privilege and
-- bypasses RLS, so no write policy is needed to load these rows.
insert into public.posts (title, content, created_at) values
  ('첫 번째 게시글', '안녕하세요. 이것은 첫 번째 샘플 게시글입니다.', now() - interval '5 days'),
  ('두 번째 게시글', '두 번째 샘플 게시글의 본문입니다. 리스팅 화면을 채우기 위한 더미 데이터예요.', now() - interval '3 days'),
  ('세 번째 게시글', '세 번째 게시글입니다. 한글과 English가 섞인 본문도 잘 보이는지 확인합니다.', now() - interval '1 day'),
  ('네 번째 게시글', '가장 최근처럼 보이는 네 번째 게시글입니다. 최신순 정렬을 확인하기 좋습니다.', now() - interval '2 hours'),
  ('다섯 번째 게시글', '제목 위주의 짧은 게시글입니다.', now());
