/**
 * Lector inteligente de tarjetas para importar.
 * Detecta solo cómo están separadas las tarjetas y sus dos caras, entiende CSV con comillas,
 * exportaciones de Anki (texto con tabuladores) y bloques «P:/R:», y explica qué hizo y qué ignoró.
 */

export type CardSepMode = 'auto' | 'line' | 'blank' | 'dashes' | 'custom';
export type SideSepKey = 'auto' | 'tab' | 'semi' | 'comma' | 'pipe' | 'colons' | 'dash' | 'colon' | 'custom';

export interface ImportSettings {
  cardSep: CardSepMode;
  cardCustom: string;
  sideSep: SideSepKey;
  sideCustom: string;
  /** Si la primera fila parece un título («Pregunta;Respuesta») se omite */
  skipHeader: boolean;
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
  detected: { format: 'qa' | 'lines' | 'blocks' | 'alternate' | 'none'; cardSepLabel: string; sideSepLabel: string; sideSep: SideSepKey; cardSep: CardSepMode };
  headerSkipped: boolean;
  /** Filas con más de 2 columnas (solo se usan las 2 primeras) */
  extraColumnRows: number;
}

export const DEFAULT_SETTINGS: ImportSettings = { cardSep: 'auto', cardCustom: '', sideSep: 'auto', sideCustom: '', skipHeader: true };

export const SIDE_TOKENS: Record<Exclude<SideSepKey, 'auto' | 'custom'>, { token: string; label: string; short: string }> = {
  tab: { token: '\t', label: 'tabulación (Tab)', short: 'Tab' },
  semi: { token: ';', label: 'punto y coma ( ; )', short: ';' },
  comma: { token: ',', label: 'coma ( , )', short: ',' },
  pipe: { token: '|', label: 'barra vertical ( | )', short: '|' },
  colons: { token: ':::', label: 'tres dos puntos ( ::: )', short: ':::' },
  dash: { token: ' - ', label: 'guion con espacios ( - )', short: ' - ' },
  colon: { token: ' : ', label: 'dos puntos con espacios ( : )', short: ' : ' }
};

const AUTO_ORDER: Array<Exclude<SideSepKey, 'auto' | 'custom'>> = ['tab', 'colons', 'semi', 'pipe', 'dash', 'colon', 'comma'];

const HEADER_FRONT = /^(pregunta|anverso|frente|front|question|term|t[eé]rmino|palabra|concepto|word)$/i;
const HEADER_BACK = /^(respuesta|reverso|dorso|back|answer|definition|definici[oó]n|significado|traducci[oó]n|meaning)$/i;
const ANKI_HEADER = /^#\s*(separator|html|guid column|notetype column|deck column|tags column|columns|file|notetype|deck|tags)\b/i;

const sideToken = (s: ImportSettings, key: SideSepKey): string => {
  if (key === 'custom') return s.sideCustom;
  if (key === 'auto') return '';
  return SIDE_TOKENS[key].token;
};

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

/** CSV con comillas: elige el delimitador con el que casi todos los registros tienen 2+ columnas */
function detectQuotedCsv(text: string): 'tab' | 'semi' | 'comma' | null {
  if (!text.includes('"')) return null;
  for (const key of ['tab', 'semi', 'comma'] as const) {
    const recs = tokenizeCsv(text, SIDE_TOKENS[key].token, 1);
    if (recs.length === 0) continue;
    const ok = recs.filter((r) => r.cols.length >= 2 && r.cols[0].trim() && r.cols[1].trim()).length;
    if (ok >= Math.max(1, Math.ceil(recs.length * 0.85))) return key;
  }
  return null;
}

