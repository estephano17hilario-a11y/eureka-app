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
  
  // Default 12 review steps
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
    : [...default12Steps];

  const modal = document.createElement('div');
  modal.id = 'modal-learning-phase-root';
  modal.className = 'apple-modal-overlay';
  modal.innerHTML = `
    <div class="apple-modal-content apple-glass-panel" style="max-width:560px; width:94%; max-height:90vh; display:flex; flex-direction:column; padding:0; overflow:hidden; border:1px solid rgba(255,255,255,0.12); box-shadow:0 24px 60px rgba(0,0,0,0.65);">
      
      <!-- Modal Header -->
      <div style="padding:20px 24px 16px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; align-items:flex-start; justify-content:space-between; background:linear-gradient(180deg, rgba(255,255,255,0.04), transparent);">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <button class="apple-btn-outline-pill" id="btn-how-it-works" style="font-size:0.75rem; padding:4px 12px; font-weight:700;">
              💡 ¿Cómo funciona el algoritmo?
            </button>
            <span style="font-size:0.78rem; color:var(--f-text-secondary); font-weight:700;">${deck.name}</span>
          </div>
          <h2 style="font-size:1.45rem; font-weight:900; color:#fff; letter-spacing:-0.02em; margin:0 0 2px 0;">Fase de Aprendizaje</h2>
          <div style="font-size:0.88rem; font-weight:700; color:var(--f-blue);">Escalera de Pasos de Repetición Espaciada</div>
        </div>
        <button id="btn-close-learning-phase" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:var(--f-text-secondary); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.1rem; cursor:pointer;">✕</button>
      </div>

      <!-- Quick Template Presets Bar -->
      <div style="padding:10px 24px; background:rgba(255,255,255,0.02); border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:8px; overflow-x:auto;">
        <span style="font-size:0.74rem; font-weight:800; color:var(--f-text-muted); text-transform:uppercase; letter-spacing:0.04em; white-space:nowrap;">Plantillas:</span>
        <button type="button" class="apple-btn-outline-pill" id="tpl-fsrs-12" style="font-size:0.72rem; padding:3px 10px; white-space:nowrap;">12 Pasos FSRS</button>
        <button type="button" class="apple-btn-outline-pill" id="tpl-anki-std" style="font-size:0.72rem; padding:3px 10px; white-space:nowrap;">Anki Estándar</button>
        <button type="button" class="apple-btn-outline-pill" id="tpl-exam-fast" style="font-size:0.72rem; padding:3px 10px; white-space:nowrap;">Examen Rápido</button>
        <button type="button" class="apple-btn-outline-pill" id="btn-sort-steps" style="font-size:0.72rem; padding:3px 10px; margin-left:auto; white-space:nowrap; color:var(--f-blue); border-color:rgba(56,189,248,0.3);">↕ Ordenar</button>
      </div>

      <!-- Content Scrollable List -->
      <div style="flex:1; overflow-y:auto; padding:18px 24px; display:flex; flex-direction:column; gap:14px;">
        <p style="font-size:0.84rem; color:var(--f-text-secondary); line-height:1.45; margin:0;">
          Cada vez que calificas una tarjeta como <strong style="color:var(--f-green);">"Bien"</strong>, avanza de manera secuencial al siguiente intervalo de repaso. Toca cualquier paso para ajustar su tiempo.
        </p>

        <!-- Steps List Mount -->
        <div id="learning-phase-steps-mount" class="apple-card-grouped" style="padding:2px 0;">
        </div>

        <!-- Add Step button -->
        <button class="apple-btn-secondary" id="btn-add-review-step" style="padding:13px; border-radius:14px; font-weight:800; font-size:0.95rem; border:1.5px dashed rgba(56,189,248,0.35); color:#38bdf8; background:rgba(56,189,248,0.05); display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer;">
          <span>+</span> Agregar Nuevo Paso de Revisión
        </button>
      </div>

      <!-- Modal Footer -->
      <div style="padding:14px 24px 20px; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:flex-end; background:linear-gradient(0deg, rgba(255,255,255,0.03), transparent);">
        <button class="apple-btn-primary" id="btn-save-learning-steps" style="width:100%; padding:14px; border-radius:14px; font-size:1rem; justify-content:center; background:linear-gradient(135deg, #38bdf8, #2563eb); color:#ffffff; font-weight:800; box-shadow:0 4px 16px rgba(56,189,248,0.35);">
          🔒 Guardar Configuración de Intervalos
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
      <div class="apple-list-row modal-step-row" data-step-idx="${idx}" style="padding:11px 16px; cursor:pointer; transition:background 0.12s ease;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:26px; height:26px; border-radius:8px; background:rgba(56,189,248,0.12); color:#38bdf8; font-size:0.75rem; font-weight:800; display:flex; align-items:center; justify-content:center;">
            ${idx + 1}
          </div>
          <div>
            <span style="font-size:0.92rem; font-weight:600; color:#fff;">Revisión ${idx + 1}:</span>
            <span style="color:var(--f-blue); font-weight:800; margin-left:6px; font-size:0.96rem;">${step.label}</span>
          </div>
        </div>
        
        <div style="display:flex; align-items:center; gap:8px;">
          <button type="button" class="apple-btn-outline-pill btn-modal-edit-step" data-step-idx="${idx}" style="font-size:0.74rem; padding:3px 10px;">
            Editar
          </button>
          ${
            idx > 0
              ? `<button type="button" class="apple-icon-del-btn btn-modal-del-step" data-step-idx="${idx}" title="Eliminar paso">×</button>`
              : `<span style="width:28px;"></span>`
          }
        </div>
      </div>
    `
      )
      .join('');

    // Click row or edit button to edit
    mount.querySelectorAll<HTMLElement>('.modal-step-row').forEach((row) => {
      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).classList.contains('btn-modal-del-step')) return;
        const idx = parseInt(row.dataset.stepIdx || '0', 10);
        const currentMins = currentSteps[idx]?.minutes || 1440;
        dialogService.showIntervalPicker({
          title: `Modificar Revisión ${idx + 1}`,
          subtitle: `Ajusta el tiempo exacto para la revisión #${idx + 1}:`,
          initialMinutes: currentMins,
          onConfirm: (totalMinutes) => {
            currentSteps[idx] = {
              label: srsService.formatMinutesToHuman(totalMinutes),
              minutes: totalMinutes
            };
            renderSteps();
          }
        });
      });
    });

    // Delete step
    mount.querySelectorAll<HTMLButtonElement>('.btn-modal-del-step').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.stepIdx || '0', 10);
        currentSteps.splice(idx, 1);
        renderSteps();
      });
    });
  };

  renderSteps();

  // Add step with smart next interval
  document.getElementById('btn-add-review-step')?.addEventListener('click', () => {
    const lastStepMin = currentSteps.length > 0 ? currentSteps[currentSteps.length - 1].minutes : 1440;
    // Siguiente paso sugerido lógico (1.5x o 1 día si vacío), NUNCA 600 días
    const suggestedNext = currentSteps.length > 0 ? Math.round(lastStepMin * 1.5) : 1440;

    dialogService.showIntervalPicker({
      title: `Nuevo Paso de Revisión #${currentSteps.length + 1}`,
      subtitle: 'Configura el intervalo en días, horas o minutos:',
      initialMinutes: suggestedNext,
      onConfirm: (totalMinutes) => {
        currentSteps.push({
          label: srsService.formatMinutesToHuman(totalMinutes),
          minutes: totalMinutes
        });
        renderSteps();
      }
    });
  });

  // Template: 12 Pasos FSRS
  document.getElementById('tpl-fsrs-12')?.addEventListener('click', () => {
    currentSteps = default12Steps.map(s => ({ ...s }));
    renderSteps();
  });

  // Template: Anki Estándar
  document.getElementById('tpl-anki-std')?.addEventListener('click', () => {
    const ankiSteps = [1, 10, 1440, 4320, 10080, 21600, 43200];
    currentSteps = ankiSteps.map((m) => ({
      label: srsService.formatMinutesToHuman(m),
      minutes: m
    }));
    renderSteps();
  });

  // Template: Examen Rápido
  document.getElementById('tpl-exam-fast')?.addEventListener('click', () => {
    const examSteps = [5, 25, 120, 720, 1440, 2880, 5760];
    currentSteps = examSteps.map((m) => ({
      label: srsService.formatMinutesToHuman(m),
      minutes: m
    }));
    renderSteps();
  });

  // Sort steps ascending
  document.getElementById('btn-sort-steps')?.addEventListener('click', () => {
    currentSteps.sort((a, b) => a.minutes - b.minutes);
    renderSteps();
  });

  // How it works
  document.getElementById('btn-how-it-works')?.addEventListener('click', () => {
    dialogService.showAlert({
      title: 'Algoritmo de Intervalos Fijos',
      message: '1. Cada tarjeta inicia en la Revisión 1.\n2. Cada respuesta "Bien" o "Fácil" traslada la tarjeta a la siguiente etapa de revisión secuencial.\n3. Al responder "Muy Difícil", la tarjeta regresa al paso 1 para consolidar la memoria.\n4. Puedes personalizar o agregar tantos pasos como necesites tocando sobre cada uno.'
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

