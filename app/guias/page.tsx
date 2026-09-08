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
  // [diag] cookies() + getCloudflareContext() juntos, sin crypto todavía.
  let cfKeys: string[] = [];
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    cfKeys = Object.keys(env as Record<string, unknown>);
  } catch (e) {
    cfKeys = [`ERROR: ${e instanceof Error ? e.message : String(e)}`];
  }

  const jar = await cookies();
  const valor = jar.get("guias_sesion")?.value ?? "(sin cookie)";

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      [diag] cookies() + getCloudflareContext() juntos funcionaron.
      <br />
      cookie = {valor}
      <br />
      cfKeys = {cfKeys.join(", ")}
      <LoginForm />
    </div>
  );
}
