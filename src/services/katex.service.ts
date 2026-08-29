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
   * Parsea un texto buscando delimitadores $$ (bloque) y $ (inline), así como markdown completo (negrita, cursiva, subrayado, tachado, enlaces, código) y saltos de línea.
   */
  public parseAndRender(content: string): string {
    if (!content) return '';

    // 1. Reemplaza bloques KaTeX $$ ... $$
    let result = content.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      return `<div class="katex-block-container">${this.renderMath(math.trim(), true)}</div>`;
    });

    // 2. Reemplaza inline KaTeX $ ... $
    result = result.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      return `<span class="katex-inline-container">${this.renderMath(math.trim(), false)}</span>`;
    });

    // 3. Bloques de código ``` ... ```
    result = result.replace(/```([\s\S]*?)```/g, '<pre class="apple-code-block"><code>$1</code></pre>');

    // 4. Código inline ` ... `
    result = result.replace(/`([^`]+)`/g, '<code class="apple-code-inline">$1</code>');

    // 5. Negrita **texto**
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 6. Cursiva *texto*
    result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

    // 7. Subrayado __texto__ o <u>texto</u>
    result = result.replace(/__([^_]+)__/g, '<u>$1</u>');

    // 8. Tachado ~~texto~~
    result = result.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // 9. Enlaces [texto](url)
    result = result.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--f-blue,#38bdf8); text-decoration:underline;">$1</a>');

    // 10. Encabezados ## Texto
    result = result.replace(/^##\s+(.+)$/gm, '<h3 style="font-size:1.15rem; font-weight:800; margin:6px 0; color:#fff;">$1</h3>');

    // 11. Formatear saltos de línea
    result = result.replace(/\n/g, '<br/>');

    return result;
  }
}

export const katexService = KatexService.getInstance();
