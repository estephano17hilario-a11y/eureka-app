import { norm, symKey, type Cat, type Kind, type Sym } from './catalog-core';
import { MATH_CATS } from './data-math';
import { SCIENCE_CATS } from './data-science';
import { HUMANITIES_CATS } from './data-humanities';
import { UD, UW, KX } from './unicode-data';

export type { Cat, Sub, Sym, Kind } from './catalog-core';
export { symKey, hasSlots, norm } from './catalog-core';

/** Catálogo completo, ordenado de lo más usado a lo más especializado */
export const CATALOG: Cat[] = [...MATH_CATS, ...SCIENCE_CATS, ...HUMANITIES_CATS];

/* -------------------------------------------------------------------------- */
/*  Materias (pantalla de inicio)                                              */
/* -------------------------------------------------------------------------- */

export interface GroupDef {
  id: string;
  name: string;
  /** Matiz (0-360) del color de sus recuadros */
  hue: number;
  cats: string[];
}

export const GROUPS: GroupDef[] = [
  { id: 'math', name: 'Matemáticas', hue: 205, cats: ['arit', 'alg', 'linalg', 'calc', 'geo', 'sets', 'stats'] },
  { id: 'nota', name: 'Notación y letras', hue: 265, cats: ['greek', 'fonts', 'rel', 'arrows', 'ops', 'delims', 'accents', 'layout'] },
  { id: 'sci', name: 'Ciencias y tecnología', hue: 150, cats: ['phys', 'chem', 'bio', 'astro', 'cs'] },
  { id: 'arts', name: 'Arte, lenguas y sociedad', hue: 25, cats: ['music', 'lang', 'eco', 'typo'] },
  { id: 'more', name: 'Formas, juegos y Unicode', hue: 330, cats: ['shapes', 'games', 'unicode'] }
];

export const CAT_DESC: Record<string, string> = {
  arit: 'Operaciones, fracciones, potencias, romanos',
  alg: 'Ecuaciones, logaritmos, complejos, combinatoria',
  linalg: 'Matrices, determinantes, vectores',
  calc: 'Límites, derivadas, integrales, series',
  geo: 'Ángulos, figuras, trigonometría',
  sets: 'Conjuntos, lógica, funciones',
  stats: 'Probabilidad, distribuciones, estadística',
  greek: 'Alfabeto griego, hebreo y letras especiales',
  fonts: 'Pizarra, caligráfica, gótica, negrita…',
  rel: 'Igualdad, orden, equivalencia',
  arrows: 'Flechas, arpones, reacciones',
  ops: 'Operadores binarios, grandes y funciones',
  delims: 'Paréntesis, llaves, barras, corchetes',
  accents: 'Sombreros, barras, tachados, llaves',
  layout: 'Entornos, espacios, puntos suspensivos',
  phys: 'Mecánica, ondas, electricidad, cuántica',
  chem: 'Elementos, iones, reacciones, orgánica',
  bio: 'Genética, bioquímica, ecología, medicina',
  astro: 'Planetas, zodiaco, clima, geografía',
  cs: 'Lógica, algoritmos, teclas, electrónica',
  music: 'Notas, claves, compás, acordes',
  lang: 'Acentos, alfabetos, fonética (AFI)',
  eco: 'Monedas y fórmulas financieras',
  typo: 'Puntuación, comillas, marcas legales',
  shapes: 'Figuras, estrellas, cajas, Braille',
  games: 'Ajedrez, cartas, emojis de estudio',
  unicode: 'Bloques Unicode completos'
};

export const KIND_INFO: Record<Kind, { name: string; hint: string }> = {
  sym: { name: 'Símbolos', hint: 'Piezas sueltas para armar lo que quieras' },
  tpl: { name: 'Estructuras', hint: 'Plantillas con casillas que rellenas tú' },
  formula: { name: 'Fórmulas hechas', hint: 'Fórmulas y reacciones ya escritas' }
};
export const KIND_ORDER: Kind[] = ['sym', 'tpl', 'formula'];

