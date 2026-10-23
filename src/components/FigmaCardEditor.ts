import '../ui/styles/cards.css';
import type { Deck, Flashcard, OcclusionMask, OcclusionMode } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { ttsService } from '../services/tts.service';
import { katexService } from '../services/katex.service';
import { compressImageFile } from '../services/image-library.service';
import { lsGet, lsSet, lsRemove } from '../services/storage.service';
import { openImageOcclusionModal } from './ImageOcclusionModal';
import { openFigmaAiBuilderModal } from './FigmaAiBuilderModal';
import { openScientificFormulaAssistant } from './ScientificFormulaAssistant';
import { openImageLibrary, queryFromCardText } from './ImageLibrarySheet';
import { CLEAN_CANVAS_PLACEHOLDER } from '../services/demo-data';

export interface FigmaCardEditorCallbacks {
  onBack: () => void;
  onSaved: () => void;
}

type Mode = 'basic' | 'cloze' | 'occlusion';
type Side = 'front' | 'back';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const INVERT_PREF_KEY = 'eureka_card_invert_pref';
const draftKey = (deckId: string): string => `eureka_card_draft_v1_${deckId}`;

/** Atajos y listener global del editor activo (se desmonta solo cuando la vista desaparece) */
let detachGlobalKeys: (() => void) | null = null;

function modeOfCard(card?: Flashcard): Mode {
  if (card?.type === 'cloze') return 'cloze';
  if (card?.type === 'image_occlusion') return 'occlusion';
  return 'basic';
}

