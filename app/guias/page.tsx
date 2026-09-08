import type { Metadata } from "next";
import { haySesionValida } from "@/lib/guias-auth";

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
  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      [diag] cookies+password check ran fine. autenticado = {String(autenticado)}
    </div>
  );
}
