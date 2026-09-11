"use client";

import { useEffect, useRef, useState } from "react";
import type { RetreatEvent, Testimonio } from "@/types/retreat";
import Reveal from "./Reveal";

function TestimonioCard({ testimonio }: { testimonio: Testimonio }) {
  return (
    <div className="flex h-full min-h-[280px] w-[420px] flex-none flex-col gap-5 rounded-3xl bg-card p-8 sm:w-[510px]">
      <span className="font-display text-6xl leading-none text-terracotta" aria-hidden="true">
        &ldquo;
      </span>
      <p className="flex-1 text-base leading-[1.6] text-ink">{testimonio.cita}</p>
      <div className="flex flex-col gap-1 border-t border-ink/10 pt-4">
        <p className="text-base font-semibold text-ink">{testimonio.nombre}</p>
        {testimonio.bajada && <p className="text-sm text-ink/60">{testimonio.bajada}</p>}
      </div>
    </div>
  );
}

export default function TestimonialsSection({ retreat }: { retreat: RetreatEvent }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [puedeIzquierda, setPuedeIzquierda] = useState(false);
  const [puedeDerecha, setPuedeDerecha] = useState(false);

  function actualizarFlechas() {
    const el = scrollRef.current;
    if (!el) return;
    setPuedeIzquierda(el.scrollLeft > 4);
    setPuedeDerecha(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    actualizarFlechas();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", actualizarFlechas, { passive: true });
    window.addEventListener("resize", actualizarFlechas);
    return () => {
      el.removeEventListener("scroll", actualizarFlechas);
      window.removeEventListener("resize", actualizarFlechas);
    };
  }, [retreat.testimonios]);

  function desplazar(direccion: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direccion * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section id="testimonios" className="flex flex-col items-center gap-12 bg-sage py-[clamp(4rem,9vw,6rem)]">
      <Reveal className="px-6 sm:px-10">
        <h2 className="h1-section max-w-2xl text-center text-ink">
          Voces de quienes <span className="text-terracotta italic">caminaron</span>
        </h2>
      </Reveal>

      {/* Contenedor a todo el ancho de la pantalla (no del max-w del resto del
          sitio) — así las tarjetas se cortan en el borde real de la ventana
          al hacer scroll, no en un margen interno. */}
      <div className="relative w-full">
        <div
          ref={scrollRef}
          className="sin-scrollbar flex w-full gap-6 overflow-x-auto px-6 pb-2 sm:px-10 lg:px-24"
        >
          {retreat.testimonios.map((testimonio, i) => (
            <Reveal key={testimonio.id} delay={i * 80} className="flex-none">
              <TestimonioCard testimonio={testimonio} />
            </Reveal>
          ))}
        </div>

        {puedeIzquierda && (
          <button
            type="button"
            aria-label="Ver testimonios anteriores"
            onClick={() => desplazar(-1)}
            className="carousel-nav absolute top-1/2 left-4 hidden -translate-y-1/2 items-center justify-center bg-cream/90 hover:bg-cream lg:flex"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        )}

        {puedeDerecha && (
          <button
            type="button"
            aria-label="Ver más testimonios"
            onClick={() => desplazar(1)}
            className="carousel-nav absolute top-1/2 right-4 hidden -translate-y-1/2 items-center justify-center bg-cream/90 hover:bg-cream lg:flex"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </div>

      <Reveal>
        <a
          href={retreat.inscripcionUrl}
          target="_blank"
          rel="noopener"
          className="btn-primary min-h-[48px] py-[18px] no-underline"
        >
          Inscribirme ahora
        </a>
      </Reveal>
    </section>
  );
}
