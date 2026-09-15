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

## Deuda técnica y decisiones conocidas (para no perder el porqué)

- **El flujo de inscripción real difiere del brief original.** El brief menciona Supabase + Flow/Mercado Pago como checkout propio; lo que quedó implementado es Google Form + Apps Script + webhook, con pago y confirmación manual. Ver [04-integraciones-y-flujo-de-inscripcion.md](04-integraciones-y-flujo-de-inscripcion.md). Si en el futuro se quiere automatizar el pago, este es el punto de partida a reemplazar.
- **Columnas sin uso en la base de datos, dejadas a propósito:** `retreat_guias.foto_url`/`foto_forma` y `retreat_videos.youtube_id`/`portada_url` — ver [02-base-de-datos.md](02-base-de-datos.md) para el contexto de por qué no se borraron.
- **Solo existe un retiro a la vez.** El modelo de datos y el código (`getFeaturedRetreat()`) ya están pensados para soportar varios retiros en paralelo con una página `/eventos`, pero esa vista no se construyó — si el cliente empieza a hacer 2 versiones del retiro en fechas muy distintas con contenido distinto (no solo una fecha alternativa), vale la pena retomar esa idea.
- **Sin analítica instalada.** No hay Google Analytics ni ninguna herramienta de medición — si se quiere saber cuánta gente hace clic en "Inscribirme", hay que agregarlo.
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
