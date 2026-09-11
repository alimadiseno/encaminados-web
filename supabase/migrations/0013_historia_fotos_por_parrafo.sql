-- Encaminados — fotos de "Nuestra historia" que cambian por párrafo
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- El marco de la foto en "Cómo empezó esto" se mantiene fijo, pero ahora
-- puede haber una foto distinta por cada párrafo (se cruzan con fundido a
-- medida que el texto avanza con el scroll). Es opcional: si no se cargan
-- fotos acá, la sección sigue mostrando `historia_imagen_url` como antes.
-- Misma forma que `retreat_photo_strip`.

create table if not exists retreat_historia_fotos (
  id uuid primary key default gen_random_uuid(),
  retreat_id uuid not null references retreats(id) on delete cascade,
  orden int not null default 0,
  foto_url text not null
);

alter table retreat_historia_fotos enable row level security;

create policy "Lectura pública" on retreat_historia_fotos for select using (true);
