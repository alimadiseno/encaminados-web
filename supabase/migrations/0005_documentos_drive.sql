-- Encaminados — carpeta de Drive con los documentos de guías
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- El cliente sube y mantiene los documentos directo en una carpeta de Google
-- Drive propia. En vez de duplicar esos archivos en Supabase Storage, /guias
-- incrusta esa carpeta (Google Drive "embeddedfolderview") — cualquier
-- archivo que el cliente suba o quite en Drive se refleja solo, sin volver
-- a tocar el panel de administración.

alter table retreats add column if not exists documentos_drive_url text;
