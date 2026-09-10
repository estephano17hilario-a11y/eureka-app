import katex from 'katex';
import 'katex/dist/contrib/mhchem.js';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  SCIENCE_SYMBOLS_CATALOG,
  SCIENCE_CATEGORY_TABS,
  type ScienceSymbol,
  type SymbolCategory
} from '../data/science-symbols-catalog';

export interface UniversalSymbolSelectorDrawerOptions {
  mathField?: any;
  onInsert?: (latex: string, symbol: ScienceSymbol) => void;
  onClose?: () => void;
}

/**
 * UniversalSymbolSelectorDrawer
 * Selector Científico Universal de Símbolos de Alto Rendimiento (60 FPS WebView)
 * - 100% de la simbología científica global:
 *   Álgebra, Cálculo, Física & Cuántica (Dirac), Astronomía, Química & Nuclear (mhchem),
 *   Biología & Genética (Pedigree), Lógica & Conjuntos, Alfabeto Griego completo, Números Romanos.
 * - Virtualización / DOM Reciclado: solo renderiza la categoría activa o resultados filtrados.
 * - Búsqueda en vivo con debounce de 50ms sobre keywords en español e inglés.
 * - Inserción directa en <math-field> con placeholders interactivos (#?).
 * - Flat 2D puro sin blur ni sombras pesadas.
 */
export class UniversalSymbolSelectorDrawer {
  private options: UniversalSymbolSelectorDrawerOptions;
  private overlay: HTMLElement | null = null;
  private currentCategory: SymbolCategory = 'algebra';
  private currentSubcategory: string = 'all';
  private searchQuery: string = '';
  private searchDebounceTimer: number | null = null;

  constructor(options: UniversalSymbolSelectorDrawerOptions = {}) {
    this.options = options;
  }

  private triggerHaptic(): void {
    try {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    } catch {}
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch {}
  }

