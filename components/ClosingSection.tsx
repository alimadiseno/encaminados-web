"use client";

import { useEffect, useRef, useState } from "react";
import type { RetreatEvent } from "@/types/retreat";
import Reveal from "./Reveal";

export default function ClosingSection({ retreat }: { retreat: RetreatEvent }) {
  const seccionRef = useRef<HTMLElement>(null);
  const [cargarVideo, setCargarVideo] = useState(false);

  // El video (4,5MB) es la sección final de la página — sin esto, el navegador
  // lo descarga completo apenas carga cualquier visita, aunque nadie llegue a
  // hacer scroll hasta acá (confirmado con PageSpeed Insights, 2026-09-16).
  // Se retrasa hasta que la sección esté por entrar en pantalla, no recién al
  // entrar, para que ya esté buffereado y no se note un "salto" al llegar.
  useEffect(() => {
    const el = seccionRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setCargarVideo(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCargarVideo(true);
            observer.unobserve(el);
          }
        });
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={seccionRef}
      id="inscripcion"
      className="relative flex min-h-[600px] items-center overflow-hidden pt-[clamp(4rem,9vw,6rem)] pb-[clamp(4rem,9vw,6rem)]"
    >
      {cargarVideo && (
        <video
          src="/videos/nos-vemos-alla.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-ink" />
      <div className="absolute inset-0 bg-ink/40" />

      <div className="relative z-10 mx-auto flex max-w-[720px] flex-col items-center gap-10 px-6 text-center sm:px-8">
        <div className="flex flex-col items-center gap-4">
          <Reveal>
            <h2 className="h1-section text-cream">Nos vemos allá</h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="h3-section text-peach italic">
              Un fin de semana para los dos. El resto puede esperar.
            </p>
          </Reveal>
        </div>

        <Reveal delay={160}>
          <a
            href={retreat.inscripcionUrl}
            target="_blank"
            rel="noopener"
            className="btn-primary min-h-[52px] py-[18px] no-underline"
          >
            Inscribirme ahora
          </a>
        </Reveal>
      </div>

      <img src="/icons/closing-wave.svg" alt="" className="absolute inset-x-0 bottom-0 z-10 h-[70px] w-full" />
    </section>
  );
}
