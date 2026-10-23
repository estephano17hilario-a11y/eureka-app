/**
 * Biblioteca de imágenes gratuita (sin cuenta ni clave):
 *  - Openverse: cientos de millones de fotos e ilustraciones con licencias abiertas (Flickr, Wikimedia, museos…).
 *  - Wikimedia Commons: diagramas, láminas anatómicas, mapas, esquemas científicos.
 * Las imágenes elegidas se reducen y comprimen antes de guardarse, para que las tarjetas pesen poco
 * y quepan en el almacenamiento del dispositivo y en la sincronización.
 */

export type LibrarySource = 'openverse' | 'wikimedia';

export interface LibraryImage {
  id: string;
  title: string;
  /** Miniatura para la cuadrícula */
  thumb: string;
  /** Versión de buen tamaño para guardar en la tarjeta */
  full: string;
  creator: string;
  license: string;
  sourceUrl: string;
  provider: string;
  width?: number;
  height?: number;
}

export interface LibraryPage {
  items: LibraryImage[];
  hasMore: boolean;
}

const PAGE_SIZE = 24;
/** Openverse limita a 20 por página a las consultas anónimas */
const OPENVERSE_PAGE_SIZE = 20;
const cache = new Map<string, LibraryPage>();

function licenseLabel(code: string, version?: string): string {
  const c = (code || '').toLowerCase();
  if (c === 'cc0' || c === 'pdm') return c === 'cc0' ? 'CC0 · dominio público' : 'Dominio público';
  if (!c) return 'Licencia abierta';
  return `CC ${c.toUpperCase()}${version ? ' ' + version : ''}`;
}

function stripHtml(html: string): string {
  const d = document.createElement('div');
  d.innerHTML = html || '';
  return (d.textContent || '').trim();
}

async function searchOpenverse(query: string, page: number, signal?: AbortSignal): Promise<LibraryPage> {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page=${page}&page_size=${OPENVERSE_PAGE_SIZE}&mature=false`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Openverse ${res.status}`);
  const json = await res.json();
  const items: LibraryImage[] = (json.results || [])
    .filter((r: any) => r?.thumbnail || r?.url)
    .map((r: any) => ({
      id: `ov:${r.id}`,
      title: r.title || 'Sin título',
      thumb: r.thumbnail || r.url,
      full: r.thumbnail || r.url,
      creator: r.creator || 'Autor desconocido',
      license: licenseLabel(r.license, r.license_version),
      sourceUrl: r.foreign_landing_url || r.url,
      provider: r.provider || r.source || 'Openverse',
      width: r.width,
      height: r.height
    }));
  return { items, hasMore: page < (json.page_count || 1) };
}

async function searchWikimedia(query: string, page: number, signal?: AbortSignal): Promise<LibraryPage> {
  const offset = (page - 1) * PAGE_SIZE;
  const q = `${query} filetype:bitmap|drawing`;
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6' +
    `&gsrsearch=${encodeURIComponent(q)}&gsrlimit=${PAGE_SIZE}&gsroffset=${offset}` +
    '&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=900';
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Wikimedia ${res.status}`);
  const json = await res.json();
  const pages: any[] = Object.values(json?.query?.pages || {});
  pages.sort((a, b) => (a.index || 0) - (b.index || 0));
  const items: LibraryImage[] = pages
    .map((p) => {
      const info = p.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata || {};
      const thumb: string = info.thumburl || info.url;
      return {
        id: `wm:${p.pageid}`,
        title: String(p.title || '').replace(/^File:/, '').replace(/\.[a-z0-9]+$/i, ''),
        thumb,
        full: thumb,
        creator: stripHtml(meta.Artist?.value) || 'Wikimedia Commons',
        license: stripHtml(meta.LicenseShortName?.value) || 'Licencia abierta',
        sourceUrl: info.descriptionurl || info.url,
        provider: 'Wikimedia Commons',
        width: info.thumbwidth || info.width,
        height: info.thumbheight || info.height
      } as LibraryImage;
    })
    .filter(Boolean) as LibraryImage[];
  return { items, hasMore: Boolean(json?.continue) };
}

export async function searchLibrary(source: LibrarySource, query: string, page = 1, signal?: AbortSignal): Promise<LibraryPage> {
  const q = query.trim();
  if (!q) return { items: [], hasMore: false };
  const key = `${source}|${q.toLowerCase()}|${page}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const result = source === 'openverse' ? await searchOpenverse(q, page, signal) : await searchWikimedia(q, page, signal);
  if (cache.size > 60) cache.delete(cache.keys().next().value as string);
  cache.set(key, result);
  return result;
}

/* ======================================================================= */
/*  Compresión de imágenes                                                  */
/* ======================================================================= */

let webpOk: boolean | null = null;
function supportsWebp(): boolean {
  if (webpOk !== null) return webpOk;
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    webpOk = c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    webpOk = false;
  }
  return webpOk;
}

async function decodeBlob(blob: Blob): Promise<{ src: CanvasImageSource; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(blob);
      return { src: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close?.() };
    } catch {
      /* se prueba con <img> */
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('imagen no válida'));
      el.src = url;
    });
    return { src: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

/** Reduce y comprime una imagen (archivo, foto de la cámara o descarga) a un data URL ligero. */
export async function compressImageBlob(blob: Blob, maxDim = 1100, quality = 0.82): Promise<string> {
  const dec = await decodeBlob(blob);
  try {
    const k = Math.min(1, maxDim / Math.max(dec.width, dec.height));
    const w = Math.max(1, Math.round(dec.width * k));
    const h = Math.max(1, Math.round(dec.height * k));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas no disponible');
    // Fondo blanco: los PNG/SVG con transparencia no deben quedar negros al pasar a JPEG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(dec.src, 0, 0, w, h);
    return supportsWebp() ? canvas.toDataURL('image/webp', quality) : canvas.toDataURL('image/jpeg', quality);
  } finally {
    dec.close();
  }
}

export async function compressImageFile(file: File | Blob, maxDim = 1100, quality = 0.82): Promise<string> {
  // GIF animados y SVG se conservan tal cual si ya pesan poco
  if (file.type === 'image/gif' && file.size < 400_000) return blobToDataUrl(file);
  return compressImageBlob(file, maxDim, quality);
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ''));
    r.onerror = () => reject(r.error || new Error('lectura fallida'));
    r.readAsDataURL(blob);
  });
}

/** Descarga la imagen elegida de la biblioteca y la deja comprimida lista para guardar en la tarjeta. */
export async function fetchLibraryImageAsDataUrl(img: LibraryImage, maxDim = 1100): Promise<string> {
  const res = await fetch(img.full, { mode: 'cors' });
  if (!res.ok) throw new Error(`descarga ${res.status}`);
  const blob = await res.blob();
  return compressImageBlob(blob, maxDim, 0.82);
}

export function creditFor(img: LibraryImage): string {
  return `${img.title} — ${img.creator} · ${img.license} · ${img.provider}`;
}
