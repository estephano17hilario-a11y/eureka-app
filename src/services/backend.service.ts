import type { Deck, Flashcard, StudyRating } from '../types/flashcard';
import { Preferences } from '@capacitor/preferences';

export const REMOTE_VPS_URL = ((import.meta as any)?.env?.VITE_API_BASE_URL || 'http://89.117.73.97').trim().replace(/\/+$/, '');
export const API_BASE_URL = REMOTE_VPS_URL;

const AUTH_STORAGE_KEY = 'eureka_auth_session_v1';
const LOCAL_USERS_KEY = 'eureka_local_registered_users_v1';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  xp?: number;
  level?: number;
  streakDays?: number;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  streakDays: number;
  lastStudyDate?: string;
}

/**
 * Helper de fetch resiliente con timeout y fallback automático.
 * Intenta primero la URL directa del VPS (con CORS habilitado),
 * y si estamos en web con proxy relativo, hace fallback seguro.
 */
async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 8000
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const urlsToTry: string[] = [
    `${REMOTE_VPS_URL}${cleanEndpoint}`
  ];

  // Si estamos en navegador y no estamos en la app nativa, añadir la ruta relativa como fallback
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const relativeUrl = `${cleanEndpoint}`;
    if (!urlsToTry.includes(relativeUrl)) {
      urlsToTry.push(relativeUrl);
    }
  }

  let lastError: string = 'No se pudo conectar con el servidor central de Eureka (89.117.73.97). Verifica tu conexión a internet.';
  let lastStatus = 0;

  for (const url of urlsToTry) {
    let timeoutId: any = null;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });

      if (timeoutId) clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type') || '';

      // Si la respuesta es JSON (formato de nuestra API de backend)
      if (contentType.includes('application/json')) {
        const json = await res.json().catch(() => null);
        if (res.ok) {
          return { ok: true, status: res.status, data: json as T };
        } else {
          return {
            ok: false,
            status: res.status,
            data: json,
            error: json?.error || json?.message || `Error del servidor (${res.status})`
          };
        }
      }

      // Si recibimos HTML o un status no-OK (ej. 404 de Vite preview), continuamos con el siguiente intento
      lastStatus = res.status;
      lastError = `Respuesta no esperada del servidor (${res.status})`;
    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        lastError = 'Tiempo de espera agotado al conectar con el servidor.';
      } else {
        lastError = err?.message || 'Error de conexión de red.';
      }
    }
  }

  return { ok: false, status: lastStatus, error: lastError };
}

/**
 * EurekaBackendService
 * Gestiona la autenticación, sincronización con el servidor VPS propio y persistencia universal por cuenta.
 */
class EurekaBackendService {
  private static instance: EurekaBackendService;
  private currentUser: AuthUser | null = null;
  private authListeners: Array<(user: AuthUser | null) => void> = [];

  private constructor() {
    this.restoreSession();
  }

  public static getInstance(): EurekaBackendService {
    if (!EurekaBackendService.instance) {
      EurekaBackendService.instance = new EurekaBackendService();
    }
    return EurekaBackendService.instance;
  }

  private async restoreSession(): Promise<void> {
    try {
      let stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored && typeof Preferences !== 'undefined') {
        const pref = await Preferences.get({ key: AUTH_STORAGE_KEY }).catch(() => ({ value: null }));
        if (pref.value) stored = pref.value;
      }
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch {
      this.currentUser = null;
    }
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public getUserId(): string {
    return this.currentUser?.id || this.getOrCreateDeviceId();
  }

  public onAuthChange(callback: (user: AuthUser | null) => void): () => void {
    this.authListeners.push(callback);
    return () => {
      this.authListeners = this.authListeners.filter((fn) => fn !== callback);
    };
  }

  private notifyAuthListeners(): void {
    this.authListeners.forEach((fn) => fn(this.currentUser));
  }

  public async ensureActiveAccount(): Promise<AuthUser | null> {
    // Si el usuario ya está conectado a una cuenta real registrada (no guest)
    if (this.currentUser && !this.currentUser.id.startsWith('guest_') && this.currentUser.id !== 'default') {
      return this.currentUser;
    }

    // Detectar si hay una cuenta registrada activa en el VPS para conectar automáticamente este dispositivo
    const primary = await this.fetchPrimaryAccount();
    if (primary) {
      this.currentUser = primary;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(primary));
      if (typeof Preferences !== 'undefined') {
        Preferences.set({ key: AUTH_STORAGE_KEY, value: JSON.stringify(primary) }).catch(() => {});
      }
      this.notifyAuthListeners();
      return primary;
    }

    return this.currentUser;
  }

