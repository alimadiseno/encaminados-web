import type { DetalleExtra, EstadoPago, Inscrito } from "@/lib/inscritos";

export const ETIQUETA_ESTADO_PAGO: Record<EstadoPago, string> = {
  pendiente: "Pendiente",
  parcial: "Parcial",
  pagado: "Pagado",
};

export const ETIQUETA_DETALLE: Record<keyof DetalleExtra, string> = {
  fechaMatrimonio: "Fecha de matrimonio",
  colegioRC: "¿Apoderados/colaboradores de un colegio de la Red RC?",
  alergias: "Alergias o intolerancias",
  motivacion: "Qué los motivó a venir",
  expectativas: "Qué expectativa tienen",
  gruposEncuentro: "¿Participan de grupos de encuentro?",
  cantidadHijos: "Cuántos hijos tienen",
  comentarios: "Comentarios",
};

const CONECTORES_APELLIDO = new Set(["de", "del", "la", "los", "las"]);

/**
 * Heurística best-effort: en "Nombre y apellidos" chileno, los últimos dos
 * "bloques" de palabras suelen ser apellido paterno + materno, así que se
 * usa el segundo-desde-el-final como identificador de familia. No es
 * infalible — nombres con dos nombres de pila y un solo apellido (ej.
 * "María Jesús Ugarte") o apellidos compuestos con conectores ("del Rio")
 * pueden salir mal identificados, no hay forma de evitarlo sin interpretar
 * el texto.
 */
export function apellido(nombreCompleto: string): string {
  const palabras = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return "";

  const bloques: string[] = [];
  for (let i = 0; i < palabras.length; i++) {
    if (CONECTORES_APELLIDO.has(palabras[i].toLowerCase())) {
      // Encadena conectores seguidos ("de la Cerda") en un solo bloque en vez
      // de partirlos por la mitad.
      let fin = i;
      while (fin < palabras.length && CONECTORES_APELLIDO.has(palabras[fin].toLowerCase())) fin++;
      if (fin < palabras.length) {
        bloques.push(palabras.slice(i, fin + 1).join(" "));
        i = fin;
      } else {
        bloques.push(palabras.slice(i).join(" "));
        i = palabras.length - 1;
      }
    } else {
      bloques.push(palabras[i]);
    }
  }

  return bloques.length >= 3 ? bloques[bloques.length - 2] : bloques[bloques.length - 1];
}

export function apellidosPareja(inscrito: Inscrito): string {
  return `${apellido(inscrito.nombreMarido)} ${apellido(inscrito.nombreEsposa)}`;
}

export function esRespuestaNegativa(valor: string): boolean {
  const limpio = valor.trim().toLowerCase();
  return limpio === "no" || limpio === "n/a" || limpio === "na" || limpio.startsWith("ningun");
}

/** Cualquier respuesta que empiece con "sí"/"si" ("Sí, del colegio X", "Si"), sin agarrar palabras como "sin". */
export function esRespuestaAfirmativa(valor: string): boolean {
  return /^si\b/.test(normalizar(valor));
}

const DIACRITICOS = new RegExp("[\\u0300-\\u036f]", "g");

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * El texto de "fecha elegida" que llega por el Google Form se escribe a mano
 * en la hoja de cálculo y puede no calzar carácter a carácter con el label
 * configurado en el panel (ej. con año agregado, o con "Retiro del..."
 * delante) — por eso la comparación es por inclusión en ambos sentidos, no
 * por igualdad estricta.
 */
export function coincideFecha(fechaElegida: string, fecha: string): boolean {
  const a = normalizar(fechaElegida);
  const b = normalizar(fecha);
  return a === b || a.includes(b) || b.includes(a);
}

/** De "2 al 4 de octubre" saca "2-4 oct." para usar en botones de filtro compactos. */
export function etiquetaCorta(label: string): string {
  const match = label.match(/^(\d+)\s+al\s+(\d+)\s+de\s+(\p{L}+)/u);
  if (!match) return label;
  const [, d1, d2, mes] = match;
  return `${d1}-${d2} ${mes.slice(0, 3).toLowerCase()}.`;
}

export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
}

/** Mismos 5 colegios que agrupa el gráfico "Apoderados/colaboradores" en InscritosView.tsx. */
const COLEGIOS_CONOCIDOS = ["Cumbres", "Highlands", "Everest", "La Cruz", "San Isidro"];

/**
 * Normaliza la respuesta libre de `colegioRC` a un nombre de colegio limpio
 * para exports (ej. Mailchimp): si menciona uno de los colegios conocidos
 * devuelve su nombre canónico; si es una respuesta afirmativa que no
 * menciona ninguno, devuelve el texto tal cual (mejor conservar el dato que
 * perderlo); si es negativa o vacía, devuelve "".
 */
export function colegioNormalizado(valor: string | undefined): string {
  const limpio = valor?.trim();
  if (!limpio || esRespuestaNegativa(limpio)) return "";
  const normalizada = normalizar(limpio);
  const conocido = COLEGIOS_CONOCIDOS.find((c) => normalizada.includes(normalizar(c)));
  return conocido ?? limpio;
}
