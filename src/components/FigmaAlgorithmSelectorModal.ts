import type { Deck, AlgorithmType } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { openFigmaLearningPhaseModal } from './FigmaLearningPhaseModal';

export interface FigmaAlgoSelectorOptions {
  deck: Deck;
  onSaved: () => void;
  onClose: () => void;
}

export function openFigmaAlgorithmSelectorModal(options: FigmaAlgoSelectorOptions): void {
  const existing = document.getElementById('modal-algo-selector-root');
  if (existing) existing.remove();

  const deck = options.deck;
  const currentAlgo: AlgorithmType = deck.settings.algorithmType || 'custom';

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-algo-selector-root">
      <div class="apple-glass-modal" style="max-width:580px; max-height:90vh; display:flex; flex-direction:column;">
        
        <!-- Header -->
        <div class="figma-modal-header" style="padding:16px 22px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">Elegir algoritmo</h3>
          <button class="figma-btn-ghost" id="btn-close-algo-sel">×</button>
        </div>

        <div style="padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:14px;">
          
          <!-- Option 1: FSRS -->
          <div class="apple-algo-card ${currentAlgo === 'fsrs' ? 'selected' : ''}" data-algo-key="fsrs">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="apple-algo-icon">🗎</span>
                <span class="apple-algo-title">Repetición espaciada inteligente (FSRS)</span>
                <span class="apple-badge-beta">Beta</span>
              </div>
              <input type="checkbox" class="apple-checkbox" ${currentAlgo === 'fsrs' ? 'checked' : ''} readonly />
            </div>
            <p class="apple-algo-desc">
              El algoritmo de programación más reciente y avanzado: aprende tus patrones de memoria personales y programa cada repaso justo para el momento en que estás a punto de olvidar, para que recuerdes más con menos repasos.
            </p>
          </div>

          <!-- Option 2: Revisión rápida -->
          <div class="apple-algo-card ${currentAlgo === 'quick' ? 'selected' : ''}" data-algo-key="quick">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="apple-algo-icon">🗎</span>
                <span class="apple-algo-title">Revisión rápida</span>
              </div>
              <input type="checkbox" class="apple-checkbox" ${currentAlgo === 'quick' ? 'checked' : ''} readonly />
            </div>
            <p class="apple-algo-desc">
              Revisa tarjetas sin ningún horario, solo una por una. Las tarjetas siempre están disponibles para estudiar cuando lo desees, lo que te permite repasar el material a tu propio ritmo sin seguir los intervalos de repaso espaciado.
            </p>
          </div>

          <!-- Option 3: Repaso espaciado general -->
          <div class="apple-algo-card ${currentAlgo === 'general' ? 'selected' : ''}" data-algo-key="general">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="apple-algo-icon">🗎</span>
                <span class="apple-algo-title">Repaso espaciado general</span>
              </div>
              <input type="checkbox" class="apple-checkbox" ${currentAlgo === 'general' ? 'checked' : ''} readonly />
            </div>
            <p class="apple-algo-desc">
              Un sistema inteligente que programa las revisiones según qué tan bien recuerdas cada tarjeta. Las tarjetas fáciles aparecen con menos frecuencia, mientras que las más difíciles se muestran más seguido, ayudándote a aprender de forma eficiente y a retener el conocimiento a largo plazo.
            </p>
          </div>

          <!-- Option 4: Aprendizaje de idiomas -->
          <div class="apple-algo-card ${currentAlgo === 'languages' ? 'selected' : ''}" data-algo-key="languages">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="apple-algo-icon" style="color:#38bdf8;">🔤</span>
                <span class="apple-algo-title">Aprendizaje de idiomas</span>
              </div>
              <span style="font-size:0.88rem; color:var(--f-blue);">🔓</span>
            </div>
            <div style="margin-bottom:8px;">
              <span class="apple-badge-subpill">+ Repaso espaciado</span>
            </div>
            <p class="apple-algo-desc">
              Una variación de repaso espaciado diseñada para aprender palabras nuevas. Las nuevas tarjetas se muestran con frecuencia al principio y luego se repasan en intervalos más largos para ayudarte a recordarlas a largo plazo.
            </p>
          </div>

          <!-- Option 5: Aprendizaje médico -->
          <div class="apple-algo-card ${currentAlgo === 'medical' ? 'selected' : ''}" data-algo-key="medical">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="apple-algo-icon" style="color:#38bdf8;">⚕️</span>
                <span class="apple-algo-title">Aprendizaje médico</span>
              </div>
              <span style="font-size:0.88rem; color:var(--f-blue);">🔓</span>
            </div>
            <div style="margin-bottom:8px;">
              <span class="apple-badge-subpill">+ Repaso espaciado</span>
            </div>
            <p class="apple-algo-desc">
              Este ajuste predeterminado de repaso espaciado se basa en técnicas utilizadas por estudiantes de medicina de alto rendimiento. Elimina los límites diarios y evita la repetición excesiva de tarjetas, ayudándote a cubrir grandes volúmenes de material de manera eficiente a corto plazo.
            </p>
          </div>

          <!-- Button to customize exact 12 steps (Foto 4) -->
          <button class="apple-btn-secondary" id="btn-open-custom-learning-phases" style="width:100%; padding:14px; border-radius:14px; margin-top:8px; font-weight:700;">
            ⚙️ Personalizar Escalera de Fases (12 Pasos)
          </button>

        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Card select clicks
  document.querySelectorAll<HTMLElement>('.apple-algo-card').forEach((card) => {
    card.addEventListener('click', () => {
      const key = card.dataset.algoKey as AlgorithmType;
      if (key) {
        deckService.updateDeck(deck.id, {
          settings: { ...deck.settings, algorithmType: key }
        });
        document.getElementById('modal-algo-selector-root')?.remove();
        options.onSaved();
      }
    });
  });

  // Open 12-step phase editor (Foto 4)
  document.getElementById('btn-open-custom-learning-phases')?.addEventListener('click', () => {
    document.getElementById('modal-algo-selector-root')?.remove();
    openFigmaLearningPhaseModal({
      deck,
      onSaved: () => options.onSaved(),
      onClose: () => openFigmaAlgorithmSelectorModal(options)
    });
  });

  const close = () => {
    document.getElementById('modal-algo-selector-root')?.remove();
    options.onClose();
  };

  document.getElementById('btn-close-algo-sel')?.addEventListener('click', close);
}
