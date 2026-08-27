import katex from 'katex';
import 'katex/dist/katex.min.css';

export class KatexService {
  private static instance: KatexService;

  private constructor() {}

  public static getInstance(): KatexService {
    if (!KatexService.instance) {
      KatexService.instance = new KatexService();
    }
    return KatexService.instance;
  }

  /**
   * Renderiza una expresión matemática en bloque o inline de forma segura.
   */
  public renderMath(expression: string, displayMode: boolean = false): string {
    try {
      return katex.renderToString(expression, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml'
      });
    } catch {
      return `<span class="katex-error">${expression}</span>`;
    }
  }

  /**
   * Parsea un texto buscando delimitadores $$ (bloque) y $ (inline) y los reemplaza por HTML KaTeX.
   */
  public parseAndRender(content: string): string {
    if (!content) return '';

    // Reemplaza bloques $$ ... $$
    let result = content.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      return `<div class="katex-block-container">${this.renderMath(math.trim(), true)}</div>`;
    });

    // Reemplaza inline $ ... $
    result = result.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      return `<span class="katex-inline-container">${this.renderMath(math.trim(), false)}</span>`;
    });

    return result;
  }
}

export const katexService = KatexService.getInstance();
