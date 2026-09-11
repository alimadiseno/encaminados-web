-- Encaminados — foto grupal única para "Quiénes los acompañan"
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- La sección pasó de una foto por guía (con nombre y rol debajo) a una sola
-- foto horizontal del grupo, sin pie de foto. `foto_url` y `foto_forma` en
-- `retreat_guias` quedan sin uso — se dejan tal cual (no se borran) para no
-- perder datos ya cargados; el panel de administración ya no las llena.
--
-- Se rellena con el mismo placeholder de layout que ya se usaba en la foto
-- del matrimonio guía, para que la sección no quede sin imagen hasta que se
-- suba la foto real del grupo desde el panel.

alter table retreats add column if not exists guias_foto_url text;

update retreats set guias_foto_url = '/images/guia-matrimonio.webp' where guias_foto_url is null;
