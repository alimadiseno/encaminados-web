# Mantenimiento y pendientes

## Chequeos periódicos recomendados

| Qué revisar | Frecuencia sugerida | Por qué |
|---|---|---|
| Que el cron job de cron-job.org (cuenta `hola@alima.cl`) siga activo | Cada pocos meses | Es el respaldo permanente que mantiene viva la base de datos — no vence, pero puede desactivarse si la cuenta cambia o el job se pausa manualmente ([01-hosting-y-despliegue.md](01-hosting-y-despliegue.md)) |
| Que el workflow `Keep Supabase awake` siga corriendo (pestaña Actions en GitHub) | Cada pocos meses, o si el sitio deja de mostrar contenido dinámico | GitHub desactiva solo los `schedule` de Actions tras 60 días sin commits en el repo — por eso existe el cron externo como respaldo |
| Renovación del dominio `encaminados.cl` | Anual (fecha exacta a confirmar con el registrador) | Un dominio vencido tumba el sitio aunque el hosting siga funcionando |
| Plan gratuito de Supabase — límites de uso (filas, storage, transferencia) | Cada pocos meses | El proyecto es pequeño, pero si crece mucho el volumen de inscritos/fotos puede acercarse a los límites del free tier |
| Que la carpeta de Google Drive de `/guias` siga compartida como "Cualquiera con el enlace" | Cuando el cliente reporte error de acceso en `/guias` | Es la causa más probable si guías/monitores ven "acceso denegado" ahí adentro |
| Vigencia de las claves de `/admin` y `/guias` | Si hay cambio de equipo organizador | Revocar acceso a quien ya no debería tenerlo (ver [05-panel-de-administracion.md](05-panel-de-administracion.md)) |

## Cuándo hacer backup (por hito, no por calendario)

### Datos (Supabase)

El plan gratuito de Supabase normalmente no incluye backups automáticos (confirmar en el dashboard) — sin un backup manual, hoy no hay ninguna red de respaldo para estos datos. Ojo además: `estado_pago`, `monto`, `metodo_pago` y `notas` de `inscritos` **solo existen en Supabase** — el resto de las respuestas del formulario también queda en la Google Sheet del cliente (respaldo natural), pero ese trabajo de seguimiento de pagos que se hace a mano en `/admin` no.

En vez de una frecuencia fija, hacerlo en estos dos momentos:
- **Al cerrar un proceso de inscripción** — correr `node scripts/backup-supabase.mjs` y además descargar el Excel "Completo para admin" desde `/admin` → Inscritos → Exportar datos (es el archivo histórico legible; el JSON del script es más bien la copia técnica cruda).
- **Antes de abrir el siguiente proceso** (crear el próximo retiro en el panel) — en cuanto cambie el retiro destacado, los inscritos del ciclo anterior dejan de verse en `/admin` (siguen en la base, pero el panel deja de mostrarlos).

Cómo correrlo: `node scripts/backup-supabase.mjs` desde la raíz del proyecto — lee las credenciales de `.env.local` (nunca hay que escribirlas a mano) y guarda todas las tablas en `/backups/<fecha>/`. Esa carpeta está en `.gitignore` a propósito — tiene datos personales reales de las familias inscritas y nunca debe subirse a git.

### Código (Git)

Cada push ya queda guardado para siempre en GitHub — eso ya es el backup, sin necesidad de nada extra. Cloudflare además conserva las versiones desplegadas anteriores en su propio panel (Workers & Pages → `encaminados-web` → Deployments).

Un tag (`git tag`) no es una copia de seguridad, es un **marcador humano** para señalar un punto que importa — un lanzamiento, o justo antes de un cambio grande/riesgoso. Ponerle tag a cada ajuste chico de interfaz le quita valor a la señal; para cambios normales, los commits regulares (que ya pasan solos con cada push) alcanzan de sobra.

## Deuda técnica y decisiones conocidas (para no perder el porqué)

- **El flujo de inscripción real difiere del brief original.** El brief menciona Supabase + Flow/Mercado Pago como checkout propio; lo que quedó implementado es Google Form + Apps Script + webhook, con pago y confirmación manual. Ver [04-integraciones-y-flujo-de-inscripcion.md](04-integraciones-y-flujo-de-inscripcion.md). Si en el futuro se quiere automatizar el pago, este es el punto de partida a reemplazar.
- **Columnas sin uso en la base de datos, dejadas a propósito:** `retreat_guias.foto_url`/`foto_forma` y `retreat_videos.youtube_id`/`portada_url` — ver [02-base-de-datos.md](02-base-de-datos.md) para el contexto de por qué no se borraron.
- **Solo existe un retiro a la vez.** El modelo de datos y el código (`getFeaturedRetreat()`) ya están pensados para soportar varios retiros en paralelo con una página `/eventos`, pero esa vista no se construyó — si el cliente empieza a hacer 2 versiones del retiro en fechas muy distintas con contenido distinto (no solo una fecha alternativa), vale la pena retomar esa idea.
  - **Consecuencia concreta en `/admin`, pedida por Fernando (2026-09-15):** `getInscritos(retreat.id)` en `lib/inscritos.ts` solo trae los inscritos del retiro destacado — al crear el próximo retiro y cambiar `RETIRO_DESTACADO`, los inscritos del ciclo anterior siguen en la base pero el panel deja de mostrarlos. Se pidió poder seguir viendo/comparando inscritos de ciclos anteriores (evolución entre fechas). No hace falta la página pública `/eventos` completa para esto — alcanza con agregar un selector de retiro/ciclo en la vista Inscritos del panel (o traer inscritos de todos los retiros y filtrar ahí), bastante más acotado.
