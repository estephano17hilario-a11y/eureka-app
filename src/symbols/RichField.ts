import './richfield.css';
import { katexService } from '../services/katex.service';

/**
 * Campo de texto con fórmulas VISIBLES.
 *
 * Es un <div contenteditable> que se comporta como un <textarea> (value, selectionStart/End, setRangeText…),
 * de modo que el resto de la aplicación lo usa igual que antes. La diferencia: cada fórmula escrita como
 * `$…$` o `$$…$$` se muestra ya renderizada con KaTeX, como un objeto que se puede pulsar para editarlo en el
 * editor visual. El texto que se guarda sigue siendo el de siempre (`$\frac{1}{2}$`).
 */

export interface FormulaInfo {
  latex: string;
  block: boolean;
  /** Posición de la fórmula dentro del texto (incluye los $) */
  start: number;
  end: number;
}

export interface RichFieldOptions {
  id?: string;
  className?: string;
  placeholder?: string;
  value?: string;
  label?: string;
  spellcheck?: boolean;
  /** Se pulsó una fórmula renderizada */
  onFormula?: (info: FormulaInfo) => void;
}

export interface RichFieldApi {
  value: string;
  placeholder: string;
  readonly selectionStart: number;
  readonly selectionEnd: number;
  setSelectionRange(start: number, end: number): void;
  setRangeText(text: string, start?: number, end?: number, mode?: 'select' | 'start' | 'end' | 'preserve'): void;
  select(): void;
  /** Fórmula pulsada o seleccionada (para editarla en el sitio) */
  rfSelected(): FormulaInfo | null;
  /** Abre la edición de la fórmula que empieza en esa posición */
  rfEditAt(start: number): void;
  rows: number;
}

export type RichField = HTMLDivElement & RichFieldApi;

/** `$$…$$` o `$…$` (sin confundir un `$$` suelto con dos fórmulas vacías) */
const MATH_SRC = String.raw`\$\$([\s\S]+?)\$\$|(?<!\$)\$(?!\$)([^$\n]+?)(?<!\$)\$(?!\$)`;

interface Seg {
  math: boolean;
  s: string;
  latex?: string;
  block?: boolean;
}

export function parseSegments(value: string): Seg[] {
  const out: Seg[] = [];
  const re = new RegExp(MATH_SRC, 'g');
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value)) !== null) {
    if (m.index > last) out.push({ math: false, s: value.slice(last, m.index) });
    const block = m[1] !== undefined;
    out.push({ math: true, s: m[0], latex: (block ? m[1] : m[2]).trim(), block });
    last = m.index + m[0].length;
  }
  if (last < value.length) out.push({ math: false, s: value.slice(last) });
  return out;
}

const htmlCache = new Map<string, string>();
function mathHtml(latex: string, block: boolean): string {
  const key = (block ? 'B' : 'I') + latex;
  let html = htmlCache.get(key);
  if (html === undefined) {
    html = katexService.renderMath(latex, block);
    if (htmlCache.size > 400) htmlCache.clear();
    htmlCache.set(key, html);
  }
  return html;
}

const isAtom = (n: Node | null): n is HTMLElement => !!n && n.nodeType === 1 && (n as HTMLElement).classList.contains('rf-m');
const isEnd = (n: Node | null): boolean => !!n && n.nodeType === 1 && (n as HTMLElement).classList.contains('rf-end');

/** Texto fuente que representa un nodo del campo */
function srcOf(n: Node): string {
  if (n.nodeType === 3) return (n.nodeValue || '').replace(/​/g, '');
  if (isAtom(n)) return n.dataset.raw || '';
  if (n.nodeType !== 1) return '';
  const el = n as HTMLElement;
  if (el.tagName === 'BR') return '';
  let s = '';
  el.childNodes.forEach((c) => (s += srcOf(c)));
  return s;
}

