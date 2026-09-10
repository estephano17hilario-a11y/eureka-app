import katex from 'katex';
import 'katex/dist/contrib/mhchem.js';
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
   * Parsea un texto buscando delimitadores $$ (bloque) y $ (inline), así como markdown completo (negrita, cursiva, subrayado, tachado, sub/superíndice, enlaces, código) y saltos de línea.
   */
  public parseAndRender(content: string): string {
    if (!content) return '';

    // 1. Reemplaza bloques KaTeX $$ ... $$
    let result = content.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      return `<div class="katex-block-container" style="margin:8px 0; text-align:center;">${this.renderMath(math.trim(), true)}</div>`;
    });

    // 2. Subíndice $_texto$ y Superíndice $^texto$
    result = result.replace(/\$_([^\$\n]+?)\$/g, '<sub style="font-size:0.8em; vertical-align:sub;">$1</sub>');
    result = result.replace(/\$\^([^\$\n]+?)\$/g, '<sup style="font-size:0.8em; vertical-align:super;">$1</sup>');

    // 3. Reemplaza inline KaTeX $ ... $
    result = result.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      return `<span class="katex-inline-container" style="display:inline-block; padding:0 2px;">${this.renderMath(math.trim(), false)}</span>`;
    });

    // 4. Soporta notación química/nuclear \ce{...} explícita fuera de $
    result = result.replace(/\\ce\{([^\n]+?)\}/g, (_, chem) => {
      return `<span class="katex-inline-container" style="display:inline-block; padding:0 2px;">${this.renderMath(`\\ce{${chem}}`, false)}</span>`;
    });

    // 4. Bloques de código ``` ... ```
    result = result.replace(/```([\s\S]*?)```/g, '<pre class="apple-code-block" style="background:#111218; padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); overflow-x:auto; text-align:left; font-family:monospace; margin:8px 0;"><code>$1</code></pre>');

    // 5. Código inline ` ... `
    result = result.replace(/`([^`]+)`/g, '<code class="apple-code-inline" style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:6px; font-family:monospace; color:#38bdf8;">$1</code>');

    // 6. Negrita **texto** o __texto__
    result = result.replace(/\*\*([\s\S]+?)\*\*/g, '<strong style="font-weight:900; color:#ffffff;">$1</strong>');

    // 7. Subrayado __texto__
    result = result.replace(/__([\s\S]+?)__/g, '<u style="text-decoration:underline; text-underline-offset:3px;">$1</u>');

    // 8. Cursiva *texto*
    result = result.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em style="font-style:italic; color:#e2e8f0;">$1</em>');

    // 9. Tachado ~~texto~~
    result = result.replace(/~~([\s\S]+?)~~/g, '<del style="text-decoration:line-through; opacity:0.75;">$1</del>');

    // 10. Enlaces [texto](url)
    result = result.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--f-blue,#38bdf8); font-weight:700; text-decoration:underline; text-underline-offset:2px;">$1</a>');

    // 11. Encabezados ## Texto
    result = result.replace(/^##\s+(.+)$/gm, '<h3 style="font-size:1.25rem; font-weight:900; margin:8px 0; color:#ffffff; letter-spacing:-0.01em;">$1</h3>');

    // 12. Listas con viñetas y numeradas
    result = result.replace(/^-\s+(.+)$/gm, '<div style="display:flex; align-items:flex-start; gap:8px; margin:3px 0; text-align:left;"><span style="color:#38bdf8; font-weight:bold;">•</span><span>$1</span></div>');
    result = result.replace(/^(\d+)\.\s+(.+)$/gm, '<div style="display:flex; align-items:flex-start; gap:8px; margin:3px 0; text-align:left;"><span style="color:#38bdf8; font-weight:bold;">$1.</span><span>$2</span></div>');

    // 13. Formatear saltos de línea
    result = result.replace(/\n/g, '<br/>');

    return result;
  }
}

export const katexService = KatexService.getInstance();
