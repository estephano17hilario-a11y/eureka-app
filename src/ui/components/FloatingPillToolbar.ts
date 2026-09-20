/**
 * FloatingPillToolbar.ts
 *
 * Barra Contextual Flotante de Alta Gama con morfología de cápsula redondeada (pill toolbar).
 * Provee posicionamiento dinámico sobre el nodo activo con inversión perimétrica (boundary flipping),
 * acciones indispensables (color, formato, inserción de hijo/hermano, borrado) y sistema
 * de propagación cromática determinista.
 */

export interface PillToolbarCallbacks {
  onAddChild?: (node: any) => void;
  onAddSibling?: (node: any) => void;
  onDeleteNode?: (node: any) => void;
  onColorChange?: (node: any, color: string) => void;
  onToggleFormat?: (node: any, format: 'bold' | 'italic') => void;
  onAddPhoto?: (node: any) => void;
}

export const MINDMEISTER_SPECTRAL_PALETTE = [
  '#0284c7', // Sky Blue
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#14b8a6'  // Teal
];

export class FloatingPillToolbar {
  private container: HTMLElement;
  private toolbarEl: HTMLElement;
  private palettePopoverEl: HTMLElement;
  private nodeAddSiblingBtn: HTMLButtonElement;
  private activeNode: any = null;
  private callbacks: PillToolbarCallbacks;

  private isPaletteOpen = false;
  private isVisible = false;

  private currentColor: string = MINDMEISTER_SPECTRAL_PALETTE[0];
  private isBold = false;
  private isItalic = false;

  constructor(container: HTMLElement, callbacks: PillToolbarCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.toolbarEl = document.createElement('div');
    this.toolbarEl.className = 'mm-floating-pill-toolbar';
    this.toolbarEl.setAttribute('role', 'toolbar');
    this.toolbarEl.setAttribute('aria-label', 'Herramientas de nodo');

    this.palettePopoverEl = document.createElement('div');
    this.palettePopoverEl.className = 'mm-color-palette-popover';

    // Botón flotante '+' debajo del recuadro seleccionado para añadir hermano
    this.nodeAddSiblingBtn = document.createElement('button');
    this.nodeAddSiblingBtn.className = 'mm-node-add-sibling-btn';
    this.nodeAddSiblingBtn.type = 'button';
    this.nodeAddSiblingBtn.title = 'Añadir concepto hermano (+)';
    this.nodeAddSiblingBtn.innerHTML = `
      <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    `;
    this.nodeAddSiblingBtn.onclick = (e) => {
      e.stopPropagation();
      if (this.activeNode && this.callbacks.onAddSibling) {
        this.callbacks.onAddSibling(this.activeNode);
      }
    };

    this.buildToolbarContent();
    this.buildPaletteContent();

    this.toolbarEl.appendChild(this.palettePopoverEl);
    this.container.appendChild(this.toolbarEl);
    this.container.appendChild(this.nodeAddSiblingBtn);
  }

