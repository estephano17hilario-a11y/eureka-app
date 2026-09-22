/**
 * SimpleMindMapAdapter.ts
 *
 * Adaptador Arquitectónico que sobrecarga e integra el Motor Geométrico de Splines Adaptativas,
 * el Pipeline Cinemático Multitáctil a 60 FPS, el QuadTree Espacial para Frustum Culling
 * y la Barra Contextual Flotante de Alta Gama con el núcleo de SimpleMindMap.
 */

import { AdaptiveSplineEngine, Point2D } from '../geometry/AdaptiveSplineEngine';
import { TouchGestureEngine, GestureTransformState } from '../gestures/TouchGestureEngine';
import { SpatialQuadTree } from '../spatial/SpatialQuadTree';
import { FloatingPillToolbar, MINDMEISTER_SPECTRAL_PALETTE } from '../../ui/components/FloatingPillToolbar';

export interface MindMapAdapterConfig {
  container: HTMLElement;
  enableRibbons?: boolean;
  enableCulling?: boolean;
  enableTouchEngine?: boolean;
  enablePillToolbar?: boolean;
}

export class SimpleMindMapAdapter {
  private mindMap: any;
  private container: HTMLElement;
  private config: Required<MindMapAdapterConfig>;

  // Submódulos del Paradigma MindMeister
  private touchEngine: TouchGestureEngine | null = null;
  private quadTree: SpatialQuadTree | null = null;
  private pillToolbar: FloatingPillToolbar | null = null;

  // Estado
  private activeNode: any = null;
  public isDestroyed = false;

  constructor(mindMapInstance: any, config: MindMapAdapterConfig) {
    this.mindMap = mindMapInstance;
    this.container = config.container;
    this.config = {
      container: config.container,
      enableRibbons: config.enableRibbons ?? true,
      enableCulling: config.enableCulling ?? true,
      enableTouchEngine: config.enableTouchEngine ?? true,
      enablePillToolbar: config.enablePillToolbar ?? true
    };

    this.init();
  }

  /**
   * Inicializa la sobrecarga de layouts, eventos táctiles y barra contextual.
   */
  private init(): void {
    // 1. Aplicar clase visual y estilos al contenedor
    this.container.classList.add('mindmeister-canvas-viewport');

    // 2. Sobrecargar el algoritmo de trazado de conectores de SimpleMindMap
    this.patchLayoutRenderLine();

    // 3. Inicializar e integrar el QuadTree espacial para Frustum Culling
    if (this.config.enableCulling) {
      this.initQuadTree();
    }

    // 4. Inicializar el motor cinemático multitáctil para Capacitor WebView
    if (this.config.enableTouchEngine) {
      this.initTouchEngine();
    }

    // 5. Inicializar la Barra Contextual Flotante (Floating Pill Toolbar)
    if (this.config.enablePillToolbar) {
      this.initFloatingPillToolbar();
    }

    // 6. Enlazar eventos de ciclo de vida del mapa
    this.bindMindMapEvents();
  }

