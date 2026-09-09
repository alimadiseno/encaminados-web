import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export type EstadoPago = "pendiente" | "parcial" | "pagado";

/** Preguntas del Form que el cliente quiere conservar pero no son datos clave de contacto/pago. */
export interface DetalleExtra {
  fechaMatrimonio?: string;
  colegioRC?: string;
  alergias?: string;
  motivacion?: string;
  expectativas?: string;
  gruposEncuentro?: string;
  cantidadHijos?: string;
  comentarios?: string;
}

export interface Inscrito {
  id: string;
  fechaElegida: string;
  nombreEsposa: string;
  telefonoEsposa: string | null;
  emailEsposa: string;
  nombreMarido: string;
  telefonoMarido: string | null;
  emailMarido: string;
  estadoPago: EstadoPago;
  monto: number | null;
  metodoPago: string | null;
  notas: string | null;
  comprobanteUrl: string | null;
  detalleExtra: DetalleExtra | null;
  creadoEn: string;
}

interface FilaInscrito {
  id: string;
  fecha_elegida: string;
  nombre_esposa: string;
  telefono_esposa: string | null;
  email_esposa: string;
  nombre_marido: string;
  telefono_marido: string | null;
  email_marido: string;
  estado_pago: EstadoPago;
  monto: number | null;
  metodo_pago: string | null;
  notas: string | null;
  comprobante_url: string | null;
  detalle_extra: DetalleExtra | null;
  creado_en: string;
}

/** Usa la service_role key: `inscritos` no tiene policy de lectura para "anon" a propósito. */
export async function getInscritos(retreatId: string): Promise<Inscrito[]> {
  const supabase = await getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("inscritos")
    .select(
      "id, fecha_elegida, nombre_esposa, telefono_esposa, email_esposa, nombre_marido, telefono_marido, email_marido, estado_pago, monto, metodo_pago, notas, comprobante_url, detalle_extra, creado_en",
    )
    .eq("retreat_id", retreatId)
    .order("creado_en", { ascending: false });

  if (error) {
    console.error("Error cargando inscritos:", error.message);
    return [];
  }

  return (data as FilaInscrito[]).map((f) => ({
    id: f.id,
    fechaElegida: f.fecha_elegida,
    nombreEsposa: f.nombre_esposa,
    telefonoEsposa: f.telefono_esposa,
    emailEsposa: f.email_esposa,
    nombreMarido: f.nombre_marido,
    telefonoMarido: f.telefono_marido,
    emailMarido: f.email_marido,
    estadoPago: f.estado_pago,
    monto: f.monto,
    metodoPago: f.metodo_pago,
    notas: f.notas,
    comprobanteUrl: f.comprobante_url,
    detalleExtra: f.detalle_extra,
    creadoEn: f.creado_en,
  }));
}
