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
    if (!expression || !expression.trim()) return '';
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
      return `<span class="katex-error">${this.escapeHtml(expression)}</span>`;
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
   * - Bloques matemáticos $$ ... $$, \[ ... \], ```math, ```latex, ```katex
   * - Notación //math ... //, [math]...[/math], <math>...</math>
   * - Matemáticas inline $ ... $ y \( ... \)
   * - Notación química/nuclear \ce{...} con llaves anidadas
   * - Auto-detección universal de fórmulas y símbolos LaTeX crudos sin delimitadores (\mathbb{N}, \mathbb{R}, \frac, etc.)
   * - Markdown completo: encabezados, listas, tablas, citas, código, negrita, cursiva, etc.
   * - Cero colisiones con el formateador de Markdown (usa tokens Unicode puros sin guiones bajos ni asteriscos).
   */
  public parseAndRender(content: string): string {
    if (!content) return '';

    const placeholders: { id: string; html: string }[] = [];
    let pCount = 0;

    // IMPORTANTE: NO usar guiones bajos (_) ni asteriscos (*) en el ID del placeholder
    // para evitar que los regexes de Markdown bold/italic (__texto__ o **texto**) lo corrompan.
    const addPlaceholder = (html: string): string => {
      const id = `\uE000P${pCount++}K\uE001`;
      placeholders.push({ id, html });
      return id;
    };

    let text = content;

    // 0. Pre-sanitización: Limpieza de tokens residuales antiguos y formato de comentarios
    text = text
      .replace(/EUREKAPH_\d+/gi, '')
      .replace(/EUREKAPH\d+TOKEN/gi, '')
      .replace(/EUREKAMATH\d+/gi, '')
      .replace(/^\/\/\s*([A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s]+):?\s*\*{0,2}\s*$/gm, '**$1:**');

    // 1. Bloques de código especiales: ```math, ```latex, ```katex, ```tex, ```formula
    text = text.replace(/```(?:math|latex|katex|tex|formula)\n?([\s\S]*?)```/gi, (_, mathCode) => {
      return addPlaceholder(
        `<div class="katex-block-container">${this.renderMath(mathCode, true)}</div>`
      );
    });

    // 2. Bloques de código estándar ```lang ... ```
    text = text.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = this.escapeHtml(code);
      return addPlaceholder(
        `<pre class="apple-code-block" data-lang="${lang || 'text'}"><code>${escaped}</code></pre>`
      );
    });

    // 3. Código inline ` ... `
    text = text.replace(/`([^`\n]+)`/g, (_, code) => {
      const escaped = this.escapeHtml(code);
      return addPlaceholder(`<code class="apple-code-inline">${escaped}</code>`);
    });

    // 4. Notaciones explícitas especiales: //math ... //, [math]...[/math], <math>...</math>
    text = text.replace(/\/\/\s*math\s*\n?([\s\S]+?)\n?\/\//gi, (_, math) => {
      return addPlaceholder(
        `<div class="katex-block-container">${this.renderMath(math, true)}</div>`
      );
    });
    text = text.replace(/\[math\]([\s\S]+?)\[\/math\]/gi, (_, math) => {
      return addPlaceholder(
        `<div class="katex-block-container">${this.renderMath(math, true)}</div>`
      );
    });
    text = text.replace(/<math>([\s\S]+?)<\/math>/gi, (_, math) => {
      return addPlaceholder(
        `<div class="katex-block-container">${this.renderMath(math, true)}</div>`
      );
    });

    // 5. Bloques matemáticos KaTeX estándar $$ ... $$ y \[ ... \]
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

    // 6. Notación química / nuclear \ce{...} (soporta llaves anidadas como \ce{^{133}_{55}Cs})
    text = this.replaceBalancedCommands(text, '\\ce', (chem) => {
      return addPlaceholder(
        `<span class="katex-inline-container">${this.renderMath(`\\ce{${chem}}`, false)}</span>`
      );
    });

    // 7. Matemáticas inline KaTeX $ ... $ y \( ... \)
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

    // 8. Subíndices y Superíndices simplificados $_sub$ y $^sup$
    text = text.replace(/\$_([^\$\n]+?)\$/g, '<sub style="font-size:0.8em; vertical-align:sub;">$1</sub>');
    text = text.replace(/\$\^([^\$\n]+?)\$/g, '<sup style="font-size:0.8em; vertical-align:super;">$1</sup>');

    // 9. Auto-detección universal de fórmulas y símbolos LaTeX crudos sin delimitadores $
    // Paso 9a: Fórmulas que inician con comando LaTeX (\mathbb{N} = \{...\} vs. \mathbb{R} = \{...\})
    const rawLatexRegex = /(?<![a-zA-Z0-9_\\<\uE000\uE001])\\[a-zA-Z]+(?:\[[^\]]*\])?(?:\{[^{}\uE000\uE001]*(?:\{[^{}\uE000\uE001]*\}[^{}\uE000\uE001]*)*\})*(?:[_\^](?:\{[^{}\uE000\uE001]*\}|[a-zA-Z0-9]))*(?:[a-zA-Z0-9_^{}\(\)\+\-\*\/=·~<>|\\,:]|\s*[\+\-\*=·<>~:]\s*|\.[0-9]+|\s*\\quad\s*|\s*\\text\{[^{}\uE000\uE001]*\}\s*)*?(?=[,;:!?]|\s+[a-záéíóúñ]{3,}|\n|<|\uE000|$)/g;

    text = text.replace(rawLatexRegex, (match) => {
      if (match.includes('\uE000') || match.includes('\uE001')) return match;

      // Separar puntuación al final (ej: punto, coma, punto y coma)
      const trailingPunctMatch = match.match(/([.,;:!?]+)$/);
      const trailingPunct = trailingPunctMatch ? trailingPunctMatch[1] : '';
      const formulaOnly = match.slice(0, match.length - trailingPunct.length).trim();

      if (!formulaOnly || formulaOnly.length < 2) return match;

      const rendered = this.renderMath(formulaOnly, false);
      if (!rendered || rendered.includes('katex-error')) return match;
      return addPlaceholder(`<span class="katex-inline-container">${rendered}</span>`) + trailingPunct;
    });

    // Paso 9b: Comandos individuales aislados (\equiv, \approx, \alpha, \le, \in, etc.)
    const singleCmdRegex = /(?<![a-zA-Z0-9_\\<\uE000\uE001])\\[a-zA-Z]+(?:\[[^\]]*\])?(?:\{[^{}\uE000\uE001]*(?:\{[^{}\uE000\uE001]*\}[^{}\uE000\uE001]*)*\})*(?:[_\^](?:\{[^{}\uE000\uE001]*\}|[a-zA-Z0-9]))*/g;
    text = text.replace(singleCmdRegex, (match) => {
      if (match.includes('\uE000') || match.includes('\uE001')) return match;
      const rendered = this.renderMath(match, false);
      if (!rendered || rendered.includes('katex-error')) return match;
      return addPlaceholder(`<span class="katex-inline-container">${rendered}</span>`);
    });

    // 10. Tablas Markdown (| Header 1 | Header 2 |)
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

    // 11. Citas tipo Blockquote (> Texto)
    text = text.replace(/^>\s+(.+)$/gm, '<blockquote class="apple-markdown-quote">$1</blockquote>');

    // 12. Encabezados Markdown
    text = text.replace(/^####\s+(.+)$/gm, '<h4 class="apple-markdown-h4">$1</h4>');
    text = text.replace(/^###\s+(.+)$/gm, '<h3 class="apple-markdown-h3">$1</h3>');
    text = text.replace(/^##\s+(.+)$/gm, '<h2 class="apple-markdown-h2">$1</h2>');
    text = text.replace(/^#\s+(.+)$/gm, '<h1 class="apple-markdown-h1">$1</h1>');

    // 13. Separadores horizontales
    text = text.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr class="apple-markdown-hr" />');

    // 14. Listas no ordenadas y ordenadas
    text = text.replace(
      /^-\s+(.+)$/gm,
      '<div class="apple-markdown-list-item"><span class="list-bullet">•</span><span>$1</span></div>'
    );
    text = text.replace(
      /^(\d+)\.\s+(.+)$/gm,
      '<div class="apple-markdown-list-item"><span class="list-number">$1.</span><span>$2</span></div>'
    );

    // 15. Formato de texto en línea (negrita, cursiva, subrayado, tachado, enlaces)
    text = text.replace(/\*\*([\s\S]+?)\*\*/g, '<strong style="font-weight:800; color:#fff;">$1</strong>');
    text = text.replace(/__([\s\S]+?)__/g, '<strong style="font-weight:800; color:#fff;">$1</strong>');
    text = text.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em style="font-style:italic; color:#e2e8f0;">$1</em>');
    text = text.replace(/~~([\s\S]+?)~~/g, '<del style="text-decoration:line-through; opacity:0.75;">$1</del>');
    text = text.replace(/<u>([\s\S]+?)<\/u>/g, '<u style="text-decoration:underline; text-underline-offset:3px;">$1</u>');
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; font-weight:700; text-decoration:underline;">$1</a>');

    // 16. Párrafos (separa por bloques de doble salto de línea)
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

    // 17. Restauración exacta de placeholders (orden inverso para evitar colisiones de prefijo)
    for (let i = placeholders.length - 1; i >= 0; i--) {
      const p = placeholders[i];
      finalHtml = finalHtml.replaceAll(p.id, p.html);
    }

    // Safety cleanup final: Asegura que ningún token interno llegue jamás a la vista del usuario
    finalHtml = finalHtml
      .replace(/[\uE000\uE001]/g, '')
      .replace(/EUREKAPH_\d+/gi, '')
      .replace(/EUREKAPH\d+TOKEN/gi, '')
      .replace(/EUREKAMATH\d+/gi, '');

    return finalHtml;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export const katexService = KatexService.getInstance();

