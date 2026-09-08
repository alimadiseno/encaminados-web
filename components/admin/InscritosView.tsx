"use client";

import { useActionState, useMemo, useState } from "react";
import {
  actualizarInscrito,
  crearInscritoManual,
  type InscritoActionState,
} from "@/app/admin/inscritos-actions";
import type { EstadoPago, Inscrito } from "@/lib/inscritos";
import AdminHeader from "./AdminHeader";

const ETIQUETA_ESTADO: Record<EstadoPago, string> = {
  pendiente: "Pendiente",
  parcial: "Parcial",
  pagado: "Pagado",
};

const claseChip = (estado: EstadoPago) =>
  ({
    pendiente: "bg-rose-100 text-rose-700",
    parcial: "bg-icon-bg text-ink",
    pagado: "bg-sage text-ink",
  })[estado];

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
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

function FilaInscrito({ inscrito }: { inscrito: Inscrito }) {
  const [editando, setEditando] = useState(false);
  const estadoInicial: InscritoActionState = {};
  const accionConId = actualizarInscrito.bind(null, inscrito.id);
  const [state, formAction, pending] = useActionState(accionConId, estadoInicial);

  if (!editando) {
    return (
      <tr className="border-b border-ink/10 align-top">
        <td className="px-3 py-3">
          <Persona nombre={inscrito.nombreEsposa} telefono={inscrito.telefonoEsposa} email={inscrito.emailEsposa} />
        </td>
        <td className="px-3 py-3">
          <Persona nombre={inscrito.nombreMarido} telefono={inscrito.telefonoMarido} email={inscrito.emailMarido} />
        </td>
        <td className="px-3 py-3">{inscrito.fechaElegida}</td>
        <td className="px-3 py-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${claseChip(inscrito.estadoPago)}`}>
            {ETIQUETA_ESTADO[inscrito.estadoPago]}
          </span>
        </td>
        <td className="px-3 py-3">{inscrito.monto != null ? `$${inscrito.monto.toLocaleString("es-CL")}` : "—"}</td>
        <td className="px-3 py-3">{inscrito.metodoPago || "—"}</td>
        <td className="px-3 py-3 max-w-[14rem] truncate" title={inscrito.notas ?? undefined}>
          {inscrito.notas || "—"}
        </td>
        <td className="px-3 py-3 whitespace-nowrap text-ink/60">{formatearFecha(inscrito.creadoEn)}</td>
        <td className="px-3 py-3">
          <button type="button" onClick={() => setEditando(true)} className="text-xs text-terracotta underline underline-offset-2">
            Editar
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-ink/10 bg-card">
      <td className="px-3 py-3 font-semibold" colSpan={3}>
        {inscrito.nombreEsposa} y {inscrito.nombreMarido}
      </td>
      <td className="px-3 py-3" colSpan={6}>
        <form
          action={(formData) => {
            formAction(formData);
            setEditando(false);
          }}
          className="flex flex-wrap items-end gap-3"
        >
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
          <label className="flex flex-col gap-1 text-xs text-ink">
            Monto
            <input
              type="number"
              name="monto"
              defaultValue={inscrito.monto ?? ""}
              className="w-28 rounded-lg border-2 border-ink/15 bg-cream px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink">
            Método de pago
            <input
              type="text"
              name="metodoPago"
              defaultValue={inscrito.metodoPago ?? ""}
              className="w-36 rounded-lg border-2 border-ink/15 bg-cream px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-1 min-w-[10rem] flex-col gap-1 text-xs text-ink">
            Notas
            <input
              type="text"
              name="notas"
              defaultValue={inscrito.notas ?? ""}
              className="w-full rounded-lg border-2 border-ink/15 bg-cream px-2 py-1.5 text-sm"
            />
          </label>
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

export default function InscritosView({ inscritos, fechas }: { inscritos: Inscrito[]; fechas: string[] }) {
  const [filtroEstado, setFiltroEstado] = useState<EstadoPago | "todos">("todos");
  const [filtroFecha, setFiltroFecha] = useState<string>("todas");

  const filtrados = useMemo(
    () =>
      inscritos.filter(
        (i) => (filtroEstado === "todos" || i.estadoPago === filtroEstado) && (filtroFecha === "todas" || i.fechaElegida === filtroFecha),
      ),
    [inscritos, filtroEstado, filtroFecha],
  );

  const metricas = useMemo(() => {
    const porEstado: Record<EstadoPago, number> = { pendiente: 0, parcial: 0, pagado: 0 };
    let recaudado = 0;
    for (const i of inscritos) {
      porEstado[i.estadoPago] += 1;
      recaudado += i.monto ?? 0;
    }
    return { total: inscritos.length, porEstado, recaudado };
  }, [inscritos]);

  return (
    <div className="min-h-[100svh] bg-cream">
      <AdminHeader seccionActiva="inscritos" />

      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-10 sm:px-10">
        <h1 className="h2-section text-ink">Inscritos</h1>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="flex flex-col gap-1 rounded-2xl bg-card p-4">
            <p className="text-xs text-ink/60">Total parejas inscritas</p>
            <p className="h3-section text-ink">{metricas.total}</p>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl bg-card p-4">
            <p className="text-xs text-ink/60">Pendientes</p>
            <p className="h3-section text-ink">{metricas.porEstado.pendiente}</p>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl bg-card p-4">
            <p className="text-xs text-ink/60">Pago parcial</p>
            <p className="h3-section text-ink">{metricas.porEstado.parcial}</p>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl bg-card p-4">
            <p className="text-xs text-ink/60">Pagado completo</p>
            <p className="h3-section text-ink">{metricas.porEstado.pagado}</p>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl bg-card p-4">
            <p className="text-xs text-ink/60">Recaudado</p>
            <p className="h3-section text-ink">${metricas.recaudado.toLocaleString("es-CL")}</p>
          </div>
        </div>

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

        <div className="overflow-x-auto rounded-2xl bg-card">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-xs text-ink/60 uppercase">
                <th className="px-3 py-3 font-semibold">Esposa</th>
                <th className="px-3 py-3 font-semibold">Marido</th>
                <th className="px-3 py-3 font-semibold">Fecha</th>
                <th className="px-3 py-3 font-semibold">Estado</th>
                <th className="px-3 py-3 font-semibold">Monto</th>
                <th className="px-3 py-3 font-semibold">Método</th>
                <th className="px-3 py-3 font-semibold">Notas</th>
                <th className="px-3 py-3 font-semibold">Inscrito</th>
                <th className="px-3 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-ink/50">
                    No hay inscritos que calcen con este filtro.
                  </td>
                </tr>
              ) : (
                filtrados.map((i) => <FilaInscrito key={i.id} inscrito={i} />)
              )}
            </tbody>
          </table>
        </div>

        <FormularioNuevoInscrito fechas={fechas} />
      </div>
    </div>
  );
}
