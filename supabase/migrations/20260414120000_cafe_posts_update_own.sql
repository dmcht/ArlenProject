-- Autores pueden actualizar su publicación del café (leyenda e imagen vía app).
drop policy if exists "cafe_posts_update_own" on public.cafe_posts;
create policy "cafe_posts_update_own"
  on public.cafe_posts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant update on table public.cafe_posts to authenticated;

select pg_notify('pgrst', 'reload schema');
