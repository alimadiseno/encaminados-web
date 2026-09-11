-- Encaminados — frase editable de la cinta animada
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- La cinta ondulada entre "Qué es Encaminados" y los testimonios
-- (components/WaveBanner.tsx) mostraba una frase fija en el código. Pasa a
-- vivir en la base para poder editarla desde el panel, en la pestaña
-- "Qué es Encaminados" — se guarda tal cual la escribe quien administra el
-- sitio; el componente la muestra en mayúsculas.

alter table retreats add column if not exists cinta_texto text
  not null default 'No importa si llevan dos años o treinta, si vienen bien o vienen cansados. Solo hace falta llegar';
