import { aiBuilderService, type GeneratedCard } from '../services/ai-builder.service';
import { deckService } from '../services/deck.service';

export interface FigmaAiBuilderOptions {
  deckId: string;
  onInsertToEditor?: (card: GeneratedCard) => void;
  onBatchAdded?: (count: number) => void;
  onClose: () => void;
}

export function openFigmaAiBuilderModal(options: FigmaAiBuilderOptions): void {
  const existing = document.getElementById('modal-ai-builder-root');
  if (existing) existing.remove();

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-ai-builder-root">
      <div class="modal-container" style="max-width:600px; background:var(--f-surface); border:1px solid var(--f-border); border-radius:var(--f-radius-lg);">
        
        <div class="figma-modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg, #ec4899, #8b5cf6); display:flex; align-items:center; justify-content:center; color:#fff;">
              ✨
            </div>
            <div>
              <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">AI Builder Flashcards</h3>
              <p style="font-size:0.75rem; color:var(--f-text-secondary);">Genera tarjetas automáticamente a partir de un tema o notas</p>
            </div>
          </div>
          <button class="figma-btn-ghost" id="btn-close-ai-modal">×</button>
        </div>

        <div class="modal-body" style="padding:20px;">
          
          <div class="form-group">
            <label class="form-label" style="color:var(--f-text-secondary);">Tema o Texto de Estudio</label>
            <textarea 
              id="ai-prompt-input" 
              class="figma-editor-textarea" 
              style="min-height:90px; border-radius:var(--f-radius-sm);" 
              placeholder="Ej: Mecánica Cuántica, Anatomía Cardíaca, Phrasal Verbs en Inglés o pega tus apuntes aquí..."
            ></textarea>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn-preset-chip" data-ai-topic="Mecánica Cuántica y Fórmulas">⚛️ Cuántica</button>
              <button type="button" class="btn-preset-chip" data-ai-topic="Anatomía del Corazón Humano">🫀 Corazón</button>
              <button type="button" class="btn-preset-chip" data-ai-topic="Vocabulario Avanzado Inglés">🌍 Inglés</button>
            </div>

            <button class="figma-btn-blue-pill" id="btn-trigger-ai-gen">
              <span>✨ Generar</span>
            </button>
          </div>

          <div id="ai-results-container" class="hidden" style="margin-top:16px; border-top:1px solid var(--f-border); padding-top:16px;">
            <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:10px; color:#fff;">Tarjetas Generadas</h4>
            <div id="ai-cards-list" style="display:flex; flex-direction:column; gap:10px; max-height:240px; overflow-y:auto;"></div>
            
            <div style="margin-top:16px; display:flex; justify-content:flex-end; gap:10px;">
              <button class="figma-btn-blue-pill" id="btn-add-all-ai-cards" style="width:100%; justify-content:center;">
                Añadir Todas al Mazo
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const promptInput = document.getElementById('ai-prompt-input') as HTMLTextAreaElement | null;
  const resultsContainer = document.getElementById('ai-results-container');
  const cardsList = document.getElementById('ai-cards-list');
  let currentGeneratedCards: GeneratedCard[] = [];

  // Chip clicks
  document.querySelectorAll<HTMLButtonElement>('[data-ai-topic]').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (promptInput) promptInput.value = chip.dataset.aiTopic || '';
    });
  });

  // Generate
  document.getElementById('btn-trigger-ai-gen')?.addEventListener('click', () => {
    const text = promptInput?.value.trim() || 'Conceptos Generales';
    currentGeneratedCards = aiBuilderService.generateCards(text, 3);

    if (cardsList && resultsContainer) {
      cardsList.innerHTML = currentGeneratedCards
        .map(
          (c, idx) => `
        <div style="background:var(--f-input-bg); border:1px solid var(--f-border); border-radius:10px; padding:12px;">
          <div style="font-size:0.88rem; font-weight:700; color:#fff; margin-bottom:4px;">#${idx + 1}: ${c.front}</div>
          <div style="font-size:0.8rem; color:var(--f-text-secondary); line-height:1.4;">${c.back}</div>
        </div>
      `
        )
        .join('');
      resultsContainer.classList.remove('hidden');
    }
  });

  // Add all
  document.getElementById('btn-add-all-ai-cards')?.addEventListener('click', () => {
    currentGeneratedCards.forEach((c) => {
      deckService.createCard({
        deckId: options.deckId,
        type: c.type,
        front: c.front,
        back: c.back
      });
    });
    options.onBatchAdded?.(currentGeneratedCards.length);
    document.getElementById('modal-ai-builder-root')?.remove();
  });

  document.getElementById('btn-close-ai-modal')?.addEventListener('click', () => {
    document.getElementById('modal-ai-builder-root')?.remove();
    options.onClose();
  });
}
