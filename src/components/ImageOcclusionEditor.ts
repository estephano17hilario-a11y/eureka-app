import type { OcclusionMask } from '../types/flashcard';
import { HEART_ANATOMY_SVG_URI } from '../services/demo-data';

// Preset anatómico del cerebro en SVG
export const BRAIN_ANATOMY_SVG_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400" style="background:#000000; font-family:-apple-system, BlinkMacSystemFont, sans-serif;">
  <text x="300" y="36" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">LÓBULOS CEREBRALES</text>
  
  <!-- Silhouette -->
  <g transform="translate(150, 60)">
    <!-- Lóbulo Frontal -->
    <path d="M50,120 C30,70 100,20 180,20 L180,140 C120,140 80,160 50,120 Z" fill="#0a84ff" opacity="0.8"/>
    <!-- Lóbulo Parietal -->
    <path d="M180,20 C240,20 300,50 300,120 L180,140 Z" fill="#30d158" opacity="0.8"/>
    <!-- Lóbulo Occipital -->
    <path d="M300,120 C320,160 300,220 250,230 L180,140 Z" fill="#ff9f0a" opacity="0.8"/>
    <!-- Lóbulo Temporal -->
    <path d="M80,150 C100,200 200,220 250,230 L180,140 C140,140 100,150 80,150 Z" fill="#bf5af2" opacity="0.8"/>
    <!-- Cerebelo -->
    <path d="M210,230 C240,240 250,280 200,280 C170,280 160,250 210,230 Z" fill="#ff453a" opacity="0.8"/>
  </g>

  <!-- Labels -->
  <rect x="30" y="80" width="130" height="28" rx="6" fill="#1c1c1e" stroke="#0a84ff" stroke-width="1.5"/>
  <text x="95" y="99" fill="#0a84ff" font-size="12" font-weight="600" text-anchor="middle">Lóbulo Frontal</text>

  <rect x="440" y="80" width="130" height="28" rx="6" fill="#1c1c1e" stroke="#30d158" stroke-width="1.5"/>
  <text x="505" y="99" fill="#30d158" font-size="12" font-weight="600" text-anchor="middle">Lóbulo Parietal</text>

  <rect x="440" y="190" width="130" height="28" rx="6" fill="#1c1c1e" stroke="#ff9f0a" stroke-width="1.5"/>
  <text x="505" y="209" fill="#ff9f0a" font-size="12" font-weight="600" text-anchor="middle">Lóbulo Occipital</text>

  <rect x="30" y="220" width="130" height="28" rx="6" fill="#1c1c1e" stroke="#bf5af2" stroke-width="1.5"/>
  <text x="95" y="239" fill="#bf5af2" font-size="12" font-weight="600" text-anchor="middle">Lóbulo Temporal</text>
</svg>
`)}`;

export interface ImageOcclusionEditorOptions {
  containerId: string;
  initialImage?: string;
  initialMasks?: OcclusionMask[];
  onChange?: (imageData: string, masks: OcclusionMask[]) => void;
}

export class ImageOcclusionEditor {
  private container: HTMLElement | null = null;
  private imageSrc: string = '';
  private masks: OcclusionMask[] = [];
  private isDrawing = false;
  private startX = 0;
  private startY = 0;
  private currentRect: HTMLDivElement | null = null;
  private stageElement: HTMLDivElement | null = null;
  private onChangeCallback?: (imageData: string, masks: OcclusionMask[]) => void;

  constructor(options: ImageOcclusionEditorOptions) {
    this.container = document.getElementById(options.containerId);
    this.imageSrc = options.initialImage || HEART_ANATOMY_SVG_URI;
    this.masks = options.initialMasks ? [...options.initialMasks] : [];
    this.onChangeCallback = options.onChange;
    this.render();
  }

  public getMasks(): OcclusionMask[] {
    return this.masks;
  }

  public getImage(): string {
    return this.imageSrc;
  }

  public setImage(src: string): void {
    this.imageSrc = src;
    this.masks = [];
    this.render();
    this.notify();
  }

  private notify(): void {
    if (this.onChangeCallback) {
      this.onChangeCallback(this.imageSrc, this.masks);
    }
  }

