import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';

export interface FigmaSubdeckCallbacks {
  onBack: () => void;
  onSelectSubdeck: (subdeckId: string) => void;
  onAdd: (parentId: string) => void;
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
          <button class="figma-btn-white-pill" id="btn-sub-main-add" style="display:flex; align-items:center; gap:6px; font-weight:700;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Agregar</span>
          </button>
        </div>
      </div>

      <!-- Subdecks Container -->
      <div class="figma-card-container apple-glass-panel">
        ${
          subdecks.length === 0
            ? `
          <div style="padding:40px 20px; text-align:center;">
            <p style="color:var(--f-text-secondary); margin-bottom:14px;">No hay elementos en ${deck.name}.</p>
            <button class="figma-btn-white-pill" id="btn-create-child-empty" style="margin: 0 auto; display:inline-flex; align-items:center; gap:6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Agregar</span>
            </button>
          </div>
        `
            : subdecks
                .map((sub) => {
                  const s = deckService.getDeckStats(sub.id);
                  const isFolder = sub.icon === 'folder' || sub.icon === 'folder-sub';
                  return `
            <div class="figma-deck-row" data-subdeck-id="${sub.id}">
              <div class="figma-deck-left">
                <div class="figma-deck-folder-icon" style="background:${sub.color}15; border-color:${sub.color}; color:${sub.color};">
                  ${
                    isFolder
                      ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
                      : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`
                  }
                </div>
                <div>
                  <div class="figma-deck-title" style="font-size:1.05rem;">${sub.name}</div>
                  <div class="figma-deck-subtext">${isFolder ? 'Carpeta' : `Tarjetas para hoy: ${s.dueCards > 0 ? s.dueCards : s.totalCards}`}</div>
                </div>
              </div>

              <span class="figma-chevron">›</span>
            </div>
          `;
                })
                .join('')
        }
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
  container.querySelector('#btn-back-to-inicio')?.addEventListener('click', () => callbacks.onBack());
  container.querySelector('#crumb-inicio')?.addEventListener('click', () => callbacks.onBack());

  container.querySelectorAll('.figma-deck-row').forEach((row) => {
    row.addEventListener('click', () => {
      const id = (row as HTMLElement).dataset.subdeckId;
      if (id) callbacks.onSelectSubdeck(id);
    });
  });

  container.querySelector('#btn-sub-main-add')?.addEventListener('click', () => callbacks.onAdd(deck.id));
  container.querySelector('#btn-create-child-empty')?.addEventListener('click', () => callbacks.onAdd(deck.id));
}
