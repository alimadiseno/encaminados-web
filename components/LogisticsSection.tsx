import type { RetreatEvent } from "@/types/retreat";
import { fechasLabel } from "@/data/retreats";
import Reveal from "./Reveal";

function Fila({ icono, etiqueta, valor, delay }: { icono: string; etiqueta: string; valor: string; delay: number }) {
  return (
    <Reveal delay={delay} className="flex w-full items-center gap-6 border-b border-ink pb-3">
      <div className="flex w-[150px] flex-none items-center gap-3">
        <img src={icono} alt="" className="size-[18px] flex-none" />
        <p className="h3-section whitespace-nowrap text-terracotta">{etiqueta}</p>
      </div>
      <p className="flex-1 text-base text-ink">{valor}</p>
    </Reveal>
  );
}

export default function LogisticsSection({ retreat }: { retreat: RetreatEvent }) {
  const filas: { icono: string; etiqueta: string; valor: string }[] = [
    { icono: "/icons/calendar-outline.svg", etiqueta: "Fechas", valor: fechasLabel(retreat) },
    { icono: "/icons/map-pin.svg", etiqueta: "Lugar", valor: retreat.lugar },
    { icono: "/icons/clock.svg", etiqueta: "Llegada", valor: retreat.horaInicio },
    { icono: "/icons/clock-check.svg", etiqueta: "Término", valor: retreat.horaTermino },
    { icono: "/icons/dollar.svg", etiqueta: "Valor", valor: retreat.costo },
    { icono: "/icons/package-check.svg", etiqueta: "Incluye", valor: retreat.incluye },
  ];

  return (
    <section id="logistica" className="bg-cream py-[clamp(4rem,9vw,6rem)]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6 sm:px-10 lg:px-24">
        <Reveal>
          <h2 className="h1-section text-center text-ink">
            Información <span className="text-terracotta">Clave</span>
          </h2>
        </Reveal>

        <div className="flex w-full max-w-[1120px] flex-col items-stretch gap-10 rounded-[32px] bg-block p-6 sm:p-12 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-5">
            {filas.map((f, i) => (
              <Fila key={f.etiqueta} {...f} delay={i * 70} />
            ))}
          </div>

          <Reveal delay={filas.length * 70} className="flex w-full flex-col items-center gap-6 rounded-3xl bg-card p-8 lg:w-[400px] lg:flex-none">
            <p className="h2-section text-center text-ink">{retreat.cupos}</p>
            <p className="text-center text-sm leading-[1.5] text-ink">{retreat.cuposDescripcion}</p>
            <a
              href={retreat.inscripcionUrl}
              target="_blank"
              rel="noopener"
              className="btn-primary w-full py-[18px] no-underline"
            >
              Inscribirme ahora
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
