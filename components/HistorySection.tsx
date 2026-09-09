import Image from "next/image";
import type { RetreatEvent } from "@/types/retreat";
import Reveal from "./Reveal";

export default function HistorySection({ retreat }: { retreat: RetreatEvent }) {
  return (
    <section id="historia" className="bg-lavender py-[clamp(4rem,9vw,6rem)]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-10 px-6 sm:px-10 lg:flex-row lg:gap-20 lg:px-24">
        <div className="flex flex-1 flex-col items-start gap-6">
          <Reveal>
            <h2 className="h1-section text-ink">
              Cómo <span className="text-terracotta italic">empezó</span> esto
            </h2>
          </Reveal>
          <Reveal
            delay={80}
            className={`text-base leading-[1.7] text-ink ${retreat.historia.pendiente ? "italic" : ""}`}
          >
            {retreat.historia.parrafos.map((p, i) => (
              <p key={i} className="mb-4 whitespace-pre-line last:mb-0">
                {p}
              </p>
            ))}
          </Reveal>
        </div>

        <Reveal delay={120} className="relative h-[280px] w-full flex-1 overflow-hidden rounded-tl-[180px] rounded-tr-[20px] rounded-br-[180px] rounded-bl-[20px] sm:h-[380px]">
          <Image src={retreat.historia.imagenUrl} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </Reveal>
      </div>
    </section>
  );
}
