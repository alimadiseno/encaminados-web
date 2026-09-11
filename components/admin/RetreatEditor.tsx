"use client";

import { useActionState, useEffect, useState } from "react";
import type { RetreatEvent } from "@/types/retreat";
import { guardarRetreat, type GuardarState } from "@/app/admin/actions";
import AdminHeader from "./AdminHeader";
import {
  KEY_ARCHIVO_HERO,
  KEY_ARCHIVO_SECTION_DIVIDER,
  KEY_ARCHIVO_HISTORIA,
  KEY_ARCHIVO_SEO,
  KEY_ARCHIVO_GUIAS_FOTO,
  keyArchivoDecorativa,
  keyArchivoHistoriaFoto,
  type DatosFormularioAdmin,
  type FechaEditable,
  type IdeaEditable,
  type TestimonioEditable,
  type FaqEditable,
  type FotoEditable,
} from "@/app/admin/tipos";
import { CampoTexto, CampoTextarea, CampoCheckbox, CampoArchivo } from "./Campo";
import { ListaEditable } from "./ListaEditable";
import InscritosView from "./InscritosView";
import type { Inscrito } from "@/lib/inscritos";

function idCliente(): string {
  return crypto.randomUUID();
}

/**
 * Los clientId de las filas iniciales tienen que ser deterministas (no
 * crypto.randomUUID()): este objeto se arma dentro de un useState perezoso,
 * que React ejecuta tanto en el render de servidor como al hidratar en el
 * cliente — con IDs aleatorios, cada lado generaría valores distintos y
 * produciría un hydration mismatch en los <input type="file"> (su `name`
 * depende del clientId). Para filas nuevas agregadas con "+ Agregar" sí se
 * usa idCliente(), porque esas solo se crean en el navegador.
 */
function aEditable(retreat: RetreatEvent): DatosFormularioAdmin {
  return {
    nombre: retreat.nombre,
    bajada: retreat.bajada,
    lugar: retreat.lugar,
    horaInicio: retreat.horaInicio,
    horaTermino: retreat.horaTermino,
    costo: retreat.costo,
    incluye: retreat.incluye,
    cupos: retreat.cupos,
    cuposDescripcion: retreat.cuposDescripcion,
    inscripcionUrl: retreat.inscripcionUrl,
    contacto: { ...retreat.contacto },
    fechas: retreat.fechas.map((f, i) => ({ clientId: `fecha-${i}`, label: f.label, start: f.start, end: f.end })),
    ideas: retreat.ideas.map((idea, i) => ({ clientId: `idea-${i}`, titulo: idea.titulo, descripcion: idea.descripcion })),
    cintaTexto: retreat.cintaTexto,
    cintaVelocidadSegundos: String(retreat.cintaVelocidadSegundos),
    testimonios: retreat.testimonios.map((t) => ({
      clientId: t.id,
      nombre: t.nombre,
      cita: t.cita,
      bajada: t.bajada,
    })),
    guiasIntro: retreat.guiasIntro,
    guiasFotoUrl: retreat.guiasFotoUrl,
    historia: {
      parrafos: retreat.historia.parrafos.join("\n\n"),
      pendiente: retreat.historia.pendiente,
      imagenUrl: retreat.historia.imagenUrl,
      imagenes: retreat.historia.imagenes.map((url, i) => ({ clientId: `historia-foto-${i}`, url })),
    },
    faq: retreat.faq.map((f, i) => ({
      clientId: `faq-${i}`,
      pregunta: f.pregunta,
      respuesta: f.respuesta,
      enlaceTexto: f.enlace?.texto ?? "",
      enlaceHref: f.enlace?.href ?? "",
    })),
    heroImagenUrl: retreat.heroImagenUrl,
    sectionDividerImagenUrl: retreat.sectionDividerImagenUrl,
    fotosDecorativas: retreat.fotosDecorativas.map((url, i) => ({ clientId: `foto-${i}`, url })),
    seo: {
      titulo: retreat.seo.titulo ?? "",
      descripcion: retreat.seo.descripcion ?? "",
      imagenUrl: retreat.seo.imagenUrl ?? "",
    },
    documentosDriveUrl: retreat.documentosDriveUrl ?? "",
  };
}

