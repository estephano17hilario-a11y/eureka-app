import type { CardType, Flashcard } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { katexService } from '../services/katex.service';
import { ttsService } from '../services/tts.service';
import { ImageOcclusionEditor } from './ImageOcclusionEditor';

export function renderCardEditorModal(initialDeckId?: string, editCard?: Flashcard): string {
  const allDecks = deckService.getAllDecks();
  const selectedDeckId = editCard?.deckId || initialDeckId || allDecks[0]?.id || '';
  const currentType: CardType = editCard?.type || 'standard';

  return `
    <div class="modal-backdrop" id="modal-card-editor">
      <div class="modal-container">
        
        <!-- Header -->
        <div class="modal-header">
          <button type="button" class="modal-btn-text" id="btn-cancel-card-modal">Cancelar</button>
          <h3 class="modal-title">${editCard ? 'Editar Tarjeta' : 'Nueva Flashcard'}</h3>
          <button type="button" class="modal-btn-text" id="btn-save-card-top" style="font-weight:700;">
            ${editCard ? 'Listo' : 'Añadir'}
          </button>
        </div>

        <form id="form-card-editor" class="modal-body">
          
          <!-- Segmented Control Type Switcher -->
          <div class="segmented-control" id="apple-type-segmented">
            <button type="button" class="segment-btn ${currentType === 'standard' || currentType === 'latex' ? 'active' : ''}" data-type="standard">
              Texto & Fórmulas
            </button>
            <button type="button" class="segment-btn ${currentType === 'image_occlusion' ? 'active' : ''}" data-type="image_occlusion">
              Oclusión de Imagen
            </button>
            <button type="button" class="segment-btn ${currentType === 'tts_audio' ? 'active' : ''}" data-type="tts_audio">
              Audio & Voz
            </button>
          </div>

          <!-- Mazo Selector -->
          <div class="form-group">
            <label class="form-label">Mazo</label>
            <select id="card-deck-select" class="form-input">
              ${allDecks
                .map(
                  (d) => `
                <option value="${d.id}" ${d.id === selectedDeckId ? 'selected' : ''}>
                  ${d.parentId ? '↳ ' : '📁 '} ${d.name}
                </option>
              `
                )
                .join('')}
            </select>
          </div>

          <!-- OCLUSIÓN DE IMAGEN -->
          <div id="section-occlusion" class="${currentType === 'image_occlusion' ? '' : 'hidden'}">
            <div class="form-group">
              <label class="form-label">Imagen & Máscaras a Tapar</label>
              <div id="occlusion-canvas-mount"></div>
            </div>
          </div>

          <!-- ANVERSO -->
          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label class="form-label" style="margin-bottom:0;">Anverso (Pregunta / Frente)</label>
              <label class="btn-apple-mini" style="cursor:pointer;">
                📷 Adjuntar Foto
                <input type="file" id="card-front-file" accept="image/*" style="display:none;" />
              </label>
            </div>
            <textarea 
              id="card-front-input" 
              class="form-textarea" 
              rows="3" 
              placeholder="¿Qué estructura o concepto deseas recordar? (Puedes usar fórmulas como $E=mc^2$)"
              required
            >${editCard?.front || ''}</textarea>

            <div id="front-img-preview" class="image-attach-preview ${editCard?.frontImage ? '' : 'hidden'}">
              <img src="${editCard?.frontImage || ''}" id="front-img-tag" alt="Front attachment" />
              <button type="button" class="btn-remove-img" id="btn-remove-front-img">×</button>
            </div>
            <div id="latex-preview-front" class="latex-live-preview hidden"></div>
          </div>

          <!-- REVERSO -->
          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label class="form-label" style="margin-bottom:0;">Reverso (Respuesta)</label>
              <label class="btn-apple-mini" style="cursor:pointer;">
                📷 Adjuntar Foto
                <input type="file" id="card-back-file" accept="image/*" style="display:none;" />
              </label>
            </div>
            <textarea 
              id="card-back-input" 
              class="form-textarea" 
              rows="3" 
              placeholder="Respuesta explicativa o desarrollo"
              required
            >${editCard?.back || ''}</textarea>

            <div id="back-img-preview" class="image-attach-preview ${editCard?.backImage ? '' : 'hidden'}">
              <img src="${editCard?.backImage || ''}" id="back-img-tag" alt="Back attachment" />
              <button type="button" class="btn-remove-img" id="btn-remove-back-img">×</button>
            </div>
            <div id="latex-preview-back" class="latex-live-preview hidden"></div>
          </div>

          <!-- AUDIO SECTION -->
          <div id="section-audio" class="${currentType === 'tts_audio' ? '' : 'hidden'}">
            <div class="form-group">
              <label class="form-label">Texto a Reproducir por Voz (TTS)</label>
              <div style="display:flex; gap:8px;">
                <input 
                  type="text" 
                  id="card-audio-text" 
                  class="form-input" 
                  value="${editCard?.audioText || editCard?.front || ''}" 
                  placeholder="Pronunciación o frase a dictar..."
                />
                <button type="button" class="btn-apple-mini" id="btn-test-tts-play" style="white-space:nowrap;">
                  ▶ Escuchar
                </button>
              </div>
            </div>
          </div>

          ${
            editCard
              ? `
            <div style="margin-top:20px;">
              <button type="button" class="btn-apple-mini" id="btn-delete-card" style="width:100%; color:var(--ios-red); padding:10px;">
                Eliminar Tarjeta
              </button>
            </div>
          `
              : ''
          }

        </form>
      </div>
    </div>
  `;
}

