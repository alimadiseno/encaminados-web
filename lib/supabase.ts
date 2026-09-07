import { createClient } from "@supabase/supabase-js";

/**
 * En Cloudflare Workers, las variables agregadas desde el dashboard llegan
 * por el "binding" `env` (vía `getCloudflareContext()`), no por
 * `process.env` — a diferencia de Node.js / `next dev` / el paso de build,
 * donde sí vienen de `.env.local` a través de `process.env`. Se intenta
 * primero el contexto de Cloudflare y se cae a `process.env` si no
 * corresponde (build estático, tests, etc.).
 */
async function leerVariables(): Promise<{ url?: string; key?: string }> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const cfEnv = env as Record<string, string | undefined>;
    if (cfEnv.SUPABASE_URL && cfEnv.SUPABASE_ANON_KEY) {
      return { url: cfEnv.SUPABASE_URL, key: cfEnv.SUPABASE_ANON_KEY };
    }
  } catch {
    // No hay contexto de Cloudflare disponible (ej. durante `next build`) — se sigue abajo.
  }
  return { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_ANON_KEY };
}

/**
 * Cliente de solo lectura para Server Components. Usa la llave pública
 * (publishable/anon) — puede leer solo lo que las policies de RLS permiten
 * (el contenido del sitio), nunca `inscritos`. Para escribir desde el panel
 * de administración se usará un cliente aparte con la service_role key.
 */
export async function getSupabaseClient() {
  const { url, key } = await leerVariables();

  if (!url || !key) {
    throw new Error(
      "Faltan las variables de entorno SUPABASE_URL / SUPABASE_ANON_KEY (.env.local en local, " +
        "Runtime variables and secrets en el Worker de Cloudflare).",
    );
  }

  return createClient(url, key);
}
