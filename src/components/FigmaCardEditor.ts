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
    <div class="ios-fullscreen-view">
      
      <!-- Top Action Navigation Header matching Reference Images 2 & 3 -->
      <div class="ios-navbar" style="padding-bottom:12px; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:8px; font-size:1.15rem; font-weight:700;">
          <button class="ios-back-btn" id="btn-card-edit-back" style="padding:0; margin-right:4px;" title="Volver">
            <span class="ios-back-chevron">‹</span>
          </button>
          <span class="figma-crumb-link" id="crumb-e-inicio" style="color:var(--f-text-secondary); cursor:pointer;">Inicio</span>
          ${
            parentDeck
              ? `
            <span style="color:var(--f-text-muted);">/</span>
            <span class="figma-crumb-link" id="crumb-e-parent" style="color:var(--f-text-secondary); cursor:pointer;">${parentDeck.name}</span>
          `
              : ''
          }
          <span style="color:var(--f-text-muted);">/</span>
          <span class="figma-crumb-link" id="crumb-e-deck" style="color:var(--f-text-secondary); cursor:pointer;">${deck.name}</span>
          <span style="color:var(--f-text-muted);">/</span>
          <span style="color:#ffffff; font-weight:800;">${editCard ? 'Editar tarjeta' : 'Agregar nueva tarjeta'}</span>
        </div>

        <div style="display:flex; align-items:center; gap:10px; margin-left:auto;">
          <button class="cupertino-icon-square" id="btn-toggle-editor-split" style="width:44px; height:44px;" title="Vista dividida">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
          </button>

          <button class="cupertino-btn-check-save" id="btn-save-card-check" title="Guardar tarjeta">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#090a0d" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Editor Container (Matching Images 2 & 3 Exactly) -->
      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:18px;">
        
        <!-- ANVERSO -->
        <div class="cupertino-editor-block">
          <label class="cupertino-editor-label">Anverso</label>
          
          <div class="cupertino-editor-card-box" id="drop-zone-anverso">
            
            <textarea 
              id="f-anverso-input" 
              class="cupertino-editor-textarea" 
              placeholder="Introduce el texto aquí"
            >${editCard?.front || ''}</textarea>

            <!-- Image Attachment Thumbnail Inside the Card (Matching Image 3) -->
            <div id="f-anverso-img-preview" class="cupertino-thumbnail-box ${editCard?.frontImage || editCard?.occlusionImage ? '' : 'hidden'}">
              <img src="${editCard?.frontImage || editCard?.occlusionImage || ''}" id="f-anverso-img-tag" alt="Anverso preview" class="cupertino-thumb-img" />
              <button type="button" class="cupertino-thumb-del-badge" id="btn-del-anverso-img" title="Eliminar imagen">×</button>
              <div class="cupertino-thumb-overlay" id="btn-manage-anverso-img" title="Opciones de imagen">
                ${editCard?.type === 'image_occlusion' ? '🔲 Oclusión' : '🔍 Ver'}
              </div>
            </div>

            <!-- Toolbar Anverso (Matching Image 2 & 3) -->
            <div class="cupertino-rich-toolbar-dock">
              <button type="button" class="cupertino-btn-ai-pill" id="btn-ai-anverso">
                <span>✨ AI Builder</span>
              </button>

              <button type="button" class="cupertino-tool-icon" id="tool-img-anverso" title="Adjuntar Imagen">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
              <input type="file" id="f-file-anverso" accept="image/*" style="display:none;" />

              <button type="button" class="cupertino-tool-icon" id="tool-draw-anverso" title="Dibujo libre">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
              </button>

              <button type="button" class="cupertino-tool-icon" id="tool-occlusion-btn" title="Oclusión de Imagen" style="color:var(--f-blue);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 3"/><rect x="8" y="8" width="8" height="8" rx="1"/></svg>
              </button>

              <button type="button" class="cupertino-tool-icon" id="tool-audio-anverso" title="Audio TTS">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              </button>

              <button type="button" class="cupertino-tool-icon" id="tool-a-anverso" title="Tamaño de Fuente" style="font-weight:800;">A</button>

              <span class="cupertino-tool-divider"></span>

              <button type="button" class="cupertino-tool-icon" data-fmt="**" title="Negrita"><strong>B</strong></button>
              <button type="button" class="cupertino-tool-icon" data-fmt="*" title="Cursiva"><em>I</em></button>
              <button type="button" class="cupertino-tool-icon" data-fmt="__" title="Subrayado"><u>U</u></button>
              <button type="button" class="cupertino-tool-icon" data-fmt="~~" title="Tachado"><s>S</s></button>
              <button type="button" class="cupertino-tool-icon" data-fmt="## " title="Encabezado">H</button>
              <button type="button" class="cupertino-tool-icon" data-fmt="- " title="Lista con viñetas">≡</button>
              <button type="button" class="cupertino-tool-icon" data-fmt="1. " title="Lista numerada">1≡</button>
              <button type="button" class="cupertino-tool-icon" data-fmt="$_2$" title="Subíndice">X₂</button>
              <button type="button" class="cupertino-tool-icon" data-fmt="$^2$" title="Superíndice">X²</button>
              <button type="button" class="cupertino-tool-icon" id="tool-katex-anverso" title="Fórmula KaTeX" style="color:var(--f-blue); font-weight:800;">fx</button>
              <button type="button" class="cupertino-tool-icon" data-fmt="\`\`\`" title="Bloque de código">&lt;/&gt;</button>
              <button type="button" class="cupertino-tool-icon" data-fmt="[enlace](url)" title="Hipervínculo">🔗</button>
            </div>

          </div>
        </div>

        <!-- REVERSO -->
        <div class="cupertino-editor-block">
          <label class="cupertino-editor-label">Reverso</label>
          
          <div class="cupertino-editor-card-box" id="drop-zone-reverso">
            
            <textarea 
              id="f-reverso-input" 
              class="cupertino-editor-textarea" 
              placeholder="Introduce el texto aquí"
            >${editCard?.back || ''}</textarea>

            <!-- Image Attachment Thumbnail Inside the Card (Matching Image 3) -->
            <div id="f-reverso-img-preview" class="cupertino-thumbnail-box ${editCard?.backImage ? '' : 'hidden'}">
              <img src="${editCard?.backImage || ''}" id="f-reverso-img-tag" alt="Reverso preview" class="cupertino-thumb-img" />
              <button type="button" class="cupertino-thumb-del-badge" id="btn-del-reverso-img" title="Eliminar imagen">×</button>
              <div class="cupertino-thumb-overlay" id="btn-manage-reverso-img" title="Ver imagen">
                🔍 Ver
              </div>
            </div>

            <!-- Toolbar Reverso (Matching Image 2 & 3) -->
            <div class="cupertino-rich-toolbar-dock">
              <button type="button" class="cupertino-btn-ai-pill" id="btn-ai-reverso">
                <span>✨ AI Builder</span>
              </button>

              <button type="button" class="cupertino-tool-icon" id="tool-img-reverso" title="Adjuntar Imagen">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
              <input type="file" id="f-file-reverso" accept="image/*" style="display:none;" />

              <button type="button" class="cupertino-tool-icon" id="tool-audio-reverso" title="Audio TTS">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              </button>

              <button type="button" class="cupertino-tool-icon" data-fmt-r="**" title="Negrita"><strong>B</strong></button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="*" title="Cursiva"><em>I</em></button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="__" title="Subrayado"><u>U</u></button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="~~" title="Tachado"><s>S</s></button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="## " title="Encabezado">H</button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="- " title="Lista">≡</button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="1. " title="Lista numerada">1≡</button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="$_2$" title="Subíndice">X₂</button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="$^2$" title="Superíndice">X²</button>
              <button type="button" class="cupertino-tool-icon" id="tool-katex-reverso" title="Fórmula KaTeX" style="color:var(--f-blue); font-weight:800;">fx</button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="\`\`\`" title="Código">&lt;/&gt;</button>
              <button type="button" class="cupertino-tool-icon" data-fmt-r="[enlace](url)" title="Hipervínculo">🔗</button>
            </div>

          </div>
        </div>

        <!-- Toggle Tarjetas Invertidas (Matching Image 2) -->
        <div class="apple-card-grouped" style="padding:18px 22px;">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
              <span style="font-size:1.05rem; font-weight:700; color:#fff;">Tarjetas invertidas</span>
              <span style="color:var(--f-text-muted); cursor:pointer; font-size:1rem;" title="Genera dos tarjetas recíprocas (Anverso -> Reverso y Reverso -> Anverso)">ⓘ</span>
            </div>

            <label class="figma-switch">
              <input type="checkbox" id="toggle-inverted-cards" ${editCard?.isInverted ? 'checked' : ''} />
              <span class="figma-slider"></span>
            </label>
          </div>
        </div>

      </div>

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

  let frontImage: string | undefined = editCard?.frontImage;
  let backImage: string | undefined = editCard?.backImage;
  let occlusionImage: string | undefined = editCard?.occlusionImage;
  let occlusionMasks: OcclusionMask[] = editCard?.occlusionMasks || [];
  let currentOcclusionMode: OcclusionMode = editCard?.occlusionMode || 'hide_all_reveal_one';

  const updateThumbnailBoxes = () => {
    const prevA = container.querySelector('#f-anverso-img-preview') as HTMLElement | null;
    const tagA = container.querySelector('#f-anverso-img-tag') as HTMLImageElement | null;
    const imgA = frontImage || occlusionImage;
    if (prevA && tagA) {
      if (imgA) {
        tagA.src = imgA;
        prevA.classList.remove('hidden');
      } else {
        prevA.classList.add('hidden');
      }
    }

    const prevR = container.querySelector('#f-reverso-img-preview') as HTMLElement | null;
    const tagR = container.querySelector('#f-reverso-img-tag') as HTMLImageElement | null;
    if (prevR && tagR) {
      if (backImage) {
        tagR.src = backImage;
        prevR.classList.remove('hidden');
      } else {
        prevR.classList.add('hidden');
      }
    }
  };

  // Helper File -> DataURL
  const handleFileToDataUrl = (file: File | Blob, isFront: boolean) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res) {
        if (isFront) frontImage = res;
        else backImage = res;
        updateThumbnailBoxes();
      }
    };
    reader.readAsDataURL(file);
  };

  // Paste handler
  const setupPaste = (input: HTMLTextAreaElement | null, isFront: boolean) => {
    input?.addEventListener('paste', (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleFileToDataUrl(file, isFront);
            break;
          }
        }
      }
    });
  };

  setupPaste(anversoInput, true);
  setupPaste(reversoInput, false);

  // Drop zone handler
  const setupDropZone = (zoneId: string, isFront: boolean) => {
    const zone = container.querySelector(zoneId) as HTMLElement | null;
    if (!zone) return;

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.style.borderColor = 'var(--f-blue)';
    });

    zone.addEventListener('dragleave', () => {
      zone.style.borderColor = '';
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.style.borderColor = '';
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          handleFileToDataUrl(file, isFront);
        }
      }
    });
  };

  setupDropZone('#drop-zone-anverso', true);
  setupDropZone('#drop-zone-reverso', false);

  // File pickers
  const fileA = container.querySelector('#f-file-anverso') as HTMLInputElement | null;
  container.querySelector('#tool-img-anverso')?.addEventListener('click', () => fileA?.click());
  fileA?.addEventListener('change', () => {
    if (fileA.files && fileA.files[0]) handleFileToDataUrl(fileA.files[0], true);
  });

  const fileR = container.querySelector('#f-file-reverso') as HTMLInputElement | null;
  container.querySelector('#tool-img-reverso')?.addEventListener('click', () => fileR?.click());
  fileR?.addEventListener('change', () => {
    if (fileR.files && fileR.files[0]) handleFileToDataUrl(fileR.files[0], false);
  });

  // Delete thumbnails
  container.querySelector('#btn-del-anverso-img')?.addEventListener('click', (e) => {
    e.stopPropagation();
    frontImage = undefined;
    occlusionImage = undefined;
    occlusionMasks = [];
    updateThumbnailBoxes();
  });

  container.querySelector('#btn-del-reverso-img')?.addEventListener('click', (e) => {
    e.stopPropagation();
    backImage = undefined;
    updateThumbnailBoxes();
  });

  // Manage Thumbnail click
  const openOcclusionTool = () => {
    openImageOcclusionModal({
      deckId: deck.id,
      initialImage: frontImage || occlusionImage || HEART_ANATOMY_SVG_URI,
      initialMasks: occlusionMasks,
      initialMode: currentOcclusionMode,
      onConfirm: (img, masks, mode) => {
        if (masks.length > 0) {
          deckService.createOcclusionCards(deck.id, img, masks, mode);
          callbacks.onSaved();
        } else {
          occlusionImage = img;
          frontImage = img;
          occlusionMasks = masks;
          currentOcclusionMode = mode;
          updateThumbnailBoxes();
        }
      },
      onClose: () => {}
    });
  };

  container.querySelector('#btn-manage-anverso-img')?.addEventListener('click', openOcclusionTool);
  container.querySelector('#tool-occlusion-btn')?.addEventListener('click', openOcclusionTool);

  // Text formatting
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
