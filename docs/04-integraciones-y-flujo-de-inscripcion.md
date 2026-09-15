# Integraciones externas y flujo de inscripción

## Cómo se inscribe alguien hoy (importante: no es lo que decía el brief original)

El [brief de diseño](07-brief-original-de-diseno.md) original planteaba resolver la inscripción y el pago con **Supabase + Flow/Mercado Pago** como checkout propio. Eso **no se implementó así**. El flujo real, ya en producción, es:

1. El botón "Inscribirme" del sitio (`retreat.inscripcionUrl`, editable desde `/admin`) apunta a un **Google Form externo**, no a una pantalla del sitio.
2. Ese Google Form tiene una hoja de cálculo de Google Sheets enlazada.
3. Un **script de Google Apps Script**, pegado en esa hoja de cálculo, se dispara en el trigger `onFormSubmit` y llama por HTTP (`UrlFetchApp.fetch()`) al endpoint propio `POST /api/inscritos` (`app/api/inscritos/route.ts`).
4. Ese endpoint valida un secreto compartido (`INSCRITOS_WEBHOOK_SECRET`, enviado en el body como `secret`) y hace un `upsert` en la tabla `inscritos` de Supabase.
5. El pago **no se procesa en el sitio**: se maneja por transferencia/otro medio externo, y el equipo organizador marca manualmente el estado de pago (`pendiente` / `parcial` / `pagado`), el monto y notas desde el panel `/admin` → pestaña **Inscritos**.

### Dónde vive cada pieza de esta integración

| Pieza | Dónde está | Quién la administra |
|---|---|---|
| El Google Form (preguntas, diseño) | Google Forms — no está en este repo | Equipo organizador / cliente |
| El script de Apps Script | Dentro de la hoja de cálculo de Google Sheets enlazada al Form (Extensiones → Apps Script) | Equipo organizador / quien configuró el Form |
| El secreto compartido | Variable `INSCRITOS_WEBHOOK_SECRET` — en Cloudflare (producción) y hardcodeado en el script de Apps Script | Alima Diseño genera el valor; debe coincidir en ambos lados |
| El endpoint receptor | `app/api/inscritos/route.ts`, en este repo | Alima Diseño |

**Si se pierde el acceso al Google Form o al script de Apps Script**, hay que reconstruirlos desde cero apuntando al mismo endpoint, con los mismos nombres de campo esperados por el `POST /api/inscritos`:

```
nombreEsposa, emailEsposa, telefonoEsposa,
nombreMarido, emailMarido, telefonoMarido,
fechaElegida, comprobanteUrl, fechaInscripcion (opcional),
detalleExtra (objeto libre, opcional), secret
```

Los campos `nombreEsposa`, `emailEsposa`, `nombreMarido`, `emailMarido` y `fechaElegida` son obligatorios; sin ellos el endpoint responde `400`.

### Por qué es un `upsert` y no un `insert`

Si el script de carga inicial (o cualquier reintento) se corre dos veces sobre la misma respuesta, la segunda vuelta no duplica la fila. La clave de conflicto es `(retreat_id, email_esposa, email_marido)`. A propósito, el upsert **no toca** `estado_pago`, `monto`, `metodo_pago` ni `notas` — esos campos solo los edita el equipo organizador a mano, así que si la fila ya existía, el reintento del formulario no pisa ese trabajo manual.

## Google Drive — documentos para guías

- La sección `/guias` (protegida por clave, ver [05-panel-de-administracion.md](05-panel-de-administracion.md)) muestra una carpeta de Google Drive **incrustada** (`<iframe>`, formato `embeddedfolderview` de Drive), en vez de duplicar archivos en Supabase Storage.
- El link de la carpeta se configura desde `/admin` → pestaña "Documentos sitio privado" (campo `documentos_drive_url` en la tabla `retreats`).
- **Requisito importante:** la carpeta de Drive tiene que estar compartida como *"Cualquiera con el enlace puede ver"*. Si el cliente restringe el acceso de la carpeta, los guías verán un aviso de acceso denegado dentro del iframe aunque ya hayan iniciado sesión correctamente en `/guias` — es un error de permisos de Drive, no del sitio.
- Lógica de conversión de link → embed: `lib/drive.ts`.

## WhatsApp

- Botón flotante de WhatsApp (`components/FloatingWhatsapp.tsx`) y links en el footer/logística, construidos con `https://wa.me/<número>` a partir de `retreat.contacto.whatsapp` (editable desde `/admin` → "General").
- El mensaje pre-cargado del link también es editable (`retreat.contacto.whatsappMensaje`).

## Exportación de datos (reportes internos, no integraciones externas en vivo)

Desde `/admin` → pestaña **Inscritos**, el equipo organizador puede descargar:

| Reporte | Formato | Endpoint | Para qué |
|---|---|---|---|
| Excel completo | `.xlsx` (`exceljs`) | `GET /api/admin/inscritos/completo` | Todas las columnas, incluye pagos y notas internas |
| Contactos para Mailchimp | `.xlsx` | `GET /api/admin/inscritos/contactos` | Una fila por persona (no por pareja), pensado para importar a Mailchimp u otra plataforma de email |
| Fichas de pareja para monitores | `.pdf` (`@react-pdf/renderer`) | `GET /api/admin/inscritos/fichas` | Una ficha por pareja, para el equipo de monitores durante el retiro |
| Alergias/restricciones para cocina | `.pdf` | `GET /api/admin/inscritos/alergias` | Filtra solo respuestas afirmativas de alergias, agrupado por fecha de sesión |

Todos estos endpoints exigen sesión válida de `/admin` (misma cookie que el panel).

## Analítica / tracking

No hay Google Analytics, Meta Pixel, ni ninguna herramienta de analítica o tracking instalada en el código a la fecha de este documento. Si se quiere medir tráfico o conversión del CTA "Inscribirme", hay que agregarlo — no existe hoy.

## SEO

- `app/sitemap.ts` y `app/robots.ts` generan sitemap/robots automáticamente.
- `components/EventStructuredData.tsx` agrega JSON-LD de tipo `Event`, con las fechas tomadas directo de `retreat.fechas` (editable desde `/admin`) — así Google puede mostrar la fecha del evento directamente en resultados de búsqueda.
- Título, descripción e imagen de Open Graph se arman en `generateMetadata()` (`app/page.tsx`) a partir del campo `seo` del retiro (editable desde `/admin` → pestaña "SEO"), con fallback automático a la bajada/imagen del hero si el cliente no llena esos campos.
