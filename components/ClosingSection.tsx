import type { RetreatEvent } from "@/types/retreat";
import Reveal from "./Reveal";

export default function ClosingSection({ retreat }: { retreat: RetreatEvent }) {
  return (
    <section id="inscripcion" className="relative overflow-hidden bg-cream pt-[clamp(4rem,9vw,6rem)]">
      <div className="mx-auto flex max-w-[720px] flex-col items-center gap-10 px-6 text-center sm:px-8">
        <div className="flex flex-col items-center gap-4">
          <Reveal>
            <h2 className="h1-section text-ink">Nos vemos allá</h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="h3-section text-terracotta italic">
              Tres días para los dos. El resto puede esperar.
            </p>
          </Reveal>
        </div>

        <Reveal delay={160}>
          <a
            href={retreat.inscripcionUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-terracotta px-8 py-[18px] text-sm font-bold tracking-[0.14em] text-peach uppercase no-underline transition-opacity hover:opacity-90"
          >
            Inscribirme ahora
          </a>
        </Reveal>

        <Reveal delay={240} className="flex flex-col items-center gap-2 pt-6 text-ink">
          <p className="text-sm">¿Dudas? Escríbenos directamente:</p>
          <p className="text-base font-semibold">
            WhatsApp {retreat.contacto.whatsapp} · {retreat.contacto.email}
          </p>
        </Reveal>
      </div>

      <img src="/icons/closing-wave.svg" alt="" className="mt-10 h-[70px] w-full" />
    </section>
  );
}
