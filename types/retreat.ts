/**
 * Modelo de datos de un retiro de Encaminados.
 *
 * Todo el contenido de la página pública se arma a partir de un objeto
 * `RetreatEvent`. Hoy `data/retreats.ts` solo exporta uno (la próxima
 * versión del retiro), pero el resto del sitio nunca importa ese dato
 * directo: siempre pasa por `getFeaturedRetreat()`. Si en el futuro hay
 * varios retiros a la vez, `retreats` pasa a tener más de un elemento y
 * una página `/eventos` puede recorrer ese arreglo con `.map()` para
 * mostrar una card por retiro, reusando los mismos componentes de
 * sección que hoy arma esta página.
 */

export interface DateRange {
  /** Texto ya formateado para mostrar, ej. "2 al 4 de octubre" */
  label: string;
  /** Fecha de inicio en ISO, para ordenar u ocupar en JSON-LD */
  start: string;
  /** Fecha de término en ISO */
  end: string;
}

export interface Idea {
  titulo: string;
  descripcion: string;
}

export interface Testimonio {
  id: string;
  nombre: string;
  cita: string;
  /** Bajada corta (una línea) debajo del nombre, ej. "Casados hace 12 años". */
  bajada: string;
}

export interface FaqItem {
  pregunta: string;
  respuesta: string;
  /** Enlace opcional al final de la respuesta, ej. "Ver en el mapa". */
  enlace?: { texto: string; href: string };
}

export interface Contacto {
  whatsapp: string;
  whatsappMensaje: string;
  email: string;
}

export interface Seo {
  titulo?: string;
  descripcion?: string;
  imagenUrl?: string;
}

export interface RetreatEvent {
  id: string;
  slug: string;
  nombre: string;
  bajada: string;
  fechas: DateRange[];
  lugar: string;
  horaInicio: string;
  horaTermino: string;
  costo: string;
  incluye: string;
  cupos: string;
  cuposDescripcion: string;
  inscripcionUrl: string;
  contacto: Contacto;
  ideas: Idea[];
  /** Frase de la cinta ondulada animada entre "Qué es Encaminados" y los testimonios. */
  cintaTexto: string;
  /** Segundos que tarda la cinta en dar una vuelta completa — menos es más rápido. */
  cintaVelocidadSegundos: number;
  testimonios: Testimonio[];
  /** Texto de la sección "Quiénes los acompañan" — sin nombres, es una descripción general del equipo. */
  guiasIntro: string;
  /** Foto horizontal única del grupo de guías, sin pie de foto. */
  guiasFotoUrl: string;
  historia: {
    parrafos: string[];
    pendiente: boolean;
    imagenUrl: string;
    /** Fotos opcionales, una por párrafo (se cruzan con fundido a medida que el texto avanza). Si está vacío, se usa `imagenUrl` fija. */
    imagenes: string[];
  };
  faq: FaqItem[];
  /** Fotos de la imagen del hero y del logo entre hero y "Qué es". */
  heroImagenUrl: string;
  sectionDividerImagenUrl: string;
  /** Franja decorativa entre "guías" e "historia". */
  fotosDecorativas: string[];
  seo: Seo;
  /** Carpeta de Google Drive con los documentos para guías, incrustada en /guias. Sin definir = sección vacía. */
  documentosDriveUrl?: string;
}
