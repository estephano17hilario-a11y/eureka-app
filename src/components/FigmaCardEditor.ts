import type { Deck, Flashcard, OcclusionMask, OcclusionMode } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { ttsService } from '../services/tts.service';
import { katexService } from '../services/katex.service';
import { openImageOcclusionModal } from './ImageOcclusionModal';
import { openFigmaAiBuilderModal } from './FigmaAiBuilderModal';
import { openScientificFormulaAssistant } from './ScientificFormulaAssistant';
import { CLEAN_CANVAS_PLACEHOLDER } from '../services/demo-data';

export interface FigmaCardEditorCallbacks {
  onBack: () => void;
  onSaved: () => void;
}

export function renderFigmaCardEditor(deck: Deck, parentDeck?: Deck, editCard?: Flashcard): string {
  return `
    <div class="ios-fullscreen-view">
      
      <!-- Top Action Navigation Header -->
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
          <button class="cupertino-icon-square" id="btn-toggle-editor-split" style="width:44px; height:44px;" title="Alternar Vista Previa en Vivo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
          </button>

          <button class="cupertino-btn-check-save" id="btn-save-card-check" style="width:auto; padding:0 22px; gap:8px; font-weight:800; font-size:0.95rem; color:#07080a;" title="${editCard ? 'Confirmar cambios' : 'Crear'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#07080a" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${editCard ? 'Confirmar cambios' : 'Crear'}</span>
          </button>
        </div>
      </div>

      <!-- Editor Container -->
      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:18px;">
        
        <!-- ANVERSO -->
        <div class="cupertino-editor-block">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <label class="cupertino-editor-label">Anverso (Pregunta / Concepto)</label>
            <span style="font-size:0.75rem; color:var(--f-text-muted);">Soporta Markdown & KaTeX</span>
          </div>
          
          <div class="cupertino-editor-card-box" id="drop-zone-anverso">
            
            <textarea 
              id="f-anverso-input" 
              class="cupertino-editor-textarea" 
              placeholder="Introduce la pregunta o concepto aquí... Puedes usar formato o fórmulas como $$E=mc^2$$"
            >${editCard?.front || ''}</textarea>

            <!-- Image Attachment Thumbnail Inside the Card -->
            <div id="f-anverso-img-preview" class="cupertino-thumbnail-box ${editCard?.frontImage || editCard?.occlusionImage ? '' : 'hidden'}">
              <img src="${editCard?.frontImage || editCard?.occlusionImage || ''}" id="f-anverso-img-tag" alt="Anverso preview" class="cupertino-thumb-img" />
              <button type="button" class="cupertino-thumb-del-badge" id="btn-del-anverso-img" title="Eliminar imagen">×</button>
              <div class="cupertino-thumb-overlay" id="btn-manage-anverso-img" title="Opciones de imagen">
                ${editCard?.type === 'image_occlusion' ? '🔲 Oclusión' : '🔍 Ver'}
              </div>
            </div>

            <!-- Live Preview KaTeX & Markdown Anverso -->
            <div id="f-anverso-live-preview" class="cupertino-live-preview-box ${editCard?.front ? '' : 'hidden'}">
              <div style="font-size:0.72rem; font-weight:800; color:var(--f-blue); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">👁️ Vista Previa en Vivo:</div>
              <div id="f-anverso-preview-body">${katexService.parseAndRender(editCard?.front || '')}</div>
            </div>

            <!-- Toolbar Anverso -->
            <div class="cupertino-rich-toolbar-dock" id="toolbar-dock-anverso">
              <button type="button" class="cupertino-btn-ai-pill" id="btn-ai-anverso">
                <span>✨ AI Builder</span>
              </button>

              <button type="button" class="cupertino-tool-icon" id="tool-img-anverso" title="Adjuntar Imagen">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
              <input type="file" id="f-file-anverso" accept="image/*" style="display:none;" />

              <button type="button" class="cupertino-tool-icon" id="tool-occlusion-btn" title="Oclusión de Imagen (Tapar partes de diagramas)" style="color:var(--f-blue);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 3"/><rect x="8" y="8" width="8" height="8" rx="1"/></svg>
              </button>

              <button type="button" class="cupertino-tool-icon" id="tool-audio-anverso" title="Escuchar pronunciación TTS">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              </button>

              <span class="cupertino-tool-divider"></span>

              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt="**" title="Negrita (**texto**)"><strong>B</strong></button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt="*" title="Cursiva (*texto*)"><em>I</em></button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt="__" title="Subrayado (__texto__)"><u>U</u></button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt="~~" title="Tachado (~~texto~~)"><s>S</s></button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt="## " title="Encabezado H3">H</button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt="- " title="Lista con viñetas">≡</button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt="1. " title="Lista numerada">1≡</button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt="$_" data-suffix="$" title="Subíndice ($x_2$)">X₂</button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt="$^" data-suffix="$" title="Superíndice ($x^2$)">X²</button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt="$$" title="Fórmula KaTeX ($$fórmula$$)" style="color:var(--f-blue); font-weight:800;">fx</button>
              <button type="button" class="cupertino-tool-icon" id="btn-open-formula-assistant-anverso" title="Asistente Científico KaTeX / LaTeX" style="color:#38bdf8; font-weight:800;">📐</button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt="\`" title="Código inline">&lt;/&gt;</button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt="[enlace](url)" title="Hipervínculo">🔗</button>
            </div>

          </div>
        </div>

        <!-- REVERSO -->
        <div class="cupertino-editor-block">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <label class="cupertino-editor-label">Reverso (Respuesta / Explicación)</label>
            <span style="font-size:0.75rem; color:var(--f-text-muted);">Soporta Markdown & KaTeX</span>
          </div>
          
          <div class="cupertino-editor-card-box" id="drop-zone-reverso">
            
            <textarea 
              id="f-reverso-input" 
              class="cupertino-editor-textarea" 
              placeholder="Introduce la respuesta detallada o desarrollo aquí..."
            >${editCard?.back || ''}</textarea>

            <!-- Image Attachment Thumbnail Inside the Card -->
            <div id="f-reverso-img-preview" class="cupertino-thumbnail-box ${editCard?.backImage ? '' : 'hidden'}">
              <img src="${editCard?.backImage || ''}" id="f-reverso-img-tag" alt="Reverso preview" class="cupertino-thumb-img" />
              <button type="button" class="cupertino-thumb-del-badge" id="btn-del-reverso-img" title="Eliminar imagen">×</button>
              <div class="cupertino-thumb-overlay" id="btn-manage-reverso-img" title="Ver imagen">
                🔍 Ver
              </div>
            </div>

            <!-- Live Preview KaTeX & Markdown Reverso -->
            <div id="f-reverso-live-preview" class="cupertino-live-preview-box ${editCard?.back ? '' : 'hidden'}">
              <div style="font-size:0.72rem; font-weight:800; color:var(--f-blue); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">👁️ Vista Previa en Vivo:</div>
              <div id="f-reverso-preview-body">${katexService.parseAndRender(editCard?.back || '')}</div>
            </div>

            <!-- Toolbar Reverso -->
            <div class="cupertino-rich-toolbar-dock" id="toolbar-dock-reverso">
              <button type="button" class="cupertino-btn-ai-pill" id="btn-ai-reverso">
                <span>✨ AI Builder</span>
              </button>

              <button type="button" class="cupertino-tool-icon" id="tool-img-reverso" title="Adjuntar Imagen">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
              <input type="file" id="f-file-reverso" accept="image/*" style="display:none;" />

              <button type="button" class="cupertino-tool-icon" id="tool-audio-reverso" title="Escuchar pronunciación TTS">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              </button>

              <span class="cupertino-tool-divider"></span>

              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt-r="**" title="Negrita (**texto**)"><strong>B</strong></button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt-r="*" title="Cursiva (*texto*)"><em>I</em></button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt-r="__" title="Subrayado (__texto__)"><u>U</u></button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt-r="~~" title="Tachado (~~texto~~)"><s>S</s></button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt-r="## " title="Encabezado H3">H</button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt-r="- " title="Lista con viñetas">≡</button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt-r="1. " title="Lista numerada">1≡</button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt-r="$_" data-suffix-r="$" title="Subíndice ($x_2$)">X₂</button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt-r="$^" data-suffix-r="$" title="Superíndice ($x^2$)">X²</button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt-r="$$" title="Fórmula KaTeX ($$fórmula$$)" style="color:var(--f-blue); font-weight:800;">fx</button>
              <button type="button" class="cupertino-tool-icon" id="btn-open-formula-assistant-reverso" title="Asistente Científico KaTeX / LaTeX" style="color:#38bdf8; font-weight:800;">📐</button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt-r="\`" title="Código inline">&lt;/&gt;</button>
              <button type="button" class="cupertino-tool-icon tool-fmt-btn" data-fmt-r="[enlace](url)" title="Hipervínculo">🔗</button>
            </div>

          </div>
        </div>

        <!-- Toggle Tarjetas Invertidas -->
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
  const anversoPreviewBox = container.querySelector('#f-anverso-live-preview') as HTMLElement | null;
  const anversoPreviewBody = container.querySelector('#f-anverso-preview-body') as HTMLElement | null;
  const reversoPreviewBox = container.querySelector('#f-reverso-live-preview') as HTMLElement | null;
  const reversoPreviewBody = container.querySelector('#f-reverso-preview-body') as HTMLElement | null;
  const invertedToggle = container.querySelector('#toggle-inverted-cards') as HTMLInputElement | null;

  let frontImage: string | undefined = editCard?.frontImage;
  let backImage: string | undefined = editCard?.backImage;
  let occlusionImage: string | undefined = editCard?.occlusionImage;
  let occlusionMasks: OcclusionMask[] = editCard?.occlusionMasks || [];
  let currentOcclusionMode: OcclusionMode = editCard?.occlusionMode || 'hide_one_reveal_one';

  const updateLivePreviews = () => {
    const frontText = anversoInput?.value || '';
    if (frontText.trim()) {
      if (anversoPreviewBox) anversoPreviewBox.classList.remove('hidden');
      if (anversoPreviewBody) anversoPreviewBody.innerHTML = katexService.parseAndRender(frontText);
    } else {
      if (anversoPreviewBox) anversoPreviewBox.classList.add('hidden');
    }

    const backText = reversoInput?.value || '';
    if (backText.trim()) {
      if (reversoPreviewBox) reversoPreviewBox.classList.remove('hidden');
      if (reversoPreviewBody) reversoPreviewBody.innerHTML = katexService.parseAndRender(backText);
    } else {
      if (reversoPreviewBox) reversoPreviewBox.classList.add('hidden');
    }
  };

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

    const invertedWrap = container.querySelector('#wrapper-inverted-toggle') as HTMLElement | null;
    if (invertedWrap) {
      if (occlusionMasks.length > 0 || occlusionImage) {
        invertedWrap.style.display = 'none';
        if (invertedToggle) invertedToggle.checked = false;
      } else {
        invertedWrap.style.display = 'block';
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
      initialImage: frontImage || occlusionImage || CLEAN_CANVAS_PLACEHOLDER,
      initialMasks: occlusionMasks,
      initialMode: currentOcclusionMode,
      onConfirm: (img, masks, mode) => {
        occlusionImage = img;
        frontImage = img;
        occlusionMasks = masks;
        currentOcclusionMode = mode;
        updateThumbnailBoxes();
        const invertedWrap = container.querySelector('#wrapper-inverted-toggle') as HTMLElement | null;
        if (invertedWrap) {
          if (occlusionMasks.length > 0 || occlusionImage) {
            invertedWrap.style.display = 'none';
            if (invertedToggle) invertedToggle.checked = false;
          } else {
            invertedWrap.style.display = 'block';
          }
        }
      },
      onClose: () => {}
    });
  };

  container.querySelector('#btn-manage-anverso-img')?.addEventListener('click', openOcclusionTool);
  container.querySelector('#tool-occlusion-btn')?.addEventListener('click', openOcclusionTool);

  // --- CONTROLADOR DE FORMATO DE TEXTO INTELIGENTE (SOLICITUD #3) ---
  const setupSmartToolbar = (
    textarea: HTMLTextAreaElement | null,
    btnSelector: string,
    dataAttr: string,
    suffixAttr?: string
  ) => {
    if (!textarea) return;

    const buttons = container.querySelectorAll<HTMLButtonElement>(btnSelector);

    const updateActiveButtonStates = () => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      buttons.forEach((btn) => {
        const prefix = btn.getAttribute(dataAttr) || '';
        const suffix = (suffixAttr ? btn.getAttribute(suffixAttr) : '') || prefix;

        if (prefix === '[enlace](url)' || prefix === '## ' || prefix === '- ' || prefix === '1. ') {
          btn.classList.remove('active-format-tool');
          return;
        }

        // Si el cursor o la selección está dentro de delimitadores
        const before = val.substring(Math.max(0, start - prefix.length), start);
        const after = val.substring(end, end + suffix.length);
        const isInside = before === prefix && after === suffix;

        btn.classList.toggle('active-format-tool', isInside);
      });
    };

    const applySmartFormat = (prefix: string, suffix: string, btn: HTMLButtonElement) => {
      textarea.focus();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const selected = val.substring(start, end);

      // CASO A: Hay texto seleccionado
      if (selected.length > 0) {
        if (prefix === '## ' || prefix === '- ' || prefix === '1. ') {
          // Prefijos de línea
          const lines = selected.split('\n');
          const formatted = lines.map((l) => (l.startsWith(prefix) ? l.substring(prefix.length) : prefix + l)).join('\n');
          textarea.value = val.substring(0, start) + formatted + val.substring(end);
          textarea.setSelectionRange(start, start + formatted.length);
        } else if (prefix === '[enlace](url)') {
          const wrap = `[${selected}](https://)`;
          textarea.value = val.substring(0, start) + wrap + val.substring(end);
          const urlPos = start + selected.length + 3;
          textarea.setSelectionRange(urlPos, urlPos + 8);
        } else {
          // Formatos normales: Negrita, Cursiva, KaTeX, Subrayado, etc.
          const isWrappedInside =
            start >= prefix.length &&
            val.substring(start - prefix.length, start) === prefix &&
            val.substring(end, end + suffix.length) === suffix;

          const isSelfWrapped =
            selected.startsWith(prefix) &&
            selected.endsWith(suffix) &&
            selected.length >= prefix.length + suffix.length;

          if (isSelfWrapped) {
            // Desenvolver selección completa
            const unwrapped = selected.substring(prefix.length, selected.length - suffix.length);
            textarea.value = val.substring(0, start) + unwrapped + val.substring(end);
            textarea.setSelectionRange(start, start + unwrapped.length);
            btn.classList.remove('active-format-tool');
          } else if (isWrappedInside) {
            // Desenvolver exterior
            textarea.value = val.substring(0, start - prefix.length) + selected + val.substring(end + suffix.length);
            textarea.setSelectionRange(start - prefix.length, end - prefix.length);
            btn.classList.remove('active-format-tool');
          } else {
            // Envolver texto seleccionado
            const wrap = prefix + selected + suffix;
            textarea.value = val.substring(0, start) + wrap + val.substring(end);
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
            btn.classList.add('active-format-tool');
          }
        }
      } else {
        // CASO B: NO hay texto seleccionado (el usuario activa o desactiva formato para escribir)
        if (prefix === '## ' || prefix === '- ' || prefix === '1. ') {
          textarea.value = val.substring(0, start) + prefix + val.substring(start);
          textarea.setSelectionRange(start + prefix.length, start + prefix.length);
        } else if (prefix === '[enlace](url)') {
          const insertStr = '[enlace](https://)';
          textarea.value = val.substring(0, start) + insertStr + val.substring(start);
          textarea.setSelectionRange(start + 1, start + 7);
        } else {
          const before = val.substring(Math.max(0, start - prefix.length), start);
          const after = val.substring(start, start + suffix.length);

          if (before === prefix && after === suffix) {
            // El usuario pulsa el botón de nuevo para cancelar -> borra el par vacío
            textarea.value = val.substring(0, start - prefix.length) + val.substring(start + suffix.length);
            textarea.setSelectionRange(start - prefix.length, start - prefix.length);
            btn.classList.remove('active-format-tool');
          } else if (after === suffix) {
            // El usuario estaba escribiendo dentro y pulsa para saltar fuera del formato
            textarea.setSelectionRange(start + suffix.length, start + suffix.length);
            btn.classList.remove('active-format-tool');
          } else {
            // Activar modo de formato: insertar delimitadores y posicionar cursor en el medio
            const insertStr = prefix + suffix;
            textarea.value = val.substring(0, start) + insertStr + val.substring(start);
            textarea.setSelectionRange(start + prefix.length, start + prefix.length);
            btn.classList.add('active-format-tool');
          }
        }
      }

      updateLivePreviews();
    };

    buttons.forEach((btn) => {
      // Evitar que el textarea pierda el foco o la selección en dispositivos móviles y de escritorio
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const prefix = btn.getAttribute(dataAttr);
        const suffix = (suffixAttr ? btn.getAttribute(suffixAttr) : '') || prefix;
        if (prefix) applySmartFormat(prefix, suffix || prefix, btn);
      });
    });

    textarea.addEventListener('input', updateLivePreviews);
    textarea.addEventListener('keyup', updateActiveButtonStates);
    textarea.addEventListener('click', updateActiveButtonStates);
    textarea.addEventListener('select', updateActiveButtonStates);
  };

  // Inicializar barras de formato inteligente para Anverso y Reverso
  setupSmartToolbar(anversoInput, '#toolbar-dock-anverso .tool-fmt-btn', 'data-fmt', 'data-suffix');
  setupSmartToolbar(reversoInput, '#toolbar-dock-reverso .tool-fmt-btn', 'data-fmt-r', 'data-suffix-r');

  // Alternar vista dividida / Previews
  container.querySelector('#btn-toggle-editor-split')?.addEventListener('click', () => {
    if (anversoPreviewBox) anversoPreviewBox.classList.toggle('hidden');
    if (reversoPreviewBox) reversoPreviewBox.classList.toggle('hidden');
  });

  // Botones de Asistente Científico KaTeX / LaTeX
  container.querySelector('#btn-open-formula-assistant-anverso')?.addEventListener('click', () => {
    if (!anversoInput) return;
    openScientificFormulaAssistant({
      initialLatex: anversoInput.value,
      onInsert: (formula) => {
        const cur = anversoInput.value;
        const pos = anversoInput.selectionStart ?? cur.length;
        anversoInput.value = `${cur.slice(0, pos)} ${formula} ${cur.slice(pos)}`.trim();
        anversoInput.focus();
        updateLivePreviews();
      }
    });
  });

  container.querySelector('#btn-open-formula-assistant-reverso')?.addEventListener('click', () => {
    if (!reversoInput) return;
    openScientificFormulaAssistant({
      initialLatex: reversoInput.value,
      onInsert: (formula) => {
        const cur = reversoInput.value;
        const pos = reversoInput.selectionStart ?? cur.length;
        reversoInput.value = `${cur.slice(0, pos)} ${formula} ${cur.slice(pos)}`.trim();
        reversoInput.focus();
        updateLivePreviews();
      }
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
        updateLivePreviews();
      },
      onBatchAdded: () => {
        callbacks.onSaved();
      },
      onClose: () => {}
    });
  };

  container.querySelector('#btn-ai-anverso')?.addEventListener('click', openAi);
  container.querySelector('#btn-ai-reverso')?.addEventListener('click', openAi);

  // Audio TTS
  container.querySelector('#tool-audio-anverso')?.addEventListener('click', () => {
    const text = anversoInput?.value || 'Audio de prueba';
    ttsService.speak(text, deck.settings.ttsVoiceLang);
  });

  container.querySelector('#tool-audio-reverso')?.addEventListener('click', () => {
    const text = reversoInput?.value || 'Respuesta de prueba';
    ttsService.speak(text, deck.settings.ttsVoiceLang);
  });

  // Guardar Tarjeta
  const saveCard = () => {
    const front = anversoInput?.value.trim() || 'Pregunta';
    const back = reversoInput?.value.trim() || 'Respuesta';
    const isOcclusion = occlusionMasks.length > 0;
    const isLatex = front.includes('$') || back.includes('$');
    const createInverted = !isOcclusion && (invertedToggle?.checked || false);

    const cardType = isOcclusion ? 'image_occlusion' : isLatex ? 'latex' : 'standard';

    if (editCard) {
      if (isOcclusion) {
        deckService.syncOcclusionCards(
          deck.id,
          editCard,
          occlusionImage || frontImage || '',
          occlusionMasks,
          currentOcclusionMode,
          front
        );
      } else {
        deckService.updateCard(editCard.id, {
          deckId: deck.id,
          type: cardType,
          front,
          back,
          frontImage,
          backImage,
          occlusionImage: undefined,
          occlusionMasks: undefined,
          activeMaskId: undefined,
          occlusionMode: currentOcclusionMode
        });
      }
      callbacks.onSaved();
    } else {
      if (isOcclusion) {
        deckService.createOcclusionCards(
          deck.id,
          occlusionImage || frontImage || CLEAN_CANVAS_PLACEHOLDER,
          occlusionMasks,
          currentOcclusionMode
        );
      } else {
        deckService.createCard(
          {
            deckId: deck.id,
            type: cardType,
            front,
            back,
            frontImage,
            backImage,
            occlusionImage: undefined,
            occlusionMasks: undefined,
            activeMaskId: undefined,
            occlusionMode: currentOcclusionMode
          },
          createInverted
        );
      }

      // Limpiar campos para la siguiente tarjeta
      if (anversoInput) anversoInput.value = '';
      if (reversoInput) reversoInput.value = '';
      frontImage = undefined;
      backImage = undefined;
      occlusionImage = undefined;
      occlusionMasks = [];
      updateThumbnailBoxes();
      updateLivePreviews();
      anversoInput?.focus();

      // Banner flotante de éxito
      const feedbackToast = document.createElement('div');
      feedbackToast.className = 'figma-toast-banner';
      feedbackToast.style.position = 'fixed';
      feedbackToast.style.top = '24px';
      feedbackToast.style.left = '50%';
      feedbackToast.style.transform = 'translateX(-50%)';
      feedbackToast.style.background = 'rgba(16, 185, 129, 0.95)';
      feedbackToast.style.color = '#ffffff';
      feedbackToast.style.padding = '12px 24px';
      feedbackToast.style.borderRadius = '14px';
      feedbackToast.style.fontWeight = '800';
      feedbackToast.style.fontSize = '0.95rem';
      feedbackToast.style.zIndex = '999999';
      feedbackToast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.4)';
      feedbackToast.innerHTML = `✓ ¡Tarjeta agregada! Escribe la siguiente o pulsa ‹ Volver al terminar.`;
      document.body.appendChild(feedbackToast);
      setTimeout(() => feedbackToast.remove(), 2500);
    }
  };

  container.querySelector('#btn-save-card-check')?.addEventListener('click', saveCard);
}
