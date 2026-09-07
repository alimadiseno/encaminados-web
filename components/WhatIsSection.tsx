import type { RetreatEvent } from "@/types/retreat";
import Reveal from "./Reveal";

const ICONS = ["/icons/idea-1.svg", "/icons/idea-2.svg", "/icons/idea-3.svg"];

export default function WhatIsSection({ retreat }: { retreat: RetreatEvent }) {
  return (
    <section id="jornada" className="bg-cream pt-[clamp(1rem,3vw,1.5rem)] pb-[clamp(4rem,9vw,6rem)]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6 sm:px-10 lg:px-24">
        <Reveal className="flex max-w-[560px] flex-col items-center gap-6 text-center">
          <h2 className="h1-section text-ink">
            ¿Qué es <span className="text-terracotta italic">Encaminados</span>
            <span className="text-terracotta">?</span>
          </h2>
          <p className="text-base leading-[1.6] text-ink">
            Encaminados es un fin de semana para matrimonios que quieren parar, mirarse y volver a
            caminar juntos.
          </p>
        </Reveal>

        <ul className="grid w-full list-none justify-items-center gap-8 p-0 sm:grid-cols-3">
          {retreat.ideas.map((idea, i) => (
            <li key={idea.titulo} className="w-full max-w-[320px]">
              <Reveal
                delay={i * 90}
                className="flex min-h-[400px] w-full flex-col items-center justify-center gap-6 rounded-[9999px] bg-block px-8 py-12 text-center"
              >
                <img src={ICONS[i]} alt="" className="size-[60px]" />
                <div className="flex flex-col items-center gap-3">
                  <h3 className="h2-section text-ink">{idea.titulo}</h3>
                  <p className="text-base leading-[1.6] text-ink">{idea.descripcion}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