type Vista = "contenido" | "general" | "documentos" | "inscritos" | "seo";
type SeccionContenido =
  | "hero"
  | "ideas"
  | "testimonios"
  | "guias"
  | "franja-fotos"
  | "historia"
  | "informacion-clave"
  | "faq";

const NAV_PRINCIPAL: { clave: Vista; etiqueta: string }[] = [
  { clave: "general", etiqueta: "General" },
  { clave: "contenido", etiqueta: "Contenido" },
  { clave: "documentos", etiqueta: "Documentos sitio privado" },
  { clave: "inscritos", etiqueta: "Inscritos" },
  { clave: "seo", etiqueta: "SEO" },
];

// En el mismo orden en que los bloques aparecen en la página pública — cada
// pestaña trae solo lo que se ve en ese bloque. Lo transversal (nombre del
// retiro, WhatsApp, correo, link de inscripción — cosas que se repiten en
// varios lugares del sitio, no de un bloque en particular) vive aparte, en
// la vista "General" del menú lateral.
const SECCIONES_CONTENIDO: { clave: SeccionContenido; etiqueta: string }[] = [
  { clave: "hero", etiqueta: "Hero" },
  { clave: "ideas", etiqueta: "Qué es Encaminados" },
  { clave: "testimonios", etiqueta: "Testimonios" },
  { clave: "guias", etiqueta: "Quiénes los acompañan" },
  { clave: "franja-fotos", etiqueta: "Franja de fotos" },
  { clave: "historia", etiqueta: "Nuestra historia" },
  { clave: "informacion-clave", etiqueta: "Información Clave" },
  { clave: "faq", etiqueta: "Preguntas frecuentes" },
];

function claseNavPrincipal(activo: boolean): string {
  return `rounded-xl px-4 py-2.5 text-left text-sm font-semibold whitespace-nowrap transition-colors ${
    activo ? "bg-terracotta text-peach" : "text-ink hover:bg-sage/50"
  }`;
}

function claseTabSeccion(activo: boolean): string {
  return `rounded-full border-2 px-4 py-1.5 text-xs font-bold tracking-[0.06em] whitespace-nowrap uppercase transition-colors ${
    activo ? "border-terracotta bg-terracotta text-peach" : "border-ink/15 text-ink hover:border-terracotta hover:text-terracotta"
  }`;
}

const estadoInicialGuardado: GuardarState = {};

