"use client";

import type { ReactNode } from "react";

interface ConId {
  clientId: string;
}

/** Sección de filas agregables/eliminables (fechas, ideas, guías, FAQ, etc.) — misma mecánica para las seis listas del editor. */
export function ListaEditable<T extends ConId>({
  titulo,
  items,
  onChange,
  nuevoItem,
  renderItem,
  etiquetaAgregar = "+ Agregar",
  posicionAgregar = "arriba",
}: {
  titulo: string;
  items: T[];
  onChange: (items: T[]) => void;
  nuevoItem: () => T;
  renderItem: (item: T, actualizar: (parcial: Partial<T>) => void) => ReactNode;
  etiquetaAgregar?: string;
  /** "arriba" (junto al título, por defecto) o "abajo" (al final de la lista de filas). */
  posicionAgregar?: "arriba" | "abajo";
}) {
  function actualizarFila(clientId: string, parcial: Partial<T>) {
    onChange(items.map((item) => (item.clientId === clientId ? { ...item, ...parcial } : item)));
  }

  function eliminarFila(clientId: string) {
    onChange(items.filter((item) => item.clientId !== clientId));
  }

  const botonAgregar = (
    <button
      type="button"
      onClick={() => onChange([...items, nuevoItem()])}
      className="btn-outline self-start py-1.5"
    >
      {etiquetaAgregar}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="h3-section text-ink">{titulo}</h3>
        {posicionAgregar === "arriba" && botonAgregar}
      </div>

      {items.length === 0 && <p className="text-sm text-ink/50">Sin filas todavía.</p>}

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.clientId} className="flex flex-col gap-3 rounded-2xl bg-card p-5">
            {renderItem(item, (parcial) => actualizarFila(item.clientId, parcial))}
            <button
              type="button"
              onClick={() => eliminarFila(item.clientId)}
              className="self-end text-xs text-ink/60 underline underline-offset-2 hover:text-ink"
            >
              Eliminar esta fila
            </button>
          </div>
        ))}
      </div>

      {posicionAgregar === "abajo" && botonAgregar}
    </div>
  );
}
