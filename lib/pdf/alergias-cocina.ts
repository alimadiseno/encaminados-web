import PDFDocument from "pdfkit";
import type { Inscrito } from "@/lib/inscritos";
import { TERRACOTA, dibujarEtiquetaSuperior, dibujarLogo, renderToBuffer } from "@/lib/pdf/branding";

const MARGEN = 40;

interface FilaAlergia {
  inscrito: Inscrito;
  alergia: string;
}

export async function renderAlergiasCocinaPdf(fecha: string, totalInscritos: number, filas: FilaAlergia[]): Promise<Buffer> {
  const doc = new PDFDocument({ margin: MARGEN, bufferPages: true });

  dibujarLogo(doc);
  dibujarEtiquetaSuperior(doc, "PARA COCINA");

  doc.font("Helvetica-Bold").fontSize(20).fillColor(TERRACOTA).text("Alergias y restricciones alimentarias", MARGEN, doc.y + 10);
  doc.font("Helvetica").fontSize(12).fillColor("#555").text(fecha, MARGEN, doc.y + 2);

  const sustantivoPareja = totalInscritos === 1 ? "pareja inscrita" : "parejas inscritas";
  const verbo = filas.length === 1 ? "declaró" : "declararon";
  const y = doc.y + 14;
  doc
    .fontSize(11)
    .fillColor("#555")
    .text(`${filas.length} de ${totalInscritos} ${sustantivoPareja} ${verbo} alergia o restricción alimentaria.`, MARGEN, y);
  doc
    .lineWidth(1)
    .strokeColor("#ddd")
    .moveTo(MARGEN, doc.y + 14)
    .lineTo(doc.page.width - MARGEN, doc.y + 14)
    .stroke();

  if (filas.length === 0) {
    doc.fontSize(12).fillColor("#777").text("Nadie declaró alergias o restricciones para esta fecha.", MARGEN, doc.y + 24);
    return renderToBuffer(doc);
  }

  const estiloCelda = { border: { bottom: 1 as const }, borderColor: "#eee", padding: { top: 10, bottom: 10, left: 0, right: 0 } };
  const yTabla = doc.y + 24;

  await doc.table({
    position: { x: MARGEN, y: yTabla },
    columnStyles: [{ width: "45%" }, { width: "55%" }],
    defaultStyle: estiloCelda,
    data: [
      [
        {
          text: "Familia",
          font: { src: "Helvetica-Bold", size: 9 },
          textColor: "#777",
          border: { bottom: 1 },
          borderColor: "#1a1a1a",
          padding: { top: 0, bottom: 6, left: 0, right: 0 },
        },
        {
          text: "Alergias y restricciones",
          font: { src: "Helvetica-Bold", size: 9 },
          textColor: "#777",
          border: { bottom: 1 },
          borderColor: "#1a1a1a",
          padding: { top: 0, bottom: 6, left: 0, right: 0 },
        },
      ],
      ...filas.map(({ inscrito, alergia }) => [
        { text: `${inscrito.nombreEsposa} y ${inscrito.nombreMarido}`, font: { src: "Helvetica-Bold", size: 12.5 } },
        { text: alergia, font: { src: "Helvetica", size: 13 } },
      ]),
    ],
  });

  return renderToBuffer(doc);
}
