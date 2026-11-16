/**
 * Núcleo del catálogo universal de símbolos.
 *
 * Los datos se escriben en un mini-formato compacto (una entrada por línea) para poder mantener miles de símbolos:
 *
 *   α ~ \alpha :: alfa :: alpha a        → carácter Unicode + LaTeX + nombre + palabras clave
 *   \frac{#?}{#?} :: Fracción :: quebrado → solo LaTeX (#? = casilla editable)
 *   ♪ :: Corchea :: nota                  → solo carácter (se inserta como texto)
 *   c:^ :: Circunflejo                    → carácter que contiene símbolos reservados
 *   @ \lessapprox ⪆~\gtrapprox ♩          → lista rápida sin nombre (el nombre es el propio comando)
 */

/** Símbolo suelto (material para armar), plantilla con casillas, o fórmula ya hecha */
export type Kind = 'sym' | 'tpl' | 'formula';

export interface Sym {
  /** Carácter Unicode (inserción como texto) */
  c?: string;
  /** Código LaTeX (inserción como fórmula). `#?` marca una casilla editable */
  t?: string;
  /** Nombre visible */
  n: string;
  /** Palabras clave extra para la búsqueda */
  k?: string;
  /** Índice de búsqueda normalizado (se rellena al construir el catálogo) */
  s?: string;
  cat?: string;
  sub?: string;
  /** Nombre oficial: el del estándar Unicode (inglés), el de KaTeX/LaTeX o el IUPAC */
  u?: string;
  /** Tipo exacto (clase TeX, categoría Unicode, familia del elemento…) */
  y?: string;
  /** Otros comandos LaTeX que producen lo mismo (\le y \leq, por ejemplo) */
  a?: string[];
  kind?: Kind;
}

export interface Sub {
  name: string;
  items: Sym[];
}

export interface Cat {
  id: string;
  name: string;
  icon: string;
  subs: Sub[];
}

const HAS_TEX = /[\\{}^_]/;

export function parseSyms(raw: string): Sym[] {
  const out: Sym[] = [];
  for (const line0 of raw.split('\n')) {
    const line = line0.trim();
    if (!line) continue;

    if (line.startsWith('@ ')) {
      for (const tok of line.slice(2).split(/\s+/)) {
        if (!tok) continue;
        const i = tok.indexOf('~\\');
        if (i > 0) out.push({ c: tok.slice(0, i), t: tok.slice(i + 1), n: tok.slice(i + 2) });
        else if (tok[0] === '\\' && tok.length > 1) out.push({ t: tok, n: tok.slice(1) });
        else out.push({ c: tok, n: tok });
      }
      continue;
    }

    const f = line.split(' :: ');
    const head = f[0].trim();
    let c: string | undefined;
    let t: string | undefined;
    const m = /^(\S+) ~ (.+)$/.exec(head);
    if (head.startsWith('c:')) c = head.slice(2).replace(/\\u([0-9A-Fa-f]{4})/g, (_m, h: string) => String.fromCharCode(parseInt(h, 16)));
    else if (m) {
      c = m[1];
      t = m[2];
    } else if (HAS_TEX.test(head) || head.includes('#?')) t = head;
    else c = head;
    const name = (f[1] || '').trim() || (t ? t.replace(/^\\/, '') : (c as string));
    out.push({ c, t, n: name, k: f[2]?.trim() || undefined });
  }
  return out;
}

/** Plantilla etiquetada: R`...` conserva las barras invertidas tal cual y devuelve los símbolos ya analizados */
export const R = (strings: TemplateStringsArray): Sym[] => parseSyms(String.raw(strings));

export const sub = (name: string, items: Sym[]): Sub => ({ name, items });
export const cat = (id: string, name: string, icon: string, subs: Sub[]): Cat => ({ id, name, icon, subs });

/** Bloque Unicode completo por rango de puntos de código */
export function uni(name: string, from: number, to: number, skip: Array<[number, number]> = []): Sub {
  const items: Sym[] = [];
  for (let cp = from; cp <= to; cp++) {
    if (skip.some(([a, b]) => cp >= a && cp <= b)) continue;
    const hex = cp.toString(16).toUpperCase().padStart(4, '0');
    items.push({ c: String.fromCodePoint(cp), n: `U+${hex}`, k: hex });
  }
  return { name, items };
}

/** Lista simple "X Nombre" → entradas construidas con una función */
export function mapList(raw: string, build: (a: string, b: string, i: number) => Sym): Sym[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l, i) => {
      const sp = l.indexOf(' ');
      return sp === -1 ? build(l, '', i) : build(l.slice(0, sp), l.slice(sp + 1).trim(), i);
    });
}

export function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export const symKey = (s: Sym): string => s.t || s.c || s.n;

/** ¿La entrada necesita el editor visual (tiene casillas que rellenar)? */
export const hasSlots = (s: Sym): boolean => !!s.t && s.t.includes('#?');

/* -------------------------------------------------------------------------- */
/*  Alfabetos matemáticos (negrita, caligráfica, gótica, pizarra…)             */
/* -------------------------------------------------------------------------- */

const UP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LO = 'abcdefghijklmnopqrstuvwxyz';
const DG = '0123456789';

interface FontSpec {
  cmd: string;
  label: string;
  upper?: number;
  lower?: number;
  digit?: number;
  /** Letras cuyo carácter Unicode vive fuera del bloque regular */
  ex?: Record<string, string>;
  sets: string;
}

const FONTS: FontSpec[] = [
  { cmd: 'mathbb', label: 'Pizarra', upper: 0x1d538, ex: { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' }, sets: 'U' },
  { cmd: 'mathcal', label: 'Caligráfica', upper: 0x1d49c, ex: { B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ' }, sets: 'U' },
  { cmd: 'mathscr', label: 'Manuscrita', sets: 'U' },
  { cmd: 'mathfrak', label: 'Gótica', upper: 0x1d504, lower: 0x1d51e, ex: { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' }, sets: 'UL' },
  { cmd: 'mathbf', label: 'Negrita', upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce, sets: 'ULD' },
  { cmd: 'mathit', label: 'Cursiva', upper: 0x1d434, lower: 0x1d44e, ex: { h: 'ℎ' }, sets: 'UL' },
  { cmd: 'mathsf', label: 'Palo seco', upper: 0x1d5a0, lower: 0x1d5ba, digit: 0x1d7e2, sets: 'ULD' },
  { cmd: 'mathtt', label: 'Monoespaciada', upper: 0x1d670, lower: 0x1d68a, digit: 0x1d7f6, sets: 'ULD' }
];

export function fontSubs(): Sub[] {
  return FONTS.map((f) => {
    const items: Sym[] = [];
    const add = (chars: string, base: number | undefined, kind: string) => {
      [...chars].forEach((ch, i) => {
        const c = f.ex?.[ch] || (base ? String.fromCodePoint(base + i) : undefined);
        items.push({ c, t: `\\${f.cmd}{${ch}}`, n: `${ch} ${f.label.toLowerCase()}`, k: `${f.cmd} ${kind} ${ch}` });
      });
    };
    if (f.sets.includes('U')) add(UP, f.upper, 'mayuscula');
    if (f.sets.includes('L')) add(LO, f.lower, 'minuscula');
    if (f.sets.includes('D')) add(DG, f.digit, 'numero digito');
    return { name: f.label, items };
  });
}
