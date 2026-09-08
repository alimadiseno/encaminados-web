-- Encaminados — inscritos: esposa y marido por separado
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- El Google Form real pide nombre/teléfono/correo de la esposa Y del
-- marido por separado, no un solo "nombre del matrimonio" — la tabla
-- `inscritos` (creada en 0001_init.sql, nunca usada todavía) se ajusta a
-- eso acá, antes de que empiece a entrar data real.

alter table inscritos
  drop column if exists nombre_matrimonio,
  drop column if exists email,
  drop column if exists telefono;

alter table inscritos
  add column if not exists nombre_esposa text not null default '',
  add column if not exists telefono_esposa text,
  add column if not exists email_esposa text not null default '',
  add column if not exists nombre_marido text not null default '',
  add column if not exists telefono_marido text,
  add column if not exists email_marido text not null default '';

alter table inscritos alter column nombre_esposa drop default;
alter table inscritos alter column email_esposa drop default;
alter table inscritos alter column nombre_marido drop default;
alter table inscritos alter column email_marido drop default;
