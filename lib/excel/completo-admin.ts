import ExcelJS from "exceljs";

export interface FilaCompleta {
  familia: string;
  nombreEsposa: string;
  telefonoEsposa: string;
  correoEsposa: string;
  nombreMarido: string;
  telefonoMarido: string;
  correoMarido: string;
  fecha: string;
  estadoPago: string;
  monto: number | null;
  metodoPago: string;
  notas: string;
  fechaMatrimonio: string;
  colegioRC: string;
  alergias: string;
  motivacion: string;
  expectativas: string;
  gruposEncuentro: string;
  cantidadHijos: string;
  comentarios: string;
  comprobanteUrl: string;
  inscritoEl: string;
}

export async function renderCompletoAdminXlsx(filas: FilaCompleta[]): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Inscritos");

  hoja.columns = [
    { header: "Familia", key: "familia", width: 24 },
    { header: "Nombre esposa", key: "nombreEsposa", width: 26 },
    { header: "Teléfono esposa", key: "telefonoEsposa", width: 16 },
    { header: "Correo esposa", key: "correoEsposa", width: 30 },
    { header: "Nombre marido", key: "nombreMarido", width: 26 },
    { header: "Teléfono marido", key: "telefonoMarido", width: 16 },
    { header: "Correo marido", key: "correoMarido", width: 30 },
    { header: "Fecha elegida", key: "fecha", width: 22 },
    { header: "Estado de pago", key: "estadoPago", width: 14 },
    { header: "Monto", key: "monto", width: 12 },
    { header: "Método de pago", key: "metodoPago", width: 18 },
    { header: "Notas", key: "notas", width: 30 },
    { header: "Fecha de matrimonio", key: "fechaMatrimonio", width: 20 },
    { header: "¿Apoderados/colaboradores de un colegio de la Red RC?", key: "colegioRC", width: 30 },
    { header: "Alergias o intolerancias", key: "alergias", width: 26 },
    { header: "Qué los motivó a venir", key: "motivacion", width: 30 },
    { header: "Qué expectativa tienen", key: "expectativas", width: 30 },
    { header: "¿Participan de grupos de encuentro?", key: "gruposEncuentro", width: 26 },
    { header: "Cuántos hijos tienen", key: "cantidadHijos", width: 18 },
    { header: "Comentarios", key: "comentarios", width: 30 },
    { header: "Comprobante de depósito", key: "comprobanteUrl", width: 30 },
    { header: "Inscrito el", key: "inscritoEl", width: 14 },
  ];
  hoja.getRow(1).font = { bold: true };

  for (const fila of filas) hoja.addRow(fila);

  return workbook.xlsx.writeBuffer();
}
