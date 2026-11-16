import type { Deck, Flashcard, DeckStats, StudyRating, DeckSettings, CardType, OcclusionMask, OcclusionMode, BatchParseOptions } from '../types/flashcard';
import { getInitialDemoDecks } from './demo-data';
import { srsService } from './srs.service';
import { eurekaBackend } from './backend.service';
import { idbGet, idbSet, lsGet, lsSet, lsRemove, requestPersistentStorage } from './storage.service';
import { studyStats } from './study-stats.service';

/** Qué versión de cada elemento ya confirmó el servidor, y qué borrados siguen pendientes de enviar. */
interface SyncMeta {
  decks: Record<string, number>;
  cards: Record<string, number>;
  delDecks: string[];
  delCards: string[];
}

interface CoreSnapshot {
  decks: Deck[];
  cards: Flashcard[];
  savedAt: number;
}

/** Id corto y único (evita colisiones al crear cientos de tarjetas en el mismo milisegundo). */
let idCounter = 0;
function makeId(prefix: string): string {
  idCounter = (idCounter + 1) % 1679616;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

/** Etiqueta normalizada: minúsculas, sin «#» ni espacios sobrantes, máx. 32 caracteres */
export function normalizeTag(raw: string): string {
  return raw.replace(/^#+/, '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[,;]/g, '').slice(0, 32);
}

/** Copia de las tarjetas sin imágenes (cabe en localStorage aunque haya muchas fotos). */
function stripCardImages(cards: Flashcard[]): Flashcard[] {
  return cards.map((c) => {
    if (!c.frontImage && !c.backImage && !c.occlusionImage) return c;
    return { ...c, frontImage: undefined, backImage: undefined, occlusionImage: undefined };
  });
}

/** Mazos y tarjetas de plantilla que recibe cualquier cuenta nueva: nunca se consideran "de otra cuenta". */
const DEMO_DECK_IDS = new Set(['deck-mates', 'deck-mates-sub', 'deck-idioma', 'deck-humans', 'deck-tools']);
const DEMO_CARD_IDS = new Set(['card-figma-1', 'card-figma-2', 'card-figma-3', 'card-figma-4', 'card-figma-humans-1']);

const LS_CARDS_BUDGET = 2_600_000; // caracteres: por encima, localStorage guarda la copia ligera y IndexedDB la completa

export class DeckService {
  private static instance: DeckService;
  private currentUserId: string = '';
  private decks: Deck[] = [];
  private cards: Flashcard[] = [];
  private listeners: Array<() => void> = [];
  private meta: SyncMeta = { decks: {}, cards: {}, delDecks: [], delCards: [] };

  // Cachés de lectura (se invalidan con cada cambio)
  private rev = 0;
  private hierarchyCache = new Map<string, string[]>();
  private cardsCache = new Map<string, Flashcard[]>();
  private statsCache = new Map<string, DeckStats>();
  private statsAt = 0;

  private saveTimer: number | null = null;
  private idbTimer: number | null = null;
  private pushTimer: number | null = null;
  private pushing = false;
  private pushAgain = false;
  private syncing = false;
  private syncAgain = false;
  private dirty = false;
  /** Sube con cada cambio de cuenta: toda respuesta de red que llegue de una época anterior se descarta. */
  private epoch = 0;
  private suspendEmit = 0;
  private repairPromises = new Map<string, Promise<boolean>>();

  private constructor() {
    this.currentUserId = eurekaBackend.getUserId();
    // Respaldos globales de versiones anteriores: mezclaban datos de unas cuentas con otras
    lsRemove('eureka_decks_backup_latest');
    lsRemove('eureka_cards_backup_latest');
    this.loadFromStorage();
    requestPersistentStorage();
    void this.hydrateFromIdb().then(() => {
      this.seedDemoIfEmpty();
      return this.syncWithCloud();
    });

    if (typeof window !== 'undefined') {
      const persistState = () => {
        this.flushSave();
      };

      window.addEventListener('beforeunload', persistState);
      window.addEventListener('pagehide', persistState);
      window.addEventListener('freeze', persistState);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          persistState();
          this.schedulePush(0);
        }
      });
      window.addEventListener('online', () => this.schedulePush(300));
      // Reintento periódico de lo que no llegó al servidor (sin conexión, servidor reiniciándose…)
      window.setInterval(() => {
        if (document.visibilityState === 'visible') this.schedulePush(0);
      }, 60000);
    }
  }

  public static getInstance(): DeckService {
    if (!DeckService.instance) {
      DeckService.instance = new DeckService();
    }
    return DeckService.instance;
  }

  /**
   * Cambia de cuenta. Lo local se carga y se pinta al instante; la nube se espera como mucho 6 s
   * (si la cuenta no tiene nada en este dispositivo se espera para no enseñar una pantalla vacía).
   */
  public async setUser(userId: string, opts: { waitForCloud?: boolean } = {}): Promise<void> {
    const waitForCloud = opts.waitForCloud !== false;
    const resolvedId = (!userId || userId === 'guest' || userId === 'default')
      ? eurekaBackend.getUserId()
      : userId;
    if (resolvedId === this.currentUserId && this.epoch > 0) {
      // Misma cuenta (p. ej. aviso de sesión repetido): no se recarga ni se pierde nada
      if (waitForCloud) await Promise.race([this.syncWithCloud(), new Promise<void>(r => window.setTimeout(r, 6000))]);
      return;
    }

    // Lo pendiente de la cuenta anterior se guarda y se intenta subir CON SU id antes de cambiar
    this.flushSave();
    void this.pushDirty();

    this.epoch++;
    if (this.pushTimer !== null) {
      window.clearTimeout(this.pushTimer);
      this.pushTimer = null;
    }
    this.currentUserId = resolvedId;
    this.decks = [];
    this.cards = [];
    this.meta = { decks: {}, cards: {}, delDecks: [], delCards: [] };

    const epoch = this.epoch;
    this.suspendEmit++;
    try {
      this.loadFromStorage();
      await this.hydrateFromIdb();
      this.seedDemoIfEmpty();
    } finally {
      this.suspendEmit--;
    }
    if (epoch !== this.epoch) return; // otra cuenta tomó el relevo mientras cargábamos

    const hadLocal = this.decks.length > 0 || this.cards.length > 0;
    this.invalidate();
    if (hadLocal) this.fireListeners(); // pinta ya lo que hay en este dispositivo

    const sync = this.syncWithCloud();
    if (waitForCloud || !hadLocal) {
      await Promise.race([sync, new Promise<void>(r => window.setTimeout(r, 6000))]);
    }
    if (epoch !== this.epoch) return;
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /** Cada cambio invalida cachés, programa el guardado y avisa a la interfaz. */
  private notify(): void {
    this.invalidate();
    this.scheduleSave();
    this.schedulePush();
    this.emitChange();
  }

  /** Agrupa los avisos: varias altas seguidas (importar 200 tarjetas) provocan un solo repintado. */
  private emitQueued = false;
  private emitChange(): void {
    if (this.emitQueued) return;
    this.emitQueued = true;
    queueMicrotask(() => {
      this.emitQueued = false;
      this.fireListeners();
    });
  }

  /** Avisa a la interfaz; durante la carga de una cuenta se silencia y se avisa una sola vez al terminar. */
  private fireListeners(): void {
    if (this.suspendEmit > 0) return;
    this.listeners.forEach(fn => fn());
  }

  private invalidate(): void {
    this.rev++;
    this.hierarchyCache.clear();
    this.cardsCache.clear();
    this.statsCache.clear();
  }

  // --- CLAVES ---

  private uid(): string {
    return this.currentUserId || eurekaBackend.getUserId() || 'default';
  }
  private getDecksStorageKey(): string {
    return `eureka_decks_user_${this.uid()}`;
  }
  private getCardsStorageKey(): string {
    return `eureka_cards_user_${this.uid()}`;
  }
  private getMetaKey(): string {
    return `eureka_syncmeta_user_${this.uid()}`;
  }
  private getBackupKeys(): { decks: string; cards: string } {
    return { decks: `eureka_decks_backup_${this.uid()}`, cards: `eureka_cards_backup_${this.uid()}` };
  }
  private getCoreMetaKey(): string {
    return `eureka_coremeta_user_${this.uid()}`;
  }
  private getIdbKey(): string {
    return `core:${this.uid()}`;
  }

  // --- CARGA ---

  private loadFromStorage(): void {
    try {
      this.decks = [];
      this.cards = [];
      this.meta = { decks: {}, cards: {}, delDecks: [], delCards: [] };

      let storedDecks = lsGet(this.getDecksStorageKey());
      let storedCards = lsGet(this.getCardsStorageKey());

      // Respaldo de ESTA cuenta si su clave principal estuviera vacía. Jamás se toma nada de otra cuenta:
      // antes se copiaba el "último respaldo" o cualquier eureka_decks_user_*, y eso mezclaba cuentas.
      if (!storedDecks) {
        const keys = this.getBackupKeys();
        const backupDecks = lsGet(keys.decks);
        if (backupDecks) {
          storedDecks = backupDecks;
          storedCards = lsGet(keys.cards);
        }
      }

      if (storedDecks) {
        this.decks = JSON.parse(storedDecks);
        this.normalizeDecks();
      }

      if (storedCards) {
        this.cards = JSON.parse(storedCards);
      }

      try {
        const rawMeta = lsGet(this.getMetaKey());
        if (rawMeta) {
          const m = JSON.parse(rawMeta);
          this.meta = {
            decks: m.decks || {},
            cards: m.cards || {},
            delDecks: Array.isArray(m.delDecks) ? m.delDecks : [],
            delCards: Array.isArray(m.delCards) ? m.delCards : []
          };
        }
      } catch {
        /* meta corrupta: se reconstruye en la próxima sincronización */
      }

      this.invalidate();
    } catch (err) {
      console.warn('[DECK SERVICE] Error leyendo almacenamiento local:', err);
    }
  }

  /**
   * Un invitado nuevo, sin nada en localStorage NI en IndexedDB, recibe los mazos de ejemplo (solo una vez).
   * Se hace después de leer IndexedDB: si no, un localStorage vacío haría que el ejemplo pisara datos reales.
   */
  private seedDemoIfEmpty(): void {
    const isGuest = !this.currentUserId || this.currentUserId.startsWith('guest_') || this.currentUserId === 'default';
    if (!isGuest || this.decks.length > 0 || this.cards.length > 0) return;
    const flagKey = `eureka_demo_seeded_${this.uid()}`;
    if (lsGet(flagKey)) return;
    const initial = getInitialDemoDecks();
    this.decks = initial.decks;
    this.cards = initial.cards;
    lsSet(flagKey, '1');
    this.invalidate();
    this.saveNow();
    this.fireListeners();
  }

  private normalizeDecks(): void {
    this.decks.forEach(d => {
      if (d.id === 'deck-mates-sub') {
        d.isFolder = false;
        d.icon = 'deck';
      } else if (d.id === 'deck-mates' || d.id === 'deck-idioma' || d.id === 'deck-humans' || d.id === 'deck-tools') {
        d.isFolder = true;
        d.icon = d.id === 'deck-tools' ? 'briefcase' : 'folder';
      } else if (d.icon === 'folder' || d.icon === 'folder-sub' || d.icon === 'briefcase') {
        d.isFolder = true;
      } else if (d.isFolder === undefined) {
        d.isFolder = false;
      }
    });
  }

  /**
   * Segunda lectura, asíncrona, desde IndexedDB: guarda la copia completa (con fotos) y sobrevive aunque
   * localStorage esté lleno o el navegador lo haya limpiado. Se usa la copia más reciente.
   */
  private async hydrateFromIdb(): Promise<void> {
    const forUser = this.uid();
    try {
      const snap = await idbGet<CoreSnapshot>(this.getIdbKey());
      if (!snap || !Array.isArray(snap.decks) || !Array.isArray(snap.cards)) return;
      if (forUser !== this.uid()) return; // cambió la cuenta mientras leíamos

      let lsMeta: { savedAt?: number; slim?: boolean } = {};
      try {
        lsMeta = JSON.parse(lsGet(this.getCoreMetaKey()) || '{}');
      } catch {
        /* ignore */
      }
      const lsAt = lsMeta.savedAt || 0;
      let changed = false;

      if (this.decks.length === 0 || snap.savedAt > lsAt) {
        // IndexedDB tiene datos más nuevos (o localStorage está vacío)
        if (snap.decks.length > 0 || this.decks.length === 0) {
          this.decks = snap.decks;
          this.cards = snap.cards;
          this.normalizeDecks();
          changed = true;
        }
      } else if (lsMeta.slim) {
        // localStorage guardó la copia ligera: se recuperan las fotos desde IndexedDB
        const byId = new Map(snap.cards.map(c => [c.id, c]));
        this.cards = this.cards.map(c => {
          const full = byId.get(c.id);
          if (!full) return c;
          if (c.frontImage || c.backImage || c.occlusionImage) return c;
          if (!full.frontImage && !full.backImage && !full.occlusionImage) return c;
          changed = true;
          return { ...c, frontImage: full.frontImage, backImage: full.backImage, occlusionImage: full.occlusionImage };
        });
      }

      if (changed) {
        this.invalidate();
        this.fireListeners();
      }
    } catch (err) {
      console.warn('[DECK SERVICE] No se pudo leer IndexedDB:', err);
    }
  }

  // --- GUARDADO ---

  private scheduleSave(): void {
    this.dirty = true;
    if (this.saveTimer !== null) return;
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null;
      this.saveNow();
    }, 220);
  }

  /** Guarda ya lo pendiente (al ocultar la app o cambiar de cuenta). */
  private flushSave(): void {
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    if (this.dirty) this.saveNow();
  }

  private saveNow(): void {
    this.dirty = false;
    const savedAt = Date.now();
    try {
      const decksJson = JSON.stringify(this.decks);

      // Si las fotos ya van a desbordar localStorage, se salta serializar la copia completa (es lo más caro)
      let imgChars = 0;
      for (const c of this.cards) imgChars += (c.frontImage?.length || 0) + (c.backImage?.length || 0) + (c.occlusionImage?.length || 0);
      const mustSlim = imgChars > LS_CARDS_BUDGET * 0.7;
      const cardsJson = mustSlim ? '' : JSON.stringify(this.cards);
      const fits = !mustSlim && cardsJson.length <= LS_CARDS_BUDGET;

      lsSet(this.getDecksStorageKey(), decksJson);
      let slim = false;
      if (fits) {
        if (!lsSet(this.getCardsStorageKey(), cardsJson)) slim = true;
      } else {
        slim = true;
      }
      if (slim) {
        // Demasiado grande para localStorage: copia ligera aquí, completa en IndexedDB
        const slimJson = JSON.stringify(stripCardImages(this.cards));
        if (!lsSet(this.getCardsStorageKey(), slimJson)) {
          const bk = this.getBackupKeys();
          lsRemove(bk.cards);
          lsRemove(bk.decks);
          lsSet(this.getCardsStorageKey(), slimJson);
        }
      }
      lsSet(this.getCoreMetaKey(), JSON.stringify({ savedAt, slim }));

      // Respaldo de esta cuenta (solo si cabe; nunca a costa del guardado principal)
      const bk = this.getBackupKeys();
      if (this.decks.length > 0 && !slim) {
        lsSet(bk.decks, decksJson);
        lsSet(bk.cards, cardsJson);
      } else if (slim) {
        lsRemove(bk.cards);
        lsRemove(bk.decks);
      }
    } catch (err) {
      console.warn('Error guardando en almacenamiento:', err);
    }
    this.scheduleIdb(savedAt);
  }

  private scheduleIdb(savedAt: number): void {
    if (this.idbTimer !== null) window.clearTimeout(this.idbTimer);
    this.idbTimer = window.setTimeout(() => {
      this.idbTimer = null;
      const snap: CoreSnapshot = { decks: this.decks, cards: this.cards, savedAt };
      void idbSet(this.getIdbKey(), snap);
    }, 500);
  }

  private saveMeta(): void {
    this.saveMetaFor(this.uid(), this.meta);
  }

  /** Guarda el meta bajo el id de la cuenta que lo generó (aunque ya se haya cambiado de cuenta). */
  private saveMetaFor(uid: string, meta: SyncMeta): void {
    lsSet(`eureka_syncmeta_user_${uid}`, JSON.stringify(meta));
  }

  // --- SINCRONIZACIÓN ---

  private schedulePush(delay: number = 1400): void {
    if (this.pushTimer !== null) window.clearTimeout(this.pushTimer);
    this.pushTimer = window.setTimeout(() => {
      this.pushTimer = null;
      void this.pushDirty();
    }, delay);
  }

  /** Sube solo lo que cambió desde la última confirmación del servidor, y reintenta los borrados pendientes. */
  private async pushDirty(): Promise<void> {
    if (this.pushing) {
      this.pushAgain = true;
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    this.pushing = true;

    // La cuenta que sube queda fijada al empezar: todo lo que sigue se envía y se confirma como de ESTA cuenta,
    // aunque a mitad se cambie de cuenta (antes se enviaba con el usuario de ese instante y se mezclaban datos).
    const uid = this.uid();
    const snapDecks = this.decks;
    const snapCards = this.cards;
    const snapMeta = this.meta;
    const same = () => this.uid() === uid;
    const curDecks = () => (same() ? this.decks : snapDecks);
    const curCards = () => (same() ? this.cards : snapCards);
    const curMeta = () => (same() ? this.meta : snapMeta);

    try {
      // Antes de subir nada se comprueba que no haya datos ajenos arrastrados a esta cuenta
      if (!(await this.ensureRepaired(uid))) return;

      // 1) Borrados pendientes
      if (curMeta().delCards.length > 0) {
        const ids = curMeta().delCards.slice();
        if (await eurekaBackend.deleteCardsFromCloud(ids, uid)) {
          const done = new Set(ids);
          curMeta().delCards = curMeta().delCards.filter(id => !done.has(id));
        }
      }
      if (curMeta().delDecks.length > 0) {
        const ids = curMeta().delDecks.slice();
        if (await eurekaBackend.deleteDecksFromCloud(ids, uid)) {
          const done = new Set(ids);
          curMeta().delDecks = curMeta().delDecks.filter(id => !done.has(id));
        }
      }

      // 2) Mazos modificados (siempre antes que las tarjetas)
      const dirtyDecks = curDecks().filter(d => curMeta().decks[d.id] !== d.updatedAt);
      const sentDecks = new Map(dirtyDecks.map(d => [d.id, d.updatedAt]));
      let decksOk = true;
      if (dirtyDecks.length > 0) {
        const acked = await eurekaBackend.syncDecks(dirtyDecks, uid);
        acked.forEach(id => {
          curMeta().decks[id] = sentDecks.get(id) as number;
        });
        decksOk = acked.length === dirtyDecks.length;
      }

      // 3) Tarjetas modificadas
      if (decksOk) {
        const dirtyCards = curCards().filter(c => curMeta().cards[c.id] !== c.updatedAt);
        if (dirtyCards.length > 0) {
          const sentCards = new Map(dirtyCards.map(c => [c.id, c.updatedAt]));
          const acked = await eurekaBackend.syncCards(dirtyCards, uid);
          acked.forEach(id => {
            curMeta().cards[id] = sentCards.get(id) as number;
          });
        }
      }
      this.saveMetaFor(uid, curMeta());
    } catch (err) {
      console.warn('[EUREKA SYNC] Error subiendo cambios:', err);
    } finally {
      this.pushing = false;
      if (this.pushAgain) {
        this.pushAgain = false;
        this.schedulePush(400);
      }
    }
  }

  /**
   * Fusiona lo del servidor con lo local sin perder nada:
   *  - gana la versión más reciente de cada elemento;
   *  - lo que el servidor nunca llegó a recibir se conserva y se sube;
   *  - solo se borra localmente lo que el servidor tenía confirmado y luego dejó de tener (borrado en otro dispositivo).
   */
  private syncDone: Promise<void> = Promise.resolve();

  public syncWithCloud(): Promise<void> {
    // Si ya hay una sincronización en curso (quizá de la cuenta anterior) se encadena otra para la cuenta actual
    if (this.syncing) {
      this.syncAgain = true;
      return this.syncDone;
    }
    this.syncing = true;
    this.syncDone = (async () => {
      try {
        do {
          this.syncAgain = false;
          await this.syncOnce();
        } while (this.syncAgain);
      } finally {
        this.syncing = false;
      }
    })();
    return this.syncDone;
  }

  private async syncOnce(): Promise<void> {
    // La cuenta y la época quedan fijadas al empezar: lo que llegue de la red solo se aplica si seguimos en la misma
    const uid = this.uid();
    const epoch = this.epoch;
    try {
      if (!(await this.ensureRepaired(uid))) return;
      if (epoch !== this.epoch) return;

      const [remoteDecks, remoteCards] = await Promise.all([
        eurekaBackend.fetchDecks(uid),
        eurekaBackend.fetchCards(uid)
      ]);
      // Sin respuesta fiable no se toca nada; si se cambió de cuenta, estos datos son de otra y se descartan
      if (remoteDecks === null || remoteCards === null) return;
      if (epoch !== this.epoch) return;

      let changed = false;
      const pendingDelDecks = new Set(this.meta.delDecks);
      const pendingDelCards = new Set(this.meta.delCards);

      // Un servidor vacío con datos previamente confirmados es un servidor reiniciado: se vuelve a subir todo
      if (remoteDecks.length === 0 && remoteCards.length === 0 && (Object.keys(this.meta.decks).length > 0 || Object.keys(this.meta.cards).length > 0)) {
        this.meta.decks = {};
        this.meta.cards = {};
      }

      // Mazos
      {
        const remoteMap = new Map(remoteDecks.map(d => [d.id, d]));
        const localMap = new Map(this.decks.map(d => [d.id, d]));
        const merged: Deck[] = [];

        remoteDecks.forEach(remote => {
          if (pendingDelDecks.has(remote.id)) return;
          const local = localMap.get(remote.id);
          if (!local) {
            merged.push(remote);
            this.meta.decks[remote.id] = remote.updatedAt;
            changed = true;
          } else if ((remote.updatedAt || 0) > (local.updatedAt || 0)) {
            merged.push({ ...local, ...remote });
            this.meta.decks[remote.id] = remote.updatedAt;
            changed = true;
          } else {
            merged.push(local);
            if ((remote.updatedAt || 0) === (local.updatedAt || 0)) this.meta.decks[remote.id] = local.updatedAt;
          }
        });

        this.decks.forEach(local => {
          if (remoteMap.has(local.id)) return;
          const confirmedBefore = this.meta.decks[local.id] !== undefined;
          const editedSince = this.meta.decks[local.id] !== local.updatedAt;
          if (confirmedBefore && !editedSince) {
            // Borrado en otro dispositivo
            delete this.meta.decks[local.id];
            changed = true;
          } else {
            merged.push(local);
          }
        });

        if (changed) this.decks = merged;
      }

      // Tarjetas
      {
        let cardsChanged = false;
        const remoteMap = new Map(remoteCards.map(c => [c.id, c]));
        const localMap = new Map(this.cards.map(c => [c.id, c]));
        const merged: Flashcard[] = [];

        remoteCards.forEach(remote => {
          if (pendingDelCards.has(remote.id)) return;
          const local = localMap.get(remote.id);
          if (!local) {
            merged.push(remote);
            this.meta.cards[remote.id] = remote.updatedAt;
            cardsChanged = true;
          } else if ((remote.updatedAt || 0) > (local.updatedAt || 0)) {
            merged.push({ ...local, ...remote });
            this.meta.cards[remote.id] = remote.updatedAt;
            cardsChanged = true;
          } else {
            merged.push(local);
            if ((remote.updatedAt || 0) === (local.updatedAt || 0)) this.meta.cards[remote.id] = local.updatedAt;
          }
        });

        this.cards.forEach(local => {
          if (remoteMap.has(local.id)) return;
          const confirmedBefore = this.meta.cards[local.id] !== undefined;
          const editedSince = this.meta.cards[local.id] !== local.updatedAt;
          if (confirmedBefore && !editedSince) {
            delete this.meta.cards[local.id];
            cardsChanged = true;
          } else {
            merged.push(local);
          }
        });

        if (cardsChanged) {
          this.cards = merged;
          changed = true;
        }
      }

      this.saveMeta();
      if (changed) {
        this.invalidate();
        this.scheduleSave();
        this.listeners.forEach(fn => fn());
      }
      // Lo que solo existe aquí (creado sin conexión, por ejemplo) se sube ahora
      this.schedulePush(150);
    } catch (err) {
      console.warn('[EUREKA SYNC] Error sincronizando con la nube:', err);
    }
  }

  // --- DATOS AJENOS ---

  /** Solo se repara la cuenta activa; para cualquier otra se mira únicamente si ya estaba reparada. */
  private ensureRepaired(uid: string): Promise<boolean> {
    if (!uid || uid === 'default' || lsGet(`eureka_repair_v2_${uid}`)) return Promise.resolve(true);
    if (uid !== this.uid()) return Promise.resolve(false);
    let p = this.repairPromises.get(uid);
    if (!p) {
      p = this.repairForeignData(uid).finally(() => this.repairPromises.delete(uid));
      this.repairPromises.set(uid, p);
    }
    return p;
  }

  /**
   * Versiones anteriores copiaban a la cuenta activa los datos de OTRA cuenta (respaldo global, cambios de cuenta
   * a mitad de una sincronización). Antes de subir o fusionar nada se le pregunta al servidor cuáles de los
   * elementos aún sin confirmar son de otra cuenta; esos se APARTAN (a IndexedDB, nunca se borran) y dejan de
   * verse aquí. Devuelve false si no se pudo comprobar: en ese caso no se sube ni se borra nada todavía.
   */
  private async repairForeignData(uid: string): Promise<boolean> {
    const flag = `eureka_repair_v2_${uid}`;
    const epoch = this.epoch;
    const deckIds = this.decks.filter(d => this.meta.decks[d.id] === undefined && !DEMO_DECK_IDS.has(d.id)).map(d => d.id);
    const cardIds = this.cards.filter(c => this.meta.cards[c.id] === undefined && !DEMO_CARD_IDS.has(c.id)).map(c => c.id);
    if (deckIds.length === 0 && cardIds.length === 0) {
      lsSet(flag, '1');
      return true;
    }

    const foreign = await eurekaBackend.fetchForeignIds(uid, deckIds, cardIds);
    if (!foreign) return false;
    if (epoch !== this.epoch || uid !== this.uid()) return false;

    const fd = new Set(foreign.deckIds);
    const fc = new Set(foreign.cardIds);
    if (fd.size > 0 || fc.size > 0) {
      const removedDecks = this.decks.filter(d => fd.has(d.id));
      const removedCards = this.cards.filter(c => fc.has(c.id) || fd.has(c.deckId));
      void idbSet(`quarantine:${uid}:${Date.now()}`, { decks: removedDecks, cards: removedCards, savedAt: Date.now() } as any);
      this.decks = this.decks.filter(d => !fd.has(d.id));
      this.cards = this.cards.filter(c => !fc.has(c.id) && !fd.has(c.deckId));
      console.warn(`[EUREKA] Se apartaron ${removedDecks.length} mazos y ${removedCards.length} tarjetas que pertenecían a otra cuenta.`);
      this.invalidate();
      this.scheduleSave();
      this.fireListeners();
    }
    lsSet(flag, '1');
    return true;
  }

  /** Marca borrados para que se envíen (con reintentos) y no reaparezcan al sincronizar. */
  private queueDeletes(deckIds: string[], cardIds: string[]): void {
    if (deckIds.length) {
      const set = new Set(this.meta.delDecks);
      deckIds.forEach(id => {
        set.add(id);
        delete this.meta.decks[id];
      });
      this.meta.delDecks = Array.from(set);
    }
    if (cardIds.length) {
      const set = new Set(this.meta.delCards);
      cardIds.forEach(id => {
        set.add(id);
        delete this.meta.cards[id];
      });
      this.meta.delCards = Array.from(set);
    }
    this.saveMeta();
  }

  // --- GESTIÓN DE MAZOS Y SUBMAZOS ---

  public isFolder(deckOrId?: Deck | string | null): boolean {
    if (!deckOrId) return false;
    const deck = typeof deckOrId === 'string' ? this.getDeckById(deckOrId) : deckOrId;
    if (!deck) return false;
    if (deck.id === 'deck-mates-sub') return false;
    if (['deck-mates', 'deck-idioma', 'deck-humans', 'deck-tools'].includes(deck.id)) return true;
    if (deck.icon === 'folder' || deck.icon === 'folder-sub' || deck.icon === 'briefcase') return true;
    if (this.decks.some(d => d.parentId === deck.id && !d.isArchived)) return true;
    if (deck.isFolder !== undefined) return Boolean(deck.isFolder);
    return false;
  }

  public getAllDecks(): Deck[] {
    return this.decks.filter(d => !d.isArchived);
  }

  public getAllCards(): Flashcard[] {
    return this.cards;
  }

  public getOnlyDecks(): Deck[] {
    return this.decks.filter(d => !d.isArchived && !this.isFolder(d));
  }

  public getOnlyFolders(): Deck[] {
    return this.decks.filter(d => !d.isArchived && this.isFolder(d));
  }

  public getRootDecks(): Deck[] {
    return this.decks.filter(d => !d.parentId && !d.isArchived);
  }

  public getSubdecks(parentId: string): Deck[] {
    return this.decks.filter(d => d.parentId === parentId && !d.isArchived);
  }

  public getDeckById(deckId: string): Deck | undefined {
    return this.decks.find(d => d.id === deckId);
  }

  public getDeckHierarchyIds(deckId: string): string[] {
    const cached = this.hierarchyCache.get(deckId);
    if (cached) return cached;
    const ids = [deckId];
    const directChildren = this.getSubdecks(deckId);
    for (const child of directChildren) {
      ids.push(...this.getDeckHierarchyIds(child.id));
    }
    this.hierarchyCache.set(deckId, ids);
    return ids;
  }

  public createDeck(params: {
    name: string;
    description?: string;
    parentId?: string | null;
    color?: string;
    icon?: string;
    isFolder?: boolean;
    settings?: Partial<DeckSettings>;
  }): Deck {
    const isFolder = params.isFolder !== undefined
      ? params.isFolder
      : (params.icon === 'folder' || params.icon === 'folder-sub');

    const parent = params.parentId ? this.getDeckById(params.parentId) : undefined;
    const defaultSettings: DeckSettings = parent?.settings || {
      algorithmType: 'custom',
      learningSteps: [4, 1440, 2880, 7200, 15840, 25920, 41760, 82080, 146880, 246240, 400320, 633600],
      easyBonus: 1.35,
      hardIntervalMultiplier: 1.2,
      newCardsPerDay: 25,
      maxReviewsPerDay: 3000,
      mixCards: true,
      autoPlayAudio: false,
      ttsVoiceLang: 'es-ES'
    };

    const newDeck: Deck = {
      id: makeId('deck'),
      parentId: params.parentId || null,
      name: params.name.trim(),
      description: params.description?.trim() || '',
      icon: params.icon || (isFolder ? (params.parentId ? 'folder-sub' : 'folder') : 'deck'),
      isFolder,
      color: params.color || (isFolder ? '#38bdf8' : '#a855f7'),
      settings: { ...defaultSettings, ...params.settings },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.decks.push(newDeck);
    this.notify();
    return newDeck;
  }

  public updateDeck(deckId: string, updates: Partial<Deck>): Deck | undefined {
    const index = this.decks.findIndex(d => d.id === deckId);
    if (index === -1) return undefined;

    this.decks[index] = {
      ...this.decks[index],
      ...updates,
      updatedAt: Date.now()
    };

    this.notify();
    return this.decks[index];
  }

  public renameDeck(deckId: string, newName: string): Deck | undefined {
    return this.updateDeck(deckId, { name: newName.trim() });
  }

  public duplicateDeck(deckId: string): Deck | undefined {
    const original = this.getDeckById(deckId);
    if (!original) return undefined;

    const newDeck = this.createDeck({
      name: `${original.name} (Copia)`,
      description: original.description,
      parentId: original.parentId,
      color: original.color,
      icon: original.icon,
      settings: { ...original.settings }
    });

    const originalCards = this.getCardsByDeck(deckId, false);
    this.createCards(originalCards.map(c => ({
      deckId: newDeck.id,
      type: c.type,
      front: c.front,
      back: c.back,
      frontImage: c.frontImage,
      backImage: c.backImage,
      occlusionImage: c.occlusionImage,
      occlusionMasks: c.occlusionMasks ? [...c.occlusionMasks] : undefined,
      activeMaskId: c.activeMaskId,
      occlusionMode: c.occlusionMode,
      audioLang: c.audioLang,
      audioText: c.audioText
    })));

    return newDeck;
  }

  public resetDeckProgress(deckId: string): void {
    const ids = this.getDeckHierarchyIds(deckId);
    const now = Date.now();
    this.cards = this.cards.map(c => {
      if (ids.includes(c.deckId)) {
        return {
          ...c,
          state: 'new',
          stepIndex: 0,
          intervalMinutes: 4,
          easeFactor: 2.50,
          lapses: 0,
          reps: 0,
          dueDate: now,
          updatedAt: now
        };
      }
      return c;
    });
    this.notify();
  }

  public archiveDeck(deckId: string): void {
    this.updateDeck(deckId, { isArchived: true });
  }

  public exportDeck(deckId: string): string {
    const deck = this.getDeckById(deckId);
    const cards = this.getCardsByDeck(deckId, true);
    return JSON.stringify({ deck, cards }, null, 2);
  }

  public deleteDeck(deckId: string): void {
    const allIdsToDelete = this.getDeckHierarchyIds(deckId);
    const delSet = new Set(allIdsToDelete);
    const cardsToDelete = this.cards.filter(c => delSet.has(c.deckId)).map(c => c.id);
    const deckSet = new Set(allIdsToDelete);
    this.decks = this.decks.filter(d => !deckSet.has(d.id));
    this.cards = this.cards.filter(c => !deckSet.has(c.deckId));
    this.queueDeletes(allIdsToDelete, cardsToDelete);
    this.notify();
  }

  // --- GESTIÓN DE TARJETAS (ORDENADAS DE MÁS RECIENTE A MÁS VIEJA) ---

  public getCardsByDeck(deckId: string, includeSubdecks: boolean = true): Flashcard[] {
    const key = `${deckId}|${includeSubdecks ? 1 : 0}`;
    const cached = this.cardsCache.get(key);
    if (cached) return cached.slice();

    let list: Flashcard[];
    if (!includeSubdecks) {
      list = this.cards.filter(c => c.deckId === deckId);
    } else {
      const deckIds = new Set(this.getDeckHierarchyIds(deckId));
      list = this.cards.filter(c => deckIds.has(c.deckId));
    }
    // Ordenar de más reciente a más vieja
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    this.cardsCache.set(key, list);
    return list.slice();
  }

  /** ¿Ya existe una tarjeta con el mismo anverso en el mazo? (para avisar de duplicados al crear) */
  public findDuplicateCard(deckId: string, front: string, ignoreId?: string): Flashcard | undefined {
    const norm = (t: string) => t.toLowerCase().replace(/\s+/g, ' ').trim();
    const target = norm(front);
    if (target.length < 3) return undefined;
    return this.cards.find(c => c.deckId === deckId && c.id !== ignoreId && norm(c.front) === target);
  }

  public searchCardsInDeck(deckId: string, query: string): Flashcard[] {
    const all = this.getCardsByDeck(deckId, true);
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter(c => c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q));
  }

  /**
   * Obtiene estrictamente las tarjetas pendientes para hoy (dueDate <= Date.now()).
   * Si una tarjeta fue revisada y programada para dentro de 1 día (24h), no se mostrará hasta cumplirse dicho plazo.
   */
  public getDueCardsByDeck(deckId: string, includeSubdecks: boolean = true): Flashcard[] {
    const allCards = this.getCardsByDeck(deckId, includeSubdecks);
    const now = Date.now();
    return allCards.filter(c => c.dueDate <= now && this.isStudyable(c, now));
  }

  /** Una tarjeta pausada o pospuesta no entra en los repasos programados */
  public isStudyable(card: Flashcard, now: number = Date.now()): boolean {
    return !card.suspended && !(card.buriedUntil && card.buriedUntil > now);
  }

  public getCardById(cardId: string): Flashcard | undefined {
    return this.cards.find(c => c.id === cardId);
  }

  public getCardsByGroupId(groupId: string): Flashcard[] {
    return this.cards.filter(c => c.groupId === groupId);
  }

  private buildCard(
    params: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'state' | 'stepIndex' | 'intervalMinutes' | 'easeFactor' | 'lapses' | 'reps' | 'dueDate'>,
    now: number,
    offset = 0
  ): Flashcard {
    const deck = this.getDeckById(params.deckId);
    const steps = deck?.settings.learningSteps || [4, 1440, 2880, 7200];
    return {
      ...params,
      id: makeId('card'),
      isInverted: params.isInverted ?? false,
      state: 'new',
      stepIndex: 0,
      intervalMinutes: steps[0] || 4,
      easeFactor: 2.50,
      lapses: 0,
      reps: 0,
      dueDate: now,
      createdAt: now + offset,
      updatedAt: now + offset
    };
  }

  public createCard(
    params: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'state' | 'stepIndex' | 'intervalMinutes' | 'easeFactor' | 'lapses' | 'reps' | 'dueDate'>,
    createInvertedPair: boolean = false
  ): Flashcard {
    const now = Date.now();
    const groupId = createInvertedPair ? makeId('grp-inv') : params.groupId;

    const newCard = this.buildCard(
      { ...params, groupId, groupTitle: createInvertedPair ? 'Par Invertido' : params.groupTitle, isInverted: false },
      now
    );
    this.cards.push(newCard);

    // Si está activada la opción de Tarjetas Invertidas, crear la segunda tarjeta inversa (Reverso -> Anverso)
    if (createInvertedPair && params.type !== 'image_occlusion') {
      this.cards.push(
        this.buildCard(
          {
            ...params,
            groupId,
            groupTitle: 'Par Invertido',
            front: params.back,
            back: params.front,
            frontImage: params.backImage,
            backImage: params.frontImage,
            isInverted: true
          },
          now,
          1
        )
      );
    }

    this.notify();
    return newCard;
  }

  /** Crea muchas tarjetas de una vez con un solo guardado y un solo repintado (importaciones, copias, mapas). */
  public createCards(
    list: Array<Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'state' | 'stepIndex' | 'intervalMinutes' | 'easeFactor' | 'lapses' | 'reps' | 'dueDate'>>
  ): Flashcard[] {
    if (list.length === 0) return [];
    const now = Date.now();
    const created = list.map((p, i) => this.buildCard(p, now, i));
    this.cards.push(...created);
    this.notify();
    return created;
  }

  /**
   * Tarjetas de huecos (cloze): cada `{{c1::respuesta}}` distinto genera una tarjeta propia en la que solo
   * ese hueco está oculto. Cada tarjeta lleva su único hueco marcado como `{{c::respuesta}}`.
   */
  public createClozeCards(
    deckId: string,
    text: string,
    extra: string = '',
    chunkId?: string,
    images?: { frontImage?: string; backImage?: string; imageCredit?: string },
    onlyIndexes?: number[]
  ): Flashcard[] {
    const pattern = '\\{\\{c(\\d+)::([\\s\\S]*?)(?:::([\\s\\S]*?))?\\}\\}';
    const indexes = new Set<number>();
    const scan = new RegExp(pattern, 'g');
    let m: RegExpExecArray | null;
    while ((m = scan.exec(text)) !== null) indexes.add(Number(m[1]));
    if (indexes.size === 0) return [];

    const groupId = makeId('grp-cloze');
    const sorted = Array.from(indexes).sort((x, y) => x - y);
    const targets = onlyIndexes ? sorted.filter((i) => onlyIndexes.includes(i)) : sorted;
    const params = targets.map((idx) => {
      const front = text.replace(new RegExp(pattern, 'g'), (_all: string, n: string, ans: string, hint?: string) =>
        Number(n) === idx ? `{{c::${ans}${hint ? '::' + hint : ''}}}` : ans
      );
      return {
        deckId,
        type: 'cloze' as CardType,
        front,
        back: extra,
        chunkId,
        groupId,
        groupTitle: `Huecos (${sorted.length})`,
        frontImage: images?.frontImage,
        backImage: images?.backImage,
        imageCredit: images?.imageCredit
      };
    });
    return this.createCards(params);
  }

  /**
   * Divide un lienzo de oclusión con N máscaras en N flashcards individuales agrupadas bajo un groupId común.
   */
  public createOcclusionCards(
    deckId: string,
    imageSrc: string,
    masks: OcclusionMask[],
    mode: OcclusionMode = 'hide_all_reveal_one',
    chunkId?: string
  ): Flashcard[] {
    const created: Flashcard[] = [];
    const deck = this.getDeckById(deckId);
    const steps = deck?.settings.learningSteps || [4, 1440, 2880, 7200];
    const now = Date.now();
    const groupId = makeId('occ-grp');

    masks.forEach((mask, index) => {
      const card: Flashcard = {
        id: makeId('card-occ'),
        deckId,
        groupId,
        groupTitle: `Oclusión (${masks.length} máscaras)`,
        type: 'image_occlusion',
        front: `Identifica la estructura anatómica #${index + 1}:`,
        back: mask.label ? `**${mask.label}**` : `Estructura #${index + 1} revelada.`,
        chunkId,
        occlusionImage: imageSrc,
        occlusionMasks: masks,
        activeMaskId: mask.id,
        occlusionMode: mode,
        isInverted: false,
        state: 'new',
        stepIndex: 0,
        intervalMinutes: steps[0] || 4,
        easeFactor: 2.50,
        lapses: 0,
        reps: 0,
        dueDate: now + index * 5,
        createdAt: now + index,
        updatedAt: now + index
      };
      this.cards.push(card);
      created.push(card);
    });

    this.notify();
    return created;
  }

  /**
   * Sincroniza y actualiza un grupo de oclusión existente sin duplicar tarjetas:
   * 1. Modifica las tarjetas existentes para que tengan la nueva imagen y máscaras.
   * 2. Si se eliminaron máscaras, elimina las tarjetas sobrantes del grupo.
   * 3. Si se agregaron nuevas máscaras, crea las tarjetas faltantes para esas máscaras.
   */
  public syncOcclusionCards(
    deckId: string,
    existingCard: Flashcard,
    imageSrc: string,
    masks: OcclusionMask[],
    mode: OcclusionMode = 'hide_all_reveal_one',
    frontText?: string
  ): void {
    const deck = this.getDeckById(deckId);
    const steps = deck?.settings.learningSteps || [4, 1440, 2880, 7200];
    const now = Date.now();

    const groupId = existingCard.groupId || makeId('occ-grp');
    const groupCards = existingCard.groupId ? this.getCardsByGroupId(groupId) : [existingCard];

    // 1. Actualizar o crear tarjetas para cada máscara
    masks.forEach((mask, index) => {
      const labelText = mask.label ? `**${mask.label}**` : `Estructura #${index + 1} revelada.`;
      const front = frontText || `Identifica la estructura anatómica #${index + 1}:`;

      if (index < groupCards.length) {
        const target = groupCards[index];
        this.updateCard(target.id, {
          deckId,
          groupId,
          groupTitle: `Oclusión (${masks.length} máscaras)`,
          type: 'image_occlusion',
          front,
          back: labelText,
          occlusionImage: imageSrc,
          occlusionMasks: masks,
          activeMaskId: mask.id,
          occlusionMode: mode,
          updatedAt: now
        });
      } else {
        const newCard: Flashcard = {
          id: makeId('card-occ'),
          deckId,
          groupId,
          groupTitle: `Oclusión (${masks.length} máscaras)`,
          type: 'image_occlusion',
          front,
          back: labelText,
          occlusionImage: imageSrc,
          occlusionMasks: masks,
          activeMaskId: mask.id,
          occlusionMode: mode,
          isInverted: false,
          state: 'new',
          stepIndex: 0,
          intervalMinutes: steps[0] || 4,
          easeFactor: 2.50,
          lapses: 0,
          reps: 0,
          dueDate: now + index * 5,
          createdAt: now + index,
          updatedAt: now + index
        };
        this.cards.push(newCard);
      }
    });

    // 2. Si se eliminaron máscaras en el editor, eliminar las tarjetas sobrantes del grupo
    if (masks.length < groupCards.length) {
      const cardsToDelete = groupCards.slice(masks.length).map(c => c.id);
      const deleteSet = new Set(cardsToDelete);
      this.cards = this.cards.filter(c => !deleteSet.has(c.id));
      this.queueDeletes([], cardsToDelete);
    }

    this.notify();
  }

  public parseBatchCards(rawText: string, options?: BatchParseOptions): Array<{ front: string; back: string; type: CardType }> {
    if (!rawText || !rawText.trim()) return [];

    const results: Array<{ front: string; back: string; type: CardType }> = [];
    const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

    // 1. Extraer bloques de tarjetas según el separador entre tarjetas
    let cardBlocks: string[] = [];
    const cardSep = options?.cardSeparator;

    if (cardSep && cardSep !== 'auto') {
      if (cardSep === '\\n' || cardSep === '\n') {
        cardBlocks = text.split('\n');
      } else if (cardSep === '\\n\\n' || cardSep === '\n\n') {
        cardBlocks = text.split(/\n\s*\n+/);
      } else if (cardSep === '---') {
        cardBlocks = text.split(/(?:\n|^)\s*--+\s*(?:\n|$)/);
      } else {
        cardBlocks = text.split(cardSep);
      }
    } else {
      // Detección automática: formato Q&A por bloques o por líneas
      const isQAFormat = /(?:^|\n)(?:P|Q|Pregunta|Question|Front|Anverso)\s*:\s*/i.test(text);
      if (isQAFormat) {
        const blocks = text.split(/\n\s*\n+/);
        for (const block of blocks) {
          const qMatch = block.match(/(?:^|\n)(?:P|Q|Pregunta|Question|Front|Anverso)\s*:\s*([\s\S]*?)(?=(?:\n(?:R|A|Respuesta|Answer|Back|Reverso)\s*:\s*)|$)/i);
          const aMatch = block.match(/(?:\n|^)(?:R|A|Respuesta|Answer|Back|Reverso)\s*:\s*([\s\S]*?)$/i);

          if (qMatch && aMatch) {
            const front = qMatch[1].trim();
            const back = aMatch[1].trim();
            if (front && back) {
              const type: CardType = front.includes('$') || back.includes('$') ? 'latex' : 'standard';
              results.push({ front, back, type });
              continue;
            }
          }
        }
        if (results.length > 0) return results;
      }

      cardBlocks = text.split('\n');
    }

    // 2. Extraer Anverso (Front) y Reverso (Back) de cada bloque según el separador de lados
    const sideSep = options?.sideSeparator;
    const resolvedSideSep = sideSep === '\\t' ? '\t' : sideSep;

    for (const rawBlock of cardBlocks) {
      const block = rawBlock.trim();
      if (!block) continue;

      let front = '';
      let back = '';

      if (resolvedSideSep && resolvedSideSep !== 'auto') {
        if (block.includes(resolvedSideSep)) {
          const parts = block.split(resolvedSideSep);
          front = parts[0].trim();
          back = parts.slice(1).join(resolvedSideSep).trim();
        }
      } else {
        // Detección inteligente automática con delimitadores comunes
        if (block.includes(':::')) {
          const parts = block.split(':::');
          front = parts[0].trim();
          back = parts.slice(1).join(':::').trim();
        } else if (block.includes('\t')) {
          const parts = block.split('\t');
          front = parts[0].trim();
          back = parts.slice(1).join('\t').trim();
        } else if (block.includes(';')) {
          const parts = block.split(';');
          front = parts[0].trim();
          back = parts.slice(1).join(';').trim();
        } else if (block.includes('|')) {
          const parts = block.split('|');
          front = parts[0].trim();
          back = parts.slice(1).join('|').trim();
        } else if (block.includes(' - ')) {
          const parts = block.split(' - ');
          front = parts[0].trim();
          back = parts.slice(1).join(' - ').trim();
        } else if (block.includes(' : ')) {
          const parts = block.split(' : ');
          front = parts[0].trim();
          back = parts.slice(1).join(' : ').trim();
        }
      }

      if (front && back) {
        const type: CardType = front.includes('$') || back.includes('$') ? 'latex' : 'standard';
        results.push({ front, back, type });
      }
    }

    // 3. Fallback: Si no se detectaron tarjetas con auto, probar dividir por líneas dobles
    if (results.length === 0 && (!cardSep || cardSep === 'auto')) {
      const blocks = text.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean);
      for (const b of blocks) {
        const bLines = b.split('\n').map((l) => l.trim()).filter(Boolean);
        if (bLines.length >= 2) {
          const front = bLines[0];
          const back = bLines.slice(1).join('\n');
          const type: CardType = front.includes('$') || back.includes('$') ? 'latex' : 'standard';
          results.push({ front, back, type });
        }
      }
    }

    return results;
  }

  public importBatchCards(deckId: string, rawText: string, options?: BatchParseOptions): number {
    const cards = this.parseBatchCards(rawText, options);
    this.createCards(cards.map(card => ({ deckId, type: card.type, front: card.front, back: card.back })));
    return cards.length;
  }

  /** Importa tarjetas ya leídas (con etiqueta opcional y, si se pide, su versión inversa). */
  public importParsedCards(
    deckId: string,
    rows: Array<{ front: string; back: string }>,
    opts: { tag?: string; inverted?: boolean } = {}
  ): number {
    if (rows.length === 0) return 0;
    const tag = opts.tag ? normalizeTag(opts.tag) : '';
    const created = this.createCards(
      rows.map(r => ({
        deckId,
        type: (r.front.includes('$') || r.back.includes('$') ? 'latex' : 'standard') as CardType,
        front: r.front,
        back: r.back,
        tags: tag ? [tag] : undefined
      }))
    );
    if (opts.inverted) this.setReversible(created.map(c => c.id), true);
    return created.length;
  }

  public updateCard(cardId: string, updates: Partial<Flashcard>): Flashcard | undefined {
    const index = this.cards.findIndex(c => c.id === cardId);
    if (index === -1) return undefined;

    this.cards[index] = {
      ...this.cards[index],
      ...updates,
      updatedAt: Date.now()
    };

    this.notify();
    return this.cards[index];
  }

  public deleteCard(cardId: string): void {
    this.cards = this.cards.filter(c => c.id !== cardId);
    this.queueDeletes([], [cardId]);
    this.notify();
  }

  public deleteCardGroup(groupId: string): void {
    const cardsToDelete = this.cards.filter(c => c.groupId === groupId).map(c => c.id);
    this.cards = this.cards.filter(c => c.groupId !== groupId);
    this.queueDeletes([], cardsToDelete);
    this.notify();
  }

  /**
   * Operaciones en Lote (Batch Actions)
   * Al mover una tarjeta de Mazo X a Mazo Y:
   * 1. Preserva el dueDate pendiente intacto (ej: si faltan 5 días para verla, se mantendrá en 5 días).
   * 2. Mapea el escalón actual al nuevo mazo de destino para que el siguiente repaso ('Bien')
   *    salte al siguiente intervalo mayor de la nueva carpeta (ej: 7 días).
   */
  public moveCards(cardIds: string[], targetDeckId: string): void {
    const idSet = new Set(cardIds);
    const now = Date.now();
    const targetDeck = this.getDeckById(targetDeckId);
    const targetSteps = targetDeck?.settings?.learningSteps || [4, 1440, 2880, 7200, 15840, 25920, 41760, 82080, 146880, 246240, 400320, 633600];

    this.cards = this.cards.map(c => {
      if (idSet.has(c.id)) {
        const currentInterval = c.intervalMinutes > 0 ? c.intervalMinutes : Math.max(1, Math.round((c.dueDate - now) / 60000));
        
        let mappedIndex = 0;
        for (let i = 0; i < targetSteps.length; i++) {
          if (targetSteps[i] <= currentInterval) {
            mappedIndex = i;
          } else {
            break;
          }
        }

        return {
          ...c,
          deckId: targetDeckId,
          stepIndex: mappedIndex,
          updatedAt: now
        };
      }
      return c;
    });
    this.notify();
  }

  public deleteCards(cardIds: string[]): void {
    const idSet = new Set(cardIds);
    this.cards = this.cards.filter(c => !idSet.has(c.id));
    this.queueDeletes([], cardIds);
    this.notify();
  }

  public resetCardsProgress(cardIds: string[]): void {
    const idSet = new Set(cardIds);
    const now = Date.now();
    this.cards = this.cards.map(c => {
      if (idSet.has(c.id)) {
        return {
          ...c,
          state: 'new',
          stepIndex: 0,
          intervalMinutes: 4,
          easeFactor: 2.50,
          lapses: 0,
          reps: 0,
          dueDate: now,
          updatedAt: now
        };
      }
      return c;
    });
    this.notify();
  }

  /**
   * Revertir / Desrevertir tarjetas:
   * Para tarjetas normales invierte anverso y reverso; para tarjetas de pares invertidos conmuta o des-invierte el estado.
   */
  public toggleInvertCards(cardIds: string[]): void {
    const idSet = new Set(cardIds);
    const now = Date.now();
    this.cards = this.cards.map(c => {
      if (idSet.has(c.id)) {
        return {
          ...c,
          front: c.back,
          back: c.front,
          frontImage: c.backImage,
          backImage: c.frontImage,
          isInverted: !c.isInverted,
          updatedAt: now
        };
      }
      return c;
    });
    this.notify();
  }

  /** Cambia marcas de varias tarjetas a la vez (favorita, pausada) con un solo guardado */
  /**
   * Activa o desactiva la versión inversa (Reverso → Anverso) de varias tarjetas.
   *  - Activar: crea la tarjeta inversa de cada tarjeta normal que aún no la tenga.
   *  - Desactivar: borra las tarjetas inversas y deja la original como tarjeta normal.
   * Las tarjetas de huecos y de oclusión no tienen versión inversa y se ignoran.
   * Devuelve cuántas tarjetas se cambiaron.
   */
  public setReversible(cardIds: string[], enable: boolean): number {
    const idSet = new Set(cardIds);
    const now = Date.now();
    const selected = this.cards.filter(c => idSet.has(c.id));
    let changed = 0;

    if (enable) {
      const added: Flashcard[] = [];
      const groupFor = new Map<string, string>(); // id original -> groupId
      for (const c of selected) {
        if (c.isInverted || c.type === 'cloze' || c.type === 'image_occlusion') continue;
        const hasPair = !!c.groupId && this.cards.some(x => x.groupId === c.groupId && x.isInverted);
        if (hasPair) continue;
        const gid = c.groupId || makeId('grp-inv');
        groupFor.set(c.id, gid);
        added.push(
          this.buildCard(
            {
              deckId: c.deckId,
              type: c.type,
              front: c.back,
              back: c.front,
              frontImage: c.backImage,
              backImage: c.frontImage,
              imageCredit: c.imageCredit,
              chunkId: c.chunkId,
              tags: c.tags,
              groupId: gid,
              groupTitle: 'Par Invertido',
              isInverted: true
            },
            now,
            added.length + 1
          )
        );
      }
      if (added.length === 0) return 0;
      this.cards = this.cards.map(c => (groupFor.has(c.id) ? { ...c, groupId: groupFor.get(c.id), groupTitle: 'Par Invertido', updatedAt: now } : c));
      this.cards.push(...added);
      changed = added.length;
    } else {
      const groups = new Set<string>();
      for (const c of selected) if (c.groupId && this.cards.some(x => x.groupId === c.groupId && x.isInverted)) groups.add(c.groupId);
      if (groups.size === 0) return 0;
      const toDelete = this.cards.filter(c => c.groupId && groups.has(c.groupId) && c.isInverted).map(c => c.id);
      const delSet = new Set(toDelete);
      this.cards = this.cards
        .filter(c => !delSet.has(c.id))
        .map(c => (c.groupId && groups.has(c.groupId) ? { ...c, groupId: undefined, groupTitle: undefined, isInverted: false, updatedAt: now } : c));
      this.queueDeletes([], toDelete);
      changed = groups.size;
    }
    this.notify();
    return changed;
  }

  public setCardsFlags(cardIds: string[], flags: { starred?: boolean; suspended?: boolean; archived?: boolean }): void {
    const idSet = new Set(cardIds);
    const now = Date.now();
    this.cards = this.cards.map(c => (idSet.has(c.id) ? { ...c, ...flags, updatedAt: now } : c));
    this.notify();
  }

  /** Aplica los mismos cambios a varias tarjetas con un solo guardado */
  public patchCards(cardIds: string[], patch: Partial<Flashcard>): void {
    if (!cardIds.length) return;
    const idSet = new Set(cardIds);
    const now = Date.now();
    this.cards = this.cards.map(c => (idSet.has(c.id) ? { ...c, ...patch, updatedAt: now } : c));
    this.notify();
  }

  /** Añade o quita una etiqueta en varias tarjetas */
  public tagCards(cardIds: string[], tag: string, remove: boolean = false): void {
    const clean = normalizeTag(tag);
    if (!clean) return;
    const idSet = new Set(cardIds);
    const now = Date.now();
    this.cards = this.cards.map(c => {
      if (!idSet.has(c.id)) return c;
      const tags = (c.tags || []).filter(t => t !== clean);
      if (!remove) tags.push(clean);
      return { ...c, tags: tags.length ? tags : undefined, updatedAt: now };
    });
    this.notify();
  }

  /** Etiquetas usadas en un mazo (y sus submazos), de más a menos frecuente */
  public getDeckTags(deckId: string): Array<{ tag: string; count: number }> {
    const counts = new Map<string, number>();
    this.getCardsByDeck(deckId, true).forEach(c => (c.tags || []).forEach(t => counts.set(t, (counts.get(t) || 0) + 1)));
    return Array.from(counts, ([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }

  /** Copia tarjetas como nuevas (sin progreso) en el mismo mazo */
  public duplicateCards(cardIds: string[]): Flashcard[] {
    const now = Date.now();
    const copies: Flashcard[] = [];
    cardIds.forEach((id, i) => {
      const c = this.getCardById(id);
      if (!c) return;
      const { id: _id, createdAt: _c, updatedAt: _u, state: _s, stepIndex: _si, intervalMinutes: _im, easeFactor: _ef, lapses: _l, reps: _r, dueDate: _d, lastReviewDate: _lr, groupId: _g, groupTitle: _gt, groupRole: _gr, buriedUntil: _b, ...rest } = c;
      copies.push(this.buildCard(rest, now, i + 1));
    });
    this.cards.push(...copies);
    this.notify();
    return copies;
  }

  /** Pospone una tarjeta hasta mañana (a las 4:00) sin tocar su progreso */
  public buryCard(cardId: string): Flashcard | undefined {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    t.setHours(4, 0, 0, 0);
    return this.updateCard(cardId, { buriedUntil: t.getTime() });
  }

  public resetCardProgress(cardId: string): Flashcard | undefined {
    const card = this.getCardById(cardId);
    if (!card) return undefined;
    const now = Date.now();
    return this.updateCard(cardId, {
      state: 'new',
      stepIndex: 0,
      intervalMinutes: 4,
      easeFactor: 2.50,
      lapses: 0,
      reps: 0,
      dueDate: now,
      updatedAt: now
    });
  }

  // --- CALIFICACIÓN Y ESTADÍSTICAS SRS ---

  public reviewCard(cardId: string, rating: StudyRating): Flashcard | undefined {
    const card = this.getCardById(cardId);
    if (!card) return undefined;

    const deck = this.getDeckById(card.deckId);
    const settings = deck?.settings || {
      algorithmType: 'custom',
      learningSteps: [4, 1440, 2880, 7200, 15840, 25920, 41760, 82080, 146880, 246240, 400320, 633600],
      easyBonus: 1.35,
      hardIntervalMultiplier: 1.2,
      newCardsPerDay: 25,
      maxReviewsPerDay: 3000,
      mixCards: true,
      autoPlayAudio: false,
      ttsVoiceLang: 'es-ES'
    };

    const nextState = srsService.calculateNextState(card, rating, settings);
    studyStats.record(rating);

    // Registrar analítica de estudio en Eureka VPS
    eurekaBackend.logStudyReview({
      deckId: card.deckId,
      cardId: card.id,
      rating,
      intervalMinutes: nextState.intervalMinutes,
      easeFactor: nextState.easeFactor
    });

    return this.updateCard(cardId, {
      ...nextState,
      lastReviewDate: Date.now()
    });
  }

  public getDeckStats(deckId: string): DeckStats {
    // Las estadísticas se reutilizan hasta el próximo cambio (y como máximo 20 s, porque dependen de la hora)
    const nowTs = Date.now();
    if (nowTs - this.statsAt > 20000) {
      this.statsCache.clear();
      this.statsAt = nowTs;
    }
    const hit = this.statsCache.get(deckId);
    if (hit) return hit;

    const cards = this.getCardsByDeck(deckId, true);
    const now = nowTs;

    let newCards = 0;
    let learningCards = 0;
    let dueCards = 0;
    let masteredCards = 0;

    cards.forEach(c => {
      // Estado para la barra de progreso
      if (c.state === 'new') {
        newCards++;
      } else if (c.state === 'learning' || c.state === 'relearning') {
        learningCards++;
      } else if (c.state === 'review' || c.intervalMinutes >= 10080) {
        masteredCards++;
      }

      // Estrictamente pendientes para hoy (dueDate <= now), sin contar pausadas ni pospuestas
      if (c.dueDate <= now && this.isStudyable(c, now)) {
        dueCards++;
      }
    });

    const stats: DeckStats = {
      totalCards: cards.length,
      newCards,
      learningCards,
      dueCards,
      masteredCards
    };
    this.statsCache.set(deckId, stats);
    return stats;
  }

  /** Devuelve una tarjeta a un estado anterior (deshacer una calificación). */
  public restoreCardState(snapshot: Flashcard): Flashcard | undefined {
    return this.updateCard(snapshot.id, { ...snapshot });
  }

  public resetAllToDemo(): void {
    const demo = getInitialDemoDecks();
    this.decks = demo.decks;
    this.cards = demo.cards;
    this.notify();
  }
}

export const deckService = DeckService.getInstance();
