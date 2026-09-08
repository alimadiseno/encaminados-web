-- Encaminados — miniatura propia para los videos de testimonios
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- Por defecto, la miniatura de cada testimonio se trae automático de YouTube
-- a partir del youtube_id. Esta columna permite reemplazarla por una foto
-- propia cuando la miniatura automática no sirva (mal recortada, etc.) — si
-- queda vacía, se sigue usando la de YouTube.

alter table retreat_videos add column if not exists portada_url text;
