// Snapshot manual de todas las tablas de Supabase a JSON local, en /backups
// (gitignored — contiene datos reales de inscritos, nunca debe subirse a git).
//
// Uso: node scripts/backup-supabase.mjs
// Lee SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY desde .env.local — no las
// recibe como argumento ni las imprime, para no dejarlas en el historial
// de la terminal.

import { createClient } from "@supabase/supabase-js";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raizProyecto = join(__dirname, "..");

function leerEnvLocal() {
  const contenido = readFileSync(join(raizProyecto, ".env.local"), "utf-8");
  const variables = {};
  for (const linea of contenido.split("\n")) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith("#")) continue;
    const idx = limpia.indexOf("=");
    if (idx === -1) continue;
    variables[limpia.slice(0, idx).trim()] = limpia.slice(idx + 1).trim();
  }
  return variables;
}

const TABLAS = [
  "retreats",
  "retreat_fechas",
  "retreat_ideas",
  "retreat_videos",
  "retreat_guias",
  "retreat_faq",
  "retreat_photo_strip",
  "retreat_historia_fotos",
  "inscritos",
];

async function main() {
  const env = leerEnvLocal();
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  const carpetaSalida = join(raizProyecto, "backups", timestamp);
  mkdirSync(carpetaSalida, { recursive: true });

  console.log(`Guardando snapshot en backups/${timestamp}/\n`);

  let totalFilas = 0;
  for (const tabla of TABLAS) {
    const { data, error } = await supabase.from(tabla).select("*");
    if (error) {
      console.error(`  ✗ ${tabla}: ${error.message}`);
      continue;
    }
    writeFileSync(join(carpetaSalida, `${tabla}.json`), JSON.stringify(data, null, 2), "utf-8");
    console.log(`  ✓ ${tabla}: ${data.length} filas`);
    totalFilas += data.length;
  }

  console.log(`\nListo. ${totalFilas} filas en total.`);
}

main();
