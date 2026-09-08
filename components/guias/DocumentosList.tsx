import Link from "next/link";
import { logoutGuias } from "@/app/guias/actions";

interface Documento {
  id: string;
  titulo: string;
  descripcion: string;
  archivoUrl: string;
}

// Placeholder mientras el cliente entrega los documentos reales. Cuando
// existan, esto se reemplaza por una consulta a la tabla `documentos_guias`
// en Supabase (mismo patrón que el resto del contenido del sitio), con los
// archivos servidos desde un bucket privado de Supabase Storage.
const DOCUMENTOS_EJEMPLO: Documento[] = [
  {
    id: "1",
    titulo: "Manual del Sacerdote Acompañante",
    descripcion: "Guía de charlas y momentos espirituales del fin de semana.",
    archivoUrl: "#",
  },
  {
    id: "2",
    titulo: "Guía del Matrimonio Guía",
    descripcion: "Rol, dinámicas y testimonio a compartir durante el retiro.",
    archivoUrl: "#",
  },
  {
    id: "3",
    titulo: "Cronograma del fin de semana",
    descripcion: "Horarios de viernes a domingo, con responsables por bloque.",
    archivoUrl: "#",
  },
];

function IconoDocumento() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 flex-none text-terracotta" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export default function DocumentosList() {
  return (
    <section className="min-h-[100svh] bg-cream px-6 py-16 sm:px-10 lg:px-24">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-12">
        <div className="flex items-start justify-between gap-6">
          <p className="font-brand text-[22px] leading-[1.05] font-medium text-terracotta">
            <span className="block">EN CAMINA</span>
            <span className="block">DOS</span>
          </p>
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
            Todo lo que necesitas para acompañar el retiro. Descarga los archivos antes del fin de
            semana.
          </p>
        </div>

        <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {DOCUMENTOS_EJEMPLO.map((doc) => (
            <li key={doc.id} className="flex flex-col gap-4 rounded-2xl bg-card p-6">
              <IconoDocumento />
              <div className="flex flex-1 flex-col gap-1.5">
                <h3 className="h3-section text-ink">{doc.titulo}</h3>
                <p className="text-sm leading-[1.5] text-ink">{doc.descripcion}</p>
              </div>
              <a
                href={doc.archivoUrl}
                className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-full border-2 border-terracotta px-6 text-sm font-bold tracking-[0.1em] text-terracotta uppercase no-underline transition-colors hover:bg-terracotta hover:text-peach"
              >
                Descargar
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
