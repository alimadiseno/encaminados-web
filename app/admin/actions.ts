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
  KEY_ARCHIVO_GUIAS_FOTO,
  keyArchivoDecorativa,
  keyArchivoHistoriaFoto,
  type DatosFormularioAdmin,
} from "@/app/admin/tipos";

export interface LoginState {
  error?: string;
}

export async function loginAdmin(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const ok = await iniciarSesion(password);

  if (!ok) {
    return { error: "Clave incorrecta. Intenta de nuevo." };
  }

  revalidatePath("/admin");
  redirect("/admin");
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

    const velocidadIngresada = Number(datos.cintaVelocidadSegundos);
    const cintaVelocidadSegundos =
      Number.isFinite(velocidadIngresada) && velocidadIngresada > 0 ? Math.round(velocidadIngresada) : 20;

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
    const guiasFotoUrl = await subirImagenSiCorresponde(
      supabase,
      formData,
      KEY_ARCHIVO_GUIAS_FOTO,
      datos.guiasFotoUrl,
    );

    const fotosConUrl = await Promise.all(
      datos.fotosDecorativas.map(async (f) => ({
        ...f,
        url: await subirImagenSiCorresponde(supabase, formData, keyArchivoDecorativa(f.clientId), f.url),
      })),
    );

    const fotosHistoriaConUrl = await Promise.all(
      datos.historia.imagenes.map(async (f) => ({
        ...f,
        url: await subirImagenSiCorresponde(supabase, formData, keyArchivoHistoriaFoto(f.clientId), f.url),
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
        cinta_texto: datos.cintaTexto,
        cinta_velocidad_segundos: cintaVelocidadSegundos,
        whatsapp: datos.contacto.whatsapp,
        whatsapp_mensaje: datos.contacto.whatsappMensaje,
        email: datos.contacto.email,
        guias_intro: datos.guiasIntro,
        guias_foto_url: guiasFotoUrl || null,
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
      datos.testimonios.map((t, i) => ({
        retreat_id: retreatId,
        orden: i,
        nombre: t.nombre,
        cita: t.cita,
        bajada: t.bajada,
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

    await reemplazarTablaHija(
      supabase,
      "retreat_historia_fotos",
      retreatId,
      fotosHistoriaConUrl.map((f, i) => ({
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
