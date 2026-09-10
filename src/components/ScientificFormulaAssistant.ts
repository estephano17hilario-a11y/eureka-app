import { katexService } from '../services/katex.service';
import { nativeService } from '../services/native.service';

export interface FormulaSnippet {
  label: string;
  latex: string;
  display?: string;
  category: 'algebra' | 'calculo' | 'nuclear' | 'griego' | 'trig' | 'logica';
}

export const SCIENTIFIC_SNIPPETS: FormulaSnippet[] = [
  // ==========================================
  // 1. ÁLGEBRA, ARITMÉTICA & MATRICES
  // ==========================================
  { label: 'Fracción simple', latex: '\\frac{a}{b}', category: 'algebra' },
  { label: 'Fracción 1/2', latex: '\\frac{1}{2}', category: 'algebra' },
  { label: 'Potencia x²', latex: 'x^{2}', category: 'algebra' },
  { label: 'Potencia general', latex: 'x^{n}', category: 'algebra' },
  { label: 'Subíndice', latex: 'x_{i}', category: 'algebra' },
  { label: 'Doble subíndice', latex: 'A_{i,j}', category: 'algebra' },
  { label: 'Raíz cuadrada', latex: '\\sqrt{x}', category: 'algebra' },
  { label: 'Raíz n-ésima', latex: '\\sqrt[n]{x}', category: 'algebra' },
  { label: 'Más/Menos', latex: '\\pm', category: 'algebra' },
  { label: 'Menos/Más', latex: '\\mp', category: 'algebra' },
  { label: 'Multiplicación (×)', latex: '\\times', category: 'algebra' },
  { label: 'Punto de producto (·)', latex: '\\cdot', category: 'algebra' },
  { label: 'División (÷)', latex: '\\div', category: 'algebra' },
  { label: 'Diferente (≠)', latex: '\\neq', category: 'algebra' },
  { label: 'Aproximado (≈)', latex: '\\approx', category: 'algebra' },
  { label: 'Equivalente (≡)', latex: '\\equiv', category: 'algebra' },
  { label: 'Proporcional (∝)', latex: '\\propto', category: 'algebra' },
  { label: 'Menor o igual (≤)', latex: '\\le', category: 'algebra' },
  { label: 'Mayor o igual (≥)', latex: '\\ge', category: 'algebra' },
  { label: 'Mucho menor (≪)', latex: '\\ll', category: 'algebra' },
  { label: 'Mucho mayor (≫)', latex: '\\gg', category: 'algebra' },
  { label: 'Infinito (∞)', latex: '\\infty', category: 'algebra' },
  { label: 'Ecuación Cuadrática', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', category: 'algebra' },
  { label: 'Binomio al Cuadrado', latex: '(a + b)^2 = a^2 + 2ab + b^2', category: 'algebra' },
  { label: 'Diferencia de Cuadrados', latex: 'a^2 - b^2 = (a-b)(a+b)', category: 'algebra' },
  { label: 'Matriz 2x2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', category: 'algebra' },
  { label: 'Matriz 3x3', latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}', category: 'algebra' },
  { label: 'Determinante 2x2', latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', category: 'algebra' },
  { label: 'Vector Columna', latex: '\\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}', category: 'algebra' },
  { label: 'Vector flecha', latex: '\\vec{v}', category: 'algebra' },
  { label: 'Vector unitario', latex: '\\hat{u}', category: 'algebra' },
  { label: 'Valor absoluto / Norma', latex: '|x|', category: 'algebra' },
  { label: 'Norma euclidiana', latex: '\\|\\vec{v}\\|', category: 'algebra' },
  { label: 'Factorial', latex: 'n!', category: 'algebra' },
  { label: 'Coeficiente Binomial', latex: '\\binom{n}{k}', category: 'algebra' },

  // ==========================================
  // 2. CÁLCULO, ANÁLISIS & LÍMITES
  // ==========================================
  { label: 'Derivada ordinaria', latex: '\\frac{df}{dx}', category: 'calculo' },
  { label: 'Segunda derivada', latex: '\\frac{d^2f}{dx^2}', category: 'calculo' },
  { label: 'Derivada prima', latex: "f'(x)", category: 'calculo' },
  { label: 'Segunda derivada prima', latex: "f''(x)", category: 'calculo' },
  { label: 'Derivada temporal', latex: '\\dot{x}', category: 'calculo' },
  { label: 'Derivada Parcial', latex: '\\frac{\\partial f}{\\partial x}', category: 'calculo' },
  { label: 'Segunda Derivada Parcial', latex: '\\frac{\\partial^2 f}{\\partial x^2}', category: 'calculo' },
  { label: 'Derivada Mixta', latex: '\\frac{\\partial^2 f}{\\partial x \\partial y}', category: 'calculo' },
  { label: 'Integral Indefinida', latex: '\\int f(x) \\, dx', category: 'calculo' },
  { label: 'Integral Definida', latex: '\\int_{a}^{b} f(x) \\, dx', category: 'calculo' },
  { label: 'Integral Doble', latex: '\\iint_D f(x,y) \\, dA', category: 'calculo' },
  { label: 'Integral Triple', latex: '\\iiint_V f(x,y,z) \\, dV', category: 'calculo' },
  { label: 'Integral de Línea/Cerrada', latex: '\\oint_C \\vec{F} \\cdot d\\vec{r}', category: 'calculo' },
  { label: 'Límite cuando x➔0', latex: '\\lim_{x \\to 0} f(x)', category: 'calculo' },
  { label: 'Límite al infinito', latex: '\\lim_{x \\to \\infty} f(x)', category: 'calculo' },
  { label: 'Límite por la izquierda', latex: '\\lim_{x \\to a^-} f(x)', category: 'calculo' },
  { label: 'Límite por la derecha', latex: '\\lim_{x \\to a^+} f(x)', category: 'calculo' },
  { label: 'Sumatoria finita', latex: '\\sum_{i=1}^{n} a_i', category: 'calculo' },
  { label: 'Serie infinita', latex: '\\sum_{k=0}^{\\infty} a_k', category: 'calculo' },
  { label: 'Productoria', latex: '\\prod_{i=1}^{n} x_i', category: 'calculo' },
  { label: 'Operador Gradiente', latex: '\\nabla f', category: 'calculo' },
  { label: 'Divergencia', latex: '\\nabla \\cdot \\vec{F}', category: 'calculo' },
  { label: 'Rotacional (Curl)', latex: '\\nabla \\times \\vec{F}', category: 'calculo' },
  { label: 'Laplaciano', latex: '\\Delta f = \\nabla^2 f', category: 'calculo' },
  { label: 'Diferencial dx', latex: 'dx', category: 'calculo' },
  { label: 'Diferencial dt', latex: 'dt', category: 'calculo' },
  { label: 'Incremento Delta', latex: '\\Delta x', category: 'calculo' },

  // ==========================================
  // 3. FÍSICA NUCLEAR & QUÍMICA (mhchem)
  // ==========================================
  { label: 'Cesio-133 (Reloj atómico)', latex: '\\ce{^{133}_{55}Cs}', category: 'nuclear' },
  { label: 'Uranio-235 (Fisión)', latex: '\\ce{^{235}_{92}U}', category: 'nuclear' },
  { label: 'Uranio-238', latex: '\\ce{^{238}_{92}U}', category: 'nuclear' },
  { label: 'Plutonio-239', latex: '\\ce{^{239}_{94}Pu}', category: 'nuclear' },
  { label: 'Carbono-14 (Datación)', latex: '\\ce{^{14}_{6}C}', category: 'nuclear' },
  { label: 'Carbono-12', latex: '\\ce{^{12}_{6}C}', category: 'nuclear' },
  { label: 'Hidrógeno / Protio', latex: '\\ce{^{1}_{1}H}', category: 'nuclear' },
  { label: 'Deuterio', latex: '\\ce{^{2}_{1}H}', category: 'nuclear' },
  { label: 'Tritio', latex: '\\ce{^{3}_{1}H}', category: 'nuclear' },
  { label: 'Partícula Alfa (He-4)', latex: '\\ce{^{4}_{2}\\alpha}', category: 'nuclear' },
  { label: 'Partícula Beta menos', latex: '\\ce{^{0}_{-1}\\beta}', category: 'nuclear' },
  { label: 'Positrón (Beta más)', latex: '\\ce{^{0}_{+1}\\beta}', category: 'nuclear' },
  { label: 'Neutrón libre', latex: '\\ce{^{1}_{0}n}', category: 'nuclear' },
  { label: 'Protón', latex: '\\ce{^{1}_{1}p}', category: 'nuclear' },
  { label: 'Electrón', latex: '\\ce{e^-}', category: 'nuclear' },
  { label: 'Radiación Gamma', latex: '\\gamma', category: 'nuclear' },
  { label: 'Neutrino', latex: '\\nu_e', category: 'nuclear' },
  { label: 'Antineutrino', latex: '\\bar{\\nu}_e', category: 'nuclear' },
  { label: 'Reacción Fisión U-235', latex: '\\ce{^{235}_{92}U + ^{1}_{0}n -> ^{141}_{56}Ba + ^{92}_{36}Kr + 3 ^{1}_{0}n}', category: 'nuclear' },
  { label: 'Fusión Deuterio-Tritio', latex: '\\ce{^{2}_{1}H + ^{3}_{1}H -> ^{4}_{2}He + ^{1}_{0}n + 17.6\\text{ MeV}}', category: 'nuclear' },
  { label: 'Equivalencia Einstein', latex: '\\Delta E = \\Delta m c^2', category: 'nuclear' },
  { label: 'Energía de Fotón', latex: 'E = h\\nu = \\frac{hc}{\\lambda}', category: 'nuclear' },
  { label: 'Longitud De Broglie', latex: '\\lambda = \\frac{h}{p}', category: 'nuclear' },
  { label: 'Defecto de Masa', latex: '\\Delta m = [Z m_p + (A-Z) m_n] - M', category: 'nuclear' },
  { label: 'Cinética Decaimiento', latex: '\\frac{dN(t)}{dt} = -\\lambda N(t)', category: 'nuclear' },
  { label: 'Ley Exponencial Nuclear', latex: 'N(t) = N_0 e^{-\\lambda t}', category: 'nuclear' },
  { label: 'Vida Media (t1/2)', latex: 't_{1/2} = \\frac{\\ln(2)}{\\lambda}', category: 'nuclear' },
  { label: 'Actividad Radiactiva', latex: 'A(t) = \\lambda N(t)', category: 'nuclear' },
  { label: 'Flecha Reacción Química', latex: '\\ce{->}', category: 'nuclear' },
  { label: 'Equilibrio Químico (⇌)', latex: '\\ce{<=>}', category: 'nuclear' },
  { label: 'Agua (Formación)', latex: '\\ce{2H2 + O2 -> 2H2O}', category: 'nuclear' },
  { label: 'Combustión Metano', latex: '\\ce{CH4 + 2O2 -> CO2 + 2H2O}', category: 'nuclear' },
  { label: 'Fotosíntesis', latex: '\\ce{6CO2 + 6H2O -> C6H12O6 + 6O2}', category: 'nuclear' },
  { label: 'Ácido Sulfúrico', latex: '\\ce{H2SO4}', category: 'nuclear' },
  { label: 'Gas Ideal (PV=nRT)', latex: 'P V = n R T', category: 'nuclear' },
  { label: 'Energía Libre Gibbs', latex: '\\Delta G = \\Delta H - T\\Delta S', category: 'nuclear' },

  // ==========================================
  // 4. ALFABETO GRIEGO COMPLETO
  // ==========================================
  // Minúsculas (24 letras)
  { label: 'Alfa (α)', latex: '\\alpha', category: 'griego' },
  { label: 'Beta (β)', latex: '\\beta', category: 'griego' },
  { label: 'Gamma (γ)', latex: '\\gamma', category: 'griego' },
  { label: 'Delta (δ)', latex: '\\delta', category: 'griego' },
  { label: 'Épsilon (ϵ)', latex: '\\epsilon', category: 'griego' },
  { label: 'Varepsilon (ε)', latex: '\\varepsilon', category: 'griego' },
  { label: 'Zeta (ζ)', latex: '\\zeta', category: 'griego' },
  { label: 'Eta (η)', latex: '\\eta', category: 'griego' },
  { label: 'Theta (θ)', latex: '\\theta', category: 'griego' },
  { label: 'Vartheta (ϑ)', latex: '\\vartheta', category: 'griego' },
  { label: 'Iota (ι)', latex: '\\iota', category: 'griego' },
  { label: 'Kappa (κ)', latex: '\\kappa', category: 'griego' },
  { label: 'Lambda (λ)', latex: '\\lambda', category: 'griego' },
  { label: 'Mu (μ)', latex: '\\mu', category: 'griego' },
  { label: 'Nu (ν)', latex: '\\nu', category: 'griego' },
  { label: 'Xi (ξ)', latex: '\\xi', category: 'griego' },
  { label: 'Pi (π)', latex: '\\pi', category: 'griego' },
  { label: 'Varpi (ϖ)', latex: '\\varpi', category: 'griego' },
  { label: 'Rho (ρ)', latex: '\\rho', category: 'griego' },
  { label: 'Varrho (ϱ)', latex: '\\varrho', category: 'griego' },
  { label: 'Sigma (σ)', latex: '\\sigma', category: 'griego' },
  { label: 'Varsigma (ς)', latex: '\\varsigma', category: 'griego' },
  { label: 'Tau (τ)', latex: '\\tau', category: 'griego' },
  { label: 'Ípsilon (υ)', latex: '\\upsilon', category: 'griego' },
  { label: 'Phi (ϕ)', latex: '\\phi', category: 'griego' },
  { label: 'Varphi (φ)', latex: '\\varphi', category: 'griego' },
  { label: 'Chi (χ)', latex: '\\chi', category: 'griego' },
  { label: 'Psi (ψ)', latex: '\\psi', category: 'griego' },
  { label: 'Omega (ω)', latex: '\\omega', category: 'griego' },

  // Mayúsculas
  { label: 'Gamma Mayúscula (Γ)', latex: '\\Gamma', category: 'griego' },
  { label: 'Delta Mayúscula (Δ)', latex: '\\Delta', category: 'griego' },
  { label: 'Theta Mayúscula (Θ)', latex: '\\Theta', category: 'griego' },
  { label: 'Lambda Mayúscula (Λ)', latex: '\\Lambda', category: 'griego' },
  { label: 'Xi Mayúscula (Ξ)', latex: '\\Xi', category: 'griego' },
  { label: 'Pi Mayúscula (Π)', latex: '\\Pi', category: 'griego' },
  { label: 'Sigma Mayúscula (Σ)', latex: '\\Sigma', category: 'griego' },
  { label: 'Ípsilon Mayúscula (Υ)', latex: '\\Upsilon', category: 'griego' },
  { label: 'Phi Mayúscula (Φ)', latex: '\\Phi', category: 'griego' },
  { label: 'Psi Mayúscula (Ψ)', latex: '\\Psi', category: 'griego' },
  { label: 'Omega Mayúscula (Ω)', latex: '\\Omega', category: 'griego' },

  // ==========================================
  // 5. TRIGONOMETRÍA & FUNCIONES
  // ==========================================
  { label: 'Seno', latex: '\\sin(x)', category: 'trig' },
  { label: 'Coseno', latex: '\\cos(x)', category: 'trig' },
  { label: 'Tangente', latex: '\\tan(x)', category: 'trig' },
  { label: 'Secante', latex: '\\sec(x)', category: 'trig' },
  { label: 'Cosecante', latex: '\\csc(x)', category: 'trig' },
  { label: 'Cotangente', latex: '\\cot(x)', category: 'trig' },
  { label: 'Arcoseno', latex: '\\arcsin(x)', category: 'trig' },
  { label: 'Arcocoseno', latex: '\\arccos(x)', category: 'trig' },
  { label: 'Arcotangente', latex: '\\arctan(x)', category: 'trig' },
  { label: 'Seno hiperbólico', latex: '\\sinh(x)', category: 'trig' },
  { label: 'Coseno hiperbólico', latex: '\\cosh(x)', category: 'trig' },
  { label: 'Tangente hiperbólica', latex: '\\tanh(x)', category: 'trig' },
  { label: 'Identidad Pitagórica', latex: '\\sin^2(x) + \\cos^2(x) = 1', category: 'trig' },
  { label: 'Seno del ángulo doble', latex: '\\sin(2x) = 2\\sin(x)\\cos(x)', category: 'trig' },
  { label: 'Coseno ángulo doble', latex: '\\cos(2x) = \\cos^2(x) - \\sin^2(x)', category: 'trig' },
  { label: 'Exponencial e^x', latex: 'e^{x}', category: 'trig' },
  { label: 'Identidad de Euler', latex: 'e^{i\\pi} + 1 = 0', category: 'trig' },
  { label: 'Logaritmo natural', latex: '\\ln(x)', category: 'trig' },
  { label: 'Logaritmo base 10', latex: '\\log_{10}(x)', category: 'trig' },
  { label: 'Logaritmo base b', latex: '\\log_{b}(x)', category: 'trig' },
  { label: 'Media poblacional', latex: '\\mu = \\frac{1}{N}\\sum_{i=1}^N x_i', category: 'trig' },
  { label: 'Desviación estándar', latex: '\\sigma = \\sqrt{\\frac{1}{N}\\sum (x_i-\\mu)^2}', category: 'trig' },

  // ==========================================
  // 6. LÓGICA, TEORÍA DE CONJUNTOS & GEOMETRÍA
  // ==========================================
  { label: 'Reales (ℝ)', latex: '\\mathbb{R}', category: 'logica' },
  { label: 'Naturales (ℕ)', latex: '\\mathbb{N}', category: 'logica' },
  { label: 'Enteros (ℤ)', latex: '\\mathbb{Z}', category: 'logica' },
  { label: 'Racionales (ℚ)', latex: '\\mathbb{Q}', category: 'logica' },
  { label: 'Complejos (ℂ)', latex: '\\mathbb{C}', category: 'logica' },
  { label: 'Pertenece (∈)', latex: '\\in', category: 'logica' },
  { label: 'No pertenece (∉)', latex: '\\notin', category: 'logica' },
  { label: 'Subconjunto (⊂)', latex: '\\subset', category: 'logica' },
  { label: 'Subconjunto o igual (⊆)', latex: '\\subseteq', category: 'logica' },
  { label: 'Unión (∪)', latex: '\\cup', category: 'logica' },
  { label: 'Intersección (∩)', latex: '\\cap', category: 'logica' },
  { label: 'Conjunto Vacío (∅)', latex: '\\emptyset', category: 'logica' },
  { label: 'Diferencia (\\)', latex: 'A \\setminus B', category: 'logica' },
  { label: 'Para todo (∀)', latex: '\\forall', category: 'logica' },
  { label: 'Existe (∃)', latex: '\\exists', category: 'logica' },
  { label: 'No existe (∄)', latex: '\\nexists', category: 'logica' },
  { label: 'Implica (⟹)', latex: '\\implies', category: 'logica' },
  { label: 'Si y solo si (⟺)', latex: '\\iff', category: 'logica' },
  { label: 'Y lógico (∧)', latex: '\\land', category: 'logica' },
  { label: 'O lógico (∨)', latex: '\\lor', category: 'logica' },
  { label: 'Negación (¬)', latex: '\\neg', category: 'logica' },
  { label: 'Por lo tanto (∴)', latex: '\\therefore', category: 'logica' },
  { label: 'Porque (∵)', latex: '\\because', category: 'logica' },
  { label: 'Ángulo (∠)', latex: '\\angle A', category: 'logica' },
  { label: 'Perpendicular (⊥)', latex: 'A \\perp B', category: 'logica' },
  { label: 'Paralelo (∥)', latex: 'A \\parallel B', category: 'logica' },
  { label: 'Congruente (≅)', latex: '\\triangle ABC \\cong \\triangle DEF', category: 'logica' },
  { label: 'Semejante (~)', latex: '\\triangle ABC \\sim \\triangle DEF', category: 'logica' },
  { label: 'Triángulo (△)', latex: '\\triangle', category: 'logica' },
  { label: 'Grados (°)', latex: '90^\\circ', category: 'logica' }
];

export interface FormulaAssistantOptions {
  initialLatex?: string;
  onInsert?: (latex: string) => void;
  onClose?: () => void;
}

/**
 * Abre el Recuadro y Asistente Científico KaTeX universal con catálogo 100% categorizado.
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
            <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#fff;">Asistente Científico Universal KaTeX</h3>
            <span style="font-size:0.75rem; color:var(--f-text-muted);">Álgebra, Cálculo, Física Nuclear, Química mhchem, Griego y Lógica</span>
          </div>
        </div>
        <button id="btn-close-formula-modal" class="figma-icon-btn-ghost" style="font-size:1.3rem; color:var(--f-text-secondary);">✕</button>
      </div>

      <!-- Lienzo de Previsualización en Vivo -->
      <div class="formula-live-preview-box">
        <div class="preview-box-tag">PREVISUALIZACIÓN EN VIVO (KaTeX + mhchem):</div>
        <div class="preview-rendered-output" id="formula-rendered-view">
          ${katexService.parseAndRender(options.initialLatex ? (options.initialLatex.includes('$') ? options.initialLatex : `$${options.initialLatex}$`) : '$\\Delta E = \\Delta m c^2$')}
        </div>
      </div>

      <!-- Input de Edición de Fórmula -->
      <div class="formula-input-row">
        <label style="font-size:0.78rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase;">Código LaTeX / Expresión:</label>
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

      <!-- Barra de Categorías Completa -->
      <div class="formula-categories-bar">
        <button class="formula-cat-tab active" data-cat="nuclear">⚛️ Física Nuclear & Química</button>
        <button class="formula-cat-tab" data-cat="calculo">📈 Cálculo & Integrales</button>
        <button class="formula-cat-tab" data-cat="algebra">📐 Álgebra & Matrices</button>
        <button class="formula-cat-tab" data-cat="griego">🇬🇷 Alfabeto Griego</button>
        <button class="formula-cat-tab" data-cat="trig">🌐 Trigonometría</button>
        <button class="formula-cat-tab" data-cat="logica">🧠 Lógica & Conjuntos</button>
      </div>

      <!-- Buscador rápido dentro del catálogo -->
      <div style="padding: 0 16px 8px 16px;">
        <input 
          type="text" 
          id="input-formula-search-symbols" 
          placeholder="🔍 Filtrar símbolos en esta categoría (ej. integral, alfa, matriz)..." 
          class="formula-text-input"
          style="padding: 8px 12px; font-size: 0.82rem; background: rgba(255,255,255,0.04);"
        />
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
          ✨ Insertar Fórmula ➔
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const inputLatex = modal.querySelector('#input-formula-latex') as HTMLInputElement;
  const searchInput = modal.querySelector('#input-formula-search-symbols') as HTMLInputElement;
  const renderedView = modal.querySelector('#formula-rendered-view') as HTMLElement;
  const chipsMount = modal.querySelector('#formula-chips-mount') as HTMLElement;

  let currentCategory = 'nuclear';

  const updatePreview = () => {
    const val = inputLatex.value.trim();
    if (!val) {
      renderedView.innerHTML = '<span style="color:var(--f-text-muted); font-size:0.88rem;">Escribe una fórmula o selecciona un símbolo del catálogo</span>';
      return;
    }
    const wrapped = val.includes('$') || val.includes('\\ce{') ? val : `$${val}$`;
    renderedView.innerHTML = katexService.parseAndRender(wrapped);
  };

  const renderChips = (category: string, filterText: string = '') => {
    let filtered = SCIENTIFIC_SNIPPETS.filter((s) => s.category === category);
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      filtered = filtered.filter((s) => s.label.toLowerCase().includes(q) || s.latex.toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      chipsMount.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--f-text-muted); padding: 24px; font-size: 0.88rem;">No se encontraron símbolos para "${filterText}"</div>`;
      return;
    }

    chipsMount.innerHTML = filtered
      .map(
        (item) => `
      <button class="formula-chip-item" data-latex="${escapeAttr(item.latex)}" title="${escapeAttr(item.label)}">
        <span class="chip-rendered">${katexService.parseAndRender(item.latex.startsWith('\\ce{') || item.latex.includes('$') ? item.latex : `$${item.latex}$`)}</span>
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
  searchInput?.addEventListener('input', () => {
    renderChips(currentCategory, searchInput.value);
  });

  // Selector de Categoría
  modal.querySelectorAll<HTMLButtonElement>('.formula-cat-tab').forEach((tabBtn) => {
    tabBtn.addEventListener('click', () => {
      modal.querySelectorAll('.formula-cat-tab').forEach((b) => b.classList.remove('active'));
      tabBtn.classList.add('active');
      currentCategory = tabBtn.dataset.cat || 'nuclear';
      if (searchInput) searchInput.value = '';
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
      navigator.clipboard.writeText(val.includes('$') ? val : `$${val}$`).catch(() => {});
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
      const finalFormula = val.includes('$') || val.startsWith('\\ce{') ? val : `$${val}$`;
      options.onInsert?.(finalFormula);
    }
    closeModal();
  });
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
