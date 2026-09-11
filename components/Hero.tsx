import Image from "next/image";
import type { RetreatEvent } from "@/types/retreat";
import Reveal from "./Reveal";

export default function Hero({ retreat }: { retreat: RetreatEvent }) {
  return (
    <section
      id="top"
      className="sticky top-0 z-0 flex min-h-[600px] flex-col items-center justify-center overflow-hidden pt-28 pb-16 lg:min-h-[750px] lg:pb-10"
    >
      <Image
        src={retreat.heroImagenUrl}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Color a propósito fuera de la paleta (no bg-ink/N): ajustado a mano para esta foto puntual del hero, no es un token del sistema. */}
      <div className="absolute inset-0 bg-[rgba(77,90,110,0.35)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-10 px-6 sm:px-10 lg:flex-row lg:items-center lg:justify-center lg:gap-10 lg:px-24">
        <div className="flex flex-col items-start gap-4 text-cream lg:flex-1 lg:py-[50px]">
          <Reveal>
            <h1 className="font-display text-[clamp(3rem,11vw,6rem)] leading-[1.05] font-normal tracking-[0.02em] italic">
              Encaminados
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="max-w-[720px] font-display text-[clamp(1.3rem,4vw,2rem)] leading-[1.3]">
              {retreat.bajada}
            </p>
          </Reveal>
        </div>

        <Reveal delay={200} className="w-full max-w-[332px] flex-none">
          <div className="flex w-full flex-col items-center gap-7 rounded-[20px] bg-cream/95 px-8 py-6 backdrop-blur-sm">
            <div className="flex w-full flex-col items-center gap-3.5">
              <p className="w-full text-center font-body text-base font-semibold text-terracotta">
                PRÓXIMAS FECHAS {retreat.fechas[0]?.start.slice(0, 4)}
              </p>
              {retreat.fechas.map((f, i) => (
                <Reveal key={f.label} delay={260 + i * 70} className="flex w-full items-center gap-3">
                  <img src="/icons/calendar.svg" alt="" className="size-4 flex-none" />
                  <p className="h3-section flex-1 text-ink">{f.label}</p>
                </Reveal>
              ))}
              <p className="w-full text-sm text-ink">{retreat.lugar}</p>
            </div>
            <a
              href={retreat.inscripcionUrl}
              target="_blank"
              rel="noopener"
              className="btn-primary w-full py-[18px] no-underline"
            >
              Inscribirme ahora
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