/** Guarda `{{c::x}}` como `{{c1::x}}` para editarlo con el mismo formato que se escribe */
function clozeForEditing(text: string): string {
  return text.replace(/\{\{c::/g, '{{c1::');
}

function toolbarHtml(side: Side): string {
  const btn = (fmt: string, label: string, title: string, extra = '', suffix = '') =>
    `<button type="button" tabindex="-1" class="ce-tool tool-fmt-btn" data-fmt="${esc(fmt)}" ${suffix ? `data-suffix="${suffix}"` : ''} title="${title}" ${extra}>${label}</button>`;
  return `
    <div class="ce-toolbar" data-side="${side}">
      <button type="button" tabindex="-1" class="ce-tool ce-tool-img" data-act="img-menu" data-side="${side}" title="Añadir imagen (Ctrl+I)">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <span>Imagen</span>
      </button>
      <button type="button" tabindex="-1" class="ce-tool" data-act="audio" data-side="${side}" title="Escuchar">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
      </button>
      <span class="ce-sep"></span>
      ${btn('**', '<b>B</b>', 'Negrita (Ctrl+B)')}
      ${btn('*', '<i>I</i>', 'Cursiva')}
      ${btn('__', '<u>U</u>', 'Subrayado')}
      ${btn('~~', '<s>S</s>', 'Tachado')}
      ${btn('- ', '≡', 'Lista con viñetas')}
      ${btn('1. ', '1≡', 'Lista numerada')}
      ${btn('$_', 'X₂', 'Subíndice', '', '$')}
      ${btn('$^', 'X²', 'Superíndice', '', '$')}
      ${btn('$$', 'fx', 'Fórmula KaTeX', 'style="color:var(--f-blue);font-weight:800"')}
      <button type="button" tabindex="-1" class="ce-tool" data-act="formula" data-side="${side}" title="Asistente de fórmulas" style="color:#38bdf8">📐</button>
      ${btn('`', '&lt;/&gt;', 'Código')}
      ${btn('[enlace](url)', '🔗', 'Enlace')}
      ${side === 'front' ? '<button type="button" tabindex="-1" class="ce-tool ce-tool-cloze" data-act="cloze" title="Ocultar el texto seleccionado (Ctrl+Shift+C)">[…] Ocultar</button>' : ''}
    </div>`;
}

function imageSlotHtml(side: Side, src: string | undefined): string {
  return `
    <div class="ce-img ${src ? '' : 'hidden'}" data-side="${side}">
      <img src="${esc(src || '')}" alt="Imagen del ${side === 'front' ? 'anverso' : 'reverso'}" />
      <div class="ce-img-meta">
        <b>Imagen adjunta</b>
        <small class="ce-img-credit"></small>
      </div>
      <button type="button" class="ce-img-btn" data-act="img-lib" data-side="${side}">Cambiar</button>
      <button type="button" class="ce-img-btn danger" data-act="img-del" data-side="${side}" aria-label="Quitar imagen">✕</button>
    </div>`;
}

export function renderFigmaCardEditor(deck: Deck, parentDeck?: Deck, editCard?: Flashcard, chunkId?: string): string {
  const mode = modeOfCard(editCard);
  const frontText = mode === 'cloze' ? clozeForEditing(editCard?.front || '') : editCard?.front || '';
  const frontImg = editCard?.frontImage || editCard?.occlusionImage;
  let invertPref = false;
  try {
    invertPref = lsGet(INVERT_PREF_KEY) === '1';
  } catch {
    /* ignore */
  }

  return `
    <div class="ios-fullscreen-view ce-root" data-mode="${mode}" data-editing="${editCard ? '1' : '0'}">
      <header class="ce-top">
        <button class="ce-back" id="btn-card-edit-back" title="Volver (Esc)" aria-label="Volver">‹</button>
        <div class="ce-crumbs">
          <span class="ce-crumb-deck" id="crumb-e-deck" title="${esc(deck.name)}">
            <span class="ce-crumb-ic">🗂️</span>
            <span class="ce-crumb-name">${parentDeck ? esc(parentDeck.name) + ' › ' : ''}${esc(deck.name)}</span>
          </span>
          <span class="ce-crumb-sub">${editCard ? 'Editando tarjeta' : 'Nueva tarjeta'}${chunkId ? ' · 🔬 vinculada al estudio activo' : ''}</span>
        </div>
        <span class="ce-counter hidden" id="ce-counter" title="Tarjetas creadas en esta sesión">✓ <b>0</b></span>
        <button class="ce-save" id="btn-save-card-check" title="${editCard ? 'Guardar cambios' : 'Crear y seguir (Ctrl+Enter)'}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2"><polyline points="20 6 9 17 4 12"/></svg>
          <span>${editCard ? 'Guardar' : 'Crear'}</span>
          ${editCard ? '' : '<kbd>Ctrl ↵</kbd>'}
        </button>
      </header>

      ${
        editCard
          ? ''
          : `<div class="ce-modes" role="tablist" aria-label="Tipo de tarjeta">
        <button class="ce-mode ${mode === 'basic' ? 'on' : ''}" data-mode="basic" role="tab"><span>🗒️</span> Básica</button>
        <button class="ce-mode ${mode === 'cloze' ? 'on' : ''}" data-mode="cloze" role="tab"><span>🕳️</span> Huecos</button>
        <button class="ce-mode ${mode === 'occlusion' ? 'on' : ''}" data-mode="occlusion" role="tab"><span>🔲</span> Oclusión</button>
      </div>`
      }

      <div class="ce-draft hidden" id="ce-draft">
        <span>📝 Recuperamos tu borrador sin guardar.</span>
        <button type="button" id="ce-draft-discard">Descartar</button>
      </div>

      <div class="ce-layout">
        <div class="ce-col">
          <section class="ce-block" id="ce-block-front">
            <div class="ce-label-row">
              <label class="ce-label" for="f-anverso-input" id="ce-label-front">Anverso · Pregunta</label>
              <span class="ce-hint" id="ce-hint-front">Markdown y KaTeX</span>
            </div>
            <div class="ce-box" id="drop-zone-anverso">
              <textarea id="f-anverso-input" class="ce-textarea" rows="2" spellcheck="true"
                placeholder="Escribe la pregunta o el concepto… Usa $$E=mc^2$$ para fórmulas">${esc(frontText)}</textarea>
              ${imageSlotHtml('front', frontImg)}
              ${toolbarHtml('front')}
            </div>
            <div class="ce-dup hidden" id="ce-dup">⚠️ Ya tienes una tarjeta con este anverso en el mazo.</div>
          </section>

          <section class="ce-block" id="ce-block-back">
            <div class="ce-label-row">
              <label class="ce-label" for="f-reverso-input" id="ce-label-back">Reverso · Respuesta</label>
              <span class="ce-hint">Tab para saltar aquí</span>
            </div>
            <div class="ce-box" id="drop-zone-reverso">
              <textarea id="f-reverso-input" class="ce-textarea" rows="2" spellcheck="true"
                placeholder="Escribe la respuesta o la explicación…">${esc(editCard?.back || '')}</textarea>
              ${imageSlotHtml('back', editCard?.backImage)}
              ${toolbarHtml('back')}
            </div>
          </section>

          <section class="ce-block ce-occ" id="ce-block-occ">
            <button type="button" class="ce-occ-btn" id="tool-occlusion-btn">
              <span>🔲</span>
              <div><b>Abrir editor de oclusión</b><small>Tapa partes de un diagrama; cada zona será una tarjeta.</small></div>
            </button>
          </section>

          <section class="ce-options" id="ce-options">
            <label class="ce-switch-row">
              <span class="ce-switch-text"><b>Tarjeta invertida</b><small>También se estudia de Reverso → Anverso</small></span>
              <span class="figma-switch"><input type="checkbox" id="toggle-inverted-cards" ${editCard?.isInverted || (!editCard && invertPref) ? 'checked' : ''} /><span class="figma-slider"></span></span>
            </label>
            <button type="button" class="ce-ai" id="btn-ai-anverso">✨ Generar con IA</button>
          </section>
        </div>

        <aside class="ce-preview" id="ce-preview-wrap">
          <div class="ce-preview-head">
            <span>Vista previa</span>
            <div class="ce-pv-tabs">
              <button type="button" class="on" data-pv="front">Anverso</button>
              <button type="button" data-pv="back">Reverso</button>
            </div>
          </div>
          <div class="ce-flip" id="ce-flip" title="Toca para voltear">
            <div class="ce-face ce-face-front"><div class="ce-face-body" id="ce-pv-front"></div></div>
            <div class="ce-face ce-face-back"><div class="ce-face-body" id="ce-pv-back"></div></div>
          </div>
          <p class="ce-shortcuts">
            <kbd>Ctrl</kbd>+<kbd>↵</kbd> crear y seguir · <kbd>Ctrl</kbd>+<kbd>⇧</kbd>+<kbd>↵</kbd> crear y salir · <kbd>Ctrl</kbd>+<kbd>I</kbd> imagen
          </p>
        </aside>
      </div>

      <div class="ce-bottom" id="ce-bottom">
        <button type="button" class="ce-bottom-secondary" id="ce-finish">${editCard ? 'Cancelar' : 'Terminar'}</button>
        <button type="button" class="ce-bottom-primary" id="ce-save-bottom">${editCard ? 'Guardar cambios' : 'Crear y seguir'}</button>
      </div>
      <input type="file" id="ce-file" accept="image/*" hidden />
    </div>
  `;
}

export function bindFigmaCardEditorEvents(
  container: HTMLElement,
  deck: Deck,
  editCard: Flashcard | undefined,
  callbacks: FigmaCardEditorCallbacks,
  chunkId?: string
): void {
  const root = container.querySelector('.ce-root') as HTMLElement | null;
  if (!root) return;
  detachGlobalKeys?.();

  const q = <T extends HTMLElement>(sel: string) => root.querySelector(sel) as T | null;
  const frontEl = q<HTMLTextAreaElement>('#f-anverso-input');
  const backEl = q<HTMLTextAreaElement>('#f-reverso-input');
  const invertedToggle = q<HTMLInputElement>('#toggle-inverted-cards');
  const flipEl = q<HTMLElement>('#ce-flip');
  const pvFront = q<HTMLElement>('#ce-pv-front');
  const pvBack = q<HTMLElement>('#ce-pv-back');
  const dupEl = q<HTMLElement>('#ce-dup');
  const counterEl = q<HTMLElement>('#ce-counter');
  const fileInput = q<HTMLInputElement>('#ce-file');
  if (!frontEl || !backEl) return;

  let mode: Mode = modeOfCard(editCard);
  let frontImage: string | undefined = editCard?.frontImage;
  let backImage: string | undefined = editCard?.backImage;
  let occlusionImage: string | undefined = editCard?.occlusionImage;
  let occlusionMasks: OcclusionMask[] = editCard?.occlusionMasks || [];
  let occlusionMode: OcclusionMode = editCard?.occlusionMode || 'hide_one_reveal_one';
  const credits: Record<Side, string> = { front: '', back: '' };
  if (editCard?.imageCredit) credits.front = editCard.imageCredit;
  let createdCount = 0;
  let lastCreatedIds: string[] = [];
  let pendingImageSide: Side = 'front';

  /* ------------------------------------------------------------------ */
  /*  Utilidades                                                         */
  /* ------------------------------------------------------------------ */
  const toast = (msg: string, action?: { label: string; run: () => void }) => {
    document.getElementById('ce-toast')?.remove();
    const el = document.createElement('div');
    el.id = 'ce-toast';
    el.className = 'ce-toast';
    el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action.label)}</button>` : ''}`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    const t = window.setTimeout(() => {
      el.classList.remove('show');
      window.setTimeout(() => el.remove(), 220);
    }, action ? 5200 : 2200);
    el.querySelector('button')?.addEventListener('click', () => {
      window.clearTimeout(t);
      el.remove();
      action?.run();
    });
  };

  const autoGrow = (ta: HTMLTextAreaElement) => {
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight + 2, 420)}px`;
  };

  const shake = (el: HTMLElement | null) => {
    if (!el) return;
    el.classList.remove('ce-shake');
    void el.offsetWidth;
    el.classList.add('ce-shake');
    el.focus?.();
  };

  const currentImage = (side: Side): string | undefined => (side === 'front' ? frontImage || (mode === 'occlusion' ? occlusionImage : undefined) : backImage);

  /* ------------------------------------------------------------------ */
  /*  Vista previa viva (con volteo)                                     */
  /* ------------------------------------------------------------------ */
  let pvTimer = 0;
  const previewHtml = (text: string, img: string | undefined, kind: 'front' | 'back'): string => {
    const imgHtml = img ? `<img class="ce-pv-img" src="${esc(img)}" alt="" />` : '';
    if (mode === 'cloze') {
      const first = /\{\{c(\d+)::/.exec(text);
      const k = first ? Number(first[1]) : 1;
      // Solo el primer hueco se oculta en la vista previa; los demás se muestran como texto
      const only = text.replace(/\{\{c(\d+)::([\s\S]*?)(?:::([\s\S]*?))?\}\}/g, (_m, n: string, a: string, h?: string) => (Number(n) === k ? `{{c::${a}${h ? '::' + h : ''}}}` : a));
      const body = katexService.renderCloze(only, kind === 'back');
      const extra = kind === 'back' && backEl.value.trim() ? `<div class="ce-pv-extra">${katexService.parseAndRender(backEl.value)}</div>` : '';
      return `${imgHtml}<div class="ce-pv-text">${body || '<span class="ce-pv-empty">Escribe el texto y oculta una palabra…</span>'}</div>${extra}`;
    }
    const body = text.trim() ? katexService.parseAndRender(text) : `<span class="ce-pv-empty">${kind === 'front' ? 'La pregunta aparecerá aquí' : 'La respuesta aparecerá aquí'}</span>`;
    return `${imgHtml}<div class="ce-pv-text">${body}</div>`;
  };

  const updatePreview = () => {
    window.clearTimeout(pvTimer);
    pvTimer = window.setTimeout(() => {
      if (!root.isConnected) return;
      if (pvFront) pvFront.innerHTML = previewHtml(frontEl.value, currentImage('front'), 'front');
      if (pvBack) {
        pvBack.innerHTML =
          mode === 'cloze'
            ? previewHtml(frontEl.value, currentImage('front'), 'back')
            : previewHtml(backEl.value, currentImage('back'), 'back');
      }
    }, 120);
  };

  const setFlip = (back: boolean) => {
    flipEl?.classList.toggle('flipped', back);
    root.querySelectorAll<HTMLElement>('.ce-pv-tabs button').forEach((b) => b.classList.toggle('on', (b.dataset.pv === 'back') === back));
  };
  flipEl?.addEventListener('click', () => setFlip(!flipEl.classList.contains('flipped')));
  root.querySelectorAll<HTMLElement>('.ce-pv-tabs button').forEach((b) => b.addEventListener('click', () => setFlip(b.dataset.pv === 'back')));

  /* ------------------------------------------------------------------ */
  /*  Imágenes                                                            */
  /* ------------------------------------------------------------------ */
  const refreshImages = () => {
    (['front', 'back'] as Side[]).forEach((side) => {
      const slot = q<HTMLElement>(`.ce-img[data-side="${side}"]`);
      if (!slot) return;
      const src = currentImage(side);
      slot.classList.toggle('hidden', !src);
      const img = slot.querySelector('img') as HTMLImageElement;
      if (src && img.getAttribute('src') !== src) img.src = src;
      const credit = slot.querySelector('.ce-img-credit') as HTMLElement;
      credit.textContent = credits[side] || '';
      credit.classList.toggle('hidden', !credits[side]);
    });
    updatePreview();
    scheduleDraft();
  };

  const setImage = (side: Side, dataUrl: string | undefined, credit = '') => {
    if (side === 'front') {
      frontImage = dataUrl;
      if (!dataUrl) {
        occlusionImage = undefined;
        occlusionMasks = [];
      }
    } else {
      backImage = dataUrl;
    }
    credits[side] = dataUrl ? credit : '';
    refreshImages();
  };

  const attachFile = async (file: File | Blob, side: Side) => {
    try {
      const dataUrl = await compressImageFile(file);
      setImage(side, dataUrl);
    } catch {
      toast('No se pudo usar esa imagen');
    }
  };

  const openLibrary = (side: Side) => {
    const source = side === 'front' ? frontEl.value : backEl.value || frontEl.value;
    openImageLibrary({
      title: side === 'front' ? 'Imagen para el anverso' : 'Imagen para el reverso',
      initialQuery: queryFromCardText(source),
      onPick: (dataUrl, credit) => setImage(side, dataUrl, credit),
      onClose: () => (side === 'front' ? frontEl : backEl).focus()
    });
  };

  const closeMenus = () => root.querySelectorAll('.ce-menu').forEach((m) => m.remove());

  const openImageMenu = (btn: HTMLElement, side: Side) => {
    closeMenus();
    const menu = document.createElement('div');
    menu.className = 'ce-menu';
    menu.innerHTML = `
      <button type="button" data-m="lib"><span>🔎</span><div><b>Buscar en la biblioteca</b><small>Millones de fotos y diagramas gratis</small></div></button>
      <button type="button" data-m="file"><span>📁</span><div><b>Subir desde el dispositivo</b><small>Galería o cámara</small></div></button>
      <button type="button" data-m="paste"><span>📋</span><div><b>Pegar imagen</b><small>Ctrl+V en el cuadro de texto</small></div></button>`;
    (btn.closest('.ce-box') as HTMLElement).appendChild(menu);
    menu.addEventListener('click', async (e) => {
      const m = (e.target as HTMLElement).closest('[data-m]') as HTMLElement | null;
      if (!m) return;
      closeMenus();
      if (m.dataset.m === 'lib') openLibrary(side);
      else if (m.dataset.m === 'file') {
        pendingImageSide = side;
        if (fileInput) {
          fileInput.value = '';
          fileInput.click();
        }
      } else {
        try {
          const items = await (navigator.clipboard as any).read();
          for (const it of items) {
            const type = (it.types as string[]).find((t) => t.startsWith('image/'));
            if (type) {
              await attachFile(await it.getType(type), side);
              return;
            }
          }
          toast('No hay ninguna imagen en el portapapeles');
        } catch {
          toast('Pega con Ctrl+V dentro del cuadro de texto');
          (side === 'front' ? frontEl : backEl).focus();
        }
      }
    });
  };

  fileInput?.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    if (f) void attachFile(f, pendingImageSide);
  });

  const setupPaste = (ta: HTMLTextAreaElement, side: Side) => {
    ta.addEventListener('paste', (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            void attachFile(file, side);
            return;
          }
        }
      }
    });
  };
  setupPaste(frontEl, 'front');
  setupPaste(backEl, 'back');

  const setupDrop = (zoneId: string, side: Side) => {
    const zone = q<HTMLElement>(zoneId);
    if (!zone) return;
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag');
      const f = e.dataTransfer?.files?.[0];
      if (f && f.type.startsWith('image/')) void attachFile(f, side);
    });
  };
  setupDrop('#drop-zone-anverso', 'front');
  setupDrop('#drop-zone-reverso', 'back');

  /* ------------------------------------------------------------------ */
  /*  Oclusión                                                            */
  /* ------------------------------------------------------------------ */
  const openOcclusionTool = () => {
    openImageOcclusionModal({
      deckId: deck.id,
      initialImage: occlusionImage || frontImage || CLEAN_CANVAS_PLACEHOLDER,
      initialMasks: occlusionMasks,
      initialMode: occlusionMode,
      onConfirm: (img, masks, m) => {
        occlusionImage = img;
        frontImage = img;
        occlusionMasks = masks;
        occlusionMode = m;
        refreshImages();
      },
      onClose: () => {}
    });
  };
  q('#tool-occlusion-btn')?.addEventListener('click', openOcclusionTool);

  /* ------------------------------------------------------------------ */
  /*  Modos                                                               */
  /* ------------------------------------------------------------------ */
  const applyMode = (next: Mode, userInitiated = false) => {
    mode = next;
    root.dataset.mode = next;
    root.querySelectorAll<HTMLElement>('.ce-mode').forEach((b) => b.classList.toggle('on', b.dataset.mode === next));
    const lf = q('#ce-label-front');
    const lb = q('#ce-label-back');
    const hf = q('#ce-hint-front');
    if (next === 'cloze') {
      if (lf) lf.textContent = 'Texto con huecos';
      if (lb) lb.textContent = 'Información extra (opcional)';
      if (hf) hf.textContent = 'Selecciona una palabra y pulsa «Ocultar»';
      frontEl.placeholder = 'Escribe la frase completa: «La {{c1::mitocondria}} produce {{c2::ATP}}»';
      backEl.placeholder = 'Un dato, ejemplo o fuente que se muestra al revelar…';
    } else if (next === 'occlusion') {
      if (lf) lf.textContent = 'Pregunta (opcional)';
      if (hf) hf.textContent = 'Cada zona oculta será una tarjeta';
      frontEl.placeholder = 'Ej.: Identifica la estructura marcada';
    } else {
      if (lf) lf.textContent = 'Anverso · Pregunta';
      if (lb) lb.textContent = 'Reverso · Respuesta';
      if (hf) hf.textContent = 'Markdown y KaTeX';
      frontEl.placeholder = 'Escribe la pregunta o el concepto… Usa $$E=mc^2$$ para fórmulas';
      backEl.placeholder = 'Escribe la respuesta o la explicación…';
    }
    updatePreview();
    if (userInitiated) {
      if (next === 'occlusion') openOcclusionTool();
      else frontEl.focus();
      scheduleDraft();
    }
  };
  root.querySelectorAll<HTMLElement>('.ce-mode').forEach((b) =>
    b.addEventListener('click', () => applyMode((b.dataset.mode as Mode) || 'basic', true))
  );

  /* ------------------------------------------------------------------ */
  /*  Borrador automático (no se pierde nada si se cierra la app)         */
  /* ------------------------------------------------------------------ */
  let draftTimer = 0;
  const scheduleDraft = () => {
    if (editCard) return;
    window.clearTimeout(draftTimer);
    draftTimer = window.setTimeout(() => {
      const front = frontEl.value;
      const back = backEl.value;
      if (!front.trim() && !back.trim() && !frontImage && !backImage) {
        lsRemove(draftKey(deck.id));
        return;
      }
      const small = (img?: string) => (img && img.length < 450_000 ? img : undefined);
      lsSet(draftKey(deck.id), JSON.stringify({ front, back, mode, frontImage: small(frontImage), backImage: small(backImage), credits, at: Date.now() }));
    }, 500);
  };

  if (!editCard) {
    try {
      const raw = lsGet(draftKey(deck.id));
      if (raw) {
        const d = JSON.parse(raw);
        if (d && (d.front || d.back || d.frontImage || d.backImage) && Date.now() - (d.at || 0) < 7 * 86400000) {
          frontEl.value = d.front || '';
          backEl.value = d.back || '';
          frontImage = d.frontImage || undefined;
          backImage = d.backImage || undefined;
          credits.front = d.credits?.front || '';
          credits.back = d.credits?.back || '';
          if (d.mode === 'cloze') applyMode('cloze');
          q('#ce-draft')?.classList.remove('hidden');
        }
      }
    } catch {
      /* borrador corrupto: se ignora */
    }
    q('#ce-draft-discard')?.addEventListener('click', () => {
      lsRemove(draftKey(deck.id));
      frontEl.value = '';
      backEl.value = '';
      frontImage = backImage = undefined;
      credits.front = credits.back = '';
      q('#ce-draft')?.classList.add('hidden');
      autoGrow(frontEl);
      autoGrow(backEl);
      refreshImages();
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Barra de formato                                                    */
  /* ------------------------------------------------------------------ */
  const onTextChanged = () => {
    updatePreview();
    scheduleDraft();
  };

  const wrapSelection = (ta: HTMLTextAreaElement, prefix: string, suffix: string) => {
    ta.focus();
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const val = ta.value;
    const selected = val.substring(start, end);
    const linePrefix = prefix === '## ' || prefix === '- ' || prefix === '1. ';

    if (linePrefix) {
      const lines = (selected || '').split('\n');
      const formatted = selected ? lines.map((l) => (l.startsWith(prefix) ? l.substring(prefix.length) : prefix + l)).join('\n') : prefix;
      ta.value = val.substring(0, start) + formatted + val.substring(end);
      ta.setSelectionRange(start + (selected ? 0 : formatted.length), start + formatted.length);
    } else if (prefix === '[enlace](url)') {
      const text = selected || 'enlace';
      const wrap = `[${text}](https://)`;
      ta.value = val.substring(0, start) + wrap + val.substring(end);
      const urlPos = start + text.length + 3;
      ta.setSelectionRange(urlPos, urlPos + 8);
    } else {
      const wrapped = val.substring(start - prefix.length, start) === prefix && val.substring(end, end + suffix.length) === suffix && start >= prefix.length;
      const selfWrapped = selected.length >= prefix.length + suffix.length && selected.startsWith(prefix) && selected.endsWith(suffix);
      if (selfWrapped) {
        const inner = selected.substring(prefix.length, selected.length - suffix.length);
        ta.value = val.substring(0, start) + inner + val.substring(end);
        ta.setSelectionRange(start, start + inner.length);
      } else if (wrapped) {
        ta.value = val.substring(0, start - prefix.length) + selected + val.substring(end + suffix.length);
        ta.setSelectionRange(start - prefix.length, end - prefix.length);
      } else {
        ta.value = val.substring(0, start) + prefix + selected + suffix + val.substring(end);
        ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      }
    }
    autoGrow(ta);
    onTextChanged();
  };

  root.querySelectorAll<HTMLButtonElement>('.tool-fmt-btn').forEach((btn) => {
    // El cuadro de texto no pierde el foco ni la selección al pulsar un botón (móvil y escritorio)
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const side = (btn.closest('.ce-toolbar') as HTMLElement).dataset.side as Side;
      const prefix = btn.dataset.fmt || '';
      const suffix = btn.dataset.suffix || prefix;
      wrapSelection(side === 'front' ? frontEl : backEl, prefix, suffix);
    });
  });

  const wrapCloze = () => {
    const ta = frontEl;
    ta.focus();
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) {
      toast('Selecciona primero la palabra que quieres ocultar');
      return;
    }
    if (mode !== 'cloze') applyMode('cloze', false);
    const val = ta.value;
    const used = Array.from(val.matchAll(/\{\{c(\d+)::/g)).map((m) => Number(m[1]));
    const n = (used.length ? Math.max(...used) : 0) + 1;
    const sel = val.substring(start, end);
    const wrap = `{{c${n}::${sel}}}`;
    ta.value = val.substring(0, start) + wrap + val.substring(end);
    ta.setSelectionRange(start + wrap.length, start + wrap.length);
    autoGrow(ta);
    onTextChanged();
  };

  // Botones con acción propia
  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (!t.closest('.ce-menu') && !t.closest('[data-act="img-menu"]')) closeMenus();
    const b = t.closest('[data-act]') as HTMLElement | null;
    if (!b) return;
    const side = (b.dataset.side as Side) || 'front';
    switch (b.dataset.act) {
      case 'img-menu':
        openImageMenu(b, side);
        break;
      case 'img-lib':
        openLibrary(side);
        break;
      case 'img-del':
        setImage(side, undefined);
        break;
      case 'audio':
        ttsService.speak((side === 'front' ? frontEl.value : backEl.value) || 'Sin texto', deck.settings.ttsVoiceLang);
        break;
      case 'cloze':
        wrapCloze();
        break;
      case 'formula': {
        const ta = side === 'front' ? frontEl : backEl;
        openScientificFormulaAssistant({
          initialLatex: ta.value,
          onInsert: (formula) => {
            const cur = ta.value;
            const pos = ta.selectionStart ?? cur.length;
            ta.value = `${cur.slice(0, pos)} ${formula} ${cur.slice(pos)}`.trim();
            ta.focus();
            autoGrow(ta);
            onTextChanged();
          }
        });
        break;
      }
    }
  });

  /* ------------------------------------------------------------------ */
  /*  Entradas de texto                                                   */
  /* ------------------------------------------------------------------ */
  let dupTimer = 0;
  const checkDuplicate = () => {
    if (editCard && frontEl.value.trim() === editCard.front.trim()) return dupEl?.classList.add('hidden');
    const txt = mode === 'cloze' ? frontEl.value.replace(/\{\{c\d*::([\s\S]*?)(?:::[\s\S]*?)?\}\}/g, '$1') : frontEl.value;
    const dup = mode === 'basic' ? deckService.findDuplicateCard(deck.id, txt, editCard?.id) : undefined;
    dupEl?.classList.toggle('hidden', !dup);
  };

  [frontEl, backEl].forEach((ta) => {
    autoGrow(ta);
    ta.addEventListener('input', () => {
      autoGrow(ta);
      onTextChanged();
      if (ta === frontEl) {
        window.clearTimeout(dupTimer);
        dupTimer = window.setTimeout(checkDuplicate, 350);
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /*  AI Builder                                                          */
  /* ------------------------------------------------------------------ */
  q('#btn-ai-anverso')?.addEventListener('click', () => {
    openFigmaAiBuilderModal({
      deckId: deck.id,
      onInsertToEditor: (card) => {
        frontEl.value = card.front;
        backEl.value = card.back;
        autoGrow(frontEl);
        autoGrow(backEl);
        onTextChanged();
      },
      onBatchAdded: () => callbacks.onSaved(),
      onClose: () => {}
    });
  });

  /* ------------------------------------------------------------------ */
  /*  Guardado                                                            */
  /* ------------------------------------------------------------------ */
  const resetForNext = () => {
    frontEl.value = '';
    backEl.value = '';
    frontImage = backImage = occlusionImage = undefined;
    occlusionMasks = [];
    credits.front = credits.back = '';
    lsRemove(draftKey(deck.id));
    q('#ce-draft')?.classList.add('hidden');
    dupEl?.classList.add('hidden');
    autoGrow(frontEl);
    autoGrow(backEl);
    refreshImages();
    setFlip(false);
    frontEl.focus({ preventScroll: false });
  };

  const bumpCounter = (n: number) => {
    createdCount += n;
    if (counterEl) {
      counterEl.classList.remove('hidden');
      (counterEl.querySelector('b') as HTMLElement).textContent = String(createdCount);
      counterEl.classList.remove('pop');
      void counterEl.offsetWidth;
      counterEl.classList.add('pop');
    }
  };

  const creditText = () => [credits.front, credits.back].filter(Boolean).join(' | ') || undefined;

  const save = (closeAfter: boolean) => {
    const front = frontEl.value.trim();
    const back = backEl.value.trim();
    const createInverted = mode === 'basic' && !!invertedToggle?.checked;

    // ---------- validación ----------
    if (mode === 'basic') {
      if (!front && !currentImage('front')) return toast('Escribe la pregunta (o añade una imagen)'), shake(frontEl);
      if (!back && !backImage) return toast('Falta la respuesta'), shake(backEl);
    } else if (mode === 'cloze') {
      if (!/\{\{c\d*::/.test(front)) return toast('Selecciona una palabra y pulsa «Ocultar» para crear el hueco'), shake(frontEl);
    } else if (mode === 'occlusion') {
      if (!occlusionImage || occlusionMasks.length === 0) return toast('Abre el editor de oclusión y marca al menos una zona'), openOcclusionTool();
    }

    try {
      lsSet(INVERT_PREF_KEY, invertedToggle?.checked ? '1' : '0');
    } catch {
      /* ignore */
    }

    // ---------- edición ----------
    if (editCard) {
      if (mode === 'occlusion') {
        deckService.syncOcclusionCards(deck.id, editCard, occlusionImage || frontImage || '', occlusionMasks, occlusionMode, front || undefined);
      } else if (mode === 'cloze') {
        const idxs = Array.from(new Set(Array.from(front.matchAll(/\{\{c(\d+)::/g)).map((m) => Number(m[1])))).sort((a, b) => a - b);
        const first = idxs[0] ?? 1;
        const own = front.replace(/\{\{c(\d+)::([\s\S]*?)(?:::([\s\S]*?))?\}\}/g, (_m, n: string, a: string, h?: string) => (Number(n) === first ? `{{c::${a}${h ? '::' + h : ''}}}` : a));
        deckService.updateCard(editCard.id, { deckId: deck.id, type: 'cloze', front: own, back, frontImage, backImage, imageCredit: creditText() });
        if (idxs.length > 1) deckService.createClozeCards(deck.id, front, back, chunkId, { frontImage, backImage, imageCredit: creditText() }, idxs.slice(1));
      } else {
        const isLatex = front.includes('$') || back.includes('$');
        deckService.updateCard(editCard.id, {
          deckId: deck.id,
          type: isLatex ? 'latex' : 'standard',
          front,
          back,
          frontImage,
          backImage,
          imageCredit: creditText(),
          occlusionImage: undefined,
          occlusionMasks: undefined,
          activeMaskId: undefined
        });
      }
      callbacks.onSaved();
      return;
    }

    // ---------- alta ----------
    let created: Flashcard[] = [];
    if (mode === 'occlusion') {
      created = deckService.createOcclusionCards(deck.id, occlusionImage || frontImage || CLEAN_CANVAS_PLACEHOLDER, occlusionMasks, occlusionMode, chunkId);
    } else if (mode === 'cloze') {
      created = deckService.createClozeCards(deck.id, front, back, chunkId, { frontImage, backImage, imageCredit: creditText() });
    } else {
      const isLatex = front.includes('$') || back.includes('$');
      const c = deckService.createCard(
        {
          deckId: deck.id,
          type: isLatex ? 'latex' : 'standard',
          front,
          back,
          frontImage,
          backImage,
          imageCredit: creditText(),
          chunkId
        },
        createInverted
      );
      created = c.groupId ? deckService.getCardsByGroupId(c.groupId) : [c];
    }
    lastCreatedIds = created.map((c) => c.id);
    bumpCounter(created.length);

    if (closeAfter) {
      lsRemove(draftKey(deck.id));
      callbacks.onBack();
      return;
    }
    resetForNext();
    const ids = lastCreatedIds.slice();
    toast(created.length > 1 ? `✓ ${created.length} tarjetas creadas` : '✓ Tarjeta creada', {
      label: 'Deshacer',
      run: () => {
        deckService.deleteCards(ids);
        createdCount = Math.max(0, createdCount - ids.length);
        if (counterEl) (counterEl.querySelector('b') as HTMLElement).textContent = String(createdCount);
        toast('Tarjeta eliminada');
      }
    });
  };

  q('#btn-save-card-check')?.addEventListener('click', () => save(!!editCard));
  q('#ce-save-bottom')?.addEventListener('click', () => save(!!editCard));
  q('#ce-finish')?.addEventListener('click', () => callbacks.onBack());

  const goBack = () => {
    if (!editCard && (frontEl.value.trim() || backEl.value.trim())) {
      // El borrador ya está guardado; se avisa y se sale
      toast('Borrador guardado: seguirá aquí cuando vuelvas');
    }
    callbacks.onBack();
  };
  q('#btn-card-edit-back')?.addEventListener('click', goBack);
  q('#crumb-e-deck')?.addEventListener('click', goBack);

  /* ------------------------------------------------------------------ */
  /*  Atajos de teclado                                                   */
  /* ------------------------------------------------------------------ */
  const onKey = (e: KeyboardEvent) => {
    if (!root.isConnected) {
      detachGlobalKeys?.();
      return;
    }
    if (document.querySelector('.imglib-overlay, .apple-modal-overlay, .modal-backdrop')) return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === 'Enter') {
      e.preventDefault();
      save(e.shiftKey || !!editCard);
    } else if (mod && !e.shiftKey && (e.key === 'i' || e.key === 'I')) {
      // Ctrl+I abre la biblioteca de imágenes para el lado donde estás escribiendo
      e.preventDefault();
      openLibrary(document.activeElement === backEl ? 'back' : 'front');
    } else if (mod && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      wrapCloze();
    } else if (mod && (e.key === 'b' || e.key === 'B') && (document.activeElement === frontEl || document.activeElement === backEl)) {
      e.preventDefault();
      wrapSelection(document.activeElement as HTMLTextAreaElement, '**', '**');
    } else if (e.key === 'Escape' && !(document.activeElement as HTMLElement | null)?.closest?.('.ce-box')) {
      goBack();
    }
  };
  window.addEventListener('keydown', onKey);
  detachGlobalKeys = () => {
    window.removeEventListener('keydown', onKey);
    detachGlobalKeys = null;
  };

  /* ------------------------------------------------------------------ */
  /*  Arranque                                                            */
  /* ------------------------------------------------------------------ */
  applyMode(mode);
  refreshImages();
  setFlip(false);
  if (!editCard) window.setTimeout(() => frontEl.focus({ preventScroll: true }), 60);
}
