import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sin binding de Cloudflare Images (tiene costo por transformación) — las
  // imágenes ya se sirven pre-optimizadas en WebP desde /public.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
