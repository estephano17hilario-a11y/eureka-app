import type { Flashcard, DeckSettings, StudyRating, IntervalProjection } from '../types/flashcard';

export class SrsService {
  private static instance: SrsService;

  private constructor() {}

  public static getInstance(): SrsService {
    if (!SrsService.instance) {
      SrsService.instance = new SrsService();
    }
    return SrsService.instance;
  }

  /**
   * Convierte minutos a un texto legible para el usuario (ej: 5m, 12h, 1d, 3d).
   */
  public formatInterval(minutes: number): string {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = minutes / 60;
    if (hours < 24) return `${Math.round(hours)} h`;
    const days = hours / 24;
    if (days < 30) return `${Math.round(days)} d`;
    const months = days / 30;
    if (months < 12) return `${months.toFixed(1).replace('.0', '')} m`;
    const years = days / 365;
    return `${years.toFixed(1).replace('.0', '')} a`;
  }

  /**
   * Convierte una cadena de texto (ej: "5m, 1d, 3d, 7d") a un arreglo de minutos numéricos.
   */
  public parseStepsString(stepsStr: string): number[] {
    const parts = stepsStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const steps: number[] = [];

    for (const part of parts) {
      const match = part.match(/^(\d+(?:\.\d+)?)\s*([mhdwa]?)$/);
      if (match) {
        const val = parseFloat(match[1]);
        const unit = match[2] || 'm';
        let minutes = val;
        if (unit === 'h') minutes = val * 60;
        else if (unit === 'd') minutes = val * 60 * 24;
        else if (unit === 'w') minutes = val * 60 * 24 * 7;
        else if (unit === 'a' || unit === 'y') minutes = val * 60 * 24 * 365;
        steps.push(Math.round(minutes));
      }
    }

    return steps.length > 0 ? steps : [5, 1440, 4320, 10080];
  }

  /**
   * Formatea un arreglo de minutos a cadena configurable (ej: "5m, 1d, 3d, 7d").
   */
  public formatStepsToString(steps: number[]): string {
    return steps.map(m => this.formatInterval(m).replace(' ', '')).join(', ');
  }

  /**
   * Calcula el nuevo estado de la tarjeta tras recibir una calificación de estudio.
   */
  public calculateNextState(
    card: Flashcard,
    rating: StudyRating,
    settings: DeckSettings
  ): {
    nextDueDate: number;
    intervalMinutes: number;
    stepIndex: number;
    easeFactor: number;
    state: Flashcard['state'];
    lapses: number;
    reps: number;
  } {
    const steps = settings.learningSteps && settings.learningSteps.length > 0 
      ? settings.learningSteps 
      : [5, 1440, 4320, 10080];
    
    let easeFactor = card.easeFactor || 2.50;
    let lapses = card.lapses || 0;
    let reps = (card.reps || 0) + 1;
    let stepIndex = card.stepIndex || 0;
    let intervalMinutes = card.intervalMinutes || steps[0];
    let state = card.state;
    const now = Date.now();

    switch (rating) {
      case 'again': {
        // MUY DIFÍCIL: Reinicia la tarjeta al primer paso de la escalera
        easeFactor = Math.max(1.30, easeFactor - 0.20);
        lapses += 1;
        stepIndex = 0;
        intervalMinutes = steps[0];
        state = 'relearning';
        break;
      }

      case 'hard': {
        // DIFÍCIL: Aplica menor crecimiento de intervalo
        easeFactor = Math.max(1.30, easeFactor - 0.15);
        if (state === 'new' || state === 'learning' || state === 'relearning') {
          // Si está en escalera de aprendizaje, repite el intervalo actual o añade 50%
          intervalMinutes = Math.max(steps[0], Math.round(intervalMinutes * (settings.hardIntervalMultiplier || 1.2)));
        } else {
          // Tarjeta madura
          intervalMinutes = Math.round(intervalMinutes * (settings.hardIntervalMultiplier || 1.2));
        }
        break;
      }

      case 'good': {
        // NORMAL: Sigue de forma exacta el protocolo de intervalo establecido por el usuario
        if (stepIndex < steps.length - 1) {
          stepIndex += 1;
          intervalMinutes = steps[stepIndex];
          state = 'learning';
        } else {
          // Ha superado la escalera de pasos: pasa a fase de repaso a largo plazo
          state = 'review';
          stepIndex = steps.length - 1;
          intervalMinutes = Math.round(intervalMinutes * easeFactor);
        }
        break;
      }

      case 'easy': {
        // FÁCIL: Salto acelerado de intervalo con bonificación
        easeFactor = Math.min(3.50, easeFactor + 0.15);
        if (stepIndex < steps.length - 2) {
          // Salta dos peldaños de la escalera
          stepIndex += 2;
          intervalMinutes = steps[stepIndex];
          state = 'learning';
        } else {
          state = 'review';
          stepIndex = steps.length - 1;
          const baseInterval = steps[steps.length - 1];
          intervalMinutes = Math.round(Math.max(intervalMinutes, baseInterval) * easeFactor * (settings.easyBonus || 1.35));
        }
        break;
      }
    }

    const nextDueDate = now + intervalMinutes * 60 * 1000;

    return {
      nextDueDate,
      intervalMinutes,
      stepIndex,
      easeFactor: Number(easeFactor.toFixed(2)),
      state,
      lapses,
      reps
    };
  }

  /**
   * Proyecta las 4 opciones de tiempo para mostrarlas en los botones de calificación.
   */
  public projectIntervals(card: Flashcard, settings: DeckSettings): IntervalProjection[] {
    const ratings: { rating: StudyRating; label: string }[] = [
      { rating: 'again', label: 'Muy Difícil' },
      { rating: 'hard', label: 'Difícil' },
      { rating: 'good', label: 'Normal' },
      { rating: 'easy', label: 'Fácil' }
    ];

    return ratings.map(r => {
      const nextState = this.calculateNextState(card, r.rating, settings);
      return {
        rating: r.rating,
        label: r.label,
        intervalMinutes: nextState.intervalMinutes,
        displayTime: this.formatInterval(nextState.intervalMinutes),
        nextDueDate: nextState.nextDueDate
      };
    });
  }
}

export const srsService = SrsService.getInstance();
