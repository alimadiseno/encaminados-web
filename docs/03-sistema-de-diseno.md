# Sistema de diseño

> Fuente de verdad: `app/globals.css` (tokens de Tailwind v4) + `data/retreats.ts` / panel `/admin` para el contenido. El [brief original](07-brief-original-de-diseno.md) planteaba diseñar la landing en Figma, pero el diseño se terminó de afinar directamente en código (Claude Code), iterando sobre el sitio real en vez de sobre un mockup — **no existe un archivo de Figma final que entregar**. Este documento y el propio código (`app/globals.css`, `components/`) son la única fuente de verdad del sistema de diseño.

## Paleta de colores

Definida como tokens de Tailwind v4 en `app/globals.css` (`@theme`). Todos son utilizables directo como clases (`bg-cream`, `text-terracotta`, etc.).

Cada token primitivo (nombrado por su identidad de color: cream, sage, terracotta...) lleva además, como comentario en el propio CSS, su **rol semántico** — la nomenclatura `categoría/función` (`bg/primary`, `action/primary`, `surface/block`...) con la que se pensó el sistema en Figma. Es la capa que explica *para qué* existe cada color, no solo qué color es — reproducida acá tal cual aparece en el código, no parafraseada:

| Token | Rol semántico (Figma) | Hex | Uso |
|---|---|---|---|
| `--color-cream` | `bg/primary` | `#faf6eb` | Fondo principal del sitio |
| `--color-sage` | `bg/section1` | `#d1ded7` | Fondo de sección (footer, bloques alternos) |
| `--color-peach` | `bg/section2`, `text/on-muted` | `#fde1cb` | Fondo de sección / texto sobre fondos oscuros (ej. texto de botones) |
| `--color-lavender` | `bg/section3` | `#ecd9ea` | Fondo de sección |
| `--color-ink` | `text/primary`, `border/primary` | `#15100e` | Texto principal, bordes |
| `--color-terracotta` | `text/accent`, `action/primary` | `#cd5f37` | Color de acento — texto destacado, botones primarios, focus ring |
| `--color-block` | `surface/block` | `#e3ebe0` | Superficie de bloque |
| `--color-card` | `surface/card` | `#f9eee8` | Superficie de tarjeta |
| `--color-icon-bg` | `surface/icon` | `#ffc5a0` | Fondo de íconos, estado "activo" de chips de filtro |
| `--color-almost-white` | `bg/admin-content` | `#fdfcfa` | Fondo del contenido del panel admin |

Si en el futuro se agrega un color nuevo, mantener esta convención (comentario `categoría/función` junto al token en `globals.css`) en vez de agregarlo "suelto" — es lo que hace que el sistema siga siendo legible sin tener que preguntarle a quien lo escribió.

**Colores complementarios para gráficos** (paneles internos, series categóricas — no se usan en la landing pública):
`--color-chart-clay` `#e69a6a` · `--color-chart-wheat` `#e8ce84` · `--color-chart-orchid` `#c173b9` · `--color-chart-mint` `#80c6ac`

## Tipografía

Tres familias, cargadas con `next/font/google` en `app/layout.tsx`:

| Variable CSS | Fuente | Uso |
|---|---|---|
| `--font-display` | **Alegreya** (con fallback `"Iowan Old Style", serif`) | Todos los títulos (H1/H2/H3) |
| `--font-body` | **Geist** (fallback `"Segoe UI", sans-serif`) | Cuerpo de texto — es la fuente por defecto del `<body>` |
| `--font-brand` | **Karla** | Reservada para uso de marca (logo/wordmark) |

### Escala tipográfica (utilidades Tailwind custom en `globals.css`)

| Clase | Tamaño | Uso |
|---|---|---|
| `.h1-section` | `clamp(2rem, 7vw, 4rem)` (hasta 64px), display, line-height 1.15 | Títulos de sección |
| `.h2-section` | 32px, display, line-height 1.2 | Subtítulos de bloque ("Qué es", "Cupos Limitados") |
| `.h3-section` | 24px, display, line-height 1.2 | Nombres de testimonios/guías, preguntas del FAQ, etiquetas de "Información Clave" |

