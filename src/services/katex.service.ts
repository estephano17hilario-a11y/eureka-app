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
   * Limpia y sanea expresiones LaTeX antes de renderizar.
   * Por ejemplo: envuelve texto con acentos en subíndices/superíndices en \text{} para evitar errores KaTeX.
   */
  public sanitizeMath(expression: string): string {
    if (!expression) return '';
    let sanitized = expression;

    // Convertir subíndices o superíndices que contengan texto con tildes o palabras en \text{}
    // ej: M_{núcleo} -> M_{\text{núcleo}}
    sanitized = sanitized.replace(
      /([_\^])\{([^{}\\]*[áéíóúÁÉÍÓÚñÑ][^{}\\]*)\}/g,
      '$1{\\text{$2}}'
    );

    return sanitized;
  }

  /**
   * Renderiza una expresión matemática en bloque o inline de forma segura.
   */
  public renderMath(expression: string, displayMode: boolean = false): string {
    const cleanExpr = this.sanitizeMath(expression.trim());
    try {
      return katex.renderToString(cleanExpr, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: true,
        output: 'htmlAndMathml'
      });
    } catch {
      return `<span class="katex-error">${expression}</span>`;
    }
  }

  /**
   * Busca y extrae comandos con llaves anidadas/balanceadas como \ce{^{A}_{Z}X}
   */
  private replaceBalancedCommands(
    text: string,
    command: string,
    replacer: (arg: string) => string
  ): string {
    const prefix = command + '{';
    let result = '';
    let pos = 0;

    while (pos < text.length) {
      const idx = text.indexOf(prefix, pos);
      if (idx === -1) {
        result += text.slice(pos);
        break;
      }

      result += text.slice(pos, idx);
      let depth = 1;
      let i = idx + prefix.length;

      while (i < text.length && depth > 0) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}') depth--;
        i++;
      }

      if (depth === 0) {
        const arg = text.slice(idx + prefix.length, i - 1);
        result += replacer(arg);
        pos = i;
      } else {
        result += text.slice(idx, idx + prefix.length);
        pos = idx + prefix.length;
      }
    }

    return result;
  }

  /**
   * Parsea un texto completo soportando:
   * - Bloques matemáticos $$ ... $$ y \[ ... \]
   * - Matemáticas inline $ ... $ y \( ... \)
   * - Notación química/nuclear \ce{...} con llaves anidadas
   * - Auto-detección de fórmulas LaTeX crudas sin delimitadores
   * - Markdown completo: encabezados, listas, tablas, citas, código, negrita, cursiva, etc.
   */
  public parseAndRender(content: string): string {
    if (!content) return '';

    const placeholders: { id: string; html: string }[] = [];
    let pCount = 0;
    const addPlaceholder = (html: string): string => {
      const id = `___EUREKA_PLACEHOLDER_${pCount++}___`;
      placeholders.push({ id, html });
      return id;
    };

    let text = content;

    // 1. Bloques de código ```lang ... ```
    text = text.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return addPlaceholder(
        `<pre class="apple-code-block" data-lang="${lang || 'text'}"><code>${escaped}</code></pre>`
      );
    });

    // 2. Código inline ` ... `
    text = text.replace(/`([^`\n]+)`/g, (_, code) => {
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return addPlaceholder(`<code class="apple-code-inline">${escaped}</code>`);
    });

    // 3. Bloques matemáticos KaTeX $$ ... $$ y \[ ... \]
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      return addPlaceholder(
        `<div class="katex-block-container">${this.renderMath(math, true)}</div>`
      );
    });
    text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => {
      return addPlaceholder(
        `<div class="katex-block-container">${this.renderMath(math, true)}</div>`
      );
    });

    // 4. Notación química / nuclear \ce{...} (soporta llaves anidadas como \ce{^{133}_{55}Cs})
    text = this.replaceBalancedCommands(text, '\\ce', (chem) => {
      return addPlaceholder(
        `<span class="katex-inline-container">${this.renderMath(`\\ce{${chem}}`, false)}</span>`
      );
    });

    // 5. Matemáticas inline KaTeX $ ... $ y \( ... \)
    text = text.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      return addPlaceholder(
        `<span class="katex-inline-container">${this.renderMath(math, false)}</span>`
      );
    });
    text = text.replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => {
      return addPlaceholder(
        `<span class="katex-inline-container">${this.renderMath(math, false)}</span>`
      );
    });

    // 6. Subíndices y Superíndices simplificados $_sub$ y $^sup$
    text = text.replace(/\$_([^\$\n]+?)\$/g, '<sub style="font-size:0.8em; vertical-align:sub;">$1</sub>');
    text = text.replace(/\$\^([^\$\n]+?)\$/g, '<sup style="font-size:0.8em; vertical-align:super;">$1</sup>');

    // 7. Auto-detección de fórmulas LaTeX crudas que no tengan delimitadores $
    // Detecta comandos como \Delta, \alpha, \frac, \sqrt, etc., con sus ecuaciones
    const rawLatexRegex = /(?<![a-zA-Z0-9_\\])\\(?:Delta|alpha|beta|gamma|delta|epsilon|theta|lambda|pi|sigma|omega|mu|nu|tau|phi|psi|frac|sqrt|int|sum|prod|partial|nabla|infty|approx|pm|times|neq|leq|geq|cdot)(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|[a-zA-Z0-9_^{}\(\)\+\-\*\/\s=·~<>|])+/g;

    text = text.replace(rawLatexRegex, (match) => {
      // Separar puntuación al final (ej: punto, coma, punto y coma)
      const trailingPunctuationMatch = match.match(/([.,;:!?]+)$/);
      const trailingPunct = trailingPunctuationMatch ? trailingPunctuationMatch[1] : '';
      const formulaOnly = match.slice(0, match.length - trailingPunct.length).trim();

      if (!formulaOnly) return match;

      const rendered = this.renderMath(formulaOnly, false);
      return addPlaceholder(`<span class="katex-inline-container">${rendered}</span>`) + trailingPunct;
    });

    // 8. Tablas Markdown (| Header 1 | Header 2 |)
    text = text.replace(
      /(^\|[^\n]+\|\r?\n\|[-:\s|]+\|\r?\n(?:\|[^\n]+\|\r?\n?)+)/gm,
      (tableBlock) => {
        const lines = tableBlock.trim().split(/\r?\n/);
        if (lines.length < 3) return tableBlock;

        const parseRow = (rowStr: string) =>
          rowStr
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((c) => c.trim());

        const headers = parseRow(lines[0]);
        const bodyLines = lines.slice(2);

        let html = '<div class="apple-table-wrap"><table class="apple-markdown-table"><thead><tr>';
        headers.forEach((h) => {
          html += `<th>${h}</th>`;
        });
        html += '</tr></thead><tbody>';

        bodyLines.forEach((bLine) => {
          const cells = parseRow(bLine);
          html += '<tr>';
          cells.forEach((c) => {
            html += `<td>${c}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody></table></div>';

        return addPlaceholder(html);
      }
    );

    // 9. Citas tipo Blockquote (> Texto)
    text = text.replace(/^>\s+(.+)$/gm, '<blockquote class="apple-markdown-quote">$1</blockquote>');

    // 10. Encabezados Markdown
    text = text.replace(/^####\s+(.+)$/gm, '<h4 class="apple-markdown-h4">$1</h4>');
    text = text.replace(/^###\s+(.+)$/gm, '<h3 class="apple-markdown-h3">$1</h3>');
    text = text.replace(/^##\s+(.+)$/gm, '<h2 class="apple-markdown-h2">$1</h2>');
    text = text.replace(/^#\s+(.+)$/gm, '<h1 class="apple-markdown-h1">$1</h1>');

    // 11. Separadores horizontales
    text = text.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr class="apple-markdown-hr" />');

    // 12. Listas no ordenadas y ordenadas
    text = text.replace(
      /^-\s+(.+)$/gm,
      '<div class="apple-markdown-list-item"><span class="list-bullet">•</span><span>$1</span></div>'
    );
    text = text.replace(
      /^(\d+)\.\s+(.+)$/gm,
      '<div class="apple-markdown-list-item"><span class="list-number">$1.</span><span>$2</span></div>'
    );

    // 13. Formato de texto en línea (negrita, cursiva, subrayado, tachado, enlaces)
    text = text.replace(/\*\*([\s\S]+?)\*\*/g, '<strong style="font-weight:800; color:#fff;">$1</strong>');
    text = text.replace(/__([\s\S]+?)__/g, '<strong style="font-weight:800; color:#fff;">$1</strong>');
    text = text.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em style="font-style:italic; color:#e2e8f0;">$1</em>');
    text = text.replace(/~~([\s\S]+?)~~/g, '<del style="text-decoration:line-through; opacity:0.75;">$1</del>');
    text = text.replace(/<u>([\s\S]+?)<\/u>/g, '<u style="text-decoration:underline; text-underline-offset:3px;">$1</u>');
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; font-weight:700; text-decoration:underline;">$1</a>');

    // 14. Párrafos (separa por bloques de doble salto de línea)
    const blocks = text.split(/\n\s*\n/);
    const renderedBlocks = blocks.map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';

      // Si ya es un bloque HTML estructurado (div, h1-h4, pre, blockquote, hr), no envolver en <p>
      if (
        trimmed.startsWith('<div') ||
        trimmed.startsWith('<h1') ||
        trimmed.startsWith('<h2') ||
        trimmed.startsWith('<h3') ||
        trimmed.startsWith('<h4') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<hr')
      ) {
        return trimmed;
      }

      // Convertir saltos de línea simples dentro del párrafo en <br/>
      const withBr = trimmed.replace(/\n/g, '<br/>');
      return `<p class="reading-p">${withBr}</p>`;
    });

    let finalHtml = renderedBlocks.filter(Boolean).join('\n');

    // 15. Restaurar placeholders en orden
    for (const p of placeholders) {
      finalHtml = finalHtml.replace(p.id, p.html);
    }

    return finalHtml;
  }
}

export const katexService = KatexService.getInstance();
