import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { srsService } from '../services/srs.service';
import { dialogService } from '../services/dialog.service';

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
        <h1 class="ios-nav-title">Fase de Aprendizaje</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:16px;">
        
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button class="apple-btn-outline-pill" id="btn-view-how-it-works" style="font-weight:700; font-size:0.8rem; padding:4px 12px;">
            💡 ¿Cómo funciona el algoritmo?
          </button>
          <span style="font-size:0.85rem; color:var(--f-text-secondary); font-weight:700;">${deck.name}</span>
        </div>

        <div>
          <h2 style="font-size:1.6rem; font-weight:900; color:#ffffff; margin-bottom:4px; letter-spacing:-0.02em;">Fase de Aprendizaje</h2>
          <div style="font-size:1.02rem; font-weight:700; color:var(--f-blue); margin-bottom:4px;">Escalera de Pasos del Aprendizaje</div>
          <p style="font-size:0.86rem; color:var(--f-text-secondary); line-height:1.5;">
            Durante la fase de aprendizaje, una tarjeta progresa a través de una serie de pasos secuenciales. Cuando presionas <strong style="color:var(--f-green);">Bien</strong>, la tarjeta pasa al siguiente paso hasta graduarse.
          </p>
        </div>

        <!-- Quick Presets / Templates Toolbar -->
        <div style="display:flex; align-items:center; gap:8px; overflow-x:auto; padding:4px 0;">
          <span style="font-size:0.75rem; font-weight:800; color:var(--f-text-muted); text-transform:uppercase; letter-spacing:0.04em; white-space:nowrap;">Plantillas:</span>
          <button type="button" class="apple-btn-outline-pill" id="btn-view-tpl-fsrs" style="font-size:0.75rem; padding:4px 10px; white-space:nowrap;">12 Pasos FSRS</button>
          <button type="button" class="apple-btn-outline-pill" id="btn-view-tpl-anki" style="font-size:0.75rem; padding:4px 10px; white-space:nowrap;">Anki Estándar</button>
          <button type="button" class="apple-btn-outline-pill" id="btn-view-tpl-fast" style="font-size:0.75rem; padding:4px 10px; white-space:nowrap;">Examen Rápido</button>
          <button type="button" class="apple-btn-outline-pill" id="btn-view-sort" style="font-size:0.75rem; padding:4px 10px; margin-left:auto; white-space:nowrap; color:var(--f-blue); border-color:rgba(56,189,248,0.3);">↕ Ordenar</button>
        </div>

        <!-- Steps List Mount -->
        <div id="learning-phase-steps-container" class="apple-card-grouped" style="padding:2px 0;">
        </div>

        <!-- Add step button -->
        <button class="apple-btn-secondary" id="btn-view-add-step" style="padding:14px; border-radius:14px; font-weight:800; font-size:0.95rem; border:1.5px dashed rgba(56,189,248,0.35); color:#38bdf8; background:rgba(56,189,248,0.05); display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer;">
          <span>+</span> Agregar Nuevo Paso de Revisión
        </button>

        <!-- Save button -->
        <div style="margin-top:8px; padding-bottom:30px;">
          <button class="apple-btn-primary" id="btn-view-save-steps" style="width:100%; padding:16px; border-radius:16px; font-size:1.05rem; justify-content:center; background:linear-gradient(135deg, #38bdf8, #2563eb); color:#ffffff; font-weight:800; box-shadow:0 4px 18px rgba(56,189,248,0.35);">
            🔒 Guardar Configuración de Intervalos
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
      <div class="apple-list-row apple-step-editable-row" data-step-index="${idx}" style="cursor:pointer; padding:12px 16px; transition:background 0.12s ease;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:26px; height:26px; border-radius:8px; background:rgba(56,189,248,0.12); color:#38bdf8; font-size:0.75rem; font-weight:800; display:flex; align-items:center; justify-content:center;">
            ${idx + 1}
          </div>
          <div style="font-size:0.96rem; font-weight:600; color:#ffffff;">
            Revisión ${idx + 1}: <span style="color:var(--f-blue); font-weight:800; margin-left:6px;" id="step-label-${idx}">${srsService.formatMinutesToHuman(minutes)}</span>
          </div>
        </div>
        
        <div style="display:flex; align-items:center; gap:10px;">
          <button type="button" class="apple-btn-outline-pill btn-quick-edit-step" data-step-index="${idx}" style="padding:4px 10px; font-size:0.75rem;">Editar</button>
          ${
            idx > 0
              ? `<button type="button" class="apple-icon-del-btn btn-del-step" data-step-index="${idx}" title="Eliminar paso">×</button>`
              : `<span style="width:28px;"></span>`
          }
        </div>
      </div>
    `
      )
      .join('');

    // Inline edit step click with Custom Days/Hours/Minutes Picker
    mount.querySelectorAll('.apple-step-editable-row').forEach((row) => {
      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).classList.contains('btn-del-step')) return;
        const idx = parseInt((row as HTMLElement).dataset.stepIndex || '0', 10);
        const currentMins = steps[idx] || 1440;
        dialogService.showIntervalPicker({
          title: `Modificar Revisión ${idx + 1}`,
          subtitle: `Ajusta el tiempo exacto en días, horas y minutos para el paso #${idx + 1}:`,
          initialMinutes: currentMins,
          onConfirm: (newMinutes) => {
            steps[idx] = newMinutes;
            renderStepsList();
          }
        });
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

  // Add step with smart next interval
  container.querySelector('#btn-view-add-step')?.addEventListener('click', () => {
    const lastMin = steps.length > 0 ? steps[steps.length - 1] : 1440;
    const suggestedNext = steps.length > 0 ? Math.round(lastMin * 1.5) : 1440;

    dialogService.showIntervalPicker({
      title: `Agregar Nuevo Paso #${steps.length + 1}`,
      subtitle: 'Configura el intervalo en días, horas o minutos:',
      initialMinutes: suggestedNext,
      onConfirm: (newMinutes) => {
        steps.push(newMinutes);
        renderStepsList();
      }
    });
  });

  // Template: FSRS
  container.querySelector('#btn-view-tpl-fsrs')?.addEventListener('click', () => {
    steps = [4, 1440, 2880, 7200, 15840, 25920, 41760, 82080, 146880, 246240, 400320, 633600];
    renderStepsList();
  });

  // Template: Anki
  container.querySelector('#btn-view-tpl-anki')?.addEventListener('click', () => {
    steps = [1, 10, 1440, 4320, 10080, 21600, 43200];
    renderStepsList();
  });

  // Template: Fast Exam
  container.querySelector('#btn-view-tpl-fast')?.addEventListener('click', () => {
    steps = [5, 25, 120, 720, 1440, 2880, 5760];
    renderStepsList();
  });

  // Sort steps
  container.querySelector('#btn-view-sort')?.addEventListener('click', () => {
    steps.sort((a, b) => a - b);
    renderStepsList();
  });

  // How it works
  container.querySelector('#btn-view-how-it-works')?.addEventListener('click', () => {
    dialogService.showAlert({
      title: '¿Cómo funciona el algoritmo?',
      message: '1. Cada tarjeta inicia en la Revisión 1.\n2. Al calificar "Bien" o "Fácil", la tarjeta avanza secuencialmente al siguiente escalón de repaso.\n3. Al responder "Muy Difícil", regresa al paso 1 para consolidar la retención.\n4. Puedes personalizar cualquiera de los pasos tocando sobre él y ajustando días, horas o minutos.'
    });
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

