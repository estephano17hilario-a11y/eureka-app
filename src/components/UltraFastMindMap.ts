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
  public activeDropdown: 'map' | 'node' | null = null;

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
        <!-- 1. Top Action Header Compacto (Solo 2 Botones: 'Mapa' y 'Recuadro' + Controles básicos) -->
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

          <!-- LOS 2 BOTONES CHICOS SOLICITADOS: 'MAPA' Y 'RECUADRO' -->
          <div class="mindmap-top-two-buttons">
            <button class="mindmap-header-action-pill" id="btn-toggle-menu-map" title="Configurar mapa y lienzo">
              <span class="pill-icon">🗺️</span>
              <span class="pill-label">Mapa</span>
              <span class="pill-chevron">▾</span>
            </button>
            <button class="mindmap-header-action-pill" id="btn-toggle-menu-node" title="Configurar recuadro seleccionado">
              <span class="pill-icon">🔲</span>
              <span class="pill-label">Recuadro</span>
              <span class="pill-chevron">▾</span>
            </button>
          </div>

          <div class="top-bar-right">
            <button class="mindmap-touch-btn" id="btn-map-undo" title="Deshacer (Ctrl+Z)" aria-label="Deshacer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </button>
            <button class="mindmap-touch-btn" id="btn-map-redo" title="Rehacer (Ctrl+Y)" aria-label="Rehacer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
            </button>
            <!-- BOTÓN PRINCIPAL DE CENTRADO PERFECTO A LÍMITES -->
            <button class="mindmap-touch-btn mindmap-fit-main-btn" id="btn-map-fit" title="Centrar y Ajustar a Límites (Espacio / F)" aria-label="Ajustar límites">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </header>

        <!-- Input Oculto para Cargar Fotos en los Recuadros -->
        <input type="file" id="mindmap-photo-file-input" accept="image/*" style="display:none;" />

        <!-- Panel Desplegable: 'MAPA' (Formato Horizontal Ribbon) -->
        <div class="mindmap-dropdown-menu-panel apple-glass-panel" id="mindmap-dropdown-map" style="display:none;">
          <div class="dropdown-h-group">
            <span class="dropdown-h-title">🗺️ Mapa</span>
          </div>

          <div class="dropdown-h-divider"></div>

          <div class="dropdown-h-group">
            <label class="dropdown-h-label">Esquema:</label>
            <select id="select-map-layout" class="dropdown-select-clean-sm" title="Cambiar tipo de estructura">
              <option value="logicalStructure" ${this.currentLayout === 'logicalStructure' ? 'selected' : ''}>🌲 Lógica (Izq ➔ Der)</option>
              <option value="mindMap" ${this.currentLayout === 'mindMap' ? 'selected' : ''}>🧠 Radial</option>
              <option value="organizationStructure" ${this.currentLayout === 'organizationStructure' ? 'selected' : ''}>🏛️ Organigrama</option>
              <option value="catalogOrganization" ${this.currentLayout === 'catalogOrganization' ? 'selected' : ''}>📑 Catálogo</option>
              <option value="timeline" ${this.currentLayout === 'timeline' ? 'selected' : ''}>⏳ Línea Horizontal</option>
              <option value="timeline2" ${this.currentLayout === 'timeline2' ? 'selected' : ''}>⌛ Línea Vertical</option>
              <option value="fishbone" ${this.currentLayout === 'fishbone' ? 'selected' : ''}>🐟 Ishikawa</option>
              <option value="verticalMindMap" ${this.currentLayout === 'verticalMindMap' ? 'selected' : ''}>🏢 Jerárquico</option>
            </select>
          </div>

          <div class="dropdown-h-divider"></div>

          <div class="dropdown-h-group">
            <label class="dropdown-h-label">Fondo:</label>
            <div class="theme-chips-row-sm">
              <button class="theme-chip-btn ${this.currentTheme === 'cyberDark' ? 'active' : ''}" data-theme="cyberDark">🌌 Cyber</button>
              <button class="theme-chip-btn ${this.currentTheme === 'oceanBlue' ? 'active' : ''}" data-theme="oceanBlue">🌊 Ocean</button>
              <button class="theme-chip-btn ${this.currentTheme === 'bioEmerald' ? 'active' : ''}" data-theme="bioEmerald">🍃 Bio</button>
              <button class="theme-chip-btn ${this.currentTheme === 'midnightPurple' ? 'active' : ''}" data-theme="midnightPurple">🔮 Purple</button>
              <button class="theme-chip-btn ${this.currentTheme === 'obsidianGold' ? 'active' : ''}" data-theme="obsidianGold">⚡ Gold</button>
            </div>
          </div>

          <div class="dropdown-h-divider"></div>

          <div class="dropdown-h-group">
            <label class="dropdown-h-label">Recuadros:</label>
            <div class="color-dots-row-sm" id="map-global-color-palette">
              <button class="color-dot-btn" data-color="blue" style="background:#0ea5e9;" title="Azul Cyan"></button>
              <button class="color-dot-btn" data-color="purple" style="background:#a855f7;" title="Violeta Cyber"></button>
              <button class="color-dot-btn" data-color="emerald" style="background:#10b981;" title="Esmeralda Bio"></button>
              <button class="color-dot-btn" data-color="amber" style="background:#f59e0b;" title="Ámbar"></button>
              <button class="color-dot-btn" data-color="rose" style="background:#ec4899;" title="Rosa Neón"></button>
              <button class="color-dot-btn" data-color="dark" style="background:#334155;" title="Pizarra"></button>
            </div>
          </div>

          <div class="dropdown-h-divider"></div>

          <div class="dropdown-h-group dropdown-h-actions">
            <button class="dropdown-tool-btn-sm" id="btn-map-fit-menu">🎯 Centrar</button>
            <button class="dropdown-tool-btn-sm" id="btn-map-expand-all">📂 Desplegar</button>
            <button class="dropdown-tool-btn-sm" id="btn-map-collapse-all">📁 Plegar</button>
            <button class="dropdown-tool-btn-sm" id="btn-map-search-toggle">🔍 Buscar</button>
            <button class="dropdown-tool-btn-sm" id="btn-map-view-flashcards">🎴 Flashcards (${flashcards.length})</button>
            <button class="dropdown-tool-btn-sm" id="btn-map-shortcuts">⌨️ Atajos</button>
            <button class="dropdown-tool-btn-sm" id="btn-map-export-png">🖼️ PNG</button>
            <button class="dropdown-tool-btn-sm" id="btn-map-export-json">💾 JSON</button>
          </div>

          <button type="button" class="btn-dropdown-close-sm" id="btn-close-map-dropdown" title="Cerrar barra">✕</button>
        </div>

        <!-- Panel Desplegable: 'RECUADRO' (Formato Horizontal Ribbon) -->
        <div class="mindmap-dropdown-menu-panel apple-glass-panel" id="mindmap-dropdown-node" style="display:none;">
          <div class="dropdown-h-group">
            <span class="dropdown-h-title">🔲 Recuadro</span>
          </div>

          <div class="dropdown-h-divider"></div>

          <div id="node-dropdown-empty-notice" class="dropdown-h-group" style="display:none; align-items:center; gap:8px;">
            <span style="font-size:0.8rem; color:var(--f-text-secondary);">Toca un recuadro o</span>
            <button class="figma-btn-white-pill-sm" id="btn-select-root-node">
              Seleccionar Raíz
            </button>
          </div>

          <div id="node-dropdown-content" style="display:inline-flex; align-items:center; gap:12px;">
            <!-- Color de Fondo -->
            <div class="dropdown-h-group">
              <label class="dropdown-h-label">Fondo:</label>
              <div class="color-dots-row-sm" id="node-color-palette">
                <button class="color-dot-btn" data-color="blue" style="background:#0ea5e9;" title="Azul Cyan"></button>
                <button class="color-dot-btn" data-color="purple" style="background:#a855f7;" title="Violeta Cyber"></button>
                <button class="color-dot-btn" data-color="emerald" style="background:#10b981;" title="Esmeralda Bio"></button>
                <button class="color-dot-btn" data-color="amber" style="background:#f59e0b;" title="Ámbar"></button>
                <button class="color-dot-btn" data-color="rose" style="background:#ec4899;" title="Rosa Neón"></button>
                <button class="color-dot-btn" data-color="dark" style="background:#334155;" title="Pizarra"></button>
              </div>
            </div>

            <div class="dropdown-h-divider"></div>

            <!-- Color de Texto -->
            <div class="dropdown-h-group">
              <label class="dropdown-h-label">Texto:</label>
              <div class="color-dots-row-sm" id="node-text-color-palette">
                <button class="color-dot-btn" data-text-color="#ffffff" style="background:#ffffff; border:1px solid #94a3b8;" title="Blanco"></button>
                <button class="color-dot-btn" data-text-color="#38bdf8" style="background:#38bdf8;" title="Cyan"></button>
                <button class="color-dot-btn" data-text-color="#34d399" style="background:#34d399;" title="Verde"></button>
                <button class="color-dot-btn" data-text-color="#fbbf24" style="background:#fbbf24;" title="Dorado"></button>
                <button class="color-dot-btn" data-text-color="#f472b6" style="background:#f472b6;" title="Rosa"></button>
                <button class="color-dot-btn" data-text-color="#94a3b8" style="background:#94a3b8;" title="Gris"></button>
              </div>
            </div>

            <div class="dropdown-h-divider"></div>

            <!-- Tamaño / Estilo de Texto -->
            <div class="dropdown-h-group">
              <label class="dropdown-h-label">Tamaño:</label>
              <div class="text-size-chips-row-sm">
                <button class="text-size-btn text-size-btn-sm" data-size="12">12</button>
                <button class="text-size-btn text-size-btn-sm active" data-size="14">14</button>
                <button class="text-size-btn text-size-btn-sm" data-size="18">18</button>
                <button class="text-size-btn text-size-btn-sm" data-size="22">22</button>
                <button class="text-size-btn text-size-btn-sm" id="btn-toggle-bold"><strong>B</strong></button>
              </div>
            </div>

            <div class="dropdown-h-divider"></div>

            <!-- Marcadores y Stickers -->
            <div class="dropdown-h-group">
              <label class="dropdown-h-label">Stickers:</label>
              <div class="sheet-stickers-row-sm" id="node-menu-stickers-bar">
                <button type="button" class="sticker-chip sticker-chip-sm" data-sticker="⭐">⭐</button>
                <button type="button" class="sticker-chip sticker-chip-sm" data-sticker="🔬">🔬</button>
                <button type="button" class="sticker-chip sticker-chip-sm" data-sticker="⚡">⚡</button>
                <button type="button" class="sticker-chip sticker-chip-sm" data-sticker="📌">📌</button>
                <button type="button" class="sticker-chip sticker-chip-sm" data-sticker="✅">✅</button>
                <button type="button" class="sticker-chip sticker-chip-sm" data-sticker="💡">💡</button>
                <button type="button" class="sticker-chip sticker-chip-sm" data-sticker="❓">❓</button>
                <button type="button" class="sticker-chip sticker-chip-sm" data-sticker="🎯">🎯</button>
              </div>
            </div>

            <div class="dropdown-h-divider"></div>

            <!-- Foto del Recuadro -->
            <div class="dropdown-h-group">
              <button class="figma-btn-white-pill-sm" id="btn-upload-node-photo" title="Adjuntar foto al recuadro">
                📷 Foto
              </button>
              <button class="figma-btn-white-pill-sm danger" id="btn-remove-node-photo" style="display:none;" title="Eliminar foto del recuadro">
                🗑️
              </button>
            </div>

            <div class="dropdown-h-divider"></div>

            <!-- Acciones de Edición -->
            <div class="dropdown-h-group">
              <button class="figma-btn-study-sm" id="btn-open-direct-text-editor">
                ✏️ Texto
              </button>
              <button class="figma-btn-white-pill-sm" id="btn-open-katex-from-node-menu">
                📐 KaTeX
              </button>
            </div>
          </div>

          <button type="button" class="btn-dropdown-close-sm" id="btn-close-node-dropdown" title="Cerrar barra">✕</button>
        </div>

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

        <!-- 4. Overlay de Edición Directa Multilínea (Con saltos de reglón por Enter) -->
        <div class="mindmap-edit-overlay" id="mindmap-edit-sheet" style="display: none;">
          <div class="edit-sheet-panel">
            <div class="edit-sheet-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-weight:800; font-size:1.05rem; color:#fff;">Editar Recuadro</span>
                <span style="font-size:0.75rem; color:#38bdf8; background:rgba(56,189,248,0.12); padding:2px 8px; border-radius:999px;">↵ Enter para nuevo reglón</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <button type="button" class="figma-btn-white-pill" id="btn-node-sheet-photo" style="padding:4px 10px; font-size:0.75rem; color:#38bdf8; border-color:rgba(56,189,248,0.3);">
                  📷 Foto
                </button>
                <button type="button" class="figma-btn-white-pill" id="btn-node-sheet-katex" style="padding:4px 10px; font-size:0.75rem; border-color:rgba(56,189,248,0.4); color:#38bdf8;">
                  📐 KaTeX
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

            <!-- Miniatura de foto del recuadro si existe -->
            <div id="sheet-photo-preview-wrap" style="display:none; align-items:center; gap:10px; padding:6px 10px; background:rgba(255,255,255,0.04); border-radius:10px;">
              <img id="sheet-photo-preview-img" style="max-height:45px; max-width:60px; object-fit:cover; border-radius:6px;" />
              <span style="font-size:0.8rem; color:#38bdf8; flex:1;">Foto adjunta al recuadro</span>
              <button type="button" class="figma-icon-btn-ghost" id="btn-sheet-remove-photo" style="color:#ef4444; font-size:0.8rem;">🗑️ Quitar</button>
            </div>

            <!-- Input de texto con soporte nativo de reglones con Enter -->
            <textarea id="input-sheet-text" rows="4" placeholder="Escribe el texto aquí... Presiona Enter para dejar reglón y escribir abajo..." autocomplete="off" spellcheck="false"></textarea>

            <!-- Preview KaTeX en Tiempo Real dentro del Sheet si se usa notación -->
            <div class="sheet-katex-live-preview-box" id="sheet-katex-preview" style="display:none;">
              <span class="preview-tag">Vista Previa:</span>
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
      enableFreeDrag: true,
      isTouch: true,
      mousewheelAction: 'zoom',
      enableAnimation: false,
      customLineType: 'straight',
      isLimitMindMapInCanvas: false,
      fitPadding: 45,

      // LOCALIZACIÓN 100% ESPAÑOL (Supresión total de caracteres chinos)
      defaultInsertSecondLevelNodeText: 'Subconcepto',
      defaultInsertBelowSecondLevelNodeText: 'Idea secundaria',
      defaultGeneralizationText: 'Resumen',

      // Renderizado de multilínea, fotos e información KaTeX optimizado en el nodo
      isUseCustomNodeContent: true,
      customCreateNodeContent: (node: any) => {
        const text = node.getData ? (node.getData('text') ?? '') : (node.nodeData?.data?.text ?? '');
        const image = node.getData ? node.getData('image') : (node.nodeData?.data?.image || node.getData?.('imageUrl'));

        const div = document.createElement('div');
        div.className = 'eureka-mindmap-custom-node';

        const color = (typeof node.getStyle === 'function' ? node.getStyle('color', false) : null) || '#f8fafc';
        const fontSize = (typeof node.getStyle === 'function' ? node.getStyle('fontSize', false) : null) || 14;
        const fontWeight = (typeof node.getStyle === 'function' ? node.getStyle('fontWeight', false) : null) || 'normal';

        div.style.color = color;
        div.style.fontSize = `${fontSize}px`;
        div.style.fontWeight = fontWeight;
        div.style.lineHeight = '1.4';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'center';
        div.style.textAlign = 'center';
        div.style.maxWidth = '360px';
        div.style.wordBreak = 'break-word';
        div.style.whiteSpace = 'pre-wrap';
        div.style.padding = '6px 10px';

        // 📷 Renderizado de Foto en el Recuadro con Dimensiones Inmediatas
        if (image) {
          const imgSize = node.getData ? node.getData('imageSize') : (node.nodeData?.data?.imageSize);
          const imgW = (imgSize && imgSize.width) ? imgSize.width : 160;
          const imgH = (imgSize && imgSize.height) ? imgSize.height : 110;

          const imgEl = document.createElement('img');
          imgEl.src = image;
          imgEl.className = 'eureka-node-img-rendered';
          imgEl.width = imgW;
          imgEl.height = imgH;
          imgEl.style.width = `${imgW}px`;
          imgEl.style.height = `${imgH}px`;
          imgEl.style.minWidth = `${imgW}px`;
          imgEl.style.minHeight = `${imgH}px`;
          imgEl.style.maxWidth = '180px';
          imgEl.style.maxHeight = '130px';
          imgEl.style.borderRadius = '8px';
          imgEl.style.objectFit = 'cover';
          imgEl.style.display = 'block';
          imgEl.style.marginBottom = '6px';

          // Si el tamaño no estaba guardado y la imagen se decodifica en diferido, recalcular
          imgEl.onload = () => {
            if (!node.getData?.('imageSize') && imgEl.naturalWidth && imgEl.naturalHeight) {
              const scale = Math.min(180 / imgEl.naturalWidth, 130 / imgEl.naturalHeight, 1);
              const nw = Math.max(40, Math.round(imgEl.naturalWidth * scale));
              const nh = Math.max(30, Math.round(imgEl.naturalHeight * scale));
              if (nw !== imgW || nh !== imgH) {
                if (typeof node.setData === 'function') {
                  node.setData({ imageSize: { width: nw, height: nh, custom: true } });
                }
                this.mindMapInstance?.render();
              }
            }
          };

          div.appendChild(imgEl);
        }

        // ✍️ Renderizado de Texto Multilínea (Respetando saltos de línea con Enter)
        const textStr = String(text);
        const textEl = document.createElement('div');
        textEl.style.whiteSpace = 'pre-wrap';
        textEl.style.wordBreak = 'break-word';
        textEl.style.width = '100%';

        if (textStr.includes('class="katex"') || textStr.includes("<span class='katex'")) {
          textEl.innerHTML = textStr;
        } else {
          textEl.innerHTML = katexService.parseAndRender(textStr);
        }
        div.appendChild(textEl);

        return div;
      },

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
      this.updateNodeDropdownUI();
      if (node) {
        this.triggerHaptic();
      }
    });

    // Doble clic o toque en nodo: Abre inmediatamente el editor multilínea directo
    this.mindMapInstance.on('node_dblclick', (node: any) => {
      this.activeNode = node;
      this.openDirectTextEditor();
    });

    // Guardado debounced ante cambios en la estructura
    this.mindMapInstance.on('data_change', () => {
      this.scheduleDebouncedSave();
    });

    // Interceptar el editor nativo de la librería para usar el editor multilínea directo
    if (this.mindMapInstance.textEdit) {
      this.mindMapInstance.textEdit.show = () => {
        this.openDirectTextEditor();
      };
    }

    // Auto-ajuste de vista centrado inicial infalible al terminar el renderizado
    let initialRenderAttempts = 0;
    this.mindMapInstance.on('node_tree_render_end', () => {
      if (initialRenderAttempts < 4) {
        initialRenderAttempts++;
        requestAnimationFrame(() => {
          this.fitToScreenBounds();
        });
      }
    });

    setTimeout(() => {
      if (this.mindMapInstance && !this.isDestroyed) {
        this.fitToScreenBounds();
      }
    }, 80);

    setTimeout(() => {
      if (this.mindMapInstance && !this.isDestroyed) {
        this.fitToScreenBounds();
      }
    }, 220);

    setTimeout(() => {
      if (this.mindMapInstance && !this.isDestroyed) {
        this.fitToScreenBounds();
      }
    }, 450);

    this.initKeyboardAdaptiveHandler();
  }

  /**
   * Calcula la caja envolvente exacta de todos los nodos del árbol en el espacio de coordenadas local
   */
  private getTreeBoundingBox(): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number; cx: number; cy: number } | null {
    if (!this.mindMapInstance || !this.mindMapInstance.renderer) return null;
    const root = this.mindMapInstance.renderer.root;
    if (!root) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const traverse = (node: any) => {
      if (!node || node.isHide) return;

      const l = typeof node.left === 'number' ? node.left : (node._left ?? 0);
      const t = typeof node.top === 'number' ? node.top : (node._top ?? 0);
      const w = typeof node.width === 'number' && node.width > 0 ? node.width : 100;
      const h = typeof node.height === 'number' && node.height > 0 ? node.height : 40;

      minX = Math.min(minX, l);
      minY = Math.min(minY, t);
      maxX = Math.max(maxX, l + w);
      maxY = Math.max(maxY, t + h);

      if (node.children && Array.isArray(node.children) && node.getData?.('expand') !== false) {
        node.children.forEach(traverse);
      }
    };

    traverse(root);

    if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
      return null;
    }

    const width = Math.max(maxX - minX, 30);
    const height = Math.max(maxY - minY, 30);

    return {
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      cx: minX + width / 2,
      cy: minY + height / 2
    };
  }

  /**
   * 🎯 FIT TO SCREEN BOUNDS (Centrado de Límites Perfecto y Milimétrico)
   * Calza matemáticamente todo el contenido del mapa en el centro exacto de la pantalla,
   * calculando el centro geométrico de todos los nodos y alineándolo con el área libre
   * entre la barra superior y la barra inferior.
   */
  public fitToScreenBounds(): void {
    if (!this.mindMapInstance || this.isDestroyed) return;

    try {
      // 1. Forzar recálculo del tamaño del canvas respecto al viewport
      if (typeof this.mindMapInstance.resize === 'function') {
        this.mindMapInstance.resize();
      }

      const canvasEl = this.container.querySelector('#mindmap-render-canvas') as HTMLElement | null;
      const topBar = this.container.querySelector('.mindmap-top-bar') as HTMLElement | null;
      const bottomDock = this.container.querySelector('.mindmap-bottom-dock') as HTMLElement | null;

      const screenW = canvasEl?.clientWidth || window.innerWidth;
      const screenH = canvasEl?.clientHeight || window.innerHeight;

      const topH = topBar?.offsetHeight || 56;
      const bottomH = bottomDock?.offsetHeight || 76;

      // Área libre real entre Header y Bottom Dock
      const availW = Math.max(100, screenW - 80); // 40px margen a cada lado
      const availH = Math.max(100, screenH - topH - bottomH - 50); // 25px margen vertical

      // Centro visual geométrico EXACTO del área visible en la pantalla
      const targetCenterX = screenW / 2;
      const targetCenterY = topH + (screenH - topH - bottomH) / 2;

      const bbox = this.getTreeBoundingBox();

      if (bbox && bbox.width > 0 && bbox.height > 0 && this.mindMapInstance.view) {
        // Escalar para que los nodos extremos rocen los límites del espacio disponible
        const scaleX = availW / bbox.width;
        const scaleY = availH / bbox.height;
        let optimalScale = Math.min(scaleX, scaleY);

        // Limitar escala a rango ergonómico
        optimalScale = Math.min(Math.max(optimalScale, 0.3), 1.35);

        // Traslación exacta requerida para situar el centro del árbol en el centro visual
        const transX = targetCenterX - bbox.cx * optimalScale;
        const transY = targetCenterY - bbox.cy * optimalScale;

        this.mindMapInstance.view.scale = optimalScale;
        this.mindMapInstance.view.x = transX;
        this.mindMapInstance.view.y = transY;
        this.mindMapInstance.view.transform();
        this.mindMapInstance.emit('view_data_change', this.mindMapInstance.view.getTransformData());
      } else if (this.mindMapInstance.view) {
        // Fallback nativo
        this.mindMapInstance.view.fit(undefined, true, 45);
        const visualCenterOffsetY = (topH - bottomH) / 2;
        if (visualCenterOffsetY !== 0) {
          this.mindMapInstance.view.translateY(visualCenterOffsetY);
        }
      } else {
        this.mindMapInstance.renderer?.setRootNodeCenter?.();
      }

      // 4. Efecto visual de flash/glow en el lienzo para retroalimentación instantánea
      if (canvasEl) {
        canvasEl.classList.remove('mindmap-fit-highlight');
        void canvasEl.offsetWidth; // Trigger reflow
        canvasEl.classList.add('mindmap-fit-highlight');
      }

      this.triggerHaptic();
    } catch (e) {
      console.warn('[UltraFastMindMap] Error al centrar límites:', e);
      try {
        this.mindMapInstance?.renderer?.setRootNodeCenter?.();
      } catch {}
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

    // F2: Editar texto directo
    if (e.key === 'F2') {
      e.preventDefault();
      if (this.activeNode) {
        this.openDirectTextEditor();
      }
      return;
    }
  };

  /**
   * Enlace de controles táctiles UI (Optimizados con 2 botones principales: 'Mapa' y 'Recuadro')
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

    root.querySelector('#btn-map-fit-menu')?.addEventListener('click', () => {
      this.fitToScreenBounds();
      this.closeAllDropdowns();
    });

    root.querySelector('#btn-floating-fit')?.addEventListener('click', () => {
      this.fitToScreenBounds();
    });

    // ============================================================
    // 🗺️ CONTROL DE MENÚ DESPLEGABLE: 'MAPA'
    // ============================================================
    root.querySelector('#btn-toggle-menu-map')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown('map');
    });

    root.querySelector('#btn-close-map-dropdown')?.addEventListener('click', () => {
      this.closeAllDropdowns();
    });

    // Selector de Estructura / Tipo de Esquema (8 Layouts)
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

    // Selector de Temas Visuales (Fondo del Mapa)
    root.querySelectorAll<HTMLButtonElement>('.theme-chip-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const themeKey = btn.dataset.theme;
        if (!themeKey || !this.mindMapInstance) return;
        root.querySelectorAll('.theme-chip-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyTheme(themeKey);
      });
    });

    // Color Global de Recuadros
    root.querySelectorAll<HTMLButtonElement>('#map-global-color-palette .color-dot-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const colorKey = btn.dataset.color;
        if (!colorKey) return;
        this.applyGlobalNodesColor(colorKey);
      });
    });

    // Acciones de mapa en el menú desplegable
    root.querySelector('#btn-map-expand-all')?.addEventListener('click', () => {
      this.expandAllNodes();
      this.closeAllDropdowns();
    });

    root.querySelector('#btn-map-collapse-all')?.addEventListener('click', () => {
      this.collapseAllNodes();
      this.closeAllDropdowns();
    });

    root.querySelector('#btn-map-search-toggle')?.addEventListener('click', () => {
      this.closeAllDropdowns();
      this.toggleSearchBar();
    });

    root.querySelector('#btn-map-view-flashcards')?.addEventListener('click', () => {
      this.closeAllDropdowns();
      this.openFlashcardsDrawer();
    });

    root.querySelector('#btn-map-shortcuts')?.addEventListener('click', () => {
      this.closeAllDropdowns();
      this.openShortcutsModal();
    });

    root.querySelector('#btn-map-export-png')?.addEventListener('click', () => {
      this.closeAllDropdowns();
      this.exportPngImage();
    });

    root.querySelector('#btn-map-export-json')?.addEventListener('click', () => {
      this.closeAllDropdowns();
      this.exportJson();
    });

    // ============================================================
    // 🔲 CONTROL DE MENÚ DESPLEGABLE: 'RECUADRO'
    // ============================================================
    root.querySelector('#btn-toggle-menu-node')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown('node');
    });

    root.querySelector('#btn-close-node-dropdown')?.addEventListener('click', () => {
      this.closeAllDropdowns();
    });

    root.querySelector('#btn-select-root-node')?.addEventListener('click', () => {
      this.selectRootNode();
    });

    // Paleta de Color de Fondo del Recuadro
    root.querySelectorAll<HTMLButtonElement>('#node-color-palette .color-dot-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const colorKey = btn.dataset.color;
        if (!colorKey) return;
        this.applyNodeColor(colorKey);
      });
    });

    // Paleta de Color del Texto del Recuadro
    root.querySelectorAll<HTMLButtonElement>('[data-text-color]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const textColor = btn.dataset.textColor;
        if (!textColor || !this.activeNode || !this.mindMapInstance) return;
        this.mindMapInstance.execCommand('SET_NODE_STYLES', this.activeNode, {
          color: textColor
        });
        this.triggerHaptic();
        this.scheduleDebouncedSave();
      });
    });

    // Tamaño de Texto del Recuadro
    root.querySelectorAll<HTMLButtonElement>('.text-size-btn[data-size]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const size = Number(btn.dataset.size);
        if (!size || !this.activeNode || !this.mindMapInstance) return;
        root.querySelectorAll('.text-size-btn[data-size]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.mindMapInstance.execCommand('SET_NODE_STYLES', this.activeNode, {
          fontSize: size
        });
        this.triggerHaptic();
        this.scheduleDebouncedSave();
      });
    });

    // Alternar Negrita en Texto
    root.querySelector('#btn-toggle-bold')?.addEventListener('click', () => {
      if (!this.activeNode || !this.mindMapInstance) return;
      const curWeight = typeof this.activeNode.getStyle === 'function' ? this.activeNode.getStyle('fontWeight', false) : 'normal';
      const newWeight = curWeight === 'bold' || curWeight === '700' ? 'normal' : 'bold';
      this.mindMapInstance.execCommand('SET_NODE_STYLES', this.activeNode, {
        fontWeight: newWeight
      });
      this.triggerHaptic();
      this.scheduleDebouncedSave();
    });

    // Stickers Rápidos en Menú Recuadro
    root.querySelectorAll<HTMLButtonElement>('#node-menu-stickers-bar .sticker-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sticker = btn.dataset.sticker;
        if (!sticker || !this.activeNode || !this.mindMapInstance) return;
        const curText = (this.activeNode.getData ? this.activeNode.getData('text') : this.activeNode.nodeData?.data?.text) || '';
        const newText = `${sticker} ${curText}`;
        if (typeof this.activeNode.setData === 'function') {
          this.activeNode.setData({ text: newText, rawText: newText });
        } else if (this.activeNode.nodeData?.data) {
          this.activeNode.nodeData.data.text = newText;
          this.activeNode.nodeData.data.rawText = newText;
        }
        if (typeof this.mindMapInstance.render === 'function') {
          this.mindMapInstance.render();
        } else {
          this.mindMapInstance.execCommand('SET_NODE_TEXT', this.activeNode, newText);
        }
        this.triggerHaptic();
        this.scheduleDebouncedSave();
      });
    });

    // 📷 Inserción de Fotos en Recuadros
    const photoInput = root.querySelector('#mindmap-photo-file-input') as HTMLInputElement | null;
    const triggerPhotoPick = () => {
      if (!this.activeNode) {
        this.selectRootNode();
      }
      photoInput?.click();
    };

    root.querySelector('#btn-upload-node-photo')?.addEventListener('click', triggerPhotoPick);
    root.querySelector('#btn-node-sheet-photo')?.addEventListener('click', triggerPhotoPick);

    photoInput?.addEventListener('change', () => {
      const file = photoInput.files?.[0];
      if (!file || !this.activeNode || !this.mindMapInstance) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          this.setNodePhoto(dataUrl);
        }
      };
      reader.readAsDataURL(file);
      photoInput.value = '';
    });

    root.querySelector('#btn-remove-node-photo')?.addEventListener('click', () => {
      this.setNodePhoto(null);
    });

    root.querySelector('#btn-sheet-remove-photo')?.addEventListener('click', () => {
      this.setNodePhoto(null);
      const photoPreviewWrap = root.querySelector('#sheet-photo-preview-wrap') as HTMLElement | null;
      if (photoPreviewWrap) photoPreviewWrap.style.display = 'none';
    });

    // Botón para abrir el editor directo multilínea desde el menú de recuadro
    root.querySelector('#btn-open-direct-text-editor')?.addEventListener('click', () => {
      this.closeAllDropdowns();
      this.openDirectTextEditor();
    });

    // Asistente KaTeX desde el menú de recuadro
    root.querySelector('#btn-open-katex-from-node-menu')?.addEventListener('click', () => {
      this.closeAllDropdowns();
      if (!this.activeNode) {
        this.selectRootNode();
      }
      const curText = (this.activeNode.getData ? this.activeNode.getData('text') : this.activeNode.nodeData?.data?.text) || '';
      openScientificFormulaAssistant({
        initialLatex: curText,
        onInsert: (formula) => {
          if (this.activeNode && this.mindMapInstance) {
            const newText = `${curText} ${formula}`.trim();
            if (typeof this.activeNode.setData === 'function') {
              this.activeNode.setData({ text: newText, rawText: newText });
            } else if (this.activeNode.nodeData?.data) {
              this.activeNode.nodeData.data.text = newText;
              this.activeNode.nodeData.data.rawText = newText;
            }
            if (typeof this.mindMapInstance.render === 'function') {
              this.mindMapInstance.render();
            } else {
              this.mindMapInstance.execCommand('SET_NODE_TEXT', this.activeNode, newText);
            }
            this.triggerHaptic();
            this.scheduleDebouncedSave();
          }
        }
      });
    });

    // Cerrar dropdowns al hacer clic fuera
    root.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.mindmap-dropdown-menu-panel') && !target.closest('.mindmap-header-action-pill')) {
        this.closeAllDropdowns();
      }
    });

    // ============================================================
    // DOCK INFERIOR
    // ============================================================
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
      this.openDirectTextEditor();
    });

    root.querySelector('#btn-node-delete')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.mindMapInstance?.execCommand('REMOVE_NODE');
    });

    // ============================================================
    // BARRA DE BÚSQUEDA
    // ============================================================
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

    // ============================================================
    // ✍️ OVERLAY DE EDICIÓN MULTILÍNEA DIRECTO (CON REGLONES POR ENTER)
    // ============================================================
    const sheet = root.querySelector('#mindmap-edit-sheet') as HTMLElement;
    const input = root.querySelector('#input-sheet-text') as HTMLTextAreaElement;
    const previewBox = root.querySelector('#sheet-katex-preview') as HTMLElement;
    const previewRendered = root.querySelector('#sheet-katex-preview-rendered') as HTMLElement;

    const updateLivePreviewAndNode = () => {
      const text = input.value;
      // 1. Actualizar inmediatamente en el mapa mental en vivo
      if (this.activeNode && this.mindMapInstance) {
        if (typeof this.activeNode.setData === 'function') {
          this.activeNode.setData({ text: text || ' ', rawText: text });
        } else if (this.activeNode.nodeData?.data) {
          this.activeNode.nodeData.data.text = text || ' ';
          this.activeNode.nodeData.data.rawText = text;
        }
        if (typeof this.mindMapInstance.render === 'function') {
          this.mindMapInstance.render();
        } else {
          this.mindMapInstance.execCommand('SET_NODE_TEXT', this.activeNode, text || ' ');
        }
      }

      // 2. Renderizar preview KaTeX si contiene notación
      if (text.includes('$') || text.includes('\\') || text.includes('^') || text.includes('_') || text.includes('{')) {
        previewBox.style.display = 'block';
        previewRendered.innerHTML = katexService.parseAndRender(text);
      } else {
        previewBox.style.display = 'none';
      }
    };

    input?.addEventListener('input', updateLivePreviewAndNode);

    // Permite salto de reglón nativo con Enter. Si presiona Ctrl+Enter o Cmd+Enter: guardar y salir
    input?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        saveAndCloseSheet();
      }
    });

    // Stickers en el Sheet
    root.querySelectorAll<HTMLButtonElement>('#sheet-stickers-bar .sticker-chip').forEach((btn) => {
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

    const saveAndCloseSheet = () => {
      const text = input.value;
      if (this.activeNode && this.mindMapInstance) {
        if (typeof this.activeNode.setData === 'function') {
          this.activeNode.setData({ text: text || ' ', rawText: text });
        } else if (this.activeNode.nodeData?.data) {
          this.activeNode.nodeData.data.text = text || ' ';
          this.activeNode.nodeData.data.rawText = text;
        }

        if (typeof this.mindMapInstance.render === 'function') {
          this.mindMapInstance.render();
        } else {
          this.mindMapInstance.execCommand('SET_NODE_TEXT', this.activeNode, text || ' ');
        }
        this.triggerHaptic();
        this.scheduleDebouncedSave();
      }
      closeSheet();
    };

    root.querySelector('#btn-sheet-close')?.addEventListener('click', closeSheet);
    root.querySelector('#btn-sheet-cancel')?.addEventListener('click', closeSheet);
    root.querySelector('#btn-sheet-save')?.addEventListener('click', saveAndCloseSheet);

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
   * 4. GESTIÓN DEL EDITOR MULTILÍNEA DIRECTO Y CONTROLES DE RECUADRO Y MAPA
   */
  private openDirectTextEditor(): void {
    if (!this.activeNode || !this.mindMapInstance) return;
    this.triggerHaptic();

    const sheet = this.container.querySelector('#mindmap-edit-sheet') as HTMLElement | null;
    const input = this.container.querySelector('#input-sheet-text') as HTMLTextAreaElement | null;
    const previewBox = this.container.querySelector('#sheet-katex-preview') as HTMLElement | null;
    const previewRendered = this.container.querySelector('#sheet-katex-preview-rendered') as HTMLElement | null;
    const photoPreviewWrap = this.container.querySelector('#sheet-photo-preview-wrap') as HTMLElement | null;
    const photoPreviewImg = this.container.querySelector('#sheet-photo-preview-img') as HTMLImageElement | null;

    if (!sheet || !input) return;

    // Obtener texto actual (si tiene rawText guardado se usa preferentemente)
    let currentText = (this.activeNode.getData ? this.activeNode.getData('text') : this.activeNode.nodeData?.data?.text) || '';
    const rawText = this.activeNode.getData ? this.activeNode.getData('rawText') : this.activeNode.nodeData?.data?.rawText;
    if (rawText !== undefined && rawText !== null) {
      currentText = rawText;
    } else {
      currentText = currentText.replace(/<br\s*\/?>/gi, '\n');
    }

    input.value = currentText;

    // Miniatura de foto del recuadro
    const curImg = this.activeNode.getData ? this.activeNode.getData('image') : (this.activeNode.nodeData?.data?.image || this.activeNode.getData?.('imageUrl'));
    if (photoPreviewWrap && photoPreviewImg) {
      if (curImg) {
        photoPreviewImg.src = curImg;
        photoPreviewWrap.style.display = 'flex';
      } else {
        photoPreviewWrap.style.display = 'none';
      }
    }

    // Preview KaTeX si aplica
    if (previewBox && previewRendered) {
      if (currentText.includes('$') || currentText.includes('\\') || currentText.includes('{')) {
        previewBox.style.display = 'block';
        previewRendered.innerHTML = katexService.parseAndRender(currentText);
      } else {
        previewBox.style.display = 'none';
      }
    }

    sheet.style.display = 'flex';
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }, 20);
  }

  /**
   * Conmuta la visibilidad de los paneles desplegables 'Mapa' y 'Recuadro'
   */
  private toggleDropdown(type: 'map' | 'node'): void {
    const mapDropdown = this.container.querySelector('#mindmap-dropdown-map') as HTMLElement | null;
    const nodeDropdown = this.container.querySelector('#mindmap-dropdown-node') as HTMLElement | null;
    const btnMap = this.container.querySelector('#btn-toggle-menu-map');
    const btnNode = this.container.querySelector('#btn-toggle-menu-node');

    if (type === 'map') {
      const isVisible = mapDropdown?.style.display === 'flex';
      if (isVisible) {
        if (mapDropdown) mapDropdown.style.display = 'none';
        btnMap?.classList.remove('active');
        this.activeDropdown = null;
      } else {
        if (mapDropdown) mapDropdown.style.display = 'flex';
        if (nodeDropdown) nodeDropdown.style.display = 'none';
        btnMap?.classList.add('active');
        btnNode?.classList.remove('active');
        this.activeDropdown = 'map';
      }
    } else {
      const isVisible = nodeDropdown?.style.display === 'flex';
      if (isVisible) {
        if (nodeDropdown) nodeDropdown.style.display = 'none';
        btnNode?.classList.remove('active');
        this.activeDropdown = null;
      } else {
        if (nodeDropdown) nodeDropdown.style.display = 'flex';
        if (mapDropdown) mapDropdown.style.display = 'none';
        btnNode?.classList.add('active');
        btnMap?.classList.remove('active');
        this.activeDropdown = 'node';
        this.updateNodeDropdownUI();
      }
    }
    this.triggerHaptic();
  }

  /**
   * Cierra todos los dropdowns
   */
  private closeAllDropdowns(): void {
    const mapDropdown = this.container.querySelector('#mindmap-dropdown-map') as HTMLElement | null;
    const nodeDropdown = this.container.querySelector('#mindmap-dropdown-node') as HTMLElement | null;
    const btnMap = this.container.querySelector('#btn-toggle-menu-map');
    const btnNode = this.container.querySelector('#btn-toggle-menu-node');

    if (mapDropdown) mapDropdown.style.display = 'none';
    if (nodeDropdown) nodeDropdown.style.display = 'none';
    btnMap?.classList.remove('active');
    btnNode?.classList.remove('active');
    this.activeDropdown = null;
  }

  /**
   * Actualiza el contenido del panel Recuadro según el nodo activo
   */
  private updateNodeDropdownUI(): void {
    const emptyNotice = this.container.querySelector('#node-dropdown-empty-notice') as HTMLElement | null;
    const content = this.container.querySelector('#node-dropdown-content') as HTMLElement | null;
    const btnRemovePhoto = this.container.querySelector('#btn-remove-node-photo') as HTMLElement | null;

    if (!emptyNotice || !content) return;

    if (!this.activeNode) {
      emptyNotice.style.display = 'inline-flex';
      content.style.display = 'none';
    } else {
      emptyNotice.style.display = 'none';
      content.style.display = 'inline-flex';

      const hasPhoto = Boolean(this.activeNode.getData ? this.activeNode.getData('image') : (this.activeNode.nodeData?.data?.image || this.activeNode.getData?.('imageUrl')));
      if (btnRemovePhoto) {
        btnRemovePhoto.style.display = hasPhoto ? 'inline-flex' : 'none';
      }
    }
  }

  /**
   * Selecciona el nodo raíz si no hay ninguno seleccionado
   */
  private selectRootNode(): void {
    if (!this.mindMapInstance) return;
    const root = this.mindMapInstance.renderer?.root;
    if (root) {
      this.mindMapInstance.execCommand('SET_NODE_ACTIVE', root);
      this.activeNode = root;
      this.updateDockButtons(true);
      this.updateNodeDropdownUI();
    }
  }

  /**
   * Guarda o elimina una foto en el recuadro seleccionado adaptando el tamaño inmediatamente
   */
  private setNodePhoto(dataUrl: string | null): void {
    if (!this.activeNode || !this.mindMapInstance) return;
    this.triggerHaptic();

    const photoPreviewWrap = this.container.querySelector('#sheet-photo-preview-wrap') as HTMLElement | null;
    const photoPreviewImg = this.container.querySelector('#sheet-photo-preview-img') as HTMLImageElement | null;

    if (!dataUrl) {
      if (typeof this.activeNode.setData === 'function') {
        this.activeNode.setData({ image: null, imageSize: null });
      } else if (this.activeNode.nodeData?.data) {
        this.activeNode.nodeData.data.image = null;
        delete this.activeNode.nodeData.data.imageSize;
      }

      try {
        this.mindMapInstance.execCommand('SET_NODE_IMAGE', this.activeNode, {
          url: '',
          title: '',
          width: 0,
          height: 0,
          custom: false
        });
      } catch {
        try {
          this.mindMapInstance.execCommand('SET_NODE_DATA', this.activeNode, {
            image: null,
            imageSize: null
          });
        } catch {}
      }

      if (photoPreviewWrap && photoPreviewImg) {
        photoPreviewWrap.style.display = 'none';
      }

      if (typeof this.mindMapInstance.reRender === 'function') {
        this.mindMapInstance.reRender();
      } else if (typeof this.mindMapInstance.render === 'function') {
        this.mindMapInstance.render();
      }

      this.updateNodeDropdownUI();
      this.scheduleDebouncedSave();
      setTimeout(() => this.fitToScreenBounds(), 80);
      return;
    }

    // Pre-cargar la imagen para calcular las proporciones exactas y acomodar el recuadro de inmediato
    const tempImg = new Image();
    tempImg.onload = () => {
      const maxW = 180;
      const maxH = 130;
      const nw = tempImg.naturalWidth || 160;
      const nh = tempImg.naturalHeight || 110;
      const scale = Math.min(maxW / nw, maxH / nh, 1);
      const width = Math.max(40, Math.round(nw * scale));
      const height = Math.max(30, Math.round(nh * scale));
      const imageSize = { width, height, custom: true };

      if (typeof this.activeNode.setData === 'function') {
        this.activeNode.setData({ image: dataUrl, imageSize });
      } else if (this.activeNode.nodeData?.data) {
        this.activeNode.nodeData.data.image = dataUrl;
        this.activeNode.nodeData.data.imageSize = imageSize;
      }

      try {
        this.mindMapInstance.execCommand('SET_NODE_IMAGE', this.activeNode, {
          url: dataUrl,
          title: '',
          width,
          height,
          custom: true
        });
      } catch {
        try {
          this.mindMapInstance.execCommand('SET_NODE_DATA', this.activeNode, {
            image: dataUrl,
            imageSize
          });
        } catch {}
      }

      if (photoPreviewWrap && photoPreviewImg) {
        photoPreviewImg.src = dataUrl;
        photoPreviewWrap.style.display = 'flex';
      }

      // Forzar reRender para que el recuadro SVG mida y ajuste su altura y ancho de inmediato
      if (typeof this.mindMapInstance.reRender === 'function') {
        this.mindMapInstance.reRender();
      } else if (typeof this.mindMapInstance.render === 'function') {
        this.mindMapInstance.render();
      }

      this.updateNodeDropdownUI();
      this.scheduleDebouncedSave();
      setTimeout(() => this.fitToScreenBounds(), 80);
    };

    tempImg.onerror = () => {
      const imageSize = { width: 160, height: 110, custom: true };
      if (typeof this.activeNode.setData === 'function') {
        this.activeNode.setData({ image: dataUrl, imageSize });
      }
      this.mindMapInstance.render();
      this.updateNodeDropdownUI();
    };

    tempImg.src = dataUrl;
  }

  /**
   * Aplica color global a todos los recuadros
   */
  private applyGlobalNodesColor(colorKey: string): void {
    if (!this.mindMapInstance) return;
    const preset = COLOR_PRESETS[colorKey];
    if (!preset) return;

    try {
      const traverse = (node: any) => {
        if (!node) return;
        this.mindMapInstance.execCommand('SET_NODE_STYLES', node, {
          fillColor: preset.fill,
          borderColor: preset.border,
          color: preset.text,
          borderWidth: 2
        });
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(traverse);
        }
      };
      traverse(this.mindMapInstance.renderer?.root);
      this.triggerHaptic();
      this.scheduleDebouncedSave();
    } catch (e) {
      console.warn('[UltraFastMindMap] Error aplicando color global:', e);
    }
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

