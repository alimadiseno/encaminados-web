import Image from "next/image";
import type { Guia, RetreatEvent } from "@/types/retreat";
import Reveal from "./Reveal";

const FORMA_FOTO: Record<Guia["fotoForma"], string> = {
  arco: "rounded-t-[100px] rounded-b-2xl",
  circulo: "rounded-full",
};

export default function GuidesSection({ retreat }: { retreat: RetreatEvent }) {
  if (retreat.guias.length === 0) return null;

  return (
    <section id="guias" className="bg-cream py-[clamp(4rem,9vw,6rem)]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6 sm:px-10 lg:px-24">
        <Reveal>
          <h2 className="h1-section text-center text-ink">
            Quiénes los <span className="text-terracotta italic">acompañan</span>
          </h2>
        </Reveal>

        <div className="flex w-full flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">
          <Reveal delay={80} className="flex w-full max-w-[467px] items-center justify-center gap-10">
            {retreat.guias.map((guia) => (
              <div key={guia.id} className="flex flex-1 flex-col items-center gap-5">
                <div
                  className={`relative h-[220px] w-[170px] overflow-hidden sm:h-[260px] sm:w-[200px] ${FORMA_FOTO[guia.fotoForma]}`}
                >
                  <Image src={guia.fotoUrl} alt="" fill sizes="200px" className="object-cover" />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="h3-section text-ink">{guia.nombre}</p>
                  <p className="text-sm text-terracotta">{guia.rol}</p>
                </div>
              </div>
            ))}
          </Reveal>

          <Reveal delay={160} className="flex flex-1 items-center">
            <p className="text-base leading-[1.7] text-ink italic">{retreat.guiasIntro}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
