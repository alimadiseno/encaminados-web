# Base de datos (Supabase)

## Datos de conexión

- **Proyecto Supabase:** `rckjlzzxeyjkvdbzdkpx` (visible en la URL `https://rckjlzzxeyjkvdbzdkpx.supabase.co`).
- **Motor:** Postgres, con Row Level Security (RLS) activado en todas las tablas.
- **Plan:** gratuito — se pausa tras 7 días de inactividad si nadie visita el sitio (mitigado con el workflow de keep-alive, ver [01-hosting-y-despliegue.md](01-hosting-y-despliegue.md)).
- **Cómo entrar:** dashboard de Supabase → proyecto `rckjlzzxeyjkvdbzdkpx` → confirmar con el equipo/cliente quién tiene la cuenta de owner (no queda registrado en el código).

## Dos llaves, dos niveles de acceso

| Llave | Dónde vive | Qué puede hacer |
|---|---|---|
| `SUPABASE_ANON_KEY` ("publishable") | Pública, en `wrangler.jsonc` | Solo lectura del contenido del sitio (retreats y tablas relacionadas), sujeta a las policies de RLS. **Nunca puede leer `inscritos`.** |
| `SUPABASE_SERVICE_ROLE_KEY` | Secreta (Cloudflare + `.env.local`/`.dev.vars`) | Ignora RLS por completo. Solo se usa server-side: panel `/admin` y el webhook `/api/inscritos`. |

Esta separación es intencional: el sitio público (`lib/supabase.ts`) usa la llave anon; el panel de administración y el webhook (`lib/supabase-admin.ts`) usan la service role key. Ver el código de ambos archivos para el detalle de implementación.

## Cómo aplicar cambios de esquema

Las migraciones **no se aplican automáticamente** — no hay CI conectado a Supabase. El flujo manual es:

1. Escribir un nuevo archivo en `supabase/migrations/`, numerado en secuencia (ej. `0014_algo_nuevo.sql`), con un comentario arriba explicando qué hace y por qué.
2. Abrir el **SQL Editor** del dashboard de Supabase.
3. Pegar el contenido completo del archivo y ejecutar (`Run`).
4. Commitear el archivo al repo — sirve como historial versionado del esquema, aunque Supabase no lo ejecute solo.

Es decir, `supabase/migrations/` es la **fuente de verdad documental** del esquema, pero alguien tiene que aplicarla a mano cada vez.

## Modelo de datos

Todo el contenido público de la landing se arma a partir de un `RetreatEvent` (definido en `types/retreat.ts`), que espeja la tabla `retreats` y sus tablas relacionadas 1-a-muchos. La landing nunca importa datos "hardcodeados": todo pasa por `getFeaturedRetreat()` en `data/retreats.ts`, que lee de Supabase.

### Tabla `retreats` (una fila por retiro)

Contiene los campos "simples" del retiro: `slug`, `nombre`, `bajada`, `lugar`, horarios, `costo`, `incluye`, cupos, `inscripcion_url`, contacto (whatsapp/email), textos de secciones (`guias_intro`, `historia_texto`, `cinta_texto`, etc.), URLs de imágenes (hero, section divider, guías, historia), y `documentos_drive_url` (carpeta de Drive para `/guias`). Ver `supabase/migrations/0001_init.sql` para las columnas originales y los archivos `0004` a `0013` para los campos agregados después.

Hoy solo existe **una fila destacada** (`RETIRO_DESTACADO`, ver `data/retreats.ts`) — el sitio muestra un único retiro a la vez. El modelo ya está pensado para soportar varios retiros en paralelo (una página `/eventos` listando `retreats` con `.map()`), pero esa vista no está construida todavía.

### Tablas relacionadas (1-a-muchos con `retreats`)

| Tabla | Contenido |
|---|---|
| `retreat_ideas` (o equivalente) | Las 3 ideas clave de "Qué es Encaminados" |
| `retreat_videos` | Testimonios (hoy son solo texto/cita — `youtube_id` y `portada_url` quedaron sin uso, ver nota abajo) |
| `retreat_photo_strip` | Franja de fotos decorativas |
| `retreat_historia_fotos` | Fotos por párrafo de "Nuestra historia" (opcional — si está vacía, se usa `historia_imagen_url` fija) |
| Fechas, FAQ, etc. | Ver `0001_init.sql` para la lista completa; todas siguen el mismo patrón: RLS activado, policy de lectura pública (`for select using (true)`), sin policy de escritura para `anon`. |

### Tabla `inscritos`

Guarda cada pareja inscrita al retiro. Alimentada por el webhook `/api/inscritos` (ver [04-integraciones-y-flujo-de-inscripcion.md](04-integraciones-y-flujo-de-inscripcion.md)), **no** tiene ninguna policy de lectura/escritura para `anon` — solo se accede desde el servidor con la service role key.

Columnas principales (ver migraciones `0001`, `0006`–`0008` para la evolución completa):
- Esposa y marido por separado: `nombre_esposa`, `telefono_esposa`, `email_esposa`, `nombre_marido`, `telefono_marido`, `email_marido`.
- `fecha_elegida`, `retreat_id`.
- `estado_pago` (`pendiente` / `parcial` / `pagado`), `monto`, `metodo_pago`, `notas` — estos 4 campos **solo los edita el equipo organizador a mano desde `/admin`**, nunca vienen del formulario público.
- `comprobante_url` — link al comprobante de depósito.
- `detalle_extra` (jsonb) — respuestas del Google Form que no son datos clave de contacto (alergias, motivación, hijos, colegio RC, etc.), agrupadas en un solo campo porque el CRM no necesita filtrar por ellas individualmente.
- Restricción única: `(retreat_id, email_esposa, email_marido)` — evita duplicados si el script de carga se ejecuta dos veces (usa `upsert`, no `insert`).

## Storage

- **Bucket:** `site-images`, público (`supabase/migrations/0003_storage.sql`).
- **Uso:** el panel `/admin` sube ahí todas las fotos editables del sitio (hero, historia, guías, franja de fotos, imagen de SEO).
- Las subidas siempre pasan por un Server Action con la service role key — no hay forma de escribir en el bucket directo desde el navegador, así que no hacen falta policies de escritura para `anon` en `storage.objects`.

## Columnas "muertas" (dejadas a propósito, no borrar sin revisar)

Dos decisiones de producto dejaron columnas sin uso en vez de borrarlas, para no perder datos ya cargados:
- `retreat_guias.foto_url` y `foto_forma` — la sección "Quiénes los acompañan" pasó de una tarjeta por guía a una sola foto grupal (`retreats.guias_foto_url`).
- `retreat_videos.youtube_id` y `portada_url` — los testimonios en video se reemplazaron por tarjetas de solo texto (cita + nombre + bajada).

Si en algún momento se recupera cualquiera de esos dos formatos, los datos antiguos podrían seguir ahí (no verificado — revisar antes de asumir que están intactos).
