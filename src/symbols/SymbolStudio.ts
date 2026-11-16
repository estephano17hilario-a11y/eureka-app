import './symbols.css';
import { CAT_DESC, GROUPS, KIND_INFO, KIND_ORDER, allSyms, catKindView, catTotal, findCat, hasSlots, kindCounts, searchSyms, symKey, totalCount, type Kind, type Sym } from './catalog';
import { isCoarsePointer, type SymbolHost } from './host';
import { katexService } from '../services/katex.service';
import { getComputeEngine } from '../services/math-engine.service';
import { nativeService } from '../services/native.service';

/**
 * Estudio de símbolos: catálogo universal clasificado + editor visual de fórmulas (MathLive).
 *  - «Directo»: cada toque inserta el símbolo en el texto, sin cerrar el panel.
 *  - «Fórmula»: se compone en un campo editable (1/2 crea una fracción con casillas) y se inserta al final.
 */

export type StudioMode = 'direct' | 'compose';

export interface SymbolStudioOptions {
  host: SymbolHost;
  mode?: StudioMode;
  /** Fórmula inicial (si no se indica, se usa la que haya bajo el cursor) */
  initialLatex?: string;
  /** La fórmula inicial ya está en el texto: al terminar se reemplaza en su sitio */
  editing?: boolean;
  /** Se cierra al insertar una fórmula (por defecto solo en móvil) */
  closeOnInsert?: boolean;
  onClose?: () => void;
}

export interface SymbolStudioHandle {
  close(): void;
}

type Screen = 'home' | 'cat' | 'kbd' | 'recent' | 'fav';

/** Dónde estaba el usuario: se recuerda para volver exactamente a ese sitio */
interface Nav {
  s: Screen;
  cat: string;
  kind: Kind;
  /** Subcategoría elegida ('' = todas) */
  sub: string;
  /** Desplazamiento de la lista */
  sc: number;
}

interface Prefs {
  mode: StudioMode;
  /** Ver siempre los nombres junto a cada símbolo */
  list: boolean;
  tall: boolean;
  nav?: Nav;
  x?: number;
  y?: number;
}

type Entry = Sym | { h: string; n: number };

type StoredSym = Pick<Sym, 'c' | 't' | 'n'>;

const PREFS_KEY = 'eureka_symx_prefs_v2';
const RECENT_KEY = 'eureka_symx_recent_v1';
const FAV_KEY = 'eureka_symx_fav_v1';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento lleno o bloqueado: las preferencias no son críticas */
  }
}

/* -------------------------------------------------------------------------- */
/*  Vista previa de símbolos                                                   */
/* -------------------------------------------------------------------------- */

const previewCache = new Map<string, string>();
const SLOT = '{\\textcolor{#5cc8f5}{\\square}}';

