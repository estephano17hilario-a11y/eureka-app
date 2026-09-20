/**
 * SpatialQuadTree.ts
 *
 * Estructura de Datos de Partición Espacial Cuaternaria (QuadTree) para Frustum Culling.
 * Indexa las cajas envolventes (AABB) de nodos y conectores vectoriales del mapa mental,
 * permitiendo consultas de intersección con el viewport visible en tiempo O(log n).
 */

export interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface QuadTreeItem<T = any> {
  id: string;
  aabb: AABB;
  data: T;
}

export class SpatialQuadTree<T = any> {
  private bounds: AABB;
  private maxItems: number;
  private maxDepth: number;
  private depth: number;

  private items: QuadTreeItem<T>[] = [];
  private children: SpatialQuadTree<T>[] | null = null;

  constructor(
    bounds: AABB,
    maxItems = 8,
    maxDepth = 6,
    depth = 0
  ) {
    this.bounds = bounds;
    this.maxItems = maxItems;
    this.maxDepth = maxDepth;
    this.depth = depth;
  }

  /**
   * Calcula el área visible de la pantalla proyectada en el espacio de coordenadas
   * del mundo del lienzo (V_mundo) incorporando el margen de seguridad mu.
   */
  public static computeVisibleWorldBounds(
    tx: number,
    ty: number,
    scale: number,
    viewWidth: number,
    viewHeight: number,
    margin = 150
  ): AABB {
    const s = Math.max(scale, 0.001);
    return {
      minX: -tx / s - margin,
      minY: -ty / s - margin,
      maxX: (viewWidth - tx) / s + margin,
      maxY: (viewHeight - ty) / s + margin
    };
  }

  /**
   * Determina si dos cajas envolventes AABB se intersecan.
   */
  public static intersects(a: AABB, b: AABB): boolean {
    return (
      a.minX <= b.maxX &&
      a.maxX >= b.minX &&
      a.minY <= b.maxY &&
      a.maxY >= b.minY
    );
  }

  /**
   * Determina si una caja envolvente AABB contiene a otra por completo.
   */
  public static contains(container: AABB, target: AABB): boolean {
    return (
      target.minX >= container.minX &&
      target.maxX <= container.maxX &&
      target.minY >= container.minY &&
      target.maxY <= container.maxY
    );
  }

  /**
   * Inserta un elemento en el QuadTree dividiendo si se supera la capacidad máxima.
   */
  public insert(item: QuadTreeItem<T>): boolean {
    if (!SpatialQuadTree.intersects(this.bounds, item.aabb)) {
      return false;
    }

    if (this.children !== null) {
      const inserted = this.insertIntoChildren(item);
      if (inserted) return true;
      // Si el elemento solapa varios cuadrantes, permanece en este nodo
      this.items.push(item);
      return true;
    }

    this.items.push(item);

    if (this.items.length > this.maxItems && this.depth < this.maxDepth) {
      this.subdivide();
      // Redistribuir elementos a los nuevos hijos
      const remaining: QuadTreeItem<T>[] = [];
      for (let i = 0; i < this.items.length; i++) {
        const it = this.items[i];
        if (!this.insertIntoChildren(it)) {
          remaining.push(it);
        }
      }
      this.items = remaining;
    }

    return true;
  }

  /**
   * Inserta un elemento en alguno de los 4 cuadrantes hijos si cabe enteramente dentro.
   */
  private insertIntoChildren(item: QuadTreeItem<T>): boolean {
    if (!this.children) return false;
    for (let i = 0; i < 4; i++) {
      if (SpatialQuadTree.contains(this.children[i].bounds, item.aabb)) {
        return this.children[i].insert(item);
      }
    }
    return false;
  }

  /**
   * Subdivide el nodo actual en 4 cuadrantes: NW, NE, SW, SE.
   */
  private subdivide(): void {
    const midX = (this.bounds.minX + this.bounds.maxX) / 2;
    const midY = (this.bounds.minY + this.bounds.maxY) / 2;
    const nextDepth = this.depth + 1;

    this.children = [
      // Noroeste (NW)
      new SpatialQuadTree<T>(
        { minX: this.bounds.minX, minY: this.bounds.minY, maxX: midX, maxY: midY },
        this.maxItems,
        this.maxDepth,
        nextDepth
      ),
      // Noreste (NE)
      new SpatialQuadTree<T>(
        { minX: midX, minY: this.bounds.minY, maxX: this.bounds.maxX, maxY: midY },
        this.maxItems,
        this.maxDepth,
        nextDepth
      ),
      // Suroeste (SW)
      new SpatialQuadTree<T>(
        { minX: this.bounds.minX, minY: midY, maxX: midX, maxY: this.bounds.maxY },
        this.maxItems,
        this.maxDepth,
        nextDepth
      ),
      // Sureste (SE)
      new SpatialQuadTree<T>(
        { minX: midX, minY: midY, maxX: this.bounds.maxX, maxY: this.bounds.maxY },
        this.maxItems,
        this.maxDepth,
        nextDepth
      )
    ];
  }

  /**
   * Consulta espacial en O(log n): retorna todos los elementos cuya caja AABB
   * intersecta con la región de búsqueda provista (p. ej. V_mundo).
   */
  public query(searchAABB: AABB, result: QuadTreeItem<T>[] = []): QuadTreeItem<T>[] {
    if (!SpatialQuadTree.intersects(this.bounds, searchAABB)) {
      return result;
    }

    for (let i = 0; i < this.items.length; i++) {
      if (SpatialQuadTree.intersects(searchAABB, this.items[i].aabb)) {
        result.push(this.items[i]);
      }
    }

    if (this.children !== null) {
      for (let i = 0; i < 4; i++) {
        this.children[i].query(searchAABB, result);
      }
    }

    return result;
  }

  /**
   * Elimina un elemento por su identificador.
   */
  public remove(id: string): boolean {
    const idx = this.items.findIndex(it => it.id === id);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      return true;
    }

    if (this.children !== null) {
      for (let i = 0; i < 4; i++) {
        if (this.children[i].remove(id)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Limpia todos los nodos y elementos del árbol.
   */
  public clear(): void {
    this.items = [];
    if (this.children !== null) {
      for (let i = 0; i < 4; i++) {
        this.children[i].clear();
      }
      this.children = null;
    }
  }

  /**
   * Retorna la cantidad total de elementos indexados.
   */
  public size(): number {
    let count = this.items.length;
    if (this.children !== null) {
      for (let i = 0; i < 4; i++) {
        count += this.children[i].size();
      }
    }
    return count;
  }
}
