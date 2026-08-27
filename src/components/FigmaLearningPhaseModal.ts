import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';

export interface FigmaLearningPhaseOptions {
  deck: Deck;
  onSaved: () => void;
  onClose: () => void;
}

export function openFigmaLearningPhaseModal(options: FigmaLearningPhaseOptions): void {
  const existing = document.getElementById('modal-learning-phase-root');
  if (existing) existing.remove();

  const deck = options.deck;
  
  // Default 12 review steps from Screenshot 4
  const default12Steps = [
    { label: '4 min', minutes: 4 },
    { label: '1 día', minutes: 1440 },
    { label: '2 días', minutes: 2880 },
    { label: '5 días', minutes: 7200 },
    { label: '11 días', minutes: 15840 },
    { label: '18 días', minutes: 25920 },
    { label: '29 días', minutes: 41760 },
    { label: '57 días', minutes: 82080 },
    { label: '102 días', minutes: 146880 },
    { label: '171 días', minutes: 246240 },
    { label: '278 días', minutes: 400320 },
    { label: '440 días', minutes: 633600 }
  ];

  let currentSteps = [...default12Steps];

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-learning-phase-root">
      <div class="apple-glass-modal" style="max-width:620px; max-height:92vh; display:flex; flex-direction:column;">
        
        <!-- Header -->
        <div class="figma-modal-header" style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <div style="width:100%; display:flex; align-items:center; justify-content:space-between;">
            <button class="apple-btn-outline-pill" id="btn-how-it-works">
              ¿Cómo funciona el algoritmo?
            </button>
            <button class="figma-btn-ghost" id="btn-close-learning-phase">×</button>
          </div>
        </div>

        <div style="padding:24px; overflow-y:auto; display:flex; flex-direction:column; gap:16px;">
          
          <div>
            <h2 style="font-size:1.5rem; font-weight:800; color:#ffffff; margin-bottom:6px;">Fase de aprendizaje</h2>
            <div style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:4px;">Pasos del aprendizaje</div>
            <p style="font-size:0.82rem; color:var(--f-text-secondary); line-height:1.45;">
              Durante la fase de aprendizaje, una tarjeta progresa a través de una serie de pasos de longitud fija. Cuando presionas <strong>Bien</strong>, la tarjeta pasa al siguiente paso de aprendizaje hasta que se gradúa.
            </p>
          </div>

          <!-- Steps List (Foto 4) -->
          <div id="learning-steps-list-mount" style="display:flex; flex-direction:column; gap:4px; border-top:1px solid rgba(255,255,255,0.06); padding-top:12px;">
          </div>

          <!-- Add step button -->
          <button class="apple-btn-secondary" id="btn-add-review-step" style="padding:12px; border-radius:12px; font-weight:700; font-size:0.9rem;">
            + Agregar paso de revisión
          </button>

        </div>

        <!-- Footer -->
        <div style="padding:16px 24px; border-top:1px solid rgba(255,255,255,0.06); background:var(--f-surface-subtle);">
          <button class="apple-btn-primary" id="btn-save-learning-steps" style="width:100%; padding:14px; border-radius:14px; font-size:1.02rem; justify-content:center;">
            🔒 Guardar los cambios
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const mount = document.getElementById('learning-steps-list-mount');

  const renderSteps = () => {
    if (!mount) return;
    mount.innerHTML = currentSteps
      .map(
        (step, idx) => `
      <div class="apple-step-row" style="display:flex; align-items:center; justify-content:space-between; padding:12px 6px; border-bottom:1px solid rgba(255,255,255,0.03);">
        <div style="font-size:0.98rem; font-weight:600; color:#ffffff;">
          Revisión ${idx + 1}: <span style="color:var(--f-blue); font-weight:700; margin-left:4px;">${step.label}</span>
        </div>
        ${
          idx > 0
            ? `<button class="apple-icon-del-btn" data-step-idx="${idx}" title="Eliminar paso">×</button>`
            : `<span style="width:24px;"></span>`
        }
      </div>
    `
      )
      .join('');

    mount.querySelectorAll<HTMLButtonElement>('.apple-icon-del-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.stepIdx || '0', 10);
        currentSteps.splice(idx, 1);
        renderSteps();
      });
    });
  };

  renderSteps();

  // Add step
  document.getElementById('btn-add-review-step')?.addEventListener('click', () => {
    const val = prompt('Nuevo intervalo (ej: 600 días, 30 días, 12 horas):', '600 días');
    if (val && val.trim()) {
      currentSteps.push({
        label: val.trim(),
        minutes: 600 * 1440
      });
      renderSteps();
    }
  });

  // How it works
  document.getElementById('btn-how-it-works')?.addEventListener('click', () => {
    alert('Algoritmo de intervalos fijos: Cada respuesta correcta ("Bien" o "Fácil") traslada la tarjeta a la siguiente etapa de revisión. Al responder "Muy Difícil", la tarjeta vuelve al paso 1.');
  });

  // Save
  document.getElementById('btn-save-learning-steps')?.addEventListener('click', () => {
    const minutesArray = currentSteps.map((s) => s.minutes);
    deckService.updateDeck(deck.id, {
      settings: {
        ...deck.settings,
        algorithmType: 'custom',
        learningSteps: minutesArray
      }
    });
    document.getElementById('modal-learning-phase-root')?.remove();
    options.onSaved();
  });

  const close = () => {
    document.getElementById('modal-learning-phase-root')?.remove();
    options.onClose();
  };

  document.getElementById('btn-close-learning-phase')?.addEventListener('click', close);
}
