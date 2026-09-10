let _ceInstance: any = null;

/**
 * Obtiene o inicializa de forma segura la instancia de ComputeEngine.
 */
export function getComputeEngine(): any {
  if (_ceInstance) return _ceInstance;
  if (typeof window !== 'undefined') {
    const CE = (window as any).ComputeEngineBundle?.ComputeEngine || (window as any).ComputeEngine;
    if (CE) {
      try {
        _ceInstance = new CE();
        return _ceInstance;
      } catch (e) {
        console.warn('[getComputeEngine] Failed to instantiate:', e);
      }
    }
  }
  return null;
}

export const ce: any = {
  parse: (str: string) => {
    const engine = getComputeEngine();
    if (engine) {
      return engine.parse(str);
    }
    return {
      isEqual: (other: any) => str === other,
      simplify: () => ({ isEqual: (other: any) => str === other }),
      evaluate: () => ({ isEqual: (other: any) => str === other }),
      N: () => ({ isEqual: (other: any) => str === other }),
      latex: str
    };
  }
};

export interface MathValidationResult {
  isEquivalent: boolean;
  isExactString: boolean;
  isSymbolicEquivalent: boolean;
  isNumericEquivalent: boolean;
  parsedUserLatex?: string;
  parsedExpectedLatex?: string;
}

export interface MathEvaluationResult {
  raw: string;
  exactLatex?: string;
  decimalLatex?: string;
  simplifiedLatex?: string;
  numericValue?: number;
  isEquation?: boolean;
  lhs?: string;
  rhs?: string;
  steps?: string[];
  scopeUsed?: Record<string, number>;
}

/**
 * Limpia y extrae LaTeX puro removiendo delimitadores de bloque, inline y etiquetas HTML.
 */
export function cleanLatex(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>/g, '') // Quitar etiquetas HTML
    .replace(/\$\$([\s\S]+?)\$\$/g, '$1') // Quitar $$ ... $$
    .replace(/\$([^\$\n]+?)\$/g, '$1') // Quitar $ ... $
    .replace(/\\\[([\s\S]+?)\\\]/g, '$1') // Quitar \[ ... \]
    .replace(/\\\(([^\n]+?)\\\)/g, '$1') // Quitar \( ... \)
    .trim();
}

/**
 * Extrae asignaciones de variables de una cadena (ej. "x = 5", "y=10.5", "a = 1/2")
 */
export function parseVariableAssignments(text: string): Record<string, number> {
  const vars: Record<string, number> = {};
  if (!text) return vars;

  const clean = cleanLatex(text);
  // Match patterns like x = 5 or x = -3.2 or x = \frac{1}{2}
  const regex = /([a-zA-Zα-ωΑ-Ω])\s*=\s*([+-]?\s*(?:\\frac\{\s*[-+]?\d+\s*\}\{\s*[-+]?\d+\s*\}|\d+(?:\.\d+)?))/g;
  let match;
  while ((match = regex.exec(clean)) !== null) {
    const varName = match[1];
    let valStr = match[2].replace(/\s+/g, '');
    if (valStr.includes('\\frac')) {
      const fracMatch = /\\frac\{([-+]?\d+)\}\{([-+]?\d+)\}/.exec(valStr);
      if (fracMatch) {
        const num = parseFloat(fracMatch[1]);
        const den = parseFloat(fracMatch[2]);
        if (den !== 0) {
          vars[varName] = num / den;
        }
      }
    } else {
      const parsed = parseFloat(valStr);
      if (!isNaN(parsed)) {
        vars[varName] = parsed;
      }
    }
  }

  return vars;
}

/**
 * Recorre los ancestros de un nodo de simple-mind-map para recolectar el ámbito de variables declaradas.
 */
export function extractContextVariablesFromTree(node: any): Record<string, number> {
  const scope: Record<string, number> = {};
  let current = node?.parent;

  const visited = new Set();
  while (current && !visited.has(current)) {
    visited.add(current);
    const text = current.getData ? current.getData('text') : current.nodeData?.data?.text;
    if (text && typeof text === 'string') {
      const nodeVars = parseVariableAssignments(text);
      Object.assign(scope, nodeVars);
    }
    current = current.parent;
  }

  return scope;
}

/**
 * Evalúa expresiones matemáticas con soporte de fracciones, variables contextuales y simplificación.
 */
