/**
 * Adaptadores entre el teclado de símbolos y el sitio donde se escribe (cuadro de texto de una tarjeta,
 * idea de un mapa mental, campo matemático…). Es un módulo ligero: no carga el catálogo.
 */

export interface SymbolHost {
  /** Inserta texto plano en el cursor. `caretBack` retrocede el cursor esos caracteres tras insertar */
  insertText(text: string, caretBack?: number): void;
  /** Inserta una fórmula LaTeX; el anfitrión añade los delimitadores $ si hacen falta */
  insertMath(latex: string, block?: boolean): void;
  /** ¿El cursor está dentro de una fórmula? */
  inMath(): boolean;
  /** Fórmula bajo el cursor, para editarla en el sitio (la siguiente inserción la reemplaza) */
  pickFormula?(): { latex: string; block: boolean } | null;
  /** Devuelve el foco al cuadro de texto */
  refocus?(): void;
  /** El destino solo admite fórmulas (los caracteres sueltos se insertan como \text{}) */
  mathOnly?: boolean;
}

export interface FormulaRange {
  start: number;
  end: number;
  latex: string;
  block: boolean;
}

const FORMULA_RE = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;

/** Fórmulas ($…$ y $$…$$) de un texto, con su posición */
export function formulaRanges(text: string): FormulaRange[] {
  const out: FormulaRange[] = [];
  FORMULA_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = FORMULA_RE.exec(text)) !== null) {
    out.push({ start: m.index, end: m.index + m[0].length, latex: m[1] ?? m[2], block: m[1] !== undefined });
  }
  return out;
}

export function formulaAt(text: string, pos: number): FormulaRange | null {
  for (const r of formulaRanges(text)) {
    if (pos > r.start && pos < r.end) return r;
    // Cursor pegado a un delimitador: también cuenta como "en la fórmula"
    if (pos === r.start + (r.block ? 2 : 1) || pos === r.end - (r.block ? 2 : 1)) return r;
  }
  return null;
}

export const isCoarsePointer = (): boolean =>
  typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 760);

type TextEl = HTMLTextAreaElement | HTMLInputElement;

/** Reemplaza un rango del cuadro de texto avisando a quien escuche el evento `input` */
export function replaceRange(el: TextEl, start: number, end: number, text: string, caret?: number): void {
  el.setRangeText(text, start, end, 'end');
  if (caret !== undefined) el.setSelectionRange(caret, caret);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Anfitrión para un <textarea> / <input> con sintaxis Markdown + KaTeX ($…$).
 * `get` se evalúa en cada operación para que siga funcionando aunque el cuadro se vuelva a crear.
 */
export function textareaHost(get: () => TextEl | null, onChange?: () => void, initialEditing?: { start: number; end: number; latex: string; block: boolean }): SymbolHost {
  // Si se abre desde una fórmula ya escrita, la siguiente inserción la reemplaza en su sitio
  let editing: FormulaRange | null = initialEditing ? { ...initialEditing } : null;

  const sel = (el: TextEl): [number, number] => [el.selectionStart ?? el.value.length, el.selectionEnd ?? el.value.length];
  const after = (el: TextEl) => {
    onChange?.();
    // En escritorio se sigue escribiendo; en el móvil no se levanta el teclado del sistema
    if (!isCoarsePointer()) el.focus({ preventScroll: true });
  };

  return {
    insertText(text, caretBack = 0) {
      const el = get();
      if (!el) return;
      const [a, b] = sel(el);
      editing = null;
      replaceRange(el, a, b, text, caretBack ? a + text.length - caretBack : undefined);
      after(el);
    },

    insertMath(latex, block = false) {
      const el = get();
      if (!el) return;
      // Al editar una fórmula en bloque ($$…$$) sigue siendo un bloque
      const asBlock = block || !!editing?.block;
      const wrap = (s: string) => (asBlock ? `$$${s}$$` : `$${s}$`);
      if (editing && el.value.slice(editing.start, editing.end).includes(editing.latex)) {
        replaceRange(el, editing.start, editing.end, wrap(latex));
        editing = null;
        return after(el);
      }
      block = asBlock;
      editing = null;
      const [a, b] = sel(el);
      const inside = formulaAt(el.value, a);
      if (inside) {
        const before = el.value[a - 1];
        replaceRange(el, a, b, `${before && !/[\s{(\[$]/.test(before) ? ' ' : ''}${latex} `);
        return after(el);
      }
      const prev = el.value[a - 1];
      const next = el.value[b];
      const lead = block ? (a > 0 && prev !== '\n' ? '\n' : '') : prev && !/\s|[([{¿¡]/.test(prev) ? ' ' : '';
      const trail = block ? (next !== undefined && next !== '\n' ? '\n' : '') : next && !/\s|[.,;:!?)\]}]/.test(next) ? ' ' : '';
      replaceRange(el, a, b, lead + wrap(latex) + trail);
      after(el);
    },

    inMath() {
      const el = get();
      return !!el && !!formulaAt(el.value, sel(el)[0]);
    },

    pickFormula() {
      const el = get();
      if (!el) return null;
      // Campo con fórmulas visibles: la fórmula pulsada o seleccionada
      const rf = (el as unknown as { rfSelected?: () => FormulaRange | null }).rfSelected?.();
      if (rf) {
        editing = { start: rf.start, end: rf.end, latex: rf.latex, block: rf.block };
        return { latex: rf.latex, block: rf.block };
      }
      const [a, b] = sel(el);
      const r = formulaAt(el.value, a);
      if (r && b <= r.end) {
        editing = r;
        return { latex: r.latex, block: r.block };
      }
      // Texto seleccionado sin delimitadores: se toma como base de la fórmula y se sustituye al insertar
      if (b > a && b - a < 400 && !el.value.slice(a, b).includes('\n')) {
        const raw = el.value.slice(a, b);
        editing = { start: a, end: b, latex: raw, block: false };
        return { latex: raw, block: false };
      }
      editing = null;
      return null;
    },

    refocus() {
      get()?.focus({ preventScroll: true });
    }
  };
}

/** Anfitrión mínimo basado en una función (compatibilidad con el asistente de fórmulas anterior) */
export function callbackHost(onInsert: (text: string) => void): SymbolHost {
  return {
    insertText: (text) => onInsert(text),
    insertMath: (latex, block) => onInsert(block ? `$$${latex}$$` : `$${latex}$`),
    inMath: () => false
  };
}

/** Anfitrión para un <math-field> de MathLive (responder escribiendo, etc.) */
export function mathfieldHost(get: () => any): SymbolHost {
  const ins = (latex: string) => {
    const mf = get();
    if (!mf) return;
    try {
      mf.insert(latex, { selectionMode: 'placeholder', format: 'latex' });
      mf.dispatchEvent(new Event('input', { bubbles: true }));
    } catch {
      /* el campo ya no existe */
    }
  };
  return {
    mathOnly: true,
    insertText: (text) => ins(/^[\x20-\x7e]+$/.test(text) ? text : `\\text{${text}}`),
    insertMath: (latex) => ins(latex),
    inMath: () => true,
    refocus: () => get()?.focus?.()
  };
}