/** Cuántos caracteres de texto fuente quedan antes del punto (node, off) */
function offsetOf(root: HTMLElement, node: Node, off: number): number {
  let count = 0;
  const walk = (n: Node): boolean => {
    if (n === node) {
      if (n.nodeType === 3) count += (n.nodeValue || '').slice(0, off).replace(/​/g, '').length;
      else if (!isAtom(n)) for (let i = 0; i < off && i < n.childNodes.length; i++) count += srcOf(n.childNodes[i]).length;
      return true;
    }
    if (isAtom(n)) {
      if (n.contains(node)) return true;
      count += (n.dataset.raw || '').length;
      return false;
    }
    if (n.nodeType === 3) {
      count += srcOf(n).length;
      return false;
    }
    if (n.contains(node)) {
      for (const c of Array.from(n.childNodes)) if (walk(c)) return true;
      return true;
    }
    count += srcOf(n).length;
    return false;
  };
  walk(root);
  return count;
}

/** Punto del DOM que corresponde a una posición del texto fuente */
function pointAt(root: HTMLElement, pos: number): { node: Node; offset: number } {
  let acc = 0;
  const kids = Array.from(root.childNodes);
  for (let i = 0; i < kids.length; i++) {
    const c = kids[i];
    if (isEnd(c)) return { node: root, offset: i };
    const len = srcOf(c).length;
    if (c.nodeType === 3) {
      const text = c.nodeValue || '';
      if (pos <= acc + len) {
        // El carácter de ancho cero no cuenta: se recorre hasta la posición real
        let seen = 0;
        let idx = 0;
        while (idx < text.length && seen < pos - acc) {
          if (text[idx] !== '​') seen++;
          idx++;
        }
        return { node: c, offset: idx };
      }
    } else if (isAtom(c)) {
      if (pos <= acc) return { node: root, offset: i };
      if (pos < acc + len) return { node: root, offset: i + 1 };
    } else if (len && pos < acc + len) {
      return { node: root, offset: i + 1 };
    }
    acc += len;
  }
  return { node: root, offset: root.childNodes.length };
}

