/**
 * Forma de los datos que viajan entre el formulario del panel
 * (components/admin/RetreatEditor.tsx) y el Server Action que los guarda
 * (app/admin/actions.ts), como JSON dentro de un campo oculto `datos` del
 * FormData — las fotos van aparte, como archivos, bajo las keys que arman
 * `nombreArchivoHero` etc. más abajo.
 *
 * Cada fila de una lista lleva un `clientId` generado en el navegador
 * (crypto.randomUUID()) solo para que agregar/quitar filas antes de guardar
 * no desordene qué archivo de foto corresponde a qué fila — nunca se
 * persiste en la base.
 */

export interface FechaEditable {
  clientId: string;
  label: string;
  start: string;
  end: string;
}

export interface IdeaEditable {
  clientId: string;
  titulo: string;
  descripcion: string;
}

export interface VideoEditable {
  clientId: string;
  nombre: string;
  cita: string;
  youtubeId: string;
  portadaUrl: string;
}

export interface GuiaEditable {
  clientId: string;
  nombre: string;
  rol: string;
  fotoUrl: string;
  fotoForma: "arco" | "circulo";
}

export interface FaqEditable {
  clientId: string;
  pregunta: string;
  respuesta: string;
  enlaceTexto: string;
  enlaceHref: string;
}

export interface FotoEditable {
  clientId: string;
  url: string;
}

export interface DatosFormularioAdmin {
  nombre: string;
  bajada: string;
  lugar: string;
  horaInicio: string;
  horaTermino: string;
  costo: string;
  incluye: string;
  cupos: string;
  cuposDescripcion: string;
  inscripcionUrl: string;
  contacto: { whatsapp: string; whatsappMensaje: string; email: string };
  fechas: FechaEditable[];
  ideas: IdeaEditable[];
  videos: VideoEditable[];
  guias: GuiaEditable[];
  guiasIntro: string;
  historia: { parrafos: string; pendiente: boolean; imagenUrl: string };
  faq: FaqEditable[];
  heroImagenUrl: string;
  sectionDividerImagenUrl: string;
  fotosDecorativas: FotoEditable[];
  seo: { titulo: string; descripcion: string; imagenUrl: string };
}

export const KEY_ARCHIVO_HERO = "file:hero";
export const KEY_ARCHIVO_SECTION_DIVIDER = "file:sectionDivider";
export const KEY_ARCHIVO_HISTORIA = "file:historiaImagen";
export const KEY_ARCHIVO_SEO = "file:seoImagen";
export const keyArchivoGuia = (clientId: string) => `file:guia:${clientId}`;
export const keyArchivoVideoPortada = (clientId: string) => `file:videoPortada:${clientId}`;
export const keyArchivoDecorativa = (clientId: string) => `file:decorativa:${clientId}`;
