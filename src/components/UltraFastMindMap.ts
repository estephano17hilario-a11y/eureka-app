import MindMap from 'simple-mind-map';
import { Preferences } from '@capacitor/preferences';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { deckService } from '../services/deck.service';
import { activeStudyService } from '../services/active-study.service';
import { katexService } from '../services/katex.service';
import { openScientificFormulaAssistant } from './ScientificFormulaAssistant';
import type { Flashcard } from '../types/flashcard';

export interface MindMapConfig {
  storageKey?: string;
  topicId?: string;
  topicTitle?: string;
  initialData?: any;
  onSave?: (data: any) => void;
  onBack?: () => void;
}

const DEFAULT_MAP_DATA = {
  data: {
    text: 'Idea Principal'
  },
  children: [
    {
      data: { text: 'Subtema A' },
      children: []
    },
    {
      data: { text: 'Subtema B' },
      children: []
    }
  ]
};

const COLOR_PRESETS: Record<string, { fill: string; border: string; text: string }> = {
  blue: { fill: '#0c4a6e', border: '#38bdf8', text: '#f0f9ff' },
  purple: { fill: '#581c87', border: '#c084fc', text: '#faf5ff' },
  emerald: { fill: '#064e3b', border: '#34d399', text: '#ecfdf5' },
  amber: { fill: '#78350f', border: '#fbbf24', text: '#fffbeb' },
  rose: { fill: '#831843', border: '#f472b6', text: '#fff1f2' },
  dark: { fill: '#1e293b', border: '#64748b', text: '#f8fafc' }
};

/**
 * Componente UltraFastMindMap (Suite Profesional de Esquemas y Mapas Mentales)
 * Diseñado con las directivas de optimización móvil híbrida para WebViews de gama ultra-baja en Android e iOS,
 * atajos de teclado completos (Tab, Enter, Delete, Ctrl+Z), paletas de color, cambio de esquemas en caliente,
 * visor integrado de flashcards del repaso y cero texto en chino.
 */
export class UltraFastMindMap {
  private container: HTMLElement;
  private mindMapInstance: any = null;
  private config: MindMapConfig;
  private activeNode: any = null;
  private saveDebounceTimer: number | null = null;
  private isDestroyed: boolean = false;
  private keyboardListenerHandle: any = null;
  private currentLayout: string = 'logicalStructure';

  constructor(container: HTMLElement, config: MindMapConfig = {}) {
    this.container = container;
    this.config = {
      storageKey: config.storageKey || (config.topicId ? `eureka_mindmap_topic_${config.topicId}` : 'eureka_mindmap_autosave_v1'),
      topicId: config.topicId,
      topicTitle: config.topicTitle || 'Mapa Mental Interactivo',
      initialData: config.initialData || DEFAULT_MAP_DATA,
      onSave: config.onSave,
      onBack: config.onBack
    };
  }

  /**
   * Obtiene las flashcards asociadas a este tema
   */
  private getTopicFlashcards(): Flashcard[] {
    if (!this.config.topicId) return [];
    const topic = activeStudyService.getTopicById(this.config.topicId);
    const cardsTopic = deckService.getCardsByDeck(this.config.topicId, true);
    const cardsDeck = topic && topic.deckId ? deckService.getCardsByDeck(topic.deckId, false) : [];
    const merged = [...cardsTopic, ...cardsDeck];
    return merged.filter((c, idx, self) => self.findIndex((x) => x.id === c.id) === idx);
  }

