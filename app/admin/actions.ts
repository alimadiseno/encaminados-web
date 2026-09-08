"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cerrarSesion, iniciarSesion } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { RETIRO_DESTACADO } from "@/data/retreats";
import {
  KEY_ARCHIVO_HERO,
  KEY_ARCHIVO_SECTION_DIVIDER,
  KEY_ARCHIVO_HISTORIA,
  KEY_ARCHIVO_SEO,
  keyArchivoGuia,
  keyArchivoDecorativa,
  keyArchivoVideoPortada,
  type DatosFormularioAdmin,
} from "@/app/admin/tipos";

export interface LoginState {
  error?: string;
}

const RUTAS_ADMIN_VALIDAS = ["/admin", "/admin/inscritos"];

export async function loginAdmin(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const ok = await iniciarSesion(password);

  if (!ok) {
    return { error: "Clave incorrecta. Intenta de nuevo." };
  }

  const redirectTo = String(formData.get("redirectTo") ?? "/admin");
  const destino = RUTAS_ADMIN_VALIDAS.includes(redirectTo) ? redirectTo : "/admin";

  revalidatePath(destino);
  redirect(destino);
}

export async function logoutAdmin() {
  await cerrarSesion();
  revalidatePath("/admin");
  redirect("/admin");
}

export interface GuardarState {
  ok?: boolean;
  error?: string;
}

type SupabaseAdmin = Awaited<ReturnType<typeof getSupabaseAdminClient>>;