- **Google Analytics instalado (2026-09-15).** GA4, propiedad a nombre del cliente (Alima con acceso de Editor) — ver [04-integraciones-y-flujo-de-inscripcion.md](04-integraciones-y-flujo-de-inscripcion.md). Corre también en `/admin` y `/guias`, sin excluir esas rutas — si en algún momento las visitas del propio equipo empiezan a distorsionar los reportes, vale la pena filtrarlas (excluir por ruta, o por IP interna en GA).
- **Los PDF de `/admin` se generan con `pdfkit` directo, no con `@react-pdf/renderer` (cambiado 2026-09-17).** La librería original nunca había funcionado en producción — solo se probó con `next dev`, que corre en Node.js normal, y no en el Worker de Cloudflare real. Al probarlo en el entorno real aparecieron dos incompatibilidades: (1) pdfkit carga sus 14 fuentes estándar ("Helvetica", etc.) con un import dinámico de Node (`#standard-fonts/*`) que el bundler de Cloudflare Workers no resuelve — se corrigió parchando `pdfkit` con `patch-package` (`patches/pdfkit+0.20.2.patch`, se reaplica solo vía el script `postinstall`); (2) el motor de layout de `@react-pdf/renderer` (`yoga-layout`) compila WebAssembly en tiempo de ejecución, y Cloudflare Workers bloquea eso en producción por seguridad — no tiene arreglo simple (se intentó precompilar el `.wasm` como módulo real, pero ni Turbopack ni el bundler de OpenNext saben cargar archivos `.wasm`). La solución fue sacar `@react-pdf/renderer` del todo y reescribir `lib/pdf/fichas-monitores.ts` y `lib/pdf/alergias-cocina.ts` usando la API de `pdfkit` directamente (incluye su feature de tablas nativo, `doc.table()`, para el PDF de alergias). Si se necesita otro PDF a futuro, seguir este mismo patrón (pdfkit directo) en vez de reintroducir `@react-pdf/renderer`.
- **Sin `.env.example`.** El repo no tiene un archivo de ejemplo con los nombres de variables de entorno para gente nueva que clone el proyecto — solo están documentados acá y en `.env.local`/`.dev.vars` (no versionados). Considerar agregar un `.dev.vars.example` con los nombres (sin valores) si se suma más gente al proyecto.

## Checklist de contenido que quedaba pendiente al momento del brief

Estos ítems estaban marcados como "pendientes de pedir al cliente" en el brief de diseño original ([07-brief-original-de-diseno.md](07-brief-original-de-diseno.md)). Como el contenido hoy vive en Supabase y se edita desde `/admin`, **no se puede confirmar desde el código si ya se resolvieron** — hay que revisar directamente en la pestaña "Contenido" del panel admin o en el sitio en vivo:

- [ ] Foto de fondo real del hero (el brief pedía evitar degradé ilustrativo)
- [ ] Testimonios: el formato cambió de "3 videos de YouTube" a tarjetas de solo texto (cita + nombre + bajada) — confirmar que este cambio de formato fue una decisión consciente y no solo una simplificación temporal
- [ ] Nombre y foto del sacerdote acompañante / matrimonio guía — la sección terminó como una sola foto grupal sin nombres individuales; confirmar si eso cumple el objetivo original de "generar confianza mostrando quién guía"
- [ ] Texto de "Nuestra historia" (200–300 palabras) — el panel admin tiene un checkbox para marcar este texto como "pendiente de confirmar" (se muestra en cursiva); revisar si sigue marcado
- [ ] Decisión sobre mostrar el costo abierto en la web vs. manejarlo por WhatsApp/correo
- [ ] Decisión sobre cuotas sin interés vs. cuotas normales (no aplica si el pago sigue siendo 100% manual, ver arriba)

## Contactos y responsables

| Rol | Quién | Contacto |
|---|---|---|
| Diseño y desarrollo | Alima Diseño | [alima.cl](https://alima.cl) |
| Cliente / equipo organizador | Regnum Christi Chile — Encaminados | WhatsApp y email configurados en `/admin` → "General" (ver también el footer del sitio) |

## Si alguien nuevo retoma este proyecto

1. Pedir acceso a: repo de GitHub, cuenta de Cloudflare, proyecto de Supabase, y las claves de `/admin` y `/guias`.
2. Leer esta carpeta `docs/` completa (empezando por [00-resumen-proyecto.md](00-resumen-proyecto.md)).
3. Clonar el repo, copiar los nombres de variable de este documento a un `.env.local` y `.dev.vars` propios, y pedir los valores reales a quien tenga acceso a Cloudflare.
4. Correr `npm install` y `npm run dev` para levantar el entorno local.
5. Antes de tocar el esquema de Supabase, revisar `supabase/migrations/` completo para entender el historial de decisiones — varios cambios de esquema documentan explícitamente *por qué* se hicieron así y no de otra forma.
