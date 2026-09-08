"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { RetreatEvent } from "@/types/retreat";
import { guardarRetreat, logoutAdmin, type GuardarState } from "@/app/admin/actions";
import {
  KEY_ARCHIVO_HERO,
  KEY_ARCHIVO_SECTION_DIVIDER,
  KEY_ARCHIVO_HISTORIA,
  KEY_ARCHIVO_SEO,
  keyArchivoGuia,
  keyArchivoDecorativa,
  type DatosFormularioAdmin,
  type FechaEditable,
  type IdeaEditable,
  type VideoEditable,
  type GuiaEditable,
  type FaqEditable,
  type FotoEditable,
} from "@/app/admin/tipos";
import { CampoTexto, CampoTextarea, CampoCheckbox, CampoSelect, CampoArchivo } from "./Campo";
import { ListaEditable } from "./ListaEditable";

function idCliente(): string {
  return crypto.randomUUID();
}

function aEditable(retreat: RetreatEvent): DatosFormularioAdmin {
  return {
    nombre: retreat.nombre,
    bajada: retreat.bajada,
    lugar: retreat.lugar,
    comoLlegar: retreat.comoLlegar,
    mapaUrl: retreat.mapaUrl,
    horaInicio: retreat.horaInicio,
    horaTermino: retreat.horaTermino,
    costo: retreat.costo,
    incluye: retreat.incluye,
    cuotasDisponibles: retreat.cuotasDisponibles,
    cupos: retreat.cupos,
    cuposDescripcion: retreat.cuposDescripcion,
    inscripcionUrl: retreat.inscripcionUrl,
    contacto: { ...retreat.contacto },
    fechas: retreat.fechas.map((f) => ({ clientId: idCliente(), label: f.label, start: f.start, end: f.end })),
    ideas: retreat.ideas.map((i) => ({ clientId: idCliente(), titulo: i.titulo, descripcion: i.descripcion })),
    videos: retreat.videos.map((v) => ({
      clientId: idCliente(),
      nombre: v.nombre,
      cita: v.cita,
      youtubeId: v.youtubeId ?? "",
    })),
    guias: retreat.guias.map((g) => ({
      clientId: idCliente(),
      nombre: g.nombre,
      rol: g.rol,
      fotoUrl: g.fotoUrl,
      fotoForma: g.fotoForma,
    })),
    guiasIntro: retreat.guiasIntro,
    historia: {
      parrafos: retreat.historia.parrafos.join("\n\n"),
      pendiente: retreat.historia.pendiente,
      imagenUrl: retreat.historia.imagenUrl,
    },
    faq: retreat.faq.map((f) => ({
      clientId: idCliente(),
      pregunta: f.pregunta,
      respuesta: f.respuesta,
      enlaceTexto: f.enlace?.texto ?? "",
      enlaceHref: f.enlace?.href ?? "",
    })),
    heroImagenUrl: retreat.heroImagenUrl,
    sectionDividerImagenUrl: retreat.sectionDividerImagenUrl,
    fotosDecorativas: retreat.fotosDecorativas.map((url) => ({ clientId: idCliente(), url })),
    seo: {
      titulo: retreat.seo.titulo ?? "",
      descripcion: retreat.seo.descripcion ?? "",
      imagenUrl: retreat.seo.imagenUrl ?? "",
    },
  };
}

const estadoInicialGuardado: GuardarState = {};

