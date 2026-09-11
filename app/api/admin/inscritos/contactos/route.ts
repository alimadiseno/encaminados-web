import { NextResponse, type NextRequest } from "next/server";
import { haySesionValida } from "@/lib/admin-auth";
import { getInscritos } from "@/lib/inscritos";
import { apellidosPareja, coincideFecha, colegioNormalizado } from "@/lib/inscritos-formato";
import { renderContactosMailchimpXlsx, type FilaContacto } from "@/lib/excel/contactos-mailchimp";

/** Excel de contactos para Mailchimp — una fila por persona (no por pareja), con la familia como columna de referencia. */
export async function GET(request: NextRequest) {
  const autenticado = await haySesionValida();
  if (!autenticado) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const retreatId = searchParams.get("retreatId");
  const fechas = searchParams.getAll("fecha");

  if (!retreatId) {
    return NextResponse.json({ error: "Falta retreatId." }, { status: 400 });
  }

  const inscritos = await getInscritos(retreatId);
  const filtrados =
    fechas.length === 0 ? inscritos : inscritos.filter((i) => fechas.some((f) => coincideFecha(i.fechaElegida, f)));

  const ordenados = [...filtrados].sort((a, b) => apellidosPareja(a).localeCompare(apellidosPareja(b), "es"));

  const filas: FilaContacto[] = ordenados.flatMap((inscrito) => {
    const familia = apellidosPareja(inscrito);
    const colegio = colegioNormalizado(inscrito.detalleExtra?.colegioRC);
    return [
      { nombre: inscrito.nombreEsposa, correo: inscrito.emailEsposa, telefono: inscrito.telefonoEsposa ?? "", fecha: inscrito.fechaElegida, colegio, familia },
      { nombre: inscrito.nombreMarido, correo: inscrito.emailMarido, telefono: inscrito.telefonoMarido ?? "", fecha: inscrito.fechaElegida, colegio, familia },
    ];
  });

  const buffer = await renderContactosMailchimpXlsx(filas);
  const sufijo = fechas.length === 1 ? `-${fechas[0].trim().toLowerCase().replace(/\s+/g, "-")}` : fechas.length > 1 ? "-varias-fechas" : "";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="contactos-mailchimp${sufijo}.xlsx"`,
    },
  });
}
