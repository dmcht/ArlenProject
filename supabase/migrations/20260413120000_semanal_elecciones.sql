-- Elección semanal en "Actividad semanal" (una por semana calendario ISO por usuario)
create table if not exists public.semanal_elecciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_lunes_ymd date not null,
  activity_index integer not null
    check (activity_index >= 0 and activity_index < 8),
  chosen_option_index integer not null
    check (chosen_option_index >= 0 and chosen_option_index < 16),
  updated_at timestamptz not null default now(),
  unique (user_id, week_lunes_ymd)
);

create index if not exists semanal_elecciones_user_week_idx
  on public.semanal_elecciones (user_id, week_lunes_ymd desc);

comment on table public.semanal_elecciones is 'Opción elegida en Actividad semanal (clave: lunes ISO, misma lógica que el ciclo en app)';

alter table public.semanal_elecciones enable row level security;

create policy "semanal_elecciones_select_own"
  on public.semanal_elecciones for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "semanal_elecciones_insert_own"
  on public.semanal_elecciones for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "semanal_elecciones_update_own"
  on public.semanal_elecciones for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "semanal_elecciones_delete_own"
  on public.semanal_elecciones for delete
  to authenticated
  using ((select auth.uid()) = user_id);
