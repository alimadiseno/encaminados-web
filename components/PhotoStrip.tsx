"use client";

import { useEffect, useRef, useState } from "react";
import type { RetreatEvent } from "@/types/retreat";
import Reveal from "./Reveal";

/**
 * Franja decorativa de fotos entre "guías" e "historia" — puramente visual,
 * sin copy. Altura fija (h-[180px]/220px/280px según breakpoint, igual para
 * todas), ancho libre: cada foto conserva su proporción real (`h-full
 * w-auto`), así que una foto horizontal queda ancha y una vertical angosta,
 * sin recortar nada ni forzar un patrón de anchos.
 */
export default function PhotoStrip({ retreat }: { retreat: RetreatEvent }) {
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
  }, [retreat.fotosDecorativas]);

  function desplazar(direccion: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direccion * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="sin-scrollbar flex h-[180px] items-end gap-3 overflow-x-auto px-6 pb-0 sm:h-[220px] sm:px-10 lg:h-[280px] lg:px-24"
        style={{
          backgroundImage:
            "linear-gradient(180deg, var(--color-cream) 0%, var(--color-cream) 49.9%, var(--color-lavender) 50%, var(--color-lavender) 100%)",
        }}
      >
        {retreat.fotosDecorativas.map((src, i) => (
          <Reveal key={src} delay={i * 90} className="h-full flex-none overflow-hidden rounded-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element -- ancho intrínseco según la proporción real de cada foto; next/image con `fill` obliga a fijar el ancho de antemano. */}
            <img src={src} alt="" className="h-full w-auto" />
          </Reveal>
        ))}
      </div>

      {puedeIzquierda && (
        <button
          type="button"
          aria-label="Ver fotos anteriores"
          onClick={() => desplazar(-1)}
          className="absolute top-1/2 left-4 hidden -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 p-3 text-ink shadow-[0_2px_10px_rgba(0,0,0,.12)] transition-colors hover:bg-cream lg:flex"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      )}

      {puedeDerecha && (
        <button
          type="button"
          aria-label="Ver más fotos"
          onClick={() => desplazar(1)}
          className="absolute top-1/2 right-4 hidden -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 p-3 text-ink shadow-[0_2px_10px_rgba(0,0,0,.12)] transition-colors hover:bg-cream lg:flex"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
