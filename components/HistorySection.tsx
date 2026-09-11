"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { RetreatEvent } from "@/types/retreat";
import Reveal from "./Reveal";

const ONDA_CENTRO = 20;
const ONDA_AMPLITUD = 8;
const ONDA_PERIODO = 320; // px por ciclo completo — constante, sin importar el alto real de la columna
const ONDA_ANCHO = 40; // viewBox y ancho en CSS del contenedor (misma unidad, escala 1:1 sin distorsión) — tiene que calzar con el "40px" de grid-cols-[...] más abajo, Tailwind no puede leer esta constante

/**
 * Genera una onda vertical muestreando un seno cada pocos píxeles (mismo
 * recurso que la curva de la cinta horizontal en WaveBanner/divider-brush.svg
 * — ahí también es una seguidilla de segmentos cortos, no un puñado de curvas
 * Bézier grandes). Con tan pocos puntos de control, las curvas anteriores no
 * se veían parejas; muestreando fino, la onda queda tan suave como la cinta.
 * El viewBox usa 1 unidad = 1 px real (ver más abajo), sin estirar con
 * preserveAspectRatio, así que tampoco se distorsiona según el alto real.
 */
function generarOndaVertical(alto: number, centro: number, amplitud: number, periodo: number): string {
  if (alto <= 0) return "";
  const paso = 6;
  let d = `M${centro},0`;
  let y = 0;
  while (y < alto) {
    y = Math.min(y + paso, alto);
    const x = centro + amplitud * Math.sin((2 * Math.PI * y) / periodo);
    d += ` L${x.toFixed(2)},${y.toFixed(2)}`;
  }
  return d;
}

/**
 * Antes era un bloque de texto largo (varios párrafos seguidos). Ahora los
 * párrafos "avanzan" con el scroll: cada uno ocupa su propio alto de lectura
 * (`lg:min-h-[55vh]`) para dar tiempo de scroll, y una barra ondulada al
 * costado se va llenando en proporción a cuánto se avanzó dentro de esa
 * franja — mismo patrón que el "Progress built year by year" de
 * evermind-template.webflow.io. En mobile solo cambia el layout (la barra
 * queda angosta junto al texto en vez de al lado del título, que pasa a ir
 * arriba de todo); el llenado de la barra y el resaltado del párrafo activo
 * se ven en cualquier tamaño de pantalla.
 */
export default function HistorySection({ retreat }: { retreat: RetreatEvent }) {
  const stackRef = useRef<HTMLDivElement>(null);
  const parrafoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [progreso, setProgreso] = useState(0);
  const [altoBarra, setAltoBarra] = useState(0);
  const [activo, setActivo] = useState(0);

  const parrafos = retreat.historia.parrafos;

  useEffect(() => {
    let raf = 0;

    function calcular() {
      const el = stackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setAltoBarra(rect.height);
      const rango = rect.height - window.innerHeight;
      const avance = rango > 0 ? -rect.top / rango : 0;
      setProgreso(Math.min(1, Math.max(0, avance)));

      // El párrafo activo es el que esté más cerca del centro vertical de la
      // pantalla — no una fracción del alto total (eso desincroniza el
      // resaltado del texto con dónde realmente está leyendo la persona en
      // cuanto los párrafos no miden exactamente lo mismo).
      const centroViewport = window.innerHeight / 2;
      let mejorIndice = 0;
      let mejorDistancia = Infinity;
      parrafoRefs.current.forEach((elParrafo, i) => {
        if (!elParrafo) return;
        const r = elParrafo.getBoundingClientRect();
        const distancia = Math.abs(r.top + r.height / 2 - centroViewport);
        if (distancia < mejorDistancia) {
          mejorDistancia = distancia;
          mejorIndice = i;
        }
      });
      setActivo(mejorIndice);
    }

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(calcular);
    }

    calcular();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const ondaD = generarOndaVertical(altoBarra, ONDA_CENTRO, ONDA_AMPLITUD, ONDA_PERIODO);
  const ondaRellenoD = generarOndaVertical(altoBarra * progreso, ONDA_CENTRO, ONDA_AMPLITUD, ONDA_PERIODO);

  // El marco (forma, recorte) queda fijo — solo la foto de adentro se cruza
  // con fundido según el párrafo activo. Sin fotos por párrafo cargadas en
  // el admin, cae a la foto única de siempre.
  const imagenes = retreat.historia.imagenes.length > 0 ? retreat.historia.imagenes : [retreat.historia.imagenUrl];
  const indiceImagen = Math.min(activo, imagenes.length - 1);

  return (
    <section id="historia" className="bg-lavender py-[clamp(4rem,9vw,6rem)]">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-24">
        {/* Mobile: 2 columnas (barra angosta + texto) con el título arriba
            ocupando ambas. Desktop: 3 columnas en una sola fila (título,
            barra, texto) — mismas celdas nombradas por posición explícita,
            no por orden en el DOM, para poder reordenar entre breakpoints. */}
        <div className="grid grid-cols-[40px_1fr] items-stretch gap-x-4 gap-y-8 lg:grid-cols-[minmax(0,1fr)_40px_minmax(0,1.3fr)] lg:gap-x-16 lg:gap-y-16">
          <div className="col-span-2 flex flex-col items-start gap-6 lg:col-span-1 lg:col-start-1 lg:row-start-1 lg:sticky lg:top-28 lg:h-fit lg:self-start">
            <Reveal>
              <h2 className="h1-section text-ink">
                Cómo <span className="text-terracotta italic">empezó</span> esto
              </h2>
            </Reveal>
            <Reveal
              delay={80}
              className="relative h-[280px] w-full overflow-hidden rounded-tl-[180px] rounded-tr-[20px] rounded-br-[180px] rounded-bl-[20px] sm:h-[380px]"
            >
              {imagenes.map((url, i) => (
                <Image
                  key={url || i}
                  src={url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className={`object-cover transition-opacity duration-500 ${i === indiceImagen ? "opacity-100" : "opacity-0"}`}
                />
              ))}
            </Reveal>
          </div>

          <div className="relative w-full lg:col-start-2 lg:row-start-1">
            {ondaD && (
              <svg className="absolute inset-0 h-full w-full text-ink/10" viewBox={`0 0 ${ONDA_ANCHO} ${altoBarra}`} fill="none">
                <path d={ondaD} stroke="currentColor" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {ondaRellenoD && (
              <svg className="absolute inset-0 h-full w-full text-terracotta" viewBox={`0 0 ${ONDA_ANCHO} ${altoBarra}`} fill="none">
                <path d={ondaRellenoD} stroke="currentColor" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          <div ref={stackRef} className="flex flex-col gap-4 lg:col-start-3 lg:row-start-1 lg:gap-0">
            {parrafos.map((p, i) => (
              <div
                key={i}
                ref={(el) => {
                  parrafoRefs.current[i] = el;
                }}
                className="lg:flex lg:min-h-[55vh] lg:items-center"
              >
                <p
                  className={`text-lg leading-[1.7] whitespace-pre-line transition-colors duration-500 ${
                    retreat.historia.pendiente ? "italic" : ""
                  } ${i === activo ? "text-ink" : "text-ink/30"}`}
                >
                  {p}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