/** Subcategorías cuyo contenido es siempre de una clase (el resto se clasifica por su forma) */
const FORCED_KIND: Record<string, Kind> = {
  'phys/Mecánica': 'formula',
  'phys/Ondas y óptica': 'formula',
  'phys/Termodinámica': 'formula',
  'phys/Electricidad y magnetismo': 'formula',
  'phys/Relatividad y nuclear': 'formula',
  'phys/Constantes': 'formula',
  'phys/Partículas': 'sym',
  'phys/Unidades': 'sym',
  'chem/Reacciones típicas': 'formula',
  'chem/Magnitudes y fórmulas': 'formula',
  'chem/Elementos (tabla periódica)': 'sym',
  'chem/Núclidos e isótopos': 'sym',
  'chem/Iones': 'sym',
  'chem/Compuestos inorgánicos': 'sym',
  'chem/Orgánica y bioquímica': 'sym',
  'alg/Identidades y fórmulas': 'formula',
  'geo/Identidades': 'formula',
  'geo/Áreas, volúmenes y analítica': 'formula',
  'eco/Fórmulas económicas': 'formula'
};

/* -------------------------------------------------------------------------- */
/*  Datos oficiales (Unicode, KaTeX)                                           */
/* -------------------------------------------------------------------------- */

interface UInfo {
  n: string;
  g: string;
}
let UMAP: Map<number, UInfo> | null = null;
function unicodeMap(): Map<number, UInfo> {
  if (UMAP) return UMAP;
  UMAP = new Map();
  for (const e of UD.split(';')) {
    const [h, g, w] = e.split(':');
    UMAP.set(
      parseInt(h, 16),
      { g, n: w.split(',').map((i) => UW[parseInt(i, 16)]).join(' ') }
    );
  }
  return UMAP;
}

interface KInfo {
  g: string;
  c: string;
}
let KBY_NAME: Map<string, KInfo> | null = null;
let KBY_CHAR: Map<string, string[]> | null = null;
function katexMaps(): { byName: Map<string, KInfo>; byChar: Map<string, string[]> } {
  if (!KBY_NAME || !KBY_CHAR) {
    KBY_NAME = new Map();
    KBY_CHAR = new Map();
    for (const e of KX.split(';')) {
      const [name, g, hex] = e.split('=');
      // Algunos comandos (espacios) no tienen carácter propio
      const c = hex
        ? hex
            .split('.')
            .map((h) => String.fromCodePoint(parseInt(h, 16)))
            .join('')
        : '';
      KBY_NAME.set(name, { g, c });
      if (!c) continue;
      const list = KBY_CHAR.get(c);
      if (list) list.push('\\' + name);
      else KBY_CHAR.set(c, ['\\' + name]);
    }
  }
  return { byName: KBY_NAME, byChar: KBY_CHAR };
}

const TEX_CLASS: Record<string, string> = {
  mathord: 'Letra o variable',
  textord: 'Símbolo ordinario',
  bin: 'Operador binario',
  rel: 'Relación',
  open: 'Delimitador de apertura',
  close: 'Delimitador de cierre',
  punct: 'Puntuación',
  inner: 'Símbolo interno',
  op: 'Operador grande',
  accent: 'Acento',
  'accent-token': 'Acento',
  spacing: 'Espacio'
};

const GC_LABEL: Record<string, string> = {
  Lu: 'Letra mayúscula',
  Ll: 'Letra minúscula',
  Lt: 'Letra de título',
  Lm: 'Letra modificadora',
  Lo: 'Letra',
  Mn: 'Marca combinante',
  Mc: 'Marca combinante',
  Me: 'Marca envolvente',
  Nd: 'Dígito',
  Nl: 'Número (letra)',
  No: 'Número',
  Pc: 'Puntuación (conector)',
  Pd: 'Guion o raya',
  Ps: 'Signo de apertura',
  Pe: 'Signo de cierre',
  Pi: 'Comilla de apertura',
  Pf: 'Comilla de cierre',
  Po: 'Puntuación',
  Sm: 'Símbolo matemático',
  Sc: 'Símbolo de moneda',
  Sk: 'Símbolo modificador',
  So: 'Símbolo',
  Zs: 'Espacio',
  Cc: 'Carácter de control',
  Cf: 'Carácter de formato'
};