/** Sube el archivo en `formData[key]` a Storage si vino uno; si no, deja la URL actual. */
async function subirImagenSiCorresponde(
  supabase: SupabaseAdmin,
  formData: FormData,
  key: string,
  urlActual: string,
): Promise<string> {
  const archivo = formData.get(key);
  if (!(archivo instanceof File) || archivo.size === 0) return urlActual;

  const extension = archivo.name.split(".").pop() || "webp";
  const nombreSeguro = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  const ruta = `${RETIRO_DESTACADO}/${nombreSeguro}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("site-images")
    .upload(ruta, archivo, { contentType: archivo.type || undefined });
  if (error) throw new Error(`No se pudo subir la imagen (${key}): ${error.message}`);

  const { data } = supabase.storage.from("site-images").getPublicUrl(ruta);
  return data.publicUrl;
}

/** Reemplaza por completo las filas de una tabla hija para un retiro (borra todo, inserta la lista nueva). */
async function reemplazarTablaHija(
  supabase: SupabaseAdmin,
  tabla: string,
  retreatId: string,
  filas: Record<string, unknown>[],
) {
  const { error: errorBorrar } = await supabase.from(tabla).delete().eq("retreat_id", retreatId);
  if (errorBorrar) throw new Error(`No se pudo limpiar ${tabla}: ${errorBorrar.message}`);
  if (filas.length === 0) return;

  const { error: errorInsertar } = await supabase.from(tabla).insert(filas);
  if (errorInsertar) throw new Error(`No se pudo guardar ${tabla}: ${errorInsertar.message}`);
}

export async function guardarRetreat(_prevState: GuardarState, formData: FormData): Promise<GuardarState> {
  const crudo = formData.get("datos");
  if (typeof crudo !== "string") {
    return { error: "Faltan los datos del formulario." };
  }

  let datos: DatosFormularioAdmin;
  try {
    datos = JSON.parse(crudo);
  } catch {
    return { error: "Los datos del formulario llegaron corruptos." };
  }

  try {
    const supabase = await getSupabaseAdminClient();

    const heroImagenUrl = await subirImagenSiCorresponde(supabase, formData, KEY_ARCHIVO_HERO, datos.heroImagenUrl);
    const sectionDividerImagenUrl = await subirImagenSiCorresponde(
      supabase,
      formData,
      KEY_ARCHIVO_SECTION_DIVIDER,
      datos.sectionDividerImagenUrl,
    );
    const historiaImagenUrl = await subirImagenSiCorresponde(
      supabase,
      formData,
      KEY_ARCHIVO_HISTORIA,
      datos.historia.imagenUrl,
    );
    const seoImagenUrl = await subirImagenSiCorresponde(supabase, formData, KEY_ARCHIVO_SEO, datos.seo.imagenUrl);

    const guiasConFoto = await Promise.all(
      datos.guias.map(async (g) => ({
        ...g,
        fotoUrl: await subirImagenSiCorresponde(supabase, formData, keyArchivoGuia(g.clientId), g.fotoUrl),
      })),
    );

    const videosConPortada = await Promise.all(
      datos.videos.map(async (v) => ({
        ...v,
        portadaUrl: await subirImagenSiCorresponde(supabase, formData, keyArchivoVideoPortada(v.clientId), v.portadaUrl),
      })),
    );

    const fotosConUrl = await Promise.all(
      datos.fotosDecorativas.map(async (f) => ({
        ...f,
        url: await subirImagenSiCorresponde(supabase, formData, keyArchivoDecorativa(f.clientId), f.url),
      })),
    );

    const { data: retreatRow, error: errorRetreat } = await supabase
      .from("retreats")
      .update({
        nombre: datos.nombre,
        bajada: datos.bajada,
        lugar: datos.lugar,
        hora_inicio: datos.horaInicio,
        hora_termino: datos.horaTermino,
        costo: datos.costo,
        incluye: datos.incluye,
        cupos: datos.cupos,
        cupos_descripcion: datos.cuposDescripcion,
        inscripcion_url: datos.inscripcionUrl,
        whatsapp: datos.contacto.whatsapp,
        whatsapp_mensaje: datos.contacto.whatsappMensaje,
        email: datos.contacto.email,
        guias_intro: datos.guiasIntro,
        historia_texto: datos.historia.parrafos,
        historia_pendiente: datos.historia.pendiente,
        hero_imagen_url: heroImagenUrl || null,
        section_divider_imagen_url: sectionDividerImagenUrl || null,
        historia_imagen_url: historiaImagenUrl || null,
        seo_titulo: datos.seo.titulo || null,
        seo_descripcion: datos.seo.descripcion || null,
        seo_imagen_url: seoImagenUrl || null,
        documentos_drive_url: datos.documentosDriveUrl || null,
      })
      .eq("slug", RETIRO_DESTACADO)
      .select("id")
      .single();

    if (errorRetreat || !retreatRow) {
      throw new Error(errorRetreat?.message ?? "No se encontró el retiro a actualizar.");
    }
    const retreatId = retreatRow.id as string;

    await reemplazarTablaHija(
      supabase,
      "retreat_fechas",
      retreatId,
      datos.fechas.map((f, i) => ({
        retreat_id: retreatId,
        orden: i,
        label: f.label,
        fecha_inicio: f.start,
        fecha_termino: f.end,
      })),
    );

    await reemplazarTablaHija(
      supabase,
      "retreat_ideas",
      retreatId,
      datos.ideas.map((idea, i) => ({
        retreat_id: retreatId,
        orden: i,
        titulo: idea.titulo,
        descripcion: idea.descripcion,
      })),
    );

    await reemplazarTablaHija(
      supabase,
      "retreat_videos",
      retreatId,
      videosConPortada.map((v, i) => ({
        retreat_id: retreatId,
        orden: i,
        nombre: v.nombre,
        cita: v.cita,
        youtube_id: v.youtubeId || null,
        portada_url: v.portadaUrl || null,
      })),
    );

    await reemplazarTablaHija(
      supabase,
      "retreat_guias",
      retreatId,
      guiasConFoto.map((g, i) => ({
        retreat_id: retreatId,
        orden: i,
        nombre: g.nombre,
        rol: g.rol,
        foto_url: g.fotoUrl || null,
        foto_forma: g.fotoForma,
      })),
    );

    await reemplazarTablaHija(
      supabase,
      "retreat_faq",
      retreatId,
      datos.faq.map((f, i) => ({
        retreat_id: retreatId,
        orden: i,
        pregunta: f.pregunta,
        respuesta: f.respuesta,
        enlace_texto: f.enlaceTexto || null,
        enlace_href: f.enlaceHref || null,
      })),
    );

    await reemplazarTablaHija(
      supabase,
      "retreat_photo_strip",
      retreatId,
      fotosConUrl.map((f, i) => ({
        retreat_id: retreatId,
        orden: i,
        foto_url: f.url,
      })),
    );

    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error desconocido al guardar." };
  }
}
