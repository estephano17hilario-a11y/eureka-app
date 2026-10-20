/**
 * Editor de texto de los nodos.
 *  - Escritorio: cuadro de texto transparente justo encima del texto del nodo (el nodo se reajusta mientras escribes).
 *  - Móvil: hoja inferior con el cuadro de texto, atajos de formato y botones para continuar con otra idea.
 */

import type { MindMapEngine } from './engine';

export type NextAction = 'child' | 'sibling' | undefined;

export interface EditorHost {
  isMobile(): boolean;
  /** Contenedor donde se montan el overlay / la hoja */
  root: HTMLElement;
  onFinish(node: any, committed: boolean, next: NextAction): void;
  onSheetChange?(heightPx: number): void;
}

interface EditState {
  uid: string;
  node: any;
  original: string;
  isInserting: boolean;
  ta: HTMLTextAreaElement;
  wrap: HTMLElement;
  bar: HTMLElement | null;
  mobile: boolean;
  closing: boolean;
}

export class NodeEditor {
  private st: EditState | null = null;
  private vvHandler: (() => void) | null = null;
  private rafPos = 0;

  constructor(private engine: MindMapEngine, private host: EditorHost) {
    engine.on('rendered', () => this.schedulePosition());
    engine.on('view', () => this.schedulePosition());
    engine.on('live', () => this.position());
  }

  public isOpen(): boolean {
    return Boolean(this.st);
  }

  public currentUid(): string | null {
    return this.st?.uid || null;
  }

  public open(node: any, opts: { isInserting?: boolean } = {}): void {
    if (!node) return;
    if (this.st) this.close(true);

    const uid = node.nodeData?.data?.uid as string;
    const rawOriginal = String(node.nodeData?.data?.text ?? '');
    const original = rawOriginal.replace(/<br\s*\/?>/gi, '\n');
    const mobile = this.host.isMobile();

    this.engine.beginEdit(node, original);

    const ta = document.createElement('textarea');
    ta.className = 'mmx-edit-input';
    ta.value = original;
    ta.rows = 1;
    ta.spellcheck = true;
    ta.setAttribute('autocomplete', 'off');
    ta.setAttribute('autocapitalize', 'sentences');
    ta.setAttribute('enterkeyhint', 'done');
    ta.setAttribute('aria-label', 'Texto de la idea');

    const wrap = document.createElement('div');
    this.st = { uid, node, original, isInserting: Boolean(opts.isInserting), ta, wrap, bar: null, mobile, closing: false };

    // Se escribe siempre dentro del propio recuadro de la idea; en móvil se añade una barra de atajos sobre el teclado
    wrap.className = 'mmx-inline-editor mmx-ui';
    wrap.appendChild(ta);
    this.host.root.appendChild(wrap);
    if (mobile) this.buildBar();

    ta.addEventListener('input', () => {
      if (!this.st) return;
      this.engine.setLiveText(this.currentNode(), ta.value);
      if (!mobile) this.autoGrow();
    });
    ta.addEventListener('keydown', (e) => this.onKey(e));
    ta.addEventListener('blur', () => {
      // En móvil los botones de la hoja gestionan el cierre; en escritorio, salir del cuadro confirma
      window.setTimeout(() => {
        if (!this.st || this.st.closing) return;
        if (this.st.mobile) {
          const active = document.activeElement;
          if (active && this.st.wrap.contains(active)) return;
          if (document.hasFocus() === false) return;
        }
        this.close(true);
      }, 90);
    });
    ta.addEventListener('paste', (e) => {
      // Pegar texto con saltos de línea: se conserva tal cual (varias líneas dentro del mismo nodo)
      e.stopPropagation();
    });

    this.position();
    ta.focus({ preventScroll: true });
    // Nuevas ideas: se selecciona el texto por defecto para reemplazarlo; al editar una existente el cursor queda al final
    if (opts.isInserting) ta.select();
    else ta.setSelectionRange(ta.value.length, ta.value.length);

    if (mobile) this.trackKeyboard(true);
  }

  private currentNode(): any {
    if (!this.st) return null;
    const n = this.engine.findNode(this.st.uid) || this.st.node;
    this.st.node = n;
    return n;
  }

