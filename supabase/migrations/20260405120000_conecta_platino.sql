-- Conecta Platino: perfiles, progreso, insignias y frases del día
-- Ejecutar en Supabase SQL Editor o con: supabase db push

create extension if not exists "pgcrypto";

-- Perfil 1:1 con auth.users (contadores de progreso)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  charlas_realizadas integer not null default 0
    check (charlas_realizadas >= 0),
  cafes_participados integer not null default 0
    check (cafes_participados >= 0),
  reconocimientos_dados integer not null default 0
    check (reconocimientos_dados >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Datos de usuario y métricas de Conecta Platino';

-- Catálogo de insignias (solo lectura desde la app)
create table public.badges (
  id text primary key,
  label text not null,
  sort_order integer not null default 0
);

insert into public.badges (id, label, sort_order) values
  ('team_connector', 'Conector del Equipo', 1),
  ('active_listening', 'Escucha Activa', 2),
  ('supportive_peer', 'Compañero Solidario', 3);

-- Insignias otorgadas (inserción típica desde backend / SQL / futura función)
create table public.user_badges (
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id text not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- Frase del día (una fila por fecha)
create table public.daily_quotes (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  active_on date not null unique
);

insert into public.daily_quotes (body, active_on) values
  ('Una buena amistad mejora el trabajo.', current_date)
on conflict (active_on) do nothing;

-- RLS
alter table public.profiles enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.daily_quotes enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- Permite actualizar el propio perfil (nombre; en piloto también contadores — endurecer luego con RPC)
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "badges_select_all"
  on public.badges for select
  to anon, authenticated
  using (true);

create policy "user_badges_select_own"
  on public.user_badges for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "daily_quotes_select_all"
  on public.daily_quotes for select
  to anon, authenticated
  using (true);

-- Perfil al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Incrementos seguros (opcional; llamar desde Server Actions con usuario logueado)
create or replace function public.increment_charlas()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set charlas_realizadas = charlas_realizadas + 1,
      updated_at = now()
  where id = (select auth.uid());
end;
$$;

create or replace function public.increment_cafes()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set cafes_participados = cafes_participados + 1,
      updated_at = now()
  where id = (select auth.uid());
end;
$$;

create or replace function public.increment_reconocimientos()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set reconocimientos_dados = reconocimientos_dados + 1,
      updated_at = now()
  where id = (select auth.uid());
end;
$$;

grant execute on function public.increment_charlas() to authenticated;
grant execute on function public.increment_cafes() to authenticated;
grant execute on function public.increment_reconocimientos() to authenticated;
