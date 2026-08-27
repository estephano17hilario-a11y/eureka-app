import type { Deck, Flashcard, OcclusionMask, OcclusionMode } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { ttsService } from '../services/tts.service';
import { openImageOcclusionModal } from './ImageOcclusionModal';
import { openFigmaAiBuilderModal } from './FigmaAiBuilderModal';
import { HEART_ANATOMY_SVG_URI } from '../services/demo-data';

export interface FigmaCardEditorCallbacks {
  onBack: () => void;
  onSaved: () => void;
}

export function renderFigmaCardEditor(deck: Deck, parentDeck?: Deck, editCard?: Flashcard): string {
  return `
    <div>
      <!-- Action Header with 4-level Breadcrumbs -->
      <div class="figma-action-header">
        <div class="figma-breadcrumbs" style="font-size:1.1rem; flex-wrap:wrap;">
          <button class="figma-icon-btn-dark" id="btn-card-edit-back" style="margin-right:6px;" title="Volver">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <span class="figma-crumb-link" id="crumb-e-inicio">Inicio</span>
          ${
            parentDeck
              ? `
            <span class="figma-crumb-sep">/</span>
            <span class="figma-crumb-link" id="crumb-e-parent">${parentDeck.name}</span>
          `
              : ''
          }
          <span class="figma-crumb-sep">/</span>
          <span class="figma-crumb-link" id="crumb-e-deck">${deck.name}</span>
          <span class="figma-crumb-sep">/</span>
          <span class="figma-crumb-current" style="font-weight:700;">${editCard ? 'Editar tarjeta' : 'Agregar nueva tarjeta'}</span>
        </div>

        <div class="figma-header-actions-group">
          <button class="figma-icon-btn-dark" id="btn-toggle-editor-mode" title="Vista dividida">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
          </button>

          <button class="figma-icon-btn-dark" id="btn-save-card-check" style="background:var(--f-blue); border-color:var(--f-blue); color:#090a0d;" title="Guardar tarjeta">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Editor Container -->
      <div class="figma-editor-container apple-glass-panel">
        
        <!-- ANVERSO -->
        <div class="figma-field-block">
          <label class="figma-field-label">Anverso</label>
          <textarea 
            id="f-anverso-input" 
            class="figma-editor-textarea" 
            placeholder="Introduce el texto aquí"
          >${editCard?.front || ''}</textarea>

          <!-- Rich Toolbar Anverso -->
          <div class="figma-rich-toolbar">
            <button type="button" class="figma-btn-ai-builder" id="btn-ai-anverso">
              <span>✨ AI Builder</span>
            </button>

            <button type="button" class="figma-tool-btn" id="tool-img-anverso" title="Adjuntar Imagen">📷</button>
            <input type="file" id="f-file-anverso" accept="image/*" style="display:none;" />

            <button type="button" class="figma-tool-btn" id="tool-draw-anverso" title="Dibujar">✏️</button>
            <button type="button" class="figma-tool-btn" id="tool-occlusion-btn" title="Oclusión de Imágenes (Genera tarjetas individuales por cada máscara)" style="color:#50b5ff;">🔲</button>
            <button type="button" class="figma-tool-btn" id="tool-audio-anverso" title="Audio TTS">🔊</button>
            <button type="button" class="figma-tool-btn" id="tool-a-anverso" title="Formato">A</button>

            <span style="width:1px; height:18px; background:var(--f-border); margin:0 4px;"></span>

            <button type="button" class="figma-tool-btn" data-fmt="**" title="Negrita"><strong>B</strong></button>
            <button type="button" class="figma-tool-btn" data-fmt="*" title="Cursiva"><em>I</em></button>
            <button type="button" class="figma-tool-btn" data-fmt="__" title="Subrayado"><u>U</u></button>
            <button type="button" class="figma-tool-btn" data-fmt="~~" title="Tachado"><s>S</s></button>
            <button type="button" class="figma-tool-btn" data-fmt="## " title="Encabezado">H</button>
            <button type="button" class="figma-tool-btn" data-fmt="- " title="Lista">≡</button>
            <button type="button" class="figma-tool-btn" data-fmt="$_2$" title="Subíndice">X₂</button>
            <button type="button" class="figma-tool-btn" data-fmt="$^2$" title="Superíndice">X²</button>
            <button type="button" class="figma-tool-btn" id="tool-katex-anverso" title="Fórmula LaTeX" style="color:#818cf8; font-weight:800;">fx</button>
            <button type="button" class="figma-tool-btn" data-fmt="\`\`\`" title="Código">&lt;/&gt;</button>
          </div>

          <div id="f-anverso-img-preview" class="image-attach-preview ${editCard?.frontImage ? '' : 'hidden'}">
            <img src="${editCard?.frontImage || ''}" id="f-anverso-img-tag" alt="Adjunto anverso" />
            <button type="button" class="btn-remove-img" id="btn-del-anverso-img">×</button>
          </div>
        </div>

        <!-- REVERSO -->
        <div class="figma-field-block">
          <label class="figma-field-label">Reverso</label>
          <textarea 
            id="f-reverso-input" 
            class="figma-editor-textarea" 
            placeholder="Introduce el texto aquí"
          >${editCard?.back || ''}</textarea>

          <!-- Rich Toolbar Reverso -->
          <div class="figma-rich-toolbar">
            <button type="button" class="figma-btn-ai-builder" id="btn-ai-reverso">
              <span>✨ AI Builder</span>
            </button>

            <button type="button" class="figma-tool-btn" id="tool-img-reverso" title="Adjuntar Imagen">📷</button>
            <input type="file" id="f-file-reverso" accept="image/*" style="display:none;" />

            <button type="button" class="figma-tool-btn" id="tool-audio-reverso" title="Audio TTS">🔊</button>
            <button type="button" class="figma-tool-btn" data-fmt-r="**" title="Negrita"><strong>B</strong></button>
            <button type="button" class="figma-tool-btn" data-fmt-r="*" title="Cursiva"><em>I</em></button>
            <button type="button" class="figma-tool-btn" data-fmt-r="__" title="Subrayado"><u>U</u></button>
            <button type="button" class="figma-tool-btn" data-fmt-r="~~" title="Tachado"><s>S</s></button>
            <button type="button" class="figma-tool-btn" data-fmt-r="## " title="Encabezado">H</button>
            <button type="button" class="figma-tool-btn" id="tool-katex-reverso" title="Fórmula LaTeX" style="color:#818cf8; font-weight:800;">fx</button>
            <button type="button" class="figma-tool-btn" data-fmt-r="\`\`\`" title="Código">&lt;/&gt;</button>
          </div>

          <div id="f-reverso-img-preview" class="image-attach-preview ${editCard?.backImage ? '' : 'hidden'}">
            <img src="${editCard?.backImage || ''}" id="f-reverso-img-tag" alt="Adjunto reverso" />
            <button type="button" class="btn-remove-img" id="btn-del-reverso-img">×</button>
          </div>
        </div>

        <!-- Toggle Tarjetas Invertidas -->
        <div class="figma-toggle-row">
          <div class="figma-toggle-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <span>Tarjetas invertidas</span>
            <span style="color:var(--f-text-muted); cursor:pointer;" title="Crea dos tarjetas automáticamente: Anverso -> Reverso y Reverso -> Anverso">ⓘ</span>
          </div>

          <label class="figma-switch">
            <input type="checkbox" id="toggle-inverted-cards" />
            <span class="figma-slider"></span>
          </label>
        </div>

      </div>

      <!-- Floating Buttons -->
      <button class="figma-fab-help" id="btn-fab-help" title="Ayuda">
        ?
      </button>
    </div>
  `;
}

