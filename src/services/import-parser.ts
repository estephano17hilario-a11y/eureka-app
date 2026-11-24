/**
 * Lector inteligente de tarjetas para importar.
 *
 * - Detecta solo cómo se separan las tarjetas y sus dos caras, pero TODO se puede forzar:
 *   tabulación, coma, punto y coma, barra, dos puntos, guion, igual, flecha, punto, espacio,
 *   salto de línea o cualquier texto propio.
 * - Entiende CSV con comillas, exportaciones de Anki, bloques «P: … R: …» y listas alternas.
 * - Permite elegir qué columnas son pregunta y respuesta, cortar en la primera o la última
 *   coincidencia, intercambiar caras y omitir (o conservar) la fila de títulos.
 * - Explica qué entendió y qué ignoró.
 */

export type CardSepMode = 'auto' | 'line' | 'pairs' | 'blank' | 'dashes' | 'custom';
export type SideSepKey =
  | 'auto'
  | 'tab'
  | 'semi'
  | 'comma'
  | 'pipe'
  | 'colons'
  | 'dash'
  | 'colon'
  | 'equals'
  | 'arrow'
  | 'period'
  | 'space'
  | 'newline'
  | 'custom';
export type ExtraMode = 'auto' | 'join' | 'cols';
export type HeaderMode = 'auto' | 'skip' | 'keep';

export interface ImportSettings {
  cardSep: CardSepMode;
  cardCustom: string;
  sideSep: SideSepKey;
  sideCustom: string;
  /** Primera fila: detectar si es un título («Pregunta;Respuesta»), omitirla siempre o conservarla */
  headerMode: HeaderMode;
  /** Si el separador aparece varias veces en la línea: cortar en la primera o en la última */
  cut: 'first' | 'last';
  /** Qué hacer cuando una fila tiene más de dos partes */
  extra: ExtraMode;
  /** Columna (desde 1) de la pregunta y de la respuesta cuando se eligen columnas */
  colFront: number;
  colBack: number;
  /** Intercambiar pregunta y respuesta */
  swap: boolean;
  /** Quitar viñetas y numeración al principio de cada línea («- », «1. », «• ») */
  stripList: boolean;
}

export interface ParsedRow {
  front: string;
  back: string;
  /** Número de línea (desde 1) donde empieza la tarjeta en el texto original */
  line: number;
}

export interface IgnoredLine {
  line: number;
  text: string;
}

export interface ImportParseResult {
  rows: ParsedRow[];
  ignored: IgnoredLine[];
  /** Cómo se interpretó el texto (lo que se muestra en «Detectamos…») */
  detected: {
    format: 'qa' | 'lines' | 'blocks' | 'alternate' | 'none';
    cardSepLabel: string;
    sideSepLabel: string;
    sideSep: SideSepKey;
    cardSep: CardSepMode;
  };
  headerSkipped: boolean;
  /** Filas con más de 2 columnas (solo se usan las elegidas) */
  extraColumnRows: number;
  /** Se quitaron viñetas / numeración */
  listStripped: boolean;
}

export const DEFAULT_SETTINGS: ImportSettings = {
  cardSep: 'auto',
  cardCustom: '',
  sideSep: 'auto',
  sideCustom: '',
  headerMode: 'auto',
  cut: 'first',
  extra: 'auto',
  colFront: 1,
  colBack: 2,
  swap: false,
  stripList: true
};

type TokenKey = Exclude<SideSepKey, 'auto' | 'custom' | 'newline'>;

interface TokenDef {
  /** Expresión que encuentra el separador al elegirlo a mano */
  src: string;
  /** Variante, más estricta, que se usa para adivinarlo (para no confundir con texto normal) */
  autoSrc?: string;
  label: string;
  short: string;
  /** Texto para el ejemplo del botón */
  sample: string;
}

