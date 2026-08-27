import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { dialogService } from '../services/dialog.service';
import { openFigmaDeckSettingsModal } from './FigmaDeckSettingsModal';

export interface FigmaSubdeckCallbacks {
  onBack: () => void;
  onSelectSubdeck: (subdeckId: string) => void;
  onAddCard: (deckId: string) => void;
  onImportBatch: (deckId: string) => void;
  onConfigureDeck: (deckId: string) => void;
}

export function renderFigmaSubdeckList(deck: Deck): string {
  const subdecks = deckService.getSubdecks(deck.id);

  return `
    <div>
      <!-- Action Header with Breadcrumbs -->
      <div class="figma-action-header">
        <div class="figma-breadcrumbs">
          <button class="figma-icon-btn-dark" id="btn-back-to-inicio" style="margin-right:6px;" title="Volver a Inicio">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <span class="figma-crumb-link" id="crumb-inicio">Inicio</span>
          <span class="figma-crumb-sep">/</span>
          <span class="figma-crumb-current">${deck.name}</span>
        </div>

        <div class="figma-header-actions-group">
          <button class="figma-icon-btn-dark" id="btn-edit-subdeck" title="Ajustes de Mazo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>

          <button class="figma-btn-outline" id="btn-sub-import">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Importar en lote
          </button>

          <button class="figma-btn-white-pill" id="btn-sub-manual-add">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Agregar manualmente
          </button>

          <button class="figma-icon-btn-dark" id="btn-subdeck-menu" title="Ajustes del Mazo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>

      <!-- Subdecks Container -->
      <div class="figma-card-container apple-glass-panel">
        ${
          subdecks.length === 0
            ? `
          <div style="padding:40px 20px; text-align:center;">
            <p style="color:var(--f-text-secondary); margin-bottom:14px;">No hay submazos en ${deck.name}.</p>
            <button class="figma-btn-blue-pill" id="btn-create-child-subdeck" style="margin: 0 auto;">
              + Crear Submazo
            </button>
          </div>
        `
            : subdecks
                .map((sub) => {
                  const s = deckService.getDeckStats(sub.id);
                  return `
            <div class="figma-deck-row" data-subdeck-id="${sub.id}">
              <div class="figma-deck-left">
                <div style="color:var(--f-text-muted); font-size:1.3rem; font-weight:700;">+</div>
                <div>
                  <div class="figma-deck-title" style="font-size:1.15rem;">${sub.name}</div>
                  <div class="figma-deck-subtext">Tarjetas para hoy: ${s.dueCards > 0 ? s.dueCards : s.totalCards}</div>
                </div>
              </div>

              <span class="figma-chevron">›</span>
            </div>
          `;
                })
          })
          .join('')}
      </div>
    </div>
  `;
}

export function bindFigmaSubdeckEvents(
  container: HTMLElement,
  deck: Deck,
  callbacks: FigmaSubdeckCallbacks
): void {
  container.querySelector('#btn-subdeck-back')?.addEventListener('click', () => callbacks.onBack());
  container.querySelector('#crumb-inicio')?.addEventListener('click', () => callbacks.onBack());

  container.querySelectorAll('.figma-deck-card').forEach((row) => {
    row.addEventListener('click', () => {
      const id = (row as HTMLElement).dataset.subdeckId;
      if (id) callbacks.onSelectSubdeck(id);
    });
  });

  const openSettings = () => {
    openFigmaDeckSettingsModal({
      deck,
      onSaved: () => callbacks.onConfigureDeck(deck.id),
      onClose: () => {}
    });
  };

  container.querySelector('#btn-edit-subdeck')?.addEventListener('click', openSettings);
  container.querySelector('#btn-subdeck-menu')?.addEventListener('click', openSettings);

  container.querySelector('#btn-sub-manual-add')?.addEventListener('click', () => callbacks.onAddCard(deck.id));
  container.querySelector('#btn-sub-import')?.addEventListener('click', () => callbacks.onImportBatch(deck.id));

  container.querySelector('#btn-create-child-subdeck')?.addEventListener('click', () => {
    dialogService.showPrompt({
      title: `Nuevo Submazo en "${deck.name}"`,
      placeholder: 'Nombre del submazo...',
      confirmText: 'Crear',
      onConfirm: (name) => {
        if (name && name.trim()) {
          deckService.createDeck({
            name: name.trim(),
            parentId: deck.id
          });
          callbacks.onConfigureDeck(deck.id);
        }
      }
    });
  });
}
