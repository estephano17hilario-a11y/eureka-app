import katex from 'katex';
import 'katex/dist/contrib/mhchem.js';
import 'katex/dist/katex.min.css';
import 'mathlive';
import 'mathlive/static.css';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { getComputeEngine, cleanLatex, extractContextVariablesFromTree } from '../services/math-engine.service';
import { openUniversalSymbolSelector } from './UniversalSymbolSelectorDrawer';

export interface MathEditorDrawerOptions {
  mindMap: any;
  node: any;
  initialLatex?: string;
  onSave: (katexHtml: string, rawLatex: string) => void;
  onClose?: () => void;
}

/**
 * MathEditorDrawer - Arquitectura Definitiva de Edición Matemática Táctil (Estilo Photomath / Desmos)
 * Optimizado para 60 FPS en WebViews móviles de gama ultra-baja (CapacitorJS)
 * - Canvas congelado durante la edición
 * - MathLive <math-field> con mathVirtualKeyboardPolicy="manual"
 * - Teclado táctil dedicado con botones >= 48x48px y touch-action: manipulation
 * - Motor simbólico @cortex-js/compute-engine en tiempo real
 * - Renderizado estático final en KaTeX
 * - Flat 2D sin blur ni box-shadows pesadas
 */
export class MathEditorDrawer {
  private options: MathEditorDrawerOptions;
  private drawerOverlay: HTMLElement | null = null;
  private mathFieldEl: any = null; // MathfieldElement (<math-field>)
  private calcResultChip: HTMLElement | null = null;
  private evaluatedLatexResult: string | null = null;
  private currentTab: 'calc' | 'algebra' | 'calculo' | 'griego' = 'calc';
  private contextScope: Record<string, number> = {};

  constructor(options: MathEditorDrawerOptions) {
    this.options = options;
    this.contextScope = extractContextVariablesFromTree(options.node);
  }

  /**
   * Dispara vibración háptica de 10ms con fallback seguro
   */
  private triggerHaptic(): void {
    try {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    } catch {}
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch {}
  }

  /**
   * Congela el lienzo del mapa mental en GPU para garantizar 60 FPS dedicados al drawer
   */
  private freezeCanvas(freeze: boolean): void {
    const canvasEl = document.getElementById('mindmap-render-canvas');
    if (canvasEl) {
      if (freeze) {
        canvasEl.style.pointerEvents = 'none';
        canvasEl.style.userSelect = 'none';
        canvasEl.setAttribute('aria-hidden', 'true');
      } else {
        canvasEl.style.pointerEvents = '';
        canvasEl.style.userSelect = '';
        canvasEl.removeAttribute('aria-hidden');
      }
    }
  }

