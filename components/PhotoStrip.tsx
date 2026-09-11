"use client";

import { useEffect, useRef } from "react";
import type { RetreatEvent } from "@/types/retreat";
import Reveal from "./Reveal";

/** Velocidad del avance automático, en píxeles por segundo. */
const VELOCIDAD_PX_POR_SEGUNDO = 32;
/** Cuánto tiempo queda pausado el avance automático tras una interacción manual. */
const PAUSA_TRAS_INTERACCION_MS = 1500;

/**
 * Franja decorativa de fotos entre "guías" e "historia" — puramente visual,
 * sin copy. Altura fija (h-[180px]/220px/280px según breakpoint, igual para
 * todas), ancho libre: cada foto conserva su proporción real (`h-full
 * w-auto`), así que una foto horizontal queda ancha y una vertical angosta,
 * sin recortar nada ni forzar un patrón de anchos.
 *
 * Avanza sola en loop infinito: el set de fotos se duplica una vez y el
 * scroll se desplaza continuamente, saltando sin corte al llegar a la mitad
 * (donde el segundo set es idéntico al primero). Se pausa mientras hay
 * interacción manual (hover, touch, flechas) y respeta prefers-reduced-motion.
 */
export default function PhotoStrip({ retreat }: { retreat: RetreatEvent }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausadoRef = useRef(false);
  const reanudarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fotos = retreat.fotosDecorativas;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || fotos.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let anchoSet = el.scrollWidth / 2;
    function medirAnchoSet() {
      anchoSet = el!.scrollWidth / 2;
    }
    window.addEventListener("resize", medirAnchoSet);

    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(el);

    let frameId: number;
    let ultimoTs: number | null = null;

    function tick(ts: number) {
      if (ultimoTs === null) ultimoTs = ts;
      const delta = ts - ultimoTs;
      ultimoTs = ts;

      if (!pausadoRef.current && visible && anchoSet > 0) {
        el!.scrollLeft += (VELOCIDAD_PX_POR_SEGUNDO * delta) / 1000;
        if (el!.scrollLeft >= anchoSet) {
          el!.scrollLeft -= anchoSet;
        }
      }
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);

    function pausar() {
      pausadoRef.current = true;
    }
    function reanudar() {
      pausadoRef.current = false;
    }

    el.addEventListener("pointerenter", pausar);
    el.addEventListener("pointerleave", reanudar);
    el.addEventListener("touchstart", pausar, { passive: true });
    el.addEventListener("touchend", reanudar);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize", medirAnchoSet);
      el.removeEventListener("pointerenter", pausar);
      el.removeEventListener("pointerleave", reanudar);
      el.removeEventListener("touchstart", pausar);
      el.removeEventListener("touchend", reanudar);
    };
  }, [fotos]);

  function desplazar(direccion: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    pausadoRef.current = true;
    el.scrollBy({ left: direccion * el.clientWidth * 0.8, behavior: "smooth" });
    if (reanudarTimeoutRef.current) clearTimeout(reanudarTimeoutRef.current);
    reanudarTimeoutRef.current = setTimeout(() => {
      pausadoRef.current = false;
    }, PAUSA_TRAS_INTERACCION_MS);
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="sin-scrollbar flex h-[180px] items-end gap-3 overflow-x-auto overflow-y-hidden px-6 pb-0 sm:h-[220px] sm:px-10 lg:h-[280px] lg:px-24"
        style={{
          backgroundImage:
            "linear-gradient(180deg, var(--color-cream) 0%, var(--color-cream) 49.9%, var(--color-lavender) 50%, var(--color-lavender) 100%)",
        }}
      >
        {[...fotos, ...fotos].map((src, i) => (
          <Reveal key={`${src}-${i}`} delay={(i % fotos.length) * 90} className="h-full flex-none overflow-hidden rounded-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element -- ancho intrínseco según la proporción real de cada foto; next/image con `fill` obliga a fijar el ancho de antemano. */}
            <img src={src} alt="" className="h-full w-auto" />
          </Reveal>
        ))}
      </div>

      {fotos.length > 0 && (
        <>
          <button
            type="button"
            aria-label="Ver fotos anteriores"
            onClick={() => desplazar(-1)}
            className="carousel-nav absolute top-1/2 left-4 hidden -translate-y-1/2 items-center justify-center bg-cream/90 hover:bg-cream lg:flex"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Ver más fotos"
            onClick={() => desplazar(1)}
            className="carousel-nav absolute top-1/2 right-4 hidden -translate-y-1/2 items-center justify-center bg-cream/90 hover:bg-cream lg:flex"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
