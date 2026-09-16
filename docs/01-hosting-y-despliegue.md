# Hosting y despliegue

## Dónde vive el sitio

- **Proveedor:** Cloudflare Workers (no Vercel, aunque el proyecto se creó con `create-next-app`).
- **Nombre del Worker:** `encaminados-web` (definido en `wrangler.jsonc`).
- **Dominio de producción:** `encaminados.cl` — el DNS y el dominio se administran desde el dashboard de Cloudflare de la cuenta que aloja el proyecto.
- **Adaptador usado:** [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) — convierte el build de Next.js en algo que corre como Cloudflare Worker (Next.js "puro" no corre nativo en Workers).

Para encontrar el proyecto en Cloudflare: dashboard de Cloudflare → **Workers & Pages** → `encaminados-web`.

## Cómo se despliega

Scripts relevantes en `package.json`:

```bash
npm run dev       # desarrollo local (next dev)
npm run build     # build de Next.js
npm run preview   # build + preview local corriendo como Worker (opennextjs-cloudflare)
npm run deploy    # build + deploy directo a Cloudflare (opennextjs-cloudflare deploy)
npm run upload    # build + sube una nueva versión sin promoverla a producción
```

El comentario en `wrangler.jsonc` indica que el repo está conectado a un **pipeline de Git en Cloudflare** (Cloudflare Workers Builds): cada push a la rama principal dispara un build y deploy automático. Esto es importante porque:

> Cualquier variable de entorno puesta *solo* en el dashboard de Cloudflare (y no en `wrangler.jsonc`) se pierde en el siguiente deploy que dispare ese pipeline.

**Antes de cambiar variables de entorno de producción**, confirmar en el dashboard de Cloudflare (Workers & Pages → `encaminados-web` → Settings → Build) si la integración de Git sigue activa y qué rama dispara el deploy.

## Variables de entorno y secretos

El proyecto usa dos mecanismos distintos según el tipo de dato:

### 1. Variables públicas — en `wrangler.jsonc` (commiteadas al repo)

```jsonc
"vars": {
  "SUPABASE_URL": "https://rckjlzzxeyjkvdbzdkpx.supabase.co",
  "SUPABASE_ANON_KEY": "sb_publishable__tWNQ6UCc_77iBa2Mk7QrA_54IiAjzP"
}
```

Están a propósito en texto plano en el repo. La URL y la llave "anon/publishable" de Supabase **están diseñadas para ser públicas** — cualquiera puede verlas en el HTML/JS del sitio de todas formas. Su seguridad depende de las *policies* de Row Level Security (RLS) en Supabase, no de mantenerlas ocultas (ver [02-base-de-datos.md](02-base-de-datos.md)).

### 2. Secretos reales — vía `wrangler secret put` (NO en el repo)

Estas variables sí deben mantenerse privadas. Se configuran directo en Cloudflare (dashboard → Settings → Variables, o `wrangler secret put <NOMBRE>` desde la terminal con acceso a la cuenta):

| Variable | Para qué sirve |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Llave de Supabase que ignora RLS. La usan el panel `/admin` y el webhook de inscripciones para leer/escribir sin restricciones. **Nunca debe llegar al navegador.** |
| `ADMIN_PASSWORD` | Clave compartida para entrar a `/admin` (edición de contenido). |
| `GUIAS_PASSWORD` | Clave compartida para entrar a `/guias` (documentos para guías/monitores). |
| `INSCRITOS_WEBHOOK_SECRET` | Secreto que valida las llamadas del script de Google Apps Script al endpoint `/api/inscritos` (ver [04-integraciones-y-flujo-de-inscripcion.md](04-integraciones-y-flujo-de-inscripcion.md)). |

Los valores reales de estos cuatro secretos **no están en este documento** — viven en el dashboard de Cloudflare de la cuenta del proyecto y, para desarrollo local, en `.env.local` / `.dev.vars` (ambos ignorados por Git). Si se pierden, hay que generarlos de nuevo y volver a cargarlos en ambos lugares (Cloudflare + archivos locales de quien desarrolle).

### Desarrollo local

- `.env.local` — usado por `next dev` normal.
- `.dev.vars` — usado por `opennextjs-cloudflare preview` (emula el entorno de Worker).
- Ambos archivos tienen las mismas 6 variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `GUIAS_PASSWORD`, `INSCRITOS_WEBHOOK_SECRET`.
- Ninguno de los dos está commiteado (ver `.gitignore`); no existe un `.env.example` en el repo — si se necesita, conviene crear uno con los nombres de variable (sin valores) para nuevas personas que clonen el proyecto.

## Por qué Cloudflare Workers y no Vercel/otro hosting

El proyecto se generó con `create-next-app` (de ahí el README genérico que menciona Vercel), pero se decidió alojar en Cloudflare Workers. Puntos a tener en cuenta por esa elección:

