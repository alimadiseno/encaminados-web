import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

/**
 * Endpoint liviano para mantener el proyecto de Supabase activo (el plan
 * gratuito pausa la base de datos tras 7 días sin actividad). Un workflow
 * de GitHub Actions (.github/workflows/keep-alive.yml) lo visita cada
 * pocos días; no necesita autenticación porque solo hace una lectura
 * trivial ya permitida por las policies de RLS del sitio público.
 */
export async function GET() {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("retreats").select("id").limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
