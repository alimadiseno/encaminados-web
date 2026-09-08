import type { Metadata } from "next";
import { haySesionValida } from "@/lib/guias-auth";
import LoginForm from "@/components/guias/LoginForm";
import DocumentosList from "@/components/guias/DocumentosList";

export const metadata: Metadata = {
  title: "Guías y monitores · Encaminados",
  robots: { index: false, follow: false },
};

export default async function GuiasPage() {
  let autenticado = false;
  try {
    autenticado = await haySesionValida();
  } catch (e) {
    console.log("[diag guias] haySesionValida threw:", e instanceof Error ? e.stack ?? e.message : e);
  }
  return autenticado ? <DocumentosList /> : <LoginForm />;
}
