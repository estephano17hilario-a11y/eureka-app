/**
 * Exportación del mapa: SVG / PNG (con el ambiente de fondo y las fotos), Markdown, texto y JSON.
 * El SVG se construye copiando los estilos calculados de cada nodo para que el resultado se vea igual
 * fuera de la app (los nodos son HTML dentro de <foreignObject>).
 */

import type { MindMapEngine } from './engine';
import { downloadBlob } from './engine';
import { treeToMarkdown, treeToText, type MapNodeData } from './templates';

const STYLE_PROPS = [
  'display',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'box-sizing',
  'width',
  'height',
  'min-width',
  'max-width',
  'margin',
  'padding',
  'border',
  'border-radius',
  'background',
  'background-color',
  'background-image',
  'box-shadow',
  'color',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-decoration',
  'text-shadow',
  'white-space',
  'word-break',
  'overflow-wrap',
  'overflow',
  'flex',
  'flex-direction',
  'flex-wrap',
  'align-items',
  'justify-content',
  'gap',
  'vertical-align',
  'object-fit',
  'visibility',
  'transform',
  'transform-origin',
  'text-transform'
];

function inlineComputedStyles(live: Element, clone: Element): void {
  if (live instanceof HTMLElement && clone instanceof HTMLElement) {
    const cs = getComputedStyle(live);
    let css = '';
    for (const p of STYLE_PROPS) {
      const v = cs.getPropertyValue(p);
      if (v) css += `${p}:${v};`;
    }
    clone.setAttribute('style', css);
  }
  const lc = live.children;
  const cc = clone.children;
  for (let i = 0; i < lc.length && i < cc.length; i++) inlineComputedStyles(lc[i], cc[i]);
}

function escapeXmlAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export interface BuiltSvg {
  svg: string;
  width: number;
  height: number;
}

export async function buildExportSvg(engine: MindMapEngine, pad = 64): Promise<BuiltSvg | null> {
  const mm = engine.mm;
  const b = engine.getTreeBounds();
  if (!mm || !b) return null;

  const width = Math.ceil(b.maxX - b.minX + pad * 2);
  const height = Math.ceil(b.maxY - b.minY + pad * 2);

  return engine.withAllVisible(async () => {
    const drawLive = mm.draw.node as SVGGElement;
    const clone = drawLive.cloneNode(true) as SVGGElement;
    clone.setAttribute('transform', `translate(${pad - b.minX},${pad - b.minY})`);
    clone.removeAttribute('style');

    // Estilos de los nodos HTML (dentro de foreignObject)
    const liveFos = drawLive.querySelectorAll('foreignObject');
    const cloneFos = clone.querySelectorAll('foreignObject');
    liveFos.forEach((fo, i) => {
      const c = cloneFos[i];
      if (!c) return;
      const liveRoot = fo.firstElementChild;
      const cloneRoot = c.firstElementChild;
      if (liveRoot && cloneRoot) {
        inlineComputedStyles(liveRoot, cloneRoot);
        cloneRoot.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      }
    });

    // Fuera lo que solo sirve para editar
    clone.querySelectorAll('.smm-hover-node').forEach((el) => el.remove());

    const stage = engine.stageEl;
    const bg = stage.style.getPropertyValue('--mm-bg') || '#ffffff';

    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      `<foreignObject x="0" y="0" width="${width}" height="${height}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;background:${escapeXmlAttr(bg)};"></div></foreignObject>`,
      new XMLSerializer().serializeToString(clone),
      '</svg>'
    ].join('');
    return { svg, width, height };
  });
}

function loadSvgImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo generar la imagen'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

function safeName(name: string): string {
  return (name || 'mapa-mental').replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60) || 'mapa-mental';
}

export type ExportKind = 'png' | 'svg' | 'md' | 'txt' | 'json';

export async function exportMap(engine: MindMapEngine, kind: ExportKind, title: string): Promise<void> {
  const name = safeName(title);
  if (kind === 'json') {
    downloadBlob(new Blob([JSON.stringify(engine.getDoc(), null, 2)], { type: 'application/json' }), `${name}.json`);
    return;
  }
  const root = engine.getDoc().root as MapNodeData;
  if (kind === 'md') {
    downloadBlob(new Blob([treeToMarkdown(root)], { type: 'text/markdown;charset=utf-8' }), `${name}.md`);
    return;
  }
  if (kind === 'txt') {
    downloadBlob(new Blob([treeToText(root)], { type: 'text/plain;charset=utf-8' }), `${name}.txt`);
    return;
  }

  const built = await buildExportSvg(engine);
  if (!built) throw new Error('El mapa está vacío');

  if (kind === 'svg') {
    downloadBlob(new Blob([built.svg], { type: 'image/svg+xml;charset=utf-8' }), `${name}.svg`);
    return;
  }

  // PNG
  const maxSide = 4096;
  const scale = Math.max(0.5, Math.min(2, maxSide / Math.max(built.width, built.height)));
  const img = await loadSvgImage(built.svg);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(built.width * scale);
  canvas.height = Math.round(built.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Tu navegador no permite generar la imagen');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), 'image/png'));
  if (!blob) throw new Error('No se pudo crear el PNG');
  downloadBlob(blob, `${name}.png`);
}