El color y la alineación de cada título se definen en el punto de uso, no en la utilidad — estas clases solo fijan tipografía/tamaño.

## Componentes de UI reutilizables (utilidades CSS)

Definidos como `@utility` en `globals.css` (Tailwind v4), no como componentes React — se aplican como clases:

- **`.btn-primary`** — botón principal (píldora, fondo terracotta, texto peach, mayúsculas, tracking amplio). Usado en: Hero, Header, LogisticsSection, TestimonialsSection, ClosingSection, formularios de login de admin/guías, RetreatEditor.
- **`.btn-outline`** — botón secundario (píldora, borde terracotta, invierte a relleno en hover). Usado en acciones de edición del panel admin (agregar fila, elegir foto, exportar).
- **`.filter-chip`** — chip de filtro de fecha/estado (paneles admin). Solo define forma; el color de estado activo/inactivo se agrega en el punto de uso (`bg-icon-bg text-ink` si está activo).
- **`.carousel-nav`** — flecha de navegación circular con sombra, usada en el carrusel de testimonios y en la franja de fotos.

## Otros detalles del sistema

- **Easing estándar:** `--ease-out-soft: cubic-bezier(0.16, 1, 0.3, 1)` — se reutiliza en todas las transiciones (botones, chips, flechas de carrusel).
- **Selección de texto:** fondo terracotta, texto cream (`::selection`).
- **Focus visible:** outline terracotta de 2.5px con offset — accesibilidad de teclado consistente en todo el sitio (`:focus-visible`).
- **Scroll suave:** `html { scroll-behavior: smooth }`, desactivado automáticamente si el usuario tiene `prefers-reduced-motion: reduce`.
- **Utilidad `.sin-scrollbar`:** oculta la barra de scroll nativa (usada en la franja de fotos horizontal en mobile) sin desactivar el scroll.

## Componentes de página (estructura, no visual)

La landing (`app/page.tsx`) es una sola página compuesta, en este orden, por:
`Header` → `Hero` → `WhatIsSection` → `WaveBanner` (cinta animada) → `TestimonialsSection` → `GuidesSection` → `PhotoStrip` → `HistorySection` → `LogisticsSection` → `FaqSection` → `ClosingSection` → `Footer`, más `MobileCtaBar` y `FloatingWhatsapp` como elementos flotantes fijos.

Cada sección recibe el objeto `retreat` completo como prop y no tiene datos propios — todo el contenido de texto/imágenes es editable desde `/admin` (ver [05-panel-de-administracion.md](05-panel-de-administracion.md)).

### Notas de layout no obvias

- El `Hero` es `sticky` y queda debajo del resto del contenido (`z-0`); la sección "Qué es Encaminados" lo tapa al hacer scroll con un borde ondulado (`/icons/hero-wave.svg`) que sube junto con esa "cortina".
- El resto de las secciones después del Hero están envueltas en un contenedor `position: relative` — sin eso, quedarían visualmente por debajo del Hero sticky en el orden de apilamiento.

## Accesos internos (no forman parte del diseño público)

El footer incluye dos links de acceso a paneles internos ("Acceso guías y monitores", "Acceso Admin") — visibles para cualquier visitante pero protegidos por clave al entrar. No están pensados para destacarse visualmente ni para que un visitante normal los use.

## Referencias

- Brief de diseño (contenido, no estilo): [07-brief-original-de-diseno.md](07-brief-original-de-diseno.md).
- HTML de referencia entregado por el cliente antes del rediseño: `reference/encaminados-referencia-cliente.html` (histórico, no representa el diseño final).
- No hay archivo de Figma que entregar — el diseño final se afinó directo en código (ver nota arriba). Este documento es la referencia de diseño que reemplaza a un archivo de Figma.
