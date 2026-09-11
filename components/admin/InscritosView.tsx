"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";
import {
  actualizarInscrito,
  crearInscritoManual,
  type InscritoActionState,
} from "@/app/admin/inscritos-actions";
import type { DetalleExtra, EstadoPago, Inscrito } from "@/lib/inscritos";
import {
  ETIQUETA_DETALLE,
  ETIQUETA_ESTADO_PAGO,
  apellido,
  apellidosPareja,
  coincideFecha,
  esRespuestaAfirmativa,
  esRespuestaNegativa,
  etiquetaCorta,
  formatearFecha,
  normalizar,
} from "@/lib/inscritos-formato";

const claseChip = (estado: EstadoPago) =>
  ({
    pendiente: "bg-rose-100 text-rose-700",
    parcial: "bg-icon-bg text-ink",
    pagado: "bg-sage text-ink",
  })[estado];

interface Conteo {
  etiqueta: string;
  cantidad: number;
}

/**
 * Agrupa respuestas de texto libre por valor normalizado (sin mayúsculas ni
 * espacios de más) — funciona bien para preguntas de opciones fijas (ej.
 * colegio RC); para preguntas realmente abiertas (ej. alergias), dos
 * respuestas que digan lo mismo con otras palabras ("vegano" / "soy
 * vegano") van a quedar en filas separadas, no hay forma de evitar eso sin
 * interpretar el texto.
 */
function claveTexto(texto: string): string {
  return texto.trim().toLowerCase().replace(/\s+/g, " ");
}

function agruparRespuestas(valores: (string | undefined)[]): Conteo[] {
  const mapa = new Map<string, Conteo>();
  for (const valor of valores) {
    const limpio = valor?.trim();
    if (!limpio) continue;
    const clave = claveTexto(limpio);
    const actual = mapa.get(clave);
    if (actual) actual.cantidad += 1;
    else mapa.set(clave, { etiqueta: limpio, cantidad: 1 });
  }
  return [...mapa.values()].sort((a, b) => b.cantidad - a.cantidad);
}

/** Tope de barras individuales antes de plegar el resto en un grupo "Otras respuestas afirmativas". */
const MAX_SEGMENTOS_SI = 8;

/** Igual que agruparRespuestas, pero pliega lo que sobre del límite en un último grupo "Otras respuestas". */
function agruparConLimite(valores: (string | undefined)[], limite: number): Conteo[] {
  const agrupado = agruparRespuestas(valores);
  if (agrupado.length <= limite) return agrupado;
  const visibles = agrupado.slice(0, limite - 1);
  const resto = agrupado.slice(limite - 1).reduce((acc, c) => acc + c.cantidad, 0);
  return [...visibles, { etiqueta: "Otras respuestas afirmativas", cantidad: resto }];
}

interface Metricas {
  total: number;
  porEstado: Record<EstadoPago, number>;
  recaudado: number;
}

function calcularMetricas(lista: Inscrito[]): Metricas {
  const porEstado: Record<EstadoPago, number> = { pendiente: 0, parcial: 0, pagado: 0 };
  let recaudado = 0;
  for (const i of lista) {
    porEstado[i.estadoPago] += 1;
    recaudado += i.monto ?? 0;
  }
  return { total: lista.length, porEstado, recaudado };
}

type ClaveMetrica = "total" | EstadoPago | "recaudado";

const METRICAS_CONFIG: { clave: ClaveMetrica; etiqueta: string; icono: string }[] = [
  { clave: "total", etiqueta: "Total parejas inscritas", icono: "/icons/partner.svg" },
  { clave: "pendiente", etiqueta: "Pago pendiente", icono: "/icons/payments.svg" },
  { clave: "parcial", etiqueta: "Pago parcial", icono: "/icons/payments.svg" },
  { clave: "pagado", etiqueta: "Pagado completo", icono: "/icons/payments.svg" },
  { clave: "recaudado", etiqueta: "Recaudado", icono: "/icons/account-balance.svg" },
];

function valorMetrica(metricas: Metricas, clave: ClaveMetrica): string {
  if (clave === "total") return String(metricas.total);
  if (clave === "recaudado") return `$${metricas.recaudado.toLocaleString("es-CL")}`;
  return String(metricas.porEstado[clave]);
}

