import Link from "next/link";
import { logoutAdmin } from "@/app/admin/actions";

const claseLinkNav = (activo: boolean) =>
  `text-sm no-underline ${activo ? "font-semibold text-terracotta" : "text-ink underline underline-offset-2"}`;

export default function AdminHeader({ seccionActiva }: { seccionActiva: "contenido" | "inscritos" }) {
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 bg-cream/95 px-6 py-4 backdrop-blur-sm sm:px-10">
      <div className="flex flex-wrap items-center gap-6">
        <p className="font-brand text-lg leading-[1.05] font-medium text-terracotta">
          EN CAMINA DOS <span className="font-body text-sm font-semibold text-ink">· Panel de administración</span>
        </p>
        <nav className="flex items-center gap-4">
          <Link href="/admin" className={claseLinkNav(seccionActiva === "contenido")}>
            Contenido
          </Link>
          <Link href="/admin/inscritos" className={claseLinkNav(seccionActiva === "inscritos")}>
            Inscritos
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm text-ink underline underline-offset-2">
          Ver el sitio
        </Link>
        <form action={logoutAdmin}>
          <button type="submit" className="text-sm text-ink underline underline-offset-2">
            Cerrar sesión
          </button>
        </form>
      </div>
    </header>
  );
}