export const SIDE_TOKENS: Record<TokenKey, TokenDef> = {
  tab: { src: '\\t', autoSrc: '\\t', label: 'tabulación (Tab)', short: 'Tab', sample: '\t' },
  semi: { src: ';', autoSrc: ';', label: 'punto y coma ( ; )', short: ';', sample: ' ; ' },
  comma: { src: ',', autoSrc: ',', label: 'coma ( , )', short: ',', sample: ', ' },
  pipe: { src: '\\|', autoSrc: '\\|', label: 'barra vertical ( | )', short: '|', sample: ' | ' },
  colons: { src: ':::', autoSrc: ':::', label: 'tres dos puntos ( ::: )', short: ':::', sample: ' ::: ' },
  dash: { src: '\\s[-–—−]\\s', autoSrc: '\\s[-–—−]\\s', label: 'guion ( - )', short: '-', sample: ' - ' },
  colon: { src: ':', autoSrc: ':\\s', label: 'dos puntos ( : )', short: ':', sample: ': ' },
  equals: { src: '=', autoSrc: '\\s=\\s', label: 'igual ( = )', short: '=', sample: ' = ' },
  arrow: { src: '\\s*(?:->|=>|→|⇒|⟶|⟹)\\s*', autoSrc: '\\s*(?:->|=>|→|⇒|⟶|⟹)\\s*', label: 'flecha ( → )', short: '→', sample: ' → ' },
  period: { src: '\\.(?=\\s|$)', label: 'punto ( . )', short: '.', sample: '. ' },
  space: { src: '\\s+', label: 'espacio', short: '␣', sample: ' ' }
};

/** Orden en que se prueba cada separador al detectar solo (la coma, la última: sale mucho en texto normal) */
const AUTO_ORDER: TokenKey[] = ['tab', 'colons', 'semi', 'pipe', 'arrow', 'dash', 'colon', 'equals', 'comma'];

const HEADER_FRONT = /^(pregunta|anverso|frente|front|question|term|t[eé]rmino|palabra|concepto|word|vocabulario)$/i;
const HEADER_BACK = /^(respuesta|reverso|dorso|back|answer|definition|definici[oó]n|def|descripci[oó]n|significado|traducci[oó]n|meaning|translation)$/i;
const ANKI_HEADER = /^#\s*(separator|html|guid column|notetype column|deck column|tags column|columns|file|notetype|deck|tags)\b/i;
const LIST_MARK = /^\s*(?:[-*•▪◦‣–]\s+|\d{1,3}[.)]\s+)/;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const unescapeCustom = (s: string) => s.replace(/\\t/g, '\t').replace(/\\n/g, '\n');

/** Expresión (global) del separador elegido; null si no hay o hay que adivinar */
function sepRegex(s: ImportSettings, key: SideSepKey, forAuto = false): RegExp | null {
  if (key === 'auto' || key === 'newline') return null;
  if (key === 'custom') {
    const t = unescapeCustom(s.sideCustom);
    return t ? new RegExp(escapeRe(t), 'g') : null;
  }
  const def = SIDE_TOKENS[key];
  return new RegExp(forAuto && def.autoSrc ? def.autoSrc : def.src, 'g');
}

interface Hit {
  index: number;
  length: number;
}

/** Coincidencias del separador que dejan algo a los dos lados (un separador suelto al borde no corta nada) */
function findHits(line: string, re: RegExp): Hit[] {
  const hits: Hit[] = [];
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m[0].length === 0) {
      re.lastIndex++;
      continue;
    }
    if (line.slice(0, m.index).trim() && line.slice(m.index + m[0].length).trim()) hits.push({ index: m.index, length: m[0].length });
  }
  return hits;
}

const hasSplit = (line: string, re: RegExp) => findHits(line, re).length > 0;

/** Parte la línea en todas sus «columnas» según el separador */
function splitAll(line: string, re: RegExp): string[] {
  const parts: string[] = [];
  let last = 0;
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m[0].length === 0) {
      re.lastIndex++;
      continue;
    }
    parts.push(line.slice(last, m.index));
    last = m.index + m[0].length;
  }
  parts.push(line.slice(last));
  return parts;
}

/** Divide en «columnas» respetando comillas dobles (CSV). Devuelve registros con su línea de inicio. */
function tokenizeCsv(text: string, delim: string, firstLine: number): Array<{ cols: string[]; line: number }> {
  const out: Array<{ cols: string[]; line: number }> = [];
  let cols: string[] = [];
  let cur = '';
  let inQ = false;
  let line = firstLine;
  let recLine = firstLine;
  let hadContent = false;
  const flushField = () => {
    cols.push(cur);
    cur = '';
  };
  const flushRecord = () => {
    flushField();
    if (hadContent || cols.some((c) => c.trim())) out.push({ cols, line: recLine });
    cols = [];
    hadContent = false;
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else {
        if (ch === '\n') line++;
        cur += ch;
      }
      continue;
    }
    if (ch === '"' && cur.trim() === '') {
      inQ = true;
      cur = '';
      hadContent = true;
    } else if (text.startsWith(delim, i)) {
      flushField();
      i += delim.length - 1;
      hadContent = true;
    } else if (ch === '\n') {
      flushRecord();
      line++;
      recLine = line;
    } else {
      cur += ch;
      if (ch.trim()) hadContent = true;
    }
  }
  flushRecord();
  return out;
}

