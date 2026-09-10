import { katexService } from '../services/katex.service';
import { nativeService } from '../services/native.service';
import {
  evaluateMathExpression,
  extractContextVariablesFromTree,
  type MathEvaluationResult
} from '../services/math-engine.service';
import { openScientificFormulaAssistant } from './ScientificFormulaAssistant';

export interface PhotomathEditorOptions {
  node: any;
  initialText: string;
  onSave: (newText: string) => void;
  onClose?: () => void;
}

export class PhotomathNodeEditor {
  private overlay: HTMLElement | null = null;
  private inputEl: HTMLTextAreaElement | null = null;
  private previewEl: HTMLElement | null = null;
  private calcResultBanner: HTMLElement | null = null;
  private options: PhotomathEditorOptions;
  private currentTab: 'calc' | 'algebra' | 'calculo' | 'nuclear' | 'griego' = 'calc';
  private evaluationState: MathEvaluationResult | null = null;
  private contextScope: Record<string, number> = {};

  constructor(options: PhotomathEditorOptions) {
    this.options = options;
    this.contextScope = extractContextVariablesFromTree(options.node);
  }

  public open(): void {
    const existing = document.getElementById('photomath-node-editor-overlay');
    if (existing) existing.remove();

    nativeService.triggerHaptics('light');

    const overlay = document.createElement('div');
    overlay.id = 'photomath-node-editor-overlay';
    overlay.className = 'photomath-overlay-container';

    const scopeKeys = Object.keys(this.contextScope);
    const scopeInfoHtml =
      scopeKeys.length > 0
        ? `<div class="photomath-scope-badge" title="Variables heredadas de nodos padre">
            <span>🌳 Variables en contexto:</span>
            <strong>${scopeKeys.map((k) => `${k} = ${this.contextScope[k]}`).join(', ')}</strong>
          </div>`
        : '';

    overlay.innerHTML = `
      <div class="photomath-editor-sheet">
        <!-- Header con Modo Photomath y Acciones Rápidas -->
        <header class="photomath-header">
          <div class="photomath-header-title">
            <span class="photomath-logo-chip">📐 Photomath Math Engine</span>
            <span class="photomath-mode-tag">Táctil 60 FPS</span>
          </div>
          <div class="photomath-header-actions">
            <button type="button" class="photomath-icon-btn" id="btn-pm-full-catalog" title="Catálogo Universal de Símbolos">
              📚 Catálogo
            </button>
            <button type="button" class="photomath-icon-btn btn-close" id="btn-pm-close" aria-label="Cerrar">✕</button>
          </div>
        </header>

        <!-- Context Variables Bar (si existen en el árbol) -->
        <div id="photomath-scope-container">${scopeInfoHtml}</div>

        <!-- Área de Entrada de Fórmulas y Vista Previa WYSIWYG -->
        <div class="photomath-input-section">
          <!-- Textarea con formateo rápido y detección de / -->
          <div class="photomath-input-wrapper">
            <textarea
              id="photomath-textarea"
              rows="2"
              placeholder="Escribe fórmula, número o texto (ej: 1/2 + 3/4 =, \\Delta E=mc^2)..."
              autocomplete="off"
              spellcheck="false"
            >${escapeHtml(this.options.initialText)}</textarea>
            <button type="button" id="btn-pm-clear-input" class="photomath-clear-btn" title="Limpiar texto">✕</button>
          </div>

          <!-- Previsualización KaTeX en Tiempo Real -->
          <div class="photomath-preview-card">
            <div class="preview-header">
              <span class="preview-title">VISTA PREVIA CIENTÍFICA (KaTeX):</span>
              <span id="pm-preview-status" class="preview-status">Instantáneo</span>
            </div>
            <div id="photomath-katex-rendered" class="preview-rendered-box"></div>
          </div>

          <!-- Banner de Evaluación y Chips Inteligentes estilo Photomath -->
          <div id="photomath-calc-banner" class="photomath-calc-banner" style="display: none;">
            <div class="calc-result-row">
              <span class="calc-icon">⚡</span>
              <div class="calc-text-wrap" id="photomath-calc-output"></div>
            </div>
            <!-- Chips de Acción Matemática Rápida -->
            <div class="photomath-chips-bar" id="photomath-chips-bar">
              <button type="button" class="pm-action-chip" id="chip-pm-solve" title="Insertar resultado en la fórmula">
                ⚡ Resolver =
              </button>
              <button type="button" class="pm-action-chip" id="chip-pm-simplify" title="Simplificar expresión">
                📐 Simplificar
              </button>
              <button type="button" class="pm-action-chip" id="chip-pm-decimal" title="Convertir a decimal">
                🔢 Decimal
              </button>
              <button type="button" class="pm-action-chip" id="chip-pm-steps" title="Ver paso a paso">
                📝 Pasos
              </button>
            </div>
          </div>
        </div>

        <!-- Teclado Táctil Flotante Dedicado (Bottom Keypad 48px+) -->
        <div class="photomath-keypad-panel">
          <!-- Pestañas de Teclado -->
          <div class="photomath-keypad-tabs">
            <button type="button" class="pm-tab-btn active" data-tab="calc">🔢 Calculadora</button>
            <button type="button" class="pm-tab-btn" data-tab="algebra">📐 Álgebra</button>
            <button type="button" class="pm-tab-btn" data-tab="calculo">📈 Cálculo</button>
            <button type="button" class="pm-tab-btn" data-tab="nuclear">⚛️ Química</button>
            <button type="button" class="pm-tab-btn" data-tab="griego">🇬🇷 Griego</button>
            <button type="button" class="pm-tab-btn pm-tab-keyboard" id="btn-pm-native-keyboard" title="Abrir teclado del sistema">⌨️ QWERTY</button>
          </div>

          <!-- Contenido del Teclado Táctil -->
          <div class="photomath-keys-grid" id="photomath-keys-mount">
            <!-- Renderizado dinámico -->
          </div>
        </div>

        <!-- Barra Inferior de Confirmación -->
        <footer class="photomath-bottom-bar">
          <button type="button" id="btn-pm-cancel" class="pm-footer-btn pm-btn-cancel">
            Cancelar
          </button>
          <button type="button" id="btn-pm-save" class="pm-footer-btn pm-btn-confirm">
            <span>Listo ✓</span>
          </button>
        </footer>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlay = overlay;
    this.inputEl = overlay.querySelector('#photomath-textarea') as HTMLTextAreaElement;
    this.previewEl = overlay.querySelector('#photomath-katex-rendered') as HTMLElement;
    this.calcResultBanner = overlay.querySelector('#photomath-calc-banner') as HTMLElement;

    this.bindEvents();
    this.renderKeypad(this.currentTab);
    this.updateLivePreview();
  }

  private bindEvents(): void {
    if (!this.overlay || !this.inputEl) return;

    // Escuchar cambios de texto con intercepción de '/' para fracción automática
    this.inputEl.addEventListener('input', (e) => {
      const inputEvent = e as InputEvent;
      if (inputEvent.data === '/') {
        this.handleSlashFraction();
        return;
      }
      this.updateLivePreview();
    });

    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === '/') {
        e.preventDefault();
        this.handleSlashFraction();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.saveAndClose();
      }
    });

    // Pestañas de Teclado
    this.overlay.querySelectorAll<HTMLButtonElement>('.pm-tab-btn[data-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabKey = tab.dataset.tab as any;
        if (tabKey) {
          this.overlay?.querySelectorAll('.pm-tab-btn').forEach((b) => b.classList.remove('active'));
          tab.classList.add('active');
          this.currentTab = tabKey;
          this.renderKeypad(tabKey);
          nativeService.triggerHaptics('light');
        }
      });
    });

    // Teclado nativo toggle
    this.overlay.querySelector('#btn-pm-native-keyboard')?.addEventListener('click', () => {
      this.inputEl?.focus();
      nativeService.triggerHaptics('light');
    });

    // Limpiar input
    this.overlay.querySelector('#btn-pm-clear-input')?.addEventListener('click', () => {
      if (this.inputEl) {
        this.inputEl.value = '';
        this.inputEl.focus();
        this.updateLivePreview();
        nativeService.triggerHaptics('light');
      }
    });

    // Abrir Catálogo Completo Universal
    this.overlay.querySelector('#btn-pm-full-catalog')?.addEventListener('click', () => {
      openScientificFormulaAssistant({
        initialLatex: this.inputEl?.value || '',
        onInsert: (formula) => {
          this.insertTextAtCursor(formula);
        }
      });
    });

    // Chips de Cálculo Rápido
    this.overlay.querySelector('#chip-pm-solve')?.addEventListener('click', () => {
      this.applySolveChip();
    });

    this.overlay.querySelector('#chip-pm-simplify')?.addEventListener('click', () => {
      this.applySimplifyChip();
    });

    this.overlay.querySelector('#chip-pm-decimal')?.addEventListener('click', () => {
      this.applyDecimalChip();
    });

    this.overlay.querySelector('#chip-pm-steps')?.addEventListener('click', () => {
      this.toggleStepsModal();
    });

    // Cerrar / Guardar
    this.overlay.querySelector('#btn-pm-close')?.addEventListener('click', () => this.close());
    this.overlay.querySelector('#btn-pm-cancel')?.addEventListener('click', () => this.close());
    this.overlay.querySelector('#btn-pm-save')?.addEventListener('click', () => this.saveAndClose());
  }

  /**
   * Transforma automáticamente el último término antes del cursor en una fracción KaTeX: \frac{numerador}{denominador}
   */
  private handleSlashFraction(): void {
    if (!this.inputEl) return;
    const val = this.inputEl.value;
    const pos = this.inputEl.selectionStart ?? val.length;
    const before = val.substring(0, pos);
    const after = val.substring(pos);

    // Buscar el último término (ej. "1", "12.5", "2x", "(a+b)")
    let match = before.match(/(\([^)]+\)|[a-zA-Z0-9._]+|\\[a-zA-Z]+|\S+)$/);
    if (match) {
      const numerator = match[1].replace(/^\((.*)\)$/, '$1'); // Quitar paréntesis si estaban envolventes
      const prefix = before.substring(0, before.length - match[0].length);
      const replacement = `\\frac{${numerator}}{}`;
      this.inputEl.value = `${prefix}${replacement}${after}`;
      // Poner cursor dentro del denominador {}
      const newCursorPos = prefix.length + replacement.length - 1;
      this.inputEl.setSelectionRange(newCursorPos, newCursorPos);
    } else {
      // Inserción de fracción vacía \frac{}{}
      const replacement = `\\frac{}{}`;
      this.inputEl.value = `${before}${replacement}${after}`;
      const newCursorPos = before.length + 6; // Dentro del numerador
      this.inputEl.setSelectionRange(newCursorPos, newCursorPos);
    }

    this.inputEl.focus();
    this.updateLivePreview();
    nativeService.triggerHaptics('light');
  }

  /**
   * Inserta un snippet o LaTeX en la posición del cursor
   */
  public insertTextAtCursor(snippet: string, cursorOffsetFromEnd: number = 0): void {
    if (!this.inputEl) return;
    const cur = this.inputEl.value;
    const start = this.inputEl.selectionStart ?? cur.length;
    const end = this.inputEl.selectionEnd ?? cur.length;

    // Si había selección y es un envoltorio (ej: \frac, \sqrt, parentesis)
    let insertString = snippet;
    let selectedText = cur.substring(start, end);
    if (selectedText && snippet.includes('{}')) {
      insertString = snippet.replace('{}', `{${selectedText}}`);
      cursorOffsetFromEnd = 0;
    } else if (selectedText && snippet === '()') {
      insertString = `(${selectedText})`;
      cursorOffsetFromEnd = 0;
    }

    const before = cur.substring(0, start);
    const after = cur.substring(end);
    this.inputEl.value = `${before}${insertString}${after}`;

    const newPos = before.length + insertString.length - cursorOffsetFromEnd;
    this.inputEl.setSelectionRange(newPos, newPos);
    this.inputEl.focus();
    this.updateLivePreview();
    nativeService.triggerHaptics('light');
  }

  /**
   * Actualiza la previsualización KaTeX y corre la evaluación en tiempo real
   */
  private updateLivePreview(): void {
    if (!this.inputEl || !this.previewEl) return;
    const text = this.inputEl.value.trim();

    if (!text) {
      this.previewEl.innerHTML = '<span style="color:var(--f-text-muted); font-size:0.88rem;">Escribe una fórmula o usa el teclado táctil de abajo</span>';
      if (this.calcResultBanner) this.calcResultBanner.style.display = 'none';
      return;
    }

    // Renderizar KaTeX
    const wrapped = text.includes('$') || text.includes('\\ce{') ? text : `$${text}$`;
    this.previewEl.innerHTML = katexService.parseAndRender(wrapped);

    // Motor de cálculo inteligente inline (Photomath)
    this.evaluateInline(text);
  }

  /**
   * Evalúa la expresión actual y muestra el banner con el resultado resuelto y simplificado
   */
  private evaluateInline(text: string): void {
    if (!this.calcResultBanner) return;

    // Evaluar expresión con el motor matemático y las variables del contexto
    const evalResult = evaluateMathExpression(text, this.contextScope);
    this.evaluationState = evalResult;

    const calcOutput = this.overlay?.querySelector('#photomath-calc-output') as HTMLElement | null;

    if (evalResult.exactLatex || evalResult.numericValue !== undefined) {
      this.calcResultBanner.style.display = 'flex';

      let resultHtml = '';
      if (evalResult.exactLatex) {
        resultHtml += `<strong>${katexService.parseAndRender(`$=${evalResult.exactLatex}$`)}</strong>`;
      }
      if (evalResult.decimalLatex && evalResult.decimalLatex !== evalResult.exactLatex) {
        resultHtml += `<span style="color:var(--f-text-secondary); margin-left:6px; font-size:0.85rem;">(${evalResult.decimalLatex})</span>`;
      }
      if (evalResult.steps && evalResult.steps.length > 0) {
        resultHtml += `<span class="calc-scope-hint" style="display:block; font-size:0.75rem; color:#38bdf8;">${evalResult.steps.join(' • ')}</span>`;
      }

      if (calcOutput) {
        calcOutput.innerHTML = resultHtml || '<span>Calculado</span>';
      }
    } else {
      this.calcResultBanner.style.display = 'none';
    }
  }

  /**
   * Aplica la acción [Resolver =] al texto
   */
  private applySolveChip(): void {
    if (!this.inputEl || !this.evaluationState) return;
    const res = this.evaluationState;
    const cur = this.inputEl.value.trim();

    if (res.exactLatex) {
      if (cur.endsWith('=')) {
        this.inputEl.value = `${cur} ${res.exactLatex}`;
      } else if (res.isEquation) {
        this.inputEl.value = `${res.lhs || cur} = ${res.exactLatex}`;
      } else {
        this.inputEl.value = `${cur} = ${res.exactLatex}`;
      }
      this.updateLivePreview();
      nativeService.triggerHaptics('light');
    }
  }

  /**
   * Aplica la acción [Simplificar]
   */
  private applySimplifyChip(): void {
    if (!this.inputEl || !this.evaluationState) return;
    const res = this.evaluationState;
    if (res.simplifiedLatex) {
      this.inputEl.value = res.simplifiedLatex;
      this.updateLivePreview();
      nativeService.triggerHaptics('light');
    }
  }

  /**
   * Aplica la acción [Decimal]
   */
  private applyDecimalChip(): void {
    if (!this.inputEl || !this.evaluationState) return;
    const res = this.evaluationState;
    if (res.decimalLatex) {
      const cur = this.inputEl.value.trim();
      if (cur.endsWith('=')) {
        this.inputEl.value = `${cur} ${res.decimalLatex}`;
      } else {
        this.inputEl.value = `${cur} = ${res.decimalLatex}`;
      }
      this.updateLivePreview();
      nativeService.triggerHaptics('light');
    }
  }

  /**
   * Modal emergente de pasos desglosados
   */
  private toggleStepsModal(): void {
    if (!this.evaluationState) return;
    const steps = this.evaluationState.steps || ['No hay pasos adicionales'];
    alert(`Pasos de resolución:\n\n${steps.join('\n')}`);
  }

  /**
   * Renderiza el teclado táctil de 48px+ según la pestaña activa
   */
  private renderKeypad(tab: 'calc' | 'algebra' | 'calculo' | 'nuclear' | 'griego'): void {
    const mount = this.overlay?.querySelector('#photomath-keys-mount');
    if (!mount) return;

    let keysHtml = '';

    if (tab === 'calc') {
      // Teclado Calculadora Táctil Photomath (Botones grandes 48px+)
      keysHtml = `
        <div class="pm-keypad-grid-calc">
          <!-- Fila Superior: Acciones Rápidas Photomath -->
          <button type="button" class="pm-key key-func" data-insert="\\frac{}{}" data-offset="1"><span><sup>a</sup>/<sub>b</sub></span></button>
          <button type="button" class="pm-key key-func" data-insert="^{2}"><span>x²</span></button>
          <button type="button" class="pm-key key-func" data-insert="^{}" data-offset="1"><span>xⁿ</span></button>
          <button type="button" class="pm-key key-func" data-insert="\\sqrt{}" data-offset="1"><span>√</span></button>
          <button type="button" class="pm-key key-func" data-insert="()"><span>( )</span></button>
          <button type="button" class="pm-key key-func" data-insert="x"><span>x</span></button>

          <!-- Fila 1 -->
          <button type="button" class="pm-key key-num" data-insert="7">7</button>
          <button type="button" class="pm-key key-num" data-insert="8">8</button>
          <button type="button" class="pm-key key-num" data-insert="9">9</button>
          <button type="button" class="pm-key key-op" data-action="slash">÷ /</button>
          <button type="button" class="pm-key key-action key-backspace" data-action="backspace">⌫</button>

          <!-- Fila 2 -->
          <button type="button" class="pm-key key-num" data-insert="4">4</button>
          <button type="button" class="pm-key key-num" data-insert="5">5</button>
          <button type="button" class="pm-key key-num" data-insert="6">6</button>
          <button type="button" class="pm-key key-op" data-insert="\\times">×</button>
          <button type="button" class="pm-key key-func" data-insert="\\pi">π</button>

          <!-- Fila 3 -->
          <button type="button" class="pm-key key-num" data-insert="1">1</button>
          <button type="button" class="pm-key key-num" data-insert="2">2</button>
          <button type="button" class="pm-key key-num" data-insert="3">3</button>
          <button type="button" class="pm-key key-op" data-insert="-">−</button>
          <button type="button" class="pm-key key-func" data-insert="y">y</button>

          <!-- Fila 4 -->
          <button type="button" class="pm-key key-num" data-insert="0">0</button>
          <button type="button" class="pm-key key-num" data-insert=".">.</button>
          <button type="button" class="pm-key key-op key-equal" data-insert="=">=</button>
          <button type="button" class="pm-key key-op" data-insert="+">+</button>
          <button type="button" class="pm-key key-func" data-insert="e">e</button>
        </div>
      `;
    } else if (tab === 'algebra') {
      keysHtml = `
        <div class="pm-keypad-grid-generic">
          <button type="button" class="pm-key key-func" data-insert="\\frac{a}{b}"><sup>a</sup>/<sub>b</sub></button>
          <button type="button" class="pm-key key-func" data-insert="x_{i}">xᵢ</button>
          <button type="button" class="pm-key key-func" data-insert="\\sqrt[n]{x}">ⁿ√x</button>
          <button type="button" class="pm-key key-func" data-insert="\\pm">±</button>
          <button type="button" class="pm-key key-func" data-insert="\\neq">≠</button>
          <button type="button" class="pm-key key-func" data-insert="\\approx">≈</button>
          <button type="button" class="pm-key key-func" data-insert="\\le">≤</button>
          <button type="button" class="pm-key key-func" data-insert="\\ge">≥</button>
          <button type="button" class="pm-key key-func" data-insert="\\infty">∞</button>
          <button type="button" class="pm-key key-func" data-insert="\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}">Matriz 2x2</button>
          <button type="button" class="pm-key key-func" data-insert="\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}">|Det 2x2|</button>
          <button type="button" class="pm-key key-func" data-insert="\\vec{v}">v⃗</button>
          <button type="button" class="pm-key key-func" data-insert="x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}">x=(-b±√)/2a</button>
          <button type="button" class="pm-key key-func" data-insert="|x|">|x|</button>
          <button type="button" class="pm-key key-action key-backspace" data-action="backspace">⌫</button>
        </div>
      `;
    } else if (tab === 'calculo') {
      keysHtml = `
        <div class="pm-keypad-grid-generic">
          <button type="button" class="pm-key key-func" data-insert="\\frac{df}{dx}"><sup>df</sup>/<sub>dx</sub></button>
          <button type="button" class="pm-key key-func" data-insert="\\frac{\\partial f}{\\partial x}"><sup>∂f</sup>/<sub>∂x</sub></button>
          <button type="button" class="pm-key key-func" data-insert="\\int f(x)\\,dx">∫ f(x)dx</button>
          <button type="button" class="pm-key key-func" data-insert="\\int_{a}^{b} f(x)\\,dx">∫ₐᵇ f(x)dx</button>
          <button type="button" class="pm-key key-func" data-insert="\\lim_{x \\to 0} f(x)">lim x➔0</button>
          <button type="button" class="pm-key key-func" data-insert="\\sum_{i=1}^{n}">∑</button>
          <button type="button" class="pm-key key-func" data-insert="\\prod_{i=1}^{n}">∏</button>
          <button type="button" class="pm-key key-func" data-insert="\\nabla">∇</button>
          <button type="button" class="pm-key key-func" data-insert="\\sin(x)">sin</button>
          <button type="button" class="pm-key key-func" data-insert="\\cos(x)">cos</button>
          <button type="button" class="pm-key key-func" data-insert="\\tan(x)">tan</button>
          <button type="button" class="pm-key key-func" data-insert="\\ln(x)">ln</button>
          <button type="button" class="pm-key key-func" data-insert="dx">dx</button>
          <button type="button" class="pm-key key-func" data-insert="dt">dt</button>
          <button type="button" class="pm-key key-action key-backspace" data-action="backspace">⌫</button>
        </div>
      `;
    } else if (tab === 'nuclear') {
      keysHtml = `
        <div class="pm-keypad-grid-generic">
          <button type="button" class="pm-key key-func" data-insert="\\ce{^{133}_{55}Cs}">¹³³₅₅Cs</button>
          <button type="button" class="pm-key key-func" data-insert="\\ce{^{235}_{92}U}">²³⁵₉₂U</button>
          <button type="button" class="pm-key key-func" data-insert="\\ce{^{14}_{6}C}">¹⁴₆C</button>
          <button type="button" class="pm-key key-func" data-insert="\\ce{^{4}_{2}\\alpha}">⁴₂α</button>
          <button type="button" class="pm-key key-func" data-insert="\\ce{^{0}_{-1}\\beta}">⁰₋₁β</button>
          <button type="button" class="pm-key key-func" data-insert="\\gamma">γ</button>
          <button type="button" class="pm-key key-func" data-insert="\\Delta E = \\Delta m c^2">ΔE=Δmc²</button>
          <button type="button" class="pm-key key-func" data-insert="\\ce{->}">➔</button>
          <button type="button" class="pm-key key-func" data-insert="\\ce{<=>}">⇌</button>
          <button type="button" class="pm-key key-func" data-insert="\\ce{2H2 + O2 -> 2H2O}">2H₂+O₂➔2H₂O</button>
          <button type="button" class="pm-key key-func" data-insert="t_{1/2} = \\frac{\\ln(2)}{\\lambda}">t½=ln2/λ</button>
          <button type="button" class="pm-key key-func" data-insert="P V = n R T">PV=nRT</button>
          <button type="button" class="pm-key key-action key-backspace" data-action="backspace">⌫</button>
        </div>
      `;
    } else if (tab === 'griego') {
      keysHtml = `
        <div class="pm-keypad-grid-generic">
          <button type="button" class="pm-key key-func" data-insert="\\alpha">α</button>
          <button type="button" class="pm-key key-func" data-insert="\\beta">β</button>
          <button type="button" class="pm-key key-func" data-insert="\\gamma">γ</button>
          <button type="button" class="pm-key key-func" data-insert="\\delta">δ</button>
          <button type="button" class="pm-key key-func" data-insert="\\theta">θ</button>
          <button type="button" class="pm-key key-func" data-insert="\\lambda">λ</button>
          <button type="button" class="pm-key key-func" data-insert="\\mu">μ</button>
          <button type="button" class="pm-key key-func" data-insert="\\pi">π</button>
          <button type="button" class="pm-key key-func" data-insert="\\sigma">σ</button>
          <button type="button" class="pm-key key-func" data-insert="\\omega">ω</button>
          <button type="button" class="pm-key key-func" data-insert="\\Delta">Δ</button>
          <button type="button" class="pm-key key-func" data-insert="\\Omega">Ω</button>
          <button type="button" class="pm-key key-func" data-insert="\\phi">ϕ</button>
          <button type="button" class="pm-key key-func" data-insert="\\psi">ψ</button>
          <button type="button" class="pm-key key-action key-backspace" data-action="backspace">⌫</button>
        </div>
      `;
    }

    mount.innerHTML = keysHtml;

    // Enlazar eventos de cada tecla
    mount.querySelectorAll<HTMLButtonElement>('.pm-key').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const insert = btn.dataset.insert;
        const offset = parseInt(btn.dataset.offset || '0', 10);

        if (action === 'slash') {
          this.handleSlashFraction();
        } else if (action === 'backspace') {
          this.handleBackspace();
        } else if (insert) {
          this.insertTextAtCursor(insert, offset);
        }
      });
    });
  }

  /**
   * Maneja el borrado táctil con backspace
   */
  private handleBackspace(): void {
    if (!this.inputEl) return;
    const cur = this.inputEl.value;
    const start = this.inputEl.selectionStart ?? cur.length;
    const end = this.inputEl.selectionEnd ?? cur.length;

    if (start === end && start > 0) {
      // Si el caracter anterior es una llave o comando latex, intentar borrar razonablemente
      this.inputEl.value = cur.substring(0, start - 1) + cur.substring(end);
      this.inputEl.setSelectionRange(start - 1, start - 1);
    } else if (start !== end) {
      this.inputEl.value = cur.substring(0, start) + cur.substring(end);
      this.inputEl.setSelectionRange(start, start);
    }

    this.inputEl.focus();
    this.updateLivePreview();
    nativeService.triggerHaptics('light');
  }

  /**
   * Guarda los cambios en el nodo y cierra el editor
   */
  private saveAndClose(): void {
    const text = this.inputEl?.value.trim() || '';
    this.options.onSave(text);
    this.close();
  }

  /**
   * Cierra y limpia el editor
   */
  public close(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.options.onClose?.();
  }
}

/**
 * Función de utilidad para abrir el editor Photomath en cualquier nodo
 */
export function openPhotomathNodeEditor(options: PhotomathEditorOptions): PhotomathNodeEditor {
  const editor = new PhotomathNodeEditor(options);
  editor.open();
  return editor;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
