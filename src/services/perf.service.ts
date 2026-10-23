/**
 * Rendimiento adaptable.
 * Detecta equipos modestos (móviles, portátiles de gama baja, poca memoria, ahorro de datos) y activa el
 * "modo ligero": mismos colores, tipografías y composición, pero sin desenfoques de fondo ni animaciones
 * continuas y con menos trabajo por fotograma. El usuario puede forzar Automático / Ligero / Completo.
 */

export type PerfMode = 'auto' | 'lite' | 'full';

const KEY = 'eureka_perf_mode_v1';

class PerfService {
  private mode: PerfMode = 'auto';
  private lite = false;
  private autoLite = false;
  private listeners: Array<(lite: boolean) => void> = [];
  private probed = false;

  public init(): void {
    try {
      const saved = localStorage.getItem(KEY) as PerfMode | null;
      if (saved === 'lite' || saved === 'full' || saved === 'auto') this.mode = saved;
    } catch {
      /* ignore */
    }
    this.autoLite = this.detect();
    this.apply();
    if (this.mode === 'auto' && !this.autoLite) this.probeFrameRate();
  }

  /** ¿Es un equipo que conviene aligerar? (sin medir todavía el rendimiento real) */
  private detect(): boolean {
    try {
      const nav = navigator as any;
      const mem: number | undefined = nav.deviceMemory;
      const cores: number | undefined = nav.hardwareConcurrency;
      const saveData = Boolean(nav.connection?.saveData);
      const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
      const small = Math.min(window.screen?.width || 9999, window.screen?.height || 9999) <= 820;
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      if (reduced || saveData) return true;
      if (typeof mem === 'number' && mem <= 4) return true;
      if (typeof cores === 'number' && cores <= 4) return true;
      if (coarse && small) return true; // teléfonos
    } catch {
      /* ignore */
    }
    return false;
  }

  /**
   * Prueba corta de fotogramas por segundo justo tras arrancar: si el equipo no llega a ~40 fps
   * con la interfaz en reposo, se pasa a modo ligero automáticamente.
   */
  private probeFrameRate(): void {
    if (this.probed || typeof requestAnimationFrame === 'undefined') return;
    this.probed = true;
    window.setTimeout(() => {
      const frames: number[] = [];
      let last = performance.now();
      const start = last;
      const tick = (t: number) => {
        frames.push(t - last);
        last = t;
        if (t - start < 900) requestAnimationFrame(tick);
        else {
          const sorted = frames.slice(2).sort((a, b) => a - b);
          if (sorted.length < 8) return;
          // Se mira el percentil 75: un par de tirones sueltos no cuentan
          const p75 = sorted[Math.floor(sorted.length * 0.75)];
          if (p75 > 26 && this.mode === 'auto') {
            this.autoLite = true;
            this.apply();
          }
        }
      };
      requestAnimationFrame(tick);
    }, 2500);
  }

  private apply(): void {
    const next = this.mode === 'lite' ? true : this.mode === 'full' ? false : this.autoLite;
    const changed = next !== this.lite;
    this.lite = next;
    document.documentElement.dataset.perf = next ? 'lite' : 'full';
    if (changed) this.listeners.forEach((fn) => fn(next));
  }

  public isLite(): boolean {
    return this.lite;
  }

  public getMode(): PerfMode {
    return this.mode;
  }

  public setMode(mode: PerfMode): void {
    this.mode = mode;
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      /* ignore */
    }
    this.apply();
  }

  public onChange(fn: (lite: boolean) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }
}

export const perfService = new PerfService();
