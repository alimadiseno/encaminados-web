"use client";

import { useEffect, useState } from "react";
import type { RetreatEvent } from "@/types/retreat";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "#jornada", label: "Qué es" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#historia", label: "Nuestra Historia" },
  { href: "#logistica", label: "Información Clave" },
  { href: "#preguntas", label: "Preguntas Frecuentes" },
];

export default function Header({ retreat }: { retreat: RetreatEvent }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const textTone = scrolled ? "text-ink" : "text-cream";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur-md transition-colors duration-300 ${
        scrolled ? "bg-cream/90 shadow-[0_1px_0_rgba(0,0,0,.07)]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-6 py-5 sm:px-10 lg:px-24">
        <a href="#top" className="mr-auto text-terracotta no-underline">
          <Logo />
        </a>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold no-underline transition-colors hover:text-terracotta ${textTone}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href={retreat.inscripcionUrl}
          target="_blank"
          rel="noopener"
          className="btn-primary hidden py-3 no-underline lg:inline-flex"
        >
          Inscribirme
        </a>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen((v) => !v)}
          className={`inline-flex h-11 w-11 items-center justify-center lg:hidden ${textTone}`}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div id="menu-mobile" className="border-t border-ink/10 bg-cream shadow-lg lg:hidden">
          <ul className="mx-auto max-w-[1440px] list-none px-6 py-2 sm:px-10">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-ink/[.06]">
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3.5 text-ink no-underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-4 pb-2">
              <a
                href={retreat.inscripcionUrl}
                target="_blank"
                rel="noopener"
                className="btn-primary w-full py-3 no-underline"
              >
                Inscribirme
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
