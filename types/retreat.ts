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

export interface VideoTestimonio {
  id: string;
  /** Si no hay video real todavía, se deja sin youtubeId — la cita igual se muestra. */
  youtubeId?: string;
  nombre: string;
  cita: string;
}

export interface Guia {
  id: string;
  nombre: string;
  rol: string;
  /** Ruta de la foto en /public. Placeholder de layout mientras no hay foto real confirmada. */
  fotoUrl: string;
  /** Forma de recorte de la foto — distingue visualmente sacerdote de matrimonio guía. */
  fotoForma: "arco" | "circulo";
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

export interface RetreatEvent {
  slug: string;
  nombre: string;
  bajada: string;
  fechas: DateRange[];
  lugar: string;
  comoLlegar: string;
  mapaUrl: string;
  horaInicio: string;
  horaTermino: string;
  costo: string;
  incluye: string;
  cuotasDisponibles: boolean;
  cupos: string;
  cuposDescripcion: string;
  inscripcionUrl: string;
  contacto: Contacto;
  ideas: Idea[];
  videos: VideoTestimonio[];
  guias: Guia[];
  /** Texto pendiente hasta que el cliente confirme quiénes son los guías. */
  guiasIntro: string;
  historia: {
    parrafos: string[];
    pendiente: boolean;
  };
  faq: FaqItem[];
}
