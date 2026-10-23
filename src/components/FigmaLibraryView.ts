import type { Flashcard } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { katexService } from '../services/katex.service';
import { dialogService } from '../services/dialog.service';

export interface FigmaLibraryCallbacks {
  onAddCard: () => void;
  onEditCard: (cardId: string) => void;
  onStudySpecificCard: (deckId: string, cardId: string) => void;
}

/** Cuántas tarjetas se pintan de una vez: pintar miles de fórmulas de golpe congela los equipos modestos. */
const PAGE = 40;

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function typeBadge(c: Flashcard): string {
  if (c.isInverted) return '<span>⇄ Invertida</span>';
  if (c.type === 'latex') return '<span>📐 LaTeX</span>';
  if (c.type === 'cloze') return '<span>🕳️ Huecos</span>';
  if (c.type === 'image_occlusion') return '<span>🔲 Oclusión</span>';
  return '<span>Estándar</span>';
}

function frontHtml(c: Flashcard): string {
  if (c.type === 'cloze') return katexService.renderCloze(c.front, false);
  return katexService.parseAndRender(c.front);
}

function cardRowHtml(c: Flashcard, deckName: string): string {
  const thumb = c.frontImage || c.occlusionImage;
  return `
    <div class="figma-card-item apple-glass-panel selectable-card-target" data-lib-card-id="${c.id}" data-lib-deck-id="${c.deckId}" style="cursor:pointer;" title="Toca para estudiar esta tarjeta">
      <div class="figma-card-top-tag-row" style="margin-bottom:6px;">
        <div style="display:flex; align-items:center; gap:8px; min-width:0;">
          <div class="figma-tag-invertido" style="font-size:0.75rem; padding:2px 8px;">${typeBadge(c)}</div>
          <span style="font-size:0.72rem; color:var(--f-text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(deckName)}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn-lib-card-edit" data-edit-id="${c.id}" aria-label="Editar" style="background:none; border:none; color:var(--f-blue); cursor:pointer; font-size:0.85rem; font-weight:700;">✏️</button>
          <button class="btn-lib-card-del" data-del-id="${c.id}" aria-label="Eliminar" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.85rem; font-weight:700;">🗑️</button>
        </div>
      </div>
      <div style="display:flex; gap:12px; align-items:flex-start;">
        ${thumb ? `<img src="${esc(thumb)}" alt="" loading="lazy" decoding="async" style="width:56px; height:56px; object-fit:cover; border-radius:10px; flex-shrink:0;" />` : ''}
        <div class="figma-card-title-bold" style="min-width:0;">${frontHtml(c)}</div>
      </div>
    </div>`;
}

function collectCards(): Flashcard[] {
  return deckService
    .getAllDecks()
    .flatMap((d) => deckService.getCardsByDeck(d.id, false))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function renderFigmaLibraryView(): string {
  const all = collectCards();
  const names = new Map(deckService.getAllDecks().map((d) => [d.id, d.name]));
  const first = all.slice(0, PAGE);

  return `
    <div style="padding-bottom:90px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
        <div>
          <h2 class="figma-dash-title">Biblioteca de Tarjetas</h2>
          <p class="figma-dash-subtitle">Explora y busca en todas las flashcards del sistema</p>
        </div>
        <button class="figma-btn-white-pill" id="btn-lib-add-card">+ Nueva Tarjeta</button>
      </div>

      <div class="figma-search-input-wrap" style="margin-bottom:20px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" class="figma-search-input" placeholder="Buscar por anverso o reverso..." id="lib-search-input" autocomplete="off" />
      </div>

      <div id="lib-counter" style="font-size:0.88rem; font-weight:700; color:var(--f-text-secondary); margin-bottom:14px;">
        Total: <strong style="color:#fff;">${all.length}</strong> tarjetas registradas
      </div>

      <div style="display:flex; flex-direction:column; gap:12px;" id="lib-cards-mount">
        ${first.map((c) => cardRowHtml(c, names.get(c.deckId) || '')).join('')}
      </div>
      <button class="apple-btn-secondary ${all.length > PAGE ? '' : 'hidden'}" id="lib-more" style="display:${all.length > PAGE ? 'block' : 'none'}; margin:18px auto 0; padding:12px 24px; border-radius:9999px; font-weight:700;">Mostrar más</button>
    </div>
  `;
}

export function bindFigmaLibraryEvents(
  container: HTMLElement,
  callbacks: FigmaLibraryCallbacks
): void {
  const mount = container.querySelector('#lib-cards-mount') as HTMLElement | null;
  const moreBtn = container.querySelector('#lib-more') as HTMLButtonElement | null;
  const counter = container.querySelector('#lib-counter') as HTMLElement | null;
  const search = container.querySelector('#lib-search-input') as HTMLInputElement | null;
  if (!mount) return;

  const all = collectCards();
  const names = new Map(deckService.getAllDecks().map((d) => [d.id, d.name]));
  let filtered = all;
  let shown = Math.min(PAGE, all.length);

  const plain = (c: Flashcard) => `${c.front} ${c.back}`.toLowerCase();

  const paint = (reset: boolean) => {
    if (reset) mount.innerHTML = '';
    const from = reset ? 0 : mount.children.length;
    const to = Math.min(from + (reset ? PAGE : PAGE), filtered.length);
    const html = filtered.slice(from, to).map((c) => cardRowHtml(c, names.get(c.deckId) || '')).join('');
    mount.insertAdjacentHTML('beforeend', html);
    shown = to;
    if (moreBtn) moreBtn.style.display = shown < filtered.length ? 'block' : 'none';
    if (counter) {
      counter.innerHTML = search?.value.trim()
        ? `<strong style="color:#fff;">${filtered.length}</strong> resultados de ${all.length}`
        : `Total: <strong style="color:#fff;">${all.length}</strong> tarjetas registradas`;
    }
  };

  container.querySelector('#btn-lib-add-card')?.addEventListener('click', () => callbacks.onAddCard());
  moreBtn?.addEventListener('click', () => paint(false));

  let timer = 0;
  search?.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const q = search.value.trim().toLowerCase();
      filtered = q ? all.filter((c) => plain(c).includes(q)) : all;
      paint(true);
    }, 180);
  });

  // Delegación: funciona con las tarjetas que se van añadiendo al pintar más
  mount.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const edit = t.closest('.btn-lib-card-edit') as HTMLElement | null;
    if (edit) {
      e.stopPropagation();
      if (edit.dataset.editId) callbacks.onEditCard(edit.dataset.editId);
      return;
    }
    const del = t.closest('.btn-lib-card-del') as HTMLElement | null;
    if (del) {
      e.stopPropagation();
      const id = del.dataset.delId;
      if (!id) return;
      dialogService.showConfirm({
        title: 'Eliminar Tarjeta',
        message: '¿Estás seguro de eliminar esta tarjeta definitivamente?',
        confirmText: 'Eliminar',
        isDanger: true,
        onConfirm: () => {
          deckService.deleteCard(id);
        }
      });
      return;
    }
    const card = t.closest('.selectable-card-target') as HTMLElement | null;
    if (card) {
      const cardId = card.dataset.libCardId;
      const deckId = card.dataset.libDeckId;
      if (cardId && deckId) callbacks.onStudySpecificCard(deckId, cardId);
    }
  });
}
