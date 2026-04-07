-- Café de conexión: bucket de imágenes + tabla de publicaciones + RLS + permisos.
-- Idempotente (seguro ejecutar varias veces). Requiere public.profiles (migración conecta_platino).
-- Si la app muestra PGRST205, tras ejecutar esto corre: select pg_notify('pgrst', 'reload schema');

create extension if not exists "pgcrypto";

-- Bucket público para URLs de imágenes
insert into storage.buckets (id, name, public)
values ('cafe-posts', 'cafe-posts', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "cafe_posts_storage_select" on storage.objects;
create policy "cafe_posts_storage_select"
  on storage.objects for select
  to public
  using (bucket_id = 'cafe-posts');

drop policy if exists "cafe_posts_storage_insert_own" on storage.objects;
create policy "cafe_posts_storage_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'cafe-posts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "cafe_posts_storage_delete_own" on storage.objects;
create policy "cafe_posts_storage_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'cafe-posts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create table if not exists public.cafe_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  author_label text not null,
  caption text,
  image_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists cafe_posts_created_desc
  on public.cafe_posts (created_at desc);

comment on table public.cafe_posts is 'Publicaciones del Café de conexión (imagen + texto)';

alter table public.cafe_posts enable row level security;

drop policy if exists "cafe_posts_select_authenticated" on public.cafe_posts;
create policy "cafe_posts_select_authenticated"
  on public.cafe_posts for select
  to authenticated
  using (true);

drop policy if exists "cafe_posts_insert_own" on public.cafe_posts;
create policy "cafe_posts_insert_own"
  on public.cafe_posts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "cafe_posts_delete_own" on public.cafe_posts;
create policy "cafe_posts_delete_own"
  on public.cafe_posts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, delete on table public.cafe_posts to authenticated;

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
