import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { srsService } from '../services/srs.service';
import { dialogService } from '../services/dialog.service';

export function renderDeckSettingsModal(deck: Deck): string {
  const stepsString = srsService.formatStepsToString(deck.settings.learningSteps);

  return `
    <div class="modal-backdrop" id="modal-deck-settings">
      <div class="modal-container">
        
        <div class="modal-header">
          <button type="button" class="modal-btn-text" id="btn-close-settings-modal">Cancelar</button>
          <h3 class="modal-title">Ajustes del Mazo</h3>
          <button type="button" class="modal-btn-text" id="btn-save-settings-top" style="font-weight:700;">Guardar</button>
        </div>

        <div class="modal-body">
          
          <div class="input-group">
            <label class="input-label">Nombre del Mazo</label>
            <input type="text" class="input-text" id="settings-deck-name" value="${deck.name}" />
          </div>

          <div class="input-group">
            <label class="input-label">Descripción</label>
            <textarea class="input-textarea" id="settings-deck-desc" rows="2">${deck.description || ''}</textarea>
          </div>

          <div class="input-group">
            <label class="input-label">Nuevas tarjetas por día</label>
            <input type="number" class="input-text" id="settings-new-cards" value="${deck.settings.newCardsPerDay}" min="1" max="500" />
          </div>

          <div class="input-group">
            <label class="input-label">Máximo de revisiones por día</label>
            <input type="number" class="input-text" id="settings-max-reviews" value="${deck.settings.maxReviewsPerDay}" min="1" max="1000" />
          </div>

          <div class="input-group">
            <label class="input-label">Pasos de aprendizaje (separados por coma)</label>
            <input type="text" class="input-text" id="settings-learning-steps" value="${stepsString}" />
          </div>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border);">
            <button type="button" class="btn btn-danger btn-block" id="btn-delete-deck">
              Eliminar Mazo
            </button>
          </div>

        </div>

      </div>
    </div>
  `;
}

export function bindDeckSettingsModalEvents(deck: Deck, onClose: () => void): void {
  const modal = document.getElementById('modal-deck-settings');
  if (!modal) return;

  document.getElementById('btn-close-settings-modal')?.addEventListener('click', () => {
    modal.remove();
    onClose();
  });

  const saveHandler = () => {
    const nameInput = document.getElementById('settings-deck-name') as HTMLInputElement;
    const descInput = document.getElementById('settings-deck-desc') as HTMLTextAreaElement;
    const newCardsInput = document.getElementById('settings-new-cards') as HTMLInputElement;
    const maxReviewsInput = document.getElementById('settings-max-reviews') as HTMLInputElement;
    const stepsInput = document.getElementById('settings-learning-steps') as HTMLInputElement;

    const newSteps = srsService.parseStepsString(stepsInput.value);

    deckService.updateDeck(deck.id, {
      name: nameInput.value.trim() || deck.name,
      description: descInput.value.trim(),
      settings: {
        ...deck.settings,
        newCardsPerDay: parseInt(newCardsInput.value, 10) || 20,
        maxReviewsPerDay: parseInt(maxReviewsInput.value, 10) || 100,
        learningSteps: newSteps.length > 0 ? newSteps : deck.settings.learningSteps
      }
    });

    modal.remove();
    onClose();
  };

  document.getElementById('btn-save-settings-top')?.addEventListener('click', saveHandler);

  document.getElementById('btn-delete-deck')?.addEventListener('click', () => {
    dialogService.showConfirm({
      title: 'Eliminar Mazo',
      message: `¿Eliminar el mazo "${deck.name}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      isDanger: true,
      onConfirm: () => {
        deckService.deleteDeck(deck.id);
        modal.remove();
        onClose();
      }
    });
  });
}
