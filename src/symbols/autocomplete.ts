/**
 * Autocompletado de símbolos al escribir «\» en un cuadro de texto:
 *   \alf  → α     \raiz → $\sqrt{}$     \flecha → →     \sodio → Na
 * El catálogo se carga la primera vez que hace falta, así que adjuntarlo no cuesta nada.
 */

import { formulaAt, replaceRange } from './host';
import type { Sym } from './catalog';

type StudioModule = typeof import('./SymbolStudio');
type CatalogModule = typeof import('./catalog');

let modules: Promise<[CatalogModule, StudioModule]> | null = null;
const loadModules = (): Promise<[CatalogModule, StudioModule]> => {
  if (!modules) modules = Promise.all([import('./catalog'), import('./SymbolStudio')]);
  return modules;
};

const TRIGGER = /\\([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,24})$/;

export interface AutocompleteOptions {
  /** Se llama después de insertar (para refrescar vistas previas, etc.) */
  onInsert?: () => void;
}

/** Adjunta el autocompletado a un cuadro de texto. Devuelve la función para desmontarlo. */
export function attachSymbolAutocomplete(ta: HTMLTextAreaElement, options: AutocompleteOptions = {}): () => void {
  let pop: HTMLElement | null = null;
  let items: Sym[] = [];
  let active = 0;
  let navigated = false;
  let token: { start: number; end: number } | null = null;
  let seq = 0;

  const hide = () => {
    pop?.remove();
    pop = null;
    items = [];
    token = null;
    navigated = false;
  };

  const place = () => {
    if (!pop) return;
    const r = ta.getBoundingClientRect();
    const h = pop.offsetHeight;
    const below = window.innerHeight - r.bottom;
    const top = below > h + 12 || r.top < h + 12 ? Math.min(window.innerHeight - h - 8, r.bottom + 6) : r.top - h - 6;
    pop.style.top = `${Math.max(8, top)}px`;
    pop.style.left = `${Math.max(8, Math.min(window.innerWidth - pop.offsetWidth - 8, r.left))}px`;
  };

  const render = (preview: StudioModule['symPreview']) => {
    if (!items.length) return hide();
    if (!pop) {
      pop = document.createElement('div');
      pop.className = 'symac';
      pop.setAttribute('role', 'listbox');
      // El cuadro de texto no pierde el foco al elegir con el ratón o el dedo
      pop.addEventListener('pointerdown', (e) => e.preventDefault());
      pop.addEventListener('mousedown', (e) => e.preventDefault());
      pop.addEventListener('click', (e) => {
        const it = (e.target as HTMLElement).closest('[data-i]') as HTMLElement | null;
        if (it) accept(Number(it.dataset.i));
      });
      document.body.appendChild(pop);
    }
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    pop.innerHTML =
      items
        .map(
          (s, i) =>
            `<button type="button" class="symac-item ${i === active ? 'on' : ''}" data-i="${i}" role="option"><span class="pv">${preview(s)}</span><b>${esc(s.n)}</b><small>${esc(s.sub || '')}</small></button>`
        )
        .join('') + '<div class="symac-hint"><span><kbd>Tab</kbd> insertar · <kbd>↑↓</kbd> elegir</span><span><kbd>Esc</kbd> cerrar</span></div>';
    place();
  };

  const accept = (i: number) => {
    const s = items[i];
    const tk = token;
    if (!s || !tk) return hide();
    const inMath = !!formulaAt(ta.value, tk.start);
    let text: string;
    let caret: number | undefined;
    if (s.c && !(inMath && s.t)) text = s.c.replace(/#\?/g, '');
    else {
      const raw = s.t || '';
      const firstSlot = raw.indexOf('#?');
      const clean = raw.replace(/#\?/g, '');
      text = inMath ? clean : `$${clean}$`;
      if (firstSlot >= 0) caret = tk.start + firstSlot + (inMath ? 0 : 1);
      else if (inMath && /[a-zA-Z]$/.test(clean)) text += ' ';
    }
    hide();
    replaceRange(ta, tk.start, tk.end, text, caret);
    ta.focus({ preventScroll: true });
    options.onInsert?.();
    // Campo con fórmulas visibles: una plantilla con casillas se abre en el editor para rellenarlas
    const rf = ta as unknown as { rfEditAt?: (start: number) => void };
    if (caret !== undefined && rf.rfEditAt) rf.rfEditAt(tk.start);
  };

  const onInput = () => {
    const pos = ta.selectionStart ?? 0;
    if (pos !== ta.selectionEnd) return hide();
    const m = TRIGGER.exec(ta.value.slice(Math.max(0, pos - 26), pos));
    if (!m) return hide();
    const query = m[1];
    const mine = ++seq;
    void loadModules().then(([catalog, studio]) => {
      if (mine !== seq || !ta.isConnected) return;
      // Se busca por nombre («alfa») y por comando («\alpha»): lo que coincida antes
      const byName = catalog.searchSyms(query, 7);
      const byTex = catalog.searchSyms(`\\${query}`, 4);
      const seen = new Set<string>();
      items = [...byTex.filter((s) => s.t?.toLowerCase() === `\\${query.toLowerCase()}`), ...byName, ...byTex].filter((s) => {
        const k = catalog.symKey(s);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      }).slice(0, 7);
      active = 0;
      navigated = false;
      token = { start: pos - m[0].length, end: pos };
      render(studio.symPreview);
    });
  };

  const onKey = (e: KeyboardEvent) => {
    if (!pop || !items.length) return;
    const stop = () => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      stop();
      active = (active + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
      navigated = true;
      pop.querySelectorAll('.symac-item').forEach((el, i) => el.classList.toggle('on', i === active));
      pop.querySelector('.symac-item.on')?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Tab' || (e.key === 'Enter' && navigated)) {
      stop();
      accept(active);
    } else if (e.key === 'Escape') {
      stop();
      hide();
    }
  };

  const onBlur = () => window.setTimeout(hide, 120);

  // Captura: debe adelantarse a los atajos propios del editor (Tab, Enter, Esc)
  ta.addEventListener('keydown', onKey, true);
  ta.addEventListener('input', onInput);
  ta.addEventListener('blur', onBlur);
  window.addEventListener('scroll', place, true);

  return () => {
    hide();
    ta.removeEventListener('keydown', onKey, true);
    ta.removeEventListener('input', onInput);
    ta.removeEventListener('blur', onBlur);
    window.removeEventListener('scroll', place, true);
  };
}

/** Abre el estudio de símbolos cargándolo bajo demanda */
export async function openSymbolStudioLazy(options: import('./SymbolStudio').SymbolStudioOptions): Promise<import('./SymbolStudio').SymbolStudioHandle> {
  const [, studio] = await loadModules();
  return studio.openSymbolStudio(options);
}
