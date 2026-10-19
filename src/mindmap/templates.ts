/**
 * Plantillas, conversión de esquemas y utilidades de árbol del mapa mental.
 */

import { walkTree, type MapDoc, DEFAULT_SETTINGS } from './store';

export interface MapNodeData {
  data: Record<string, any>;
  children: MapNodeData[];
}

export function mmuid(): string {
  return `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function makeNode(text: string, children: MapNodeData[] = [], extra: Record<string, any> = {}): MapNodeData {
  return { data: { text, uid: mmuid(), expand: true, ...extra }, children };
}

export interface TemplateDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  layout?: string;
  build: (title: string) => MapNodeData;
}

const todo = (text: string) => makeNode(text, [], { checked: false });

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'blank',
    name: 'En blanco',
    emoji: '✨',
    description: 'Solo el tema central y tres ramas para empezar.',
    build: (t) => makeNode(t, [makeNode('Idea 1'), makeNode('Idea 2'), makeNode('Idea 3')])
  },
  {
    id: 'brainstorm',
    name: 'Lluvia de ideas',
    emoji: '💡',
    description: 'Las seis preguntas clásicas para explorar un tema.',
    layout: 'mindMap',
    build: (t) =>
      makeNode(t, [
        makeNode('¿Qué?', [makeNode('Definición'), makeNode('Características')], { emoji: '❓' }),
        makeNode('¿Por qué?', [makeNode('Causas'), makeNode('Importancia')], { emoji: '🎯' }),
        makeNode('¿Cómo?', [makeNode('Proceso'), makeNode('Herramientas')], { emoji: '🛠️' }),
        makeNode('¿Quién?', [makeNode('Actores'), makeNode('Afectados')], { emoji: '👥' }),
        makeNode('¿Cuándo?', [makeNode('Origen'), makeNode('Plazos')], { emoji: '🗓️' }),
        makeNode('¿Dónde?', [makeNode('Contexto'), makeNode('Ejemplos')], { emoji: '📍' })
      ])
  },
  {
    id: 'study',
    name: 'Plan de estudio',
    emoji: '🎓',
    description: 'Objetivos, conceptos, fórmulas, ejemplos y repaso con tareas.',
    layout: 'mindMap',
    build: (t) =>
      makeNode(t, [
        makeNode('Objetivos', [todo('Entender la idea principal'), todo('Poder explicarlo sin apuntes')], { emoji: '🎯' }),
        makeNode('Conceptos clave', [makeNode('Concepto 1'), makeNode('Concepto 2'), makeNode('Concepto 3')], { emoji: '🔑' }),
        makeNode('Fórmulas y reglas', [makeNode('$E = mc^2$')], { emoji: '🧮' }),
        makeNode('Ejemplos', [makeNode('Ejemplo resuelto'), makeNode('Ejemplo propio')], { emoji: '🧪' }),
        makeNode('Dudas', [makeNode('¿Qué no me quedó claro?')], { emoji: '🤔' }),
        makeNode('Repaso', [todo('Día 1'), todo('Día 3'), todo('Día 7'), todo('Día 21')], { emoji: '🔁' })
      ])
  },
  {
    id: 'feynman',
    name: 'Técnica Feynman',
    emoji: '🧠',
    description: 'Explica el concepto con palabras simples y detecta lagunas.',
    build: (t) =>
      makeNode(t, [
        makeNode('Explicación simple', [makeNode('Como si tuviera 12 años…')], { emoji: '🗣️' }),
        makeNode('Analogía', [makeNode('Se parece a…')], { emoji: '🔗' }),
        makeNode('Ejemplo cotidiano', [makeNode('Lo veo cuando…')], { emoji: '🏠' }),
        makeNode('Lagunas', [makeNode('No sé explicar…'), makeNode('Debo repasar…')], { emoji: '🕳️' }),
        makeNode('Conexiones', [makeNode('Se relaciona con…')], { emoji: '🕸️' })
      ])
  },
  {
    id: 'cornell',
    name: 'Notas Cornell',
    emoji: '📝',
    description: 'Palabras clave, notas y resumen en un solo vistazo.',
    layout: 'logicalStructure',
    build: (t) =>
      makeNode(t, [
        makeNode('Palabras clave', [makeNode('Término 1'), makeNode('Término 2')], { emoji: '🔑' }),
        makeNode('Notas', [makeNode('Idea principal'), makeNode('Detalle')], { emoji: '📓' }),
        makeNode('Resumen', [makeNode('En una frase…')], { emoji: '📌' })
      ])
  },
  {
    id: 'swot',
    name: 'FODA / SWOT',
    emoji: '🧭',
    description: 'Fortalezas, debilidades, oportunidades y amenazas.',
    layout: 'mindMap',
    build: (t) =>
      makeNode(t, [
        makeNode('Fortalezas', [makeNode('…')], { emoji: '💪' }),
        makeNode('Debilidades', [makeNode('…')], { emoji: '⚠️' }),
        makeNode('Oportunidades', [makeNode('…')], { emoji: '🚀' }),
        makeNode('Amenazas', [makeNode('…')], { emoji: '🌩️' })
      ])
  },
  {
    id: 'project',
    name: 'Proyecto',
    emoji: '📦',
    description: 'Objetivo, tareas, recursos, riesgos y calendario.',
    layout: 'logicalStructure',
    build: (t) =>
      makeNode(t, [
        makeNode('Objetivo', [makeNode('¿Qué quiero lograr?')], { emoji: '🎯' }),
        makeNode('Tareas', [todo('Tarea 1'), todo('Tarea 2'), todo('Tarea 3')], { emoji: '✅' }),
        makeNode('Recursos', [makeNode('Tiempo'), makeNode('Materiales')], { emoji: '🧰' }),
        makeNode('Riesgos', [makeNode('Riesgo 1')], { emoji: '🛑' }),
        makeNode('Calendario', [makeNode('Inicio'), makeNode('Entrega')], { emoji: '🗓️' })
      ])
  },
  {
    id: 'proscons',
    name: 'Pros y contras',
    emoji: '⚖️',
    description: 'Compara opciones y llega a una conclusión.',
    layout: 'mindMap',
    build: (t) =>
      makeNode(t, [
        makeNode('A favor', [makeNode('Ventaja 1'), makeNode('Ventaja 2')], { emoji: '👍' }),
        makeNode('En contra', [makeNode('Desventaja 1'), makeNode('Desventaja 2')], { emoji: '👎' }),
        makeNode('Conclusión', [makeNode('Decisión…')], { emoji: '✅' })
      ])
  },
  {
    id: 'essay',
    name: 'Ensayo',
    emoji: '✍️',
    description: 'Tesis, argumentos con evidencia y conclusión.',
    layout: 'logicalStructure',
    build: (t) =>
      makeNode(t, [
        makeNode('Introducción', [makeNode('Gancho'), makeNode('Tesis')], { emoji: '🎬' }),
        makeNode('Argumento 1', [makeNode('Evidencia'), makeNode('Análisis')], { emoji: '1️⃣' }),
        makeNode('Argumento 2', [makeNode('Evidencia'), makeNode('Análisis')], { emoji: '2️⃣' }),
        makeNode('Argumento 3', [makeNode('Evidencia'), makeNode('Análisis')], { emoji: '3️⃣' }),
        makeNode('Conclusión', [makeNode('Síntesis'), makeNode('Cierre')], { emoji: '🏁' })
      ])
  },
  {
    id: 'week',
    name: 'Semana',
    emoji: '📅',
    description: 'Plan semanal de lunes a domingo.',
    layout: 'timeline',
    build: (t) =>
      makeNode(
        t,
        ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d) =>
          makeNode(d, [todo('Tarea principal'), todo('Repaso')])
        )
      )
  },
  {
    id: 'process',
    name: 'Proceso',
    emoji: '➡️',
    description: 'Pasos de un proceso en orden.',
    layout: 'verticalTimeline',
    build: (t) => makeNode(t, [makeNode('Paso 1', [makeNode('Detalle')]), makeNode('Paso 2', [makeNode('Detalle')]), makeNode('Paso 3', [makeNode('Detalle')]), makeNode('Resultado', [], { emoji: '🏁' })])
  },
  {
    id: 'cause',
    name: 'Causa y efecto',
    emoji: '🐟',
    description: 'Diagrama de espina de pescado para analizar causas.',
    layout: 'fishbone',
    build: (t) =>
      makeNode(t, [
        makeNode('Personas', [makeNode('Causa')]),
        makeNode('Método', [makeNode('Causa')]),
        makeNode('Materiales', [makeNode('Causa')]),
        makeNode('Entorno', [makeNode('Causa')])
      ])
  }
];

export const TEMPLATE_BY_ID: Record<string, TemplateDef> = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));

/** Construye un documento nuevo a partir de una plantilla */
export function docFromTemplate(templateId: string, title: string): MapDoc {
  const tpl = TEMPLATE_BY_ID[templateId] || TEMPLATES[0];
  return {
    v: 2,
    root: tpl.build(title),
    settings: { ...DEFAULT_SETTINGS, layout: tpl.layout || DEFAULT_SETTINGS.layout },
    updatedAt: Date.now()
  };
}

/** Árbol de esquema ({text, children}) → árbol de nodos del mapa (las ramas profundas arrancan contraídas si es muy grande) */
export function treeFromOutline(title: string, roots: { text: string; children?: any[] }[]): MapNodeData {
  const map = (n: any): MapNodeData => makeNode(String(n.text || ''), (n.children || []).map(map));
  const tree = makeNode(title, roots.map(map));
  let total = 0;
  walkTree(tree, () => total++);
  if (total > 60) {
    const collapse = (n: MapNodeData, depth: number) => {
      if (depth >= (total > 160 ? 1 : 2) && n.children.length) n.data.expand = false;
      n.children.forEach((c) => collapse(c, depth + 1));
    };
    collapse(tree, 0);
  }
  return tree;
}

/** El mapa de ejemplo que creaba la versión anterior ("Idea Principal / Subtema A / Subtema B") no cuenta como contenido del usuario. */
export function isLegacyDemoTree(root: any): boolean {
  const text = (n: any) => String(n?.data?.text ?? n?.text ?? '').trim();
  if (text(root) !== 'Idea Principal') return false;
  const kids: any[] = root?.children || [];
  if (kids.length > 2) return false;
  return kids.every((k) => /^Subtema [AB]$/.test(text(k)) && !(k.children || []).length);
}

/** Normaliza datos de cualquier origen a un árbol de nodos válido (uid, expand, children). */
export function normalizeTree(root: any): MapNodeData {
  const seen = new Set<string>();
  const fix = (n: any): MapNodeData => {
    const data = n?.data && typeof n.data === 'object' ? { ...n.data } : { text: String(n?.text ?? '') };
    delete data.isActive;
    delete data.inserting;
    if (!data.uid || seen.has(data.uid)) data.uid = mmuid();
    seen.add(data.uid);
    if (data.expand === undefined) data.expand = true;
    if (typeof data.text !== 'string') data.text = String(data.text ?? '');
    const kids = Array.isArray(n?.children) ? n.children : [];
    return { data, children: kids.map(fix) };
  };
  return fix(root);
}

/* ======================= Conversión de texto ======================= */

function plain(t: unknown): string {
  return String(t ?? '').replace(/\r?\n/g, ' ');
}

export function treeToMarkdown(root: MapNodeData): string {
  const lines: string[] = [];
  const walk = (n: MapNodeData, depth: number) => {
    const d = n.data || {};
    const mark = typeof d.checked === 'boolean' ? (d.checked ? '[x] ' : '[ ] ') : '';
    const text = `${d.emoji ? d.emoji + ' ' : ''}${plain(d.text)}`;
    if (depth === 0) lines.push(`# ${text}`, '');
    else if (depth === 1) lines.push(`## ${text}`);
    else lines.push(`${'  '.repeat(depth - 2)}- ${mark}${text}`);
    if (d.note) lines.push(`${'  '.repeat(Math.max(0, depth - 1))}> ${plain(d.note)}`);
    (n.children || []).forEach((c) => walk(c, depth + 1));
  };
  walk(root, 0);
  return lines.join('\n') + '\n';
}