- Las imágenes usan `images.unoptimized: true` en `next.config.ts` — se evita el binding de pago "Cloudflare Images"; las fotos se sirven pre-optimizadas en WebP directamente.
- El código de acceso a variables de entorno (`lib/supabase.ts`, `lib/session-auth.ts`) primero intenta leer desde `getCloudflareContext()` (el binding `env` de Workers) y solo si falla cae a `process.env` — esto es necesario porque en Cloudflare Workers las variables no llegan por `process.env` como en Node.js normal.
- Hay un **service binding** (`WORKER_SELF_REFERENCE`) que apunta el Worker a sí mismo — lo requiere OpenNext para su sistema de caché/revalidación (ver [documentación de OpenNext sobre caching](https://opennext.js.org/cloudflare/caching)).

## Mantener viva la base de datos (Supabase free tier)

El plan gratuito de Supabase pausa el proyecto tras 7 días sin actividad. Hay **dos mecanismos independientes** que hacen ping al mismo endpoint liviano para evitarlo — `app/api/ping/route.ts`, una ruta que solo responde OK, sin lógica de negocio:

### 1. GitHub Action (dentro del repo)

- **Archivo:** `.github/workflows/keep-alive.yml`
- **Qué hace:** cada 3 días (`cron: "0 12 */3 * *"`, también disparable a mano con "Run workflow" en la pestaña **Actions** de GitHub), hace un `curl` a `https://encaminados.cl/api/ping`.
- **Limitación conocida:** GitHub **desactiva automáticamente** los workflows programados (`schedule`) de un repositorio que lleva 60 días sin actividad (sin commits/pushes) — hay que reactivarlo a mano desde la pestaña Actions si eso pasa. Como este proyecto ya está terminado y puede pasar mucho tiempo sin commits, este mecanismo por sí solo no es confiable a largo plazo.

### 2. Cron externo (respaldo permanente, fuera de GitHub)

Por la limitación anterior, se agregó un segundo ping independiente en **[cron-job.org](https://cron-job.org)**, que no depende de la actividad del repositorio y no vence.

- **Cuenta administradora:** `hola@alima.cl`.
- **Qué hace:** llama periódicamente al mismo endpoint, `https://encaminados.cl/api/ping`.
- **Por qué mantener ambos:** son redundantes a propósito — si uno falla o se desactiva (ej. el de GitHub por inactividad), el otro sigue sosteniendo la base de datos despierta.

Si en algún momento se pierde el acceso a la cuenta de cron-job.org, hay que volver a crear el cron job ahí (o en un servicio equivalente) apuntando al mismo endpoint — no requiere ningún secreto ni autenticación, es un `GET` público.

## Regla de Rate Limiting en Cloudflare (`/admin` y `/guias`)

El login de `/admin` y `/guias` tiene un límite básico de intentos fallidos a nivel de aplicación (`lib/session-auth.ts`: 5 intentos fallidos bloquean 15 minutos, vía una cookie `httpOnly`). Eso frena a alguien probando claves a mano o con un script simple, pero **no protege contra un atacante que descarta la cookie en cada request** — el proyecto no tiene ningún binding de almacenamiento (KV/D1) para llevar un contador server-side de verdad, así que no había forma de hacer algo más fuerte solo con código.

Para eso se configuró además una regla de **Rate Limiting** de Cloudflare (WAF) — limita por IP a nivel de red, sin depender de cookies.

**Dónde está:** dashboard de Cloudflare → dominio `encaminados.cl` → **Security → WAF → Rate limiting rules**.

**Cómo quedó configurada** — el plan gratuito de Cloudflare permite **una sola regla** de este tipo, y tanto el período de conteo como la duración del bloqueo vienen topados en 10 segundos (no hay ventanas más largas sin plan Pro). Por el límite de una sola regla, ambas rutas quedan cubiertas en la misma:

```
(http.request.uri.path eq "/admin" and http.request.method eq "POST") or (http.request.uri.path eq "/guias" and http.request.method eq "POST")
```

- **Requests:** 5 — **Period:** 10 segundos
- **Action:** Block — **Duration:** 10 segundos

**Limitación conocida:** con un bloqueo de solo 10 segundos, no frena a un atacante de forma prolongada, pero sí lo obliga a ir mucho más lento — ya no puede mandar ráfagas ilimitadas por segundo. Combinado con el límite de 15 minutos a nivel de aplicación, es una mejora real aunque más modesta de lo ideal. Si en algún momento el proyecto sube a un plan pago (Pro), vale la pena reconfigurar esta regla con una ventana más larga (ej. 15 minutos) y, si se prefiere, separar `/admin` y `/guias` en dos reglas independientes.

## Resumen de cuentas involucradas

Para que quien retome el proyecto sepa dónde pedir accesos:

| Servicio | Para qué | Quién debería tener acceso |
|---|---|---|
| Cloudflare | Hosting del Worker, DNS del dominio `encaminados.cl`, variables/secretos de producción | Alima Diseño (equipo de desarrollo) |
| GitHub | Repositorio `alimadiseno/encaminados-web`, Actions (keep-alive) | Alima Diseño |
| Supabase | Base de datos y storage | Alima Diseño (y potencialmente el cliente, si se le da acceso de solo lectura al dashboard) |
| cron-job.org | Ping de respaldo a `/api/ping` para que Supabase no se pause (ver más abajo) | `hola@alima.cl` (Alima Diseño) |
| Registrador del dominio `encaminados.cl` | Renovación del dominio | **NIC.cl** — el dominio lo compró y lo administra el cliente (Regnum Christi Chile) directamente, no Alima. La renovación es responsabilidad de ellos; Alima no tiene acceso a esa cuenta ni gestiona el pago. |
