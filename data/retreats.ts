import { getSupabaseClient } from "@/lib/supabase";
import type { RetreatEvent } from "@/types/retreat";

/**
 * El contenido del sitio vive en Supabase (ver supabase/migrations/), no en
 * este archivo — acá solo queda la consulta que arma un `RetreatEvent` a
 * partir de las tablas, más un par de funciones puras que operan sobre ese
 * objeto. El resto del sitio nunca habla con Supabase directo: siempre pasa
 * por `getFeaturedRetreat()`, así que el día que haya más de un retiro a la
 * vez, el cambio es acá adentro, no en cada componente.
 */

// Formas de las filas tal como salen de Postgres (snake_case). Se declaran
// a mano porque el proyecto no genera tipos desde el esquema de Supabase —
// si en algún momento se agrega `supabase gen types`, esto se puede
// reemplazar por los tipos generados.
export interface FilaOrdenable {
  orden: number;
}
export interface FilaFecha extends FilaOrdenable {
  label: string;
  fecha_inicio: string;
  fecha_termino: string;
}
export interface FilaIdea extends FilaOrdenable {
  titulo: string;
  descripcion: string;
}
export interface FilaVideo extends FilaOrdenable {
  id: string;
  nombre: string;
  cita: string;
  bajada: string;
}
export interface FilaFaq extends FilaOrdenable {
  pregunta: string;
  respuesta: string;
  enlace_texto: string | null;
  enlace_href: string | null;
}
export interface FilaFoto extends FilaOrdenable {
  foto_url: string;
}

export interface FilaRetreat {
  id: string;
  slug: string;
  nombre: string;
  bajada: string;
  lugar: string;
  hora_inicio: string;
  hora_termino: string;
  costo: string;
  incluye: string;
  cupos: string;
  cupos_descripcion: string;
  inscripcion_url: string;
  whatsapp: string;
  whatsapp_mensaje: string;
  email: string;
  cinta_texto: string;
  cinta_velocidad_segundos: number;
  guias_intro: string;
  guias_foto_url: string | null;
  historia_texto: string;
  historia_pendiente: boolean;
  hero_imagen_url: string | null;
  section_divider_imagen_url: string | null;
  historia_imagen_url: string | null;
  seo_titulo: string | null;
  seo_descripcion: string | null;
  seo_imagen_url: string | null;
  documentos_drive_url: string | null;
  retreat_fechas: FilaFecha[];
  retreat_ideas: FilaIdea[];
  retreat_videos: FilaVideo[];
  retreat_faq: FilaFaq[];
  retreat_photo_strip: FilaFoto[];
  retreat_historia_fotos: FilaFoto[];
}

function partirParrafos(texto: string): string[] {
  const partes = texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return partes.length > 0 ? partes : [texto];
}

async function cargarRetreat(slug: string): Promise<RetreatEvent | undefined> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("retreats")
    .select(
      `*,
      retreat_fechas ( label, fecha_inicio, fecha_termino, orden ),
      retreat_ideas ( titulo, descripcion, orden ),
      retreat_videos ( id, nombre, cita, bajada, orden ),
      retreat_faq ( pregunta, respuesta, enlace_texto, enlace_href, orden ),
      retreat_photo_strip ( foto_url, orden ),
      retreat_historia_fotos ( foto_url, orden )`,
    )
    .eq("slug", slug)
    .single();

  if (error || !data) {
    if (error) console.error("Error cargando el retiro desde Supabase:", error.message);
    return undefined;
  }

  const retreat = data as unknown as FilaRetreat;
  const ordenar = <T extends FilaOrdenable>(rows: T[]) => [...rows].sort((a, b) => a.orden - b.orden);

  return {
    id: retreat.id,
    slug: retreat.slug,
    nombre: retreat.nombre,
    bajada: retreat.bajada,
    lugar: retreat.lugar,
    horaInicio: retreat.hora_inicio,
    horaTermino: retreat.hora_termino,
    costo: retreat.costo,
    incluye: retreat.incluye,
    cupos: retreat.cupos,
    cuposDescripcion: retreat.cupos_descripcion,
    inscripcionUrl: retreat.inscripcion_url,
    contacto: {
      whatsapp: retreat.whatsapp,
      whatsappMensaje: retreat.whatsapp_mensaje,
      email: retreat.email,
    },
    heroImagenUrl: retreat.hero_imagen_url ?? "",
    sectionDividerImagenUrl: retreat.section_divider_imagen_url ?? "",
    fotosDecorativas: ordenar(retreat.retreat_photo_strip).map((f) => f.foto_url),
    seo: {
      titulo: retreat.seo_titulo ?? undefined,
      descripcion: retreat.seo_descripcion ?? undefined,
      imagenUrl: retreat.seo_imagen_url ?? undefined,
    },
    documentosDriveUrl: retreat.documentos_drive_url ?? undefined,
    fechas: ordenar(retreat.retreat_fechas).map((f) => ({
      label: f.label,
      start: f.fecha_inicio,
      end: f.fecha_termino,
    })),
    ideas: ordenar(retreat.retreat_ideas).map((i) => ({
      titulo: i.titulo,
      descripcion: i.descripcion,
    })),
    cintaTexto: retreat.cinta_texto,
    cintaVelocidadSegundos: retreat.cinta_velocidad_segundos,
    testimonios: ordenar(retreat.retreat_videos).map((v) => ({
      id: v.id,
      nombre: v.nombre,
      cita: v.cita,
      bajada: v.bajada,
    })),
    guiasIntro: retreat.guias_intro,
    guiasFotoUrl: retreat.guias_foto_url ?? "",
    historia: {
      parrafos: partirParrafos(retreat.historia_texto),
      pendiente: retreat.historia_pendiente,
      imagenUrl: retreat.historia_imagen_url ?? "",
      imagenes: ordenar(retreat.retreat_historia_fotos).map((f) => f.foto_url),
    },
    faq: ordenar(retreat.retreat_faq).map((f) => ({
      pregunta: f.pregunta,
      respuesta: f.respuesta,
      enlace: f.enlace_texto && f.enlace_href ? { texto: f.enlace_texto, href: f.enlace_href } : undefined,
    })),
  };
}

export const RETIRO_DESTACADO = "2026-segundo-semestre";

export async function getFeaturedRetreat(): Promise<RetreatEvent> {
  const retreat = await cargarRetreat(RETIRO_DESTACADO);
  if (!retreat) {
    throw new Error(
      `No se encontró el retiro "${RETIRO_DESTACADO}" en Supabase. ¿Corriste supabase/migrations/0002_seed.sql?`,
    );
  }
  return retreat;
}

export async function getRetreatBySlug(slug: string): Promise<RetreatEvent | undefined> {
  return cargarRetreat(slug);
}

export function anioDelRetiro(retreat: RetreatEvent): string {
  return retreat.fechas[0]?.start.slice(0, 4) ?? "";
}

export function fechasLabel(retreat: RetreatEvent): string {
  const base = retreat.fechas.map((f) => f.label).join(" o ");
  const anio = anioDelRetiro(retreat);
  return anio ? `${base}, ${anio}` : base;
}
