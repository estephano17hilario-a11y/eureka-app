/**
 * Persistencia del mapa mental.
 *
 *  1) IndexedDB  → copia completa (con fotos). Capacidad grande, escritura asíncrona (no bloquea la UI).
 *  2) localStorage → copia ligera sin fotos (arranque instantáneo y respaldo si IndexedDB no está disponible).
 *  3) Servicio de estudio (nube) → copia portátil con fotos reducidas, enviada en segundo plano.
 *
 * Al abrir un mapa se elige la copia más reciente (updatedAt). Nada se escribe en cada pulsación:
 * hay un "debounce" corto y un guardado forzado al salir / ocultar la app.
 */

import { activeStudyService } from '../services/active-study.service';
import { makeThumbnail } from './images';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface MapSettings {
  layout: string;
  /** 'auto' sigue el ambiente de la app */
  themeId: string;
  lineStyle: 'theme' | 'organic' | 'curve' | 'straight' | 'elbow';
  colorful: boolean;
  pattern: 'theme' | 'none' | 'dots' | 'grid' | 'lines' | 'blueprint';
  fontId: string; // 'theme' o id de FONT_CHOICES
  fontScale: number;
  bgColor: string; // '' = el del tema
  showMinimap: boolean;
  snapToGrid: boolean;
  spacing: 'compact' | 'normal' | 'airy';
}

export interface MapDoc {
  v: 2;
  root: any;
  settings: MapSettings;
  view?: { scale: number; x: number; y: number };
  updatedAt: number;
  /** true cuando la copia ya no lleva las fotos (copia ligera) */
  slim?: boolean;
}

export const DEFAULT_SETTINGS: MapSettings = {
  layout: 'logicalStructure',
  themeId: 'auto',
  lineStyle: 'theme',
  colorful: true,
  pattern: 'theme',
  fontId: 'theme',
  fontScale: 1,
  bgColor: '',
  showMinimap: false,
  snapToGrid: false,
  spacing: 'normal'
};

const DB_NAME = 'eureka-mindmaps';
const DB_VERSION = 1;
const STORE_DOCS = 'docs';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_DOCS)) {
          db.createObjectStore(STORE_DOCS, { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

async function idbGet(key: string): Promise<MapDoc | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_DOCS, 'readonly');
      const req = tx.objectStore(STORE_DOCS).get(key);
      req.onsuccess = () => resolve(req.result?.doc || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbPut(key: string, doc: MapDoc): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_DOCS, 'readwrite');
      tx.objectStore(STORE_DOCS).put({ key, doc });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/** Recorre el árbol de nodos aplicando fn a cada `data`. */
export function walkTree(root: any, fn: (data: any, node: any) => void): void {
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;
    if (node.data) fn(node.data, node);
    if (Array.isArray(node.children)) {
      for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i]);
    }
  }
}

function cloneTree(root: any): any {
  return JSON.parse(JSON.stringify(root));
}

function stripImages(doc: MapDoc): MapDoc {
  const root = cloneTree(doc.root);
  walkTree(root, (d) => {
    if (typeof d.image === 'string' && d.image.startsWith('data:')) {
      d.image = '';
      d.imageSize = null;
      d.imageLost = true;
    }
  });
  return { ...doc, root, slim: true };
}

function docSize(doc: MapDoc): number {
  try {
    return JSON.stringify(doc).length;
  } catch {
    return 0;
  }
}

function isMapDoc(v: any): v is MapDoc {
  return Boolean(v && v.v === 2 && v.root);
}

/** Convierte datos antiguos (árbol suelto + meta) al formato actual. */
function migrateLegacy(raw: any, meta?: any): MapDoc | null {
  if (!raw) return null;
  if (isMapDoc(raw)) return raw;
  const root = raw.root && raw.root.data ? raw.root : raw.data ? raw : null;
  if (!root) return null;
  return {
    v: 2,
    root,
    settings: {
      ...DEFAULT_SETTINGS,
      layout: meta?.layout || DEFAULT_SETTINGS.layout
    },
    view: meta?.viewState,
    updatedAt: meta?.updatedAt || 0
  };
}

