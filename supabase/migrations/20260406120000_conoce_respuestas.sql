-- Respuestas de "Conocer al compañero" (notas por semana calendario)
create table public.conoce_respuestas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_lunes_ymd date not null,
  activity_index integer not null
    check (activity_index >= 0 and activity_index < 8),
  answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, week_lunes_ymd)
);

create index conoce_respuestas_user_week_idx
  on public.conoce_respuestas (user_id, week_lunes_ymd desc);

comment on table public.conoce_respuestas is 'Notas semanales del flujo Conocer al compañero (clave: lunes ISO en zona de la app)';

alter table public.conoce_respuestas enable row level security;

create policy "conoce_respuestas_select_own"
  on public.conoce_respuestas for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "conoce_respuestas_insert_own"
  on public.conoce_respuestas for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "conoce_respuestas_update_own"
  on public.conoce_respuestas for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "conoce_respuestas_delete_own"
  on public.conoce_respuestas for delete
  to authenticated
  using ((select auth.uid()) = user_id);