export default function RetreatEditor({ retreat }: { retreat: RetreatEvent }) {
  const [datos, setDatos] = useState<DatosFormularioAdmin>(() => aEditable(retreat));
  const [state, formAction, pending] = useActionState(guardarRetreat, estadoInicialGuardado);

  function set<K extends keyof DatosFormularioAdmin>(clave: K, valor: DatosFormularioAdmin[K]) {
    setDatos((prev) => ({ ...prev, [clave]: valor }));
  }

  return (
    <div className="min-h-[100svh] bg-cream">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 bg-cream/95 px-6 py-4 backdrop-blur-sm sm:px-10">
        <p className="font-brand text-lg leading-[1.05] font-medium text-terracotta">
          EN CAMINA DOS · <span className="font-body text-sm font-semibold text-ink">Panel de administración</span>
        </p>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-ink underline underline-offset-2">
            Ver el sitio
          </Link>
          <form action={logoutAdmin}>
            <button type="submit" className="text-sm text-ink underline underline-offset-2">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <form action={formAction} className="mx-auto flex max-w-[880px] flex-col gap-14 px-6 py-12 sm:px-10">
        {state.error && (
          <p className="rounded-xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700">{state.error}</p>
        )}
        {state.ok && (
          <p className="rounded-xl bg-sage px-4 py-3 text-sm font-semibold text-ink">Cambios guardados.</p>
        )}

        <section className="flex flex-col gap-4">
          <h2 className="h2-section text-ink">Datos generales</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CampoTexto label="Nombre del retiro" value={datos.nombre} onChange={(v) => set("nombre", v)} />
            <CampoTexto label="Lugar" value={datos.lugar} onChange={(v) => set("lugar", v)} />
          </div>
          <CampoTextarea label="Bajada (subtítulo del hero)" value={datos.bajada} onChange={(v) => set("bajada", v)} filas={2} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CampoTexto label="Cómo llegar" value={datos.comoLlegar} onChange={(v) => set("comoLlegar", v)} />
            <CampoTexto label="URL del mapa" value={datos.mapaUrl} onChange={(v) => set("mapaUrl", v)} />
            <CampoTexto label="Hora de llegada" value={datos.horaInicio} onChange={(v) => set("horaInicio", v)} />
            <CampoTexto label="Hora de término" value={datos.horaTermino} onChange={(v) => set("horaTermino", v)} />
            <CampoTexto label="Costo" value={datos.costo} onChange={(v) => set("costo", v)} />
            <CampoTexto label="Incluye" value={datos.incluye} onChange={(v) => set("incluye", v)} />
            <CampoTexto label="Cupos" value={datos.cupos} onChange={(v) => set("cupos", v)} />
            <CampoTexto label="Descripción de cupos" value={datos.cuposDescripcion} onChange={(v) => set("cuposDescripcion", v)} />
            <CampoTexto label="URL de inscripción" value={datos.inscripcionUrl} onChange={(v) => set("inscripcionUrl", v)} />
          </div>
          <CampoCheckbox
            label="Ofrece pago en cuotas"
            checked={datos.cuotasDisponibles}
            onChange={(v) => set("cuotasDisponibles", v)}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <CampoTexto
              label="WhatsApp"
              value={datos.contacto.whatsapp}
              onChange={(v) => set("contacto", { ...datos.contacto, whatsapp: v })}
            />
            <CampoTexto
              label="Mensaje pre-cargado de WhatsApp"
              value={datos.contacto.whatsappMensaje}
              onChange={(v) => set("contacto", { ...datos.contacto, whatsappMensaje: v })}
            />
            <CampoTexto
              label="Email de contacto"
              value={datos.contacto.email}
              onChange={(v) => set("contacto", { ...datos.contacto, email: v })}
            />
          </div>
        </section>

        <ListaEditable<FechaEditable>
          titulo="Fechas"
          items={datos.fechas}
          onChange={(fechas) => set("fechas", fechas)}
          nuevoItem={() => ({ clientId: idCliente(), label: "", start: "", end: "" })}
          renderItem={(item, actualizar) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <CampoTexto label="Texto a mostrar" value={item.label} onChange={(v) => actualizar({ label: v })} />
              <CampoTexto label="Inicio" tipo="date" value={item.start} onChange={(v) => actualizar({ start: v })} />
              <CampoTexto label="Término" tipo="date" value={item.end} onChange={(v) => actualizar({ end: v })} />
            </div>
          )}
        />

        <ListaEditable<IdeaEditable>
          titulo="Qué es Encaminados"
          items={datos.ideas}
          onChange={(ideas) => set("ideas", ideas)}
          nuevoItem={() => ({ clientId: idCliente(), titulo: "", descripcion: "" })}
          renderItem={(item, actualizar) => (
            <>
              <CampoTexto label="Título" value={item.titulo} onChange={(v) => actualizar({ titulo: v })} />
              <CampoTextarea label="Descripción" value={item.descripcion} onChange={(v) => actualizar({ descripcion: v })} filas={2} />
            </>
          )}
        />

        <ListaEditable<VideoEditable>
          titulo="Testimonios"
          items={datos.videos}
          onChange={(videos) => set("videos", videos)}
          nuevoItem={() => ({ clientId: idCliente(), nombre: "", cita: "", youtubeId: "" })}
          renderItem={(item, actualizar) => (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CampoTexto label="Nombre" value={item.nombre} onChange={(v) => actualizar({ nombre: v })} />
                <CampoTexto
                  label="ID de YouTube (opcional)"
                  value={item.youtubeId}
                  onChange={(v) => actualizar({ youtubeId: v })}
                />
              </div>
              <CampoTextarea label="Cita" value={item.cita} onChange={(v) => actualizar({ cita: v })} filas={2} />
            </>
          )}
        />

        <ListaEditable<GuiaEditable>
          titulo="Quiénes los acompañan"
          items={datos.guias}
          onChange={(guias) => set("guias", guias)}
          nuevoItem={() => ({ clientId: idCliente(), nombre: "", rol: "", fotoUrl: "", fotoForma: "circulo" })}
          renderItem={(item, actualizar) => (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CampoTexto label="Nombre" value={item.nombre} onChange={(v) => actualizar({ nombre: v })} />
                <CampoTexto label="Rol" value={item.rol} onChange={(v) => actualizar({ rol: v })} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CampoArchivo label="Foto" urlActual={item.fotoUrl} name={keyArchivoGuia(item.clientId)} />
                <CampoSelect
                  label="Forma de la foto"
                  value={item.fotoForma}
                  onChange={(v) => actualizar({ fotoForma: v as "arco" | "circulo" })}
                  opciones={[
                    { valor: "circulo", etiqueta: "Círculo" },
                    { valor: "arco", etiqueta: "Arco" },
                  ]}
                />
              </div>
            </>
          )}
        />
        <CampoTextarea
          label="Texto de introducción de la sección de guías"
          value={datos.guiasIntro}
          onChange={(v) => set("guiasIntro", v)}
          filas={2}
        />

        <section className="flex flex-col gap-4">
          <h2 className="h2-section text-ink">Nuestra historia</h2>
          <CampoTextarea
            label="Texto (separa párrafos dejando una línea en blanco entre ellos)"
            value={datos.historia.parrafos}
            onChange={(v) => set("historia", { ...datos.historia, parrafos: v })}
            filas={8}
          />
          <CampoCheckbox
            label="Marcar como texto pendiente de confirmar (se muestra en cursiva)"
            checked={datos.historia.pendiente}
            onChange={(v) => set("historia", { ...datos.historia, pendiente: v })}
          />
          <CampoArchivo
            label="Foto de la sección"
            urlActual={datos.historia.imagenUrl}
            name={KEY_ARCHIVO_HISTORIA}
          />
        </section>

        <ListaEditable<FaqEditable>
          titulo="Preguntas frecuentes"
          items={datos.faq}
          onChange={(faq) => set("faq", faq)}
          nuevoItem={() => ({ clientId: idCliente(), pregunta: "", respuesta: "", enlaceTexto: "", enlaceHref: "" })}
          renderItem={(item, actualizar) => (
            <>
              <CampoTexto label="Pregunta" value={item.pregunta} onChange={(v) => actualizar({ pregunta: v })} />
              <CampoTextarea label="Respuesta" value={item.respuesta} onChange={(v) => actualizar({ respuesta: v })} filas={3} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CampoTexto
                  label="Texto del enlace (opcional)"
                  value={item.enlaceTexto}
                  onChange={(v) => actualizar({ enlaceTexto: v })}
                />
                <CampoTexto
                  label="URL del enlace (opcional)"
                  value={item.enlaceHref}
                  onChange={(v) => actualizar({ enlaceHref: v })}
                />
              </div>
            </>
          )}
        />

        <section className="flex flex-col gap-4">
          <h2 className="h2-section text-ink">Imágenes generales</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CampoArchivo label="Foto del hero" urlActual={datos.heroImagenUrl} name={KEY_ARCHIVO_HERO} />
            <CampoArchivo
              label="Logo/separador entre secciones"
              urlActual={datos.sectionDividerImagenUrl}
              name={KEY_ARCHIVO_SECTION_DIVIDER}
            />
          </div>
        </section>

        <ListaEditable<FotoEditable>
          titulo="Franja de fotos decorativas"
          items={datos.fotosDecorativas}
          onChange={(fotosDecorativas) => set("fotosDecorativas", fotosDecorativas)}
          nuevoItem={() => ({ clientId: idCliente(), url: "" })}
          renderItem={(item) => <CampoArchivo label="Foto" urlActual={item.url} name={keyArchivoDecorativa(item.clientId)} />}
          etiquetaAgregar="+ Agregar foto"
        />

        <section className="flex flex-col gap-4">
          <h2 className="h2-section text-ink">SEO</h2>
          <CampoTexto
            label="Título (pestaña del navegador / buscadores)"
            value={datos.seo.titulo}
            onChange={(v) => set("seo", { ...datos.seo, titulo: v })}
          />
          <CampoTextarea
            label="Descripción"
            value={datos.seo.descripcion}
            onChange={(v) => set("seo", { ...datos.seo, descripcion: v })}
            filas={2}
          />
          <CampoArchivo
            label="Imagen al compartir el link (redes sociales)"
            urlActual={datos.seo.imagenUrl}
            name={KEY_ARCHIVO_SEO}
          />
        </section>

        <input type="hidden" name="datos" value={JSON.stringify(datos)} readOnly />

        <button
          type="submit"
          disabled={pending}
          className="sticky bottom-6 flex min-h-[52px] w-full items-center justify-center self-center rounded-full bg-terracotta px-8 py-3.5 text-sm font-bold tracking-[0.14em] text-peach uppercase shadow-[0_4px_16px_rgba(21,16,14,.18)] transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
