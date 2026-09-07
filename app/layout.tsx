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

const siteUrl = "https://encaminados.cl";
const title = "Encaminados · Un fin de semana para volver a caminar juntos";
const description =
  "Encaminados es un fin de semana para matrimonios que quieren parar, mirarse y volver a caminar juntos. Dos fechas en 2026, en el Centro de Espiritualidad de Lo Vásquez.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Encaminados",
    locale: "es_CL",
    title,
    description:
      "Para matrimonios que quieren parar, mirarse y volver a caminar juntos. 2 al 4 de octubre o 6 al 8 de noviembre, en Lo Vásquez.",
    url: siteUrl,
    images: [{ url: "/og-encaminados.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description:
      "Para matrimonios que quieren parar, mirarse y volver a caminar juntos. 2 al 4 de octubre o 6 al 8 de noviembre, en Lo Vásquez.",
  },
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