  private onKey(e: KeyboardEvent): void {
    if (!this.st) return;
    e.stopPropagation();
    if (e.isComposing) return;
    const key = e.key;
    const mod = e.ctrlKey || e.metaKey;

    if (key === 'Escape') {
      e.preventDefault();
      this.close(false);
    } else if (key === 'Enter' && !e.shiftKey && !mod) {
      e.preventDefault();
      this.close(true);
    } else if (key === 'Enter' && mod) {
      e.preventDefault();
      this.close(true, 'sibling');
    } else if (key === 'Tab') {
      e.preventDefault();
      this.close(true, e.shiftKey ? 'sibling' : 'child');
    } else if (mod && (key === 'b' || key === 'B')) {
      e.preventDefault();
      this.wrapSelection('**');
    } else if (mod && (key === 'i' || key === 'I')) {
      e.preventDefault();
      this.wrapSelection('*');
    } else if (mod && (key === 'm' || key === 'M')) {
      e.preventDefault();
      this.wrapSelection('$');
    }
  }

  /** Envuelve (o desenvuelve) la selección con un marcador de formato */
  public wrapSelection(mark: string): void {
    const st = this.st;
    if (!st) return;
    const ta = st.ta;
    const { selectionStart: a, selectionEnd: b, value } = ta;
    const sel = value.slice(a, b);
    let out: string;
    let selA = a;
    let selB = b;
    if (sel.startsWith(mark) && sel.endsWith(mark) && sel.length >= mark.length * 2) {
      out = value.slice(0, a) + sel.slice(mark.length, sel.length - mark.length) + value.slice(b);
      selB = b - mark.length * 2;
    } else if (value.slice(a - mark.length, a) === mark && value.slice(b, b + mark.length) === mark) {
      out = value.slice(0, a - mark.length) + sel + value.slice(b + mark.length);
      selA = a - mark.length;
      selB = b - mark.length;
    } else {
      out = value.slice(0, a) + mark + sel + mark + value.slice(b);
      selA = a + mark.length;
      selB = b + mark.length;
    }
    ta.value = out;
    ta.setSelectionRange(selA, selB);
    ta.dispatchEvent(new Event('input'));
    ta.focus({ preventScroll: true });
  }

  public selectAll(): void {
    this.st?.ta.select();
  }

  public insertAtCursor(text: string): void {
    const st = this.st;
    if (!st) return;
    const ta = st.ta;
    const a = ta.selectionStart;
    const b = ta.selectionEnd;
    ta.value = ta.value.slice(0, a) + text + ta.value.slice(b);
    const pos = a + text.length;
    ta.setSelectionRange(pos, pos);
    ta.dispatchEvent(new Event('input'));
    ta.focus({ preventScroll: true });
  }

  public close(commit: boolean, next?: NextAction): void {
    const st = this.st;
    if (!st || st.closing) return;
    st.closing = true;
    const value = st.ta.value.replace(/​/g, '');
    const node = this.currentNode();

    this.trackKeyboard(false);
    st.wrap.remove();
    st.bar?.remove();
    this.st = null;
    cancelAnimationFrame(this.rafPos);

    const empty = value.trim().length === 0;
    if (st.isInserting && (!commit || empty)) {
      this.engine.endEdit(node, false, '', st.original);
      this.engine.removeNodes([node]);
      this.host.onFinish(null, false, undefined);
      this.host.onSheetChange?.(0);
      return;
    }
    this.engine.endEdit(node, commit, value, st.original);
    this.host.onSheetChange?.(0);
    this.host.onFinish(node, commit, next);
  }

  /* ---------------------------- Escritorio ---------------------------- */
  private schedulePosition(): void {
    if (!this.st || this.rafPos) return;
    this.rafPos = requestAnimationFrame(() => {
      this.rafPos = 0;
      this.position();
    });
  }

  private autoGrow(): void {
    const st = this.st;
    if (!st) return;
    void st;
  }

  private position(): void {
    const st = this.st;
    if (!st) return;
    const node = this.currentNode();
    const g = node?.group?.node as Element | undefined;
    const textEl = g?.querySelector('.mmx-node-text') as HTMLElement | null;

    if (st.mobile) this.syncSheetHeight();
    if (!g || !textEl) return;

    const rect = textEl.getBoundingClientRect();
    const root = this.host.root.getBoundingClientRect();
    const s = this.engine.getScale() || 1;
    const cs = getComputedStyle(textEl);
    const w = Math.max(24, rect.width / s + 2);
    const h = Math.max(parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3, rect.height / s);

    const ta = st.ta;
    const wrap = st.wrap;
    wrap.style.cssText = `position:absolute;left:${rect.left - root.left}px;top:${rect.top - root.top}px;width:${w}px;height:${h}px;transform:scale(${s});transform-origin:0 0;z-index:40;`;
    ta.style.fontFamily = cs.fontFamily;
    ta.style.fontSize = cs.fontSize;
    ta.style.fontWeight = cs.fontWeight;
    ta.style.fontStyle = cs.fontStyle;
    ta.style.lineHeight = cs.lineHeight;
    ta.style.letterSpacing = cs.letterSpacing;
    ta.style.textAlign = cs.textAlign;
    ta.style.textDecoration = cs.textDecoration;
    ta.style.color = (g.querySelector('.mmx-node') as HTMLElement | null)?.style.color || cs.color;
    ta.style.caretColor = ta.style.color;
    ta.style.width = '100%';
    ta.style.height = '100%';
  }

