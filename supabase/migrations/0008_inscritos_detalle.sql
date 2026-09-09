-- Encaminados — detalle extra de la inscripción + comprobante de pago
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- El Google Form también pregunta varias cosas que el cliente quiere
-- conservar pero que no son datos clave de contacto/pago (alergias,
-- motivación, hijos, etc.) — van en un solo campo jsonb en vez de una
-- columna por pregunta, porque el CRM no necesita filtrar ni ordenar por
-- ninguna de ellas, solo mostrarlas. El comprobante de depósito sí es un
-- campo propio porque se usa como link clickeable.

alter table inscritos
  add column if not exists detalle_extra jsonb,
  add column if not exists comprobante_url text;
