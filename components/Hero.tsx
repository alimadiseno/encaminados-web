import Image from "next/image";
import type { RetreatEvent } from "@/types/retreat";
import Reveal from "./Reveal";

export default function Hero({ retreat }: { retreat: RetreatEvent }) {
  return (
    <section
      id="top"
      className="relative flex min-h-[600px] flex-col items-center justify-center overflow-hidden pt-28 pb-16 lg:min-h-[750px] lg:pb-10"
    >
      <Image
        src="/images/hero-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
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
              {retreat.fechas.map((f) => (
                <div key={f.label} className="flex w-full items-center gap-3">
                  <img src="/icons/calendar.svg" alt="" className="size-4 flex-none" />
                  <p className="h3-section flex-1 text-ink">{f.label}</p>
                </div>
              ))}
              <p className="w-full text-sm text-ink">{retreat.lugar}</p>
            </div>
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

      <img
        src="/icons/hero-wave.svg"
        alt=""
        className="absolute inset-x-0 bottom-0 h-[70px] w-full"
      />
    </section>
  );
}