export function createRichField(opts: RichFieldOptions = {}): RichField {
  const el = document.createElement('div') as unknown as RichField;
  const node = el as HTMLElement;
  if (opts.id) node.id = opts.id;
  node.className = `rf ${opts.className || ''}`.trim();
  node.contentEditable = 'true';
  node.spellcheck = opts.spellcheck !== false;
  node.setAttribute('role', 'textbox');
  node.setAttribute('aria-multiline', 'true');
  node.setAttribute('autocapitalize', 'sentences');
  if (opts.label) node.setAttribute('aria-label', opts.label);
  node.dataset.placeholder = opts.placeholder || '';

  let last: [number, number] = [0, 0];
  let pendingRestore = false;
  let clicked: FormulaInfo | null = null;
  let composing = false;

  const getValue = (): string => {
    let s = '';
    node.childNodes.forEach((c) => (s += srcOf(c)));
    return s;
  };

  const readSel = (): [number, number] | null => {
    const s = window.getSelection();
    if (!s || !s.rangeCount) return null;
    const r = s.getRangeAt(0);
    if (!node.contains(r.startContainer) || !node.contains(r.endContainer)) return null;
    const a = offsetOf(node, r.startContainer, r.startOffset);
    const b = offsetOf(node, r.endContainer, r.endOffset);
    return a <= b ? [a, b] : [b, a];
  };

  const applySel = (a: number, b: number): void => {
    const s = window.getSelection();
    if (!s) return;
    const p = pointAt(node, a);
    const q = a === b ? p : pointAt(node, b);
    const range = document.createRange();
    range.setStart(p.node, p.offset);
    range.setEnd(q.node, q.offset);
    s.removeAllRanges();
    s.addRange(range);
  };

  const setSel = (a: number, b: number): void => {
    last = [a, b];
    if (document.activeElement === node) {
      applySel(a, b);
      pendingRestore = false;
    } else pendingRestore = true;
  };

  const ensureEnd = (): void => {
    const lastChild = node.lastChild;
    if (!isEnd(lastChild) && !node.querySelector(':scope > .rf-end')) {
      const br = document.createElement('br');
      br.className = 'rf-end';
      node.appendChild(br);
    } else if (!isEnd(node.lastChild)) {
      // Texto escrito detrás del marcador final: se vuelve a poner al final
      const end = node.querySelector(':scope > .rf-end');
      if (end) node.appendChild(end);
    }
  };

  const markEmpty = (v: string): void => {
    node.classList.toggle('rf-empty', v.length === 0);
  };

  const render = (value: string): void => {
    const frag = document.createDocumentFragment();
    for (const seg of parseSegments(value)) {
      if (!seg.math) {
        frag.appendChild(document.createTextNode(seg.s));
        continue;
      }
      const a = document.createElement('span');
      a.className = `rf-m${seg.block ? ' rf-block' : ''}`;
      a.contentEditable = 'false';
      a.dataset.raw = seg.s;
      a.dataset.l = seg.latex || '';
      a.dataset.b = seg.block ? '1' : '';
      a.title = 'Toca para editar la fórmula';
      a.innerHTML = mathHtml(seg.latex || '', !!seg.block);
      frag.appendChild(a);
    }
    node.textContent = '';
    node.appendChild(frag);
    ensureEnd();
    markEmpty(value);
    clicked = null;
  };

  const setValue = (value: string, caret?: [number, number]): void => {
    render(value);
    const c = caret || [value.length, value.length];
    last = c;
    if (document.activeElement === node) applySel(c[0], c[1]);
    else pendingRestore = true;
  };

  const sel = (): [number, number] => readSel() || last;

  const dispatchInput = (): void => {
    node.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const formulaAtomInfo = (a: HTMLElement): FormulaInfo => {
    const parent = a.parentNode as HTMLElement;
    const idx = Array.prototype.indexOf.call(parent.childNodes, a);
    const start = offsetOf(node, parent, idx);
    const raw = a.dataset.raw || '';
    return { latex: a.dataset.l || '', block: a.dataset.b === '1', start, end: start + raw.length };
  };

  /* ------------------------------ API tipo textarea ------------------------------ */
  const def = (name: string, descriptor: PropertyDescriptor): void => {
    Object.defineProperty(el, name, { configurable: true, ...descriptor });
  };
  def('value', {
    get: getValue,
    set: (v: string) => setValue(String(v ?? ''))
  });
  def('placeholder', {
    get: () => node.dataset.placeholder || '',
    set: (v: string) => {
      node.dataset.placeholder = v;
    }
  });
  def('rows', { get: () => 2, set: () => {} });
  def('selectionStart', { get: () => sel()[0] });
  def('selectionEnd', { get: () => sel()[1] });
  def('setSelectionRange', { value: (a: number, b: number) => setSel(Math.max(0, a), Math.max(0, b)) });
  def('select', {
    value: () => {
      const v = getValue();
      setSel(0, v.length);
    }
  });
  def('setRangeText', {
    value: (text: string, start?: number, end?: number, mode: 'select' | 'start' | 'end' | 'preserve' = 'preserve') => {
      const [ss, se] = sel();
      const a = Math.max(0, start ?? ss);
      const b = Math.max(a, end ?? se);
      const v = getValue();
      const nv = v.slice(0, a) + text + v.slice(b);
      const caret: [number, number] = mode === 'select' ? [a, a + text.length] : mode === 'start' ? [a, a] : [a + text.length, a + text.length];
      setValue(nv, caret);
    }
  });
  def('rfSelected', {
    value: (): FormulaInfo | null => {
      const v = getValue();
      const valid = (f: FormulaInfo | null) => (f && v.slice(f.start, f.end).includes(f.latex) ? f : null);
      const c = valid(clicked);
      if (c) return c;
      // Selección que abarca justo una fórmula
      const [a, b] = sel();
      for (const f of Array.from(node.querySelectorAll<HTMLElement>('.rf-m')).map(formulaAtomInfo)) if (a === f.start && b === f.end) return f;
      return null;
    }
  });
  def('rfEditAt', {
    value: (start: number) => {
      const f = Array.from(node.querySelectorAll<HTMLElement>('.rf-m'))
        .map(formulaAtomInfo)
        .find((x) => x.start === start);
      if (f) {
        clicked = f;
        opts.onFormula?.(f);
      }
    }
  });

  /* --------------------------------- eventos --------------------------------- */
  // Las fórmulas se pulsan para editarlas
  node.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('.rf-m') as HTMLElement | null;
    if (!a || !node.contains(a)) {
      clicked = null;
      return;
    }
    e.preventDefault();
    const info = formulaAtomInfo(a);
    clicked = info;
    node.querySelectorAll('.rf-sel').forEach((x) => x.classList.remove('rf-sel'));
    a.classList.add('rf-sel');
    opts.onFormula?.(info);
  });

  node.addEventListener('pointerdown', () => {
    pendingRestore = false;
  });
  node.addEventListener('focus', () => {
    if (pendingRestore) {
      applySel(last[0], last[1]);
      pendingRestore = false;
    }
  });

  const onSelChange = (): void => {
    if (!node.isConnected) {
      document.removeEventListener('selectionchange', onSelChange);
      return;
    }
    const r = readSel();
    if (r) last = r;
  };
  document.addEventListener('selectionchange', onSelChange);

  node.addEventListener('compositionstart', () => {
    composing = true;
  });
  node.addEventListener('compositionend', () => {
    composing = false;
  });

  node.addEventListener('beforeinput', (e) => {
    const ev = e as InputEvent;
    const t = ev.inputType || '';
    if (t === 'insertParagraph' || t === 'insertLineBreak') {
      ev.preventDefault();
      const [a, b] = sel();
      setValue(getValue().slice(0, a) + '\n' + getValue().slice(b), [a + 1, a + 1]);
      dispatchInput();
    } else if (t.startsWith('format')) {
      // Negrita/cursiva del navegador no se usan: el formato se escribe con Markdown
      ev.preventDefault();
    } else if (t === 'insertFromPaste' || t === 'insertFromDrop' || t === 'insertFromYank') {
      ev.preventDefault();
      const text = ev.dataTransfer?.getData('text/plain');
      if (text) {
        const [a, b] = sel();
        const v = getValue();
        setValue(v.slice(0, a) + text + v.slice(b), [a + text.length, a + text.length]);
        dispatchInput();
      }
    }
  });

  node.addEventListener('paste', (e) => {
    const cd = (e as ClipboardEvent).clipboardData;
    if (!cd) return;
    // Las imágenes las gestiona quien use el campo
    for (let i = 0; i < cd.items.length; i++) if (cd.items[i].type.startsWith('image/')) return;
    const text = cd.getData('text/plain');
    e.preventDefault();
    if (!text) return;
    const clean = text.replace(/\r\n?/g, '\n');
    const [a, b] = sel();
    const v = getValue();
    setValue(v.slice(0, a) + clean + v.slice(b), [a + clean.length, a + clean.length]);
    dispatchInput();
  });

  const onCopyCut = (e: Event): void => {
    const [a, b] = sel();
    if (a === b) return;
    const ev = e as ClipboardEvent;
    const v = getValue();
    ev.clipboardData?.setData('text/plain', v.slice(a, b));
    ev.preventDefault();
    if (e.type === 'cut') {
      setValue(v.slice(0, a) + v.slice(b), [a, a]);
      dispatchInput();
    }
  };
  node.addEventListener('copy', onCopyCut);
  node.addEventListener('cut', onCopyCut);

  // Tras escribir: restos del navegador, marcador final y fórmulas recién cerradas ($…$)
  node.addEventListener('input', () => {
    clicked = null;
    node.querySelectorAll('.rf-sel').forEach((x) => x.classList.remove('rf-sel'));
    const v = getValue();
    markEmpty(v);
    if (!composing) {
      const parsed = parseSegments(v).filter((s) => s.math).length;
      if (parsed !== node.querySelectorAll('.rf-m').length) {
        const caret = readSel() || [v.length, v.length];
        render(v);
        last = caret;
        applySel(caret[0], caret[1]);
        return;
      }
    }
    ensureEnd();
  });

  render(opts.value || '');
  return el;
}

/** Sustituye un <textarea> por un campo con fórmulas visibles, conservando id, clases y valor */
export function upgradeTextarea(ta: HTMLTextAreaElement, onFormula?: (info: FormulaInfo) => void, label?: string): RichField {
  const field = createRichField({
    id: ta.id,
    className: ta.className,
    placeholder: ta.placeholder,
    value: ta.value,
    spellcheck: ta.spellcheck,
    label: label || ta.getAttribute('aria-label') || ta.placeholder,
    onFormula
  });
  ta.replaceWith(field);
  return field;
}
