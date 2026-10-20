/**
 * MindMapStudio — editor de mapas mentales (escritorio y móvil).
 * Orquesta el motor (engine.ts), el editor de texto, el inspector, la vista de esquema,
 * la persistencia y todo el chrome (barra superior, dock móvil, herramientas flotantes, zoom, minimapa…).
 */

import './mindmap.css';
import { MindMapEngine } from './engine';
import { MindMapStore, DEFAULT_SETTINGS, type MapDoc, type SaveState } from './store';
import { NodeEditor, type NextAction } from './editor';
import { Inspector, type InspectorTab } from './inspector';
import { OutlineView } from './outline';
import { icon } from './icons';
import { exportMap, type ExportKind } from './export';
import { processImageFile, fitImageSize, IMAGE_PRESETS, type ImagePresetId } from './images';
import { THEME_BY_ID } from './themes';
import { stripToPlain } from './richText';
import { TEMPLATES, docFromTemplate, docFromImport, isLegacyDemoTree, normalizeTree, textToTree, textToForest, treeToText, subtreeText, type MapNodeData } from './templates';
import { activeStudyService } from '../services/active-study.service';
import { eurekaBackend } from '../services/backend.service';
import { themeService } from '../services/theme.service';
import { dialogService } from '../services/dialog.service';
import { deckService } from '../services/deck.service';
import { nativeService } from '../services/native.service';

export interface MindMapStudioOptions {
  topicId?: string;
  topicTitle: string;
  initialData?: any;
  onBack: () => void;
  onSave?: () => void;
}

export interface MenuItem {
  label?: string;
  icon?: string;
  kbd?: string;
  danger?: boolean;
  disabled?: boolean;
  sep?: boolean;
  header?: string;
  onClick?: () => void;
}