function unicodeType(name: string, gc: string): string {
  const small = /\bSMALL\b/.test(name);
  if (/^GREEK (SMALL|CAPITAL) LETTER/.test(name)) return small ? 'Letra griega minúscula' : 'Letra griega mayúscula';
  if (/^GREEK /.test(name)) return 'Letra o signo griego';
  if (/^CYRILLIC (SMALL|CAPITAL) LETTER/.test(name)) return small ? 'Letra cirílica minúscula' : 'Letra cirílica mayúscula';
  if (/^LATIN (SMALL|CAPITAL) LETTER/.test(name)) return small ? 'Letra latina minúscula' : 'Letra latina mayúscula';
  if (/^HEBREW LETTER/.test(name)) return 'Letra hebrea';
  if (/^ARABIC LETTER/.test(name)) return 'Letra árabe';
  if (/^(HIRAGANA|KATAKANA) LETTER/.test(name)) return /^HIRAGANA/.test(name) ? 'Hiragana' : 'Katakana';
  if (/^RUNIC/.test(name)) return 'Runa';
  if (/^MATHEMATICAL .*(CAPITAL|SMALL|DIGIT|NABLA|PARTIAL)/.test(name)) return 'Letra o dígito matemático';
  if (/^(MUSICAL SYMBOL|BYZANTINE MUSICAL)/.test(name)) return 'Símbolo musical';
  if (/^BRAILLE PATTERN/.test(name)) return 'Patrón Braille';
  if (/^BOX DRAWINGS|^(LIGHT|MEDIUM|DARK) SHADE|BLOCK$|^(UPPER|LOWER|LEFT|RIGHT) .*BLOCK/.test(name)) return 'Dibujo de caja o bloque';
  if (/^ALCHEMICAL SYMBOL/.test(name)) return 'Símbolo alquímico';
  if (/^(PLAYING CARD|DOMINO TILE|MAHJONG TILE)/.test(name)) return 'Ficha o carta';
  if (/^CIRCLED|^PARENTHESIZED|^DIGIT .*FULL STOP|^NEGATIVE CIRCLED/.test(name)) return 'Número o letra rodeados';
  if (/^ROMAN NUMERAL/.test(name)) return 'Número romano';
  if (/^(SUPERSCRIPT|MODIFIER LETTER SMALL)/.test(name)) return 'Superíndice';
  if (/^SUBSCRIPT/.test(name)) return 'Subíndice';
  if (/FRACTION/.test(name)) return 'Fracción';
  if (/ARROW|HARPOON/.test(name)) return 'Flecha';
  if (/^(BLACK|WHITE)\b.*(SQUARE|CIRCLE|TRIANGLE|DIAMOND|STAR|PENTAGON|HEXAGON|RECTANGLE|PARALLELOGRAM|LOZENGE)/.test(name)) return 'Figura geométrica';
  if (/^(COMBINING)/.test(name)) return 'Marca combinante';
  if (/^(CHESS|BLACK CHESS|WHITE CHESS)/.test(name)) return 'Pieza de ajedrez';
  if (/^(DIE FACE|BLACK (SPADE|HEART|DIAMOND|CLUB)|WHITE (SPADE|HEART|DIAMOND|CLUB))/.test(name)) return 'Palo de baraja o dado';
  if (/^(APL FUNCTIONAL)/.test(name)) return 'Símbolo APL';
  return GC_LABEL[gc] || 'Símbolo';
}

