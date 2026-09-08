import type { Metadata } from "next";
import { haySesionValida } from "@/lib/admin-auth";
import { getFeaturedRetreat } from "@/data/retreats";
import { getInscritos } from "@/lib/inscritos";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import InscritosView from "@/components/admin/InscritosView";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Inscritos · Panel de administración · Encaminados",
    robots: { index: false, follow: false },
  };
}

export default async function InscritosPage() {
  const autenticado = await haySesionValida();
  if (!autenticado) return <AdminLoginForm redirectTo="/admin/inscritos" />;

  const retreat = await getFeaturedRetreat();
  const inscritos = await getInscritos(retreat.id);

  return <InscritosView inscritos={inscritos} fechas={retreat.fechas.map((f) => f.label)} />;
}
