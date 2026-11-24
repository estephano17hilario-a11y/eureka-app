/**
 * Lectura de archivos para importar tarjetas.
 *
 * Convierte casi cualquier archivo en TEXTO que entiende `parseImport`:
 *  · texto plano: .txt .csv .tsv .md .rtf (con detección de codificación UTF-8 / Windows-1252 / UTF-16)
 *  · hojas de cálculo: .xlsx .xlsm .ods (cada hoja por separado)
 *  · documentos: .docx .odt (párrafos y tablas) · presentaciones: .pptx .odp
 *  · .pdf (con texto seleccionable) · .html/.htm (tablas, listas de definiciones o texto) · .json
 *  · paquetes de Anki: .apkg / .colpkg
 * Todo se hace en el dispositivo; las librerías pesadas (zip, pdf) se cargan solo cuando hacen falta.
 */
import type JSZip from 'jszip';
import { rowsToTsv, type ImportSettings } from './import-parser';

export interface ImportSheet {
  name: string;
  text: string;
  rows: number;
}

export interface ExtractedFile {
  name: string;
  kind: string;
  text: string;
  /** Texto corto que describe de dónde salió («Hoja Vocabulario · 120 filas») */
  note: string;
  /** Ajustes recomendados (por ejemplo, Tab y una tarjeta por línea si venía de una tabla) */
  suggest: Partial<ImportSettings>;
  /** Si el archivo tiene varias hojas, una entrada por hoja (text es la primera con datos) */
  sheets: ImportSheet[];
  warnings: string[];
}

export class FileImportError extends Error {
  hint: string;
  constructor(message: string, hint = '') {
    super(message);
    this.hint = hint;
  }
}

export const FORMAT_CHIPS = ['TXT', 'CSV', 'TSV', 'XLSX', 'ODS', 'DOCX', 'ODT', 'PPTX', 'PDF', 'HTML', 'JSON', 'MD', 'RTF', 'APKG'];
export const MAX_FILE_BYTES = 40 * 1024 * 1024;
const MAX_TEXT_CHARS = 3_000_000;

/* ------------------------------ utilidades ------------------------------ */

const ext = (name: string) => (name.match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();

function decodeText(buf: ArrayBuffer): string {
  const u8 = new Uint8Array(buf);
  if (u8[0] === 0xff && u8[1] === 0xfe) return new TextDecoder('utf-16le').decode(u8.subarray(2));
  if (u8[0] === 0xfe && u8[1] === 0xff) return new TextDecoder('utf-16be').decode(u8.subarray(2));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(u8);
  } catch {
    // UTF-16 sin BOM: muchos bytes en cero alternados
    let zeros = 0;
    const n = Math.min(u8.length, 400);
    for (let i = 1; i < n; i += 2) if (u8[i] === 0) zeros++;
    if (n > 8 && zeros > n / 4) return new TextDecoder('utf-16le').decode(u8);
    // CSV de Excel en español: Windows-1252 (acentos y ñ)
    return new TextDecoder('windows-1252').decode(u8);
  }
}

const looksBinary = (u8: Uint8Array) => {
  const n = Math.min(u8.length, 4096);
  let bad = 0;
  for (let i = 0; i < n; i++) if (u8[i] === 0 || (u8[i] < 7 && u8[i] !== 0)) bad++;
  return bad > n * 0.02;
};

function parseXml(xml: string): Document {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new FileImportError('El archivo está dañado o no es válido.');
  return doc;
}

const elsNS = (root: Element | Document, name: string): Element[] => Array.from(root.getElementsByTagNameNS('*', name));
const childEls = (el: Element, name?: string): Element[] => Array.from(el.children).filter((c) => !name || c.localName === name);

function cleanText(t: string): string {
  return t.replace(/\r\n?/g, '\n').replace(/[​‌‍﻿]/g, '').replace(/ /g, ' ');
}

