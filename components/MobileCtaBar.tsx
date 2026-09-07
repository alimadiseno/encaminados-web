"use client";

import { useEffect, useState } from "react";
import type { RetreatEvent } from "@/types/retreat";

export default function MobileCtaBar({ retreat }: { retreat: RetreatEvent }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const onScroll = () => {
      const threshold = hero ? hero.offsetHeight - 80 : 500;
      setVisible(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 bg-cream/95 px-4 py-3 shadow-[0_-1px_0_rgba(0,0,0,.08)] backdrop-blur-md transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-[110%]"
      }`}
      style={{ paddingBottom: "calc(0.7rem + env(safe-area-inset-bottom))" }}
    >
      <a
        href={retreat.inscripcionUrl}
        target="_blank"
        rel="noopener"
        className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-terracotta text-sm font-bold tracking-[0.14em] text-peach uppercase no-underline"
      >
        Inscribirme
      </a>
    </div>
  );
}
