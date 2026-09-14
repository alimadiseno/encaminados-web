import type { RetreatEvent } from "@/types/retreat";

/**
 * Un objeto Event de schema.org por cada fecha en `retreat.fechas` — ese
 * arreglo ya se edita desde el admin (pestaña "Información Clave"), así que
 * cuando se abra una fecha nueva esto se actualiza solo, sin tocar código.
 */
export default function EventStructuredData({ retreat }: { retreat: RetreatEvent }) {
  const imagen = retreat.seo.imagenUrl || retreat.heroImagenUrl;

  const eventos = retreat.fechas.map((fecha) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: retreat.nombre,
    description: retreat.seo.descripcion || retreat.bajada,
    startDate: fecha.start,
    endDate: fecha.end,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    url: "https://encaminados.cl",
    image: imagen ? [imagen] : undefined,
    location: {
      "@type": "Place",
      name: retreat.lugar,
      address: retreat.lugar,
    },
    organizer: {
      "@type": "Organization",
      name: retreat.nombre,
      email: retreat.contacto.email || undefined,
      url: "https://encaminados.cl",
    },
  }));

  return (
    <>
      {eventos.map((evento, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(evento) }}
        />
      ))}
    </>
  );
}