export function treeToText(root: MapNodeData): string {
  const lines: string[] = [];
  const walk = (n: MapNodeData, depth: number) => {
    lines.push(`${'\t'.repeat(depth)}${plain(n.data?.text)}`);
    (n.children || []).forEach((c) => walk(c, depth + 1));
  };
  walk(root, 0);
  return lines.join('\n') + '\n';
}

/** Esquema con sangría / Markdown / lista numerada → árbol de nodos */
export function textToTree(input: string, fallbackTitle = 'Mapa mental'): MapNodeData | null {
  const rawLines = input.replace(/\r/g, '').split('\n').filter((l) => l.trim().length > 0);
  if (!rawLines.length) return null;

  interface Item {
    level: number;
    text: string;
  }
  const items: Item[] = [];
  let hasHeadings = false;

  for (const raw of rawLines) {
    const heading = raw.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      hasHeadings = true;
      items.push({ level: heading[1].length - 1, text: heading[2].trim() });
      continue;
    }
    const indentMatch = raw.match(/^(\s*)(?:[-*+•]|\d+[.)])?\s*(.*)$/);
    const indentStr = indentMatch ? indentMatch[1] : '';
    const indent = indentStr.replace(/\t/g, '    ').length;
    const text = (indentMatch ? indentMatch[2] : raw).trim().replace(/^\[( |x|X)\]\s*/, '');
    if (!text) continue;
    items.push({ level: indent, text });
  }
  if (!items.length) return null;

  // Con encabezados: los puntos de lista cuelgan del último encabezado
  let levels: number[];
  if (hasHeadings) {
    let headingLevel = 0;
    levels = items.map((it, i) => {
      const raw = rawLines[i];
      if (/^#{1,6}\s/.test(raw)) {
        headingLevel = it.level;
        return it.level;
      }
      return headingLevel + 1 + Math.floor(it.level / 2);
    });
  } else {
    // Sangrías → niveles consecutivos
    const stack: number[] = [];
    levels = items.map((it) => {
      while (stack.length && stack[stack.length - 1] > it.level) stack.pop();
      if (!stack.length || stack[stack.length - 1] < it.level) stack.push(it.level);
      return stack.length - 1;
    });
  }

  // Si hay más de un elemento de nivel 0 → se crea una raíz con el título por defecto
  const minLevel = Math.min(...levels);
  const norm = levels.map((l) => l - minLevel);
  const topCount = norm.filter((l) => l === 0).length;

  let root: MapNodeData;
  const stack: MapNodeData[] = [];
  const startIndex = topCount === 1 && norm[0] === 0 ? 1 : 0;
  if (startIndex === 1) {
    root = makeNode(items[0].text);
    stack.push(root);
  } else {
    root = makeNode(fallbackTitle);
    stack.push(root);
  }

  for (let i = startIndex; i < items.length; i++) {
    const depth = norm[i] + (startIndex === 1 ? 0 : 1);
    const node = makeNode(items[i].text);
    // depth 1 = hijo de la raíz
    while (stack.length > depth) stack.pop();
    while (stack.length < depth) {
      // Salto de nivel: se cuelga del último nodo disponible
      const last = stack[stack.length - 1];
      const fill = last.children[last.children.length - 1] || last;
      stack.push(fill);
    }
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  return root;
}

