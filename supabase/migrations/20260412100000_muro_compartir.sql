-- Muro para compartir: reflexiones y comentarios (texto).
-- Idempotente. Requiere public.profiles.

create extension if not exists "pgcrypto";

create table if not exists public.muro_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  author_label text not null,
  body text not null
    check (char_length(body) >= 1 and char_length(body) <= 4000),
  created_at timestamptz not null default now()
);

create table if not exists public.muro_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.muro_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  author_label text not null,
  body text not null
    check (char_length(body) >= 1 and char_length(body) <= 1500),
  created_at timestamptz not null default now()
);

create index if not exists muro_posts_created_desc
  on public.muro_posts (created_at desc);

create index if not exists muro_comments_post_created
  on public.muro_comments (post_id, created_at asc);

comment on table public.muro_posts is 'Reflexiones y pensamientos del muro compartido';
comment on table public.muro_comments is 'Comentarios en publicaciones del muro';

alter table public.muro_posts enable row level security;
alter table public.muro_comments enable row level security;

drop policy if exists "muro_posts_select_auth" on public.muro_posts;
create policy "muro_posts_select_auth"
  on public.muro_posts for select
  to authenticated
  using (true);

drop policy if exists "muro_posts_insert_own" on public.muro_posts;
create policy "muro_posts_insert_own"
  on public.muro_posts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "muro_posts_delete_own" on public.muro_posts;
create policy "muro_posts_delete_own"
  on public.muro_posts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "muro_comments_select_auth" on public.muro_comments;
create policy "muro_comments_select_auth"
  on public.muro_comments for select
  to authenticated
  using (true);

drop policy if exists "muro_comments_insert_own" on public.muro_comments;
create policy "muro_comments_insert_own"
  on public.muro_comments for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.muro_posts p where p.id = post_id
    )
  );

drop policy if exists "muro_comments_delete_own" on public.muro_comments;
create policy "muro_comments_delete_own"
  on public.muro_comments for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, delete on table public.muro_posts to authenticated;
grant select, insert, delete on table public.muro_comments to authenticated;

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