export class MindMapStore {
  private key: string;
  private lsKey: string;
  private legacyKeys: string[];
  private topicId?: string;

  private timer: number | null = null;
  private cloudTimer: number | null = null;
  private seq = 0;
  private pendingGetter: (() => MapDoc) | null = null;
  private thumbCache = new Map<string, string>();
  private listeners: ((s: SaveState, detail?: string) => void)[] = [];
  private lastSavedAt = 0;

  constructor(opts: { userId: string; topicId?: string; fallbackKey?: string }) {
    const base = opts.topicId ? `topic_${opts.topicId}` : opts.fallbackKey || 'free';
    this.topicId = opts.topicId;
    this.key = `${opts.userId}:${base}`;
    this.lsKey = `eureka_mm2_${opts.userId}_${base}`;
    this.legacyKeys = opts.topicId
      ? [`eureka_mindmap_topic_${opts.topicId}_${opts.userId}`, `eureka_mindmap_topic_${opts.topicId}`]
      : [`eureka_mindmap_autosave_v1_${opts.userId}`];
  }

  public onState(cb: (s: SaveState, detail?: string) => void): void {
    this.listeners.push(cb);
  }

  private emit(s: SaveState, detail?: string): void {
    this.listeners.forEach((cb) => {
      try {
        cb(s, detail);
      } catch {
        /* ignore */
      }
    });
  }

  /** Devuelve la copia más reciente disponible (o null si el mapa es nuevo). */
  public async load(): Promise<MapDoc | null> {
    const candidates: MapDoc[] = [];

    // 1. IndexedDB (con fotos)
    try {
      const fromIdb = await idbGet(this.key);
      if (isMapDoc(fromIdb)) candidates.push(fromIdb);
    } catch {
      /* ignore */
    }

    // 2. localStorage (copia ligera)
    try {
      const rawLs = localStorage.getItem(this.lsKey);
      if (rawLs) {
        const parsed = JSON.parse(rawLs);
        if (isMapDoc(parsed)) candidates.push(parsed);
      }
    } catch {
      /* ignore */
    }

    // 3. Servicio de estudio (nube / otros dispositivos)
    if (this.topicId) {
      try {
        const fromService = activeStudyService.getMindMapState(this.topicId);
        const doc = migrateLegacy(fromService);
        if (doc) candidates.push(doc);
      } catch {
        /* ignore */
      }
    }

    // 4. Claves antiguas
    for (const k of this.legacyKeys) {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const meta = localStorage.getItem(`${k}_meta`);
        const doc = migrateLegacy(JSON.parse(raw), meta ? JSON.parse(meta) : undefined);
        if (doc) candidates.push(doc);
      } catch {
        /* ignore */
      }
    }

    if (candidates.length === 0) return null;

    // Más reciente primero; a igualdad, la que conserva las fotos
    candidates.sort((a, b) => {
      if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt;
      return Number(Boolean(a.slim)) - Number(Boolean(b.slim));
    });

    const best = candidates[0];

    // Si la ganadora perdió las fotos pero otra copia las conserva, se restauran
    if (best.slim) {
      const withImages = candidates.find((c) => !c.slim);
      if (withImages) {
        const imgs = new Map<string, any>();
        walkTree(withImages.root, (d) => {
          if (d.uid && d.image) imgs.set(d.uid, { image: d.image, imageSize: d.imageSize });
        });
        walkTree(best.root, (d) => {
          const src = d.uid ? imgs.get(d.uid) : null;
          if (src && !d.image) {
            d.image = src.image;
            d.imageSize = src.imageSize;
            delete d.imageLost;
          }
        });
        best.slim = false;
      }
    }