  /**
   * Sobrecarga el método `renderLine` de los layouts de SimpleMindMap (MindMap, LogicalStructure, etc.)
   * para sustituir curvas estáticas por Curvas Bézier C1 Adaptativas y Cintas Cónicas (Ribbons).
   */
  private patchLayoutRenderLine(): void {
    const layout = this.mindMap.renderer?.layout;
    if (!layout) return;

    const self = this;
    const originalRenderLine = layout.renderLine ? layout.renderLine.bind(layout) : null;

    layout.renderLine = function (node: any, lines: any[], style: any, lineStyle: any) {
      if (!node.children || node.children.length === 0) {
        return originalRenderLine ? originalRenderLine(node, lines, style, lineStyle) : [];
      }

      const { left, top, width, height, isRoot, layerIndex } = node;
      const isRootNode = Boolean(isRoot || layerIndex === 0);

      node.children.forEach((child: any, index: number) => {
        const lineElement = lines[index];
        if (!lineElement) return;

        // Determinar orientación espacial (izquierda vs derecha)
        const isLeft = child.dir === 'left' || (child.left + child.width / 2 < left + width / 2);

        // Puerto de salida en el nodo origen (P0) exacto en el borde del recuadro
        const x0 = isLeft ? left : left + width;
        let y0 = top + height / 2;

        // Puerto de llegada en el nodo destino (P3) exacto en el borde del hijo
        const x3 = isLeft ? child.left + child.width : child.left;
        let y3 = child.top + child.height / 2;

        // Ajuste cuando el nodo usa estilo de línea base (underline)
        const nodeUseLineStyle = Boolean(self.mindMap.themeConfig?.nodeUseLineStyle);
        if (nodeUseLineStyle) {
          if (!isRootNode) y0 += height / 4;
          y3 += child.height / 2;
        }

        const p0: Point2D = { x: x0, y: y0 };
        const p3: Point2D = { x: x3, y: y3 };

        // Obtener color cromático heredado determinista
        const branchColor = self.resolveNodeColor(child, index);

        let pathStr = '';

        if (isRootNode && self.config.enableRibbons) {
          // NIVEL 1: Organic Tapering Ribbon (Cinta Cónica de Sección Variable)
          pathStr = AdaptiveSplineEngine.generateOrganicRibbonPath(p0, p3, {
            wRoot: 9.0,
            wChild: 2.8,
            alpha: 1.25,
            tension: 0.55,
            samples: 32
          });

          // Relleno sólido cerrado sin borde
          lineElement.plot(pathStr);
          lineElement.attr({
            fill: branchColor,
            stroke: 'none',
            'fill-opacity': 0.88,
            class: 'mm-ribbon-path'
          });
        } else {
          // NIVEL 2+: Curva Bézier Adaptativa C^1 Limpia hacia el puerto del hijo sin óvalos ni descuadres
          pathStr = AdaptiveSplineEngine.generateChildConnectorPath(
            p0,
            p3,
            isLeft,
            {
              trunkOffset: 0,
              tension: 0.55,
              useTrunkOffset: false,
              includeOvalMarker: false
            }
          );

          // Trazo continuo sin óvalos
          lineElement.plot(pathStr);
          lineElement.attr({
            fill: 'none',
            stroke: branchColor,
            'stroke-width': 2.2,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            class: 'mm-spline-path'
          });
        }
      });
    };
  }

  /**
   * Resuelve el color cromático de un nodo aplicando la regla estricta de herencia:
   * Raíz neutral -> Nivel 1 asigna color espectral -> Niveles 2+ heredan del ancestro de Nivel 1.
   */
  public resolveNodeColor(node: any, siblingIndex = 0): string {
    if (!node) return this.mindMap.themeConfig?.lineColor || MINDMEISTER_SPECTRAL_PALETTE[0];
    if (node.isRoot) return this.mindMap.themeConfig?.lineColor || '#94a3b8';

    // 1. Si el propio nodo tiene branchColor, lineColor o borderColor definido
    const customColor = typeof node.getData === 'function' 
      ? (node.getData('branchColor') || node.getData('lineColor') || node.getData('borderColor')) 
      : null;
    if (customColor && customColor !== 'transparent') return customColor;

    // 2. Rastrear hacia arriba en la jerarquía: si cualquier ancestro tiene un color personalizado, heredarlo
    let current = node.parent;
    while (current && !current.isRoot) {
      const parentColor = typeof current.getData === 'function' 
        ? (current.getData('branchColor') || current.getData('lineColor') || current.getData('borderColor')) 
        : null;
      if (parentColor && parentColor !== 'transparent') {
        return parentColor;
      }
      current = current.parent;
    }

    // 3. Si el mapa tiene un lineColor general configurado por el usuario
    if (this.mindMap.themeConfig?.lineColor && this.mindMap.themeConfig.lineColor !== 'transparent') {
      return this.mindMap.themeConfig.lineColor;
    }

    // 4. Si es nodo hijo de primer nivel
    if (node.layerIndex === 1 || node.parent?.isRoot) {
      const siblings = node.parent?.children || [];
      const idx = siblings.length > 0 ? siblings.indexOf(node) : siblingIndex;
      const safeIndex = idx >= 0 ? idx : siblingIndex;
      return MINDMEISTER_SPECTRAL_PALETTE[safeIndex % MINDMEISTER_SPECTRAL_PALETTE.length];
    }

    // 5. Ancestros de nivel 1
    let ancestor = node.parent;
    while (ancestor && !ancestor.isRoot && ancestor.parent && !ancestor.parent.isRoot) {
      ancestor = ancestor.parent;
    }

    if (ancestor) {
      const ancestorCustom = typeof ancestor.getData === 'function' ? (ancestor.getData('branchColor') || ancestor.getData('lineColor')) : null;
      if (ancestorCustom) return ancestorCustom;

      const siblings = ancestor.parent?.children || [];
      const idx = Math.max(0, siblings.indexOf(ancestor));
      return MINDMEISTER_SPECTRAL_PALETTE[idx % MINDMEISTER_SPECTRAL_PALETTE.length];
    }

    return this.mindMap.themeConfig?.lineColor || MINDMEISTER_SPECTRAL_PALETTE[0];
  }

