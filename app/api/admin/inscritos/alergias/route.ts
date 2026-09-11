import { NextResponse, type NextRequest } from "next/server";
import { haySesionValida } from "@/lib/admin-auth";
import { getInscritos, type Inscrito } from "@/lib/inscritos";
import { apellidosPareja, coincideFecha, esRespuestaNegativa } from "@/lib/inscritos-formato";
import { renderAlergiasCocinaPdf } from "@/lib/pdf/alergias-cocina";

/** Descarga en PDF de alergias/restricciones alimentarias para cocina — fecha obligatoria, se cocina por sesión. */
export async function GET(request: NextRequest) {
  const autenticado = await haySesionValida();
  if (!autenticado) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const retreatId = searchParams.get("retreatId");
  const fecha = searchParams.get("fecha");

  if (!retreatId || !fecha) {
    return NextResponse.json({ error: "Faltan retreatId y/o fecha." }, { status: 400 });
  }

  const inscritos = await getInscritos(retreatId);
  const deLaFecha = inscritos.filter((i) => coincideFecha(i.fechaElegida, fecha));

  const conAlergia = deLaFecha
    .map((inscrito) => ({ inscrito, valor: inscrito.detalleExtra?.alergias?.trim() }))
    .filter((r): r is { inscrito: Inscrito; valor: string } => Boolean(r.valor));

  const filas = conAlergia
    .filter((r) => !esRespuestaNegativa(r.valor))
    .map((r) => ({ inscrito: r.inscrito, alergia: r.valor }))
    .sort((a, b) => apellidosPareja(a.inscrito).localeCompare(apellidosPareja(b.inscrito), "es"));

  const buffer = await renderAlergiasCocinaPdf(fecha, deLaFecha.length, filas);
  const sufijo = fecha.trim().toLowerCase().replace(/\s+/g, "-");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="alergias-cocina-${sufijo}.pdf"`,
    },
  });
}
