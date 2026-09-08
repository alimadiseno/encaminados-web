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
  return (
    <div
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
  );
}