const normalizeForest = (forest: MapNodeData[]): MapNodeData[] => forest.map((t) => normalizeTree(t));

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export class MindMapStudio {
  public engine!: MindMapEngine;

  private container: HTMLElement;
  private opts: MindMapStudioOptions;
  private root!: HTMLElement;
  private stage!: HTMLElement;
  private canvas!: HTMLElement;
  private inspectorEl!: HTMLElement;
  private dockEl!: HTMLElement;
  private toolbarEl!: HTMLElement;
  private handleChild!: HTMLButtonElement;
  private handleSib!: HTMLButtonElement;
  private zoomLabel!: HTMLElement;
  private minimapWrap!: HTMLElement;
  private minimapCanvas!: HTMLCanvasElement;
  private searchBar!: HTMLElement;
  private searchInput!: HTMLInputElement;
  private searchCount!: HTMLElement;
  private toastEl!: HTMLElement;
  private saveEl!: HTMLElement;
  private fileInput!: HTMLInputElement;
  private cameraInput!: HTMLInputElement;
  private importInput!: HTMLInputElement;

  private store: MindMapStore;
  private editor!: NodeEditor;
  private inspector!: Inspector;
  private outline!: OutlineView;
  private viewKey: string;

  private mobile = false;
  private mq: MediaQueryList;
  private inspectorOpen = true;
  private viewMode: 'map' | 'outline' = 'map';
  private editSheetH = 0;
  private menuEl: HTMLElement | null = null;
  private menuCleanup: (() => void) | null = null;
  private toastTimer = 0;
  private overlayRaf = 0;
  private miniRaf = 0;
  private viewSaveTimer = 0;
  private searchHits: string[] = [];
  private searchIndex = -1;
  private searchTimer = 0;
  private lastTap = { uid: '', t: 0 };
  private longPress: { timer: number; x: number; y: number } | null = null;
  private lastCopiedText = '';
  private resizeObs: ResizeObserver | null = null;
  private destroyed = false;
  private pendingFirstFit = true;
  private cleanups: (() => void)[] = [];
  private isBrandNew = false;
  private hasInitialData = false;
  private ready = false;
  private lastZoomText = '';

  constructor(container: HTMLElement, opts: MindMapStudioOptions) {
    this.container = container;
    this.opts = opts;
    const uid = activeStudyService.getCurrentUserId() || eurekaBackend.getUserId();
    this.store = new MindMapStore({ userId: uid, topicId: opts.topicId, fallbackKey: 'free' });
    this.viewKey = `eureka_mm2view_${uid}_${opts.topicId || 'free'}`;
    this.mq = window.matchMedia('(max-width: 860px), (pointer: coarse) and (max-width: 1100px)');
  }

  /* ===================================================================== */
  /*  Montaje                                                               */
  /* ===================================================================== */
  public mount(): void {
    this.container.innerHTML = '';
    this.root = document.createElement('div');
    this.root.className = 'mmx-studio';
    this.root.dataset.loading = 'true';
    this.root.dataset.view = 'map';
    this.root.innerHTML = this.template();
    this.container.appendChild(this.root);

    const q = <T extends HTMLElement>(s: string) => this.root.querySelector(s) as T;
    this.stage = q('.mmx-stage');
    this.canvas = q('.mmx-canvas');
    this.inspectorEl = q('.mmx-inspector');
    this.dockEl = q('.mmx-dock');
    this.toolbarEl = q('.mmx-ntb');
    this.handleChild = q('.mmx-handle-child');
    this.handleSib = q('.mmx-handle-sib');
    this.zoomLabel = q('[data-zoom-label]');
    this.minimapWrap = q('.mmx-minimap');
    this.minimapCanvas = q('.mmx-minimap canvas');
    this.searchBar = q('.mmx-search');
    this.searchInput = q('.mmx-search input');
    this.searchCount = q('.mmx-search-count');
    this.toastEl = q('.mmx-toast');
    this.saveEl = q('.mmx-save');
    this.fileInput = q('input[data-file="image"]');
    this.cameraInput = q('input[data-file="camera"]');
    this.importInput = q('input[data-file="import"]');

    if ((import.meta as any).env?.DEV) (window as any).__mmx = this;
    this.store.onState((s, d) => this.setSaveState(s, d));
    this.updateDeviceMode(true);
    this.bindStatic();
    void this.boot();
  }

  private template(): string {
    return `
      <header class="mmx-top mmx-ui">
        <button class="mmx-ib" data-act="back" title="Volver" aria-label="Volver">${icon('back', 22)}</button>
        <div class="mmx-title">
          <div class="mmx-title-text">${esc(this.opts.topicTitle || 'Mapa mental')}</div>
          <div class="mmx-save" data-state="idle"><span class="mmx-save-dot"></span><span class="mmx-save-txt">Listo</span></div>
        </div>
        <div class="mmx-top-spacer"></div>
        <button class="mmx-ib" data-act="undo" title="Deshacer (Ctrl+Z)" aria-label="Deshacer">${icon('undo')}</button>
        <button class="mmx-ib" data-act="redo" title="Rehacer (Ctrl+Y)" aria-label="Rehacer">${icon('redo')}</button>
        <button class="mmx-ib" data-act="search" title="Buscar (Ctrl+F)" aria-label="Buscar">${icon('search')}</button>
        <div class="mmx-seg mmx-hide-m" role="tablist" aria-label="Vista">
          <button data-view="map" class="on" role="tab">${icon('map', 16)}<span>Mapa</span></button>
          <button data-view="outline" role="tab">${icon('outline', 16)}<span>Esquema</span></button>
        </div>
        <button class="mmx-ib mmx-hide-m" data-act="study" title="Modo estudio: oculta las ideas y revélalas al tocar" aria-label="Modo estudio">${icon('eye')}</button>
        <button class="mmx-btn mmx-hide-m" data-act="present" title="Presentar">${icon('present', 16)}<span>Presentar</span></button>
        <button class="mmx-btn mmx-hide-m" data-act="export-menu" title="Exportar">${icon('export', 16)}<span>Exportar</span></button>
        <button class="mmx-ib" data-act="more" title="Más opciones" aria-label="Más opciones">${icon('more')}</button>
        <button class="mmx-ib mmx-hide-m" data-act="toggle-panel" title="Panel de formato" aria-label="Panel de formato">${icon('sliders')}</button>
      </header>

      <div class="mmx-search mmx-ui" hidden>
        ${icon('search', 18)}
        <input type="search" placeholder="Buscar en el mapa…" aria-label="Buscar en el mapa" autocomplete="off" />
        <span class="mmx-search-count"></span>
        <button class="mmx-ib sm" data-act="search-prev" aria-label="Anterior">${icon('up', 16)}</button>
        <button class="mmx-ib sm" data-act="search-next" aria-label="Siguiente">${icon('down', 16)}</button>
        <button class="mmx-ib sm" data-act="search-close" aria-label="Cerrar búsqueda">${icon('close', 16)}</button>
      </div>

      <div class="mmx-body">
        <div class="mmx-stage">
          <div class="mmx-pattern"></div>
          <div class="mmx-canvas"></div>
          <div class="mmx-vignette"></div>
          <div class="mmx-grain"></div>
          <div class="mmx-layer mmx-ui">
            <div class="mmx-ntb" hidden></div>
            <button class="mmx-handle mmx-handle-child" hidden aria-label="Añadir idea hija" title="Añadir idea hija (Tab)">${icon('plus', 16)}</button>
            <button class="mmx-handle mmx-handle-sib" hidden aria-label="Añadir idea hermana" title="Añadir idea hermana (Enter)">${icon('plus', 16)}</button>
          </div>
        </div>

        <section class="mmx-outline mmx-ui" hidden></section>

        <div class="mmx-zoom mmx-ui">
          <button class="mmx-ib sm" data-act="zoom-out" aria-label="Alejar">${icon('minus', 16)}</button>
          <button class="mmx-zoom-pct" data-act="zoom-reset" data-zoom-label title="Restablecer al 100%">100%</button>
          <button class="mmx-ib sm" data-act="zoom-in" aria-label="Acercar">${icon('plus', 16)}</button>
          <span class="mmx-zoom-sep"></span>
          <button class="mmx-ib sm" data-act="fit" title="Ajustar a la pantalla" aria-label="Ajustar a la pantalla">${icon('fit', 20)}</button>
        </div>

        <div class="mmx-minimap mmx-ui" hidden><canvas width="200" height="140"></canvas></div>

        <aside class="mmx-inspector mmx-ui" data-open="true" aria-label="Formato"></aside>
      </div>

      <nav class="mmx-dock mmx-ui" aria-label="Acciones"></nav>
      <div class="mmx-toast mmx-ui" hidden role="status"></div>
      <div class="mmx-loading"><div class="mmx-spinner"></div><span>Preparando tu mapa…</span></div>

      <input type="file" accept="image/*" data-file="image" hidden />
      <input type="file" accept="image/*" capture="environment" data-file="camera" hidden />
      <input type="file" accept=".json,.md,.txt,.markdown,application/json,text/plain,text/markdown" data-file="import" hidden />
    `;
  }

  /* ===================================================================== */
  /*  Arranque                                                              */
  /* ===================================================================== */
  private async boot(): Promise<void> {
    let doc: MapDoc | null = null;
    try {
      doc = await this.store.load();
    } catch (e) {
      console.warn('[MindMapStudio] no se pudo leer el mapa guardado', e);
    }
    if (this.destroyed) return;

    if (doc && isLegacyDemoTree(doc.root)) doc = null;
    const initialData = this.opts.initialData && !isLegacyDemoTree(this.opts.initialData.root || this.opts.initialData) ? this.opts.initialData : null;
    this.hasInitialData = Boolean(initialData);

    if (!doc) {
      const fromInit = initialData ? docFromImport(initialData) : null;
      if (fromInit) {
        doc = fromInit;
      } else {
        doc = docFromTemplate('blank', this.opts.topicTitle || 'Mi mapa mental');
        this.isBrandNew = true;
      }
    }
    doc.root = normalizeTree(doc.root);

    let view = doc.view;
    try {
      const raw = localStorage.getItem(this.viewKey);
      if (raw) {
        const v = JSON.parse(raw);
        if (v && Number.isFinite(v.scale) && Number.isFinite(v.x) && Number.isFinite(v.y)) view = v;
      }
    } catch {
      /* ignore */
    }

    // El lienzo necesita tamaño real antes de crear el mapa (los estilos pueden tardar un instante)
    for (let i = 0; i < 100 && !this.destroyed; i++) {
      if (this.canvas.clientWidth > 40 && this.canvas.clientHeight > 40) break;
      await new Promise<void>((r) => window.setTimeout(r, 30));
    }
    if (this.destroyed) return;

    let env = 'desk_wood';
    try {
      env = themeService.getTheme().bgTheme;
    } catch {
      /* ignore */
    }

    this.engine = new MindMapEngine({
      el: this.canvas,
      stage: this.stage,
      data: doc.root,
      settings: { ...DEFAULT_SETTINGS, ...doc.settings },
      view,
      appEnvironment: env
    });
    this.engine.init();
    this.pendingFirstFit = !view;

    this.editor = new NodeEditor(this.engine, {
      isMobile: () => this.mobile,
      root: this.root,
      onFinish: (node, committed, next) => this.afterEdit(node, committed, next),
      onSheetChange: (h) => {
        this.editSheetH = h;
        this.updateInsets();
      }
    });
    this.inspector = new Inspector(this, this.inspectorEl);
    this.outline = new OutlineView(this, this.root.querySelector('.mmx-outline') as HTMLElement);

    this.bindEngine();
    this.applyChrome();
    this.updateInsets();
    this.renderDock();
    this.inspector.render();
    this.updateZoomLabel();
    this.setMinimapVisible(this.engine.settings.showMinimap && !this.mobile);

    this.root.dataset.loading = 'false';
    this.engine.nextRender(900).then(() => {
      if (this.destroyed) return;
      // Sin vista guardada (o si quedó fuera de pantalla) se ajusta todo el mapa
      if (this.pendingFirstFit || !this.engine.isTreeInView()) this.engine.fit(false);
      if (this.pendingFirstFit && !this.getSelection().length) {
        const r = this.engine.getRoot();
        if (r && !this.isBrandNew) this.engine.selectNode(r);
      }
      this.pendingFirstFit = false;
      this.scheduleOverlays();
      window.setTimeout(() => {
        // Una nueva instancia guarda el mapa solo si se llegó a tocar o si es la primera vez
        this.ready = true;
        if (this.isBrandNew || this.hasInitialData) this.scheduleSave();
      }, 250);
    });
    if (this.isBrandNew && !this.hasInitialData) {
      window.setTimeout(() => {
        if (!this.destroyed) this.openTemplateGallery(true);
      }, 450);
    } else {
      this.maybeShowHint();
    }
  }

  private maybeShowHint(): void {
    try {
      if (localStorage.getItem('eureka_mm_hint_v2')) return;
      localStorage.setItem('eureka_mm_hint_v2', '1');
    } catch {
      /* ignore */
    }
    window.setTimeout(() => {
      this.toast(this.mobile ? 'Toca una idea para editarla · pellizca para hacer zoom' : 'Doble clic para editar · Tab añade una idea hija · Enter una hermana', 4200);
    }, 700);
  }

  /* ===================================================================== */
  /*  Estado del dispositivo y márgenes                                     */
  /* ===================================================================== */
  private updateDeviceMode(initial = false): void {
    const m = this.mq.matches;
    const changed = m !== this.mobile;
    this.mobile = m;
    this.root.dataset.mobile = String(m);
    if (changed || initial) {
      if (m) this.inspectorEl.dataset.open = 'false';
      else this.inspectorEl.dataset.open = String(this.inspectorOpen);
      this.root.dataset.sheet = String(m && this.inspectorEl.dataset.open === 'true');
      this.root.dataset.panel = this.inspectorEl.dataset.open === 'true' ? 'true' : 'false';
    }
    if (changed && !initial && this.engine) {
      this.setMinimapVisible(this.engine.settings.showMinimap && !m);
      this.renderDock();
      this.inspector?.render();
      this.updateInsets();
      this.scheduleOverlays();
    }
  }

  public isMobile(): boolean {
    return this.mobile;
  }

  private updateInsets(): void {
    if (!this.engine) return;
    const sheetOpen = this.mobile && this.inspectorEl.dataset.open === 'true';
    let bottom = 0;
    let right = 0;
    if (this.mobile) {
      bottom = sheetOpen ? this.inspectorEl.offsetHeight : this.dockEl.offsetHeight + 10;
      bottom = Math.max(bottom, this.editSheetH);
    } else if (this.inspectorEl.dataset.open === 'true') {
      right = this.inspectorEl.offsetWidth + 24;
    }
    const topBar = this.root.querySelector('.mmx-top') as HTMLElement | null;
    const top = topBar ? topBar.getBoundingClientRect().bottom - this.root.getBoundingClientRect().top + 10 : 74;
    this.engine.insets = { top, right, bottom, left: 0 };
    this.root.style.setProperty('--mmx-dock-h', `${this.dockEl.offsetHeight}px`);
    this.root.style.setProperty('--mmx-top', `${Math.round(top)}px`);
  }

  /** Colores del chrome según el tema del mapa (claro/oscuro) */
  private applyChrome(): void {
    const th = this.engine.theme;
    this.root.dataset.dark = String(th.dark);
    this.root.dataset.theme = th.id;
    this.root.style.setProperty('--mmx-accent', th.accent);
    this.root.style.setProperty('--mmx-canvas-bg', this.stage.style.getPropertyValue('--mm-bg') || th.canvas.bg);
  }

  /* ===================================================================== */
  /*  Eventos del motor                                                     */
  /* ===================================================================== */
  private bindEngine(): void {
    const e = this.engine;
    const save = () => this.scheduleSave();

    e.on('change', save);
    e.on('history', save);
    e.on('settings', () => {
      this.updateZoomLabel();
    });
    e.on('theme', () => {
      this.applyChrome();
      this.inspector.render();
      this.scheduleMinimap();
    });
    e.on('selection', () => this.onSelection());
    e.on('edit', (node: any, info: { isInserting: boolean }) => this.beginEdit(node, info.isInserting));
    e.on('node-click', (node: any, ev: MouseEvent) => this.onNodeClick(node, ev));
    e.on('blank-click', () => {
      this.closeMenu();
      if (this.mobile && this.inspectorEl.dataset.open === 'true' && this.inspector.tab !== 'node') this.setInspectorOpen(false);
    });
    e.on('contextmenu', (ev: MouseEvent, node: any) => {
      ev.preventDefault();
      if (node) {
        if (!this.getSelection().includes(node)) this.engine.selectNode(node);
        this.openMenu({ x: ev.clientX, y: ev.clientY }, this.nodeMenu(node));
      } else {
        this.openMenu({ x: ev.clientX, y: ev.clientY }, this.canvasMenu());
      }
    });
    e.on('badge', (node: any, action: string) => {
      if (action === 'note') {
        this.engine.selectNode(node);
        this.openInspector('node');
        this.inspector.focusField('note');
      } else if (action === 'link') {
        const url = String(node.nodeData?.data?.hyperlink || '');
        if (url) this.openLink(url);
      } else if (action === 'card') {
        this.toast('Esta idea tiene una flashcard vinculada');
      }
    });
    e.on('view', () => {
      this.updateZoomLabel();
      this.scheduleOverlays();
      this.scheduleMinimap();
      this.scheduleViewSave();
    });
    e.on('rendered', () => {
      this.scheduleOverlays();
      this.scheduleMinimap();
      this.applySearchHighlight();
      this.updateUndoState();
      if (this.engine.isFocused()) this.engine.refocus();
    });
    e.on('live', () => this.scheduleOverlays());
    e.on('copied', () => {
      const nodes = this.getSelection();
      if (!nodes.length) return;
      const text = nodes.map((n) => treeToText(this.nodeToData(n))).join('');
      this.lastCopiedText = text.trim();
      try {
        void navigator.clipboard?.writeText(text);
      } catch {
        /* ignore */
      }
      this.toast('Copiado');
    });
  }

  private nodeToData(n: any): MapNodeData {
    return n.nodeData as MapNodeData;
  }

  public getSelection(): any[] {
    return this.engine ? this.engine.getActiveNodes() : [];
  }

  private onSelection(): void {
    const sel = this.getSelection();
    this.scheduleOverlays();
    this.renderDock();
    if (this.inspector) {
      const wasEmpty = this.inspector.lastSelectionCount === 0;
      this.inspector.lastSelectionCount = sel.length;
      if (sel.length > 0 && wasEmpty && this.inspector.tab !== 'node' && !this.mobile) this.inspector.setTab('node');
      this.inspector.render();
    }
  }

  private onNodeClick(node: any, ev: MouseEvent): void {
    const target = ev?.target as HTMLElement | null;
    if (target?.closest?.('[data-mm-action]')) return;
    if (this.engine.studyMode) {
      this.engine.toggleReveal(node);
      return;
    }
    const uid = node?.nodeData?.data?.uid || '';
    const now = performance.now();
    if (uid && this.lastTap.uid === uid && now - this.lastTap.t < 340) {
      this.lastTap = { uid: '', t: 0 };
      this.beginEdit(node, false);
      return;
    }
    this.lastTap = { uid, t: now };
  }

  /* ===================================================================== */
  /*  Edición de texto                                                      */
  /* ===================================================================== */
  public beginEdit(node?: any, isInserting = false): void {
    const target = node || this.getSelection()[0];
    if (!target || !this.editor) return;
    if (this.viewMode !== 'map') return;
    const uid = target.nodeData?.data?.uid;
    if (this.editor.isOpen() && this.editor.currentUid() === uid) return;
    this.closeMenu();
    this.engine.selectNode(target);
    this.hideOverlays();
    this.editor.open(target, { isInserting });
  }

  private afterEdit(node: any, committed: boolean, next: NextAction): void {
    this.scheduleOverlays();
    if (!node) {
      this.renderDock();
      return;
    }
    this.engine.selectNode(node);
    if (committed && next === 'child') this.engine.addChild(node);
    else if (committed && next === 'sibling') this.engine.addSibling(node);
    this.inspector?.render();
  }

  /* ===================================================================== */
  /*  Guardado                                                              */
  /* ===================================================================== */
  private scheduleSave(): void {
    if (this.destroyed || !this.engine?.mm || !this.ready) return;
    this.store.schedule(() => this.engine.getDoc(), 380);
  }

  private setSaveState(s: SaveState, detail?: string): void {
    if (!this.saveEl) return;
    this.saveEl.dataset.state = s;
    const txt = this.saveEl.querySelector('.mmx-save-txt') as HTMLElement;
    txt.textContent = s === 'saving' ? 'Guardando…' : s === 'saved' ? 'Guardado' : s === 'error' ? detail || 'No se pudo guardar' : 'Listo';
    this.saveEl.title = detail || '';
  }

  private scheduleViewSave(): void {
    window.clearTimeout(this.viewSaveTimer);
    this.viewSaveTimer = window.setTimeout(() => {
      const v = this.engine?.getViewState();
      if (!v) return;
      try {
        localStorage.setItem(this.viewKey, JSON.stringify(v));
      } catch {
        /* ignore */
      }
    }, 700);
  }

  public async saveNow(): Promise<void> {
    if (!this.engine?.mm) return;
    this.store.schedule(() => this.engine.getDoc(), 0);
    await this.store.flush();
    this.opts.onSave?.();
  }

  /* ===================================================================== */
  /*  Eventos estáticos (botones, teclado, gestos)                          */
  /* ===================================================================== */
  private on<K extends keyof WindowEventMap>(target: Window, type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions): void;
  private on(target: EventTarget, type: string, fn: (e: any) => void, opts?: AddEventListenerOptions): void;
  private on(target: EventTarget, type: string, fn: (e: any) => void, opts?: AddEventListenerOptions): void {
    target.addEventListener(type, fn, opts);
    this.cleanups.push(() => target.removeEventListener(type, fn, opts));
  }

  private bindStatic(): void {
    // Clics delegados de la interfaz
    this.on(this.root, 'click', (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const actBtn = t.closest('[data-act]') as HTMLElement | null;
      if (actBtn && this.root.contains(actBtn)) {
        e.preventDefault();
        this.runAction(actBtn.dataset.act || '', actBtn);
        return;
      }
      const viewBtn = t.closest('[data-view]') as HTMLElement | null;
      if (viewBtn && viewBtn.closest('.mmx-seg')) {
        this.setViewMode(viewBtn.dataset.view === 'outline' ? 'outline' : 'map');
      }
    });

    this.handleChild.addEventListener('click', (e) => {
      e.stopPropagation();
      const n = this.getSelection()[0];
      if (n) this.engine.addChild(n);
    });
    this.handleSib.addEventListener('click', (e) => {
      e.stopPropagation();
      const n = this.getSelection()[0];
      if (n) this.engine.addSibling(n);
    });

    // Imágenes / importación
    this.fileInput.addEventListener('change', () => this.onImagePicked(this.fileInput));
    this.cameraInput.addEventListener('change', () => this.onImagePicked(this.cameraInput));
    this.importInput.addEventListener('change', () => this.onImportPicked());

    // Búsqueda
    this.searchInput.addEventListener('input', () => {
      window.clearTimeout(this.searchTimer);
      this.searchTimer = window.setTimeout(() => this.runSearch(), 140);
    });
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.searchStep(e.shiftKey ? -1 : 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeSearch();
      }
      e.stopPropagation();
    });

    // Teclado global
    this.on(window, 'keydown', (e: KeyboardEvent) => this.onKeydown(e));

    // Pegar texto / imágenes
    this.on(document, 'paste', (e: ClipboardEvent) => this.onPaste(e));

    // Arrastrar y soltar imágenes
    this.on(this.stage, 'dragover', (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
    });
    this.on(this.stage, 'drop', (e: DragEvent) => this.onDrop(e));

    // Pulsación larga (táctil) → menú contextual
    this.on(this.stage, 'pointerdown', (e: PointerEvent) => this.onPointerDown(e));
    this.on(this.stage, 'pointermove', (e: PointerEvent) => {
      if (!this.longPress) return;
      if (Math.hypot(e.clientX - this.longPress.x, e.clientY - this.longPress.y) > 10) this.cancelLongPress();
    });
    this.on(window, 'pointerup', () => this.cancelLongPress());
    this.on(window, 'pointercancel', () => this.cancelLongPress());

    // Cierre de menús al tocar fuera
    this.on(document, 'pointerdown', (e: PointerEvent) => {
      if (this.menuEl && !this.menuEl.contains(e.target as Node)) this.closeMenu();
    });

    // Tamaño y dispositivo
    this.mq.addEventListener?.('change', () => this.updateDeviceMode());
    this.resizeObs = new ResizeObserver(() => {
      if (this.destroyed || !this.engine?.mm) return;
      const w = this.stage.clientWidth;
      const h = this.stage.clientHeight;
      if (w < 40 || h < 40) return;
      window.cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = window.requestAnimationFrame(() => {
        this.engine.resize();
        this.updateInsets();
        this.scheduleOverlays();
        this.scheduleMinimap();
      });
    });
    this.resizeObs.observe(this.stage);

    // Guardado de emergencia
    this.on(window, 'pagehide', () => this.store.flushSync());
    this.on(document, 'visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.store.flushSync();
    });

    // Minimapa: arrastrar para navegar
    this.bindMinimap();
  }

  private resizeRaf = 0;

  private onKeydown(e: KeyboardEvent): void {
    if (this.destroyed || !this.engine?.mm) return;
    const t = e.target as HTMLElement | null;
    const typing = Boolean(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable));
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key;

    if (key === 'Escape') {
      if (this.menuEl) return this.closeMenu();
      if (!this.searchBar.hidden) return this.closeSearch();
      if (this.engine.isFocused()) return this.engine.focusBranch(null);
      if (this.engine.studyMode) return this.toggleStudyMode();
      if (document.querySelector('.mmx-modal')) return this.closeTopModal();
      if (!typing) {
        if (this.mobile && this.inspectorEl.dataset.open === 'true') this.setInspectorOpen(false);
        else this.engine.clearSelection();
      }
      return;
    }

    if (mod && (key === 'f' || key === 'F') && !e.shiftKey) {
      e.preventDefault();
      this.openSearch();
      return;
    }
    if (mod && (key === 's' || key === 'S')) {
      e.preventDefault();
      void this.saveNow().then(() => this.toast('Guardado'));
      return;
    }
    if (typing || this.editor?.isOpen() || document.querySelector('.mmx-modal')) return;
    if (this.viewMode !== 'map') return;

    if (mod && (key === '0')) {
      e.preventDefault();
      this.engine.fit(true);
    } else if (mod && (key === '=' || key === '+')) {
      e.preventDefault();
      this.engine.zoomBy(1.2);
    } else if (mod && key === '-') {
      e.preventDefault();
      this.engine.zoomBy(1 / 1.2);
    } else if (key === 'Delete' || key === 'Backspace') {
      if (this.getSelection().length) {
        e.preventDefault();
        this.askDelete();
      }
    } else if ((key === 'F2' || key === ' ') && this.getSelection().length === 1) {
      e.preventDefault();
      this.beginEdit();
    } else if (!mod && !e.altKey && key.length === 1 && /\S/.test(key) && this.getSelection().length === 1 && !['+', '-', '/', '*'].includes(key)) {
      // Escribir sobre una idea seleccionada empieza a editarla
      const n = this.getSelection()[0];
      e.preventDefault();
      this.beginEdit(n);
      window.setTimeout(() => {
        if (this.editor.isOpen()) {
          this.editor.selectAll();
          this.editor.insertAtCursor(key);
        }
      }, 0);
    }
  }

  /* ===================================================================== */
  /*  Acciones de la interfaz                                               */
  /* ===================================================================== */
  private runAction(act: string, anchor: HTMLElement): void {
    const sel = this.getSelection();
    const first = sel[0];
    switch (act) {
      case 'back':
        void this.goBack();
        break;
      case 'undo':
        this.engine?.undo();
        break;
      case 'redo':
        this.engine?.redo();
        break;
      case 'search':
        this.openSearch();
        break;
      case 'search-next':
        this.searchStep(1);
        break;
      case 'search-prev':
        this.searchStep(-1);
        break;
      case 'search-close':
        this.closeSearch();
        break;
      case 'present':
        this.present();
        break;
      case 'study':
        this.toggleStudyMode();
        break;
      case 'shortcuts':
        this.openShortcuts();
        break;
      case 'export-menu':
        this.openMenu(anchor, this.exportMenu());
        break;
      case 'more':
        this.openMenu(anchor, this.moreMenu(), { align: 'right' });
        break;
      case 'toggle-panel':
        this.setInspectorOpen(this.inspectorEl.dataset.open !== 'true');
        break;
      case 'zoom-in':
        this.engine.zoomBy(1.25);
        break;
      case 'zoom-out':
        this.engine.zoomBy(0.8);
        break;
      case 'zoom-reset':
        this.engine.setZoomPercent(100);
        break;
      case 'fit':
        this.engine.fit(true);
        break;
      // Dock / barra de herramientas
      case 'child':
        this.engine.addChild(first);
        break;
      case 'sibling':
        this.engine.addSibling(first);
        break;
      case 'edit':
        this.beginEdit(first);
        break;
      case 'delete':
        this.askDelete();
        break;
      case 'style':
        this.openInspector('node');
        break;
      case 'tab-map':
        this.openInspector('map');
        break;
      case 'tab-theme':
        this.openInspector('map');
        this.inspector.scrollTo('themes');
        break;
      case 'tab-layout':
        this.openInspector('map');
        this.inspector.scrollTo('layouts');
        break;
      case 'tab-templates':
        this.openInspector('templates');
        break;
      case 'node-more':
        if (first) this.openMenu(anchor, this.nodeMenu(first), { align: 'right', up: this.mobile });
        break;
      case 'color-pop':
        this.openColorPop(anchor);
        break;
      case 'emoji-pop':
        this.openEmojiPop(anchor);
        break;
      case 'image-pop':
        this.openImageMenu(anchor);
        break;
      case 'note-pop':
        this.openInspector('node');
        this.inspector.focusField('note');
        break;
      case 'outline':
        this.setViewMode(this.viewMode === 'map' ? 'outline' : 'map');
        break;
      case 'close-sheet':
        this.setInspectorOpen(false);
        break;
    }
  }

  private async goBack(): Promise<void> {
    try {
      this.editor?.close(true);
      this.outline?.flush();
      await this.store.flush();
    } catch (e) {
      console.warn('[MindMapStudio] error al guardar antes de salir', e);
    }
    this.opts.onBack();
  }

  public toast(msg: string, ms = 2200): void {
    if (!this.toastEl) return;
    this.toastEl.textContent = msg;
    this.toastEl.hidden = false;
    this.toastEl.classList.remove('show');
    void this.toastEl.offsetWidth;
    this.toastEl.classList.add('show');
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toastEl.classList.remove('show');
      window.setTimeout(() => {
        if (!this.toastEl.classList.contains('show')) this.toastEl.hidden = true;
      }, 260);
    }, ms);
  }

  private updateUndoState(): void {
    const cmd = this.engine?.mm?.command;
    if (!cmd) return;
    const undo = this.root.querySelector('[data-act="undo"]') as HTMLButtonElement | null;
    const redo = this.root.querySelector('[data-act="redo"]') as HTMLButtonElement | null;
    if (undo) undo.disabled = cmd.activeHistoryIndex <= 0;
    if (redo) redo.disabled = cmd.activeHistoryIndex >= cmd.history.length - 1;
  }

  /* ===================================================================== */
  /*  Vista: mapa / esquema                                                 */
  /* ===================================================================== */
  public setViewMode(mode: 'map' | 'outline'): void {
    if (mode === this.viewMode) return;
    this.editor?.close(true);
    this.closeMenu();
    const outlineEl = this.root.querySelector('.mmx-outline') as HTMLElement;
    if (mode === 'outline') {
      this.viewMode = 'outline';
      this.root.dataset.view = 'outline';
      outlineEl.hidden = false;
      this.hideOverlays();
      this.outline.show();
    } else {
      this.outline.flush();
      this.viewMode = 'map';
      this.root.dataset.view = 'map';
      outlineEl.hidden = true;
      this.engine.nextRender(500).then(() => this.scheduleOverlays());
    }
    this.root.querySelectorAll('.mmx-seg [data-view]').forEach((b) => b.classList.toggle('on', (b as HTMLElement).dataset.view === mode));
    this.renderDock();
  }

  public getViewMode(): 'map' | 'outline' {
    return this.viewMode;
  }

  /* ===================================================================== */
  /*  Inspector / hoja inferior                                             */
  /* ===================================================================== */
  public setInspectorOpen(open: boolean): void {
    this.inspectorOpen = open;
    this.inspectorEl.dataset.open = String(open);
    this.root.dataset.sheet = String(open && this.mobile);
    this.root.dataset.panel = String(open);
    if (open) this.inspector.render();
    this.updateInsets();
    this.renderDock();
    if (open && this.mobile) {
      const n = this.getSelection()[0];
      window.setTimeout(() => {
        this.updateInsets();
        if (n) this.engine.ensureNodeVisible(n, this.inspectorEl.offsetHeight);
      }, 260);
    }
    this.scheduleOverlays();
  }

  public openInspector(tab: InspectorTab): void {
    this.inspector.setTab(tab);
    if (this.inspectorEl.dataset.open !== 'true') this.setInspectorOpen(true);
    else this.inspector.render();
  }

  /* ===================================================================== */
  /*  Dock móvil                                                            */
  /* ===================================================================== */
  private renderDock(): void {
    if (!this.dockEl) return;
    const sel = this.getSelection();
    const hasSel = sel.length > 0 && this.viewMode === 'map';
    const b = (act: string, ic: string, label: string, extra = '') => `<button class="mmx-dock-btn ${extra}" data-act="${act}" aria-label="${label}">${icon(ic, 22)}<span>${label}</span></button>`;
    if (this.viewMode === 'outline') {
      this.dockEl.innerHTML = b('outline', 'map', 'Mapa') + b('tab-templates', 'template', 'Plantillas') + b('search', 'search', 'Buscar') + b('more', 'more', 'Más');
    } else if (hasSel) {
      const single = sel.length === 1;
      this.dockEl.innerHTML =
        b('child', 'child', 'Hija', single ? '' : 'dim') +
        b('sibling', 'sibling', 'Hermana', single && !sel[0].isRoot ? '' : 'dim') +
        b('edit', 'edit', 'Editar', single ? '' : 'dim') +
        b('style', 'palette', 'Estilo') +
        b('node-more', 'more', 'Más');
    } else {
      this.dockEl.innerHTML = b('tab-layout', 'layout', 'Diseño') + b('tab-theme', 'theme', 'Tema') + b('tab-templates', 'template', 'Plantillas') + b('outline', 'outline', 'Esquema') + b('more', 'more', 'Más');
    }
    requestAnimationFrame(() => this.updateInsets());
  }

  /* ===================================================================== */
  /*  Superposiciones sobre el nodo (barra flotante y asas)                 */
  /* ===================================================================== */
  private scheduleOverlays(): void {
    if (this.overlayRaf || this.destroyed) return;
    this.overlayRaf = requestAnimationFrame(() => {
      this.overlayRaf = 0;
      this.updateOverlays();
    });
  }

  private hideOverlays(): void {
    this.toolbarEl.hidden = true;
    this.handleChild.hidden = true;
    this.handleSib.hidden = true;
  }

  private updateOverlays(): void {
    if (!this.engine?.mm) return;
    const sel = this.getSelection();
    const node = sel[0];
    if (sel.length !== 1 || !node || this.editor?.isOpen() || this.viewMode !== 'map' || !Number.isFinite(node.left)) {
      this.hideOverlays();
      return;
    }
    const v = this.engine.getViewState();
    if (!v) return;
    const s = v.scale;
    const x = node.left * s + v.x;
    const y = node.top * s + v.y;
    const w = (node.width || 80) * s;
    const h = (node.height || 36) * s;
    const W = this.stage.clientWidth;
    const H = this.stage.clientHeight;

    const offscreen = x + w < -20 || y + h < -20 || x > W + 20 || y > H + 20;
    if (offscreen) {
      this.hideOverlays();
      return;
    }

    // Asas "+" (hija y hermana)
    const layout = this.engine.settings.layout;
    const vertical = layout === 'organizationStructure' || layout === 'catalogOrganization';
    const isLeft = node.dir === 'left' || layout === 'logicalStructureLeft';
    const size = this.mobile ? 32 : 26;
    const half = size / 2;
    this.handleChild.hidden = false;
    this.handleSib.hidden = node.isRoot || node.isGeneralization;
    this.handleChild.style.width = this.handleChild.style.height = `${size}px`;
    this.handleSib.style.width = this.handleSib.style.height = `${size}px`;

    let cx: number;
    let cy: number;
    if (vertical) {
      cx = x + w / 2;
      cy = y + h + 16;
    } else if (isLeft) {
      cx = x - 18;
      cy = y + h / 2;
    } else {
      cx = x + w + 18;
      cy = y + h / 2;
    }
    this.handleChild.style.transform = `translate3d(${(cx - half).toFixed(1)}px, ${(cy - half).toFixed(1)}px, 0)`;

    const sx = vertical ? x + w + 18 : x + w / 2;
    const sy = vertical ? y + h / 2 : y + h + 16;
    this.handleSib.style.transform = `translate3d(${(sx - half).toFixed(1)}px, ${(sy - half).toFixed(1)}px, 0)`;

    // Barra flotante (solo escritorio)
    if (this.mobile) {
      this.toolbarEl.hidden = true;
      return;
    }
    if (!this.toolbarEl.dataset.ready) this.buildToolbar();
    this.toolbarEl.hidden = false;
    const tw = this.toolbarEl.offsetWidth || 340;
    const th = this.toolbarEl.offsetHeight || 40;
    let tx = x + w / 2 - tw / 2;
    tx = Math.max(8, Math.min(W - tw - 8 - this.engine.insets.right, tx));
    let ty = y - th - 12;
    if (ty < 8) ty = Math.min(H - th - 8, y + h + 36);
    this.toolbarEl.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
    this.toolbarEl.classList.toggle('is-root', Boolean(node.isRoot));
  }

  private buildToolbar(): void {
    const b = (act: string, ic: string, label: string, extra = '') => `<button class="mmx-tb ${extra}" data-act="${act}" title="${label}" aria-label="${label}">${icon(ic, 18)}</button>`;
    this.toolbarEl.dataset.ready = '1';
    this.toolbarEl.innerHTML =
      b('child', 'child', 'Añadir idea hija (Tab)') +
      b('sibling', 'sibling', 'Añadir idea hermana (Enter)', 'tb-sib') +
      b('edit', 'edit', 'Editar texto (F2)') +
      '<span class="mmx-tb-sep"></span>' +
      b('color-pop', 'palette', 'Color') +
      b('emoji-pop', 'emoji', 'Emoji') +
      b('image-pop', 'image', 'Foto') +
      b('note-pop', 'note', 'Nota') +
      '<span class="mmx-tb-sep"></span>' +
      b('node-more', 'more', 'Más opciones') +
      b('delete', 'trash', 'Eliminar (Supr)', 'danger tb-del');
  }

  /* ===================================================================== */
  /*  Zoom y minimapa                                                       */
  /* ===================================================================== */
  private updateZoomLabel(): void {
    if (!this.zoomLabel || !this.engine?.mm) return;
    const t = `${Math.round(this.engine.getScale() * 100)}%`;
    if (t !== this.lastZoomText) {
      this.lastZoomText = t;
      this.zoomLabel.textContent = t;
    }
  }

  public setMinimapVisible(show: boolean): void {
    this.minimapWrap.hidden = !show;
    if (show) this.scheduleMinimap();
  }

  private scheduleMinimap(): void {
    if (this.minimapWrap.hidden || this.miniRaf || this.destroyed) return;
    this.miniRaf = requestAnimationFrame(() => {
      this.miniRaf = 0;
      this.drawMinimap();
    });
  }

  private miniGeom: { minX: number; minY: number; k: number; ox: number; oy: number } | null = null;

  private drawMinimap(): void {
    const c = this.minimapCanvas;
    const ctx = c.getContext('2d');
    const b = this.engine?.getTreeBounds();
    const v = this.engine?.getViewState();
    if (!ctx || !b || !v) return;
    const W = c.width;
    const H = c.height;
    ctx.clearRect(0, 0, W, H);

    const sw = this.stage.clientWidth / v.scale;
    const sh = this.stage.clientHeight / v.scale;
    const vx = -v.x / v.scale;
    const vy = -v.y / v.scale;
    const minX = Math.min(b.minX, vx);
    const minY = Math.min(b.minY, vy);
    const maxX = Math.max(b.maxX, vx + sw);
    const maxY = Math.max(b.maxY, vy + sh);
    const pad = 8;
    const k = Math.min((W - pad * 2) / (maxX - minX || 1), (H - pad * 2) / (maxY - minY || 1));
    const ox = (W - (maxX - minX) * k) / 2;
    const oy = (H - (maxY - minY) * k) / 2;
    this.miniGeom = { minX, minY, k, ox, oy };

    for (const n of this.engine.allNodes()) {
      if (!Number.isFinite(n.left)) continue;
      ctx.fillStyle = this.engine.branchColor(n);
      ctx.globalAlpha = n.isRoot ? 1 : 0.85;
      const x = ox + (n.left - minX) * k;
      const y = oy + (n.top - minY) * k;
      ctx.fillRect(x, y, Math.max(2, (n.width || 60) * k), Math.max(1.5, (n.height || 24) * k));
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = this.engine.theme.accent;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    const rx = ox + (vx - minX) * k;
    const ry = oy + (vy - minY) * k;
    ctx.fillRect(rx, ry, sw * k, sh * k);
    ctx.strokeRect(rx, ry, sw * k, sh * k);
  }

  private bindMinimap(): void {
    let dragging = false;
    const go = (e: PointerEvent) => {
      const g = this.miniGeom;
      const v = this.engine?.getViewState();
      if (!g || !v) return;
      const r = this.minimapCanvas.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * this.minimapCanvas.width;
      const py = ((e.clientY - r.top) / r.height) * this.minimapCanvas.height;
      const wx = (px - g.ox) / g.k + g.minX;
      const wy = (py - g.oy) / g.k + g.minY;
      const area = this.engine.insets;
      const cx = (this.stage.clientWidth - area.right + area.left) / 2;
      const cy = (this.stage.clientHeight - area.bottom + area.top) / 2;
      this.engine.setView({ scale: v.scale, x: cx - wx * v.scale, y: cy - wy * v.scale }, 0);
    };
    this.minimapCanvas.addEventListener('pointerdown', (e) => {
      dragging = true;
      this.minimapCanvas.setPointerCapture(e.pointerId);
      go(e);
    });
    this.minimapCanvas.addEventListener('pointermove', (e) => {
      if (dragging) go(e);
    });
    const end = () => (dragging = false);
    this.minimapCanvas.addEventListener('pointerup', end);
    this.minimapCanvas.addEventListener('pointercancel', end);
  }

  /* ===================================================================== */
  /*  Menús emergentes                                                      */
  /* ===================================================================== */
  public openMenu(anchor: HTMLElement | { x: number; y: number }, items: MenuItem[], opts: { align?: 'left' | 'right'; up?: boolean } = {}): void {
    this.closeMenu();
    const menu = document.createElement('div');
    menu.className = 'mmx-menu mmx-ui';
    menu.setAttribute('role', 'menu');
    menu.innerHTML = items
      .map((it, i) => {
        if (it.sep) return '<div class="mmx-menu-sep"></div>';
        if (it.header) return `<div class="mmx-menu-head">${esc(it.header)}</div>`;
        return `<button class="mmx-menu-item ${it.danger ? 'danger' : ''}" role="menuitem" data-i="${i}" ${it.disabled ? 'disabled' : ''}>
          <span class="mmx-menu-ic">${it.icon ? icon(it.icon, 18) : ''}</span><span class="mmx-menu-lb">${esc(it.label || '')}</span>${it.kbd ? `<kbd>${esc(it.kbd)}</kbd>` : ''}
        </button>`;
      })
      .join('');
    this.root.appendChild(menu);
    this.menuEl = menu;

    const rootRect = this.root.getBoundingClientRect();
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    let x: number;
    let y: number;
    if (anchor instanceof HTMLElement) {
      const r = anchor.getBoundingClientRect();
      x = opts.align === 'right' ? r.right - mw : r.left;
      y = opts.up ? r.top - mh - 8 : r.bottom + 8;
    } else {
      x = anchor.x;
      y = anchor.y;
    }
    x = Math.max(rootRect.left + 8, Math.min(rootRect.right - mw - 8, x));
    y = Math.max(rootRect.top + 8, Math.min(rootRect.bottom - mh - 8, y));
    menu.style.left = `${x - rootRect.left}px`;
    menu.style.top = `${y - rootRect.top}px`;
    menu.classList.add('show');

    menu.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.mmx-menu-item') as HTMLElement | null;
      if (!btn || btn.hasAttribute('disabled')) return;
      const item = items[Number(btn.dataset.i)];
      this.closeMenu();
      item?.onClick?.();
    });
  }

  public closeMenu(): void {
    if (this.menuEl) {
      this.menuEl.remove();
      this.menuEl = null;
    }
    this.menuCleanup?.();
    this.menuCleanup = null;
  }

  private exportMenu(): MenuItem[] {
    const run = (k: ExportKind) => () => void this.doExport(k);
    return [
      { header: 'Imagen' },
      { label: 'Imagen PNG', icon: 'image', onClick: run('png') },
      { label: 'Vector SVG', icon: 'download', onClick: run('svg') },
      { header: 'Texto' },
      { label: 'Markdown (.md)', icon: 'outline', onClick: run('md') },
      { label: 'Texto con sangría (.txt)', icon: 'note', onClick: run('txt') },
      { header: 'Copia de seguridad' },
      { label: 'Archivo del mapa (.json)', icon: 'save', onClick: run('json') }
    ];
  }

  private moreMenu(): MenuItem[] {
    const items: MenuItem[] = [];
    if (this.mobile) {
      items.push({ label: this.viewMode === 'map' ? 'Ver como esquema' : 'Ver como mapa', icon: this.viewMode === 'map' ? 'outline' : 'map', onClick: () => this.setViewMode(this.viewMode === 'map' ? 'outline' : 'map') });
      items.push({ label: 'Presentar', icon: 'present', onClick: () => this.present() });
      items.push({ sep: true });
      items.push(...this.exportMenu());
      items.push({ sep: true });
    }
    items.push(
      { label: this.engine.studyMode ? 'Salir del modo estudio' : 'Modo estudio (ocultar ideas)', icon: 'eye', onClick: () => this.toggleStudyMode() },
      { label: 'Flashcards de todo el mapa…', icon: 'card', onClick: () => this.pickDeck((id, name) => this.createAllCards(id, name)) },
      { sep: true },
      { label: 'Guardar ahora', icon: 'save', kbd: 'Ctrl+S', onClick: () => void this.saveNow().then(() => this.toast('Mapa guardado')) },
      { label: 'Plantillas…', icon: 'template', onClick: () => this.openTemplateGallery(false) },
      { label: 'Importar archivo…', icon: 'import', onClick: () => this.importInput.click() },
      { label: 'Pegar un esquema…', icon: 'outline', onClick: () => this.openPasteOutline() },
      { sep: true },
      { label: 'Ajustar a la pantalla', icon: 'fit', kbd: 'Ctrl+0', onClick: () => this.engine.fit(true) },
      { label: 'Expandir todo', icon: 'expand', onClick: () => this.engine.expandAll() },
      { label: 'Contraer a nivel 1', icon: 'collapse', onClick: () => this.engine.collapseToLevel(1) },
      { label: 'Contraer a nivel 2', icon: 'collapse', onClick: () => this.engine.collapseToLevel(2) },
      { sep: true },
      { label: 'Atajos de teclado', icon: 'keyboard', onClick: () => this.openShortcuts() }
    );
    return items;
  }

  public nodeMenu(node: any): MenuItem[] {
    const root = Boolean(node.isRoot);
    const hasKids = Boolean(node.children?.length);
    const expanded = node.getData?.('expand') !== false;
    return [
      { label: 'Editar texto', icon: 'edit', kbd: 'F2', onClick: () => this.beginEdit(node) },
      { label: 'Añadir idea hija', icon: 'child', kbd: 'Tab', onClick: () => this.engine.addChild(node) },
      { label: 'Añadir idea hermana', icon: 'sibling', kbd: 'Enter', disabled: root, onClick: () => this.engine.addSibling(node) },
      { label: 'Insertar idea padre', icon: 'parent', disabled: root, onClick: () => this.engine.addParent(node) },
      { sep: true },
      { label: 'Resumen de la rama', icon: 'summary', disabled: root, onClick: () => this.engine.addSummary() },
      { label: 'Marco alrededor', icon: 'frame', disabled: root, onClick: () => this.engine.addFrame() },
      { label: 'Relacionar con otra idea', icon: 'relation', onClick: () => this.startRelation() },
      { label: hasKids ? (expanded ? 'Contraer rama' : 'Expandir rama') : 'Contraer rama', icon: expanded ? 'collapse' : 'expand', disabled: !hasKids, onClick: () => this.engine.toggleExpand(node) },
      { sep: true },
      { label: 'Foto…', icon: 'image', onClick: () => this.pickImage() },
      { label: 'Nota…', icon: 'note', onClick: () => { this.openInspector('node'); this.inspector.focusField('note'); } },
      { label: this.engine.isFocused() ? 'Salir del enfoque' : 'Enfocar esta rama', icon: 'focus', onClick: () => this.engine.focusBranch(this.engine.isFocused() ? null : node) },
      { label: 'Crear flashcard…', icon: 'card', onClick: () => this.openFlashcardMenu(node) },
      { sep: true },
      { label: 'Copiar', icon: 'copy', kbd: 'Ctrl+C', onClick: () => this.engine.copyNodes() },
      { label: 'Cortar', icon: 'cut', kbd: 'Ctrl+X', disabled: root, onClick: () => this.engine.cutNodes() },
      { label: 'Pegar dentro', icon: 'paste', disabled: !this.engine.hasClipboard(), onClick: () => this.engine.pasteNodes(node) },
      { label: 'Duplicar', icon: 'duplicate', kbd: 'Ctrl+D', disabled: root, onClick: () => this.engine.duplicateNode(node) },
      { sep: true },
      { label: 'Subir', icon: 'up', disabled: root, onClick: () => this.engine.moveUp(node) },
      { label: 'Bajar', icon: 'down', disabled: root, onClick: () => this.engine.moveDown(node) },
      { label: 'Subir de nivel', icon: 'outdent', disabled: root || (node.layerIndex ?? 0) <= 1, onClick: () => this.engine.promote(node) },
      { label: 'Bajar de nivel', icon: 'indent', disabled: root, onClick: () => this.engine.demote(node) },
      { sep: true },
      { label: 'Eliminar', icon: 'trash', kbd: 'Supr', danger: true, disabled: root, onClick: () => this.askDelete() }
    ];
  }

  private canvasMenu(): MenuItem[] {
    return [
      { label: 'Pegar', icon: 'paste', disabled: !this.engine.hasClipboard(), onClick: () => this.engine.pasteNodes(this.engine.getRoot()) },
      { label: 'Ajustar a la pantalla', icon: 'fit', onClick: () => this.engine.fit(true) },
      { label: 'Expandir todo', icon: 'expand', onClick: () => this.engine.expandAll() },
      { label: 'Plantillas…', icon: 'template', onClick: () => this.openTemplateGallery(false) },
      { label: 'Cambiar diseño…', icon: 'layout', onClick: () => this.openInspector('map') }
    ];
  }

  /* ===================================================================== */
  /*  Popovers rápidos: color, emoji, foto                                  */
  /* ===================================================================== */
  private popover(anchor: HTMLElement, html: string, onMount: (el: HTMLElement) => void): void {
    this.closeMenu();
    const pop = document.createElement('div');
    pop.className = 'mmx-menu mmx-pop mmx-ui';
    pop.innerHTML = html;
    this.root.appendChild(pop);
    this.menuEl = pop;
    const rootRect = this.root.getBoundingClientRect();
    const r = anchor.getBoundingClientRect();
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    let x = r.left + r.width / 2 - w / 2;
    let y = r.bottom + 10;
    if (y + h > rootRect.bottom - 8) y = r.top - h - 10;
    x = Math.max(rootRect.left + 8, Math.min(rootRect.right - w - 8, x));
    y = Math.max(rootRect.top + 8, y);
    pop.style.left = `${x - rootRect.left}px`;
    pop.style.top = `${y - rootRect.top}px`;
    pop.classList.add('show');
    onMount(pop);
  }

  private openColorPop(anchor: HTMLElement): void {
    const th = this.engine.theme;
    const sw = (color: string, k: string) => `<button class="mmx-sw" data-k="${k}" data-c="${color}" style="--c:${color}" aria-label="${color}"></button>`;
    const neutrals = ['#ffffff', '#f1f5f9', '#94a3b8', '#334155', '#0f172a'];
    const row = (title: string, k: string) => `
      <div class="mmx-pop-title">${title}</div>
      <div class="mmx-sw-row">${th.palette.map((c) => sw(c, k)).join('')}${neutrals.map((c) => sw(c, k)).join('')}<button class="mmx-sw auto" data-k="${k}" data-c="" title="Automático" aria-label="Automático">${icon('reset', 14)}</button></div>`;
    const presets: [string, string, string][] = [
      ['❗', 'Importante', '#ef4444'],
      ['💡', 'Idea', '#f59e0b'],
      ['❓', 'Duda', '#a855f7'],
      ['✅', 'Hecho', '#22c55e'],
      ['⭐', 'Clave', '#3b82f6']
    ];
    const presetRow = `<div class="mmx-pop-title">Estilos rápidos</div><div class="mmx-presets">${presets
      .map(([e, l, c]) => `<button class="mmx-preset" data-preset="${c}|${e}" style="--c:${c}"><span>${e}</span>${l}</button>`)
      .join('')}</div>`;
    this.popover(anchor, `<div class="mmx-pop-body">${presetRow}${row('Relleno de la idea', 'fillColor')}${row('Color de la rama', 'lineColor')}${row('Color del texto', 'color')}</div>`, (pop) => {
      pop.addEventListener('click', (e) => {
        const pr = (e.target as HTMLElement).closest('[data-preset]') as HTMLElement | null;
        if (pr) {
          const [c, em] = (pr.dataset.preset || '').split('|');
          this.applyStyle({ fillColor: c, color: '#ffffff', emoji: em, borderColor: c }, true);
          this.closeMenu();
          return;
        }
        const b = (e.target as HTMLElement).closest('.mmx-sw') as HTMLElement | null;
        if (!b) return;
        const k = b.dataset.k as string;
        const c = b.dataset.c || '';
        this.applyStyle({ [k]: c || null }, k === 'lineColor');
      });
    });
  }

  private openEmojiPop(anchor: HTMLElement): void {
    this.popover(anchor, `<div class="mmx-pop-body">${this.inspector.emojiGridHtml()}</div>`, (pop) => {
      pop.addEventListener('click', (e) => {
        const b = (e.target as HTMLElement).closest('[data-emoji]') as HTMLElement | null;
        if (!b) return;
        this.setEmoji(b.dataset.emoji || '');
        this.closeMenu();
      });
    });
  }

  private openImageMenu(anchor: HTMLElement): void {
    const n = this.getSelection()[0];
    const has = Boolean(n?.nodeData?.data?.image);
    this.openMenu(anchor, [
      { label: has ? 'Cambiar foto…' : 'Elegir una foto…', icon: 'image', onClick: () => this.pickImage() },
      { label: 'Tomar foto…', icon: 'camera', onClick: () => this.cameraInput.click() },
      { label: 'Desde un enlace…', icon: 'link', onClick: () => this.promptImageUrl() },
      ...(has ? ([{ sep: true }, { label: 'Quitar foto', icon: 'trash', danger: true, onClick: () => this.removeImage() }] as MenuItem[]) : [])
    ]);
  }

  /* ===================================================================== */
  /*  Operaciones sobre la selección                                        */
  /* ===================================================================== */
  public applyStyle(data: Record<string, any>, relayout = false, history = true): void {
    const sel = this.getSelection();
    if (!sel.length) {
      this.toast('Selecciona una idea primero');
      return;
    }
    this.engine.applyData(sel, data, { relayout, history });
    this.scheduleOverlays();
  }

  public setEmoji(emoji: string): void {
    this.applyStyle({ emoji: emoji || null }, true);
  }

  public pickImage(): void {
    if (!this.getSelection().length) {
      this.toast('Selecciona una idea para añadir la foto');
      return;
    }
    this.fileInput.value = '';
    this.fileInput.click();
  }

  public pickCamera(): void {
    if (!this.getSelection().length) {
      this.toast('Selecciona una idea para añadir la foto');
      return;
    }
    this.cameraInput.value = '';
    this.cameraInput.click();
  }

  private async onImagePicked(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    await this.attachImage(file);
  }

  private async attachImage(file: File | Blob, node?: any): Promise<void> {
    const targets = node ? [node] : this.getSelection();
    if (!targets.length) {
      this.toast('Selecciona una idea para añadir la foto');
      return;
    }
    try {
      this.toast('Procesando foto…', 1600);
      const img = await processImageFile(file);
      const size = fitImageSize(img.width, img.height, IMAGE_PRESETS.medium.w, IMAGE_PRESETS.medium.h);
      this.engine.applyData(targets, { image: img.dataUrl, imageSize: size, imageLost: null }, { relayout: true });
      this.inspector.render();
      this.scheduleOverlays();
    } catch (e) {
      console.warn('[MindMapStudio] imagen', e);
      this.toast('No se pudo usar esa imagen');
    }
  }

  public promptImageUrl(): void {
    dialogService.showPrompt({
      title: 'Foto desde un enlace',
      message: 'Pega la dirección de una imagen.',
      placeholder: 'https://…',
      confirmText: 'Añadir',
      onConfirm: async (url) => {
        const u = (url || '').trim();
        if (!u) return;
        try {
          const { processImageSource } = await import('./images');
          const img = await processImageSource(u);
          const size = fitImageSize(img.width, img.height, IMAGE_PRESETS.medium.w, IMAGE_PRESETS.medium.h);
          this.engine.applyData(this.getSelection(), { image: img.dataUrl, imageSize: size }, { relayout: true });
          this.inspector.render();
        } catch {
          this.toast('No se pudo cargar esa imagen (el sitio puede bloquearla)');
        }
      }
    });
  }

  public removeImage(): void {
    this.engine.applyData(this.getSelection(), { image: null, imageSize: null, imageLost: null }, { relayout: true });
    this.inspector.render();
  }

  public setImageSize(preset: ImagePresetId): void {
    const p = IMAGE_PRESETS[preset];
    const sel = this.getSelection();
    sel.forEach((n) => {
      const cur = n.nodeData?.data?.imageSize;
      if (!cur) return;
      const ratio = cur.width / Math.max(1, cur.height);
      const size = fitImageSize(p.w * ratio, p.h, p.w, p.h);
      this.engine.applyData([n], { imageSize: size }, { relayout: true });
    });
    this.inspector.render();
  }

  public openLink(url: string): void {
    let u = url.trim();
    if (!u) return;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = `https://${u}`;
    window.open(u, '_blank', 'noopener,noreferrer');
  }

  public startRelation(): void {
    if (this.engine.startAssociativeLine()) this.toast('Toca la idea con la que quieres relacionarla', 3400);
    else this.toast('Selecciona una idea primero');
  }

  public askDelete(): void {
    const nodes = this.getSelection().filter((n) => !n.isRoot);
    if (!nodes.length) {
      if (this.getSelection().some((n) => n.isRoot)) this.toast('La idea central no se puede eliminar');
      return;
    }
    const countKids = (n: any): number => (n.nodeData?.children || []).reduce((s: number, c: any) => s + 1 + countKidsData(c), 0);
    const countKidsData = (d: any): number => (d.children || []).reduce((s: number, c: any) => s + 1 + countKidsData(c), 0);
    const total = nodes.reduce((s, n) => s + countKids(n), 0);
    const label = nodes.length === 1 ? `«${esc(stripToPlain(String(nodes[0].nodeData?.data?.text || 'Idea sin texto')).slice(0, 60) || 'Idea sin texto')}»` : `${nodes.length} ideas`;
    const extra = total > 0 ? ` Se eliminarán también ${total} ${total === 1 ? 'idea' : 'ideas'} que cuelgan de ella.` : '';
    nativeService.triggerHaptics('medium');
    dialogService.showConfirm({
      title: '¿Estás seguro?',
      message: `Vas a eliminar ${label}.${extra} Puedes deshacerlo con Ctrl+Z.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      isDanger: true,
      onConfirm: () => {
        this.engine.removeNodes(nodes);
        this.engine.clearSelection();
        this.toast('Idea eliminada');
      }
    });
  }

  /* ===================================================================== */
  /*  Flashcards desde el mapa                                              */
  /* ===================================================================== */
  private openFlashcardMenu(node: any): void {
    const hasKids = Boolean(node.nodeData?.children?.length);
    const anchor = this.menuAnchor();
    this.openMenu(anchor, [
      { header: 'Crear flashcards' },
      { label: 'De esta idea', icon: 'card', onClick: () => this.pickDeck((id, name) => this.createCardsFrom(node, 'this', id, name)) },
      { label: 'De cada una de sus ramas', icon: 'grid', disabled: !hasKids, onClick: () => this.pickDeck((id, name) => this.createCardsFrom(node, 'children', id, name)) }
    ]);
  }

  private menuAnchor(): { x: number; y: number } {
    const r = this.root.getBoundingClientRect();
    return { x: r.left + r.width / 2 - 120, y: r.top + r.height / 2 - 80 };
  }

  public openFlashcards(): void {
    const n = this.getSelection()[0];
    if (n) this.openFlashcardMenu(n);
    else this.toast('Selecciona una idea primero');
  }

  private cardPieces(nodeData: any): { front: string; back: string } | null {
    const d = nodeData?.data || {};
    const front = String(d.text || '').trim();
    if (!front) return null;
    const kids: any[] = nodeData.children || [];
    let back = '';
    if (kids.length) back = kids.map((c) => subtreeText(c as MapNodeData).split('\n').map((l) => (l.startsWith('  ') ? l : `• ${l}`)).join('\n')).join('\n');
    if (d.note) back = back ? `${back}\n\n${d.note}` : String(d.note);
    if (!back.trim()) return null;
    return { front, back: back.trim() };
  }

  private pickDeck(cb: (deckId: string, name: string) => void): void {
    const decks = deckService.getOnlyDecks().slice().sort((a, b) => a.name.localeCompare(b.name));
    const body = document.createElement('div');
    body.className = 'mmx-decklist';
    body.innerHTML =
      `<button class="mmx-deck new" data-new="1">${icon('plus', 18)}<span>Nuevo mazo «${esc(this.opts.topicTitle || 'Mapa mental')}»</span></button>` +
      decks.map((d) => `<button class="mmx-deck" data-id="${esc(d.id)}"><span class="mmx-deck-ic">${esc(d.icon || '🗂️')}</span><span>${esc(d.name)}</span></button>`).join('');
    const m = this.openModal({ title: 'Elige un mazo', subtitle: 'Las tarjetas se añadirán a este mazo.', body });
    body.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('.mmx-deck') as HTMLElement | null;
      if (!b) return;
      m.close();
      if (b.dataset.new) {
        const name = `Mapa: ${this.opts.topicTitle || 'Mapa mental'}`;
        const deck = deckService.createDeck({ name, icon: '🧠' });
        cb(deck.id, deck.name);
      } else {
        const d = decks.find((x) => x.id === b.dataset.id);
        if (d) cb(d.id, d.name);
      }
    });
  }

  private createCardsFrom(node: any, mode: 'this' | 'children', deckId: string, deckName: string): void {
    const sources: any[] = mode === 'this' ? [node.nodeData] : node.nodeData?.children || [];
    let count = 0;
    let firstId = '';
    for (const src of sources) {
      const p = this.cardPieces(src);
      if (!p) continue;
      const card = deckService.createCard({ deckId, type: 'standard', front: p.front, back: p.back });
      if (!firstId) firstId = card.id;
      count++;
    }
    if (!count) {
      this.toast('Esa idea necesita ramas o una nota para convertirse en tarjeta');
      return;
    }
    if (mode === 'this' && firstId) this.engine.applyData([node], { flashcardId: firstId }, { relayout: true });
    this.toast(`${count} ${count === 1 ? 'tarjeta creada' : 'tarjetas creadas'} en «${deckName}»`, 3000);
  }

  public toggleStudyMode(): void {
    const on = !this.engine.studyMode;
    this.engine.setStudyMode(on);
    this.root.dataset.study = String(on);
    this.root.querySelector('[data-act="study"]')?.classList.toggle('on', on);
    this.toast(on ? 'Modo estudio: toca una idea para revelarla' : 'Modo estudio desactivado', 2600);
  }

  private createAllCards(deckId: string, deckName: string): void {
    let count = 0;
    const walk = (n: any, isRoot: boolean) => {
      if (!isRoot) {
        const p = this.cardPieces(n);
        if (p) {
          deckService.createCard({ deckId, type: 'standard', front: p.front, back: p.back });
          count++;
        }
      }
      (n.children || []).forEach((c: any) => walk(c, false));
    };
    walk(this.engine.getDoc().root, true);
    this.toast(count ? `${count} tarjetas creadas en «${deckName}»` : 'No hay ideas con detalles para convertir en tarjetas', 3200);
  }

  public openShortcuts(): void {
    const rows: [string, string][] = [
      ['Doble clic · F2', 'Editar la idea'],
      ['Tab', 'Añadir idea hija'],
      ['Enter', 'Añadir idea hermana'],
      ['Mayús + Tab', 'Hermana desde el editor'],
      ['Supr', 'Eliminar (con confirmación)'],
      ['Ctrl + C / X / V', 'Copiar, cortar, pegar'],
      ['Ctrl + D', 'Duplicar rama'],
      ['Ctrl + Z / Y', 'Deshacer / rehacer'],
      ['Ctrl + F', 'Buscar'],
      ['Ctrl + 0', 'Ajustar a la pantalla'],
      ['Ctrl + + / −', 'Acercar / alejar'],
      ['Ctrl + B / I / M', 'Negrita, cursiva, fórmula (al escribir)'],
      ['Esc', 'Salir del editor, enfoque o modo estudio']
    ];
    const body = document.createElement('div');
    body.className = 'mmx-keys';
    body.innerHTML = rows.map(([k, d]) => `<div><kbd>${esc(k)}</kbd><span>${esc(d)}</span></div>`).join('');
    this.openModal({ title: 'Atajos de teclado', subtitle: 'Escribe sobre una idea seleccionada para empezar a editarla.', body });
  }

  /* ===================================================================== */
  /*  Plantillas, importación, pegado de esquemas                           */
  /* ===================================================================== */
  public openTemplateGallery(firstTime: boolean): void {
    const body = document.createElement('div');
    body.className = 'mmx-tpl-grid';
    body.innerHTML = TEMPLATES.map(
      (t) => `<button class="mmx-tpl" data-id="${t.id}"><span class="mmx-tpl-emoji">${t.emoji}</span><span class="mmx-tpl-name">${esc(t.name)}</span><span class="mmx-tpl-desc">${esc(t.description)}</span></button>`
    ).join('');
    const m = this.openModal({
      title: firstTime ? 'Empieza tu mapa' : 'Plantillas',
      subtitle: firstTime ? 'Elige una estructura o empieza en blanco. Siempre podrás cambiarla.' : 'Aplicar una plantilla reemplaza el contenido actual (puedes deshacerlo).',
      body,
      wide: true
    });
    body.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('.mmx-tpl') as HTMLElement | null;
      if (!b) return;
      m.close();
      this.applyTemplate(b.dataset.id || 'blank', firstTime);
    });
  }

  public applyTemplate(id: string, skipConfirm = false): void {
    const doIt = () => {
      const doc = docFromTemplate(id, this.opts.topicTitle || 'Mi mapa mental');
      this.replaceMap(doc.root, doc.settings.layout);
      this.toast('Plantilla aplicada');
    };
    const count = this.engine.allNodes().length;
    if (skipConfirm || count <= 4) return doIt();
    dialogService.showConfirm({
      title: 'Reemplazar el mapa',
      message: 'La plantilla sustituirá el contenido actual. Podrás deshacerlo con Ctrl+Z.',
      confirmText: 'Aplicar plantilla',
      onConfirm: doIt
    });
  }

  /** Reemplaza todo el contenido conservando el historial (un solo paso de deshacer). */
  public replaceMap(root: MapNodeData, layout?: string): void {
    this.editor?.close(true);
    this.engine.clearSelection();
    const data = normalizeTree(root);
    this.engine.mm.updateData(data);
    if (layout && layout !== this.engine.settings.layout) this.engine.updateSettings({ layout });
    this.engine.nextRender(700).then(() => this.engine.fit(true));
    this.scheduleSave();
    if (this.viewMode === 'outline') this.outline.show();
  }

  private async onImportPicked(): Promise<void> {
    const file = this.importInput.files?.[0];
    this.importInput.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      let doc: MapDoc | null = null;
      if (/\.json$/i.test(file.name) || text.trim().startsWith('{')) {
        doc = docFromImport(JSON.parse(text));
      } else {
        const tree = textToTree(text, this.opts.topicTitle || 'Mapa importado');
        if (tree) doc = { v: 2, root: tree, settings: { ...DEFAULT_SETTINGS }, updatedAt: Date.now() };
      }
      if (!doc) throw new Error('formato');
      const d = doc;
      dialogService.showConfirm({
        title: 'Importar mapa',
        message: `Se reemplazará el contenido actual por «${esc(file.name)}». Podrás deshacerlo.`,
        confirmText: 'Importar',
        onConfirm: () => {
          this.replaceMap(d.root, d.settings.layout);
          if (/\.json$/i.test(file.name) && d.settings) this.engine.updateSettings({ ...d.settings });
          this.toast('Mapa importado');
        }
      });
    } catch {
      this.toast('No se pudo leer ese archivo');
    }
  }

  public openPasteOutline(): void {
    const body = document.createElement('div');
    body.className = 'mmx-paste';
    body.innerHTML = `
      <textarea rows="9" placeholder="Tema&#10;  Idea 1&#10;    Detalle&#10;  Idea 2&#10;&#10;También sirven listas con guiones, números o títulos de Markdown."></textarea>
      <div class="mmx-paste-actions">
        <button class="mmx-btn" data-a="add">Añadir a la idea seleccionada</button>
        <button class="mmx-btn primary" data-a="new">Crear mapa nuevo</button>
      </div>`;
    const m = this.openModal({ title: 'Pegar un esquema', subtitle: 'Cada línea será una idea; la sangría define la jerarquía.', body });
    const ta = body.querySelector('textarea') as HTMLTextAreaElement;
    setTimeout(() => ta.focus(), 50);
    body.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('[data-a]') as HTMLElement | null;
      if (!b) return;
      const tree = textToTree(ta.value, this.opts.topicTitle || 'Mi mapa');
      if (!tree) {
        this.toast('Escribe o pega algún texto');
        return;
      }
      m.close();
      if (b.dataset.a === 'new') this.replaceMap(tree);
      else this.insertForestUnder(this.getSelection()[0] || this.engine.getRoot(), textToForest(ta.value));
    });
  }

  /** Inserta ideas (con su jerarquía) como hijas de un nodo */
  private insertForestUnder(node: any, forest: MapNodeData[]): void {
    if (!node || !forest.length) return;
    this.engine.mm.execCommand('INSERT_MULTI_CHILD_NODE', [node], normalizeForest(forest));
    this.toast(`${forest.length === 1 ? 'Idea añadida' : 'Ideas añadidas'}`);
  }

  /* ===================================================================== */
  /*  Pegar y soltar                                                        */
  /* ===================================================================== */
  private onPaste(e: ClipboardEvent): void {
    if (this.destroyed || !this.engine?.mm || this.viewMode !== 'map') return;
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (document.querySelector('.mmx-modal')) return;
    const dt = e.clipboardData;
    if (!dt) return;

    const imageFile = Array.from(dt.files || []).find((f) => f.type.startsWith('image/'));
    if (imageFile) {
      e.preventDefault();
      const sel = this.getSelection();
      if (!sel.length) {
        this.toast('Selecciona una idea para pegar la foto');
        return;
      }
      void this.attachImage(imageFile);
      return;
    }

    const text = dt.getData('text/plain');
    const target = this.getSelection()[0] || this.engine.getRoot();
    if (!text || text.trim() === this.lastCopiedText) {
      if (this.engine.hasClipboard()) {
        e.preventDefault();
        this.engine.pasteNodes(target);
      }
      return;
    }
    e.preventDefault();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length <= 1) {
      this.engine.addChild(target, { text: text.trim(), edit: false });
      return;
    }
    this.insertForestUnder(target, textToForest(text));
  }

  private onDrop(e: DragEvent): void {
    const file = Array.from(e.dataTransfer?.files || []).find((f) => f.type.startsWith('image/'));
    if (!file) return;
    e.preventDefault();
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const uid = (el?.closest('.mmx-node') as HTMLElement | null)?.dataset.uid;
    const node = uid ? this.engine.findNode(uid) : this.getSelection()[0];
    if (!node) {
      this.toast('Suelta la foto sobre una idea');
      return;
    }
    this.engine.selectNode(node);
    void this.attachImage(file, node);
  }

  /* ===================================================================== */
  /*  Pulsación larga                                                       */
  /* ===================================================================== */
  private onPointerDown(e: PointerEvent): void {
    if (e.pointerType !== 'touch') return;
    const el = e.target as HTMLElement;
    const nodeEl = el.closest('.mmx-node') as HTMLElement | null;
    if (!nodeEl) return;
    this.cancelLongPress();
    const uid = nodeEl.dataset.uid || '';
    const x = e.clientX;
    const y = e.clientY;
    this.longPress = {
      x,
      y,
      timer: window.setTimeout(() => {
        this.longPress = null;
        const node = this.engine.findNode(uid);
        if (!node) return;
        nativeService.triggerHaptics('medium');
        this.engine.selectNode(node);
        this.openMenu({ x, y: y - 40 }, this.nodeMenu(node));
      }, 520)
    };
  }

  private cancelLongPress(): void {
    if (this.longPress) {
      window.clearTimeout(this.longPress.timer);
      this.longPress = null;
    }
  }

  /* ===================================================================== */
  /*  Búsqueda                                                              */
  /* ===================================================================== */
  private openSearch(): void {
    if (this.viewMode === 'outline') this.setViewMode('map');
    this.searchBar.hidden = false;
    this.root.dataset.search = 'true';
    this.searchInput.focus();
    this.searchInput.select();
  }

  private closeSearch(): void {
    this.searchBar.hidden = true;
    this.root.dataset.search = 'false';
    this.searchInput.value = '';
    this.searchHits = [];
    this.searchIndex = -1;
    this.searchCount.textContent = '';
    this.applySearchHighlight();
  }

  private runSearch(): void {
    const q = this.searchInput.value.trim().toLowerCase();
    this.searchHits = [];
    this.searchIndex = -1;
    if (q) {
      const walk = (n: any) => {
        const text = stripToPlain(String(n?.data?.text || '')).toLowerCase();
        const note = String(n?.data?.note || '').toLowerCase();
        const tags = Array.isArray(n?.data?.tags) ? n.data.tags.join(' ').toLowerCase() : '';
        if (text.includes(q) || note.includes(q) || tags.includes(q)) this.searchHits.push(n.data.uid);
        (n?.children || []).forEach(walk);
      };
      walk(this.engine.getDoc().root);
    }
    this.searchCount.textContent = q ? (this.searchHits.length ? `${this.searchHits.length} resultado${this.searchHits.length === 1 ? '' : 's'}` : 'Sin resultados') : '';
    this.applySearchHighlight();
    if (this.searchHits.length) this.searchStep(1);
  }

  private async searchStep(dir: number): Promise<void> {
    if (!this.searchHits.length) return;
    this.searchIndex = (this.searchIndex + dir + this.searchHits.length) % this.searchHits.length;
    const uid = this.searchHits[this.searchIndex];
    const node = await this.engine.reveal(uid);
    if (!node) return;
    this.searchCount.textContent = `${this.searchIndex + 1} de ${this.searchHits.length}`;
    this.engine.selectNode(node);
    this.engine.centerOnNode(node, Math.max(this.engine.getScale(), 0.7));
    this.applySearchHighlight();
  }

  private applySearchHighlight(): void {
    if (!this.engine?.mm) return;
    const set = new Set(this.searchHits);
    const current = this.searchHits[this.searchIndex];
    this.engine.allNodes().forEach((n) => {
      const g = n.group?.node as SVGElement | undefined;
      if (!g) return;
      const uid = n.nodeData?.data?.uid;
      g.classList.toggle('mmx-hit', set.has(uid));
      g.classList.toggle('mmx-hit-current', uid === current);
      g.classList.toggle('mmx-dim', set.size > 0 && !set.has(uid));
    });
  }

  /* ===================================================================== */
  /*  Presentación y exportación                                            */
  /* ===================================================================== */
  private present(): void {
    this.editor?.close(true);
    this.engine.clearSelection();
    this.hideOverlays();
    this.toast('Presentación: usa ← → o toca para avanzar · Esc para salir', 3600);
    this.engine.startPresentation();
  }

  private async doExport(kind: ExportKind): Promise<void> {
    try {
      this.toast('Preparando el archivo…', 1800);
      this.outline?.flush();
      await exportMap(this.engine, kind, this.opts.topicTitle || 'mapa-mental');
      this.toast('Archivo listo');
    } catch (e) {
      console.warn('[MindMapStudio] exportación', e);
      this.toast('No se pudo exportar el mapa');
    }
  }

  /* ===================================================================== */
  /*  Modales                                                               */
  /* ===================================================================== */
  public openModal(opts: { title: string; subtitle?: string; body: HTMLElement; wide?: boolean }): { el: HTMLElement; close: () => void } {
    const wrap = document.createElement('div');
    wrap.className = 'mmx-modal mmx-ui';
    wrap.innerHTML = `
      <div class="mmx-modal-card ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(opts.title)}">
        <div class="mmx-modal-head">
          <div><h3>${esc(opts.title)}</h3>${opts.subtitle ? `<p>${esc(opts.subtitle)}</p>` : ''}</div>
          <button class="mmx-ib" data-modal-close aria-label="Cerrar">${icon('close')}</button>
        </div>
        <div class="mmx-modal-body"></div>
      </div>`;
    (wrap.querySelector('.mmx-modal-body') as HTMLElement).appendChild(opts.body);
    this.root.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('show'));
    const close = () => {
      wrap.classList.remove('show');
      window.setTimeout(() => wrap.remove(), 180);
    };
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap || (e.target as HTMLElement).closest('[data-modal-close]')) close();
    });
    return { el: wrap, close };
  }

  private closeTopModal(): void {
    const m = this.root.querySelector('.mmx-modal:last-of-type [data-modal-close]') as HTMLElement | null;
    m?.click();
  }

  /* ===================================================================== */
  /*  Utilidades que usa el inspector                                       */
  /* ===================================================================== */
  public getThemeById(id: string) {
    return THEME_BY_ID[id];
  }

  public getTitle(): string {
    return this.opts.topicTitle;
  }

  public getRootEl(): HTMLElement {
    return this.root;
  }

  public getEditor(): NodeEditor {
    return this.editor;
  }

  /* ===================================================================== */
  /*  Destrucción                                                           */
  /* ===================================================================== */
  public destroy(): void {
    if (this.destroyed) return;
    try {
      this.editor?.close(true);
      this.outline?.flush();
      this.store.flushSync();
    } catch {
      /* ignore */
    }
    this.destroyed = true;
    window.clearTimeout(this.toastTimer);
    window.clearTimeout(this.viewSaveTimer);
    window.clearTimeout(this.searchTimer);
    cancelAnimationFrame(this.overlayRaf);
    cancelAnimationFrame(this.miniRaf);
    cancelAnimationFrame(this.resizeRaf);
    this.cancelLongPress();
    this.resizeObs?.disconnect();
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    this.closeMenu();
    try {
      this.editor?.destroy();
    } catch {
      /* ignore */
    }
    try {
      this.engine?.destroy();
    } catch {
      /* ignore */
    }
    this.store.destroy();
    this.root?.remove();
  }
}
