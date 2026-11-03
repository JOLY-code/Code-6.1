/**
 * Résout un chemin d'asset public (/Logo/..., /Video/..., /Plaquette/...) en tenant
 * compte du BASE_URL Vite ('./' ou '/') et de l'encodage URI des espaces et accents.
 */
export function resolveAssetUrl(rawPath = '') {
  if (!rawPath) return '';
  if (/^(blob:|data:|https?:\/\/)/i.test(rawPath)) return rawPath;
  const base = (import.meta.env?.BASE_URL || './').replace(/\/+$/, '');
  const clean = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
  return encodeURI(`${base}/${clean}`);
}

