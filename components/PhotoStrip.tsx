import Image from "next/image";
import type { RetreatEvent } from "@/types/retreat";
import Reveal from "./Reveal";

// Anchos variados puramente decorativos — se reparten en orden sobre las
// fotos que vengan en `retreat.fotosDecorativas`, sin importar cuántas sean.
const ANCHOS = [
  "min-w-[220px] sm:flex-[420]",
  "min-w-[160px] sm:flex-[260]",
  "min-w-[200px] sm:flex-[340]",
  "min-w-[140px] sm:flex-[220]",
  "min-w-[180px] sm:flex-[300]",
];

/** Franja decorativa de fotos entre "guías" e "historia" — puramente visual, sin copy. */
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
        <Reveal
          key={src}
          delay={i * 90}
          className={`relative h-full flex-none overflow-hidden rounded-3xl ${ANCHOS[i % ANCHOS.length]}`}
        >
          <Image src={src} alt="" fill sizes="420px" className="object-cover" />
        </Reveal>
      ))}
    </div>
  );
}
