/**
 * Almacenamiento duradero.
 *
 * localStorage es síncrono y tiene ~5 MB: con fotos en las tarjetas se llena y los guardados fallan en silencio.
 * Esta capa añade una copia en IndexedDB (cientos de MB, escritura asíncrona que no bloquea la interfaz) y pide
 * al navegador que marque los datos como "persistentes" para que no los borre cuando falta espacio.
 */

const DB_NAME = 'eureka-core';
const DB_VERSION = 1;
const STORE_KV = 'kv';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_KV)) db.createObjectStore(STORE_KV);
      };
      req.onsuccess = () => {
        const db = req.result;
        // Si otra pestaña actualiza la base, esta conexión se cierra para no bloquearla
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

export async function idbGet<T = unknown>(key: string): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const req = db.transaction(STORE_KV, 'readonly').objectStore(STORE_KV).get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function idbSet(key: string, value: unknown): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_KV, 'readwrite');
      tx.objectStore(STORE_KV).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function idbDelete(key: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    db.transaction(STORE_KV, 'readwrite').objectStore(STORE_KV).delete(key);
  } catch {
    /* ignore */
  }
}

let persistRequested = false;

/** Pide al navegador que no borre los datos de la app cuando escasea el espacio. */
export function requestPersistentStorage(): void {
  if (persistRequested) return;
  persistRequested = true;
  try {
    const sm = (navigator as any).storage;
    if (sm?.persist) {
      sm.persisted?.()
        .then((already: boolean) => (already ? true : sm.persist()))
        .catch(() => {});
    }
  } catch {
    /* ignore */
  }
}

/** Escritura en localStorage que nunca lanza: devuelve si pudo guardar. */
export function lsSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function lsRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Ejecuta `fn` cuando el navegador está libre (o tras un breve retardo donde no hay requestIdleCallback). */
export function whenIdle(fn: () => void, timeout = 1500): void {
  const ric = (window as any).requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => number) | undefined;
  if (ric) ric(fn, { timeout });
  else window.setTimeout(fn, 60);
}
