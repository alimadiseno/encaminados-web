import { cookies } from "next/headers";

const COOKIE_NAME = "guias_sesion";
const DURACION_SEGUNDOS = 60 * 60 * 24 * 30; // 30 días

/**
 * Igual que en lib/supabase.ts: en Cloudflare Workers los secrets llegan
 * por `getCloudflareContext()`, no por `process.env` — con fallback a
 * `process.env` para `next dev` y el paso de build.
 */
async function leerPassword(): Promise<string | undefined> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const password = (env as Record<string, string | undefined>).GUIAS_PASSWORD;
    if (password) return password;
  } catch {
    // Sin contexto de Cloudflare (ej. build estático) — se sigue abajo.
  }
  return process.env.GUIAS_PASSWORD;
}

async function hash(texto: string): Promise<string> {
  const datos = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** true si la cookie de sesión coincide con el hash de la clave vigente. */
export async function haySesionValida(): Promise<boolean> {
  const password = await leerPassword();
  if (!password) return false;

  const jar = await cookies();
  const cookie = jar.get(COOKIE_NAME)?.value;
  if (!cookie) return false;

  return cookie === (await hash(password));
}

/** Compara la clave ingresada y, si es correcta, deja la sesión guardada. */
export async function iniciarSesion(passwordIngresada: string): Promise<boolean> {
  const password = await leerPassword();
  if (!password || passwordIngresada !== password) return false;

  const jar = await cookies();
  jar.set(COOKIE_NAME, await hash(password), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SEGUNDOS,
  });
  return true;
}

export async function cerrarSesion(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}
