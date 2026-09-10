import { katexService } from '../services/katex.service';
import { nativeService } from '../services/native.service';

export interface FormulaSnippet {
  label: string;
  latex: string;
  display?: string;
  category: 'algebra' | 'calculo' | 'nuclear' | 'griego';
}

export const SCIENTIFIC_SNIPPETS: FormulaSnippet[] = [
  // Álgebra
  { label: 'Fracción', latex: '\\frac{a}{b}', category: 'algebra' },
  { label: 'Potencia', latex: 'x^{2}', category: 'algebra' },
  { label: 'Subíndice', latex: 'x_{i}', category: 'algebra' },
  { label: 'Raíz cuadrada', latex: '\\sqrt{x}', category: 'algebra' },
  { label: 'Raíz n-ésima', latex: '\\sqrt[n]{x}', category: 'algebra' },
  { label: 'Más/Menos', latex: '\\pm', category: 'algebra' },
  { label: 'Multiplicación', latex: '\\times', category: 'algebra' },
  { label: 'División', latex: '\\div', category: 'algebra' },
  { label: 'Diferente', latex: '\\neq', category: 'algebra' },
  { label: 'Aproximado', latex: '\\approx', category: 'algebra' },
  { label: 'Menor o igual', latex: '\\le', category: 'algebra' },
  { label: 'Mayor o igual', latex: '\\ge', category: 'algebra' },
  { label: 'Infinito', latex: '\\infty', category: 'algebra' },
  { label: 'Matriz 2x2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', category: 'algebra' },

  // Cálculo & Análisis
  { label: 'Integral Definida', latex: '\\int_{a}^{b} f(x) \\, dx', category: 'calculo' },
  { label: 'Integral Indefinida', latex: '\\int f(x) \\, dx', category: 'calculo' },
  { label: 'Derivada', latex: '\\frac{df}{dx}', category: 'calculo' },
  { label: 'Derivada Parcial', latex: '\\frac{\\partial f}{\\partial x}', category: 'calculo' },
  { label: 'Límite', latex: '\\lim_{x \\to 0}', category: 'calculo' },
  { label: 'Sumatoria', latex: '\\sum_{i=1}^{n}', category: 'calculo' },
  { label: 'Productoria', latex: '\\prod_{i=1}^{n}', category: 'calculo' },
  { label: 'Gradiente', latex: '\\nabla', category: 'calculo' },

  // Física & Química Nuclear (KaTeX + mhchem)
  { label: 'Cesio-133 (Relojes)', latex: '\\ce{^{133}_{55}Cs}', category: 'nuclear' },
  { label: 'Uranio-235 (Fisión)', latex: '\\ce{^{235}_{92}U}', category: 'nuclear' },
  { label: 'Carbono-14', latex: '\\ce{^{14}_{6}C}', category: 'nuclear' },
  { label: 'Partícula Alfa', latex: '\\ce{^{4}_{2}\\alpha}', category: 'nuclear' },
  { label: 'Partícula Beta', latex: '\\ce{^{0}_{-1}\\beta}', category: 'nuclear' },
  { label: 'Radiación Gamma', latex: '\\gamma', category: 'nuclear' },
  { label: 'Flecha Reacción', latex: '\\ce{->}', category: 'nuclear' },
  { label: 'Equivalencia Einstein', latex: '\\Delta E = \\Delta m c^2', category: 'nuclear' },
  { label: 'Defecto de Masa', latex: '\\Delta m = Z m_p + (A-Z) m_n - M', category: 'nuclear' },
  { label: 'Cinética Decaimiento', latex: '\\frac{dN(t)}{dt} = -\\lambda N(t)', category: 'nuclear' },
  { label: 'Ley Exponencial', latex: 'N(t) = N_0 e^{-\\lambda t}', category: 'nuclear' },
  { label: 'Vida Media', latex: 't_{1/2} = \\frac{\\ln(2)}{\\lambda}', category: 'nuclear' },
  { label: 'Agua (Reacción)', latex: '\\ce{2H2 + O2 -> 2H2O}', category: 'nuclear' },

  // Alfabeto Griego
  { label: 'Alfa', latex: '\\alpha', category: 'griego' },
  { label: 'Beta', latex: '\\beta', category: 'griego' },
  { label: 'Gamma', latex: '\\gamma', category: 'griego' },
  { label: 'Theta', latex: '\\theta', category: 'griego' },
  { label: 'Lambda', latex: '\\lambda', category: 'griego' },
  { label: 'Mu', latex: '\\mu', category: 'griego' },
  { label: 'Pi', latex: '\\pi', category: 'griego' },
  { label: 'Sigma', latex: '\\sigma', category: 'griego' },
  { label: 'Omega', latex: '\\omega', category: 'griego' },
  { label: 'Delta', latex: '\\Delta', category: 'griego' },
  { label: 'Omega Mayúscula', latex: '\\Omega', category: 'griego' },
  { label: 'Phi', latex: '\\phi', category: 'griego' }
];

