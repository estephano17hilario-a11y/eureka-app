import { deckService } from '../services/deck.service';
import { katexService } from '../services/katex.service';
import { dialogService } from '../services/dialog.service';

export interface FigmaLibraryCallbacks {
  onAddCard: () => void;
  onEditCard: (cardId: string) => void;
  onStudySpecificCard: (deckId: string, cardId: string) => void;
}

export function renderFigmaLibraryView(): string {
  const allCards = deckService.getAllDecks().flatMap((d) => deckService.getCardsByDeck(d.id, false));

  return `
    <div style="padding-bottom:90px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
        <div>
          <h2 class="figma-dash-title">Biblioteca de Tarjetas</h2>
          <p class="figma-dash-subtitle">Explora y busca en todas las flashcards del sistema</p>
        </div>
        <button class="figma-btn-white-pill" id="btn-lib-add-card">+ Nueva Tarjeta</button>
      </div>

      <!-- Search Input -->
      <div class="figma-search-input-wrap" style="margin-bottom:20px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" class="figma-search-input" placeholder="Buscar por anverso, reverso o etiquetas..." id="lib-search-input" />
      </div>

      <!-- Cards Counter -->
      <div style="font-size:0.88rem; font-weight:700; color:var(--f-text-secondary); margin-bottom:14px;">
        Total: <strong style="color:#fff;">${allCards.length}</strong> tarjetas registradas
      </div>

      <!-- Cards Grid -->
      <div style="display:flex; flex-direction:column; gap:12px;" id="lib-cards-mount">
        ${allCards
          .map(
            (c) => `
          <div class="figma-card-item apple-glass-panel selectable-card-target" data-lib-card-id="${c.id}" data-lib-deck-id="${c.deckId}" style="cursor:pointer;" title="Toca para estudiar esta tarjeta">
            <div class="figma-card-top-tag-row" style="margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <div class="figma-tag-invertido" style="font-size:0.75rem; padding:2px 8px;">
                  ${
                    c.isInverted
                      ? '<span>⇄ Invertida</span>'
                      : c.type === 'latex'
                      ? '<span>📐 LaTeX</span>'
                      : '<span>Estándar</span>'
                  }
                </div>
                <span class="micro-study-badge" title="Estudiar">🎯</span>
              </div>

              <div style="display:flex; align-items:center; gap:8px;">
                <button class="btn-lib-card-edit" data-edit-id="${c.id}" style="background:none; border:none; color:var(--f-blue); cursor:pointer; font-size:0.85rem; font-weight:700;">✏️</button>
                <button class="btn-lib-card-del" data-del-id="${c.id}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.85rem; font-weight:700;">🗑️</button>
              </div>
            </div>

            <div class="figma-card-title-bold">${katexService.parseAndRender(c.front)}</div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

export function bindFigmaLibraryEvents(
  container: HTMLElement,
  callbacks: FigmaLibraryCallbacks
): void {
  container.querySelector('#btn-lib-add-card')?.addEventListener('click', () => callbacks.onAddCard());

  container.querySelectorAll('.selectable-card-target').forEach((card) => {
    card.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('btn-lib-card-edit') || target.classList.contains('btn-lib-card-del')) {
        return;
      }
      const cardId = (card as HTMLElement).dataset.libCardId;
      const deckId = (card as HTMLElement).dataset.libDeckId;
      if (cardId && deckId) {
        callbacks.onStudySpecificCard(deckId, cardId);
      }
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.btn-lib-card-edit').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.editId;
      if (id) callbacks.onEditCard(id);
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.btn-lib-card-del').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.delId;
      if (id) {
        dialogService.showConfirm({
          title: 'Eliminar Tarjeta',
          message: '¿Estás seguro de eliminar esta tarjeta definitivamente?',
          confirmText: 'Eliminar',
          isDanger: true,
          onConfirm: () => {
            deckService.deleteCard(id);
          }
        });
      }
    });
  });
}
