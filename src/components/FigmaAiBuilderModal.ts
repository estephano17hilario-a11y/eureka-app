import { aiBuilderService, type GeneratedCard } from '../services/ai-builder.service';
import { deckService } from '../services/deck.service';
import { katexService } from '../services/katex.service';

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
      <div class="apple-glass-modal" style="max-width:640px; width:94%; max-height:92vh; display:flex; flex-direction:column; padding:0; overflow:hidden; border:1px solid rgba(255,255,255,0.14); box-shadow:0 28px 70px rgba(0,0,0,0.75);">
        
        <!-- Header -->
        <div class="figma-modal-header" style="padding:18px 24px; border-bottom:1px solid rgba(255,255,255,0.08); background:linear-gradient(180deg, rgba(236,72,153,0.08), transparent); display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:40px; height:40px; border-radius:12px; background:linear-gradient(135deg, #ec4899, #8b5cf6); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.3rem; box-shadow:0 6px 18px rgba(236,72,153,0.35);">
              ✨
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <h3 style="font-size:1.25rem; font-weight:800; color:#fff; letter-spacing:-0.02em; margin:0;">AI Flashcard Builder</h3>
                <span class="apple-badge-beta" style="background:rgba(236,72,153,0.2); color:#f472b6; border:1px solid rgba(236,72,153,0.3); font-size:0.72rem; padding:2px 8px; border-radius:6px; font-weight:800;">Sin Límites</span>
              </div>
              <p style="font-size:0.8rem; color:var(--f-text-secondary); margin:2px 0 0 0;">
                Convierte apuntes largos, resúmenes, libros o temas en tarjetas de estudio
              </p>
            </div>
          </div>
          <button class="figma-btn-ghost" id="btn-close-ai-modal" style="width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:var(--f-text-secondary); display:flex; align-items:center; justify-content:center; font-size:1.2rem; cursor:pointer;">×</button>
        </div>

        <!-- Body -->
        <div class="modal-body" style="padding:20px 24px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:14px;">
          
          <!-- Textarea Form Group -->
          <div class="form-group" style="margin:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <label class="form-label" style="color:var(--f-text-secondary); font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; margin:0;">
                Texto Completo, Apuntes o Tema de Estudio:
              </label>
              <span id="ai-char-counter" style="font-size:0.75rem; color:var(--f-text-muted);">0 caracteres (Ilimitado)</span>
            </div>
            
            <textarea 
              id="ai-prompt-input" 
              class="figma-editor-textarea" 
              style="min-height:140px; max-height:300px; border-radius:14px; font-size:0.9rem; line-height:1.5; padding:14px; background:rgba(0,0,0,0.3); border:1.5px solid rgba(255,255,255,0.12); color:#ffffff; resize:vertical; outline:none;" 
              placeholder="Pega aquí tus apuntes completos, artículos, definiciones o tema...&#10;Ej: El ciclo de Krebs ocurre en la matriz mitocondrial y produce NADH, FADH2 y ATP..."
              spellcheck="false"
            ></textarea>
          </div>

          <!-- Quantity Selector & Quick Topic Chips -->
          <div style="display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
              
              <!-- Topic Chips -->
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button type="button" class="btn-preset-chip" data-ai-topic="Mecánica Cuántica y Ecuación de Schrödinger">⚛️ Cuántica</button>
                <button type="button" class="btn-preset-chip" data-ai-topic="Anatomía y Fisiología del Corazón Humano">🫀 Corazón</button>
                <button type="button" class="btn-preset-chip" data-ai-topic="Vocabulario Avanzado C1 y Phrasal Verbs en Inglés">🌍 Inglés</button>
              </div>

              <!-- Quantity selector -->
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:0.75rem; font-weight:700; color:var(--f-text-muted);">Cantidad:</span>
                <select id="ai-target-count" class="cupertino-dialog-input" style="padding:4px 8px; font-size:0.82rem; width:auto;">
                  <option value="3">3 tarjetas</option>
                  <option value="5" selected>5 tarjetas</option>
                  <option value="10">10 tarjetas</option>
                  <option value="15">15 tarjetas</option>
                  <option value="25">25 tarjetas</option>
                  <option value="50">50 tarjetas</option>
                </select>
              </div>
            </div>

            <!-- Generate Button -->
            <button class="figma-btn-blue-pill" id="btn-trigger-ai-gen" style="width:100%; padding:13px; border-radius:12px; font-weight:800; font-size:0.95rem; justify-content:center; background:linear-gradient(135deg, #ec4899, #8b5cf6); box-shadow:0 4px 18px rgba(236,72,153,0.35);">
              <span>✨ Generar Flashcards Inteligentes</span>
            </button>
          </div>

          <!-- Results Container -->
          <div id="ai-results-container" class="hidden" style="margin-top:4px; border-top:1px solid rgba(255,255,255,0.08); padding-top:14px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
              <h4 style="font-size:0.92rem; font-weight:800; color:#fff; margin:0;" id="ai-results-title">Tarjetas Generadas</h4>
              <span style="font-size:0.76rem; color:var(--f-blue);" id="ai-results-count">0 listas</span>
            </div>
            
            <div id="ai-cards-list" style="display:flex; flex-direction:column; gap:10px; max-height:240px; overflow-y:auto; padding-right:4px;"></div>
            
            <div style="margin-top:14px; display:flex; justify-content:flex-end; gap:10px;">
              <button class="figma-btn-blue-pill" id="btn-add-all-ai-cards" style="width:100%; justify-content:center; padding:14px; border-radius:14px; font-weight:800; font-size:0.96rem; background:linear-gradient(135deg, #38bdf8, #2563eb); box-shadow:0 4px 16px rgba(56,189,248,0.4);">
                📥 Añadir Todas al Mazo
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const promptInput = document.getElementById('ai-prompt-input') as HTMLTextAreaElement | null;
  const charCounter = document.getElementById('ai-char-counter');
  const targetCountSelect = document.getElementById('ai-target-count') as HTMLSelectElement | null;
  const resultsContainer = document.getElementById('ai-results-container');
  const resultsCount = document.getElementById('ai-results-count');
  const cardsList = document.getElementById('ai-cards-list');
  let currentGeneratedCards: GeneratedCard[] = [];

  // Real-time character counter
  promptInput?.addEventListener('input', () => {
    const len = promptInput.value.length;
    if (charCounter) {
      charCounter.textContent = `${len.toLocaleString()} caracteres (Ilimitado)`;
    }
  });

  // Chip clicks
  document.querySelectorAll<HTMLButtonElement>('[data-ai-topic]').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (promptInput) {
        promptInput.value = chip.dataset.aiTopic || '';
        promptInput.dispatchEvent(new Event('input'));
      }
    });
  });

  const renderGeneratedCardsList = () => {
    if (!cardsList || !resultsContainer) return;

    if (currentGeneratedCards.length === 0) {
      resultsContainer.classList.add('hidden');
      return;
    }

    if (resultsCount) resultsCount.textContent = `${currentGeneratedCards.length} tarjetas listas`;

    cardsList.innerHTML = currentGeneratedCards
      .map(
        (c, idx) => `
      <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; position:relative;">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px;">
          <div style="font-size:0.9rem; font-weight:700; color:#fff; margin-bottom:4px; flex:1;">
            #${idx + 1}: ${katexService.parseAndRender(c.front)}
          </div>
          <button type="button" class="apple-icon-del-btn btn-del-gen-card" data-card-idx="${idx}" style="font-size:1.1rem; color:var(--f-text-muted); cursor:pointer;" title="Descartar tarjeta">×</button>
        </div>
        <div style="font-size:0.82rem; color:var(--f-text-secondary); line-height:1.45; border-top:1px solid rgba(255,255,255,0.05); padding-top:6px; margin-top:4px;">
          ${katexService.parseAndRender(c.back)}
        </div>
      </div>
    `
      )
      .join('');

    resultsContainer.classList.remove('hidden');

    cardsList.querySelectorAll<HTMLButtonElement>('.btn-del-gen-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.cardIdx || '0', 10);
        currentGeneratedCards.splice(idx, 1);
        renderGeneratedCardsList();
      });
    });
  };

  // Generate
  document.getElementById('btn-trigger-ai-gen')?.addEventListener('click', () => {
    const text = promptInput?.value.trim() || 'Conceptos Generales de Estudio';
    const targetCount = parseInt(targetCountSelect?.value || '5', 10);
    currentGeneratedCards = aiBuilderService.generateCards(text, targetCount);
    renderGeneratedCardsList();
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