/** Texto visible de un nodo HTML respetando saltos de línea de <br>, <p>, <li>, <tr>… */
function htmlNodeText(root: Node): string {
  const BLOCK = new Set(['p', 'div', 'li', 'tr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'article', 'ul', 'ol', 'table', 'blockquote', 'pre', 'dt', 'dd']);
  let out = '';
  const walk = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) {
      out += (n.nodeValue || '').replace(/\s+/g, ' ');
      return;
    }
    if (n.nodeType !== Node.ELEMENT_NODE) return;
    const el = n as Element;
    const tag = el.localName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'head' || tag === 'noscript') return;
    if (tag === 'br') {
      out += '\n';
      return;
    }
    if (tag === 'img') return;
    const block = BLOCK.has(tag);
    if (block && out && !out.endsWith('\n')) out += '\n';
    el.childNodes.forEach(walk);
    if (block && !out.endsWith('\n')) out += '\n';
  };
  walk(root);
  return out
    .split('\n')
    .map((l) => l.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const baseResult = (name: string, kind: string): ExtractedFile => ({ name, kind, text: '', note: '', suggest: {}, sheets: [], warnings: [] });

const TABLE_SUGGEST: Partial<ImportSettings> = { sideSep: 'tab', cardSep: 'line', headerMode: 'auto', extra: 'auto' };

function fromTable(res: ExtractedFile, rows: string[][], note: string): ExtractedFile {
  res.text = rowsToTsv(rows);
  res.suggest = { ...TABLE_SUGGEST };
  res.note = note;
  return res;
}

/* ------------------------------ texto plano ------------------------------ */

function mdTablesToTsv(text: string): string {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const isSep = (l: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l) && l.includes('-');
  return lines
    .filter((l) => !(l.trim().startsWith('|') && isSep(l)))
    .map((l) => {
      const t = l.trim();
      if (t.startsWith('|') && t.endsWith('|') && t.length > 2) return t.slice(1, -1).split('|').map((c) => c.trim().replace(/\t/g, ' ')).join('\t');
      return l;
    })
    .join('\n');
}

function rtfToText(rtf: string): string {
  let s = rtf.replace(/\r\n?/g, '\n');
  s = s.replace(/\{\\\*[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, '');
  s = s.replace(/\{\\(?:fonttbl|colortbl|stylesheet|info|pict|header|footer)[^]*?\n?\}/g, '');
  s = s.replace(/\\'([0-9a-f]{2})/gi, (_m, h: string) => new TextDecoder('windows-1252').decode(new Uint8Array([parseInt(h, 16)])));
  s = s.replace(/\\u(-?\d+)\??/g, (_m, n: string) => String.fromCharCode(parseInt(n, 10) < 0 ? parseInt(n, 10) + 65536 : parseInt(n, 10)));
  s = s.replace(/\\(?:par|line)\b ?/g, '\n').replace(/\\tab\b ?/g, '\t');
  s = s.replace(/\\[a-z]+-?\d* ?/gi, '').replace(/\\([\\{}])/g, '$1').replace(/[{}]/g, '');
  return s.trim();
}

const FRONT_KEYS = ['front', 'question', 'pregunta', 'term', 'termino', 'término', 'anverso', 'frente', 'q', 'word', 'palabra', 'concept', 'concepto', 'prompt', 'title', 'titulo', 'título', 'key', 'clave'];
const BACK_KEYS = ['back', 'answer', 'respuesta', 'definition', 'definicion', 'definición', 'reverso', 'dorso', 'a', 'meaning', 'significado', 'translation', 'traduccion', 'traducción', 'description', 'descripcion', 'descripción', 'value', 'valor', 'content', 'contenido'];

function jsonToRows(data: unknown): string[][] {
  const str = (v: unknown): string => (v == null ? '' : typeof v === 'string' ? v : typeof v === 'number' || typeof v === 'boolean' ? String(v) : Array.isArray(v) ? v.map(str).join(', ') : JSON.stringify(v));
  const findArray = (v: unknown, depth: number): unknown[] | null => {
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object' && depth < 3) {
      const o = v as Record<string, unknown>;
      for (const k of ['cards', 'flashcards', 'tarjetas', 'items', 'notes', 'data', 'terms', 'entries', 'list', 'deck', 'rows']) {
        const f = o[k] !== undefined ? findArray(o[k], depth + 1) : null;
        if (f) return f;
      }
      for (const k of Object.keys(o)) {
        const f = findArray(o[k], depth + 1);
        if (f && f.length) return f;
      }
    }
    return null;
  };
  const arr = findArray(data, 0);
  if (arr) {
    const rows: string[][] = [];
    for (const it of arr) {
      if (Array.isArray(it)) rows.push(it.map(str));
      else if (it && typeof it === 'object') {
        const o = it as Record<string, unknown>;
        const keys = Object.keys(o);
        const lower = new Map(keys.map((k) => [k.toLowerCase(), k]));
        const fk = FRONT_KEYS.map((k) => lower.get(k)).find(Boolean);
        const bk = BACK_KEYS.map((k) => lower.get(k)).find((k) => k && k !== fk);
        if (fk && bk) rows.push([str(o[fk]), str(o[bk])]);
        else {
          const vals = keys.filter((k) => typeof o[k] === 'string' || typeof o[k] === 'number');
          if (vals.length >= 2) rows.push([str(o[vals[0]]), str(o[vals[1]])]);
        }
      }
    }
    return rows;
  }
  if (data && typeof data === 'object') return Object.entries(data as Record<string, unknown>).map(([k, v]) => [k, str(v)]);
  return [];
}

function extractHtml(name: string, html: string): ExtractedFile {
  const res = baseResult(name, 'Página web');
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style').forEach((e) => e.remove());
  const tables = Array.from(doc.querySelectorAll('table'));
  if (tables.length) {
    const rows: string[][] = [];
    tables.forEach((t) => t.querySelectorAll('tr').forEach((tr) => rows.push(Array.from(tr.children).filter((c) => /^(td|th)$/i.test(c.localName)).map((c) => htmlNodeText(c)))));
    return fromTable(res, rows, `${tables.length === 1 ? 'Tabla' : `${tables.length} tablas`} · ${rows.length} filas`);
  }
  const dts = Array.from(doc.querySelectorAll('dt'));
  if (dts.length) {
    const rows: string[][] = [];
    dts.forEach((dt) => {
      const dd = dt.nextElementSibling;
      if (dd && dd.localName === 'dd') rows.push([htmlNodeText(dt), htmlNodeText(dd)]);
    });
    if (rows.length) return fromTable(res, rows, `Lista de definiciones · ${rows.length} filas`);
  }
  res.text = htmlNodeText(doc.body || doc.documentElement);
  res.note = 'Texto de la página';
  return res;
}

async function extractPlain(name: string, e: string, buf: ArrayBuffer): Promise<ExtractedFile> {
  const raw = decodeText(buf);
  const res = baseResult(name, e ? e.toUpperCase() : 'Texto');
  if (e === 'json') {
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new FileImportError('El archivo JSON no es válido.', 'Revisa que no falte ninguna coma, llave o comilla.');
    }
    const rows = jsonToRows(data);
    if (!rows.length) throw new FileImportError('No encontramos tarjetas en el JSON.', 'Funciona con listas de {pregunta, respuesta}, {front, back}, {term, definition} o pares [a, b].');
    res.kind = 'JSON';
    const out = fromTable(res, rows, `${rows.length} elementos`);
    out.suggest = { ...TABLE_SUGGEST, headerMode: 'keep' };
    return out;
  }
  if (e === 'html' || e === 'htm' || e === 'xhtml') return extractHtml(name, raw);
  if (e === 'rtf' || raw.startsWith('{\\rtf')) {
    res.kind = 'RTF';
    res.text = rtfToText(raw);
    return res;
  }
  if (e === 'md' || e === 'markdown') {
    res.kind = 'Markdown';
    res.text = mdTablesToTsv(raw);
    return res;
  }
  if (e === 'tsv' || e === 'tab') res.suggest = { sideSep: 'tab' };
  res.text = raw;
  return res;
}

/* ------------------------------ hojas de cálculo ------------------------------ */

const colIndex = (ref: string): number => {
  const m = ref.match(/^([A-Z]+)/i);
  if (!m) return 0;
  let n = 0;
  for (const ch of m[1].toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
};

type Zip = JSZip;

async function zipText(zip: Zip, path: string): Promise<string | null> {
  const f = zip.file(path);
  return f ? f.async('string') : null;
}

async function extractXlsx(name: string, zip: Zip): Promise<ExtractedFile> {
  const res = baseResult(name, 'Excel');
  const shared: string[] = [];
  const ss = await zipText(zip, 'xl/sharedStrings.xml');
  if (ss) {
    for (const si of elsNS(parseXml(ss), 'si')) {
      // texto de la celda sin la ayuda fonética (rPh)
      const parts: string[] = [];
      const walk = (n: Element) => {
        for (const c of Array.from(n.children)) {
          if (c.localName === 'rPh') continue;
          if (c.localName === 't') parts.push(c.textContent || '');
          else walk(c);
        }
      };
      walk(si);
      shared.push(parts.join(''));
    }
  }

  // nombres de las hojas y su archivo
  const wb = await zipText(zip, 'xl/workbook.xml');
  const rels = await zipText(zip, 'xl/_rels/workbook.xml.rels');
  const relMap = new Map<string, string>();
  if (rels) elsNS(parseXml(rels), 'Relationship').forEach((r) => relMap.set(r.getAttribute('Id') || '', (r.getAttribute('Target') || '').replace(/^\/?(xl\/)?/, '')));
  const sheetDefs: Array<{ name: string; path: string }> = [];
  if (wb) {
    for (const s of elsNS(parseXml(wb), 'sheet')) {
      if (/hidden/i.test(s.getAttribute('state') || '')) continue;
      const rid = s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || s.getAttribute('r:id') || '';
      const target = relMap.get(rid);
      if (target) sheetDefs.push({ name: s.getAttribute('name') || `Hoja ${sheetDefs.length + 1}`, path: `xl/${target}` });
    }
  }
  if (!sheetDefs.length) {
    Object.keys(zip.files)
      .filter((p) => /^xl\/worksheets\/sheet\d+\.xml$/.test(p))
      .sort((a, b) => parseInt(a.replace(/\D/g, ''), 10) - parseInt(b.replace(/\D/g, ''), 10))
      .forEach((p, i) => sheetDefs.push({ name: `Hoja ${i + 1}`, path: p }));
  }

  for (const def of sheetDefs) {
    const xml = await zipText(zip, def.path);
    if (!xml) continue;
    const grid: string[][] = [];
    let auto = -1;
    for (const row of elsNS(parseXml(xml), 'row')) {
      const rIdx = row.hasAttribute('r') ? parseInt(row.getAttribute('r') || '0', 10) - 1 : ++auto;
      auto = rIdx;
      const cells: string[] = [];
      let autoCol = -1;
      for (const c of childEls(row, 'c')) {
        const idx = c.hasAttribute('r') ? colIndex(c.getAttribute('r') || '') : ++autoCol;
        autoCol = idx;
        const t = c.getAttribute('t');
        const v = childEls(c, 'v')[0]?.textContent ?? '';
        let val = '';
        if (t === 's') val = shared[parseInt(v, 10)] ?? '';
        else if (t === 'inlineStr') val = elsNS(c, 't').map((x) => x.textContent || '').join('');
        else if (t === 'b') val = v === '1' ? 'VERDADERO' : 'FALSO';
        else val = v;
        cells[idx] = val;
      }
      grid[rIdx] = Array.from(cells, (x) => x ?? '');
    }
    const rows = Array.from(grid, (r) => r || []);
    const text = rowsToTsv(rows);
    const count = text ? text.split('\n').length : 0;
    res.sheets.push({ name: def.name, text, rows: count });
  }
  return finishSheets(res);
}

function odfCellText(cell: Element): string {
  const out: string[] = [''];
  const walk = (n: Node, paras: string[]) => {
    n.childNodes.forEach((c) => {
      if (c.nodeType === Node.TEXT_NODE) paras[paras.length - 1] += c.nodeValue || '';
      else if (c.nodeType === Node.ELEMENT_NODE) {
        const e = c as Element;
        if (e.localName === 's') paras[paras.length - 1] += ' '.repeat(parseInt(e.getAttribute('text:c') || '1', 10) || 1);
        else if (e.localName === 'tab') paras[paras.length - 1] += '\t';
        else if (e.localName === 'line-break') paras.push('');
        else if (e.localName === 'p' || e.localName === 'h') {
          paras.push('');
          walk(e, paras);
        } else walk(e, paras);
      }
    });
  };
  walk(cell, out);
  return out.join('\n').replace(/^\n+|\n+$/g, '');
}

async function extractOds(name: string, zip: Zip): Promise<ExtractedFile> {
  const res = baseResult(name, 'Hoja de cálculo (ODS)');
  const xml = await zipText(zip, 'content.xml');
  if (!xml) throw new FileImportError('No se pudo leer la hoja de cálculo.');
  for (const t of elsNS(parseXml(xml), 'table')) {
    if (t.parentElement && t.parentElement.localName !== 'spreadsheet') continue;
    const rows: string[][] = [];
    for (const tr of childEls(t).filter((c) => c.localName === 'table-row' || c.localName === 'table-header-rows').flatMap((c) => (c.localName === 'table-header-rows' ? childEls(c, 'table-row') : [c]))) {
      const cells: string[] = [];
      for (const td of childEls(tr).filter((c) => c.localName === 'table-cell' || c.localName === 'covered-table-cell')) {
        const rep = Math.min(parseInt(td.getAttribute('table:number-columns-repeated') || '1', 10) || 1, 50);
        const txt = td.localName === 'covered-table-cell' ? '' : odfCellText(td);
        const n = txt ? rep : 1;
        for (let i = 0; i < n; i++) cells.push(txt);
      }
      const rr = Math.min(parseInt(tr.getAttribute('table:number-rows-repeated') || '1', 10) || 1, 50);
      const filled = cells.some((c) => c.trim());
      for (let i = 0; i < (filled ? rr : 1); i++) rows.push(cells);
    }
    const text = rowsToTsv(rows);
    res.sheets.push({ name: t.getAttribute('table:name') || `Hoja ${res.sheets.length + 1}`, text, rows: text ? text.split('\n').length : 0 });
  }
  return finishSheets(res);
}

function finishSheets(res: ExtractedFile): ExtractedFile {
  const withData = res.sheets.filter((s) => s.rows > 0);
  if (!withData.length) throw new FileImportError('La hoja de cálculo está vacía.');
  res.sheets = withData;
  res.text = withData[0].text;
  res.suggest = { ...TABLE_SUGGEST };
  res.note = withData.length > 1 ? `${withData.length} hojas · «${withData[0].name}»` : `Hoja «${withData[0].name}» · ${withData[0].rows} filas`;
  return res;
}

/* ------------------------------ Word / OpenDocument / PowerPoint ------------------------------ */

/** Texto de un párrafo de Word (w:p) */
function wordParagraph(p: Element): string {
  let out = '';
  const walk = (n: Element) => {
    for (const c of Array.from(n.children)) {
      const l = c.localName;
      if (l === 't') out += c.textContent || '';
      else if (l === 'tab') out += '\t';
      else if (l === 'br' || l === 'cr') out += '\n';
      else if (l === 'noBreakHyphen') out += '-';
      else if (l === 'del' || l === 'delText' || l === 'instrText' || l === 'pPr' || l === 'rPr') continue;
      else walk(c);
    }
  };
  walk(p);
  return out;
}

function walkWord(body: Element, lines: string[], tableRows: { n: number }) {
  for (const c of Array.from(body.children)) {
    if (c.localName === 'p') lines.push(wordParagraph(c));
    else if (c.localName === 'tbl') {
      const rows: string[][] = [];
      for (const tr of childEls(c, 'tr')) {
        rows.push(
          childEls(tr, 'tc').map((tc) =>
            childEls(tc)
              .filter((x) => x.localName === 'p')
              .map(wordParagraph)
              .join('\n')
              .trim()
          )
        );
      }
      const t = rowsToTsv(rows);
      if (t) {
        tableRows.n += t.split('\n').length;
        lines.push(t);
      }
    } else if (c.localName === 'sdt' || c.localName === 'sdtContent' || c.localName === 'ins' || c.localName === 'customXml') walkWord(c, lines, tableRows);
  }
}

async function extractDocx(name: string, zip: Zip): Promise<ExtractedFile> {
  const res = baseResult(name, 'Word');
  const xml = await zipText(zip, 'word/document.xml');
  if (!xml) throw new FileImportError('No se pudo leer el documento de Word.');
  const body = elsNS(parseXml(xml), 'body')[0];
  if (!body) throw new FileImportError('El documento de Word está vacío.');
  const lines: string[] = [];
  const tableRows = { n: 0 };
  walkWord(body, lines, tableRows);
  res.text = lines.map(cleanText).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  const total = res.text.split('\n').filter((l) => l.trim()).length;
  if (tableRows.n && tableRows.n >= total * 0.8) {
    res.suggest = { ...TABLE_SUGGEST };
    res.note = `Tabla · ${tableRows.n} filas`;
  } else res.note = `${total} líneas`;
  return res;
}

function walkOdf(el: Element, lines: string[], tableRows: { n: number }) {
  for (const c of Array.from(el.children)) {
    const l = c.localName;
    if (l === 'p' || l === 'h') lines.push(odfCellText(c));
    else if (l === 'table') {
      const rows: string[][] = [];
      for (const tr of elsNS(c, 'table-row')) rows.push(childEls(tr).filter((x) => x.localName === 'table-cell').map(odfCellText));
      const t = rowsToTsv(rows);
      if (t) {
        tableRows.n += t.split('\n').length;
        lines.push(t);
      }
    } else if (l === 'page') {
      if (lines.length && lines[lines.length - 1] !== '') lines.push('');
      walkOdf(c, lines, tableRows);
    } else walkOdf(c, lines, tableRows);
  }
}

async function extractOdt(name: string, zip: Zip, presentation: boolean): Promise<ExtractedFile> {
  const res = baseResult(name, presentation ? 'Presentación (ODP)' : 'Documento (ODT)');
  const xml = await zipText(zip, 'content.xml');
  if (!xml) throw new FileImportError('No se pudo leer el documento.');
  const body = elsNS(parseXml(xml), presentation ? 'presentation' : 'text').find((e) => e.parentElement?.localName === 'body');
  if (!body) throw new FileImportError('El documento está vacío.');
  const lines: string[] = [];
  const tableRows = { n: 0 };
  walkOdf(body, lines, tableRows);
  res.text = lines.map(cleanText).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  const total = res.text.split('\n').filter((l) => l.trim()).length;
  if (!presentation && tableRows.n && tableRows.n >= total * 0.8) {
    res.suggest = { ...TABLE_SUGGEST };
    res.note = `Tabla · ${tableRows.n} filas`;
  } else res.note = `${total} líneas`;
  return res;
}

async function extractPptx(name: string, zip: Zip): Promise<ExtractedFile> {
  const res = baseResult(name, 'PowerPoint');
  const slides = Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort((a, b) => parseInt(a.replace(/\D/g, ''), 10) - parseInt(b.replace(/\D/g, ''), 10));
  if (!slides.length) throw new FileImportError('La presentación no tiene diapositivas.');
  const blocks: string[] = [];
  for (const path of slides) {
    const xml = await zipText(zip, path);
    if (!xml) continue;
    const doc = parseXml(xml);
    const lines: string[] = [];
    const walk = (n: Element) => {
      for (const c of Array.from(n.children)) {
        if (c.localName === 'p') {
          let t = '';
          const wp = (x: Element) => {
            for (const k of Array.from(x.children)) {
              if (k.localName === 't') t += k.textContent || '';
              else if (k.localName === 'br') t += '\n';
              else if (k.localName !== 'pPr' && k.localName !== 'rPr') wp(k);
            }
          };
          wp(c);
          if (t.trim()) lines.push(t.trim());
        } else if (c.localName === 'tbl') {
          const rows: string[][] = [];
          for (const tr of childEls(c, 'tr')) rows.push(childEls(tr, 'tc').map((tc) => elsNS(tc, 't').map((x) => x.textContent || '').join(' ').trim()));
          const t = rowsToTsv(rows);
          if (t) lines.push(t);
        } else walk(c);
      }
    };
    walk(doc.documentElement);
    if (lines.length) blocks.push(lines.join('\n'));
  }
  res.text = blocks.join('\n\n');
  res.note = `${blocks.length} diapositivas · una tarjeta por diapositiva si no hay separador`;
  return res;
}

/* ------------------------------ Anki (.apkg) ------------------------------ */

function readVarint(b: Uint8Array, pos: number): [number, number] {
  let v = 0;
  for (let i = 0; i < 8; i++) {
    const byte = b[pos + i];
    v = v * 128 + (byte & 0x7f);
    if (!(byte & 0x80)) return [v, pos + i + 1];
  }
  return [v * 256 + b[pos + 8], pos + 9];
}

/** Lector mínimo de SQLite: recorre las páginas hoja de tablas y devuelve los registros */
function sqliteRecords(db: Uint8Array, accept: (cols: unknown[]) => boolean): unknown[][] {
  const dv = new DataView(db.buffer, db.byteOffset, db.byteLength);
  if (new TextDecoder().decode(db.subarray(0, 15)) !== 'SQLite format 3') throw new FileImportError('La colección de Anki no es una base de datos válida.');
  let pageSize = dv.getUint16(16);
  if (pageSize === 1) pageSize = 65536;
  const usable = pageSize - db[20];
  const nPages = Math.floor(db.length / pageSize);
  const maxLocal = usable - 35;
  const minLocal = Math.floor(((usable - 12) * 32) / 255) - 23;
  const dec = new TextDecoder('utf-8');
  const out: unknown[][] = [];

  const readPayload = (start: number, size: number): Uint8Array | null => {
    if (size <= maxLocal) return db.subarray(start, start + size);
    let local = minLocal + ((size - minLocal) % (usable - 4));
    if (local > maxLocal) local = minLocal;
    const buf = new Uint8Array(size);
    buf.set(db.subarray(start, start + local), 0);
    let got = local;
    let next = dv.getUint32(start + local);
    let guard = 0;
    while (next && got < size && guard++ < 100000) {
      const base = (next - 1) * pageSize;
      if (base + pageSize > db.length) return null;
      const take = Math.min(usable - 4, size - got);
      buf.set(db.subarray(base + 4, base + 4 + take), got);
      got += take;
      next = dv.getUint32(base);
    }
    return got >= size ? buf : null;
  };

  const decodeRecord = (p: Uint8Array): unknown[] | null => {
    try {
      const [hdrLen, afterHdr] = readVarint(p, 0);
      const types: number[] = [];
      let pos = afterHdr;
      while (pos < hdrLen) {
        const [t, np] = readVarint(p, pos);
        types.push(t);
        pos = np;
      }
      const pv = new DataView(p.buffer, p.byteOffset, p.byteLength);
      const cols: unknown[] = [];
      let off = hdrLen;
      for (const t of types) {
        if (t === 0) cols.push(null);
        else if (t >= 1 && t <= 6) {
          const n = [0, 1, 2, 3, 4, 6, 8][t];
          let v = 0;
          for (let i = 0; i < n; i++) v = v * 256 + p[off + i];
          const bits = n * 8;
          if (bits < 53 && p[off] & 0x80) v -= Math.pow(2, bits);
          cols.push(v);
          off += n;
        } else if (t === 7) {
          cols.push(pv.getFloat64(off));
          off += 8;
        } else if (t === 8) cols.push(0);
        else if (t === 9) cols.push(1);
        else if (t >= 12) {
          const n = t % 2 === 0 ? (t - 12) / 2 : (t - 13) / 2;
          cols.push(t % 2 === 0 ? p.subarray(off, off + n) : dec.decode(p.subarray(off, off + n)));
          off += n;
        } else return null;
      }
      return cols;
    } catch {
      return null;
    }
  };

  for (let pg = 1; pg <= nPages; pg++) {
    const base = (pg - 1) * pageSize;
    const hdr = pg === 1 ? 100 : 0;
    if (db[base + hdr] !== 0x0d) continue;
    const nCells = dv.getUint16(base + hdr + 3);
    for (let i = 0; i < nCells; i++) {
      const cellOff = base + dv.getUint16(base + hdr + 8 + i * 2);
      if (cellOff >= db.length) continue;
      const [size, p1] = readVarint(db, cellOff);
      const [rowid, p2] = readVarint(db, p1);
      const payload = readPayload(p2, size);
      if (!payload) continue;
      const cols = decodeRecord(payload);
      // la columna «INTEGER PRIMARY KEY» se guarda como rowid y en el registro queda nula
      if (cols && cols[0] === null) cols[0] = rowid;
      if (cols && accept(cols)) out.push(cols);
    }
  }
  return out;
}

function ankiHtmlToText(h: string): string {
  let s = h
    .replace(/\[sound:[^\]]*\]/gi, '')
    .replace(/\[\$\$\]([\s\S]*?)\[\/\$\$\]/g, '$$$$$1$$$$')
    .replace(/\[\$\]([\s\S]*?)\[\/\$\]/g, '$$$1$$')
    .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p|li|tr)>/gi, '\n')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '');
  const ta = document.createElement('textarea');
  ta.innerHTML = s;
  s = ta.value;
  return s.replace(/ /g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

async function extractApkg(name: string, zip: Zip): Promise<ExtractedFile> {
  const res = baseResult(name, 'Anki');
  const entry = zip.file('collection.anki21') || zip.file('collection.anki2');
  if (!entry) {
    if (zip.file('collection.anki21b')) {
      throw new FileImportError('Este paquete de Anki usa el formato nuevo (comprimido).', 'En Anki: Exportar → marca «Compatible con versiones antiguas» y vuelve a exportar, o elige «Notas en texto plano (.txt)».');
    }
    throw new FileImportError('No encontramos la colección dentro del paquete de Anki.');
  }
  // si hay dos colecciones, la «.anki2» puede ser solo un aviso de actualización: se usa la más grande
  let bytes = await entry.async('uint8array');
  const alt = zip.file('collection.anki2');
  if (alt && alt !== entry) {
    const altBytes = await alt.async('uint8array');
    if (altBytes.length > bytes.length) bytes = altBytes;
  }
  const notes = sqliteRecords(bytes, (c) => c.length >= 7 && typeof c[0] === 'number' && typeof c[1] === 'string' && typeof c[6] === 'string' && typeof c[5] === 'string');
  if (!notes.length) throw new FileImportError('El paquete de Anki no tiene notas.');
  notes.sort((a, b) => (a[0] as number) - (b[0] as number));
  const rows: string[][] = [];
  let withImages = 0;
  for (const n of notes) {
    const raw = String(n[6]).split('\x1f');
    if (/<img\b/i.test(raw.join(' '))) withImages++;
    const f = raw.map(ankiHtmlToText);
    if (/\{\{c\d+::/.test(f[0] || '')) {
      const front = f[0].replace(/\{\{c\d+::([\s\S]*?)(?:::[^}]*)?\}\}/g, '[...]');
      const back = f[0].replace(/\{\{c\d+::([\s\S]*?)(?:::[^}]*)?\}\}/g, '$1');
      rows.push([front, back]);
    } else if (f.length >= 2) rows.push([f[0], f[1]]);
    else if (f[0]) rows.push([f[0], '']);
  }
  const out = fromTable(res, rows, `${rows.length} notas de Anki`);
  out.suggest = { ...TABLE_SUGGEST, headerMode: 'keep' };
  if (withImages) out.warnings.push(`${withImages} nota${withImages === 1 ? '' : 's'} con imágenes: las imágenes no se importan (solo el texto).`);
  return out;
}

/* ------------------------------ PDF ------------------------------ */

async function extractPdf(name: string, buf: ArrayBuffer, onProgress?: (msg: string) => void): Promise<ExtractedFile> {
  const res = baseResult(name, 'PDF');
  onProgress?.('Cargando lector de PDF…');
  // @ts-ignore las definiciones de tipos de la versión «legacy» no se resuelven con el empaquetador
  const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.min.mjs');
  // @ts-ignore import con ?url
  const worker: { default: string } = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  let doc: any;
  try {
    doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  } catch (e) {
    if (/password/i.test(String((e as Error)?.message || e))) throw new FileImportError('El PDF está protegido con contraseña.', 'Quítale la contraseña y vuelve a subirlo.');
    throw new FileImportError('No se pudo abrir el PDF.');
  }
  const pages = Math.min(doc.numPages, 400);
  const out: string[] = [];
  for (let i = 1; i <= pages; i++) {
    onProgress?.(`Leyendo PDF… página ${i} de ${pages}`);
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items = (content.items as any[]).filter((it) => typeof it.str === 'string');
    // agrupa por altura (misma línea) y ordena de izquierda a derecha
    const lines: Array<{ y: number; parts: Array<{ x: number; w: number; s: string }> }> = [];
    for (const it of items) {
      const y = it.transform[5] as number;
      const x = it.transform[4] as number;
      const h = Math.abs(it.transform[3] as number) || 10;
      let line = lines.find((l) => Math.abs(l.y - y) < h * 0.4);
      if (!line) {
        line = { y, parts: [] };
        lines.push(line);
      }
      line.parts.push({ x, w: (it.width as number) || 0, s: it.str as string });
    }
    lines.sort((a, b) => b.y - a.y);
    for (const l of lines) {
      l.parts.sort((a, b) => a.x - b.x);
      let t = '';
      let end = -1;
      for (const p of l.parts) {
        if (!p.s) continue;
        if (end >= 0) {
          const gap = p.x - end;
          // un hueco grande entre columnas se vuelve una tabulación
          if (gap > 24) t += '\t';
          else if (gap > 1 && !t.endsWith(' ') && !p.s.startsWith(' ')) t += ' ';
        }
        t += p.s;
        end = p.x + p.w;
      }
      if (t.trim()) out.push(t.replace(/\s+$/g, ''));
    }
    out.push('');
    page.cleanup?.();
  }
  try {
    await doc.destroy();
  } catch {
    /* ignorar */
  }
  res.text = out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (res.text.length < 3) throw new FileImportError('Este PDF no tiene texto seleccionable (parece escaneado).', 'Prueba con una versión con texto o copia y pega el contenido.');
  res.note = `${pages} página${pages === 1 ? '' : 's'}${doc.numPages > pages ? ` de ${doc.numPages}` : ''}`;
  if (doc.numPages > pages) res.warnings.push(`Solo se leyeron las primeras ${pages} páginas.`);
  return res;
}

/* ------------------------------ entrada principal ------------------------------ */

const ZIP_EXTS = new Set(['xlsx', 'xlsm', 'xltx', 'ods', 'docx', 'docm', 'dotx', 'odt', 'pptx', 'ppsx', 'odp', 'apkg', 'colpkg', 'zip']);
const TEXT_EXTS = new Set(['txt', 'csv', 'tsv', 'tab', 'md', 'markdown', 'text', 'lst', 'list', 'log', 'rtf', 'json', 'html', 'htm', 'xhtml']);

const LEGACY_HINTS: Record<string, string> = {
  xls: 'Ábrelo en Excel y guárdalo como «Libro de Excel (.xlsx)» o «CSV».',
  doc: 'Ábrelo en Word y guárdalo como «.docx».',
  ppt: 'Ábrelo en PowerPoint y guárdalo como «.pptx».',
  numbers: 'En Numbers: Archivo → Exportar a → Excel o CSV.',
  pages: 'En Pages: Archivo → Exportar a → Word o texto.',
  key: 'En Keynote: Archivo → Exportar a → PowerPoint.',
  epub: 'Convierte el libro a PDF o copia el texto que necesites.',
  png: 'Las imágenes no se pueden leer como texto.',
  jpg: 'Las imágenes no se pueden leer como texto.',
  jpeg: 'Las imágenes no se pueden leer como texto.',
  webp: 'Las imágenes no se pueden leer como texto.',
  gif: 'Las imágenes no se pueden leer como texto.',
  mp3: 'Los audios no se pueden leer como texto.',
  mp4: 'Los videos no se pueden leer como texto.'
};

export async function extractFile(file: File, onProgress?: (msg: string) => void): Promise<ExtractedFile> {
  if (file.size === 0) throw new FileImportError('El archivo está vacío.');
  if (file.size > MAX_FILE_BYTES) throw new FileImportError('El archivo es demasiado grande.', 'El máximo es 40 MB. Divídelo en partes.');
  const e = ext(file.name);
  if (LEGACY_HINTS[e]) throw new FileImportError(`No se puede leer .${e} directamente.`, LEGACY_HINTS[e]);

  onProgress?.('Leyendo archivo…');
  const buf = await file.arrayBuffer();
  const u8 = new Uint8Array(buf);
  const isZip = u8[0] === 0x50 && u8[1] === 0x4b && (u8[2] === 3 || u8[2] === 5);
  const isPdf = u8[0] === 0x25 && u8[1] === 0x50 && u8[2] === 0x44 && u8[3] === 0x46;
  if (isPdf || e === 'pdf') {
    if (!isPdf) throw new FileImportError('Ese archivo no parece un PDF válido.');
    return finalize(await extractPdf(file.name, buf, onProgress));
  }

  if (isZip || ZIP_EXTS.has(e)) {
    if (!isZip) throw new FileImportError('El archivo está dañado o no es del tipo que indica su extensión.');
    onProgress?.('Abriendo archivo…');
    const { default: JSZip } = await import('jszip');
    let zip: Zip;
    try {
      zip = await JSZip.loadAsync(buf);
    } catch {
      throw new FileImportError('No se pudo abrir el archivo.', 'Puede estar dañado o protegido con contraseña.');
    }
    const has = (p: string) => !!zip.file(p);
    const any = (re: RegExp) => Object.keys(zip.files).some((p) => re.test(p));
    onProgress?.('Extrayendo contenido…');
    if (has('xl/workbook.xml') || e === 'xlsx' || e === 'xlsm' || e === 'xltx') return finalize(await extractXlsx(file.name, zip));
    if (has('word/document.xml')) return finalize(await extractDocx(file.name, zip));
    if (any(/^ppt\/slides\/slide\d+\.xml$/)) return finalize(await extractPptx(file.name, zip));
    if (has('collection.anki21') || has('collection.anki2') || has('collection.anki21b')) return finalize(await extractApkg(file.name, zip));
    if (has('content.xml')) {
      const mime = (await zipText(zip, 'mimetype')) || '';
      if (/spreadsheet/.test(mime) || e === 'ods') return finalize(await extractOds(file.name, zip));
      if (/presentation/.test(mime) || e === 'odp') return finalize(await extractOdt(file.name, zip, true));
      return finalize(await extractOdt(file.name, zip, false));
    }
    throw new FileImportError('No reconocemos el contenido de este archivo comprimido.', 'Se admiten Excel, Word, PowerPoint, OpenDocument y paquetes de Anki.');
  }

  if (!TEXT_EXTS.has(e) && looksBinary(u8)) {
    throw new FileImportError(`No sabemos leer archivos .${e || 'desconocidos'}.`, 'Prueba a exportarlo como CSV, TXT, XLSX, DOCX o PDF.');
  }
  return finalize(await extractPlain(file.name, e, buf));
}

function finalize(res: ExtractedFile): ExtractedFile {
  res.text = cleanText(res.text);
  if (res.text.length > MAX_TEXT_CHARS) {
    const cut = res.text.slice(0, MAX_TEXT_CHARS);
    res.text = cut.slice(0, cut.lastIndexOf('\n'));
    res.warnings.push('El archivo es enorme: solo se cargó la primera parte. Impórtalo en varias tandas.');
  }
  for (const s of res.sheets) s.text = cleanText(s.text);
  if (!res.text.trim()) throw new FileImportError('No encontramos texto en el archivo.');
  return res;
}
