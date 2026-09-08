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

async function hash(texto: string): Promise<string> {
  const datos = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default async function GuiasPage() {
  // [diag] agregando el hash SHA-256 a la mezcla.
  let resultado: string;
  try {
    resultado = await hash("prueba");
  } catch (e) {
    resultado = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  const jar = await cookies();
  const valor = jar.get("guias_sesion")?.value ?? "(sin cookie)";

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      [diag] hash = {resultado}
      <br />
      cookie = {valor}
      <LoginForm />
    </div>
  );
}