/** Grilla de las 5 métricas clave. `grande` marca la fila de totales generales, más destacada que las filas por fecha. */
function GrillaMetricas({ metricas, grande }: { metricas: Metricas; grande?: boolean }) {
  const numeroClase = grande ? "font-display text-4xl text-ink" : "font-display text-2xl text-ink";
  const tarjetaClase = grande ? "bg-card p-4" : "bg-almost-white p-3";
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {METRICAS_CONFIG.map(({ clave, etiqueta, icono }) => (
        <div key={clave} className={`flex flex-col gap-1 rounded-2xl ${tarjetaClase}`}>
          <img src={icono} alt="" className="mb-1 size-5" />
          <p className="text-xs text-ink/60">{etiqueta}</p>
          <p className={numeroClase}>{valorMetrica(metricas, clave)}</p>
        </div>
      ))}
    </div>
  );
}

function claseBotonFiltro(activo: boolean): string {
  return `filter-chip ${activo ? "bg-icon-bg text-ink" : "bg-transparent text-terracotta hover:bg-icon-bg hover:text-ink"}`;
}

function BotonesFiltroFecha({ fechas, valor, onChange }: { fechas: string[]; valor: string; onChange: (valor: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onChange("todas")} className={claseBotonFiltro(valor === "todas")}>
        Todos
      </button>
      {fechas.map((f) => (
        <button key={f} type="button" onClick={() => onChange(f)} className={claseBotonFiltro(valor === f)}>
          {etiquetaCorta(f)}
        </button>
      ))}
    </div>
  );
}

