import type { OutlineNode, StudyChunk, TopicAccessLock, ActiveStudyTopic, ActiveStudyState } from '../types/active-study';
import { deckService } from './deck.service';
import { eurekaSupabase } from './supabase.service';
import { Preferences } from '@capacitor/preferences';

const TOPICS_STORAGE_KEY = 'eureka_active_study_topics_v1';
const OUTLINES_STORAGE_KEY = 'eureka_active_study_outlines_v1';
const LOCKS_STORAGE_KEY = 'eureka_active_study_locks_v1';
const USER_COINS_KEY = 'eureka_user_coins_v1';

export const UNLOCK_COST = 50;

class ActiveStudyService {
  private static instance: ActiveStudyService;
  private topics: Map<string, ActiveStudyTopic> = new Map();
  private outlineNodes: Map<string, OutlineNode[]> = new Map(); // topicId -> nodes
  private locks: Map<string, TopicAccessLock> = new Map(); // topicId -> lock
  private userCoins: number = 150;
  private serverTimeOffset: number = 0; // offset between local clock and verified server time

  private constructor() {
    this.loadFromStorage();
    this.initAntiCheatTime();

    // Directiva 5: Forzar persistencia ante suspensión o cierre de la app en segundo plano
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.saveToStorage());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.saveToStorage();
        }
      });
    }
  }

  public static getInstance(): ActiveStudyService {
    if (!ActiveStudyService.instance) {
      ActiveStudyService.instance = new ActiveStudyService();
    }
    return ActiveStudyService.instance;
  }

  private async loadFromStorage(): Promise<void> {
    try {
      // 1. Carga síncrona inicial de caché rápida
      const savedCoins = localStorage.getItem(USER_COINS_KEY);
      this.userCoins = savedCoins !== null ? parseInt(savedCoins, 10) : 150;

      const rawTopics = localStorage.getItem(TOPICS_STORAGE_KEY);
      if (rawTopics) {
        const parsed: ActiveStudyTopic[] = JSON.parse(rawTopics);
        parsed.forEach((t) => this.topics.set(t.id, t));
      }

      const rawOutlines = localStorage.getItem(OUTLINES_STORAGE_KEY);
      if (rawOutlines) {
        const parsed: Record<string, OutlineNode[]> = JSON.parse(rawOutlines);
        Object.entries(parsed).forEach(([topicId, nodes]) => {
          this.outlineNodes.set(topicId, nodes);
        });
      }

      const rawLocks = localStorage.getItem(LOCKS_STORAGE_KEY);
      if (rawLocks) {
        const parsed: Record<string, TopicAccessLock> = JSON.parse(rawLocks);
        Object.entries(parsed).forEach(([topicId, lock]) => {
          this.locks.set(topicId, lock);
        });
      }

      // 2. Hidratación nativa reactiva desde @capacitor/preferences
      const [prefOutlines, prefTopics, prefCoins] = await Promise.all([
        Preferences.get({ key: OUTLINES_STORAGE_KEY }),
        Preferences.get({ key: TOPICS_STORAGE_KEY }),
        Preferences.get({ key: USER_COINS_KEY })
      ]);

      if (prefOutlines.value) {
        const parsed: Record<string, OutlineNode[]> = JSON.parse(prefOutlines.value);
        Object.entries(parsed).forEach(([topicId, nodes]) => {
          this.outlineNodes.set(topicId, nodes);
        });
      }

      if (prefTopics.value) {
        const parsed: ActiveStudyTopic[] = JSON.parse(prefTopics.value);
        parsed.forEach((t) => this.topics.set(t.id, t));
      }

      if (prefCoins.value) {
        this.userCoins = parseInt(prefCoins.value, 10);
      }
    } catch (e) {
      console.error('[ActiveStudyService] Error loading storage:', e);
    }
  }

  public saveToStorage(): void {
    try {
      // Escritura síncrona en caché de memoria/localStorage
      localStorage.setItem(USER_COINS_KEY, this.userCoins.toString());

      const topicsArray = Array.from(this.topics.values());
      const topicsJson = JSON.stringify(topicsArray);
      localStorage.setItem(TOPICS_STORAGE_KEY, topicsJson);

      const outlinesObj: Record<string, OutlineNode[]> = {};
      this.outlineNodes.forEach((nodes, topicId) => {
        outlinesObj[topicId] = nodes;
      });
      const outlinesJson = JSON.stringify(outlinesObj);
      localStorage.setItem(OUTLINES_STORAGE_KEY, outlinesJson);

      const locksObj: Record<string, TopicAccessLock> = {};
      this.locks.forEach((lock, topicId) => {
        locksObj[topicId] = lock;
      });
      const locksJson = JSON.stringify(locksObj);
      localStorage.setItem(LOCKS_STORAGE_KEY, locksJson);

      // Directiva 5: Persistencia inmediata reactiva en almacenamiento local de Capacitor
      Preferences.set({ key: USER_COINS_KEY, value: this.userCoins.toString() }).catch(() => {});
      Preferences.set({ key: TOPICS_STORAGE_KEY, value: topicsJson }).catch(() => {});
      Preferences.set({ key: OUTLINES_STORAGE_KEY, value: outlinesJson }).catch(() => {});
      Preferences.set({ key: LOCKS_STORAGE_KEY, value: locksJson }).catch(() => {});
    } catch (e) {
      console.error('[ActiveStudyService] Error saving storage:', e);
    }
  }

  /**
   * Anti-Cheat: sincroniza con hora confiable si hay conexión a internet
   */
  private async initAntiCheatTime(): Promise<void> {
    try {
      const start = Date.now();
      const res = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', {
        cache: 'no-store',
        signal: AbortSignal.timeout(3500)
      });
      if (res.ok) {
        const data = await res.json();
        const serverUnix = new Date(data.utc_datetime).getTime();
        const latency = (Date.now() - start) / 2;
        this.serverTimeOffset = serverUnix - (Date.now() - latency);
      }
    } catch {
      // Fallback a hora local
      this.serverTimeOffset = 0;
    }
  }

  public getReliableCurrentTime(): number {
    return Date.now() + this.serverTimeOffset;
  }

  // ==========================================
  // GESTIÓN DE MONEDAS Y GAMIFICACIÓN
  // ==========================================

  public getUserCoins(): number {
    return this.userCoins;
  }

  public addCoins(amount: number): number {
    this.userCoins += Math.max(0, amount);
    this.saveToStorage();
    return this.userCoins;
  }

  public deductCoins(amount: number): boolean {
    if (this.userCoins >= amount) {
      this.userCoins -= amount;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // ==========================================
  // TEMAS DE ESTUDIO (CRUD)
  // ==========================================

  public getAllTopics(): ActiveStudyTopic[] {
    return Array.from(this.topics.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public getTopicByDeck(deckId: string): ActiveStudyTopic | null {
    for (const t of this.topics.values()) {
      if (t.deckId === deckId) return t;
    }
    return null;
  }

  public getTopicById(topicId: string): ActiveStudyTopic | null {
    return this.topics.get(topicId) || null;
  }

  public deleteTopic(topicId: string): void {
    this.topics.delete(topicId);
    this.outlineNodes.delete(topicId);
    this.locks.delete(topicId);
    this.saveToStorage();
  }

  public createTopic(
    deckId: string = 'global_study',
    title: string,
    chunksData: { title: string; content: string }[]
  ): ActiveStudyTopic {
    const topicId = 'topic_' + Math.random().toString(36).substring(2, 9);
    const now = Date.now();

    const chunks: StudyChunk[] = chunksData.map((c, idx) => ({
      id: `chunk_${topicId}_${idx}`,
      topicId,
      orderIndex: idx,
      title: c.title || `Bloque ${idx + 1}`,
      sourceContent: c.content,
      isCompleted: false
    }));

    const topic: ActiveStudyTopic = {
      id: topicId,
      deckId,
      title: title || 'Tema de Estudio Activo',
      chunks,
      currentChunkIndex: 0,
      state: 'READING_CHUNK',
      createdAt: now,
      updatedAt: now
    };

    this.topics.set(topicId, topic);
    this.outlineNodes.set(topicId, []);
    this.saveToStorage();
    return topic;
  }

  public updateTopicState(topicId: string, newState: ActiveStudyState): void {
    const topic = this.topics.get(topicId);
    if (!topic) return;

    topic.state = newState;
    topic.updatedAt = Date.now();

    if (newState === 'TOPIC_CONSOLIDATED') {
      this.lockTopic(topicId);
      // Recompensa por completar tema
      this.addCoins(25);
    }

    this.saveToStorage();
  }

  public advanceToNextChunk(topicId: string): { hasMore: boolean; nextIndex: number } {
    const topic = this.topics.get(topicId);
    if (!topic) return { hasMore: false, nextIndex: -1 };

    // Marcar chunk actual como completado
    if (topic.chunks[topic.currentChunkIndex]) {
      topic.chunks[topic.currentChunkIndex].isCompleted = true;
    }

    if (topic.currentChunkIndex + 1 < topic.chunks.length) {
      topic.currentChunkIndex += 1;
      topic.state = 'READING_CHUNK';
      topic.updatedAt = Date.now();
      this.saveToStorage();
      return { hasMore: true, nextIndex: topic.currentChunkIndex };
    } else {
      topic.state = 'TOPIC_CONSOLIDATED';
      topic.updatedAt = Date.now();
      this.lockTopic(topicId);
      this.addCoins(30); // Recompensa por tema completado
      this.saveToStorage();
      return { hasMore: false, nextIndex: topic.currentChunkIndex };
    }
  }

  public resetTopicSession(topicId: string): void {
    const topic = this.topics.get(topicId);
    if (!topic) return;
    topic.currentChunkIndex = 0;
    topic.chunks.forEach((c) => (c.isCompleted = false));
    topic.state = 'READING_CHUNK';
    topic.updatedAt = Date.now();
    this.locks.delete(topicId);
    this.saveToStorage();
  }

  // ==========================================
  // BLOQUEO DE 24 HORAS (CONSOLIDACIÓN)
  // ==========================================

  public lockTopic(topicId: string): TopicAccessLock {
    const user = eurekaSupabase.getCurrentUser();
    const userId = user?.id || 'guest';
    const now = this.getReliableCurrentTime();
    const unlockTime = now + 24 * 60 * 60 * 1000; // 24 horas

    const lock: TopicAccessLock = {
      topicId,
      userId,
      completedAt: new Date(now).toISOString(),
      unlockAvailableAt: new Date(unlockTime).toISOString(),
      isContentHidden: true
    };

    this.locks.set(topicId, lock);
    this.saveToStorage();
    return lock;
  }

  public getLock(topicId: string): TopicAccessLock | null {
    return this.locks.get(topicId) || null;
  }

  public isContentLocked(topicId: string): boolean {
    const lock = this.locks.get(topicId);
    if (!lock) return false;
    if (!lock.isContentHidden) return false;

    if (!lock.unlockAvailableAt) return false;

    const unlockTimestamp = new Date(lock.unlockAvailableAt).getTime();
    const current = this.getReliableCurrentTime();

    if (current >= unlockTimestamp) {
      // Las 24 horas han transcurrido naturalmente
      lock.isContentHidden = false;
      this.saveToStorage();
      return false;
    }

    return true;
  }

  public getRemainingLockTimeMs(topicId: string): number {
    const lock = this.locks.get(topicId);
    if (!lock || !lock.unlockAvailableAt || !lock.isContentHidden) return 0;

    const unlockTimestamp = new Date(lock.unlockAvailableAt).getTime();
    const current = this.getReliableCurrentTime();
    return Math.max(0, unlockTimestamp - current);
  }

  public bypassLockWithCoins(topicId: string, cost: number = UNLOCK_COST): {
    success: boolean;
    message: string;
    remainingCoins: number;
  } {
    const lock = this.locks.get(topicId);
    if (!lock) {
      return { success: false, message: 'No existe bloqueo activo para este tema.', remainingCoins: this.userCoins };
    }

    if (this.userCoins < cost) {
      return {
        success: false,
        message: `Saldo insuficiente. Tienes ${this.userCoins} monedas y se requieren ${cost}.`,
        remainingCoins: this.userCoins
      };
    }

    this.deductCoins(cost);
    lock.isContentHidden = false;
    this.saveToStorage();

    return {
      success: true,
      message: `¡Texto original desbloqueado! Se descontaron ${cost} monedas.`,
      remainingCoins: this.userCoins
    };
  }

  // ==========================================
  // GESTIÓN DE NODOS DEL ESQUEMA (OUTLINE TREE)
  // ==========================================

  public getOutlineNodes(topicId: string): OutlineNode[] {
    return this.outlineNodes.get(topicId) || [];
  }

  public addOutlineNode(
    topicId: string,
    text: string,
    parentId: string | null = null,
    linkedFlashcardId?: string
  ): OutlineNode {
    const nodes = this.outlineNodes.get(topicId) || [];
    const siblings = nodes.filter((n) => n.parentId === parentId);

    const newNode: OutlineNode = {
      id: 'node_' + Math.random().toString(36).substring(2, 9),
      topicId,
      parentId,
      orderIndex: siblings.length,
      text: text.trim(),
      linkedFlashcardId
    };

    nodes.push(newNode);
    this.outlineNodes.set(topicId, nodes);
    this.saveToStorage();
    return newNode;
  }

  public updateOutlineNode(topicId: string, nodeId: string, text: string): void {
    const nodes = this.outlineNodes.get(topicId) || [];
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      node.text = text;
      this.saveToStorage();
    }
  }

  public deleteOutlineNode(topicId: string, nodeId: string): void {
    const nodes = this.outlineNodes.get(topicId) || [];

    // Eliminar en cascada nodo y todos sus hijos descendientes
    const idsToDelete = new Set<string>([nodeId]);
    let addedMore = true;
    while (addedMore) {
      addedMore = false;
      for (const n of nodes) {
        if (n.parentId && idsToDelete.has(n.parentId) && !idsToDelete.has(n.id)) {
          idsToDelete.add(n.id);
          addedMore = true;
        }
      }
    }

    const filtered = nodes.filter((n) => !idsToDelete.has(n.id));
    this.outlineNodes.set(topicId, filtered);
    this.saveToStorage();
  }

  public reorderOutlineNodes(topicId: string, orderedNodeIds: string[], parentId: string | null = null): void {
    const nodes = this.outlineNodes.get(topicId) || [];
    orderedNodeIds.forEach((id, index) => {
      const node = nodes.find((n) => n.id === id);
      if (node) {
        node.orderIndex = index;
        if (parentId !== undefined) {
          node.parentId = parentId;
        }
      }
    });
    this.saveToStorage();
  }

  public indentOutlineNode(topicId: string, nodeId: string): void {
    const nodes = this.outlineNodes.get(topicId) || [];
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Buscar hermano anterior con el mismo parentId
    const siblings = nodes
      .filter((n) => n.parentId === node.parentId)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const currentIndex = siblings.findIndex((n) => n.id === nodeId);
    if (currentIndex > 0) {
      const prevSibling = siblings[currentIndex - 1];
      node.parentId = prevSibling.id;
      // Reubicar como último hijo del hermano anterior
      const childrenOfPrev = nodes.filter((n) => n.parentId === prevSibling.id);
      node.orderIndex = childrenOfPrev.length;
      this.saveToStorage();
    }
  }

  public outdentOutlineNode(topicId: string, nodeId: string): void {
    const nodes = this.outlineNodes.get(topicId) || [];
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || node.parentId === null) return;

    // Obtener el nodo padre actual
    const parentNode = nodes.find((n) => n.id === node.parentId);
    if (parentNode) {
      node.parentId = parentNode.parentId; // Ascender al nivel del abuelo
      const newSiblings = nodes.filter((n) => n.parentId === node.parentId);
      node.orderIndex = newSiblings.length;
      this.saveToStorage();
    }
  }

  /**
   * Construye el árbol anidado para renderizado
   */
  public getOutlineTree(topicId: string): OutlineNode[] {
    const flat = this.getOutlineNodes(topicId);
    const map = new Map<string, OutlineNode>();
    const roots: OutlineNode[] = [];

    // Clonar para no mutar el storage flat
    flat.forEach((n) => {
      map.set(n.id, { ...n, children: [] });
    });

    map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    // Ordenar por orderIndex
    const sortRec = (list: OutlineNode[]) => {
      list.sort((a, b) => a.orderIndex - b.orderIndex);
      list.forEach((item) => {
        if (item.children && item.children.length > 0) {
          sortRec(item.children);
        }
      });
    };

    sortRec(roots);
    return roots;
  }

  // ==========================================
  // CARGA DE DEMO / TEMA EJEMPLO
  // ==========================================

  public createDemoTopic(deckId?: string): ActiveStudyTopic {
    const demoChunks = [
      {
        title: 'Bloque 1: Potenciación a Largo Plazo y Codificación Activa',
        content: `La Potenciación a Largo Plazo (LTP, por sus siglas en inglés) es un proceso biológico fundamental por el cual la transmisión de señales entre dos neuronas se fortalece de forma persistente como resultado de una estimulación sincrónica y repetida. Descubierta por Terje Lømo en el hipocampo de conejos, la LTP es considerada ampliamente la base celular del aprendizaje y la memoria a largo plazo.

Cuando una neurona presináptica libera glutamato repetidamente a alta frecuencia, activa los receptores AMPA, despolarizando la membrana celular. Esta despolarización expulsa el ion magnesio (Mg²⁺) que bloquea el poro de los receptores NMDA, permitiendo un influjo masivo de iones de calcio (Ca²⁺) al interior postsináptico. El calcio desencadena cascadas enzimáticas mediadas por CaMKII, promoviendo la inserción de nuevos receptores AMPA y la consolidación estructural de las espinas dendríticas.`
      },
      {
        title: 'Bloque 2: Recuperación Activa y el Efecto del Test',
        content: `El efecto de evaluación o efecto de recuperación activa (Testing Effect) postula que el acto de recuperar activamente información de la memoria fortalece las huellas mnémicas de manera significativamente más duradera que el reestudio pasivo o la relectura. Los estudios clásicos de Roediger y Karpicke demostraron que los estudiantes que realizan pruebas de recuperación retienen hasta un 50% más de contenido al cabo de una semana en comparación con quienes dedican el mismo tiempo a releer.

La recuperación activa induce plasticidad sináptica porque obliga a los circuitos cerebrales a reconstruir la red semántica del concepto sin el andamiaje del texto visible. Es por esta razón que la creación inmediata de flashcards y la síntesis jerárquica en esquemas ciegos (sin ver la solución original) forzan al cerebro a entrar en un estado de esfuerzo deseable que acelera la consolidación duradera.`
      },
      {
        title: 'Bloque 3: Consolidación Sináptica vs de Sistemas (24 Horas)',
        content: `La consolidación de la memoria no es un evento instantáneo, sino un proceso biológico que abarca dos escalas temporales críticas: la consolidación sináptica (que ocurre en las primeras horas tras la codificación mediante síntesis de proteínas dependiente de CREB) y la consolidación de sistemas, durante la cual el hipocampo transfiere gradualmente el control de la memoria a áreas neocorticales, típicamente durante el sueño de ondas lentas en una ventana de 24 horas.

Bloquear el acceso al texto fuente original durante 24 horas después de una sesión profunda previene la interferencia proactiva y el sesgo de familiaridad ilusoria (la trampa cognitiva de creer que sabemos un tema simplemente porque al volver a leerlo nos resulta familiar). Este periodo de bloqueo fuerza la confianza en las pistas mnémicas y el mapa jerárquico elaborado por el propio estudiante.`
      }
    ];

    let targetDeck = deckId ? deckService.getDeckById(deckId) : null;
    if (!targetDeck) {
      const existing = deckService.getAllDecks().find((d) => d.name.includes('Neurobiología') || d.name.includes('Neurociencia'));
      if (existing) {
        targetDeck = existing;
      } else {
        targetDeck = deckService.createDeck({
          name: '🧠 Neurobiología y Aprendizaje',
          icon: 'deck',
          color: '#38bdf8'
        });
      }
    }

    return this.createTopic(targetDeck.id, 'Neurobiología del Aprendizaje', demoChunks);
  }

  public createNuclearDemoTopic(deckId?: string): ActiveStudyTopic {
    const nuclearChunks = [
      {
        title: 'Bloque 1: Notación Nuclear, Isótopos y Fórmulas de Enlace',
        content: `En física nuclear y química cuántica, cualquier nucleído se especifica de forma universal mediante la notación estándar \\ce{^{A}_{Z}X}, donde A representa el número másico (suma de nucleones) y Z el número atómico (protones). Por ejemplo, el Cesio-133 empleado internacionalmente en relojes atómicos para la calibración del segundo se expresa rigurosamente como \\ce{^{133}_{55}Cs}. 

El defecto de masa nuclear \\Delta m se calcula restando la masa del núcleo respecto a sus componentes libres: \\Delta m = Z m_p + (A - Z) m_n - M_{núcleo}. Aplicando la equivalencia relativista de masa-energía de Einstein \\Delta E = \\Delta m c^2, se obtiene la energía de enlace nuclear total.`
      },
      {
        title: 'Bloque 2: Cinética de Decaimiento Radiactivo e Integrales',
        content: `La desintegración espontánea de núcleos inestables sigue una cinética diferencial de primer orden expresada matemáticamente como:
$$\\frac{dN(t)}{dt} = -\\lambda N(t)$$

Integrando esta ecuación diferencial separable entre el tiempo inicial t=0 con población $N_0$ y un tiempo arbitrario $t$, se deduce la ley fundamental de desintegración exponencial:
$$N(t) = N_0 e^{-\\lambda t}$$

El período de semidesintegración radiactiva $t_{1/2}$, que define el tiempo requerido para que la actividad se reduzca a la mitad, se deduce evaluando $\\frac{N_0}{2} = N_0 e^{-\\lambda t_{1/2}}$, lo que conduce analíticamente a $t_{1/2} = \\frac{\\ln(2)}{\\lambda} \\approx \\frac{0.69315}{\\lambda}$.`
      }
    ];

    let targetDeck = deckId ? deckService.getDeckById(deckId) : null;
    if (!targetDeck) {
      const existing = deckService.getAllDecks().find((d) => d.name.includes('Física Nuclear'));
      if (existing) {
        targetDeck = existing;
      } else {
        targetDeck = deckService.createDeck({
          name: '⚛️ Física Nuclear & Química',
          icon: 'deck',
          color: '#a855f7'
        });
      }
    }

    return this.createTopic(targetDeck.id, 'Física Nuclear: Isótopos y Decaimiento Radiactivo', nuclearChunks);
  }
}

export const activeStudyService = ActiveStudyService.getInstance();
