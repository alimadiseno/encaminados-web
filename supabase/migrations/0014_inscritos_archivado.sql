-- Encaminados — archivar inscritos en vez de borrarlos
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- El botón "Eliminar inscrito" del panel hacía un DELETE de verdad, sin
-- papelera ni forma de deshacer. Pasa a ser un archivado blando: la fila
-- queda con `archivado_en` seteado (no se borra), desaparece de la lista
-- principal y de los exports, pero se puede restaurar desde el panel.

alter table inscritos
  add column if not exists archivado_en timestamptz;
