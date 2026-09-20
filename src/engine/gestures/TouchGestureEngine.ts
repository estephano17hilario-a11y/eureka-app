/**
 * TouchGestureEngine.ts
 *
 * Pipeline Cinemático de Gestos Multitáctiles a 60 FPS para Capacitor (iOS WKWebView y Android WebView).
 * Provee transformación bifactorial concurrente (Pinch-to-Zoom + Pan), preservación de coordenadas
 * del mundo bajo el centroide, aceleración por GPU 3D y desaceleración inercial con fricción viscosa.
 */

export interface GestureTransformState {
  x: number;
  y: number;
  scale: number;
}

export interface TouchGestureOptions {
  minScale?: number;
  maxScale?: number;
  friction?: number;         // Coeficiente de fricción viscosa inercial (def: 0.94)
  velocityThreshold?: number;// Umbral para detener el momentum (def: 0.1 px/frame)
  onTransform?: (state: GestureTransformState) => void;
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
}

export class TouchGestureEngine {
  private element: HTMLElement;
  private options: Required<TouchGestureOptions>;

  // Estado cinemático actual
  private state: GestureTransformState = {
    x: 0,
    y: 0,
    scale: 1
  };

  // Rastreo de toques
  private activeTouches: Map<number, { x: number; y: number; time: number }> = new Map();
  private prevDistance: number = 0;
  private prevCentroid: { x: number; y: number } = { x: 0, y: 0 };
  private isInteracting: boolean = false;

  // Variables para momentum / inercia
  private lastMoveTime: number = 0;
  private velocity: { x: number; y: number } = { x: 0, y: 0 };
  private momentumRafId: number | null = null;

  // Manejadores enlazados para addEventListener / removeEventListener
  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchMove: (e: TouchEvent) => void;
  private boundTouchEnd: (e: TouchEvent) => void;
  private boundTouchCancel: (e: TouchEvent) => void;

  constructor(element: HTMLElement, options: TouchGestureOptions = {}) {
    this.element = element;
    this.options = {
      minScale: options.minScale ?? 0.2,
      maxScale: options.maxScale ?? 3.5,
      friction: options.friction ?? 0.94,
      velocityThreshold: options.velocityThreshold ?? 0.1,
      onTransform: options.onTransform ?? (() => {}),
      onGestureStart: options.onGestureStart ?? (() => {}),
      onGestureEnd: options.onGestureEnd ?? (() => {})
    };

    // Configuración obligatoria del contenedor para anular elásticos del navegador
    this.configureContainerStyles();

    // Enlazar handlers
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
    this.boundTouchCancel = this.handleTouchCancel.bind(this);

    this.bindEvents();
  }

  /**
   * Configura las propiedades CSS restrictivas para WebView móvil.
   */
  private configureContainerStyles(): void {
    this.element.style.touchAction = 'none';
    this.element.style.overscrollBehavior = 'none';
    this.element.style.webkitUserSelect = 'none';
    this.element.style.userSelect = 'none';
  }

