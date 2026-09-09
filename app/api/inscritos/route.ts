import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { leerVariableDeEntorno } from "@/lib/session-auth";
import { RETIRO_DESTACADO } from "@/data/retreats";

/**
 * Recibe cada respuesta nueva del Google Form (vía un script de Apps
 * Script pegado en la hoja de cálculo enlazada, que llama a esta URL con
 * `UrlFetchApp.fetch()` en su trigger `onFormSubmit`). Tiene que ser una
 * URL HTTP normal — no un Server Action — porque quien la llama es un
 * script externo a este sitio, no un formulario del navegador.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido, se esperaba JSON." }, { status: 400 });
  }

  const secretEsperado = await leerVariableDeEntorno("INSCRITOS_WEBHOOK_SECRET");
  if (!secretEsperado || body.secret !== secretEsperado) {
    return NextResponse.json({ error: "Secret inválido." }, { status: 401 });
  }

  const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const nombreEsposa = texto(body.nombreEsposa);
  const emailEsposa = texto(body.emailEsposa);
  const telefonoEsposa = texto(body.telefonoEsposa);
  const nombreMarido = texto(body.nombreMarido);
  const emailMarido = texto(body.emailMarido);
  const telefonoMarido = texto(body.telefonoMarido);
  const fechaElegida = texto(body.fechaElegida);
  const comprobanteUrl = texto(body.comprobanteUrl);
  const fechaInscripcion = texto(body.fechaInscripcion);
  const detalleExtra = body.detalleExtra && typeof body.detalleExtra === "object" ? body.detalleExtra : null;

  if (!nombreEsposa || !emailEsposa || !nombreMarido || !emailMarido || !fechaElegida) {
    return NextResponse.json(
      {
        error:
          "Faltan campos obligatorios: nombreEsposa, emailEsposa, nombreMarido, emailMarido y fechaElegida.",
      },
      { status: 400 },
    );
  }

  const supabase = await getSupabaseAdminClient();

  const { data: retreat, error: errorRetreat } = await supabase
    .from("retreats")
    .select("id")
    .eq("slug", RETIRO_DESTACADO)
    .single();

  if (errorRetreat || !retreat) {
    return NextResponse.json({ error: "No se encontró el retiro destacado." }, { status: 500 });
  }

  // upsert (no insert): el script de Apps Script puede correr más de una vez sobre
  // la misma respuesta (ej. reintentando la carga inicial) sin duplicar la fila.
  // A propósito NO se incluyen estado_pago/monto/metodo_pago/notas acá — son
  // campos que solo edita Aline a mano en el panel, así que si la fila ya existe
  // el upsert los deja intactos (no aparecen en el UPDATE); si es una fila nueva,
  // toman el valor por defecto de la columna ('pendiente' / null).
  const { error: errorInsertar } = await supabase.from("inscritos").upsert(
    {
      retreat_id: retreat.id,
      nombre_esposa: nombreEsposa,
      email_esposa: emailEsposa,
      telefono_esposa: telefonoEsposa || null,
      nombre_marido: nombreMarido,
      email_marido: emailMarido,
      telefono_marido: telefonoMarido || null,
      fecha_elegida: fechaElegida,
      comprobante_url: comprobanteUrl || null,
      detalle_extra: detalleExtra,
      ...(fechaInscripcion ? { creado_en: fechaInscripcion } : {}),
    },
    { onConflict: "retreat_id,email_esposa,email_marido" },
  );

  if (errorInsertar) {
    return NextResponse.json({ error: errorInsertar.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