  public async fetchPrimaryAccount(): Promise<AuthUser | null> {
    try {
      const res = await apiFetch<{ user?: any }>('/api/auth/primary-account');
      if (!res.ok || !res.data?.user) return null;
      const u = res.data.user;
      return {
        id: u.id,
        email: u.device_id || u.email || 'user@eureka.local',
        username: u.username || 'Estudiante',
        avatarUrl: u.avatar_url || u.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(u.username || 'User')}`,
        xp: u.xp || 0,
        level: u.level || 1,
        streakDays: u.streak_days || u.streakDays || 1,
        createdAt: u.created_at || u.createdAt || new Date().toISOString()
      };
    } catch {
      return null;
    }
  }

  public async fetchAccounts(): Promise<AuthUser[]> {
    try {
      const res = await apiFetch<{ accounts?: any[] }>('/api/auth/accounts');
      if (!res.ok || !Array.isArray(res.data?.accounts)) return [];
      return res.data.accounts.map((u: any) => ({
        id: u.id,
        email: u.email || u.device_id || '',
        username: u.username || 'Estudiante',
        avatarUrl: u.avatar_url || u.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(u.username || 'User')}`,
        xp: u.xp || 0,
        level: u.level || 1,
        streakDays: u.streak_days || u.streakDays || 1,
        createdAt: u.updated_at || u.created_at || new Date().toISOString()
      }));
    } catch {
      return [];
    }
  }

  public async fetchSyncVersion(): Promise<{ decksUpdatedAt: number; cardsUpdatedAt: number; settingsUpdatedAt: number } | null> {
    const activeUserId = this.getUserId();
    try {
      const res = await apiFetch<{ decksUpdatedAt: number; cardsUpdatedAt: number; settingsUpdatedAt: number }>(
        `/api/sync/version?userId=${encodeURIComponent(activeUserId)}`
      );
      if (!res.ok || !res.data) return null;
      return res.data;
    } catch {
      return null;
    }
  }

  public selectAccount(user: AuthUser): void {
    this.currentUser = user;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    if (typeof Preferences !== 'undefined') {
      Preferences.set({ key: AUTH_STORAGE_KEY, value: JSON.stringify(user) }).catch(() => {});
    }
    this.notifyAuthListeners();
  }

  private getOrCreateDeviceId(): string {
    let id = localStorage.getItem('eureka_user_device_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem('eureka_user_device_id', id);
    }
    return id;
  }

  // --- REGISTRO DE USUARIO EN VPS / LOCAL ---
  public async signUp(email: string, password: string, username: string): Promise<{ user?: AuthUser; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim() || cleanEmail.split('@')[0];

    try {
      const res = await apiFetch<{ user?: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password, username: cleanUsername })
      });

      if (res.ok && res.data?.user) {
        const u = res.data.user;
        const authUser: AuthUser = {
          id: u.id,
          email: u.device_id || u.email || cleanEmail,
          username: u.username || cleanUsername,
          avatarUrl: u.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(cleanUsername)}`,
          xp: u.xp || 0,
          level: u.level || 1,
          streakDays: u.streak_days || 1,
          createdAt: u.created_at || new Date().toISOString()
        };

        this.saveUserLocally(cleanEmail, password, authUser);
        this.currentUser = authUser;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        if (typeof Preferences !== 'undefined') {
          await Preferences.set({ key: AUTH_STORAGE_KEY, value: JSON.stringify(authUser) }).catch(() => {});
        }
        this.notifyAuthListeners();
        return { user: authUser };
      }

      return { error: res.error || 'No se pudo registrar la cuenta en el servidor central.' };
    } catch (err: any) {
      console.warn('[EUREKA VPS BACKEND] Error en signUp:', err);
      return { error: err?.message || 'Error de conexión con el servidor.' };
    }
  }

  // --- INICIO DE SESIÓN EN VPS / LOCAL ---
  public async signIn(email: string, password: string): Promise<{ user?: AuthUser; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await apiFetch<{ user?: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password })
      });

      if (res.ok && res.data?.user) {
        const u = res.data.user;
        const authUser: AuthUser = {
          id: u.id,
          email: u.device_id || u.email || cleanEmail,
          username: u.username || cleanEmail.split('@')[0],
          avatarUrl: u.avatar_url || u.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(u.username || 'User')}`,
          xp: u.xp || 0,
          level: u.level || 1,
          streakDays: u.streak_days || u.streakDays || 1,
          createdAt: u.created_at || u.createdAt || new Date().toISOString()
        };
        this.currentUser = authUser;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        if (typeof Preferences !== 'undefined') {
          await Preferences.set({ key: AUTH_STORAGE_KEY, value: JSON.stringify(authUser) }).catch(() => {});
        }
        this.saveUserLocally(cleanEmail, password, authUser);
        this.notifyAuthListeners();
        return { user: authUser };
      }

      // Comprobación local de credenciales guardadas si no hubo conexión con el servidor
      const localUser = this.checkLocalUser(cleanEmail, password);
      if (localUser) {
        this.currentUser = localUser;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(localUser));
        if (typeof Preferences !== 'undefined') {
          await Preferences.set({ key: AUTH_STORAGE_KEY, value: JSON.stringify(localUser) }).catch(() => {});
        }
        this.notifyAuthListeners();
        return { user: localUser };
      }

      return { error: res.error || 'Usuario o contraseña incorrectos. Si no tienes cuenta, pulsa en Crear Cuenta.' };
    } catch (err: any) {
      console.warn('[EUREKA VPS BACKEND] Error en signIn:', err);
      const localUser = this.checkLocalUser(cleanEmail, password);
      if (localUser) {
        this.currentUser = localUser;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(localUser));
        this.notifyAuthListeners();
        return { user: localUser };
      }
      return { error: 'No se pudo iniciar sesión. Verifica tus credenciales.' };
    }
  }

  // --- CERRAR SESIÓN ---
  public async signOut(): Promise<void> {
    try {
      if (this.currentUser?.id) {
        await apiFetch('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ userId: this.currentUser.id })
        }).catch(() => {});
      }
    } catch {}
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    if (typeof Preferences !== 'undefined') {
      Preferences.remove({ key: AUTH_STORAGE_KEY }).catch(() => {});
    }
    this.notifyAuthListeners();
  }

  // --- MODO INVITADO / OFFLINE ---
  public setGuestSession(guestName: string = 'Estudiante'): AuthUser {
    const guestId = this.getOrCreateDeviceId();
    const guestUser: AuthUser = {
      id: guestId,
      email: 'guest@eureka.local',
      username: guestName,
      avatarUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(guestName)}`,
      xp: 0,
      level: 1,
      streakDays: 1,
      createdAt: new Date().toISOString()
    };
    this.currentUser = guestUser;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(guestUser));
    if (typeof Preferences !== 'undefined') {
      Preferences.set({ key: AUTH_STORAGE_KEY, value: JSON.stringify(guestUser) }).catch(() => {});
    }
    this.notifyAuthListeners();
    return guestUser;
  }

  private saveUserLocally(email: string, passwordHash: string, user: AuthUser): void {
    try {
      const all = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}');
      all[email] = { password: passwordHash, user };
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(all));
    } catch {}
  }

  private checkLocalUser(email: string, passwordHash: string): AuthUser | null {
    try {
      const all = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}');
      if (all[email] && all[email].password === passwordHash) {
        return all[email].user;
      }
    } catch {}
    return null;
  }

  // --- SINCRONIZACIÓN DE MAZOS CON EL VPS ---
  public async syncDecks(decks: Deck[]): Promise<void> {
    const activeUserId = this.getUserId();
    if (!decks.length) return;
    try {
      const payload = decks.map(d => ({
        id: d.id,
        user_id: activeUserId,
        parent_id: d.parentId || null,
        name: d.name,
        description: d.description || '',
        icon: d.icon || 'deck',
        is_folder: Boolean(d.isFolder),
        color: d.color || '#10b981',
        settings: d.settings || {},
        is_archived: Boolean(d.isArchived),
        created_at: Number(d.createdAt) || Date.now(),
        updated_at: Number(d.updatedAt) || Date.now()
      }));

      await apiFetch('/api/decks/sync', {
        method: 'POST',
        body: JSON.stringify({ userId: activeUserId, decks: payload })
      });
    } catch (err) {
      console.warn('[EUREKA VPS BACKEND] Error syncDecks:', err);
    }
  }

  public async deleteDeckFromCloud(deckId: string): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      await apiFetch(`/api/decks/${encodeURIComponent(deckId)}`, {
        method: 'DELETE',
        body: JSON.stringify({ userId: activeUserId })
      });
    } catch (err) {
      console.warn('[EUREKA VPS BACKEND] Error deleteDeckFromCloud:', err);
    }
  }

  public async deleteDecksFromCloud(deckIds: string[]): Promise<void> {
    const activeUserId = this.getUserId();
    if (!deckIds.length) return;
    try {
      await apiFetch('/api/decks/batch-delete', {
        method: 'POST',
        body: JSON.stringify({ userId: activeUserId, deckIds })
      });
    } catch (err) {
      console.warn('[EUREKA VPS BACKEND] Error deleteDecksFromCloud:', err);
    }
  }

  public async fetchDecks(): Promise<Deck[] | null> {
    const activeUserId = this.getUserId();
    try {
      const res = await apiFetch<any[]>(`/api/decks?userId=${encodeURIComponent(activeUserId)}`);
      if (!res.ok || !Array.isArray(res.data)) return null;

      return res.data.map((d: any) => ({
        id: d.id,
        parentId: d.parent_id,
        name: d.name,
        description: d.description,
        icon: d.icon,
        isFolder: d.is_folder,
        color: d.color,
        settings: d.settings,
        isArchived: d.is_archived,
        createdAt: Number(d.created_at) || Date.now(),
        updatedAt: Number(d.updated_at) || Date.now()
      }));
    } catch {
      return null;
    }
  }

  // --- SINCRONIZACIÓN DE TARJETAS (FLASHCARDS) CON EL VPS ---
  public async syncCards(cards: Flashcard[]): Promise<void> {
    const activeUserId = this.getUserId();
    if (!cards.length) return;
    try {
      const payload = cards.map(c => ({
        id: c.id,
        deck_id: c.deckId,
        user_id: activeUserId,
        type: c.type || 'standard',
        front: c.front,
        back: c.back,
        front_image: c.frontImage || null,
        back_image: c.backImage || null,
        occlusion_image: c.occlusionImage || null,
        occlusion_masks: c.occlusionMasks || null,
        active_mask_id: c.activeMaskId || null,
        occlusion_mode: c.occlusionMode || null,
        audio_lang: c.audioLang || null,
        audio_text: c.audioText || null,
        is_inverted: Boolean(c.isInverted),
        group_id: c.groupId || null,
        group_title: c.groupTitle || null,
        group_role: c.chunkId ? `chunk:${c.chunkId}` : (c.groupRole || null),
        state: c.state || 'new',
        step_index: c.stepIndex || 0,
        interval_minutes: c.intervalMinutes || 0,
        ease_factor: c.easeFactor || 2.5,
        lapses: c.lapses || 0,
        reps: c.reps || 0,
        due_date: Number(c.dueDate) || Date.now(),
        last_review_date: c.lastReviewDate ? Number(c.lastReviewDate) : null,
        created_at: Number(c.createdAt) || Date.now(),
        updated_at: Number(c.updatedAt) || Date.now()
      }));

      await apiFetch('/api/cards/sync', {
        method: 'POST',
        body: JSON.stringify({ userId: activeUserId, cards: payload })
      });
    } catch (err) {
      console.warn('[EUREKA VPS BACKEND] Error syncCards:', err);
    }
  }

  public async deleteCardFromCloud(cardId: string): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      await apiFetch(`/api/cards/${encodeURIComponent(cardId)}`, {
        method: 'DELETE',
        body: JSON.stringify({ userId: activeUserId })
      });
    } catch (err) {
      console.warn('[EUREKA VPS BACKEND] Error deleteCardFromCloud:', err);
    }
  }

  public async deleteCardsFromCloud(cardIds: string[]): Promise<void> {
    const activeUserId = this.getUserId();
    if (!cardIds.length) return;
    try {
      await apiFetch('/api/cards/batch-delete', {
        method: 'POST',
        body: JSON.stringify({ userId: activeUserId, cardIds })
      });
    } catch (err) {
      console.warn('[EUREKA VPS BACKEND] Error deleteCardsFromCloud:', err);
    }
  }

  public async fetchCards(): Promise<Flashcard[] | null> {
    const activeUserId = this.getUserId();
    try {
      const res = await apiFetch<any[]>(`/api/cards?userId=${encodeURIComponent(activeUserId)}`);
      if (!res.ok || !Array.isArray(res.data)) return null;

      return res.data.map((c: any) => {
        let chunkId: string | undefined = undefined;
        let role: 'parent' | 'child' | undefined = undefined;
        if (c.group_role && c.group_role.startsWith('chunk:')) {
          chunkId = c.group_role.replace('chunk:', '');
        } else if (c.group_role === 'parent' || c.group_role === 'child') {
          role = c.group_role;
        }

        return {
          id: c.id,
          deckId: c.deck_id,
          type: c.type || 'standard',
          front: c.front,
          back: c.back,
          frontImage: c.front_image,
          backImage: c.back_image,
          occlusionImage: c.occlusion_image,
          occlusionMasks: c.occlusion_masks,
          activeMaskId: c.active_mask_id,
          occlusionMode: c.occlusion_mode,
          audioLang: c.audio_lang,
          audioText: c.audio_text,
          isInverted: c.is_inverted,
          groupId: c.group_id,
          groupTitle: c.group_title,
          groupRole: role,
          chunkId,
          state: c.state,
          stepIndex: c.step_index,
          intervalMinutes: c.interval_minutes,
          easeFactor: c.ease_factor,
          lapses: c.lapses,
          reps: c.reps,
          dueDate: Number(c.due_date),
          lastReviewDate: c.lastReviewDate ? Number(c.lastReviewDate) : undefined,
          createdAt: Number(c.created_at),
          updatedAt: Number(c.updated_at)
        };
      });
    } catch {
      return null;
    }
  }

  // --- REGISTRO DE REPASOS (STUDY LOGS) ---
  public async logStudyReview(entry: {
    cardId: string;
    deckId: string;
    rating: StudyRating;
    reviewDurationMs?: number;
    reviewedAt?: number;
    intervalMinutes?: number;
    easeFactor?: number;
    [key: string]: any;
  }): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      await apiFetch('/api/study-logs', {
        method: 'POST',
        body: JSON.stringify({
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          user_id: activeUserId,
          card_id: entry.cardId,
          deck_id: entry.deckId,
          rating: entry.rating,
          review_duration_ms: entry.reviewDurationMs || 0,
          reviewed_at: entry.reviewedAt || Date.now()
        })
      });
    } catch {}
  }

  // --- AJUSTES DE USUARIO Y CONFIGURACIÓN ---
  public async saveUserSettings(settings: Record<string, any>): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      localStorage.setItem(`eureka_settings_user_${activeUserId}`, JSON.stringify(settings));
      await apiFetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ userId: activeUserId, settings, updatedAt: Date.now() })
      });
    } catch {}
  }

  public async fetchUserSettings(): Promise<Record<string, any> | null> {
    const activeUserId = this.getUserId();
    try {
      const res = await apiFetch<{ settings?: Record<string, any> }>(`/api/settings?userId=${encodeURIComponent(activeUserId)}`);
      if (res.ok && res.data?.settings) {
        return res.data.settings;
      }
      const local = localStorage.getItem(`eureka_settings_user_${activeUserId}`);
      return local ? JSON.parse(local) : null;
    } catch {
      return null;
    }
  }

  public async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await apiFetch('/api/profile', {
        method: 'POST',
        body: JSON.stringify(profile)
      });
    } catch {}
  }
}

export const eurekaBackend = EurekaBackendService.getInstance();
