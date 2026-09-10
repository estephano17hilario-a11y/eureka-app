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

const THEME_PRESETS: Record<string, any> = {
  cyberDark: {
    name: 'Cyber Dark',
    backgroundColor: '#07080d',
    root: {
      fillColor: '#1e293b',
      color: '#38bdf8',
      borderColor: '#38bdf8',
      borderWidth: 2,
      fontSize: 16,
      fontWeight: 'bold',
      active: { borderColor: '#0284c7', borderWidth: 3 }
    },
    second: {
      fillColor: '#141724',
      color: '#f8fafc',
      borderColor: '#38bdf8',
      borderWidth: 1.5,
      fontSize: 14,
      active: { borderColor: '#38bdf8', borderWidth: 2 }
    },
    node: {
      fillColor: '#0f111a',
      color: '#cbd5e1',
      borderColor: '#1e293b',
      borderWidth: 1,
      fontSize: 13,
      active: { borderColor: '#38bdf8', borderWidth: 2 }
    },
    lineColor: '#38bdf8',
    lineWidth: 2
  },
  oceanBlue: {
    name: 'Ocean Blue',
    backgroundColor: '#030d1a',
    root: {
      fillColor: '#0c4a6e',
      color: '#e0f2fe',
      borderColor: '#0284c7',
      borderWidth: 2,
      fontSize: 16,
      fontWeight: 'bold',
      active: { borderColor: '#38bdf8', borderWidth: 3 }
    },
    second: {
      fillColor: '#075985',
      color: '#ffffff',
      borderColor: '#0284c7',
      borderWidth: 1.5,
      fontSize: 14,
      active: { borderColor: '#38bdf8', borderWidth: 2 }
    },
    node: {
      fillColor: '#032b43',
      color: '#bae6fd',
      borderColor: '#0c4a6e',
      borderWidth: 1,
      fontSize: 13,
      active: { borderColor: '#38bdf8', borderWidth: 2 }
    },
    lineColor: '#0284c7',
    lineWidth: 2
  },
  bioEmerald: {
    name: 'Bio Emerald',
    backgroundColor: '#021812',
    root: {
      fillColor: '#064e3b',
      color: '#a7f3d0',
      borderColor: '#10b981',
      borderWidth: 2,
      fontSize: 16,
      fontWeight: 'bold',
      active: { borderColor: '#34d399', borderWidth: 3 }
    },
    second: {
      fillColor: '#047857',
      color: '#ffffff',
      borderColor: '#10b981',
      borderWidth: 1.5,
      fontSize: 14,
      active: { borderColor: '#34d399', borderWidth: 2 }
    },
    node: {
      fillColor: '#06382a',
      color: '#d1fae5',
      borderColor: '#065f46',
      borderWidth: 1,
      fontSize: 13,
      active: { borderColor: '#34d399', borderWidth: 2 }
    },
    lineColor: '#10b981',
    lineWidth: 2
  },
  midnightPurple: {
    name: 'Midnight Purple',
    backgroundColor: '#0c0517',
    root: {
      fillColor: '#4c1d95',
      color: '#ede9fe',
      borderColor: '#a855f7',
      borderWidth: 2,
      fontSize: 16,
      fontWeight: 'bold',
      active: { borderColor: '#c084fc', borderWidth: 3 }
    },
    second: {
      fillColor: '#581c87',
      color: '#ffffff',
      borderColor: '#a855f7',
      borderWidth: 1.5,
      fontSize: 14,
      active: { borderColor: '#c084fc', borderWidth: 2 }
    },
    node: {
      fillColor: '#2e1065',
      color: '#ddd6fe',
      borderColor: '#6b21a8',
      borderWidth: 1,
      fontSize: 13,
      active: { borderColor: '#c084fc', borderWidth: 2 }
    },
    lineColor: '#a855f7',
    lineWidth: 2
  },
  obsidianGold: {
    name: 'Obsidian Gold',
    backgroundColor: '#120d03',
    root: {
      fillColor: '#78350f',
      color: '#fef3c7',
      borderColor: '#f59e0b',
      borderWidth: 2,
      fontSize: 16,
      fontWeight: 'bold',
      active: { borderColor: '#fbbf24', borderWidth: 3 }
    },
    second: {
      fillColor: '#92400e',
      color: '#ffffff',
      borderColor: '#f59e0b',
      borderWidth: 1.5,
      fontSize: 14,
      active: { borderColor: '#fbbf24', borderWidth: 2 }
    },
    node: {
      fillColor: '#451a03',
      color: '#fde68a',
      borderColor: '#78350f',
      borderWidth: 1,
      fontSize: 13,
      active: { borderColor: '#fbbf24', borderWidth: 2 }
    },
    lineColor: '#f59e0b',
    lineWidth: 2
  }
};