export function evaluateMathExpression(rawExpr: string, scope: Record<string, number> = {}): MathEvaluationResult {
  let expr = cleanLatex(rawExpr).trim();
  if (!expr) {
    return { raw: rawExpr };
  }

  // Quitar el '=' final si existe (ej. "1/2 + 3/4 =")
  if (expr.endsWith('=')) {
    expr = expr.slice(0, -1).trim();
  }

  // Si tiene un igual intermedio "y = 2x + 1", separar lhs y rhs
  let lhs = '';
  let rhs = expr;
  let isEquation = false;
  if (expr.includes('=')) {
    const parts = expr.split('=');
    if (parts.length === 2) {
      lhs = parts[0].trim();
      rhs = parts[1].trim();
      isEquation = true;
    }
  }

  const engine = getComputeEngine();
  const steps: string[] = [];

  // Reemplazar variables conocidas del scope en la expresión
  let targetExpr = isEquation ? rhs : expr;
  let substitutedExpr = targetExpr;

  const varKeys = Object.keys(scope);
  if (varKeys.length > 0) {
    varKeys.forEach((k) => {
      const v = scope[k];
      const re = new RegExp(`\\b${k}\\b`, 'g');
      if (re.test(substitutedExpr)) {
        steps.push(`Sustituir ${k} = ${v}`);
        substitutedExpr = substitutedExpr.replace(re, `(${v})`);
      }
    });
  }

  try {
    if (engine) {
      // Asignar variables al engine si es posible
      if (engine.assign && varKeys.length > 0) {
        varKeys.forEach((k) => {
          try {
            engine.assign(k, scope[k]);
          } catch {}
        });
      }

      const parsed = engine.parse(substitutedExpr);
      const evaluated = parsed.evaluate();
      const numEval = parsed.N();
      const simplified = parsed.simplify();

      let exactLatex = evaluated?.latex || '';
      let decimalLatex = numEval?.latex || '';
      let simplifiedLatex = simplified?.latex || '';

      // Si exactLatex es igual a la entrada y hay un valor numérico
      let numericValue: number | undefined = undefined;
      const numParsed = parseFloat(decimalLatex);
      if (!isNaN(numParsed)) {
        numericValue = numParsed;
      }

      return {
        raw: rawExpr,
        exactLatex,
        decimalLatex: decimalLatex !== exactLatex ? decimalLatex : undefined,
        simplifiedLatex: simplifiedLatex !== exactLatex ? simplifiedLatex : undefined,
        numericValue,
        isEquation,
        lhs: isEquation ? lhs : undefined,
        rhs: isEquation ? rhs : undefined,
        steps,
        scopeUsed: varKeys.length > 0 ? scope : undefined
      };
    }
  } catch (err) {
    console.warn('[evaluateMathExpression] CE error, fallback evaluation:', err);
  }

  // Fallback aritmético simple para fracciones y números (ej: 1/2 + 3/4)
  try {
    // Normalizar fracciones LaTeX \frac{a}{b} a (a/b)
    let jsExpr = substitutedExpr
      .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
      .replace(/\\times/g, '*')
      .replace(/\\cdot/g, '*')
      .replace(/\\div/g, '/')
      .replace(/\\pi/g, 'Math.PI')
      .replace(/\\sqrt\{([^{}]+)\}/g, 'Math.sqrt($1)')
      .replace(/\^\{([^{}]+)\}/g, '**($1)')
      .replace(/\^(\d+)/g, '**$1');

    // Limpiar caracteres no seguros
    if (/^[0-9+\-*/().\s,MathPIsqrt]+$/.test(jsExpr)) {
      // eslint-disable-next-line no-new-func
      const val = Function(`'use strict'; return (${jsExpr})`)();
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        const rounded = Math.round(val * 10000) / 10000;
        return {
          raw: rawExpr,
          exactLatex: String(rounded),
          decimalLatex: String(rounded),
          numericValue: rounded,
          isEquation,
          lhs: isEquation ? lhs : undefined,
          rhs: isEquation ? rhs : undefined,
          steps,
          scopeUsed: varKeys.length > 0 ? scope : undefined
        };
      }
    }
  } catch {}

  return {
    raw: rawExpr,
    isEquation,
    lhs: isEquation ? lhs : undefined,
    rhs: isEquation ? rhs : undefined
  };
}

/**
 * Valida equivalencia matemática real mediante Árbol Sintáctico Abstracto (AST),
 * impidiendo falsos negativos debidos a formato (ej. \frac{1}{2}x vs \frac{x}{2}, 2+3 vs 5).
 */
