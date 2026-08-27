import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Deck, Flashcard, StudyRating } from '../types/flashcard';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://api.89.117.73.97.sslip.io').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4Nzg0OTc2MCwiZXhwIjo0OTQzNTIzMzYwLCJyb2xlIjoiYW5vbiJ9._DvifLx6sViDd5UePak7xswzmT6dQp9FoQZqPnyxeRU').trim();

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
  private userId: string;

  private constructor() {
    this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 15 } }
    });
    this.userId = this.getOrCreateDeviceId();
  }

  public static getInstance(): EurekaSupabaseService {
    if (!EurekaSupabaseService.instance) {
      EurekaSupabaseService.instance = new EurekaSupabaseService();
    }
    return EurekaSupabaseService.instance;
  }

  public getUserId(): string {
    return this.userId;
  }

  private getOrCreateDeviceId(): string {
    let id = localStorage.getItem('eureka_user_device_id');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem('eureka_user_device_id', id);
    }
    return id;
  }

  // --- SINCRONIZACIÓN DE MAZOS ---
  public async syncDecks(decks: Deck[]): Promise<void> {
    try {
      if (!decks.length) return;
      const payload = decks.map(d => ({
        id: d.id,
        user_id: this.userId,
        parent_id: d.parentId || null,
        name: d.name,
        description: d.description || '',
        icon: d.icon || 'deck',
        is_folder: Boolean(d.isFolder),
        color: d.color || '#10b981',
        settings: d.settings || {},
        is_archived: Boolean(d.isArchived),
        created_at: d.createdAt,
        updated_at: d.updatedAt || Date.now()
      }));

      const { error } = await this.client
        .from('eureka_decks')
        .upsert(payload, { onConflict: 'id' });

      if (error) console.warn('[EUREKA CLOUD] Error syncDecks:', error);
    } catch (err) {
      console.warn('[EUREKA CLOUD] Network error syncDecks:', err);
    }
  }

  public async fetchDecks(): Promise<Deck[] | null> {
    try {
      const { data, error } = await this.client
        .from('eureka_decks')
        .select('*')
        .eq('user_id', this.userId);

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
        createdAt: Number(d.created_at),
        updatedAt: Number(d.updated_at)
      }));
    } catch {
      return null;
    }
  }

  // --- SINCRONIZACIÓN DE TARJETAS (FLASHCARDS) ---
  public async syncCards(cards: Flashcard[]): Promise<void> {
    try {
      if (!cards.length) return;
      const payload = cards.map(c => ({
        id: c.id,
        deck_id: c.deckId,
        user_id: this.userId,
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
        group_role: c.groupRole || null,
        state: c.state || 'new',
        step_index: c.stepIndex || 0,
        interval_minutes: c.intervalMinutes || 0,
        ease_factor: c.easeFactor || 2.5,
        lapses: c.lapses || 0,
        reps: c.reps || 0,
        due_date: c.dueDate || Date.now(),
        last_review_date: c.lastReviewDate || null,
        created_at: c.createdAt || Date.now(),
        updated_at: c.updatedAt || Date.now()
      }));

      const { error } = await this.client
        .from('eureka_flashcards')
        .upsert(payload, { onConflict: 'id' });

      if (error) console.warn('[EUREKA CLOUD] Error syncCards:', error);
    } catch (err) {
      console.warn('[EUREKA CLOUD] Network error syncCards:', err);
    }
  }

  public async fetchCards(): Promise<Flashcard[] | null> {
    try {
      const { data, error } = await this.client
        .from('eureka_flashcards')
        .select('*')
        .eq('user_id', this.userId);

      if (error || !data) return null;

      return data.map((c: any) => ({
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
        groupRole: c.group_role,
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
      }));
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
    try {
      await this.client.from('eureka_study_logs').insert({
        user_id: this.userId,
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
    try {
      await this.client.from('eureka_users').upsert({
        id: this.userId,
        device_id: this.userId,
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
}

export const eurekaSupabase = EurekaSupabaseService.getInstance();
