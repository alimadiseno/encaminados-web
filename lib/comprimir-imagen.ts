/**
 * Redimensiona y recomprime una foto en el navegador antes de subirla —
 * las fotos de celular suelen pesar varios MB y `next.config.ts` sirve las
 * imágenes de Storage tal cual (`images.unoptimized: true`, porque
 * Cloudflare Images tiene costo por transformación), así que lo que se sube
 * acá es exactamente lo que descarga cada visita al sitio.
 *
 * Corre solo en el navegador (canvas + createImageBitmap), no en el
 * Server Action — ahí ya no hay forma de aligerarla.
 */
export async function comprimirImagen(archivo: File, ladoMaximo = 1920, calidad = 0.82): Promise<File> {
  if (!archivo.type.startsWith("image/") || archivo.type === "image/svg+xml") return archivo;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(archivo);
  } catch {
    return archivo; // formato no soportado por el navegador (ej. HEIC) — se sube tal cual
  }

  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return archivo;
  }
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", calidad));
  if (!blob || blob.size >= archivo.size) return archivo; // si no achica nada, se deja el original

  const nombre = archivo.name.replace(/\.[^./\\]+$/, "") + ".webp";
  return new File([blob], nombre, { type: "image/webp" });
}
