import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { srsService } from '../services/srs.service';

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

        <form id="form-deck-settings" class="modal-body">
          
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input type="text" id="setting-deck-name" class="form-input" value="${deck.name}" required />
          </div>

          <div class="form-group">
            <label class="form-label">Descripción</label>
            <input type="text" id="setting-deck-desc" class="form-input" value="${deck.description}" />
          </div>

          <div class="form-group">
            <label class="form-label">
              Intervalos de Repetición Espaciada (SRS)
            </label>
            <input 
              type="text" 
              id="setting-learning-steps" 
              class="form-input" 
              value="${stepsString}" 
              placeholder="5m, 1d, 3d, 7d"
              required 
            />
            <span style="font-size:0.75rem; color:var(--ios-secondary-label); display:block; margin-top:4px;">
              Configura tus peldaños de tiempo (ej: 5m, 1d, 3d, 7d). La opción "Normal" avanzará por estos pasos.
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Idioma de Voz (TTS)</label>
            <select id="setting-tts-lang" class="form-input">
              <option value="es-ES" ${deck.settings.ttsVoiceLang === 'es-ES' ? 'selected' : ''}>Español (España)</option>
              <option value="es-MX" ${deck.settings.ttsVoiceLang === 'es-MX' ? 'selected' : ''}>Español (México)</option>
              <option value="en-US" ${deck.settings.ttsVoiceLang === 'en-US' ? 'selected' : ''}>Inglés (EE.UU.)</option>
              <option value="fr-FR" ${deck.settings.ttsVoiceLang === 'fr-FR' ? 'selected' : ''}>Francés</option>
              <option value="de-DE" ${deck.settings.ttsVoiceLang === 'de-DE' ? 'selected' : ''}>Alemán</option>
            </select>
          </div>

          <div style="margin-top:24px;">
            <button type="button" class="btn-apple-mini" id="btn-delete-deck" style="width:100%; color:var(--ios-red); padding:10px;">
              Eliminar Mazo
            </button>
          </div>

        </form>
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
    const name = (document.getElementById('setting-deck-name') as HTMLInputElement).value;
    const description = (document.getElementById('setting-deck-desc') as HTMLInputElement).value;
    const stepsStr = (document.getElementById('setting-learning-steps') as HTMLInputElement).value;
    const ttsVoiceLang = (document.getElementById('setting-tts-lang') as HTMLSelectElement).value;

    const learningSteps = srsService.parseStepsString(stepsStr);

    deckService.updateDeck(deck.id, {
      name,
      description,
      settings: {
        ...deck.settings,
        learningSteps,
        ttsVoiceLang
      }
    });

    modal.remove();
    onClose();
  };

  document.getElementById('btn-save-settings-top')?.addEventListener('click', saveHandler);

  document.getElementById('btn-delete-deck')?.addEventListener('click', () => {
    if (confirm(`¿Eliminar el mazo "${deck.name}"?`)) {
      deckService.deleteDeck(deck.id);
      modal.remove();
      onClose();
    }
  });
}
