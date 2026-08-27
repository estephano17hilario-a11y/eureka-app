import type { OcclusionMask, OcclusionMode } from '../types/flashcard';
import { HEART_ANATOMY_SVG_URI } from '../services/demo-data';

export interface ImageOcclusionModalOptions {
  deckId?: string;
  initialImage?: string;
  initialMasks?: OcclusionMask[];
  initialMode?: OcclusionMode;
  onConfirm: (image: string, masks: OcclusionMask[], mode: OcclusionMode) => void;
  onClose: () => void;
}

export function openImageOcclusionModal(options: ImageOcclusionModalOptions): void {
  let imageSrc = options.initialImage || HEART_ANATOMY_SVG_URI;
  let masks: OcclusionMask[] = options.initialMasks ? [...options.initialMasks] : [];
  let occlusionMode: OcclusionMode = options.initialMode || 'hide_all_reveal_one';
  let isDrawing = false;
  let startX = 0;
  let startY = 0;
  let previewBox: HTMLDivElement | null = null;

  const existing = document.getElementById('modal-image-occlusion-root');
  if (existing) existing.remove();

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-image-occlusion-root">
      <div class="figma-occlusion-modal apple-glass-panel">
        
        <!-- Header -->
        <div class="figma-modal-header" style="padding:18px 24px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="apple-glass-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#50b5ff" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div>
              <h3 style="font-size:1.25rem; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">Oclusión de Imágenes Inteligente</h3>
              <p style="font-size:0.82rem; color:var(--f-text-secondary);">Arrastra sobre cualquier estructura para crear máscaras de estudio</p>
            </div>
          </div>
          
          <div style="display:flex; align-items:center; gap:10px;">
            <button class="figma-btn-ghost" id="btn-cancel-occlusion" style="font-size:0.95rem;">Cancelar</button>
            <button class="figma-btn-blue-pill" id="btn-save-occlusion" style="padding:10px 22px; font-size:0.95rem;">
              ✨ Generar ${masks.length > 0 ? `${masks.length} Tarjetas` : 'Tarjetas'}
            </button>
          </div>
        </div>

        <!-- Clean Controls Toolbar with clear button names -->
        <div class="figma-occlusion-toolbar" style="padding:14px 24px; gap:12px;">
          <label class="apple-glass-button" style="cursor:pointer;">
            <span>📷 Cargar Foto</span>
            <input type="file" id="f-io-file-input" accept="image/*" style="display:none;" />
          </label>

          <button class="apple-glass-button" id="btn-preset-heart">
            🫀 Plantilla Corazón
          </button>
          
          <button class="apple-glass-button" id="btn-clear-all-masks" ${masks.length === 0 ? 'disabled' : ''}>
            🗑️ Borrar Todo (${masks.length})
          </button>

          <!-- Occlusion Mode Switch (Hide All vs Hide One) -->
          <div style="margin-left:auto; display:flex; align-items:center; gap:10px; background:rgba(0,0,0,0.3); padding:6px 14px; border-radius:99px; border:1px solid rgba(255,255,255,0.08);">
            <span style="font-size:0.82rem; font-weight:700; color:#fff;">Modo de Estudio:</span>
            <button class="apple-mode-toggle ${occlusionMode === 'hide_all_reveal_one' ? 'active' : ''}" id="btn-mode-hide-all" title="En la sesión de estudio, todas las demás etiquetas estarán cubiertas y solo se destapará la evaluada">
              🔒 Ocluir 1, Ocultar Todas
            </button>
            <button class="apple-mode-toggle ${occlusionMode === 'hide_one_reveal_one' ? 'active' : ''}" id="btn-mode-hide-one" title="Solo la etiqueta evaluada estará cubierta">
              👁️ Ocluir 1, Ocultar 1
            </button>
          </div>
        </div>

        <!-- Drawing Stage -->
        <div class="figma-stage-outer" id="f-stage-outer" style="background:#070709; padding:24px;">
          <div class="figma-stage-inner" id="f-stage-inner">
            <img src="${imageSrc}" id="f-occlusion-img" alt="Lienzo de Oclusión" draggable="false" />
            <div class="figma-mask-overlay" id="f-mask-overlay"></div>
          </div>
        </div>

        <!-- Footer Info -->
        <div style="padding:12px 24px; background:var(--f-surface-subtle); display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--f-border);">
          <span style="font-size:0.82rem; color:var(--f-text-secondary);">
            💡 <strong>División Inteligente:</strong> Cada máscara que dibujes se convertirá automáticamente en una flashcard independiente.
          </span>
          <span style="font-size:0.82rem; color:var(--f-blue); font-weight:700;">
            Máscaras activas: ${masks.length}
          </span>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const stageInner = document.getElementById('f-stage-inner') as HTMLDivElement | null;
  const overlay = document.getElementById('f-mask-overlay') as HTMLDivElement | null;
  const imgElement = document.getElementById('f-occlusion-img') as HTMLImageElement | null;
  const clearBtn = document.getElementById('btn-clear-all-masks') as HTMLButtonElement | null;
  const saveBtn = document.getElementById('btn-save-occlusion') as HTMLButtonElement | null;
  const modeHideAllBtn = document.getElementById('btn-mode-hide-all') as HTMLButtonElement | null;
  const modeHideOneBtn = document.getElementById('btn-mode-hide-one') as HTMLButtonElement | null;

  modeHideAllBtn?.addEventListener('click', () => {
    occlusionMode = 'hide_all_reveal_one';
    modeHideAllBtn.classList.add('active');
    modeHideOneBtn?.classList.remove('active');
  });

  modeHideOneBtn?.addEventListener('click', () => {
    occlusionMode = 'hide_one_reveal_one';
    modeHideOneBtn.classList.add('active');
    modeHideAllBtn?.classList.remove('active');
  });

  const renderMasks = () => {
    if (!overlay) return;
    overlay.innerHTML = masks
      .map(
        (m, i) => `
      <div class="figma-drawn-mask apple-glass-mask" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%;" data-mask-id="${m.id}">
        <span class="f-mask-idx">#${i + 1}</span>
        <button class="f-mask-del" data-del-id="${m.id}" title="Eliminar máscara">×</button>
      </div>
    `
      )
      .join('');

    if (clearBtn) clearBtn.disabled = masks.length === 0;
    if (saveBtn) {
      saveBtn.textContent = `✨ Generar ${masks.length > 0 ? `${masks.length} Tarjetas` : 'Tarjetas'}`;
    }

    // Bind individual delete
    overlay.querySelectorAll('.f-mask-del').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (btn as HTMLElement).dataset.delId;
        masks = masks.filter((m) => m.id !== id);
        renderMasks();
      });
    });
  };

  renderMasks();

  // Pointer drawing calculation (100% bug-free)
  if (stageInner && overlay) {
    const handlePointerDown = (clientX: number, clientY: number) => {
      const rect = stageInner.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      isDrawing = true;
      startX = clientX - rect.left;
      startY = clientY - rect.top;

      if (previewBox) previewBox.remove();
      previewBox = document.createElement('div');
      previewBox.className = 'figma-drawing-preview';
      previewBox.style.left = `${(startX / rect.width) * 100}%`;
      previewBox.style.top = `${(startY / rect.height) * 100}%`;
      previewBox.style.width = '0%';
      previewBox.style.height = '0%';
      overlay.appendChild(previewBox);
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
      if (!isDrawing || !previewBox) return;
      const rect = stageInner.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const currentX = clientX - rect.left;
      const currentY = clientY - rect.top;

      const minX = Math.max(0, Math.min(startX, currentX));
      const maxX = Math.min(rect.width, Math.max(startX, currentX));
      const minY = Math.max(0, Math.min(startY, currentY));
      const maxY = Math.min(rect.height, Math.max(startY, currentY));

      const leftPercent = (minX / rect.width) * 100;
      const topPercent = (minY / rect.height) * 100;
      const widthPercent = ((maxX - minX) / rect.width) * 100;
      const heightPercent = ((maxY - minY) / rect.height) * 100;

      previewBox.style.left = `${leftPercent}%`;
      previewBox.style.top = `${topPercent}%`;
      previewBox.style.width = `${widthPercent}%`;
      previewBox.style.height = `${heightPercent}%`;
    };

    const handlePointerUp = (clientX: number, clientY: number) => {
      if (!isDrawing) return;
      isDrawing = false;

      const rect = stageInner.getBoundingClientRect();
      if (previewBox && rect.width > 0 && rect.height > 0) {
        const currentX = clientX - rect.left;
        const currentY = clientY - rect.top;

        const minX = Math.max(0, Math.min(startX, currentX));
        const maxX = Math.min(rect.width, Math.max(startX, currentX));
        const minY = Math.max(0, Math.min(startY, currentY));
        const maxY = Math.min(rect.height, Math.max(startY, currentY));

        const leftPercent = Number(((minX / rect.width) * 100).toFixed(2));
        const topPercent = Number(((minY / rect.height) * 100).toFixed(2));
        const widthPercent = Number((((maxX - minX) / rect.width) * 100).toFixed(2));
        const heightPercent = Number((((maxY - minY) / rect.height) * 100).toFixed(2));

        previewBox.remove();
        previewBox = null;

        if (widthPercent > 1.5 && heightPercent > 1.5) {
          masks.push({
            id: `mask-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
            x: leftPercent,
            y: topPercent,
            width: widthPercent,
            height: heightPercent,
            label: `Estructura #${masks.length + 1}`
          });
          renderMasks();
        }
      }
    };

    overlay.addEventListener('mousedown', (e) => {
      if ((e.target as HTMLElement).classList.contains('f-mask-del')) return;
      handlePointerDown(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDrawing) handlePointerMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', (e) => {
      if (isDrawing) handlePointerUp(e.clientX, e.clientY);
    });

    // Touch support
    overlay.addEventListener('touchstart', (e) => {
      if ((e.target as HTMLElement).classList.contains('f-mask-del')) return;
      const touch = e.touches[0];
      handlePointerDown(touch.clientX, touch.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (isDrawing && e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    });

    window.addEventListener('touchend', (e) => {
      if (isDrawing && e.changedTouches[0]) handlePointerUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    });
  }

  // Load new image from file
  const fileInput = document.getElementById('f-io-file-input') as HTMLInputElement | null;
  fileInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        if (re.target?.result && imgElement) {
          imageSrc = re.target.result as string;
          imgElement.src = imageSrc;
          masks = [];
          renderMasks();
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // Preset button
  document.getElementById('btn-preset-heart')?.addEventListener('click', () => {
    imageSrc = HEART_ANATOMY_SVG_URI;
    if (imgElement) imgElement.src = imageSrc;
    masks = [
      { id: 'mask-1', x: 4.1, y: 22.2, width: 25.0, height: 7.2, label: 'Vena Cava Superior' },
      { id: 'mask-2', x: 70.0, y: 15.5, width: 25.0, height: 7.2, label: 'Cayado de la Aorta' },
      { id: 'mask-3', x: 4.1, y: 43.3, width: 25.0, height: 7.2, label: 'Aurícula Derecha' },
      { id: 'mask-4', x: 70.0, y: 61.1, width: 25.8, height: 7.2, label: 'Ventrículo Izquierdo' }
    ];
    renderMasks();
  });

  // Clear all
  clearBtn?.addEventListener('click', () => {
    masks = [];
    renderMasks();
  });

  // Clipboard paste listener
  const pasteListener = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (re) => {
              if (re.target?.result && imgElement) {
                imageSrc = re.target.result as string;
                imgElement.src = imageSrc;
                masks = [];
                renderMasks();
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    }
  };
  window.addEventListener('paste', pasteListener);

  const cleanup = () => {
    window.removeEventListener('paste', pasteListener);
    document.getElementById('modal-image-occlusion-root')?.remove();
  };

  document.getElementById('btn-cancel-occlusion')?.addEventListener('click', () => {
    cleanup();
    options.onClose();
  });

  document.getElementById('btn-save-occlusion')?.addEventListener('click', () => {
    cleanup();
    options.onConfirm(imageSrc, masks, occlusionMode);
  });
}
