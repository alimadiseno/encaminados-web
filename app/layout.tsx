import type { Metadata, Viewport } from "next";
import { Alegreya, Geist, Karla } from "next/font/google";
import "./globals.css";

const alegreya = Alegreya({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geist = Geist({
  variable: "--font-body",
  subsets: ["latin"],
});

const karla = Karla({
  variable: "--font-brand",
  subsets: ["latin"],
});

// El título/descripción/OG reales se arman por página en generateMetadata()
// (ver app/page.tsx), a partir del contenido en Supabase — así el campo de
// SEO del panel de administración efectivamente cambia lo que se comparte.
// Acá solo queda lo que aplica a todo el sitio.
export const metadata: Metadata = {
  metadataBase: new URL("https://encaminados.cl"),
};

export const viewport: Viewport = {
  themeColor: "#CD5F37",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-CL"
      className={`${alegreya.variable} ${geist.variable} ${karla.variable}`}
    >
      <body className="bg-cream text-ink font-body antialiased">{children}</body>
    </html>
  );
}
