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

interface ResultadoLogin {
  ok: boolean;
  /** Mensaje puntual (ej. de bloqueo) — si no viene, el caller usa su propio mensaje genérico de "clave incorrecta". */
  error?: string;
}

const TREINTA_DIAS = 60 * 60 * 24 * 30;

/**
 * No hay ningún binding de almacenamiento (KV/D1) configurado en este
 * proyecto, así que este límite vive en una cookie — protege contra
 * intentos repetidos desde el mismo navegador (o un script simple que
 * conserve cookies), pero no contra un atacante que descarte la cookie en
 * cada request. Para eso, lo que realmente frena a un atacante así es una
 * regla de Rate Limiting a nivel de Cloudflare (WAF, por IP), que no se
 * puede configurar desde acá — ver la nota en 01-hosting-y-despliegue.md.
 */
const MAX_INTENTOS = 5;
const VENTANA_BLOQUEO_SEGUNDOS = 15 * 60;

interface EstadoIntentos {
  n: number;
  /** epoch ms hasta el que queda bloqueado; ausente si todavía no se alcanzó el máximo. */
  bloqueadoHasta?: number;
}

async function hash(texto: string): Promise<string> {
  const datos = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function crearSesionPorClave({ cookieName, leerClave, duracionSegundos = TREINTA_DIAS }: OpcionesSesion) {
  const cookieIntentos = `${cookieName}_intentos`;

  async function haySesionValida(): Promise<boolean> {
    const clave = await leerClave();
    if (!clave) return false;

    const jar = await cookies();
    const cookie = jar.get(cookieName)?.value;
    if (!cookie) return false;

    return cookie === (await hash(clave));
  }

  async function iniciarSesion(claveIngresada: string): Promise<ResultadoLogin> {
    const jar = await cookies();

    let estado: EstadoIntentos = { n: 0 };
    const crudo = jar.get(cookieIntentos)?.value;
    if (crudo) {
      try {
        estado = JSON.parse(crudo);
      } catch {
        estado = { n: 0 };
      }
    }

    const ahora = Date.now();
    if (estado.bloqueadoHasta && estado.bloqueadoHasta > ahora) {
      const minutos = Math.ceil((estado.bloqueadoHasta - ahora) / 60_000);
      return { ok: false, error: `Demasiados intentos fallidos. Esperá ${minutos} minuto${minutos === 1 ? "" : "s"} e intentá de nuevo.` };
    }

    const clave = await leerClave();
    if (!clave || claveIngresada !== clave) {
      const n = (estado.bloqueadoHasta ? 0 : estado.n) + 1;
      const nuevoEstado: EstadoIntentos =
        n >= MAX_INTENTOS ? { n: 0, bloqueadoHasta: ahora + VENTANA_BLOQUEO_SEGUNDOS * 1000 } : { n };
      jar.set(cookieIntentos, JSON.stringify(nuevoEstado), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: VENTANA_BLOQUEO_SEGUNDOS,
      });
      return { ok: false };
    }

    jar.delete(cookieIntentos);
    jar.set(cookieName, await hash(clave), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: duracionSegundos,
    });
    return { ok: true };
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