  /**
   * Abre y monta el drawer inferior estilo Vaul
   */
  public open(): void {
    const existing = document.getElementById('vaul-math-drawer-overlay');
    if (existing) existing.remove();

    this.freezeCanvas(true);
    this.triggerHaptic();

    const overlay = document.createElement('div');
    overlay.id = 'vaul-math-drawer-overlay';
    overlay.className = 'vaul-math-drawer-overlay';

    const scopeKeys = Object.keys(this.contextScope);
    const scopeHtml =
      scopeKeys.length > 0
        ? `<div class="vaul-scope-banner">
            <span>🌳 Variables heredadas:</span>
            <strong>${scopeKeys.map((k) => `${k} = ${this.contextScope[k]}`).join(', ')}</strong>
           </div>`
        : '';

    overlay.innerHTML = `
      <div class="vaul-math-drawer-sheet" id="vaul-math-drawer-sheet">
        <!-- Manija táctil de arrastre tipo iOS/Vaul -->
        <div class="vaul-drag-handle-bar">
          <div class="vaul-drag-handle"></div>
        </div>

        <!-- Header del Drawer -->
        <header class="vaul-drawer-header">
          <div class="vaul-header-left">
            <span class="vaul-header-title">Editor Matemático</span>
            <span class="vaul-header-badge">Photomath Engine</span>
          </div>
          <div class="vaul-header-right">
            <button type="button" class="vaul-text-btn" id="btn-vaul-catalog" title="Catálogo Científico Universal de Símbolos">
              🌐 Catálogo (100%)
            </button>
            <button type="button" class="vaul-btn-close" id="btn-vaul-close" aria-label="Cerrar">✕</button>
          </div>
        </header>

        ${scopeHtml}

        <!-- Contenedor del Campo Interactivo MathLive <math-field> -->
        <div class="vaul-mathfield-wrapper">
          <div class="vaul-mathfield-container" id="vaul-mathfield-mount">
            <!-- Inyección del elemento <math-field> -->
          </div>
          <button type="button" class="vaul-clear-btn" id="btn-vaul-clear" title="Limpiar fórmula">✕</button>
        </div>

        <!-- Barra de Evaluación Inteligente en Tiempo Real (CortexJS ComputeEngine) -->
        <div class="vaul-evaluation-bar" id="vaul-evaluation-bar" style="display: none;">
          <div class="vaul-eval-content">
            <span class="vaul-eval-icon">⚡</span>
            <span class="vaul-eval-text" id="vaul-eval-result-text"></span>
          </div>
          <button type="button" class="vaul-insert-result-btn" id="btn-vaul-insert-result">
            + Insertar Resultado
          </button>
        </div>

        <!-- Teclado Matemático Táctil Dedicado (Botones grandes 48x48px) -->
        <div class="vaul-keypad-section">
          <!-- Selector de Categorías / Pestañas del Teclado -->
          <div class="vaul-keypad-tabs">
            <button type="button" class="vaul-tab-btn active" data-tab="calc">🔢 Calculadora</button>
            <button type="button" class="vaul-tab-btn" data-tab="algebra">📐 Álgebra</button>
            <button type="button" class="vaul-tab-btn" data-tab="calculo">📈 Cálculo</button>
            <button type="button" class="vaul-tab-btn" data-tab="griego">🇬🇷 Griego</button>
            <button type="button" class="vaul-tab-btn vaul-tab-all-symbols" id="btn-tab-all-symbols" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">🌐 Símbolos (100%)</button>
          </div>

          <!-- Matriz de Teclas Táctiles -->
          <div class="vaul-keys-grid" id="vaul-keys-mount">
            <!-- Renderizado dinámico -->
          </div>
        </div>

        <!-- Barra de Acciones de Confirmación -->
        <footer class="vaul-drawer-footer">
          <button type="button" class="vaul-footer-btn vaul-btn-cancel" id="btn-vaul-cancel">
            Cancelar
          </button>
          <button type="button" class="vaul-footer-btn vaul-btn-save" id="btn-vaul-save">
            Guardar en Nodo ✓
          </button>
        </footer>
      </div>
    `;

    document.body.appendChild(overlay);
    this.drawerOverlay = overlay;
    this.calcResultChip = overlay.querySelector('#vaul-evaluation-bar');

    // 1. Montar <math-field> configurado para gama ultra-baja y sin teclado QWERTY del SO
    this.mountMathField();

    // 2. Montar teclado táctil y eventos
    this.renderKeypad(this.currentTab);
    this.bindEvents();

    // 3. Ejecutar primera evaluación
    this.runComputeEngineEvaluation();
  }

  /**
   * Monta el elemento web component `<math-field>` de MathLive
   */
  private mountMathField(): void {
    const mount = this.drawerOverlay?.querySelector('#vaul-mathfield-mount');
    if (!mount) return;

    // Crear la instancia del elemento <math-field>
    const mf = document.createElement('math-field') as any;
    mf.id = 'photomath-math-field-instance';
    mf.className = 'vaul-interactive-mathfield';

    // Permitir selección y posicionamiento táctil directo del cursor sobre cualquier número o símbolo
    mf.style.userSelect = 'text';
    (mf.style as any).webkitUserSelect = 'text';

    // OBLIGATORIO: Bloquear el teclado virtual nativo del sistema
    mf.mathVirtualKeyboardPolicy = 'manual';
    mf.setAttribute('math-virtual-keyboard-policy', 'manual');

    // Configuración ergonómica de MathLive
    if (typeof mf.setOptions === 'function') {
      mf.setOptions({
        mathVirtualKeyboardPolicy: 'manual',
        smartFence: true,
        smartSuperscript: true,
        removeExtraneousParentheses: false
      });
    }

    // Extraer LaTeX inicial limpio
    let raw = this.options.initialLatex || '';
    // Quitar tags KaTeX o HTML si venían incrustados
    raw = cleanLatex(raw);
    if (raw) {
      mf.setValue(raw);
    }

    mount.appendChild(mf);
    this.mathFieldEl = mf;

    // Foco inmediato
    setTimeout(() => {
      try {
        mf.focus();
      } catch {}
    }, 60);

    // Escuchar entrada en tiempo real para el motor de cálculo
    mf.addEventListener('input', () => {
      this.runComputeEngineEvaluation();
    });
  }

