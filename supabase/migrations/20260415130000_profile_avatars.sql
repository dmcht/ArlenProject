-- Fotos de perfil: bucket + columnas en perfiles y copia en publicaciones (sin exponer todo el perfil por RLS).
-- Tras ejecutar: select pg_notify('pgrst', 'reload schema');

create extension if not exists "pgcrypto";

-- Bucket público para URLs de avatar (ruta: {user_id}/{uuid}.ext)
insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "profile_avatars_storage_select" on storage.objects;
create policy "profile_avatars_storage_select"
  on storage.objects for select
  to public
  using (bucket_id = 'profile-avatars');

drop policy if exists "profile_avatars_storage_insert_own" on storage.objects;
create policy "profile_avatars_storage_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "profile_avatars_storage_delete_own" on storage.objects;
create policy "profile_avatars_storage_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

alter table public.profiles
  add column if not exists avatar_path text;

comment on column public.profiles.avatar_path is 'Ruta en bucket profile-avatars; null si no hay foto';

alter table public.cafe_posts
  add column if not exists author_avatar_path text;

alter table public.muro_posts
  add column if not exists author_avatar_path text;

alter table public.muro_comments
  add column if not exists author_avatar_path text;

-- Al cambiar el avatar en perfil, actualizar publicaciones existentes del usuario
create or replace function public.sync_author_avatar_from_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.cafe_posts
  set author_avatar_path = NEW.avatar_path
  where user_id = NEW.id;
  update public.muro_posts
  set author_avatar_path = NEW.avatar_path
  where user_id = NEW.id;
  update public.muro_comments
  set author_avatar_path = NEW.avatar_path
  where user_id = NEW.id;
  return NEW;
end;
$$;

drop trigger if exists profiles_avatar_sync on public.profiles;
create trigger profiles_avatar_sync
  after update of avatar_path on public.profiles
  for each row
  when (OLD.avatar_path is distinct from NEW.avatar_path)
  execute function public.sync_author_avatar_from_profile();

-- Opcional: alinear filas ya existentes con el perfil actual
update public.cafe_posts c
set author_avatar_path = p.avatar_path
from public.profiles p
where c.user_id = p.id
  and p.avatar_path is not null
  and (c.author_avatar_path is distinct from p.avatar_path);

update public.muro_posts m
set author_avatar_path = p.avatar_path
from public.profiles p
where m.user_id = p.id
  and p.avatar_path is not null
  and (m.author_avatar_path is distinct from p.avatar_path);

update public.muro_comments mc
set author_avatar_path = p.avatar_path
from public.profiles p
where mc.user_id = p.id
  and p.avatar_path is not null
  and (mc.author_avatar_path is distinct from p.avatar_path);

select pg_notify('pgrst', 'reload schema');
