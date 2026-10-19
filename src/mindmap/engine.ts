/**
 * MindMapEngine
 * Envuelve la librería `simple-mind-map` y le añade lo que necesita un editor de nivel MindMeister:
 *  - nodos con contenido propio (texto, KaTeX, fotos, emojis, tareas, notas, enlaces) con medida exacta por DOM
 *  - estilo derivado del tema + color de rama (ramas coloridas, niveles, tipografías, ambientes inmersivos)
 *  - líneas orgánicas / curvas / rectas / ortogonales
 *  - edición en vivo sin saltos (el árbol se reacomoda mientras escribes)
 *  - culling de nodos fuera de pantalla, gestos táctiles y clase de "interacción" para mantener 60 FPS
 */

import MindMap from 'simple-mind-map';
import Style from 'simple-mind-map/src/core/render/node/Style.js';
import MindMapNode from 'simple-mind-map/src/core/render/node/MindMapNode.js';
import Drag from 'simple-mind-map/src/plugins/Drag.js';
import Select from 'simple-mind-map/src/plugins/Select.js';
import AssociativeLine from 'simple-mind-map/src/plugins/AssociativeLine.js';
import Demonstrate from 'simple-mind-map/src/plugins/Demonstrate.js';
import OuterFrame from 'simple-mind-map/src/plugins/OuterFrame.js';

import { AdaptiveSplineEngine, type Point2D } from '../engine/geometry/AdaptiveSplineEngine';
import { TouchGestureEngine } from '../engine/gestures/TouchGestureEngine';
import { formatNodeText, stripToPlain } from './richText';
import { MAP_THEMES, THEME_BY_ID, FONT_CHOICES, resolveLook, themeForAppEnvironment, type MapTheme, type ResolvedNodeStyle, type CanvasPattern } from './themes';
import { DEFAULT_SETTINGS, type MapSettings, type MapDoc } from './store';
import { withAlpha, readableOn, lighten, darken, isTransparent } from './color';

// Plugins (se registran una sola vez para toda la app)
MindMap.usePlugin(Drag).usePlugin(Select).usePlugin(AssociativeLine).usePlugin(Demonstrate).usePlugin(OuterFrame);

/** Motor asociado a cada lienzo (los parches de prototipo lo localizan por el elemento raíz) */
const ENGINES = new WeakMap<HTMLElement, MindMapEngine>();

type Listener = (...args: any[]) => void;

export interface EngineOptions {
  el: HTMLElement;
  stage: HTMLElement;
  data: any;
  settings: MapSettings;
  view?: { scale: number; x: number; y: number };
  appEnvironment: string;
}

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const STYLE_PROPS_DERIVED = new Set([
  'fillColor',
  'borderColor',
  'borderWidth',
  'color',
  'borderRadius',
  'fontSize',
  'fontWeight',
  'fontFamily'
]);

let stylePatched = false;

function patchLibraryPrototypes(): void {
  if (stylePatched) return;
  stylePatched = true;

  // 1) Estilo de nodos derivado del tema (sin pisar lo que el usuario fijó en el propio nodo)
  const origMerge = Style.prototype.merge;
  Style.prototype.merge = function (prop: string, root?: boolean) {
    if (!root && prop === 'hoverRectRadius') {
      const ctx = this.ctx;
      const engine = ctx?.mindMap?.el ? ENGINES.get(ctx.mindMap.el) : undefined;
      if (engine) return (engine.computeBaseStyle(ctx).borderRadius ?? 8) + 5;
    }
    if (!root && STYLE_PROPS_DERIVED.has(prop)) {
      const ctx = this.ctx;
      const engine = ctx?.mindMap?.el ? ENGINES.get(ctx.mindMap.el) : undefined;
      if (engine) {
        const self = this.getSelfStyle(prop);
        if (self === undefined) {
          const base = engine.computeBaseStyle(ctx) as any;
          const v = base[prop];
          if (v !== undefined) return v;
        }
      }
    }
    return origMerge.call(this, prop, root);
  };

  // 2) Líneas: color de rama, grosor, guiones y puntas según el tema
  const origStyleLine = MindMapNode.prototype.styleLine;
  MindMapNode.prototype.styleLine = function (line: any, childNode: any, enableMarker: any) {
    const engine = this.mindMap?.el ? ENGINES.get(this.mindMap.el) : undefined;
    if (!engine) return origStyleLine.call(this, line, childNode, enableMarker);
    engine.styleBranchLine(line, childNode);
  };
}

export class MindMapEngine {
  public mm: any = null;
  public settings: MapSettings;
  public theme: MapTheme;

  private el: HTMLElement;
  private stage: HTMLElement;
  private appEnvironment: string;
  private initialData: any;
  private initialView?: { scale: number; x: number; y: number };

  private listeners: Record<string, Listener[]> = {};
  private touch: TouchGestureEngine | null = null;
  private destroyed = false;

  // medición
  private measureHost: HTMLElement;
  private hugCache = new Map<string, number>();
  private styleCache = new Map<string, ResolvedNodeStyle>();
  private branchCache = new Map<string, string>();

  // edición en vivo
  public editingUid: string | null = null;
  public editBuffer = '';
  private liveRaf = 0;
  private liveNode: any = null;

  // vista
  private viewRaf = 0;
  private movingTimer = 0;
  private cullRaf = 0;
  private culled = false;
  private suspendCull = false;
  private nodeCount = 0;
  public insets: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

  private renderEndRaf = 0;

  constructor(opts: EngineOptions) {
    this.el = opts.el;
    this.stage = opts.stage;
    this.appEnvironment = opts.appEnvironment;
    this.settings = { ...DEFAULT_SETTINGS, ...opts.settings };
    this.initialData = opts.data;
    this.initialView = opts.view;
    this.theme = this.resolveTheme();

    this.measureHost = document.createElement('div');
    this.measureHost.className = 'mmx-measure-host';
    this.measureHost.setAttribute('aria-hidden', 'true');
    this.stage.appendChild(this.measureHost);

    patchLibraryPrototypes();
    ENGINES.set(this.el, this);
  }

  /* ===================================================================== */
  /*  Eventos internos                                                      */
  /* ===================================================================== */
  public on(evt: string, cb: Listener): void {
    (this.listeners[evt] = this.listeners[evt] || []).push(cb);
  }

  private emit(evt: string, ...args: any[]): void {
    (this.listeners[evt] || []).forEach((cb) => {
      try {
        cb(...args);
      } catch (e) {
        console.warn('[MindMapEngine] listener error', evt, e);
      }
    });
  }

  /* ===================================================================== */
  /*  Inicialización                                                        */
  /* ===================================================================== */
  public init(): void {
    this.applyStageTheme();

    this.mm = new (MindMap as any)({
      el: this.el,
      data: this.initialData,
      layout: this.settings.layout,
      theme: 'default',
      readonly: false,
      enableFreeDrag: false,
      mousewheelAction: 'zoom',
      mouseScaleCenterUseMousePosition: true,
      scaleRatio: 0.12,
      minZoomRatio: 10,
      maxZoomRatio: 400,
      enableAnimation: false,
      enableShortcutOnlyWhenMouseInSvg: false,
      isLimitMindMapInCanvas: false,
      isShowCreateChildBtnIcon: false,
      expandBtnSize: 22,
      expandBtnStyle: {
        color: '#ffffff',
        fill: this.theme.accent,
        fontSize: 12,
        strokeColor: this.theme.accent
      },
      hoverRectPadding: 5,
      hoverRectColor: this.theme.accent,
      maxHistoryCount: 300,
      addHistoryTime: 220,
      defaultInsertSecondLevelNodeText: 'Nueva rama',
      defaultInsertBelowSecondLevelNodeText: 'Nueva idea',
      defaultGeneralizationText: 'Resumen',
      selectTextOnEnterEditText: true,
      enableCtrlKeyNodeSelection: true,
      useLeftKeySelectionRightKeyDrag: false,
      customCheckEnableShortcut: (e: KeyboardEvent) => this.checkShortcutAllowed(e),
      isUseCustomNodeContent: true,
      customCreateNodeContent: (node: any) => this.createNodeContent(node),
      customInnerElsAppendTo: null,
      errorHandler: (code: string, err: any) => console.warn('[MindMap]', code, err),
      themeConfig: this.buildLibraryThemeConfig()
    });

    // El Delete se gestiona desde la UI (confirmación antes de borrar) y el portapapeles es el propio del mapa
    const kc = this.mm.keyCommand;
    ['Del|Backspace', 'Control+c', 'Control+v', 'Control+x'].forEach((k) => kc?.removeShortcut(k));
    kc?.addShortcut('Control+c', () => this.copyNodes());
    kc?.addShortcut('Control+x', () => this.cutNodes());
    kc?.addShortcut('Control+d', () => this.duplicateNode());

    this.patchLayout();
    this.bindLibraryEvents();
    if (this.initialView) this.setView(this.initialView, 0);
    this.initTouch();
    this.observeFonts();
    this.updatePatternVars();
  }