const CSV_KEYS = ['tab', 'semi', 'comma'] as const;
const csvDelim = (key: SideSepKey): string => (key === 'tab' ? '\t' : key === 'semi' ? ';' : ',');

/** CSV con comillas: elige el delimitador con el que casi todos los registros tienen 2+ columnas */
function detectQuotedCsv(text: string): 'tab' | 'semi' | 'comma' | null {
  if (!text.includes('"')) return null;
  for (const key of CSV_KEYS) {
    const recs = tokenizeCsv(text, csvDelim(key), 1);
    if (recs.length === 0) continue;
    const ok = recs.filter((r) => r.cols.length >= 2 && r.cols[0].trim() && r.cols[1].trim()).length;
    if (ok >= Math.max(1, Math.ceil(recs.length * 0.85))) return key;
  }
  return null;
}

function detectSideSep(lines: string[]): TokenKey | null {
  const filled = lines.filter((l) => l.trim());
  if (filled.length === 0) return null;
  const need = Math.max(1, Math.ceil(filled.length * 0.6));
  for (const key of AUTO_ORDER) {
    const re = new RegExp(SIDE_TOKENS[key].autoSrc || SIDE_TOKENS[key].src, 'g');
    const n = filled.filter((l) => hasSplit(l, re)).length;
    // la coma aparece mucho en texto normal: solo vale si casi todas las líneas la tienen
    const min = key === 'comma' ? Math.max(1, Math.ceil(filled.length * 0.85)) : need;
    if (n >= min) return key;
  }
  return null;
}

const QA_FRONT = /^(?:P|Q|Pregunta|Question|Front|Anverso)\s*:\s*(.*)$/i;
const QA_BACK = /^(?:R|A|Respuesta|Answer|Back|Reverso)\s*:\s*(.*)$/i;

function parseQa(lines: string[], offset: number): ParsedRow[] {
  const rows: ParsedRow[] = [];
  let front: string[] | null = null;
  let back: string[] | null = null;
  let start = 0;
  const flush = () => {
    if (front && back) {
      const f = front.join('\n').trim();
      const b = back.join('\n').trim();
      if (f && b) rows.push({ front: f, back: b, line: start });
    }
    front = null;
    back = null;
  };
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    const lineNo = i + 1 + offset;
    const fm = line.match(QA_FRONT);
    const bm = line.match(QA_BACK);
    if (fm) {
      flush();
      front = [fm[1]];
      start = lineNo;
    } else if (bm && front) {
      back = [bm[1]];
    } else if (!line.trim()) {
      flush();
    } else if (back) back.push(line);
    else if (front) front.push(line);
  });
  flush();
  return rows;
}