  /**
   * Ejecuta la evaluación simbólica y aritmética con @cortex-js/compute-engine
   */
  private runComputeEngineEvaluation(): void {
    if (!this.mathFieldEl || !this.calcResultChip) return;
    const latex = (this.mathFieldEl.getValue ? this.mathFieldEl.getValue() : this.mathFieldEl.value || '').trim();

    if (!latex) {
      this.calcResultChip.style.display = 'none';
      this.evaluatedLatexResult = null;
      return;
    }

    const engine = getComputeEngine();
    const resultTextEl = this.drawerOverlay?.querySelector('#vaul-eval-result-text');

    try {
      let clean = cleanLatex(latex);
      // Si termina en '=', quitarlo para la evaluación
      let hadEqual = clean.endsWith('=');
      if (hadEqual) {
        clean = clean.slice(0, -1).trim();
      }

      // Si no hay nada evaluable (solo variables no definidas)
      if (!clean) {
        this.calcResultChip.style.display = 'none';
        return;
      }

      if (engine) {
        // Asignar variables del contexto del árbol si existen
        Object.keys(this.contextScope).forEach((k) => {
          try {
            engine.assign(k, this.contextScope[k]);
          } catch {}
        });

        const parsed = engine.parse(clean);
        const evaluated = parsed.evaluate();
        const numVal = parsed.N();
        const simplified = parsed.simplify();

        let exact = evaluated?.latex || '';
        let decimal = numVal?.latex || '';
        let simp = simplified?.latex || '';

        // Determinar si hay un resultado válido distinto a la entrada idéntica
        if (exact && exact !== clean) {
          this.evaluatedLatexResult = exact;
          let label = `= ${exact}`;
          if (decimal && decimal !== exact) {
            label += ` (${decimal})`;
          } else if (simp && simp !== exact) {
            label += ` [${simp}]`;
          }

          if (resultTextEl) {
            resultTextEl.innerHTML = katex.renderToString(label, { throwOnError: false });
          }
          this.calcResultChip.style.display = 'flex';
          return;
        } else if (decimal && decimal !== clean && !isNaN(parseFloat(decimal))) {
          this.evaluatedLatexResult = decimal;
          if (resultTextEl) {
            resultTextEl.innerHTML = katex.renderToString(`= ${decimal}`, { throwOnError: false });
          }
          this.calcResultChip.style.display = 'flex';
          return;
        }
      }
    } catch (e) {
      console.warn('[MathEditorDrawer] Error evaluating with ComputeEngine:', e);
    }

    // Fallback aritmético liviano si la expresión es aritmética simple (ej. fractions, sqrt)
    try {
      let jsCode = latex
        .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
        .replace(/\\times/g, '*')
        .replace(/\\div/g, '/')
        .replace(/\\cdot/g, '*')
        .replace(/\\sqrt\{([^{}]+)\}/g, 'Math.sqrt($1)')
        .replace(/\^\{([^{}]+)\}/g, '**($1)')
        .replace(/\^(\d+)/g, '**$1');

      if (/^[0-9+\-*/().\sMathsqrt]+$/.test(jsCode)) {
        // eslint-disable-next-line no-new-func
        const res = Function(`'use strict'; return (${jsCode})`)();
        if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
          const rounded = Math.round(res * 10000) / 10000;
          this.evaluatedLatexResult = String(rounded);
          if (resultTextEl) {
            resultTextEl.innerHTML = katex.renderToString(`= ${rounded}`, { throwOnError: false });
          }
          this.calcResultChip.style.display = 'flex';
          return;
        }
      }
    } catch {}