export interface FormulaAssistantOptions {
  initialLatex?: string;
  onInsert?: (latex: string) => void;
  onClose?: () => void;
}

/**
 * Abre el Recuadro y Asistente Científico KaTeX
 */
export function openScientificFormulaAssistant(options: FormulaAssistantOptions = {}): void {
  const existing = document.getElementById('eureka-formula-modal');
  if (existing) existing.remove();

  nativeService.triggerHaptics('light');

  const modal = document.createElement('div');
  modal.id = 'eureka-formula-modal';
  modal.className = 'apple-modal-overlay';
  modal.innerHTML = `
    <div class="apple-modal-content apple-glass-panel formula-modal-panel">
      <!-- Modal Header -->
      <div class="formula-modal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.3rem;">📐</span>
          <div>
            <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#fff;">Asistente Científico KaTeX / LaTeX</h3>
            <span style="font-size:0.75rem; color:var(--f-text-muted);">Soporte universal: Álgebra, Cálculo, Química y Física Nuclear</span>
          </div>
        </div>
        <button id="btn-close-formula-modal" class="figma-icon-btn-ghost" style="font-size:1.3rem; color:var(--f-text-secondary);">✕</button>
      </div>

      <!-- Lienzo de Previsualización en Vivo -->
      <div class="formula-live-preview-box">
        <div class="preview-box-tag">PREVISUALIZACIÓN EN VIVO (KaTeX + mhchem):</div>
        <div class="preview-rendered-output" id="formula-rendered-view">
          ${katexService.parseAndRender(options.initialLatex ? `$${options.initialLatex}$` : '$\\Delta E = \\Delta m c^2$')}
        </div>
      </div>

      <!-- Input de Edición de Fórmula -->
      <div class="formula-input-row">
        <label style="font-size:0.78rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase;">Código LaTeX:</label>
        <div style="display:flex; gap:8px; margin-top:4px;">
          <input 
            type="text" 
            id="input-formula-latex" 
            class="formula-text-input" 
            placeholder="Escribe o toca los símbolos de abajo (ej: \\ce{^{133}_{55}Cs} o \\int_{a}^{b} f(x)dx)..." 
            value="${options.initialLatex ? escapeAttr(options.initialLatex) : '\\Delta E = \\Delta m c^2'}"
            autocomplete="off"
          />
          <button class="figma-btn-white-pill" id="btn-formula-clear" style="padding:8px 14px; font-size:0.8rem;">
            Limpiar
          </button>
        </div>
      </div>

      <!-- Categorías y Pestañas de Símbolos -->
      <div class="formula-categories-bar">
        <button class="formula-cat-tab active" data-cat="nuclear">⚛️ Física Nuclear & Química</button>
        <button class="formula-cat-tab" data-cat="calculo">📈 Cálculo & Integrales</button>
        <button class="formula-cat-tab" data-cat="algebra">📐 Álgebra & Matrices</button>
        <button class="formula-cat-tab" data-cat="griego">🇬🇷 Letras Griegas</button>
      </div>

      <!-- Grid de Fórmulas y Símbolos Clicables -->
      <div class="formula-chips-grid" id="formula-chips-mount">
        <!-- Renderizado dinámico -->
      </div>

      <!-- Footer de Acciones -->
      <div class="formula-modal-footer">
        <button class="figma-btn-white-pill" id="btn-formula-copy" style="padding:10px 18px; font-size:0.88rem; gap:6px;">
          📋 Copiar Código
        </button>
        <button class="figma-btn-study-large" id="btn-formula-insert" style="width:auto; padding:10px 24px; font-size:0.88rem;">
          ✨ Insertar Fórmula en Tarjeta ➔
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const inputLatex = modal.querySelector('#input-formula-latex') as HTMLInputElement;
  const renderedView = modal.querySelector('#formula-rendered-view') as HTMLElement;
  const chipsMount = modal.querySelector('#formula-chips-mount') as HTMLElement;

  let currentCategory = 'nuclear';

  const updatePreview = () => {
    const val = inputLatex.value.trim();
    if (!val) {
      renderedView.innerHTML = '<span style="color:var(--f-text-muted); font-size:0.88rem;">Escribe una fórmula o selecciona un símbolo de abajo</span>';
      return;
    }
    // Si no tiene delimitadores $, agregarlos para renderizado
    const wrapped = val.startsWith('$') ? val : `$${val}$`;
    renderedView.innerHTML = katexService.parseAndRender(wrapped);
  };

  const renderChips = (category: string) => {
    const filtered = SCIENTIFIC_SNIPPETS.filter((s) => s.category === category);
    chipsMount.innerHTML = filtered
      .map(
        (item) => `
      <button class="formula-chip-item" data-latex="${escapeAttr(item.latex)}" title="${escapeAttr(item.label)}">
        <span class="chip-rendered">${katexService.parseAndRender(`$${item.latex}$`)}</span>
        <span class="chip-name">${item.label}</span>
      </button>
    `
      )
      .join('');

    chipsMount.querySelectorAll<HTMLButtonElement>('.formula-chip-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        nativeService.triggerHaptics('light');
        const latex = btn.dataset.latex || '';
        if (latex) {
          // Insertar en cursor o concatenar
          const current = inputLatex.value;
          const cursorPos = inputLatex.selectionStart ?? current.length;
          const before = current.substring(0, cursorPos);
          const after = current.substring(inputLatex.selectionEnd ?? cursorPos);
          
          inputLatex.value = `${before}${before.length > 0 && !before.endsWith(' ') ? ' ' : ''}${latex} ${after}`.trim();
          inputLatex.focus();
          updatePreview();
        }
      });
    });
  };

  // Inicializar vista
  renderChips(currentCategory);
  updatePreview();

  // Escuchar entrada de texto
  inputLatex.addEventListener('input', updatePreview);

  // Selector de Categoría
  modal.querySelectorAll<HTMLButtonElement>('.formula-cat-tab').forEach((tabBtn) => {
    tabBtn.addEventListener('click', () => {
      modal.querySelectorAll('.formula-cat-tab').forEach((b) => b.classList.remove('active'));
      tabBtn.classList.add('active');
      currentCategory = tabBtn.dataset.cat || 'nuclear';
      renderChips(currentCategory);
    });
  });

  // Limpiar
  modal.querySelector('#btn-formula-clear')?.addEventListener('click', () => {
    inputLatex.value = '';
    updatePreview();
    inputLatex.focus();
  });

  // Copiar al portapapeles
  modal.querySelector('#btn-formula-copy')?.addEventListener('click', () => {
    const val = inputLatex.value.trim();
    if (val) {
      navigator.clipboard.writeText(val.startsWith('$') ? val : `$${val}$`).catch(() => {});
      nativeService.triggerHaptics('light');
      const copyBtn = modal.querySelector('#btn-formula-copy');
      if (copyBtn) copyBtn.textContent = '¡Copiado! ✓';
      setTimeout(() => {
        if (copyBtn) copyBtn.textContent = '📋 Copiar Código';
      }, 1500);
    }
  });

  // Insertar y cerrar
  const closeModal = () => {
    modal.remove();
    options.onClose?.();
  };

  modal.querySelector('#btn-close-formula-modal')?.addEventListener('click', closeModal);

  modal.querySelector('#btn-formula-insert')?.addEventListener('click', () => {
    const val = inputLatex.value.trim();
    if (val) {
      const finalFormula = val.startsWith('$') ? val : `$${val}$`;
      options.onInsert?.(finalFormula);
    }
    closeModal();
  });
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
