import '../ui/styles/deck-appearance.css';
import type { Deck } from '../types/flashcard';

/** Paleta rápida para mazos y carpetas. */
export const DECK_COLORS = [
  '#38bdf8', '#22d3ee', '#10b981', '#84cc16', '#f59e0b', '#f97316',
  '#ef4444', '#ec4899', '#a855f7', '#6366f1', '#94a3b8', '#f5d0a9'
];

/** Símbolos disponibles (emoji: sincronizan entre dispositivos sin ningún archivo extra). */
export const DECK_GLYPHS = [
  '📚', '📖', '🧠', '🔬', '🧪', '🧮', '📐', '🌍', '🗺️', '🏛️', '⚖️', '💻',
  '🩺', '🧬', '⚙️', '🎨', '🎵', '💬', '✈️', '🍎', '⭐', '🔥', '💡', '🎯'
];

const FOLDER_SVG = (size: number) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
const DECK_SVG = (size: number) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`;

/** Contenido del cuadro de icono: el símbolo elegido o el icono estándar de carpeta/mazo. */
export function deckGlyphHtml(deck: Pick<Deck, 'glyph'>, isFolder: boolean, size = 22): string {
  if (deck.glyph) return `<span class="dk-glyph" style="font-size:${Math.round(size * 0.95)}px;line-height:1;">${deck.glyph}</span>`;
  return isFolder ? FOLDER_SVG(size) : DECK_SVG(size);
}

export interface Appearance {
  color: string;
  glyph: string; // '' = estándar
}

const esc = (s: string) => s.replace(/"/g, '&quot;');

/** Sección "Aspecto" de los diálogos de edición: color + símbolo con vista previa en vivo. */
export function appearanceEditorHtml(initial: Appearance, isFolder: boolean): string {
  const colorBtns = DECK_COLORS.map(
    (c) => `<button type="button" class="dk-ap-color" data-color="${c}" style="background:${c};" aria-label="Color ${c}"></button>`
  ).join('');
  const glyphBtns = DECK_GLYPHS.map((g) => `<button type="button" class="dk-ap-glyph" data-glyph="${esc(g)}">${g}</button>`).join('');
  return `
    <div class="dk-ap" data-folder="${isFolder ? 1 : 0}">
      <div class="dk-ap-head">
        <div class="dk-ap-preview" style="background:${initial.color}22;border-color:${initial.color};color:${initial.color};">${deckGlyphHtml({ glyph: initial.glyph }, isFolder, 24)}</div>
        <div class="dk-ap-head-txt">Aspecto<small>Icono y color ${isFolder ? 'de la carpeta' : 'del mazo'}</small></div>
      </div>
      <div class="dk-ap-label">Color</div>
      <div class="dk-ap-colors">
        ${colorBtns}
        <label class="dk-ap-custom" title="Otro color"><input type="color" value="${initial.color}" /><span>＋</span></label>
      </div>
      <div class="dk-ap-label">Icono</div>
      <div class="dk-ap-glyphs">
        <button type="button" class="dk-ap-glyph dk-ap-default" data-glyph="">${isFolder ? FOLDER_SVG(20) : DECK_SVG(20)}</button>
        ${glyphBtns}
      </div>
    </div>`;
}

/** Conecta el editor de aspecto dentro de `root` y devuelve una función para leer la elección actual. */
export function bindAppearanceEditor(root: HTMLElement, initial: Appearance): () => Appearance {
  const state: Appearance = { ...initial };
  const ap = root.querySelector('.dk-ap') as HTMLElement | null;
  if (!ap) return () => state;
  const isFolder = ap.dataset.folder === '1';
  const preview = ap.querySelector('.dk-ap-preview') as HTMLElement;
  const picker = ap.querySelector('input[type=color]') as HTMLInputElement;

  const paint = () => {
    preview.style.background = `${state.color}22`;
    preview.style.borderColor = state.color;
    preview.style.color = state.color;
    preview.innerHTML = deckGlyphHtml({ glyph: state.glyph }, isFolder, 24);
    ap.querySelectorAll<HTMLElement>('.dk-ap-color').forEach((b) => b.classList.toggle('on', b.dataset.color === state.color));
    ap.querySelectorAll<HTMLElement>('.dk-ap-glyph').forEach((b) => b.classList.toggle('on', (b.dataset.glyph || '') === state.glyph));
    picker.value = /^#[0-9a-f]{6}$/i.test(state.color) ? state.color : '#38bdf8';
  };

  ap.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const color = t.closest<HTMLElement>('.dk-ap-color');
    const glyph = t.closest<HTMLElement>('.dk-ap-glyph');
    if (color) {
      state.color = color.dataset.color || state.color;
      paint();
    } else if (glyph) {
      state.glyph = glyph.dataset.glyph || '';
      paint();
    }
  });
  picker.addEventListener('input', () => {
    state.color = picker.value;
    paint();
  });

  paint();
  return () => ({ ...state });
}
