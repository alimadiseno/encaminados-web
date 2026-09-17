# Encaminados — Resumen del proyecto

> Documento de referencia general. El resto de la documentación técnica vive en archivos separados en esta misma carpeta (`docs/`), pensados para subirse a Notion como páginas propias.

## Qué es

**Encaminados** es la landing de inscripción de un retiro espiritual (católico, Regnum Christi / #familiaRC) para matrimonios, que se realiza 1–2 veces al año en el Centro de Espiritualidad de Lo Vásquez, Chile.

Es un sitio de una sola página (landing, scroll continuo) cuyo único objetivo es lograr inscripciones — no es informativo ni institucional. Todo el copy y el diseño empujan hacia el formulario de inscripción externo (Google Form).

Cliente: parroquia / equipo organizador de Encaminados (Regnum Christi Chile).
Diseño y desarrollo: **Alima Diseño** ([alima.cl](https://alima.cl)) — crédito visible en el footer del sitio.

## Enlaces clave

| Recurso | Dónde está |
|---|---|
| Sitio en producción | https://encaminados.cl |
| Repositorio de código | https://github.com/alimadiseno/encaminados-web |
| Hosting | Cloudflare Workers (ver [01-hosting-y-despliegue.md](01-hosting-y-despliegue.md)) |
| Base de datos | Supabase (ver [02-base-de-datos.md](02-base-de-datos.md)) |
| Panel de administración de contenido | https://encaminados.cl/admin |
| Panel de guías y monitores | https://encaminados.cl/guias |
| Brief de diseño original | [07-brief-original-de-diseno.md](07-brief-original-de-diseno.md) |

## Stack técnico (resumen)

- **Framework:** Next.js 16 (App Router, React 19, Server Actions), TypeScript.
- **Estilos:** Tailwind CSS v4 (tokens definidos en `app/globals.css`; ver [03-sistema-de-diseno.md](03-sistema-de-diseno.md)).
- **Hosting:** Cloudflare Workers, vía [OpenNext](https://opennext.js.org/cloudflare) (adapta Next.js para correr como Worker).
- **Base de datos:** Supabase (Postgres + Storage), plan gratuito.
- **Autenticación de paneles internos:** sesión propia por cookie + clave compartida (sin proveedor externo de auth — ver [05-panel-de-administracion.md](05-panel-de-administracion.md)).
- **Inscripciones:** Google Form externo → Google Apps Script → webhook propio → tabla `inscritos` en Supabase (ver [04-integraciones-y-flujo-de-inscripcion.md](04-integraciones-y-flujo-de-inscripcion.md)). No hay pasarela de pago integrada en el sitio.
- **Generación de reportes:** Excel (`exceljs`) y PDF (`pdfkit` directo, sin `@react-pdf/renderer` — ver nota en [06-mantenimiento-y-pendientes.md](06-mantenimiento-y-pendientes.md)) para el equipo organizador, generados desde el panel admin.

## Estructura del código (carpetas principales)

```
app/                 Rutas (App Router): landing, /admin, /guias, /api/*
components/          Componentes de UI de la landing + admin/ y guias/
data/retreats.ts     Punto de entrada al contenido (lee de Supabase)
types/retreat.ts     Modelo de datos "RetreatEvent" (el contrato de contenido)
lib/                 Supabase, autenticación de sesión, export a Excel/PDF
supabase/migrations/ Historial versionado del esquema de la base de datos
docs/                Esta documentación + el brief de diseño original
reference/           HTML de referencia entregado por el cliente (histórico)
```

## Para retomar el proyecto más adelante

Si alguien nuevo (o el mismo equipo, tiempo después) necesita volver a tocar este proyecto, el orden de lectura recomendado es:
1. Este documento (contexto general).
2. [01-hosting-y-despliegue.md](01-hosting-y-despliegue.md) — cómo se publica el sitio y dónde viven las variables/secretos.
3. [02-base-de-datos.md](02-base-de-datos.md) — el modelo de datos y cómo aplicar cambios de esquema.
4. [05-panel-de-administracion.md](05-panel-de-administracion.md) — cómo el cliente edita el contenido sin tocar código.
5. [06-mantenimiento-y-pendientes.md](06-mantenimiento-y-pendientes.md) — deuda técnica conocida y cosas a vigilar.
6. [07-brief-original-de-diseno.md](07-brief-original-de-diseno.md) — opcional: el brief con el que arrancó el proyecto (útil para entender decisiones de contenido, no refleja el estado final del diseño ni del flujo de inscripción — ver notas al respecto en [03-sistema-de-diseno.md](03-sistema-de-diseno.md) y [04-integraciones-y-flujo-de-inscripcion.md](04-integraciones-y-flujo-de-inscripcion.md)).
