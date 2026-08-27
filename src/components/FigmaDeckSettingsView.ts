import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';

export interface FigmaDeckSettingsViewCallbacks {
  onBack: () => void;
  onOpenAlgorithmSelector: () => void;
  onOpenAdvancedMenu: () => void;
  onSaved: () => void;
}

export function renderFigmaDeckSettingsView(deck: Deck): string {
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

  return `
    <div class="ios-fullscreen-view">
      
      <!-- iOS Native Header -->
      <div class="ios-navbar">
        <button class="ios-back-btn" id="btn-settings-back">
          <span class="ios-back-chevron">‹</span> Volver
        </button>
        <h1 class="ios-nav-title">Ajustes del Mazo</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="ios-content-scroll">
        
        <div style="margin-bottom:12px;">
          <h2 style="font-size:1.6rem; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">${deck.name}</h2>
          <p style="font-size:0.88rem; color:var(--f-text-secondary);">Configura los parámetros de repetición espaciada</p>
        </div>

        <!-- Inset Grouped Container (Foto 1) -->
        <div class="apple-card-grouped" style="margin-bottom:20px;">
          
          <!-- Row 1: Algoritmo -->
          <div class="apple-list-row" id="row-view-select-algo" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <div class="apple-icon-circle-sm" style="background:rgba(56,189,248,0.15); color:var(--f-blue);">
                ⥯
              </div>
              <span style="font-size:1.05rem; font-weight:700; color:#fff;">${algoLabel}</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <!-- Row 2: Tarjetas nuevas por día -->
          <div class="apple-list-row" id="row-view-new-cards" style="cursor:pointer;">
            <span style="font-size:1rem; font-weight:600; color:#fff;">Tarjetas nuevas por día</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="color:var(--f-blue); font-weight:800; font-size:1.05rem;" id="val-view-new-cards">${deck.settings.newCardsPerDay}</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <!-- Row 3: Máximo de tarjetas por día -->
          <div class="apple-list-row" id="row-view-max-cards" style="cursor:pointer;">
            <span style="font-size:1rem; font-weight:600; color:#fff;">Máximo de tarjetas por día</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="color:var(--f-blue); font-weight:800; font-size:1.05rem;" id="val-view-max-cards">${deck.settings.maxReviewsPerDay}</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <!-- Row 4: Mezclar tarjetas -->
          <div class="apple-list-row">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:1.1rem; color:var(--f-text-secondary);">🔀</span>
              <span style="font-size:1rem; font-weight:600; color:#fff;">Mezclar tarjetas</span>
            </div>
            <label class="figma-switch">
              <input type="checkbox" id="toggle-view-mix-cards" ${deck.settings.mixCards ? 'checked' : ''} />
              <span class="figma-slider"></span>
            </label>
          </div>

        </div>

        <!-- Botón: Configuraciones avanzadas -->
        <button class="apple-btn-secondary" id="btn-view-advanced-menu" style="width:100%; padding:16px; border-radius:16px; font-weight:700; font-size:1.02rem;">
          Configuraciones avanzadas
        </button>

      </div>

    </div>
  `;
}

export function bindFigmaDeckSettingsViewEvents(
  container: HTMLElement,
  deck: Deck,
  callbacks: FigmaDeckSettingsViewCallbacks
): void {
  container.querySelector('#btn-settings-back')?.addEventListener('click', () => callbacks.onBack());
  container.querySelector('#row-view-select-algo')?.addEventListener('click', () => callbacks.onOpenAlgorithmSelector());
  container.querySelector('#btn-view-advanced-menu')?.addEventListener('click', () => callbacks.onOpenAdvancedMenu());

  const mixToggle = container.querySelector('#toggle-view-mix-cards') as HTMLInputElement | null;
  mixToggle?.addEventListener('change', () => {
    deckService.updateDeck(deck.id, {
      settings: { ...deck.settings, mixCards: mixToggle.checked }
    });
  });

  // Edit new cards
  container.querySelector('#row-view-new-cards')?.addEventListener('click', () => {
    const val = prompt('Tarjetas nuevas por día:', String(deck.settings.newCardsPerDay));
    if (val && !isNaN(Number(val))) {
      const num = Math.max(1, parseInt(val, 10));
      deckService.updateDeck(deck.id, {
        settings: { ...deck.settings, newCardsPerDay: num }
      });
      const el = container.querySelector('#val-view-new-cards');
      if (el) el.textContent = String(num);
    }
  });

  // Edit max cards
  container.querySelector('#row-view-max-cards')?.addEventListener('click', () => {
    const val = prompt('Máximo de tarjetas por día:', String(deck.settings.maxReviewsPerDay));
    if (val && !isNaN(Number(val))) {
      const num = Math.max(1, parseInt(val, 10));
      deckService.updateDeck(deck.id, {
        settings: { ...deck.settings, maxReviewsPerDay: num }
      });
      const el = container.querySelector('#val-view-max-cards');
      if (el) el.textContent = String(num);
    }
  });
}
