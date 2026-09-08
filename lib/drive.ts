/**
 * Convierte el link que Google Drive entrega al compartir una carpeta
 * ("Cualquiera con el enlace") en la URL de su vista incrustable
 * (`embeddedfolderview`, la que se usa en un <iframe>).
 *
 * Acepta las formas más comunes en que Drive entrega el link:
 *   https://drive.google.com/drive/folders/<ID>?usp=sharing
 *   https://drive.google.com/drive/u/0/folders/<ID>
 *   https://drive.google.com/open?id=<ID>
 * y también el ID de la carpeta solo, por si alguien lo pega directo.
 */
function extraerIdCarpeta(urlOId: string): string | null {
  const texto = urlOId.trim();
  if (!texto) return null;

  const porFolders = texto.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (porFolders) return porFolders[1];

  const porQueryId = texto.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (porQueryId) return porQueryId[1];

  // Un ID de Drive típico: solo letras/números/guiones, sin "/" ni espacios.
  if (/^[a-zA-Z0-9_-]{10,}$/.test(texto)) return texto;

  return null;
}

export function urlEmbedCarpetaDrive(urlOId: string | undefined): string | null {
  if (!urlOId) return null;
  const id = extraerIdCarpeta(urlOId);
  return id ? `https://drive.google.com/embeddedfolderview?id=${id}#list` : null;
}
