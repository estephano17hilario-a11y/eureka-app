import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';

export interface DeckTreeCallbacks {
  onStudyDeck: (deckId: string) => void;
  onAddCard: (deckId: string) => void;
  onCreateSubdeck: (parentId: string) => void;
  onConfigureDeck: (deckId: string) => void;
  onCreateDeck: () => void;
}

export function renderDeckTree(): string {
  const rootDecks = deckService.getRootDecks();

  return `
    <div class="deck-tree-container">
      <div class="section-title-apple">
        <span>Mis Mazos</span>
        <button class="btn-apple-mini" id="btn-create-root-deck">
          + Nuevo Mazo
        </button>
      </div>

      ${
        rootDecks.length === 0
          ? `
        <div class="apple-grouped-list" style="padding:30px; text-align:center;">
          <p style="color:var(--ios-secondary-label); margin-bottom:12px;">No tienes ningún mazo creado.</p>
          <button class="btn-apple-add" id="btn-create-first-deck" style="margin: 0 auto;">
            + Crear Primer Mazo
          </button>
        </div>
      `
          : `
        <div class="apple-grouped-list">
          ${rootDecks.map((d) => renderDeckRow(d, 0)).join('')}
        </div>
      `
      }
    </div>
  `;
}

function renderDeckRow(deck: Deck, depth: number): string {
  const subdecks = deckService.getSubdecks(deck.id);
  const stats = deckService.getDeckStats(deck.id);
  const indentStyle = depth > 0 ? `padding-left: ${depth * 20 + 16}px; background: rgba(28,28,30,0.6);` : '';

  return `
    <div class="apple-list-item" style="${indentStyle}" data-deck-id="${deck.id}">
      <div class="apple-item-left" data-action="study" data-deck-id="${deck.id}">
        <div class="apple-item-icon" style="background:${deck.color};">
          ${
            depth > 0
              ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`
              : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`
          }
        </div>
        <div class="apple-item-text">
          <span class="apple-item-title">${deck.name}</span>
          <span class="apple-item-sub">${stats.totalCards} tarjetas • ${stats.dueCards} por repasar</span>
        </div>
      </div>

      <div class="apple-item-right">
        <div class="apple-quick-actions">
          <button class="btn-apple-mini primary" data-action="study" data-deck-id="${deck.id}">
            Estudiar (${stats.dueCards})
          </button>
          <button class="btn-apple-mini" data-action="add-card" data-deck-id="${deck.id}" title="Añadir tarjeta">
            +
          </button>
          <button class="btn-apple-mini" data-action="settings" data-deck-id="${deck.id}" title="Configuración">
            ⚙️
          </button>
        </div>
      </div>
    </div>

    ${subdecks.map((s) => renderDeckRow(s, depth + 1)).join('')}
  `;
}

export function bindDeckTreeEvents(container: HTMLElement, callbacks: DeckTreeCallbacks): void {
  container.querySelector('#btn-create-root-deck')?.addEventListener('click', () => callbacks.onCreateDeck());
  container.querySelector('#btn-create-first-deck')?.addEventListener('click', () => callbacks.onCreateDeck());

  container.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
    if (!target) return;

    const action = target.dataset.action;
    const deckId = target.dataset.deckId;
    if (!deckId) return;

    if (action === 'study') {
      callbacks.onStudyDeck(deckId);
    } else if (action === 'add-card') {
      callbacks.onAddCard(deckId);
    } else if (action === 'subdeck') {
      callbacks.onCreateSubdeck(deckId);
    } else if (action === 'settings') {
      callbacks.onConfigureDeck(deckId);
    }
  });
}