    best.settings = { ...DEFAULT_SETTINGS, ...(best.settings || {}) };
    return best;
  }

  /** Programa un guardado (debounce). */
  public schedule(getDoc: () => MapDoc, delay = 350): void {
    this.pendingGetter = getDoc;
    this.emit('saving');
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.timer = null;
      void this.persist();
    }, delay);
  }

  /** Guardado inmediato de lo pendiente (al salir de la pantalla). */
  public async flush(): Promise<void> {
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.pendingGetter) await this.persist(true);
  }

  /** Guardado síncrono de emergencia (pagehide / beforeunload): solo localStorage. */
  public flushSync(): void {
    if (!this.pendingGetter) return;
    try {
      const doc = this.pendingGetter();
      this.writeLocal(doc);
      void idbPut(this.key, doc);
    } catch {
      /* ignore */
    }
  }

  private writeLocal(doc: MapDoc): boolean {
    const slim = stripImages(doc);
    try {
      localStorage.setItem(this.lsKey, JSON.stringify(slim));
      return true;
    } catch {
      // Sin espacio: se intenta liberar claves antiguas del propio mapa y se reintenta una vez
      try {
        this.legacyKeys.forEach((k) => {
          localStorage.removeItem(k);
          localStorage.removeItem(`${k}_meta`);
        });
        localStorage.setItem(this.lsKey, JSON.stringify(slim));
        return true;
      } catch {
        return false;
      }
    }
  }

  private async persist(force = false): Promise<void> {
    const getDoc = this.pendingGetter;
    if (!getDoc) return;
    const mySeq = ++this.seq;

    let doc: MapDoc;
    try {
      doc = getDoc();
    } catch {
      this.emit('error', 'No se pudo leer el mapa');
      return;
    }

    const [okIdb] = await Promise.all([idbPut(this.key, doc)]);
    const okLs = this.writeLocal(doc);

    if (mySeq !== this.seq) return; // llegó un guardado más reciente
    this.lastSavedAt = Date.now();

    if (!okIdb && !okLs) {
      this.emit('error', 'Sin espacio para guardar. Exporta tu mapa.');
    } else {
      this.emit('saved', okIdb ? undefined : 'Guardado local (sin fotos)');
    }

    this.scheduleCloud(doc, force);
  }

  private scheduleCloud(doc: MapDoc, immediate: boolean): void {
    if (!this.topicId) return;
    if (this.cloudTimer) window.clearTimeout(this.cloudTimer);
    const run = async () => {
      this.cloudTimer = null;
      try {
        const portable = await this.makePortable(doc);
        activeStudyService.saveMindMapState(this.topicId!, portable);
      } catch {
        /* la copia local ya está a salvo */
      }
    };
    if (immediate) void run();
    else this.cloudTimer = window.setTimeout(run, 3200);
  }

  /** Copia para la nube: las fotos grandes se reducen para no saturar la sincronización. */
  private async makePortable(doc: MapDoc): Promise<MapDoc> {
    const root = cloneTree(doc.root);
    const jobs: Promise<void>[] = [];
    walkTree(root, (d) => {
      if (typeof d.image === 'string' && d.image.startsWith('data:') && d.image.length > 70000) {
        const src: string = d.image;
        const cached = this.thumbCache.get(src.slice(0, 64) + src.length);
        if (cached) {
          d.image = cached;
        } else {
          jobs.push(
            makeThumbnail(src, 360).then((t) => {
              this.thumbCache.set(src.slice(0, 64) + src.length, t);
              d.image = t;
            })
          );
        }
      }
    });
    await Promise.all(jobs);
    return { ...doc, root };
  }

  public getLastSavedAt(): number {
    return this.lastSavedAt;
  }

  public getApproxSize(doc: MapDoc): number {
    return docSize(doc);
  }

  public destroy(): void {
    if (this.timer) window.clearTimeout(this.timer);
    if (this.cloudTimer) window.clearTimeout(this.cloudTimer);
    this.listeners = [];
  }
}
