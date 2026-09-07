import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de solo lectura para Server Components. Usa la llave pública
 * (publishable/anon) — puede leer solo lo que las policies de RLS permiten
 * (el contenido del sitio), nunca `inscritos`. Para escribir desde el panel
 * de administración se usará un cliente aparte con la service_role key.
 */
export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan las variables de entorno SUPABASE_URL / SUPABASE_ANON_KEY (ver .env.local).",
    );
  }

  return createClient(url, key);
}
