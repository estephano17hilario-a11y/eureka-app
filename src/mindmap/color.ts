/**
 * Utilidades de color para el mapa mental (parseo, mezcla, contraste y alfa).
 */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const NAMED: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'rgba(0,0,0,0)'
};

export function parseColor(input?: string | null): RGBA | null {
  if (!input) return null;
  let c = input.trim().toLowerCase();
  if (NAMED[c]) c = NAMED[c];

  if (c.startsWith('#')) {
    let hex = c.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split('')
        .map((ch) => ch + ch)
        .join('');
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b, a };
    }
    return null;
  }

  const m = c.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)/);
  if (m) {
    let a = 1;
    if (m[4] !== undefined) a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a };
  }
  return null;
}

export function toRgbaString(c: RGBA): string {
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${+c.a.toFixed(3)})`;
}

export function toHex(c: RGBA): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

export function withAlpha(color: string, alpha: number): string {
  const c = parseColor(color);
  if (!c) return color;
  return toRgbaString({ ...c, a: alpha });
}

export function mix(a: string, b: string, t: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return a;
  return toHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
    a: 1
  });
}

export function lighten(color: string, amount: number): string {
  return mix(color, '#ffffff', amount);
}

export function darken(color: string, amount: number): string {
  return mix(color, '#000000', amount);
}

/** Luminancia relativa WCAG (0 = negro, 1 = blanco) */
export function luminance(color: string): number {
  const c = parseColor(color);
  if (!c) return 0;
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}

export function isLight(color: string): boolean {
  const c = parseColor(color);
  if (!c || c.a < 0.35) return false;
  return luminance(color) > 0.5;
}

/** Elige texto claro u oscuro con buen contraste sobre un fondo */
export function readableOn(bg: string, light = '#ffffff', dark = '#0f172a'): string {
  return isLight(bg) ? dark : light;
}

export function isTransparent(color?: string | null): boolean {
  if (!color) return true;
  const c = parseColor(color);
  return !c || c.a <= 0.01;
}

/** '#rrggbb' a partir de cualquier color CSS (gris neutro si no se puede interpretar). */
export function hexOf(color?: string | null, fallback = '#888888'): string {
  const c = parseColor(color);
  return c ? toHex(c) : fallback;
}
