import Image from "next/image";
import type { RetreatEvent } from "@/types/retreat";
import Reveal from "./Reveal";

export default function GuidesSection({ retreat }: { retreat: RetreatEvent }) {
  return (
    <section id="guias" className="bg-cream py-[clamp(4rem,9vw,6rem)]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6 sm:px-10 lg:px-24">
        <Reveal>
          <h2 className="h1-section text-center text-ink">
            Quiénes los <span className="text-terracotta italic">acompañan</span>
          </h2>
        </Reveal>

        <div className="flex w-full flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
          <Reveal
            delay={80}
            className="relative h-[240px] w-full overflow-hidden rounded-tl-[180px] rounded-tr-[20px] rounded-br-[180px] rounded-bl-[20px] bg-sage sm:h-[320px] lg:flex-1"
          >
            {retreat.guiasFotoUrl && (
              <Image src={retreat.guiasFotoUrl} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            )}
          </Reveal>

          <Reveal delay={160} className="flex flex-1 items-center">
            <p className="text-base leading-[1.7] whitespace-pre-line text-ink">{retreat.guiasIntro}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
