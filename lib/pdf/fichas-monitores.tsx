import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { DetalleExtra, Inscrito } from "@/lib/inscritos";
import { ETIQUETA_DETALLE, apellidosPareja, formatearFecha } from "@/lib/inscritos-formato";
import { LogoEsquina, TERRACOTA, brandingStyles } from "@/lib/pdf/branding";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  familia: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: TERRACOTA,
    marginBottom: 2,
  },
  fecha: {
    fontSize: 11,
    color: "#555",
    marginBottom: 18,
  },
  seccionPersonas: {
    flexDirection: "row",
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    borderBottomStyle: "solid",
  },
  persona: { flex: 1, marginRight: 24 },
  personaNombre: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  personaLinea: { fontSize: 10, color: "#333", marginBottom: 1 },
  campos: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  campo: { width: "50%", marginBottom: 12, paddingRight: 12 },
  campoEtiqueta: { fontSize: 8.5, color: "#777", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  campoValor: { fontSize: 10.5, lineHeight: 1.4 },
});

function Persona({ nombre, telefono, email }: { nombre: string; telefono: string | null; email: string }) {
  return (
    <View style={styles.persona}>
      <Text style={styles.personaNombre}>{nombre}</Text>
      <Text style={styles.personaLinea}>{email}</Text>
      {telefono && <Text style={styles.personaLinea}>{telefono}</Text>}
    </View>
  );
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.campoEtiqueta}>{etiqueta}</Text>
      <Text style={styles.campoValor}>{valor}</Text>
    </View>
  );
}

/** Todo lo que aporta el inscrito salvo pagos (estado, monto, método, comprobante) — los monitores son también organizadores. */
function camposFicha(inscrito: Inscrito): [string, string][] {
  const detalle = inscrito.detalleExtra;
  const entradasDetalle = detalle
    ? (Object.keys(ETIQUETA_DETALLE) as (keyof DetalleExtra)[])
        .map((clave) => [ETIQUETA_DETALLE[clave], detalle[clave]] as const)
        .filter((entrada): entrada is [string, string] => Boolean(entrada[1] && entrada[1].trim()))
    : [];

  return [
    ["Inscrito el", formatearFecha(inscrito.creadoEn)],
    ...entradasDetalle,
    ...(inscrito.notas ? [["Notas", inscrito.notas] as [string, string]] : []),
  ];
}

function FichaPagina({ inscrito }: { inscrito: Inscrito }) {
  return (
    <Page size="LETTER" style={styles.page}>
      <LogoEsquina />
      <Text style={brandingStyles.encabezado}>FICHA DE PAREJA</Text>
      <Text style={styles.familia}>Familia {apellidosPareja(inscrito)}</Text>
      <Text style={styles.fecha}>{inscrito.fechaElegida}</Text>

      <View style={styles.seccionPersonas}>
        <Persona nombre={inscrito.nombreEsposa} telefono={inscrito.telefonoEsposa} email={inscrito.emailEsposa} />
        <Persona nombre={inscrito.nombreMarido} telefono={inscrito.telefonoMarido} email={inscrito.emailMarido} />
      </View>

      <View style={styles.campos}>
        {camposFicha(inscrito).map(([etiqueta, valor]) => (
          <Campo key={etiqueta} etiqueta={etiqueta} valor={valor} />
        ))}
      </View>
    </Page>
  );
}

function FichasDocument({ inscritos }: { inscritos: Inscrito[] }) {
  return (
    <Document>
      {inscritos.map((inscrito) => (
        <FichaPagina key={inscrito.id} inscrito={inscrito} />
      ))}
    </Document>
  );
}

/** `inscritos` no puede venir vacío — un <Document> sin páginas falla al renderizar. */
export async function renderFichasMonitoresPdf(inscritos: Inscrito[]): Promise<Buffer> {
  return renderToBuffer(<FichasDocument inscritos={inscritos} />);
}
