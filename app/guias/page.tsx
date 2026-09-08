import type { Metadata } from "next";
import { haySesionValida } from "@/lib/guias-auth";
import { getFeaturedRetreat } from "@/data/retreats";
import LoginForm from "@/components/guias/LoginForm";
import DocumentosList from "@/components/guias/DocumentosList";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Guías y monitores · Encaminados",
    robots: { index: false, follow: false },
  };
}

export default async function GuiasPage() {
  const autenticado = await haySesionValida();
  if (!autenticado) return <LoginForm />;

  const retreat = await getFeaturedRetreat();
  return <DocumentosList driveUrl={retreat.documentosDriveUrl} />;
}
