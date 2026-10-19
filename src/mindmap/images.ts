/**
 * Procesamiento de imágenes para nodos: reducción de tamaño, compresión y medición.
 * Mantener las fotos pequeñas es lo que permite que los mapas se guarden rápido,
 * sincronicen en la nube y se muevan a 60 FPS.
 */

export interface ProcessedImage {
  dataUrl: string;
  width: number;
  height: number;
}

const MAX_SIDE = 760;
let webpSupported: boolean | null = null;

function supportsWebp(): boolean {
  if (webpSupported !== null) return webpSupported;
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    webpSupported = c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    webpSupported = false;
  }
  return webpSupported;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    img.src = src;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Detecta transparencia real de forma barata (muestreo) para decidir PNG/WebP vs JPEG. */
function hasAlpha(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  try {
    const sw = Math.min(w, 48);
    const sh = Math.min(h, 48);
    const data = ctx.getImageData(0, 0, sw, sh).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export async function processImageSource(src: string, maxSide: number = MAX_SIDE): Promise<ProcessedImage> {
  const img = await loadImage(src);
  const nw = img.naturalWidth || img.width || 200;
  const nh = img.naturalHeight || img.height || 150;
  const scale = Math.min(1, maxSide / Math.max(nw, nh));
  const w = Math.max(16, Math.round(nw * scale));
  const h = Math.max(16, Math.round(nh * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl: src, width: w, height: h };

  ctx.drawImage(img, 0, 0, w, h);
  const alpha = hasAlpha(ctx, w, h);

  let dataUrl: string;
  if (alpha) {
    dataUrl = supportsWebp() ? canvas.toDataURL('image/webp', 0.86) : canvas.toDataURL('image/png');
  } else {
    dataUrl = supportsWebp() ? canvas.toDataURL('image/webp', 0.82) : canvas.toDataURL('image/jpeg', 0.82);
  }
  return { dataUrl, width: w, height: h };
}

export async function processImageFile(file: File | Blob, maxSide: number = MAX_SIDE): Promise<ProcessedImage> {
  const url = await blobToDataUrl(file);
  return processImageSource(url, maxSide);
}

/** Versión liviana (miniatura) para la copia en la nube. */
export async function makeThumbnail(dataUrl: string, maxSide = 360): Promise<string> {
  try {
    const p = await processImageSource(dataUrl, maxSide);
    return p.dataUrl.length < dataUrl.length ? p.dataUrl : dataUrl;
  } catch {
    return dataUrl;
  }
}

/** Tamaño mostrado dentro del nodo según preset (conserva la proporción). */
export function fitImageSize(naturalW: number, naturalH: number, maxW: number, maxH: number): { width: number; height: number } {
  const s = Math.min(1, maxW / Math.max(1, naturalW), maxH / Math.max(1, naturalH));
  return {
    width: Math.max(32, Math.round(naturalW * s)),
    height: Math.max(24, Math.round(naturalH * s))
  };
}

export const IMAGE_PRESETS = {
  small: { w: 120, h: 90, label: 'Pequeña' },
  medium: { w: 200, h: 150, label: 'Mediana' },
  large: { w: 300, h: 225, label: 'Grande' }
} as const;

export type ImagePresetId = keyof typeof IMAGE_PRESETS;
