import { NextResponse, type NextRequest } from "next/server";
import { haySesionValida } from "@/lib/admin-auth";
import { getInscritos, type EstadoPago } from "@/lib/inscritos";
import { ETIQUETA_ESTADO_PAGO, apellidosPareja, coincideFecha, formatearFecha } from "@/lib/inscritos-formato";
import { renderCompletoAdminXlsx, type FilaCompleta } from "@/lib/excel/completo-admin";

const ESTADOS_VALIDOS: EstadoPago[] = ["pendiente", "parcial", "pagado"];

/** Excel completo para admin — todas las columnas, incluyendo pagos y notas internas. */
export async function GET(request: NextRequest) {
  const autenticado = await haySesionValida();
  if (!autenticado) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const retreatId = searchParams.get("retreatId");
  const fechas = searchParams.getAll("fecha");
  const estadoParam = searchParams.get("estado");
  const estado = ESTADOS_VALIDOS.includes(estadoParam as EstadoPago) ? (estadoParam as EstadoPago) : null;

  if (!retreatId) {
    return NextResponse.json({ error: "Falta retreatId." }, { status: 400 });
  }

  const inscritos = await getInscritos(retreatId);
  const filtrados = inscritos.filter(
    (i) =>
      (fechas.length === 0 || fechas.some((f) => coincideFecha(i.fechaElegida, f))) &&
      (!estado || i.estadoPago === estado),
  );

  const ordenados = [...filtrados].sort((a, b) => apellidosPareja(a).localeCompare(apellidosPareja(b), "es"));

  const filas: FilaCompleta[] = ordenados.map((inscrito) => ({
    familia: apellidosPareja(inscrito),
    nombreEsposa: inscrito.nombreEsposa,
    telefonoEsposa: inscrito.telefonoEsposa ?? "",
    correoEsposa: inscrito.emailEsposa,
    nombreMarido: inscrito.nombreMarido,
    telefonoMarido: inscrito.telefonoMarido ?? "",
    correoMarido: inscrito.emailMarido,
    fecha: inscrito.fechaElegida,
    estadoPago: ETIQUETA_ESTADO_PAGO[inscrito.estadoPago],
    monto: inscrito.monto,
    metodoPago: inscrito.metodoPago ?? "",
    notas: inscrito.notas ?? "",
    fechaMatrimonio: inscrito.detalleExtra?.fechaMatrimonio ?? "",
    colegioRC: inscrito.detalleExtra?.colegioRC ?? "",
    alergias: inscrito.detalleExtra?.alergias ?? "",
    motivacion: inscrito.detalleExtra?.motivacion ?? "",
    expectativas: inscrito.detalleExtra?.expectativas ?? "",
    gruposEncuentro: inscrito.detalleExtra?.gruposEncuentro ?? "",
    cantidadHijos: inscrito.detalleExtra?.cantidadHijos ?? "",
    comentarios: inscrito.detalleExtra?.comentarios ?? "",
    comprobanteUrl: inscrito.comprobanteUrl ?? "",
    inscritoEl: formatearFecha(inscrito.creadoEn),
  }));

  const buffer = await renderCompletoAdminXlsx(filas);

  const sufijoFecha = fechas.length === 1 ? `-${fechas[0].trim().toLowerCase().replace(/\s+/g, "-")}` : fechas.length > 1 ? "-varias-fechas" : "";
  const sufijoEstado = estado ? `-${estado}` : "";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="inscritos-completo${sufijoFecha}${sufijoEstado}.xlsx"`,
    },
  });
}
