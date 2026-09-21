import type { Deck, Flashcard, StudyRating } from '../types/flashcard';

const isBrowser = typeof window !== 'undefined';
const isVercelOrWeb = isBrowser && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.endsWith('.localhost') ||
  window.location.hostname.endsWith('.vercel.app') ||
  window.location.protocol === 'https:'
);

// En navegador (localhost o Vercel) usa la ruta relativa '' (enrutada por el proxy de Vite o Vercel rewrites)
// Esto evita bloqueos de Brave Shields, adblockers, CORS o errores de contenido mixto HTTPS/HTTP
export const API_BASE_URL = isVercelOrWeb
  ? ''
  : ((import.meta as any)?.env?.VITE_API_BASE_URL || 'http://89.117.73.97').trim().replace(/\/+$/, '');

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

  private restoreSession(): void {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
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

    // Detectar si hay una cuenta registrada activa en el VPS para conectar automáticamente este navegador
    const primary = await this.fetchPrimaryAccount();
    if (primary) {
      this.currentUser = primary;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(primary));
      this.notifyAuthListeners();
      return primary;
    }

    return this.currentUser;
  }

  public async fetchPrimaryAccount(): Promise<AuthUser | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/primary-account`).catch(() => null);
      if (!res || !res.ok) return null;
      const data = await res.json();
      if (!data?.user) return null;
      const u = data.user;
      return {
        id: u.id,
        email: u.device_id || u.email || 'user@eureka.local',
        username: u.username || 'Estudiante',
        avatarUrl: u.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${u.username || 'User'}`,
        xp: u.xp || 0,
        level: u.level || 1,
        streakDays: u.streak_days || 1,
        createdAt: u.created_at || new Date().toISOString()
      };
    } catch {
      return null;
    }
  }

  public async fetchAccounts(): Promise<AuthUser[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/accounts`).catch(() => null);
      if (!res || !res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data?.accounts)) return [];
      return data.accounts.map((u: any) => ({
        id: u.id,
        email: u.email || u.device_id || '',
        username: u.username || 'Estudiante',
        avatarUrl: u.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${u.username || 'User'}`,
        xp: u.xp || 0,
        level: u.level || 1,
        streakDays: u.streak_days || 1,
        createdAt: u.updated_at || new Date().toISOString()
      }));
    } catch {
      return [];
    }
  }

  public async fetchSyncVersion(): Promise<{ decksUpdatedAt: number; cardsUpdatedAt: number; settingsUpdatedAt: number } | null> {
    const activeUserId = this.getUserId();
    try {
      const res = await fetch(`${API_BASE_URL}/api/sync/version?userId=${encodeURIComponent(activeUserId)}`).catch(() => null);
      if (!res || !res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public selectAccount(user: AuthUser): void {
    this.currentUser = user;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
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
      // 1. Intento de registro en la API del VPS
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, username: cleanUsername })
      }).catch(() => null);

      let userId: string | null = null;
      if (res && res.ok) {
        const data = await res.json();
        userId = data?.user?.id;
      }

      if (!userId) {
        userId = 'usr_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16) + '_' + Date.now().toString(36);
      }

      const authUser: AuthUser = {
        id: userId,
        email: cleanEmail,
        username: cleanUsername,
        avatarUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${cleanUsername}`,
        xp: 0,
        level: 1,
        streakDays: 1,
        createdAt: new Date().toISOString()
      };

      // Guardar localmente de forma resiliente
      this.saveUserLocally(cleanEmail, password, authUser);
      this.currentUser = authUser;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      this.notifyAuthListeners();

      return { user: authUser };
    } catch (err: any) {
      console.warn('[EUREKA VPS BACKEND] Error en signUp, aplicando fallback local:', err);
      const fallbackId = 'usr_local_' + Date.now();
      const authUser: AuthUser = {
        id: fallbackId,
        email: cleanEmail,
        username: cleanUsername,
        avatarUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${cleanUsername}`,
        xp: 0,
        level: 1,
        streakDays: 1,
        createdAt: new Date().toISOString()
      };
      this.currentUser = authUser;
      this.saveUserLocally(cleanEmail, password, authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      this.notifyAuthListeners();
      return { user: authUser };
    }
  }

  // --- INICIO DE SESIÓN EN VPS / LOCAL ---
  public async signIn(email: string, password: string): Promise<{ user?: AuthUser; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Intento de login en API del VPS
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data?.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: cleanEmail,
            username: data.user.username || cleanEmail.split('@')[0],
            avatarUrl: data.user.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${data.user.username || 'User'}`,
            xp: data.user.xp || 0,
            level: data.user.level || 1,
            streakDays: data.user.streakDays || 1,
            createdAt: data.user.createdAt || new Date().toISOString()
          };
          this.currentUser = authUser;
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          this.saveUserLocally(cleanEmail, password, authUser);
          this.notifyAuthListeners();
          return { user: authUser };
        }
      }

      // 2. Comprobación local de credenciales guardadas
      const localUser = this.checkLocalUser(cleanEmail, password);
      if (localUser) {
        this.currentUser = localUser;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(localUser));
        this.notifyAuthListeners();
        return { user: localUser };
      }

      return { error: 'Correo o contraseña incorrectos. Si no tienes cuenta, pulsa en Registrarse.' };
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
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.currentUser?.id })
      }).catch(() => {});
    } catch {}
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.notifyAuthListeners();
  }

  // --- MODO INVITADO / OFFLINE ---
  public setGuestSession(guestName: string = 'Estudiante'): AuthUser {
    const guestId = this.getOrCreateDeviceId();
    const guestUser: AuthUser = {
      id: guestId,
      email: 'guest@eureka.local',
      username: guestName,
      avatarUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${guestName}`,
      xp: 0,
      level: 1,
      streakDays: 1,
      createdAt: new Date().toISOString()
    };
    this.currentUser = guestUser;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(guestUser));
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

      await fetch(`${API_BASE_URL}/api/decks/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId, decks: payload })
      }).catch(() => {});
    } catch (err) {
      console.warn('[EUREKA VPS BACKEND] Error syncDecks:', err);
    }
  }

  public async deleteDeckFromCloud(deckId: string): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      await fetch(`${API_BASE_URL}/api/decks/${encodeURIComponent(deckId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId })
      }).catch(() => {});
    } catch (err) {
      console.warn('[EUREKA VPS BACKEND] Error deleteDeckFromCloud:', err);
    }
  }

  public async deleteDecksFromCloud(deckIds: string[]): Promise<void> {
    const activeUserId = this.getUserId();
    if (!deckIds.length) return;
    try {
      await fetch(`${API_BASE_URL}/api/decks/batch-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId, deckIds })
      }).catch(() => {});
    } catch (err) {
      console.warn('[EUREKA VPS BACKEND] Error deleteDecksFromCloud:', err);
    }
  }

  public async fetchDecks(): Promise<Deck[] | null> {
    const activeUserId = this.getUserId();
    try {
      const res = await fetch(`${API_BASE_URL}/api/decks?userId=${encodeURIComponent(activeUserId)}`).catch(() => null);
      if (!res || !res.ok) return null;
      const data = await res.json();
      if (!Array.isArray(data)) return null;

      return data.map((d: any) => ({
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

      await fetch(`${API_BASE_URL}/api/cards/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId, cards: payload })
      }).catch(() => {});
    } catch (err) {
      console.warn('[EUREKA VPS BACKEND] Error syncCards:', err);
    }
  }

  public async deleteCardFromCloud(cardId: string): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      await fetch(`${API_BASE_URL}/api/cards/${encodeURIComponent(cardId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId })
      }).catch(() => {});
    } catch (err) {
      console.warn('[EUREKA VPS BACKEND] Error deleteCardFromCloud:', err);
    }
  }

  public async deleteCardsFromCloud(cardIds: string[]): Promise<void> {
    const activeUserId = this.getUserId();
    if (!cardIds.length) return;
    try {
      await fetch(`${API_BASE_URL}/api/cards/batch-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId, cardIds })
      }).catch(() => {});
    } catch (err) {
      console.warn('[EUREKA VPS BACKEND] Error deleteCardsFromCloud:', err);
    }
  }

  public async fetchCards(): Promise<Flashcard[] | null> {
    const activeUserId = this.getUserId();
    try {
      const res = await fetch(`${API_BASE_URL}/api/cards?userId=${encodeURIComponent(activeUserId)}`).catch(() => null);
      if (!res || !res.ok) return null;
      const data = await res.json();
      if (!Array.isArray(data)) return null;

      return data.map((c: any) => {
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
          lastReviewDate: c.last_review_date ? Number(c.last_review_date) : undefined,
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
      await fetch(`${API_BASE_URL}/api/study-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          user_id: activeUserId,
          card_id: entry.cardId,
          deck_id: entry.deckId,
          rating: entry.rating,
          review_duration_ms: entry.reviewDurationMs || 0,
          reviewed_at: entry.reviewedAt || Date.now()
        })
      }).catch(() => {});
    } catch {}
  }

  // --- AJUSTES DE USUARIO Y CONFIGURACIÓN ---
  public async saveUserSettings(settings: Record<string, any>): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      localStorage.setItem(`eureka_settings_user_${activeUserId}`, JSON.stringify(settings));
      await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId, settings, updatedAt: Date.now() })
      }).catch(() => {});
    } catch {}
  }

  public async fetchUserSettings(): Promise<Record<string, any> | null> {
    const activeUserId = this.getUserId();
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings?userId=${encodeURIComponent(activeUserId)}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data?.settings) return data.settings;
      }
      const local = localStorage.getItem(`eureka_settings_user_${activeUserId}`);
      return local ? JSON.parse(local) : null;
    } catch {
      return null;
    }
  }

  public async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      }).catch(() => {});
    } catch {}
  }
}

export const eurekaBackend = EurekaBackendService.getInstance();
