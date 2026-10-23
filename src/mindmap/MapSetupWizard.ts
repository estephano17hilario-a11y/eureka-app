/**
 * Asistente de creación del mapa: una experiencia inmersiva paso a paso, en el centro de la pantalla.
 * Cada elección se ve al instante en una vista previa con el ambiente real (y en el mapa de fondo):
 * fondo → textura → diseño → líneas → letra → espacio → punto de partida.
 * La primera vez que alguien crea un mapa, además, empieza con un mini tutorial.
 */

import './wizard.css';
import type { MindMapEngine } from './engine';
import type { MapSettings } from './store';
import { MAP_THEMES, FONT_CHOICES, themeForAppEnvironment, resolveLook, type MapTheme } from './themes';
import { TEMPLATES } from './templates';
import { layoutIcon } from './icons';
import { withAlpha } from './color';

export interface WizardOptions {
  engine: MindMapEngine;
  /** Elemento .mmx-studio donde se monta el asistente */
  host: HTMLElement;
  title: string;
  firstTime: boolean;
  /** Hay un esquema del cuaderno como punto de partida */
  hasOutline: boolean;
  /** Incluye el paso «¿Con qué empiezas?» (solo al crear un mapa nuevo; reemplaza el contenido) */
  includeStart: boolean;
  /** Aplica una plantilla (solo contenido; el diseño lo decide el usuario) */
  onTemplate: (id: string, keepLayout: boolean) => void;
  onFinish: (info: { skipped: boolean }) => void;
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const LAYOUTS: { id: string; name: string; hint: string }[] = [
  { id: 'logicalStructure', name: 'Lógico', hint: 'Crece hacia la derecha' },
  { id: 'logicalStructureLeft', name: 'Lógico inverso', hint: 'Crece hacia la izquierda' },
  { id: 'mindMap', name: 'Mapa central', hint: 'A ambos lados del tema' },
  { id: 'organizationStructure', name: 'Organigrama', hint: 'De arriba hacia abajo' },
  { id: 'catalogOrganization', name: 'Catálogo', hint: 'Listas bajo cada rama' },
  { id: 'timeline', name: 'Línea de tiempo', hint: 'Eventos en una línea' },
  { id: 'verticalTimeline', name: 'Línea vertical', hint: 'Cronología hacia abajo' },
  { id: 'fishbone', name: 'Espina de pez', hint: 'Causas y efectos' }
];

const LINES: { id: MapSettings['lineStyle']; name: string; hint: string }[] = [
  { id: 'theme', name: 'La del ambiente', hint: 'Lo que mejor le queda' },
  { id: 'organic', name: 'Orgánica', hint: 'Como ramas de árbol' },
  { id: 'curve', name: 'Curva', hint: 'Suave y limpia' },
  { id: 'straight', name: 'Recta', hint: 'Directa y precisa' },
  { id: 'elbow', name: 'Ortogonal', hint: 'Esquinas redondeadas' }
];

const PATTERNS: { id: MapSettings['pattern']; name: string }[] = [
  { id: 'theme', name: 'Del ambiente' },
  { id: 'dots', name: 'Puntos' },
  { id: 'grid', name: 'Cuadrícula' },
  { id: 'lines', name: 'Renglones' },
  { id: 'blueprint', name: 'Plano' },
  { id: 'none', name: 'Liso' }
];

const BG_COLORS = ['#ffffff', '#f5efe0', '#e8f0ff', '#0b0f1a', '#111827', '#14231b', '#2a1c12', '#000000'];

const SPACINGS: { id: MapSettings['spacing']; name: string; hint: string; gap: number }[] = [
  { id: 'compact', name: 'Compacto', hint: 'Mucho contenido en poco espacio', gap: 3 },
  { id: 'normal', name: 'Equilibrado', hint: 'Lo más cómodo para leer', gap: 8 },
  { id: 'airy', name: 'Amplio', hint: 'Respira, ideal para pocas ideas', gap: 15 }
];

const SIZES: { v: number; name: string }[] = [
  { v: 0.9, name: 'Pequeña' },
  { v: 1, name: 'Normal' },
  { v: 1.15, name: 'Grande' },
  { v: 1.35, name: 'Muy grande' }
];

type StepId = 'welcome' | 'ambient' | 'texture' | 'layout' | 'lines' | 'font' | 'space' | 'start' | 'done';

interface Step {
  id: StepId;
  emoji: string;
  title: string;
  subtitle: string;
}

/* ======================================================================= */
/*  Vista previa en vivo (mini mapa con el ambiente real)                    */
/* ======================================================================= */
interface PNode {
  x: number;
  y: number;
  w: number;
  h: number;
  level: 'root' | 'second' | 'node';
  branch: number;
  parent?: number;
}

function previewTree(layout: string, W: number, H: number): { nodes: PNode[]; dir: 'h' | 'v' | 'r' } {
  const cy = H / 2;
  const nodes: PNode[] = [];
  const add = (n: PNode) => nodes.push(n) - 1;

  if (layout === 'organizationStructure' || layout === 'catalogOrganization') {
    const root = add({ x: W / 2 - 42, y: 12, w: 84, h: 26, level: 'root', branch: 0 });
    const xs = [W * 0.2, W * 0.5, W * 0.8];
    xs.forEach((cx, i) => {
      const s = add({ x: cx - 34, y: 66, w: 68, h: 20, level: 'second', branch: i, parent: root });
      if (layout === 'catalogOrganization') {
        add({ x: cx - 28, y: 98, w: 56, h: 14, level: 'node', branch: i, parent: s });
        add({ x: cx - 28, y: 120, w: 56, h: 14, level: 'node', branch: i, parent: s });
      } else {
        add({ x: cx - 40, y: 112, w: 36, h: 14, level: 'node', branch: i, parent: s });
        add({ x: cx + 4, y: 112, w: 36, h: 14, level: 'node', branch: i, parent: s });
      }
    });
    return { nodes, dir: 'v' };
  }

  if (layout === 'verticalTimeline') {
    const root = add({ x: 22, y: 8, w: 84, h: 24, level: 'root', branch: 0 });
    [0, 1, 2].forEach((i) => {
      const s = add({ x: 90, y: 40 + i * 38, w: 86, h: 22, level: 'second', branch: i, parent: root });
      add({ x: 196, y: 44 + i * 38, w: 70, h: 14, level: 'node', branch: i, parent: s });
    });
    return { nodes, dir: 'h' };
  }

  if (layout === 'timeline' || layout === 'timeline2') {
    const root = add({ x: 12, y: cy - 14, w: 76, h: 28, level: 'root', branch: 0 });
    [0, 1, 2, 3].forEach((i) => {
      add({ x: 104 + i * 62, y: cy + (i % 2 ? 14 : -38), w: 54, h: 22, level: 'second', branch: i, parent: root });
    });
    return { nodes, dir: 'h' };
  }

  if (layout === 'fishbone' || layout === 'rightFishbone') {
    const rev = layout === 'rightFishbone';
    const root = add({ x: rev ? 12 : W - 92, y: cy - 15, w: 80, h: 30, level: 'root', branch: 0 });
    [0, 1, 2, 3].forEach((i) => {
      const left = rev ? 120 + (i >> 1) * 90 : 30 + (i >> 1) * 90;
      add({ x: left, y: i % 2 ? H - 36 : 10, w: 66, h: 20, level: 'second', branch: i, parent: root });
    });
    return { nodes, dir: 'r' };
  }

  if (layout === 'mindMap') {
    const root = add({ x: W / 2 - 42, y: cy - 15, w: 84, h: 30, level: 'root', branch: 0 });
    [
      [28, 26, 0],
      [28, H - 48, 1],
      [W - 100, 26, 2],
      [W - 100, H - 48, 3]
    ].forEach(([x, y, i]) => {
      add({ x, y, w: 72, h: 22, level: 'second', branch: i, parent: root });
    });
    return { nodes, dir: 'h' };
  }

  const left = layout === 'logicalStructureLeft';
  const rootX = left ? W - 104 : 16;
  const root = add({ x: rootX, y: cy - 16, w: 88, h: 32, level: 'root', branch: 0 });
  [0, 1, 2].forEach((i) => {
    const y = 22 + i * 52;
    const sx = left ? W - 218 : 130;
    const s = add({ x: sx, y, w: 76, h: 22, level: 'second', branch: i, parent: root });
    const gx = left ? sx - 84 : sx + 100;
    add({ x: gx, y: y - 12, w: 64, h: 14, level: 'node', branch: i, parent: s });
    add({ x: gx, y: y + 20, w: 64, h: 14, level: 'node', branch: i, parent: s });
  });
  return { nodes, dir: 'h' };
}

function previewSvg(theme: MapTheme, s: MapSettings): string {
  const W = 360;
  const H = 170;
  const { nodes, dir } = previewTree(s.layout, W, H);
  const lineKind = s.lineStyle === 'theme' ? theme.line.style : s.lineStyle;
  const colorful = s.colorful;
  const pal = theme.palette;
  const branchColor = (n: PNode): string => (n.level === 'root' ? pal[0] : colorful ? pal[n.branch % pal.length] : theme.accent);
  const sc = 0.78 + (s.fontScale - 1) * 0.5;

  let edges = '';
  nodes.forEach((n) => {
    if (n.parent === undefined) return;
    const p = nodes[n.parent];
    const color = branchColor(n);
    let x1: number;
    let y1: number;
    let x2: number;
    let y2: number;
    if (dir === 'v') {
      x1 = p.x + p.w / 2;
      y1 = p.y + p.h;
      x2 = n.x + n.w / 2;
      y2 = n.y;
    } else {
      const toRight = n.x + n.w / 2 > p.x + p.w / 2;
      x1 = toRight ? p.x + p.w : p.x;
      y1 = p.y + p.h / 2;
      x2 = toRight ? n.x : n.x + n.w;
      y2 = n.y + n.h / 2;
    }
    const w = (p.level === 'root' ? Math.max(2.4, theme.line.width + 0.6) : theme.line.width) * (lineKind === 'organic' && p.level === 'root' ? 1.5 : 1);
    let d: string;
    if (lineKind === 'straight') d = `M${x1},${y1} L${x2},${y2}`;
    else if (lineKind === 'elbow') {
      if (dir === 'v') {
        const ym = (y1 + y2) / 2;
        d = `M${x1},${y1} V${ym} H${x2} V${y2}`;
      } else {
        const xm = (x1 + x2) / 2;
        d = `M${x1},${y1} H${xm} V${y2} H${x2}`;
      }
    } else if (dir === 'v') {
      const ym = (y1 + y2) / 2;
      d = `M${x1},${y1} C${x1},${ym} ${x2},${ym} ${x2},${y2}`;
    } else {
      const xm = (x1 + x2) / 2;
      d = `M${x1},${y1} C${xm},${y1} ${xm},${y2} ${x2},${y2}`;
    }
    edges += `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w.toFixed(1)}" stroke-linecap="${theme.line.cap}" opacity="${theme.line.opacity}" ${theme.line.dash ? `stroke-dasharray="${theme.line.dash}"` : ''}/>`;
  });

  let boxes = '';
  nodes.forEach((n) => {
    const lk = theme[n.level];
    const branch = branchColor(n);
    const st = resolveLook(theme, n.level, branch);
    const rawFill = lk.fill === 'branch' ? branch : lk.fill === 'tint' ? withAlpha(branch, theme.dark ? 0.22 : 0.18) : lk.fill;
    const fill = lk.mode === 'ghost' ? 'transparent' : rawFill;
    const border = st.borderColor === 'transparent' || st.borderWidth === 0 ? 'none' : st.borderColor;
    const w = n.w * (n.level === 'root' ? sc + 0.2 : sc + 0.1);
    const x = n.x + (n.w - w) / 2;
    const rx = Math.min(st.borderRadius * 0.7, n.h / 2);
    const bar = Math.max(10, w * 0.5);
    const shadow = lk.shadow ? 'filter="url(#pvs)"' : '';
    boxes += `<g ${shadow}><rect x="${x.toFixed(1)}" y="${n.y}" width="${w.toFixed(1)}" height="${n.h}" rx="${rx.toFixed(1)}" fill="${fill}" stroke="${border}" stroke-width="${Math.min(2, st.borderWidth || 0)}"/></g>`;
    boxes += `<rect x="${(x + (w - bar) / 2).toFixed(1)}" y="${(n.y + n.h / 2 - 1.6).toFixed(1)}" width="${bar.toFixed(1)}" height="3.2" rx="1.6" fill="${st.color}" opacity="0.8"/>`;
  });

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs><filter id="pvs" x="-20%" y="-30%" width="140%" height="180%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.35"/></filter></defs>
    ${edges}${boxes}</svg>`;
}

/* ======================================================================= */
/*  Asistente                                                               */
/* ======================================================================= */
export class MapSetupWizard {
  private opts: WizardOptions;
  private el!: HTMLElement;
  private steps: Step[];
  private idx = 0;
  private s: MapSettings;
  private themeFilter: 'Todos' | 'Inmersivos' | 'Clásicos' | 'Claros' = 'Inmersivos';
  private templateChoice = 'keep';
  private layoutTouched = false;
  private pending: Partial<MapSettings> = {};
  private applyTimer = 0;
  private closed = false;
  private keyHandler: (e: KeyboardEvent) => void;
  private offPeek: (() => void) | null = null;

  constructor(opts: WizardOptions) {
    this.opts = opts;
    this.s = { ...opts.engine.settings };
    this.templateChoice = opts.hasOutline ? 'keep' : 'blank';
    const list: Step[] = [];
    if (opts.firstTime) list.push({ id: 'welcome', emoji: '👋', title: 'Bienvenido a tus mapas', subtitle: 'Un minuto para conocerlos y dejarlos a tu gusto.' });
    list.push(
      { id: 'ambient', emoji: '🎬', title: '¿Dónde vas a pensar?', subtitle: 'Elige el ambiente: cambia el fondo, los colores y la luz.' },
      { id: 'texture', emoji: '🧱', title: 'Dale textura al fondo', subtitle: 'Un patrón sutil o un color propio.' },
      { id: 'layout', emoji: '🧭', title: '¿Cómo quieres que crezca?', subtitle: 'La forma general de tu mapa. Puedes cambiarla cuando quieras.' },
      { id: 'lines', emoji: '〰️', title: '¿Cómo se conectan las ideas?', subtitle: 'El trazo de las ramas.' },
      { id: 'font', emoji: '🔤', title: 'Elige tu letra', subtitle: 'Tipografía y tamaño del texto.' },
      { id: 'space', emoji: '↔️', title: '¿Cuánto aire entre ideas?', subtitle: 'La separación entre ramas y nodos.' },
      ...(opts.includeStart ? [{ id: 'start' as const, emoji: '🚀', title: '¿Con qué empiezas?', subtitle: 'Un punto de partida para escribir más rápido.' }] : []),
      { id: 'done', emoji: '✨', title: 'Tu mapa está listo', subtitle: 'Así quedó. Lo podrás ajustar siempre desde el panel.' }
    );
    this.steps = list;
    this.keyHandler = (e) => this.onKey(e);
  }

  public open(): void {
    this.el = document.createElement('div');
    this.el.className = 'mmw-overlay';
    this.el.innerHTML = `
      <div class="mmw-card" role="dialog" aria-modal="true" aria-label="Asistente de creación del mapa">
        <div class="mmw-pv mmx-stage" aria-hidden="true">
          <div class="mmx-pattern"></div>
          <div class="mmx-scene"><i></i><i></i><i></i><i></i></div>
          <div class="mmx-vignette"></div>
          <div class="mmw-pv-svg"></div>
        </div>
        <div class="mmw-head">
          <div class="mmw-progress" role="progressbar"></div>
          <button class="mmw-skip" data-w="skip">Omitir</button>
        </div>
        <div class="mmw-body"></div>
        <div class="mmw-foot">
          <button class="mmw-btn ghost" data-w="back">Atrás</button>
          <button class="mmw-peek" data-w="peek" title="Mantén pulsado para ver tu mapa">👁 <span>Ver mapa</span></button>
          <button class="mmw-btn primary" data-w="next">Siguiente</button>
        </div>
      </div>`;
    this.opts.host.appendChild(this.el);
    requestAnimationFrame(() => this.el.classList.add('show'));
    this.bind();
    window.addEventListener('keydown', this.keyHandler, true);
    this.render(true);
  }

  /* ----------------------------- utilidades ----------------------------- */
  private theme(): MapTheme {
    const id = this.s.themeId;
    return id === 'auto' ? themeForAppEnvironment(this.opts.engine.getAppEnvironment()) : MAP_THEMES.find((t) => t.id === id) || MAP_THEMES[0];
  }

  /** Aplica al mapa real con un pequeño retardo (así cambiar rápido de opción no atasca equipos lentos) */
  private apply(partial: Partial<MapSettings>): void {
    Object.assign(this.s, partial);
    Object.assign(this.pending, partial);
    window.clearTimeout(this.applyTimer);
    this.applyTimer = window.setTimeout(() => {
      const p = this.pending;
      this.pending = {};
      if (!this.closed) this.opts.engine.updateSettings(p);
    }, 160);
    this.paintPreview();
    this.syncOptionStates();
  }

  private paintPreview(): void {
    const th = this.theme();
    const pv = this.el.querySelector('.mmw-pv') as HTMLElement;
    pv.dataset.theme = th.id;
    pv.dataset.pattern = this.s.pattern === 'theme' ? th.canvas.pattern : this.s.pattern;
    pv.classList.toggle('mmx-dark', th.dark);
    pv.style.setProperty('--mm-bg', this.s.bgColor || th.canvas.bg);
    pv.style.setProperty('--mm-pattern-color', th.canvas.patternColor === 'transparent' ? (th.dark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.16)') : th.canvas.patternColor);
    pv.style.setProperty('--mm-vignette', String(th.canvas.vignette));
    pv.style.setProperty('--mm-sz', `${th.canvas.patternSize * 0.8}px`);
    (pv.querySelector('.mmw-pv-svg') as HTMLElement).innerHTML = previewSvg(th, this.s);
  }

  /* ------------------------------- render ------------------------------- */
  private render(first = false): void {
    const step = this.steps[this.idx];
    const body = this.el.querySelector('.mmw-body') as HTMLElement;
    const total = this.steps.length;
    (this.el.querySelector('.mmw-progress') as HTMLElement).innerHTML = this.steps
      .map((_, i) => `<i class="${i < this.idx ? 'done' : i === this.idx ? 'now' : ''}"></i>`)
      .join('');
    body.classList.remove('in');
    body.innerHTML = `
      <div class="mmw-step-head">
        <span class="mmw-emoji">${step.emoji}</span>
        <div><h2>${esc(step.title)}</h2><p>${esc(step.subtitle)}</p></div>
        <span class="mmw-count">${this.idx + 1}/${total}</span>
      </div>
      <div class="mmw-content" data-step="${step.id}">${this.stepHtml(step)}</div>`;
    void body.offsetWidth;
    body.classList.add('in');

    const back = this.el.querySelector('[data-w="back"]') as HTMLElement;
    const next = this.el.querySelector('[data-w="next"]') as HTMLElement;
    back.style.visibility = this.idx === 0 ? 'hidden' : 'visible';
    next.textContent = step.id === 'done' ? (this.opts.includeStart ? '✨ Crear mi mapa' : '✨ Listo') : step.id === 'welcome' ? 'Empezar' : 'Siguiente';
    (this.el.querySelector('.mmw-skip') as HTMLElement).style.display = step.id === 'done' ? 'none' : '';
    this.el.querySelector('.mmw-card')?.setAttribute('data-step', step.id);
    this.paintPreview();
    this.syncOptionStates();
    if (!first) (body.querySelector('.mmw-content') as HTMLElement).scrollTop = 0;
  }

  private stepHtml(step: Step): string {
    switch (step.id) {
      case 'welcome':
        return `
          <div class="mmw-tips">
            ${[
              ['👆', 'Toca una idea', 'Una vez para seleccionarla; dos veces (o F2) para escribir en ella.'],
              ['➕', 'Haz crecer el mapa', 'El botón + que aparece junto a la idea, o las teclas Tab (hija) y Enter (hermana).'],
              ['🤏', 'Muévete y acerca', 'Arrastra el fondo para desplazarte; pellizca o usa la rueda para el zoom.'],
              ['🎨', 'Hazlo tuyo', 'Colores, fotos, emojis, notas y temas están en el panel de formato.'],
              ['👁️', 'Estúdialo', 'El modo estudio oculta las ideas para que las recuerdes, y puedes crear flashcards del mapa.']
            ]
              .map(([e, t, d]) => `<div class="mmw-tip"><span>${e}</span><div><b>${t}</b><small>${d}</small></div></div>`)
              .join('')}
          </div>`;
      case 'ambient': {
        const auto = themeForAppEnvironment(this.opts.engine.getAppEnvironment());
        const groups: Array<'Todos' | 'Inmersivos' | 'Clásicos' | 'Claros'> = ['Inmersivos', 'Clásicos', 'Claros', 'Todos'];
        const list = MAP_THEMES.filter((t) => this.themeFilter === 'Todos' || t.group === this.themeFilter);
        const card = (id: string, name: string, emoji: string, bg: string, pal: string[], sub = '') => `
          <button class="mmw-theme" data-opt="themeId" data-val="${id}" style="--bg:${esc(bg)}">
            <span class="mmw-theme-prev"><i style="background:${pal[0]}"></i><i style="background:${pal[1]}"></i><i style="background:${pal[2]}"></i></span>
            <b>${emoji} ${esc(name)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}
          </button>`;
        return `
          <div class="mmw-chips">${groups.map((g) => `<button class="mmw-chip ${this.themeFilter === g ? 'on' : ''}" data-filter="${g}">${g}</button>`).join('')}</div>
          <div class="mmw-theme-grid">
            ${this.themeFilter === 'Todos' || this.themeFilter === 'Inmersivos' ? card('auto', 'Automático', '✨', auto.canvas.bg, auto.palette, `Sigue tu ambiente · ${auto.name}`) : ''}
            ${list.map((t) => card(t.id, t.name, t.emoji, t.canvas.bg, t.palette)).join('')}
          </div>`;
      }
      case 'texture':
        return `
          <div class="mmw-label">Patrón</div>
          <div class="mmw-chips">${PATTERNS.map((p) => `<button class="mmw-chip" data-opt="pattern" data-val="${p.id}">${p.name}</button>`).join('')}</div>
          <div class="mmw-label">Color de fondo <small>(opcional)</small></div>
          <div class="mmw-swatches">
            <button class="mmw-sw auto" data-opt="bgColor" data-val="" title="El del ambiente">↺</button>
            ${BG_COLORS.map((c) => `<button class="mmw-sw" data-opt="bgColor" data-val="${c}" style="--c:${c}" aria-label="${c}"></button>`).join('')}
            <label class="mmw-sw custom" title="Color personalizado"><input type="color" value="#334155" data-custombg /></label>
          </div>
          <p class="mmw-note">Con un color propio, el texto cambia solo para que siempre se lea bien.</p>`;
      case 'layout':
        return `<div class="mmw-cards">${LAYOUTS.map((l) => `<button class="mmw-opt" data-opt="layout" data-val="${l.id}">${layoutIcon(l.id)}<b>${l.name}</b><small>${l.hint}</small></button>`).join('')}</div>`;
      case 'lines': {
        const shape = (id: string) => {
          const d: Record<string, string> = {
            theme: 'M4 22 C30 22 30 8 56 8 M4 22 C30 22 30 36 56 36',
            organic: 'M4 22 C30 22 30 8 56 8 M4 22 C30 22 30 36 56 36',
            curve: 'M4 22 C30 22 30 8 56 8 M4 22 C30 22 30 36 56 36',
            straight: 'M4 22 L56 8 M4 22 L56 36',
            elbow: 'M4 22 H30 V8 H56 M30 22 V36 H56'
          };
          const w = id === 'organic' ? 4.2 : 2.4;
          return `<svg viewBox="0 0 60 44" width="64" height="48" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"><path d="${d[id] || d.curve}"/></svg>`;
        };
        return `
          <div class="mmw-cards cols3">${LINES.map((l) => `<button class="mmw-opt" data-opt="lineStyle" data-val="${l.id}">${shape(l.id)}<b>${l.name}</b><small>${l.hint}</small></button>`).join('')}</div>
          <label class="mmw-switch"><span><b>Ramas de colores</b><small>Cada rama principal con su propio color</small></span><input type="checkbox" data-bool="colorful" ${this.s.colorful ? 'checked' : ''} /><i></i></label>`;
      }
      case 'font':
        return `
          <div class="mmw-fonts">
            <button class="mmw-font" data-opt="fontId" data-val="theme"><span class="aa">Aa</span><b>Del ambiente</b><small>Recomendada</small></button>
            ${FONT_CHOICES.map((f) => `<button class="mmw-font" data-opt="fontId" data-val="${f.id}"><span class="aa" style="font-family:${esc(f.family)}">Aa</span><b>${esc(f.label)}</b><small>${esc(f.note || '')}</small></button>`).join('')}
          </div>
          <div class="mmw-label">Tamaño del texto</div>
          <div class="mmw-chips">${SIZES.map((z) => `<button class="mmw-chip" data-opt="fontScale" data-val="${z.v}">${z.name}</button>`).join('')}</div>`;
      case 'space':
        return `<div class="mmw-cards cols3">${SPACINGS.map((p) => `<button class="mmw-opt" data-opt="spacing" data-val="${p.id}"><span class="mmw-gap" style="--g:${p.gap}px"><i></i><i></i><i></i></span><b>${p.name}</b><small>${p.hint}</small></button>`).join('')}</div>`;
      case 'start': {
        const rows: string[] = [];
        if (this.opts.hasOutline) rows.push(`<button class="mmw-tpl" data-tpl="keep"><span>📓</span><b>Mi cuaderno</b><small>Usa los títulos de tu esquema</small></button>`);
        rows.push(...TEMPLATES.map((t) => `<button class="mmw-tpl" data-tpl="${t.id}"><span>${t.emoji}</span><b>${esc(t.name)}</b><small>${esc(t.description)}</small></button>`));
        return `<div class="mmw-tpls">${rows.join('')}</div>`;
      }
      case 'done': {
        const th = this.theme();
        const font = this.s.fontId === 'theme' ? 'Del ambiente' : FONT_CHOICES.find((f) => f.id === this.s.fontId)?.label || '';
        const layout = LAYOUTS.find((l) => l.id === this.s.layout)?.name || 'Lógico';
        const line = LINES.find((l) => l.id === this.s.lineStyle)?.name || '';
        const chip = (k: string, v: string) => `<span class="mmw-sum"><small>${k}</small><b>${esc(v)}</b></span>`;
        return `<div class="mmw-summary">${chip('Ambiente', `${th.emoji} ${th.name}`)}${chip('Diseño', layout)}${chip('Líneas', line)}${chip('Letra', font)}${chip('Espaciado', SPACINGS.find((p) => p.id === this.s.spacing)?.name || '')}</div>
          <p class="mmw-note center">Todo se guarda con tu mapa. Para cambiarlo: panel de formato → pestaña «Mapa», o «Asistente de estilo» en el menú ⋯.</p>`;
      }
    }
  }

  /** Marca la opción activa de cada grupo según los ajustes actuales */
  private syncOptionStates(): void {
    const sets: Record<string, string> = {
      themeId: this.s.themeId,
      pattern: this.s.pattern,
      bgColor: (this.s.bgColor || '').toLowerCase(),
      layout: this.s.layout,
      lineStyle: this.s.lineStyle,
      fontId: this.s.fontId,
      fontScale: String(this.s.fontScale),
      spacing: this.s.spacing
    };
    this.el.querySelectorAll<HTMLElement>('[data-opt]').forEach((b) => {
      const key = b.dataset.opt as string;
      b.classList.toggle('on', (sets[key] ?? '') === (b.dataset.val ?? ''));
    });
    this.el.querySelectorAll<HTMLElement>('[data-tpl]').forEach((b) => b.classList.toggle('on', b.dataset.tpl === this.templateChoice));
  }

  /* ------------------------------ eventos ------------------------------- */
  private bind(): void {
    this.el.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;

      const w = t.closest('[data-w]') as HTMLElement | null;
      if (w) {
        const a = w.dataset.w;
        if (a === 'next') return this.next();
        if (a === 'back') return this.back();
        if (a === 'skip') return this.finish(true);
        return;
      }
      const filter = t.closest('[data-filter]') as HTMLElement | null;
      if (filter) {
        this.themeFilter = filter.dataset.filter as typeof this.themeFilter;
        this.render();
        return;
      }
      const opt = t.closest('[data-opt]') as HTMLElement | null;
      if (opt) {
        const key = opt.dataset.opt as keyof MapSettings;
        let val: any = opt.dataset.val ?? '';
        if (key === 'fontScale') val = Number(val);
        if (key === 'layout') this.layoutTouched = true;
        this.apply({ [key]: val } as Partial<MapSettings>);
        return;
      }
      const tpl = t.closest('[data-tpl]') as HTMLElement | null;
      if (tpl) {
        this.templateChoice = tpl.dataset.tpl || 'blank';
        this.syncOptionStates();
      }
    });

    this.el.addEventListener('change', (e) => {
      const t = e.target as HTMLInputElement;
      if (t.dataset.bool) this.apply({ [t.dataset.bool]: t.checked } as Partial<MapSettings>);
      if (t.dataset.custombg !== undefined) this.apply({ bgColor: t.value });
    });
    this.el.addEventListener('input', (e) => {
      const t = e.target as HTMLInputElement;
      if (t.dataset.custombg !== undefined) this.apply({ bgColor: t.value });
    });

    // Mantener pulsado "Ver mapa": el asistente se aparta para ver el mapa real detrás
    const peek = this.el.querySelector('[data-w="peek"]') as HTMLElement;
    const on = (ev: Event) => {
      ev.preventDefault();
      this.el.classList.add('peeking');
    };
    const off = () => this.el.classList.remove('peeking');
    peek.addEventListener('pointerdown', on);
    window.addEventListener('pointerup', off);
    window.addEventListener('pointercancel', off);
    this.offPeek = () => {
      window.removeEventListener('pointerup', off);
      window.removeEventListener('pointercancel', off);
    };
    peek.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private onKey(e: KeyboardEvent): void {
    if (this.closed) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' && (t as HTMLInputElement).type !== 'checkbox' && (t as HTMLInputElement).type !== 'color')) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      this.next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      this.back();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.finish(true);
    }
  }

  private next(): void {
    if (this.steps[this.idx].id === 'done') return this.finish(false);
    this.idx = Math.min(this.steps.length - 1, this.idx + 1);
    this.render();
  }

  private back(): void {
    this.idx = Math.max(0, this.idx - 1);
    this.render();
  }

  /** Cierra el asistente. Si no se omite, aplica la plantilla elegida. */
  private finish(skipped: boolean): void {
    if (this.closed) return;
    this.closed = true;
    window.clearTimeout(this.applyTimer);
    if (Object.keys(this.pending).length) this.opts.engine.updateSettings(this.pending);
    window.removeEventListener('keydown', this.keyHandler, true);
    this.offPeek?.();
    this.el.classList.remove('show');
    this.el.classList.add('leaving');
    window.setTimeout(() => this.el.remove(), 260);
    if (!skipped && this.templateChoice !== 'keep' && this.templateChoice !== 'blank') {
      this.opts.onTemplate(this.templateChoice, this.layoutTouched);
    }
    this.opts.onFinish({ skipped });
  }

  public destroy(): void {
    if (this.closed) return;
    this.closed = true;
    window.removeEventListener('keydown', this.keyHandler, true);
    this.offPeek?.();
    this.el?.remove();
  }
}