export function parseImport(raw: string, settings: ImportSettings): ImportParseResult {
  const empty: ImportParseResult = {
    rows: [],
    ignored: [],
    detected: { format: 'none', cardSepLabel: '', sideSepLabel: '', sideSep: 'auto', cardSep: 'auto' },
    headerSkipped: false,
    extraColumnRows: 0,
    listStripped: false
  };
  let text = (raw || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!text.trim()) return empty;

  // Cabecera de una exportación de Anki («#separator:tab», «#html:true»…)
  let allLines = text.split('\n');
  let offset = 0;
  let ankiSep: SideSepKey | null = null;
  while (allLines.length && (ANKI_HEADER.test(allLines[0].trim()) || !allLines[0].trim())) {
    const m = allLines[0].match(/#\s*separator\s*:\s*(\w+)/i);
    if (m) ankiSep = ({ tab: 'tab', semicolon: 'semi', comma: 'comma', pipe: 'pipe', space: 'space' } as Record<string, SideSepKey>)[m[1].toLowerCase()] || null;
    allLines = allLines.slice(1);
    offset++;
  }

  // Viñetas y numeración al principio de cada línea
  let listStripped = false;
  if (settings.stripList && settings.sideSep !== 'period') {
    const filledNow = allLines.filter((l) => l.trim());
    if (filledNow.length >= 2 && filledNow.filter((l) => LIST_MARK.test(l)).length >= Math.ceil(filledNow.length * 0.7)) {
      allLines = allLines.map((l) => l.replace(LIST_MARK, ''));
      listStripped = true;
    }
  }
  text = allLines.join('\n');
  if (!text.trim()) return empty;

  const auto = settings.cardSep === 'auto' && settings.sideSep === 'auto';

  // 1) Formato «P: … R: …»
  if (auto && allLines.some((l) => QA_FRONT.test(l.trim())) && allLines.some((l) => QA_BACK.test(l.trim()))) {
    const rows = parseQa(allLines, offset);
    if (rows.length) {
      return {
        ...empty,
        rows: finish(rows, settings).rows,
        headerSkipped: false,
        listStripped,
        detected: { format: 'qa', cardSepLabel: 'bloques separados por una línea en blanco', sideSepLabel: 'etiquetas «Pregunta:» y «Respuesta:»', sideSep: 'auto', cardSep: 'blank' }
      };
    }
  }

  // 2) Cómo se separan las tarjetas
  const filled = allLines.filter((l) => l.trim());
  const sideRe = sepRegex(settings, settings.sideSep);
  let cardSep: Exclude<CardSepMode, 'auto'>;
  if (settings.cardSep !== 'auto') cardSep = settings.cardSep;
  else if (settings.sideSep === 'newline') cardSep = /\n\s*\n/.test(text) ? 'blank' : 'pairs';
  else {
    const hasDashes = /\n\s*-{3,}\s*\n/.test(`\n${text}\n`);
    const autoRes = AUTO_ORDER.filter((k) => k !== 'comma').map((k) => new RegExp(SIDE_TOKENS[k].autoSrc || SIDE_TOKENS[k].src, 'g'));
    const withSep = sideRe ? filled.filter((l) => hasSplit(l, sideRe)).length : filled.filter((l) => autoRes.some((re) => hasSplit(l, re))).length;
    const csvLike = filled.length > 1 && filled.filter((l) => l.includes(',')).length >= filled.length * 0.85;
    if (hasDashes) cardSep = 'dashes';
    else if (settings.sideSep === 'auto' && detectQuotedCsv(text)) cardSep = 'line';
    else if (withSep >= Math.max(1, filled.length * 0.5) || (!sideRe && settings.sideSep === 'auto' && csvLike)) cardSep = 'line';
    else if (/\n\s*\n/.test(text)) cardSep = 'blank';
    else if (settings.sideSep === 'auto' && filled.length >= 2 && filled.length % 2 === 0) cardSep = 'pairs';
    else cardSep = 'line';
  }

  const rows: ParsedRow[] = [];
  const ignored: IgnoredLine[] = [];
  let extraColumnRows = 0;
  let sideKey: SideSepKey = settings.sideSep;
  let format: ImportParseResult['detected']['format'] = 'lines';

  const numbered = allLines.map((l, i) => ({ text: l, line: i + 1 + offset })).filter((x) => x.text.trim());

  if (cardSep === 'pairs' || (cardSep === 'line' && sideKey === 'newline')) {
    // líneas alternas: pregunta, respuesta, pregunta, respuesta…
    format = 'alternate';
    sideKey = 'newline';
    for (let i = 0; i < numbered.length; i += 2) {
      const f = numbered[i].text.trim();
      const b = numbered[i + 1]?.text.trim() || '';
      if (f && b) rows.push({ front: f, back: b, line: numbered[i].line });
      else ignored.push({ line: numbered[i].line, text: f });
    }
  } else if (cardSep === 'line') {
    // la cabecera de Anki puede indicar el separador
    if (sideKey === 'auto' && ankiSep) sideKey = ankiSep;
    if (sideKey === 'auto') sideKey = detectQuotedCsv(text) || detectSideSep(allLines) || 'auto';
    const re = sepRegex(settings, sideKey, sideKey === 'auto');

    if (!re) {
      // sin separador: ¿líneas alternas pregunta / respuesta?
      if (numbered.length >= 2 && numbered.length % 2 === 0 && settings.sideSep === 'auto') {
        format = 'alternate';
        for (let i = 0; i < numbered.length; i += 2) rows.push({ front: numbered[i].text.trim(), back: numbered[i + 1].text.trim(), line: numbered[i].line });
      } else {
        numbered.forEach((x) => ignored.push({ line: x.line, text: x.text.trim() }));
        format = 'none';
      }
    } else {
      const csvMode = (sideKey === 'tab' || sideKey === 'semi' || sideKey === 'comma') && text.includes('"');
      const columnar = sideKey === 'tab' || csvMode;
      if (csvMode) {
        const delim = csvDelim(sideKey);
        for (const rec of tokenizeCsv(text, delim, 1 + offset)) {
          const p = pickFromParts(rec.cols, settings, columnar, delim);
          if (p.f && p.b) {
            rows.push({ front: p.f, back: p.b, line: rec.line });
            if (p.extra) extraColumnRows++;
          } else ignored.push({ line: rec.line, text: rec.cols.join(delim).trim() });
        }
      } else {
        const mode: ExtraMode = settings.extra === 'auto' ? (columnar ? 'cols' : 'join') : settings.extra;
        for (const { text: l, line: lineNo } of numbered) {
          if (mode === 'cols') {
            const parts = splitAll(l, re);
            if (parts.length < 2) {
              ignored.push({ line: lineNo, text: l.trim() });
              continue;
            }
            const p = pickFromParts(parts, settings, true, '');
            if (p.f && p.b) {
              rows.push({ front: p.f, back: p.b, line: lineNo });
              if (p.extra) extraColumnRows++;
            } else ignored.push({ line: lineNo, text: l.trim() });
          } else {
            const hits = findHits(l, re);
            if (!hits.length) {
              ignored.push({ line: lineNo, text: l.trim() });
              continue;
            }
            const h = settings.cut === 'last' ? hits[hits.length - 1] : hits[0];
            rows.push({ front: l.slice(0, h.index).trim(), back: l.slice(h.index + h.length).trim(), line: lineNo });
          }
        }
      }
    }
  } else {
    // tarjetas de varias líneas (separadas por línea en blanco, «---» o texto propio)
    format = 'blocks';
    let blocks: Array<{ text: string; line: number }> = [];
    const pushBlocks = (parts: string[]) => {
      let ln = 1 + offset;
      for (const p of parts) {
        const lead = p.length - p.replace(/^\n+/, '').length;
        blocks.push({ text: p.trim(), line: ln + lead });
        ln += p.split('\n').length - 1;
      }
    };
    if (cardSep === 'blank') {
      let ln = 1 + offset;
      for (const chunk of text.split(/(\n\s*\n+)/)) {
        if (/^\n\s*\n+$/.test(chunk)) ln += chunk.split('\n').length - 1;
        else if (chunk.trim()) {
          blocks.push({ text: chunk.trim(), line: ln + (chunk.length - chunk.replace(/^\n+/, '').length) });
          ln += chunk.split('\n').length - 1;
        }
      }
    } else if (cardSep === 'dashes') pushBlocks(text.split(/\n\s*-{3,}\s*\n/));
    else {
      const sep = unescapeCustom(settings.cardCustom) || ';;;';
      pushBlocks(text.split(sep));
    }
    blocks = blocks.filter((b) => b.text);

    if (sideKey === 'auto') sideKey = detectSideSep(blocks.map((b) => b.text.split('\n')[0])) || 'auto';
    const re = sepRegex(settings, sideKey, sideKey === 'auto');
    for (const b of blocks) {
      let f = '';
      let bk = '';
      const hits = re ? findHits(b.text, re) : [];
      if (hits.length) {
        const h = settings.cut === 'last' ? hits[hits.length - 1] : hits[0];
        f = b.text.slice(0, h.index).trim();
        bk = b.text.slice(h.index + h.length).trim();
      } else {
        const ls = b.text.split('\n').map((x) => x.trim()).filter(Boolean);
        if (ls.length >= 2) {
          f = ls[0];
          bk = ls.slice(1).join('\n');
        }
      }
      if (f && bk) rows.push({ front: f, back: bk, line: b.line });
      else ignored.push({ line: b.line, text: b.text.split('\n')[0] });
    }
    // si ningún bloque usó el separador, la regla es «primera línea = pregunta»
    if (!re || rows.every((r) => !re || !hasSplit(`${r.front}${r.back}`, re))) {
      if (sideKey === 'auto') sideKey = 'auto';
    }
  }

  // 3) Cabecera, intercambio…
  const fin = finish(rows, settings);

  const cardLabels: Record<string, string> = {
    line: 'una tarjeta por línea',
    pairs: 'cada 2 líneas (pregunta, respuesta…)',
    blank: 'tarjetas separadas por una línea en blanco',
    dashes: 'tarjetas separadas por «---»',
    custom: `tarjetas separadas por «${settings.cardCustom}»`
  };
  const sideLabel =
    format === 'alternate'
      ? 'líneas alternas: pregunta, respuesta, pregunta…'
      : sideKey === 'custom'
      ? `«${settings.sideCustom}»`
      : sideKey === 'auto'
      ? format === 'blocks'
        ? 'primera línea = pregunta, el resto = respuesta'
        : 'sin separador claro'
      : sideKey === 'newline'
      ? 'primera línea = pregunta, el resto = respuesta'
      : SIDE_TOKENS[sideKey].label;

  return {
    rows: fin.rows,
    ignored,
    headerSkipped: fin.headerSkipped,
    extraColumnRows,
    listStripped,
    detected: {
      format: fin.rows.length === 0 ? 'none' : format,
      cardSepLabel: format === 'alternate' ? '' : cardLabels[cardSep],
      sideSepLabel: sideLabel,
      sideSep: sideKey,
      cardSep
    }
  };
}

/** Elige pregunta y respuesta entre las columnas ya separadas */
function pickFromParts(cols: string[], s: ImportSettings, columnar: boolean, joiner: string): { f: string; b: string; extra: boolean } {
  const mode: ExtraMode = s.extra === 'auto' ? (columnar ? 'cols' : 'join') : s.extra;
  if (mode === 'cols') {
    const cf = Math.max(1, Math.floor(s.colFront) || 1);
    const cb = Math.max(1, Math.floor(s.colBack) || 2);
    const used = Math.max(cf, cb);
    return {
      f: (cols[cf - 1] || '').trim(),
      b: (cols[cb - 1] || '').trim(),
      extra: cols.length > used && cols.slice(used).some((c) => c.trim())
    };
  }
  const last = s.cut === 'last';
  const f = last ? cols.slice(0, -1).join(joiner) : cols[0] || '';
  const b = last ? cols[cols.length - 1] || '' : cols.slice(1).join(joiner);
  return { f: f.trim(), b: b.trim(), extra: false };
}

/** Quita la fila de títulos, intercambia caras y descarta filas vacías */
function finish(rows: ParsedRow[], s: ImportSettings): { rows: ParsedRow[]; headerSkipped: boolean } {
  let out = rows.slice();
  let headerSkipped = false;
  if (out.length && (s.headerMode === 'skip' || (s.headerMode === 'auto' && out.length > 1 && HEADER_FRONT.test(out[0].front) && HEADER_BACK.test(out[0].back)))) {
    out.shift();
    headerSkipped = true;
  }
  if (s.swap) out = out.map((r) => ({ ...r, front: r.back, back: r.front }));
  return { rows: out, headerSkipped };
}

/* ------------------------------ ejemplos ------------------------------ */

export const EXAMPLE_PAIRS: Array<[string, string]> = [
  ['¿Qué es el principio de Arquímedes?', 'Todo cuerpo sumergido recibe un empuje igual al peso del fluido que desaloja: $$F_E = \\rho \\cdot g \\cdot V$$'],
  ['Identidad de Euler', '$$e^{i\\pi} + 1 = 0$$ une las 5 constantes fundamentales'],
  ['Función de la mitocondria', 'Produce ATP en la respiración celular'],
  ['Ley de Ohm', '$$V = I \\cdot R$$'],
  ['Capital de Australia', 'Canberra']
];

/** Texto de ejemplo con el separador elegido, para entender el formato de un vistazo */
export function buildExample(side: TokenKey | 'blocks'): string {
  if (side === 'blocks') return EXAMPLE_PAIRS.map(([f, b]) => `${f}\n${b}`).join('\n\n');
  const tok = SIDE_TOKENS[side].sample;
  return EXAMPLE_PAIRS.map(([f, b]) => `${f}${tok}${b}`).join('\n');
}

/** Convierte filas de una tabla (Excel, Word, HTML…) en texto de columnas separadas por Tab, con comillas si hace falta */
export function rowsToTsv(rows: string[][]): string {
  const q = (v: string) => (/[\t\n\r"]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return rows
    .map((r) => {
      let end = r.length;
      while (end > 0 && !String(r[end - 1] ?? '').trim()) end--;
      return r.slice(0, end).map((c) => q(String(c ?? '').replace(/\r\n?/g, '\n'))).join('\t');
    })
    .filter((l) => l.trim())
    .join('\n');
}