/** Igual que textToTree pero devuelve la lista de ideas de primer nivel (sin raíz sintética) */
export function textToForest(input: string): MapNodeData[] {
  const marker = ' root';
  const tree = textToTree(input, marker);
  if (!tree) return [];
  return tree.data?.text === marker ? tree.children : [tree];
}

/** Texto de un nodo y sus descendientes (para crear tarjetas / buscar) */
export function subtreeText(node: MapNodeData, indent = ''): string {
  const lines = [`${indent}${plain(node.data?.text)}`];
  (node.children || []).forEach((c) => lines.push(subtreeText(c, indent + '  ')));
  return lines.join('\n');
}

export function countNodes(root: MapNodeData): number {
  let n = 0;
  walkTree(root, () => n++);
  return n;
}

/** Valida un archivo JSON importado y lo convierte en un documento */
export function docFromImport(parsed: any): MapDoc | null {
  if (!parsed) return null;
  if (parsed.v === 2 && parsed.root) {
    return { ...parsed, root: normalizeTree(parsed.root), settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) }, updatedAt: Date.now() };
  }
  const root = parsed.root?.data ? parsed.root : parsed.data ? parsed : null;
  if (!root) return null;
  return {
    v: 2,
    root: normalizeTree(root),
    settings: { ...DEFAULT_SETTINGS, layout: parsed.layout || DEFAULT_SETTINGS.layout },
    updatedAt: Date.now()
  };
}
