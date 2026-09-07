import type { RetreatEvent } from "@/types/retreat";
import Reveal from "./Reveal";

export default function FaqSection({ retreat }: { retreat: RetreatEvent }) {
  return (
    <section id="preguntas" className="bg-peach py-[clamp(4rem,9vw,6rem)]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6 sm:px-10 lg:px-24">
        <Reveal>
          <h2 className="h1-section text-center text-ink">
            Preguntas frecuentes
          </h2>
        </Reveal>

        <div className="flex w-full max-w-[800px] flex-col gap-4">
          {retreat.faq.map((item, i) => (
            <Reveal key={item.pregunta} delay={Math.min(i * 50, 400)}>
              <details className="group rounded-2xl bg-card p-5">
                <summary className="h3-section flex cursor-pointer list-none items-center justify-between gap-4 text-ink marker:content-none">
                  {item.pregunta}
                  <img
                    src="/icons/plus.svg"
                    alt=""
                    className="size-4 flex-none transition-transform duration-200 group-open:rotate-45"
                  />
                </summary>
                <p className="mt-3 text-base leading-relaxed text-ink">
                  {item.respuesta}
                  {item.enlace && (
                    <>
                      {" "}
                      <a
                        href={item.enlace.href}
                        target="_blank"
                        rel="noopener"
                        className="font-semibold text-terracotta underline underline-offset-2"
                      >
                        {item.enlace.texto}
                      </a>
                    </>
                  )}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
