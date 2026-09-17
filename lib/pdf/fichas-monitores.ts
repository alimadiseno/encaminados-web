import PDFDocument from "pdfkit";
import type { Inscrito } from "@/lib/inscritos";
import { apellidosPareja, camposDetalle, formatearFecha } from "@/lib/inscritos-formato";
import { TERRACOTA, dibujarEtiquetaSuperior, dibujarLogo, renderToBuffer } from "@/lib/pdf/branding";

const MARGEN = 40;
const ANCHO_PAGINA = 612; // LETTER
const ANCHO_CONTENIDO = ANCHO_PAGINA - MARGEN * 2;
const SEPARACION_COLUMNAS = 16;
const ANCHO_COLUMNA = (ANCHO_CONTENIDO - SEPARACION_COLUMNAS) / 2;

/** Todo lo que aporta el inscrito salvo pagos (estado, monto, método, comprobante) — los monitores son también organizadores. */
function camposFicha(inscrito: Inscrito): [string, string][] {
  return [
    ["Inscrito el", formatearFecha(inscrito.creadoEn)],
    ...camposDetalle(inscrito.detalleExtra),
    ...(inscrito.notas ? [["Notas", inscrito.notas] as [string, string]] : []),
  ];
}

function dibujarPersona(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  ancho: number,
  nombre: string,
  email: string,
  telefono: string | null,
): number {
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#1a1a1a").text(nombre, x, y, { width: ancho });
  doc.font("Helvetica").fontSize(10).fillColor("#333").text(email, x, doc.y + 3, { width: ancho });
  if (telefono) doc.text(telefono, x, doc.y + 1, { width: ancho });
  return doc.y;
}

/** Alto que va a ocupar un campo (etiqueta + valor) sin dibujarlo — para poder alinear 2 columnas por la más alta. */
function alturaCampo(doc: PDFKit.PDFDocument, [etiqueta, valor]: [string, string], ancho: number): number {
  const alturaEtiqueta = doc.font("Helvetica-Bold").fontSize(8.5).heightOfString(etiqueta.toUpperCase(), { width: ancho, characterSpacing: 0.5 });
  const alturaValor = doc.font("Helvetica").fontSize(10.5).heightOfString(valor, { width: ancho, lineGap: 2 });
  return alturaEtiqueta + 2 + alturaValor;
}

function dibujarCampo(doc: PDFKit.PDFDocument, [etiqueta, valor]: [string, string], x: number, y: number, ancho: number): void {
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#777").text(etiqueta.toUpperCase(), x, y, { width: ancho, characterSpacing: 0.5 });
  doc.font("Helvetica").fontSize(10.5).fillColor("#1a1a1a").text(valor, x, doc.y + 2, { width: ancho, lineGap: 2 });
}

function dibujarFicha(doc: PDFKit.PDFDocument, inscrito: Inscrito): void {
  doc.addPage({ size: "LETTER", margin: MARGEN });
  dibujarLogo(doc);

  dibujarEtiquetaSuperior(doc, "FICHA DE PAREJA");

  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(TERRACOTA)
    .text(`Familia ${apellidosPareja(inscrito)}`, MARGEN, doc.y + 10);
  doc.font("Helvetica").fontSize(11).fillColor("#555").text(inscrito.fechaElegida, MARGEN, doc.y + 2);

  const yPersonas = doc.y + 18;
  const finEsposa = dibujarPersona(doc, MARGEN, yPersonas, ANCHO_COLUMNA, inscrito.nombreEsposa, inscrito.emailEsposa, inscrito.telefonoEsposa);
  const finMarido = dibujarPersona(
    doc,
    MARGEN + ANCHO_COLUMNA + SEPARACION_COLUMNAS,
    yPersonas,
    ANCHO_COLUMNA,
    inscrito.nombreMarido,
    inscrito.emailMarido,
    inscrito.telefonoMarido,
  );

  let y = Math.max(finEsposa, finMarido) + 14;
  doc.lineWidth(1).strokeColor("#ddd").moveTo(MARGEN, y).lineTo(MARGEN + ANCHO_CONTENIDO, y).stroke();
  y += 18;

  const campos = camposFicha(inscrito);
  for (let i = 0; i < campos.length; i += 2) {
    const izquierda = campos[i];
    const derecha = campos[i + 1] as [string, string] | undefined;
    const alturaFila = Math.max(alturaCampo(doc, izquierda, ANCHO_COLUMNA), derecha ? alturaCampo(doc, derecha, ANCHO_COLUMNA) : 0);
    dibujarCampo(doc, izquierda, MARGEN, y, ANCHO_COLUMNA);
    if (derecha) dibujarCampo(doc, derecha, MARGEN + ANCHO_COLUMNA + SEPARACION_COLUMNAS, y, ANCHO_COLUMNA);
    y += alturaFila + 12;
  }
}

/** `inscritos` no puede venir vacío — un documento sin páginas no se puede generar. */
export async function renderFichasMonitoresPdf(inscritos: Inscrito[]): Promise<Buffer> {
  const doc = new PDFDocument({ autoFirstPage: false, bufferPages: true });
  for (const inscrito of inscritos) {
    dibujarFicha(doc, inscrito);
  }
  return renderToBuffer(doc);
}