export function bindFigmaCardEditorEvents(
  container: HTMLElement,
  deck: Deck,
  editCard: Flashcard | undefined,
  callbacks: FigmaCardEditorCallbacks
): void {
  const anversoInput = container.querySelector('#f-anverso-input') as HTMLTextAreaElement | null;
  const reversoInput = container.querySelector('#f-reverso-input') as HTMLTextAreaElement | null;
  const invertedToggle = container.querySelector('#toggle-inverted-cards') as HTMLInputElement | null;

  let frontImage = editCard?.frontImage;
  let backImage = editCard?.backImage;
  let occlusionImage = editCard?.occlusionImage;
  let occlusionMasks: OcclusionMask[] = editCard?.occlusionMasks || [];
  let currentOcclusionMode: OcclusionMode = editCard?.occlusionMode || 'hide_all_reveal_one';

  const insertFormatting = (textarea: HTMLTextAreaElement | null, prefix: string, suffix: string = '') => {
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || 'texto';
    textarea.value = text.substring(0, start) + prefix + selected + (suffix || prefix) + text.substring(end);
    textarea.focus();
  };

  container.querySelectorAll<HTMLButtonElement>('[data-fmt]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fmt = btn.dataset.fmt;
      if (fmt) insertFormatting(anversoInput, fmt);
    });
  });

  container.querySelectorAll<HTMLButtonElement>('[data-fmt-r]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fmt = btn.dataset.fmtR;
      if (fmt) insertFormatting(reversoInput, fmt);
    });
  });

  container.querySelector('#btn-card-edit-back')?.addEventListener('click', () => callbacks.onBack());
  container.querySelector('#crumb-e-inicio')?.addEventListener('click', () => callbacks.onBack());
  container.querySelector('#crumb-e-parent')?.addEventListener('click', () => callbacks.onBack());
  container.querySelector('#crumb-e-deck')?.addEventListener('click', () => callbacks.onBack());

  // AI Builder
  const openAi = () => {
    openFigmaAiBuilderModal({
      deckId: deck.id,
      onInsertToEditor: (card) => {
        if (anversoInput) anversoInput.value = card.front;
        if (reversoInput) reversoInput.value = card.back;
      },
      onBatchAdded: () => {
        callbacks.onSaved();
      },
      onClose: () => {}
    });
  };

  container.querySelector('#btn-ai-anverso')?.addEventListener('click', openAi);
  container.querySelector('#btn-ai-reverso')?.addEventListener('click', openAi);

  // Occlusion button opens modal with Multi-Card Split
  container.querySelector('#tool-occlusion-btn')?.addEventListener('click', () => {
    openImageOcclusionModal({
      deckId: deck.id,
      initialImage: occlusionImage || HEART_ANATOMY_SVG_URI,
      initialMasks: occlusionMasks,
      initialMode: currentOcclusionMode,
      onConfirm: (img, masks, mode) => {
        if (masks.length > 0) {
          // Genera automáticamente N flashcards individuales para el mazo
          deckService.createOcclusionCards(deck.id, img, masks, mode);
          callbacks.onSaved();
        } else {
          occlusionImage = img;
          occlusionMasks = masks;
          currentOcclusionMode = mode;
        }
      },
      onClose: () => {}
    });
  });

  // LaTeX shortcut
  container.querySelector('#tool-katex-anverso')?.addEventListener('click', () => {
    if (anversoInput) {
      anversoInput.value += ' $$E = mc^2$$ ';
      anversoInput.focus();
    }
  });

  container.querySelector('#tool-katex-reverso')?.addEventListener('click', () => {
    if (reversoInput) {
      reversoInput.value += ' $$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$ ';
      reversoInput.focus();
    }
  });

  // Audio TTS
  container.querySelector('#tool-audio-anverso')?.addEventListener('click', () => {
    const text = anversoInput?.value || 'Audio de prueba';
    ttsService.speak(text, deck.settings.ttsVoiceLang);
  });

  container.querySelector('#tool-audio-reverso')?.addEventListener('click', () => {
    const text = reversoInput?.value || 'Respuesta de prueba';
    ttsService.speak(text, deck.settings.ttsVoiceLang);
  });

  // Save Card
  const saveCard = () => {
    const front = anversoInput?.value.trim() || 'Pregunta';
    const back = reversoInput?.value.trim() || 'Respuesta';
    const isOcclusion = occlusionMasks.length > 0;
    const isLatex = front.includes('$') || back.includes('$');
    const createInverted = invertedToggle?.checked || false;

    const cardType = isOcclusion ? 'image_occlusion' : isLatex ? 'latex' : 'standard';

    if (editCard) {
      deckService.updateCard(editCard.id, {
        deckId: deck.id,
        type: cardType,
        front,
        back,
        frontImage,
        backImage,
        occlusionImage: isOcclusion ? occlusionImage : undefined,
        occlusionMasks: isOcclusion ? occlusionMasks : undefined,
        activeMaskId: isOcclusion && occlusionMasks[0] ? occlusionMasks[0].id : undefined,
        occlusionMode: currentOcclusionMode
      });
    } else {
      deckService.createCard(
        {
          deckId: deck.id,
          type: cardType,
          front,
          back,
          frontImage,
          backImage,
          occlusionImage: isOcclusion ? occlusionImage : undefined,
          occlusionMasks: isOcclusion ? occlusionMasks : undefined,
          activeMaskId: isOcclusion && occlusionMasks[0] ? occlusionMasks[0].id : undefined,
          occlusionMode: currentOcclusionMode
        },
        createInverted
      );
    }

    callbacks.onSaved();
  };

  container.querySelector('#btn-save-card-check')?.addEventListener('click', saveCard);
}
