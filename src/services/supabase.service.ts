import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import type { Deck, Flashcard, StudyRating } from '../types/flashcard';

const SUPABASE_URL = ((import.meta as any)?.env?.VITE_SUPABASE_URL || 'https://api.89.117.73.97.sslip.io').trim();
const SUPABASE_ANON_KEY = ((import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4Nzg0OTc2MCwiZXhwIjo0OTQzNTIzMzYwLCJyb2xlIjoiYW5vbiJ9._DvifLx6sViDd5UePak7xswzmT6dQp9FoQZqPnyxeRU').trim();

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

class EurekaSupabaseService {
  private static instance: EurekaSupabaseService;
  public client: SupabaseClient;
  private currentUser: AuthUser | null = null;
  private authListeners: Array<(user: AuthUser | null) => void> = [];

  private constructor() {
    this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 15 } }
    });

    this.restoreSession();

    // Escuchar cambios de sesión de Supabase Auth
    this.client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.syncAuthUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        localStorage.removeItem(AUTH_STORAGE_KEY);
        this.notifyAuthListeners();
      }
    });
  }

  public static getInstance(): EurekaSupabaseService {
    if (!EurekaSupabaseService.instance) {
      EurekaSupabaseService.instance = new EurekaSupabaseService();
    }
    return EurekaSupabaseService.instance;
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

  private getOrCreateDeviceId(): string {
    let id = localStorage.getItem('eureka_user_device_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem('eureka_user_device_id', id);
    }
    return id;
  }

  // --- REGISTRO DE USUARIO ---
  public async signUp(email: string, password: string, username: string): Promise<{ user?: AuthUser; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim() || cleanEmail.split('@')[0];

    try {
      // 1. Intento de registro en Supabase Auth
      const { data, error } = await this.client.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { username: cleanUsername }
        }
      });

      let userId = data?.user?.id;

      if (error) {
        console.warn('[EUREKA AUTH] Supabase Auth notice:', error.message);
        // Si hay error en Supabase auth (ej: rate limit o servidor local), crear usuario local inteligente
        userId = 'usr_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16) + '_' + Date.now().toString(36);
      }

      if (!userId) {
        userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
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

      // Guardar en tabla eureka_users
      await this.saveUserProfile({
        id: authUser.id,
        username: authUser.username,
        avatarUrl: authUser.avatarUrl,
        xp: 0,
        level: 1,
        streakDays: 1
      });

      // Guardar localmente
      this.saveUserLocally(cleanEmail, password, authUser);
      this.currentUser = authUser;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      this.notifyAuthListeners();

      return { user: authUser };
    } catch (err: any) {
      console.error('[EUREKA AUTH] Error en signUp:', err);
      // Fallback local robusto
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

  // --- INICIO DE SESIÓN ---
  public async signIn(email: string, password: string): Promise<{ user?: AuthUser; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Intento con Supabase Auth
      const { data, error } = await this.client.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (!error && data?.user) {
        const username = data.user.user_metadata?.username || cleanEmail.split('@')[0];
        const authUser: AuthUser = {
          id: data.user.id,
          email: cleanEmail,
          username,
          avatarUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${username}`,
          xp: 0,
          level: 1,
          streakDays: 1,
          createdAt: data.user.created_at
        };

        this.currentUser = authUser;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        this.saveUserLocally(cleanEmail, password, authUser);
        this.notifyAuthListeners();
        return { user: authUser };
      }

      // 2. Si falla en Supabase Auth, comprobar registro en tabla o local
      const localUser = this.checkLocalUser(cleanEmail, password);
      if (localUser) {
        this.currentUser = localUser;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(localUser));
        this.notifyAuthListeners();
        return { user: localUser };
      }

      // 3. Consultar en base de datos si existe el perfil en eureka_users
      const { data: dbUsers } = await this.client
        .from('eureka_users')
        .select('*')
        .eq('device_id', cleanEmail)
        .limit(1);

      if (dbUsers && dbUsers.length > 0) {
        const dbU = dbUsers[0];
        const authUser: AuthUser = {
          id: dbU.id,
          email: cleanEmail,
          username: dbU.username || cleanEmail.split('@')[0],
          avatarUrl: dbU.avatar_url,
          xp: dbU.xp || 0,
          level: dbU.level || 1,
          streakDays: dbU.streak_days || 1
        };
        this.currentUser = authUser;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        this.saveUserLocally(cleanEmail, password, authUser);
        this.notifyAuthListeners();
        return { user: authUser };
      }

      return { error: 'Correo o contraseña incorrectos. Si no tienes cuenta, pulsa en Registrarse.' };
    } catch (err: any) {
      console.warn('[EUREKA AUTH] Error en signIn:', err);
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
      await this.client.auth.signOut();
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

  private async syncAuthUserProfile(supabaseUser: User): Promise<void> {
    const username = supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'Estudiante';
    const authUser: AuthUser = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username,
      avatarUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${username}`,
      createdAt: supabaseUser.created_at
    };
    this.currentUser = authUser;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    this.notifyAuthListeners();
  }

  // --- SINCRONIZACIÓN DE MAZOS AISLADA POR USUARIO ---
  public async syncDecks(decks: Deck[]): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      if (!decks.length) return;
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

      const { error } = await this.client
        .from('eureka_decks')
        .upsert(payload, { onConflict: 'id' });

      if (error) console.warn('[EUREKA CLOUD] Error syncDecks:', error);
    } catch (err) {
      console.warn('[EUREKA CLOUD] Network error syncDecks:', err);
    }
  }

  public async deleteDeckFromCloud(deckId: string): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      await this.client.from('eureka_decks').delete().eq('id', deckId).eq('user_id', activeUserId);
      await this.client.from('eureka_flashcards').delete().eq('deck_id', deckId).eq('user_id', activeUserId);
    } catch (err) {
      console.warn('[EUREKA CLOUD] Error deleteDeckFromCloud:', err);
    }
  }

  public async deleteDecksFromCloud(deckIds: string[]): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      if (!deckIds.length) return;
      await this.client.from('eureka_decks').delete().in('id', deckIds).eq('user_id', activeUserId);
      await this.client.from('eureka_flashcards').delete().in('deck_id', deckIds).eq('user_id', activeUserId);
    } catch (err) {
      console.warn('[EUREKA CLOUD] Error deleteDecksFromCloud:', err);
    }
  }

  public async fetchDecks(): Promise<Deck[] | null> {
    const activeUserId = this.getUserId();
    try {
      const { data, error } = await this.client
        .from('eureka_decks')
        .select('*')
        .eq('user_id', activeUserId);

      if (error || !data) return null;

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

  // --- SINCRONIZACIÓN DE TARJETAS (FLASHCARDS) AISLADA POR USUARIO ---
  public async syncCards(cards: Flashcard[]): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      if (!cards.length) return;
      const payload = cards.map(c => {
        // Preservar chunkId en group_role si existe
        const role = c.chunkId ? `chunk:${c.chunkId}` : (c.groupRole || null);
        return {
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
          group_role: role,
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
        };
      });

      const { error } = await this.client
        .from('eureka_flashcards')
        .upsert(payload, { onConflict: 'id' });

      if (error) console.warn('[EUREKA CLOUD] Error syncCards:', error);
    } catch (err) {
      console.warn('[EUREKA CLOUD] Network error syncCards:', err);
    }
  }

  public async deleteCardFromCloud(cardId: string): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      await this.client.from('eureka_flashcards').delete().eq('id', cardId).eq('user_id', activeUserId);
    } catch (err) {
      console.warn('[EUREKA CLOUD] Error deleteCardFromCloud:', err);
    }
  }

  public async deleteCardsFromCloud(cardIds: string[]): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      if (!cardIds.length) return;
      await this.client.from('eureka_flashcards').delete().in('id', cardIds).eq('user_id', activeUserId);
    } catch (err) {
      console.warn('[EUREKA CLOUD] Error deleteCardsFromCloud:', err);
    }
  }

  public async fetchCards(): Promise<Flashcard[] | null> {
    const activeUserId = this.getUserId();
    try {
      const { data, error } = await this.client
        .from('eureka_flashcards')
        .select('*')
        .eq('user_id', activeUserId);

      if (error || !data) return null;

      return data.map((c: any) => {
        let chunkId: string | undefined = undefined;
        let groupRole: ('parent' | 'child') | undefined = undefined;
        if (c.group_role) {
          if (c.group_role.startsWith('chunk:')) {
            chunkId = c.group_role.replace('chunk:', '');
          } else if (c.group_role === 'parent' || c.group_role === 'child') {
            groupRole = c.group_role;
          }
        }

        return {
          id: c.id,
          deckId: c.deck_id,
          type: c.type,
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
          groupRole,
          chunkId,
          state: c.state,
          stepIndex: c.step_index,
          intervalMinutes: c.interval_minutes,
          easeFactor: Number(c.ease_factor),
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

  // --- LOGS DE ESTUDIO Y REPASOS ---
  public async logStudyReview(data: {
    deckId: string;
    cardId: string;
    rating: StudyRating;
    intervalMinutes: number;
    easeFactor: number;
    timeSpentMs?: number;
  }): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      await this.client.from('eureka_study_logs').insert({
        user_id: activeUserId,
        deck_id: data.deckId,
        card_id: data.cardId,
        rating: data.rating,
        interval_minutes: data.intervalMinutes,
        ease_factor: data.easeFactor,
        time_spent_ms: data.timeSpentMs || 0
      });
    } catch (err) {
      console.warn('[EUREKA CLOUD] Error logging study review:', err);
    }
  }

  // --- PERFIL DE USUARIO Y EXPERIENCIA ---
  public async saveUserProfile(profile: Partial<UserProfile>): Promise<void> {
    const activeUserId = profile.id || this.getUserId();
    try {
      await this.client.from('eureka_users').upsert({
        id: activeUserId,
        device_id: activeUserId,
        username: profile.username || 'Estudiante',
        avatar_url: profile.avatarUrl,
        xp: profile.xp || 0,
        level: profile.level || 1,
        streak_days: profile.streakDays || 0,
        last_study_date: profile.lastStudyDate || new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    } catch (err) {
      console.warn('[EUREKA CLOUD] Error saving profile:', err);
    }
  }

  public async fetchUserProfile(userId?: string): Promise<UserProfile | null> {
    const activeUserId = userId || this.getUserId();
    try {
      const { data, error } = await this.client
        .from('eureka_users')
        .select('*')
        .eq('id', activeUserId)
        .limit(1);

      if (error || !data || data.length === 0) return null;
      const u = data[0];
      return {
        id: u.id,
        username: u.username || 'Estudiante',
        avatarUrl: u.avatar_url,
        xp: u.xp || 0,
        level: u.level || 1,
        streakDays: u.streak_days || 0,
        lastStudyDate: u.last_study_date
      };
    } catch {
      return null;
    }
  }

  // --- AJUSTES Y ESTADO EN LA NUBE (ESTUDIO ACTIVO, GUÍAS FEYNMAN, MAPAS MENTALES) ---
  public async saveUserSettings(settings: {
    theme?: string;
    soundEnabled?: boolean;
    hapticsEnabled?: boolean;
    dailyReviewGoal?: number;
    settingsJson?: any;
  }): Promise<void> {
    const activeUserId = this.getUserId();
    try {
      let mergedSettingsJson = settings.settingsJson;
      if (settings.settingsJson) {
        const existing = await this.fetchUserSettings();
        if (existing?.settingsJson && typeof existing.settingsJson === 'object') {
          mergedSettingsJson = { ...existing.settingsJson, ...settings.settingsJson };
        }
      }

      const payload: any = {
        user_id: activeUserId,
        updated_at: new Date().toISOString()
      };
      if (settings.theme !== undefined) payload.theme = settings.theme;
      if (settings.soundEnabled !== undefined) payload.sound_enabled = settings.soundEnabled;
      if (settings.hapticsEnabled !== undefined) payload.haptics_enabled = settings.hapticsEnabled;
      if (settings.dailyReviewGoal !== undefined) payload.daily_review_goal = settings.dailyReviewGoal;
      if (mergedSettingsJson !== undefined) payload.settings_json = mergedSettingsJson;

      const { error } = await this.client
        .from('eureka_user_settings')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) console.warn('[EUREKA CLOUD] Error saveUserSettings:', error);
    } catch (err) {
      console.warn('[EUREKA CLOUD] Error saveUserSettings:', err);
    }
  }

  public async fetchUserSettings(): Promise<{
    theme?: string;
    soundEnabled?: boolean;
    hapticsEnabled?: boolean;
    dailyReviewGoal?: number;
    settingsJson?: any;
  } | null> {
    const activeUserId = this.getUserId();
    try {
      const { data, error } = await this.client
        .from('eureka_user_settings')
        .select('*')
        .eq('user_id', activeUserId)
        .limit(1);

      if (error || !data || data.length === 0) return null;
      const row = data[0];
      return {
        theme: row.theme,
        soundEnabled: row.sound_enabled,
        hapticsEnabled: row.haptics_enabled,
        dailyReviewGoal: row.daily_review_goal,
        settingsJson: row.settings_json
      };
    } catch {
      return null;
    }
  }
}

export const eurekaSupabase = EurekaSupabaseService.getInstance();
