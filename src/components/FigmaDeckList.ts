import { deckService } from '../services/deck.service';

export interface FigmaDeckListCallbacks {
  onSelectDeck: (deckId: string) => void;
  onAddCard: () => void;
  onCreateDeck: () => void;
  onImportBatch: () => void;
  onManageDecks: () => void;
}

export function renderFigmaDeckList(): string {
  const rootDecks = deckService.getRootDecks();

  return `
    <div>
      <!-- Responsive Action Header -->
      <div class="figma-action-header">
        <h2 class="figma-view-title">Inicio</h2>

        <div class="figma-header-actions-group">
          <div class="figma-actions-mini-group">
            <button class="figma-icon-btn-dark" id="btn-trash-decks" title="Eliminar mazo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>

            <button class="figma-icon-btn-dark" id="btn-create-deck-top" title="Crear Carpeta / Mazo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
            </button>

            <button class="figma-icon-btn-dark" id="btn-edit-decks" title="Ajustes de Mazos">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>

          <button class="figma-btn-outline" id="btn-batch-import">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Importar</span>
          </button>

          <button class="figma-btn-blue-pill" id="btn-manual-add">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
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
                  d.icon === 'briefcase'
                    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`
                    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
                }
              </div>
              <div class="figma-deck-info-wrap">
                <span class="figma-deck-title">${d.name}</span>
                <div class="figma-deck-subtext">${d.description || 'Toca para abrir submazos'}</div>
              </div>
            </div>

            <span class="figma-chevron">›</span>
          </div>
        `
          )
          .join('')}
      </div>

      <!-- Floating Action Buttons (Desktop only, mobile uses bottom nav) -->
      <button class="figma-fab-gift desktop-only" id="btn-fab-gift" title="Recompensas y rachas">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
      </button>

      <button class="figma-fab-help desktop-only" id="btn-fab-help" title="Ayuda">
        ?
      </button>
    </div>
  `;
}

export function bindFigmaDeckListEvents(container: HTMLElement, callbacks: FigmaDeckListCallbacks): void {
  container.querySelectorAll<HTMLElement>('.figma-deck-row').forEach((row) => {
    row.addEventListener('click', () => {
      const id = row.dataset.deckId;
      if (id) callbacks.onSelectDeck(id);
    });
  });

  container.querySelector('#btn-manual-add')?.addEventListener('click', () => callbacks.onAddCard());
  container.querySelector('#btn-create-deck-top')?.addEventListener('click', () => callbacks.onCreateDeck());
  container.querySelector('#btn-batch-import')?.addEventListener('click', () => callbacks.onImportBatch());
  container.querySelector('#btn-edit-decks')?.addEventListener('click', () => callbacks.onManageDecks());

  container.querySelector('#btn-trash-decks')?.addEventListener('click', () => {
    const rootDecks = deckService.getRootDecks();
    if (rootDecks.length <= 1) {
      alert('Debes mantener al menos un mazo principal.');
      return;
    }
    const deckNames = rootDecks.map((d, i) => `${i + 1}. ${d.name}`).join('\n');
    const input = prompt(`Elige el número de mazo que deseas eliminar:\n${deckNames}`);
    if (input) {
      const idx = parseInt(input) - 1;
      if (idx >= 0 && idx < rootDecks.length) {
        const toDel = rootDecks[idx];
        if (confirm(`¿Eliminar mazo "${toDel.name}" y todas sus tarjetas?`)) {
          deckService.deleteDeck(toDel.id);
        }
      }
    }
  });
}
