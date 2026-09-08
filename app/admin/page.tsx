import type { Metadata } from "next";
import { haySesionValida } from "@/lib/admin-auth";
import { getRetreatBySlug, RETIRO_DESTACADO } from "@/data/retreats";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import RetreatEditor from "@/components/admin/RetreatEditor";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Panel de administración · Encaminados",
    robots: { index: false, follow: false },
  };
}

export default async function AdminPage() {
  const autenticado = await haySesionValida();
  if (!autenticado) return <AdminLoginForm />;

  const retreat = await getRetreatBySlug(RETIRO_DESTACADO);
  if (!retreat) {
    return (
      <p style={{ padding: 40 }}>
        No se encontró el retiro &quot;{RETIRO_DESTACADO}&quot; en Supabase.
      </p>
    );
  }

  return <RetreatEditor retreat={retreat} />;
}
