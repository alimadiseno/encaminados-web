"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { RETIRO_DESTACADO } from "@/data/retreats";
import type { EstadoPago } from "@/lib/inscritos";

export interface InscritoActionState {
  error?: string;
}

const ESTADOS_VALIDOS: EstadoPago[] = ["pendiente", "parcial", "pagado"];

export async function actualizarInscrito(
  id: string,
  _prevState: InscritoActionState,
  formData: FormData,
): Promise<InscritoActionState> {
  const estadoPago = String(formData.get("estadoPago") ?? "");
  if (!ESTADOS_VALIDOS.includes(estadoPago as EstadoPago)) {
    return { error: "Estado de pago inválido." };
  }

  const montoCrudo = String(formData.get("monto") ?? "").trim();
  const monto = montoCrudo ? Number(montoCrudo) : null;
  if (montoCrudo && Number.isNaN(monto)) {
    return { error: "El monto tiene que ser un número." };
  }

  const metodoPago = String(formData.get("metodoPago") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();

  const supabase = await getSupabaseAdminClient();
  const { error } = await supabase
    .from("inscritos")
    .update({
      estado_pago: estadoPago,
      monto,
      metodo_pago: metodoPago || null,
      notas: notas || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/inscritos");
  return {};
}

export async function crearInscritoManual(
  _prevState: InscritoActionState,
  formData: FormData,
): Promise<InscritoActionState> {
  const nombreEsposa = String(formData.get("nombreEsposa") ?? "").trim();
  const emailEsposa = String(formData.get("emailEsposa") ?? "").trim();
  const telefonoEsposa = String(formData.get("telefonoEsposa") ?? "").trim();
  const nombreMarido = String(formData.get("nombreMarido") ?? "").trim();
  const emailMarido = String(formData.get("emailMarido") ?? "").trim();
  const telefonoMarido = String(formData.get("telefonoMarido") ?? "").trim();
  const fechaElegida = String(formData.get("fechaElegida") ?? "").trim();

  if (!nombreEsposa || !emailEsposa || !nombreMarido || !emailMarido || !fechaElegida) {
    return { error: "Nombre y correo de ambos, más la fecha, son obligatorios." };
  }

  const supabase = await getSupabaseAdminClient();

  const { data: retreat, error: errorRetreat } = await supabase
    .from("retreats")
    .select("id")
    .eq("slug", RETIRO_DESTACADO)
    .single();
  if (errorRetreat || !retreat) return { error: "No se encontró el retiro destacado." };

  const { error } = await supabase.from("inscritos").insert({
    retreat_id: retreat.id,
    nombre_esposa: nombreEsposa,
    email_esposa: emailEsposa,
    telefono_esposa: telefonoEsposa || null,
    nombre_marido: nombreMarido,
    email_marido: emailMarido,
    telefono_marido: telefonoMarido || null,
    fecha_elegida: fechaElegida,
    estado_pago: "pendiente",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/inscritos");
  return {};
}
