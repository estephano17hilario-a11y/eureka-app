import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { dialogService } from '../services/dialog.service';
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

  const modal = document.createElement('div');
  modal.id = 'modal-deck-settings-root';
  modal.className = 'apple-modal-overlay';
  modal.innerHTML = `
    <div class="apple-modal-content apple-glass-panel" style="max-width:520px; width:92%; padding:0; overflow:hidden;">
      
      <!-- Header -->
      <div style="padding:20px 24px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between;">
        <div>
          <span style="font-size:0.75rem; font-weight:800; color:var(--f-text-muted); text-transform:uppercase;">Ajustes de Mazo</span>
          <h2 style="font-size:1.4rem; font-weight:800; color:#fff; letter-spacing:-0.02em;">${deck.name}</h2>
        </div>
        <button id="btn-close-deck-settings" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.4rem; cursor:pointer; padding:4px;">✕</button>
      </div>

      <!-- Body Rows -->
      <div style="padding:20px 24px; display:flex; flex-direction:column; gap:16px;">
        
        <!-- Algorithm Selector Row -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="row-select-algo" style="cursor:pointer;">
            <div style="font-size:0.95rem; font-weight:600; color:#fff;">Algoritmo de aprendizaje</div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:var(--f-blue); font-weight:800; font-size:0.95rem;" id="val-algo-label">${algoLabel}</span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>

          <div class="apple-list-row">
            <div style="font-size:0.95rem; font-weight:600; color:#fff;">Mezclar tarjetas</div>
            <label class="apple-switch">
              <input type="checkbox" id="toggle-mix-cards" ${deck.settings.mixCards ? 'checked' : ''} />
              <span class="apple-slider"></span>
            </label>
          </div>
        </div>

        <!-- Limits -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="row-new-cards-day" style="cursor:pointer;">
            <div style="font-size:0.95rem; font-weight:600; color:#fff;">Tarjetas nuevas por día</div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:var(--f-blue); font-weight:800; font-size:1.05rem;" id="val-new-cards">${deck.settings.newCardsPerDay}</span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>

          <div class="apple-list-row" id="row-max-cards-day" style="cursor:pointer;">
            <div style="font-size:0.95rem; font-weight:600; color:#fff;">Máximo de tarjetas por día</div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:var(--f-blue); font-weight:800; font-size:1.05rem;" id="val-max-cards">${deck.settings.maxReviewsPerDay}</span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>
        </div>

        <!-- Neuro-Ergonomic Micro-Games Section -->
        <div class="apple-card-grouped">
          <div class="apple-list-row">
            <div>
              <div style="font-size:0.95rem; font-weight:600; color:#fff;">🎮 Minijuegos de descanso</div>
              <div style="font-size:0.75rem; color:var(--f-text-muted);">Sin carga alostática ni fatiga</div>
            </div>
            <label class="apple-switch">
              <input type="checkbox" id="toggle-microgames" ${deck.settings.enableMicroGames !== false ? 'checked' : ''} />
              <span class="apple-slider"></span>
            </label>
          </div>

          <div class="apple-list-row" id="row-microgame-freq" style="cursor:pointer;">
            <div style="font-size:0.95rem; font-weight:600; color:#fff;">Frecuencia de juego</div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:var(--f-blue); font-weight:800; font-size:0.95rem;" id="val-microgame-freq">
                ${(deck.settings.microGameInterval || 5) === 0 ? 'Desactivado' : `Cada ${deck.settings.microGameInterval || 5} tarjetas`}
              </span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>
        </div>

        <!-- Advanced settings button -->
        <button class="apple-btn-secondary" id="btn-open-advanced-menu" style="padding:14px; border-radius:14px; font-weight:700; font-size:0.95rem;">
          Configuraciones avanzadas
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  const close = () => {
    modal.remove();
    options.onClose();
  };

  modal.querySelector('#btn-close-deck-settings')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  const mixToggle = modal.querySelector('#toggle-mix-cards') as HTMLInputElement | null;
  mixToggle?.addEventListener('change', () => {
    deckService.updateDeck(deck.id, {
      settings: { ...deck.settings, mixCards: mixToggle.checked }
    });
  });

  const microToggle = modal.querySelector('#toggle-microgames') as HTMLInputElement | null;
  microToggle?.addEventListener('change', () => {
    deckService.updateDeck(deck.id, {
      settings: { ...deck.settings, enableMicroGames: microToggle.checked }
    });
  });

  // Frequency selector
  modal.querySelector('#row-microgame-freq')?.addEventListener('click', () => {
    dialogService.showPrompt({
      title: 'Frecuencia de Minijuegos',
      message: '¿Cada cuántas tarjetas deseas una pausa de minijuego? (ej: 5, 10, 15, 20 o 0 para desactivar)',
      defaultValue: String(deck.settings.microGameInterval !== undefined ? deck.settings.microGameInterval : 5),
      inputType: 'number',
      confirmText: 'Guardar',
      onConfirm: (val) => {
        if (val !== null && !isNaN(Number(val))) {
          const num = Math.max(0, parseInt(val, 10));
          deckService.updateDeck(deck.id, {
            settings: { ...deck.settings, microGameInterval: num, enableMicroGames: num > 0 }
          });
          const el = modal.querySelector('#val-microgame-freq');
          if (el) el.textContent = num === 0 ? 'Desactivado' : `Cada ${num} tarjetas`;
        }
      }
    });
  });

  // Edit new cards count
  modal.querySelector('#row-new-cards-day')?.addEventListener('click', () => {
    dialogService.showPrompt({
      title: 'Tarjetas Nuevas por Día',
      defaultValue: String(deck.settings.newCardsPerDay),
      inputType: 'number',
      confirmText: 'Guardar',
      onConfirm: (val) => {
        if (val && !isNaN(Number(val))) {
          const num = Math.max(1, parseInt(val, 10));
          deckService.updateDeck(deck.id, {
            settings: { ...deck.settings, newCardsPerDay: num }
          });
          const el = modal.querySelector('#val-new-cards');
          if (el) el.textContent = String(num);
        }
      }
    });
  });

  // Edit max reviews count
  modal.querySelector('#row-max-cards-day')?.addEventListener('click', () => {
    dialogService.showPrompt({
      title: 'Máximo de Tarjetas por Día',
      defaultValue: String(deck.settings.maxReviewsPerDay),
      inputType: 'number',
      confirmText: 'Guardar',
      onConfirm: (val) => {
        if (val && !isNaN(Number(val))) {
          const num = Math.max(1, parseInt(val, 10));
          deckService.updateDeck(deck.id, {
            settings: { ...deck.settings, maxReviewsPerDay: num }
          });
          const el = modal.querySelector('#val-max-cards');
          if (el) el.textContent = String(num);
        }
      }
    });
  });

  // Open Algorithm Selector (Foto 3)
  modal.querySelector('#row-select-algo')?.addEventListener('click', () => {
    modal.remove();
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

  // Open Advanced Menu
  modal.querySelector('#btn-open-advanced-menu')?.addEventListener('click', () => {
    modal.remove();
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
}
