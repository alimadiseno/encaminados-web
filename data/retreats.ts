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
  youtube_id: string | null;
  portada_url: string | null;
}
export interface FilaGuia extends FilaOrdenable {
  id: string;
  nombre: string;
  rol: string;
  foto_url: string | null;
  foto_forma: string;
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
  guias_intro: string;
  historia_texto: string;
  historia_pendiente: boolean;
  hero_imagen_url: string | null;
  section_divider_imagen_url: string | null;
  historia_imagen_url: string | null;
  seo_titulo: string | null;
  seo_descripcion: string | null;
  seo_imagen_url: string | null;
  retreat_fechas: FilaFecha[];
  retreat_ideas: FilaIdea[];
  retreat_videos: FilaVideo[];
  retreat_guias: FilaGuia[];
  retreat_faq: FilaFaq[];
  retreat_photo_strip: FilaFoto[];
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
      retreat_videos ( id, nombre, cita, youtube_id, portada_url, orden ),
      retreat_guias ( id, nombre, rol, foto_url, foto_forma, orden ),
      retreat_faq ( pregunta, respuesta, enlace_texto, enlace_href, orden ),
      retreat_photo_strip ( foto_url, orden )`,
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
    fechas: ordenar(retreat.retreat_fechas).map((f) => ({
      label: f.label,
      start: f.fecha_inicio,
      end: f.fecha_termino,
    })),
    ideas: ordenar(retreat.retreat_ideas).map((i) => ({
      titulo: i.titulo,
      descripcion: i.descripcion,
    })),
    videos: ordenar(retreat.retreat_videos).map((v) => ({
      id: v.id,
      nombre: v.nombre,
      cita: v.cita,
      youtubeId: v.youtube_id ?? undefined,
      portadaUrl: v.portada_url ?? undefined,
    })),
    guias: ordenar(retreat.retreat_guias).map((g) => ({
      id: g.id,
      nombre: g.nombre,
      rol: g.rol,
      fotoUrl: g.foto_url ?? "",
      fotoForma: g.foto_forma as "arco" | "circulo",
    })),
    guiasIntro: retreat.guias_intro,
    historia: {
      parrafos: partirParrafos(retreat.historia_texto),
      pendiente: retreat.historia_pendiente,
      imagenUrl: retreat.historia_imagen_url ?? "",
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