export function symPreview(s: Pick<Sym, 'c' | 't'>): string {
  const key = s.t || `c:${s.c}`;
  const hit = previewCache.get(key);
  if (hit !== undefined) return hit;
  let html: string;
  if (s.t) {
    html = katexService.renderMath(s.t.replace(/#[?@0]/g, SLOT));
    // Dentro de \text{} no existe \square: se reintenta con un carácter
    if (html.includes('katex-error')) html = katexService.renderMath(s.t.replace(/#[?@0]/g, '▫'));
    if (html.includes('katex-error') && s.c) html = `<span class="symx-ch">${esc(s.c)}</span>`;
  } else {
    html = `<span class="symx-ch">${esc((s.c || '').replace(/#\?/g, '…'))}</span>`;
  }
  if (previewCache.size > 6000) previewCache.clear();
  previewCache.set(key, html);
  return html;
}

function cellSize(s: Sym): 's' | 'm' | 'l' {
  if (!s.t) return [...(s.c || '')].length > 3 ? 'm' : 's';
  const len = s.t.replace(/#\?/g, '').length;
  if (s.t.startsWith('\\begin') || len > 26 || (len > 15 && /[=→]|\\to|->/.test(s.t))) return 'l';
  if (len > 9 || s.t.includes('#?')) return 'm';
  return 's';
}

const codePoints = (c: string): string =>
  [...c]
    .map((ch) => 'U+' + (ch.codePointAt(0) as number).toString(16).toUpperCase().padStart(4, '0'))
    .join(' ');

/* -------------------------------------------------------------------------- */
/*  Teclado de calculadora                                                     */
/* -------------------------------------------------------------------------- */

interface Key {
  /** Etiqueta en LaTeX (se pinta con KaTeX) */
  x?: string;
  /** Etiqueta en texto */
  l?: string;
  /** LaTeX que inserta */
  i?: string;
  /** Comando de MathLive */
  c?: string;
  /** Acción del estudio */
  a?: string;
  k?: 'num' | 'op' | 'fn' | 'nav' | 'go';
  t?: string;
  w?: number;
}

const K_CALC: Key[] = [
  { x: 'x', i: 'x', k: 'fn' }, { x: 'y', i: 'y', k: 'fn' }, { l: '7', i: '7', k: 'num' }, { l: '8', i: '8', k: 'num' }, { l: '9', i: '9', k: 'num' }, { l: '÷', i: '\\div', k: 'op' }, { l: '⌫', c: 'deleteBackward', k: 'nav', t: 'Borrar' },
  { x: '\\frac{\\square}{\\square}', i: '\\frac{#@}{#?}', k: 'fn', t: 'Fracción (también con la tecla /)' }, { x: '\\sqrt{\\square}', i: '\\sqrt{#0}', k: 'fn', t: 'Raíz cuadrada' }, { l: '4', i: '4', k: 'num' }, { l: '5', i: '5', k: 'num' }, { l: '6', i: '6', k: 'num' }, { l: '×', i: '\\times', k: 'op' }, { l: '←', c: 'moveToPreviousChar', k: 'nav', t: 'Mover a la izquierda' },
  { x: '\\square^2', i: '#@^{2}', k: 'fn', t: 'Al cuadrado' }, { x: '\\square^{\\square}', i: '#@^{#?}', k: 'fn', t: 'Potencia' }, { l: '1', i: '1', k: 'num' }, { l: '2', i: '2', k: 'num' }, { l: '3', i: '3', k: 'num' }, { l: '−', i: '-', k: 'op' }, { l: '→', c: 'moveToNextChar', k: 'nav', t: 'Mover a la derecha' },
  { x: '(\\square)', i: '\\left(#0\\right)', k: 'fn', t: 'Paréntesis' }, { x: '\\square_{\\square}', i: '#@_{#?}', k: 'fn', t: 'Subíndice' }, { l: '0', i: '0', k: 'num' }, { l: '.', i: '.', k: 'num' }, { l: ',', i: ',', k: 'num' }, { l: '+', i: '+', k: 'op' }, { l: '⇥', c: 'moveToNextPlaceholder', k: 'nav', t: 'Siguiente casilla' },
  { x: '\\pi', i: '\\pi', k: 'fn' }, { x: '\\infty', i: '\\infty', k: 'fn' }, { l: '=', i: '=', k: 'op' }, { x: '<', i: '<', k: 'op' }, { x: '>', i: '>', k: 'op' }, { x: '\\pm', i: '\\pm', k: 'op' }, { l: '↵', a: 'insert-inline', k: 'go', t: 'Insertar la fórmula' }
];

const fn = (tex: string, insert = tex, title = ''): Key => ({ x: tex, i: insert, k: 'fn', t: title });
const K_FUNC: Key[] = [
  fn('\\sin', '\\sin\\left(#0\\right)'), fn('\\cos', '\\cos\\left(#0\\right)'), fn('\\tan', '\\tan\\left(#0\\right)'), fn('\\ln', '\\ln\\left(#0\\right)'), fn('\\log', '\\log\\left(#0\\right)'), fn('\\log_{\\square}', '\\log_{#?}\\left(#?\\right)'),
  fn('\\sin^{-1}', '\\sin^{-1}\\left(#0\\right)'), fn('\\cos^{-1}', '\\cos^{-1}\\left(#0\\right)'), fn('\\tan^{-1}', '\\tan^{-1}\\left(#0\\right)'), fn('e^{\\square}', 'e^{#0}'), fn('10^{\\square}', '10^{#0}'), fn('\\sqrt[\\square]{\\square}', '\\sqrt[#?]{#0}', 'Raíz n-ésima'),
  fn('\\lim', '\\lim_{#?\\to#?}', 'Límite'), fn('\\sum', '\\sum_{#?}^{#?}', 'Sumatoria'), fn('\\prod', '\\prod_{#?}^{#?}', 'Productoria'), fn('\\int', '\\int #0\\,d#?', 'Integral'), fn('\\int_{\\square}^{\\square}', '\\int_{#?}^{#?}#0\\,d#?', 'Integral definida'), fn('\\frac{d}{dx}', '\\frac{d}{d#?}#0', 'Derivada'),
  fn('\\frac{\\partial}{\\partial x}', '\\frac{\\partial#0}{\\partial#?}', 'Derivada parcial'), fn('n!', '#@!', 'Factorial'), fn('|\\square|', '\\left|#0\\right|', 'Valor absoluto'), fn('\\binom{n}{k}', '\\binom{#?}{#?}', 'Binomial'), fn('\\vec{v}', '\\vec{#0}', 'Vector'), fn('\\bar{x}', '\\bar{#0}', 'Media'),
  fn('\\begin{pmatrix}\\cdot&\\cdot\\\\\\cdot&\\cdot\\end{pmatrix}', '\\begin{pmatrix}#?&#?\\\\#?&#?\\end{pmatrix}', 'Matriz 2×2'), fn('\\{\\,\\vdots', '\\begin{cases}#?&#?\\\\#?&#?\\end{cases}', 'Función a trozos'), fn('\\le', '\\le'), fn('\\ge', '\\ge'), fn('\\ne', '\\ne'), fn('\\approx', '\\approx'),
  fn('\\to', '\\to'), fn('\\Rightarrow', '\\Rightarrow'), fn('\\in', '\\in'), fn('\\cdot', '\\cdot'), fn('^\\circ', '^{\\circ}', 'Grados'), fn('\\%', '\\%')
];

const GREEK_LO = ['alpha', 'beta', 'gamma', 'delta', 'varepsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'varphi', 'chi', 'psi', 'omega', 'phi', 'epsilon', 'vartheta', 'partial', 'nabla'];
const GREEK_UP = ['Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Upsilon', 'Phi', 'Psi', 'Omega', 'hbar', 'ell', 'infty', 'emptyset', 'forall', 'exists', 'angle', 'perp', 'parallel', 'cup', 'cap', 'subset', 'times', 'cdot', 'pm', 'propto', 'therefore'];
const ABC_ROWS = ['qwertyuiop', 'asdfghjklñ', 'zxcvbnm'];

const KB_PAGES: Array<{ id: string; label: string }> = [
  { id: 'calc', label: '123' },
  { id: 'func', label: 'ƒ(x)' },
  { id: 'abc', label: 'abc' },
  { id: 'greek', label: 'αβγ' }
];

/* Atajos al escribir en el campo de fórmula (además de los de MathLive: /, ^, _, >=, ->, pi, sqrt…) */
const ES_SHORTCUTS: Record<string, string> = {
  raiz: '\\sqrt{#?}',
  alfa: '\\alpha',
  infinito: '\\infty',
  sen: '\\operatorname{sen}',
  tg: '\\operatorname{tg}',
  '!=': '\\ne',
  '~=': '\\approx',
  '<->': '\\leftrightarrow',
  '<=>': '\\Leftrightarrow',
  '+-': '\\pm',
  int: '\\int',
  suma: '\\sum_{#?}^{#?}',
  lim: '\\lim_{#?\\to#?}',
  vec: '\\vec{#?}',
  grados: '^{\\circ}'
};

/** Limpia el LaTeX de MathLive para que KaTeX lo entienda */
export function tidyLatex(latex: string): string {
  return latex
    .replace(/\\placeholder(\[[^\]]*\])?\{[^{}]*\}/g, '{}')
    .replace(/\\exponentialE/g, 'e')
    .replace(/\\imaginaryI/g, 'i')
    .replace(/\\imaginaryJ/g, 'j')
    .replace(/\\differentialD/g, '\\mathrm{d}')
    .replace(/\\capitalDifferentialD/g, '\\mathrm{D}')
    .replace(/\\mleft/g, '\\left')
    .replace(/\\mright/g, '\\right')
    // MathLive abrevia «\frac12» y «\sqrt2»; con llaves se lee y se edita mejor a mano
    .replace(/\\(d|t|c)?frac(\d)/g, '\\$1frac{$2}')
    .replace(/(\\(?:d|t|c)?frac\{[^{}]*\})([\da-zA-Z])/g, '$1{$2}')
    .replace(/\\sqrt(\d)/g, '\\sqrt{$1}')
    .replace(/\\lbrack/g, '[')
    .replace(/\\rbrack/g, ']')
    .trim();
}

let mathlivePromise: Promise<any> | null = null;
function loadMathlive(): Promise<any> {
  if (!mathlivePromise) {
    mathlivePromise = Promise.all([import('mathlive'), import('mathlive/static.css')]).then(([ml]) => {
      const MFE: any = (ml as any).MathfieldElement;
      try {
        // Las fuentes son las mismas de KaTeX (ya cargadas) y no se usan sonidos
        MFE.fontsDirectory = null;
        MFE.soundsDirectory = null;
      } catch {
        /* versión sin estas opciones */
      }
      return ml;
    });
  }
  return mathlivePromise;
}

let current: Studio | null = null;

export function isSymbolStudioOpen(): boolean {
  return !!current;
}

export function openSymbolStudio(options: SymbolStudioOptions): SymbolStudioHandle {
  current?.close(true);
  current = new Studio(options);
  return current;
}

class Studio implements SymbolStudioHandle {
  private root: HTMLElement;
  private host: SymbolHost;
  private opts: SymbolStudioOptions;
  private prefs: Prefs;
  private mode: StudioMode;
  private nav: Nav;
  private subNames: string[] = [];
  /** Búsqueda acotada: a un grupo de materias, a una materia o a todo ('all' = el usuario quitó el filtro) */
  private scope: { kind: 'group' | 'cat'; id: string } | 'all' | null = null;
  private kbPage = 'calc';
  private shift = false;
  private query = '';
  private view: Sym[] = [];
  private mf: any = null;
  private mfReady: Promise<void> | null = null;
  private editingExisting = false;
  private focusSym: Sym | null = null;
  private evalTimer = 0;
  private evalResult = '';
  private renderToken = 0;
  private pendingScroll = 0;
  private scrollTimer = 0;
  private closed = false;
  private onKeyDown: (e: KeyboardEvent) => void;

  constructor(options: SymbolStudioOptions) {
    this.opts = options;
    this.host = options.host;
    this.prefs = { mode: 'direct', list: false, tall: false, ...readJson<Partial<Prefs>>(PREFS_KEY, {}) };

    const picked = options.initialLatex !== undefined ? { latex: options.initialLatex, block: false } : this.host.pickFormula?.() || null;
    this.editingExisting = !!picked && (options.initialLatex === undefined || !!options.editing);
    // Se abre siempre en modo Fórmula (el editor visual); «Directo» se elige en el momento
    this.mode = options.mode || 'compose';
    if (picked) this.mode = 'compose';
    this.nav = this.restoreNav();
    this.pendingScroll = this.nav.sc || 0;

    this.root = document.createElement('div');
    this.root.className = 'symx';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-label', 'Símbolos y fórmulas');
    this.root.innerHTML = this.shell();
    document.body.appendChild(this.root);
    this.applyLayout();

    this.bind();
    this.setMode(this.mode, false);
    if (picked?.latex) void this.ensureField().then(() => this.setFieldValue(picked.latex));

    this.onKeyDown = (e) => {
      if (e.key !== 'Escape' || !this.root.isConnected) return;
      e.stopPropagation();
      // Escape retrocede un paso (ficha → búsqueda → inicio) y, desde el inicio, cierra
      if (this.root.querySelector('.symx-detail')) this.closeDetail();
      else if (this.query || this.nav.s !== 'home') this.back();
      else this.close();
    };
    window.addEventListener('keydown', this.onKeyDown, true);
    // Con rAF la entrada es suave; el temporizador garantiza que se muestre aunque la pestaña esté en segundo plano
    requestAnimationFrame(() => this.root.classList.add('open'));
    window.setTimeout(() => this.root.classList.add('open'), 60);
    nativeService.triggerHaptics('light');
  }

  /* ------------------------- dónde se quedó el usuario ------------------------ */
  /** Qué clase de entradas se muestra en una categoría: la pedida si tiene contenido, o la primera que tenga */
  private validKind(cat: string, kind: Kind): Kind {
    const counts = kindCounts(cat);
    if (counts[kind] > 0) return kind;
    return KIND_ORDER.find((k) => counts[k] > 0) || 'sym';
  }

  private restoreNav(): Nav {
    const saved = this.prefs.nav;
    const nav: Nav = { s: 'home', cat: 'arit', kind: 'sym', sub: '', sc: 0, ...(saved || {}) };
    // Primera vez: con el editor de fórmulas se empieza en el teclado; si no, en las materias
    if (!saved) nav.s = this.mode === 'compose' ? 'kbd' : 'home';
    if (nav.s === 'kbd' && this.mode !== 'compose') nav.s = 'home';
    if (nav.s === 'cat') {
      if (!findCat(nav.cat)) nav.s = 'home';
      else {
        nav.kind = this.validKind(nav.cat, nav.kind);
        if (nav.sub && !catKindView(nav.cat, nav.kind).some((x) => x.name === nav.sub)) nav.sub = '';
      }
    }
    return nav;
  }

  private savePrefs(): void {
    this.prefs.nav = { ...this.nav };
    writeJson(PREFS_KEY, this.prefs);
  }

  /* ------------------------------ estructura ------------------------------ */
  private shell(): string {
    return `
      <div class="symx-grab" data-drag aria-hidden="true"><i></i></div>
      <header class="symx-head" data-drag>
        <button type="button" class="symx-back" data-act="back" aria-label="Atrás" title="Atrás (Esc)" hidden><span aria-hidden="true">‹</span> Atrás</button>
        <div class="symx-title"><span class="symx-logo" data-logo>∑</span><div><b data-title>Símbolos y fórmulas</b><small data-subtitle></small></div></div>
        <div class="symx-modes" role="tablist" aria-label="Modo de inserción">
          <button type="button" role="tab" data-mode="direct" title="Cada toque inserta el símbolo en tu texto">⚡<span class="xs-hide"> Directo</span></button>
          <button type="button" role="tab" data-mode="compose" title="Compón la fórmula y edita cada casilla">ƒx<span class="xs-hide"> Fórmula</span></button>
        </div>
        <button type="button" class="symx-ib" data-act="size" title="Cambiar tamaño" aria-label="Cambiar tamaño">⤢</button>
        <button type="button" class="symx-ib" data-act="close" title="Cerrar" aria-label="Cerrar">✕</button>
      </header>

      <section class="symx-composer" aria-label="Editor de fórmula">
        <div class="symx-field">
          <div class="symx-field-mount" data-field><span class="symx-field-ph">Cargando editor…</span></div>
          <button type="button" class="symx-result" data-act="use-result" title="Añadir el resultado a la fórmula" hidden></button>
        </div>
        <textarea class="symx-latex" data-latex rows="2" spellcheck="false" placeholder="Código LaTeX" hidden></textarea>
        <div class="symx-bar">
          <button type="button" class="symx-tb" data-cmd="moveToPreviousChar" title="Izquierda">←</button>
          <button type="button" class="symx-tb" data-cmd="moveToNextChar" title="Derecha">→</button>
          <button type="button" class="symx-tb" data-cmd="moveToNextPlaceholder" title="Siguiente casilla (Tab)">⇥</button>
          <button type="button" class="symx-tb" data-cmd="deleteBackward" title="Borrar">⌫</button>
          <button type="button" class="symx-tb" data-cmd="undo" title="Deshacer">↶</button>
          <button type="button" class="symx-tb" data-cmd="redo" title="Rehacer">↷</button>
          <button type="button" class="symx-tb" data-act="clear" title="Vaciar">🗑</button>
          <button type="button" class="symx-tb txt" data-act="latex" title="Ver y editar el código LaTeX">LaTeX</button>
          <span class="symx-bar-gap"></span>
          <button type="button" class="symx-tb" data-act="insert-block" title="Insertar como bloque: centrada en su propia línea (Ctrl+Enter)">▭</button>
          <button type="button" class="symx-go" data-act="insert-inline">Insertar ↵</button>
        </div>
      </section>

      <div class="symx-search">
        <span aria-hidden="true">🔍</span>
        <button type="button" class="symx-scope" data-act="scope-clear" title="Buscar en todas las materias" hidden></button>
        <input type="search" data-search placeholder="Buscar por nombre, comando (\\le) o código (U+2264)…" autocomplete="off" spellcheck="false" enterkeyhint="search" aria-label="Buscar símbolo" />
        <button type="button" class="symx-ib sm" data-act="search-clear" aria-label="Borrar búsqueda" hidden>✕</button>
      </div>

      <div class="symx-pane">
        <div class="symx-barrow" data-bar></div>
        <div class="symx-body" data-body></div>
      </div>

      <footer class="symx-foot">
        <span class="symx-info" data-info></span>
      </footer>`;
  }

  private q<T extends HTMLElement = HTMLElement>(sel: string): T {
    return this.root.querySelector(sel) as T;
  }

  private applyLayout(): void {
    const wide = window.innerWidth >= 900 && !isCoarsePointer();
    this.root.classList.toggle('wide', wide);
    this.root.classList.toggle('sheet', !wide);
    this.root.classList.toggle('tall', this.prefs.tall);
    if (wide && this.prefs.x !== undefined && this.prefs.y !== undefined) this.moveTo(this.prefs.x, this.prefs.y);
  }

  private moveTo(x: number, y: number): void {
    const w = this.root.offsetWidth || 500;
    const h = this.root.offsetHeight || 620;
    const nx = Math.max(8, Math.min(window.innerWidth - w - 8, x));
    const ny = Math.max(8, Math.min(window.innerHeight - Math.min(h, 120), y));
    this.root.style.left = `${nx}px`;
    this.root.style.top = `${ny}px`;
    this.root.style.right = 'auto';
    this.root.style.bottom = 'auto';
    this.prefs.x = nx;
    this.prefs.y = ny;
  }

  /* -------------------------------- eventos ------------------------------- */
  private bind(): void {
    const root = this.root;

    // Solo se cancela mousedown (evita que el botón robe el foco); pointerdown queda intacto para que los toques lleguen siempre
    root.addEventListener('mousedown', (e) => {
      const t = e.target as HTMLElement;
      if (!t.closest('input, textarea, math-field')) e.preventDefault();
    });

    root.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      const modeBtn = t.closest('.symx-modes [data-mode]') as HTMLElement | null;
      if (modeBtn) return this.setMode(modeBtn.dataset.mode as StudioMode);
      const open = t.closest('[data-open]') as HTMLElement | null;
      if (open) return this.openCat(open.dataset.open as string);
      const goto = t.closest('[data-goto]') as HTMLElement | null;
      if (goto) {
        // La calculadora vive en el editor de fórmulas
        if (goto.dataset.goto === 'kbd' && this.mode !== 'compose') this.setMode('compose', false);
        return this.go({ s: goto.dataset.goto as Screen });
      }
      const scopeBtn = t.closest('[data-scope]') as HTMLElement | null;
      if (scopeBtn) {
        const [kind, id] = (scopeBtn.dataset.scope || '').split(':');
        this.scope = { kind: kind as 'group' | 'cat', id };
        this.render();
        const input = this.q<HTMLInputElement>('[data-search]');
        input.focus();
        return;
      }
      const kind = t.closest('[data-kind]') as HTMLElement | null;
      if (kind) return this.go({ kind: kind.dataset.kind as Kind, sub: '' });
      const subBtn = t.closest('[data-sub]') as HTMLElement | null;
      if (subBtn) return this.go({ sub: this.subNames[Number(subBtn.dataset.sub)] || '' });
      const pageBtn = t.closest('[data-kbpage]') as HTMLElement | null;
      if (pageBtn) {
        this.kbPage = pageBtn.dataset.kbpage as string;
        this.shift = false;
        return this.render();
      }
      const cmd = t.closest('[data-cmd]') as HTMLElement | null;
      if (cmd) return this.runCommand(cmd.dataset.cmd as string);
      const key = t.closest('[data-key]') as HTMLElement | null;
      if (key) return this.pressKey(key);
      const act = t.closest('[data-act]') as HTMLElement | null;
      if (act) return this.action(act.dataset.act as string, act);
      const cell = t.closest('.symx-cell') as HTMLElement | null;
      if (cell && !cell.dataset.held) {
        const s = this.view[Number(cell.dataset.i)];
        if (s) this.activate(s, cell);
      }
    });

    // Mantener pulsado / clic derecho: ficha del símbolo
    let holdTimer = 0;
    const body = this.q('[data-body]');
    body.addEventListener('pointerdown', (e) => {
      const cell = (e.target as HTMLElement).closest('.symx-cell') as HTMLElement | null;
      if (!cell) return;
      delete cell.dataset.held;
      window.clearTimeout(holdTimer);
      holdTimer = window.setTimeout(() => {
        const s = this.view[Number(cell.dataset.i)];
        if (!s) return;
        cell.dataset.held = '1';
        nativeService.triggerHaptics('medium');
        this.openDetail(s);
      }, 480);
    });
    const cancelHold = () => window.clearTimeout(holdTimer);
    body.addEventListener('pointerup', cancelHold);
    body.addEventListener('pointercancel', cancelHold);
    body.addEventListener('pointerleave', cancelHold);
    body.addEventListener(
      'scroll',
      () => {
        cancelHold();
        // Se recuerda hasta dónde se había bajado en esta pantalla
        if (this.nav.s === 'home' || this.nav.s === 'kbd' || this.query) return;
        window.clearTimeout(this.scrollTimer);
        this.scrollTimer = window.setTimeout(() => {
          this.nav.sc = body.scrollTop;
          this.savePrefs();
        }, 250);
      },
      { passive: true }
    );
    body.addEventListener('contextmenu', (e) => {
      const cell = (e.target as HTMLElement).closest('.symx-cell') as HTMLElement | null;
      if (!cell) return;
      e.preventDefault();
      const s = this.view[Number(cell.dataset.i)];
      if (s) this.openDetail(s);
    });
    body.addEventListener('pointerover', (e) => {
      const cell = (e.target as HTMLElement).closest('.symx-cell') as HTMLElement | null;
      if (!cell) return;
      const s = this.view[Number(cell.dataset.i)];
      if (s) this.showInfo(s);
    });

    // Búsqueda
    const search = this.q<HTMLInputElement>('[data-search]');
    let st = 0;
    search.addEventListener('input', () => {
      window.clearTimeout(st);
      st = window.setTimeout(() => {
        this.query = search.value.trim();
        this.q('[data-act="search-clear"]').hidden = !this.query;
        this.render();
      }, 90);
    });
    search.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.view[0]) {
        e.preventDefault();
        this.activate(this.view[0]);
      }
    });

    // Código LaTeX editable en los dos sentidos
    const latex = this.q<HTMLTextAreaElement>('[data-latex]');
    latex.addEventListener('input', () => {
      if (this.mf) {
        try {
          this.mf.setValue(latex.value, { silenceNotifications: true });
        } catch {
          /* LaTeX a medias */
        }
        this.scheduleEval();
      }
    });

    // Arrastrar el panel (escritorio)
    let drag: { dx: number; dy: number } | null = null;
    root.addEventListener('pointerdown', (e) => {
      if (!root.classList.contains('wide')) return;
      const t = e.target as HTMLElement;
      if (!t.closest('[data-drag]') || t.closest('button, input')) return;
      const r = root.getBoundingClientRect();
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      root.setPointerCapture(e.pointerId);
      root.classList.add('dragging');
    });
    root.addEventListener('pointermove', (e) => {
      if (drag) this.moveTo(e.clientX - drag.dx, e.clientY - drag.dy);
    });
    const endDrag = () => {
      if (!drag) return;
      drag = null;
      root.classList.remove('dragging');
      this.savePrefs();
    };
    root.addEventListener('pointerup', endDrag);
    root.addEventListener('pointercancel', endDrag);
  }

  private action(act: string, el: HTMLElement): void {
    switch (act) {
      case 'close':
        return this.close();
      case 'back':
        return this.back();
      case 'size':
        this.prefs.tall = !this.prefs.tall;
        this.root.classList.toggle('tall', this.prefs.tall);
        return this.savePrefs();
      case 'names':
        this.prefs.list = !this.prefs.list;
        this.savePrefs();
        return this.render();
      case 'scope-clear':
        this.scope = 'all';
        return this.render();
      case 'search-clear':
        return this.clearSearch(true);
      case 'clear':
        this.setFieldValue('');
        return this.mf?.focus();
      case 'latex': {
        const ta = this.q<HTMLTextAreaElement>('[data-latex]');
        ta.hidden = !ta.hidden;
        el.classList.toggle('on', !ta.hidden);
        if (!ta.hidden) ta.value = this.fieldLatex();
        return;
      }
      case 'use-result':
        if (this.evalResult && this.mf) {
          const cur = this.fieldLatex();
          this.mf.executeCommand('moveToMathfieldEnd');
          this.insertInField(`${cur.trim().endsWith('=') ? '' : '='}${this.evalResult}`);
        }
        return;
      case 'insert-inline':
        return this.commit(false);
      case 'insert-block':
        return this.commit(true);
      case 'shift':
        this.shift = !this.shift;
        return this.render();
      case 'detail-close':
        return this.closeDetail();
      case 'detail-fav':
        if (this.focusSym) {
          this.toggleFav(this.focusSym);
          this.openDetail(this.focusSym);
        }
        return;
      case 'detail-char':
        if (this.focusSym?.c) {
          this.host.insertText(this.focusSym.c);
          this.remember(this.focusSym);
          this.closeDetail();
        }
        return;
      case 'detail-tex':
        if (this.focusSym?.t) {
          const s = this.focusSym;
          this.closeDetail();
          if (hasSlots(s) || this.mode === 'compose') this.toField(s);
          else this.host.insertMath(s.t as string);
          this.remember(s);
        }
        return;
      case 'detail-copy': {
        const text = el.dataset.copy || '';
        void navigator.clipboard?.writeText(text).then(
          () => this.flash('Copiado'),
          () => this.flash('No se pudo copiar')
        );
        return;
      }
    }
  }

  /* --------------------------------- modos -------------------------------- */
  private setMode(mode: StudioMode, userInitiated = true): void {
    this.mode = mode;
    this.root.dataset.mode = mode;
    this.root.querySelectorAll<HTMLElement>('.symx-modes [data-mode]').forEach((b) => {
      const on = b.dataset.mode === mode;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', String(on));
    });
    if (mode === 'compose') {
      void this.ensureField().then(() => {
        if (userInitiated || !isCoarsePointer()) this.mf?.focus();
      });
    } else if (this.nav.s === 'kbd') {
      this.nav.s = 'home';
    }
    if (userInitiated) {
      this.prefs.mode = mode;
      this.savePrefs();
    }
    this.render();
  }

  /* ------------------------------ navegación ------------------------------ */
  private recents(): StoredSym[] {
    return readJson<StoredSym[]>(RECENT_KEY, []);
  }
  private favs(): StoredSym[] {
    return readJson<StoredSym[]>(FAV_KEY, []);
  }
  private isFav(s: Pick<Sym, 'c' | 't' | 'n'>): boolean {
    const k = symKey(s as Sym);
    return this.favs().some((f) => symKey(f as Sym) === k);
  }
  private toggleFav(s: Sym): void {
    const k = symKey(s);
    const list = this.favs();
    const i = list.findIndex((f) => symKey(f as Sym) === k);
    if (i >= 0) list.splice(i, 1);
    else list.unshift({ c: s.c, t: s.t, n: s.n });
    writeJson(FAV_KEY, list.slice(0, 300));
    this.flash(i >= 0 ? 'Quitado de favoritos' : '★ Añadido a favoritos');
    if (this.nav.s === 'fav') this.render();
  }
  private remember(s: Sym): void {
    const k = symKey(s);
    const list = this.recents().filter((r) => symKey(r as Sym) !== k);
    list.unshift({ c: s.c, t: s.t, n: s.n });
    writeJson(RECENT_KEY, list.slice(0, 60));
  }

  /** Cambia de pantalla (y de clase / subcategoría), lo guarda y repinta */
  private go(change: Partial<Nav>): void {
    const next: Nav = { ...this.nav, ...change };
    // Al cambiar de pantalla o de filtro se vuelve arriba; el desplazamiento solo se restaura al reabrir
    next.sc = 0;
    if (next.s === 'cat') {
      next.kind = this.validKind(next.cat, next.kind);
      if (next.sub && !catKindView(next.cat, next.kind).some((x) => x.name === next.sub)) next.sub = '';
    }
    this.nav = next;
    if (this.query) this.clearSearch(false);
    this.scope = null;
    this.savePrefs();
    this.render();
    this.q('[data-body]').scrollTop = 0;
  }

  private openCat(id: string): void {
    this.go({ s: 'cat', cat: id, sub: '' });
  }

  private clearSearch(rerender: boolean): void {
    this.query = '';
    this.q<HTMLInputElement>('[data-search]').value = '';
    this.q('[data-act="search-clear"]').hidden = true;
    if (rerender) this.render();
  }

  /** Un paso atrás: ficha → búsqueda → inicio */
  private back(): void {
    if (this.root.querySelector('.symx-detail')) return this.closeDetail();
    if (this.query) return this.clearSearch(true);
    if (this.nav.s !== 'home') this.go({ s: 'home' });
  }

  /* ------------------------------ pantallas ------------------------------- */
  private render(): void {
    const screen: Screen = this.nav.s;
    const searching = !!this.query;
    this.root.dataset.screen = searching ? 'search' : screen;
    this.root.classList.toggle('kbd', screen === 'kbd' && !searching);

    const cat = screen === 'cat' ? findCat(this.nav.cat) : undefined;
    const showBack = searching || screen !== 'home';
    this.q('[data-act="back"]').hidden = !showBack;
    this.q('[data-logo]').hidden = showBack;

    let title = 'Símbolos y fórmulas';
    let subtitle = `${totalCount().toLocaleString('es')} símbolos · elige una materia`;
    if (searching) {
      title = 'Resultados';
      const sc = this.scopeInfo();
      subtitle = `«${this.query}»${sc ? ` en ${sc.name}` : ' en todas las materias'}`;
    } else if (screen === 'cat' && cat) {
      title = `${cat.icon} ${cat.name}`;
      subtitle = `${catTotal(cat.id).toLocaleString('es')} elementos · ${KIND_INFO[this.nav.kind].hint}`;
    } else if (screen === 'kbd') {
      title = '🧮 Calculadora científica';
      subtitle = 'Números, operadores, funciones y letras';
    } else if (screen === 'recent') {
      title = '🕘 Recientes';
      subtitle = 'Lo último que has usado';
    } else if (screen === 'fav') {
      title = '★ Favoritos';
      subtitle = 'Tus símbolos guardados';
    }
    this.q('[data-title]').textContent = title;
    this.q('[data-subtitle]').textContent = subtitle;

    this.renderScope();
    this.renderBar();
    this.renderBody();
    this.q('[data-info]').innerHTML = this.hintText();
  }

  /** Materias en las que busca ahora la caja de búsqueda */
  private scopeInfo(): { name: string; cats: Set<string> } | null {
    let sc = this.scope;
    // Dentro de una materia, se busca en ella salvo que se quite el filtro
    if (sc === null && this.nav.s === 'cat') sc = { kind: 'cat', id: this.nav.cat };
    if (!sc || sc === 'all') return null;
    if (sc.kind === 'group') {
      const g = GROUPS.find((x) => x.id === sc.id);
      return g ? { name: g.name, cats: new Set(g.cats) } : null;
    }
    const c = findCat(sc.id);
    return c ? { name: c.name, cats: new Set([c.id]) } : null;
  }

  private renderScope(): void {
    const chip = this.q('.symx-scope');
    const input = this.q<HTMLInputElement>('[data-search]');
    const sc = this.scopeInfo();
    chip.hidden = !sc;
    chip.innerHTML = sc ? `en ${esc(sc.name)} <i aria-hidden="true">✕</i>` : '';
    input.placeholder = sc ? `Buscar en ${sc.name}…` : 'Buscar en todo: nombre, comando (\\le) o código (U+2264)…';
  }

  private hintText(): string {
    if (this.nav.s === 'home' && !this.query) return 'Toca una materia para ver sus símbolos';
    if (this.nav.s === 'kbd' && !this.query) return '';
    return 'Toca para insertar · mantén pulsado para ver el nombre oficial';
  }

  /** Barra de filtros: clases (símbolos / estructuras / fórmulas), subcategorías y vista con nombres */
  private renderBar(): void {
    const bar = this.q('[data-bar]');
    const screen = this.nav.s;
    this.subNames = [];
    if (this.query) {
      const n = this.view.length;
      bar.innerHTML = `<span class="symx-count">${n ? `${n}${n >= 240 ? '+' : ''} resultados` : 'Sin resultados'}</span>`;
      bar.hidden = false;
      return;
    }
    if (screen === 'home') {
      bar.innerHTML = '';
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    if (screen === 'kbd') {
      bar.innerHTML = `<div class="symx-subs">${KB_PAGES.map((p) => `<button type="button" class="symx-sub ${p.id === this.kbPage ? 'on' : ''}" data-kbpage="${p.id}">${p.label}</button>`).join('')}</div>`;
      return;
    }
    if (screen === 'recent' || screen === 'fav') {
      bar.innerHTML = '';
      bar.hidden = true;
      return;
    }
    const counts = kindCounts(this.nav.cat);
    const tabs = KIND_ORDER.filter((k) => counts[k] > 0)
      .map((k) => `<button type="button" class="symx-kind ${k === this.nav.kind ? 'on' : ''}" data-kind="${k}" title="${esc(KIND_INFO[k].hint)}">${KIND_INFO[k].name.replace(' hechas', '<span class="xs-hide"> hechas</span>')}<i>${counts[k]}</i></button>`)
      .join('');
    const subs = catKindView(this.nav.cat, this.nav.kind);
    this.subNames = ['', ...subs.map((s) => s.name)];
    const total = subs.reduce((a, s) => a + s.items.length, 0);
    const pills =
      subs.length > 1
        ? `<div class="symx-subs"><button type="button" class="symx-sub ${!this.nav.sub ? 'on' : ''}" data-sub="0">Todo<i>${total}</i></button>${subs
            .map((s, i) => `<button type="button" class="symx-sub ${this.nav.sub === s.name ? 'on' : ''}" data-sub="${i + 1}">${esc(s.name)}<i>${s.items.length}</i></button>`)
            .join('')}</div>`
        : '';
    bar.innerHTML = `<div class="symx-kindrow"><div class="symx-kinds">${tabs}</div><button type="button" class="symx-ib sm ${this.prefs.list ? 'on' : ''}" data-act="names" title="${this.prefs.list ? 'Ver solo símbolos' : 'Ver con nombres'}" aria-label="Ver con nombres">☰</button></div>${pills}`;
    bar.querySelector('.symx-sub.on')?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }

  private renderBody(): void {
    const body = this.q('[data-body]');
    const screen = this.nav.s;
    body.classList.toggle('names', this.prefs.list || !!this.query);

    if (this.query) {
      const res = searchSyms(this.query, 240, this.scopeInfo()?.cats);
      if (!res.length) {
        this.view = [];
        body.innerHTML = `<div class="symx-empty"><b>Sin resultados para «${esc(this.query)}»</b><span>Prueba con el nombre oficial (<i>less-than</i>), el comando LaTeX (<i>\\alpha</i>), el carácter o su código (<i>U+2264</i>).</span></div>`;
        this.renderBar();
        return;
      }
      this.renderGrid(res, true);
      this.renderBar();
      return;
    }

    if (screen === 'home') {
      this.view = [];
      body.innerHTML = this.homeHtml();
      return;
    }

    if (screen === 'kbd') {
      this.view = [];
      body.innerHTML = this.keypadHtml();
      return;
    }

    if (screen === 'recent' || screen === 'fav') {
      const list = (screen === 'recent' ? this.recents() : this.favs()) as Sym[];
      if (!list.length) {
        this.view = [];
        body.innerHTML =
          screen === 'recent'
            ? '<div class="symx-empty"><b>Aún no has usado ningún símbolo</b><span>Los que insertes aparecerán aquí para tenerlos a mano.</span></div>'
            : '<div class="symx-empty"><b>Sin favoritos todavía</b><span>Mantén pulsado un símbolo y toca ★ para guardarlo.</span></div>';
        return;
      }
      // Los guardados solo traen carácter / LaTeX / nombre: se completan con los datos oficiales del catálogo
      const byKey = new Map<string, Sym>();
      allSyms().forEach((s) => byKey.set(symKey(s), s));
      this.renderGrid(
        list.map((s) => byKey.get(symKey(s)) || s),
        true
      );
      return;
    }

    const sections = catKindView(this.nav.cat, this.nav.kind).filter((s) => !this.nav.sub || s.name === this.nav.sub);
    const entries: Entry[] = [];
    // Con varias subcategorías a la vista se rotula cada tramo
    for (const sec of sections) {
      if (sections.length > 1) entries.push({ h: sec.name, n: sec.items.length });
      entries.push(...sec.items);
    }
    const restore = this.pendingScroll;
    this.pendingScroll = 0;
    this.renderGrid(entries, false, restore);
  }

  private homeHtml(): string {
    const recents = this.recents().length;
    const favs = this.favs().length;
    const quick: string[] = [];
    quick.push(`<button type="button" class="symx-quick-t" data-goto="recent"><span>🕘</span><b>Recientes</b>${recents ? `<i>${recents}</i>` : ''}</button>`);
    quick.push(`<button type="button" class="symx-quick-t" data-goto="fav"><span>★</span><b>Favoritos</b>${favs ? `<i>${favs}</i>` : ''}</button>`);
    const groups = GROUPS.map((g) => {
      const tiles = g.cats
        .map((id) => findCat(id))
        .filter((c): c is NonNullable<typeof c> => !!c)
        .map((c) => `<button type="button" class="symx-tile" data-open="${c.id}"><span class="ic">${c.icon}</span><span class="tx"><b>${esc(c.name)}</b><small>${esc(CAT_DESC[c.id] || '')}</small></span><i>${catTotal(c.id).toLocaleString('es')}</i></button>`)
        .join('');
      // En Matemáticas, la calculadora científica va primero: números, operadores y funciones a mano
      const calc =
        g.id === 'math'
          ? `<button type="button" class="symx-tile calc" data-goto="kbd"><span class="ic">🧮</span><span class="tx"><b>Calculadora científica</b><small>Números, operadores, funciones, matrices y letras</small></span></button>`
          : '';
      return `<section class="symx-group" style="--h:${g.hue}"><h3><span>${esc(g.name)}</span><button type="button" class="symx-gsearch" data-scope="group:${g.id}" title="Buscar solo en ${esc(g.name)}">🔍 Buscar</button></h3><div class="symx-tiles">${calc}${tiles}</div></section>`;
    }).join('');
    return `<div class="symx-quick">${quick.join('')}</div>${groups}`;
  }

  private cellHtml(s: Sym, i: number, withPath: boolean): string {
    const size = cellSize(s);
    const official = s.u && s.u.toLowerCase() !== s.n.toLowerCase() ? s.u : '';
    const meta = withPath && s.sub ? `${esc(s.sub)}` : '';
    const sub = official || meta ? `<small>${esc(official || meta)}</small>` : '';
    const tip = official ? `${s.n} — ${official}` : s.n;
    return `<button type="button" class="symx-cell ${size}" data-i="${i}" title="${esc(tip)}"><span class="pv">${symPreview(s)}</span><span class="nm"><b>${esc(s.n)}</b>${sub}</span></button>`;
  }

  /** Pinta la cuadrícula por tandas para que abrir un bloque de miles de símbolos no congele la interfaz */
  private renderGrid(entries: Entry[], withPath: boolean, restoreScroll = 0): void {
    const body = this.q('[data-body]');
    const token = ++this.renderToken;
    this.view = entries.filter((e): e is Sym => !('h' in e));
    let symIdx = 0;
    let pos = 0;
    const chunk = (n: number): string => {
      let html = '';
      let count = 0;
      while (pos < entries.length && count < n) {
        const e = entries[pos++];
        if ('h' in e) html += `<h4 class="symx-sec">${esc(e.h)}<i>${e.n}</i></h4>`;
        else {
          html += this.cellHtml(e, symIdx++, withPath);
          count++;
        }
      }
      return html;
    };
    body.innerHTML = `<div class="symx-grid">${chunk(220)}</div>`;
    const grid = body.firstElementChild as HTMLElement;
    this.pendingScroll = restoreScroll;
    const settle = () => {
      if (this.pendingScroll && (body.scrollHeight - body.clientHeight >= this.pendingScroll || pos >= entries.length)) {
        body.scrollTop = this.pendingScroll;
        this.pendingScroll = 0;
      }
    };
    settle();
    const step = () => {
      if (token !== this.renderToken || !grid.isConnected || pos >= entries.length) return;
      grid.insertAdjacentHTML('beforeend', chunk(500));
      settle();
      window.setTimeout(step, 0);
    };
    if (pos < entries.length) window.setTimeout(step, 0);
  }

  private keypadHtml(): string {
    const btn = (k: Key): string => {
      const label = k.x ? katexService.renderMath(k.x) : esc(k.l || '');
      const attrs = k.i !== undefined ? `data-ins="${esc(k.i)}"` : k.c ? `data-kcmd="${k.c}"` : `data-kact="${k.a}"`;
      return `<button type="button" class="symx-key ${k.k || 'fn'}" data-key ${attrs} ${k.t ? `title="${esc(k.t)}"` : ''} ${k.w ? `style="grid-column:span ${k.w}"` : ''}>${label}</button>`;
    };
    if (this.kbPage === 'calc') return `<div class="symx-keys c7">${K_CALC.map(btn).join('')}</div>`;
    if (this.kbPage === 'func') return `<div class="symx-keys c6">${K_FUNC.map(btn).join('')}</div>`;
    if (this.kbPage === 'greek') {
      const set = this.shift ? GREEK_UP : GREEK_LO;
      return `<div class="symx-keys c7">${set.map((g) => btn({ x: `\\${g}`, i: `\\${g}`, k: 'fn', t: g })).join('')}
        ${btn({ l: this.shift ? 'αβγ' : 'ΓΔΘ ∀∃', a: 'shift', k: 'nav', w: 3, t: 'Mayúsculas y símbolos' })}${btn({ l: '␣', i: '\\,', k: 'nav', w: 2, t: 'Espacio' })}${btn({ l: '⌫', c: 'deleteBackward', k: 'nav', w: 2 })}</div>`;
    }
    const rows = ABC_ROWS.map((r) => [...(this.shift ? r.toUpperCase() : r)].map((ch) => btn({ l: ch, i: ch, k: 'num' })).join(''));
    return `<div class="symx-keys c10">${rows[0]}${rows[1]}
      ${btn({ l: '⇧', a: 'shift', k: this.shift ? 'go' : 'nav', t: 'Mayúsculas' })}${rows[2]}${btn({ l: '⌫', c: 'deleteBackward', k: 'nav', w: 2 })}
      ${btn({ l: '( )', i: '\\left(#0\\right)', k: 'fn', w: 2 })}${btn({ l: 'espacio', i: '\\ ', k: 'nav', w: 4 })}${btn({ l: ',', i: ',', k: 'num' })}${btn({ l: '.', i: '.', k: 'num' })}${btn({ l: '↵', a: 'insert-inline', k: 'go', w: 2 })}</div>`;
  }

  private pressKey(el: HTMLElement): void {
    nativeService.triggerHaptics('light');
    if (el.dataset.kact) return this.action(el.dataset.kact, el);
    if (el.dataset.kcmd) return this.runCommand(el.dataset.kcmd);
    if (el.dataset.ins !== undefined) this.insertInField(el.dataset.ins);
  }

  /* --------------------------- campo de fórmula --------------------------- */
  private ensureField(): Promise<void> {
    if (this.mfReady) return this.mfReady;
    this.mfReady = loadMathlive()
      .then(() => {
        if (this.closed) return;
        const mount = this.q('[data-field]');
        const mf = document.createElement('math-field') as any;
        mf.setAttribute('math-virtual-keyboard-policy', 'manual');
        mf.className = 'symx-mf';
        mount.innerHTML = '';
        mount.appendChild(mf);
        try {
          mf.mathVirtualKeyboardPolicy = 'manual';
          mf.smartFence = true;
          mf.smartSuperscript = true;
          mf.menuItems = [];
          mf.placeholder = '\\text{Escribe aquí: 1/2, sqrt, pi, alfa…}';
          mf.inlineShortcuts = { ...(mf.inlineShortcuts || {}), ...ES_SHORTCUTS };
        } catch {
          /* opciones no disponibles en esta versión */
        }
        mf.addEventListener('input', () => {
          const ta = this.q<HTMLTextAreaElement>('[data-latex]');
          if (!ta.hidden) ta.value = this.fieldLatex();
          this.scheduleEval();
        });
        mf.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.commit(e.ctrlKey || e.metaKey);
          }
        });
        this.mf = mf;
      })
      .catch(() => {
        const mount = this.q('[data-field]');
        mount.innerHTML = '<span class="symx-field-ph">No se pudo cargar el editor visual. Usa el código LaTeX.</span>';
        this.q<HTMLTextAreaElement>('[data-latex]').hidden = false;
      });
    return this.mfReady;
  }

  private fieldLatex(): string {
    if (!this.mf) return this.q<HTMLTextAreaElement>('[data-latex]').value.trim();
    try {
      return tidyLatex(String(this.mf.getValue ? this.mf.getValue('latex') : this.mf.value || ''));
    } catch {
      return '';
    }
  }

  private setFieldValue(latex: string): void {
    const ta = this.q<HTMLTextAreaElement>('[data-latex]');
    ta.value = latex;
    if (!this.mf) return;
    try {
      this.mf.setValue(latex);
    } catch {
      /* ignore */
    }
    this.updateInsertLabel();
    this.scheduleEval();
  }

  private updateInsertLabel(): void {
    const go = this.q('.symx-go');
    go.textContent = this.editingExisting ? 'Actualizar ↵' : 'Insertar ↵';
  }

  private insertInField(latex: string): void {
    void this.ensureField().then(() => {
      if (!this.mf) {
        const ta = this.q<HTMLTextAreaElement>('[data-latex]');
        ta.value += latex.replace(/#[?@0]/g, '');
        return;
      }
      try {
        this.mf.insert(latex, { selectionMode: 'placeholder', format: 'latex', focus: true, feedback: false });
      } catch {
        this.mf.executeCommand(['insert', latex]);
      }
      const ta = this.q<HTMLTextAreaElement>('[data-latex]');
      if (!ta.hidden) ta.value = this.fieldLatex();
      this.scheduleEval();
    });
  }

  private runCommand(cmd: string): void {
    if (!this.mf) return;
    try {
      this.mf.executeCommand(cmd);
      this.mf.focus();
    } catch {
      /* comando no disponible */
    }
    this.scheduleEval();
  }

  /** Calculadora: muestra el resultado exacto o decimal de lo que se va escribiendo */
  private scheduleEval(): void {
    window.clearTimeout(this.evalTimer);
    this.evalTimer = window.setTimeout(() => {
      const chip = this.q('.symx-result');
      const latex = this.fieldLatex().replace(/=\s*$/, '');
      this.evalResult = '';
      chip.hidden = true;
      if (!latex || latex.includes('{}') || /\\(begin|ce|text)\b/.test(latex) || latex.length > 160) return;
      const engine = getComputeEngine();
      if (!engine) return;
      try {
        const expr = engine.parse(latex);
        const exact = String(expr.evaluate()?.latex || '');
        const num = String(expr.N()?.latex || '');
        const strip = (s: string) => s.replace(/\s|\\,|\\!|[{}]/g, '');
        let out = '';
        if (exact && strip(exact) !== strip(latex) && !/\\mathrm\{(Nothing|Undefined|Error)|\\error|\\text\{|NaN/.test(exact)) out = exact;
        const numeric = num && /^-?[\d.,\\cdot\s^{}e+-]+$/.test(num.replace(/\\times10/g, 'e'));
        if (numeric && strip(num) !== strip(latex)) {
          if (!out) out = num;
          else if (strip(num) !== strip(out)) out = `${out}\\approx ${num}`;
        }
        if (!out || out.length > 60) return;
        this.evalResult = out.split('\\approx')[0].trim();
        chip.innerHTML = katexService.renderMath(`=${out.replace(/(\.\d{6})\d+/g, '$1')}`);
        chip.hidden = false;
      } catch {
        /* expresión todavía incompleta */
      }
    }, 220);
  }

  private commit(block: boolean): void {
    const latex = this.fieldLatex();
    if (!latex) {
      this.flash('Escribe una fórmula primero');
      return;
    }
    this.host.insertMath(latex, block);
    nativeService.triggerHaptics('medium');
    this.editingExisting = false;
    const closeAfter = this.opts.closeOnInsert ?? isCoarsePointer();
    if (closeAfter) return this.close();
    this.setFieldValue('');
    this.flash('Fórmula insertada');
  }

  /* ------------------------------ inserción ------------------------------- */
  private toField(s: Sym): void {
    if (this.mode !== 'compose') this.setMode('compose', false);
    let latex: string;
    if (s.t) latex = s.t.startsWith('#?') ? '#@' + s.t.slice(2) : s.t;
    else {
      const c = s.c || '';
      const cp = c.codePointAt(0) || 0;
      const mathish = cp < 0x7f || (cp >= 0x370 && cp <= 0x3ff) || (cp >= 0x2100 && cp <= 0x214f) || (cp >= 0x2190 && cp <= 0x22ff) || (cp >= 0x27c0 && cp <= 0x2aff);
      latex = mathish && [...c].length === 1 ? c : `\\text{${c.replace(/#\?/g, '')}}`;
    }
    this.insertInField(latex);
  }

  private activate(s: Sym, cell?: HTMLElement): void {
    nativeService.triggerHaptics('light');
    this.showInfo(s);
    this.remember(s);
    if (cell) {
      cell.classList.remove('hit');
      void cell.offsetWidth;
      cell.classList.add('hit');
    }

    if (this.mode === 'compose') return this.toField(s);

    // Directo: las plantillas con casillas se rellenan en el editor visual
    if (hasSlots(s)) {
      this.flash('Rellena las casillas y pulsa Insertar');
      return this.toField(s);
    }
    const mathContext = this.host.mathOnly || this.host.inMath();
    if (s.c && !(mathContext && s.t)) {
      if (s.c.includes('#?')) {
        const at = s.c.indexOf('#?');
        const clean = s.c.replace(/#\?/g, '');
        this.host.insertText(clean, clean.length - at);
      } else this.host.insertText(s.c);
    } else if (s.t) {
      this.host.insertMath(s.t);
    }
  }

  /* -------------------------------- detalles ------------------------------ */
  private showInfo(s: Sym): void {
    this.focusSym = s;
    const bits = [`<b>${esc(s.n)}</b>`];
    if (s.u && s.u.toLowerCase() !== s.n.toLowerCase()) bits.push(`<span class="of">${esc(s.u)}</span>`);
    if (s.c && [...s.c].length <= 2) bits.push(`<span>${codePoints(s.c)}</span>`);
    else if (s.t) bits.push(`<code>${esc(s.t.length > 40 ? s.t.slice(0, 38) + '…' : s.t)}</code>`);
    this.q('[data-info]').innerHTML = bits.join('');
  }

  private openDetail(s: Sym): void {
    this.closeDetail();
    this.focusSym = s;
    const fav = this.isFav(s);
    const cat = s.cat ? findCat(s.cat) : undefined;
    const row = (label: string, value: string, copy?: string): string =>
      copy !== undefined
        ? `<button type="button" class="row" data-act="detail-copy" data-copy="${esc(copy)}" title="Copiar"><small>${label}</small><code>${esc(value)}</code><i aria-hidden="true">⧉</i></button>`
        : `<div class="row"><small>${label}</small><code>${esc(value)}</code></div>`;
    const rows: string[] = [];
    if (s.u) rows.push(row('Nombre oficial', s.u, s.u));
    if (s.y) rows.push(row('Tipo', s.y));
    if (s.t) rows.push(row('LaTeX', s.t, s.t));
    const extra = (s.a || []).filter((a) => a !== s.t);
    if (extra.length) rows.push(row('También', extra.join('   '), extra[0]));
    if (s.c && [...s.c].length <= 3) rows.push(row('Unicode', `${s.c}  ${codePoints(s.c)}`, s.c));
    if (cat) rows.push(row('Dónde', `${cat.icon} ${cat.name} › ${s.sub || ''} · ${KIND_INFO[s.kind as Kind].name}`));
    const el = document.createElement('div');
    el.className = 'symx-detail';
    el.innerHTML = `
      <div class="symx-detail-card">
        <button type="button" class="symx-ib sm x" data-act="detail-close" aria-label="Cerrar">✕</button>
        <div class="big">${symPreview(s)}</div>
        <b class="nm">${esc(s.n)}</b>
        <div class="rows">${rows.join('')}</div>
        <div class="acts">
          <button type="button" data-act="detail-fav" class="${fav ? 'on' : ''}">${fav ? '★ En favoritos' : '☆ Favorito'}</button>
          ${s.c ? '<button type="button" data-act="detail-char">Insertar carácter</button>' : ''}
          ${s.t ? `<button type="button" class="pri" data-act="detail-tex">${hasSlots(s) ? 'Editar y rellenar' : 'Insertar como fórmula'}</button>` : ''}
        </div>
      </div>`;
    el.addEventListener('click', (e) => {
      if (e.target === el) this.closeDetail();
    });
    this.root.appendChild(el);
  }

  private closeDetail(): void {
    this.root.querySelector('.symx-detail')?.remove();
  }

  private flash(msg: string): void {
    const info = this.q('[data-info]');
    info.innerHTML = `<b class="flash">${esc(msg)}</b>`;
  }

  public close(silent = false): void {
    if (this.closed) return;
    this.closed = true;
    window.removeEventListener('keydown', this.onKeyDown, true);
    window.clearTimeout(this.evalTimer);
    window.clearTimeout(this.scrollTimer);
    // Se guarda también el desplazamiento actual: al volver se abre exactamente donde se dejó
    if (this.nav.s !== 'home' && this.nav.s !== 'kbd' && !this.query) this.nav.sc = this.q('[data-body]').scrollTop;
    this.savePrefs();
    this.root.classList.remove('open');
    const el = this.root;
    window.setTimeout(() => el.remove(), 180);
    if (current === this) current = null;
    if (!silent) {
      this.host.refocus?.();
      this.opts.onClose?.();
    }
  }
}

/** Precalienta el catálogo (índice de búsqueda) cuando el navegador esté libre */
export function warmSymbolCatalog(): void {
  allSyms();
}
