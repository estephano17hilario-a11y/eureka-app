import MindMap from 'simple-mind-map';
import '../ui/styles/mindmeister-theme.css';
import { SimpleMindMapAdapter } from '../engine/adapters/SimpleMindMapAdapter';
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
  },
  draculaNeon: {
    name: 'Dracula Neon',
    backgroundColor: '#181a24',
    root: {
      fillColor: '#282a36',
      color: '#ff79c6',
      borderColor: '#ff79c6',
      borderWidth: 2,
      fontSize: 16,
      fontWeight: 'bold',
      active: { borderColor: '#50fa7b', borderWidth: 3 }
    },
    second: {
      fillColor: '#44475a',
      color: '#f8f8f2',
      borderColor: '#bd93f9',
      borderWidth: 1.5,
      fontSize: 14,
      active: { borderColor: '#ff79c6', borderWidth: 2 }
    },
    node: {
      fillColor: '#21222c',
      color: '#8be9fd',
      borderColor: '#6272a4',
      borderWidth: 1,
      fontSize: 13,
      active: { borderColor: '#50fa7b', borderWidth: 2 }
    },
    lineColor: '#ff79c6',
    lineWidth: 2
  },
  nordArctic: {
    name: 'Nord Arctic',
    backgroundColor: '#242933',
    root: {
      fillColor: '#3b4252',
      color: '#88c0d0',
      borderColor: '#88c0d0',
      borderWidth: 2,
      fontSize: 16,
      fontWeight: 'bold',
      active: { borderColor: '#81a1c1', borderWidth: 3 }
    },
    second: {
      fillColor: '#434c5e',
      color: '#eceff4',
      borderColor: '#81a1c1',
      borderWidth: 1.5,
      fontSize: 14,
      active: { borderColor: '#88c0d0', borderWidth: 2 }
    },
    node: {
      fillColor: '#2e3440',
      color: '#d8dee9',
      borderColor: '#4c566a',
      borderWidth: 1,
      fontSize: 13,
      active: { borderColor: '#88c0d0', borderWidth: 2 }
    },
    lineColor: '#88c0d0',
    lineWidth: 2
  },
  sunsetCrimson: {
    name: 'Sunset Crimson',
    backgroundColor: '#18070d',
    root: {
      fillColor: '#881337',
      color: '#ffe4e6',
      borderColor: '#f43f5e',
      borderWidth: 2,
      fontSize: 16,
      fontWeight: 'bold',
      active: { borderColor: '#fb7185', borderWidth: 3 }
    },
    second: {
      fillColor: '#9f1239',
      color: '#ffffff',
      borderColor: '#fb7185',
      borderWidth: 1.5,
      fontSize: 14,
      active: { borderColor: '#f43f5e', borderWidth: 2 }
    },
    node: {
      fillColor: '#4c0519',
      color: '#fecdd3',
      borderColor: '#e11d48',
      borderWidth: 1,
      fontSize: 13,
      active: { borderColor: '#fb7185', borderWidth: 2 }
    },
    lineColor: '#f43f5e',
    lineWidth: 2
  },
  sakuraRose: {
    name: 'Sakura Rose',
    backgroundColor: '#150a14',
    root: {
      fillColor: '#701a75',
      color: '#fdf4ff',
      borderColor: '#f472b6',
      borderWidth: 2,
      fontSize: 16,
      fontWeight: 'bold',
      active: { borderColor: '#fbcfe8', borderWidth: 3 }
    },
    second: {
      fillColor: '#86198f',
      color: '#ffffff',
      borderColor: '#f472b6',
      borderWidth: 1.5,
      fontSize: 14,
      active: { borderColor: '#fbcfe8', borderWidth: 2 }
    },
    node: {
      fillColor: '#4a044e',
      color: '#f5d0fe',
      borderColor: '#a21caf',
      borderWidth: 1,
      fontSize: 13,
      active: { borderColor: '#f472b6', borderWidth: 2 }
    },
    lineColor: '#f472b6',
    lineWidth: 2
  },
  cleanOled: {
    name: 'Clean OLED',
    backgroundColor: '#000000',
    root: {
      fillColor: '#0a0a0c',
      color: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 2,
      fontSize: 16,
      fontWeight: 'bold',
      active: { borderColor: '#38bdf8', borderWidth: 3 }
    },
    second: {
      fillColor: '#121217',
      color: '#f8fafc',
      borderColor: '#94a3b8',
      borderWidth: 1.5,
      fontSize: 14,
      active: { borderColor: '#ffffff', borderWidth: 2 }
    },
    node: {
      fillColor: '#050507',
      color: '#cbd5e1',
      borderColor: '#334155',
      borderWidth: 1,
      fontSize: 13,
      active: { borderColor: '#38bdf8', borderWidth: 2 }
    },
    lineColor: '#38bdf8',
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
  private mindmeisterAdapter: SimpleMindMapAdapter | null = null;
  private saveDebounceTimer: number | null = null;
  private isDestroyed: boolean = false;
  private keyboardListenerHandle: any = null;
  private currentLayout: string = 'logicalStructure';
  private currentTheme: string = 'cyberDark';
  private searchMatches: any[] = [];
  private currentSearchIndex: number = -1;
  public activeDropdown: 'map' | 'node' | null = null;
  private canvasBgMode: 'dark' | 'light' = 'dark';
  private activeInlineEditor: HTMLTextAreaElement | null = null;

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

  private getLayoutEmoji(layout: string): string {
    const map: Record<string, string> = {
      logicalStructure: '🌲',
      mindMap: '🧠',
      organizationStructure: '🏛️',
      catalogOrganization: '📑',
      timeline: '⏳',
      timeline2: '⌛',
      fishbone: '🐟',
      verticalMindMap: '🏢'
    };
    return map[layout] || '🌲';
  }

  private getThemeEmoji(theme: string): string {
    const map: Record<string, string> = {
      cyberDark: '🌌',
      oceanBlue: '🌊',
      bioEmerald: '🍃',
      midnightPurple: '🔮',
      obsidianGold: '⚡',
      draculaNeon: '🧛',
      nordArctic: '❄️',
      sunsetCrimson: '🌅',
      sakuraRose: '🌸',
      cleanOled: '🖤'
    };
    return map[theme] || '🌌';
  }

  /**
   * 1. ARQUITECTURA E INICIALIZACIÓN SÚPER LIGERA
   */
  public mount(): void {
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

          <!-- LOS 2 BOTONES CHICOS SOLICITADOS (SIN NOMBRES): '🗺️' Y '🔲' -->
          <div class="mindmap-top-two-buttons">
            <button class="mindmap-header-action-pill mindmap-icon-only-pill" id="btn-toggle-menu-map" title="Configuración del mapa">
              <span class="pill-icon">🗺️</span>
              <span class="pill-chevron">▾</span>
            </button>
            <button class="mindmap-header-action-pill mindmap-icon-only-pill" id="btn-toggle-menu-node" title="Configuración del recuadro">
              <span class="pill-icon">🔲</span>
              <span class="pill-chevron">▾</span>
            </button>
          </div>

          <div class="top-bar-right">
            <button class="mindmap-touch-btn mindmap-touch-btn-compact" id="btn-map-undo" title="Deshacer (Ctrl+Z)" aria-label="Deshacer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </button>
            <button class="mindmap-touch-btn mindmap-touch-btn-compact" id="btn-map-redo" title="Rehacer (Ctrl+Y)" aria-label="Rehacer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
            </button>
          </div>
        </header>

        <!-- Input Oculto para Cargar Fotos en los Recuadros -->
        <input type="file" id="mindmap-photo-file-input" accept="image/*" style="display:none;" />

        <!-- Panel Desplegable: 'MAPA' (Ultra Compacto: Solo Emojis y Círculos) -->
        <div class="mindmap-dropdown-menu-panel apple-glass-panel" id="mindmap-dropdown-map" style="display:none;">
          <!-- 1. Esquema: Solo Emoji -->
          <div class="dropdown-h-group popover-anchor">
            <button type="button" class="compact-trigger-pill" id="btn-trigger-layout" title="Tipo de esquema">
              <span class="trigger-val-emoji" id="preview-layout-emoji">${this.getLayoutEmoji(this.currentLayout)}</span>
              <span class="mini-chevron">▾</span>
            </button>
            <div class="popover-bubble" id="popover-layout" style="display:none;">
              <button type="button" class="popover-item-emoji ${this.currentLayout === 'logicalStructure' ? 'active' : ''}" data-layout="logicalStructure" title="Lógica">🌲</button>
              <button type="button" class="popover-item-emoji ${this.currentLayout === 'mindMap' ? 'active' : ''}" data-layout="mindMap" title="Radial">🧠</button>
              <button type="button" class="popover-item-emoji ${this.currentLayout === 'organizationStructure' ? 'active' : ''}" data-layout="organizationStructure" title="Organigrama">🏛️</button>
              <button type="button" class="popover-item-emoji ${this.currentLayout === 'catalogOrganization' ? 'active' : ''}" data-layout="catalogOrganization" title="Catálogo">📑</button>
              <button type="button" class="popover-item-emoji ${this.currentLayout === 'timeline' ? 'active' : ''}" data-layout="timeline" title="Línea Horizontal">⏳</button>
              <button type="button" class="popover-item-emoji ${this.currentLayout === 'timeline2' ? 'active' : ''}" data-layout="timeline2" title="Línea Vertical">⌛</button>
              <button type="button" class="popover-item-emoji ${this.currentLayout === 'fishbone' ? 'active' : ''}" data-layout="fishbone" title="Ishikawa">🐟</button>
              <button type="button" class="popover-item-emoji ${this.currentLayout === 'verticalMindMap' ? 'active' : ''}" data-layout="verticalMindMap" title="Jerárquico">🏢</button>
            </div>
          </div>

          <div class="dropdown-h-divider"></div>

          <!-- 2. Fondo: Solo Emoji -->
          <div class="dropdown-h-group popover-anchor">
            <button type="button" class="compact-trigger-pill" id="btn-trigger-theme" title="Tema de fondo">
              <span class="trigger-val-emoji" id="preview-theme-emoji">${this.getThemeEmoji(this.currentTheme)}</span>
              <span class="mini-chevron">▾</span>
            </button>
            <div class="popover-bubble popover-grid-theme" id="popover-theme" style="display:none;">
              <button type="button" class="popover-item-emoji ${this.currentTheme === 'cyberDark' ? 'active' : ''}" data-theme="cyberDark" title="Cyber">🌌</button>
              <button type="button" class="popover-item-emoji ${this.currentTheme === 'oceanBlue' ? 'active' : ''}" data-theme="oceanBlue" title="Ocean">🌊</button>
              <button type="button" class="popover-item-emoji ${this.currentTheme === 'bioEmerald' ? 'active' : ''}" data-theme="bioEmerald" title="Bio">🍃</button>
              <button type="button" class="popover-item-emoji ${this.currentTheme === 'midnightPurple' ? 'active' : ''}" data-theme="midnightPurple" title="Purple">🔮</button>
              <button type="button" class="popover-item-emoji ${this.currentTheme === 'obsidianGold' ? 'active' : ''}" data-theme="obsidianGold" title="Gold">⚡</button>
              <button type="button" class="popover-item-emoji ${this.currentTheme === 'draculaNeon' ? 'active' : ''}" data-theme="draculaNeon" title="Dracula">🧛</button>
              <button type="button" class="popover-item-emoji ${this.currentTheme === 'nordArctic' ? 'active' : ''}" data-theme="nordArctic" title="Nord">❄️</button>
              <button type="button" class="popover-item-emoji ${this.currentTheme === 'sunsetCrimson' ? 'active' : ''}" data-theme="sunsetCrimson" title="Sunset">🌅</button>
              <button type="button" class="popover-item-emoji ${this.currentTheme === 'sakuraRose' ? 'active' : ''}" data-theme="sakuraRose" title="Sakura">🌸</button>
              <button type="button" class="popover-item-emoji ${this.currentTheme === 'cleanOled' ? 'active' : ''}" data-theme="cleanOled" title="OLED">🖤</button>
            </div>
          </div>

          <div class="dropdown-h-divider"></div>

          <!-- 3. Color Recuadros: Solo Círculo de Color -->
          <div class="dropdown-h-group popover-anchor">
            <button type="button" class="compact-trigger-pill" id="btn-trigger-global-color" title="Color de recuadros">
              <span class="color-dot-circle" id="preview-global-color" style="background:#0ea5e9;"></span>
              <span class="mini-chevron">▾</span>
            </button>
            <div class="popover-bubble" id="popover-global-color" style="display:none;">
              <button type="button" class="color-dot-btn" data-color="blue" style="background:#0ea5e9;" title="Cyan"></button>
              <button type="button" class="color-dot-btn" data-color="purple" style="background:#a855f7;" title="Violeta"></button>
              <button type="button" class="color-dot-btn" data-color="emerald" style="background:#10b981;" title="Esmeralda"></button>
              <button type="button" class="color-dot-btn" data-color="amber" style="background:#f59e0b;" title="Ámbar"></button>
              <button type="button" class="color-dot-btn" data-color="rose" style="background:#ec4899;" title="Rosa"></button>
              <button type="button" class="color-dot-btn" data-color="dark" style="background:#334155;" title="Pizarra"></button>
            </div>
          </div>

          <div class="dropdown-h-divider"></div>

          <!-- 4. Modo Fondo Claro / Oscuro -->
          <div class="dropdown-h-group popover-anchor">
            <button type="button" class="compact-trigger-pill" id="btn-trigger-canvas-mode" title="Modo de Fondo: Claro / Oscuro">
              <span class="trigger-val-emoji" id="preview-canvas-mode">${this.canvasBgMode === 'light' ? '☀️' : '🌙'}</span>
              <span class="mini-chevron">▾</span>
            </button>
            <div class="popover-bubble" id="popover-canvas-mode" style="display:none;">
              <button type="button" class="popover-item-emoji ${this.canvasBgMode === 'dark' ? 'active' : ''}" data-canvas-mode="dark" title="Fondo Oscuro">🌙</button>
              <button type="button" class="popover-item-emoji ${this.canvasBgMode === 'light' ? 'active' : ''}" data-canvas-mode="light" title="Fondo Claro">☀️</button>
            </div>
          </div>

          <button type="button" class="btn-dropdown-close-sm" id="btn-close-map-dropdown" title="Cerrar barra">✕</button>
        </div>

        <!-- Panel Desplegable: 'RECUADRO' (Ultra Compacto: Solo Emojis, Números y Círculos) -->
        <div class="mindmap-dropdown-menu-panel apple-glass-panel" id="mindmap-dropdown-node" style="display:none;">
          <div id="node-dropdown-empty-notice" class="dropdown-h-group" style="display:none; align-items:center; gap:8px;">
            <span style="font-size:0.8rem; color:var(--f-text-secondary);">Toca un recuadro o</span>
            <button class="figma-btn-white-pill-sm" id="btn-select-root-node">
              Seleccionar Raíz
            </button>
          </div>

          <div id="node-dropdown-content" style="display:inline-flex; align-items:center; gap:8px;">
            <!-- 1. Color de Fondo del Recuadro (Solo Círculo de Color) -->
            <div class="dropdown-h-group popover-anchor">
              <button type="button" class="compact-trigger-pill" id="btn-trigger-node-bg" title="Color de fondo del recuadro">
                <span class="color-dot-circle" id="preview-node-bg" style="background:#0ea5e9;"></span>
                <span class="mini-chevron">▾</span>
              </button>
              <div class="popover-bubble" id="popover-node-bg" style="display:none;">
                <button type="button" class="color-dot-btn" data-node-bg="blue" style="background:#0ea5e9;" title="Cyan"></button>
                <button type="button" class="color-dot-btn" data-node-bg="purple" style="background:#a855f7;" title="Violeta"></button>
                <button type="button" class="color-dot-btn" data-node-bg="emerald" style="background:#10b981;" title="Esmeralda"></button>
                <button type="button" class="color-dot-btn" data-node-bg="amber" style="background:#f59e0b;" title="Ámbar"></button>
                <button type="button" class="color-dot-btn" data-node-bg="rose" style="background:#ec4899;" title="Rosa"></button>
                <button type="button" class="color-dot-btn" data-node-bg="dark" style="background:#334155;" title="Pizarra"></button>
              </div>
            </div>

            <div class="dropdown-h-divider"></div>

            <!-- 2. Color del Texto (Solo Círculo de Color) -->
            <div class="dropdown-h-group popover-anchor">
              <button type="button" class="compact-trigger-pill" id="btn-trigger-node-text" title="Color del texto">
                <span class="color-dot-circle" id="preview-node-text" style="background:#ffffff; border:1px solid rgba(255,255,255,0.4);"></span>
                <span class="mini-chevron">▾</span>
              </button>
              <div class="popover-bubble" id="popover-node-text" style="display:none;">
                <button type="button" class="color-dot-btn" data-text-color="#ffffff" style="background:#ffffff; border:1px solid #94a3b8;" title="Blanco"></button>
                <button type="button" class="color-dot-btn" data-text-color="#38bdf8" style="background:#38bdf8;" title="Cyan"></button>
                <button type="button" class="color-dot-btn" data-text-color="#34d399" style="background:#34d399;" title="Verde"></button>
                <button type="button" class="color-dot-btn" data-text-color="#fbbf24" style="background:#fbbf24;" title="Dorado"></button>
                <button type="button" class="color-dot-btn" data-text-color="#f472b6" style="background:#f472b6;" title="Rosa"></button>
                <button type="button" class="color-dot-btn" data-text-color="#94a3b8" style="background:#94a3b8;" title="Gris"></button>
              </div>
            </div>

            <div class="dropdown-h-divider"></div>

            <!-- 3. Tamaño de Letra (Solo Número) + Negrita -->
            <div class="dropdown-h-group popover-anchor">
              <button type="button" class="compact-trigger-pill" id="btn-trigger-font-size" title="Tamaño de texto">
                <span class="trigger-val-num" id="preview-node-font-size">14</span>
                <span class="mini-chevron">▾</span>
              </button>
              <div class="popover-bubble" id="popover-node-font-size" style="display:none;">
                <button type="button" class="popover-item-number" data-size="12">12</button>
                <button type="button" class="popover-item-number active" data-size="14">14</button>
                <button type="button" class="popover-item-number" data-size="18">18</button>
                <button type="button" class="popover-item-number" data-size="22">22</button>
              </div>
            </div>
            <button type="button" class="text-size-btn text-size-btn-sm" id="btn-toggle-bold" title="Negrita"><strong>B</strong></button>

            <div class="dropdown-h-divider"></div>

            <!-- 4. Foto del Recuadro -->
            <div class="dropdown-h-group">
              <button type="button" class="compact-trigger-pill" id="btn-upload-node-photo" title="Adjuntar foto al recuadro">
                📷
              </button>
              <button type="button" class="compact-trigger-pill danger" id="btn-remove-node-photo" style="display:none;" title="Eliminar foto">
                🗑️
              </button>
            </div>

            <div class="dropdown-h-divider"></div>

            <!-- 5. Acciones de Edición -->
            <div class="dropdown-h-group">
              <button type="button" class="compact-trigger-pill" id="btn-open-direct-text-editor" title="Editar texto">
                ✏️
              </button>
              <button type="button" class="compact-trigger-pill" id="btn-open-katex-from-node-menu" title="Fórmula KaTeX">
                📐
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
                <button type="button" class="figma-btn-white-pill-sm" id="btn-sheet-undo" title="Deshacer (Ctrl+Z)">
                  ↶
                </button>
                <button type="button" class="figma-btn-white-pill-sm" id="btn-sheet-redo" title="Rehacer (Ctrl+Y)">
                  ↷
                </button>
                <button type="button" class="figma-btn-white-pill" id="btn-node-sheet-photo" style="padding:4px 10px; font-size:0.75rem; color:#38bdf8; border-color:rgba(56,189,248,0.3);">
                  📷 Foto
                </button>
                <button type="button" class="figma-btn-white-pill" id="btn-node-sheet-katex" style="padding:4px 10px; font-size:0.75rem; border-color:rgba(56,189,248,0.4); color:#38bdf8;">
                  📐 KaTeX
                </button>
                <button id="btn-sheet-close" class="btn-sheet-close" aria-label="Cerrar">✕</button>
              </div>
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
      // 1. Cargar instantáneamente de localStorage para nunca perder datos
      if (this.config.storageKey) {
        const localStr = localStorage.getItem(this.config.storageKey);
        if (localStr) {
          const parsed = JSON.parse(localStr);
          if (parsed && (parsed.root || parsed.data)) {
            mapData = parsed;
          }
        }

        // Cargar metadatos de estructura y tema
        const metaStr = localStorage.getItem(`${this.config.storageKey}_meta`);
        if (metaStr) {
          try {
            const meta = JSON.parse(metaStr);
            if (meta.layout) this.currentLayout = meta.layout;
            if (meta.theme && THEME_PRESETS[meta.theme]) this.currentTheme = meta.theme;
          } catch {}
        }
      }
    } catch {}

    // 2. Fallback a Preferences de Capacitor o activeStudyService si localStorage no tenía datos
    if (!mapData || mapData === this.config.initialData) {
      if (this.config.topicId) {
        const serviceData = activeStudyService.getMindMapState(this.config.topicId);
        if (serviceData && (serviceData.root || serviceData.data)) {
          mapData = serviceData;
        }
      }

      if (!mapData || mapData === this.config.initialData) {
        try {
          const saved = await Preferences.get({ key: this.config.storageKey! });
          if (saved.value) {
            const parsed = JSON.parse(saved.value);
            if (parsed && (parsed.root || parsed.data)) {
              mapData = parsed;
            }
          }
        } catch {
          // Fallback a datos iniciales
        }
      }
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
        textEl.className = 'eureka-node-text-rendered';
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
        lineWidth: themeObj.lineWidth,
        nodeUseLineStyle: false
      }
    });

    // 🚀 Integración del Paradigma MindMeister: Splines Adaptativas C^1, Ribbons Cónicas, Frustum Culling y Gestos a 60 FPS
    this.mindmeisterAdapter = new SimpleMindMapAdapter(this.mindMapInstance, {
      container: canvasEl,
      enableRibbons: true,
      enableCulling: true,
      enableTouchEngine: true,
      enablePillToolbar: true
    });

    // Restaurar modo de fondo de lienzo (oscuro / claro) guardado
    const savedBgMode = localStorage.getItem('eureka_mindmap_canvas_bg_mode') as 'dark' | 'light' | null;
    if (savedBgMode) {
      this.canvasBgMode = savedBgMode;
      this.mindmeisterAdapter.setCanvasBgMode(savedBgMode);
      const preview = this.container.querySelector('#preview-canvas-mode');
      if (preview) preview.textContent = savedBgMode === 'light' ? '☀️' : '🌙';
    }

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
    root.querySelector('#btn-map-back')?.addEventListener('click', async () => {
      this.triggerHaptic();
      this.saveSync();
      await this.saveInstantly();
      this.config.onBack?.();
    });

    root.querySelector('#btn-map-undo')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.mindMapInstance?.execCommand('BACK');
      this.scheduleDebouncedSave();
    });

    root.querySelector('#btn-map-redo')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.mindMapInstance?.execCommand('FORWARD');
      this.scheduleDebouncedSave();
    });

    root.querySelector('#btn-ribbon-undo')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.mindMapInstance?.execCommand('BACK');
      this.scheduleDebouncedSave();
    });

    root.querySelector('#btn-ribbon-redo')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.mindMapInstance?.execCommand('FORWARD');
      this.scheduleDebouncedSave();
    });

    // Botón Flotante de Centrado de Límites
    root.querySelector('#btn-floating-fit')?.addEventListener('click', () => {
      this.fitToScreenBounds();
    });

    // Helper para cerrar todos los popovers flotantes
    const closeAllPopovers = () => {
      root.querySelectorAll<HTMLElement>('.popover-bubble').forEach((el) => {
        el.style.display = 'none';
      });
      root.querySelectorAll<HTMLElement>('.compact-trigger-pill').forEach((btn) => {
        btn.classList.remove('active');
      });
    };

    // Helper para alternar un popover específico
    const togglePopover = (popoverId: string, triggerId: string) => {
      const popover = root.querySelector(`#${popoverId}`) as HTMLElement | null;
      const trigger = root.querySelector(`#${triggerId}`) as HTMLElement | null;
      if (!popover) return;
      const isClosed = popover.style.display === 'none';
      closeAllPopovers();
      if (isClosed) {
        popover.style.display = 'flex';
        trigger?.classList.add('active');
      }
      this.triggerHaptic();
    };

    // ============================================================
    // 🗺️ CONTROL DE MENÚ DESPLEGABLE: 'MAPA' (Ultra Compacto)
    // ============================================================
    root.querySelector('#btn-toggle-menu-map')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      this.toggleDropdown('map');
    });

    root.querySelector('#btn-close-map-dropdown')?.addEventListener('click', () => {
      closeAllPopovers();
      this.closeAllDropdowns();
    });

    // 1. Selector de Esquema (Solo Emoji)
    root.querySelector('#btn-trigger-layout')?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('popover-layout', 'btn-trigger-layout');
    });

    root.querySelectorAll<HTMLButtonElement>('#popover-layout [data-layout]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const layout = btn.dataset.layout;
        if (layout && this.mindMapInstance) {
          this.currentLayout = layout;
          this.mindMapInstance.setLayout(layout);
          const preview = root.querySelector('#preview-layout-emoji');
          if (preview) preview.textContent = this.getLayoutEmoji(layout);
          root.querySelectorAll('#popover-layout [data-layout]').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.triggerHaptic();
          this.saveSync();
          closeAllPopovers();
          setTimeout(() => this.fitToScreenBounds(), 120);
        }
      });
    });

    // 2. Selector de Tema de Fondo (Solo Emoji)
    root.querySelector('#btn-trigger-theme')?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('popover-theme', 'btn-trigger-theme');
    });

    root.querySelectorAll<HTMLButtonElement>('#popover-theme [data-theme]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const themeKey = btn.dataset.theme;
        if (themeKey && this.mindMapInstance) {
          this.applyTheme(themeKey);
          const preview = root.querySelector('#preview-theme-emoji');
          if (preview) preview.textContent = this.getThemeEmoji(themeKey);
          root.querySelectorAll('#popover-theme [data-theme]').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          closeAllPopovers();
        }
      });
    });

    // 3. Selector de Color Global de Recuadros (Solo Círculo de Color)
    root.querySelector('#btn-trigger-global-color')?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('popover-global-color', 'btn-trigger-global-color');
    });

    root.querySelectorAll<HTMLButtonElement>('#popover-global-color [data-color]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const colorKey = btn.dataset.color;
        if (colorKey) {
          this.applyGlobalNodesColor(colorKey);
          const preview = root.querySelector('#preview-global-color') as HTMLElement | null;
          if (preview) preview.style.background = btn.style.background;
          closeAllPopovers();
        }
      });
    });

    // 4. Selector de Modo Claro / Oscuro del Lienzo
    root.querySelector('#btn-trigger-canvas-mode')?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('popover-canvas-mode', 'btn-trigger-canvas-mode');
    });

    root.querySelectorAll<HTMLButtonElement>('#popover-canvas-mode [data-canvas-mode]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.dataset.canvasMode as 'dark' | 'light';
        if (mode) {
          this.setCanvasBackgroundMode(mode);
          root.querySelectorAll('#popover-canvas-mode [data-canvas-mode]').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          closeAllPopovers();
        }
      });
    });

    // ============================================================
    // 🔲 CONTROL DE MENÚ DESPLEGABLE: 'RECUADRO' (Ultra Compacto)
    // ============================================================
    root.querySelector('#btn-toggle-menu-node')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      this.toggleDropdown('node');
    });

    root.querySelector('#btn-close-node-dropdown')?.addEventListener('click', () => {
      closeAllPopovers();
      this.closeAllDropdowns();
    });

    root.querySelector('#btn-select-root-node')?.addEventListener('click', () => {
      this.selectRootNode();
    });

    // 1. Selector de Color de Fondo del Recuadro (Solo Círculo)
    root.querySelector('#btn-trigger-node-bg')?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('popover-node-bg', 'btn-trigger-node-bg');
    });

    root.querySelectorAll<HTMLButtonElement>('#popover-node-bg [data-node-bg]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const colorKey = btn.dataset.nodeBg;
        if (colorKey && this.activeNode && this.mindMapInstance) {
          this.applyNodeColor(colorKey);
          const preview = root.querySelector('#preview-node-bg') as HTMLElement | null;
          if (preview) preview.style.background = btn.style.background;
          closeAllPopovers();
        }
      });
    });

    // 2. Selector de Color del Texto del Recuadro (Solo Círculo)
    root.querySelector('#btn-trigger-node-text')?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('popover-node-text', 'btn-trigger-node-text');
    });

    root.querySelectorAll<HTMLButtonElement>('#popover-node-text [data-text-color]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const textColor = btn.dataset.textColor;
        if (textColor && this.activeNode && this.mindMapInstance) {
          this.mindMapInstance.execCommand('SET_NODE_STYLES', this.activeNode, {
            color: textColor
          });
          const preview = root.querySelector('#preview-node-text') as HTMLElement | null;
          if (preview) {
            preview.style.background = textColor;
            preview.style.borderColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'transparent';
          }
          this.triggerHaptic();
          this.scheduleDebouncedSave();
          closeAllPopovers();
        }
      });
    });

    // 3. Selector de Tamaño de Texto del Recuadro (Solo Número)
    root.querySelector('#btn-trigger-font-size')?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('popover-node-font-size', 'btn-trigger-font-size');
    });

    root.querySelectorAll<HTMLButtonElement>('#popover-node-font-size [data-size]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const size = Number(btn.dataset.size);
        if (size && this.activeNode && this.mindMapInstance) {
          this.mindMapInstance.execCommand('SET_NODE_STYLES', this.activeNode, {
            fontSize: size
          });
          const preview = root.querySelector('#preview-node-font-size');
          if (preview) preview.textContent = String(size);
          root.querySelectorAll('#popover-node-font-size [data-size]').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.triggerHaptic();
          this.scheduleDebouncedSave();
          closeAllPopovers();
        }
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

    // 📷 Inserción de Fotos en Recuadros
    const photoInput = root.querySelector('#mindmap-photo-file-input') as HTMLInputElement | null;
    const triggerPhotoPick = () => {
      if (!this.activeNode) {
        this.selectRootNode();
      }
      photoInput?.click();
    };

    root.querySelector('#btn-upload-node-photo')?.addEventListener('click', () => {
      if (!this.activeNode) {
        this.selectRootNode();
      }
      if (this.mindmeisterAdapter && this.activeNode) {
        this.mindmeisterAdapter.promptAddPhoto(this.activeNode);
      } else {
        triggerPhotoPick();
      }
    });
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

    // Cerrar dropdowns y popovers al hacer clic fuera
    root.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.popover-anchor') && !target.closest('.popover-bubble')) {
        closeAllPopovers();
      }
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

    // Botones de Deshacer y Rehacer dentro del panel de edición de texto
    root.querySelector('#btn-sheet-undo')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.mindMapInstance?.execCommand('BACK');
      const cur = (this.activeNode?.getData ? this.activeNode.getData('rawText') : this.activeNode?.nodeData?.data?.rawText) || (this.activeNode?.getData ? this.activeNode.getData('text') : this.activeNode?.nodeData?.data?.text) || '';
      input.value = cur;
      updateLivePreviewAndNode();
    });

    root.querySelector('#btn-sheet-redo')?.addEventListener('click', () => {
      this.triggerHaptic();
      this.mindMapInstance?.execCommand('FORWARD');
      const cur = (this.activeNode?.getData ? this.activeNode.getData('rawText') : this.activeNode?.nodeData?.data?.rawText) || (this.activeNode?.getData ? this.activeNode.getData('text') : this.activeNode?.nodeData?.data?.text) || '';
      input.value = cur;
      updateLivePreviewAndNode();
    });

    const closeSheet = () => {
      sheet.style.display = 'none';
      const fitFloatingBtn = root.querySelector('#btn-floating-fit') as HTMLElement | null;
      if (fitFloatingBtn) fitFloatingBtn.style.display = 'flex';
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

    const preview = this.container.querySelector('#preview-theme-emoji');
    if (preview) {
      preview.textContent = this.getThemeEmoji(themeKey);
    }

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
      this.saveSync();
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
      this.saveSync();
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
  public expandAllNodes(): void {
    if (!this.mindMapInstance) return;
    try {
      this.mindMapInstance.execCommand('EXPAND_ALL');
      this.triggerHaptic();
      setTimeout(() => this.fitToScreenBounds(), 120);
    } catch {
      // Fallback
    }
  }

  public collapseAllNodes(): void {
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
  public openFlashcardsDrawer(): void {
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
  public openShortcutsModal(): void {
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
  public async exportPngImage(): Promise<void> {
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
  public exportJson(): void {
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
   * Conmuta el modo de fondo del lienzo (claro / oscuro) y lo persiste
   */
  public setCanvasBackgroundMode(mode: 'dark' | 'light'): void {
    this.canvasBgMode = mode;
    this.triggerHaptic();
    this.mindmeisterAdapter?.setCanvasBgMode(mode);
    try {
      localStorage.setItem('eureka_mindmap_canvas_bg_mode', mode);
    } catch {}
    const preview = this.container.querySelector('#preview-canvas-mode');
    if (preview) {
      preview.textContent = mode === 'light' ? '☀️' : '🌙';
    }
  }

  /**
   * 4. GESTIÓN DE EDICIÓN DIRECTA EN EL MISMO RECUADRO SELECCIONADO (IN-PLACE INLINE EDITING)
   * Elimina cualquier segundo recuadro superpuesto debajo y permite escribir directamente
   * dentro del nodo con cursor/rayita de texto brillante (#38bdf8) de alto contraste.
   */
  private openDirectTextEditor(): void {
    if (!this.activeNode || !this.mindMapInstance) return;
    this.triggerHaptic();

    if (this.activeInlineEditor) {
      this.activeInlineEditor.focus();
      return;
    }

    const node = this.activeNode;

    // 1. Obtener texto actual (si tiene rawText guardado se usa preferentemente)
    let currentText = (node.getData ? node.getData('text') : node.nodeData?.data?.text) || '';
    const rawText = node.getData ? node.getData('rawText') : node.nodeData?.data?.rawText;
    if (rawText !== undefined && rawText !== null) {
      currentText = rawText;
    } else {
      currentText = currentText.replace(/<br\s*\/?>/gi, '\n');
    }

    // 2. Obtener el contenedor del texto dentro del nodo DOM o el grupo del nodo
    const groupNode = node.group?.node as SVGGraphicsElement | null;
    const customNodeEl = groupNode?.querySelector('.eureka-mindmap-custom-node') as HTMLElement | null;
    const textRenderedEl = groupNode?.querySelector('.eureka-node-text-rendered') as HTMLElement | null;
    const targetElement = textRenderedEl || customNodeEl || groupNode;

    const canvasContainer = this.container.querySelector('#mindmap-render-canvas') as HTMLElement | null;
    if (!canvasContainer || !targetElement) return;

    const targetRect = targetElement.getBoundingClientRect();
    const containerRect = canvasContainer.getBoundingClientRect();

    // 3. Crear textarea superpuesto exactamente en la posición del recuadro
    const editor = document.createElement('textarea');
    editor.className = 'eureka-inline-node-editor';
    editor.value = currentText;
    editor.autocomplete = 'off';
    editor.spellcheck = false;

    // Calcular dimensiones y posición relativas al contenedor del canvas
    const relLeft = targetRect.left - containerRect.left;
    const relTop = targetRect.top - containerRect.top;
    const minW = Math.max(targetRect.width, 110);
    const minH = Math.max(targetRect.height, 36);

    editor.style.left = `${Math.round(relLeft)}px`;
    editor.style.top = `${Math.round(relTop)}px`;
    editor.style.width = `${Math.round(minW)}px`;
    editor.style.minWidth = `${Math.round(minW)}px`;
    editor.style.height = `${Math.round(minH)}px`;
    editor.style.minHeight = `${Math.round(minH)}px`;

    // Heredar estilos tipográficos del nodo
    const fontSize = typeof node.getStyle === 'function' ? node.getStyle('fontSize', false) : 14;
    const fontWeight = typeof node.getStyle === 'function' ? node.getStyle('fontWeight', false) : 'normal';
    const textColor = typeof node.getStyle === 'function' ? node.getStyle('color', false) : (this.canvasBgMode === 'light' ? '#0f172a' : '#ffffff');
    const fillColor = typeof node.getStyle === 'function' ? node.getStyle('fillColor', false) : (this.canvasBgMode === 'light' ? '#ffffff' : '#141724');

    editor.style.fontSize = `${fontSize || 14}px`;
    editor.style.fontWeight = fontWeight || 'normal';
    editor.style.color = textColor || (this.canvasBgMode === 'light' ? '#0f172a' : '#ffffff');
    editor.style.backgroundColor = fillColor || (this.canvasBgMode === 'light' ? '#ffffff' : '#141724');
    editor.style.caretColor = '#38bdf8'; // Indicador de la rayita para escribir (cursor visible)

    // Ocultar temporalmente el texto estático para evitar doble visión
    if (textRenderedEl) {
      textRenderedEl.style.opacity = '0';
    }

    this.activeInlineEditor = editor;
    canvasContainer.appendChild(editor);

    // Auto-ajustar altura al escribir dinámicamente
    const autoAdjustSize = () => {
      editor.style.height = 'auto';
      editor.style.height = `${Math.max(minH, editor.scrollHeight)}px`;
    };

    editor.addEventListener('input', () => {
      autoAdjustSize();
    });

    let isCommitted = false;
    const commitChanges = () => {
      if (isCommitted) return;
      isCommitted = true;

      const newText = editor.value;
      if (textRenderedEl) {
        textRenderedEl.style.opacity = '1';
      }

      if (editor.parentNode) {
        editor.parentNode.removeChild(editor);
      }
      this.activeInlineEditor = null;

      if (this.activeNode && this.mindMapInstance) {
        if (typeof this.activeNode.setData === 'function') {
          this.activeNode.setData({ text: newText || ' ', rawText: newText });
        } else if (this.activeNode.nodeData?.data) {
          this.activeNode.nodeData.data.text = newText || ' ';
          this.activeNode.nodeData.data.rawText = newText;
        }

        if (typeof this.mindMapInstance.render === 'function') {
          this.mindMapInstance.render();
        } else {
          this.mindMapInstance.execCommand('SET_NODE_TEXT', this.activeNode, newText || ' ');
        }
        this.triggerHaptic();
        this.scheduleDebouncedSave();
      }
    };

    // Al perder el foco (clic afuera): confirmar y guardar
    editor.addEventListener('blur', () => {
      commitChanges();
    });

    // Control de teclado en el editor inline
    editor.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        commitChanges();
      } else if (e.key === 'Enter') {
        if (e.shiftKey) {
          // Shift+Enter permite salto de línea
          autoAdjustSize();
        } else {
          // Enter normal confirma edición
          e.preventDefault();
          commitChanges();
        }
      }
    });

    // Enfocar inmediatamente y poner el cursor al final con rayita visible
    setTimeout(() => {
      editor.focus();
      editor.setSelectionRange(editor.value.length, editor.value.length);
      autoAdjustSize();
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

    this.container.querySelectorAll<HTMLElement>('.popover-bubble').forEach((el) => {
      el.style.display = 'none';
    });
    this.container.querySelectorAll<HTMLElement>('.compact-trigger-pill').forEach((btn) => {
      btn.classList.remove('active');
    });
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

      // Tamaño de fuente: solo número
      const curFontSize = typeof this.activeNode.getStyle === 'function' ? this.activeNode.getStyle('fontSize', false) : 14;
      const previewSize = this.container.querySelector('#preview-node-font-size');
      if (previewSize && curFontSize) {
        previewSize.textContent = String(curFontSize);
      }

      // Color de texto: círculo de color
      const curTextColor = typeof this.activeNode.getStyle === 'function' ? this.activeNode.getStyle('color', false) : '#ffffff';
      const previewText = this.container.querySelector('#preview-node-text') as HTMLElement | null;
      if (previewText && curTextColor) {
        previewText.style.background = curTextColor;
        previewText.style.borderColor = curTextColor === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'transparent';
      }

      // Color de fondo: círculo de color
      const curFillColor = typeof this.activeNode.getStyle === 'function' ? this.activeNode.getStyle('fillColor', false) : null;
      const previewBg = this.container.querySelector('#preview-node-bg') as HTMLElement | null;
      if (previewBg && curFillColor) {
        previewBg.style.background = curFillColor;
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
   * 5. PERSISTENCIA Y GUARDADO SÍNCRONO ULTRA-RÁPIDO
   */
  public saveSync(): void {
    if (!this.mindMapInstance || this.isDestroyed) return;
    try {
      const data = this.mindMapInstance.getData(false);
      const json = JSON.stringify(data);
      if (this.config.storageKey) {
        localStorage.setItem(this.config.storageKey, json);
        localStorage.setItem(`${this.config.storageKey}_meta`, JSON.stringify({
          layout: this.currentLayout,
          theme: this.currentTheme,
          updatedAt: Date.now()
        }));
      }
      Preferences.set({ key: this.config.storageKey!, value: json }).catch(() => {});
      if (this.config.topicId) {
        activeStudyService.saveMindMapState(this.config.topicId, data);
      }
      const statusLabel = this.container.querySelector('#map-save-status');
      if (statusLabel) statusLabel.textContent = 'Guardado ✓';
      this.config.onSave?.(data);
    } catch (e) {
      console.warn('[UltraFastMindMap] Error en saveSync:', e);
    }
  }

  private scheduleDebouncedSave(): void {
    const statusLabel = this.container.querySelector('#map-save-status');
    if (statusLabel) statusLabel.textContent = 'Guardando...';

    // Guardado síncrono instantáneo a localStorage
    this.saveSync();

    if (this.saveDebounceTimer) {
      window.clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = window.setTimeout(() => {
      this.saveInstantly();
    }, 400);
  }

  public async saveInstantly(): Promise<void> {
    if (!this.mindMapInstance || this.isDestroyed) return;
    try {
      this.saveSync();
      const data = this.mindMapInstance.getData(false);
      const json = JSON.stringify(data);
      await Preferences.set({ key: this.config.storageKey!, value: json });
      if (this.config.topicId) {
        activeStudyService.saveMindMapState(this.config.topicId, data);
      }

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
    // 1. Guardar síncronamente antes de destruir la instancia para nunca perder cambios
    try {
      this.saveSync();
    } catch {}

    this.isDestroyed = true;
    window.removeEventListener('keydown', this.handleKeyDown);

    if (this.saveDebounceTimer) {
      window.clearTimeout(this.saveDebounceTimer);
      this.saveDebounceTimer = null;
    }
    try {
      this.keyboardListenerHandle?.remove?.();
    } catch {}

    if (this.mindmeisterAdapter) {
      try {
        this.mindmeisterAdapter.destroy();
      } catch (e) {
        console.warn('[UltraFastMindMap] Error destruyendo mindmeisterAdapter:', e);
      }
      this.mindmeisterAdapter = null;
    }

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

