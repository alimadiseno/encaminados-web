import { NextResponse, type NextRequest } from "next/server";
import { haySesionValida } from "@/lib/admin-auth";
import { getInscritos } from "@/lib/inscritos";
import { apellidosPareja, coincideFecha } from "@/lib/inscritos-formato";
import { renderFichasMonitoresPdf } from "@/lib/pdf/fichas-monitores";

/** Descarga en PDF de las fichas de pareja para monitores — un GET simple porque el navegador lo dispara como descarga de archivo, no como fetch. */
export async function GET(request: NextRequest) {
  const autenticado = await haySesionValida();
  if (!autenticado) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const retreatId = searchParams.get("retreatId");
  const fecha = searchParams.get("fecha");

  if (!retreatId) {
    return NextResponse.json({ error: "Falta retreatId." }, { status: 400 });
  }

  const inscritos = await getInscritos(retreatId);
  const filtrados = !fecha || fecha === "todas" ? inscritos : inscritos.filter((i) => coincideFecha(i.fechaElegida, fecha));

  if (filtrados.length === 0) {
    return NextResponse.json({ error: "No hay inscritos para esa fecha." }, { status: 404 });
  }

  const ordenados = [...filtrados].sort((a, b) => apellidosPareja(a).localeCompare(apellidosPareja(b), "es"));

  const buffer = await renderFichasMonitoresPdf(ordenados);
  const sufijo = fecha && fecha !== "todas" ? `-${fecha.trim().toLowerCase().replace(/\s+/g, "-")}` : "";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="fichas-monitores${sufijo}.pdf"`,
    },
  });
}