  public open(): void {
    const existing = document.getElementById('universal-science-symbol-drawer');
    if (existing) existing.remove();

    this.triggerHaptic();

    const overlay = document.createElement('div');
    overlay.id = 'universal-science-symbol-drawer';
    overlay.className = 'uss-drawer-overlay';

    overlay.innerHTML = `
      <div class="uss-drawer-sheet">
        <!-- Manija táctil -->
        <div class="uss-drag-bar">
          <div class="uss-drag-pill"></div>
        </div>

        <!-- Header del Selector Universal -->
        <header class="uss-header">
          <div class="uss-header-left">
            <span class="uss-title">Simbología Científica Universal</span>
            <span class="uss-badge" id="uss-symbols-count-badge">${SCIENCE_SYMBOLS_CATALOG.length} Símbolos</span>
          </div>
          <button type="button" class="uss-close-btn" id="btn-uss-close" aria-label="Cerrar">✕</button>
        </header>

        <!-- Barra de Búsqueda Rápida en Vivo -->
        <div class="uss-search-wrapper">
          <div class="uss-search-box">
            <span class="uss-search-icon">🔍</span>
            <input 
              type="text" 
              id="uss-search-input" 
              class="uss-search-input" 
              placeholder="Buscar símbolo (ej: integral, alfa, dirac, cesio, venus, pedigree)..." 
              autocomplete="off"
              spellcheck="false"
            />
            <button type="button" id="btn-uss-clear-search" class="uss-search-clear" style="display:none;">✕</button>
          </div>
        </div>

        <!-- Pestañas Horizontales de Categorías con Scroll Snap -->
        <nav class="uss-tabs-nav" id="uss-category-tabs-bar">
          ${SCIENCE_CATEGORY_TABS.map(
            (tab) => `
            <button type="button" class="uss-tab-chip ${tab.id === this.currentCategory ? 'active' : ''}" data-category="${tab.id}">
              <span>${tab.icon}</span>
              <span>${tab.name}</span>
            </button>
          `
          ).join('')}
        </nav>

        <!-- Barra de Subcategorías Dinámica -->
        <div class="uss-subcategories-bar" id="uss-subcategories-bar">
          <!-- Renderizado dinámico -->
        </div>

        <!-- Cuadrícula Táctil de Alta Densidad (Botones 44x44px) -->
        <div class="uss-grid-scroll-area">
          <div class="uss-symbols-grid" id="uss-symbols-grid-mount">
            <!-- Renderizado dinámico virtualizado -->
          </div>
        </div>

        <!-- Footer Informativo -->
        <footer class="uss-footer">
          <span class="uss-footer-hint">Toca cualquier símbolo para insertarlo en la posición del cursor</span>
          <button type="button" class="uss-btn-done" id="btn-uss-done">Listo ✓</button>
        </footer>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlay = overlay;

    this.bindEvents();
    this.renderSubcategories();
    this.renderSymbolsGrid();
  }

  private bindEvents(): void {
    if (!this.overlay) return;

    // Selector de pestañas de categoría
    this.overlay.querySelectorAll<HTMLButtonElement>('.uss-tab-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.triggerHaptic();
        const cat = btn.dataset.category as SymbolCategory;
        if (!cat) return;

        this.overlay?.querySelectorAll('.uss-tab-chip').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        this.currentCategory = cat;
        this.currentSubcategory = 'all';

        // Limpiar búsqueda si se cambia de pestaña
        const searchInput = this.overlay?.querySelector('#uss-search-input') as HTMLInputElement | null;
        if (searchInput && this.searchQuery) {
          searchInput.value = '';
          this.searchQuery = '';
          const clearBtn = this.overlay?.querySelector('#btn-uss-clear-search') as HTMLElement | null;
          if (clearBtn) clearBtn.style.display = 'none';
        }

        this.renderSubcategories();
        this.renderSymbolsGrid();
      });
    });

    // Búsqueda en vivo con debounce de 50ms
    const searchInput = this.overlay.querySelector('#uss-search-input') as HTMLInputElement;
    const clearBtn = this.overlay.querySelector('#btn-uss-clear-search') as HTMLElement;

    searchInput?.addEventListener('input', () => {
      if (this.searchDebounceTimer) {
        window.clearTimeout(this.searchDebounceTimer);
      }
      this.searchDebounceTimer = window.setTimeout(() => {
        this.searchQuery = searchInput.value.trim().toLowerCase();
        if (clearBtn) {
          clearBtn.style.display = this.searchQuery ? 'flex' : 'none';
        }
        this.renderSymbolsGrid();
      }, 50);
    });

    clearBtn?.addEventListener('click', () => {
      searchInput.value = '';
      this.searchQuery = '';
      clearBtn.style.display = 'none';
      this.renderSymbolsGrid();
      searchInput.focus();
    });

    // Botones de cerrar y backdrop
    this.overlay.querySelector('#btn-uss-close')?.addEventListener('click', () => this.close());
    this.overlay.querySelector('#btn-uss-done')?.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
        window.removeEventListener('keydown', onKeyDown);
      }
    };
    window.addEventListener('keydown', onKeyDown);
  }

  /**
   * Renderiza las subcategorías correspondientes a la categoría seleccionada
   */
  private renderSubcategories(): void {
    const subBar = this.overlay?.querySelector('#uss-subcategories-bar') as HTMLElement | null;
    if (!subBar) return;

    if (this.searchQuery) {
      subBar.innerHTML = '';
      subBar.style.display = 'none';
      return;
    }

    const items = SCIENCE_SYMBOLS_CATALOG.filter((s) => s.category === this.currentCategory);
    const subcats = Array.from(new Set(items.map((s) => s.subcategory).filter(Boolean) as string[]));

    if (subcats.length <= 1) {
      subBar.innerHTML = '';
      subBar.style.display = 'none';
      return;
    }

    subBar.style.display = 'flex';
    subBar.innerHTML = `
      <button type="button" class="uss-subcat-pill ${this.currentSubcategory === 'all' ? 'active' : ''}" data-subcat="all">
        Todos (${items.length})
      </button>
      ${subcats
        .map(
          (sub) => `
        <button type="button" class="uss-subcat-pill ${this.currentSubcategory === sub ? 'active' : ''}" data-subcat="${escapeHtml(sub)}">
          ${escapeHtml(sub)}
        </button>
      `
        )
        .join('')}
    `;

    subBar.querySelectorAll<HTMLButtonElement>('.uss-subcat-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.triggerHaptic();
        subBar.querySelectorAll('.uss-subcat-pill').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSubcategory = btn.dataset.subcat || 'all';
        this.renderSymbolsGrid();
      });
    });
  }

  /**
   * Renderiza los símbolos filtrados en la cuadrícula táctil
   */
  private renderSymbolsGrid(): void {
    const grid = this.overlay?.querySelector('#uss-symbols-grid-mount');
    const badge = this.overlay?.querySelector('#uss-symbols-count-badge');
    if (!grid) return;

    let filtered: ScienceSymbol[] = [];

    if (this.searchQuery) {
      const q = this.searchQuery;
      filtered = SCIENCE_SYMBOLS_CATALOG.filter((item) => {
        return (
          item.label.toLowerCase().includes(q) ||
          item.latex.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.toLowerCase().includes(q)) ||
          (item.subcategory && item.subcategory.toLowerCase().includes(q))
        );
      });
    } else {
      filtered = SCIENCE_SYMBOLS_CATALOG.filter((item) => {
        if (item.category !== this.currentCategory) return false;
        if (this.currentSubcategory !== 'all' && item.subcategory !== this.currentSubcategory) {
          return false;
        }
        return true;
      });
    }

    if (badge) {
      badge.textContent = `${filtered.length} Símbolos`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="uss-empty-state">
          <span>🔍</span>
          <p>No se encontraron símbolos para "${escapeHtml(this.searchQuery)}"</p>
        </div>
      `;
      return;
    }