  /* ------------------------------- Móvil ------------------------------ */
  private buildBar(): void {
    const st = this.st;
    if (!st) return;
    const bar = document.createElement('div');
    bar.className = 'mmx-edit-bar mmx-ui';
    bar.innerHTML = `
      <button type="button" data-ed="bold" aria-label="Negrita"><b>B</b></button>
      <button type="button" data-ed="italic" aria-label="Cursiva"><i>I</i></button>
      <button type="button" data-ed="math" aria-label="Fórmula">∑</button>
      <button type="button" data-ed="br" aria-label="Salto de línea">↵</button>
      <span class="mmx-edit-bar-sep"></span>
      <button type="button" data-ed="sibling" class="wide">+ Hermana</button>
      <button type="button" data-ed="child" class="wide">+ Hija</button>
      <button type="button" data-ed="cancel" class="danger" aria-label="Cancelar">✕</button>
      <button type="button" data-ed="done" class="done" aria-label="Listo"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
    st.bar = bar;
    this.host.root.appendChild(bar);

    // pointerdown con preventDefault evita que el teclado se cierre al tocar los botones
    bar.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('button')) e.preventDefault();
    });
    bar.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-ed]') as HTMLElement | null;
      if (!btn) return;
      switch (btn.dataset.ed) {
        case 'done':
          this.close(true);
          break;
        case 'cancel':
          this.close(false);
          break;
        case 'child':
          this.close(true, 'child');
          break;
        case 'sibling':
          this.close(true, 'sibling');
          break;
        case 'bold':
          this.wrapSelection('**');
          break;
        case 'italic':
          this.wrapSelection('*');
          break;
        case 'math':
          this.wrapSelection('$');
          break;
        case 'br':
          this.insertAtCursor('\n');
          break;
      }
    });

    requestAnimationFrame(() => {
      this.syncSheetHeight();
      this.engine.ensureNodeVisible(this.currentNode(), this.sheetHeight() + this.keyboardHeight() + 40);
    });
    window.setTimeout(() => {
      this.syncSheetHeight();
      this.engine.ensureNodeVisible(this.currentNode(), this.sheetHeight() + this.keyboardHeight() + 40);
    }, 320);
  }

  private sheetHeight(): number {
    return this.st?.mobile && this.st.bar ? this.st.bar.getBoundingClientRect().height + 8 : 0;
  }

  private keyboardHeight(): number {
    const vv = window.visualViewport;
    if (!vv) return 0;
    return Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
  }

  private syncSheetHeight(): void {
    if (!this.st?.mobile) return;
    const h = this.sheetHeight();
    this.host.onSheetChange?.(h);
  }

  private trackKeyboard(on: boolean): void {
    const vv = window.visualViewport;
    if (!vv) return;
    if (!on) {
      if (this.vvHandler) {
        vv.removeEventListener('resize', this.vvHandler);
        vv.removeEventListener('scroll', this.vvHandler);
        this.vvHandler = null;
      }
      this.host.root.style.removeProperty('--mmx-kb');
      return;
    }
    this.vvHandler = () => {
      const kb = this.keyboardHeight();
      this.host.root.style.setProperty('--mmx-kb', `${kb}px`);
      this.syncSheetHeight();
      if (this.st) this.engine.ensureNodeVisible(this.currentNode(), this.sheetHeight() + kb + 40);
    };
    vv.addEventListener('resize', this.vvHandler);
    vv.addEventListener('scroll', this.vvHandler);
    this.vvHandler();
  }

  public destroy(): void {
    if (this.st) {
      this.st.closing = true;
      this.st.wrap.remove();
      this.st.bar?.remove();
      try {
        this.engine.endEdit(this.currentNode(), true, this.st.ta.value.replace(/​/g, ''), this.st.original);
      } catch {
        /* ignore */
      }
      this.st = null;
    }
    this.trackKeyboard(false);
    cancelAnimationFrame(this.rafPos);
  }
}
