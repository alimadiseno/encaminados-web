import Link from "next/link";
import { logoutGuias } from "@/app/guias/actions";
import Logo from "@/components/Logo";
import { urlEmbedCarpetaDrive } from "@/lib/drive";

export default function DocumentosList({ driveUrl }: { driveUrl?: string }) {
  const embedUrl = urlEmbedCarpetaDrive(driveUrl);

  return (
    <section className="min-h-[100svh] bg-cream px-6 py-16 sm:px-10 lg:px-24">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-12">
        <div className="flex items-start justify-between gap-6">
          <Logo className="h-[39px] w-auto text-terracotta" />
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-ink underline underline-offset-2">
              ← Volver a la página de Encaminados
            </Link>
            <form action={logoutGuias}>
              <button type="submit" className="text-sm text-ink underline underline-offset-2">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="h1-section text-ink">
            Documentos para <span className="text-terracotta italic">guías</span>
          </h1>
          <p className="max-w-[34rem] text-base leading-[1.6] text-ink">
            Todo lo que necesitas para acompañar el retiro. Los documentos se actualizan directo desde la carpeta de
            Drive del equipo.
          </p>
        </div>

        {embedUrl ? (
          <div className="overflow-hidden rounded-2xl border-2 border-terracotta bg-cream">
            <iframe src={embedUrl} title="Documentos del retiro" className="h-[70vh] min-h-[420px] w-full border-0" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-12 text-center">
            <p className="h3-section text-ink">Todavía no hay documentos disponibles</p>
            <p className="max-w-[28rem] text-sm leading-[1.5] text-ink">
              Vuelve a revisar más adelante — en cuanto se suban los documentos del retiro, van a aparecer acá.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
