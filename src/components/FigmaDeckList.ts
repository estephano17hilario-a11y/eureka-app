import { deckService } from '../services/deck.service';

export interface FigmaDeckListCallbacks {
  onSelectDeck: (deckId: string) => void;
  onAdd: () => void;
}

export function renderFigmaDeckList(): string {
  const rootDecks = deckService.getRootDecks();

  return `
    <div>
      <!-- Responsive Action Header -->
      <div class="figma-action-header">
        <h2 class="figma-view-title">Inicio</h2>

        <div class="figma-header-actions-group">
          <button class="figma-btn-white-pill" id="btn-main-add" style="display:flex; align-items:center; gap:6px; font-weight:700;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Agregar</span>
          </button>
        </div>
      </div>

      <!-- Main Deck List Container -->
      <div class="figma-card-container apple-glass-panel">
        ${rootDecks
          .map(
            (d) => `
          <div class="figma-deck-row" data-deck-id="${d.id}">
            <div class="figma-deck-left">
              <div class="figma-deck-folder-icon" style="background:${d.color}15; border-color:${d.color}; color:${d.color};">
                ${
                  d.icon === 'deck'
                    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`
                    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
                }
              </div>
              <div class="figma-deck-info-wrap">
                <span class="figma-deck-title">${d.name}</span>
                <div class="figma-deck-subtext">${d.description || (d.icon === 'deck' ? 'Mazo de tarjetas' : 'Carpeta de temas')}</div>
              </div>
            </div>

            <span class="figma-chevron">›</span>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

export function bindFigmaDeckListEvents(container: HTMLElement, callbacks: FigmaDeckListCallbacks): void {
  container.querySelectorAll('.figma-deck-row').forEach((card) => {
    card.addEventListener('click', () => {
      const id = (card as HTMLElement).dataset.deckId;
      if (id) callbacks.onSelectDeck(id);
    });
  });

  container.querySelector('#btn-main-add')?.addEventListener('click', () => callbacks.onAdd());
}