  /** Teclas de la librería solo cuando el foco no está escribiendo */
  private checkShortcutAllowed(e: KeyboardEvent): boolean {
    if (this.editingUid) return false;
    const t = e.target as HTMLElement | null;
    if (!t) return true;
    const tag = t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable) return false;
    // Atajos solo cuando el mapa está en pantalla y el foco no está en un diálogo
    if (t.closest('.mmx-modal, .mmx-sheet, .mmx-inspector')) return false;
    return true;
  }

  private buildLibraryThemeConfig(): any {
    const th = this.theme;
    const sp = this.settings.spacing === 'compact' ? 0.72 : this.settings.spacing === 'airy' ? 1.4 : 1;
    return {
      backgroundColor: 'transparent',
      lineColor: th.accent,
      lineWidth: th.line.width,
      lineStyle: 'curve',
      lineDasharray: 'none',
      fontFamily: th.font,
      paddingX: 0,
      paddingY: 0,
      imgMaxWidth: 240,
      imgMaxHeight: 200,
      nodeUseLineStyle: false,
      generalizationLineWidth: 2.2,
      generalizationLineColor: th.accent,
      generalizationNodeMargin: 18,
      associativeLineColor: th.accent,
      associativeLineWidth: 2.4,
      associativeLineActiveWidth: 4,
      associativeLineDasharray: '6,5',
      associativeLineActiveColor: th.accent,
      root: { shape: 'rectangle', marginX: Math.round(112 * sp), marginY: Math.round(62 * sp), borderDasharray: 'none' },
      second: { shape: 'rectangle', marginX: Math.round(64 * sp), marginY: Math.round(24 * sp), borderDasharray: 'none' },
      node: { shape: 'rectangle', marginX: Math.round(40 * sp), marginY: Math.round(12 * sp), borderDasharray: 'none' }
    };
  }

  /* ===================================================================== */
  /*  Tema y ajustes                                                        */
  /* ===================================================================== */
  public resolveTheme(): MapTheme {
    const id = this.settings.themeId;
    if (id === 'auto') return themeForAppEnvironment(this.appEnvironment);
    return THEME_BY_ID[id] || MAP_THEMES[0];
  }

  public getEffectivePattern(): { pattern: CanvasPattern; color: string; size: number } {
    const th = this.theme;
    const pattern = this.settings.pattern === 'theme' ? th.canvas.pattern : (this.settings.pattern as CanvasPattern);
    return { pattern, color: th.canvas.patternColor === 'transparent' ? (th.dark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.16)') : th.canvas.patternColor, size: th.canvas.patternSize };
  }

  public effectiveFontFamily(): string {
    if (this.settings.fontId && this.settings.fontId !== 'theme') {
      const f = FONT_CHOICES.find((x) => x.id === this.settings.fontId);
      if (f) return f.family;
    }
    return '';
  }

  public getAppEnvironment(): string {
    return this.appEnvironment;
  }

  public setAppEnvironment(env: string): void {
    this.appEnvironment = env;
    if (this.settings.themeId === 'auto') this.refreshTheme();
  }

  public updateSettings(partial: Partial<MapSettings>, opts: { relayout?: boolean } = {}): void {
    const prevLayout = this.settings.layout;
    this.settings = { ...this.settings, ...partial };
    if (partial.layout && partial.layout !== prevLayout && this.mm) {
      this.mm.setLayout(partial.layout, true);
      this.patchLayout();
      this.refreshTheme(false);
      this.withoutHistory(() => this.mm.render());
      this.emit('change');
      this.emit('settings');
      setTimeout(() => this.fit(true), 60);
      return;
    }
    this.refreshTheme(opts.relayout !== false);
    this.emit('change');
    this.emit('settings');
  }

  /** Reaplica tema/ajustes: fondo, estilos y re-render completo de nodos */
  public refreshTheme(rerender = true): void {
    this.theme = this.resolveTheme();
    this.styleCache.clear();
    this.branchCache.clear();
    this.hugCache.clear();
    this.applyStageTheme();
    if (!this.mm) return;

    const th = this.theme;
    this.mm.opt.hoverRectColor = th.accent;
    this.mm.opt.expandBtnStyle = { color: '#ffffff', fill: th.accent, fontSize: 12, strokeColor: th.accent };
    try {
      this.mm.setThemeConfig(this.buildLibraryThemeConfig(), true);
    } catch {
      /* ignore */
    }
    if (rerender) {
      this.withoutHistory(() => this.mm.reRender());
    }
    this.updatePatternVars();
    this.emit('theme', th);
  }

  /** Fondo del lienzo (ambiente inmersivo) y variables CSS del tema */
  private applyStageTheme(): void {
    const th = this.theme;
    const s = this.stage;
    s.dataset.theme = th.id;
    s.classList.toggle('mmx-dark', th.dark);
    s.classList.toggle('mmx-light', !th.dark);
    const bg = this.settings.bgColor ? this.settings.bgColor : th.canvas.bg;
    s.style.setProperty('--mm-bg', bg);
    s.style.setProperty('--mm-accent', th.accent);
    s.style.setProperty('--mm-ink', th.ink);
    s.style.setProperty('--mm-vignette', String(th.canvas.vignette));
    s.style.setProperty('--mm-grain', String(th.canvas.grain));
    const { pattern, color, size } = this.getEffectivePattern();
    s.dataset.pattern = pattern;
    s.style.setProperty('--mm-pattern-color', color);
    s.style.setProperty('--mm-pattern-size', `${size}px`);
  }

  private patternEl: HTMLElement | null = null;

  /** La posición/escala del patrón de fondo se escribe solo en su capa (no invalida el estilo de los nodos) */
  public updatePatternVars(): void {
    if (!this.mm?.view) return;
    if (!this.patternEl || !this.patternEl.isConnected) this.patternEl = this.stage.querySelector<HTMLElement>('.mmx-pattern');
    const el = this.patternEl;
    if (!el) return;
    const v = this.mm.view;
    el.style.setProperty('--mm-x', `${v.x.toFixed(1)}px`);
    el.style.setProperty('--mm-y', `${v.y.toFixed(1)}px`);
    el.style.setProperty('--mm-s', v.scale.toFixed(4));
  }

  /** Cambia el color del lienzo (personalizado) */
  public setCanvasColor(color: string): void {
    this.updateSettings({ bgColor: color }, { relayout: false });
  }

  /* ===================================================================== */
  /*  Ramas y estilo                                                        */
  /* ===================================================================== */
  private levelOf(node: any): 'root' | 'second' | 'node' {
    if (node.isGeneralization) return 'node';
    if (node.isRoot || node.layerIndex === 0) return 'root';
    if (node.layerIndex === 1) return 'second';
    return 'node';
  }

  /** Color de la rama a la que pertenece un nodo */
  public branchColor(node: any): string {
    const th = this.theme;
    if (!node) return th.palette[0];
    if (node.isGeneralization && node.generalizationBelongNode) node = node.generalizationBelongNode;
    const uid = node.getData ? node.getData('uid') : node.nodeData?.data?.uid;
    const cached = uid ? this.branchCache.get(uid) : undefined;
    if (cached) return cached;

    let color = '';
    let n = node;
    let guard = 0;
    while (n && guard++ < 60) {
      const own = n.nodeData?.data?.lineColor || n.nodeData?.data?.branchColor;
      if (own && own !== 'transparent') {
        color = own;
        break;
      }
      if (n.isRoot || n.layerIndex <= 1) break;
      n = n.parent;
    }

    if (!color) {
      if (node.isRoot || !this.settings.colorful) {
        color = node.isRoot ? th.palette[0] : th.accent;
        if (!this.settings.colorful && !node.isRoot) color = th.accent;
      } else {
        // n = ancestro de primer nivel
        const first = n && !n.isRoot ? n : node;
        const siblings = first.parent?.nodeData?.children || first.parent?.children || [];
        let idx = 0;
        if (Array.isArray(siblings) && first.nodeData) {
          const found = siblings.findIndex((s: any) => s === first.nodeData || s?.data?.uid === first.nodeData?.data?.uid);
          idx = found >= 0 ? found : 0;
        }
        color = th.palette[idx % th.palette.length];
      }
    }
    if (uid) this.branchCache.set(uid, color);
    return color;
  }

  /** Estilo base de un nodo (tema + rama + ajustes globales), sin overrides del usuario */
  public computeBaseStyle(node: any): ResolvedNodeStyle {
    const level = this.levelOf(node);
    const branch = this.branchColor(node);
    const fontId = this.settings.fontId;
    const key = `${this.theme.id}|${level}|${branch}|${this.settings.fontScale}|${fontId}`;
    let st = this.styleCache.get(key);
    if (!st) {
      st = { ...resolveLook(this.theme, level, branch) };
      const scale = this.settings.fontScale || 1;
      if (scale !== 1) {
        st.fontSize = +(st.fontSize * scale).toFixed(2);
        st.paddingX = Math.round(st.paddingX * (0.6 + 0.4 * scale));
        st.paddingY = Math.round(st.paddingY * (0.6 + 0.4 * scale));
      }
      const fam = this.effectiveFontFamily();
      if (fam) st.fontFamily = fam;
      this.styleCache.set(key, st);
    }
    return st;
  }

  /** Estilo final = base + overrides guardados en el propio nodo */
  public computeStyle(node: any): ResolvedNodeStyle & { mode: string; level: string } {
    const level = this.levelOf(node);
    const th = this.theme;
    const lk = th[level];
    const base = this.computeBaseStyle(node);
    const d = node.nodeData?.data || {};
    const out: any = { ...base, mode: lk.mode, level };

    if (d.fontSize !== undefined) out.fontSize = Number(d.fontSize) * (this.settings.fontScale || 1);
    if (d.fontFamily) out.fontFamily = d.fontFamily;
    if (d.fontWeight !== undefined) out.fontWeight = d.fontWeight;
    if (d.color) out.color = d.color;
    if (d.borderRadius !== undefined) out.borderRadius = Number(d.borderRadius);

    const hasFill = d.fillColor !== undefined && d.fillColor !== null;
    if (hasFill) {
      if (lk.mode === 'paper') {
        out.boxCss = `background: linear-gradient(180deg, ${lighten(d.fillColor, 0.18)}, ${d.fillColor} 55%, ${darken(d.fillColor, 0.06)}); box-shadow: ${lk.shadow || 'none'};`;
        if (!d.color) out.color = readableOn(d.fillColor, '#ffffff', '#2b2112');
      } else if (lk.mode === 'glass') {
        out.boxCss = `background: ${d.fillColor}; backdrop-filter: blur(8px); box-shadow: ${lk.shadow || 'none'};`;
      } else {
        out.fillColor = d.fillColor;
        if (!d.color && !isTransparent(d.fillColor)) out.color = readableOn(d.fillColor);
      }
    }
    if (d.borderColor !== undefined) out.borderColor = d.borderColor;
    if (d.borderWidth !== undefined) out.borderWidth = Number(d.borderWidth);
    return out;
  }

  /* ===================================================================== */
  /*  Contenido de los nodos                                                */
  /* ===================================================================== */
  private escapeAttr(s: string): string {
    return s.replace(/"/g, '&quot;');
  }

  private createNodeContent(node: any): HTMLElement {
    const d = node.nodeData?.data || {};
    const st = this.computeStyle(node);
    const level = st.level;
    const editing = this.editingUid && d.uid === this.editingUid;
    const rawText = editing ? this.editBuffer : String(d.text ?? '');
    const plain = stripToPlain(rawText);

    const fontStyle = d.fontStyle || 'normal';
    const decoration = d.textDecoration || 'none';
    const maxW = level === 'root' ? 340 : level === 'second' ? 300 : 280;
    const minW = level === 'root' ? 96 : 64;

    const el = document.createElement('div');
    el.className = `mmx-node mmx-mode-${st.mode} mmx-level-${level}`;
    if (d.uid) el.dataset.uid = String(d.uid);
    el.style.cssText = [
      `font-family:${st.fontFamily}`,
      `font-size:${st.fontSize}px`,
      `font-weight:${st.fontWeight}`,
      `font-style:${fontStyle}`,
      `text-decoration:${decoration}`,
      `color:${st.color}`,
      `padding:${st.paddingY}px ${st.paddingX}px`,
      `border-radius:${st.borderRadius}px`,
      st.boxCss
    ].join(';');
    if (d.textAlign) el.style.textAlign = d.textAlign;

    // 📷 Imagen
    let imgW = 0;
    let imgH = 0;
    if (d.image) {
      const sz = d.imageSize || { width: 180, height: 120 };
      imgW = Math.round(sz.width);
      imgH = Math.round(sz.height);
      const wrap = document.createElement('div');
      wrap.className = 'mmx-node-img';
      const img = document.createElement('img');
      img.src = d.image;
      img.alt = d.imageTitle || '';
      img.width = imgW;
      img.height = imgH;
      img.draggable = false;
      img.decoding = 'async';
      img.style.cssText = `width:${imgW}px;height:${imgH}px;border-radius:${Math.max(4, st.borderRadius - 4)}px;`;
      wrap.appendChild(img);
      el.appendChild(wrap);
    } else if (d.imageLost) {
      const lost = document.createElement('div');
      lost.className = 'mmx-node-img-lost';
      lost.textContent = '🖼️ Foto no disponible';
      el.appendChild(lost);
    }

    // Fila: tarea + emoji + texto
    const row = document.createElement('div');
    row.className = 'mmx-node-row';

    if (typeof d.checked === 'boolean') {
      const box = document.createElement('span');
      box.className = `mmx-node-check ${d.checked ? 'is-done' : ''}`;
      box.dataset.mmAction = 'toggle-check';
      box.innerHTML = d.checked
        ? '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '';
      row.appendChild(box);
    }

    if (d.emoji) {
      const em = document.createElement('span');
      em.className = 'mmx-node-emoji';
      em.textContent = d.emoji;
      em.style.fontSize = `${Math.round(st.fontSize * 1.25)}px`;
      row.appendChild(em);
    }

    const textEl = document.createElement('div');
    textEl.className = 'mmx-node-text';
    if (editing) {
      // En edición se muestra el texto crudo (lo mismo que ve el cuadro de escritura) para que ambos midan igual
      textEl.classList.add('is-editing');
      textEl.style.whiteSpace = 'pre-wrap';
      textEl.textContent = rawText.length ? rawText + (rawText.endsWith('\n') ? '​' : '') : '​';
    } else if (!plain.trim() && !d.image) {
      textEl.innerHTML = '<span class="mmx-placeholder">Escribe aquí…</span>';
    } else if (plain.trim()) {
      textEl.innerHTML = formatNodeText(rawText);
    } else {
      textEl.style.display = 'none';
    }
    if (editing) textEl.style.visibility = 'hidden';
    if (d.checked === true) textEl.classList.add('is-struck');
    row.appendChild(textEl);
    if (row.children.length && !(textEl.style.display === 'none' && row.children.length === 1)) el.appendChild(row);

    // Insignias: nota, enlace, etiquetas, flashcard
    const chips: string[] = [];
    if (d.note) chips.push(`<span class="mmx-chip" data-mm-action="note" title="Nota">📝</span>`);
    if (d.hyperlink) chips.push(`<span class="mmx-chip" data-mm-action="link" title="${this.escapeAttr(String(d.hyperlink))}">🔗</span>`);
    if (d.flashcardId) chips.push(`<span class="mmx-chip" data-mm-action="card" title="Flashcard vinculada">🎴</span>`);
    if (Array.isArray(d.tags)) {
      d.tags.slice(0, 3).forEach((t: string) => chips.push(`<span class="mmx-chip mmx-tag">#${this.escapeAttr(String(t))}</span>`));
    }
    if (chips.length) {
      const meta = document.createElement('div');
      meta.className = 'mmx-node-meta';
      meta.innerHTML = chips.join('');
      el.appendChild(meta);
    }

    // Ancho "abrazando" el contenido (sin huecos) con un tope razonable
    const hugKey = JSON.stringify([
      editing ? `\u0001${rawText}` : plain,
      st.fontFamily,
      st.fontSize,
      st.fontWeight,
      fontStyle,
      d.emoji || '',
      typeof d.checked,
      imgW,
      imgH,
      st.paddingX,
      st.paddingY,
      chips.length,
      maxW,
      !!d.textAlign
    ]);
    let width = this.hugCache.get(hugKey);
    if (width === undefined) {
      width = this.measureHug(el, maxW, minW, imgW);
      if (this.hugCache.size > 1500) this.hugCache.clear();
      this.hugCache.set(hugKey, width);
    }
    el.style.width = `${width}px`;
    return el;
  }

  /** Mide el ancho ideal: la línea más larga tras el ajuste de texto + extras + relleno */
  private measureHug(el: HTMLElement, maxW: number, minW: number, imgW: number): number {
    const host = this.measureHost;
    const probe = el.cloneNode(true) as HTMLElement;
    probe.style.width = 'max-content';
    probe.style.maxWidth = `${maxW}px`;
    host.appendChild(probe);

    let result = minW;
    try {
      const probeText = probe.querySelector('.mmx-node-text') as HTMLElement | null;
      const cs = getComputedStyle(probe);
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const full = Math.ceil(probe.getBoundingClientRect().width);
      result = full;

      if (probeText && probeText.style.display !== 'none') {
        const range = document.createRange();
        range.selectNodeContents(probeText);
        const rects = Array.from(range.getClientRects());
        if (rects.length > 0) {
          const lines = new Map<number, number>();
          rects.forEach((r) => {
            if (r.width < 0.5) return;
            const k = Math.round(r.top / 4);
            lines.set(k, (lines.get(k) || 0) + r.width);
          });
          let widest = 0;
          lines.forEach((w) => {
            if (w > widest) widest = w;
          });
          // extras de la fila = ancho de la fila - ancho del texto
          const row = probeText.parentElement as HTMLElement;
          const extras = Math.max(0, row.getBoundingClientRect().width - probeText.getBoundingClientRect().width);
          const hug = Math.ceil(widest + extras + padX + 2);
          result = Math.min(full, Math.max(hug, imgW + padX));
        }
      }
    } catch {
      /* usa el ancho completo medido */
    }
    probe.remove();
    return Math.max(minW, Math.min(maxW + 80, result));
  }

  private observeFonts(): void {
    const fonts = (document as any).fonts;
    if (!fonts || typeof fonts.ready?.then !== 'function') return;
    const refresh = () => {
      if (this.destroyed || !this.mm) return;
      this.hugCache.clear();
      this.withoutHistory(() => this.mm.reRender());
      this.emit('fonts');
    };
    fonts.ready.then(refresh).catch(() => {});
    try {
      fonts.addEventListener?.('loadingdone', () => {
        window.clearTimeout((this as any)._fontTimer);
        (this as any)._fontTimer = window.setTimeout(refresh, 120);
      });
    } catch {
      /* ignore */
    }
  }

  /* ===================================================================== */
  /*  Líneas                                                                */
  /* ===================================================================== */
  private lineStyleKind(): 'organic' | 'curve' | 'straight' | 'elbow' {
    const s = this.settings.lineStyle;
    return s === 'theme' ? this.theme.line.style : s;
  }

  public styleBranchLine(line: any, childNode: any): void {
    const th = this.theme;
    const color = this.branchColor(childNode);
    const own = childNode?.nodeData?.data;
    const width = Number(own?.lineWidth) || th.line.width;
    const isRibbon = childNode?.parent?.isRoot && this.lineStyleKind() === 'organic';
    if (isRibbon) {
      line.fill({ color }).stroke({ color: 'none', width: 0 });
    } else {
      line.stroke({
        color,
        width,
        dasharray: own?.lineDasharray && own.lineDasharray !== 'none' ? own.lineDasharray : th.line.dash || undefined,
        linecap: th.line.cap,
        linejoin: 'round'
      }).fill({ color: 'none' });
    }
    line.attr('opacity', th.line.opacity);
  }

  private patchLayout(): void {
    const layout = this.mm?.renderer?.layout;
    if (!layout || layout.__eurekaPatched === this) return;
    layout.__eurekaPatched = this;

    const orig = layout.renderLine ? layout.renderLine.bind(layout) : null;
    const self = this;

    layout.renderLine = function (node: any, lines: any[], style: any, lineStyle: any) {
      if (!node?.children?.length) return orig ? orig(node, lines, style, lineStyle) : [];

      const layoutName = self.mm.opt?.layout || '';
      const horizontal = layoutName === 'logicalStructure' || layoutName === 'logicalStructureLeft' || layoutName === 'mindMap';
      const vertical = layoutName === 'organizationStructure';
      if (!horizontal && !vertical) return orig ? orig(node, lines, style, lineStyle) : [];

      const { left, top, width, height } = node;
      if (![left, top, width, height].every(Number.isFinite)) return orig ? orig(node, lines, style, lineStyle) : [];

      const kind = self.lineStyleKind();
      const th = self.theme;

      node.children.forEach((child: any, index: number) => {
        const line = lines[index];
        if (!line) return;
        if (![child.left, child.top, child.width, child.height].every(Number.isFinite)) return;

        let d = '';
        const color = self.branchColor(child);
        const isRibbon = kind === 'organic' && node.isRoot;

        if (horizontal) {
          const isLeft = child.dir === 'left' || child.left + child.width / 2 < left + width / 2;
          const p0: Point2D = { x: isLeft ? left : left + width, y: top + height / 2 };
          const p3: Point2D = { x: isLeft ? child.left + child.width : child.left, y: child.top + child.height / 2 };

          if (isRibbon) {
            d = AdaptiveSplineEngine.generateOrganicRibbonPath(p0, p3, {
              wRoot: th.line.rootWidth,
              wChild: th.line.width + 0.4,
              alpha: 1.25,
              tension: 0.55,
              samples: 22
            });
          } else if (kind === 'straight') {
            d = `M ${p0.x.toFixed(1)},${p0.y.toFixed(1)} L ${p3.x.toFixed(1)},${p3.y.toFixed(1)}`;
          } else if (kind === 'elbow') {
            d = elbowHorizontal(p0, p3, isLeft ? -1 : 1);
          } else {
            d = AdaptiveSplineEngine.generateChildConnectorPath(p0, p3, isLeft, {
              tension: 0.55,
              useTrunkOffset: false,
              includeOvalMarker: false
            });
          }
        } else {
          const p0: Point2D = { x: left + width / 2, y: top + height };
          const p3: Point2D = { x: child.left + child.width / 2, y: child.top };
          if (kind === 'straight') {
            d = `M ${p0.x.toFixed(1)},${p0.y.toFixed(1)} L ${p3.x.toFixed(1)},${p3.y.toFixed(1)}`;
          } else if (kind === 'elbow') {
            d = elbowVertical(p0, p3);
          } else {
            const dx = Math.abs(p3.x - p0.x);
            if (dx < 2) d = `M ${p0.x.toFixed(1)},${p0.y.toFixed(1)} L ${p3.x.toFixed(1)},${p3.y.toFixed(1)}`;
            else {
              const midY = p0.y + (p3.y - p0.y) * 0.5;
              d = `M ${p0.x.toFixed(1)},${p0.y.toFixed(1)} C ${p0.x.toFixed(1)},${midY.toFixed(1)} ${p3.x.toFixed(1)},${midY.toFixed(1)} ${p3.x.toFixed(1)},${p3.y.toFixed(1)}`;
            }
          }
        }

        line.plot(d);
        if (isRibbon) {
          line.attr({ fill: color, stroke: 'none', 'stroke-width': 0, opacity: th.line.opacity });
        } else {
          line.attr({
            fill: 'none',
            stroke: color,
            'stroke-width': Number(child.nodeData?.data?.lineWidth) || th.line.width,
            'stroke-linecap': th.line.cap,
            'stroke-linejoin': 'round',
            'stroke-dasharray': th.line.dash || null,
            opacity: th.line.opacity
          });
        }
      });
      return lines;
    };
  }

  /* ===================================================================== */
  /*  Eventos de la librería                                                */
  /* ===================================================================== */
  private bindLibraryEvents(): void {
    const mm = this.mm;

    mm.on('node_active', (_node: any, list: any[]) => {
      const active = Array.isArray(list) ? list.slice() : this.getActiveNodes();
      this.emit('selection', active);
    });

    mm.on('node_dblclick', (node: any, _e: any, isInserting?: boolean) => {
      if (!node) return;
      this.emit('edit', node, { isInserting: Boolean(isInserting) });
    });

    mm.on('node_click', (node: any, e: MouseEvent) => {
      this.emit('node-click', node, e);
      const target = e?.target as HTMLElement | null;
      const actionEl = target?.closest?.('[data-mm-action]') as HTMLElement | null;
      if (actionEl && node) {
        const action = actionEl.dataset.mmAction;
        if (action === 'toggle-check') this.toggleChecked(node);
        else this.emit('badge', node, action);
      }
    });

    mm.on('draw_click', () => this.emit('blank-click'));
    mm.on('node_contextmenu', (e: MouseEvent, node: any) => this.emit('contextmenu', e, node));
    mm.on('contextmenu', (e: MouseEvent) => this.emit('contextmenu', e, null));

    mm.on('data_change', () => {
      this.branchCache.clear();
      this.emit('change');
    });

    mm.on('back_forward', (index: number, len: number) => this.emit('history', index, len));

    mm.on('node_tree_render_start', () => {
      this.branchCache.clear();
    });

    mm.on('node_tree_render_end', () => {
      if (this.renderEndRaf) return;
      this.renderEndRaf = requestAnimationFrame(() => {
        this.renderEndRaf = 0;
        if (this.destroyed) return;
        this.patchLayout();
        this.collectStats();
        this.applyCulling();
        this.emit('rendered');
      });
    });

    mm.on('view_data_change', () => this.onViewChanged());
    mm.on('scale', () => this.onViewChanged());
    mm.on('translate', () => this.onViewChanged());

    // Instantánea inicial en el historial
    mm.on('mousedown', () => this.markMoving());
  }

  private onViewChanged(): void {
    this.markMoving();
    if (this.viewRaf) return;
    this.viewRaf = requestAnimationFrame(() => {
      this.viewRaf = 0;
      if (this.destroyed) return;
      this.updatePatternVars();
      this.applyCulling();
      this.emit('view');
    });
  }

  private markMoving(): void {
    this.stage.classList.add('is-moving');
    window.clearTimeout(this.movingTimer);
    this.movingTimer = window.setTimeout(() => this.stage.classList.remove('is-moving'), 160);
  }

  private collectStats(): void {
    let count = 0;
    const walk = (n: any) => {
      if (!n) return;
      count++;
      if (n.children && n.getData?.('expand') !== false) n.children.forEach(walk);
    };
    walk(this.mm.renderer?.root);
    this.nodeCount = count;
  }

  public getNodeCount(): number {
    return this.nodeCount;
  }

  /* ===================================================================== */
  /*  Culling (nodos fuera de pantalla)                                     */
  /* ===================================================================== */
  private applyCulling(): void {
    if (this.cullRaf) return;
    this.cullRaf = requestAnimationFrame(() => {
      this.cullRaf = 0;
      this.doCulling();
    });
  }

  public get stageEl(): HTMLElement {
    return this.stage;
  }

  /** Ejecuta `fn` con todos los nodos visibles (para exportar) y restablece el culling después */
  public async withAllVisible<T>(fn: () => Promise<T> | T): Promise<T> {
    const root = this.getRoot();
    this.suspendCull = true;
    if (root && this.culled) this.setAllVisible(root);
    try {
      return await fn();
    } finally {
      this.suspendCull = false;
      this.culled = false;
      this.applyCulling();
    }
  }

  private doCulling(): void {
    const mm = this.mm;
    const root = mm?.renderer?.root;
    if (!mm || !root || this.destroyed || this.suspendCull) return;

    const enable = this.nodeCount > 110;
    if (!enable) {
      if (this.culled) this.setAllVisible(root);
      this.culled = false;
      return;
    }
    this.culled = true;

    const v = mm.view;
    const w = this.stage.clientWidth || 1200;
    const h = this.stage.clientHeight || 800;
    const m = 260;
    const x0 = (-v.x - m) / v.scale;
    const y0 = (-v.y - m) / v.scale;
    const x1 = (w - v.x + m) / v.scale;
    const y1 = (h - v.y + m) / v.scale;

    const visit = (n: any) => {
      if (!n) return;
      const nl = n.left;
      const nt = n.top;
      const nw = n.width || 100;
      const nh = n.height || 40;
      const visible = n.isRoot || (nl + nw >= x0 && nl <= x1 && nt + nh >= y0 && nt <= y1);
      const g = n.group?.node as SVGElement | undefined;
      if (g) {
        const want = visible ? '' : 'none';
        if (g.style.display !== want) g.style.display = want;
      }
      let anyChildVisible = false;
      if (n.children && n.getData?.('expand') !== false) {
        n.children.forEach((c: any, i: number) => {
          visit(c);
          const cv = (c.group?.node as SVGElement | undefined)?.style.display !== 'none';
          anyChildVisible = anyChildVisible || cv;
          const line = n._lines?.[i]?.node as SVGElement | undefined;
          if (line) {
            const want = visible || cv ? '' : 'none';
            if (line.style.display !== want) line.style.display = want;
          }
        });
      }
      void anyChildVisible;
    };
    visit(root);
  }

  private setAllVisible(root: any): void {
    const visit = (n: any) => {
      if (!n) return;
      const g = n.group?.node as SVGElement | undefined;
      if (g && g.style.display) g.style.display = '';
      (n._lines || []).forEach((l: any) => {
        if (l?.node?.style.display) l.node.style.display = '';
      });
      (n.children || []).forEach(visit);
    };
    visit(root);
  }

  /* ===================================================================== */
  /*  Gestos táctiles                                                       */
  /* ===================================================================== */
  private initTouch(): void {
    try {
      this.mm.touchEvent?.unBindEvent?.();
    } catch {
      /* ignore */
    }
    const v = this.mm.view;
    this.touch = new TouchGestureEngine(this.el, {
      minScale: 0.1,
      maxScale: 4,
      friction: 0.93,
      velocityThreshold: 0.08,
      interactiveSelector: '.mmx-node, .smm-node, .smm-expand-btn, .mmx-ui, button, input, textarea, a, select, [contenteditable="true"]',
      onTransform: (state) => {
        const view = this.mm.view;
        view.scale = state.scale;
        view.x = state.x;
        view.y = state.y;
        view.transform();
      }
    });
    this.touch.setTransform(v.x, v.y, v.scale);
    this.mm.on('view_data_change', (data: any) => {
      if (data?.state) this.touch?.setTransform(data.state.x, data.state.y, data.state.scale);
    });
  }

  /* ===================================================================== */
  /*  Vista                                                                 */
  /* ===================================================================== */
  public getScale(): number {
    return this.mm?.view?.scale ?? 1;
  }

  public getViewState(): { scale: number; x: number; y: number } | undefined {
    const v = this.mm?.view;
    if (!v) return undefined;
    return { scale: v.scale, x: v.x, y: v.y };
  }

  public getTreeBounds(): { minX: number; minY: number; maxX: number; maxY: number } | null {
    const root = this.mm?.renderer?.root;
    if (!root) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const walk = (n: any) => {
      if (!n || n.isHide) return;
      const l = n.left;
      const t = n.top;
      const w = n.width || 80;
      const h = n.height || 36;
      minX = Math.min(minX, l);
      minY = Math.min(minY, t);
      maxX = Math.max(maxX, l + w);
      maxY = Math.max(maxY, t + h);
      if (n.children && n.getData?.('expand') !== false) n.children.forEach(walk);
    };
    walk(root);
    if (!Number.isFinite(minX)) return null;
    return { minX, minY, maxX, maxY };
  }

  /** ¿Se ve al menos una parte razonable del mapa con la vista actual? */
  public isTreeInView(): boolean {
    const b = this.getTreeBounds();
    const v = this.mm?.view;
    if (!b || !v) return true;
    const W = this.stage.clientWidth;
    const H = this.stage.clientHeight;
    const x0 = b.minX * v.scale + v.x;
    const y0 = b.minY * v.scale + v.y;
    const x1 = b.maxX * v.scale + v.x;
    const y1 = b.maxY * v.scale + v.y;
    const ix = Math.max(0, Math.min(x1, W) - Math.max(x0, 0));
    const iy = Math.max(0, Math.min(y1, H) - Math.max(y0, 0));
    const area = Math.max(1, (x1 - x0) * (y1 - y0));
    return (ix * iy) / area > 0.35 || (ix > W * 0.5 && iy > H * 0.35);
  }

  private visibleArea(): { x: number; y: number; w: number; h: number } {
    const W = this.stage.clientWidth || 800;
    const H = this.stage.clientHeight || 600;
    const i = this.insets;
    return { x: i.left, y: i.top, w: Math.max(80, W - i.left - i.right), h: Math.max(80, H - i.top - i.bottom) };
  }

  /** Ajusta todo el mapa al área libre (descontando barras y paneles) */
  public fit(animate = true, pad = 56): void {
    const mm = this.mm;
    if (!mm || this.destroyed) return;
    try {
      mm.resize?.();
    } catch {
      /* ignore */
    }
    const b = this.getTreeBounds();
    if (!b) return;
    const area = this.visibleArea();
    const bw = Math.max(40, b.maxX - b.minX);
    const bh = Math.max(40, b.maxY - b.minY);
    const scale = Math.min(Math.max(Math.min((area.w - pad * 2) / bw, (area.h - pad * 2) / bh), 0.1), 1.25);
    const cx = (b.minX + b.maxX) / 2;
    const cy = (b.minY + b.maxY) / 2;
    const x = area.x + area.w / 2 - cx * scale;
    const y = area.y + area.h / 2 - cy * scale;
    this.setView({ scale, x, y }, animate ? 320 : 0);
  }

  public setView(target: { scale: number; x: number; y: number }, ms = 0): void {
    const view = this.mm?.view;
    if (!view) return;
    const apply = (s: number, x: number, y: number) => {
      view.scale = s;
      view.x = x;
      view.y = y;
      view.transform();
    };
    if (ms <= 0) return apply(target.scale, target.x, target.y);
    const from = { s: view.scale, x: view.x, y: view.y };
    const t0 = performance.now();
    const tick = (now: number) => {
      if (this.destroyed) return;
      const p = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      apply(from.s + (target.scale - from.s) * e, from.x + (target.x - from.x) * e, from.y + (target.y - from.y) * e);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  public zoomBy(factor: number): void {
    const view = this.mm?.view;
    if (!view) return;
    const area = this.visibleArea();
    const cx = area.x + area.w / 2;
    const cy = area.y + area.h / 2;
    const ns = Math.min(4, Math.max(0.1, view.scale * factor));
    const k = ns / view.scale;
    this.setView({ scale: ns, x: cx - (cx - view.x) * k, y: cy - (cy - view.y) * k }, 160);
  }

  public setZoomPercent(pct: number): void {
    const view = this.mm?.view;
    if (!view) return;
    this.zoomBy(Math.max(0.1, Math.min(4, pct / 100)) / view.scale);
  }

  /** Centra un nodo en el área libre sin cambiar el zoom (o con el zoom dado) */
  public centerOnNode(node: any, scale?: number, animate = true): void {
    const view = this.mm?.view;
    if (!view || !node) return;
    const s = scale ?? Math.max(view.scale, 0.55);
    const area = this.visibleArea();
    const cx = node.left + (node.width || 0) / 2;
    const cy = node.top + (node.height || 0) / 2;
    this.setView({ scale: s, x: area.x + area.w / 2 - cx * s, y: area.y + area.h / 2 - cy * s }, animate ? 280 : 0);
  }

  /** Si el nodo queda tapado por una hoja inferior (teclado/editor), desplaza el mapa para verlo */
  public ensureNodeVisible(node: any, bottomReserve: number): void {
    const view = this.mm?.view;
    if (!view || !node) return;
    const H = this.stage.clientHeight || 600;
    const top = this.insets.top + 10;
    const bottomLimit = H - bottomReserve - 10;
    const ny = node.top * view.scale + view.y;
    const nh = (node.height || 36) * view.scale;
    let dy = 0;
    if (ny + nh > bottomLimit) dy = bottomLimit - (ny + nh) - 24;
    if (ny + dy < top) dy = top - ny;
    if (Math.abs(dy) > 1) this.setView({ scale: view.scale, x: view.x, y: view.y + dy }, 200);
  }

  public nodeScreenRect(node: any): DOMRect | null {
    const g = node?.group?.node as Element | undefined;
    if (!g) return null;
    return g.getBoundingClientRect();
  }

  public resize(): void {
    try {
      this.mm?.resize?.();
    } catch {
      /* ignore */
    }
  }

  /* ===================================================================== */
  /*  Datos, selección e historial                                          */
  /* ===================================================================== */
  public getDoc(): MapDoc {
    const root = this.mm.getData(false);
    return {
      v: 2,
      root,
      settings: { ...this.settings },
      view: this.getViewState(),
      updatedAt: Date.now()
    };
  }

  public setRootData(root: any): void {
    this.withoutHistory(() => this.mm.setData(root));
    setTimeout(() => this.fit(false), 30);
  }

  public getActiveNodes(): any[] {
    return (this.mm?.renderer?.activeNodeList || []).slice();
  }

  public getRoot(): any {
    return this.mm?.renderer?.root || null;
  }

  private generalizationsOf(n: any): any[] {
    const list = n?._generalizationList;
    return Array.isArray(list) ? list.map((g: any) => g?.generalizationNode).filter(Boolean) : [];
  }

  public findNode(uid: string): any {
    const root = this.getRoot();
    if (!root || !uid) return null;
    const stack = [root];
    while (stack.length) {
      const n = stack.pop();
      if (n.nodeData?.data?.uid === uid) return n;
      if (n.children) stack.push(...n.children);
      stack.push(...this.generalizationsOf(n));
    }
    return null;
  }

  /** Nodos dibujados actualmente (las ramas contraídas no se incluyen) */
  public allNodes(): any[] {
    const out: any[] = [];
    const root = this.getRoot();
    if (!root) return out;
    const stack = [root];
    while (stack.length) {
      const n = stack.pop();
      out.push(n);
      if (n.children) for (let i = n.children.length - 1; i >= 0; i--) stack.push(n.children[i]);
      stack.push(...this.generalizationsOf(n));
    }
    return out;
  }

  /** Espera al próximo render del árbol (el render de la librería es asíncrono) */
  public nextRender(timeout = 600): Promise<void> {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        this.mm?.off?.('node_tree_render_end', finish);
        resolve();
      };
      this.mm.on('node_tree_render_end', finish);
      window.setTimeout(finish, timeout);
    });
  }

  /** Camino de uids desde la raíz hasta el nodo (en los datos, aunque esté contraído) */
  private pathTo(uid: string): string[] | null {
    const data = this.mm.getData(false);
    const walk = (n: any, path: string[]): string[] | null => {
      const id = n?.data?.uid;
      const next = id ? [...path, id] : path;
      if (id === uid) return next;
      for (const c of n?.children || []) {
        const r = walk(c, next);
        if (r) return r;
      }
      return null;
    };
    return walk(data, []);
  }

  /** Devuelve el nodo, expandiendo las ramas contraídas necesarias para que se dibuje */
  public async reveal(uid: string): Promise<any> {
    let node = this.findNode(uid);
    if (node) return node;
    const path = this.pathTo(uid);
    if (!path) return null;
    let expanded = false;
    for (const id of path.slice(0, -1)) {
      const n = this.findNode(id);
      if (n && n.getData('expand') === false) {
        this.mm.execCommand('SET_NODE_EXPAND', n, true);
        expanded = true;
        await this.nextRender();
      }
    }
    node = this.findNode(uid);
    if (!node && expanded) {
      await this.nextRender();
      node = this.findNode(uid);
    }
    return node;
  }

  public selectNode(node: any): void {
    if (!node) return;
    this.mm.execCommand('CLEAR_ACTIVE_NODE');
    node.active?.();
  }

  public clearSelection(): void {
    this.mm?.execCommand('CLEAR_ACTIVE_NODE');
  }

  public withoutHistory(fn: () => void): void {
    const cmd = this.mm.command;
    const was = cmd.isPause;
    cmd.pause();
    try {
      fn();
    } finally {
      if (!was) cmd.recovery();
    }
  }

  public undo(): void {
    this.mm.execCommand('BACK');
  }

  public redo(): void {
    this.mm.execCommand('FORWARD');
  }

  /* ===================================================================== */
  /*  Edición en vivo                                                       */
  /* ===================================================================== */
  public beginEdit(node: any, initialText: string): void {
    this.editingUid = node.nodeData?.data?.uid || null;
    this.editBuffer = initialText;
    this.mm.command.pause();
    this.mm.keyCommand?.pause?.();
    this.mm.keyCommand?.stopCheckInSvg?.();
    this.liveNode = node;
    this.requestLiveRender(node, true);
  }

  public setLiveText(node: any, text: string): void {
    this.editBuffer = text;
    this.requestLiveRender(node, false);
  }

  private requestLiveRender(node: any, immediate: boolean): void {
    this.liveNode = node;
    if (immediate) {
      this.runLiveRender();
      return;
    }
    if (this.liveRaf) return;
    this.liveRaf = requestAnimationFrame(() => {
      this.liveRaf = 0;
      this.runLiveRender();
    });
  }

  private runLiveRender(): void {
    const node = this.liveNode;
    if (!node || this.destroyed) return;
    if (node.nodeData?.data) node.nodeData.data.text = this.editBuffer;
    const changed = node.reRender?.();
    if (changed) this.mm.render();
    else this.emit('rendered');
    this.emit('live');
  }

  public endEdit(node: any, commit: boolean, finalText: string, original: string): void {
    this.editingUid = null;
    this.mm.keyCommand?.recovery?.();
    this.mm.keyCommand?.recoveryCheckInSvg?.();
    this.mm.command.recovery();
    window.cancelAnimationFrame(this.liveRaf);
    this.liveRaf = 0;
    const text = commit ? finalText : original;
    if (node?.nodeData?.data) node.nodeData.data.text = text;
    this.hugCache.clear();
    node?.reRender?.();
    this.mm.render();
    this.mm.command.addHistory();
    this.emit('change');
  }

  /* ===================================================================== */
  /*  Comandos de edición de la estructura                                  */
  /* ===================================================================== */
  public addChild(node?: any, opts: { text?: string; edit?: boolean } = {}): void {
    const target = node || this.getActiveNodes()[0] || this.getRoot();
    if (!target) return;
    target.active?.();
    this.mm.renderer.activeNodeList = [target];
    if (opts.text !== undefined) {
      this.mm.execCommand('INSERT_CHILD_NODE', opts.edit ?? false, [target], { text: opts.text });
    } else {
      this.mm.execCommand('INSERT_CHILD_NODE', opts.edit ?? true, [target]);
    }
  }

  public addSibling(node?: any, opts: { edit?: boolean } = {}): void {
    const target = node || this.getActiveNodes()[0];
    if (!target || target.isRoot) {
      this.addChild(target);
      return;
    }
    target.active?.();
    this.mm.renderer.activeNodeList = [target];
    this.mm.execCommand('INSERT_NODE', opts.edit ?? true, [target]);
  }

  public addParent(node?: any): void {
    const target = node || this.getActiveNodes()[0];
    if (!target || target.isRoot) return;
    this.mm.execCommand('INSERT_PARENT_NODE', true, [target]);
  }

  public removeNodes(nodes?: any[]): void {
    const list = (nodes && nodes.length ? nodes : this.getActiveNodes()).filter((n) => !n.isRoot);
    if (!list.length) return;
    this.mm.execCommand('REMOVE_NODE', list);
  }

  public removeKeepChildren(node?: any): void {
    const target = node || this.getActiveNodes()[0];
    if (!target || target.isRoot) return;
    this.mm.execCommand('REMOVE_CURRENT_NODE', [target]);
  }

  public moveUp(node?: any): void {
    const target = node || this.getActiveNodes()[0];
    if (target && !target.isRoot) this.mm.execCommand('UP_NODE', target);
  }

  public moveDown(node?: any): void {
    const target = node || this.getActiveNodes()[0];
    if (target && !target.isRoot) this.mm.execCommand('DOWN_NODE', target);
  }

  public promote(node?: any): void {
    const target = node || this.getActiveNodes()[0];
    if (target && !target.isRoot && target.layerIndex > 1) this.mm.execCommand('MOVE_UP_ONE_LEVEL', target);
  }

  public demote(node?: any): void {
    // Hace hijo del hermano anterior
    const target = node || this.getActiveNodes()[0];
    if (!target || target.isRoot) return;
    const sibs = target.parent?.children || [];
    const idx = sibs.indexOf(target);
    if (idx <= 0) return;
    const prev = sibs[idx - 1];
    this.mm.execCommand('MOVE_NODE_TO', target, prev);
  }

  public toggleExpand(node?: any): void {
    const target = node || this.getActiveNodes()[0];
    if (!target || !target.children?.length) return;
    this.mm.execCommand('SET_NODE_EXPAND', target, target.getData('expand') === false);
  }

  public expandAll(): void {
    this.mm.execCommand('EXPAND_ALL');
    setTimeout(() => this.fit(true), 80);
  }

  public collapseToLevel(level: number): void {
    this.mm.execCommand('UNEXPAND_TO_LEVEL', level);
    setTimeout(() => this.fit(true), 80);
  }

  private clip: any = null;

  public hasClipboard(): boolean {
    return Boolean(this.clip);
  }

  public copyNodes(nodes?: any[]): boolean {
    const list = nodes && nodes.length ? nodes : this.getActiveNodes();
    if (!list.length) return false;
    const r = this.mm.renderer;
    const prev = r.activeNodeList;
    r.activeNodeList = list;
    try {
      this.clip = r.copyNode();
    } finally {
      r.activeNodeList = prev;
    }
    if (this.clip) this.emit('copied', list);
    return Boolean(this.clip);
  }

  public cutNodes(): boolean {
    const list = this.getActiveNodes().filter((n) => !n.isRoot);
    if (!list.length) return false;
    this.copyNodes(list);
    this.removeNodes(list);
    return true;
  }

  public pasteNodes(target?: any): void {
    if (!this.clip) return;
    const t = target || this.getActiveNodes()[0] || this.getRoot();
    if (!t) return;
    this.mm.execCommand('INSERT_MULTI_CHILD_NODE', [t], JSON.parse(JSON.stringify(this.clip)));
  }

  /** Duplica el nodo (con su rama) como hermano suyo */
  public duplicateNode(node?: any): void {
    const target = node || this.getActiveNodes()[0];
    if (!target || target.isRoot) return;
    const saved = this.clip;
    const prevListeners = this.listeners['copied'];
    delete this.listeners['copied'];
    if (this.copyNodes([target])) this.pasteNodes(target.parent);
    if (prevListeners) this.listeners['copied'] = prevListeners;
    this.clip = saved;
  }

  /** Aplica datos (estilos o contenido) a uno o varios nodos con UN solo paso de historial */
  public applyData(nodes: any[], data: Record<string, any>, opts: { relayout?: boolean; history?: boolean } = {}): void {
    if (!nodes.length) return;
    const cmd = this.mm.command;
    cmd.pause();
    try {
      nodes.forEach((n) => {
        Object.keys(data).forEach((k) => {
          if (data[k] === undefined || data[k] === null) delete n.nodeData.data[k];
          else n.nodeData.data[k] = data[k];
        });
      });
    } finally {
      cmd.recovery();
    }
    this.branchCache.clear();
    let changed = false;
    nodes.forEach((n) => {
      if (n.reRender?.()) changed = true;
    });
    if (changed || opts.relayout) this.mm.render();
    else this.emit('rendered');
    if (opts.history !== false) this.mm.command.addHistory();
    this.emit('change');
  }

  public setBranchColor(nodes: any[], color: string | null): void {
    // El color de rama se guarda en el nodo y se hereda a toda la rama
    this.applyData(nodes, { lineColor: color }, { relayout: true });
    this.mm.reRender?.();
  }

  public toggleChecked(node: any): void {
    const d = node.nodeData.data;
    this.applyData([node], { checked: !d.checked });
  }

  public resetStyles(nodes: any[]): void {
    const clear: Record<string, any> = {};
    ['fillColor', 'borderColor', 'borderWidth', 'color', 'fontSize', 'fontFamily', 'fontWeight', 'fontStyle', 'textDecoration', 'borderRadius', 'textAlign', 'lineColor', 'lineWidth', 'lineDasharray'].forEach((k) => (clear[k] = null));
    this.applyData(nodes, clear, { relayout: true });
  }

  /** Inicia una relación: toca después el nodo de destino */
  public startAssociativeLine(): boolean {
    try {
      if (!this.getActiveNodes().length) return false;
      this.mm.associativeLine?.createLineFromActiveNode?.();
      return true;
    } catch {
      return false;
    }
  }

  public addSummary(nodes?: any[]): void {
    const list = nodes && nodes.length ? nodes : this.getActiveNodes();
    if (!list.length) return;
    this.mm.execCommand('ADD_GENERALIZATION', null, true);
  }

  public addFrame(): void {
    const first = this.getActiveNodes().find((n) => !n.isRoot);
    if (!first) return;
    const c = this.branchColor(first);
    this.mm.execCommand('ADD_OUTER_FRAME', null, {
      strokeColor: c,
      strokeWidth: 2,
      strokeDasharray: '6 5',
      fill: withAlpha(c, 0.1)
    });
  }

  /* ===================================================================== */
  /*  Exportación / presentación                                            */
  /* ===================================================================== */
  public startPresentation(): void {
    try {
      this.mm.demonstrate?.enter?.();
    } catch (e) {
      console.warn('[MindMapEngine] presentación no disponible', e);
    }
  }

  /** Cambia modo de selección: false = arrastrar mueve el lienzo, true = arrastrar selecciona varios nodos */
  public setSelectionMode(select: boolean): void {
    if (!this.mm) return;
    this.mm.opt.useLeftKeySelectionRightKeyDrag = select;
    this.stage.classList.toggle('mmx-select-mode', select);
  }

  public destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.liveRaf);
    cancelAnimationFrame(this.viewRaf);
    cancelAnimationFrame(this.cullRaf);
    cancelAnimationFrame(this.renderEndRaf);
    window.clearTimeout(this.movingTimer);
    try {
      this.touch?.destroy();
    } catch {
      /* ignore */
    }
    try {
      this.mm?.destroy();
    } catch {
      /* ignore */
    }
    ENGINES.delete(this.el);
    this.measureHost.remove();
    this.listeners = {};
    this.mm = null;
  }
}

