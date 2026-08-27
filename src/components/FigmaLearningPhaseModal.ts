import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { srsService } from '../services/srs.service';
import { dialogService } from '../services/dialog.service';

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

  let currentSteps = deck.settings.learningSteps && deck.settings.learningSteps.length > 0
    ? deck.settings.learningSteps.map((m) => ({
        label: srsService.formatMinutesToHuman(m),
        minutes: m
      }))
    : default12Steps;

  const modal = document.createElement('div');
  modal.id = 'modal-learning-phase-root';
  modal.className = 'apple-modal-overlay';
  modal.innerHTML = `
    <div class="apple-modal-content apple-glass-panel" style="max-width:540px; width:92%; max-height:90vh; display:flex; flex-direction:column; padding:0; overflow:hidden;">
      
      <!-- Modal Header (Foto 4) -->
      <div style="padding:20px 24px 16px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between;">
        <div>
          <button class="apple-btn-outline-pill" id="btn-how-it-works" style="font-size:0.75rem; padding:4px 12px; margin-bottom:6px;">
            ¿Cómo funciona el algoritmo?
          </button>
          <h2 style="font-size:1.5rem; font-weight:800; color:#fff; letter-spacing:-0.02em;">Fase de aprendizaje</h2>
          <div style="font-size:0.95rem; font-weight:700; color:#fff; margin-top:2px;">Pasos del aprendizaje</div>
        </div>
        <button id="btn-close-learning-phase" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.5rem; cursor:pointer; padding:4px;">✕</button>
      </div>

      <!-- Content Scrollable List -->
      <div style="flex:1; overflow-y:auto; padding:20px 24px; display:flex; flex-direction:column; gap:16px;">
        <p style="font-size:0.85rem; color:var(--f-text-secondary); line-height:1.4;">
          Durante la fase de aprendizaje, una tarjeta progresa a través de una serie de pasos de longitud fija. Cuando presionas <strong style="color:var(--f-green);">Bien</strong>, la tarjeta pasa al siguiente paso de aprendizaje hasta que se gradúa.
        </p>

        <!-- Steps List (Foto 4) -->
        <div id="learning-phase-steps-mount" class="apple-card-grouped" style="padding:4px 0;">
        </div>

        <!-- Add Step button -->
        <button class="apple-btn-secondary" id="btn-add-review-step" style="padding:12px; border-radius:12px; font-weight:700;">
          + Agregar paso de revisión
        </button>
      </div>

      <!-- Modal Footer -->
      <div style="padding:16px 24px 24px; border-top:1px solid rgba(255,255,255,0.06); display:flex; justify-content:flex-end;">
        <button class="apple-btn-primary" id="btn-save-learning-steps" style="width:100%; padding:14px; border-radius:14px; font-size:1rem; justify-content:center; background:var(--f-blue); color:#07080a; font-weight:800;">
          🔒 Guardar los cambios
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  const mount = modal.querySelector('#learning-phase-steps-mount');

  const renderSteps = () => {
    if (!mount) return;
    mount.innerHTML = currentSteps
      .map(
        (step, idx) => `
      <div class="apple-list-row" style="padding:12px 16px;">
        <div style="font-size:0.95rem; font-weight:600; color:#fff;">
          Revisión ${idx + 1}: <span style="color:var(--f-blue); font-weight:800; margin-left:6px;">${step.label}</span>
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

  // Add step with Custom Days/Hours/Minutes Picker
  document.getElementById('btn-add-review-step')?.addEventListener('click', () => {
    dialogService.showIntervalPicker({
      title: 'Nuevo Paso de Revisión',
      subtitle: 'Configura el intervalo en días, horas o minutos:',
      initialMinutes: 864000,
      onConfirm: (totalMinutes) => {
        currentSteps.push({
          label: srsService.formatMinutesToHuman(totalMinutes),
          minutes: totalMinutes
        });
        renderSteps();
      }
    });
  });

  // How it works
  document.getElementById('btn-how-it-works')?.addEventListener('click', () => {
    dialogService.showAlert({
      title: 'Algoritmo de Intervalos Fijos',
      message: 'Cada respuesta correcta ("Bien" o "Fácil") traslada la tarjeta a la siguiente etapa de revisión secuencial.\n\nAl responder "Muy Difícil", la tarjeta regresa al paso 1 para consolidar la memoria.'
    });
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