  /**
   * 1. ARQUITECTURA E INICIALIZACIÓN SÚPER LIGERA
   */
  public mount(): void {
    const flashcards = this.getTopicFlashcards();

    this.container.innerHTML = `
      <div class="mindmap-viewport-wrapper">
        <!-- 1. Top Action Header Completo ($10M Studio) -->
        <header class="mindmap-top-bar">
          <div class="top-bar-left">
            <button class="mindmap-touch-btn" id="btn-map-back" title="Volver al estudio" aria-label="Volver">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div class="top-bar-title-wrap">
              <span class="mindmap-top-title">${escapeHtml(this.config.topicTitle || 'Mapa Mental')}</span>
              <span class="mindmap-save-indicator" id="map-save-status">Guardado ✓</span>
            </div>
          </div>

          <!-- Selector de Tipo de Esquema en Caliente -->
          <div class="mindmap-pro-controls-group">
            <select id="select-map-layout" class="mindmap-select-pill" title="Cambiar tipo de estructura">
              <option value="logicalStructure" ${this.currentLayout === 'logicalStructure' ? 'selected' : ''}>🌲 Estructura Lógica (Izq ➔ Der)</option>
              <option value="mindMap" ${this.currentLayout === 'mindMap' ? 'selected' : ''}>🧠 Mapa Mental Radial</option>
              <option value="organizationStructure" ${this.currentLayout === 'organizationStructure' ? 'selected' : ''}>🏛️ Organigrama Vertical</option>
              <option value="catalogOrganization" ${this.currentLayout === 'catalogOrganization' ? 'selected' : ''}>📑 Catálogo Organizativo</option>
              <option value="timeline" ${this.currentLayout === 'timeline' ? 'selected' : ''}>⏳ Línea de Tiempo</option>
              <option value="fishbone" ${this.currentLayout === 'fishbone' ? 'selected' : ''}>🐟 Espina de Pescado</option>
            </select>

            <!-- Paleta de Colores Rápida para el Nodo Seleccionado -->
            <div class="mindmap-color-bar" id="map-color-palette" title="Colorear el concepto seleccionado">
              <button class="color-dot-btn" data-color="blue" style="background:#0ea5e9;" title="Azul Cyan"></button>
              <button class="color-dot-btn" data-color="purple" style="background:#a855f7;" title="Violeta Cyber"></button>
              <button class="color-dot-btn" data-color="emerald" style="background:#10b981;" title="Esmeralda Bio"></button>
              <button class="color-dot-btn" data-color="amber" style="background:#f59e0b;" title="Ámbar"></button>
              <button class="color-dot-btn" data-color="rose" style="background:#ec4899;" title="Rosa Neón"></button>
              <button class="color-dot-btn" data-color="dark" style="background:#334155;" title="Pizarra"></button>
            </div>

            <!-- Botón Flashcards del Repaso -->
            <button class="mindmap-top-action-chip badge-glow" id="btn-map-view-flashcards" title="Ver flashcards creadas en este tema">
              <span>🎴 Flashcards</span>
              <span id="map-flashcards-count-badge">(${flashcards.length})</span>
            </button>

            <!-- Atajos de Teclado -->
            <button class="mindmap-top-action-chip" id="btn-map-shortcuts" title="Ver atajos de teclado (Tab, Enter, Delete...)">
              ⌨️ Atajos
            </button>

            <!-- Exportar JSON -->
            <button class="mindmap-top-action-chip" id="btn-map-export" title="Descargar copia del esquema">
              💾 Exportar
            </button>
          </div>

          <div class="top-bar-right">
            <button class="mindmap-touch-btn" id="btn-map-undo" title="Deshacer (Ctrl+Z)" aria-label="Deshacer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </button>
            <button class="mindmap-touch-btn" id="btn-map-redo" title="Rehacer (Ctrl+Y)" aria-label="Rehacer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
            </button>
            <button class="mindmap-touch-btn" id="btn-map-fit" title="Ajustar al centro (Espacio / F)" aria-label="Ajustar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9h6v6"/></svg>
            </button>
          </div>
        </header>

        <!-- 2. Lienzo SVG Acelerado por GPU (100vw / 100vh) -->
        <div id="mindmap-render-canvas" class="mindmap-canvas-container"></div>

        <!-- 3. Bottom Action Dock (Botones táctiles de gran tamaño 48px+ para pulgares) -->
        <footer class="mindmap-bottom-dock">
          <button class="dock-action-btn" id="btn-node-child" disabled title="Añadir subnodo (Tab)">
            <span class="dock-icon">➕</span>
            <span class="dock-label">Hijo (Tab)</span>
          </button>
          <button class="dock-action-btn" id="btn-node-sibling" disabled title="Añadir concepto paralelo (Enter)">
            <span class="dock-icon">🌿</span>
            <span class="dock-label">Hermano (Enter)</span>
          </button>
          <button class="dock-action-btn" id="btn-node-edit" disabled title="Editar texto (F2)">
            <span class="dock-icon">✏️</span>
            <span class="dock-label">Editar</span>
          </button>
          <button class="dock-action-btn dock-btn-danger" id="btn-node-delete" disabled title="Eliminar nodo (Supr / Backspace)">
            <span class="dock-icon">🗑️</span>
            <span class="dock-label">Borrar</span>
          </button>
        </footer>

        <!-- 4. Overlay de Edición Antiteclado con Asistente Científico KaTeX -->
        <div class="mindmap-edit-overlay" id="mindmap-edit-sheet" style="display: none;">
          <div class="edit-sheet-panel">
            <div class="edit-sheet-header">
              <span style="font-weight:800; font-size:1.05rem; color:#fff;">Editar Concepto</span>
              <div style="display:flex; align-items:center; gap:8px;">
                <button type="button" class="figma-btn-white-pill" id="btn-node-sheet-katex" style="padding:4px 10px; font-size:0.75rem; border-color:rgba(56,189,248,0.4); color:#38bdf8;">
                  📐 Fórmulas KaTeX
                </button>
                <button id="btn-sheet-close" class="btn-sheet-close" aria-label="Cerrar">✕</button>
              </div>
            </div>
            <textarea id="input-sheet-text" rows="3" placeholder="Escribe el concepto..." autocomplete="off"></textarea>
            <div class="edit-sheet-actions">
              <button id="btn-sheet-cancel" class="sheet-btn-secondary">Cancelar</button>
              <button id="btn-sheet-save" class="sheet-btn-primary">Listo ✓</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindDOMEvents();
    this.bindKeyboardShortcuts();

    // Inicialización diferida (Lazy Initialization)
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => this.lazyInitEngine());
    } else {
      setTimeout(() => this.lazyInitEngine(), 60);
    }
  }

  /**
   * Carga de persistencia e instanciación de simple-mind-map con opciones optimizadas para bajo consumo
   * y localización 100% en español (cero caracteres residuales chinos).
   */
  private async lazyInitEngine(): Promise<void> {
    if (this.isDestroyed) return;

    let mapData = this.config.initialData;
    try {
      const saved = await Preferences.get({ key: this.config.storageKey! });
      if (saved.value) {
        mapData = JSON.parse(saved.value);
      }
    } catch {
      // Fallback a datos iniciales
    }

    const canvasEl = this.container.querySelector('#mindmap-render-canvas') as HTMLElement;
    if (!canvasEl) return;

    // Configuración para gama ultra-baja y localización
    this.mindMapInstance = new (MindMap as any)({
      el: canvasEl,
      data: mapData,
      layout: this.currentLayout,
      theme: 'classic4',
      readonly: false,
      enableFreeDrag: false,
      isTouch: true,
      mousewheelAction: 'zoom',
      enableAnimation: false,
      customLineType: 'straight',

      // LOCALIZACIÓN 100% ESPAÑOL (Supresión total de chino)
      defaultInsertSecondLevelNodeText: 'Subconcepto',
      defaultInsertBelowSecondLevelNodeText: 'Idea secundaria',
      defaultGeneralizationText: 'Resumen',

      themeConfig: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#07080d',
        root: {
          fillColor: '#1e293b',
          color: '#38bdf8',
          borderColor: '#38bdf8',
          borderWidth: 2,
          fontSize: 16,
          fontWeight: 'bold',
          active: {
            borderColor: '#0284c7',
            borderWidth: 3
          }
        },
        second: {
          fillColor: '#181a24',
          color: '#f8fafc',
          borderColor: '#334155',
          borderWidth: 1.5,
          fontSize: 14,
          active: {
            borderColor: '#38bdf8',
            borderWidth: 2
          }
        },
        node: {
          fillColor: '#14151f',
          color: '#cbd5e1',
          borderColor: '#1e293b',
          borderWidth: 1,
          fontSize: 13,
          active: {
            borderColor: '#38bdf8',
            borderWidth: 2
          }
        },
        lineColor: '#334155',
        lineWidth: 2
      }
    });

    // Eventos y selección
    this.mindMapInstance.on('node_active', (node: any) => {
      this.activeNode = node;
      this.updateDockButtons(Boolean(node));
      if (node) {
        this.triggerHaptic();
      }
    });

    // Guardado debounced ante cambios en la estructura
    this.mindMapInstance.on('data_change', () => {
      this.scheduleDebouncedSave();
    });

    // Interceptar el editor nativo de la librería para usar el Bottom Sheet Overlay
    if (this.mindMapInstance.textEdit) {
      this.mindMapInstance.textEdit.show = () => {
        this.openEditOverlay();
      };
    }

    // Auto-ajuste de vista centrado inicial
    setTimeout(() => {
      if (this.mindMapInstance && !this.isDestroyed) {
        try {
          this.mindMapInstance.view.fit();
        } catch {}
      }
    }, 120);

    this.initKeyboardAdaptiveHandler();
  }

  /**
   * Enlace de atajos de teclado globales (Tab, Enter, Delete, Ctrl+Z, Ctrl+Y, F, Espacio, Zoom)
   */
  private bindKeyboardShortcuts(): void {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (this.isDestroyed || !this.mindMapInstance) return;

    // Si el usuario está escribiendo en un input, textarea o contenteditable, no interceptar
    const activeEl = document.activeElement as HTMLElement | null;
    const isTyping =
      activeEl &&
      (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);

    if (isTyping) {
      if (e.key === 'Escape') {
        activeEl.blur();
      }
      return;
    }

    // Atajo Tab: Insertar subnodo hijo
    if (e.key === 'Tab') {
      e.preventDefault();
      if (this.activeNode) {
        this.mindMapInstance.execCommand('INSERT_CHILD_NODE');
        this.triggerHaptic();
      }
      return;
    }

    // Atajo Enter: Insertar concepto paralelo (hermano)
    if (e.key === 'Enter') {
      e.preventDefault();
      if (this.activeNode) {
        this.mindMapInstance.execCommand('INSERT_NODE');
        this.triggerHaptic();
      }
      return;
    }

    // Atajo Supr / Backspace: Eliminar nodo
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (this.activeNode) {
        this.mindMapInstance.execCommand('REMOVE_NODE');
        this.triggerHaptic();
      }
      return;
    }

    // Deshacer / Rehacer
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        this.mindMapInstance.execCommand('FORWARD');
      } else {
        this.mindMapInstance.execCommand('BACK');
      }
      this.triggerHaptic();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      this.mindMapInstance.execCommand('FORWARD');
      this.triggerHaptic();
      return;
    }

    // Centrar vista (Espacio o tecla F)
    if (e.key === ' ' || e.key.toLowerCase() === 'f') {
      e.preventDefault();
      this.mindMapInstance.view?.fit();
      this.triggerHaptic();
      return;
    }

    // Zoom
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      this.mindMapInstance.view?.enlarge();
      return;
    }

    if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      this.mindMapInstance.view?.narrow();
      return;
    }

    // F2: Editar texto
    if (e.key === 'F2') {
      e.preventDefault();
      if (this.activeNode) {
        this.openEditOverlay();
      }
      return;
    }
  };

  /**
   * Enlace de controles táctiles UI
   */
  private bindDOMEvents(): void {
    const root = this.container;

    // Acciones de Header
    root.querySelector('#btn-map-back')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.saveInstantly();
      this.config.onBack?.();
    });

    root.querySelector('#btn-map-undo')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.mindMapInstance?.execCommand('BACK');
    });

    root.querySelector('#btn-map-redo')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.mindMapInstance?.execCommand('FORWARD');
    });

    root.querySelector('#btn-map-fit')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.mindMapInstance?.view?.fit();
    });

    // Selector de Tipo de Esquema en Caliente
    const selectLayout = root.querySelector('#select-map-layout') as HTMLSelectElement | null;
    selectLayout?.addEventListener('change', () => {
      const layout = selectLayout.value;
      if (layout && this.mindMapInstance) {
        this.currentLayout = layout;
        this.mindMapInstance.setLayout(layout);
        this.triggerHaptic();
        setTimeout(() => this.mindMapInstance.view?.fit(), 100);
      }
    });

    // Paleta de Colores en Caliente
    root.querySelectorAll<HTMLButtonElement>('.color-dot-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const colorKey = btn.dataset.color;
        if (!colorKey) return;
        this.applyNodeColor(colorKey);
      });
    });

    // Botón para ver flashcards creadas en el tema
    root.querySelector('#btn-map-view-flashcards')?.addEventListener('click', () => {
      this.openFlashcardsDrawer();
    });

    // Botón de Atajos de Teclado
    root.querySelector('#btn-map-shortcuts')?.addEventListener('click', () => {
      this.openShortcutsModal();
    });

    // Botón de Exportar JSON
    root.querySelector('#btn-map-export')?.addEventListener('click', () => {
      this.exportJson();
    });

    // Acciones del Bottom Action Dock (100% táctiles)
    root.querySelector('#btn-node-child')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.mindMapInstance?.execCommand('INSERT_CHILD_NODE');
    });

    root.querySelector('#btn-node-sibling')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.mindMapInstance?.execCommand('INSERT_NODE');
    });

    root.querySelector('#btn-node-edit')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.openEditOverlay();
    });

    root.querySelector('#btn-node-delete')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.mindMapInstance?.execCommand('REMOVE_NODE');
    });

    // Modal Sheet de Edición
    const sheet = root.querySelector('#mindmap-edit-sheet') as HTMLElement;
    const input = root.querySelector('#input-sheet-text') as HTMLTextAreaElement;

    const closeSheet = () => {
      sheet.style.display = 'none';
      Keyboard.hide().catch(() => {});
    };

    root.querySelector('#btn-sheet-close')?.addEventListener('click', closeSheet);
    root.querySelector('#btn-sheet-cancel')?.addEventListener('click', closeSheet);

    root.querySelector('#btn-sheet-save')?.addEventListener('click', () => {
      const text = input.value.trim();
      if (this.activeNode && text) {
        this.mindMapInstance?.execCommand('SET_NODE_TEXT', this.activeNode, text);
        this.triggerHaptic();
      }
      closeSheet();
    });

    // Asistente KaTeX dentro de la edición de nodos
    root.querySelector('#btn-node-sheet-katex')?.addEventListener('click', () => {
      openScientificFormulaAssistant({
        initialLatex: input.value,
        onInsert: (formula) => {
          const cur = input.value;
          const pos = input.selectionStart ?? cur.length;
          input.value = `${cur.slice(0, pos)} ${formula} ${cur.slice(pos)}`.trim();
          input.focus();
        }
      });
    });
  }

  /**
   * Aplica un color seleccionado al nodo activo
   */
  private applyNodeColor(colorKey: string): void {
    if (!this.activeNode || !this.mindMapInstance) return;
    const preset = COLOR_PRESETS[colorKey];
    if (preset) {
      this.mindMapInstance.execCommand('SET_NODE_STYLES', this.activeNode, {
        fillColor: preset.fill,
        borderColor: preset.border,
        color: preset.text,
        borderWidth: 2
      });
      this.triggerHaptic();
    }
  }

  /**
   * Abre el Visor Drawer de las Flashcards de la sesión de este tema
   */
  private openFlashcardsDrawer(): void {
    const flashcards = this.getTopicFlashcards();
    this.triggerHaptic();

    const existing = document.getElementById('mindmap-flashcards-modal-overlay');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'mindmap-flashcards-modal-overlay';
    modal.className = 'mindmap-flashcards-modal';
    modal.innerHTML = `
      <div class="flashcards-modal-panel">
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.3rem;">🎴</span>
            <div>
              <h3 style="font-size:1.15rem; font-weight:800; color:#fff; margin:0;">Flashcards del Repaso</h3>
              <span style="font-size:0.75rem; color:#38bdf8;">${flashcards.length} tarjeta(s) asociadas a "${escapeHtml(this.config.topicTitle || 'Tema')}"</span>
            </div>
          </div>
          <button id="btn-close-flashcards-modal" class="figma-icon-btn-ghost" style="color:var(--f-text-secondary); font-size:1.3rem;">✕</button>
        </div>

        <div class="flashcards-list-scroll">
          ${
            flashcards.length > 0
              ? flashcards
                  .map(
                    (card, idx) => `
                <div class="mindmap-card-review-item">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.75rem; font-weight:800; color:#38bdf8;">TARJETA #${idx + 1}</span>
                    <button class="btn-toggle-answer figma-btn-white-pill" data-idx="${idx}" style="padding:3px 10px; font-size:0.72rem;">
                      👁️ Ver Respuesta
                    </button>
                  </div>
                  <div class="review-item-front">${katexService.parseAndRender(card.front)}</div>
                  <div class="review-item-back" id="review-back-${idx}" style="display:none;">
                    ${katexService.parseAndRender(card.back)}
                  </div>
                </div>
              `
                  )
                  .join('')
              : '<div style="color:var(--f-text-muted); text-align:center; padding:30px 10px;">Aún no has creado flashcards para este tema. Al estudiar la información átomo, pulsa "+ Agregar Flashcard".</div>'
          }
        </div>

        <div style="display:flex; justify-content:flex-end; padding-top:8px;">
          <button class="figma-btn-white-pill" id="btn-done-flashcards-modal" style="padding:8px 20px;">
            Cerrar Visor
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.querySelector('#btn-close-flashcards-modal')?.addEventListener('click', closeModal);
    modal.querySelector('#btn-done-flashcards-modal')?.addEventListener('click', closeModal);

    modal.querySelectorAll<HTMLButtonElement>('.btn-toggle-answer').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = btn.dataset.idx;
        if (!idx) return;
        const backEl = modal.querySelector(`#review-back-${idx}`) as HTMLElement;
        if (!backEl) return;
        const isHidden = backEl.style.display === 'none';
        backEl.style.display = isHidden ? 'block' : 'none';
        btn.textContent = isHidden ? '🙈 Ocultar' : '👁️ Ver Respuesta';
      });
    });
  }

  /**
   * Abre el Modal de Atajos de Teclado
   */
  private openShortcutsModal(): void {
    const existing = document.getElementById('mindmap-shortcuts-modal-overlay');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'mindmap-shortcuts-modal-overlay';
    modal.className = 'mindmap-flashcards-modal';
    modal.innerHTML = `
      <div class="flashcards-modal-panel" style="max-width:540px;">
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.3rem;">⌨️</span>
            <div>
              <h3 style="font-size:1.15rem; font-weight:800; color:#fff; margin:0;">Atajos de Teclado Profesionales</h3>
              <span style="font-size:0.75rem; color:#38bdf8;">Diseñado para velocidad extrema a 60 FPS</span>
            </div>
          </div>
          <button id="btn-close-shortcuts-modal" class="figma-icon-btn-ghost" style="color:var(--f-text-secondary); font-size:1.3rem;">✕</button>
        </div>

        <div class="shortcuts-grid">
          <div class="shortcut-row">
            <span style="color:#e2e8f0; font-size:0.88rem;">Insertar Subnodo Hijo</span>
            <span class="kbd-badge">Tab</span>
          </div>
          <div class="shortcut-row">
            <span style="color:#e2e8f0; font-size:0.88rem;">Insertar Concepto Hermano</span>
            <span class="kbd-badge">Enter</span>
          </div>
          <div class="shortcut-row">
            <span style="color:#e2e8f0; font-size:0.88rem;">Eliminar Nodo Seleccionado</span>
            <span class="kbd-badge">Supr / Backspace</span>
          </div>
          <div class="shortcut-row">
            <span style="color:#e2e8f0; font-size:0.88rem;">Editar Texto del Concepto</span>
            <span class="kbd-badge">F2 / Doble Tap</span>
          </div>
          <div class="shortcut-row">
            <span style="color:#e2e8f0; font-size:0.88rem;">Deshacer Acción</span>
            <span class="kbd-badge">Ctrl + Z</span>
          </div>
          <div class="shortcut-row">
            <span style="color:#e2e8f0; font-size:0.88rem;">Rehacer Acción</span>
            <span class="kbd-badge">Ctrl + Y</span>
          </div>
          <div class="shortcut-row">
            <span style="color:#e2e8f0; font-size:0.88rem;">Ajustar y Centrar Vista</span>
            <span class="kbd-badge">Espacio o F</span>
          </div>
          <div class="shortcut-row">
            <span style="color:#e2e8f0; font-size:0.88rem;">Zoom In / Zoom Out</span>
            <span class="kbd-badge">+ / -</span>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; padding-top:12px;">
          <button class="figma-btn-study-large" id="btn-done-shortcuts-modal" style="width:auto; padding:8px 22px;">
            ¡Entendido!
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    const closeModal = () => modal.remove();
    modal.querySelector('#btn-close-shortcuts-modal')?.addEventListener('click', closeModal);
    modal.querySelector('#btn-done-shortcuts-modal')?.addEventListener('click', closeModal);
  }

  /**
   * Exporta el estado actual a un archivo JSON descargable
   */
  private exportJson(): void {
    if (!this.mindMapInstance) return;
    try {
      const data = this.mindMapInstance.getData(false);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(this.config.topicTitle || 'mapa_mental').toLowerCase().replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.triggerHaptic();
    } catch (e) {
      console.warn('[UltraFastMindMap] Error exportando JSON:', e);
    }
  }

  /**
   * 4. GESTIÓN DEL FOCO, INPUT Y TECLADO VIRTUAL
   */
  private openEditOverlay(): void {
    if (!this.activeNode) return;
    const sheet = this.container.querySelector('#mindmap-edit-sheet') as HTMLElement;
    const input = this.container.querySelector('#input-sheet-text') as HTMLTextAreaElement;
    if (!sheet || !input) return;

    input.value = this.activeNode.nodeData?.data?.text || '';
    sheet.style.display = 'flex';

    setTimeout(() => {
      input.focus();
    }, 100);
  }

  private initKeyboardAdaptiveHandler(): void {
    try {
      this.keyboardListenerHandle = Keyboard.addListener('keyboardWillShow', () => {
        if (this.mindMapInstance && this.activeNode) {
          setTimeout(() => {
            try {
              this.mindMapInstance.view?.fit();
            } catch {}
          }, 80);
        }
      });
    } catch {
      // Ignorar en navegador estándar sin plugin nativo
    }
  }

  private updateDockButtons(hasActiveNode: boolean): void {
    const ids = ['#btn-node-child', '#btn-node-sibling', '#btn-node-edit', '#btn-node-delete'];
    ids.forEach((id) => {
      const btn = this.container.querySelector(id) as HTMLButtonElement | null;
      if (btn) btn.disabled = !hasActiveNode;
    });
  }

  /**
   * 5. PERSISTENCIA Y GUARDADO RÁPIDO
   */
  private scheduleDebouncedSave(): void {
    const statusLabel = this.container.querySelector('#map-save-status');
    if (statusLabel) statusLabel.textContent = 'Guardando...';

    if (this.saveDebounceTimer) {
      window.clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = window.setTimeout(() => {
      this.saveInstantly();
    }, 3500);
  }

  public async saveInstantly(): Promise<void> {
    if (!this.mindMapInstance || this.isDestroyed) return;
    try {
      const data = this.mindMapInstance.getData(false);
      const json = JSON.stringify(data);
      await Preferences.set({ key: this.config.storageKey!, value: json });

      const statusLabel = this.container.querySelector('#map-save-status');
      if (statusLabel) statusLabel.textContent = 'Guardado ✓';

      this.config.onSave?.(data);
    } catch (e) {
      console.warn('[UltraFastMindMap] Error persistiendo estado:', e);
    }
  }

  private triggerHaptic(): void {
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  }

  /**
   * Desmontaje absoluto para evitar fugas de memoria en WebViews
   */
  public destroy(): void {
    this.isDestroyed = true;
    window.removeEventListener('keydown', this.handleKeyDown);

    if (this.saveDebounceTimer) {
      window.clearTimeout(this.saveDebounceTimer);
      this.saveDebounceTimer = null;
    }
    try {
      this.keyboardListenerHandle?.remove?.();
    } catch {}

    if (this.mindMapInstance) {
      try {
        this.mindMapInstance.destroy();
      } catch (e) {
        console.warn('[UltraFastMindMap] Error en mindMap.destroy():', e);
      }
      this.mindMapInstance = null;
    }
    this.container.innerHTML = '';
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