    this.calcResultChip.style.display = 'none';
    this.evaluatedLatexResult = null;
  }

  /**
   * Renderiza el teclado táctil dedicado con botones grandes de mínimo 48x48px
   */
  private renderKeypad(tab: 'calc' | 'algebra' | 'calculo' | 'griego'): void {
    const mount = this.drawerOverlay?.querySelector('#vaul-keys-mount');
    if (!mount) return;

    let keysHtml = '';

    if (tab === 'calc') {
      // Teclado Calculadora Principal Photomath
      keysHtml = `
        <!-- Barra Rápida Superior de Operaciones y Estructuras -->
        <div class="vaul-keypad-quick-bar">
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\frac{#@}{#?}"]'><span><sup>a</sup>/<sub>b</sub></span></button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "^{2}"]'><span>x²</span></button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "^{#?}"]'><span>xⁿ</span></button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\sqrt{#?}"]'><span>√x</span></button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\sum_{#?}^{#?}"]'><span>∑</span></button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "(#?)"]'><span>( )</span></button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\pi"]'><span>π</span></button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "|#?|"]'><span>|x|</span></button>
        </div>

        <div class="vaul-keypad-grid-calc">
          <!-- Fila 1 -->
          <button type="button" class="vaul-key key-num" data-cmd='["insert", "7"]'>7</button>
          <button type="button" class="vaul-key key-num" data-cmd='["insert", "8"]'>8</button>
          <button type="button" class="vaul-key key-num" data-cmd='["insert", "9"]'>9</button>
          <button type="button" class="vaul-key key-op" data-cmd='["insert", "\\\\div"]'>÷</button>
          <button type="button" class="vaul-key key-action" data-cmd='["deleteBackward"]'>⌫</button>

          <!-- Fila 2: 4, 5, 6, ×, Flecha Arriba (Numerador / Límite Superior) -->
          <button type="button" class="vaul-key key-num" data-cmd='["insert", "4"]'>4</button>
          <button type="button" class="vaul-key key-num" data-cmd='["insert", "5"]'>5</button>
          <button type="button" class="vaul-key key-num" data-cmd='["insert", "6"]'>6</button>
          <button type="button" class="vaul-key key-op" data-cmd='["insert", "\\\\times"]'>×</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveUp"]' title="Subir a numerador o límite superior">↑</button>

          <!-- Fila 3: 1, 2, 3, −, Flecha Abajo (Denominador / Límite Inferior) -->
          <button type="button" class="vaul-key key-num" data-cmd='["insert", "1"]'>1</button>
          <button type="button" class="vaul-key key-num" data-cmd='["insert", "2"]'>2</button>
          <button type="button" class="vaul-key key-num" data-cmd='["insert", "3"]'>3</button>
          <button type="button" class="vaul-key key-op" data-cmd='["insert", "-"]'>−</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveDown"]' title="Bajar a denominador o límite inferior">↓</button>

          <!-- Fila 4: 0, ., Flecha Izquierda, Flecha Derecha, + -->
          <button type="button" class="vaul-key key-num" data-cmd='["insert", "0"]'>0</button>
          <button type="button" class="vaul-key key-num" data-cmd='["insert", "."]'>.</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveToPreviousChar"]' title="Mover a la izquierda">←</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveToNextChar"]' title="Mover a la derecha">→</button>
          <button type="button" class="vaul-key key-op" data-cmd='["insert", "+"]'>+</button>

          <!-- Fila 5: =, Siguiente Casilla (Tab), x, y, Acceso al Selector Científico -->
          <button type="button" class="vaul-key key-equal" data-cmd='["insert", "="]'>=</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveToNextPlaceholder"]' title="Saltar a siguiente casilla interactiva">⇥ Casilla</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "x"]'>x</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "y"]'>y</button>
          <button type="button" class="vaul-key key-func" id="btn-keypad-open-universal" title="Abrir catálogo científico universal">🌐</button>
        </div>
      `;
    } else if (tab === 'algebra') {
      keysHtml = `
        <div class="vaul-keypad-grid-generic">
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "x_{#?}"]'>xᵢ</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\sqrt[n]{#?}"]'>ⁿ√x</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\pm"]'>±</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\ne"]'>≠</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\le"]'>≤</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\ge"]'>≥</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\approx"]'>≈</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\infty"]'>∞</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\begin{pmatrix} a & b \\\\\\\\ c & d \\\\end{pmatrix}"]'>Matriz 2x2</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\vec{#?}"]'>v⃗</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "|#?|"]'>|x|</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\mathbb{R}"]'>ℝ</button>
        </div>
        <div class="vaul-generic-nav-bar">
          <button type="button" class="vaul-key key-action" data-cmd='["deleteBackward"]'>⌫</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveUp"]' title="Subir">↑</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveDown"]' title="Bajar">↓</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveToPreviousChar"]' title="Izquierda">←</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveToNextChar"]' title="Derecha">→</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveToNextPlaceholder"]' title="Siguiente casilla">⇥</button>
        </div>
      `;
    } else if (tab === 'calculo') {
      keysHtml = `
        <div class="vaul-keypad-grid-generic">
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\frac{df}{dx}"]'><sup>df</sup>/<sub>dx</sub></button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\frac{\\\\partial f}{\\\\partial x}"]'><sup>∂f</sup>/<sub>∂x</sub></button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\int #?\\\\,dx"]'>∫ f(x)dx</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\int_{#?}^{#?} #?\\\\,dx"]'>∫ₐᵇ</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\lim_{x \\\\to #?} #?"]'>lim</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\sum_{#?}^{#?}"]'>∑</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\prod_{#?}^{#?}"]'>∏</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\nabla"]'>∇</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\sin(#?)"]'>sin</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\cos(#?)"]'>cos</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\tan(#?)"]'>tan</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\ln(#?)"]'>ln</button>
        </div>
        <div class="vaul-generic-nav-bar">
          <button type="button" class="vaul-key key-action" data-cmd='["deleteBackward"]'>⌫</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveUp"]' title="Subir">↑</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveDown"]' title="Bajar">↓</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveToPreviousChar"]' title="Izquierda">←</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveToNextChar"]' title="Derecha">→</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveToNextPlaceholder"]' title="Siguiente casilla">⇥</button>
        </div>
      `;
    } else if (tab === 'griego') {
      keysHtml = `
        <div class="vaul-keypad-grid-generic">
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\alpha"]'>α</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\beta"]'>β</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\gamma"]'>γ</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\delta"]'>δ</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\theta"]'>θ</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\lambda"]'>λ</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\mu"]'>μ</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\pi"]'>π</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\sigma"]'>σ</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\omega"]'>ω</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\Delta"]'>Δ</button>
          <button type="button" class="vaul-key key-func" data-cmd='["insert", "\\\\Omega"]'>Ω</button>
        </div>
        <div class="vaul-generic-nav-bar">
          <button type="button" class="vaul-key key-action" data-cmd='["deleteBackward"]'>⌫</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveUp"]' title="Subir">↑</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveDown"]' title="Bajar">↓</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveToPreviousChar"]' title="Izquierda">←</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveToNextChar"]' title="Derecha">→</button>
          <button type="button" class="vaul-key key-nav" data-cmd='["moveToNextPlaceholder"]' title="Siguiente casilla">⇥</button>
        </div>
      `;
    }

    mount.innerHTML = keysHtml;

    // Enlazar comando a cada tecla táctil
    mount.querySelectorAll<HTMLButtonElement>('.vaul-key').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.triggerHaptic();

        const rawCmd = btn.dataset.cmd;
        if (!rawCmd || !this.mathFieldEl) return;

        try {
          const parsed = JSON.parse(rawCmd);
          if (Array.isArray(parsed)) {
            // executeCommand(['insert', '...'])
            this.mathFieldEl.executeCommand(parsed as any);
          } else {
            this.mathFieldEl.executeCommand(parsed as any);
          }
        } catch {
          // Fallback a executeCommand directo
          this.mathFieldEl.executeCommand(rawCmd as any);
        }

        // Mantener el foco
        this.mathFieldEl.focus();
      });
    });

    mount.querySelector('#btn-keypad-open-universal')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.triggerHaptic();
      openUniversalSymbolSelector({
        mathField: this.mathFieldEl,
        onInsert: () => {
          this.runComputeEngineEvaluation();
        }
      });
    });
  }

  /**
   * Enlace de eventos del Drawer
   */
  private bindEvents(): void {
    if (!this.drawerOverlay) return;

    // Cambio de pestañas del teclado
    this.drawerOverlay.querySelectorAll<HTMLButtonElement>('.vaul-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.triggerHaptic();
        const tab = btn.dataset.tab as any;
        if (!tab) return;
        this.drawerOverlay?.querySelectorAll('.vaul-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTab = tab;
        this.renderKeypad(tab);
      });
    });

    // Botón "+ Insertar Resultado"
    this.drawerOverlay.querySelector('#btn-vaul-insert-result')?.addEventListener('click', () => {
      this.triggerHaptic();
      if (!this.mathFieldEl || !this.evaluatedLatexResult) return;

      const currentVal = this.mathFieldEl.getValue ? this.mathFieldEl.getValue() : this.mathFieldEl.value || '';
      if (currentVal.endsWith('=')) {
        this.mathFieldEl.executeCommand(['insert', ` ${this.evaluatedLatexResult}`]);
      } else {
        this.mathFieldEl.executeCommand(['insert', ` = ${this.evaluatedLatexResult}`]);
      }
      this.mathFieldEl.focus();
    });

    // Limpiar input
    this.drawerOverlay.querySelector('#btn-vaul-clear')?.addEventListener('click', () => {
      this.triggerHaptic();
      if (this.mathFieldEl) {
        this.mathFieldEl.setValue('');
        this.mathFieldEl.focus();
        this.runComputeEngineEvaluation();
      }
    });

    // Abrir Selector Científico Universal de Símbolos (100% Simbología Global)
    const openUniversalSelector = () => {
      this.triggerHaptic();
      openUniversalSymbolSelector({
        mathField: this.mathFieldEl,
        onInsert: () => {
          this.runComputeEngineEvaluation();
        }
      });
    };

    this.drawerOverlay.querySelector('#btn-vaul-catalog')?.addEventListener('click', openUniversalSelector);
    this.drawerOverlay.querySelector('#btn-tab-all-symbols')?.addEventListener('click', openUniversalSelector);

    // Cerrar / Cancelar
    this.drawerOverlay.querySelector('#btn-vaul-close')?.addEventListener('click', () => this.close());
    this.drawerOverlay.querySelector('#btn-vaul-cancel')?.addEventListener('click', () => this.close());

    // Guardar / Listo
    this.drawerOverlay.querySelector('#btn-vaul-save')?.addEventListener('click', () => this.saveAndRender());
  }

  /**
   * Sincronización y Renderizado Final en el Lienzo de simple-mind-map:
   * 1. Extrae el código LaTeX limpio de mathField
   * 2. Procesa con katex.renderToString(latex, { throwOnError: false })
   * 3. Inserta el HTML estático en el nodo
   * 4. Llama a map.render() una sola vez
   */
  public saveAndRender(): void {
    if (!this.mathFieldEl) return;
    this.triggerHaptic();

    const rawLatex = (this.mathFieldEl.getValue ? this.mathFieldEl.getValue() : this.mathFieldEl.value || '').trim();

    let katexHtml = '';
    if (rawLatex) {
      try {
        katexHtml = katex.renderToString(rawLatex, {
          throwOnError: false,
          displayMode: false,
          output: 'htmlAndMathml'
        });
      } catch {
        katexHtml = `<span class="katex-fallback">${rawLatex}</span>`;
      }
    } else {
      katexHtml = 'Idea';
    }

    // Callback al nodo
    this.options.onSave(katexHtml, rawLatex);
    this.close();
  }

  /**
   * Cierra el drawer y descongela el lienzo
   */
  public close(): void {
    this.freezeCanvas(false);
    if (this.drawerOverlay) {
      this.drawerOverlay.remove();
      this.drawerOverlay = null;
    }
    this.options.onClose?.();
  }
}

/**
 * Función de utilidad para invocar el Drawer Matemático desde cualquier punto
 */
export function openMathEditorDrawer(options: MathEditorDrawerOptions): MathEditorDrawer {
  const drawer = new MathEditorDrawer(options);
  drawer.open();
  return drawer;
}
