"use client";

import { useState, type ChangeEvent } from "react";
import { comprimirImagen } from "@/lib/comprimir-imagen";

function pesoLegible(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

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
  ladoMaximo,
}: {
  label: string;
  urlActual: string;
  /** name del <input type="file"> — el envío del <form> lo agrega solo al FormData, no necesita estado controlado. */
  name: string;
  /** Tamaño recomendado u otra indicación breve, ej. "1920×1080 px". */
  ayuda?: string;
  /**
   * Lado más largo, en px, al que se redimensiona antes de subir — pásalo acorde al
   * tamaño real con que se muestra la foto en el sitio (con margen para pantallas
   * retina), no al tamaño recomendado de subida. Por defecto 1920, pensado para fotos
   * a pantalla completa (hero); dejarlo así en fotos que se muestran chicas (miniaturas,
   * franja decorativa) sube varias veces más peso del que se necesita — ver PageSpeed
   * Insights, 2026-09-15.
   */
  ladoMaximo?: number;
}) {
  const [nombreElegido, setNombreElegido] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [infoPeso, setInfoPeso] = useState<string | null>(null);
  const [advertenciaPeso, setAdvertenciaPeso] = useState<string | null>(null);
  const [comprimiendo, setComprimiendo] = useState(false);
  const urlAMostrar = previewUrl ?? urlActual;

  /** Sobre este tamaño, subir el archivo tal cual (sin comprimir) pesa notoriamente en el sitio — ver PageSpeed Insights del 2026-09-15. */
  const UMBRAL_ADVERTENCIA_BYTES = 2 * 1024 * 1024;

  async function alElegirArchivo(e: ChangeEvent<HTMLInputElement>) {
    const elInput = e.target;
    const archivoOriginal = elInput.files?.[0];
    if (!archivoOriginal) {
      setNombreElegido(null);
      setInfoPeso(null);
      setAdvertenciaPeso(null);
      setPreviewUrl((anterior) => {
        if (anterior) URL.revokeObjectURL(anterior);
        return null;
      });
      return;
    }

    setComprimiendo(true);
    const archivo = await comprimirImagen(archivoOriginal, ladoMaximo);
    setComprimiendo(false);

    if (archivo !== archivoOriginal) {
      // El input quedó apuntando al archivo original elegido en el sistema — hay
      // que reemplazarlo por el comprimido para que sea eso lo que viaja al subir.
      const dt = new DataTransfer();
      dt.items.add(archivo);
      elInput.files = dt.files;
      setInfoPeso(`${pesoLegible(archivoOriginal.size)} → ${pesoLegible(archivo.size)}`);
      setAdvertenciaPeso(null);
    } else {
      setInfoPeso(null);
      // `comprimirImagen` deja el archivo tal cual cuando no logra comprimirlo
      // (ej. no pudo decodificarlo — pasa con algunas fotos de cámara con
      // perfil de color que el navegador no soporta) — antes esto pasaba
      // inadvertido y el original se subía completo sin que nadie se diera cuenta.
      setAdvertenciaPeso(
        archivoOriginal.size > UMBRAL_ADVERTENCIA_BYTES
          ? `No se pudo comprimir esta imagen automáticamente y pesa ${pesoLegible(archivoOriginal.size)} — se subirá así de pesada, lo que hace más lento el sitio. Si puedes, comprímela con otra herramienta antes de subirla.`
          : null,
      );
    }

    setNombreElegido(archivo.name);
    setPreviewUrl((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return URL.createObjectURL(archivo);
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
        <label className="btn-outline min-h-[40px] flex-none cursor-pointer">
          Elegir foto
          <input type="file" name={name} accept="image/*" onChange={alElegirArchivo} className="sr-only" />
        </label>
      </div>
      {comprimiendo && <p className="text-xs text-ink/50">Comprimiendo…</p>}
      {!comprimiendo && nombreElegido && <p className="text-xs text-terracotta">Se reemplazará por: {nombreElegido}</p>}
      {!comprimiendo && infoPeso && <p className="text-xs text-ink/50">Comprimida: {infoPeso}</p>}
      {!comprimiendo && advertenciaPeso && <p className="text-xs font-semibold text-rose-700">⚠ {advertenciaPeso}</p>}
      {ayuda && <p className="text-xs text-ink/50">Tamaño recomendado: {ayuda}</p>}
    </div>
  );
}
