/**
 * Recorrido guiado del mapa: resalta, una a una, las zonas clave de la pantalla.
 * Se muestra solo la primera vez (y se puede repetir desde el menú «⋯ → Ver tutorial»).
 */

import './wizard.css';

export interface TourStep {
  title: string;
  text: string;
  /** Devuelve el rectángulo (en coordenadas del host) a resaltar */
  target: () => DOMRect | null;
  /** Se ejecuta antes de mostrar el paso (por ejemplo, seleccionar la idea central) */
  before?: () => void;
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export class MapTour {
  private layer: HTMLElement;
  private spot: HTMLElement;
  private pop: HTMLElement;
  private idx = 0;
  private done = false;
  private onResize = () => this.place();
  private onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      this.end();
    } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      this.next();
    }
  };

  constructor(private host: HTMLElement, private steps: TourStep[], private onEnd: () => void) {
    this.layer = document.createElement('div');
    this.layer.className = 'mmt-layer';
    this.layer.innerHTML = '<div class="mmt-spot"></div><div class="mmt-pop" role="dialog" aria-live="polite"></div>';
    this.spot = this.layer.querySelector('.mmt-spot') as HTMLElement;
    this.pop = this.layer.querySelector('.mmt-pop') as HTMLElement;
  }

  public start(): void {
    this.host.appendChild(this.layer);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKey, true);
    this.pop.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('[data-t]') as HTMLElement | null;
      if (!b) return;
      if (b.dataset.t === 'next') this.next();
      else this.end();
    });
    this.show();
  }

  private show(): void {
    const step = this.steps[this.idx];
    step.before?.();
    const last = this.idx === this.steps.length - 1;
    this.pop.innerHTML = `
      <h4>${esc(step.title)}</h4>
      <p>${esc(step.text)}</p>
      <div class="mmt-row">
        <div class="mmt-dots">${this.steps.map((_, i) => `<i class="${i === this.idx ? 'on' : ''}"></i>`).join('')}</div>
        <div style="display:flex;gap:8px;align-items:center">
          ${last ? '' : '<button class="mmt-skip" data-t="end">Omitir</button>'}
          <button class="mmt-btn" data-t="next">${last ? '¡A crear!' : 'Siguiente'}</button>
        </div>
      </div>`;
    // Da un instante para que el paso previo termine de dibujarse antes de medir
    window.setTimeout(() => this.place(), 60);
    this.place();
  }

  private place(): void {
    if (this.done) return;
    const step = this.steps[this.idx];
    const hostRect = this.host.getBoundingClientRect();
    const r = step.target();
    const W = hostRect.width;
    const H = hostRect.height;

    if (r) {
      const pad = 8;
      const x = r.left - hostRect.left - pad;
      const y = r.top - hostRect.top - pad;
      Object.assign(this.spot.style, { left: `${x}px`, top: `${y}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px`, opacity: '1' });
    } else {
      Object.assign(this.spot.style, { left: `${W / 2}px`, top: `${H / 2}px`, width: '0px', height: '0px', opacity: '1' });
    }

    const pw = this.pop.offsetWidth || 300;
    const ph = this.pop.offsetHeight || 150;
    let left = W / 2 - pw / 2;
    let top = H / 2 - ph / 2;
    if (r) {
      const cx = r.left - hostRect.left + r.width / 2;
      const below = r.bottom - hostRect.top + 16;
      const above = r.top - hostRect.top - ph - 16;
      left = Math.max(12, Math.min(W - pw - 12, cx - pw / 2));
      top = below + ph < H - 12 ? below : above > 12 ? above : Math.max(12, H - ph - 90);
    }
    this.pop.style.left = `${left}px`;
    this.pop.style.top = `${top}px`;
  }

  private next(): void {
    if (this.idx >= this.steps.length - 1) return this.end();
    this.idx++;
    this.show();
  }

  public end(): void {
    if (this.done) return;
    this.done = true;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKey, true);
    this.layer.remove();
    this.onEnd();
  }
}
