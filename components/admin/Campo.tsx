"use client";

import { useState, type ChangeEvent } from "react";

const claseInput =
  "w-full rounded-xl border-2 border-ink/15 bg-cream px-4 py-2.5 text-base text-ink outline-none focus-visible:border-terracotta";

export function CampoTexto({
  label,
  value,
  onChange,
  tipo = "text",
  requerido = false,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  tipo?: string;
  requerido?: boolean;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1.5 text-sm text-ink">
      <span className="font-semibold">{label}</span>
      <input
        type={tipo}
        value={value}
        required={requerido}
        onChange={(e) => onChange(e.target.value)}
        className={claseInput}
      />
    </label>
  );
}

export function CampoTextarea({
  label,
  value,
  onChange,
  filas = 4,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  filas?: number;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1.5 text-sm text-ink">
      <span className="font-semibold">{label}</span>
      <textarea
        value={value}
        rows={filas}
        onChange={(e) => onChange(e.target.value)}
        className={`${claseInput} leading-[1.5]`}
      />
    </label>
  );
}

export function CampoCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (valor: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4" />
      {label}
    </label>
  );
}

export function CampoSelect({
  label,
  value,
  opciones,
  onChange,
}: {
  label: string;
  value: string;
  opciones: { valor: string; etiqueta: string }[];
  onChange: (valor: string) => void;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1.5 text-sm text-ink">
      <span className="font-semibold">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={claseInput}>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CampoArchivo({
  label,
  urlActual,
  name,
  ayuda,
}: {
  label: string;
  urlActual: string;
  /** name del <input type="file"> — el envío del <form> lo agrega solo al FormData, no necesita estado controlado. */
  name: string;
  /** Tamaño recomendado u otra indicación breve, ej. "1920×1080 px". */
  ayuda?: string;
}) {
  const [nombreElegido, setNombreElegido] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const urlAMostrar = previewUrl ?? urlActual;

  function alElegirArchivo(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    setNombreElegido(archivo?.name ?? null);
    setPreviewUrl((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return archivo ? URL.createObjectURL(archivo) : null;
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-1.5 text-sm text-ink">
      <span className="font-semibold">{label}</span>
      <div className="flex items-center gap-3">
        {urlAMostrar ? (
          // eslint-disable-next-line @next/next/no-img-element -- previsualización de una URL arbitraria (Storage, /public o blob: local), no vale la pena el loader de next/image acá.
          <img src={urlAMostrar} alt="" className="h-16 w-16 flex-none rounded-lg object-cover" />
        ) : (
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-lg bg-sage/40 text-center text-[11px] text-ink/50">
            Sin foto
          </div>
        )}
        <label className="inline-flex min-h-[40px] flex-none cursor-pointer items-center justify-center rounded-full border-2 border-terracotta px-4 text-xs font-bold tracking-[0.08em] text-terracotta uppercase transition-colors hover:bg-terracotta hover:text-peach">
          Elegir foto
          <input type="file" name={name} accept="image/*" onChange={alElegirArchivo} className="sr-only" />
        </label>
      </div>
      {nombreElegido && <p className="text-xs text-terracotta">Se reemplazará por: {nombreElegido}</p>}
      {ayuda && <p className="text-xs text-ink/50">Tamaño recomendado: {ayuda}</p>}
    </div>
  );
}