/** Igual que BotonesFiltroFecha pero sin "Todos" — para exports que se generan por sesión y necesitan una fecha puntual. */
function BotonesFecha({ fechas, valor, onChange }: { fechas: string[]; valor: string; onChange: (valor: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {fechas.map((f) => (
        <button key={f} type="button" onClick={() => onChange(f)} className={claseBotonFiltro(valor === f)}>
          {etiquetaCorta(f)}
        </button>
      ))}
    </div>
  );
}

/**
 * Multi-select de fechas (a diferencia de BotonesFiltroFecha/BotonesFecha, que son de una sola).
 * "Todos" limpia la selección — ninguna fecha marcada significa "sin filtro", no "ninguna".
 */
function SeleccionFechas({ fechas, seleccionadas, onChange }: { fechas: string[]; seleccionadas: string[]; onChange: (v: string[]) => void }) {
  function alternar(f: string) {
    onChange(seleccionadas.includes(f) ? seleccionadas.filter((v) => v !== f) : [...seleccionadas, f]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onChange([])} className={claseBotonFiltro(seleccionadas.length === 0)}>
        Todos
      </button>
      {fechas.map((f) => (
        <button key={f} type="button" onClick={() => alternar(f)} className={claseBotonFiltro(seleccionadas.includes(f))}>
          {etiquetaCorta(f)}
        </button>
      ))}
    </div>
  );
}

function BarraCategoria({ etiqueta, cantidad, maximo }: { etiqueta: string; cantidad: number; maximo: number }) {
  const porcentaje = maximo > 0 ? (cantidad / maximo) * 100 : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3 text-xs text-ink">
        <span>{etiqueta}</span>
        <span className="flex-none font-semibold tabular-nums">{cantidad}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-sage/50">
        <div className="h-full rounded-full bg-terracotta" style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}

interface SegmentoColor extends Conteo {
  color: string;
}

/**
 * Colores de marca por colegio (pedidos puntualmente, no la paleta genérica
 * del skill de dataviz) — definidos como tokens del sistema de diseño en
 * app/globals.css bajo "Complementarios para gráficos". El color sigue al
 * nombre del colegio mencionado en la respuesta, no a su frecuencia, así que
 * se mantiene igual sin importar qué tan seguido aparece bajo cada filtro.
 */
const COLOR_POR_COLEGIO: { nombre: string; color: string }[] = [
  { nombre: "cumbres", color: "var(--color-terracotta)" },
  { nombre: "highlands", color: "var(--color-chart-clay)" },
  { nombre: "everest", color: "var(--color-chart-wheat)" },
  { nombre: "la cruz", color: "var(--color-chart-orchid)" },
  { nombre: "san isidro", color: "var(--color-chart-mint)" },
];
/** Para una respuesta afirmativa que no menciona ninguno de los colegios de arriba (ej. "Fuimos" quedaría acá si algún día se agrupara como "sí"). */
const COLOR_COLEGIO_RESERVA = "var(--color-ink)";

function colorPorColegio(etiqueta: string): string {
  const normalizada = normalizar(etiqueta);
  return COLOR_POR_COLEGIO.find((c) => normalizada.includes(c.nombre))?.color ?? COLOR_COLEGIO_RESERVA;
}

function conColorDeColegio(segmentos: Conteo[]): SegmentoColor[] {
  return segmentos.map((s) => ({ ...s, color: colorPorColegio(s.etiqueta) }));
}

/**
 * Barra apilada para agrupar todas las respuestas afirmativas ("Sí, del
 * colegio X", "Sí, del colegio Y") en una sola barra, un color por
 * sub-respuesta. La leyenda de abajo es la vía "siempre visible" a la
 * identidad de cada color (nunca solo color) y el `title` da el detalle
 * puntual al pasar el mouse.
 */
function BarraApilada({
  etiqueta,
  segmentos,
  total,
  maximo,
}: {
  etiqueta: string;
  segmentos: SegmentoColor[];
  total: number;
  maximo: number;
}) {
  const porcentaje = maximo > 0 ? (total / maximo) * 100 : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-xs text-ink">
        <span>{etiqueta}</span>
        <span className="flex-none font-semibold tabular-nums">{total}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-sage/50">
        <div className="flex h-full gap-[2px] overflow-hidden rounded-full" style={{ width: `${porcentaje}%` }}>
          {segmentos.map((s) => (
            <div
              key={s.etiqueta}
              title={`${s.etiqueta}: ${s.cantidad}`}
              tabIndex={0}
              className="h-full outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80"
              style={{ flexBasis: `${(s.cantidad / total) * 100}%`, backgroundColor: s.color }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/70">
        {segmentos.map((s) => (
          <span key={s.etiqueta} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 flex-none rounded-full" style={{ backgroundColor: s.color }} />
            {s.etiqueta} <span className="font-semibold text-ink">{s.cantidad}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Persona({ nombre, telefono, email }: { nombre: string; telefono: string | null; email: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-semibold">{nombre}</span>
      <span className="text-xs text-ink/60">{email}</span>
      {telefono && <span className="text-xs text-ink/60">{telefono}</span>}
    </div>
  );
}

function ContenidoDetalle({ inscrito }: { inscrito: Inscrito }) {
  const detalle = inscrito.detalleExtra;
  const entradasDetalle = detalle
    ? (Object.keys(ETIQUETA_DETALLE) as (keyof DetalleExtra)[])
        .map((clave) => [ETIQUETA_DETALLE[clave], detalle[clave]] as const)
        .filter((entrada): entrada is [string, string] => Boolean(entrada[1] && entrada[1].trim()))
    : [];
  const entradas: [string, string][] = [
    ["Inscrito el", formatearFecha(inscrito.creadoEn)],
    ...(inscrito.metodoPago ? [["Método de pago", inscrito.metodoPago] as [string, string]] : []),
    ...(inscrito.notas ? [["Notas", inscrito.notas] as [string, string]] : []),
    ...entradasDetalle,
  ];

  return (
    <div className="flex flex-col gap-3">
      {inscrito.comprobanteUrl && (
        <a
          href={inscrito.comprobanteUrl}
          target="_blank"
          rel="noopener"
          className="self-start text-xs font-semibold text-terracotta underline underline-offset-2"
        >
          Ver comprobante de depósito ↗
        </a>
      )}
      {entradas.length > 0 ? (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entradas.map(([etiqueta, valor]) => (
            <div key={etiqueta} className="flex flex-col gap-0.5">
              <dt className="text-xs font-semibold text-ink/60">{etiqueta}</dt>
              <dd className="text-sm text-ink">{valor}</dd>
            </div>
          ))}
        </dl>
      ) : (
        !inscrito.comprobanteUrl && <p className="text-xs text-ink/50">Sin datos adicionales.</p>
      )}
    </div>
  );
}

function FilaDetalle({ inscrito }: { inscrito: Inscrito }) {
  return (
    <tr className="border-b border-ink/10 bg-cream/60">
      <td colSpan={7} className="px-3 py-4">
        <ContenidoDetalle inscrito={inscrito} />
      </td>
    </tr>
  );
}

/** Los 4 campos que solo edita Aline a mano — reusados por la fila de tabla y la tarjeta. */
function CamposPago({ inscrito, apilado }: { inscrito: Inscrito; apilado?: boolean }) {
  return (
    <div className={apilado ? "flex flex-col gap-3" : "flex flex-wrap items-end gap-3"}>
      <label className="flex flex-col gap-1 text-xs text-ink">
        Estado
        <select
          name="estadoPago"
          defaultValue={inscrito.estadoPago}
          className="rounded-lg border-2 border-ink/15 bg-cream px-2 py-1.5 text-sm"
        >
          <option value="pendiente">Pendiente</option>
          <option value="parcial">Parcial</option>
          <option value="pagado">Pagado</option>
        </select>
      </label>
      <label className={apilado ? "flex flex-col gap-1 text-xs text-ink" : "flex flex-col gap-1 text-xs text-ink"}>
        Monto
        <input
          type="number"
          name="monto"
          defaultValue={inscrito.monto ?? ""}
          className={`${apilado ? "w-full" : "w-28"} rounded-lg border-2 border-ink/15 bg-cream px-2 py-1.5 text-sm`}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink">
        Método de pago
        <input
          type="text"
          name="metodoPago"
          defaultValue={inscrito.metodoPago ?? ""}
          className={`${apilado ? "w-full" : "w-36"} rounded-lg border-2 border-ink/15 bg-cream px-2 py-1.5 text-sm`}
        />
      </label>
      <label className={apilado ? "flex flex-col gap-1 text-xs text-ink" : "flex min-w-[10rem] flex-1 flex-col gap-1 text-xs text-ink"}>
        Notas
        <input
          type="text"
          name="notas"
          defaultValue={inscrito.notas ?? ""}
          className="w-full rounded-lg border-2 border-ink/15 bg-cream px-2 py-1.5 text-sm"
        />
      </label>
    </div>
  );
}

function FilaInscrito({ inscrito }: { inscrito: Inscrito }) {
  const [editando, setEditando] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const estadoInicial: InscritoActionState = {};
  const accionConId = actualizarInscrito.bind(null, inscrito.id);
  const [state, formAction, pending] = useActionState(accionConId, estadoInicial);

  if (!editando) {
    return (
      <>
        <tr className="border-b border-ink/10 align-top">
          <td className="px-2 py-2.5 font-semibold whitespace-nowrap">{apellidosPareja(inscrito)}</td>
          <td className="px-2 py-2.5">
            <Persona nombre={inscrito.nombreEsposa} telefono={inscrito.telefonoEsposa} email={inscrito.emailEsposa} />
          </td>
          <td className="px-2 py-2.5">
            <Persona nombre={inscrito.nombreMarido} telefono={inscrito.telefonoMarido} email={inscrito.emailMarido} />
          </td>
          <td className="px-2 py-2.5">{inscrito.fechaElegida}</td>
          <td className="px-2 py-2.5">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${claseChip(inscrito.estadoPago)}`}>
              {ETIQUETA_ESTADO_PAGO[inscrito.estadoPago]}
            </span>
          </td>
          <td className="px-2 py-2.5">{inscrito.monto != null ? `$${inscrito.monto.toLocaleString("es-CL")}` : "—"}</td>
          <td className="px-2 py-2.5 whitespace-nowrap">
            <button type="button" onClick={() => setMostrarDetalle((v) => !v)} className="text-xs text-ink/60 underline underline-offset-2">
              {mostrarDetalle ? "Ocultar" : "Ver más"}
            </button>{" "}
            <button type="button" onClick={() => setEditando(true)} className="text-xs text-terracotta underline underline-offset-2">
              Editar
            </button>
          </td>
        </tr>
        {mostrarDetalle && <FilaDetalle inscrito={inscrito} />}
      </>
    );
  }

  return (
    <tr className="border-b border-ink/10 bg-card">
      <td className="px-2 py-2.5 font-semibold" colSpan={2}>
        {apellidosPareja(inscrito)}
        <span className="block text-xs font-normal text-ink/60">
          {inscrito.nombreEsposa} y {inscrito.nombreMarido}
        </span>
      </td>
      <td className="px-2 py-2.5" colSpan={5}>
        <form
          action={(formData) => {
            formAction(formData);
            setEditando(false);
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <CamposPago inscrito={inscrito} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-terracotta px-4 py-1.5 text-xs font-bold tracking-[0.06em] text-peach uppercase disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Guardar"}
          </button>
          <button type="button" onClick={() => setEditando(false)} className="text-xs text-ink/60 underline underline-offset-2">
            Cancelar
          </button>
          {state.error && <p className="w-full text-xs font-semibold text-rose-700">{state.error}</p>}
        </form>
      </td>
    </tr>
  );
}

function TarjetaInscrito({ inscrito }: { inscrito: Inscrito }) {
  const [editando, setEditando] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const estadoInicial: InscritoActionState = {};
  const accionConId = actualizarInscrito.bind(null, inscrito.id);
  const [state, formAction, pending] = useActionState(accionConId, estadoInicial);

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-terracotta">{apellidosPareja(inscrito)}</p>
          <Persona nombre={inscrito.nombreEsposa} telefono={inscrito.telefonoEsposa} email={inscrito.emailEsposa} />
          <Persona nombre={inscrito.nombreMarido} telefono={inscrito.telefonoMarido} email={inscrito.emailMarido} />
        </div>
        <span className={`flex-none rounded-full px-3 py-1 text-xs font-semibold ${claseChip(inscrito.estadoPago)}`}>
          {ETIQUETA_ESTADO_PAGO[inscrito.estadoPago]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-ink/10 pt-3 text-sm text-ink">
        <div>
          <p className="text-xs text-ink/60">Fecha elegida</p>
          <p>{inscrito.fechaElegida}</p>
        </div>
        <div>
          <p className="text-xs text-ink/60">Monto</p>
          <p>{inscrito.monto != null ? `$${inscrito.monto.toLocaleString("es-CL")}` : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-ink/60">Método de pago</p>
          <p>{inscrito.metodoPago || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-ink/60">Inscrito el</p>
          <p>{formatearFecha(inscrito.creadoEn)}</p>
        </div>
        {inscrito.notas && (
          <div className="col-span-2">
            <p className="text-xs text-ink/60">Notas</p>
            <p>{inscrito.notas}</p>
          </div>
        )}
      </div>

      {editando ? (
        <form
          action={(formData) => {
            formAction(formData);
            setEditando(false);
          }}
          className="flex flex-col gap-3 border-t border-ink/10 pt-3"
        >
          <CamposPago inscrito={inscrito} apilado />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-terracotta px-4 py-1.5 text-xs font-bold tracking-[0.06em] text-peach uppercase disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar"}
            </button>
            <button type="button" onClick={() => setEditando(false)} className="text-xs text-ink/60 underline underline-offset-2">
              Cancelar
            </button>
          </div>
          {state.error && <p className="text-xs font-semibold text-rose-700">{state.error}</p>}
        </form>
      ) : (
        <div className="flex items-center gap-4 border-t border-ink/10 pt-3">
          <button type="button" onClick={() => setMostrarDetalle((v) => !v)} className="text-xs text-ink/60 underline underline-offset-2">
            {mostrarDetalle ? "Ocultar detalle" : "Ver más"}
          </button>
          <button type="button" onClick={() => setEditando(true)} className="text-xs text-terracotta underline underline-offset-2">
            Editar
          </button>
        </div>
      )}

      {mostrarDetalle && !editando && (
        <div className="border-t border-ink/10 pt-3">
          <ContenidoDetalle inscrito={inscrito} />
        </div>
      )}
    </div>
  );
}

/** Card individual dentro de "Exportación de datos" — nombre, descripción, formato, filtros (opcional) y botón de descarga. */
function TarjetaExportacion({
  icono,
  nombre,
  descripcion,
  formato,
  href,
  children,
}: {
  icono: string;
  nombre: string;
  descripcion: string;
  formato: string;
  href: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-almost-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <img src={icono} alt="" className="size-5" />
          {nombre}
        </h3>
        <span className="flex-none rounded-full bg-card px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] text-ink/60 uppercase">
          {formato}
        </span>
      </div>
      <p className="text-sm text-ink/60">{descripcion}</p>
      {children}
      <a
        href={href}
        className="self-start rounded-full bg-terracotta px-4 py-2 text-xs font-bold tracking-[0.08em] text-peach uppercase transition-opacity hover:opacity-90"
      >
        Descargar
      </a>
    </div>
  );
}

function TarjetaFichasMonitores({ retreatId, fechas }: { retreatId: string; fechas: string[] }) {
  const [fecha, setFecha] = useState("todas");
  const params = new URLSearchParams({ retreatId });
  if (fecha !== "todas") params.set("fecha", fecha);

  return (
    <TarjetaExportacion
      icono="/icons/partner.svg"
      nombre="Fichas para monitores"
      descripcion="Una hoja carta por pareja, con todos sus datos salvo pago."
      formato="PDF"
      href={`/api/admin/inscritos/fichas?${params.toString()}`}
    >
      <BotonesFiltroFecha fechas={fechas} valor={fecha} onChange={setFecha} />
    </TarjetaExportacion>
  );
}

/** Fecha obligatoria (no "todas") — cocina prepara por sesión, no para el retiro completo. */
function TarjetaAlergiasCocina({ retreatId, fechas }: { retreatId: string; fechas: string[] }) {
  const [fecha, setFecha] = useState(fechas[0] ?? "");
  const params = new URLSearchParams({ retreatId, fecha });

  return (
    <TarjetaExportacion
      icono="/icons/grocery.svg"
      nombre="Alergias para cocina"
      descripcion="Lista de parejas con alergia o restricción declarada, para pasar a los encargados de cocina."
      formato="PDF"
      href={`/api/admin/inscritos/alergias?${params.toString()}`}
    >
      <BotonesFecha fechas={fechas} valor={fecha} onChange={setFecha} />
    </TarjetaExportacion>
  );
}

function TarjetaContactosMailchimp({ retreatId, fechas }: { retreatId: string; fechas: string[] }) {
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const params = new URLSearchParams({ retreatId });
  seleccionadas.forEach((f) => params.append("fecha", f));

  return (
    <TarjetaExportacion
      icono="/icons/mail-terracotta.svg"
      nombre="Contactos para comunicaciones"
      descripcion="Una fila por persona (correo, teléfono, colegio y fecha), con la familia como referencia para agrupar parejas."
      formato="EXCEL"
      href={`/api/admin/inscritos/contactos?${params.toString()}`}
    >
      <SeleccionFechas fechas={fechas} seleccionadas={seleccionadas} onChange={setSeleccionadas} />
    </TarjetaExportacion>
  );
}

function TarjetaCompletoAdmin({ retreatId, fechas }: { retreatId: string; fechas: string[] }) {
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [estado, setEstado] = useState<EstadoPago | "todos">("todos");
  const params = new URLSearchParams({ retreatId });
  seleccionadas.forEach((f) => params.append("fecha", f));
  if (estado !== "todos") params.set("estado", estado);

  return (
    <TarjetaExportacion
      icono="/icons/account-balance.svg"
      nombre="Completo para admin"
      descripcion="Todas las columnas, incluyendo pagos y notas internas."
      formato="EXCEL"
      href={`/api/admin/inscritos/completo?${params.toString()}`}
    >
      <div className="flex flex-col gap-2">
        <SeleccionFechas fechas={fechas} seleccionadas={seleccionadas} onChange={setSeleccionadas} />
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoPago | "todos")}
          className="self-start rounded-lg border-2 border-ink/15 bg-cream px-3 py-1.5 text-xs"
        >
          <option value="todos">Cualquier estado de pago</option>
          <option value="pendiente">Pago pendiente</option>
          <option value="parcial">Pago parcial</option>
          <option value="pagado">Pagado completo</option>
        </select>
      </div>
    </TarjetaExportacion>
  );
}

/** El bloque de exportación es alto (4 cards con filtros) — vive en un modal para no tapar los datos del panel a primera vista. */
function BotonExportacion({ retreatId, fechas }: { retreatId: string; fechas: string[] }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="self-start rounded-full border-2 border-terracotta px-4 py-2 text-xs font-bold tracking-[0.08em] text-terracotta uppercase transition-colors hover:bg-terracotta hover:text-peach"
      >
        Exportar datos
      </button>

      {abierto && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setAbierto(false)} />
          <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col gap-4 overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="h2-section text-ink">Exportación de datos</h2>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-xl leading-none text-ink hover:bg-sage/50"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TarjetaContactosMailchimp retreatId={retreatId} fechas={fechas} />
              <TarjetaFichasMonitores retreatId={retreatId} fechas={fechas} />
              {fechas.length > 0 && <TarjetaAlergiasCocina retreatId={retreatId} fechas={fechas} />}
              <TarjetaCompletoAdmin retreatId={retreatId} fechas={fechas} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FormularioNuevoInscrito({ fechas }: { fechas: string[] }) {
  const [abierto, setAbierto] = useState(false);
  const estadoInicial: InscritoActionState = {};
  const [state, formAction, pending] = useActionState(crearInscritoManual, estadoInicial);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="self-start rounded-full border-2 border-terracotta px-4 py-2 text-xs font-bold tracking-[0.08em] text-terracotta uppercase transition-colors hover:bg-terracotta hover:text-peach"
      >
        + Agregar inscrito manual
      </button>
    );
  }

  return (
    <form
      action={(formData) => {
        formAction(formData);
        setAbierto(false);
      }}
      className="flex flex-col gap-4 rounded-2xl bg-card p-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold text-terracotta uppercase">Esposa</legend>
          <label className="flex flex-col gap-1 text-xs text-ink">
            Nombre y apellidos
            <input name="nombreEsposa" required className="rounded-lg border-2 border-ink/15 bg-cream px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink">
            Correo
            <input type="email" name="emailEsposa" required className="rounded-lg border-2 border-ink/15 bg-cream px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink">
            Teléfono (opcional)
            <input name="telefonoEsposa" className="rounded-lg border-2 border-ink/15 bg-cream px-3 py-2 text-sm" />
          </label>
        </fieldset>
        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold text-terracotta uppercase">Marido</legend>
          <label className="flex flex-col gap-1 text-xs text-ink">
            Nombre y apellidos
            <input name="nombreMarido" required className="rounded-lg border-2 border-ink/15 bg-cream px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink">
            Correo
            <input type="email" name="emailMarido" required className="rounded-lg border-2 border-ink/15 bg-cream px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink">
            Teléfono (opcional)
            <input name="telefonoMarido" className="rounded-lg border-2 border-ink/15 bg-cream px-3 py-2 text-sm" />
          </label>
        </fieldset>
      </div>
      <label className="flex max-w-xs flex-col gap-1 text-xs text-ink">
        Fecha elegida
        <select name="fechaElegida" required className="rounded-lg border-2 border-ink/15 bg-cream px-3 py-2 text-sm">
          <option value="">Elegir…</option>
          {fechas.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
      {state.error && <p className="text-xs font-semibold text-rose-700">{state.error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-terracotta px-6 py-2 text-xs font-bold tracking-[0.08em] text-peach uppercase disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar inscrito"}
        </button>
        <button type="button" onClick={() => setAbierto(false)} className="text-xs text-ink/60 underline underline-offset-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function InscritosView({
  inscritos,
  fechas,
  retreatId,
}: {
  inscritos: Inscrito[];
  fechas: string[];
  retreatId: string;
}) {
  const [vista, setVista] = useState<"tabla" | "tarjetas">("tabla");
  const [filtroEstado, setFiltroEstado] = useState<EstadoPago | "todos">("todos");
  const [filtroFecha, setFiltroFecha] = useState<string>("todas");
  const [filtroFechaAlergias, setFiltroFechaAlergias] = useState<string>("todas");
  const [filtroFechaColegio, setFiltroFechaColegio] = useState<string>("todas");

  const filtrados = useMemo(
    () =>
      inscritos.filter(
        (i) =>
          (filtroEstado === "todos" || i.estadoPago === filtroEstado) &&
          (filtroFecha === "todas" || coincideFecha(i.fechaElegida, filtroFecha)),
      ),
    [inscritos, filtroEstado, filtroFecha],
  );

  const metricas = useMemo(() => calcularMetricas(inscritos), [inscritos]);

  const metricasPorFecha = useMemo(
    () =>
      fechas.map((fecha) => ({
        fecha,
        metricas: calcularMetricas(inscritos.filter((i) => coincideFecha(i.fechaElegida, fecha))),
      })),
    [inscritos, fechas],
  );

  const inscritosColegio = useMemo(
    () => (filtroFechaColegio === "todas" ? inscritos : inscritos.filter((i) => coincideFecha(i.fechaElegida, filtroFechaColegio))),
    [inscritos, filtroFechaColegio],
  );
  const colegio = useMemo(() => {
    const respuestas = inscritosColegio
      .map((i) => i.detalleExtra?.colegioRC?.trim())
      .filter((v): v is string => Boolean(v));
    const afirmativas = respuestas.filter(esRespuestaAfirmativa);
    const negativas = respuestas.filter(esRespuestaNegativa).length;
    const otras = respuestas.filter((v) => !esRespuestaAfirmativa(v) && !esRespuestaNegativa(v));
    return {
      si: conColorDeColegio(agruparConLimite(afirmativas, MAX_SEGMENTOS_SI)),
      siTotal: afirmativas.length,
      no: negativas,
      otras: agruparRespuestas(otras),
    };
  }, [inscritosColegio]);
  const maxColegio = Math.max(1, colegio.siTotal, colegio.no, ...colegio.otras.map((c) => c.cantidad));

  const inscritosAlergias = useMemo(
    () => (filtroFechaAlergias === "todas" ? inscritos : inscritos.filter((i) => coincideFecha(i.fechaElegida, filtroFechaAlergias))),
    [inscritos, filtroFechaAlergias],
  );
  const alergias = useMemo(() => {
    const conRespuesta = inscritosAlergias
      .map((i) => ({ inscrito: i, valor: i.detalleExtra?.alergias?.trim() }))
      .filter((r): r is { inscrito: Inscrito; valor: string } => Boolean(r.valor));
    const positivas = conRespuesta.filter((r) => !esRespuestaNegativa(r.valor));
    const negativas = conRespuesta.filter((r) => esRespuestaNegativa(r.valor)).length;
    return { positivas, negativas };
  }, [inscritosAlergias]);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-8">
      <h1 className="h2-section text-ink">Inscritos</h1>

        <BotonExportacion retreatId={retreatId} fechas={fechas} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold tracking-[0.06em] text-ink/50 uppercase">Totales generales</p>
            <GrillaMetricas metricas={metricas} grande />
          </div>
          {metricasPorFecha.map(({ fecha, metricas: metricasFecha }) => (
            <div key={fecha} className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-terracotta/30 p-4">
              <p className="text-xs font-bold tracking-[0.06em] text-terracotta uppercase">{fecha}</p>
              <GrillaMetricas metricas={metricasFecha} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-5">
            <h2 className="flex items-center gap-2 h3-section text-ink">
              <img src="/icons/grocery.svg" alt="" className="size-5" />
              Alergias / restricciones alimentarias
            </h2>
            <BotonesFiltroFecha fechas={fechas} valor={filtroFechaAlergias} onChange={setFiltroFechaAlergias} />
            {alergias.positivas.length === 0 && alergias.negativas === 0 ? (
              <p className="text-sm text-ink/50">Sin respuestas todavía.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm text-ink">
                {alergias.positivas.map(({ inscrito, valor }) => (
                  <li key={inscrito.id} className="flex items-center justify-between gap-2 border-b border-ink/10 py-1 last:border-0">
                    <span>{valor}</span>
                    <span className="flex-none text-xs text-ink/60">
                      {apellido(inscrito.nombreMarido)} {apellido(inscrito.nombreEsposa)}
                    </span>
                  </li>
                ))}
                {alergias.negativas > 0 && (
                  <li className="flex items-center justify-between gap-2 border-b border-ink/10 py-1 last:border-0">
                    <span>No</span>
                    <span className="flex-none font-semibold tabular-nums text-ink/70">
                      {alergias.negativas} {alergias.negativas === 1 ? "pareja" : "parejas"}
                    </span>
                  </li>
                )}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-card p-5">
            <h2 className="flex items-center gap-2 h3-section text-ink">
              <img src="/icons/network-node.svg" alt="" className="size-5" />
              Apoderados/colaboradores de un colegio Red RC
            </h2>
            <BotonesFiltroFecha fechas={fechas} valor={filtroFechaColegio} onChange={setFiltroFechaColegio} />
            {colegio.siTotal === 0 && colegio.no === 0 && colegio.otras.length === 0 ? (
              <p className="text-sm text-ink/50">Sin respuestas todavía.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {colegio.siTotal > 0 && <BarraApilada etiqueta="Sí" segmentos={colegio.si} total={colegio.siTotal} maximo={maxColegio} />}
                {colegio.no > 0 && <BarraCategoria etiqueta="No" cantidad={colegio.no} maximo={maxColegio} />}
                {colegio.otras.map((c) => (
                  <BarraCategoria key={c.etiqueta} etiqueta={c.etiqueta} cantidad={c.cantidad} maximo={maxColegio} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 text-xs text-ink">
              Estado de pago
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as EstadoPago | "todos")}
                className="rounded-lg border-2 border-ink/15 bg-cream px-3 py-2 text-sm"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="parcial">Parcial</option>
                <option value="pagado">Pagado</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink">
              Fecha elegida
              <select
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="rounded-lg border-2 border-ink/15 bg-cream px-3 py-2 text-sm"
              >
                <option value="todas">Todas</option>
                {fechas.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-card p-1">
            <button
              type="button"
              onClick={() => setVista("tabla")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.06em] uppercase transition-colors ${
                vista === "tabla" ? "bg-terracotta text-peach" : "text-ink"
              }`}
            >
              Tabla
            </button>
            <button
              type="button"
              onClick={() => setVista("tarjetas")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.06em] uppercase transition-colors ${
                vista === "tarjetas" ? "bg-terracotta text-peach" : "text-ink"
              }`}
            >
              Tarjetas
            </button>
          </div>
        </div>

        {filtrados.length === 0 ? (
          <p className="rounded-2xl bg-card px-3 py-8 text-center text-ink/50">No hay inscritos que calcen con este filtro.</p>
        ) : vista === "tabla" ? (
          <div className="overflow-x-auto rounded-2xl bg-card">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/15 text-xs text-ink/60 uppercase">
                  <th className="px-2 py-2.5 font-semibold">Familia</th>
                  <th className="px-2 py-2.5 font-semibold">Esposa</th>
                  <th className="px-2 py-2.5 font-semibold">Marido</th>
                  <th className="px-2 py-2.5 font-semibold">Fecha</th>
                  <th className="px-2 py-2.5 font-semibold">Estado de pago</th>
                  <th className="px-2 py-2.5 font-semibold">Monto</th>
                  <th className="px-2 py-2.5 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {filtrados.map((i) => (
                  <FilaInscrito key={i.id} inscrito={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((i) => (
              <TarjetaInscrito key={i.id} inscrito={i} />
            ))}
          </div>
        )}

        <FormularioNuevoInscrito fechas={fechas} />
    </div>
  );
}
