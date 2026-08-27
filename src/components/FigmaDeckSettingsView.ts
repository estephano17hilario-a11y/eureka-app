import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { dialogService } from '../services/dialog.service';

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
        <button class="ios-back-btn" id="btn-deck-settings-back">
          <span class="ios-back-chevron">‹</span> Mazo
        </button>
        <h1 class="ios-nav-title">Opciones</h1>
        <button class="ios-action-btn" id="btn-open-advanced-sheet">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      </div>

      <!-- Scrollable Settings List -->
      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:20px;">

        <!-- Group 1: General & Algoritmo -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="row-view-algo-selector">
            <span class="apple-list-label">Algoritmo de aprendizaje</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="apple-list-value" id="val-view-algo-label">${algoLabel}</span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>

          <div class="apple-list-row">
            <span class="apple-list-label">Mezclar tarjetas</span>
            <label class="apple-switch">
              <input type="checkbox" id="toggle-view-mix-cards" ${deck.settings.mixCards ? 'checked' : ''} />
              <span class="apple-slider"></span>
            </label>
          </div>
        </div>

        <!-- Group 2: Límites Diarios -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="row-view-new-cards">
            <span class="apple-list-label">Tarjetas nuevas por día</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="apple-list-value" id="val-view-new-cards">${deck.settings.newCardsPerDay}</span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>

          <div class="apple-list-row" id="row-view-max-cards">
            <span class="apple-list-label">Máximo de tarjetas por día</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="apple-list-value" id="val-view-max-cards">${deck.settings.maxReviewsPerDay}</span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>
        </div>

        <!-- Group 3: Minijuegos de Descanso -->
        <div class="apple-card-grouped">
          <div class="apple-list-row">
            <div>
              <span class="apple-list-label" style="display:block;">🎮 Minijuegos de descanso</span>
              <span style="font-size:0.75rem; color:var(--f-text-muted); display:block;">Sin carga alostática ni fatiga cognitiva</span>
            </div>
            <label class="apple-switch">
              <input type="checkbox" id="toggle-view-microgames" ${deck.settings.enableMicroGames !== false ? 'checked' : ''} />
              <span class="apple-slider"></span>
            </label>
          </div>

          <div class="apple-list-row" id="row-view-microgame-freq">
            <span class="apple-list-label">Frecuencia de juego</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="apple-list-value" id="val-view-microgame-freq">
                ${(deck.settings.microGameInterval || 5) === 0 ? 'Desactivado' : `Cada ${deck.settings.microGameInterval || 5} tarjetas`}
              </span>
              <span style="color:var(--f-text-muted); font-size:1.2rem;">›</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}

export function bindFigmaDeckSettingsViewEvents(
  container: HTMLElement,
  deck: Deck,
  callbacks: FigmaDeckSettingsViewCallbacks
): void {
  container.querySelector('#btn-deck-settings-back')?.addEventListener('click', () => callbacks.onBack());
  container.querySelector('#btn-open-advanced-sheet')?.addEventListener('click', () => callbacks.onOpenAdvancedMenu());
  container.querySelector('#row-view-algo-selector')?.addEventListener('click', () => callbacks.onOpenAlgorithmSelector());

  // Toggle mix cards
  const mixToggle = container.querySelector('#toggle-view-mix-cards') as HTMLInputElement | null;
  mixToggle?.addEventListener('change', () => {
    deckService.updateDeck(deck.id, {
      settings: { ...deck.settings, mixCards: mixToggle.checked }
    });
  });

  // Toggle microgames
  const microToggle = container.querySelector('#toggle-view-microgames') as HTMLInputElement | null;
  microToggle?.addEventListener('change', () => {
    deckService.updateDeck(deck.id, {
      settings: { ...deck.settings, enableMicroGames: microToggle.checked }
    });
  });

  // Microgame freq
  container.querySelector('#row-view-microgame-freq')?.addEventListener('click', () => {
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
          const el = container.querySelector('#val-view-microgame-freq');
          if (el) el.textContent = num === 0 ? 'Desactivado' : `Cada ${num} tarjetas`;
        }
      }
    });
  });

  // Edit new cards
  container.querySelector('#row-view-new-cards')?.addEventListener('click', () => {
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
          const el = container.querySelector('#val-view-new-cards');
          if (el) el.textContent = String(num);
        }
      }
    });
  });

  // Edit max cards
  container.querySelector('#row-view-max-cards')?.addEventListener('click', () => {
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
          const el = container.querySelector('#val-view-max-cards');
          if (el) el.textContent = String(num);
        }
      }
    });
  });
}
