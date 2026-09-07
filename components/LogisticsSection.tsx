import type { RetreatEvent } from "@/types/retreat";
import { fechasLabel } from "@/data/retreats";
import Reveal from "./Reveal";

function Fila({ icono, etiqueta, valor }: { icono: string; etiqueta: string; valor: string }) {
  return (
    <div className="flex w-full items-center gap-6 border-b border-ink pb-3">
      <div className="flex w-[150px] flex-none items-center gap-3">
        <img src={icono} alt="" className="size-[18px] flex-none" />
        <p className="h3-section whitespace-nowrap text-terracotta">{etiqueta}</p>
      </div>
      <p className="flex-1 text-base text-ink">{valor}</p>
    </div>
  );
}

export default function LogisticsSection({ retreat }: { retreat: RetreatEvent }) {
  return (
    <section id="logistica" className="bg-cream py-[clamp(4rem,9vw,6rem)]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6 sm:px-10 lg:px-24">
        <Reveal>
          <h2 className="h1-section text-center text-ink">
            Información <span className="text-terracotta">Clave</span>
          </h2>
        </Reveal>

        <Reveal
          delay={80}
          className="flex w-full max-w-[1120px] flex-col items-stretch gap-10 rounded-[32px] bg-block p-6 sm:p-12 lg:flex-row lg:items-center"
        >
          <div className="flex flex-1 flex-col gap-5">
            <Fila icono="/icons/calendar-outline.svg" etiqueta="Fechas" valor={fechasLabel(retreat)} />
            <Fila icono="/icons/map-pin.svg" etiqueta="Lugar" valor={retreat.lugar} />
            <Fila icono="/icons/clock.svg" etiqueta="Llegada" valor={retreat.horaInicio} />
            <Fila icono="/icons/clock-check.svg" etiqueta="Término" valor={retreat.horaTermino} />
            <Fila icono="/icons/dollar.svg" etiqueta="Valor" valor={retreat.costo} />
            <Fila icono="/icons/package-check.svg" etiqueta="Incluye" valor={retreat.incluye} />
          </div>

          <div className="flex w-full flex-col items-center gap-6 rounded-3xl bg-card p-8 lg:w-[400px] lg:flex-none">
            <p className="h2-section text-center text-ink">{retreat.cupos}</p>
            <p className="text-center text-sm leading-[1.5] text-ink">{retreat.cuposDescripcion}</p>
            <a
              href={retreat.inscripcionUrl}
              target="_blank"
              rel="noopener"
              className="flex w-full items-center justify-center rounded-full bg-terracotta px-8 py-[18px] text-sm font-bold tracking-[0.14em] text-peach uppercase no-underline transition-opacity hover:opacity-90"
            >
              Inscribirme ahora
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
