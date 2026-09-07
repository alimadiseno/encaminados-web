import Image from "next/image";
import Reveal from "./Reveal";

const PHOTOS = [
  { src: "/images/photo-strip-1.png", w: "min-w-[220px] sm:flex-[420]" },
  { src: "/images/photo-strip-2.png", w: "min-w-[160px] sm:flex-[260]" },
  { src: "/images/photo-strip-3.png", w: "min-w-[200px] sm:flex-[340]" },
  { src: "/images/photo-strip-4.png", w: "min-w-[140px] sm:flex-[220]" },
  { src: "/images/photo-strip-5.png", w: "min-w-[180px] sm:flex-[300]" },
];

/** Franja decorativa de fotos entre "guías" e "historia" — puramente visual, sin copy. */
export default function PhotoStrip() {
  return (
    <div
      className="sin-scrollbar flex h-[180px] items-end gap-3 overflow-x-auto px-6 pb-0 sm:h-[220px] sm:px-10 lg:h-[280px] lg:px-24"
      style={{
        backgroundImage:
          "linear-gradient(180deg, var(--color-cream) 0%, var(--color-cream) 49.9%, var(--color-lavender) 50%, var(--color-lavender) 100%)",
      }}
    >
      {PHOTOS.map((p, i) => (
        <Reveal
          key={p.src}
          delay={i * 90}
          className={`relative h-full flex-none overflow-hidden rounded-3xl ${p.w}`}
        >
          <Image src={p.src} alt="" fill sizes="420px" className="object-cover" />
        </Reveal>
      ))}
    </div>
  );
}
