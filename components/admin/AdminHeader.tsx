import Link from "next/link";
import { logoutAdmin } from "@/app/admin/actions";
import Logo from "@/components/Logo";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 bg-cream/95 px-6 py-4 backdrop-blur-sm sm:px-10">
      <div className="flex items-center gap-3">
        <Logo className="h-7 w-auto text-terracotta" />
        <span className="font-body text-sm font-semibold text-ink">· Panel de administración</span>
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
