-- Encaminados — retiro de abril 2027 como ciclo propio
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- Las fechas de abril 2027 se cargaron reemplazando las de octubre/noviembre
-- 2026 en el mismo retiro (`2026-segundo-semestre`), así que sus 36 inscritos
-- quedaron con botones de filtro de abril que no les corresponden, y una
-- pareja de 2026 que se inscribiera para abril pisaría su fila anterior
-- (unique por retiro + correos). Esto:
--   1. Copia el retiro completo (contenido + tablas hijas) a
--      `2027-primer-semestre`, con las fechas de abril que tiene hoy.
--   2. Devuelve al retiro 2026 sus fechas reales de octubre y noviembre.
-- Los inscritos no se mueven: los 36 actuales son de 2026.
--
-- Aplicar ANTES de desplegar el código que cambia RETIRO_DESTACADO a
-- `2027-primer-semestre` — si no, el sitio no encuentra el retiro destacado.
-- Es seguro correrlo dos veces: si el retiro nuevo ya existe, no hace nada.

do $$
declare
  viejo uuid;
  nuevo uuid := gen_random_uuid();
  tabla text;
begin
  select id into viejo from retreats where slug = '2026-segundo-semestre';
  if viejo is null then
    raise exception 'No existe el retiro 2026-segundo-semestre';
  end if;

  if exists (select 1 from retreats where slug = '2027-primer-semestre') then
    raise notice 'El retiro 2027-primer-semestre ya existe, no se hizo nada.';
    return;
  end if;

  -- Copia genérica (vía jsonb) para no tener que listar columnas: así también
  -- arrastra las que se agreguen en migraciones futuras.
  insert into retreats
  select (jsonb_populate_record(
    null::retreats,
    to_jsonb(r) || jsonb_build_object('id', nuevo, 'slug', '2027-primer-semestre', 'created_at', now(), 'updated_at', now())
  )).*
  from retreats r
  where r.id = viejo;

  foreach tabla in array array[
    'retreat_fechas', 'retreat_ideas', 'retreat_videos', 'retreat_guias',
    'retreat_faq', 'retreat_photo_strip', 'retreat_historia_fotos'
  ] loop
    execute format(
      'insert into %1$I
       select (jsonb_populate_record(null::%1$I, to_jsonb(x) || jsonb_build_object(''id'', gen_random_uuid(), ''retreat_id'', $1))).*
       from %1$I x
       where x.retreat_id = $2',
      tabla
    ) using nuevo, viejo;
  end loop;

  delete from retreat_fechas where retreat_id = viejo;
  insert into retreat_fechas (retreat_id, orden, label, fecha_inicio, fecha_termino) values
    (viejo, 0, '2 al 4 de octubre', '2026-10-02', '2026-10-04'),
    (viejo, 1, '6 al 8 de noviembre', '2026-11-06', '2026-11-08');
end $$;
