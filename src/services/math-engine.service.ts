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
 * Directiva 4: Motor de Validación Semántica de Exámenes.
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
 * Directiva 3: Teclado Virtual Mobile para Exámenes con pestañas adaptadas:
 * - Álgebra
 * - Cálculo
 * - Símbolos Griegos
 * - Química (incluyendo notación isotópica nuclear)
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
