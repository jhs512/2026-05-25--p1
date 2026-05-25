-- 공유 트리거 함수: modified_at 자동 갱신. members·posts가 함께 쓴다.
create or replace function public.update_modified_at()
returns trigger
language plpgsql
as $$
begin
    new.modified_at = now();
    return new;
end;
$$;