export default function RetreatEditor({ retreat, inscritos }: { retreat: RetreatEvent; inscritos: Inscrito[] }) {
  const [datos, setDatos] = useState<DatosFormularioAdmin>(() => aEditable(retreat));
  const [state, formAction, pending] = useActionState(guardarRetreat, estadoInicialGuardado);
  const [vista, setVista] = useState<Vista>("contenido");
  const [seccion, setSeccion] = useState<SeccionContenido>("hero");
  const [menuAbierto, setMenuAbierto] = useState(false);

  function irA(v: Vista) {
    setVista(v);
    setMenuAbierto(false);
  }

  // React 19 reinicia el <form> (incluyendo checkboxes controlados) apenas termina la
  // Server Action, y como su valor lógico no cambió desde la última vez que React lo
  // escribió, el reconciliador no vuelve a tocar el DOM — dejando el checkbox mostrando
  // el valor previo al guardado aunque `datos` (y lo guardado en Supabase) sea correcto.
  // Cambiar la `key` del checkbox tras cada guardado fuerza a React a recrearlo y
  // volver a aplicar el valor real.
  const [guardadoKey, setGuardadoKey] = useState(0);
  useEffect(() => {
    if (state !== estadoInicialGuardado) setGuardadoKey((k) => k + 1);
  }, [state]);

  function set<K extends keyof DatosFormularioAdmin>(clave: K, valor: DatosFormularioAdmin[K]) {
    setDatos((prev) => ({ ...prev, [clave]: valor }));
  }

  // Todas las secciones quedan siempre montadas (solo se ocultan con CSS) para no perder
  // fotos ya elegidas en otra pestaña al cambiar de sección antes de guardar — los <input
  // type="file"> son "no controlados", así que desmontarlos perdería el archivo elegido.
  function claseSeccion(clave: SeccionContenido): string {
    return vista === "contenido" && seccion === clave ? "contents" : "hidden";
  }
  const claseGeneral = vista === "general" ? "contents" : "hidden";
  const claseDocumentos = vista === "documentos" ? "contents" : "hidden";
  const claseSeo = vista === "seo" ? "contents" : "hidden";

  return (
    <div className="flex min-h-[100svh] flex-col bg-cream">
      <AdminHeader />

      <div className="flex items-center justify-between border-b border-ink/10 bg-cream px-6 py-4 sm:hidden">
        <span className="font-body text-sm font-semibold text-ink">
          {NAV_PRINCIPAL.find((item) => item.clave === vista)?.etiqueta}
        </span>
        <button
          type="button"
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir menú"
          className="flex h-10 w-10 flex-none flex-col items-center justify-center gap-1.5 rounded-lg text-ink hover:bg-sage/50"
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
        </button>
      </div>

      {menuAbierto && (
        <div className="fixed inset-0 z-20 flex sm:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMenuAbierto(false)} />
          <div className="relative flex w-64 max-w-[80%] flex-col gap-2 bg-cream px-6 py-6 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-body text-sm font-semibold text-ink">Menú</span>
              <button
                type="button"
                onClick={() => setMenuAbierto(false)}
                aria-label="Cerrar menú"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl leading-none text-ink hover:bg-sage/50"
              >
                ×
              </button>
            </div>
            {NAV_PRINCIPAL.map((item) => (
              <button
                key={item.clave}
                type="button"
                onClick={() => irA(item.clave)}
                className={claseNavPrincipal(vista === item.clave)}
              >
                {item.etiqueta}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col sm:flex-row sm:items-stretch">
        <aside className="hidden sm:sticky sm:top-24 sm:flex sm:w-64 sm:flex-none sm:flex-col sm:gap-2 sm:self-start sm:px-8 sm:py-10">
          {NAV_PRINCIPAL.map((item) => (
            <button
              key={item.clave}
              type="button"
              onClick={() => irA(item.clave)}
              className={claseNavPrincipal(vista === item.clave)}
            >
              {item.etiqueta}
            </button>
          ))}
        </aside>

        <div className="min-w-0 flex-1 bg-almost-white px-6 py-10 sm:px-10">
          {vista === "inscritos" && (
            <InscritosView inscritos={inscritos} fechas={retreat.fechas.map((f) => f.label)} retreatId={retreat.id} />
          )}

          <form
            id="formulario-retreat"
            action={formAction}
            className={vista === "inscritos" ? "hidden" : "flex min-w-0 flex-1 flex-col gap-10"}
          >
          {state.error && (
            <p className="rounded-xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700">{state.error}</p>
          )}
          {state.ok && <p className="rounded-xl bg-sage px-4 py-3 text-sm font-semibold text-ink">Cambios guardados.</p>}

          {vista === "contenido" && (
            <nav className="flex flex-wrap gap-2">
              {SECCIONES_CONTENIDO.map((s) => (
                <button
                  key={s.clave}
                  type="button"
                  onClick={() => setSeccion(s.clave)}
                  className={claseTabSeccion(seccion === s.clave)}
                >
                  {s.etiqueta}
                </button>
              ))}
            </nav>
          )}

          <div className={claseSeccion("hero")}>
            <section className="flex flex-col gap-4">
              <h2 className="h2-section text-ink">Hero</h2>
              <CampoTextarea label="Texto del hero (subtítulo)" value={datos.bajada} onChange={(v) => set("bajada", v)} filas={2} />
              <CampoArchivo
                label="Foto del hero"
                urlActual={datos.heroImagenUrl}
                name={KEY_ARCHIVO_HERO}
                ayuda="1920×1080 px o más, horizontal"
              />
            </section>
          </div>

          <div className={claseSeccion("ideas")}>
            <div className="flex flex-col gap-8">
              <CampoArchivo
                label="Foto entre el hero y esta sección"
                urlActual={datos.sectionDividerImagenUrl}
                name={KEY_ARCHIVO_SECTION_DIVIDER}
                ayuda="678×302 px (proporción 2.24:1)"
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
              <section className="flex flex-col gap-4">
                <h3 className="h3-section text-ink">Cinta animada</h3>
                <CampoTextarea
                  label="Frase de la cinta (se muestra en mayúsculas, deslizándose en loop)"
                  value={datos.cintaTexto}
                  onChange={(v) => set("cintaTexto", v)}
                  filas={2}
                />
                <div className="max-w-[220px]">
                  <CampoTexto
                    label="Velocidad (segundos por vuelta)"
                    tipo="number"
                    value={datos.cintaVelocidadSegundos}
                    onChange={(v) => set("cintaVelocidadSegundos", v)}
                  />
                </div>
                <p className="text-xs text-ink/50">Menos segundos = cinta más rápida.</p>
              </section>
            </div>
          </div>

          <div className={claseSeccion("testimonios")}>
            <ListaEditable<TestimonioEditable>
              titulo="Testimonios"
              items={datos.testimonios}
              onChange={(testimonios) => set("testimonios", testimonios)}
              nuevoItem={() => ({ clientId: idCliente(), nombre: "", cita: "", bajada: "" })}
              renderItem={(item, actualizar) => (
                <>
                  <CampoTextarea label="Cita" value={item.cita} onChange={(v) => actualizar({ cita: v })} filas={2} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <CampoTexto label="Nombre de la pareja" value={item.nombre} onChange={(v) => actualizar({ nombre: v })} />
                    <CampoTexto label="Bajada (una línea)" value={item.bajada} onChange={(v) => actualizar({ bajada: v })} />
                  </div>
                </>
              )}
            />
          </div>

          <div className={claseSeccion("guias")}>
            <div className="flex flex-col gap-8">
              <CampoArchivo
                label="Foto del grupo (horizontal, sin pie de foto)"
                urlActual={datos.guiasFotoUrl}
                name={KEY_ARCHIVO_GUIAS_FOTO}
                ayuda="1200×760 px o más, horizontal"
              />
              <CampoTextarea
                label="Texto de la sección"
                value={datos.guiasIntro}
                onChange={(v) => set("guiasIntro", v)}
                filas={4}
              />
            </div>
          </div>

          <div className={claseSeccion("franja-fotos")}>
            <div className="flex flex-col gap-3">
              <p className="text-xs text-ink/50">
                Todas se muestran con el mismo alto y cada una conserva su propio ancho según su proporción — no hace
                falta recortarlas antes de subirlas.
              </p>
              <ListaEditable<FotoEditable>
                titulo="Franja de fotos"
                items={datos.fotosDecorativas}
                onChange={(fotosDecorativas) => set("fotosDecorativas", fotosDecorativas)}
                nuevoItem={() => ({ clientId: idCliente(), url: "" })}
                renderItem={(item) => (
                  <CampoArchivo
                    label="Foto"
                    urlActual={item.url}
                    name={keyArchivoDecorativa(item.clientId)}
                    ayuda="alto ≥600 px, cualquier ancho"
                  />
                )}
                etiquetaAgregar="+ Agregar foto"
                posicionAgregar="abajo"
              />
            </div>
          </div>

          <div className={claseSeccion("historia")}>
            <section className="flex flex-col gap-4">
              <h2 className="h2-section text-ink">Nuestra historia</h2>
              <CampoTextarea
                label="Texto (separa párrafos dejando una línea en blanco entre ellos)"
                value={datos.historia.parrafos}
                onChange={(v) => set("historia", { ...datos.historia, parrafos: v })}
                filas={8}
              />
              <CampoCheckbox
                key={guardadoKey}
                label="Marcar como texto pendiente de confirmar (se muestra en cursiva)"
                checked={datos.historia.pendiente}
                onChange={(v) => set("historia", { ...datos.historia, pendiente: v })}
              />
              <CampoArchivo
                label="Foto de la sección (se usa si no hay fotos por párrafo abajo)"
                urlActual={datos.historia.imagenUrl}
                name={KEY_ARCHIVO_HISTORIA}
                ayuda="1000×800 px o más"
              />
              <div className="flex flex-col gap-3">
                <p className="text-xs text-ink/50">
                  Opcional: una foto por párrafo — van cambiando con fundido a medida que el texto avanza con el
                  scroll. Si hay menos fotos que párrafos, la última se repite para los que faltan. Si no se agrega
                  ninguna, se usa la foto de arriba fija para todos los párrafos.
                </p>
                <ListaEditable<FotoEditable>
                  titulo="Fotos por párrafo"
                  items={datos.historia.imagenes}
                  onChange={(imagenes) => set("historia", { ...datos.historia, imagenes })}
                  nuevoItem={() => ({ clientId: idCliente(), url: "" })}
                  renderItem={(item) => (
                    <CampoArchivo
                      label="Foto"
                      urlActual={item.url}
                      name={keyArchivoHistoriaFoto(item.clientId)}
                      ayuda="1000×800 px o más"
                    />
                  )}
                  etiquetaAgregar="+ Agregar foto"
                  posicionAgregar="abajo"
                />
              </div>
            </section>
          </div>

          <div className={claseSeccion("informacion-clave")}>
            <div className="flex flex-col gap-8">
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

              <section className="flex flex-col gap-4">
                <h3 className="h3-section text-ink">Lugar y logística</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <CampoTexto label="Lugar" value={datos.lugar} onChange={(v) => set("lugar", v)} />
                  <CampoTexto label="Hora de llegada" value={datos.horaInicio} onChange={(v) => set("horaInicio", v)} />
                  <CampoTexto label="Hora de término" value={datos.horaTermino} onChange={(v) => set("horaTermino", v)} />
                  <CampoTexto label="Costo" value={datos.costo} onChange={(v) => set("costo", v)} />
                  <CampoTexto label="Incluye" value={datos.incluye} onChange={(v) => set("incluye", v)} />
                  <CampoTexto label="Cupos" value={datos.cupos} onChange={(v) => set("cupos", v)} />
                  <CampoTexto label="Descripción de cupos" value={datos.cuposDescripcion} onChange={(v) => set("cuposDescripcion", v)} />
                </div>
              </section>
            </div>
          </div>

          <div className={claseSeccion("faq")}>
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
          </div>

          <div className={claseDocumentos}>
            <section className="flex flex-col gap-4">
              <h2 className="h2-section text-ink">Documentos para guías</h2>
              <p className="text-sm text-ink/60">
                Los documentos viven en una carpeta de Google Drive del cliente, no en este sitio. Pega acá el link
                para compartir de esa carpeta y se muestra incrustada en /guias — cualquier archivo que se suba o
                elimine ahí se refleja solo, sin volver a tocar este panel.
              </p>
              <CampoTexto
                label="Link de la carpeta de Google Drive"
                value={datos.documentosDriveUrl}
                onChange={(v) => set("documentosDriveUrl", v)}
              />
              <p className="text-xs text-ink/50">
                Importante: la carpeta tiene que estar compartida como &quot;Cualquiera con el enlace puede ver&quot;
                en Drive. Si queda restringida, los guías van a ver un aviso de acceso denegado ahí adentro aunque
                ya hayan entrado con la clave del sitio.
              </p>
            </section>
          </div>

          <div className={claseGeneral}>
            <section className="flex flex-col gap-4">
              <h2 className="h2-section text-ink">Datos generales</h2>
              <p className="text-sm text-ink/60">
                Datos que se repiten en varios lugares del sitio (encabezado, hero, footer), no de un solo bloque.
              </p>
              <CampoTexto label="Nombre del retiro" value={datos.nombre} onChange={(v) => set("nombre", v)} />
              <CampoTexto label="URL de inscripción" value={datos.inscripcionUrl} onChange={(v) => set("inscripcionUrl", v)} />
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
          </div>

          <div className={claseSeo}>
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
                ayuda="1200×630 px (estándar para WhatsApp, Facebook, etc.)"
              />
            </section>
          </div>

          <input type="hidden" name="datos" value={JSON.stringify(datos)} readOnly />

          <div className="flex flex-col items-center gap-2 border-t border-ink/10 pt-8">
            <button
              type="submit"
              disabled={pending}
              className="flex min-h-[52px] items-center justify-center rounded-full bg-terracotta px-8 py-3.5 text-sm font-bold tracking-[0.14em] text-peach uppercase shadow-[0_4px_16px_rgba(21,16,14,.18)] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar cambios"}
            </button>
            <p className="text-xs text-ink/50">Guarda todas las secciones, no solo la que estás viendo.</p>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
