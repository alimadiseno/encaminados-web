-- Encaminados — aviso sobre la tarjeta de fechas del hero
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- Rectángulo terracota justo encima de la tarjeta "Próximas fechas" del hero
-- (components/Hero.tsx), ej. "Octubre y noviembre 2026 · cupos agotados".
-- Vacío = no se muestra. Editable desde el panel, pestaña "Hero".
--
-- Aplicar ANTES de desplegar el código que la usa: el guardado del panel
-- escribe esta columna y falla si no existe.

alter table retreats add column if not exists aviso_fechas_texto text not null default '';
