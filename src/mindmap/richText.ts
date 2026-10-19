import { katexService } from '../services/katex.service';

/**
 * Formatea el texto de un nodo a HTML seguro:
 *  - Escapa HTML.
 *  - Renderiza fórmulas $...$ y $$...$$ con KaTeX.
 *  - Soporta **negrita**, *cursiva* y `código` en línea.
 *  - Respeta saltos de línea.
 * Es deliberadamente más ligero que el parser Markdown completo para no inflar los nodos.
 */

const cache = new Map<string, string>();
const CACHE_LIMIT = 600;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarks(escaped: string): string {
  return escaped
    .replace(/`([^`\n]+)`/g, '<code class="mmx-code">$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
}

export function stripToPlain(text: string): string {
  return (text || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\r/g, '');
}

export function hasMath(text: string): boolean {
  return /\$[^$]+\$/.test(text) || /\\(frac|sqrt|sum|int|alpha|beta|theta|pi|ce|mathbb)\b/.test(text);
}

export function formatNodeText(raw: string): string {
  const text = stripToPlain(raw ?? '');
  const hit = cache.get(text);
  if (hit !== undefined) return hit;

  // Separar fórmulas para no tocar su contenido con las marcas inline
  const parts: string[] = [];
  const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const segments: { type: 'text' | 'math'; value: string; display?: boolean }[] = [];
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segments.push({ type: 'text', value: text.slice(last, m.index) });
    if (m[1] !== undefined) segments.push({ type: 'math', value: m[1], display: true });
    else segments.push({ type: 'math', value: m[2], display: false });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ type: 'text', value: text.slice(last) });

  for (const seg of segments) {
    if (seg.type === 'math') {
      parts.push(`<span class="mmx-math">${katexService.renderMath(seg.value, Boolean(seg.display))}</span>`);
    } else {
      parts.push(inlineMarks(escapeHtml(seg.value)).replace(/\n/g, '<br>'));
    }
  }

  const html = parts.join('');
  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(text, html);
  return html;
}
