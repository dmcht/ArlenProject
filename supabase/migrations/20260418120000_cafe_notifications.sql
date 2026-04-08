-- Notificaciones: nueva publicación en el café, me gusta y comentarios en tu post.
-- Los inserts los hacen triggers con SECURITY DEFINER (la app no inserta filas).

create extension if not exists "pgcrypto";

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null
    check (kind in ('cafe_new_post', 'cafe_like', 'cafe_comment')),
  actor_id uuid references public.profiles (id) on delete set null,
  cafe_post_id uuid references public.cafe_posts (id) on delete cascade,
  cafe_comment_id uuid references public.cafe_post_comments (id) on delete set null,
  title text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_desc
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread
  on public.notifications (user_id)
  where read_at is null;

comment on table public.notifications is 'Avisos del equipo (café: publicaciones, me gusta, comentarios)';

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.notifications from public;
grant select, update on public.notifications to authenticated;

-- === Triggers ===

create or replace function public.notify_cafe_new_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, kind, actor_id, cafe_post_id, title)
  select
    p.id,
    'cafe_new_post',
    new.user_id,
    new.id,
    coalesce(nullif(trim(new.author_label), ''), 'Alguien') || ' publicó en el Café'
  from public.profiles p
  where p.id is distinct from new.user_id;
  return new;
end;
$$;

drop trigger if exists cafe_posts_notify_new on public.cafe_posts;
create trigger cafe_posts_notify_new
  after insert on public.cafe_posts
  for each row
  execute function public.notify_cafe_new_post();

create or replace function public.notify_cafe_post_liked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  actor_name text;
begin
  select cp.user_id into owner_id
  from public.cafe_posts cp
  where cp.id = new.post_id;

  if owner_id is null or owner_id = new.user_id then
    return new;
  end if;

  select coalesce(nullif(trim(p.display_name), ''), 'Alguien') into actor_name
  from public.profiles p
  where p.id = new.user_id;

  if actor_name is null then
    actor_name := 'Alguien';
  end if;

  insert into public.notifications (user_id, kind, actor_id, cafe_post_id, title)
  values (
    owner_id,
    'cafe_like',
    new.user_id,
    new.post_id,
    actor_name || ' le dio me gusta a tu publicación'
  );

  return new;
end;
$$;

drop trigger if exists cafe_post_likes_notify on public.cafe_post_likes;
create trigger cafe_post_likes_notify
  after insert on public.cafe_post_likes
  for each row
  execute function public.notify_cafe_post_liked();

create or replace function public.notify_cafe_post_commented()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  actor_name text;
begin
  select cp.user_id into owner_id
  from public.cafe_posts cp
  where cp.id = new.post_id;

  if owner_id is null or owner_id = new.user_id then
    return new;
  end if;

  select coalesce(nullif(trim(new.author_label), ''), 'Alguien') into actor_name;

  insert into public.notifications (
    user_id,
    kind,
    actor_id,
    cafe_post_id,
    cafe_comment_id,
    title
  )
  values (
    owner_id,
    'cafe_comment',
    new.user_id,
    new.post_id,
    new.id,
    actor_name || ' comentó tu publicación'
  );

  return new;
end;
$$;

drop trigger if exists cafe_post_comments_notify on public.cafe_post_comments;
create trigger cafe_post_comments_notify
  after insert on public.cafe_post_comments
  for each row
  execute function public.notify_cafe_post_commented();

select pg_notify('pgrst', 'reload schema');
