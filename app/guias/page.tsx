import type { Metadata } from "next";
import LoginForm from "@/components/guias/LoginForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Guías y monitores · Encaminados",
    robots: { index: false, follow: false },
  };
}

export default async function GuiasPage() {
  // [diag] cookies()/haySesionValida() deshabilitado a propósito para
  // aislar si el problema está ahí o en <LoginForm/> (Server Action
  // importada dentro de un Client Component).
  return <LoginForm />;
}
