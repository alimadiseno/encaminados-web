-- Encaminados — evita inscritos duplicados
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- El webhook pasa a hacer upsert (en vez de insert) sobre esta combinación
-- de columnas: si se corre el script de carga inicial de Apps Script dos
-- veces por error, la segunda vuelta no duplica la fila — el registro que
-- ya existe (y cualquier estado de pago que Aline ya haya marcado a mano)
-- queda intacto.

alter table inscritos
  add constraint inscritos_pareja_unica unique (retreat_id, email_esposa, email_marido);