export function bindCardEditorModalEvents(
  editCard: Flashcard | undefined,
  onSave: () => void,
  onClose: () => void
): void {
  const modal = document.getElementById('modal-card-editor');
  if (!modal) return;

  let occlusionEditor: ImageOcclusionEditor | null = null;
  let activeCardType: CardType = editCard?.type || 'standard';
  let frontImageData: string | undefined = editCard?.frontImage;
  let backImageData: string | undefined = editCard?.backImage;

  const frontInput = document.getElementById('card-front-input') as HTMLTextAreaElement | null;
  const backInput = document.getElementById('card-back-input') as HTMLTextAreaElement | null;
  const latexPreviewFront = document.getElementById('latex-preview-front');
  const latexPreviewBack = document.getElementById('latex-preview-back');
  const audioSection = document.getElementById('section-audio');
  const occlusionSection = document.getElementById('section-occlusion');

  const updateSegmentView = (type: CardType) => {
    activeCardType = type;

    // Segment buttons active state
    modal.querySelectorAll('.segment-btn').forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.type === (type === 'latex' ? 'standard' : type));
    });

    if (type === 'image_occlusion') {
      occlusionSection?.classList.remove('hidden');
      if (!occlusionEditor) {
        occlusionEditor = new ImageOcclusionEditor({
          containerId: 'occlusion-canvas-mount',
          initialImage: editCard?.occlusionImage,
          initialMasks: editCard?.occlusionMasks
        });
      }
    } else {
      occlusionSection?.classList.add('hidden');
    }

    if (type === 'tts_audio') {
      audioSection?.classList.remove('hidden');
    } else {
      audioSection?.classList.add('hidden');
    }
  };

  const updateLatexPreviews = () => {
    const frontVal = frontInput?.value || '';
    const backVal = backInput?.value || '';

    if (frontVal.includes('$') && latexPreviewFront) {
      latexPreviewFront.classList.remove('hidden');
      latexPreviewFront.innerHTML = katexService.parseAndRender(frontVal);
    } else {
      latexPreviewFront?.classList.add('hidden');
    }

    if (backVal.includes('$') && latexPreviewBack) {
      latexPreviewBack.classList.remove('hidden');
      latexPreviewBack.innerHTML = katexService.parseAndRender(backVal);
    } else {
      latexPreviewBack?.classList.add('hidden');
    }
  };

  // Segment clicked
  modal.querySelectorAll('.segment-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = (btn as HTMLElement).dataset.type as CardType;
      if (type) updateSegmentView(type);
    });
  });

  frontInput?.addEventListener('input', updateLatexPreviews);
  backInput?.addEventListener('input', updateLatexPreviews);

  // Front image attachment
  const frontFileInput = document.getElementById('card-front-file') as HTMLInputElement | null;
  const frontImgTag = document.getElementById('front-img-tag') as HTMLImageElement | null;
  const frontImgPreview = document.getElementById('front-img-preview');
  frontFileInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        if (re.target?.result) {
          frontImageData = re.target.result as string;
          if (frontImgTag) frontImgTag.src = frontImageData;
          frontImgPreview?.classList.remove('hidden');
        }
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('btn-remove-front-img')?.addEventListener('click', () => {
    frontImageData = undefined;
    frontImgPreview?.classList.add('hidden');
  });

  // Back image attachment
  const backFileInput = document.getElementById('card-back-file') as HTMLInputElement | null;
  const backImgTag = document.getElementById('back-img-tag') as HTMLImageElement | null;
  const backImgPreview = document.getElementById('back-img-preview');
  backFileInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        if (re.target?.result) {
          backImageData = re.target.result as string;
          if (backImgTag) backImgTag.src = backImageData;
          backImgPreview?.classList.remove('hidden');
        }
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('btn-remove-back-img')?.addEventListener('click', () => {
    backImageData = undefined;
    backImgPreview?.classList.add('hidden');
  });

  // TTS test
  document.getElementById('btn-test-tts-play')?.addEventListener('click', () => {
    const audioTextInput = document.getElementById('card-audio-text') as HTMLInputElement | null;
    const textToSpeak = audioTextInput?.value || frontInput?.value || '';
    ttsService.speak(textToSpeak, 'es-ES');
  });

  // Close
  document.getElementById('btn-cancel-card-modal')?.addEventListener('click', () => {
    modal.remove();
    onClose();
  });

  // Delete card
  document.getElementById('btn-delete-card')?.addEventListener('click', () => {
    if (editCard && confirm('¿Eliminar esta flashcard?')) {
      deckService.deleteCard(editCard.id);
      modal.remove();
      onSave();
    }
  });

  // Save handler
  const handleSave = () => {
    const deckId = (document.getElementById('card-deck-select') as HTMLSelectElement).value;
    const front = frontInput?.value || '';
    const back = backInput?.value || '';
    const audioText = (document.getElementById('card-audio-text') as HTMLInputElement)?.value || front;

    let occlusionImage = editCard?.occlusionImage;
    let occlusionMasks = editCard?.occlusionMasks;
    let activeMaskId = editCard?.activeMaskId;

    if (activeCardType === 'image_occlusion' && occlusionEditor) {
      occlusionImage = occlusionEditor.getImage();
      occlusionMasks = occlusionEditor.getMasks();
      if (occlusionMasks.length > 0 && !activeMaskId) {
        activeMaskId = occlusionMasks[0].id;
      }
    }

    // Auto detect latex if formulas present
    const finalType: CardType = front.includes('$') || back.includes('$') ? 'latex' : activeCardType;

    if (editCard) {
      deckService.updateCard(editCard.id, {
        deckId,
        type: finalType,
        front,
        back,
        frontImage: frontImageData,
        backImage: backImageData,
        audioText,
        occlusionImage,
        occlusionMasks,
        activeMaskId
      });
    } else {
      deckService.createCard({
        deckId,
        type: finalType,
        front,
        back,
        frontImage: frontImageData,
        backImage: backImageData,
        audioText,
        occlusionImage,
        occlusionMasks,
        activeMaskId: occlusionMasks && occlusionMasks.length > 0 ? occlusionMasks[0].id : undefined
      });
    }

    modal.remove();
    onSave();
  };

  document.getElementById('btn-save-card-top')?.addEventListener('click', handleSave);

  // Initial call
  updateSegmentView(activeCardType);
  updateLatexPreviews();
}
