import MindMap from 'simple-mind-map';
import '../ui/styles/mindmeister-theme.css';
import { SimpleMindMapAdapter } from '../engine/adapters/SimpleMindMapAdapter';
import { Preferences } from '@capacitor/preferences';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { deckService } from '../services/deck.service';
import { activeStudyService } from '../services/active-study.service';
import { eurekaBackend } from '../services/backend.service';
import { katexService } from '../services/katex.service';
import { dialogService } from '../services/dialog.service';
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
  transparent: { fill: 'transparent', border: 'transparent', text: '#f8fafc' },
  blue: { fill: '#0c4a6e', border: '#38bdf8', text: '#f0f9ff' },
  purple: { fill: '#581c87', border: '#c084fc', text: '#faf5ff' },
  emerald: { fill: '#064e3b', border: '#34d399', text: '#ecfdf5' },
  amber: { fill: '#78350f', border: '#fbbf24', text: '#fffbeb' },
  rose: { fill: '#831843', border: '#f472b6', text: '#fff1f2' },
  dark: { fill: '#1e293b', border: '#64748b', text: '#f8fafc' }
};

const THEME_PRESETS: Record<string, any> = {
  minimalOutline: {
    name: 'Minimalista / Invisible',
    backgroundColor: '#07080d',
    root: {
      fillColor: 'transparent',
      color: '#38bdf8',
      borderColor: '#38bdf8',
      borderWidth: 1.5,
      fontSize: 16,
      fontWeight: 'bold',
      active: { borderColor: '#0284c7', borderWidth: 2.5 }
    },
    second: {
      fillColor: 'transparent',
      color: '#f8fafc',
      borderColor: 'transparent',
      borderWidth: 0,
      fontSize: 14,
      active: { borderColor: '#38bdf8', borderWidth: 1 }
    },
    node: {
      fillColor: 'transparent',
      color: '#e2e8f0',
      borderColor: 'transparent',
      borderWidth: 0,
      fontSize: 13,
      active: { borderColor: '#38bdf8', borderWidth: 1 }
    },
    lineColor: '#ec4899',
    lineWidth: 2
  },
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
  public globalInvisibleBoxes: boolean = false;
  private globalFontFamily: string = 'Inter, sans-serif';
  private nodeFillEnabled: boolean = false;
  private measureContainer: HTMLDivElement | null = null;

  constructor(container: HTMLElement, config: MindMapConfig = {}) {
    this.container = container;
    const uid = activeStudyService.getCurrentUserId() || eurekaBackend.getUserId();
    const baseKey = config.topicId ? `eureka_mindmap_topic_${config.topicId}` : 'eureka_mindmap_autosave_v1';
    this.config = {
      storageKey: config.storageKey || `${baseKey}_${uid}`,
      topicId: config.topicId,
      topicTitle: config.topicTitle || 'Mapa Mental Interactivo',
      initialData: config.initialData || DEFAULT_MAP_DATA,
      onSave: config.onSave,
      onBack: config.onBack
    };

    try {
      const savedFont = localStorage.getItem('eureka_mindmap_font_family');
      if (savedFont) this.globalFontFamily = savedFont;
      const savedFill = localStorage.getItem('eureka_mindmap_node_fill_enabled');
      if (savedFill !== null) this.nodeFillEnabled = savedFill === 'true';
    } catch {}

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.saveSync());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.saveSync();
        }
      });
    }
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
      minimalOutline: '✨',
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

          <!-- LOS 2 BOTONES PRINCIPALES: '🗺️' Y '🔤' -->
          <div class="mindmap-top-two-buttons">
            <button class="mindmap-header-action-pill mindmap-icon-only-pill" id="btn-toggle-menu-map" title="Configuración del mapa">
              <span class="pill-icon">🗺️</span>
              <span class="pill-chevron">▾</span>
            </button>
            <button class="mindmap-header-action-pill mindmap-icon-only-pill" id="btn-toggle-menu-node" title="Estilo y Tipografía">
              <span class="pill-icon">🔤</span>
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

        <!-- 1. Panel Desplegable: 'MAPA' (Lienzo, Estructura y Fondo) -->
        <div class="mindmap-dropdown-menu-panel apple-glass-panel" id="mindmap-dropdown-map" style="display:none;">
          <!-- Esquema: Solo Emoji -->
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

          <!-- Modo Fondo Claro / Oscuro -->
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

          <div class="dropdown-h-divider"></div>

          <!-- Color de Fondo del Lienzo Personalizado -->
          <div class="dropdown-h-group popover-anchor">
            <button type="button" class="compact-trigger-pill" id="btn-trigger-canvas-color" title="Color de fondo del mapa">
              <span style="font-size:11px; margin-right:2px;">🎨</span>
              <span class="color-dot-circle" id="preview-canvas-color" style="background:${this.canvasBgMode === 'light' ? '#f8fafc' : '#090d16'}; border:1px solid rgba(255,255,255,0.3);"></span>
              <span class="mini-chevron">▾</span>
            </button>
            <div class="popover-bubble" id="popover-canvas-color" style="display:none;">
              <button type="button" class="color-dot-btn" data-canvas-bg="#090d16" style="background:#090d16; border:1px solid #334155;" title="Noche"></button>
              <button type="button" class="color-dot-btn" data-canvas-bg="#000000" style="background:#000000; border:1px solid #334155;" title="OLED"></button>
              <button type="button" class="color-dot-btn" data-canvas-bg="#0f172a" style="background:#0f172a; border:1px solid #334155;" title="Pizarra"></button>
              <button type="button" class="color-dot-btn" data-canvas-bg="#1e1e2e" style="background:#1e1e2e; border:1px solid #334155;" title="Catppuccin"></button>
              <button type="button" class="color-dot-btn" data-canvas-bg="#f8fafc" style="background:#f8fafc; border:1px solid #94a3b8;" title="Blanco Hielo"></button>
              <button type="button" class="color-dot-btn" data-canvas-bg="#ffffff" style="background:#ffffff; border:1px solid #94a3b8;" title="Blanco Puro"></button>
              <button type="button" class="color-dot-btn" data-canvas-bg="#fef3c7" style="background:#fef3c7; border:1px solid #94a3b8;" title="Papel Crema"></button>
            </div>
          </div>

          <div class="dropdown-h-divider"></div>

          <!-- Color General de Líneas Conectoras (Vectores) -->
          <div class="dropdown-h-group popover-anchor">
            <button type="button" class="compact-trigger-pill" id="btn-trigger-line-color" title="Color general de líneas / vectores">
              <span style="font-size:11px; margin-right:2px;">〰️</span>
              <span class="color-dot-circle" id="preview-line-color" style="background:#0ea5e9;"></span>
              <span class="mini-chevron">▾</span>
            </button>
            <div class="popover-bubble" id="popover-line-color" style="display:none;">
              <button type="button" class="color-dot-btn" data-line-color="#0ea5e9" style="background:#0ea5e9;" title="Cyan"></button>
              <button type="button" class="color-dot-btn" data-line-color="#a855f7" style="background:#a855f7;" title="Violeta"></button>
              <button type="button" class="color-dot-btn" data-line-color="#10b981" style="background:#10b981;" title="Esmeralda"></button>
              <button type="button" class="color-dot-btn" data-line-color="#f59e0b" style="background:#f59e0b;" title="Ámbar"></button>
              <button type="button" class="color-dot-btn" data-line-color="#ec4899" style="background:#ec4899;" title="Rosa"></button>
              <button type="button" class="color-dot-btn" data-line-color="#94a3b8" style="background:#94a3b8;" title="Gris"></button>
              <button type="button" class="color-dot-btn" data-line-color="#ffffff" style="background:#ffffff; border:1px solid #94a3b8;" title="Blanco"></button>
            </div>
          </div>

          <div class="dropdown-h-divider"></div>

          <!-- Recuadros Invisibles en Todo el Mapa -->
          <button type="button" class="compact-trigger-pill ${this.globalInvisibleBoxes ? 'active' : ''}" id="btn-toggle-all-invisible" title="Hacer todo el mapa con recuadros invisibles" style="${this.globalInvisibleBoxes ? 'background:rgba(56,189,248,0.2); border:1px solid #38bdf8; color:#38bdf8;' : ''}">
            <span class="pill-icon" style="font-size:12px;">🚫</span>
            <span class="pill-text" style="font-size:11px; font-weight:600; padding:0 2px;">Sin Recuadros</span>
          </button>

          <button type="button" class="btn-dropdown-close-sm" id="btn-close-map-dropdown" title="Cerrar barra">✕</button>
        </div>

        <!-- 2. Panel Desplegable: 'ESTILO & LETRAS' -->
        <div class="mindmap-dropdown-menu-panel apple-glass-panel" id="mindmap-dropdown-node" style="display:none;">
          <div id="node-dropdown-empty-notice" class="dropdown-h-group" style="display:none; align-items:center; gap:8px;">
            <span style="font-size:0.8rem; color:var(--f-text-secondary);">Toca un recuadro o</span>
            <button class="figma-btn-white-pill-sm" id="btn-select-root-node">
              Seleccionar Raíz
            </button>
          </div>

          <div id="node-dropdown-content" style="display:inline-flex; align-items:center; gap:8px;">
            <!-- SECCIÓN A: RECUADRO & LÍNEAS -->
            <!-- Color de Recuadro + Relleno Opcional -->
            <div class="dropdown-h-group popover-anchor">
              <button type="button" class="compact-trigger-pill" id="btn-trigger-node-bg" title="Color de recuadro y relleno interior">
                <span class="color-dot-circle" id="preview-node-bg" style="background:#0ea5e9;"></span>
                <span class="mini-chevron">▾</span>
              </button>
              <div class="popover-bubble" id="popover-node-bg" style="display:none; padding:10px; min-width:190px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.1);">
                  <span style="font-size:11px; font-weight:700; color:#94a3b8;">Recuadro</span>
                  <button type="button" class="compact-toggle-btn ${this.nodeFillEnabled ? 'active' : ''}" id="btn-toggle-node-fill" title="Alternar si el color rellena el fondo o solo el borde">
                    <span id="label-node-fill" style="font-size:10px; font-weight:700;">${this.nodeFillEnabled ? 'Relleno: ON' : 'Relleno: OFF'}</span>
                  </button>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <button type="button" class="color-dot-btn mm-swatch-transparent" data-node-bg="transparent" style="background:transparent; border:1.5px dashed rgba(255,255,255,0.6); display:flex; align-items:center; justify-content:center;" title="Sin Recuadro">
                    <span style="font-size:10px; line-height:1;">🚫</span>
                  </button>
                  <button type="button" class="color-dot-btn" data-node-bg="blue" style="background:#0ea5e9;" title="Cyan"></button>
                  <button type="button" class="color-dot-btn" data-node-bg="purple" style="background:#a855f7;" title="Violeta"></button>
                  <button type="button" class="color-dot-btn" data-node-bg="emerald" style="background:#10b981;" title="Esmeralda"></button>
                  <button type="button" class="color-dot-btn" data-node-bg="amber" style="background:#f59e0b;" title="Ámbar"></button>
                  <button type="button" class="color-dot-btn" data-node-bg="rose" style="background:#ec4899;" title="Rosa"></button>
                  <button type="button" class="color-dot-btn" data-node-bg="dark" style="background:#334155;" title="Pizarra"></button>
                </div>
              </div>
            </div>

            <!-- Color de Línea Conectora Individual para este recuadro -->
            <div class="dropdown-h-group popover-anchor">
              <button type="button" class="compact-trigger-pill" id="btn-trigger-node-line-color" title="Color de línea conectora de este recuadro">
                <span style="font-size:11px; margin-right:2px;">〰️</span>
                <span class="color-dot-circle" id="preview-node-line-color" style="background:#0ea5e9;"></span>
                <span class="mini-chevron">▾</span>
              </button>
              <div class="popover-bubble" id="popover-node-line-color" style="display:none; padding:10px; min-width:190px;">
                <div style="font-size:11px; font-weight:700; color:#94a3b8; margin-bottom:6px;">Línea Conectora</div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <button type="button" class="color-dot-btn" data-node-line-color="#0ea5e9" style="background:#0ea5e9;" title="Cyan"></button>
                  <button type="button" class="color-dot-btn" data-node-line-color="#a855f7" style="background:#a855f7;" title="Violeta"></button>
                  <button type="button" class="color-dot-btn" data-node-line-color="#10b981" style="background:#10b981;" title="Esmeralda"></button>
                  <button type="button" class="color-dot-btn" data-node-line-color="#f59e0b" style="background:#f59e0b;" title="Ámbar"></button>
                  <button type="button" class="color-dot-btn" data-node-line-color="#ec4899" style="background:#ec4899;" title="Rosa"></button>
                  <button type="button" class="color-dot-btn" data-node-line-color="#94a3b8" style="background:#94a3b8;" title="Gris"></button>
                  <button type="button" class="color-dot-btn" data-node-line-color="#ffffff" style="background:#ffffff; border:1px solid #94a3b8;" title="Blanco"></button>
                </div>
                <button type="button" class="compact-trigger-pill" id="btn-inherit-node-line-children" style="margin-top:8px; width:100%; justify-content:center; font-size:11px; font-weight:600;" title="Heredar este color de línea a todos los recuadros hijos">
                  🌳 Heredar Línea a Hijos
                </button>
              </div>
            </div>

            <div class="dropdown-h-divider"></div>

            <!-- SECCIÓN B: TIPOGRAFÍA & LETRAS -->
            <!-- 1. Tipo de Letra (Fuente) con Advertencia KaTeX -->
            <div class="dropdown-h-group popover-anchor">
              <button type="button" class="compact-trigger-pill" id="btn-trigger-font-family" title="Tipo de letra (Fuente)">
                <span style="font-size:11px; font-weight:700; margin-right:2px;">F</span>
                <span class="mini-chevron">▾</span>
              </button>
              <div class="popover-bubble popover-font-family-bubble" id="popover-font-family" style="display:none; min-width:260px; padding:12px;">
                <div style="font-size:11px; font-weight:700; color:#94a3b8; margin-bottom:8px;">Tipo de Letra</div>
                
                <div style="display:flex; flex-direction:column; gap:4px;">
                  <button type="button" class="popover-font-option-btn ${this.globalFontFamily === 'Inter, sans-serif' ? 'active' : ''}" data-font="Inter, sans-serif" style="font-family:'Inter', sans-serif;">
                    <span>Inter (Sans-serif)</span>
                    <span class="badge-font-rec">Recomendada</span>
                  </button>
                  <button type="button" class="popover-font-option-btn ${this.globalFontFamily === 'Merriweather, serif' ? 'active' : ''}" data-font="Merriweather, serif" style="font-family:'Merriweather', serif;">
                    <span>Merriweather (Serif)</span>
                  </button>
                  <button type="button" class="popover-font-option-btn ${this.globalFontFamily.includes('Mono') ? 'active' : ''}" data-font="'JetBrains Mono', monospace" style="font-family:'JetBrains Mono', monospace;">
                    <span>JetBrains Mono (Código)</span>
                  </button>
                  <button type="button" class="popover-font-option-btn ${this.globalFontFamily.includes('Caveat') ? 'active' : ''}" data-font="'Caveat', cursive" style="font-family:'Caveat', cursive; font-size:1.15em;">
                    <span>Caveat (Manuscrita)</span>
                  </button>
                  <button type="button" class="popover-font-option-btn ${this.globalFontFamily.includes('OpenDyslexic') ? 'active' : ''}" data-font="'OpenDyslexic', sans-serif">
                    <span>OpenDyslexic (Accesible)</span>
                  </button>
                </div>

                <div class="font-katex-warning" style="margin-top:10px; padding:6px 8px; border-radius:6px; background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); color:#fcd34d; font-size:10px; line-height:1.35;">
                  ⚠️ <strong>Aviso:</strong> Fuentes cursivas o decorativas pueden dificultar la lectura de símbolos KaTeX y fórmulas.
                </div>

                <div style="display:flex; gap:6px; margin-top:8px;">
                  <button type="button" class="popover-action-btn-sm" id="btn-font-apply-node" style="flex:1;">Solo este nodo</button>
                  <button type="button" class="popover-action-btn-sm primary" id="btn-font-apply-global" style="flex:1;">Todo el mapa</button>
                </div>
              </div>
            </div>

            <!-- 2. Tamaño de Letra Personalizado (- / num / +) -->
            <div class="dropdown-h-group popover-anchor">
              <div class="number-stepper-group" style="display:inline-flex; align-items:center; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:8px;">
                <button type="button" class="stepper-btn" id="btn-font-size-dec" title="Disminuir tamaño">-</button>
                <button type="button" class="stepper-val-btn" id="btn-trigger-font-size" title="Elegir tamaño">
                  <span id="preview-node-font-size">14</span>
                </button>
                <button type="button" class="stepper-btn" id="btn-font-size-inc" title="Aumentar tamaño">+</button>
              </div>
              <div class="popover-bubble" id="popover-node-font-size" style="display:none;">
                <button type="button" class="popover-item-number" data-size="12">12</button>
                <button type="button" class="popover-item-number active" data-size="14">14</button>
                <button type="button" class="popover-item-number" data-size="16">16</button>
                <button type="button" class="popover-item-number" data-size="18">18</button>
                <button type="button" class="popover-item-number" data-size="22">22</button>
                <button type="button" class="popover-item-number" data-size="28">28</button>
              </div>
            </div>

            <!-- 3. Color del Texto Personalizado -->
            <div class="dropdown-h-group popover-anchor">
              <button type="button" class="compact-trigger-pill" id="btn-trigger-node-text" title="Color de letra">
                <span class="color-dot-circle" id="preview-node-text" style="background:#ffffff; border:1px solid rgba(255,255,255,0.4);"></span>
                <span class="mini-chevron">▾</span>
              </button>
              <div class="popover-bubble" id="popover-node-text" style="display:none; padding:10px;">
                <div style="font-size:11px; font-weight:700; color:#94a3b8; margin-bottom:6px;">Color de Texto</div>
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px;">
                  <button type="button" class="color-dot-btn" data-text-color="#ffffff" style="background:#ffffff; border:1px solid #94a3b8;" title="Blanco"></button>
                  <button type="button" class="color-dot-btn" data-text-color="#38bdf8" style="background:#38bdf8;" title="Cyan"></button>
                  <button type="button" class="color-dot-btn" data-text-color="#34d399" style="background:#34d399;" title="Verde"></button>
                  <button type="button" class="color-dot-btn" data-text-color="#fbbf24" style="background:#fbbf24;" title="Dorado"></button>
                  <button type="button" class="color-dot-btn" data-text-color="#f472b6" style="background:#f472b6;" title="Rosa"></button>
                  <button type="button" class="color-dot-btn" data-text-color="#94a3b8" style="background:#94a3b8;" title="Gris"></button>
                  <button type="button" class="color-dot-btn" data-text-color="#0f172a" style="background:#0f172a; border:1px solid #94a3b8;" title="Oscuro"></button>
                </div>
                <div style="display:flex; align-items:center; gap:8px; border-top:1px solid rgba(255,255,255,0.1); padding-top:6px;">
                  <span style="font-size:10px; color:#94a3b8;">Personalizado:</span>
                  <input type="color" id="input-custom-font-color" value="#ffffff" style="width:26px; height:22px; border:none; background:transparent; cursor:pointer; padding:0;" title="Color RGB personalizado" />
                </div>
              </div>
            </div>

            <!-- 4. Efectos de Letra (Negrita, Cursiva, Subrayado) -->
            <div class="dropdown-h-group" style="display:inline-flex; gap:4px;">
              <button type="button" class="text-size-btn text-size-btn-sm" id="btn-toggle-bold" title="Negrita"><strong>B</strong></button>
              <button type="button" class="text-size-btn text-size-btn-sm" id="btn-toggle-italic" title="Cursiva"><em>I</em></button>
              <button type="button" class="text-size-btn text-size-btn-sm" id="btn-toggle-underline" title="Subrayado"><u>U</u></button>
            </div>

            <div class="dropdown-h-divider"></div>

            <!-- SECCIÓN C: ACCIONES ESTRUCTURALES -->
            <div class="dropdown-h-group">
              <button type="button" class="compact-trigger-pill" id="btn-open-direct-text-editor" title="Editar texto (F2)">✏️</button>
              <button type="button" class="compact-trigger-pill" id="btn-open-katex-from-node-menu" title="Fórmula KaTeX">📐</button>
              <button type="button" class="compact-trigger-pill" id="btn-upload-node-photo" title="Adjuntar foto">📷</button>
              <button type="button" class="compact-trigger-pill danger" id="btn-remove-node-photo" style="display:none;" title="Eliminar foto">🗑️</button>
              <button type="button" class="compact-trigger-pill" id="btn-node-dropdown-child" title="Añadir hijo (Tab)"><span style="font-size:11px; font-weight:600;">➕ Hijo</span></button>
              <button type="button" class="compact-trigger-pill" id="btn-node-dropdown-sibling" title="Añadir hermano (Enter)"><span style="font-size:11px; font-weight:600;">🌿 Hermano</span></button>
              <button type="button" class="compact-trigger-pill danger" id="btn-node-dropdown-delete" title="Eliminar recuadro (Supr)">🗑️</button>
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
    let savedLineColor: string | null = null;
    let savedFontSize: number | null = null;
    let savedFontColor: string | null = null;

    try {
      // 1. Cargar instantáneamente de localStorage para nunca perder datos
      if (this.config.storageKey) {
        let localStr = localStorage.getItem(this.config.storageKey);
        if (!localStr && this.config.topicId) {
          // Fallback a clave previa sin prefijo de usuario para migración transparente
          localStr = localStorage.getItem(`eureka_mindmap_topic_${this.config.topicId}`);
        }
        if (localStr) {
          const parsed = JSON.parse(localStr);
          if (parsed && (parsed.root || parsed.data)) {
            mapData = parsed;
          }
        }

        // Cargar metadatos de estructura y tema
        const metaStr = localStorage.getItem(`${this.config.storageKey}_meta`) ||
          (this.config.topicId ? localStorage.getItem(`eureka_mindmap_topic_${this.config.topicId}_meta`) : null);
        if (metaStr) {
          try {
            const meta = JSON.parse(metaStr);
            if (meta.layout) this.currentLayout = meta.layout;
            if (meta.theme && THEME_PRESETS[meta.theme]) this.currentTheme = meta.theme;
            if (typeof meta.globalInvisibleBoxes === 'boolean') this.globalInvisibleBoxes = meta.globalInvisibleBoxes;
            if (meta.lineColor) savedLineColor = meta.lineColor;
            if (meta.globalFontSize) savedFontSize = Number(meta.globalFontSize);
            if (meta.globalFontColor) savedFontColor = meta.globalFontColor;
          } catch {}
        }
      }
    } catch {}

    // 2. Fallback a activeStudyService o Preferences de Capacitor si localStorage no tenía datos
    if (this.config.topicId) {
      const serviceData = activeStudyService.getMindMapState(this.config.topicId);
      if (serviceData && (serviceData.root || serviceData.data)) {
        mapData = serviceData;
      }
    }

    if (!mapData || mapData === DEFAULT_MAP_DATA) {
      try {
        const saved = await Preferences.get({ key: this.config.storageKey! });
        if (saved.value) {
          const parsed = JSON.parse(saved.value);
          if (parsed && (parsed.root || parsed.data)) {
            mapData = parsed;
          }
        }
      } catch {}
    }

    const canvasEl = this.container.querySelector('#mindmap-render-canvas') as HTMLElement;
    if (!canvasEl) return;

    const baseTheme = THEME_PRESETS[this.currentTheme] || THEME_PRESETS.cyberDark;
    const themeObj = JSON.parse(JSON.stringify(baseTheme));
    if (savedLineColor) {
      themeObj.lineColor = savedLineColor;
    }
    if (this.globalInvisibleBoxes) {
      themeObj.root.fillColor = 'transparent';
      themeObj.root.borderColor = 'transparent';
      themeObj.root.borderWidth = 0;
      themeObj.second.fillColor = 'transparent';
      themeObj.second.borderColor = 'transparent';
      themeObj.second.borderWidth = 0;
      themeObj.node.fillColor = 'transparent';
      themeObj.node.borderColor = 'transparent';
      themeObj.node.borderWidth = 0;
    }

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
      isShowCreateChildBtnIcon: false,

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

        const isGlobalInvisible = this.globalInvisibleBoxes;
        const nodeFill = isGlobalInvisible ? 'transparent' : (typeof node.getStyle === 'function' ? node.getStyle('fillColor', false) : null);
        let defaultTextColor = this.canvasBgMode === 'light' ? '#0f172a' : '#f8fafc';
        if (this.canvasBgMode === 'light' && !isGlobalInvisible) {
          // Si el nodo tiene un fondo oscuro o saturado en modo claro, texto blanco
          if (nodeFill && nodeFill !== 'transparent' && nodeFill !== '#ffffff' && nodeFill !== '#f8fafc') {
            defaultTextColor = '#ffffff';
          }
        }
        const customColor = typeof node.getStyle === 'function' ? node.getStyle('color', false) : null;
        let color = customColor || defaultTextColor;

        // Inversión automática según el modo de fondo del lienzo
        if (this.canvasBgMode === 'light' && this.isWhiteOrLightTextColor(color)) {
          if (!nodeFill || nodeFill === 'transparent' || nodeFill === '#ffffff' || nodeFill === '#f8fafc') {
            color = '#0f172a';
          }
        } else if (this.canvasBgMode === 'dark' && this.isBlackOrDarkTextColor(color)) {
          color = '#f8fafc';
        }

        const fontFamily = (node.getData ? node.getData('fontFamily') : null) || this.globalFontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const fontSize = (typeof node.getStyle === 'function' ? node.getStyle('fontSize', false) : null) || 14;
        const fontWeight = (node.getData ? node.getData('fontWeight') : null) || (typeof node.getStyle === 'function' ? node.getStyle('fontWeight', false) : 'normal') || 'normal';
        const fontStyle = (node.getData ? node.getData('fontStyle') : null) || 'normal';
        const textDecoration = (node.getData ? node.getData('textDecoration') : null) || 'none';

        const textStr = (text === undefined || text === null) ? '' : String(text);
        const imgSize = image ? (node.getData ? node.getData('imageSize') : (node.nodeData?.data?.imageSize)) : null;
        const optimalSize = this.measureOptimalNodeSize(
          textStr,
          fontSize,
          fontFamily,
          fontWeight,
          Boolean(image),
          imgSize?.width || 0,
          imgSize?.height || 0
        );

        div.style.fontFamily = fontFamily;
        div.style.color = color;
        div.style.fontSize = `${fontSize}px`;
        div.style.fontWeight = fontWeight;
        div.style.fontStyle = fontStyle;
        div.style.textDecoration = textDecoration;
        div.style.lineHeight = '1.4';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.style.textAlign = 'center';
        div.style.width = `${optimalSize.width}px`;
        div.style.height = `${optimalSize.height}px`;
        div.style.maxWidth = '260px';
        div.style.minWidth = '76px';
        div.style.minHeight = '36px';
        div.style.boxSizing = 'border-box';
        div.style.wordBreak = 'break-word';
        div.style.overflowWrap = 'anywhere';
        div.style.whiteSpace = 'pre-wrap';
        div.style.padding = '6px 12px';

        // 📷 Renderizado de Foto en el Recuadro con Proporción Completa (Zero Cropping)
        if (image) {
          const imgSize = node.getData ? node.getData('imageSize') : (node.nodeData?.data?.imageSize);
          const maxBoxW = 240;
          const maxBoxH = 190;
          let targetW = imgSize?.width;
          let targetH = imgSize?.height;

          const imgEl = document.createElement('img');
          imgEl.src = image;
          imgEl.className = 'eureka-node-img-rendered';
          imgEl.style.maxWidth = `${maxBoxW}px`;
          imgEl.style.maxHeight = `${maxBoxH}px`;
          imgEl.style.objectFit = 'contain';
          imgEl.style.borderRadius = '8px';
          imgEl.style.display = 'block';
          imgEl.style.marginBottom = '6px';

          if (targetW && targetH) {
            imgEl.style.width = `${targetW}px`;
            imgEl.style.height = `${targetH}px`;
          } else {
            imgEl.style.width = 'auto';
            imgEl.style.height = 'auto';
          }

          // Al cargarse la imagen, calcular proporción matemática exacta sin recortes
          imgEl.onload = () => {
            if (imgEl.naturalWidth && imgEl.naturalHeight) {
              const nw = imgEl.naturalWidth;
              const nh = imgEl.naturalHeight;
              const scale = Math.min(maxBoxW / nw, maxBoxH / nh, 1);
              const computedW = Math.max(50, Math.round(nw * scale));
              const computedH = Math.max(40, Math.round(nh * scale));

              if (!imgSize?.custom || targetW !== computedW || targetH !== computedH) {
                if (typeof node.setData === 'function') {
                  node.setData({ imageSize: { width: computedW, height: computedH, custom: true } });
                }
                if (typeof node.reRender === 'function') {
                  node.reRender();
                }
                this.mindMapInstance?.render();
              }
            }
          };

          div.appendChild(imgEl);
        }

        // ✍️ Renderizado de Texto Multilínea (Respetando saltos de línea con Enter)
        const cleanText = textStr.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        const textEl = document.createElement('div');
        textEl.className = 'eureka-node-text-rendered';
        textEl.style.whiteSpace = 'pre-wrap';
        textEl.style.wordBreak = 'break-word';
        textEl.style.overflowWrap = 'anywhere';
        textEl.style.width = '100%';
        textEl.style.minHeight = '1.3em';
        textEl.style.minWidth = '48px';
        textEl.style.display = 'inline-block';

        if (!cleanText && !image) {
          textEl.innerHTML = '<span class="eureka-node-placeholder">Escribe aquí...</span>';
        } else if (textStr.includes('class="katex"') || textStr.includes("<span class='katex'")) {
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
      this.setCanvasBackgroundMode(savedBgMode);
    }

    // Restaurar indicadores visuales guardados
    if (savedLineColor) {
      const preview = this.container.querySelector('#preview-line-color') as HTMLElement | null;
      if (preview) {
        preview.style.background = savedLineColor;
        preview.style.borderColor = savedLineColor === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'transparent';
      }
    }
    if (savedFontSize) {
      const preview = this.container.querySelector('#preview-global-font-size') as HTMLElement | null;
      if (preview) preview.textContent = String(savedFontSize);
    }
    if (savedFontColor) {
      const preview = this.container.querySelector('#preview-global-font-color') as HTMLElement | null;
      if (preview) {
        preview.style.background = savedFontColor;
        preview.style.borderColor = savedFontColor === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'transparent';
      }
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
      if (this.globalInvisibleBoxes && this.mindMapInstance?.renderer?.root) {
        let hasFixed = false;
        const applyInvisibleToAll = (n: any) => {
          if (!n) return;
          if (n.nodeData?.data) {
            if (n.nodeData.data.fillColor !== 'transparent' || n.nodeData.data.borderWidth !== 0) {
              n.nodeData.data.fillColor = 'transparent';
              n.nodeData.data.borderColor = 'transparent';
              n.nodeData.data.borderWidth = 0;
              hasFixed = true;
              if (typeof n.reRender === 'function') {
                n.reRender();
              }
            }
          }
          if (n.children && Array.isArray(n.children)) {
            n.children.forEach(applyInvisibleToAll);
          }
        };
        applyInvisibleToAll(this.mindMapInstance.renderer.root);
        if (hasFixed && typeof this.mindMapInstance.render === 'function') {
          this.mindMapInstance.render();
        }
      }
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

      const screenW = canvasEl?.clientWidth || window.innerWidth;
      const screenH = canvasEl?.clientHeight || window.innerHeight;

      const topH = topBar?.offsetHeight || 56;

      // Área libre completa de pantalla
      const availW = Math.max(100, screenW - 60); // 30px margen lateral
      const availH = Math.max(100, screenH - topH - 40); // 20px margen vertical

      // Centro visual geométrico EXACTO del área visible en la pantalla
      const targetCenterX = screenW / 2;
      const targetCenterY = topH + (screenH - topH) / 2;

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
    if (this.isDestroyed || !this.mindMapInstance || this.isEditingText) return;

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
      const target = this.activeNode || this.mindMapInstance.renderer?.activeNodeList?.[0];
      if (target) {
        target.active();
        if (this.mindMapInstance.renderer) {
          this.mindMapInstance.renderer.activeNodeList = [target];
        }
        this.mindMapInstance.execCommand('INSERT_CHILD_NODE', false, [target]);
        this.triggerHaptic();
      }
      return;
    }

    // Atajo Enter: Insertar concepto paralelo (hermano)
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = this.activeNode || this.mindMapInstance.renderer?.activeNodeList?.[0];
      if (target && !target.isRoot) {
        target.active();
        if (this.mindMapInstance.renderer) {
          this.mindMapInstance.renderer.activeNodeList = [target];
        }
        this.mindMapInstance.execCommand('INSERT_NODE', false, [target]);
        this.triggerHaptic();
      }
      return;
    }

    // Atajo Supr / Backspace: Eliminar nodo
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      const target = this.activeNode || this.mindMapInstance.renderer?.activeNodeList?.[0];
      if (target) {
        this.mindMapInstance.execCommand('REMOVE_NODE', [target]);
        this.activeNode = null;
        this.updateNodeDropdownUI();
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

    // Selector de Color de Fondo del Lienzo Personalizado
    root.querySelector('#btn-trigger-canvas-color')?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('popover-canvas-color', 'btn-trigger-canvas-color');
    });

    root.querySelectorAll<HTMLButtonElement>('#popover-canvas-color [data-canvas-bg]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const color = btn.dataset.canvasBg;
        if (color) {
          this.setCanvasBackgroundColor(color);
          root.querySelectorAll('#popover-canvas-color [data-canvas-bg]').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          closeAllPopovers();
        }
      });
    });

    // Selector de Color de Vectores / Líneas de Conexión General
    root.querySelector('#btn-trigger-line-color')?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('popover-line-color', 'btn-trigger-line-color');
    });

    root.querySelectorAll<HTMLButtonElement>('#popover-line-color [data-line-color]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lineColor = btn.dataset.lineColor;
        if (lineColor) {
          this.setGlobalLineColor(lineColor);
          const preview = root.querySelector('#preview-line-color') as HTMLElement | null;
          if (preview) {
            preview.style.background = lineColor;
            preview.style.borderColor = lineColor === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'transparent';
          }
          closeAllPopovers();
        }
      });
    });

    // Botón directo de Recuadros Invisibles en todo el mapa (existentes y nuevos)
    root.querySelector('#btn-toggle-all-invisible')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllPopovers();
      this.setAllNodesInvisible(!this.globalInvisibleBoxes);
    });

    // Selector de Modo Claro / Oscuro del Lienzo
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
    // 🔲 CONTROL DE MENÚ DESPLEGABLE: 'ESTILO & LETRAS'
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

    // 1. Selector de Color de Recuadro y Relleno Interior
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

    // Alternar Relleno Interior (ON / OFF)
    root.querySelector('#btn-toggle-node-fill')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleNodeFill();
    });

    // 2. Selector de Color de Línea Conectora Individual para este recuadro
    root.querySelector('#btn-trigger-node-line-color')?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('popover-node-line-color', 'btn-trigger-node-line-color');
    });

    root.querySelectorAll<HTMLButtonElement>('#popover-node-line-color [data-node-line-color]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lineColor = btn.dataset.nodeLineColor;
        if (lineColor) {
          this.setNodeLineColor(lineColor);
          closeAllPopovers();
        }
      });
    });

    root.querySelector('#btn-inherit-node-line-children')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.inheritNodeLineColorToChildren();
      closeAllPopovers();
    });

    // 3. Selector de Tipo de Letra (Fuente) con Advertencia KaTeX
    root.querySelector('#btn-trigger-font-family')?.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('popover-font-family', 'btn-trigger-font-family');
    });

    let selectedFontFamily = this.globalFontFamily;
    root.querySelectorAll<HTMLButtonElement>('#popover-font-family [data-font]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const font = btn.dataset.font;
        if (font) {
          selectedFontFamily = font;
          root.querySelectorAll('#popover-font-family [data-font]').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.triggerHaptic();
        }
      });
    });

    root.querySelector('#btn-font-apply-node')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selectedFontFamily) {
        this.setFontFamily(selectedFontFamily, false);
      }
      closeAllPopovers();
    });

    root.querySelector('#btn-font-apply-global')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selectedFontFamily) {
        dialogService.showConfirm({
          title: '⚠️ Cambiar Fuente en Todo el Mapa',
          message: '¿Estás seguro de que deseas cambiar la fuente de letra en TODOS los recuadros del mapa mental? Nota: Las fórmulas matemáticas KaTeX se visualizan con mayor nitidez en Inter o JetBrains Mono.',
          confirmText: 'Sí, aplicar a todos',
          cancelText: 'Cancelar',
          onConfirm: () => {
            this.setFontFamily(selectedFontFamily, true);
          }
        });
      }
      closeAllPopovers();
    });

    // 4. Tamaño de Letra Personalizado (- / num / +)
    root.querySelector('#btn-font-size-dec')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.adjustActiveNodeFontSize(-1);
    });

    root.querySelector('#btn-font-size-inc')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.adjustActiveNodeFontSize(1);
    });

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

    // 5. Selector de Color del Texto del Recuadro y Color Personalizado
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
          if (this.activeNode.nodeData?.data) {
            this.activeNode.nodeData.data.color = textColor;
          }
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

    root.querySelector('#input-custom-font-color')?.addEventListener('input', (e) => {
      const color = (e.target as HTMLInputElement).value;
      if (color && this.activeNode && this.mindMapInstance) {
        this.mindMapInstance.execCommand('SET_NODE_STYLES', this.activeNode, {
          color: color
        });
        if (this.activeNode.nodeData?.data) {
          this.activeNode.nodeData.data.color = color;
        }
        const preview = root.querySelector('#preview-node-text') as HTMLElement | null;
        if (preview) {
          preview.style.background = color;
          preview.style.borderColor = 'rgba(255,255,255,0.4)';
        }
        this.scheduleDebouncedSave();
      }
    });

    // 6. Alternar Negrita, Cursiva y Subrayado
    root.querySelector('#btn-toggle-bold')?.addEventListener('click', () => {
      this.toggleNodeFontEffect('bold');
    });

    root.querySelector('#btn-toggle-italic')?.addEventListener('click', () => {
      this.toggleNodeFontEffect('italic');
    });

    root.querySelector('#btn-toggle-underline')?.addEventListener('click', () => {
      this.toggleNodeFontEffect('underline');
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
    // ACCIONES DE RECUADRO EN DROPDOWN (+ Hijo, + Hermano, Borrar, Heredar)
    // ============================================================
    root.querySelector('#btn-inherit-color-children')?.addEventListener('click', () => {
      this.inheritNodeColorToChildren();
    });

    root.querySelector('#btn-node-dropdown-child')?.addEventListener('click', () => {
      this.triggerHaptic();
      const target = this.activeNode || this.mindMapInstance?.renderer?.activeNodeList?.[0];
      if (target) {
        target.active();
        if (this.mindMapInstance?.renderer) {
          this.mindMapInstance.renderer.activeNodeList = [target];
        }
        this.mindMapInstance?.execCommand('INSERT_CHILD_NODE', false, [target]);
      }
    });

    root.querySelector('#btn-node-dropdown-sibling')?.addEventListener('click', () => {
      this.triggerHaptic();
      const target = this.activeNode || this.mindMapInstance?.renderer?.activeNodeList?.[0];
      if (target && !target.isRoot) {
        target.active();
        if (this.mindMapInstance?.renderer) {
          this.mindMapInstance.renderer.activeNodeList = [target];
        }
        this.mindMapInstance?.execCommand('INSERT_NODE', false, [target]);
      }
    });

    root.querySelector('#btn-node-dropdown-delete')?.addEventListener('click', () => {
      this.triggerHaptic();
      const target = this.activeNode || this.mindMapInstance?.renderer?.activeNodeList?.[0];
      if (target) {
        this.mindMapInstance?.execCommand('REMOVE_NODE', [target]);
        this.activeNode = null;
        this.updateNodeDropdownUI();
      }
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
          this.activeNode.setData({ text: text, rawText: text });
        } else if (this.activeNode.nodeData?.data) {
          this.activeNode.nodeData.data.text = text;
          this.activeNode.nodeData.data.rawText = text;
        }
        try {
          this.mindMapInstance.execCommand('SET_NODE_TEXT', this.activeNode, text);
        } catch {}
        if (typeof this.activeNode.reRender === 'function') {
          this.activeNode.reRender();
        }
        if (typeof this.mindMapInstance.reRender === 'function') {
          this.mindMapInstance.reRender();
        } else if (typeof this.mindMapInstance.render === 'function') {
          this.mindMapInstance.render();
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
          this.activeNode.setData({ text: text, rawText: text });
        } else if (this.activeNode.nodeData?.data) {
          this.activeNode.nodeData.data.text = text;
          this.activeNode.nodeData.data.rawText = text;
        }

        try {
          this.mindMapInstance.execCommand('SET_NODE_TEXT', this.activeNode, text);
        } catch {}

        if (typeof this.activeNode.reRender === 'function') {
          this.activeNode.reRender();
        }
        if (typeof this.mindMapInstance.reRender === 'function') {
          this.mindMapInstance.reRender();
        } else if (typeof this.mindMapInstance.render === 'function') {
          this.mindMapInstance.render();
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
    if (colorKey === 'transparent') {
      const textColor = this.canvasBgMode === 'light' ? '#0f172a' : '#f8fafc';
      this.mindMapInstance.execCommand('SET_NODE_STYLES', this.activeNode, {
        fillColor: 'transparent',
        borderColor: 'transparent',
        color: textColor,
        borderWidth: 0
      });
      if (this.activeNode.nodeData?.data) {
        this.activeNode.nodeData.data.fillColor = 'transparent';
        this.activeNode.nodeData.data.borderColor = 'transparent';
        this.activeNode.nodeData.data.borderWidth = 0;
        this.activeNode.nodeData.data.color = textColor;
      }
      if (typeof this.activeNode.reRender === 'function') {
        this.activeNode.reRender();
      }
      if (typeof this.mindMapInstance.render === 'function') {
        this.mindMapInstance.render();
      }
      this.triggerHaptic();
      this.saveSync();
      return;
    }
    const preset = COLOR_PRESETS[colorKey];
    if (preset) {
      const fill = this.nodeFillEnabled ? preset.fill : 'transparent';
      this.mindMapInstance.execCommand('SET_NODE_STYLES', this.activeNode, {
        fillColor: fill,
        borderColor: preset.border,
        color: preset.text,
        borderWidth: 1.5
      });
      if (this.activeNode.nodeData?.data) {
        this.activeNode.nodeData.data.fillColor = fill;
        this.activeNode.nodeData.data.borderColor = preset.border;
        this.activeNode.nodeData.data.borderWidth = 1.5;
        this.activeNode.nodeData.data.color = preset.text;
      }
      if (typeof this.activeNode.reRender === 'function') {
        this.activeNode.reRender();
      }
      if (typeof this.mindMapInstance.render === 'function') {
        this.mindMapInstance.render();
      }
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
   * Determina si un color de texto es considerado blanco o tono muy claro (cercano al blanco)
   */
  private isWhiteOrLightTextColor(color?: string | null): boolean {
    if (!color) return true;
    const c = color.trim().toLowerCase();
    if (['#ffffff', '#fff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#f0f9ff', '#faf5ff', '#ecfdf5', '#fffbeb', '#fff1f2', 'white'].includes(c)) {
      return true;
    }
    if (c.startsWith('#')) {
      let r = 255, g = 255, b = 255;
      if (c.length === 7) {
        r = parseInt(c.slice(1, 3), 16);
        g = parseInt(c.slice(3, 5), 16);
        b = parseInt(c.slice(5, 7), 16);
      } else if (c.length === 4) {
        r = parseInt(c[1] + c[1], 16);
        g = parseInt(c[2] + c[2], 16);
        b = parseInt(c[3] + c[3], 16);
      }
      return r >= 195 && g >= 195 && b >= 195;
    }
    const rgbMatch = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const r = Number(rgbMatch[1]);
      const g = Number(rgbMatch[2]);
      const b = Number(rgbMatch[3]);
      return r >= 195 && g >= 195 && b >= 195;
    }
    return false;
  }

  /**
   * Determina si un color de texto es considerado negro o tono muy oscuro (cercano al negro)
   */
  private isBlackOrDarkTextColor(color?: string | null): boolean {
    if (!color) return false;
    const c = color.trim().toLowerCase();
    if (['#000000', '#000', '#0f172a', '#1e293b', '#334155', '#111827', '#18181b', '#09090b', 'black'].includes(c)) {
      return true;
    }
    if (c.startsWith('#')) {
      let r = 0, g = 0, b = 0;
      if (c.length === 7) {
        r = parseInt(c.slice(1, 3), 16);
        g = parseInt(c.slice(3, 5), 16);
        b = parseInt(c.slice(5, 7), 16);
      } else if (c.length === 4) {
        r = parseInt(c[1] + c[1], 16);
        g = parseInt(c[2] + c[2], 16);
        b = parseInt(c[3] + c[3], 16);
      }
      return r <= 65 && g <= 65 && b <= 65;
    }
    const rgbMatch = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const r = Number(rgbMatch[1]);
      const g = Number(rgbMatch[2]);
      const b = Number(rgbMatch[3]);
      return r <= 65 && g <= 65 && b <= 65;
    }
    return false;
  }

  /**
   * Conmuta el modo de fondo del lienzo (claro / oscuro), invierte automáticamente
   * los colores de texto blanco <-> negro según el modo, y persiste el estado.
   */
  public setCanvasBackgroundMode(mode: 'dark' | 'light'): void {
    this.canvasBgMode = mode;
    this.triggerHaptic();

    // Sincronizar clases en el contenedor raíz del modal
    this.container.classList.toggle('theme-light', mode === 'light');
    this.container.classList.toggle('theme-dark', mode === 'dark');

    const defaultTextColor = mode === 'light' ? '#0f172a' : '#f8fafc';

    // Sincronizar configuración visual completa del árbol en SimpleMindMap
    if (this.mindMapInstance && typeof this.mindMapInstance.setThemeConfig === 'function') {
      if (mode === 'light') {
        this.mindMapInstance.setThemeConfig({
          backgroundColor: '#f8fafc',
          lineColor: '#0284c7',
          root: {
            fillColor: '#ffffff',
            color: '#0f172a',
            borderColor: '#0284c7',
            borderWidth: 2,
            active: { borderColor: '#0369a1', borderWidth: 3 }
          },
          second: {
            fillColor: '#ffffff',
            color: '#0f172a',
            borderColor: '#0284c7',
            borderWidth: 1.5,
            active: { borderColor: '#0369a1', borderWidth: 2.5 }
          },
          node: {
            fillColor: '#ffffff',
            color: '#1e293b',
            borderColor: '#cbd5e1',
            borderWidth: 1.2,
            active: { borderColor: '#0284c7', borderWidth: 2 }
          }
        });
      } else {
        const darkTheme = THEME_PRESETS[this.currentTheme] || THEME_PRESETS.cyberDark;
        this.mindMapInstance.setThemeConfig({
          backgroundColor: darkTheme.backgroundColor || '#07080d',
          lineColor: darkTheme.lineColor || '#0284c7',
          root: { ...(darkTheme.root || {}), color: '#f8fafc' },
          second: { ...(darkTheme.second || {}), color: '#f8fafc' },
          node: { ...(darkTheme.node || {}), color: '#f8fafc' }
        });
      }
    }

    // Invertir automáticamente los colores de texto de todos los nodos del árbol:
    // Modo Claro: todas las letras blancas/claras pasan a negro (#0f172a)
    // Modo Oscuro: todas las letras negras/oscuras pasan a blanco (#f8fafc)
    if (this.mindMapInstance?.renderer?.root) {
      const traverseInvert = (node: any) => {
        if (!node) return;
        const curColor = (typeof node.getStyle === 'function' ? node.getStyle('color', false) : null) || node.nodeData?.data?.color;
        let shouldInvert = false;
        let newColor = defaultTextColor;

        if (mode === 'light') {
          // Si la letra es blanca o clara, convertir a negro
          if (!curColor || this.isWhiteOrLightTextColor(curColor)) {
            shouldInvert = true;
            newColor = '#0f172a';
          }
        } else {
          // Si la letra es negra u oscura, convertir a blanco
          if (!curColor || this.isBlackOrDarkTextColor(curColor)) {
            shouldInvert = true;
            newColor = '#f8fafc';
          }
        }

        if (shouldInvert) {
          try {
            this.mindMapInstance.execCommand('SET_NODE_STYLES', node, { color: newColor });
          } catch {}
          if (node.nodeData?.data) {
            node.nodeData.data.color = newColor;
          }
          if (typeof node.reRender === 'function') {
            node.reRender();
          }
        }

        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(traverseInvert);
        }
      };

      traverseInvert(this.mindMapInstance.renderer.root);
    }

    if (typeof this.mindMapInstance?.reRender === 'function') {
      this.mindMapInstance.reRender();
    } else if (typeof this.mindMapInstance?.render === 'function') {
      this.mindMapInstance.render();
    }

    this.mindmeisterAdapter?.setCanvasBgMode(mode);
    try {
      localStorage.setItem('eureka_mindmap_canvas_bg_mode', mode);
    } catch {}

    const preview = this.container.querySelector('#preview-canvas-mode');
    if (preview) {
      preview.textContent = mode === 'light' ? '☀️' : '🌙';
    }

    const previewGlobalFont = this.container.querySelector('#preview-global-font-color') as HTMLElement | null;
    if (previewGlobalFont) {
      previewGlobalFont.style.background = defaultTextColor;
      previewGlobalFont.style.borderColor = defaultTextColor === '#f8fafc' ? 'rgba(255,255,255,0.4)' : 'transparent';
    }

    this.updateNodeDropdownUI();
    this.saveSync();
  }

  /**
   * Mide de manera determinista y matemática el tamaño óptimo (width x height) del recuadro
   * para envolver exactamente el texto renderizado, eliminando espacios vacíos a la derecha
   * y holguras excesivas en los costados al hacer saltos de línea.
   */
  private measureOptimalNodeSize(
    text: string,
    fontSize: number = 14,
    fontFamily: string = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: string = 'normal',
    hasImage: boolean = false,
    imageW: number = 0,
    imageH: number = 0
  ): { width: number; height: number } {
    const minW = 76;
    const maxW = 260;
    const minH = 36;
    const paddingX = 24; // 12px izquierda + 12px derecha

    const clean = (text || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (!clean && !hasImage) {
      return { width: 110, height: minH }; // Espacio para el placeholder "Escribe aquí..."
    }

    if (!this.measureContainer || !this.measureContainer.parentElement) {
      this.measureContainer = document.createElement('div');
      this.measureContainer.style.cssText = 'position:fixed;left:-99999px;top:-99999px;visibility:hidden;pointer-events:none;z-index:-9999;box-sizing:border-box;';
      document.body.appendChild(this.measureContainer);
    }

    const testEl = document.createElement('div');
    testEl.className = 'eureka-mindmap-custom-node';
    testEl.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      font-family: ${fontFamily};
      font-size: ${fontSize}px;
      font-weight: ${fontWeight};
      line-height: 1.4;
      padding: 6px 12px;
      box-sizing: border-box;
      word-break: break-word;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
      text-align: center;
      display: inline-block;
      width: auto;
      max-width: ${maxW}px;
    `;

    const textSpan = document.createElement('span');
    textSpan.style.cssText = 'display:inline;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;';

    const textStr = (text === undefined || text === null) ? '' : String(text);
    if (textStr.includes('class="katex"') || textStr.includes("<span class='katex'")) {
      textSpan.innerHTML = textStr;
    } else if (textStr.includes('\\') || textStr.includes('$')) {
      try {
        textSpan.innerHTML = katexService.parseAndRender(textStr);
      } catch {
        textSpan.innerText = clean;
      }
    } else {
      textSpan.innerText = clean;
    }

    testEl.appendChild(textSpan);
    this.measureContainer.innerHTML = '';
    this.measureContainer.appendChild(testEl);

    // Medir ancho real de cada una de las líneas renderizadas
    let maxLineW = 0;
    try {
      const range = document.createRange();
      range.selectNodeContents(textSpan);
      const rects = range.getClientRects();
      if (rects && rects.length > 0) {
        for (let i = 0; i < rects.length; i++) {
          if (rects[i].width > maxLineW) {
            maxLineW = rects[i].width;
          }
        }
      } else {
        maxLineW = textSpan.getBoundingClientRect().width;
      }
    } catch {
      maxLineW = testEl.scrollWidth - paddingX;
    }

    let optimalW = Math.max(minW, Math.min(maxW, Math.ceil(maxLineW + paddingX)));
    if (hasImage && imageW > 0) {
      optimalW = Math.max(optimalW, Math.min(maxW, Math.ceil(imageW + paddingX)));
    }

    // Probar altura exacta con el ancho óptimo fijado
    testEl.style.width = `${optimalW}px`;
    testEl.style.maxWidth = `${optimalW}px`;

    let optimalH = Math.max(minH, Math.ceil(testEl.offsetHeight));
    if (hasImage && imageH > 0) {
      optimalH += Math.ceil(imageH + 6);
    }

    this.measureContainer.innerHTML = '';
    return { width: optimalW, height: optimalH };
  }

  /**
   * 4. GESTIÓN DE EDICIÓN DIRECTA EN EL MISMO RECUADRO SELECCIONADO (IN-PLACE DIRECT EDITING)
   * Edita directamente sobre el mismo texto del nodo (contenteditable).
   * Cero desfase de posición, cero duplicados de capas de texto, cero distorsión.
   * Al pulsar Enter (o blur), recalcula el recuadro y preserva el nodo activo.
   */
  private isEditingText: boolean = false;

  private openDirectTextEditor(): void {
    if (!this.activeNode || !this.mindMapInstance || this.isEditingText) return;
    this.triggerHaptic();

    const node = this.activeNode;

    // 1. Obtener texto actual del nodo
    let currentText = (node.getData ? node.getData('text') : node.nodeData?.data?.text) || '';
    const rawText = node.getData ? node.getData('rawText') : node.nodeData?.data?.rawText;
    if (rawText !== undefined && rawText !== null) {
      currentText = rawText;
    } else {
      currentText = currentText.replace(/<br\s*\/?>/gi, '\n');
    }
    if (currentText.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() === '') {
      currentText = '';
    }

    // 2. Obtener el elemento de texto renderizado en el nodo SVG
    const groupNode = node.group?.node as SVGGraphicsElement | null;
    const customNodeEl = groupNode?.querySelector('.eureka-mindmap-custom-node') as HTMLElement | null;
    const textRenderedEl = groupNode?.querySelector('.eureka-node-text-rendered') as HTMLElement | null;

    if (!textRenderedEl || !customNodeEl) return;

    this.isEditingText = true;

    // Pausar comandos globales de SimpleMindMap para que Enter, Tab, Del no creen nodos ni borren nada mientras se escribe
    this.mindMapInstance?.keyCommand?.pause();
    this.mindMapInstance?.keyCommand?.stopCheckInSvg?.();
    if (this.mindMapInstance?.renderer && typeof this.mindMapInstance.renderer.startTextEdit === 'function') {
      this.mindMapInstance.renderer.startTextEdit();
    }

    // Ocultar botón '+' flotante inferior mientras se escribe para evitar cualquier superposición
    const pillSiblingBtn = this.container.querySelector('.mm-node-add-sibling-btn') as HTMLElement | null;
    if (pillSiblingBtn) pillSiblingBtn.style.display = 'none';

    // Ocultar e inhabilitar temporalmente el botón de expandir (+) para que NUNCA se superponga mientras se escribe
    const originalShowExpandBtn = (node as any).showExpandBtn;
    (node as any).showExpandBtn = () => {};
    if (typeof (node as any).removeExpandBtn === 'function') {
      (node as any).removeExpandBtn();
    }
    if ((node as any)._expandBtn) {
      try {
        (node as any)._expandBtn.hide?.();
        if ((node as any)._expandBtn.node) {
          (node as any)._expandBtn.node.style.setProperty('display', 'none', 'important');
        }
      } catch {}
    }

    // Activar edición in-place directamente en el mismo elemento sin duplicados ni desplazamientos
    customNodeEl.classList.add('is-editing');
    textRenderedEl.contentEditable = 'true';
    textRenderedEl.spellcheck = false;
    textRenderedEl.innerText = currentText;

    // Colocar cursor al final del texto
    try {
      const range = document.createRange();
      range.selectNodeContents(textRenderedEl);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    } catch {}

    textRenderedEl.focus();

    // Auto-ajustar en tiempo real mientras el usuario escribe:
    // Mide matemáticamente con exactitud cada línea para que el recuadro y el contorno
    // azul se acoplen perfectamente al texto en tiempo real, sin espacios sobrantes.
    const onInput = () => {
      if (!customNodeEl || !groupNode || !this.activeNode) return;

      const fullText = textRenderedEl.innerText || '';
      const computed = window.getComputedStyle(textRenderedEl);
      const fontSize = parseFloat(computed.fontSize) || 14;
      const fontFamily = computed.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const fontWeight = computed.fontWeight || 'normal';

      const imgEl = customNodeEl.querySelector('img') as HTMLImageElement | null;
      const hasImage = Boolean(imgEl);
      const imageW = imgEl?.offsetWidth || 0;
      const imageH = imgEl?.offsetHeight || 0;

      const optSize = this.measureOptimalNodeSize(
        fullText,
        fontSize,
        fontFamily,
        fontWeight,
        hasImage,
        imageW,
        imageH
      );

      const neededW = optSize.width;
      const neededH = optSize.height;

      // Aplicar ancho y alto directamente al contenedor DOM del nodo
      customNodeEl.style.width = `${neededW}px`;
      customNodeEl.style.height = `${neededH}px`;
      customNodeEl.style.maxWidth = '260px';

      // Asignar al nodo para que el shape y el motor geométrico usen estas dimensiones exactas
      node.width = neededW;
      node.height = neededH;

      // Asegurar que foreignObject tenga las dimensiones exactas
      const fo = groupNode.querySelector('foreignObject');
      if (fo) {
        fo.setAttribute('width', String(neededW));
        fo.setAttribute('height', String(neededH));
      }

      // Sincronizar el layout nativo del nodo con SimpleMindMap
      if (typeof (node as any).customNodeContentRealtimeLayout === 'function') {
        (node as any).customNodeContentRealtimeLayout();
      }

      // Asegurar que el shape SVG (.smm-node-shape) coincida al 100% con el contenido
      const shapePath = groupNode.querySelector('.smm-node-shape') as SVGPathElement | null;
      if (shapePath) {
        const r = 8;
        const d = `M${r},0 L${neededW - r},0 C${neededW - r},0 ${neededW},0 ${neededW},${r} L${neededW},${neededH - r} C${neededW},${neededH - r} ${neededW},${neededH} ${neededW - r},${neededH} L${r},${neededH} C${r},${neededH} 0,${neededH} 0,${neededH - r} L0,${r} C0,${r} 0,0 ${r},0 Z`;
        shapePath.setAttribute('d', d);
      }

      // Actualizar contorno activo de selección (.smm-hover-node) para que envuelva exactamente todo el texto multilínea
      const hoverNodeRect = groupNode.querySelector('.smm-hover-node') as SVGRectElement | null;
      if (hoverNodeRect) {
        const pad = (this.mindMapInstance?.opt?.hoverRectPadding ?? 2);
        hoverNodeRect.setAttribute('width', String(neededW + pad * 2));
        hoverNodeRect.setAttribute('height', String(neededH + pad * 2));
        hoverNodeRect.setAttribute('x', String(-pad));
        hoverNodeRect.setAttribute('y', String(-pad));
        hoverNodeRect.style.display = 'block';
        hoverNodeRect.style.opacity = '1';
      }

      // Mantener conectores spline alineados con el nuevo borde del recuadro
      if (node.parent && typeof node.parent.renderLine === 'function') {
        node.parent.renderLine();
      }
      if (typeof node.renderLine === 'function') {
        node.renderLine();
      }

      // Sincronizar posición de la barra contextual flotante si está visible
      if (this.mindmeisterAdapter) {
        try {
          (this.mindmeisterAdapter as any).updatePillPosition?.();
        } catch {}
      }
    };

    textRenderedEl.addEventListener('input', onInput);
    // Ejecutar inmediatamente para ajustar el recuadro al texto inicial si es multilínea
    onInput();

    // Evitar que hacer clic o arrastrar en el texto dispare el paneo del lienzo SimpleMindMap
    const stopProp = (e: Event) => e.stopPropagation();
    textRenderedEl.addEventListener('mousedown', stopProp);
    textRenderedEl.addEventListener('pointerdown', stopProp);

    let isCommitted = false;
    const commitChanges = (save: boolean = true) => {
      if (isCommitted) return;
      isCommitted = true;
      this.isEditingText = false;

      // Reanudar shortcuts globales de SimpleMindMap
      this.mindMapInstance?.keyCommand?.recovery();
      this.mindMapInstance?.keyCommand?.recoveryCheckInSvg?.();
      if (this.mindMapInstance?.renderer && typeof this.mindMapInstance.renderer.endTextEdit === 'function') {
        this.mindMapInstance.renderer.endTextEdit();
      }

      // Restaurar el botón expandir
      (node as any).showExpandBtn = originalShowExpandBtn;

      textRenderedEl.removeEventListener('input', onInput);
      textRenderedEl.removeEventListener('keydown', onKeyDown);
      textRenderedEl.removeEventListener('blur', onBlur);
      textRenderedEl.removeEventListener('mousedown', stopProp);
      textRenderedEl.removeEventListener('pointerdown', stopProp);

      textRenderedEl.contentEditable = 'false';
      customNodeEl.classList.remove('is-editing');

      const rawVal = textRenderedEl.innerText || '';
      const newText = save ? (rawVal.trim() === '' ? '' : rawVal.trim()) : currentText;

      if (this.activeNode && this.mindMapInstance) {
        if (typeof this.activeNode.setData === 'function') {
          this.activeNode.setData({ text: newText, rawText: newText });
        } else if (this.activeNode.nodeData?.data) {
          this.activeNode.nodeData.data.text = newText;
          this.activeNode.nodeData.data.rawText = newText;
        }

        try {
          this.mindMapInstance.execCommand('SET_NODE_TEXT', this.activeNode, newText);
        } catch {}

        if (typeof this.activeNode.reRender === 'function') {
          this.activeNode.reRender();
        }
        if (typeof this.mindMapInstance.render === 'function') {
          this.mindMapInstance.render();
        }

        if (typeof (this.activeNode as any).renderExpandBtn === 'function' && typeof (this.activeNode as any).getChildrenLength === 'function' && (this.activeNode as any).getChildrenLength() > 0 && !this.activeNode.isRoot) {
          try {
            (this.activeNode as any).renderExpandBtn();
          } catch {}
        }

        // Mantener el nodo seleccionado y activo para que al pulsar Hijo (Tab) o Hermano (+) funcione de inmediato
        const savedNode = this.activeNode;
        setTimeout(() => {
          if (savedNode && !this.isDestroyed) {
            savedNode.active();
            if (this.mindMapInstance?.renderer) {
              this.mindMapInstance.renderer.activeNodeList = [savedNode];
            }
            this.activeNode = savedNode;
            this.updateNodeDropdownUI();
            this.updateDockButtons(true);
            if (this.mindmeisterAdapter) {
              (this.mindmeisterAdapter as any).updatePillPosition?.();
            }
          }
        }, 40);

        this.triggerHaptic();
        this.scheduleDebouncedSave();
      }
    };

    const onBlur = () => {
      commitChanges(true);
    };
    textRenderedEl.addEventListener('blur', onBlur, { once: true });

    const onKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      (e as any).stopImmediatePropagation?.();

      if (e.key === 'Escape') {
        e.preventDefault();
        commitChanges(true);
      } else if (e.key === 'Enter') {
        // Req 4: Enter sirve para dar un enter hacia abajo (salto de línea), NUNCA para finalizar ni crear nuevo nodo
        e.preventDefault();
        e.stopPropagation();
        (e as any).stopImmediatePropagation?.();

        let inserted = false;
        try {
          inserted = document.execCommand('insertLineBreak');
        } catch {}

        if (!inserted) {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const br = document.createElement('br');
            range.insertNode(br);
            range.setStartAfter(br);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }

        onInput();
      }
    };
    textRenderedEl.addEventListener('keydown', onKeyDown);
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

      // Color de recuadro / fondo: círculo de color
      const curBorderColor = typeof this.activeNode.getStyle === 'function' ? this.activeNode.getStyle('borderColor', false) : null;
      const curFillColor = typeof this.activeNode.getStyle === 'function' ? this.activeNode.getStyle('fillColor', false) : null;
      const previewBg = this.container.querySelector('#preview-node-bg') as HTMLElement | null;
      if (previewBg) {
        previewBg.style.background = (curBorderColor && curBorderColor !== 'transparent') ? curBorderColor : (curFillColor || '#0ea5e9');
      }

      // Relleno toggle button estado
      const btnToggleFill = this.container.querySelector('#btn-toggle-node-fill');
      const labelFill = this.container.querySelector('#label-node-fill');
      if (btnToggleFill) btnToggleFill.classList.toggle('active', this.nodeFillEnabled);
      if (labelFill) labelFill.textContent = this.nodeFillEnabled ? 'Relleno: ON' : 'Relleno: OFF';

      // Color de línea conectora individual
      const curLineColor = (this.activeNode.getData ? this.activeNode.getData('branchColor') || this.activeNode.getData('lineColor') : null) || '#0ea5e9';
      const previewLine = this.container.querySelector('#preview-node-line-color') as HTMLElement | null;
      if (previewLine) {
        previewLine.style.background = curLineColor;
        previewLine.style.borderColor = curLineColor === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'transparent';
      }

      // Efectos de fuente: Negrita, Cursiva, Subrayado
      const curWeight = (this.activeNode.getData ? this.activeNode.getData('fontWeight') : null) || (typeof this.activeNode.getStyle === 'function' ? this.activeNode.getStyle('fontWeight', false) : 'normal');
      const curStyle = (this.activeNode.getData ? this.activeNode.getData('fontStyle') : null) || 'normal';
      const curDecor = (this.activeNode.getData ? this.activeNode.getData('textDecoration') : null) || 'none';

      const btnBold = this.container.querySelector('#btn-toggle-bold');
      const btnItalic = this.container.querySelector('#btn-toggle-italic');
      const btnUnderline = this.container.querySelector('#btn-toggle-underline');

      btnBold?.classList.toggle('active', curWeight === 'bold' || curWeight === '700');
      btnItalic?.classList.toggle('active', curStyle === 'italic');
      btnUnderline?.classList.toggle('active', curDecor === 'underline');

      // Input de color de texto personalizado
      const customColorInput = this.container.querySelector('#input-custom-font-color') as HTMLInputElement | null;
      if (customColorInput && curTextColor && curTextColor.startsWith('#') && curTextColor.length === 7) {
        customColorInput.value = curTextColor;
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
   * Aplica color global a todos los recuadros o activa modo invisible global
   */
  private applyGlobalNodesColor(colorKey: string): void {
    if (!this.mindMapInstance) return;
    if (colorKey === 'transparent') {
      this.setAllNodesInvisible(true);
      return;
    }

    // Desactivar modo invisible global si se elige un color concreto
    this.globalInvisibleBoxes = false;
    const btnToggle = this.container.querySelector('#btn-toggle-all-invisible');
    if (btnToggle) {
      btnToggle.classList.remove('active');
      btnToggle.removeAttribute('style');
    }

    const preset = COLOR_PRESETS[colorKey];
    if (!preset) return;

    // Actualizar themeConfig para que los nuevos nodos adopten este color
    const curThemeConfig = (typeof this.mindMapInstance?.getCustomThemeConfig === 'function' 
      ? this.mindMapInstance.getCustomThemeConfig() 
      : this.mindMapInstance?.opt?.themeConfig) || {};

    const nodeStyle = {
      fillColor: preset.fill,
      borderColor: preset.border,
      borderWidth: 1.5,
      color: preset.text
    };
    const updatedThemeConfig = {
      ...curThemeConfig,
      root: { ...(curThemeConfig.root || {}), ...nodeStyle, borderWidth: 2 },
      second: { ...(curThemeConfig.second || {}), ...nodeStyle, borderWidth: 1.5 },
      node: { ...(curThemeConfig.node || {}), ...nodeStyle, borderWidth: 1 }
    };
    if (typeof this.mindMapInstance?.setThemeConfig === 'function') {
      this.mindMapInstance.setThemeConfig(updatedThemeConfig, true);
    } else if (typeof this.mindMapInstance?.theme?.setThemeConfig === 'function') {
      this.mindMapInstance.theme.setThemeConfig(updatedThemeConfig, true);
    }

    try {
      const traverse = (node: any) => {
        if (!node) return;
        this.mindMapInstance.execCommand('SET_NODE_STYLES', node, {
          fillColor: preset.fill,
          borderColor: preset.border,
          color: preset.text,
          borderWidth: 1.5
        });
        if (node.nodeData?.data) {
          node.nodeData.data.fillColor = preset.fill;
          node.nodeData.data.borderColor = preset.border;
          node.nodeData.data.borderWidth = 1.5;
          node.nodeData.data.color = preset.text;
        }
        if (typeof node.reRender === 'function') {
          node.reRender();
        }
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(traverse);
        }
      };
      traverse(this.mindMapInstance.renderer?.root);
      if (typeof this.mindMapInstance.reRender === 'function') {
        this.mindMapInstance.reRender();
      } else if (typeof this.mindMapInstance.render === 'function') {
        this.mindMapInstance.render();
      }
      this.triggerHaptic();
      this.saveSync();
    } catch (e) {
      console.warn('[UltraFastMindMap] Error aplicando color global:', e);
    }
  }

  /**
   * Requisito 3: Convierte todos los recuadros existentes y futuros en recuadros 100% invisibles
   * (sin fondo y sin borde, dejando únicamente el texto y las líneas conectoras)
   */
  public setAllNodesInvisible(enable: boolean = true): void {
    this.globalInvisibleBoxes = enable;

    // 1. Actualizar configuración de tema para que TODOS los nodos futuros se creen invisibles
    const curThemeConfig = (typeof this.mindMapInstance?.getCustomThemeConfig === 'function' 
      ? this.mindMapInstance.getCustomThemeConfig() 
      : this.mindMapInstance?.opt?.themeConfig) || {};

    const transparentNodeStyle = enable ? {
      fillColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      active: { borderColor: '#38bdf8', borderWidth: 1.5 }
    } : {};

    const updatedThemeConfig = {
      ...curThemeConfig,
      root: { ...(curThemeConfig.root || {}), ...(enable ? transparentNodeStyle : { fillColor: '#0c4a6e', borderColor: '#38bdf8', borderWidth: 2 }) },
      second: { ...(curThemeConfig.second || {}), ...(enable ? transparentNodeStyle : { fillColor: '#075985', borderColor: '#0284c7', borderWidth: 1.5 }) },
      node: { ...(curThemeConfig.node || {}), ...(enable ? transparentNodeStyle : { fillColor: '#032b43', borderColor: '#0c4a6e', borderWidth: 1 }) }
    };

    if (typeof this.mindMapInstance?.setThemeConfig === 'function') {
      this.mindMapInstance.setThemeConfig(updatedThemeConfig, true);
    } else if (typeof this.mindMapInstance?.theme?.setThemeConfig === 'function') {
      this.mindMapInstance.theme.setThemeConfig(updatedThemeConfig, true);
    }

    // 2. Modificar TODOS los nodos existentes en el árbol del mapa
    if (this.mindMapInstance?.renderer?.root) {
      const textColor = this.canvasBgMode === 'light' ? '#0f172a' : '#f8fafc';
      const traverse = (node: any) => {
        if (!node) return;
        if (enable) {
          if (typeof this.mindMapInstance.execCommand === 'function') {
            this.mindMapInstance.execCommand('SET_NODE_STYLES', node, {
              fillColor: 'transparent',
              borderColor: 'transparent',
              borderWidth: 0,
              color: textColor
            });
          }
          if (node.nodeData?.data) {
            node.nodeData.data.fillColor = 'transparent';
            node.nodeData.data.borderColor = 'transparent';
            node.nodeData.data.borderWidth = 0;
            node.nodeData.data.color = textColor;
          }
        } else {
          if (typeof this.mindMapInstance.execCommand === 'function') {
            this.mindMapInstance.execCommand('SET_NODE_STYLES', node, {
              fillColor: '#0c4a6e',
              borderColor: '#38bdf8',
              borderWidth: 1.5
            });
          }
          if (node.nodeData?.data) {
            node.nodeData.data.fillColor = '#0c4a6e';
            node.nodeData.data.borderColor = '#38bdf8';
            node.nodeData.data.borderWidth = 1.5;
          }
        }
        if (typeof node.reRender === 'function') {
          node.reRender();
        }
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(traverse);
        }
      };
      traverse(this.mindMapInstance.renderer.root);
    }

    // 3. Forzar re-render general para refrescar conectores y geometría
    if (typeof this.mindMapInstance?.reRender === 'function') {
      this.mindMapInstance.reRender();
    } else if (typeof this.mindMapInstance?.render === 'function') {
      this.mindMapInstance.render();
    }

    // 4. Actualizar botón en la barra superior
    const btnToggle = this.container.querySelector('#btn-toggle-all-invisible');
    if (btnToggle) {
      if (this.globalInvisibleBoxes) {
        btnToggle.classList.add('active');
        btnToggle.setAttribute('style', 'background:rgba(56,189,248,0.2); border:1px solid #38bdf8; color:#38bdf8;');
      } else {
        btnToggle.classList.remove('active');
        btnToggle.removeAttribute('style');
      }
    }

    const preview = this.container.querySelector('#preview-global-color') as HTMLElement | null;
    if (preview) {
      if (enable) {
        preview.style.background = 'transparent';
        preview.style.border = '1.5px dashed rgba(255,255,255,0.6)';
      } else {
        preview.style.background = '#0ea5e9';
        preview.style.border = 'none';
      }
    }

    this.triggerHaptic();
    this.saveSync();
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

  /**
   * Cambia el color de vectores/líneas de conexión de forma general
   */
  public setGlobalLineColor(color: string): void {
    if (!this.mindMapInstance) return;
    this.triggerHaptic();

    const curThemeConfig = (typeof this.mindMapInstance?.getCustomThemeConfig === 'function' 
      ? this.mindMapInstance.getCustomThemeConfig() 
      : this.mindMapInstance?.opt?.themeConfig) || {};

    const updatedThemeConfig = {
      ...curThemeConfig,
      lineColor: color
    };

    if (typeof this.mindMapInstance?.setThemeConfig === 'function') {
      this.mindMapInstance.setThemeConfig(updatedThemeConfig, true);
    } else if (typeof this.mindMapInstance?.theme?.setThemeConfig === 'function') {
      this.mindMapInstance.theme.setThemeConfig(updatedThemeConfig, true);
    }

    const preview = this.container.querySelector('#preview-line-color') as HTMLElement | null;
    if (preview) {
      preview.style.background = color;
      preview.style.borderColor = color === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'transparent';
    }

    if (typeof this.mindMapInstance.reRender === 'function') {
      this.mindMapInstance.reRender();
    } else if (typeof this.mindMapInstance.render === 'function') {
      this.mindMapInstance.render();
    }

    this.saveSync();
  }

  /**
   * Cambia el color de fondo personalizado del lienzo del mapa
   */
  public setCanvasBackgroundColor(color: string): void {
    if (!this.mindMapInstance) return;
    this.triggerHaptic();

    const curThemeConfig = (typeof this.mindMapInstance?.getCustomThemeConfig === 'function' 
      ? this.mindMapInstance.getCustomThemeConfig() 
      : this.mindMapInstance?.opt?.themeConfig) || {};

    const updatedThemeConfig = {
      ...curThemeConfig,
      backgroundColor: color
    };

    if (typeof this.mindMapInstance?.setThemeConfig === 'function') {
      this.mindMapInstance.setThemeConfig(updatedThemeConfig, true);
    } else if (typeof this.mindMapInstance?.theme?.setThemeConfig === 'function') {
      this.mindMapInstance.theme.setThemeConfig(updatedThemeConfig, true);
    }

    const canvasEl = this.container.querySelector('#mindmap-canvas') as HTMLElement | null;
    if (canvasEl) {
      canvasEl.style.backgroundColor = color;
    }

    const preview = this.container.querySelector('#preview-canvas-color') as HTMLElement | null;
    if (preview) {
      preview.style.background = color;
    }

    if (typeof this.mindMapInstance.reRender === 'function') {
      this.mindMapInstance.reRender();
    }
    this.saveSync();
  }

  /**
   * Cambia el color de la línea conectora del nodo activo
   */
  public setNodeLineColor(color: string): void {
    if (!this.activeNode || !this.mindMapInstance) return;
    this.triggerHaptic();

    if (typeof this.activeNode.setData === 'function') {
      this.activeNode.setData({ branchColor: color, lineColor: color });
    } else if (this.activeNode.nodeData?.data) {
      this.activeNode.nodeData.data.branchColor = color;
      this.activeNode.nodeData.data.lineColor = color;
    }

    if (this.activeNode.parent && typeof this.activeNode.parent.renderLine === 'function') {
      this.activeNode.parent.renderLine();
    }
    if (typeof this.activeNode.renderLine === 'function') {
      this.activeNode.renderLine();
    }
    if (typeof this.mindMapInstance.reRender === 'function') {
      this.mindMapInstance.reRender();
    } else if (typeof this.mindMapInstance.render === 'function') {
      this.mindMapInstance.render();
    }

    const preview = this.container.querySelector('#preview-node-line-color') as HTMLElement | null;
    if (preview) {
      preview.style.background = color;
      preview.style.borderColor = color === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'transparent';
    }

    this.scheduleDebouncedSave();
  }

  /**
   * Hereda el color de la línea conectora activa a todos sus recuadros hijos y descendientes
   */
  public inheritNodeLineColorToChildren(): void {
    if (!this.activeNode || !this.mindMapInstance) return;
    this.triggerHaptic();

    const color = (this.activeNode.getData ? this.activeNode.getData('branchColor') || this.activeNode.getData('lineColor') : null) || '#0ea5e9';

    const applyDescendants = (n: any) => {
      const children = (typeof n.getChildren === 'function' ? n.getChildren() : n.children) || [];
      for (const child of children) {
        if (typeof child.setData === 'function') {
          child.setData({ branchColor: color, lineColor: color });
        } else if (child.nodeData?.data) {
          child.nodeData.data.branchColor = color;
          child.nodeData.data.lineColor = color;
        }
        if (typeof child.renderLine === 'function') {
          child.renderLine();
        }
        applyDescendants(child);
      }
    };

    applyDescendants(this.activeNode);

    if (typeof this.mindMapInstance.reRender === 'function') {
      this.mindMapInstance.reRender();
    } else if (typeof this.mindMapInstance.render === 'function') {
      this.mindMapInstance.render();
    }

    this.scheduleDebouncedSave();
  }

  /**
   * Conmuta si los recuadros tienen relleno interior (ON) o solo borde (OFF)
   */
  public toggleNodeFill(): void {
    this.nodeFillEnabled = !this.nodeFillEnabled;
    try {
      localStorage.setItem('eureka_mindmap_node_fill_enabled', String(this.nodeFillEnabled));
    } catch {}

    const btn = this.container.querySelector('#btn-toggle-node-fill');
    const label = this.container.querySelector('#label-node-fill');
    if (btn) btn.classList.toggle('active', this.nodeFillEnabled);
    if (label) label.textContent = this.nodeFillEnabled ? 'Relleno: ON' : 'Relleno: OFF';

    if (this.activeNode && this.mindMapInstance) {
      const curBorder = typeof this.activeNode.getStyle === 'function' ? this.activeNode.getStyle('borderColor', false) : null;
      let newFill = 'transparent';
      if (this.nodeFillEnabled && curBorder && curBorder !== 'transparent') {
        const matchingEntry = Object.values(COLOR_PRESETS).find((p) => p.border === curBorder);
        newFill = matchingEntry ? matchingEntry.fill : `${curBorder}22`;
      }
      this.mindMapInstance.execCommand('SET_NODE_STYLES', this.activeNode, {
        fillColor: newFill
      });
      if (this.activeNode.nodeData?.data) {
        this.activeNode.nodeData.data.fillColor = newFill;
      }
      if (typeof this.activeNode.reRender === 'function') {
        this.activeNode.reRender();
      }
      if (typeof this.mindMapInstance.render === 'function') {
        this.mindMapInstance.render();
      }
      this.scheduleDebouncedSave();
    }
    this.triggerHaptic();
  }

  /**
   * Incrementa o reduce el tamaño de letra del nodo activo en 1px (stepper)
   */
  public adjustActiveNodeFontSize(delta: number): void {
    if (!this.activeNode || !this.mindMapInstance) return;
    const curSize = (typeof this.activeNode.getStyle === 'function' ? this.activeNode.getStyle('fontSize', false) : 14) || 14;
    const newSize = Math.max(10, Math.min(48, curSize + delta));

    this.mindMapInstance.execCommand('SET_NODE_STYLES', this.activeNode, {
      fontSize: newSize
    });
    if (this.activeNode.nodeData?.data) {
      this.activeNode.nodeData.data.fontSize = newSize;
    }

    const preview = this.container.querySelector('#preview-node-font-size');
    if (preview) preview.textContent = String(newSize);

    if (typeof this.activeNode.reRender === 'function') {
      this.activeNode.reRender();
    }
    if (typeof this.mindMapInstance.render === 'function') {
      this.mindMapInstance.render();
    }

    this.triggerHaptic();
    this.scheduleDebouncedSave();
  }

  /**
   * Conmuta un efecto tipográfico en el nodo activo (Negrita, Cursiva, Subrayado)
   */
  public toggleNodeFontEffect(effect: 'bold' | 'italic' | 'underline'): void {
    if (!this.activeNode || !this.mindMapInstance) return;
    this.triggerHaptic();

    if (effect === 'bold') {
      const curWeight = (this.activeNode.getData ? this.activeNode.getData('fontWeight') : null) || 
        (typeof this.activeNode.getStyle === 'function' ? this.activeNode.getStyle('fontWeight', false) : 'normal');
      const newWeight = curWeight === 'bold' || curWeight === '700' ? 'normal' : 'bold';
      this.mindMapInstance.execCommand('SET_NODE_STYLES', this.activeNode, { fontWeight: newWeight });
      if (typeof this.activeNode.setData === 'function') {
        this.activeNode.setData({ fontWeight: newWeight });
      } else if (this.activeNode.nodeData?.data) {
        this.activeNode.nodeData.data.fontWeight = newWeight;
      }
    } else if (effect === 'italic') {
      const curStyle = (this.activeNode.getData ? this.activeNode.getData('fontStyle') : null) || 'normal';
      const newStyle = curStyle === 'italic' ? 'normal' : 'italic';
      if (typeof this.activeNode.setData === 'function') {
        this.activeNode.setData({ fontStyle: newStyle });
      } else if (this.activeNode.nodeData?.data) {
        this.activeNode.nodeData.data.fontStyle = newStyle;
      }
    } else if (effect === 'underline') {
      const curDecor = (this.activeNode.getData ? this.activeNode.getData('textDecoration') : null) || 'none';
      const newDecor = curDecor === 'underline' ? 'none' : 'underline';
      if (typeof this.activeNode.setData === 'function') {
        this.activeNode.setData({ textDecoration: newDecor });
      } else if (this.activeNode.nodeData?.data) {
        this.activeNode.nodeData.data.textDecoration = newDecor;
      }
    }

    if (typeof this.activeNode.reRender === 'function') {
      this.activeNode.reRender();
    }
    if (typeof this.mindMapInstance.render === 'function') {
      this.mindMapInstance.render();
    }

    this.updateNodeDropdownUI();
    this.scheduleDebouncedSave();
  }

  /**
   * Aplica un tipo de letra (fuente) a un nodo individual o a todo el mapa
   */
  public setFontFamily(font: string, applyGlobal: boolean): void {
    if (!this.mindMapInstance) return;
    this.triggerHaptic();

    if (applyGlobal) {
      this.globalFontFamily = font;
      try {
        localStorage.setItem('eureka_mindmap_font_family', font);
      } catch {}

      const applyToSubtree = (node: any) => {
        if (typeof node.setData === 'function') {
          node.setData({ fontFamily: font });
        } else if (node.nodeData?.data) {
          node.nodeData.data.fontFamily = font;
        }
        if (typeof node.reRender === 'function') {
          node.reRender();
        }
        const children = (typeof node.getChildren === 'function' ? node.getChildren() : node.children) || [];
        children.forEach(applyToSubtree);
      };

      const root = this.mindMapInstance.renderer?.root;
      if (root) applyToSubtree(root);

      if (typeof this.mindMapInstance.reRender === 'function') {
        this.mindMapInstance.reRender();
      } else if (typeof this.mindMapInstance.render === 'function') {
        this.mindMapInstance.render();
      }
      this.scheduleDebouncedSave();
    } else {
      if (!this.activeNode) {
        this.selectRootNode();
      }
      if (this.activeNode) {
        if (typeof this.activeNode.setData === 'function') {
          this.activeNode.setData({ fontFamily: font });
        } else if (this.activeNode.nodeData?.data) {
          this.activeNode.nodeData.data.fontFamily = font;
        }
        if (typeof this.activeNode.reRender === 'function') {
          this.activeNode.reRender();
        }
        if (typeof this.mindMapInstance.render === 'function') {
          this.mindMapInstance.render();
        }
        this.scheduleDebouncedSave();
      }
    }
  }

  /**
   * Hereda el color y borde del recuadro activo a todos sus recuadros hijos recursivamente
   */
  public inheritNodeColorToChildren(): void {
    if (!this.activeNode || !this.mindMapInstance) return;
    this.triggerHaptic();

    const node = this.activeNode;
    const nodeBg = node.getData ? node.getData('fillColor') : node.nodeData?.data?.fillColor;
    const nodeBorder = node.getData ? node.getData('borderColor') : node.nodeData?.data?.borderColor;

    const applyRecursively = (n: any) => {
      if (!n || !n.children) return;
      n.children.forEach((child: any) => {
        const updateData: any = {};
        if (nodeBg !== undefined) {
          updateData.fillColor = nodeBg;
        }
        if (nodeBorder !== undefined) {
          updateData.borderColor = nodeBorder;
        }

        if (typeof child.setData === 'function') {
          child.setData(updateData);
        } else if (child.nodeData?.data) {
          Object.assign(child.nodeData.data, updateData);
        }

        if (typeof child.reRender === 'function') {
          child.reRender();
        }
        applyRecursively(child);
      });
    };

    applyRecursively(node);
    if (typeof this.mindMapInstance.reRender === 'function') {
      this.mindMapInstance.reRender();
    } else if (typeof this.mindMapInstance.render === 'function') {
      this.mindMapInstance.render();
    }
    this.scheduleDebouncedSave();
  }

  /**
   * Aplica un nuevo tamaño de letra de forma general a todo el mapa mental
   */
  public applyGlobalFontSize(size: number): void {
    if (!this.mindMapInstance) return;
    this.triggerHaptic();

    const curThemeConfig = (typeof this.mindMapInstance?.getCustomThemeConfig === 'function' 
      ? this.mindMapInstance.getCustomThemeConfig() 
      : this.mindMapInstance?.opt?.themeConfig) || {};

    const updatedThemeConfig = {
      ...curThemeConfig,
      root: { ...(curThemeConfig.root || {}), fontSize: Math.max(16, size + 2) },
      second: { ...(curThemeConfig.second || {}), fontSize: Math.max(14, size) },
      node: { ...(curThemeConfig.node || {}), fontSize: size }
    };

    if (typeof this.mindMapInstance?.setThemeConfig === 'function') {
      this.mindMapInstance.setThemeConfig(updatedThemeConfig, true);
    } else if (typeof this.mindMapInstance?.theme?.setThemeConfig === 'function') {
      this.mindMapInstance.theme.setThemeConfig(updatedThemeConfig, true);
    }

    const traverse = (node: any) => {
      if (!node) return;
      const targetSize = node.isRoot ? Math.max(16, size + 2) : (node.layerIndex === 1 || node.parent?.isRoot ? Math.max(14, size) : size);
      this.mindMapInstance.execCommand('SET_NODE_STYLES', node, {
        fontSize: targetSize
      });
      if (node.nodeData?.data) {
        node.nodeData.data.fontSize = targetSize;
      }
      if (typeof node.reRender === 'function') {
        node.reRender();
      }
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(traverse);
      }
    };

    traverse(this.mindMapInstance.renderer?.root);
    if (typeof this.mindMapInstance.reRender === 'function') {
      this.mindMapInstance.reRender();
    } else if (typeof this.mindMapInstance.render === 'function') {
      this.mindMapInstance.render();
    }

    const preview = this.container.querySelector('#preview-global-font-size');
    if (preview) preview.textContent = String(size);

    this.saveSync();
  }

  /**
   * Aplica un nuevo color de texto de forma general a todo el mapa mental
   */
  public applyGlobalFontColor(color: string): void {
    if (!this.mindMapInstance) return;
    this.triggerHaptic();

    const curThemeConfig = (typeof this.mindMapInstance?.getCustomThemeConfig === 'function' 
      ? this.mindMapInstance.getCustomThemeConfig() 
      : this.mindMapInstance?.opt?.themeConfig) || {};

    const updatedThemeConfig = {
      ...curThemeConfig,
      root: { ...(curThemeConfig.root || {}), color },
      second: { ...(curThemeConfig.second || {}), color },
      node: { ...(curThemeConfig.node || {}), color }
    };

    if (typeof this.mindMapInstance?.setThemeConfig === 'function') {
      this.mindMapInstance.setThemeConfig(updatedThemeConfig, true);
    } else if (typeof this.mindMapInstance?.theme?.setThemeConfig === 'function') {
      this.mindMapInstance.theme.setThemeConfig(updatedThemeConfig, true);
    }

    const traverse = (node: any) => {
      if (!node) return;
      this.mindMapInstance.execCommand('SET_NODE_STYLES', node, {
        color
      });
      if (node.nodeData?.data) {
        node.nodeData.data.color = color;
      }
      if (typeof node.reRender === 'function') {
        node.reRender();
      }
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(traverse);
      }
    };

    traverse(this.mindMapInstance.renderer?.root);
    if (typeof this.mindMapInstance.reRender === 'function') {
      this.mindMapInstance.reRender();
    } else if (typeof this.mindMapInstance.render === 'function') {
      this.mindMapInstance.render();
    }

    const preview = this.container.querySelector('#preview-global-font-color') as HTMLElement | null;
    if (preview) {
      preview.style.background = color;
      preview.style.borderColor = color === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'transparent';
    }

    this.saveSync();
  }

  private updateDockButtons(hasActiveNode: boolean): void {
    const ids = ['#btn-node-dropdown-child', '#btn-node-dropdown-sibling', '#btn-node-dropdown-delete', '#btn-inherit-color-children'];
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
        const metaLineColor = this.mindMapInstance.themeConfig?.lineColor;
        const metaFontSize = this.container.querySelector('#preview-global-font-size')?.textContent;
        const metaFontColor = (this.container.querySelector('#preview-global-font-color') as HTMLElement)?.style.background;

        localStorage.setItem(`${this.config.storageKey}_meta`, JSON.stringify({
          layout: this.currentLayout,
          theme: this.currentTheme,
          globalInvisibleBoxes: this.globalInvisibleBoxes,
          lineColor: metaLineColor,
          globalFontSize: metaFontSize,
          globalFontColor: metaFontColor,
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
    if (this.measureContainer && this.measureContainer.parentElement) {
      this.measureContainer.parentElement.removeChild(this.measureContainer);
      this.measureContainer = null;
    }
    this.container.innerHTML = '';
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