  public render(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="occlusion-editor-box">
        <div class="occlusion-actions-bar">
          <label class="btn-apple-mini primary" style="cursor:pointer;">
            <span>📁 Seleccionar Imagen</span>
            <input type="file" id="apple-io-file" accept="image/*" style="display:none;" />
          </label>
          <button type="button" class="btn-apple-mini" id="apple-io-clear" ${this.masks.length === 0 ? 'disabled' : ''}>
            Limpiar (${this.masks.length})
          </button>

          <div class="occlusion-presets-group">
            <span>Plantillas:</span>
            <button type="button" class="btn-preset-chip" id="preset-corazon">🫀 Corazón</button>
            <button type="button" class="btn-preset-chip" id="preset-cerebro">🧠 Cerebro</button>
          </div>
        </div>

        <div class="occlusion-canvas-stage" id="apple-io-stage">
          <img src="${this.imageSrc}" id="apple-io-img" alt="Diagrama de Oclusión" draggable="false" />
          <div class="occlusion-mask-layer" id="apple-io-layer">
            ${this.renderMasksHtml()}
          </div>
        </div>
        <div style="font-size:0.75rem; color:var(--ios-secondary-label); margin-top:8px; text-align:center;">
          Arrastra sobre la imagen para tapar una etiqueta o texto. (También puedes pegar con Ctrl+V).
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderMasksHtml(): string {
    return this.masks
      .map(
        (m, idx) => `
      <div class="occlusion-rect placed" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%;" data-mask-id="${m.id}">
        <span class="rect-num">#${idx + 1}</span>
        <button type="button" class="rect-del" data-del-id="${m.id}">×</button>
      </div>
    `
      )
      .join('');
  }

  private bindEvents(): void {
    const fileInput = this.container?.querySelector('#apple-io-file') as HTMLInputElement | null;
    fileInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          if (re.target?.result) {
            this.setImage(re.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Preset buttons
    this.container?.querySelector('#preset-corazon')?.addEventListener('click', () => {
      this.setImage(HEART_ANATOMY_SVG_URI);
    });
    this.container?.querySelector('#preset-cerebro')?.addEventListener('click', () => {
      this.setImage(BRAIN_ANATOMY_SVG_URI);
    });

    // Clear all
    this.container?.querySelector('#apple-io-clear')?.addEventListener('click', () => {
      this.masks = [];
      this.render();
      this.notify();
    });

    // Delete single mask
    this.container?.querySelectorAll('.rect-del').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (btn as HTMLElement).dataset.delId;
        this.masks = this.masks.filter((m) => m.id !== id);
        this.render();
        this.notify();
      });
    });

    // Clipboard paste listener
    const pasteHandler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onload = (re) => {
                if (re.target?.result) {
                  this.setImage(re.target.result as string);
                }
              };
              reader.readAsDataURL(blob);
            }
          }
        }
      }
    };
    window.addEventListener('paste', pasteHandler);

    // Drawing
    this.stageElement = this.container?.querySelector('#apple-io-stage') as HTMLDivElement | null;
    const layer = this.container?.querySelector('#apple-io-layer') as HTMLDivElement | null;

    if (this.stageElement && layer) {
      const stage = this.stageElement;

      const getCoords = (clientX: number, clientY: number) => {
        const rect = stage.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
        return { x, y };
      };

      const start = (clientX: number, clientY: number) => {
        const coords = getCoords(clientX, clientY);
        this.isDrawing = true;
        this.startX = coords.x;
        this.startY = coords.y;

        this.currentRect = document.createElement('div');
        this.currentRect.className = 'occlusion-rect drawing';
        this.currentRect.style.left = `${this.startX}%`;
        this.currentRect.style.top = `${this.startY}%`;
        this.currentRect.style.width = '0%';
        this.currentRect.style.height = '0%';
        layer.appendChild(this.currentRect);
      };

      const move = (clientX: number, clientY: number) => {
        if (!this.isDrawing || !this.currentRect) return;
        const coords = getCoords(clientX, clientY);
        const x = Math.min(this.startX, coords.x);
        const y = Math.min(this.startY, coords.y);
        const width = Math.abs(coords.x - this.startX);
        const height = Math.abs(coords.y - this.startY);

        this.currentRect.style.left = `${x}%`;
        this.currentRect.style.top = `${y}%`;
        this.currentRect.style.width = `${width}%`;
        this.currentRect.style.height = `${height}%`;
      };

      const end = (clientX: number, clientY: number) => {
        if (!this.isDrawing || !this.currentRect) return;
        this.isDrawing = false;
        const coords = getCoords(clientX, clientY);
        const x = Math.min(this.startX, coords.x);
        const y = Math.min(this.startY, coords.y);
        const width = Math.abs(coords.x - this.startX);
        const height = Math.abs(coords.y - this.startY);

        this.currentRect.remove();
        this.currentRect = null;

        if (width > 2 && height > 2) {
          const newMask: OcclusionMask = {
            id: `mask-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
            x: Number(x.toFixed(2)),
            y: Number(y.toFixed(2)),
            width: Number(width.toFixed(2)),
            height: Number(height.toFixed(2))
          };
          this.masks.push(newMask);
          this.render();
          this.notify();
        }
      };

      layer.addEventListener('mousedown', (e) => {
        if ((e.target as HTMLElement).classList.contains('rect-del')) return;
        start(e.clientX, e.clientY);
      });
      window.addEventListener('mousemove', (e) => {
        if (this.isDrawing) move(e.clientX, e.clientY);
      });
      window.addEventListener('mouseup', (e) => {
        if (this.isDrawing) end(e.clientX, e.clientY);
      });

      // Touch events for mobile
      layer.addEventListener('touchstart', (e) => {
        if ((e.target as HTMLElement).classList.contains('rect-del')) return;
        const touch = e.touches[0];
        start(touch.clientX, touch.clientY);
      });
      window.addEventListener('touchmove', (e) => {
        if (this.isDrawing && e.touches[0]) move(e.touches[0].clientX, e.touches[0].clientY);
      });
      window.addEventListener('touchend', (e) => {
        if (this.isDrawing && e.changedTouches[0]) end(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      });
    }
  }
}
