import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/guias"],
    },
    sitemap: "https://encaminados.cl/sitemap.xml",
  };
}