/** Nombre oficial Unicode del carácter (o secuencia base + marcas); undefined si es texto corriente */
function officialOf(c: string): { u: string; gc: string; first: UInfo } | undefined {
  const map = unicodeMap();
  const cps = Array.from(c, (ch) => ch.codePointAt(0) as number);
  if (!cps.length) return undefined;
  const infos: UInfo[] = [];
  for (const cp of cps) {
    const i = map.get(cp);
    if (!i) return undefined;
    infos.push(i);
  }
  if (cps.length > 1) {
    // Solo secuencias «base + marcas combinantes / selector de variación»; el resto es texto corriente
    const ok = infos.slice(1).every((i, k) => /^M/.test(i.g) || /^VARIATION SELECTOR/.test(i.n) || cps[k + 1] === 0x200d);
    if (!ok) return undefined;
  }
  return { u: infos.map((i) => i.n).join(' + '), gc: infos[0].g, first: infos[0] };
}

const SMALL_WORDS = new Set(['OR', 'TO', 'OF', 'AND', 'WITH', 'THE', 'ON', 'IN', 'FOR', 'OVER', 'UNDER', 'BY', 'AT']);
function titleCase(upper: string): string {
  return upper
    .split(' ')
    .map((w, i) => {
      if (i > 0 && SMALL_WORDS.has(w)) return w.toLowerCase();
      return w
        .split('-')
        .map((p) => (/^[A-Z]/.test(p) ? p[0] + p.slice(1).toLowerCase() : p))
        .join('-');
    })
    .join(' ');
}

/** Cuando Unicode solo dice «Símbolo», la materia en la que está lo precisa */
const CAT_TYPE_HINT: Record<string, string> = {
  music: 'Símbolo musical',
  astro: 'Símbolo astronómico o terrestre',
  games: 'Símbolo de juego o cultura',
  shapes: 'Figura u ornamento',
  typo: 'Signo tipográfico',
  bio: 'Símbolo biológico o médico',
  cs: 'Símbolo informático',
  lang: 'Signo lingüístico',
  eco: 'Símbolo económico',
  phys: 'Símbolo científico',
  chem: 'Símbolo químico',
  sets: 'Símbolo de lógica o conjuntos',
  arrows: 'Flecha'
};
const GENERIC_TYPES = new Set(['Símbolo', 'Símbolo matemático', 'Puntuación']);

const isRawName = (s: Sym): boolean =>
  s.n === s.c || /^U\+[0-9A-F]{4,6}$/.test(s.n) || (!!s.t && (s.n === s.t || s.n === s.t.replace(/^\\/, '')));

/* -------------------------------------------------------------------------- */
/*  Clasificación                                                              */
/* -------------------------------------------------------------------------- */

/** ¿Hay un «=» fuera de llaves? (los límites de una suma, como i=1, no cuentan) */
function topLevelEq(t: string): boolean {
  let depth = 0;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (ch === '\\') {
      i++;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '=' && depth === 0) return true;
  }
  return false;
}

