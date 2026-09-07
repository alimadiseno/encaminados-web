import type { Metadata } from "next";
import Image from "next/image";
import { getFeaturedRetreat, fechasLabel } from "@/data/retreats";
import Reveal from "@/components/Reveal";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhatIsSection from "@/components/WhatIsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import GuidesSection from "@/components/GuidesSection";
import PhotoStrip from "@/components/PhotoStrip";
import HistorySection from "@/components/HistorySection";
import LogisticsSection from "@/components/LogisticsSection";
import FaqSection from "@/components/FaqSection";
import ClosingSection from "@/components/ClosingSection";
import Footer from "@/components/Footer";
import FloatingWhatsapp from "@/components/FloatingWhatsapp";
import MobileCtaBar from "@/components/MobileCtaBar";

// El sitio es una sola landing, así que se regenera con el resto del build
// (Cloudflare Workers también acepta este `revalidate`: sirve la versión
// cacheada y la refresca en segundo plano pasado este tiempo). Cuando exista
// el panel de administración, un guardado ahí puede llamar a una ruta de
// revalidación bajo demanda en vez de esperar este plazo.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const retreat = await getFeaturedRetreat();
  const title = retreat.seo.titulo || `${retreat.nombre} · ${retreat.bajada}`;
  const description =
    retreat.seo.descripcion ||
    `${retreat.bajada} ${fechasLabel(retreat)}, en ${retreat.lugar}.`;
  const ogImage = retreat.seo.imagenUrl || retreat.heroImagenUrl;

  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: retreat.nombre,
      locale: "es_CL",
      title,
      description,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Landing del retiro destacado. El día que existan varios retiros a la vez,
 * esta misma composición de secciones se muda a app/eventos/[slug]/page.tsx
 * (recibiendo el retiro por slug en vez de "el destacado"), y esta ruta
 * pasa a listar retreats.map() como cards hacia esas páginas de detalle.
 */
export default async function Home() {
  const retreat = await getFeaturedRetreat();

  return (
    <>
      <a
        href="#jornada"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-cream focus:px-4 focus:py-2 focus:text-ink"
      >
        Saltar al contenido
      </a>

      <Header retreat={retreat} />

      <main>
        <Hero retreat={retreat} />

        <div className="flex justify-center bg-cream pt-6">
          <Reveal>
            <Image
              src={retreat.sectionDividerImagenUrl}
              alt=""
              width={339}
              height={151}
              className="h-[151px] w-[339px] rounded-2xl object-cover"
            />
          </Reveal>
        </div>

        <WhatIsSection retreat={retreat} />
        <div className="overflow-hidden bg-cream pb-16 sm:pb-24">
          <Reveal>
            <img src="/icons/divider-brush.svg" alt="" className="h-auto w-[106%] max-w-none -ml-[3%]" />
          </Reveal>
        </div>
        <TestimonialsSection retreat={retreat} />
        <GuidesSection retreat={retreat} />
        <PhotoStrip retreat={retreat} />
        <HistorySection retreat={retreat} />
        <LogisticsSection retreat={retreat} />
        <FaqSection retreat={retreat} />
        <ClosingSection retreat={retreat} />
      </main>

      <Footer retreat={retreat} />
      <MobileCtaBar retreat={retreat} />
      <FloatingWhatsapp retreat={retreat} />
    </>
  );
}