/* ======================================================================= */
/*  Geometría auxiliar                                                      */
/* ======================================================================= */
function elbowHorizontal(p0: Point2D, p3: Point2D, dir: 1 | -1): string {
  const dy = p3.y - p0.y;
  if (Math.abs(dy) < 1.5) return `M ${p0.x.toFixed(1)},${p0.y.toFixed(1)} L ${p3.x.toFixed(1)},${p3.y.toFixed(1)}`;
  const xm = p0.x + (p3.x - p0.x) / 2;
  const sy = dy > 0 ? 1 : -1;
  const r = Math.min(14, Math.abs(dy) / 2, Math.abs(xm - p0.x), Math.abs(p3.x - xm));
  return `M ${p0.x.toFixed(1)},${p0.y.toFixed(1)} H ${(xm - dir * r).toFixed(1)} Q ${xm.toFixed(1)},${p0.y.toFixed(1)} ${xm.toFixed(1)},${(p0.y + sy * r).toFixed(1)} V ${(p3.y - sy * r).toFixed(1)} Q ${xm.toFixed(1)},${p3.y.toFixed(1)} ${(xm + dir * r).toFixed(1)},${p3.y.toFixed(1)} H ${p3.x.toFixed(1)}`;
}

function elbowVertical(p0: Point2D, p3: Point2D): string {
  const dx = p3.x - p0.x;
  if (Math.abs(dx) < 1.5) return `M ${p0.x.toFixed(1)},${p0.y.toFixed(1)} L ${p3.x.toFixed(1)},${p3.y.toFixed(1)}`;
  const ym = p0.y + (p3.y - p0.y) / 2;
  const sx = dx > 0 ? 1 : -1;
  const r = Math.min(14, Math.abs(dx) / 2, Math.abs(ym - p0.y), Math.abs(p3.y - ym));
  return `M ${p0.x.toFixed(1)},${p0.y.toFixed(1)} V ${(ym - r).toFixed(1)} Q ${p0.x.toFixed(1)},${ym.toFixed(1)} ${(p0.x + sx * r).toFixed(1)},${ym.toFixed(1)} H ${(p3.x - sx * r).toFixed(1)} Q ${p3.x.toFixed(1)},${ym.toFixed(1)} ${p3.x.toFixed(1)},${(ym + r).toFixed(1)} V ${p3.y.toFixed(1)}`;
}

export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Reexport útil para la UI
export { withAlpha };