export function validateMathAnswer(userLaTeX: string, expectedLaTeX: string): boolean {
  try {
    const cleanUser = cleanLatex(userLaTeX);
    const cleanExpected = cleanLatex(expectedLaTeX);

    if (!cleanUser || !cleanExpected) return false;

    // Comparación idéntica directa
    if (cleanUser.toLowerCase() === cleanExpected.toLowerCase()) {
      return true;
    }

    const engine = getComputeEngine();
    if (engine) {
      const parsedUser = engine.parse(cleanUser);
      const parsedExpected = engine.parse(cleanExpected);

      // 1. Equivalencia estructural directa con AST
      if (parsedUser.isEqual(parsedExpected) === true) {
        return true;
      }

      // 2. Equivalencia tras simplificación canónica (ej. 2x vs x * 2, \frac{1}{2}x vs \frac{x}{2})
      if (parsedUser.simplify().isEqual(parsedExpected.simplify()) === true) {
        return true;
      }

      // 3. Equivalencia tras evaluación numérica (ej. 2+3 vs 5, 0.5 vs 1/2)
      if (parsedUser.evaluate().isEqual(parsedExpected.evaluate()) === true) {
        return true;
      }

      if (parsedUser.N().isEqual(parsedExpected.N()) === true) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.warn('[validateMathAnswer] Error in symbolic evaluation:', err);
    return cleanLatex(userLaTeX).toLowerCase() === cleanLatex(expectedLaTeX).toLowerCase();
  }
}

/**
 * Evaluación detallada para feedbacks de usuario enriquecidos en la interfaz.
 */
export function evaluateDetailedMathAnswer(userLaTeX: string, expectedLaTeX: string): MathValidationResult {
  const cleanUser = cleanLatex(userLaTeX);
  const cleanExpected = cleanLatex(expectedLaTeX);

  const isExactString = cleanUser.toLowerCase() === cleanExpected.toLowerCase();

  try {
    const engine = getComputeEngine();
    if (engine) {
      const parsedUser = engine.parse(cleanUser);
      const parsedExpected = engine.parse(cleanExpected);

      const isSymbolic = Boolean(
        parsedUser.isEqual(parsedExpected) === true ||
        parsedUser.simplify().isEqual(parsedExpected.simplify()) === true
      );

      const isNumeric = Boolean(
        parsedUser.evaluate().isEqual(parsedExpected.evaluate()) === true ||
        parsedUser.N().isEqual(parsedExpected.N()) === true
      );

      const isEquivalent = isExactString || isSymbolic || isNumeric;

      return {
        isEquivalent,
        isExactString,
        isSymbolicEquivalent: isSymbolic,
        isNumericEquivalent: isNumeric,
        parsedUserLatex: parsedUser.latex,
        parsedExpectedLatex: parsedExpected.latex
      };
    }

    return {
      isEquivalent: isExactString,
      isExactString,
      isSymbolicEquivalent: false,
      isNumericEquivalent: false
    };
  } catch {
    return {
      isEquivalent: isExactString,
      isExactString,
      isSymbolicEquivalent: false,
      isNumericEquivalent: false
    };
  }
}

/**
 * Teclado Virtual Mobile para Exámenes con pestañas adaptadas.
 */
export function setupMathVirtualKeyboard(): void {
  try {
    const mvk = (window as any).mathVirtualKeyboard;
    if (!mvk) return;

    mvk.layouts = [
      {
        id: 'algebra',
        label: 'Álgebra',
        tooltip: 'Teclado de Álgebra y Aritmética',
        rows: [
          [
            { latex: 'x' }, { latex: 'y' }, { latex: 'z' },
            { latex: '\\frac{#@}{#?}', label: '<span><sup>a</sup>/<sub>b</sub></span>' },
            { latex: '^{#?}', label: 'x<sup>n</sup>' },
            { latex: '_{#?}', label: 'x<sub>n</sub>' },
            { latex: '\\sqrt{#?}', label: '√' }
          ],
          [
            { latex: '7' }, { latex: '8' }, { latex: '9' },
            { latex: '+' }, { latex: '-' }, { latex: '(' }, { latex: ')' }
          ],
          [
            { latex: '4' }, { latex: '5' }, { latex: '6' },
            { latex: '\\times', label: '×' }, { latex: '\\div', label: '÷' }, { latex: '=' }, { latex: '\\ne', label: '≠' }
          ],
          [
            { latex: '1' }, { latex: '2' }, { latex: '3' },
            { latex: '0' }, { latex: '.' }, { command: ['performWithFeedback', 'deleteBackward'], label: '⌫' }
          ]
        ]
      },
      {
        id: 'calculus',
        label: 'Cálculo',
        tooltip: 'Cálculo Diferencial e Integral',
        rows: [
          [
            { latex: '\\frac{d}{dx}', label: '<sup>d</sup>/<sub>dx</sub>' },
            { latex: '\\frac{\\partial}{\\partial x}', label: '<sup>∂</sup>/<sub>∂x</sub>' },
            { latex: '\\int', label: '∫' },
            { latex: '\\int_{#?}^{#?}', label: '∫<sub>a</sub><sup>b</sup>' },
            { latex: '\\lim_{x\\to #?}', label: 'lim' },
            { latex: '\\infty', label: '∞' }
          ],
          [
            { latex: '\\sum_{#?}^{#?}', label: '∑' },
            { latex: '\\prod_{#?}^{#?}', label: '∏' },
            { latex: 'e^{#?}', label: 'e<sup>x</sup>' },
            { latex: '\\ln(#?)', label: 'ln' },
            { latex: '\\log(#?)', label: 'log' },
            { latex: '\\pm', label: '±' }
          ],
          [
            { latex: '\\sin(#?)', label: 'sin' },
            { latex: '\\cos(#?)', label: 'cos' },
            { latex: '\\tan(#?)', label: 'tan' },
            { latex: 'dx' }, { latex: 'dy' }, { latex: 'dt' }
          ],
          [
            { latex: '<' }, { latex: '>' }, { latex: '\\le', label: '≤' }, { latex: '\\ge', label: '≥' },
            { command: ['performWithFeedback', 'deleteBackward'], label: '⌫' }
          ]
        ]
      },
      {
        id: 'greek',
        label: 'Griego',
        tooltip: 'Alfabeto y Símbolos Griegos',
        rows: [
          [
            { latex: '\\alpha' }, { latex: '\\beta' }, { latex: '\\gamma' }, { latex: '\\delta' },
            { latex: '\\epsilon' }, { latex: '\\zeta' }, { latex: '\\eta' }, { latex: '\\theta' }
          ],
          [
            { latex: '\\iota' }, { latex: '\\kappa' }, { latex: '\\lambda' }, { latex: '\\mu' },
            { latex: '\\nu' }, { latex: '\\xi' }, { latex: '\\pi' }, { latex: '\\rho' }
          ],
          [
            { latex: '\\sigma' }, { latex: '\\tau' }, { latex: '\\upsilon' }, { latex: '\\phi' },
            { latex: '\\chi' }, { latex: '\\psi' }, { latex: '\\omega' }
          ],
          [
            { latex: '\\Delta' }, { latex: '\\Theta' }, { latex: '\\Lambda' }, { latex: '\\Sigma' },
            { latex: '\\Omega' }, { latex: '\\Pi' },
            { command: ['performWithFeedback', 'deleteBackward'], label: '⌫' }
          ]
        ]
      },
      {
        id: 'chemistry',
        label: 'Química',
        tooltip: 'Notación Química y Nuclear (mhchem)',
        rows: [
          [
            { latex: '\\ce{^{#?}_{#?}#?}', label: '<sup>A</sup><sub>Z</sub>X' },
            { latex: '\\ce{^{133}_{55}Cs}', label: '¹³³₅₅Cs' },
            { latex: '\\ce{->}', label: '→' },
            { latex: '\\ce{<=>}', label: '⇌' },
            { latex: '^{2+}', label: '²⁺' },
            { latex: '^{-}', label: '⁻' }
          ],
          [
            { latex: '\\text{H}' }, { latex: '\\text{C}' }, { latex: '\\text{O}' }, { latex: '\\text{N}' },
            { latex: '\\text{P}' }, { latex: '\\text{S}' }, { latex: '\\text{Na}' }, { latex: '\\text{Cl}' }
          ],
          [
            { latex: '\\text{K}' }, { latex: '\\text{Ca}' }, { latex: '\\text{Fe}' }, { latex: '\\text{Cu}' },
            { latex: '\\text{Cs}' }, { latex: '\\text{U}' }, { latex: '+' }, { latex: '-' }
          ],
          [
            { latex: '(s)' }, { latex: '(l)' }, { latex: '(g)' }, { latex: '(aq)' },
            { command: ['performWithFeedback', 'deleteBackward'], label: '⌫' }
          ]
        ]
      }
    ];
  } catch (e) {
    console.warn('[setupMathVirtualKeyboard] Error setting layouts:', e);
  }
}
