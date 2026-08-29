import type { OcclusionMask } from '../types/flashcard';
import { CLEAN_CANVAS_PLACEHOLDER } from '../services/demo-data';

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
    this.imageSrc = options.initialImage || CLEAN_CANVAS_PLACEHOLDER;
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
        <div class="occlusion-actions-bar" style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
          <label class="btn-apple-mini primary" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
            <span>📁 Cargar Foto / Diagrama</span>
            <input type="file" id="apple-io-file" accept="image/*" style="display:none;" />
          </label>
          <button type="button" class="btn-apple-mini" id="apple-io-clear" ${this.masks.length === 0 ? 'disabled' : ''} style="color:#f87171;">
            Limpiar Máscaras (${this.masks.length})
          </button>
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

      // Touch events for mobile / Capacitor
      layer.addEventListener('touchstart', (e: TouchEvent) => {
        if ((e.target as HTMLElement).classList.contains('rect-del')) return;
        if (e.touches && e.touches[0]) {
          e.preventDefault();
          const touch = e.touches[0];
          start(touch.clientX, touch.clientY);
        }
      }, { passive: false });

      window.addEventListener('touchmove', (e: TouchEvent) => {
        if (this.isDrawing && e.touches && e.touches[0]) {
          e.preventDefault();
          move(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: false });

      window.addEventListener('touchend', (e: TouchEvent) => {
        if (this.isDrawing && e.changedTouches && e.changedTouches[0]) {
          end(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }
      });
    }
  }
}
