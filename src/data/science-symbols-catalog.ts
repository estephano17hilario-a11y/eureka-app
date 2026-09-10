export type SymbolCategory =
  | 'algebra'
  | 'calculus'
  | 'physics'
  | 'astronomy'
  | 'chemistry'
  | 'biology'
  | 'logic'
  | 'greek'
  | 'romans';

export interface ScienceSymbol {
  id: string;
  label: string;
  latex: string;
  category: SymbolCategory;
  subcategory?: string;
  keywords: string[];
}

export interface CategoryTabMeta {
  id: SymbolCategory;
  name: string;
  icon: string;
}

export const SCIENCE_CATEGORY_TABS: CategoryTabMeta[] = [
  { id: 'algebra', name: 'Álgebra & Matrices', icon: '📐' },
  { id: 'calculus', name: 'Cálculo & Análisis', icon: '📈' },
  { id: 'physics', name: 'Física & Cuántica', icon: '⚡' },
  { id: 'astronomy', name: 'Astronomía', icon: '🪐' },
  { id: 'chemistry', name: 'Química & Nuclear', icon: '⚛️' },
  { id: 'biology', name: 'Biología & Genética', icon: '🧬' },
  { id: 'logic', name: 'Lógica & Conjuntos', icon: '🧠' },
  { id: 'greek', name: 'Alfabeto Griego', icon: '🇬🇷' },
  { id: 'romans', name: 'Números Romanos', icon: '🏛️' }
];

