import type { OcclusionMask, OcclusionMode } from '../types/flashcard';
import { HEART_ANATOMY_SVG_URI } from '../services/demo-data';

export interface ImageOcclusionModalOptions {
  deckId: string;
  initialImage?: string;
  initialMasks?: OcclusionMask[];
  initialMode?: OcclusionMode;
  onConfirm: (imageSrc: string, masks: OcclusionMask[], mode: OcclusionMode) => void;
  onClose: () => void;
}

export function openImageOcclusionModal(options: ImageOcclusionModalOptions): void {
  const existing = document.getElementById('modal-occlusion-root');
  if (existing) existing.remove();

  let currentImage = options.initialImage || HEART_ANATOMY_SVG_URI;
  let masks: OcclusionMask[] = options.initialMasks ? [...options.initialMasks] : [];
  let currentMode: OcclusionMode = options.initialMode || 'hide_all_reveal_one';

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-occlusion-root">
      <div class="apple-glass-modal" style="max-width:920px; max-height:92vh; display:flex; flex-direction:column;">
        
        <!-- Header -->
        <div class="figma-modal-header" style="padding:16px 22px; border-bottom:1px solid var(--f-border);">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="apple-glass-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div>
              <h3 style="font-size:1.18rem; font-weight:800; color:#fff;">Oclusión de Imágenes Inteligente</h3>
              <p style="font-size:0.78rem; color:var(--f-text-secondary);">Arrastra para dibujar máscaras, muévelas o bórralas libremente</p>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:12px;">
            <button class="figma-btn-ghost" id="btn-cancel-occlusion">Cancelar</button>
            <button class="figma-btn-blue-pill" id="btn-confirm-occlusion" style="padding:10px 22px;">
              <span id="btn-confirm-text">✨ Generar ${masks.length || 1} Tarjetas</span>
            </button>
          </div>
        </div>

        <!-- Toolbar Superior con Botones con Nombre -->
        <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 22px; background:rgba(255,255,255,0.02); border-bottom:1px solid var(--f-border); flex-wrap:wrap; gap:10px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <button class="apple-btn-outline-pill" id="btn-load-photo">
              📷 Cargar Foto
            </button>
            <input type="file" id="occ-file-input" accept="image/*" style="display:none;" />

            <button class="apple-btn-outline-pill" id="btn-template-heart">
              🫀 Plantilla Corazón
            </button>

            <button class="apple-btn-outline-pill" id="btn-clear-all-masks" style="color:#f87171;">
              🗑️ Borrar Todo
            </button>
          </div>

          <!-- Switch Modo Oclusión -->
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.85rem; font-weight:700; color:var(--f-text-secondary);">Modo de Estudio:</span>
            <div style="display:flex; background:#1c1d22; border-radius:10px; padding:3px; border:1px solid var(--f-border);">
              <button class="apple-tab-pill ${currentMode === 'hide_all_reveal_one' ? 'active' : ''}" id="btn-mode-hide-all" style="font-size:0.78rem; padding:5px 10px; border-radius:8px; border:none; cursor:pointer;">
                🔒 Ocluir 1, Ocultar Todas
              </button>
              <button class="apple-tab-pill ${currentMode === 'hide_one_reveal_one' ? 'active' : ''}" id="btn-mode-hide-one" style="font-size:0.78rem; padding:5px 10px; border-radius:8px; border:none; cursor:pointer;">
                👁️ Ocluir 1, Ocultar 1
              </button>
            </div>
          </div>
        </div>

        <!-- Canvas Stage -->
        <div style="flex:1; overflow:auto; padding:20px; display:flex; justify-content:center; align-items:center; min-height:380px; background:#07080a;" id="occ-drop-canvas-zone">
          <div class="figma-stage-inner" id="occ-canvas-stage">
            <img src="${currentImage}" id="occ-target-img" alt="Lienzo de Oclusión" draggable="false" style="max-height:55vh; width:auto; max-width:100%; border-radius:14px; display:block;" />
            <div class="figma-mask-overlay" id="occ-overlay-layer"></div>
          </div>
        </div>

        <!-- Footer Info -->
        <div style="padding:14px 22px; border-top:1px solid var(--f-border); display:flex; align-items:center; justify-content:space-between; font-size:0.86rem; color:var(--f-text-secondary);">
          <span style="color:#fbbf24;">💡 <strong>División Inteligente:</strong> Cada máscara se convertirá en una tarjeta independiente. Puedes mover las máscaras arrastrándolas.</span>
          <span style="font-weight:800; color:var(--f-blue);" id="lbl-active-masks">Máscaras activas: ${masks.length}</span>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const imgEl = document.getElementById('occ-target-img') as HTMLImageElement;
  const overlay = document.getElementById('occ-overlay-layer') as HTMLElement;
  const lblActive = document.getElementById('lbl-active-masks') as HTMLElement;
  const btnConfirmText = document.getElementById('btn-confirm-text') as HTMLElement;

  let isDrawing = false;
  let startX = 0;
  let startY = 0;
  let previewEl: HTMLElement | null = null;

  // Variables for dragging existing masks
  let draggingMaskIndex: number | null = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  const updateHeaderInfo = () => {
    if (lblActive) lblActive.textContent = `Máscaras activas: ${masks.length}`;
    if (btnConfirmText) btnConfirmText.textContent = `✨ Generar ${Math.max(1, masks.length)} Tarjetas`;
  };

  const renderMasks = () => {
    if (!overlay) return;
    overlay.innerHTML = '';

    masks.forEach((m, idx) => {
      const maskEl = document.createElement('div');
      maskEl.className = 'figma-drawn-mask';
      maskEl.style.left = `${m.x}%`;
      maskEl.style.top = `${m.y}%`;
      maskEl.style.width = `${m.width}%`;
      maskEl.style.height = `${m.height}%`;
      maskEl.style.cursor = 'grab';
      maskEl.dataset.maskIdx = String(idx);

      maskEl.innerHTML = `
        <span class="f-mask-idx">#${idx + 1}</span>
        <button class="f-mask-del" data-del-idx="${idx}" title="Eliminar máscara">×</button>
      `;

      // Drag to move mask listener
      maskEl.addEventListener('pointerdown', (e) => {
        if ((e.target as HTMLElement).classList.contains('f-mask-del')) return;
        e.stopPropagation();
        e.preventDefault();

        const rect = overlay.getBoundingClientRect();
        draggingMaskIndex = idx;
        const currentPxX = (m.x / 100) * rect.width;
        const currentPxY = (m.y / 100) * rect.height;
        const pointerPxX = e.clientX - rect.left;
        const pointerPxY = e.clientY - rect.top;

        dragOffsetX = pointerPxX - currentPxX;
        dragOffsetY = pointerPxY - currentPxY;
        maskEl.style.cursor = 'grabbing';
      });

      overlay.appendChild(maskEl);
    });

    // Delete single mask
    overlay.querySelectorAll<HTMLButtonElement>('.f-mask-del').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.delIdx || '0', 10);
        masks.splice(idx, 1);
        renderMasks();
        updateHeaderInfo();
      });
    });

    updateHeaderInfo();
  };

  imgEl.onload = () => {
    renderMasks();
  };
  if (imgEl.complete) renderMasks();

  // Pointer down on overlay (Draw new mask or move)
  overlay.addEventListener('pointerdown', (e) => {
    if (draggingMaskIndex !== null) return;
    if ((e.target as HTMLElement).classList.contains('f-mask-del') || (e.target as HTMLElement).classList.contains('figma-drawn-mask')) {
      return;
    }

    const rect = overlay.getBoundingClientRect();
    isDrawing = true;
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    previewEl = document.createElement('div');
    previewEl.className = 'figma-drawing-preview';
    previewEl.style.left = `${startX}px`;
    previewEl.style.top = `${startY}px`;
    previewEl.style.width = '0px';
    previewEl.style.height = '0px';
    overlay.appendChild(previewEl);
  });

  window.addEventListener('pointermove', (e) => {
    const rect = overlay.getBoundingClientRect();

    // 1. Handling moving an existing mask
    if (draggingMaskIndex !== null && draggingMaskIndex < masks.length) {
      const pointerPxX = e.clientX - rect.left;
      const pointerPxY = e.clientY - rect.top;
      const newPxX = pointerPxX - dragOffsetX;
      const newPxY = pointerPxY - dragOffsetY;

      const m = masks[draggingMaskIndex];
      const newXPercent = Math.max(0, Math.min(100 - m.width, (newPxX / rect.width) * 100));
      const newYPercent = Math.max(0, Math.min(100 - m.height, (newPxY / rect.height) * 100));

      m.x = Number(newXPercent.toFixed(2));
      m.y = Number(newYPercent.toFixed(2));

      const maskElement = overlay.querySelector(`[data-mask-idx="${draggingMaskIndex}"]`) as HTMLElement | null;
      if (maskElement) {
        maskElement.style.left = `${m.x}%`;
        maskElement.style.top = `${m.y}%`;
      }
      return;
    }

    // 2. Handling drawing a new mask
    if (!isDrawing || !previewEl) return;
    const currentX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const currentY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    previewEl.style.left = `${left}px`;
    previewEl.style.top = `${top}px`;
    previewEl.style.width = `${width}px`;
    previewEl.style.height = `${height}px`;
  });

  window.addEventListener('pointerup', () => {
    if (draggingMaskIndex !== null) {
      draggingMaskIndex = null;
      renderMasks();
    }

    if (isDrawing && previewEl) {
      isDrawing = false;
      const rect = overlay.getBoundingClientRect();
      const left = parseFloat(previewEl.style.left);
      const top = parseFloat(previewEl.style.top);
      const width = parseFloat(previewEl.style.width);
      const height = parseFloat(previewEl.style.height);
      previewEl.remove();
      previewEl = null;

      if (width > 12 && height > 12 && rect.width > 0 && rect.height > 0) {
        const xPct = Number(((left / rect.width) * 100).toFixed(2));
        const yPct = Number(((top / rect.height) * 100).toFixed(2));
        const wPct = Number(((width / rect.width) * 100).toFixed(2));
        const hPct = Number(((height / rect.height) * 100).toFixed(2));

        masks.push({
          id: `mask-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          x: xPct,
          y: yPct,
          width: wPct,
          height: hPct,
          label: `Estructura #${masks.length + 1}`
        });

        renderMasks();
        updateHeaderInfo();
      }
    }
  });

  // Load photo via file input
  const fileInput = document.getElementById('occ-file-input') as HTMLInputElement;
  document.getElementById('btn-load-photo')?.addEventListener('click', () => fileInput.click());
  fileInput?.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        currentImage = ev.target?.result as string;
        imgEl.src = currentImage;
        masks = [];
        renderMasks();
      };
      reader.readAsDataURL(fileInput.files[0]);
    }
  });

  // Drag & drop image directly onto occlusion canvas
  const canvasDrop = document.getElementById('occ-drop-canvas-zone');
  canvasDrop?.addEventListener('dragover', (e) => e.preventDefault());
  canvasDrop?.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          currentImage = ev.target?.result as string;
          imgEl.src = currentImage;
          masks = [];
          renderMasks();
        };
        reader.readAsDataURL(file);
      }
    }
  });

  // Template heart
  document.getElementById('btn-template-heart')?.addEventListener('click', () => {
    currentImage = HEART_ANATOMY_SVG_URI;
    imgEl.src = currentImage;
    masks = [
      { id: 'm1', x: 4.1, y: 22.2, width: 25.0, height: 7.2, label: 'Vena Cava Superior' },
      { id: 'm2', x: 70.0, y: 15.5, width: 25.0, height: 7.2, label: 'Cayado de la Aorta' },
      { id: 'm3', x: 4.1, y: 43.3, width: 25.0, height: 7.2, label: 'Aurícula Derecha' },
      { id: 'm4', x: 70.0, y: 61.1, width: 25.8, height: 7.2, label: 'Ventrículo Izquierdo' }
    ];
    renderMasks();
  });

  // Clear all
  document.getElementById('btn-clear-all-masks')?.addEventListener('click', () => {
    masks = [];
    renderMasks();
  });

  // Mode toggles
  const btnHideAll = document.getElementById('btn-mode-hide-all');
  const btnHideOne = document.getElementById('btn-mode-hide-one');

  btnHideAll?.addEventListener('click', () => {
    currentMode = 'hide_all_reveal_one';
    btnHideAll.classList.add('active');
    btnHideOne?.classList.remove('active');
  });

  btnHideOne?.addEventListener('click', () => {
    currentMode = 'hide_one_reveal_one';
    btnHideOne.classList.add('active');
    btnHideAll?.classList.remove('active');
  });

  // Confirm
  document.getElementById('btn-confirm-occlusion')?.addEventListener('click', () => {
    options.onConfirm(currentImage, masks, currentMode);
    document.getElementById('modal-occlusion-root')?.remove();
  });

  // Cancel
  const close = () => {
    document.getElementById('modal-occlusion-root')?.remove();
    options.onClose();
  };

  document.getElementById('btn-cancel-occlusion')?.addEventListener('click', close);
}
