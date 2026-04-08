-- Me gusta y comentarios en publicaciones del café (estilo feed).
-- Requiere public.cafe_posts y public.profiles.

create extension if not exists "pgcrypto";

create table if not exists public.cafe_post_likes (
  post_id uuid not null references public.cafe_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists cafe_post_likes_post_idx
  on public.cafe_post_likes (post_id);

comment on table public.cafe_post_likes is 'Me gusta en publicaciones del café (un usuario, un like por post)';

create table if not exists public.cafe_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.cafe_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  author_label text not null,
  author_avatar_path text,
  body text not null
    check (char_length(body) >= 1 and char_length(body) <= 1500),
  created_at timestamptz not null default now()
);

create index if not exists cafe_post_comments_post_created
  on public.cafe_post_comments (post_id, created_at asc);

comment on table public.cafe_post_comments is 'Comentarios en publicaciones del café';

alter table public.cafe_post_likes enable row level security;
alter table public.cafe_post_comments enable row level security;

drop policy if exists "cafe_post_likes_select_auth" on public.cafe_post_likes;
create policy "cafe_post_likes_select_auth"
  on public.cafe_post_likes for select
  to authenticated
  using (true);

drop policy if exists "cafe_post_likes_insert_own" on public.cafe_post_likes;
create policy "cafe_post_likes_insert_own"
  on public.cafe_post_likes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "cafe_post_likes_delete_own" on public.cafe_post_likes;
create policy "cafe_post_likes_delete_own"
  on public.cafe_post_likes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "cafe_post_comments_select_auth" on public.cafe_post_comments;
create policy "cafe_post_comments_select_auth"
  on public.cafe_post_comments for select
  to authenticated
  using (true);

drop policy if exists "cafe_post_comments_insert_own" on public.cafe_post_comments;
create policy "cafe_post_comments_insert_own"
  on public.cafe_post_comments for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.cafe_posts p where p.id = post_id
    )
  );

drop policy if exists "cafe_post_comments_delete_own" on public.cafe_post_comments;
create policy "cafe_post_comments_delete_own"
  on public.cafe_post_comments for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, delete on table public.cafe_post_likes to authenticated;
grant select, insert, delete on table public.cafe_post_comments to authenticated;

select pg_notify('pgrst', 'reload schema');
