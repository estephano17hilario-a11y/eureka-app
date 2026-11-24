import '../ui/styles/cards.css';
import type { Deck, Flashcard, OcclusionMask, OcclusionMode } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { ttsService } from '../services/tts.service';
import { compressImageFile } from '../services/image-library.service';
import { lsGet, lsSet, lsRemove } from '../services/storage.service';
import { openImageOcclusionModal } from './ImageOcclusionModal';
import { openFigmaBatchImportModal } from './FigmaBatchImportModal';
import { textareaHost, isCoarsePointer } from '../symbols/host';
import { upgradeTextarea, type FormulaInfo } from '../symbols/RichField';
import { attachSymbolAutocomplete, openSymbolStudioLazy } from '../symbols/autocomplete';
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

const ICON_IMG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
const ICON_AUDIO =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';

/** Las herramientas se agrupan en tres cajones desplegables: Formato, Estructura e Insertar */
function toolbarHtml(side: Side): string {
  const tool = (attrs: string, icon: string, label: string, title: string, cls = '') =>
    `<button type="button" tabindex="-1" class="ce-tool ${cls}" ${attrs} data-side="${side}" title="${esc(title)}"><span class="ce-tool-ic">${icon}</span><span class="ce-tool-tx">${label}</span></button>`;
  const fmt = (open: string, close: string, icon: string, label: string, title: string) => tool(`data-fmt="${esc(open)}" data-suffix="${esc(close)}"`, icon, label, title);
  const line = (prefix: string, icon: string, label: string, title: string) => tool(`data-line="${esc(prefix)}"`, icon, label, title);
  const grp = (id: string, icon: string, label: string) =>
    `<button type="button" tabindex="-1" class="ce-tb-tab" data-grp="${id}" aria-expanded="false"><span class="ce-tb-ic">${icon}</span><span>${label}</span><i aria-hidden="true">▾</i></button>`;
  return `
    <div class="ce-toolbar" data-side="${side}">
      <div class="ce-tb-tabs" role="tablist">
        ${grp('fmt', '<b>Aa</b>', 'Formato')}
        ${grp('str', '☰', 'Estructura')}
        ${grp('ins', '＋', 'Insertar')}
      </div>
      <div class="ce-tb-panel hidden" data-panel="fmt">
        ${fmt('**', '**', '<b>B</b>', 'Negrita', 'Negrita (Ctrl+B)')}
        ${fmt('*', '*', '<i>I</i>', 'Cursiva', 'Cursiva')}
        ${fmt('<u>', '</u>', '<u>U</u>', 'Subrayado', 'Subrayado')}
        ${fmt('~~', '~~', '<s>S</s>', 'Tachado', 'Tachado')}
        ${fmt('==', '==', '<mark>R</mark>', 'Resaltar', 'Resaltar')}
        ${fmt('<sub>', '</sub>', 'X₂', 'Subíndice', 'Subíndice')}
        ${fmt('<sup>', '</sup>', 'X²', 'Superíndice', 'Superíndice')}
        ${fmt('`', '`', '&lt;/&gt;', 'Código', 'Código')}
      </div>
      <div class="ce-tb-panel hidden" data-panel="str">
        ${line('## ', 'H', 'Título', 'Título (convierte la línea)')}
        ${line('> ', '❝', 'Cita', 'Cita')}
        ${line('- ', '≡', 'Viñetas', 'Lista con viñetas')}
        ${line('1. ', '1≡', 'Numerada', 'Lista numerada')}
        ${tool('data-act="table"', '▦', 'Tabla', 'Insertar una tabla')}
      </div>
      <div class="ce-tb-panel hidden" data-panel="ins">
        ${tool('data-act="img-menu"', ICON_IMG, 'Imagen', 'Añadir imagen (Ctrl+I)', 'ce-tool-img')}
        ${tool('data-act="symbols"', '<b>Ω</b>', 'Símbolos', 'Símbolos y fórmulas de todas las materias (Ctrl+M) · o escribe \\ + nombre', 'ce-tool-sym')}
        ${tool('data-act="formula"', '<b>fx</b>', 'Fórmula', 'Fórmula KaTeX (envuelve la selección o abre el editor de fórmulas)')}
        ${tool('data-act="link"', '🔗', 'Enlace', 'Enlace a una página web')}
        ${side === 'front' ? tool('data-act="cloze"', '[…]', 'Ocultar', 'Ocultar el texto seleccionado (Ctrl+Shift+C)', 'ce-tool-cloze') : ''}
        ${tool('data-act="audio"', ICON_AUDIO, 'Escuchar', 'Escuchar')}
      </div>
      <div class="ce-link-row hidden" data-linkrow="${side}">
        <input type="url" class="ce-link-input" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="https://ejemplo.com" aria-label="Dirección del enlace" />
        <button type="button" class="ce-link-ok" data-act="link-ok" data-side="${side}">Insertar</button>
        <button type="button" class="ce-link-x" data-act="link-cancel" data-side="${side}" aria-label="Cancelar">✕</button>
      </div>
    </div>`;
}

