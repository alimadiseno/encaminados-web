import type { RetreatEvent } from "@/types/retreat";
import Reveal from "./Reveal";

export default function Footer({ retreat }: { retreat: RetreatEvent }) {
  return (
    <footer className="bg-sage px-6 py-12 sm:px-10 lg:px-24">
      <Reveal className="mx-auto flex max-w-[1440px] flex-col gap-8">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-3">
            <p className="font-brand text-[22px] leading-[1.05] font-medium text-terracotta">
              <span className="block">EN CAMINA</span>
              <span className="block">DOS</span>
            </p>
            <p className="text-sm leading-[1.6] text-ink">{retreat.bajada}</p>
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-24">
            <a
              href={`https://wa.me/${retreat.contacto.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 text-base font-semibold text-ink no-underline"
            >
              <img src="/icons/whatsapp.svg" alt="" className="size-[18px] flex-none" />
              {retreat.contacto.whatsapp}
            </a>
            <a href={`mailto:${retreat.contacto.email}`} className="flex items-center gap-2 text-base font-semibold text-ink no-underline">
              <img src="/icons/mail.svg" alt="" className="size-[18px] flex-none" />
              {retreat.contacto.email}
            </a>
          </div>
        </div>

        <p className="text-center text-sm text-ink">Una iniciativa de #familiaRC · Regnum Christi Chile</p>
      </Reveal>
    </footer>
  );
}