  /**
   * Registra los controladores de eventos con { passive: false } estricto.
   */
  private bindEvents(): void {
    this.element.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.boundTouchEnd, { passive: false });
    this.element.addEventListener('touchcancel', this.boundTouchCancel, { passive: false });
  }

  /**
   * Desvincula los controladores de eventos y cancela animaciones activas.
   */
  public destroy(): void {
    this.cancelMomentum();
    this.element.removeEventListener('touchstart', this.boundTouchStart);
    this.element.removeEventListener('touchmove', this.boundTouchMove);
    this.element.removeEventListener('touchend', this.boundTouchEnd);
    this.element.removeEventListener('touchcancel', this.boundTouchCancel);
    this.activeTouches.clear();
  }

  /**
   * Sincroniza el estado inicial de traslación y escala desde el mapa mental.
   */
  public setTransform(x: number, y: number, scale: number): void {
    this.state.x = x;
    this.state.y = y;
    this.state.scale = Math.min(Math.max(scale, this.options.minScale), this.options.maxScale);
  }

  /**
   * Obtiene una copia del estado de transformación actual.
   */
  public getTransform(): GestureTransformState {
    return { ...this.state };
  }

  /**
   * Manejador de touchstart: intercepta el toque y detiene la inercia anterior.
   */
  private handleTouchStart(e: TouchEvent): void {
    // Síncronamente prevenir desplazamiento nativo o rebotes en WKWebView / Android WebView
    e.preventDefault();

    this.cancelMomentum();
    const now = performance.now();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      this.activeTouches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
        time: now
      });
    }

    if (this.activeTouches.size === 1) {
      const touch = Array.from(this.activeTouches.values())[0];
      this.prevCentroid = { x: touch.x, y: touch.y };
      this.velocity = { x: 0, y: 0 };
      this.lastMoveTime = now;
      this.isInteracting = true;
      this.options.onGestureStart();
    } else if (this.activeTouches.size >= 2) {
      const touches = Array.from(this.activeTouches.values());
      const p1 = touches[0];
      const p2 = touches[1];

      this.prevDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      this.prevCentroid = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
      };
      this.velocity = { x: 0, y: 0 };
      this.lastMoveTime = now;
      this.isInteracting = true;
    }
  }

  /**
   * Manejador de touchmove: calcula pan y pinch-to-zoom preservando el foco del centroide.
   */
  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (!this.isInteracting) return;

    const now = performance.now();
    const dt = Math.max(now - this.lastMoveTime, 1);

    // Actualizar las posiciones activas
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (this.activeTouches.has(touch.identifier)) {
        this.activeTouches.set(touch.identifier, {
          x: touch.clientX,
          y: touch.clientY,
          time: now
        });
      }
    }

    if (this.activeTouches.size === 1) {
      // 1. Pan de un solo dedo con cálculo de velocidad
      const current = Array.from(this.activeTouches.values())[0];
      const dx = current.x - this.prevCentroid.x;
      const dy = current.y - this.prevCentroid.y;

      this.state.x += dx;
      this.state.y += dy;

      // Actualizar velocidad suavizada para momentum
      this.velocity = {
        x: (dx / dt) * 16.67,
        y: (dy / dt) * 16.67
      };

      this.prevCentroid = { x: current.x, y: current.y };
      this.lastMoveTime = now;

      this.applyAndNotify();
    } else if (this.activeTouches.size >= 2) {
      // 2. Pinch-to-zoom y Pan simultáneos
      const touches = Array.from(this.activeTouches.values());
      const p1 = touches[0];
      const p2 = touches[1];

      // Centroide actual
      const currentCentroid = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
      };

      // Desplazamiento del centroide (delta C)
      const deltaCx = currentCentroid.x - this.prevCentroid.x;
      const deltaCy = currentCentroid.y - this.prevCentroid.y;

      // Distancia interdigital actual
      const currentDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      if (this.prevDistance > 0 && currentDistance > 0) {
        // Factor de escala local s = D_t / D_{t-1}
        let s = currentDistance / this.prevDistance;

        const prospectiveScale = this.state.scale * s;
        // Acotar escala dentro de límites
        if (prospectiveScale < this.options.minScale) {
          s = this.options.minScale / this.state.scale;
        } else if (prospectiveScale > this.options.maxScale) {
          s = this.options.maxScale / this.state.scale;
        }

        // Aplicación del invariante bajo el centroide:
        // T_x' = C_x - s * (C_x - T_x) + delta C_x
        // T_y' = C_y - s * (C_y - T_y) + delta C_y
        this.state.x = currentCentroid.x - s * (currentCentroid.x - this.state.x) + deltaCx;
        this.state.y = currentCentroid.y - s * (currentCentroid.y - this.state.y) + deltaCy;
        this.state.scale = this.state.scale * s;

        // Velocidad combinada
        this.velocity = {
          x: (deltaCx / dt) * 16.67,
          y: (deltaCy / dt) * 16.67
        };
      }

      this.prevDistance = currentDistance;
      this.prevCentroid = currentCentroid;
      this.lastMoveTime = now;

      this.applyAndNotify();
    }
  }

  /**
   * Manejador de touchend: limpia toques y activa el momentum si hay velocidad residual.
   */
  private handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      this.activeTouches.delete(e.changedTouches[i].identifier);
    }

    if (this.activeTouches.size === 1) {
      // Queda un dedo: reajustar centroide para evitar saltos
      const remaining = Array.from(this.activeTouches.values())[0];
      this.prevCentroid = { x: remaining.x, y: remaining.y };
      this.prevDistance = 0;
      this.lastMoveTime = performance.now();
    } else if (this.activeTouches.size === 0) {
      this.isInteracting = false;
      this.prevDistance = 0;
      this.startMomentum();
      this.options.onGestureEnd();
    }
  }

  /**
   * Manejador de touchcancel: reseteo de seguridad.
   */
  private handleTouchCancel(e: TouchEvent): void {
    this.handleTouchEnd(e);
  }

  /**
   * Aplica la actualización visual por GPU y dispara el callback registrado.
   */
  private applyAndNotify(): void {
    this.options.onTransform({ ...this.state });
  }

  /**
   * Inicia el bucle de inercia con decaimiento cinético exponencial por fricción viscosa.
   */
  private startMomentum(): void {
    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    if (speed < this.options.velocityThreshold) {
      this.velocity = { x: 0, y: 0 };
      return;
    }

    const step = () => {
      // Fricción exponencial por fotograma: v_{t+1} = v_t * gamma
      this.velocity.x *= this.options.friction;
      this.velocity.y *= this.options.friction;

      this.state.x += this.velocity.x;
      this.state.y += this.velocity.y;

      this.applyAndNotify();

      const currentSpeed = Math.hypot(this.velocity.x, this.velocity.y);
      if (currentSpeed > this.options.velocityThreshold) {
        this.momentumRafId = requestAnimationFrame(step);
      } else {
        this.cancelMomentum();
      }
    };

    this.momentumRafId = requestAnimationFrame(step);
  }

  /**
   * Cancela la animación de inercia activa.
   */
  private cancelMomentum(): void {
    if (this.momentumRafId !== null) {
      cancelAnimationFrame(this.momentumRafId);
      this.momentumRafId = null;
    }
    this.velocity = { x: 0, y: 0 };
  }
}
