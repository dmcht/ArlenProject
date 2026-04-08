-- Frase del día: texto actualizado (bases ya migradas)
update public.daily_quotes
set body = 'Un buen trabajo fortalece una buena amistad';

insert into public.daily_quotes (body, active_on) values
  ('Un buen trabajo fortalece una buena amistad', current_date)
on conflict (active_on) do update set body = excluded.body;
