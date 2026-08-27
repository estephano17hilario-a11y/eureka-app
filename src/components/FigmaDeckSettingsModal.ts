import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { openFigmaAlgorithmSelectorModal } from './FigmaAlgorithmSelectorModal';
import { openFigmaAdvancedDeckMenuModal } from './FigmaAdvancedDeckMenuModal';

export interface FigmaDeckSettingsModalOptions {
  deck: Deck;
  onSaved: () => void;
  onClose: () => void;
}

export function openFigmaDeckSettingsModal(options: FigmaDeckSettingsModalOptions): void {
  const existing = document.getElementById('modal-deck-settings-root');
  if (existing) existing.remove();

  const deck = options.deck;
  const algoLabel =
    deck.settings.algorithmType === 'fsrs'
      ? 'FSRS (Inteligente)'
      : deck.settings.algorithmType === 'quick'
      ? 'Revisión rápida'
      : deck.settings.algorithmType === 'languages'
      ? 'Aprendizaje de idiomas'
      : deck.settings.algorithmType === 'medical'
      ? 'Aprendizaje médico'
      : deck.settings.algorithmType === 'general'
      ? 'Repaso espaciado general'
      : 'Personalizado';

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-deck-settings-root">
      <div class="apple-glass-modal" style="max-width:540px;">
        
        <!-- Header -->
        <div class="figma-modal-header" style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">Ajustes de "${deck.name}"</h3>
          <button class="figma-btn-ghost" id="btn-close-deck-settings">×</button>
        </div>

        <div style="padding:20px; display:flex; flex-direction:column; gap:16px;">
          
          <!-- Card Container (Foto 1) -->
          <div class="apple-card-grouped">
            
            <!-- Row 1: Algoritmo -->
            <div class="apple-list-row" id="row-select-algo" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--f-blue)" stroke-width="2.5"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="10" y2="21"/></svg>
                <span style="font-size:1.02rem; font-weight:700; color:#fff;">${algoLabel}</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <!-- Row 2: Tarjetas nuevas por día -->
            <div class="apple-list-row" id="row-new-cards-day" style="cursor:pointer;">
              <span style="font-size:0.98rem; font-weight:600; color:#fff;">Tarjetas nuevas por día</span>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="color:var(--f-blue); font-weight:800; font-size:1.02rem;" id="val-new-cards">${deck.settings.newCardsPerDay}</span>
                <span class="apple-chevron">›</span>
              </div>
            </div>

            <!-- Row 3: Máximo de tarjetas por día -->
            <div class="apple-list-row" id="row-max-cards-day" style="cursor:pointer;">
              <span style="font-size:0.98rem; font-weight:600; color:#fff;">Máximo de tarjetas por día</span>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="color:var(--f-blue); font-weight:800; font-size:1.02rem;" id="val-max-cards">${deck.settings.maxReviewsPerDay}</span>
                <span class="apple-chevron">›</span>
              </div>
            </div>

            <!-- Row 4: Mezclar tarjetas -->
            <div class="apple-list-row">
              <div style="display:flex; align-items:center; gap:10px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Mezclar tarjetas</span>
              </div>
              <label class="figma-switch">
                <input type="checkbox" id="toggle-mix-cards" ${deck.settings.mixCards ? 'checked' : ''} />
                <span class="figma-slider"></span>
              </label>
            </div>

          </div>

          <!-- Bottom Button: Configuraciones avanzadas -->
          <button class="apple-btn-secondary" id="btn-open-advanced-deck-menu" style="width:100%; padding:14px; border-radius:14px; font-weight:700; font-size:0.98rem;">
            Configuraciones avanzadas
          </button>

        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const mixToggle = document.getElementById('toggle-mix-cards') as HTMLInputElement | null;
  mixToggle?.addEventListener('change', () => {
    deckService.updateDeck(deck.id, {
      settings: { ...deck.settings, mixCards: mixToggle.checked }
    });
  });

  // Edit new cards count
  document.getElementById('row-new-cards-day')?.addEventListener('click', () => {
    const val = prompt('Número de tarjetas nuevas por día:', String(deck.settings.newCardsPerDay));
    if (val && !isNaN(Number(val))) {
      const num = Math.max(1, parseInt(val, 10));
      deckService.updateDeck(deck.id, {
        settings: { ...deck.settings, newCardsPerDay: num }
      });
      const el = document.getElementById('val-new-cards');
      if (el) el.textContent = String(num);
    }
  });

  // Edit max reviews count
  document.getElementById('row-max-cards-day')?.addEventListener('click', () => {
    const val = prompt('Máximo de revisiones por día:', String(deck.settings.maxReviewsPerDay));
    if (val && !isNaN(Number(val))) {
      const num = Math.max(1, parseInt(val, 10));
      deckService.updateDeck(deck.id, {
        settings: { ...deck.settings, maxReviewsPerDay: num }
      });
      const el = document.getElementById('val-max-cards');
      if (el) el.textContent = String(num);
    }
  });

  // Open Algorithm Selector (Foto 3)
  document.getElementById('row-select-algo')?.addEventListener('click', () => {
    document.getElementById('modal-deck-settings-root')?.remove();
    openFigmaAlgorithmSelectorModal({
      deck,
      onSaved: () => {
        openFigmaDeckSettingsModal(options);
        options.onSaved();
      },
      onClose: () => {
        openFigmaDeckSettingsModal(options);
      }
    });
  });

  // Open Advanced Menu (Foto 2)
  document.getElementById('btn-open-advanced-deck-menu')?.addEventListener('click', () => {
    document.getElementById('modal-deck-settings-root')?.remove();
    openFigmaAdvancedDeckMenuModal({
      deck,
      onActionCompleted: () => {
        options.onSaved();
      },
      onClose: () => {
        openFigmaDeckSettingsModal(options);
      }
    });
  });

  const close = () => {
    document.getElementById('modal-deck-settings-root')?.remove();
    options.onClose();
  };

  document.getElementById('btn-close-deck-settings')?.addEventListener('click', close);
}
