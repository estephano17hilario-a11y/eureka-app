/**
 * AdaptiveSplineEngine.ts
 *
 * Módulo Geométrico de Splines Adaptativas y Cintas Cónicas Orgánicas (Tapering Ribbons)
 * Implementa el cálculo de curvas paramétricas de Bézier cúbicas con tangencia horizontal
 * de clase C^1, cintas cerradas con grosor atenuado variable (w(t)) y subrayado elástico
 * para el paradigma MindMeister sobre SVG/Canvas.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface SplineOptions {
  tension?: number;        // Coeficiente kappa (def: 0.55)
  deltaMin?: number;       // Umbral mínimo de desplazamiento x (def: 20px)
  deltaMax?: number;       // Umbral máximo de desplazamiento x (def: 140px)
  trunkOffset?: number;    // Desplazamiento de tronco común inicial (def: 18px)
}

export interface RibbonOptions extends SplineOptions {
  wRoot?: number;          // Grosor en el origen del nodo raíz (def: 8.5px)
  wChild?: number;         // Grosor al llegar al nodo secundario (def: 2.5px)
  alpha?: number;          // Exponente de atenuación cónica (def: 1.25)
  samples?: number;        // Cantidad de puntos muestreados para polígono (def: 32)
}

export class AdaptiveSplineEngine {
  private static readonly DEFAULT_TENSION = 0.55;
  private static readonly DEFAULT_DELTA_MIN = 20;
  private static readonly DEFAULT_DELTA_MAX = 140;
  private static readonly DEFAULT_TRUNK_OFFSET = 18;
  private static readonly DEFAULT_W_ROOT = 8.5;
  private static readonly DEFAULT_W_CHILD = 2.5;
  private static readonly DEFAULT_ALPHA = 1.25;
  private static readonly DEFAULT_SAMPLES = 32;

  /**
   * Calcula los puntos de control intermedios P1 y P2 para una curva Bézier cúbica
   * garantizando tangencia horizontal de orden C^1 (dy/dt = 0 en los extremos).
   */
  public static calculateControlPoints(
    p0: Point2D,
    p3: Point2D,
    options: SplineOptions = {}
  ): { p1: Point2D; p2: Point2D } {
    const kappa = options.tension ?? this.DEFAULT_TENSION;
    const deltaMin = options.deltaMin ?? this.DEFAULT_DELTA_MIN;
    const deltaMax = options.deltaMax ?? this.DEFAULT_DELTA_MAX;

    const dx = p3.x - p0.x;
    const signX = dx >= 0 ? 1 : -1;
    const absDx = Math.abs(dx);

    const clampedOffset = Math.min(Math.max(kappa * absDx, deltaMin), deltaMax);

    const p1: Point2D = {
      x: p0.x + signX * clampedOffset,
      y: p0.y // Restricción de tangencia horizontal: y1 = y0
    };

    const p2: Point2D = {
      x: p3.x - signX * clampedOffset,
      y: p3.y // Restricción de tangencia horizontal: y2 = y3
    };

    return { p1, p2 };
  }

  /**
   * Evalúa la posición B(t) en la curva cúbica de Bézier para t in [0, 1].
   */
  public static evaluateBezierPoint(
    p0: Point2D,
    p1: Point2D,
    p2: Point2D,
    p3: Point2D,
    t: number
  ): Point2D {
    const tClamp = Math.min(Math.max(t, 0), 1);
    const u = 1 - tClamp;
    const tt = tClamp * tClamp;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * tClamp;

    return {
      x: uuu * p0.x + 3 * uu * tClamp * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * tClamp * p1.y + 3 * u * tt * p2.y + ttt * p3.y
    };
  }

  /**
   * Evalúa la primera derivada B'(t) en la curva cúbica de Bézier.
   */
  public static evaluateBezierDerivative(
    p0: Point2D,
    p1: Point2D,
    p2: Point2D,
    p3: Point2D,
    t: number
  ): Point2D {
    const tClamp = Math.min(Math.max(t, 0), 1);
    const u = 1 - tClamp;

    // B'(t) = 3(1-t)^2 (P1 - P0) + 6(1-t)t (P2 - P1) + 3t^2 (P3 - P2)
    const term0 = 3 * u * u;
    const term1 = 6 * u * tClamp;
    const term2 = 3 * tClamp * tClamp;

    return {
      x: term0 * (p1.x - p0.x) + term1 * (p2.x - p1.x) + term2 * (p3.x - p2.x),
      y: term0 * (p1.y - p0.y) + term1 * (p2.y - p1.y) + term2 * (p3.y - p2.y)
    };
  }

  /**
   * Calcula el vector normal unitario N(t) ortogonal al vector tangente T(t).
   * N(t) = (-Ty, Tx)
   */
  public static evaluateNormal(
    p0: Point2D,
    p1: Point2D,
    p2: Point2D,
    p3: Point2D,
    t: number
  ): Point2D {
    const d = this.evaluateBezierDerivative(p0, p1, p2, p3, t);
    const length = Math.hypot(d.x, d.y);

    if (length < 1e-7) {
      // Fallback a normal horizontal si la longitud es despreciable
      return { x: 0, y: -1 };
    }

    const tx = d.x / length;
    const ty = d.y / length;

    // Normal ortogonal a la izquierda del sentido de avance
    return {
      x: -ty,
      y: tx
    };
  }

  /**
   * Genera el path SVG estándar de la curva Bézier adaptativa con tangencia horizontal.
   */
  public static generateAdaptiveCubicPath(
    p0: Point2D,
    p3: Point2D,
    options: SplineOptions = {}
  ): string {
    const { p1, p2 } = this.calculateControlPoints(p0, p3, options);
    return `M ${p0.x.toFixed(2)},${p0.y.toFixed(2)} C ${p1.x.toFixed(2)},${p1.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)} ${p3.x.toFixed(2)},${p3.y.toFixed(2)}`;
  }

  /**
   * Genera una trayectoria vectorial cerrada (Organic Tapering Ribbon) para ramificaciones maestras
   * de nivel 1. Modula el grosor de forma cónica w(t) desde wRoot hasta wChild.
   * Retorna una cadena SVG `<path d="..." />` lista para rellenarse con `fill`.
   */
  public static generateOrganicRibbonPath(
    p0: Point2D,
    p3: Point2D,
    options: RibbonOptions = {}
  ): string {
    const wRoot = options.wRoot ?? this.DEFAULT_W_ROOT;
    const wChild = options.wChild ?? this.DEFAULT_W_CHILD;
    const alpha = options.alpha ?? this.DEFAULT_ALPHA;
    const samples = options.samples ?? this.DEFAULT_SAMPLES;

    const { p1, p2 } = this.calculateControlPoints(p0, p3, options);

    const upperPoints: Point2D[] = [];
    const lowerPoints: Point2D[] = [];

    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      // Función escalar monótona de ancho w(t)
      const u = 1 - t;
      const wt = wRoot * Math.pow(u, alpha) + wChild * Math.pow(t, alpha);
      const halfW = wt / 2;

      const bt = this.evaluateBezierPoint(p0, p1, p2, p3, t);
      const nt = this.evaluateNormal(p0, p1, p2, p3, t);

      upperPoints.push({
        x: bt.x + halfW * nt.x,
        y: bt.y + halfW * nt.y
      });

      lowerPoints.push({
        x: bt.x - halfW * nt.x,
        y: bt.y - halfW * nt.y
      });
    }

    // Construcción del path cerrado:
    // M B_sup(0) -> spline superior -> B_sup(1) -> L B_inf(1) -> spline inferior inversa -> B_inf(0) -> Z
    const pathParts: string[] = [];

    // 1. Iniciar en B_sup(0)
    pathParts.push(`M ${upperPoints[0].x.toFixed(2)},${upperPoints[0].y.toFixed(2)}`);

    // 2. Trazar spline superior continua
    for (let i = 1; i <= samples; i++) {
      pathParts.push(`L ${upperPoints[i].x.toFixed(2)},${upperPoints[i].y.toFixed(2)}`);
    }

    // 3. Conectar al extremo inferior en B_inf(1)
    pathParts.push(`L ${lowerPoints[samples].x.toFixed(2)},${lowerPoints[samples].y.toFixed(2)}`);

    // 4. Recorrer la curva inferior en reversa
    for (let i = samples - 1; i >= 0; i--) {
      pathParts.push(`L ${lowerPoints[i].x.toFixed(2)},${lowerPoints[i].y.toFixed(2)}`);
    }

    // 5. Cerrar el polígono orgánico
    pathParts.push('Z');

    return pathParts.join(' ');
  }

  /**
   * Genera el trazado de conexión hacia un nodo hijo (Nivel 2+ y recuadros).
   * La curva parte del puerto del padre P0 y termina exactamente en el puerto del hijo P3,
   * sin atravesar el recuadro del nodo hijo.
   * Incluye un identificador de óvalo armónico e idéntico para marcar las ramas hijas.
   */
  public static generateChildConnectorPath(
    p0: Point2D,
    p3: Point2D,
    isLeftDirection: boolean,
    options: SplineOptions & { useTrunkOffset?: boolean; includeOvalMarker?: boolean } = {}
  ): string {
    const trunkOffset = options.trunkOffset ?? this.DEFAULT_TRUNK_OFFSET;
    const signX = isLeftDirection ? -1 : 1;

    let startPoint = p0;
    let trunkPath = '';

    // Si se activa el tramo troncal común previo a la bifurcación
    if (options.useTrunkOffset && trunkOffset > 0) {
      const trunkEnd: Point2D = {
        x: p0.x + signX * trunkOffset,
        y: p0.y
      };
      trunkPath = `M ${p0.x.toFixed(2)},${p0.y.toFixed(2)} L ${trunkEnd.x.toFixed(2)},${trunkEnd.y.toFixed(2)} `;
      startPoint = trunkEnd;
    }

    const { p1, p2 } = this.calculateControlPoints(startPoint, p3, options);

    const cubicSegment = trunkPath
      ? `C ${p1.x.toFixed(2)},${p1.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)} ${p3.x.toFixed(2)},${p3.y.toFixed(2)}`
      : `M ${startPoint.x.toFixed(2)},${startPoint.y.toFixed(2)} C ${p1.x.toFixed(2)},${p1.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)} ${p3.x.toFixed(2)},${p3.y.toFixed(2)}`;

    let fullPath = `${trunkPath}${cubicSegment}`.trim();

    // 2. Identificador entre las líneas: icono de óvalo idéntico para indicar ramas hijas
    if (options.includeOvalMarker) {
      // Punto representativo a lo largo de la curva (t = 0.35 para quedar visible antes del nodo)
      const t = 0.35;
      const ovalCenter = this.evaluateBezierPoint(startPoint, p1, p2, p3, t);
      const rx = 5.5; // Radio horizontal del óvalo
      const ry = 3.2; // Radio vertical del óvalo
      // Sub-path cerrado de elipse en el mismo trazado SVG
      const ovalSubPath = ` M ${(ovalCenter.x - rx).toFixed(2)},${ovalCenter.y.toFixed(2)} a ${rx},${ry} 0 1 0 ${(rx * 2).toFixed(2)},0 a ${rx},${ry} 0 1 0 ${(-rx * 2).toFixed(2)},0`;
      fullPath += ovalSubPath;
    }

    return fullPath;
  }

  /**
   * Método de compatibilidad para trazado elástico sin invasión del recuadro.
   */
  public static generateElasticUnderlinePath(
    p0: Point2D,
    p3: Point2D,
    _childWidth: number,
    isLeftDirection: boolean,
    options: SplineOptions & { useTrunkOffset?: boolean; includeOvalMarker?: boolean } = {}
  ): string {
    return this.generateChildConnectorPath(p0, p3, isLeftDirection, {
      ...options,
      includeOvalMarker: options.includeOvalMarker ?? true
    });
  }

  /**
   * Computa el Axis-Aligned Bounding Box (AABB) de una curva o cinta para Frustum Culling.
   */
  public static computeBoundingBox(points: Point2D[], padding = 4): AABB {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }

    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding
    };
  }
}
