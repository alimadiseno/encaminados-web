-- Encaminados — testimonios sin video: agrega "bajada" (una línea)
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- "Voces de quienes caminaron" deja de mostrar video (con estrellas ni foto
-- de usuario, que tampoco tenía): ahora es un reel de tarjetas con la cita,
-- el nombre de la pareja y una bajada corta de una línea. `youtube_id` y
-- `portada_url` en `retreat_videos` quedan sin uso — se dejan tal cual (no
-- se borran) para no perder datos ya cargados, mismo criterio que la
-- migración 0009 con las fotos de guías; el panel ya no las llena.

alter table retreat_videos add column if not exists bajada text not null default '';
