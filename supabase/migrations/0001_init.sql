-- Encaminados — esquema inicial
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar este archivo completo → Run.
--
-- Dos grupos de tablas:
--   1) Contenido editable del sitio (retreats + tablas relacionadas 1-a-muchos),
--      espejo de la forma de `types/retreat.ts` — así el sitio y el panel
--      de administración comparten exactamente la misma estructura de datos.
--   2) `inscritos`, para cuando conectemos el formulario de pago.
--
-- Seguridad: RLS activado en todo. El sitio público lee el contenido con la
-- llave "anon" (solo lectura). El panel de administración y el formulario
-- usan la "service_role key" desde el servidor, que ignora RLS por completo
-- — por eso `inscritos` no tiene ninguna policy para "anon": nadie puede
-- leer ni escribir ahí desde el navegador, solo desde el servidor.

create extension if not exists "pgcrypto";

-- ============================================================
-- Contenido
-- ============================================================
create table retreats (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nombre text not null,
  bajada text not null,
  lugar text not null,
  como_llegar text not null,
  mapa_url text not null,
  hora_inicio text not null,
  hora_termino text not null,
  costo text not null,
  incluye text not null,
  cuotas_disponibles boolean not null default false,
  cupos text not null,
  cupos_descripcion text not null,
  inscripcion_url text not null,
  whatsapp text not null,
  whatsapp_mensaje text not null,
  email text not null,
  guias_intro text not null default '',
  historia_texto text not null default '',
  historia_pendiente boolean not null default true,
  hero_imagen_url text,
  section_divider_imagen_url text,
  historia_imagen_url text,
  seo_titulo text,
  seo_descripcion text,
  seo_imagen_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table retreat_fechas (
  id uuid primary key default gen_random_uuid(),
  retreat_id uuid not null references retreats(id) on delete cascade,
  orden int not null default 0,
  label text not null,
  fecha_inicio date not null,
  fecha_termino date not null
);

create table retreat_ideas (
  id uuid primary key default gen_random_uuid(),
  retreat_id uuid not null references retreats(id) on delete cascade,
  orden int not null default 0,
  titulo text not null,
  descripcion text not null
);

create table retreat_videos (
  id uuid primary key default gen_random_uuid(),
  retreat_id uuid not null references retreats(id) on delete cascade,
  orden int not null default 0,
  nombre text not null,
  cita text not null,
  youtube_id text
);

create table retreat_guias (
  id uuid primary key default gen_random_uuid(),
  retreat_id uuid not null references retreats(id) on delete cascade,
  orden int not null default 0,
  nombre text not null,
  rol text not null,
  foto_url text,
  foto_forma text not null default 'circulo' check (foto_forma in ('arco', 'circulo'))
);

create table retreat_faq (
  id uuid primary key default gen_random_uuid(),
  retreat_id uuid not null references retreats(id) on delete cascade,
  orden int not null default 0,
  pregunta text not null,
  respuesta text not null,
  enlace_texto text,
  enlace_href text
);

create table retreat_photo_strip (
  id uuid primary key default gen_random_uuid(),
  retreat_id uuid not null references retreats(id) on delete cascade,
  orden int not null default 0,
  foto_url text not null
);

-- ============================================================
-- Inscritos (para el formulario + panel de administración)
-- ============================================================
create table inscritos (
  id uuid primary key default gen_random_uuid(),
  retreat_id uuid not null references retreats(id) on delete restrict,
  fecha_elegida text not null,
  nombre_matrimonio text not null,
  email text not null,
  telefono text,
  estado_pago text not null default 'pendiente' check (estado_pago in ('pendiente', 'parcial', 'pagado')),
  monto numeric,
  metodo_pago text,
  notas text,
  creado_en timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table retreats enable row level security;
alter table retreat_fechas enable row level security;
alter table retreat_ideas enable row level security;
alter table retreat_videos enable row level security;
alter table retreat_guias enable row level security;
alter table retreat_faq enable row level security;
alter table retreat_photo_strip enable row level security;
alter table inscritos enable row level security;

-- El sitio público solo necesita lectura. Nada de esto permite escribir
-- desde el navegador — el panel de administración escribe con la
-- service_role key desde el servidor, que no pasa por estas policies.
create policy "Lectura pública" on retreats for select using (true);
create policy "Lectura pública" on retreat_fechas for select using (true);
create policy "Lectura pública" on retreat_ideas for select using (true);
create policy "Lectura pública" on retreat_videos for select using (true);
create policy "Lectura pública" on retreat_guias for select using (true);
create policy "Lectura pública" on retreat_faq for select using (true);
create policy "Lectura pública" on retreat_photo_strip for select using (true);
-- inscritos: sin policies para "anon" a propósito — cero acceso público,
-- ni lectura ni escritura. Solo la service_role key (servidor) puede tocarla.