function imageSlotHtml(side: Side, src: string | undefined, mode: Mode, choose: boolean): string {
  const modes = (
    [
      ['basic', '🖼️', 'Imagen normal'],
      ['cloze', '🕳️', 'Huecos'],
      ['occlusion', '🔲', 'Oclusión']
    ] as const
  )
    .map(([m, ic, label]) => `<button type="button" class="ce-img-mode ${m === mode ? 'on' : ''}" data-mode="${m}"><span>${ic}</span> ${label}</button>`)
    .join('');
  return `
    <div class="ce-img ${src ? '' : 'hidden'}" data-side="${side}">
      <img src="${esc(src || '')}" alt="Imagen del ${side === 'front' ? 'anverso' : 'reverso'}" />
      <div class="ce-img-meta">
        <b>Imagen adjunta</b>
        <small class="ce-img-credit"></small>
      </div>
      <button type="button" class="ce-img-btn" data-act="img-lib" data-side="${side}">Cambiar</button>
      <button type="button" class="ce-img-btn danger" data-act="img-del" data-side="${side}" aria-label="Quitar imagen">✕</button>
      ${side === 'front' && choose ? `<div class="ce-img-modes" role="tablist" aria-label="Qué hacer con la imagen">${modes}</div>` : ''}
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
                placeholder="Escribe la pregunta o el concepto… Toca Ω para insertar fórmulas y símbolos">${esc(frontText)}</textarea>
              ${imageSlotHtml('front', frontImg, mode, !editCard)}
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
              ${imageSlotHtml('back', editCard?.backImage, mode, false)}
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
            <div class="ce-option-btns">
              ${editCard ? '' : '<button type="button" class="ce-ai" id="btn-batch-create" title="Pega o sube muchas tarjetas de una vez">📥 Crear en lote</button>'}
              <button type="button" class="ce-ghost" id="ce-swap" title="Intercambiar anverso y reverso">⇅ Intercambiar caras</button>
            </div>
          </section>
        </div>

        <p class="ce-shortcuts">
          <kbd>Ctrl</kbd>+<kbd>↵</kbd> crear y seguir · <kbd>Ctrl</kbd>+<kbd>⇧</kbd>+<kbd>↵</kbd> crear y salir · <kbd>Ctrl</kbd>+<kbd>I</kbd> imagen · <kbd>Ctrl</kbd>+<kbd>M</kbd> símbolos · <kbd>\</kbd> + nombre para insertar un símbolo
          </p>
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
  // Los cuadros de texto muestran las fórmulas ya renderizadas y se pulsan para editarlas
  const rawFront = q<HTMLTextAreaElement>('#f-anverso-input');
  const rawBack = q<HTMLTextAreaElement>('#f-reverso-input');
  const frontEl = rawFront ? (upgradeTextarea(rawFront, (f) => openSymbols('front', true, f), 'Anverso', true) as unknown as HTMLTextAreaElement) : null;
  const backEl = rawBack ? (upgradeTextarea(rawBack, (f) => openSymbols('back', true, f), 'Reverso', true) as unknown as HTMLTextAreaElement) : null;
  const invertedToggle = q<HTMLInputElement>('#toggle-inverted-cards');
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
  /*  Imágenes                                                            */
  /* ------------------------------------------------------------------ */
  /** El selector «Imagen normal / Huecos / Oclusión» sigue al tipo de tarjeta actual */
  const syncImageModes = () => {
    root.querySelectorAll<HTMLElement>('.ce-img-mode').forEach((b) => b.classList.toggle('on', b.dataset.mode === mode));
  };

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
    syncImageModes();
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
    // Sin imagen en el anverso no hay oclusión posible: se vuelve a tarjeta básica
    if (side === 'front' && !dataUrl && mode === 'occlusion') applyMode('basic');
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
    syncImageModes();
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
      frontEl.placeholder = 'Escribe la pregunta o el concepto… Toca Ω para insertar fórmulas y símbolos';
      backEl.placeholder = 'Escribe la respuesta o la explicación…';
    }
    if (userInitiated) {
      if (next === 'occlusion') openOcclusionTool();
      else frontEl.focus();
      scheduleDraft();
    }
  };
  root.querySelectorAll<HTMLElement>('.ce-img-mode').forEach((b) =>
    b.addEventListener('click', () => {
      const next = (b.dataset.mode as Mode) || 'basic';
      if (next === mode) {
        if (next === 'occlusion') openOcclusionTool();
        return;
      }
      applyMode(next, true);
    })
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
    scheduleDraft();
  };

  /** Selección sin los espacios de los bordes (en Windows el doble clic incluye el espacio final) */
  const trimmedSel = (ta: HTMLTextAreaElement): [number, number] => {
    const v = ta.value;
    let a = ta.selectionStart;
    let b = ta.selectionEnd;
    while (a < b && /\s/.test(v[a])) a++;
    while (b > a && /\s/.test(v[b - 1])) b--;
    return [a, b];
  };

  /** Cambia el texto entre `from` y `to` y deja seleccionado `selA…selB` */
  const edit = (ta: HTMLTextAreaElement, from: number, to: number, text: string, selA: number, selB: number) => {
    const v = ta.value;
    ta.value = v.slice(0, from) + text + v.slice(to);
    ta.setSelectionRange(selA, selB);
    autoGrow(ta);
    onTextChanged();
  };

  const NEED_SELECTION = 'Selecciona primero el texto al que quieres aplicarlo';

  /** Negrita, cursiva, subrayado…: envuelve la selección (o la quita si ya estaba envuelta) */
  const wrapSelection = (ta: HTMLTextAreaElement, prefix: string, suffix: string) => {
    ta.focus();
    const v = ta.value;
    const [a, b] = trimmedSel(ta);
    // Solo se aplica a texto seleccionado: nunca inserta texto nuevo
    if (a === b) return toast(NEED_SELECTION);
    const sel = v.slice(a, b);
    const pl = prefix.length;
    const sl = suffix.length;
    // La cursiva (*) no debe confundirse con la negrita (**)
    const notBold = (from: number, to: number) => prefix !== '*' || (v[from - 2] !== '*' && v[to + 1] !== '*');
    if (sel.length >= pl + sl && sel.startsWith(prefix) && sel.endsWith(suffix) && notBold(a + pl, b - sl)) {
      const inner = sel.slice(pl, sel.length - sl);
      return edit(ta, a, b, inner, a, a + inner.length);
    }
    if (a >= pl && v.slice(a - pl, a) === prefix && v.slice(b, b + sl) === suffix && notBold(a, b)) {
      return edit(ta, a - pl, b + sl, sel, a - pl, a - pl + sel.length);
    }
    edit(ta, a, b, prefix + sel + suffix, a + pl, a + pl + sel.length);
  };

  /** Título, cita y listas: se aplican al principio de cada línea tocada por la selección */
  const LINE_TESTS: Record<string, RegExp> = { '## ': /^#{1,4} /, '> ': /^> /, '- ': /^- /, '1. ': /^\d+\. /, };
  const stripLine = (l: string) => l.replace(/^(?:#{1,4} |> |- |\d+\. )/, '');
  const toggleLine = (ta: HTMLTextAreaElement, prefix: string) => {
    ta.focus();
    const v = ta.value;
    const s0 = ta.selectionStart;
    const e0 = ta.selectionEnd;
    if (s0 === e0) return toast(NEED_SELECTION);
    const ls = s0 === 0 ? 0 : v.lastIndexOf('\n', s0 - 1) + 1;
    let le = v.indexOf('\n', Math.max(s0, e0 > s0 ? e0 - 1 : e0));
    if (le < 0) le = v.length;
    const lines = v.slice(ls, le).split('\n');
    const test = LINE_TESTS[prefix] || /^$/;
    const filled = lines.filter((l) => l.trim());
    const remove = filled.length > 0 && filled.every((l) => test.test(l));
    let n = 0;
    const out = lines.map((l) => {
      if (remove) return stripLine(l);
      if (!l.trim() && lines.length > 1) return l;
      n++;
      return (prefix === '1. ' ? `${n}. ` : prefix) + stripLine(l);
    });
    const text = out.join('\n');
    edit(ta, ls, le, text, ls, ls + text.length);
  };

  const wrapCloze = () => {
    const ta = frontEl;
    if (mode === 'occlusion') return toast('Esta tarjeta es de oclusión de imagen: marca las zonas en el editor de oclusión');
    ta.focus();
    const [start, end] = trimmedSel(ta);
    if (start === end) {
      toast('Selecciona primero la palabra que quieres ocultar');
      return;
    }
    if (mode !== 'cloze') applyMode('cloze', false);
    const val = ta.value;
    const used = Array.from(val.matchAll(/\{\{c(\d+)::/g)).map((m) => Number(m[1]));
    const n = (used.length ? Math.max(...used) : 0) + 1;
    const wrap = `{{c${n}::${val.slice(start, end)}}}`;
    edit(ta, start, end, wrap, start + wrap.length, start + wrap.length);
  };

  /* ---- cajones desplegables ---- */
  const toggleGroup = (bar: HTMLElement, id: string) => {
    const wasOpen = bar.querySelector(`.ce-tb-tab[data-grp="${id}"]`)?.getAttribute('aria-expanded') === 'true';
    bar.querySelectorAll<HTMLElement>('.ce-tb-tab').forEach((t) => {
      const on = !wasOpen && t.dataset.grp === id;
      t.classList.toggle('on', on);
      t.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    bar.querySelectorAll<HTMLElement>('.ce-tb-panel').forEach((pn) => pn.classList.toggle('hidden', wasOpen || pn.dataset.panel !== id));
    if (wasOpen) bar.querySelector('.ce-link-row')?.classList.add('hidden');
  };

  /* ---- enlace ---- */
  let linkRange: [number, number] = [0, 0];
  const linkRow = (side: Side) => q<HTMLElement>(`.ce-link-row[data-linkrow="${side}"]`);
  const openLink = (side: Side) => {
    const ta = side === 'front' ? frontEl : backEl;
    linkRange = trimmedSel(ta);
    if (linkRange[0] === linkRange[1]) return toast(NEED_SELECTION);
    const row = linkRow(side);
    const input = row?.querySelector('input') as HTMLInputElement | null;
    if (!row || !input) return;
    row.classList.remove('hidden');
    input.value = /^https?:\/\/\S+$/.test(ta.value.slice(linkRange[0], linkRange[1])) ? ta.value.slice(linkRange[0], linkRange[1]) : '';
    input.focus();
  };
  const applyLink = (side: Side) => {
    const ta = side === 'front' ? frontEl : backEl;
    const row = linkRow(side);
    const input = row?.querySelector('input') as HTMLInputElement | null;
    if (!row || !input) return;
    let url = input.value.trim();
    if (!url) return shake(input);
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) url = 'https://' + url;
    if (!/^https?:\/\/[^\s)]+$/.test(url)) {
      toast('La dirección debe empezar por http:// o https://');
      return shake(input);
    }
    const [a, b] = linkRange;
    const v = ta.value;
    const label = v.slice(a, b) || 'enlace';
    const md = `[${label}](${url})`;
    row.classList.add('hidden');
    ta.focus();
    edit(ta, a, b, md, a + md.length, a + md.length);
  };
  root.addEventListener('keydown', (e) => {
    const input = (e.target as HTMLElement).closest('.ce-link-input') as HTMLInputElement | null;
    if (!input) return;
    const side = (input.closest('.ce-link-row') as HTMLElement).dataset.linkrow as Side;
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      applyLink(side);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      linkRow(side)?.classList.add('hidden');
      (side === 'front' ? frontEl : backEl).focus();
    }
  });

  /* ---- tabla ---- */
  const insertTable = (ta: HTMLTextAreaElement) => {
    ta.focus();
    const v = ta.value;
    const [a, b] = [ta.selectionStart, ta.selectionEnd];
    const lead = a > 0 && v[a - 1] !== '\n' ? '\n\n' : '';
    const table = '| Concepto | Detalle |\n| --- | --- |\n|  |  |\n';
    const cell = lead.length + table.indexOf('|  |') + 2;
    edit(ta, a, b, lead + table, a + cell, a + cell);
  };

  // El cuadro de texto no pierde el foco ni la selección al pulsar un botón (móvil y escritorio)
  root.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).closest('.ce-toolbar button, .ce-menu button')) e.preventDefault();
  });

  // Botones con acción propia
  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (!t.closest('.ce-menu') && !t.closest('[data-act="img-menu"]')) closeMenus();
    const tab = t.closest('[data-grp]') as HTMLElement | null;
    if (tab) return toggleGroup(tab.closest('.ce-toolbar') as HTMLElement, tab.dataset.grp || 'fmt');
    const fm = t.closest('[data-fmt]') as HTMLElement | null;
    if (fm) {
      const ta = fm.dataset.side === 'back' ? backEl : frontEl;
      return wrapSelection(ta, fm.dataset.fmt || '', fm.dataset.suffix || fm.dataset.fmt || '');
    }
    const ln = t.closest('[data-line]') as HTMLElement | null;
    if (ln) return toggleLine(ln.dataset.side === 'back' ? backEl : frontEl, ln.dataset.line || '');
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
      case 'symbols':
        openSymbols(side);
        break;
      case 'formula': {
        const ta = side === 'front' ? frontEl : backEl;
        const [a, c] = trimmedSel(ta);
        if (a === c) openSymbols(side, true);
        else wrapSelection(ta, '$', '$');
        break;
      }
      case 'link':
        openLink(side);
        break;
      case 'link-ok':
        applyLink(side);
        break;
      case 'link-cancel':
        linkRow(side)?.classList.add('hidden');
        (side === 'front' ? frontEl : backEl).focus();
        break;
      case 'table':
        insertTable(side === 'front' ? frontEl : backEl);
        break;
    }
  });

  /* ------------------------------------------------------------------ */
  /*  Símbolos y fórmulas                                                 */
  /* ------------------------------------------------------------------ */
  const openSymbols = (side: Side, compose = false, edit?: FormulaInfo) => {
    const ta = side === 'front' ? frontEl : backEl;
    const mobile = isCoarsePointer();
    if (mobile) {
      // En el móvil el panel sustituye al teclado del sistema; el cuadro queda a la vista encima
      ta.blur();
      root.classList.add('ce-symx-open');
      window.setTimeout(() => ta.closest('.ce-block')?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60);
    }
    void openSymbolStudioLazy({
      host: textareaHost(() => (ta.isConnected ? ta : null), undefined, edit),
      mode: compose ? 'compose' : undefined,
      initialLatex: edit?.latex,
      editing: !!edit,
      onClose: () => root.classList.remove('ce-symx-open')
    });
  };
  const detachAc = [attachSymbolAutocomplete(frontEl), attachSymbolAutocomplete(backEl)];

  q('#ce-swap')?.addEventListener('click', () => {
    if (mode !== 'basic') return toast('Solo las tarjetas básicas tienen dos caras intercambiables');
    [frontEl.value, backEl.value] = [backEl.value, frontEl.value];
    [frontImage, backImage] = [backImage, frontImage];
    [credits.front, credits.back] = [credits.back, credits.front];
    autoGrow(frontEl);
    autoGrow(backEl);
    refreshImages();
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
  /*  Crear en lote                                                       */
  /* ------------------------------------------------------------------ */
  q('#btn-batch-create')?.addEventListener('click', () => {
    openFigmaBatchImportModal({
      deckId: deck.id,
      onImported: () => callbacks.onSaved(),
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
    applyMode('basic');
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
          activeMaskId: undefined,
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
          chunkId,
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
    } else if (mod && !e.shiftKey && (e.key === 'm' || e.key === 'M')) {
      // Ctrl+M: símbolos y fórmulas para el lado en el que estás (si el cursor está en una fórmula, la edita)
      e.preventDefault();
      openSymbols(document.activeElement === backEl ? 'back' : 'front', true);
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
    detachAc.forEach((off) => off());
    detachGlobalKeys = null;
  };

  /* ------------------------------------------------------------------ */
  /*  Arranque                                                            */
  /* ------------------------------------------------------------------ */
  applyMode(mode);
  refreshImages();
  if (!editCard) window.setTimeout(() => frontEl.focus({ preventScroll: true }), 60);
}
