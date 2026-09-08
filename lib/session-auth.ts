import { cookies } from "next/headers";

/**
 * Sesión por clave compartida: una cookie HttpOnly guarda el hash SHA-256 de
 * la clave vigente. En Cloudflare Workers los secrets llegan por
 * `getCloudflareContext()`, no por `process.env` — con fallback a
 * `process.env` para `next dev` y el paso de build. Fábrica reusada por
 * `/guias` (guías y monitores) y `/admin` (edición de contenido), cada una
 * con su propia cookie y su propia clave.
 */

interface OpcionesSesion {
  cookieName: string;
  leerClave: () => Promise<string | undefined>;
  duracionSegundos?: number;
}

const TREINTA_DIAS = 60 * 60 * 24 * 30;

async function hash(texto: string): Promise<string> {
  const datos = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function crearSesionPorClave({ cookieName, leerClave, duracionSegundos = TREINTA_DIAS }: OpcionesSesion) {
  async function haySesionValida(): Promise<boolean> {
    const clave = await leerClave();
    if (!clave) return false;

    const jar = await cookies();
    const cookie = jar.get(cookieName)?.value;
    if (!cookie) return false;

    return cookie === (await hash(clave));
  }

  async function iniciarSesion(claveIngresada: string): Promise<boolean> {
    const clave = await leerClave();
    if (!clave || claveIngresada !== clave) return false;

    const jar = await cookies();
    jar.set(cookieName, await hash(clave), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: duracionSegundos,
    });
    return true;
  }

  async function cerrarSesion(): Promise<void> {
    const jar = await cookies();
    jar.set(cookieName, "", { path: "/", maxAge: 0 });
  }

  return { haySesionValida, iniciarSesion, cerrarSesion };
}

/** Igual que en lib/supabase.ts: fallback de `getCloudflareContext()` a `process.env`. */
export async function leerVariableDeEntorno(nombre: string): Promise<string | undefined> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const valor = (env as Record<string, string | undefined>)[nombre];
    if (valor) return valor;
  } catch {
    // Sin contexto de Cloudflare disponible (ej. build estático) — se sigue abajo.
  }
  return process.env[nombre];
}
