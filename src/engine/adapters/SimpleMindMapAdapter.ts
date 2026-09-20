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

      const { left, top, width, height, expandBtnSize = 0, isRoot, layerIndex } = node;
      const isRootNode = Boolean(isRoot || layerIndex === 0);

      node.children.forEach((child: any, index: number) => {
        const lineElement = lines[index];
        if (!lineElement) return;

        // Determinar orientación espacial (izquierda vs derecha)
        const isLeft = child.dir === 'left' || (child.left + child.width / 2 < left + width / 2);

        // Puerto de salida en el nodo origen (P0)
        let x0: number;
        if (isRootNode) {
          x0 = isLeft ? left : left + width;
        } else {
          x0 = isLeft ? left - expandBtnSize : left + width + expandBtnSize;
        }
        let y0 = top + height / 2;

        // Puerto de llegada en el nodo destino (P3)
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
          // NIVEL 2+: Curva Bézier Adaptativa C^1 con Subrayado Elástico y bifurcación troncal
          const hasMultipleSiblings = node.children.length > 1;
          pathStr = AdaptiveSplineEngine.generateElasticUnderlinePath(
            p0,
            p3,
            child.width || 80,
            isLeft,
            {
              trunkOffset: 16,
              tension: 0.55,
              useTrunkOffset: hasMultipleSiblings
            }
          );

          // Trazo continuo elástico
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
    if (!node) return MINDMEISTER_SPECTRAL_PALETTE[0];
    if (node.isRoot) return '#94a3b8'; // Raíz neutral

    // Si tiene color personalizado explícito en sus datos
    const customColor = typeof node.getData === 'function' ? (node.getData('branchColor') || node.getData('lineColor')) : null;
    if (customColor) return customColor;

    // Si es nodo hijo de primer nivel
    if (node.layerIndex === 1 || node.parent?.isRoot) {
      const siblings = node.parent?.children || [];
      const idx = siblings.length > 0 ? siblings.indexOf(node) : siblingIndex;
      const safeIndex = idx >= 0 ? idx : siblingIndex;
      return MINDMEISTER_SPECTRAL_PALETTE[safeIndex % MINDMEISTER_SPECTRAL_PALETTE.length];
    }

    // Si es nivel 2+, rastrear hasta el ancestro de nivel 1
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

    return MINDMEISTER_SPECTRAL_PALETTE[0];
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
      }
    });
  }

  /**
   * Aplica un color al nodo y lo propaga recursivamente a todas sus sub-ramas descendientes.
   */
  public applyColorToSubtree(node: any, color: string): void {
    if (!node) return;

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
