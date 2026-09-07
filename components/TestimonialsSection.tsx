"use client";

import { useState } from "react";
import type { RetreatEvent, VideoTestimonio } from "@/types/retreat";
import Reveal from "./Reveal";

function VideoCard({ video }: { video: VideoTestimonio }) {
  const [playing, setPlaying] = useState(false);
  const tieneVideo = Boolean(video.youtubeId);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-card">
      <div className="relative flex h-[220px] w-full items-center justify-center bg-ink">
        {tieneVideo && playing ? (
          <iframe
            className="absolute inset-0 h-full w-full border-0"
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.nombre}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : tieneVideo ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Reproducir el testimonio de ${video.nombre}`}
            className="absolute inset-0 flex h-full w-full items-center justify-center"
            style={{
              backgroundImage: `url(https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span className="flex size-14 items-center justify-center rounded-[28px] bg-icon-bg">
              <img src="/icons/play.svg" alt="" className="size-5" />
            </span>
          </button>
        ) : (
          <span className="flex size-14 items-center justify-center rounded-[28px] bg-icon-bg" aria-hidden="true">
            <img src="/icons/play.svg" alt="" className="size-5" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="h3-section text-ink">{video.nombre}</h3>
        <p className="text-sm leading-[1.5] text-ink">&ldquo;{video.cita}&rdquo;</p>
      </div>
    </div>
  );
}

export default function TestimonialsSection({ retreat }: { retreat: RetreatEvent }) {
  return (
    <section id="testimonios" className="bg-sage py-[clamp(4rem,9vw,6rem)]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6 sm:px-10 lg:px-24">
        <Reveal>
          <h2 className="h1-section max-w-2xl text-center text-ink">
            Voces de quienes <span className="text-terracotta italic">caminaron</span>
          </h2>
        </Reveal>

        <ul className="grid w-full list-none gap-6 p-0 sm:grid-cols-3">
          {retreat.videos.map((video, i) => (
            <li key={video.id}>
              <Reveal delay={i * 80} className="h-full">
                <VideoCard video={video} />
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal>
          <a
            href={retreat.inscripcionUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-terracotta px-8 py-[18px] text-sm font-bold tracking-[0.14em] text-peach uppercase no-underline transition-opacity hover:opacity-90"
          >
            Inscribirme ahora
          </a>
        </Reveal>
      </div>
    </section>
  );
}
