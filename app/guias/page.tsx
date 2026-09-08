import type { Metadata } from "next";
import { cookies } from "next/headers";
import LoginForm from "@/components/guias/LoginForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Guías y monitores · Encaminados",
    robots: { index: false, follow: false },
  };
}

export default async function GuiasPage() {
  // [diag] probando solo cookies(), sin getCloudflareContext ni crypto.
  const jar = await cookies();
  const valor = jar.get("guias_sesion")?.value ?? "(sin cookie)";
  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      [diag] cookies() funcionó. valor = {valor}
      <LoginForm />
    </div>
  );
}
