-- Encaminados — velocidad editable de la cinta animada
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- Segundos que tarda la cinta (components/WaveBanner.tsx) en completar una
-- vuelta completa del texto — a menor número, más rápido se mueve. Editable
-- desde el panel, en la pestaña "Qué es Encaminados" junto a la frase.

alter table retreats add column if not exists cinta_velocidad_segundos integer
  not null default 20 check (cinta_velocidad_segundos > 0);
