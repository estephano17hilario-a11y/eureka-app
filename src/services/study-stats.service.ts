import type { Flashcard, StudyRating } from '../types/flashcard';
import { eurekaBackend } from './backend.service';

/**
 * Registro diario de estudio (por cuenta, en este dispositivo): cuántas tarjetas se repasaron, cómo se
 * calificaron y cuánto tiempo se dedicó. Alimenta la racha, el mapa de actividad y las estadísticas del mazo.
 */

export interface DayLog {
  /** Repasos */
  n: number;
  /** De nuevo / Difícil / Bien / Fácil */
  a: number;
  h: number;
  g: number;
  e: number;
  /** Milisegundos de estudio */
  ms: number;
}

const emptyDay = (): DayLog => ({ n: 0, a: 0, h: 0, g: 0, e: 0, ms: 0 });
const KEEP_DAYS = 420;

export function dayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

class StudyStatsService {
  private cacheUid = '';
  private days: Record<string, DayLog> = {};

  private key(uid: string): string {
    return `eureka_study_days_${uid}`;
  }

  private load(): Record<string, DayLog> {
    const uid = eurekaBackend.getUserId();
    if (uid !== this.cacheUid) {
      this.cacheUid = uid;
      try {
        this.days = JSON.parse(localStorage.getItem(this.key(uid)) || '{}') || {};
      } catch {
        this.days = {};
      }
    }
    return this.days;
  }

  private save(): void {
    const keys = Object.keys(this.days).sort();
    if (keys.length > KEEP_DAYS) keys.slice(0, keys.length - KEEP_DAYS).forEach((k) => delete this.days[k]);
    try {
      localStorage.setItem(this.key(this.cacheUid), JSON.stringify(this.days));
    } catch {
      /* sin espacio: las estadísticas no deben romper el estudio */
    }
  }

  public record(rating: StudyRating): void {
    const days = this.load();
    const k = dayKey();
    const d = (days[k] ||= emptyDay());
    d.n++;
    if (rating === 'again') d.a++;
    else if (rating === 'hard') d.h++;
    else if (rating === 'good') d.g++;
    else d.e++;
    this.save();
  }

  /** Deshace un registro (cuando se deshace una calificación) */
  public unrecord(rating: StudyRating): void {
    const d = this.load()[dayKey()];
    if (!d || d.n <= 0) return;
    d.n--;
    const f = rating === 'again' ? 'a' : rating === 'hard' ? 'h' : rating === 'good' ? 'g' : 'e';
    d[f] = Math.max(0, d[f] - 1);
    this.save();
  }

  public addTime(ms: number): void {
    if (!(ms > 0)) return;
    const days = this.load();
    const d = (days[dayKey()] ||= emptyDay());
    // Un despiste con la app abierta no cuenta como una hora de estudio
    d.ms += Math.min(ms, 5 * 60 * 1000);
    this.save();
  }

  public today(): DayLog {
    return this.load()[dayKey()] || emptyDay();
  }

  /** Últimos `n` días, del más antiguo al más reciente */
  public lastDays(n: number): Array<{ key: string; date: Date; log: DayLog }> {
    const days = this.load();
    const out: Array<{ key: string; date: Date; log: DayLog }> = [];
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date(base.getTime() - i * 86400000);
      const key = dayKey(date);
      out.push({ key, date, log: days[key] || emptyDay() });
    }
    return out;
  }

  /** Racha actual (hoy o ayer cuentan como "viva") y mejor racha registrada */
  public streak(): { current: number; best: number } {
    const days = this.load();
    const has = (d: Date) => (days[dayKey(d)]?.n || 0) > 0;
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    if (!has(cursor)) cursor.setTime(cursor.getTime() - 86400000);
    let current = 0;
    while (has(cursor)) {
      current++;
      cursor.setTime(cursor.getTime() - 86400000);
    }
    let best = 0;
    let run = 0;
    let prev = 0;
    for (const k of Object.keys(days).sort()) {
      if (!days[k].n) continue;
      const t = new Date(`${k}T12:00:00`).getTime();
      run = prev && Math.round((t - prev) / 86400000) === 1 ? run + 1 : 1;
      best = Math.max(best, run);
      prev = t;
    }
    return { current, best: Math.max(best, current) };
  }

  public totals(): { reviews: number; ms: number; days: number; accuracy: number } {
    const days = Object.values(this.load());
    const reviews = days.reduce((s, d) => s + d.n, 0);
    const ok = days.reduce((s, d) => s + d.g + d.e, 0);
    return {
      reviews,
      ms: days.reduce((s, d) => s + d.ms, 0),
      days: days.filter((d) => d.n > 0).length,
      accuracy: reviews ? Math.round((ok / reviews) * 100) : 0
    };
  }

  /** Tarjetas que vencen cada día durante los próximos `days` días (el día 0 incluye las atrasadas) */
  public forecast(cards: Flashcard[], days: number): number[] {
    const out = new Array<number>(days).fill(0);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const t0 = start.getTime();
    for (const c of cards) {
      if (c.suspended) continue;
      const due = Math.max(c.dueDate, c.buriedUntil || 0);
      const idx = Math.max(0, Math.floor((due - t0) / 86400000));
      if (idx < days) out[idx]++;
    }
    return out;
  }
}

export const studyStats = new StudyStatsService();

export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} h ${m % 60} min`;
}
