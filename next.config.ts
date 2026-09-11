import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sin binding de Cloudflare Images (tiene costo por transformación) — las
  // imágenes ya se sirven pre-optimizadas en WebP desde /public.
  images: {
    unoptimized: true,
  },
  // El formulario del admin guarda todas las secciones juntas en una sola Server
  // Action, así que puede incluir varias fotos recién elegidas a la vez (hero,
  // guías, franja de fotos, fotos por párrafo de "Nuestra historia", etc.) — el
  // límite por defecto de 1MB se supera con facilidad con fotos de celular, y
  // 25mb también se quedó corto apenas se sumaron varias fotos de una vez.
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