  /**
   * Inicializa el QuadTree espacial y enlaza la reconstrucción tras cada renderizado del árbol.
   */
  private initQuadTree(): void {
    const worldBounds = {
      minX: -50000,
      minY: -50000,
      maxX: 50000,
      maxY: 50000
    };
    this.quadTree = new SpatialQuadTree(worldBounds, 12, 7);
  }

  /**
   * Reconstruye los índices espaciales de todos los nodos y curvas visibles.
   */
  public rebuildSpatialIndex(): void {
    if (!this.quadTree || !this.mindMap.renderer?.root) return;

    this.quadTree.clear();
    const rootNode = this.mindMap.renderer.root;

    const traverse = (node: any) => {
      if (!node) return;

      // Indexar el nodo
      const nodeAABB = {
        minX: node.left,
        minY: node.top,
        maxX: node.left + (node.width || 0),
        maxY: node.top + (node.height || 0)
      };

      this.quadTree?.insert({
        id: `node-${node.uid}`,
        aabb: nodeAABB,
        data: { type: 'node', instance: node }
      });

      // Recorrer hijos
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => traverse(child));
      }
    };

    traverse(rootNode);
    this.applyFrustumCulling();
  }

  /**
   * Aplica Frustum Culling descartando visualmente nodos fuera de la ventana visible más margen.
   */
  public applyFrustumCulling(): void {
    if (!this.quadTree || !this.config.enableCulling) return;

    const view = this.mindMap.view;
    if (!view) return;

    const w = this.container.clientWidth || 1920;
    const h = this.container.clientHeight || 1080;

    const visibleWorldBounds = SpatialQuadTree.computeVisibleWorldBounds(
      view.x,
      view.y,
      view.scale,
      w,
      h,
      180 // Margen de guarda conservador
    );

    const visibleItems = this.quadTree.query(visibleWorldBounds);
    const visibleUids = new Set<string>();
    visibleItems.forEach((item) => {
      if (item.data.type === 'node') {
        visibleUids.add(item.data.instance.uid);
      }
    });

    // Si el mapa tiene más de 60 nodos, activar optimización de visibilidad
    const totalNodes = this.quadTree.size();
    if (totalNodes > 60) {
      const rootNode = this.mindMap.renderer?.root;
      const setVisibility = (node: any) => {
        if (!node) return;
        const isVisible = visibleUids.has(node.uid) || node.isRoot;
        if (node.group && node.group.node) {
          node.group.node.style.display = isVisible ? '' : 'none';
        }
        if (node.children && node.children.length > 0) {
          node.children.forEach((c: any) => setVisibility(c));
        }
      };
      setVisibility(rootNode);
    }
  }

  /**
   * Inicializa el motor de gestos multitáctiles desacoplado.
   */
  private initTouchEngine(): void {
    // Desactivar el plugin de touch por defecto si existía para evitar colisiones
    if (this.mindMap.touchEvent && typeof this.mindMap.touchEvent.unBindEvent === 'function') {
      try {
        this.mindMap.touchEvent.unBindEvent();
      } catch {
        // Ignorar si ya estaba desvinculado
      }
    }

    const view = this.mindMap.view;
    const initialX = view ? view.x : 0;
    const initialY = view ? view.y : 0;
    const initialScale = view ? view.scale : 1;

    this.touchEngine = new TouchGestureEngine(this.container, {
      minScale: 0.15,
      maxScale: 3.5,
      friction: 0.93,
      velocityThreshold: 0.08,
      onTransform: (state: GestureTransformState) => {
        if (this.mindMap.view) {
          this.mindMap.view.scale = state.scale;
          this.mindMap.view.x = state.x;
          this.mindMap.view.y = state.y;
          this.mindMap.view.transform();

          // Sincronizar posición de la barra flotante si hay nodo activo
          if (this.activeNode && this.pillToolbar) {
            this.updatePillPosition();
          }

          // Aplicar culling espacial en movimiento
          this.applyFrustumCulling();
        }
      },
      onGestureStart: () => {
        // Cerrar temporalmente popovers al mover el lienzo
        if (this.pillToolbar) {
          // Mantener visible pero quieto
        }
      }
    });

    this.touchEngine.setTransform(initialX, initialY, initialScale);
  }

  /**
   * Inicializa la Barra Contextual Flotante (Floating Pill Toolbar).
   */
  private initFloatingPillToolbar(): void {
    this.pillToolbar = new FloatingPillToolbar(this.container, {
      onAddChild: () => {
        if (this.mindMap && typeof this.mindMap.execCommand === 'function') {
          this.mindMap.execCommand('INSERT_CHILD_NODE');
        }
      },
      onAddSibling: () => {
        if (this.mindMap && typeof this.mindMap.execCommand === 'function') {
          this.mindMap.execCommand('INSERT_NODE');
        }
      },
      onDeleteNode: () => {
        if (this.mindMap && typeof this.mindMap.execCommand === 'function') {
          this.mindMap.execCommand('REMOVE_NODE');
        }
      },
      onColorChange: (node: any, color: string) => {
        this.applyColorToSubtree(node, color);
      },
      onToggleFormat: (node: any, format: 'bold' | 'italic') => {
        this.toggleNodeFormat(node, format);
      },
      onAddPhoto: (node: any) => {
        this.promptAddPhoto(node);
      }
    });
  }

  /**
   * Conmuta el modo de fondo del lienzo (Dark vs Light) garantizando coherencia visual completa.
   */
  public setCanvasBgMode(mode: 'dark' | 'light'): void {
    if (mode === 'light') {
      this.container.classList.add('theme-light');
      this.container.classList.remove('theme-dark');
      if (this.mindMap && typeof this.mindMap.setThemeConfig === 'function') {
        this.mindMap.setThemeConfig({
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
      }
    } else {
      this.container.classList.remove('theme-light');
      this.container.classList.add('theme-dark');
      if (this.mindMap && typeof this.mindMap.setThemeConfig === 'function') {
        this.mindMap.setThemeConfig({
          backgroundColor: '#07080d',
          lineColor: '#38bdf8'
        });
      }
    }

    try {
      localStorage.setItem('eureka_mindmap_canvas_bg_mode', mode);
    } catch {}

    if (this.mindMap && typeof this.mindMap.render === 'function') {
      this.mindMap.render();
    }
  }

  /**
   * Abre un selector elegante para adjuntar o remover foto en el recuadro seleccionado.
   */
  public promptAddPhoto(node: any): void {
    if (!node) return;

    const existingImg = typeof node.getData === 'function' ? node.getData('image') : node.nodeData?.data?.image;

    const modal = document.createElement('div');
    modal.className = 'apple-modal-overlay';
    modal.style.zIndex = '10005';
    modal.innerHTML = `
      <div class="apple-modal-content apple-glass-panel" style="max-width:440px; width:92%; padding:22px; border-radius:22px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.3rem;">📷</span>
            <h3 style="font-size:1.1rem; font-weight:700; color:#fff; margin:0;">Foto del Recuadro</h3>
          </div>
          <button id="btn-close-photo-modal" style="background:none; border:none; color:var(--f-text-secondary, #94a3b8); font-size:1.2rem; cursor:pointer;">✕</button>
        </div>

        ${existingImg ? `
          <div style="display:flex; flex-direction:column; align-items:center; gap:8px; margin-bottom:16px;">
            <img src="${existingImg}" style="max-height:140px; max-width:100%; border-radius:12px; object-fit:cover; border:1px solid rgba(255,255,255,0.15);" />
            <button id="btn-remove-node-photo" type="button" style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:#ef4444; border-radius:999px; padding:5px 14px; font-size:0.8rem; cursor:pointer;">
              🗑️ Quitar Foto Actual
            </button>
          </div>
        ` : ''}

        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="display:block; font-size:0.8rem; color:var(--f-text-secondary, #94a3b8); margin-bottom:6px; font-weight:600;">
              Subir desde este dispositivo:
            </label>
            <input type="file" id="input-node-photo-file" accept="image/*" style="width:100%; font-size:0.82rem; color:#fff;" />
          </div>

          <div style="display:flex; align-items:center; gap:8px; color:rgba(255,255,255,0.3); font-size:0.75rem;">
            <div style="flex:1; height:1px; background:rgba(255,255,255,0.1);"></div>
            O
            <div style="flex:1; height:1px; background:rgba(255,255,255,0.1);"></div>
          </div>

          <div>
            <label style="display:block; font-size:0.8rem; color:var(--f-text-secondary, #94a3b8); margin-bottom:6px; font-weight:600;">
              Pegar URL de la imagen:
            </label>
            <input type="url" id="input-node-photo-url" placeholder="https://ejemplo.com/foto.jpg" style="width:100%; box-sizing:border-box; background:#141724; border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:8px 12px; color:#fff; font-size:0.85rem; outline:none;" />
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:18px;">
          <button id="btn-cancel-photo-modal" class="figma-btn-white-pill" style="background:rgba(255,255,255,0.06); font-size:0.82rem;">Cancelar</button>
          <button id="btn-save-node-photo" class="figma-btn-study-large" style="width:auto; padding:8px 20px; font-size:0.85rem;">Guardar Foto</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#btn-close-photo-modal')?.addEventListener('click', close);
    modal.querySelector('#btn-cancel-photo-modal')?.addEventListener('click', close);

    // Quitar foto
    modal.querySelector('#btn-remove-node-photo')?.addEventListener('click', () => {
      if (typeof node.setData === 'function') {
        node.setData({ image: '', imageSize: null });
      }
      if (this.mindMap && typeof this.mindMap.render === 'function') {
        this.mindMap.render();
      }
      close();
    });

    // Guardar foto calculando proporciones completas exactas (Zero Cropping)
    modal.querySelector('#btn-save-node-photo')?.addEventListener('click', () => {
      const fileInput = modal.querySelector('#input-node-photo-file') as HTMLInputElement | null;
      const urlInput = modal.querySelector('#input-node-photo-url') as HTMLInputElement | null;

      const setProportionalImage = (src: string) => {
        const img = new Image();
        img.onload = () => {
          const maxW = 240;
          const maxH = 190;
          const nw = img.naturalWidth || 180;
          const nh = img.naturalHeight || 120;
          const scale = Math.min(maxW / nw, maxH / nh, 1);
          const computedW = Math.max(50, Math.round(nw * scale));
          const computedH = Math.max(40, Math.round(nh * scale));

          if (typeof node.setData === 'function') {
            node.setData({ image: src, imageSize: { width: computedW, height: computedH, custom: true } });
          }
          if (this.mindMap && typeof this.mindMap.render === 'function') {
            this.mindMap.render();
          }
          close();
        };
        img.onerror = () => {
          if (typeof node.setData === 'function') {
            node.setData({ image: src, imageSize: { width: 180, height: 120, custom: true } });
          }
          if (this.mindMap && typeof this.mindMap.render === 'function') {
            this.mindMap.render();
          }
          close();
        };
        img.src = src;
      };

      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          if (dataUrl) setProportionalImage(dataUrl);
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else if (urlInput && urlInput.value.trim()) {
        setProportionalImage(urlInput.value.trim());
      } else {
        close();
      }
    });
  }

  /**
   * Aplica un color al nodo y lo propaga recursivamente a todas sus sub-ramas descendientes.
   */
  public applyColorToSubtree(node: any, color: string): void {
    if (!node) return;

    if (color === 'transparent') {
      const applyTransparent = (target: any) => {
        if (typeof target.setStyle === 'function') {
          target.setStyle('fillColor', 'transparent');
          target.setStyle('borderColor', 'transparent');
          target.setStyle('borderWidth', 0);
        } else if (typeof target.setData === 'function') {
          target.setData({ fillColor: 'transparent', borderColor: 'transparent', borderWidth: 0 });
        }
        if (target.children && target.children.length > 0) {
          target.children.forEach((c: any) => applyTransparent(c));
        }
      };
      applyTransparent(node);
      if (this.mindMap && typeof this.mindMap.render === 'function') {
        this.mindMap.render();
      }
      return;
    }

    const propagate = (target: any) => {
      if (typeof target.setData === 'function') {
        target.setData({ branchColor: color, lineColor: color });
      } else if (target.nodeData && target.nodeData.data) {
        target.nodeData.data.branchColor = color;
        target.nodeData.data.lineColor = color;
      }

      if (target.children && target.children.length > 0) {
        target.children.forEach((c: any) => propagate(c));
      }
    };

    propagate(node);

    // Re-renderizar el mapa para proyectar el nuevo color en conectores y tipografías
    if (this.mindMap && typeof this.mindMap.render === 'function') {
      this.mindMap.render();
    }
  }

  /**
   * Alterna formatos tipográficos en el nodo.
   */
  private toggleNodeFormat(node: any, format: 'bold' | 'italic'): void {
    if (!node) return;

    if (format === 'bold') {
      const current = typeof node.getStyle === 'function' ? node.getStyle('fontWeight', false) : 'normal';
      const isBold = current === 'bold' || current >= 600;
      if (typeof node.setStyle === 'function') {
        node.setStyle('fontWeight', isBold ? 'normal' : 'bold');
      }
    } else {
      const current = typeof node.getStyle === 'function' ? node.getStyle('fontStyle', false) : 'normal';
      const isItalic = current === 'italic';
      if (typeof node.setStyle === 'function') {
        node.setStyle('fontStyle', isItalic ? 'normal' : 'italic');
      }
    }

    if (this.mindMap && typeof this.mindMap.render === 'function') {
      this.mindMap.render();
    }
  }

  /**
   * Enlaza eventos nativos del SimpleMindMap con nuestro pipeline.
   */
  private bindMindMapEvents(): void {
    // 1. Nodo activo
    this.mindMap.on('node_active', (node: any) => {
      this.activeNode = node;
      if (node && this.pillToolbar) {
        this.updatePillPosition();
      } else if (!node && this.pillToolbar) {
        this.pillToolbar.hide();
      }
    });

    // 2. Limpieza de nodo activo
    this.mindMap.on('clear_active_node', () => {
      this.activeNode = null;
      if (this.pillToolbar) {
        this.pillToolbar.hide();
      }
    });

    // 3. Fin de renderizado de la estructura
    this.mindMap.on('node_tree_render_end', () => {
      this.patchLayoutRenderLine();
      this.rebuildSpatialIndex();
      if (this.activeNode && this.pillToolbar) {
        this.updatePillPosition();
      }
    });

    // 3b. Cambio de estructura o layout
    this.mindMap.on('layout_change', () => {
      this.patchLayoutRenderLine();
    });

    // 4. Cambios en la vista (transformación, zoom, pan)
    this.mindMap.on('view_data_change', (data: any) => {
      if (data && data.state && this.touchEngine) {
        this.touchEngine.setTransform(data.state.x, data.state.y, data.state.scale);
      }
      if (this.activeNode && this.pillToolbar) {
        this.updatePillPosition();
      }
      this.applyFrustumCulling();
    });

    // 5. Redimensionamiento del contenedor
    this.mindMap.on('resize', () => {
      this.applyFrustumCulling();
    });
  }

  /**
   * Actualiza la posición de la barra flotante usando las coordenadas en pantalla del nodo activo.
   */
  private updatePillPosition(): void {
    if (!this.activeNode || !this.pillToolbar) return;

    let nodeRect: DOMRect | null = null;

    if (this.activeNode.group && this.activeNode.group.node) {
      nodeRect = this.activeNode.group.node.getBoundingClientRect();
    } else {
      // Fallback usando coordenadas lógicas proyectadas por view
      const view = this.mindMap.view;
      const s = view ? view.scale : 1;
      const vx = view ? view.x : 0;
      const vy = view ? view.y : 0;
      const cRect = this.container.getBoundingClientRect();

      const screenX = cRect.left + (this.activeNode.left * s + vx);
      const screenY = cRect.top + (this.activeNode.top * s + vy);
      const screenW = (this.activeNode.width || 100) * s;
      const screenH = (this.activeNode.height || 40) * s;

      nodeRect = new DOMRect(screenX, screenY, screenW, screenH);
    }

    if (nodeRect) {
      this.pillToolbar.show(this.activeNode, nodeRect);
    }
  }

  /**
   * Destruye el adaptador y limpia escuchadores y componentes secundarios.
   */
  public destroy(): void {
    this.isDestroyed = true;
    if (this.touchEngine) {
      this.touchEngine.destroy();
      this.touchEngine = null;
    }
    if (this.pillToolbar) {
      this.pillToolbar.destroy();
      this.pillToolbar = null;
    }
    if (this.quadTree) {
      this.quadTree.clear();
      this.quadTree = null;
    }
  }
}
