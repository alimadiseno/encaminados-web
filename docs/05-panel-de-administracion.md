# Panel de administración y accesos internos

El sitio tiene dos áreas privadas, independientes entre sí, pensadas para que el equipo organizador (no técnico) pueda operar sin tocar código.

## Cómo funciona la autenticación

No hay usuarios individuales ni proveedor de login externo (no Auth0/Clerk/Supabase Auth). Es un esquema simple de **clave compartida + cookie**, implementado en `lib/session-auth.ts` y reutilizado por ambos paneles:

1. Se define una clave (password) por panel, guardada como variable de entorno secreta.
2. Al ingresar la clave correcta, el servidor guarda una cookie `HttpOnly` con el **hash SHA-256** de esa clave (no la clave en texto plano).
3. En cada visita, se compara el hash de la cookie contra el hash de la clave vigente — si coincide, hay sesión válida por 30 días.
4. Cambiar la variable de entorno de la clave invalida automáticamente todas las sesiones activas de ese panel (el hash guardado en las cookies ya no va a coincidir).

Esto significa que **la única manera de revocar el acceso de alguien es cambiar la clave** (no hay logout individual por persona ni lista de usuarios) — cambiarla afecta a todo el mundo que la tenga.

## `/admin` — edición de contenido + gestión de inscritos

- **Clave:** variable `ADMIN_PASSWORD` (ver [01-hosting-y-despliegue.md](01-hosting-y-despliegue.md) para dónde está guardada).
- **Quién debería tener esta clave:** el equipo organizador (para editar contenido y ver inscritos) y Alima Diseño.
- **No indexado:** `robots: { index: false, follow: false }` — no aparece en buscadores, pero la URL no es secreta por sí sola (la protección real es la clave).

### Qué se puede editar sin tocar código

El panel (`components/admin/RetreatEditor.tsx`) tiene 5 vistas:

| Vista | Contenido editable |
|---|---|
| **General** | Nombre del retiro, URL de inscripción (el Google Form), WhatsApp + mensaje pre-cargado, email de contacto — datos que se repiten en varios lugares del sitio |
| **Contenido** | Todas las secciones de la landing, organizadas en pestañas: Hero, "Qué es Encaminados" (+ cinta animada), Testimonios, "Quiénes los acompañan", Franja de fotos, Nuestra historia, Información Clave (fechas/lugar/costo/cupos), Preguntas frecuentes |
| **Documentos sitio privado** | El link de la carpeta de Google Drive que se muestra en `/guias` |
| **Inscritos** | Ver, filtrar por fecha, editar estado de pago/monto/notas, agregar inscritos manualmente, y descargar los 4 reportes (Excel/PDF) — ver [04-integraciones-y-flujo-de-inscripcion.md](04-integraciones-y-flujo-de-inscripcion.md) |
| **SEO** | Título, descripción e imagen que se muestran al compartir el link (Google, WhatsApp, Facebook) |

Detalles de comportamiento a tener en cuenta:
- El botón **"Guardar cambios"** guarda **todas** las secciones a la vez (una sola Server Action, `app/admin/actions.ts`), no solo la pestaña que se está viendo — si alguien deja una pestaña a medio llenar y guarda, ese cambio a medias también se guarda.
- Las fotos se suben como archivos (`<input type="file">`) directo al bucket `site-images` de Supabase Storage; el límite de tamaño de la Server Action está subido a 50MB (`next.config.ts`) porque el formulario puede llevar varias fotos de celular a la vez.
- Los textos marcados como "pendientes de confirmar" (ej. la historia, mientras el cliente no manda el texto final) se muestran en cursiva en el sitio público — hay un checkbox para eso en la sección "Nuestra historia".

## `/guias` — documentos para guías y monitores

- **Clave:** variable `GUIAS_PASSWORD` (distinta de la de `/admin`).
- **Quién debería tener esta clave:** guías y monitores del retiro (no el público general).
- **Qué muestra:** únicamente la carpeta de Google Drive incrustada configurada desde `/admin` (ver [04-integraciones-y-flujo-de-inscripcion.md](04-integraciones-y-flujo-de-inscripcion.md)). Si no hay carpeta configurada, la sección se ve vacía.
- No permite editar nada — es solo lectura de documentos.

## Cómo cambiar cualquiera de las dos claves

1. Generar una clave nueva (recomendado: frase simple de recordar para el equipo organizador, no hace falta que sea compleja tipo password de sistema — igual queda hasheada en la cookie).
2. Actualizarla en Cloudflare (dashboard → `encaminados-web` → Settings → Variables, o `wrangler secret put ADMIN_PASSWORD` / `wrangler secret put GUIAS_PASSWORD`).
3. Actualizarla también en `.env.local` / `.dev.vars` de quienes desarrollen localmente, si corresponde.
4. Avisar a quienes deban usar la clave nueva — las sesiones viejas quedan invalidadas solas.

## Qué NO cubre el panel de administración

- No se pueden agregar ni quitar **secciones** de la landing (el orden y la existencia de bloques están fijos en `app/page.tsx`) — solo se edita el contenido dentro de cada sección existente.
- No hay gestión de múltiples retiros en paralelo todavía (ver [02-base-de-datos.md](02-base-de-datos.md)) — el panel siempre edita el único retiro destacado (`RETIRO_DESTACADO`).
- No procesa pagos ni envía confirmaciones automáticas por email/WhatsApp a quien se inscribe — eso sigue siendo manual por parte del equipo organizador.