    // Renderizar celdas táctiles compactas de 44x44px
    grid.innerHTML = filtered
      .map((item) => {
        const previewHtml = this.renderSymbolPreview(item);
        return `
        <button 
          type="button" 
          class="uss-symbol-cell" 
          data-id="${item.id}" 
          title="${escapeHtml(item.label)}"
          aria-label="${escapeHtml(item.label)}"
        >
          <span class="uss-cell-preview">${previewHtml}</span>
          <span class="uss-cell-label">${escapeHtml(item.label)}</span>
        </button>
      `;
      })
      .join('');

    // Enlazar evento táctil de inserción rápida
    grid.querySelectorAll<HTMLButtonElement>('.uss-symbol-cell').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = filtered.find((s) => s.id === id);
        if (!item) return;

        this.triggerHaptic();
        this.insertSymbolIntoMathField(item);

        // Feedback visual sutil en el botón
        btn.classList.add('inserted');
        setTimeout(() => btn.classList.remove('inserted'), 250);
      });
    });
  }

  /**
   * Genera el HTML de previsualización para el símbolo (KaTeX o texto)
   */
  private renderSymbolPreview(item: ScienceSymbol): string {
    // Si contiene placeholders (#? o #@), simplificarlos para renderizado estático
    let renderLatex = item.latex
      .replace(/#@/g, 'a')
      .replace(/#\?/g, 'x')
      .replace(/#0/g, '1');

    // Manejo de fórmulas con \ce{...} o modo display
    if (renderLatex.startsWith('\\ce{') || renderLatex.includes('\\ce{')) {
      try {
        return katex.renderToString(renderLatex, { throwOnError: false, displayMode: false });
      } catch {
        return `<span class="raw-preview">${item.label}</span>`;
      }
    }

    // Texto simple o caracteres romanos
    if (renderLatex.startsWith('\\text{') && renderLatex.endsWith('}')) {
      const match = renderLatex.match(/^\\text\{(.*)\}$/);
      if (match) {
        return `<span style="font-family:serif; font-weight:bold; font-size:1.15rem;">${match[1]}</span>`;
      }
    }

    try {
      return katex.renderToString(renderLatex, { throwOnError: false, displayMode: false });
    } catch {
      return `<span class="raw-preview">${item.label}</span>`;
    }
  }

  /**
   * Inserta el símbolo en el MathField activo
   */
  private insertSymbolIntoMathField(item: ScienceSymbol): void {
    if (this.options.mathField) {
      const mf = this.options.mathField;
      try {
        // En MathLive, executeCommand con ['insert', latex] inserta en la posición del cursor
        if (typeof mf.insert === 'function') {
          mf.insert(item.latex, { focus: true, selectionMode: 'placeholder' });
        } else if (typeof mf.executeCommand === 'function') {
          mf.executeCommand(['insert', item.latex]);
          mf.focus();
        }
      } catch (err) {
        console.warn('[UniversalSymbolSelectorDrawer] Error inserting into mathfield:', err);
      }
    }

    // Callback de inserción
    this.options.onInsert?.(item.latex, item);
  }

  /**
   * Cierra el drawer
   */
  public close(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.options.onClose?.();
  }
}

/**
 * Función global de conveniencia para abrir el Selector Científico Universal
 */
export function openUniversalSymbolSelector(
  options: UniversalSymbolSelectorDrawerOptions = {}
): UniversalSymbolSelectorDrawer {
  const drawer = new UniversalSymbolSelectorDrawer(options);
  drawer.open();
  return drawer;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