  /**
   * Construye los botones de acción e iconos SVG de la píldora flotante.
   */
  private buildToolbarContent(): void {
    this.toolbarEl.innerHTML = '';

    // 1. Botón de Paleta Cromática Heredable
    const colorBtn = document.createElement('button');
    colorBtn.className = 'mm-pill-btn mm-pill-btn-color';
    colorBtn.title = 'Color de rama heredable';
    colorBtn.innerHTML = `
      <span class="mm-color-indicator" style="background-color: ${this.currentColor};"></span>
    `;
    colorBtn.onclick = (e) => {
      e.stopPropagation();
      this.togglePalette();
    };
    this.toolbarEl.appendChild(colorBtn);

    // Divisor
    this.addDivider();

    // 2. Botón Negrita (Bold)
    const boldBtn = document.createElement('button');
    boldBtn.className = 'mm-pill-btn mm-pill-btn-bold';
    boldBtn.title = 'Negrita';
    boldBtn.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
    `;
    boldBtn.onclick = (e) => {
      e.stopPropagation();
      this.isBold = !this.isBold;
      boldBtn.classList.toggle('is-active', this.isBold);
      if (this.activeNode && this.callbacks.onToggleFormat) {
        this.callbacks.onToggleFormat(this.activeNode, 'bold');
      }
    };
    this.toolbarEl.appendChild(boldBtn);

    // 3. Botón Cursiva (Italic)
    const italicBtn = document.createElement('button');
    italicBtn.className = 'mm-pill-btn mm-pill-btn-italic';
    italicBtn.title = 'Cursiva';
    italicBtn.innerHTML = `
      <svg viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
    `;
    italicBtn.onclick = (e) => {
      e.stopPropagation();
      this.isItalic = !this.isItalic;
      italicBtn.classList.toggle('is-active', this.isItalic);
      if (this.activeNode && this.callbacks.onToggleFormat) {
        this.callbacks.onToggleFormat(this.activeNode, 'italic');
      }
    };
    this.toolbarEl.appendChild(italicBtn);

    // Divisor
    this.addDivider();

    // 4. Botón Añadir Hijo (Tab)
    const addChildBtn = document.createElement('button');
    addChildBtn.className = 'mm-pill-btn mm-pill-btn-add-child';
    addChildBtn.title = 'Insertar subrama (Tab)';
    addChildBtn.innerHTML = `
      <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      <span style="font-size: 11px; margin-left: 3px; font-weight: 600;">Hijo</span>
    `;
    addChildBtn.onclick = (e) => {
      e.stopPropagation();
      if (this.activeNode && this.callbacks.onAddChild) {
        this.callbacks.onAddChild(this.activeNode);
      }
    };
    this.toolbarEl.appendChild(addChildBtn);

    // 5. Botón Añadir Hermano (Enter)
    const addSiblingBtn = document.createElement('button');
    addSiblingBtn.className = 'mm-pill-btn mm-pill-btn-add-sibling';
    addSiblingBtn.title = 'Insertar nodo hermano (Enter)';
    addSiblingBtn.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
      <span style="font-size: 11px; margin-left: 3px; font-weight: 600;">Hermano</span>
    `;
    addSiblingBtn.onclick = (e) => {
      e.stopPropagation();
      if (this.activeNode && this.callbacks.onAddSibling) {
        this.callbacks.onAddSibling(this.activeNode);
      }
    };
    this.toolbarEl.appendChild(addSiblingBtn);

    // 6. Botón Foto
    const photoBtn = document.createElement('button');
    photoBtn.className = 'mm-pill-btn mm-pill-btn-photo';
    photoBtn.title = 'Adjuntar foto al recuadro';
    photoBtn.innerHTML = `
      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
      <span style="font-size: 11px; margin-left: 3px; font-weight: 600;">Foto</span>
    `;
    photoBtn.onclick = (e) => {
      e.stopPropagation();
      if (this.activeNode && this.callbacks.onAddPhoto) {
        this.callbacks.onAddPhoto(this.activeNode);
      }
    };
    this.toolbarEl.appendChild(photoBtn);

    // Divisor
    this.addDivider();

    // 7. Botón Eliminar Nodo (Del / Supr)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'mm-pill-btn mm-pill-btn-delete';
    deleteBtn.title = 'Eliminar nodo seleccionado';
    deleteBtn.style.color = '#fb7185';
    deleteBtn.innerHTML = `
      <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
    `;
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      if (this.activeNode && this.callbacks.onDeleteNode) {
        this.callbacks.onDeleteNode(this.activeNode);
      }
    };
    this.toolbarEl.appendChild(deleteBtn);
  }

  /**
   * Construye los elementos de la paleta de colores.
   */
  private buildPaletteContent(): void {
    this.palettePopoverEl.innerHTML = '';
    MINDMEISTER_SPECTRAL_PALETTE.forEach((color) => {
      const swatch = document.createElement('div');
      swatch.className = 'mm-color-swatch';
      swatch.style.backgroundColor = color;
      if (color === this.currentColor) {
        swatch.classList.add('is-selected');
      }

      swatch.onclick = (e) => {
        e.stopPropagation();
        this.selectColor(color);
      };

      this.palettePopoverEl.appendChild(swatch);
    });
  }

  private addDivider(): void {
    const divider = document.createElement('div');
    divider.className = 'mm-pill-divider';
    this.toolbarEl.appendChild(divider);
  }

  private togglePalette(): void {
    this.isPaletteOpen = !this.isPaletteOpen;
    this.palettePopoverEl.classList.toggle('is-open', this.isPaletteOpen);
  }

  private closePalette(): void {
    this.isPaletteOpen = false;
    this.palettePopoverEl.classList.remove('is-open');
  }

  /**
   * Aplica un color seleccionado y propaga de forma determinista la herencia cromática.
   */
  public selectColor(color: string): void {
    this.currentColor = color;
    const indicator = this.toolbarEl.querySelector('.mm-color-indicator') as HTMLElement;
    if (indicator) {
      indicator.style.backgroundColor = color;
    }

    const swatches = this.palettePopoverEl.querySelectorAll('.mm-color-swatch');
    swatches.forEach((s) => {
      const el = s as HTMLElement;
      el.classList.toggle('is-selected', el.style.backgroundColor === color);
    });

    this.closePalette();

    if (this.activeNode && this.callbacks.onColorChange) {
      this.callbacks.onColorChange(this.activeNode, color);
    }
  }

  /**
   * Algoritmo de Posicionamiento Dinámico con Inversión Perimétrica (Boundary Flipping).
   * Si la coordenada superior del nodo seleccionado se encuentra a una distancia menor
   * que la altura combinada de la barra más el margen, se proyecta bajo el nodo.
   */
  public updatePosition(nodeRect: DOMRect | { left: number; top: number; width: number; height: number }): void {
    if (!this.isVisible) return;

    const containerRect = this.container.getBoundingClientRect();
    const toolbarW = this.toolbarEl.offsetWidth || 340;
    const toolbarH = this.toolbarEl.offsetHeight || 48;
    const margin = 12;

    // Posición del nodo relativa al contenedor
    const nodeRelativeTop = nodeRect.top - containerRect.top;
    const nodeRelativeLeft = nodeRect.left - containerRect.left;
    const nodeCenterX = nodeRelativeLeft + nodeRect.width / 2;

    // Centrado horizontal con acotamiento dentro de los límites del contenedor
    let targetX = nodeCenterX - toolbarW / 2;
    const minX = margin;
    const maxX = containerRect.width - toolbarW - margin;
    targetX = Math.max(minX, Math.min(targetX, maxX));

    // Boundary Flipping vertical:
    // Si no cabe arriba (nodeRelativeTop < toolbarH + margin + 10), invertir hacia abajo
    let targetY: number;
    if (nodeRelativeTop < toolbarH + margin + 20) {
      // Proyectar bajo el nodo
      targetY = nodeRelativeTop + nodeRect.height + margin;
      // Posicionar el popover de color hacia abajo también si está invertido
      this.palettePopoverEl.style.bottom = 'auto';
      this.palettePopoverEl.style.top = 'calc(100% + 8px)';
    } else {
      // Proyectar sobre el nodo
      targetY = nodeRelativeTop - toolbarH - margin;
      this.palettePopoverEl.style.bottom = 'calc(100% + 8px)';
      this.palettePopoverEl.style.top = 'auto';
    }

    this.toolbarEl.style.left = `${Math.round(targetX)}px`;
    this.toolbarEl.style.top = `${Math.round(targetY)}px`;

    // Posicionar botón '+' exactamente debajo del recuadro seleccionado
    const btnW = 30;
    const btnX = nodeCenterX - btnW / 2;
    const btnY = nodeRelativeTop + nodeRect.height + 10;
    this.nodeAddSiblingBtn.style.left = `${Math.round(btnX)}px`;
    this.nodeAddSiblingBtn.style.top = `${Math.round(btnY)}px`;
  }

  /**
   * Muestra la barra flotante vinculada al nodo activo.
   */
  public show(node: any, nodeRect?: DOMRect | { left: number; top: number; width: number; height: number }): void {
    this.activeNode = node;
    this.isVisible = true;

    // Detectar color actual del nodo o heredado
    const nodeColor = this.resolveNodeColor(node);
    if (nodeColor) {
      this.currentColor = nodeColor;
      const indicator = this.toolbarEl.querySelector('.mm-color-indicator') as HTMLElement;
      if (indicator) indicator.style.backgroundColor = nodeColor;
    }

    // Actualizar estados de negrita y cursiva
    const fontWeight = typeof node?.getStyle === 'function' ? node.getStyle('fontWeight', false) : 'normal';
    const fontStyle = typeof node?.getStyle === 'function' ? node.getStyle('fontStyle', false) : 'normal';
    this.isBold = fontWeight === 'bold' || fontWeight >= 600;
    this.isItalic = fontStyle === 'italic';

    const boldBtn = this.toolbarEl.querySelector('.mm-pill-btn-bold');
    if (boldBtn) boldBtn.classList.toggle('is-active', this.isBold);

    const italicBtn = this.toolbarEl.querySelector('.mm-pill-btn-italic');
    if (italicBtn) italicBtn.classList.toggle('is-active', this.isItalic);

    // Ajustar visibilidad del botón de hermano para el nodo raíz
    const siblingBtn = this.toolbarEl.querySelector('.mm-pill-btn-add-sibling') as HTMLElement;
    if (siblingBtn) {
      siblingBtn.style.display = node?.isRoot ? 'none' : 'inline-flex';
    }

    // Mostrar el botón '+' flotante inferior
    this.nodeAddSiblingBtn.style.display = node?.isRoot ? 'none' : 'flex';
    this.nodeAddSiblingBtn.classList.add('is-visible');

    if (nodeRect) {
      this.updatePosition(nodeRect);
    }

    this.toolbarEl.classList.add('is-visible');
  }

  /**
   * Oculta la barra de herramientas flotante.
   */
  public hide(): void {
    this.isVisible = false;
    this.activeNode = null;
    this.closePalette();
    this.toolbarEl.classList.remove('is-visible');
    this.nodeAddSiblingBtn.classList.remove('is-visible');
  }

  /**
   * Determina el color cromático de un nodo respetando el árbol de herencia.
   */
  private resolveNodeColor(node: any): string {
    if (!node) return MINDMEISTER_SPECTRAL_PALETTE[0];
    if (node.isRoot) return '#94a3b8'; // Raíz neutral

    // Si tiene color explícito
    const customColor = typeof node.getData === 'function' ? node.getData('lineColor') || node.getData('branchColor') : null;
    if (customColor) return customColor;

    // Si es nivel 1, asignar un color basado en su índice entre hermanos
    if (node.layerIndex === 1 || node.parent?.isRoot) {
      const siblings = node.parent?.children || [];
      const index = Math.max(0, siblings.indexOf(node));
      return MINDMEISTER_SPECTRAL_PALETTE[index % MINDMEISTER_SPECTRAL_PALETTE.length];
    }

    // Si es nivel 2+, hereda el color del ancestro de nivel 1
    let ancestor = node.parent;
    while (ancestor && !ancestor.isRoot && ancestor.parent && !ancestor.parent.isRoot) {
      ancestor = ancestor.parent;
    }

    if (ancestor) {
      const ancestorColor = typeof ancestor.getData === 'function' ? ancestor.getData('lineColor') || ancestor.getData('branchColor') : null;
      if (ancestorColor) return ancestorColor;

      const siblings = ancestor.parent?.children || [];
      const index = Math.max(0, siblings.indexOf(ancestor));
      return MINDMEISTER_SPECTRAL_PALETTE[index % MINDMEISTER_SPECTRAL_PALETTE.length];
    }

    return MINDMEISTER_SPECTRAL_PALETTE[0];
  }

  /**
   * Limpia y destruye el componente.
   */
  public destroy(): void {
    this.hide();
    if (this.toolbarEl && this.toolbarEl.parentNode) {
      this.toolbarEl.parentNode.removeChild(this.toolbarEl);
    }
    if (this.nodeAddSiblingBtn && this.nodeAddSiblingBtn.parentNode) {
      this.nodeAddSiblingBtn.parentNode.removeChild(this.nodeAddSiblingBtn);
    }
  }
}