/**
 * Componente UltraFastMindMap (Suite Profesional de Esquemas y Mapas Mentales)
 * Diseñado con directivas de optimización móvil híbrida para WebViews de gama ultra-baja en Android e iOS,
 * centrado perfecto con ajuste milimétrico a los límites del viewport,
 * 8 layouts estructurales, 5 temas visuales en caliente,
 * actualización instantánea al escribir con cursor de alto contraste,
 * asistente científico KaTeX integrado con vista previa en vivo,
 * buscador de nodos en tiempo real, colapso/expansión masiva, marcadores rápidos y exportación PNG/JSON.
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
  private currentTheme: string = 'cyberDark';
  private searchMatches: any[] = [];
  private currentSearchIndex: number = -1;

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

          <!-- Controles de Estructura y Temas -->
          <div class="mindmap-pro-controls-group">
            <!-- 8 Tipos de Esquemas -->
            <select id="select-map-layout" class="mindmap-select-pill" title="Cambiar tipo de estructura">
              <option value="logicalStructure" ${this.currentLayout === 'logicalStructure' ? 'selected' : ''}>🌲 Estructura Lógica (Izq ➔ Der)</option>
              <option value="mindMap" ${this.currentLayout === 'mindMap' ? 'selected' : ''}>🧠 Mapa Mental Radial</option>
              <option value="organizationStructure" ${this.currentLayout === 'organizationStructure' ? 'selected' : ''}>🏛️ Organigrama Vertical</option>
              <option value="catalogOrganization" ${this.currentLayout === 'catalogOrganization' ? 'selected' : ''}>📑 Catálogo Organizativo</option>
              <option value="timeline" ${this.currentLayout === 'timeline' ? 'selected' : ''}>⏳ Línea de Tiempo Horizontal</option>
              <option value="timeline2" ${this.currentLayout === 'timeline2' ? 'selected' : ''}>⌛ Línea de Tiempo Vertical</option>
              <option value="fishbone" ${this.currentLayout === 'fishbone' ? 'selected' : ''}>🐟 Espina de Pescado (Ishikawa)</option>
              <option value="verticalMindMap" ${this.currentLayout === 'verticalMindMap' ? 'selected' : ''}>🏢 Esquema Jerárquico Vertical</option>
            </select>

            <!-- 5 Temas Visuales en Caliente -->
            <select id="select-map-theme" class="mindmap-select-pill" title="Cambiar tema de color del lienzo">
              <option value="cyberDark" selected>🌌 Cyber Dark</option>
              <option value="oceanBlue">🌊 Ocean Blue</option>
              <option value="bioEmerald">🍃 Bio Emerald</option>
              <option value="midnightPurple">🔮 Midnight Purple</option>
              <option value="obsidianGold">⚡ Obsidian Gold</option>
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

            <!-- Botón KaTeX Científico Directo -->
            <button class="mindmap-top-action-chip" id="btn-map-katex-direct" title="Asistente de Fórmulas y Notación Científica">
              📐 KaTeX
            </button>

            <!-- Botón Búsqueda de Nodos -->
            <button class="mindmap-top-action-chip" id="btn-map-search-toggle" title="Buscar conceptos en el mapa">
              🔍 Buscar
            </button>

            <!-- Botones de Colapsar / Desplegar -->
            <button class="mindmap-top-action-chip" id="btn-map-expand-all" title="Desplegar todas las ramas">
              📂 Desplegar
            </button>
            <button class="mindmap-top-action-chip" id="btn-map-collapse-all" title="Plegar ramas">
              📁 Plegar
            </button>

            <!-- Botón Flashcards del Repaso -->
            <button class="mindmap-top-action-chip badge-glow" id="btn-map-view-flashcards" title="Ver flashcards creadas en este tema">
              <span>🎴 Flashcards</span>
              <span id="map-flashcards-count-badge">(${flashcards.length})</span>
            </button>

            <!-- Atajos de Teclado -->
            <button class="mindmap-top-action-chip" id="btn-map-shortcuts" title="Ver atajos de teclado (Tab, Enter, Delete...)">
              ⌨️ Atajos
            </button>

            <!-- Exportar Imagen PNG y JSON -->
            <button class="mindmap-top-action-chip" id="btn-map-export-png" title="Exportar como Imagen PNG">
              🖼️ PNG
            </button>
            <button class="mindmap-top-action-chip" id="btn-map-export-json" title="Descargar copia del esquema JSON">
              💾 JSON
            </button>
          </div>

          <div class="top-bar-right">
            <button class="mindmap-touch-btn" id="btn-map-undo" title="Deshacer (Ctrl+Z)" aria-label="Deshacer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </button>
            <button class="mindmap-touch-btn" id="btn-map-redo" title="Rehacer (Ctrl+Y)" aria-label="Rehacer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
            </button>
            <!-- BOTÓN PRINCIPAL DE CENTRADO PERFECTO A LÍMITES -->
            <button class="mindmap-touch-btn mindmap-fit-main-btn" id="btn-map-fit" title="Centrar y Ajustar a Límites (Espacio / F)" aria-label="Ajustar límites">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </header>

        <!-- Barra de Búsqueda Flotante -->
        <div class="mindmap-search-floating-bar" id="mindmap-search-bar" style="display: none;">
          <span style="font-size:1rem;">🔍</span>
          <input type="text" id="mindmap-search-input" placeholder="Buscar concepto o fórmula..." autocomplete="off" />
          <span class="search-counter" id="search-counter">0/0</span>
          <button type="button" class="search-nav-btn" id="btn-search-prev" title="Anterior">▲</button>
          <button type="button" class="search-nav-btn" id="btn-search-next" title="Siguiente">▼</button>
          <button type="button" class="search-nav-btn" id="btn-search-close" title="Cerrar">✕</button>
        </div>

        <!-- 2. Lienzo SVG Acelerado por GPU (100vw / 100vh) -->
        <div id="mindmap-render-canvas" class="mindmap-canvas-container"></div>

        <!-- Botón Flotante Ergonómico de Centrado Inmediato -->
        <button class="mindmap-floating-fit-btn" id="btn-floating-fit" title="Centrar y ajustar límites de pantalla (Espacio / F)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>Centrar Vista</span>
        </button>

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

        <!-- 4. Overlay de Edición Antiteclado con Actualización Reactiva en Vivo y Asistente Científico KaTeX -->
        <div class="mindmap-edit-overlay" id="mindmap-edit-sheet" style="display: none;">
          <div class="edit-sheet-panel">
            <div class="edit-sheet-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-weight:800; font-size:1.05rem; color:#fff;">Editar Concepto</span>
                <span style="font-size:0.75rem; color:#38bdf8; background:rgba(56,189,248,0.12); padding:2px 8px; border-radius:999px;">⚡ En Vivo</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <button type="button" class="figma-btn-white-pill" id="btn-node-sheet-katex" style="padding:4px 10px; font-size:0.75rem; border-color:rgba(56,189,248,0.4); color:#38bdf8;">
                  📐 Fórmulas KaTeX
                </button>
                <button id="btn-sheet-close" class="btn-sheet-close" aria-label="Cerrar">✕</button>
              </div>
            </div>

            <!-- Fila de Marcadores / Stickers Rápidos -->
            <div class="sheet-stickers-row" id="sheet-stickers-bar">
              <span style="font-size:0.75rem; color:var(--f-text-muted); font-weight:600;">Stickers:</span>
              <button type="button" class="sticker-chip" data-sticker="⭐">⭐</button>
              <button type="button" class="sticker-chip" data-sticker="🔬">🔬</button>
              <button type="button" class="sticker-chip" data-sticker="⚡">⚡</button>
              <button type="button" class="sticker-chip" data-sticker="📌">📌</button>
              <button type="button" class="sticker-chip" data-sticker="✅">✅</button>
              <button type="button" class="sticker-chip" data-sticker="💡">💡</button>
              <button type="button" class="sticker-chip" data-sticker="❓">❓</button>
              <button type="button" class="sticker-chip" data-sticker="🎯">🎯</button>
              <button type="button" class="sticker-chip" data-sticker="🧪">🧪</button>
            </div>

            <!-- Input de texto con actualización instantánea y cursor de alto contraste -->
            <textarea id="input-sheet-text" rows="3" placeholder="Escribe el concepto o fórmula LaTeX ($E=mc^2$)..." autocomplete="off" spellcheck="false"></textarea>

            <!-- Preview KaTeX en Tiempo Real dentro del Sheet -->
            <div class="sheet-katex-live-preview-box" id="sheet-katex-preview" style="display:none;">
              <span class="preview-tag">Vista Previa Científica:</span>
              <div class="preview-content" id="sheet-katex-preview-rendered"></div>
            </div>

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

    const themeObj = THEME_PRESETS[this.currentTheme] || THEME_PRESETS.cyberDark;

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

      // LOCALIZACIÓN 100% ESPAÑOL (Supresión total de caracteres chinos)
      defaultInsertSecondLevelNodeText: 'Subconcepto',
      defaultInsertBelowSecondLevelNodeText: 'Idea secundaria',
      defaultGeneralizationText: 'Resumen',

      themeConfig: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: themeObj.backgroundColor,
        root: themeObj.root,
        second: themeObj.second,
        node: themeObj.node,
        lineColor: themeObj.lineColor,
        lineWidth: themeObj.lineWidth
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

    // Interceptar el editor nativo de la librería para usar el Bottom Sheet Overlay con KaTeX
    if (this.mindMapInstance.textEdit) {
      this.mindMapInstance.textEdit.show = () => {
        this.openEditOverlay();
      };
    }

    // Auto-ajuste de vista centrado inicial a límites
    setTimeout(() => {
      if (this.mindMapInstance && !this.isDestroyed) {
        this.fitToScreenBounds();
      }
    }, 150);

    this.initKeyboardAdaptiveHandler();
  }

  /**
   * 🎯 FIT TO SCREEN BOUNDS (Centrado de Límites Perfecto)
   * Calza milimétricamente todo el contenido del mapa en el centro de la pantalla,
   * garantizando que los nodos más lejanos rocen los límites sin desbordar.
   */
  public fitToScreenBounds(): void {
    if (!this.mindMapInstance || this.isDestroyed) return;

    try {
      // 1. Ejecutar el fit nativo de la librería con padding equilibrado
      if (this.mindMapInstance.view) {
        this.mindMapInstance.view.fit();
      }

      // 2. Efecto visual de flash/glow en el lienzo para retroalimentación
      const canvasEl = this.container.querySelector('#mindmap-render-canvas');
      if (canvasEl) {
        canvasEl.classList.remove('mindmap-fit-highlight');
        void (canvasEl as HTMLElement).offsetWidth; // Trigger reflow
        canvasEl.classList.add('mindmap-fit-highlight');
      }

      this.triggerHaptic();
    } catch (e) {
      console.warn('[UltraFastMindMap] Error al ajustar límites:', e);
    }
  }

  /**
   * Enlace de atajos de teclado globales (Tab, Enter, Delete, Ctrl+Z, Ctrl+Y, F, Espacio, Zoom, / para buscar)
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

    // Centrar vista a límites (Espacio o tecla F)
    if (e.key === ' ' || e.key.toLowerCase() === 'f') {
      e.preventDefault();
      this.fitToScreenBounds();
      return;
    }

    // Atajo / para abrir buscador
    if (e.key === '/') {
      e.preventDefault();
      this.toggleSearchBar(true);
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

    // Botones de Centrado de Límites
    root.querySelector('#btn-map-fit')?.addEventListener('click', () => {
      this.fitToScreenBounds();
    });

    root.querySelector('#btn-floating-fit')?.addEventListener('click', () => {
      this.fitToScreenBounds();
    });

    // Selector de Tipo de Esquema en Caliente (8 Estructuras)
    const selectLayout = root.querySelector('#select-map-layout') as HTMLSelectElement | null;
    selectLayout?.addEventListener('change', () => {
      const layout = selectLayout.value;
      if (layout && this.mindMapInstance) {
        this.currentLayout = layout;
        this.mindMapInstance.setLayout(layout);
        this.triggerHaptic();
        setTimeout(() => this.fitToScreenBounds(), 120);
      }
    });

    // Selector de Temas Visuales (5 Paletas)
    const selectTheme = root.querySelector('#select-map-theme') as HTMLSelectElement | null;
    selectTheme?.addEventListener('change', () => {
      const themeKey = selectTheme.value;
      if (themeKey && this.mindMapInstance) {
        this.applyTheme(themeKey);
      }
    });

    // Paleta de Colores en Caliente para el nodo seleccionado
    root.querySelectorAll<HTMLButtonElement>('.color-dot-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const colorKey = btn.dataset.color;
        if (!colorKey) return;
        this.applyNodeColor(colorKey);
      });
    });

    // Botón Asistente KaTeX Directo
    root.querySelector('#btn-map-katex-direct')?.addEventListener('click', () => {
      this.triggerHaptic();
      openScientificFormulaAssistant({
        initialLatex: this.activeNode?.nodeData?.data?.text || '',
        onInsert: (formula) => {
          if (this.activeNode && this.mindMapInstance) {
            const current = this.activeNode.nodeData?.data?.text || '';
            const next = current ? `${current} ${formula}` : formula;
            this.mindMapInstance.execCommand('SET_NODE_TEXT', this.activeNode, next);
            this.triggerHaptic();
          } else {
            // Si no hay nodo seleccionado, crear uno hijo de la raíz
            this.mindMapInstance?.execCommand('INSERT_CHILD_NODE');
            setTimeout(() => {
              if (this.activeNode) {
                this.mindMapInstance.execCommand('SET_NODE_TEXT', this.activeNode, formula);
              }
            }, 60);
          }
        }
      });
    });

    // Toggle Barra de Búsqueda
    root.querySelector('#btn-map-search-toggle')?.addEventListener('click', () => {
      this.toggleSearchBar();
    });

    // Colapsar / Desplegar Todo
    root.querySelector('#btn-map-expand-all')?.addEventListener('click', () => {
      this.expandAllNodes();
    });

    root.querySelector('#btn-map-collapse-all')?.addEventListener('click', () => {
      this.collapseAllNodes();
    });

    // Botón para ver flashcards creadas en el tema
    root.querySelector('#btn-map-view-flashcards')?.addEventListener('click', () => {
      this.openFlashcardsDrawer();
    });

    // Botón de Atajos de Teclado
    root.querySelector('#btn-map-shortcuts')?.addEventListener('click', () => {
      this.openShortcutsModal();
    });

    // Botones de Exportar PNG y JSON
    root.querySelector('#btn-map-export-png')?.addEventListener('click', () => {
      this.exportPngImage();
    });

    root.querySelector('#btn-map-export-json')?.addEventListener('click', () => {
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

    // Controles de la Barra de Búsqueda
    const searchInput = root.querySelector('#mindmap-search-input') as HTMLInputElement | null;
    searchInput?.addEventListener('input', () => {
      this.handleSearchNodes(searchInput.value.trim());
    });
    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.navigateSearch(1);
      }
    });

    root.querySelector('#btn-search-prev')?.addEventListener('click', () => this.navigateSearch(-1));
    root.querySelector('#btn-search-next')?.addEventListener('click', () => this.navigateSearch(1));
    root.querySelector('#btn-search-close')?.addEventListener('click', () => this.toggleSearchBar(false));

    // Modal Sheet de Edición con Actualización en Tiempo Real
    const sheet = root.querySelector('#mindmap-edit-sheet') as HTMLElement;
    const input = root.querySelector('#input-sheet-text') as HTMLTextAreaElement;
    const previewBox = root.querySelector('#sheet-katex-preview') as HTMLElement;
    const previewRendered = root.querySelector('#sheet-katex-preview-rendered') as HTMLElement;

    const updateLivePreviewAndNode = () => {
      const text = input.value;
      // 1. Actualizar inmediatamente en el mapa mental en vivo
      if (this.activeNode && this.mindMapInstance) {
        this.mindMapInstance.execCommand('SET_NODE_TEXT', this.activeNode, text || ' ');
      }

      // 2. Renderizar preview KaTeX si contiene notación matemática o química
      if (text.includes('$') || text.includes('\\') || text.includes('^') || text.includes('_') || text.includes('{')) {
        previewBox.style.display = 'block';
        previewRendered.innerHTML = katexService.parseAndRender(text);
      } else {
        previewBox.style.display = 'none';
      }
    };

    input?.addEventListener('input', updateLivePreviewAndNode);

    // Fila de Stickers
    root.querySelectorAll<HTMLButtonElement>('.sticker-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sticker = btn.dataset.sticker;
        if (!sticker) return;
        const cur = input.value;
        const pos = input.selectionStart ?? cur.length;
        input.value = `${cur.slice(0, pos)}${sticker} ${cur.slice(pos)}`;
        input.focus();
        updateLivePreviewAndNode();
        this.triggerHaptic();
      });
    });

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
          updateLivePreviewAndNode();
        }
      });
    });
  }

  /**
   * Cambia el tema visual en caliente
   */
  private applyTheme(themeKey: string): void {
    if (!this.mindMapInstance || !THEME_PRESETS[themeKey]) return;
    this.currentTheme = themeKey;
    const themeObj = THEME_PRESETS[themeKey];

    try {
      this.mindMapInstance.setThemeConfig({
        backgroundColor: themeObj.backgroundColor,
        root: themeObj.root,
        second: themeObj.second,
        node: themeObj.node,
        lineColor: themeObj.lineColor,
        lineWidth: themeObj.lineWidth
      });
      this.triggerHaptic();
      setTimeout(() => this.fitToScreenBounds(), 100);
    } catch (e) {
      console.warn('[UltraFastMindMap] Error aplicando tema:', e);
    }
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
   * Búsqueda en vivo de nodos dentro del árbol
   */
  private toggleSearchBar(show?: boolean): void {
    const bar = this.container.querySelector('#mindmap-search-bar') as HTMLElement | null;
    const input = this.container.querySelector('#mindmap-search-input') as HTMLInputElement | null;
    if (!bar) return;

    const willShow = show !== undefined ? show : bar.style.display === 'none';
    bar.style.display = willShow ? 'flex' : 'none';
    if (willShow && input) {
      input.focus();
      input.select();
    } else {
      this.searchMatches = [];
      this.currentSearchIndex = -1;
      this.updateSearchCounter();
    }
  }

  private handleSearchNodes(query: string): void {
    if (!this.mindMapInstance || !query) {
      this.searchMatches = [];
      this.currentSearchIndex = -1;
      this.updateSearchCounter();
      return;
    }

    const matches: any[] = [];
    const lower = query.toLowerCase();

    // Recorrer todos los nodos del mapa
    const traverse = (node: any) => {
      if (!node) return;
      const text = node.nodeData?.data?.text || '';
      if (text.toLowerCase().includes(lower)) {
        matches.push(node);
      }
      if (node.children && node.children.length > 0) {
        node.children.forEach(traverse);
      }
    };

    const rootNode = this.mindMapInstance.renderer?.root;
    traverse(rootNode);

    this.searchMatches = matches;
    this.currentSearchIndex = matches.length > 0 ? 0 : -1;
    this.updateSearchCounter();

    if (this.currentSearchIndex >= 0) {
      this.focusSearchMatch(this.currentSearchIndex);
    }
  }

  private navigateSearch(dir: number): void {
    if (this.searchMatches.length === 0) return;
    this.currentSearchIndex = (this.currentSearchIndex + dir + this.searchMatches.length) % this.searchMatches.length;
    this.updateSearchCounter();
    this.focusSearchMatch(this.currentSearchIndex);
  }

  private focusSearchMatch(index: number): void {
    const node = this.searchMatches[index];
    if (node && this.mindMapInstance) {
      try {
        // Expandir antepasados si están plegados
        let parent = node.parent;
        while (parent) {
          if (parent.nodeData?.data?.expand === false) {
            this.mindMapInstance.execCommand('EXPAND_NODE', parent);
          }
          parent = parent.parent;
        }

        // Seleccionar y enfocar
        this.mindMapInstance.renderer?.setRootNodeCenter?.(node);
        this.mindMapInstance.execCommand('SET_NODE_ACTIVE', node);
        this.triggerHaptic();
      } catch {}
    }
  }

  private updateSearchCounter(): void {
    const counter = this.container.querySelector('#search-counter');
    if (counter) {
      if (this.searchMatches.length === 0) {
        counter.textContent = '0/0';
      } else {
        counter.textContent = `${this.currentSearchIndex + 1}/${this.searchMatches.length}`;
      }
    }
  }

  /**
   * Plegar / Desplegar todos los nodos
   */
  private expandAllNodes(): void {
    if (!this.mindMapInstance) return;
    try {
      this.mindMapInstance.execCommand('EXPAND_ALL');
      this.triggerHaptic();
      setTimeout(() => this.fitToScreenBounds(), 120);
    } catch {
      // Fallback
    }
  }

  private collapseAllNodes(): void {
    if (!this.mindMapInstance) return;
    try {
      this.mindMapInstance.execCommand('UNEXPAND_ALL');
      this.triggerHaptic();
      setTimeout(() => this.fitToScreenBounds(), 120);
    } catch {
      // Fallback
    }
  }

  /**
   * Abre el Visor Drawer de las Flashcards con inserción directa al mapa mental
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
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:0.75rem; font-weight:800; color:#38bdf8;">TARJETA #${idx + 1}</span>
                    <div style="display:flex; gap:6px;">
                      <button class="btn-insert-to-map figma-btn-white-pill" data-idx="${idx}" style="padding:3px 8px; font-size:0.72rem; color:#34d399; border-color:rgba(52,211,153,0.3);">
                        ➕ Al Mapa
                      </button>
                      <button class="btn-toggle-answer figma-btn-white-pill" data-idx="${idx}" style="padding:3px 10px; font-size:0.72rem;">
                        👁️ Ver Respuesta
                      </button>
                    </div>
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

    // Inserción directa de la flashcard como nodo en el mapa mental
    modal.querySelectorAll<HTMLButtonElement>('.btn-insert-to-map').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        const card = flashcards[idx];
        if (!card || !this.mindMapInstance) return;

        const cleanText = card.front.replace(/<[^>]*>/g, '').trim();
        if (this.activeNode) {
          this.mindMapInstance.execCommand('INSERT_CHILD_NODE');
        } else {
          // Si no hay seleccionado, insertar desde la raíz
          this.mindMapInstance.execCommand('INSERT_CHILD_NODE');
        }

        setTimeout(() => {
          if (this.activeNode) {
            this.mindMapInstance.execCommand('SET_NODE_TEXT', this.activeNode, `🎴 ${cleanText}`);
            this.triggerHaptic();
          }
        }, 50);

        btn.textContent = '✓ Insertado';
        btn.style.color = '#38bdf8';
        setTimeout(() => {
          btn.textContent = '➕ Al Mapa';
          btn.style.color = '#34d399';
        }, 1500);
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
            <span style="color:#e2e8f0; font-size:0.88rem;">Ajustar y Centrar Vista a Límites</span>
            <span class="kbd-badge">Espacio o F</span>
          </div>
          <div class="shortcut-row">
            <span style="color:#e2e8f0; font-size:0.88rem;">Buscar Concepto</span>
            <span class="kbd-badge">/</span>
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
   * Exporta el estado actual a una imagen PNG de alta resolución
   */
  private async exportPngImage(): Promise<void> {
    if (!this.mindMapInstance) return;
    this.triggerHaptic();

    try {
      if (typeof this.mindMapInstance.export === 'function') {
        await this.mindMapInstance.export('png', true, this.config.topicTitle || 'mapa_mental');
      } else {
        // Fallback: Descargar SVG renderizado
        const svgEl = this.container.querySelector('#mindmap-render-canvas svg');
        if (svgEl) {
          const svgData = new XMLSerializer().serializeToString(svgEl);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${(this.config.topicTitle || 'mapa_mental').toLowerCase().replace(/\s+/g, '_')}.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (e) {
      console.warn('[UltraFastMindMap] Fallback exportando imagen:', e);
    }
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
   * 4. GESTIÓN DEL FOCO, INPUT Y TECLADO VIRTUAL CON ACTUALIZACIÓN EN VIVO
   */
  private openEditOverlay(): void {
    if (!this.activeNode) return;
    const sheet = this.container.querySelector('#mindmap-edit-sheet') as HTMLElement;
    const input = this.container.querySelector('#input-sheet-text') as HTMLTextAreaElement;
    const previewBox = this.container.querySelector('#sheet-katex-preview') as HTMLElement;
    const previewRendered = this.container.querySelector('#sheet-katex-preview-rendered') as HTMLElement;
    if (!sheet || !input) return;

    const currentText = this.activeNode.nodeData?.data?.text || '';
    input.value = currentText;
    sheet.style.display = 'flex';

    // Disparar preview KaTeX si ya tenía fórmulas
    if (currentText.includes('$') || currentText.includes('\\') || currentText.includes('^') || currentText.includes('_')) {
      if (previewBox && previewRendered) {
        previewBox.style.display = 'block';
        previewRendered.innerHTML = katexService.parseAndRender(currentText);
      }
    } else if (previewBox) {
      previewBox.style.display = 'none';
    }

    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);
  }

  private initKeyboardAdaptiveHandler(): void {
    try {
      this.keyboardListenerHandle = Keyboard.addListener('keyboardWillShow', () => {
        if (this.mindMapInstance && this.activeNode) {
          setTimeout(() => {
            this.fitToScreenBounds();
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
    }, 3000);
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

