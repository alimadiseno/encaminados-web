-- Encaminados — aviso superior editable
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- Franja angosta sobre el header del sitio (components/Header.tsx) para avisos
-- puntuales, ej. "Cupos de noviembre agotados — inscripciones abiertas para
-- abril". Vacío = no se muestra. Editable desde el panel, pestaña "Hero".
--
-- Aplicar ANTES de desplegar el código que la usa: el guardado del panel
-- escribe esta columna y falla si no existe.

alter table retreats add column if not exists aviso_texto text not null default '';
