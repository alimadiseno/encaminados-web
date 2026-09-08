import type { Metadata } from "next";
import { haySesionValida } from "@/lib/guias-auth";
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
  return autenticado ? <DocumentosList /> : <LoginForm />;
}
