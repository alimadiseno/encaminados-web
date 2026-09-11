import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { Inscrito } from "@/lib/inscritos";
import { LogoEsquina, TERRACOTA, brandingStyles } from "@/lib/pdf/branding";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  titulo: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: TERRACOTA,
    marginBottom: 2,
  },
  fecha: {
    fontSize: 12,
    color: "#555",
    marginBottom: 14,
  },
  resumen: {
    fontSize: 11,
    color: "#555",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    borderBottomStyle: "solid",
  },
  encabezadoTabla: {
    flexDirection: "row",
    gap: 16,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    borderBottomStyle: "solid",
  },
  encabezadoCelda: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#777", textTransform: "uppercase", letterSpacing: 0.5 },
  fila: {
    flexDirection: "row",
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderBottomStyle: "solid",
  },
  colFamilia: { width: "45%", paddingRight: 12 },
  colAlergia: { width: "55%" },
  filaFamilia: { fontSize: 12.5, fontFamily: "Helvetica-Bold", lineHeight: 1.35 },
  filaAlergia: { fontSize: 13, lineHeight: 1.4 },
  vacio: { fontSize: 12, color: "#777", marginTop: 10 },
});

interface FilaAlergia {
  inscrito: Inscrito;
  alergia: string;
}

function AlergiasDocumento({
  fecha,
  totalInscritos,
  filas,
}: {
  fecha: string;
  totalInscritos: number;
  filas: FilaAlergia[];
}) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <LogoEsquina />
        <Text style={brandingStyles.encabezado}>PARA COCINA</Text>
        <Text style={styles.titulo}>Alergias y restricciones alimentarias</Text>
        <Text style={styles.fecha}>{fecha}</Text>

        <Text style={styles.resumen}>
          {filas.length} de {totalInscritos} {totalInscritos === 1 ? "pareja inscrita" : "parejas inscritas"}{" "}
          {filas.length === 1 ? "declaró" : "declararon"} alergia o restricción alimentaria.
        </Text>

        {filas.length === 0 ? (
          <Text style={styles.vacio}>Nadie declaró alergias o restricciones para esta fecha.</Text>
        ) : (
          <View>
            <View style={styles.encabezadoTabla}>
              <Text style={[styles.colFamilia, styles.encabezadoCelda]}>Familia</Text>
              <Text style={[styles.colAlergia, styles.encabezadoCelda]}>Alergias y restricciones</Text>
            </View>
            {filas.map(({ inscrito, alergia }) => (
              <View key={inscrito.id} style={styles.fila} wrap={false}>
                <Text style={[styles.colFamilia, styles.filaFamilia]}>
                  {inscrito.nombreEsposa} y {inscrito.nombreMarido}
                </Text>
                <Text style={[styles.colAlergia, styles.filaAlergia]}>{alergia}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function renderAlergiasCocinaPdf(fecha: string, totalInscritos: number, filas: FilaAlergia[]): Promise<Buffer> {
  return renderToBuffer(<AlergiasDocumento fecha={fecha} totalInscritos={totalInscritos} filas={filas} />);
}
