-- Encaminados — storage para el panel de administración
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- Bucket público donde el panel de administración (app/admin) sube las fotos
-- del sitio (hero, historia, guías, fotos decorativas, imagen de SEO). Las
-- subidas siempre pasan por un Server Action con la service_role key, que
-- ignora RLS — por eso no hace falta agregar policies de `storage.objects`
-- para "anon": la lectura funciona sola por ser un bucket público, y no hay
-- forma de escribir ahí desde el navegador.

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;