function detectSideSep(lines: string[]): Exclude<SideSepKey, 'auto' | 'custom'> | null {
  const filled = lines.filter((l) => l.trim());
  if (filled.length === 0) return null;
  const need = Math.max(1, Math.ceil(filled.length * 0.6));
  for (const key of AUTO_ORDER) {
    const tok = SIDE_TOKENS[key].token;
    const n = filled.filter((l) => l.includes(tok)).length;
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
    extraColumnRows: 0
  };
  let text = (raw || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!text.trim()) return empty;

  // Cabecera de una exportación de Anki («#separator:tab», «#html:true»…)
  let allLines = text.split('\n');
  let offset = 0;
  let ankiSep: SideSepKey | null = null;
  while (allLines.length && (ANKI_HEADER.test(allLines[0].trim()) || !allLines[0].trim())) {
    const m = allLines[0].match(/#\s*separator\s*:\s*(\w+)/i);
    if (m) ankiSep = ({ tab: 'tab', semicolon: 'semi', comma: 'comma', pipe: 'pipe' } as Record<string, SideSepKey>)[m[1].toLowerCase()] || null;
    allLines = allLines.slice(1);
    offset++;
  }
  text = allLines.join('\n');
  if (!text.trim()) return empty;

  const auto = settings.cardSep === 'auto' && settings.sideSep === 'auto';

  // 1) Formato «P: … R: …»
  if (auto && allLines.some((l) => QA_FRONT.test(l.trim())) && allLines.some((l) => QA_BACK.test(l.trim()))) {
    const rows = parseQa(allLines, offset);
    if (rows.length) {
      return { ...empty, rows, detected: { format: 'qa', cardSepLabel: 'bloques separados por una línea en blanco', sideSepLabel: 'etiquetas «Pregunta:» y «Respuesta:»', sideSep: 'auto', cardSep: 'blank' } };
    }
  }

  // 2) Cómo se separan las tarjetas
  const filled = allLines.filter((l) => l.trim());
  let cardSep: Exclude<CardSepMode, 'auto'>;
  if (settings.cardSep !== 'auto') cardSep = settings.cardSep;
  else {
    const hasDashes = /\n\s*-{3,}\s*\n/.test(`\n${text}\n`);
    const lineSep = settings.sideSep !== 'auto' ? sideToken(settings, settings.sideSep) : '';
    const withSep = lineSep
      ? filled.filter((l) => l.includes(lineSep)).length
      : filled.filter((l) => AUTO_ORDER.some((k) => k !== 'comma' && l.includes(SIDE_TOKENS[k].token))).length;
    const csvLike = filled.length > 1 && filled.filter((l) => l.includes(',')).length >= filled.length * 0.85;
    if (hasDashes) cardSep = 'dashes';
    else if (settings.sideSep === 'auto' && detectQuotedCsv(text)) cardSep = 'line';
    else if (withSep >= Math.max(1, filled.length * 0.5) || (!lineSep && csvLike)) cardSep = 'line';
    else if (/\n\s*\n/.test(text)) cardSep = 'blank';
    else cardSep = 'line';
  }

  const rows: ParsedRow[] = [];
  const ignored: IgnoredLine[] = [];
  let extraColumnRows = 0;
  let sideKey: SideSepKey = settings.sideSep;
  let format: ImportParseResult['detected']['format'] = 'lines';

  if (cardSep === 'line') {
    // la cabecera de Anki puede indicar el separador
    if (sideKey === 'auto' && ankiSep) sideKey = ankiSep;
    if (sideKey === 'auto') sideKey = detectQuotedCsv(text) || detectSideSep(allLines) || 'auto';
    const tok = sideToken(settings, sideKey);

    if (!tok) {
      // sin separador: ¿líneas alternas pregunta / respuesta?
      if (filled.length >= 2 && filled.length % 2 === 0 && settings.sideSep === 'auto') {
        for (let i = 0; i < filled.length; i += 2) {
          const idx = allLines.indexOf(filled[i]);
          rows.push({ front: filled[i].trim(), back: filled[i + 1].trim(), line: idx + 1 + offset });
        }
        format = 'alternate';
      } else {
        allLines.forEach((l, i) => l.trim() && ignored.push({ line: i + 1 + offset, text: l.trim() }));
        format = 'none';
      }
    } else {
      const csvMode = (sideKey === 'tab' || sideKey === 'semi' || sideKey === 'comma') && text.includes('"');
      if (csvMode) {
        for (const rec of tokenizeCsv(text, tok, 1 + offset)) {
          const f = (rec.cols[0] || '').trim();
          const b = (rec.cols[1] || '').trim();
          if (f && b) {
            rows.push({ front: f, back: b, line: rec.line });
            if (rec.cols.length > 2 && rec.cols.slice(2).some((c) => c.trim())) extraColumnRows++;
          } else ignored.push({ line: rec.line, text: rec.cols.join(tok).trim() });
        }
      } else {
        allLines.forEach((l, i) => {
          const lineNo = i + 1 + offset;
          if (!l.trim()) return;
          const at = l.indexOf(tok);
          if (at < 0) return ignored.push({ line: lineNo, text: l.trim() });
          let f: string;
          let b: string;
          if (sideKey === 'tab') {
            const cols = l.split('\t');
            f = cols[0].trim();
            b = (cols[1] || '').trim();
            if (cols.length > 2 && cols.slice(2).some((c) => c.trim())) extraColumnRows++;
          } else {
            f = l.slice(0, at).trim();
            b = l.slice(at + tok.length).trim();
          }
          if (f && b) rows.push({ front: f, back: b, line: lineNo });
          else ignored.push({ line: lineNo, text: l.trim() });
        });
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
      const sep = settings.cardCustom || ';;;';
      pushBlocks(text.split(sep));
    }
    blocks = blocks.filter((b) => b.text);

    if (sideKey === 'auto') sideKey = detectSideSep(blocks.map((b) => b.text.split('\n')[0])) || 'auto';
    const tok = sideToken(settings, sideKey);
    for (const b of blocks) {
      const at = tok ? b.text.indexOf(tok) : -1;
      let f = '';
      let bk = '';
      if (tok && at >= 0) {
        f = b.text.slice(0, at).trim();
        bk = b.text.slice(at + tok.length).trim();
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
    if (!tok || rows.every((r) => !tok || !r.front.includes(tok))) {
      // si ningún bloque usó separador, la regla es «primera línea = pregunta»
      if (!tok || sideKey === 'auto') sideKey = 'auto';
    }
  }

  // 3) ¿La primera fila es un título?
  let headerSkipped = false;
  if (settings.skipHeader && rows.length > 1 && HEADER_FRONT.test(rows[0].front) && HEADER_BACK.test(rows[0].back)) {
    rows.shift();
    headerSkipped = true;
  }

  const cardLabels: Record<string, string> = {
    line: 'una tarjeta por línea',
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
      : SIDE_TOKENS[sideKey].label;

  return {
    rows,
    ignored,
    headerSkipped,
    extraColumnRows,
    detected: { format: rows.length === 0 ? 'none' : format, cardSepLabel: format === 'alternate' ? '' : cardLabels[cardSep], sideSepLabel: sideLabel, sideSep: sideKey, cardSep }
  };
}

/** Texto de ejemplo con el separador elegido, para entender el formato de un vistazo */
export const EXAMPLE_PAIRS: Array<[string, string]> = [
  ['¿Qué es el principio de Arquímedes?', 'Todo cuerpo sumergido recibe un empuje igual al peso del fluido que desaloja: $$F_E = \\rho \\cdot g \\cdot V$$'],
  ['Identidad de Euler', '$$e^{i\\pi} + 1 = 0$$ une las 5 constantes fundamentales'],
  ['Función de la mitocondria', 'Produce ATP en la respiración celular'],
  ['Ley de Ohm', '$$V = I \\cdot R$$'],
  ['Capital de Australia', 'Canberra']
];

export function buildExample(side: Exclude<SideSepKey, 'auto' | 'custom'> | 'blocks'): string {
  if (side === 'blocks') return EXAMPLE_PAIRS.map(([f, b]) => `${f}\n${b}`).join('\n\n');
  const tok = SIDE_TOKENS[side].token;
  return EXAMPLE_PAIRS.map(([f, b]) => `${f}${tok}${b}`).join('\n');
}
