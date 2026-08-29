import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { dialogService } from '../services/dialog.service';

export interface FigmaDeckSettingsViewCallbacks {
  onBack: () => void;
  onOpenAlgorithmSelector: () => void;
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
        <button class="ios-back-btn" id="btn-deck-settings-back" title="Volver a Opciones">
          <span class="ios-back-chevron">‹</span> Opciones
        </button>
        <h1 class="ios-nav-title">Configuración de Intervalos</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:18px;">
        
        <div style="margin-bottom:6px;">
          <h2 style="font-size:1.55rem; font-weight:900; color:#ffffff; letter-spacing:-0.02em; margin:0 0 4px 0;">${deck.name}</h2>
          <p style="font-size:0.88rem; color:var(--f-text-secondary); margin:0;">Parámetros del algoritmo de repetición espaciada (SRS)</p>
        </div>

        <!-- Grupo 1: Algoritmo de Aprendizaje -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="row-view-algo-selector" style="cursor:pointer;" title="Cambiar algoritmo">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="apple-icon-circle-sm" style="background:rgba(56,189,248,0.15); color:var(--f-blue); width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem;">
                ⥯
              </div>
              <div>
                <span class="apple-list-label" style="display:block; font-weight:700;">Algoritmo de aprendizaje</span>
                <span style="font-size:0.78rem; color:var(--f-text-muted);">Elige el motor matemático o FSRS</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="apple-list-value" id="val-view-algo-label" style="color:var(--f-blue); font-weight:800;">${algoLabel}</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <div class="apple-list-row">
            <div>
              <span class="apple-list-label" style="display:block; font-weight:700;">Mezclar tarjetas</span>
              <span style="font-size:0.78rem; color:var(--f-text-muted);">Barajar orden aleatorio en el repaso</span>
            </div>
            <label class="figma-switch">
              <input type="checkbox" id="toggle-view-mix-cards" ${deck.settings.mixCards ? 'checked' : ''} />
              <span class="figma-slider"></span>
            </label>
          </div>
        </div>

        <!-- Grupo 2: Límites Diarios -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="row-view-new-cards" style="cursor:pointer;" title="Modificar tarjetas nuevas">
            <div>
              <span class="apple-list-label" style="display:block; font-weight:700;">Tarjetas nuevas por día</span>
              <span style="font-size:0.78rem; color:var(--f-text-muted);">Nuevas flashcards a introducir diariamente</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="apple-list-value" id="val-view-new-cards" style="color:var(--f-blue); font-weight:800; font-size:1.05rem;">${deck.settings.newCardsPerDay}</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <div class="apple-list-row" id="row-view-max-cards" style="cursor:pointer;" title="Modificar máximo de repasos">
            <div>
              <span class="apple-list-label" style="display:block; font-weight:700;">Máximo de repasos por día</span>
              <span style="font-size:0.78rem; color:var(--f-text-muted);">Límite total de repasos acumulados</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="apple-list-value" id="val-view-max-cards" style="color:var(--f-blue); font-weight:800; font-size:1.05rem;">${deck.settings.maxReviewsPerDay}</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>
        </div>

        <!-- Grupo 3: Minijuegos de Descanso y Pausas Activas -->
        <div class="apple-card-grouped">
          <div class="apple-list-row">
            <div>
              <span class="apple-list-label" style="display:block; font-weight:700;">🎮 Minijuegos de descanso</span>
              <span style="font-size:0.78rem; color:var(--f-text-muted); display:block;">Pausas lúdicas sin fatiga cognitiva</span>
            </div>
            <label class="figma-switch">
              <input type="checkbox" id="toggle-view-microgames" ${deck.settings.enableMicroGames !== false ? 'checked' : ''} />
              <span class="figma-slider"></span>
            </label>
          </div>

          <div class="apple-list-row" id="row-view-microgame-freq" style="cursor:pointer;">
            <span class="apple-list-label" style="font-weight:700;">Frecuencia de minijuego</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="apple-list-value" id="val-view-microgame-freq" style="color:var(--f-blue); font-weight:700;">
                ${(deck.settings.microGameInterval || 5) === 0 ? 'Desactivado' : `Cada ${deck.settings.microGameInterval || 5} tarjetas`}
              </span>
              <span class="apple-chevron">›</span>
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
  container.querySelector('#row-view-algo-selector')?.addEventListener('click', () => callbacks.onOpenAlgorithmSelector());

  // Toggle mix cards
  const mixToggle = container.querySelector('#toggle-view-mix-cards') as HTMLInputElement | null;
  mixToggle?.addEventListener('change', () => {
    deckService.updateDeck(deck.id, {
      settings: { ...deck.settings, mixCards: mixToggle.checked }
    });
    callbacks.onSaved();
  });

  // Toggle microgames
  const microToggle = container.querySelector('#toggle-view-microgames') as HTMLInputElement | null;
  microToggle?.addEventListener('change', () => {
    deckService.updateDeck(deck.id, {
      settings: { ...deck.settings, enableMicroGames: microToggle.checked }
    });
    callbacks.onSaved();
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
          callbacks.onSaved();
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
          callbacks.onSaved();
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
          callbacks.onSaved();
        }
      }
    });
  });
}
