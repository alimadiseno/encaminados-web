import ExcelJS from "exceljs";

export interface FilaContacto {
  nombre: string;
  correo: string;
  telefono: string;
  fecha: string;
  colegio: string;
  familia: string;
}

export async function renderContactosMailchimpXlsx(filas: FilaContacto[]): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet("Contactos");

  hoja.columns = [
    { header: "Nombre", key: "nombre", width: 28 },
    { header: "Correo", key: "correo", width: 32 },
    { header: "Teléfono", key: "telefono", width: 18 },
    { header: "Fecha del retiro", key: "fecha", width: 22 },
    { header: "Colegio", key: "colegio", width: 20 },
    { header: "Familia", key: "familia", width: 26 },
  ];
  hoja.getRow(1).font = { bold: true };

  for (const fila of filas) hoja.addRow(fila);

  return workbook.xlsx.writeBuffer();
}
