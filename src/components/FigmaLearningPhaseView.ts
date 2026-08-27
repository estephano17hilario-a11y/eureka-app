import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { srsService } from '../services/srs.service';

export interface FigmaLearningPhaseViewCallbacks {
  onBack: () => void;
  onSaved: () => void;
}

export function renderFigmaLearningPhaseView(deck: Deck): string {
  return `
    <div class="ios-fullscreen-view">
      
      <!-- iOS Native Header -->
      <div class="ios-navbar">
        <button class="ios-back-btn" id="btn-learning-phase-back">
          <span class="ios-back-chevron">‹</span> Algoritmo
        </button>
        <h1 class="ios-nav-title">Fase de aprendizaje</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:16px;">
        
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button class="apple-btn-outline-pill" id="btn-view-how-it-works" style="font-weight:700;">
            ¿Cómo funciona el algoritmo?
          </button>
          <span style="font-size:0.85rem; color:var(--f-text-secondary); font-weight:700;">${deck.name}</span>
        </div>

        <div>
          <h2 style="font-size:1.6rem; font-weight:800; color:#ffffff; margin-bottom:6px; letter-spacing:-0.02em;">Fase de aprendizaje</h2>
          <div style="font-size:1.02rem; font-weight:700; color:#fff; margin-bottom:4px;">Pasos del aprendizaje</div>
          <p style="font-size:0.86rem; color:var(--f-text-secondary); line-height:1.5;">
            Durante la fase de aprendizaje, una tarjeta progresa a través de una serie de pasos de longitud fija. Cuando presionas <strong style="color:var(--f-green);">Bien</strong>, la tarjeta pasa al siguiente paso de aprendizaje hasta que se gradúa.
          </p>
        </div>

        <!-- Steps List (Foto 4) -->
        <div id="learning-phase-steps-container" class="apple-card-grouped" style="padding:4px 0;">
        </div>

        <!-- Add step button -->
        <button class="apple-btn-secondary" id="btn-view-add-step" style="padding:14px; border-radius:14px; font-weight:700; font-size:0.95rem;">
          + Agregar paso de revisión
        </button>

        <!-- Save button -->
        <div style="margin-top:12px; padding-bottom:30px;">
          <button class="apple-btn-primary" id="btn-view-save-steps" style="width:100%; padding:16px; border-radius:16px; font-size:1.05rem; justify-content:center; background:#475569;">
            🔒 Guardar los cambios
          </button>
        </div>

      </div>

    </div>
  `;
}

export function bindFigmaLearningPhaseViewEvents(
  container: HTMLElement,
  deck: Deck,
  callbacks: FigmaLearningPhaseViewCallbacks
): void {
  container.querySelector('#btn-learning-phase-back')?.addEventListener('click', () => callbacks.onBack());

  let steps = deck.settings.learningSteps && deck.settings.learningSteps.length > 0
    ? [...deck.settings.learningSteps]
    : [4, 1440, 2880, 7200, 15840, 25920, 41760, 82080, 146880, 246240, 400320, 633600];

  const mount = container.querySelector('#learning-phase-steps-container');

  const renderStepsList = () => {
    if (!mount) return;
    mount.innerHTML = steps
      .map(
        (minutes, idx) => `
      <div class="apple-list-row apple-step-editable-row" data-step-index="${idx}" style="cursor:pointer;">
        <div style="font-size:1.02rem; font-weight:600; color:#ffffff;">
          Revisión ${idx + 1}: <span style="color:var(--f-blue); font-weight:800; margin-left:6px;" id="step-label-${idx}">${srsService.formatMinutesToHuman(minutes)}</span>
        </div>
        
        <div style="display:flex; align-items:center; gap:10px;">
          <button class="apple-btn-outline-pill btn-quick-edit-step" data-step-index="${idx}" style="padding:4px 10px; font-size:0.75rem;">Editar</button>
          ${
            idx > 0
              ? `<button class="apple-icon-del-btn btn-del-step" data-step-index="${idx}" title="Eliminar paso">×</button>`
              : `<span style="width:28px;"></span>`
          }
        </div>
      </div>
    `
      )
      .join('');

    // Inline edit step click
    mount.querySelectorAll('.apple-step-editable-row').forEach((row) => {
      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).classList.contains('btn-del-step')) return;
        const idx = parseInt((row as HTMLElement).dataset.stepIndex || '0', 10);
        const currentHuman = srsService.formatMinutesToHuman(steps[idx]);
        const val = prompt(`Modificar tiempo para Revisión ${idx + 1} (ej: 4m, 1d, 2 días, 5 días, 1 mes):`, currentHuman);
        if (val && val.trim()) {
          const newMin = srsService.parseTimeToMinutes(val);
          steps[idx] = newMin;
          renderStepsList();
        }
      });
    });

    // Delete step
    mount.querySelectorAll<HTMLButtonElement>('.btn-del-step').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.stepIndex || '0', 10);
        steps.splice(idx, 1);
        renderStepsList();
      });
    });
  };

  renderStepsList();

  // Add step
  container.querySelector('#btn-view-add-step')?.addEventListener('click', () => {
    const val = prompt('Nuevo intervalo de revisión (ej: 600 días, 30 días, 12 horas, 10 min):', '600 días');
    if (val && val.trim()) {
      const newMin = srsService.parseTimeToMinutes(val);
      steps.push(newMin);
      renderStepsList();
    }
  });

  // How it works
  container.querySelector('#btn-view-how-it-works')?.addEventListener('click', () => {
    alert('Algoritmo de Fases de Aprendizaje Noji / Anki:\n\n1. Cada tarjeta inicia en el paso 1.\n2. Al calificar "Bien" o "Fácil", avanza secuencialmente a la siguiente revisión.\n3. Al calificar "Muy Difícil", regresa al paso 1 para consolidar la memoria.\n4. Puedes editar cualquiera de los 12 pasos tocando sobre él.');
  });

  // Save changes
  container.querySelector('#btn-view-save-steps')?.addEventListener('click', () => {
    deckService.updateDeck(deck.id, {
      settings: {
        ...deck.settings,
        algorithmType: 'custom',
        learningSteps: steps
      }
    });
    callbacks.onSaved();
  });
}