function kindOf(s: Sym): Kind {
  const t = s.t;
  if (!t) return 'sym';
  if (t.includes('#?') || t.includes('#@') || t.includes('#0') || /\\begin\{/.test(t)) return 'tpl';
  if (/^\\ce\{/.test(t) && /->|<=>|<->|<=>>|<<=>| \+ /.test(t)) return 'formula';
  if (topLevelEq(t) || /\\(iff|Rightarrow|implies)\b/.test(t) && t.length > 14) return 'formula';
  if (/^\\[A-Za-z]+$/.test(t)) return 'sym';
  return t.length > 24 ? 'formula' : 'sym';
}

/* -------------------------------------------------------------------------- */
/*  Enriquecimiento                                                            */
/* -------------------------------------------------------------------------- */

let flat: Sym[] | null = null;
let ready = false;

function enrich(s: Sym): void {
  const { byName, byChar } = katexMaps();
  const pure = s.t ? /^\\([A-Za-z]+)$/.exec(s.t.trim()) : null;
  const kx = pure ? byName.get(pure[1]) : undefined;
  const ch = s.c && !s.c.includes('#?') ? s.c : kx?.c;
  const off = ch ? officialOf(ch) : undefined;

  // Nombre oficial (si no lo fijó el dato: elementos, núclidos…)
  if (!s.u) {
    if (off) s.u = titleCase(off.u);
    else if (pure) s.u = `LaTeX \\${pure[1]}`;
    else if (s.t && s.kind === 'tpl') {
      const env = /\\begin\{(\w+\*?)\}/.exec(s.t);
      const cmd = /^[^\\]*\\([A-Za-z]+)/.exec(s.t);
      if (env) s.u = `LaTeX environment ${env[1]}`;
      else if (cmd) s.u = `LaTeX \\${cmd[1]}`;
    }
  }

  // Tipo exacto
  if (!s.y) {
    const tex = kx ? TEX_CLASS[kx.g] : undefined;
    const uni = off ? unicodeType(off.u, off.gc) : undefined;
    let uniLabel = uni;
    if (uniLabel && GENERIC_TYPES.has(uniLabel) && s.cat && CAT_TYPE_HINT[s.cat] && !(s.cat === 'sets' && uniLabel === 'Símbolo matemático')) uniLabel = CAT_TYPE_HINT[s.cat];
    if (tex && uniLabel && tex !== uniLabel) s.y = `${tex} · ${uniLabel}`;
    else s.y = tex || uniLabel;
  }
  if (!s.y) {
    const k = s.kind;
    s.y = pure ? 'Función u operador' : k === 'tpl' ? 'Estructura con casillas' : k === 'formula' ? 'Fórmula hecha' : 'Expresión';
  }

  // Alias: todos los comandos LaTeX que dan el mismo carácter
  const aliases = new Set<string>();
  if (ch && byChar.has(ch)) byChar.get(ch)!.forEach((a) => aliases.add(a));
  if (pure) aliases.add(`\\${pure[1]}`);
  if (aliases.size) s.a = Array.from(aliases);

  // Nombre visible: si el dato solo traía el carácter o el comando, se usa el nombre oficial
  if (isRawName(s) && off) s.n = pure && !s.c ? `${titleCase(off.u)} (\\${pure[1]})` : titleCase(off.u);
  else if (isRawName(s) && s.u && pure) s.n = `\\${pure[1]}`;
}

/** Todas las entradas, con categoría, clase, nombres oficiales y un índice de búsqueda */
export function allSyms(): Sym[] {
  if (flat && ready) return flat;
  const out: Sym[] = [];
  for (const c of CATALOG) {
    const catName = norm(c.name);
    for (const s of c.subs) {
      const subName = norm(s.name);
      const forced = FORCED_KIND[`${c.id}/${s.name}`];
      for (const it of s.items) {
        it.cat = c.id;
        it.sub = s.name;
        it.kind = forced || kindOf(it);
        enrich(it);
        const cp = it.c ? Array.from(it.c, (x) => (x.codePointAt(0) as number).toString(16)) : [];
        const codes = cp.length ? cp.map((h) => `u+${h.padStart(4, '0')} ${h.padStart(4, '0')}`).join(' ') : '';
        const aliasText = it.a ? it.a.join(' ') + ' ' + it.a.map((a) => a.slice(1)).join(' ') : '';
        it.s = [
          norm(it.n),
          it.k ? norm(it.k) : '',
          it.u ? it.u.toLowerCase() : '',
          it.y ? norm(it.y) : '',
          aliasText.toLowerCase(),
          it.t ? it.t.toLowerCase() : '',
          it.c ? it.c.toLowerCase() : '',
          codes,
          subName,
          catName
        ].join(' ');
        out.push(it);
      }
    }
  }
  flat = out;
  ready = true;
  return out;
}

export function totalCount(): number {
  return allSyms().length;
}

export function findCat(id: string): Cat | undefined {
  return CATALOG.find((c) => c.id === id);
}

/** Cuántas entradas de cada clase tiene una categoría */
export function kindCounts(catId: string): Record<Kind, number> {
  allSyms();
  const counts: Record<Kind, number> = { sym: 0, tpl: 0, formula: 0 };
  const cat = findCat(catId);
  if (cat) for (const s of cat.subs) for (const it of s.items) counts[it.kind as Kind]++;
  return counts;
}

export function catTotal(catId: string): number {
  const k = kindCounts(catId);
  return k.sym + k.tpl + k.formula;
}

/** Subcategorías de una categoría con solo las entradas de una clase */
export function catKindView(catId: string, kind: Kind): Array<{ name: string; items: Sym[] }> {
  allSyms();
  const cat = findCat(catId);
  if (!cat) return [];
  const out: Array<{ name: string; items: Sym[] }> = [];
  for (const s of cat.subs) {
    const items = s.items.filter((it) => it.kind === kind);
    if (items.length) out.push({ name: s.name, items });
  }
  return out;
}

const KIND_PENALTY: Record<Kind, number> = { sym: 0, tpl: 0.35, formula: 0.7 };

/**
 * Búsqueda por nombre (español u oficial en inglés), comando LaTeX (\frac, \le o \leq), carácter (≤)
 * o código (U+2264). Primero lo que coincide exactamente; entre iguales, símbolos antes que fórmulas hechas.
 */
export function searchSyms(query: string, limit = 160, cats?: Set<string>): Sym[] {
  const raw = query.trim();
  if (!raw) return [];
  const all = allSyms();
  const q = norm(raw).replace(/^u\+/, '');
  const tokens = q.split(/\s+/).filter(Boolean);
  const texQuery = raw.startsWith('\\') ? raw.toLowerCase() : '';
  const scored: Array<{ s: Sym; score: number; i: number }> = [];
  const seen = new Set<string>();

  for (let i = 0; i < all.length; i++) {
    const s = all[i];
    if (cats && !cats.has(s.cat as string)) continue;
    let score = -1;
    if (s.c === raw) score = 0;
    else if (texQuery) {
      const names = [s.t?.toLowerCase(), ...(s.a || []).map((a) => a.toLowerCase())].filter(Boolean) as string[];
      if (!names.length) continue;
      if (names.some((t) => t === texQuery)) score = 0;
      else if (names.some((t) => t.startsWith(texQuery))) score = 1 + (s.t || '').replace(/#\?/g, '').length / 100;
      else if (names.some((t) => t.includes(texQuery))) score = 3;
    } else {
      const blob = s.s as string;
      let ok = true;
      for (const tk of tokens) {
        if (!blob.includes(tk)) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      const name = norm(s.n);
      const off = s.u ? s.u.toLowerCase() : '';
      const aliasHit = (s.a || []).some((a) => a.slice(1).toLowerCase() === q);
      if (name === q || off === q || aliasHit) score = 0;
      else if (name.startsWith(q) || off.startsWith(q)) score = 1;
      else if (s.t && s.t.toLowerCase() === `\\${q}`) score = 1;
      else if (name.split(/[\s(/-]+/).some((w) => w.startsWith(tokens[0])) || off.split(/[\s(/-]+/).some((w) => w.startsWith(tokens[0]))) score = 2;
      else if (s.k && norm(s.k).split(/\s+/).some((w) => w.startsWith(tokens[0]))) score = 3;
      else if (name.includes(q) || off.includes(q)) score = 4;
      else score = 5;
    }
    if (score < 0) continue;
    const key = s.c ?? symKey(s);
    if (seen.has(key)) continue;
    seen.add(key);
    score += KIND_PENALTY[s.kind as Kind];
    // Las fórmulas largas quedan por detrás de los símbolos sueltos
    if (s.t && s.t.length > 24) score += 0.2;
    scored.push({ s, score, i });
    if (scored.length > 4000) break;
  }
  scored.sort((a, b) => a.score - b.score || a.i - b.i);
  // Con varias buenas coincidencias, las que solo contienen el texto suelto (score 5) son ruido
  const good = scored.filter((x) => x.score < 5).length;
  const list = good >= 12 ? scored.filter((x) => x.score < 5) : scored;
  return list.slice(0, limit).map((x) => x.s);
}
