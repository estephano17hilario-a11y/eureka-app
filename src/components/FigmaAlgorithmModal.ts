import type { Deck, AlgorithmType } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { srsService } from '../services/srs.service';

export interface FigmaAlgoModalOptions {
  deck: Deck;
  onSaved: () => void;
  onClose: () => void;
}

export function openFigmaAlgorithmModal(options: FigmaAlgoModalOptions): void {
  const existing = document.getElementById('modal-algo-root');
  if (existing) existing.remove();

  const deck = options.deck;
  const currentAlgo: AlgorithmType = deck.settings.algorithmType || 'custom';
  const stepsString = srsService.formatStepsToString(deck.settings.learningSteps);

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-algo-root">
      <div class="apple-glass-modal" style="max-width:560px;">
        
        <div class="figma-modal-header" style="padding:16px 20px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="apple-glass-icon-circle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <div>
              <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">Algoritmo de Aprendizaje</h3>
              <p style="font-size:0.75rem; color:var(--f-text-secondary);">${deck.name}</p>
            </div>
          </div>
          <button class="figma-btn-ghost" id="btn-close-algo-modal">×</button>
        </div>

        <div class="modal-body" style="padding:20px;">
          
          <div class="form-group">
            <label class="form-label">Modelo de Repetición Espaciada</label>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <label class="figma-deck-row" style="padding:12px 16px; border-radius:12px; border:1px solid var(--f-border); cursor:pointer;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <input type="radio" name="srs-algo" value="custom" ${currentAlgo === 'custom' ? 'checked' : ''} />
                  <div>
                    <div style="font-weight:700; color:#fff; font-size:0.95rem;">⚡ Personalizado (Fase de 12 Pasos)</div>
                    <div style="font-size:0.76rem; color:var(--f-text-secondary);">El botón "Normal" avanza rigurosamente por tu escalera de pasos</div>
                  </div>
                </div>
              </label>

              <label class="figma-deck-row" style="padding:12px 16px; border-radius:12px; border:1px solid var(--f-border); cursor:pointer;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <input type="radio" name="srs-algo" value="fsrs" ${currentAlgo === 'fsrs' ? 'checked' : ''} />
                  <div>
                    <div style="font-weight:700; color:#fff; font-size:0.95rem;">🚀 FSRS (Repetición Espaciada Inteligente Beta)</div>
                    <div style="font-size:0.76rem; color:var(--f-text-secondary);">Optimizado para máxima retención en el menor tiempo posible</div>
                  </div>
                </div>
              </label>

              <label class="figma-deck-row" style="padding:12px 16px; border-radius:12px; border:1px solid var(--f-border); cursor:pointer;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <input type="radio" name="srs-algo" value="general" ${currentAlgo === 'general' ? 'checked' : ''} />
                  <div>
                    <div style="font-weight:700; color:#fff; font-size:0.95rem;">🎓 Repaso Espaciado General</div>
                    <div style="font-size:0.76rem; color:var(--f-text-secondary);">Programa según qué tan bien recuerdas cada tarjeta</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group" style="margin-top:16px;">
            <label class="form-label">Escalera de Intervalos de Aprendizaje (Paso a Paso)</label>
            <input 
              type="text" 
              id="algo-steps-input" 
              class="form-input" 
              value="${stepsString}" 
              placeholder="4m, 1d, 2d, 5d, 11d, 18d, 29d, 57d, 102d, 171d, 278d, 440d"
            />
            <span style="font-size:0.75rem; color:var(--f-text-secondary); display:block; margin-top:4px;">
              Formato: <code>4m, 1d, 2d, 5d</code> (m = minutos, h = horas, d = días).
            </span>
          </div>

          <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:10px;">
            <button class="figma-btn-ghost" id="btn-cancel-algo">Cancelar</button>
            <button class="figma-btn-blue-pill" id="btn-save-algo">Guardar Ajustes</button>
          </div>

        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById('btn-save-algo')?.addEventListener('click', () => {
    const selectedRadio = document.querySelector('input[name="srs-algo"]:checked') as HTMLInputElement | null;
    const algo = (selectedRadio?.value as AlgorithmType) || 'custom';
    const stepsInput = (document.getElementById('algo-steps-input') as HTMLInputElement)?.value || '4m, 1d, 2d, 5d';
    const learningSteps = srsService.parseStepsString(stepsInput);

    deckService.updateDeck(deck.id, {
      settings: {
        ...deck.settings,
        algorithmType: algo,
        learningSteps
      }
    });

    document.getElementById('modal-algo-root')?.remove();
    options.onSaved();
  });

  const close = () => {
    document.getElementById('modal-algo-root')?.remove();
    options.onClose();
  };

  document.getElementById('btn-close-algo-modal')?.addEventListener('click', close);
  document.getElementById('btn-cancel-algo')?.addEventListener('click', close);
}
