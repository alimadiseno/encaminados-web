import type { RetreatEvent } from "@/types/retreat";

// Se declaran aparte (y no inline en el objeto de abajo) porque se reusan en
// más de un lugar: la ficha de logística y la respuesta del FAQ "¿Cómo llegamos?".
const comoLlegar =
  "Al lado del Santuario de Lo Vásquez, camino a Viña del Mar, pasado Casablanca. Cerca de una hora desde Santiago.";
const mapaUrl = "https://www.google.com/maps/search/?api=1&query=Santuario+de+Lo+V%C3%A1squez";

/**
 * Único retiro activo hoy. El resto del sitio nunca importa este objeto
 * directo — siempre a través de getFeaturedRetreat()/getRetreatBySlug(),
 * para que el día que existan varios retiros el cambio sea agregar
 * elementos a este arreglo, no reescribir componentes.
 */
export const retreats: RetreatEvent[] = [
  {
    slug: "2026-segundo-semestre",
    nombre: "Encaminados",
    bajada: "Un fin de semana para volver a caminar juntos.",
    fechas: [
      { label: "2 al 4 de octubre", start: "2026-10-02", end: "2026-10-04" },
      { label: "6 al 8 de noviembre", start: "2026-11-06", end: "2026-11-08" },
    ],
    lugar: "Centro de Espiritualidad de Lo Vásquez",
    comoLlegar,
    mapaUrl,
    horaInicio: "19:00 del viernes",
    horaTermino: "12:30 del domingo",
    costo: "$180.000 por matrimonio",
    incluye: "alojamiento, sábanas, materiales y todas las comidas",
    cuotasDisponibles: true,
    cupos: "Cupos Limitados",
    cuposDescripcion:
      "Para asegurar un espacio íntimo y de calidad para cada pareja, trabajamos con grupos reducidos.",
    inscripcionUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSf9D6pJ4g1i8D4hG951h7mHcEVqYtKsrczb5LJnE4xtU76G-w/viewform",
    contacto: {
      whatsapp: "+56 9 9359 5766",
      whatsappMensaje: "Hola, tenemos una duda sobre Encaminados.",
      email: "gvicuna@lcred.org",
    },
    ideas: [
      {
        titulo: "Para los dos",
        descripcion:
          "Se participa en matrimonio, de principio a fin. Un espacio diseñado exclusivamente para reencontrarse en lo íntimo.",
      },
      {
        titulo: "Sin currículum previo",
        descripcion:
          "No hay que saber nada ni haber hecho nada antes. El retiro te recibe exactamente donde tu matrimonio se encuentra hoy.",
      },
      {
        titulo: "Fuera de todo",
        descripcion:
          "Del viernes en la tarde al domingo al mediodía. Sin niños, sin pantallas, sin pendientes. Tres días para lo verdaderamente importante.",
      },
    ],
    videos: [
      {
        id: "v1",
        nombre: "María y José",
        cita: "Definitivamente hay un antes y un después; un verdadero punto de inflexión.",
      },
      {
        id: "v2",
        nombre: "Ana y Pedro",
        cita: "Una experiencia realmente mágica; momentos para estar tranquilos, conversar y reconectar.",
      },
      {
        id: "v3",
        nombre: "Claudia y Diego",
        cita: "Es una oportunidad para volver a enfocar prioridades, reconectar en pareja y estar un rato con Dios.",
      },
    ],
    guias: [
      {
        id: "sacerdote",
        nombre: "[Pendiente: nombre del sacerdote]",
        rol: "Director Espiritual",
        fotoUrl: "/images/guia-sacerdote.webp",
        fotoForma: "arco",
      },
      {
        id: "matrimonio-guia",
        nombre: "[Pendiente: nombre del matrimonio guía]",
        rol: "Matrimonio Guía",
        fotoUrl: "/images/guia-matrimonio.webp",
        fotoForma: "circulo",
      },
    ],
    guiasIntro:
      "[Texto pendiente de confirmar con el cliente: quiénes son las personas que guían el retiro, cuál es su rol, y qué se puede esperar de ellos.]",
    historia: {
      pendiente: true,
      parrafos: [
        "[Texto pendiente de entrega por el cliente. Extensión objetivo: 200–300 palabras, tono narrativo en primera persona plural, contado como se lo contarían a un amigo en la mesa: quiénes fueron los primeros matrimonios, qué los movió a armar el primer fin de semana, y qué pasó después.]",
      ],
    },
    faq: [
      {
        pregunta: "¿Cuándo y dónde es?",
        respuesta:
          "Hay dos fechas este semestre y se elige una al momento de inscribirse.",
      },
      {
        pregunta: "¿A qué hora llegamos y a qué hora terminamos?",
        respuesta: "Los esperamos el viernes y terminamos el domingo. Alcanzan a llegar a almorzar a la casa.",
      },
      {
        pregunta: "¿Cómo llegamos?",
        respuesta: `Cada matrimonio llega por su cuenta. ${comoLlegar}`,
        enlace: { texto: "Ver en el mapa", href: mapaUrl },
      },
      {
        pregunta: "¿Cuánto cuesta y qué incluye?",
        respuesta:
          "El cupo se reserva con una transferencia o con el link de pago, del total o de la mitad; también se puede pagar en cuotas. Si el costo es un problema, escríbannos antes: eso se conversa y se arregla.",
      },
      {
        pregunta: "¿Cómo nos inscribimos?",
        respuesta:
          "Se completa un formulario por matrimonio y se reserva el cupo con el pago. El resto de los detalles les llega después por correo.",
      },
      {
        pregunta: "¿Qué tenemos que llevar?",
        respuesta:
          "Ropa cómoda para tres días, y nada más. No hay que preparar nada, ni leer nada, ni traer nada especial. Vengan como están.",
      },
      {
        pregunta: "¿Hay que participar de todo?",
        respuesta:
          "El fin de semana está pensado como una sola cosa de principio a fin y se disfruta mucho más así. Nadie los va a obligar a nada.",
      },
      {
        pregunta: "¿Se puede ir sin mi cónyuge?",
        respuesta: "No. Encaminados es para los dos: casi todo lo que pasa ahí pasa entre ustedes.",
      },
      {
        pregunta: "¿Qué pasa si no somos muy practicantes?",
        respuesta:
          "Nada. Van matrimonios de todo tipo y a nadie se le pregunta por eso. No hay que saber rezar, ni ir a misa, ni estar de acuerdo con todo. Basta con querer estar.",
      },
      {
        pregunta: "¿Podemos llevar a los niños?",
        respuesta:
          "El fin de semana es solo para los dos. Vale la pena dejar todo organizado en la casa: son tres días para ustedes.",
      },
    ],
  },
];

export function getFeaturedRetreat(): RetreatEvent {
  return retreats[0];
}

export function getRetreatBySlug(slug: string): RetreatEvent | undefined {
  return retreats.find((r) => r.slug === slug);
}

export function anioDelRetiro(retreat: RetreatEvent): string {
  return retreat.fechas[0]?.start.slice(0, 4) ?? "";
}

export function fechasLabel(retreat: RetreatEvent): string {
  const base = retreat.fechas.map((f) => f.label).join(" o ");
  const anio = anioDelRetiro(retreat);
  return anio ? `${base}, ${anio}` : base;
}