export const SCIENCE_SYMBOLS_CATALOG: ScienceSymbol[] = [
  // =========================================================================
  // 1. ÁLGEBRA, MATRICES & TIPOGRAFÍAS ESPECIALES
  // =========================================================================
  // Operaciones & Fracciones
  { id: 'alg-frac', label: 'Fracción', latex: '\\frac{#@}{#?}', category: 'algebra', subcategory: 'Básico', keywords: ['fraccion', 'fraction', 'dividir', 'sobre', 'ab', 'quebrado', 'racional'] },
  { id: 'alg-pow2', label: 'Cuadrado x²', latex: '^{2}', category: 'algebra', subcategory: 'Básico', keywords: ['potencia', 'cuadrado', 'square', 'exponente', 'dos'] },
  { id: 'alg-pow-n', label: 'Potencia xⁿ', latex: '^{#?}', category: 'algebra', subcategory: 'Básico', keywords: ['potencia', 'power', 'exponente', 'elevado', 'superindice'] },
  { id: 'alg-sub', label: 'Subíndice xᵢ', latex: '_{#?}', category: 'algebra', subcategory: 'Básico', keywords: ['subindice', 'subscript', 'indice', 'i'] },
  { id: 'alg-sqrt', label: 'Raíz cuadrada', latex: '\\sqrt{#?}', category: 'algebra', subcategory: 'Radicales', keywords: ['raiz', 'cuadrada', 'root', 'sqrt', 'radical'] },
  { id: 'alg-nroot', label: 'Raíz n-ésima', latex: '\\sqrt[#?]{#?}', category: 'algebra', subcategory: 'Radicales', keywords: ['raiz', 'nesima', 'indice', 'nroot'] },
  { id: 'alg-abs', label: 'Valor Absoluto |x|', latex: '|#?|', category: 'algebra', subcategory: 'Básico', keywords: ['absoluto', 'modulo', 'norma', 'barras', 'abs'] },
  { id: 'alg-norm', label: 'Norma Vectorial ‖v‖', latex: '\\|#?\\|', category: 'algebra', subcategory: 'Básico', keywords: ['norma', 'magnitud', 'vector', 'doble barra'] },
  { id: 'alg-pm', label: 'Más/Menos ±', latex: '\\pm', category: 'algebra', subcategory: 'Operadores', keywords: ['mas', 'menos', 'plus', 'minus', 'pm'] },
  { id: 'alg-mp', label: 'Menos/Más ∓', latex: '\\mp', category: 'algebra', subcategory: 'Operadores', keywords: ['menos', 'mas', 'mp'] },
  { id: 'alg-times', label: 'Multiplicación ×', latex: '\\times', category: 'algebra', subcategory: 'Operadores', keywords: ['por', 'multiplicar', 'times', 'cruz', 'producto'] },
  { id: 'alg-cdot', label: 'Punto Producto ·', latex: '\\cdot', category: 'algebra', subcategory: 'Operadores', keywords: ['punto', 'dot', 'producto escalar', 'multiplicacion'] },
  { id: 'alg-div', label: 'División ÷', latex: '\\div', category: 'algebra', subcategory: 'Operadores', keywords: ['entre', 'dividir', 'division', 'slash'] },
  { id: 'alg-neq', label: 'Distinto ≠', latex: '\\ne', category: 'algebra', subcategory: 'Relaciones', keywords: ['distinto', 'diferente', 'no igual', 'neq', 'different'] },
  { id: 'alg-approx', label: 'Aproximado ≈', latex: '\\approx', category: 'algebra', subcategory: 'Relaciones', keywords: ['aproximado', 'casi', 'approx', 'similar'] },
  { id: 'alg-equiv', label: 'Equivalente ≡', latex: '\\equiv', category: 'algebra', subcategory: 'Relaciones', keywords: ['equivalente', 'congruente', 'identidad', 'equiv'] },
  { id: 'alg-prop', label: 'Proporcional ∝', latex: '\\propto', category: 'algebra', subcategory: 'Relaciones', keywords: ['proporcional', 'proporcion', 'alpha', 'prop'] },
  { id: 'alg-le', label: 'Menor o igual ≤', latex: '\\le', category: 'algebra', subcategory: 'Relaciones', keywords: ['menor igual', 'less equal', 'le'] },
  { id: 'alg-ge', label: 'Mayor o igual ≥', latex: '\\ge', category: 'algebra', subcategory: 'Relaciones', keywords: ['mayor igual', 'greater equal', 'ge'] },
  { id: 'alg-ll', label: 'Mucho menor ≪', latex: '\\ll', category: 'algebra', subcategory: 'Relaciones', keywords: ['mucho menor', 'much less', 'despreciable'] },
  { id: 'alg-gg', label: 'Mucho mayor ≫', latex: '\\gg', category: 'algebra', subcategory: 'Relaciones', keywords: ['mucho mayor', 'much greater', 'dominante'] },
  { id: 'alg-inf', label: 'Infinito ∞', latex: '\\infty', category: 'algebra', subcategory: 'Constantes', keywords: ['infinito', 'infinity', 'limite'] },
  { id: 'alg-fact', label: 'Factorial n!', latex: 'n!', category: 'algebra', subcategory: 'Combinatoria', keywords: ['factorial', 'admiracion', 'permutacion'] },
  { id: 'alg-binom', label: 'Binomial (n k)', latex: '\\binom{#?}{#?}', category: 'algebra', subcategory: 'Combinatoria', keywords: ['combinacion', 'binomial', 'coeficiente', 'newton'] },
  
  // Matrices & Vectores
  { id: 'alg-mat2', label: 'Matriz 2×2', latex: '\\begin{pmatrix} #? & #? \\\\ #? & #? \\end{pmatrix}', category: 'algebra', subcategory: 'Matrices', keywords: ['matriz', 'matrix', '2x2', 'sistema', 'algebra lineal'] },
  { id: 'alg-mat3', label: 'Matriz 3×3', latex: '\\begin{pmatrix} #? & #? & #? \\\\ #? & #? & #? \\\\ #? & #? & #? \\end{pmatrix}', category: 'algebra', subcategory: 'Matrices', keywords: ['matriz', 'matrix', '3x3', 'tres por tres'] },
  { id: 'alg-det2', label: 'Determinante 2×2', latex: '\\begin{vmatrix} #? & #? \\\\ #? & #? \\end{vmatrix}', category: 'algebra', subcategory: 'Matrices', keywords: ['determinante', 'det', '2x2', 'cramer'] },
  { id: 'alg-vec-col', label: 'Vector Columna', latex: '\\begin{pmatrix} #? \\\\ #? \\\\ #? \\end{pmatrix}', category: 'algebra', subcategory: 'Vectores', keywords: ['vector', 'columna', 'coordenadas', '3d'] },
  { id: 'alg-vec', label: 'Vector flecha v⃗', latex: '\\vec{#?}', category: 'algebra', subcategory: 'Vectores', keywords: ['vector', 'flecha', 'arrow', 'direccion'] },
  { id: 'alg-unit', label: 'Vector unitario û', latex: '\\hat{#?}', category: 'algebra', subcategory: 'Vectores', keywords: ['unitario', 'versor', 'gorro', 'hat'] },
  { id: 'alg-quad-eq', label: 'Ecuación Cuadrática', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', category: 'algebra', subcategory: 'Fórmulas', keywords: ['formula general', 'baskara', 'cuadratica', 'polinomio'] },

  // Conjuntos Numéricos Blackboard (\mathbb)
  { id: 'alg-bb-r', label: 'Reales ℝ', latex: '\\mathbb{R}', category: 'algebra', subcategory: 'Conjuntos Numéricos', keywords: ['reales', 'real', 'numeros reales', 'blackboard', 'r'] },
  { id: 'alg-bb-n', label: 'Naturales ℕ', latex: '\\mathbb{N}', category: 'algebra', subcategory: 'Conjuntos Numéricos', keywords: ['naturales', 'conteo', 'natural', 'n'] },
  { id: 'alg-bb-z', label: 'Enteros ℤ', latex: '\\mathbb{Z}', category: 'algebra', subcategory: 'Conjuntos Numéricos', keywords: ['enteros', 'negativos', 'z'] },
  { id: 'alg-bb-q', label: 'Racionales ℚ', latex: '\\mathbb{Q}', category: 'algebra', subcategory: 'Conjuntos Numéricos', keywords: ['racionales', 'fraccionarios', 'q'] },
  { id: 'alg-bb-c', label: 'Complejos ℂ', latex: '\\mathbb{C}', category: 'algebra', subcategory: 'Conjuntos Numéricos', keywords: ['complejos', 'imaginarios', 'c'] },
  { id: 'alg-bb-p', label: 'Primos ℙ', latex: '\\mathbb{P}', category: 'algebra', subcategory: 'Conjuntos Numéricos', keywords: ['primos', 'probabilidad', 'p'] },
  { id: 'alg-bb-h', label: 'Cuaterniones ℍ', latex: '\\mathbb{H}', category: 'algebra', subcategory: 'Conjuntos Numéricos', keywords: ['cuaterniones', 'hamilton', 'h'] },

  // Tipografías Caligráfica & Fraktur & Hebreo
  { id: 'alg-cal-l', label: 'Lagrangiano ℒ', latex: '\\mathcal{L}', category: 'algebra', subcategory: 'Caligráfica', keywords: ['lagrangiano', 'laplace', 'transformada', 'caligrafica', 'l'] },
  { id: 'alg-cal-h', label: 'Hamiltoniano ℋ', latex: '\\mathcal{H}', category: 'algebra', subcategory: 'Caligráfica', keywords: ['hamiltoniano', 'hilbert', 'energia', 'h'] },
  { id: 'alg-cal-f', label: 'Fourier ℱ', latex: '\\mathcal{F}', category: 'algebra', subcategory: 'Caligráfica', keywords: ['fourier', 'transformada', 'f'] },
  { id: 'alg-cal-o', label: 'Orden O grande 𝒪', latex: '\\mathcal{O}', category: 'algebra', subcategory: 'Caligráfica', keywords: ['asintotica', 'complejidad', 'big o', 'o'] },
  { id: 'alg-frak-g', label: 'Álgebra Lie 𝔤', latex: '\\mathfrak{g}', category: 'algebra', subcategory: 'Fraktur', keywords: ['fraktur', 'lie', 'algebra', 'german'] },
  { id: 'alg-aleph', label: 'Álef ℵ', latex: '\\aleph', category: 'algebra', subcategory: 'Hebreo', keywords: ['alef', 'aleph', 'cardinal', 'infinito', 'hebreo'] },
  { id: 'alg-beth', label: 'Bet ℶ', latex: '\\beth', category: 'algebra', subcategory: 'Hebreo', keywords: ['bet', 'beth', 'hebreo', 'cardinal'] },

  // =========================================================================
  // 2. CÁLCULO & ANÁLISIS MATEMÁTICO
  // =========================================================================
  { id: 'calc-der', label: 'Derivada df/dx', latex: '\\frac{d#?}{dx}', category: 'calculus', subcategory: 'Derivadas', keywords: ['derivada', 'diferencial', 'razon de cambio', 'dx'] },
  { id: 'calc-der2', label: 'Segunda Derivada', latex: '\\frac{d^2#?}{dx^2}', category: 'calculus', subcategory: 'Derivadas', keywords: ['segunda derivada', 'aceleracion', 'concavidad'] },
  { id: 'calc-prime', label: 'Derivada prima f′', latex: "f'(x)", category: 'calculus', subcategory: 'Derivadas', keywords: ['prima', 'f prima', 'lagrange'] },
  { id: 'calc-pprime', label: 'Segunda prima f″', latex: "f''(x)", category: 'calculus', subcategory: 'Derivadas', keywords: ['segunda prima', 'f dos primas'] },
  { id: 'calc-dot', label: 'Derivada Newton ẋ', latex: '\\dot{#?}', category: 'calculus', subcategory: 'Derivadas', keywords: ['punto', 'velocidad', 'newton', 'tiempo'] },
  { id: 'calc-ddot', label: 'Aceleración ẍ', latex: '\\ddot{#?}', category: 'calculus', subcategory: 'Derivadas', keywords: ['dos puntos', 'aceleracion', 'tiempo'] },
  { id: 'calc-pder', label: 'Derivada Parcial ∂f/∂x', latex: '\\frac{\\partial #?}{\\partial #?}', category: 'calculus', subcategory: 'Cálculo Multivariable', keywords: ['parcial', 'partial', 'multivariable', 'jacobiano'] },
  { id: 'calc-pder2', label: 'Segunda Parcial ∂²f/∂x²', latex: '\\frac{\\partial^2 #?}{\\partial #?^2}', category: 'calculus', subcategory: 'Cálculo Multivariable', keywords: ['segunda parcial', 'laplace', 'hessiano'] },
  { id: 'calc-int-indef', label: 'Integral Indefinida', latex: '\\int #?\\,dx', category: 'calculus', subcategory: 'Integrales', keywords: ['integral', 'antiderivada', 'primitiva', 'dx'] },
  { id: 'calc-int-def', label: 'Integral Definida ∫ₐᵇ', latex: '\\int_{#?}^{#?} #?\\,dx', category: 'calculus', subcategory: 'Integrales', keywords: ['integral definida', 'area', 'riemann', 'limites'] },
  { id: 'calc-int-double', label: 'Integral Doble ∬', latex: '\\iint_{#?} #?\\,dA', category: 'calculus', subcategory: 'Integrales', keywords: ['integral doble', 'volumen', 'superficie', 'da'] },
  { id: 'calc-int-triple', label: 'Integral Triple ∭', latex: '\\iiint_{#?} #?\\,dV', category: 'calculus', subcategory: 'Integrales', keywords: ['integral triple', 'volumen', 'masa', 'dv'] },
  { id: 'calc-int-line', label: 'Integral de Línea ∮', latex: '\\oint_{#?} \\vec{#?} \\cdot d\\vec{r}', category: 'calculus', subcategory: 'Integrales', keywords: ['circulacion', 'camino cerrado', 'flujo', 'curva', 'ampere', 'gauss'] },
  { id: 'calc-lim-0', label: 'Límite x➔0', latex: '\\lim_{x \\to 0} #?', category: 'calculus', subcategory: 'Límites', keywords: ['limite', 'cero', 'lim', 'infinitesimo'] },
  { id: 'calc-lim-inf', label: 'Límite x➔∞', latex: '\\lim_{x \\to \\infty} #?', category: 'calculus', subcategory: 'Límites', keywords: ['limite infinito', 'asintota', 'convergencia'] },
  { id: 'calc-lim-left', label: 'Límite por Izquierda x➔a⁻', latex: '\\lim_{x \\to #?^-} #?', category: 'calculus', subcategory: 'Límites', keywords: ['limite lateral', 'izquierda', 'continuidad'] },
  { id: 'calc-lim-right', label: 'Límite por Derecha x➔a⁺', latex: '\\lim_{x \\to #?^+} #?', category: 'calculus', subcategory: 'Límites', keywords: ['limite lateral', 'derecha', 'continuidad'] },
  { id: 'calc-sum', label: 'Sumatoria ∑', latex: '\\sum_{#?}^{#?} #?', category: 'calculus', subcategory: 'Series', keywords: ['sumatoria', 'sigma', 'serie', 'suma'] },
  { id: 'calc-sum-inf', label: 'Serie Infinita ∑₀^∞', latex: '\\sum_{n=0}^{\\infty} #?', category: 'calculus', subcategory: 'Series', keywords: ['serie infinita', 'potencias', 'taylor'] },
  { id: 'calc-prod', label: 'Productoria ∏', latex: '\\prod_{#?}^{#?} #?', category: 'calculus', subcategory: 'Series', keywords: ['productoria', 'pi mayuscula', 'producto'] },
  { id: 'calc-grad', label: 'Gradiente ∇f', latex: '\\nabla #?', category: 'calculus', subcategory: 'Vectorial', keywords: ['gradiente', 'nabla', 'derivada direccional', 'pendiente'] },
  { id: 'calc-div', label: 'Divergencia ∇·F', latex: '\\nabla \\cdot \\vec{#?}', category: 'calculus', subcategory: 'Vectorial', keywords: ['divergencia', 'flujo', 'fuente', 'sumidero'] },
  { id: 'calc-rot', label: 'Rotacional ∇×F', latex: '\\nabla \\times \\vec{#?}', category: 'calculus', subcategory: 'Vectorial', keywords: ['rotacional', 'curl', 'vortice', 'giro'] },
  { id: 'calc-lap', label: 'Laplaciano ∇²f', latex: '\\Delta #? = \\nabla^2 #?', category: 'calculus', subcategory: 'Vectorial', keywords: ['laplaciano', 'onda', 'difusion', 'poisson'] },
  { id: 'calc-dx', label: 'Diferencial dx', latex: 'dx', category: 'calculus', subcategory: 'Diferenciales', keywords: ['dx', 'diferencial', 'variable x'] },
  { id: 'calc-dt', label: 'Diferencial dt', latex: 'dt', category: 'calculus', subcategory: 'Diferenciales', keywords: ['dt', 'tiempo', 'diferencial'] },

  // =========================================================================
  // 3. FÍSICA & CUÁNTICA
  // =========================================================================
  // Mecánica & Cinemática
  { id: 'phy-newton2', label: '2ª Ley Newton F = ma', latex: '\\vec{F} = m \\vec{a}', category: 'physics', subcategory: 'Mecánica Clásica', keywords: ['fuerza', 'newton', 'masa', 'aceleracion', 'dinamica'] },
  { id: 'phy-p', label: 'Momento Lineal p = mv', latex: '\\vec{p} = m \\vec{v}', category: 'physics', subcategory: 'Mecánica Clásica', keywords: ['cantidad de movimiento', 'momento', 'momentum', 'impulso'] },
  { id: 'phy-ek', label: 'Energía Cinética ½mv²', latex: 'E_k = \\frac{1}{2} m v^2', category: 'physics', subcategory: 'Mecánica Clásica', keywords: ['energia', 'cinetica', 'velocidad', 'joules'] },
  { id: 'phy-ep', label: 'Energía Potencial mgh', latex: 'E_p = m g h', category: 'physics', subcategory: 'Mecánica Clásica', keywords: ['potencial', 'gravedad', 'altura'] },
  { id: 'phy-torque', label: 'Torque / Momento τ', latex: '\\vec{\\tau} = \\vec{r} \\times \\vec{F}', category: 'physics', subcategory: 'Mecánica Clásica', keywords: ['torque', 'momento de fuerza', 'rotacion', 'tau'] },
  { id: 'phy-ang-p', label: 'Momento Angular L', latex: '\\vec{L} = \\vec{r} \\times \\vec{p}', category: 'physics', subcategory: 'Mecánica Clásica', keywords: ['momento angular', 'giro', 'conservacion'] },

  // Cuántica & Notación Dirac
  { id: 'phy-bra', label: 'Bra ⟨ψ|', latex: '\\langle #? |', category: 'physics', subcategory: 'Mecánica Cuántica', keywords: ['bra', 'dirac', 'dual', 'vector fila', 'cuantica'] },
  { id: 'phy-ket', label: 'Ket |ψ⟩', latex: '| #? \\rangle', category: 'physics', subcategory: 'Mecánica Cuántica', keywords: ['ket', 'dirac', 'estado', 'vector columna', 'cuantica', 'qubit'] },
  { id: 'phy-braket', label: 'Bra-Ket ⟨φ|ψ⟩', latex: '\\langle #? | #? \\rangle', category: 'physics', subcategory: 'Mecánica Cuántica', keywords: ['braket', 'producto interno', 'amplitud', 'superposicion', 'solapamiento'] },
  { id: 'phy-proj', label: 'Operador Proyector |φ⟩⟨ψ|', latex: '| #? \\rangle \\langle #? |', category: 'physics', subcategory: 'Mecánica Cuántica', keywords: ['proyector', 'matriz densidad', 'operador externo'] },
  { id: 'phy-schrodinger', label: 'Ecuación Schrödinger', latex: 'i \\hbar \\frac{\\partial}{\\partial t} |\\psi\\rangle = \\hat{H} |\\psi\\rangle', category: 'physics', subcategory: 'Mecánica Cuántica', keywords: ['schrodinger', 'onda', 'cuantica', 'hamiltoniano', 'hbar'] },
  { id: 'phy-heisenberg', label: 'Incertidumbre Heisenberg', latex: '\\Delta x \\Delta p \\ge \\frac{\\hbar}{2}', category: 'physics', subcategory: 'Mecánica Cuántica', keywords: ['heisenberg', 'incertidumbre', 'posicion', 'momento'] },
  { id: 'phy-hbar', label: 'Constante h barra ℏ', latex: '\\hbar', category: 'physics', subcategory: 'Constantes', keywords: ['hbar', 'planck reducida', 'cuanto'] },
  { id: 'phy-debroglie', label: 'Longitud De Broglie λ', latex: '\\lambda = \\frac{h}{p}', category: 'physics', subcategory: 'Mecánica Cuántica', keywords: ['de broglie', 'onda particula', 'dualidad', 'longitud'] },

  // Electromagnetismo & Relatividad
  { id: 'phy-einstein', label: 'Equivalencia E = mc²', latex: 'E = m c^2', category: 'physics', subcategory: 'Relatividad', keywords: ['einstein', 'energia masa', 'relatividad', 'c2'] },
  { id: 'phy-lorentz', label: 'Factor Lorentz γ', latex: '\\gamma = \\frac{1}{\\sqrt{1 - \\frac{v^2}{c^2}}}', category: 'physics', subcategory: 'Relatividad', keywords: ['lorentz', 'gamma', 'dilatacion temporal', 'contraccion'] },
  { id: 'phy-lorentz-force', label: 'Fuerza Lorentz q(E+v×B)', latex: '\\vec{F} = q(\\vec{E} + \\vec{v} \\times \\vec{B})', category: 'physics', subcategory: 'Electromagnetismo', keywords: ['lorentz', 'campo electrico', 'campo magnetico', 'fuerza'] },
  { id: 'phy-tensor-einstein', label: 'Ecuación de Campo Einstein', latex: 'G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}', category: 'physics', subcategory: 'Relatividad General', keywords: ['relatividad general', 'gravedad', 'tensores', 'espaciotiempo', 'curvatura'] },
  { id: 'phy-metric', label: 'Tensor Métrico g_μν', latex: 'g_{\\mu\\nu}', category: 'physics', subcategory: 'Relatividad General', keywords: ['metrica', 'tensor', 'minkowski', 'schwarzschild'] },

  // =========================================================================
  // 4. ASTRONOMÍA & ASTROFÍSICA
  // =========================================================================
  // Astros & Planetas
  { id: 'ast-sun', label: 'Sol ☉', latex: '\\odot', category: 'astronomy', subcategory: 'Astros', keywords: ['sol', 'solar', 'sun', 'helio', 'masa solar', 'msun'] },
  { id: 'ast-msun', label: 'Masa Solar M☉', latex: 'M_\\odot', category: 'astronomy', subcategory: 'Parámetros Estelares', keywords: ['masa solar', 'estrella', 'pesado'] },
  { id: 'ast-rsun', label: 'Radio Solar R☉', latex: 'R_\\odot', category: 'astronomy', subcategory: 'Parámetros Estelares', keywords: ['radio solar', 'tamaño'] },
  { id: 'ast-lsun', label: 'Luminosidad Solar L☉', latex: 'L_\\odot', category: 'astronomy', subcategory: 'Parámetros Estelares', keywords: ['luminosidad', 'brillo'] },
  { id: 'ast-earth', label: 'Tierra ♁', latex: '\\oplus', category: 'astronomy', subcategory: 'Planetas', keywords: ['tierra', 'earth', 'terrestre', 'm earth'] },
  { id: 'ast-moon', label: 'Luna ☽', latex: '\\leftmoon', category: 'astronomy', subcategory: 'Astros', keywords: ['luna', 'moon', 'satelite'] },
  { id: 'ast-mercury', label: 'Mercurio ☿', latex: '\\mercury', category: 'astronomy', subcategory: 'Planetas', keywords: ['mercurio', 'planeta'] },
  { id: 'ast-venus', label: 'Venus ♀', latex: '\\venus', category: 'astronomy', subcategory: 'Planetas', keywords: ['venus', 'planeta'] },
  { id: 'ast-mars', label: 'Marte ♂', latex: '\\mars', category: 'astronomy', subcategory: 'Planetas', keywords: ['marte', 'planeta rojo'] },
  { id: 'ast-jupiter', label: 'Júpiter ♃', latex: '\\jupiter', category: 'astronomy', subcategory: 'Planetas', keywords: ['jupiter', 'gigante gaseoso'] },
  { id: 'ast-saturn', label: 'Saturno ♄', latex: '\\saturn', category: 'astronomy', subcategory: 'Planetas', keywords: ['saturno', 'anillos'] },
  { id: 'ast-uranus', label: 'Urano ♅', latex: '\\uranus', category: 'astronomy', subcategory: 'Planetas', keywords: ['urano', 'gigante de hielo'] },
  { id: 'ast-neptune', label: 'Neptuno ♆', latex: '\\neptune', category: 'astronomy', subcategory: 'Planetas', keywords: ['neptuno', 'azul'] },
  { id: 'ast-pluto', label: 'Plutón ♇', latex: '\\pluto', category: 'astronomy', subcategory: 'Planetas', keywords: ['pluton', 'planeta enano'] },

  // Parámetros & Astrometría
  { id: 'ast-au', label: 'Unidad Astronómica AU', latex: '\\text{AU}', category: 'astronomy', subcategory: 'Unidades', keywords: ['au', 'unidad astronomica', 'distancia sol tierra'] },
  { id: 'ast-pc', label: 'Pársec pc', latex: '\\text{pc}', category: 'astronomy', subcategory: 'Unidades', keywords: ['parsec', 'pc', 'paralaje'] },
  { id: 'ast-ly', label: 'Año Luz ly', latex: '\\text{ly}', category: 'astronomy', subcategory: 'Unidades', keywords: ['año luz', 'light year', 'distancia'] },
  { id: 'ast-redshift', label: 'Corrimiento al Rojo z', latex: 'z = \\frac{\\Delta\\lambda}{\\lambda_0}', category: 'astronomy', subcategory: 'Cosmología', keywords: ['redshift', 'doppler', 'expansion', 'z'] },
  { id: 'ast-hubble', label: 'Ley de Hubble v = H₀d', latex: 'v = H_0 d', category: 'astronomy', subcategory: 'Cosmología', keywords: ['hubble', 'expansion universo', 'velocidad recesion'] },

  // =========================================================================
  // 5. QUÍMICA & FÍSICA NUCLEAR (Sintaxis mhchem \ce{...})
  // =========================================================================
  // Isótopos & Núcleos
  { id: 'chem-cs133', label: 'Cesio-133 (Relojes)', latex: '\\ce{^{133}_{55}Cs}', category: 'chemistry', subcategory: 'Isótopos', keywords: ['cesio', 'cs133', 'isotopo', 'reloj atomico'] },
  { id: 'chem-u235', label: 'Uranio-235 (Fisión)', latex: '\\ce{^{235}_{92}U}', category: 'chemistry', subcategory: 'Isótopos', keywords: ['uranio', 'u235', 'fision', 'nuclear', 'combustible'] },
  { id: 'chem-u238', label: 'Uranio-238', latex: '\\ce{^{238}_{92}U}', category: 'chemistry', subcategory: 'Isótopos', keywords: ['uranio', 'u238', 'fertil'] },
  { id: 'chem-pu239', label: 'Plutonio-239', latex: '\\ce{^{239}_{94}Pu}', category: 'chemistry', subcategory: 'Isótopos', keywords: ['plutonio', 'pu239', 'nuclear'] },
  { id: 'chem-c14', label: 'Carbono-14 (Datación)', latex: '\\ce{^{14}_{6}C}', category: 'chemistry', subcategory: 'Isótopos', keywords: ['carbono 14', 'c14', 'datacion', 'radiocarbono'] },
  { id: 'chem-h1', label: 'Protio ¹₁H', latex: '\\ce{^{1}_{1}H}', category: 'chemistry', subcategory: 'Isótopos', keywords: ['hidrogeno', 'protio', 'h1'] },
  { id: 'chem-h2', label: 'Deuterio ²₁H', latex: '\\ce{^{2}_{1}H}', category: 'chemistry', subcategory: 'Isótopos', keywords: ['deuterio', 'h2', 'agua pesada'] },
  { id: 'chem-h3', label: 'Tritio ³₁H', latex: '\\ce{^{3}_{1}H}', category: 'chemistry', subcategory: 'Isótopos', keywords: ['tritio', 'h3', 'fusion'] },
  { id: 'chem-iso-template', label: 'Plantilla Isótopo ᴬ_Z X', latex: '\\ce{^{#?}_{#?}#?}', category: 'chemistry', subcategory: 'Isótopos', keywords: ['isotopo', 'a z x', 'numero masico', 'atomico'] },

  // Radiación & Partículas
  { id: 'chem-alpha', label: 'Partícula Alfa ⁴₂α', latex: '\\ce{^{4}_{2}\\alpha}', category: 'chemistry', subcategory: 'Partículas', keywords: ['alfa', 'particula alfa', 'helio', 'decae'] },
  { id: 'chem-beta-neg', label: 'Partícula Beta Menos ⁰₋₁β', latex: '\\ce{^{0}_{-1}\\beta}', category: 'chemistry', subcategory: 'Partículas', keywords: ['beta', 'electron', 'desintegracion beta'] },
  { id: 'chem-beta-pos', label: 'Positrón Beta Más ⁰₊₁β', latex: '\\ce{^{0}_{+1}\\beta}', category: 'chemistry', subcategory: 'Partículas', keywords: ['positron', 'antimateria', 'beta mas'] },
  { id: 'chem-gamma', label: 'Radiación Gamma γ', latex: '\\gamma', category: 'chemistry', subcategory: 'Partículas', keywords: ['gamma', 'fotones', 'radiacion penetrante'] },
  { id: 'chem-neutron', label: 'Neutrón ¹₀n', latex: '\\ce{^{1}_{0}n}', category: 'chemistry', subcategory: 'Partículas', keywords: ['neutron', 'n', 'termico'] },
  { id: 'chem-proton', label: 'Protón ¹₁p', latex: '\\ce{^{1}_{1}p}', category: 'chemistry', subcategory: 'Partículas', keywords: ['proton', 'p', 'carga'] },
  { id: 'chem-electron', label: 'Electrón e⁻', latex: '\\ce{e^-}', category: 'chemistry', subcategory: 'Partículas', keywords: ['electron', 'e minus', 'orbita'] },

  // Reacciones & Estados
  { id: 'chem-arrow', label: 'Flecha Reacción ➔', latex: '\\ce{->}', category: 'chemistry', subcategory: 'Reacciones', keywords: ['flecha', 'produce', 'reaccion', 'arrow'] },
  { id: 'chem-equil', label: 'Equilibrio Químico ⇌', latex: '\\ce{<=>}', category: 'chemistry', subcategory: 'Reacciones', keywords: ['equilibrio', 'reversible', 'le chatelier'] },
  { id: 'chem-gas', label: 'Desprendimiento Gas (^) ', latex: '\\ce{^}', category: 'chemistry', subcategory: 'Reacciones', keywords: ['gas', 'desprendimiento', 'flecha arriba'] },
  { id: 'chem-precip', label: 'Precipitado (v)', latex: '\\ce{v}', category: 'chemistry', subcategory: 'Reacciones', keywords: ['precipitado', 'sedimento', 'flecha abajo'] },
  { id: 'chem-solid', label: 'Sólido (s)', latex: '\\ce{(s)}', category: 'chemistry', subcategory: 'Estados', keywords: ['solido', 'fase'] },
  { id: 'chem-liquid', label: 'Líquido (l)', latex: '\\ce{(l)}', category: 'chemistry', subcategory: 'Estados', keywords: ['liquido', 'acuoso', 'fase'] },
  { id: 'chem-gas-state', label: 'Gas (g)', latex: '\\ce{(g)}', category: 'chemistry', subcategory: 'Estados', keywords: ['gas', 'vapor', 'fase'] },
  { id: 'chem-aq', label: 'Acuoso (aq)', latex: '\\ce{(aq)}', category: 'chemistry', subcategory: 'Estados', keywords: ['acuoso', 'disolucion', 'agua'] },
  { id: 'chem-water', label: 'Formación Agua', latex: '\\ce{2H2 + O2 -> 2H2O}', category: 'chemistry', subcategory: 'Reacciones Clave', keywords: ['agua', 'combustion hidrogeno'] },
  { id: 'chem-half-life', label: 'Vida Media t½', latex: 't_{1/2} = \\frac{\\ln(2)}{\\lambda}', category: 'chemistry', subcategory: 'Cinética', keywords: ['vida media', 'periodo semidesintegracion', 'lambda'] },

  // =========================================================================
  // 6. BIOLOGÍA, GENÉTICA & MEDICINA
  // =========================================================================
  // Dimorfismo & Cruces
  { id: 'bio-female', label: 'Femenino / Hembra ♀', latex: '\\venus', category: 'biology', subcategory: 'Sexo & Dimorfismo', keywords: ['femenino', 'hembra', 'mujer', 'female', 'venus', 'xx'] },
  { id: 'bio-male', label: 'Masculino / Macho ♂', latex: '\\mars', category: 'biology', subcategory: 'Sexo & Dimorfismo', keywords: ['masculino', 'macho', 'hombre', 'male', 'mars', 'xy'] },
  { id: 'bio-parental', label: 'Generación Parental P', latex: 'P', category: 'biology', subcategory: 'Genética Clásica', keywords: ['parental', 'padres', 'p', 'mendel'] },
  { id: 'bio-f1', label: 'Primera Filial F₁', latex: 'F_1', category: 'biology', subcategory: 'Genética Clásica', keywords: ['f1', 'filial 1', 'hijos', 'primera generacion'] },
  { id: 'bio-f2', label: 'Segunda Filial F₂', latex: 'F_2', category: 'biology', subcategory: 'Genética Clásica', keywords: ['f2', 'filial 2', 'nietos', 'segunda generacion'] },
  { id: 'bio-cross', label: 'Cruce Genético ×', latex: '\\times', category: 'biology', subcategory: 'Genética Clásica', keywords: ['cruce', 'apareamiento', 'hibridacion'] },
  { id: 'bio-homo-dom', label: 'Homocigoto Dominante AA', latex: 'AA', category: 'biology', subcategory: 'Genotipos', keywords: ['homocigoto dominante', 'aa', 'puro'] },
  { id: 'bio-hetero', label: 'Heterocigoto Aa', latex: 'Aa', category: 'biology', subcategory: 'Genotipos', keywords: ['heterocigoto', 'hibrido', 'aa', 'portador'] },
  { id: 'bio-homo-rec', label: 'Homocigoto Recesivo aa', latex: 'aa', category: 'biology', subcategory: 'Genotipos', keywords: ['homocigoto recesivo', 'aa'] },
  
  // Genealogía (Pedigree)
  { id: 'bio-sq-open', label: 'Varón Sano □', latex: '\\square', category: 'biology', subcategory: 'Árbol Genealógico', keywords: ['varon sano', 'cuadrado vacio', 'pedigree', 'genealogia'] },
  { id: 'bio-sq-filled', label: 'Varón Afectado ■', latex: '\\blacksquare', category: 'biology', subcategory: 'Árbol Genealógico', keywords: ['varon enfermo', 'cuadrado lleno', 'afectado'] },
  { id: 'bio-cir-open', label: 'Mujer Sana ○', latex: '\\bigcirc', category: 'biology', subcategory: 'Árbol Genealógico', keywords: ['mujer sana', 'circulo vacio', 'pedigree'] },
  { id: 'bio-cir-dot', label: 'Mujer Portadora ⊙', latex: '\\odot', category: 'biology', subcategory: 'Árbol Genealógico', keywords: ['portadora', 'circulo punto', 'heterocigota ligada x'] },

  // Medicina & Bioquímica
  { id: 'bio-ph', label: 'pH = -log[H⁺]', latex: '\\text{pH} = -\\log[\\ce{H^+}]', category: 'biology', subcategory: 'Bioquímica Médica', keywords: ['ph', 'acidez', 'hidrogeniones', 'gasometria'] },
  { id: 'bio-dna', label: 'ADN Bicatenario', latex: '\\text{ADN}', category: 'biology', subcategory: 'Biología Molecular', keywords: ['adn', 'dna', 'genoma', 'doble helice'] },
  { id: 'bio-atp', label: 'ATP (Energía celular)', latex: '\\text{ATP}', category: 'biology', subcategory: 'Metabolismo', keywords: ['atp', 'adenosina', 'energia', 'mitocondria'] },
  { id: 'bio-hr', label: 'Frecuencia Cardíaca FC', latex: '\\text{FC}', category: 'biology', subcategory: 'Signos Vitales', keywords: ['frecuencia cardiaca', 'pulso', 'fc', 'bpm'] },
  { id: 'bio-bp', label: 'Presión Arterial PA', latex: '\\text{PA} = \\frac{\\text{PAS}}{\\text{PAD}}', category: 'biology', subcategory: 'Signos Vitales', keywords: ['presion arterial', 'tension', 'sistolica', 'diastolica'] },

  // =========================================================================
  // 7. LÓGICA & TEORÍA DE CONJUNTOS
  // =========================================================================
  // Conectores Proposicionales
  { id: 'log-and', label: 'Y Lógico (Conjunción) ∧', latex: '\\land', category: 'logic', subcategory: 'Conectores', keywords: ['y', 'and', 'conjuncion', 'wedge'] },
  { id: 'log-or', label: 'O Lógico (Disyunción) ∨', latex: '\\lor', category: 'logic', subcategory: 'Conectores', keywords: ['o', 'or', 'disyuncion', 'vee'] },
  { id: 'log-not', label: 'Negación ¬', latex: '\\neg', category: 'logic', subcategory: 'Conectores', keywords: ['no', 'not', 'negacion', 'inverso'] },
  { id: 'log-impl', label: 'Implica ⟹', latex: '\\implies', category: 'logic', subcategory: 'Conectores', keywords: ['implica', 'entonces', 'condicional', 'implies'] },
  { id: 'log-iff', label: 'Si y sólo si ⟺', latex: '\\iff', category: 'logic', subcategory: 'Conectores', keywords: ['si y solo si', 'bicondicional', 'equivalente', 'iff'] },
  { id: 'log-xor', label: 'O Exclusivo ⊕', latex: '\\oplus', category: 'logic', subcategory: 'Conectores', keywords: ['xor', 'o exclusivo', 'disyuncion excluyente'] },
  { id: 'log-true', label: 'Verdad / Tautología ⊤', latex: '\\top', category: 'logic', subcategory: 'Valores de Verdad', keywords: ['verdadero', 'tautologia', 'top'] },
  { id: 'log-false', label: 'Falso / Contradicción ⊥', latex: '\\bot', category: 'logic', subcategory: 'Valores de Verdad', keywords: ['falso', 'contradiccion', 'bottom'] },
  { id: 'log-vdash', label: 'Deduce / Demuestra ⊢', latex: '\\vdash', category: 'logic', subcategory: 'Sintaxis Formal', keywords: ['deduce', 'teorema', 'demostrable', 'vdash'] },
  { id: 'log-models', label: 'Satisface / Modelo ⊨', latex: '\\vDash', category: 'logic', subcategory: 'Semántica', keywords: ['modelo', 'satisface', 'valido'] },

  // Cuantificadores
  { id: 'log-forall', label: 'Para todo ∀', latex: '\\forall', category: 'logic', subcategory: 'Cuantificadores', keywords: ['para todo', 'para cada', 'universal', 'forall'] },
  { id: 'log-exists', label: 'Existe ∃', latex: '\\exists', category: 'logic', subcategory: 'Cuantificadores', keywords: ['existe', 'al menos uno', 'existencial', 'exists'] },
  { id: 'log-nexists', label: 'No existe ∄', latex: '\\nexists', category: 'logic', subcategory: 'Cuantificadores', keywords: ['no existe', 'ninguno', 'nexists'] },
  { id: 'log-exists-one', label: 'Existe único ∃!', latex: '\\exists!', category: 'logic', subcategory: 'Cuantificadores', keywords: ['existe unico', 'unicidad'] },

  // Operaciones de Conjuntos
  { id: 'log-in', label: 'Pertenece ∈', latex: '\\in', category: 'logic', subcategory: 'Conjuntos', keywords: ['pertenece', 'elemento de', 'in'] },
  { id: 'log-notin', label: 'No pertenece ∉', latex: '\\notin', category: 'logic', subcategory: 'Conjuntos', keywords: ['no pertenece', 'notin'] },
  { id: 'log-subset', label: 'Subconjunto propio ⊂', latex: '\\subset', category: 'logic', subcategory: 'Conjuntos', keywords: ['subconjunto', 'contenido en', 'subset'] },
  { id: 'log-subseteq', label: 'Subconjunto o igual ⊆', latex: '\\subseteq', category: 'logic', subcategory: 'Conjuntos', keywords: ['subconjunto igual', 'subseteq'] },
  { id: 'log-union', label: 'Unión ∪', latex: '\\cup', category: 'logic', subcategory: 'Conjuntos', keywords: ['union', 'reunion', 'cup'] },
  { id: 'log-intersect', label: 'Intersección ∩', latex: '\\cap', category: 'logic', subcategory: 'Conjuntos', keywords: ['interseccion', 'comun', 'cap'] },
  { id: 'log-empty', label: 'Conjunto Vacío ∅', latex: '\\emptyset', category: 'logic', subcategory: 'Conjuntos', keywords: ['vacio', 'empty set', 'nada'] },
  { id: 'log-diff', label: 'Diferencia de Conjuntos \\', latex: '\\setminus', category: 'logic', subcategory: 'Conjuntos', keywords: ['diferencia', 'menos', 'sin', 'setminus'] },
  { id: 'log-therefore', label: 'Por lo tanto ∴', latex: '\\therefore', category: 'logic', subcategory: 'Conclusión', keywords: ['por lo tanto', 'entonces', 'therefore'] },
  { id: 'log-because', label: 'Porque / Dado que ∵', latex: '\\because', category: 'logic', subcategory: 'Conclusión', keywords: ['porque', 'ya que', 'dado que', 'because'] },
  { id: 'log-qed', label: 'Q.E.D. (Fin de prueba) ■', latex: '\\blacksquare', category: 'logic', subcategory: 'Conclusión', keywords: ['qed', 'demostrado', 'cuadrado negro'] },

  // =========================================================================
  // 8. ALFABETO GRIEGO COMPLETO (24 Minúsculas + 11 Mayúsculas)
  // =========================================================================
  // Minúsculas
  { id: 'grk-alpha', label: 'Alfa α', latex: '\\alpha', category: 'greek', subcategory: 'Minúsculas', keywords: ['alfa', 'alpha', 'angulo', 'particula'] },
  { id: 'grk-beta', label: 'Beta β', latex: '\\beta', category: 'greek', subcategory: 'Minúsculas', keywords: ['beta', 'coeficiente', 'emision'] },
  { id: 'grk-gamma', label: 'Gamma γ', latex: '\\gamma', category: 'greek', subcategory: 'Minúsculas', keywords: ['gamma', 'factor lorentz', 'rayos gamma'] },
  { id: 'grk-delta', label: 'Delta δ', latex: '\\delta', category: 'greek', subcategory: 'Minúsculas', keywords: ['delta', 'variacion', 'dirac delta'] },
  { id: 'grk-epsilon', label: 'Épsilon ϵ', latex: '\\epsilon', category: 'greek', subcategory: 'Minúsculas', keywords: ['epsilon', 'permitividad', 'error'] },
  { id: 'grk-varepsilon', label: 'Varepsilon ε', latex: '\\varepsilon', category: 'greek', subcategory: 'Minúsculas', keywords: ['varepsilon', 'deformacion', 'fuerza electromotriz'] },
  { id: 'grk-zeta', label: 'Zeta ζ', latex: '\\zeta', category: 'greek', subcategory: 'Minúsculas', keywords: ['zeta', 'riemann zeta', 'amortiguamiento'] },
  { id: 'grk-eta', label: 'Eta η', latex: '\\eta', category: 'greek', subcategory: 'Minúsculas', keywords: ['eta', 'rendimiento', 'eficiencia', 'viscosidad'] },
  { id: 'grk-theta', label: 'Theta θ', latex: '\\theta', category: 'greek', subcategory: 'Minúsculas', keywords: ['theta', 'angulo', 'fase', 'temperatura'] },
  { id: 'grk-vartheta', label: 'Vartheta ϑ', latex: '\\vartheta', category: 'greek', subcategory: 'Minúsculas', keywords: ['vartheta', 'angulo alternativo'] },
  { id: 'grk-iota', label: 'Iota ι', latex: '\\iota', category: 'greek', subcategory: 'Minúsculas', keywords: ['iota', 'inclusor'] },
  { id: 'grk-kappa', label: 'Kappa κ', latex: '\\kappa', category: 'greek', subcategory: 'Minúsculas', keywords: ['kappa', 'curvatura', 'constante dielectrica'] },
  { id: 'grk-lambda', label: 'Lambda λ', latex: '\\lambda', category: 'greek', subcategory: 'Minúsculas', keywords: ['lambda', 'longitud de onda', 'autovalor', 'eigenvalue', 'tasa'] },
  { id: 'grk-mu', label: 'Mu μ', latex: '\\mu', category: 'greek', subcategory: 'Minúsculas', keywords: ['mu', 'micro', 'media', 'permeabilidad', 'friccion'] },
  { id: 'grk-nu', label: 'Nu ν', latex: '\\nu', category: 'greek', subcategory: 'Minúsculas', keywords: ['nu', 'frecuencia', 'neutrino', 'viscosidad cinematica'] },
  { id: 'grk-xi', label: 'Xi ξ', latex: '\\xi', category: 'greek', subcategory: 'Minúsculas', keywords: ['xi', 'variable aleatoria'] },
  { id: 'grk-pi', label: 'Pi π', latex: '\\pi', category: 'greek', subcategory: 'Minúsculas', keywords: ['pi', '3.14159', 'circunferencia', 'perimetro'] },
  { id: 'grk-varpi', label: 'Varpi ϖ', latex: '\\varpi', category: 'greek', subcategory: 'Minúsculas', keywords: ['varpi', 'perihelio'] },
  { id: 'grk-rho', label: 'Rho ρ', latex: '\\rho', category: 'greek', subcategory: 'Minúsculas', keywords: ['rho', 'densidad', 'resistividad', 'radio'] },
  { id: 'grk-varrho', label: 'Varrho ϱ', latex: '\\varrho', category: 'greek', subcategory: 'Minúsculas', keywords: ['varrho'] },
  { id: 'grk-sigma', label: 'Sigma σ', latex: '\\sigma', category: 'greek', subcategory: 'Minúsculas', keywords: ['sigma', 'desviacion estandar', 'conductividad', 'tension'] },
  { id: 'grk-varsigma', label: 'Varsigma ς', latex: '\\varsigma', category: 'greek', subcategory: 'Minúsculas', keywords: ['varsigma'] },
  { id: 'grk-tau', label: 'Tau τ', latex: '\\tau', category: 'greek', subcategory: 'Minúsculas', keywords: ['tau', 'constante tiempo', 'torque', 'tension cortante'] },
  { id: 'grk-upsilon', label: 'Ípsilon υ', latex: '\\upsilon', category: 'greek', subcategory: 'Minúsculas', keywords: ['upsilon', 'particula'] },
  { id: 'grk-phi', label: 'Phi ϕ', latex: '\\phi', category: 'greek', subcategory: 'Minúsculas', keywords: ['phi', 'flujo', 'potencial', 'angulo aureo'] },
  { id: 'grk-varphi', label: 'Varphi φ', latex: '\\varphi', category: 'greek', subcategory: 'Minúsculas', keywords: ['varphi', 'angulo esferico'] },
  { id: 'grk-chi', label: 'Chi χ', latex: '\\chi', category: 'greek', subcategory: 'Minúsculas', keywords: ['chi', 'chi cuadrado', 'susceptibilidad'] },
  { id: 'grk-psi', label: 'Psi ψ', latex: '\\psi', category: 'greek', subcategory: 'Minúsculas', keywords: ['psi', 'funcion de onda', 'cuantica'] },
  { id: 'grk-omega', label: 'Omega ω', latex: '\\omega', category: 'greek', subcategory: 'Minúsculas', keywords: ['omega', 'velocidad angular', 'pulsacion', 'frecuencia angular'] },

  // Mayúsculas
  { id: 'grk-Gamma', label: 'Gamma Mayúscula Γ', latex: '\\Gamma', category: 'greek', subcategory: 'Mayúsculas', keywords: ['gamma mayuscula', 'funcion gamma', 'christoffel'] },
  { id: 'grk-Delta', label: 'Delta Mayúscula Δ', latex: '\\Delta', category: 'greek', subcategory: 'Mayúsculas', keywords: ['delta mayuscula', 'cambio', 'incremento', 'discriminante', 'laplaciano'] },
  { id: 'grk-Theta', label: 'Theta Mayúscula Θ', latex: '\\Theta', category: 'greek', subcategory: 'Mayúsculas', keywords: ['theta mayuscula', 'cota asintotica ajustada'] },
  { id: 'grk-Lambda', label: 'Lambda Mayúscula Λ', latex: '\\Lambda', category: 'greek', subcategory: 'Mayúsculas', keywords: ['lambda mayuscula', 'constante cosmologica'] },
  { id: 'grk-Xi', label: 'Xi Mayúscula Ξ', latex: '\\Xi', category: 'greek', subcategory: 'Mayúsculas', keywords: ['xi mayuscula'] },
  { id: 'grk-Pi', label: 'Pi Mayúscula Π', latex: '\\Pi', category: 'greek', subcategory: 'Mayúsculas', keywords: ['pi mayuscula', 'productoria'] },
  { id: 'grk-Sigma', label: 'Sigma Mayúscula Σ', latex: '\\Sigma', category: 'greek', subcategory: 'Mayúsculas', keywords: ['sigma mayuscula', 'sumatoria', 'alfabeto'] },
  { id: 'grk-Upsilon', label: 'Ípsilon Mayúscula Υ', latex: '\\Upsilon', category: 'greek', subcategory: 'Mayúsculas', keywords: ['upsilon mayuscula'] },
  { id: 'grk-Phi', label: 'Phi Mayúscula Φ', latex: '\\Phi', category: 'greek', subcategory: 'Mayúsculas', keywords: ['phi mayuscula', 'flujo magnetico', 'campo escalar'] },
  { id: 'grk-Psi', label: 'Psi Mayúscula Ψ', latex: '\\Psi', category: 'greek', subcategory: 'Mayúsculas', keywords: ['psi mayuscula', 'estado cuantico'] },
  { id: 'grk-Omega', label: 'Omega Mayúscula Ω', latex: '\\Omega', category: 'greek', subcategory: 'Mayúsculas', keywords: ['omega mayuscula', 'ohmios', 'resistencia', 'espacio muestral'] },

  // =========================================================================
  // 9. NÚMEROS ROMANOS & FORMAS UNICODE FORMALES
  // =========================================================================
  // Romanos Clásicos Básicos
  { id: 'rom-1', label: 'I (1)', latex: '\\text{I}', category: 'romans', subcategory: 'Básicos', keywords: ['1', 'uno', 'romano i'] },
  { id: 'rom-5', label: 'V (5)', latex: '\\text{V}', category: 'romans', subcategory: 'Básicos', keywords: ['5', 'cinco', 'romano v'] },
  { id: 'rom-10', label: 'X (10)', latex: '\\text{X}', category: 'romans', subcategory: 'Básicos', keywords: ['10', 'diez', 'romano x'] },
  { id: 'rom-50', label: 'L (50)', latex: '\\text{L}', category: 'romans', subcategory: 'Básicos', keywords: ['50', 'cincuenta', 'romano l'] },
  { id: 'rom-100', label: 'C (100)', latex: '\\text{C}', category: 'romans', subcategory: 'Básicos', keywords: ['100', 'cien', 'romano c'] },
  { id: 'rom-500', label: 'D (500)', latex: '\\text{D}', category: 'romans', subcategory: 'Básicos', keywords: ['500', 'quinientos', 'romano d'] },
  { id: 'rom-1000', label: 'M (1000)', latex: '\\text{M}', category: 'romans', subcategory: 'Básicos', keywords: ['1000', 'mil', 'romano m'] },

  // Romanos del 1 al 12
  { id: 'rom-2', label: 'II (2)', latex: '\\text{II}', category: 'romans', subcategory: 'Comunes', keywords: ['2', 'dos', 'ii'] },
  { id: 'rom-3', label: 'III (3)', latex: '\\text{III}', category: 'romans', subcategory: 'Comunes', keywords: ['3', 'tres', 'iii'] },
  { id: 'rom-4', label: 'IV (4)', latex: '\\text{IV}', category: 'romans', subcategory: 'Comunes', keywords: ['4', 'cuatro', 'iv'] },
  { id: 'rom-6', label: 'VI (6)', latex: '\\text{VI}', category: 'romans', subcategory: 'Comunes', keywords: ['6', 'seis', 'vi'] },
  { id: 'rom-7', label: 'VII (7)', latex: '\\text{VII}', category: 'romans', subcategory: 'Comunes', keywords: ['7', 'siete', 'vii'] },
  { id: 'rom-8', label: 'VIII (8)', latex: '\\text{VIII}', category: 'romans', subcategory: 'Comunes', keywords: ['8', 'ocho', 'viii'] },
  { id: 'rom-9', label: 'IX (9)', latex: '\\text{IX}', category: 'romans', subcategory: 'Comunes', keywords: ['9', 'nueve', 'ix'] },
  { id: 'rom-11', label: 'XI (11)', latex: '\\text{XI}', category: 'romans', subcategory: 'Comunes', keywords: ['11', 'once', 'xi'] },
  { id: 'rom-12', label: 'XII (12)', latex: '\\text{XII}', category: 'romans', subcategory: 'Comunes', keywords: ['12', 'doce', 'xii'] },

  // Vinculum (Multiplicador × 1,000 con barra superior)
  { id: 'rom-v-bar', label: 'V̄ (5,000)', latex: '\\overline{\\text{V}}', category: 'romans', subcategory: 'Vinculum (×1000)', keywords: ['5000', 'cinco mil', 'vinculum', 'barra'] },
  { id: 'rom-x-bar', label: 'X̄ (10,000)', latex: '\\overline{\\text{X}}', category: 'romans', subcategory: 'Vinculum (×1000)', keywords: ['10000', 'diez mil', 'vinculum'] },
  { id: 'rom-l-bar', label: 'L̄ (50,000)', latex: '\\overline{\\text{L}}', category: 'romans', subcategory: 'Vinculum (×1000)', keywords: ['50000', 'cincuenta mil', 'vinculum'] },
  { id: 'rom-c-bar', label: 'C̄ (100,000)', latex: '\\overline{\\text{C}}', category: 'romans', subcategory: 'Vinculum (×1000)', keywords: ['100000', 'cien mil', 'vinculum'] },
  { id: 'rom-m-bar', label: 'M̄ (1,000,000)', latex: '\\overline{\\text{M}}', category: 'romans', subcategory: 'Vinculum (×1000)', keywords: ['1000000', 'un millon', 'vinculum'] }
];
