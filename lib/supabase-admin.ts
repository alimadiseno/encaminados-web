import { createClient } from "@supabase/supabase-js";
import { leerVariableDeEntorno } from "@/lib/session-auth";

/**
 * Cliente con la service_role key — ignora RLS por completo. Solo se usa
 * dentro de Server Actions del panel de administración (app/admin/actions.ts),
 * nunca debe llegar al navegador. Para lectura pública del sitio, usar
 * `getSupabaseClient()` en lib/supabase.ts (llave anon, respeta RLS).
 */
export async function getSupabaseAdminClient() {
  const url = await leerVariableDeEntorno("SUPABASE_URL");
  const key = await leerVariableDeEntorno("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    throw new Error(
      "Faltan las variables de entorno SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY " +
        "(.env.local en local, wrangler secret put en Cloudflare).",
    );
  }

  return createClient(url, key);
}
