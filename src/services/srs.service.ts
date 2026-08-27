import type { Flashcard, StudyRating, DeckSettings, IntervalProjection } from '../types/flashcard';

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
   * Convierte minutos en texto legible estilo Noji / iPhone (ej. 4 min, 1 día, 2 días, 5 días).
   */
  public formatMinutesToHuman(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = minutes / 60;
    if (hours < 24) {
      return `${Math.round(hours)} h`;
    }
    const days = minutes / 1440;
    if (days < 30) {
      return days === 1 ? `1 día` : `${Math.round(days)} días`;
    }
    const months = minutes / 43200;
    if (months < 12) {
      return months === 1 ? `1 mes` : `${Math.round(months)} meses`;
    }
    const years = minutes / 525600;
    return years === 1 ? `1 año` : `${Number(years.toFixed(1))} años`;
  }

  /**
   * Parsea un texto (ej. "4m", "1d", "2 días", "12h") a minutos numéricos.
   */
  public parseTimeToMinutes(raw: string): number {
    const clean = raw.trim().toLowerCase();
    const num = parseFloat(clean);
    if (isNaN(num)) return 1440; // 1 día por defecto

    if (clean.includes('m') && !clean.includes('mes') && !clean.includes('min')) return Math.round(num);
    if (clean.includes('min')) return Math.round(num);
    if (clean.includes('h') || clean.includes('hora')) return Math.round(num * 60);
    if (clean.includes('d') || clean.includes('día') || clean.includes('dia')) return Math.round(num * 1440);
    if (clean.includes('mes') || clean.includes('mo')) return Math.round(num * 43200);
    if (clean.includes('a') || clean.includes('año') || clean.includes('year')) return Math.round(num * 525600);

    return Math.round(num * 1440);
  }

  /**
   * Calcula el siguiente estado SRS de una tarjeta basándose en la calificación y el algoritmo configurado.
   */
  public calculateNextState(
    card: Flashcard,
    rating: StudyRating,
    settings: DeckSettings
  ): Pick<Flashcard, 'state' | 'stepIndex' | 'intervalMinutes' | 'easeFactor' | 'lapses' | 'reps' | 'dueDate'> {
    const now = Date.now();
    const steps = settings.learningSteps && settings.learningSteps.length > 0
      ? settings.learningSteps
      : [4, 1440, 2880, 7200, 15840, 25920, 41760, 82080, 146880, 246240, 400320, 633600];

    const currentStep = card.stepIndex || 0;
    let nextStep = currentStep;
    let nextInterval = card.intervalMinutes || steps[0];
    let nextEase = card.easeFactor || 2.50;
    let lapses = card.lapses || 0;
    let reps = (card.reps || 0) + 1;
    let state = card.state;

    switch (rating) {
      case 'again': {
        // 🔴 Muy Difícil: Vuelve al paso 0 inmediatamente
        nextStep = 0;
        nextInterval = steps[0];
        nextEase = Math.max(1.30, nextEase - 0.20);
        lapses += 1;
        state = 'relearning';
        break;
      }

      case 'hard': {
        // 🟠 Difícil: Mantiene el escalón o avanza ligeramente (1.2x)
        nextInterval = Math.round(nextInterval * (settings.hardIntervalMultiplier || 1.2));
        nextEase = Math.max(1.30, nextEase - 0.15);
        state = 'learning';
        break;
      }

      case 'good': {
        // 🔵 Bien / Normal: Avanza estrictamente al siguiente escalón de la escalera de pasos
        if (currentStep < steps.length - 1) {
          nextStep = currentStep + 1;
          nextInterval = steps[nextStep];
          state = 'learning';
        } else {
          // Graduada (Mastered): Aplica factor de facilidad
          nextInterval = Math.round(nextInterval * nextEase);
          state = 'review';
        }
        break;
      }

      case 'easy': {
        // 🟢 Fácil: Salta un escalón y aplica el bono de facilidad
        if (currentStep < steps.length - 2) {
          nextStep = currentStep + 2;
          nextInterval = Math.round(steps[nextStep] * (settings.easyBonus || 1.35));
        } else {
          nextStep = steps.length - 1;
          nextInterval = Math.round(nextInterval * nextEase * (settings.easyBonus || 1.35));
        }
        nextEase = Math.min(3.50, nextEase + 0.15);
        state = 'review';
        break;
      }
    }

    const nextDueDate = now + nextInterval * 60 * 1000;

    return {
      state,
      stepIndex: nextStep,
      intervalMinutes: nextInterval,
      easeFactor: Number(nextEase.toFixed(2)),
      lapses,
      reps,
      dueDate: nextDueDate
    };
  }

  /**
   * Proyecta los 4 tiempos que se mostrarán en los botones de calificación (Muy Difícil, Difícil, Bien, Fácil).
   */
  public projectIntervals(card: Flashcard, settings: DeckSettings): IntervalProjection[] {
    const steps = settings.learningSteps && settings.learningSteps.length > 0
      ? settings.learningSteps
      : [4, 1440, 2880, 7200, 15840, 25920, 41760, 82080, 146880, 246240, 400320, 633600];

    const currentStep = card.stepIndex || 0;
    const now = Date.now();

    // 1. Again
    const againMin = steps[0];
    // 2. Hard
    const hardMin = Math.round((card.intervalMinutes || steps[0]) * (settings.hardIntervalMultiplier || 1.2));
    // 3. Good
    const goodMin = currentStep < steps.length - 1 ? steps[currentStep + 1] : Math.round((card.intervalMinutes || steps[0]) * card.easeFactor);
    // 4. Easy
    const easyMin = currentStep < steps.length - 2
      ? Math.round(steps[currentStep + 2] * (settings.easyBonus || 1.35))
      : Math.round((card.intervalMinutes || steps[0]) * card.easeFactor * (settings.easyBonus || 1.35));

    return [
      {
        rating: 'again',
        label: 'Muy Difícil',
        intervalMinutes: againMin,
        displayTime: `< ${this.formatMinutesToHuman(againMin)}`,
        nextDueDate: now + againMin * 60000
      },
      {
        rating: 'hard',
        label: 'Difícil',
        intervalMinutes: hardMin,
        displayTime: this.formatMinutesToHuman(hardMin),
        nextDueDate: now + hardMin * 60000
      },
      {
        rating: 'good',
        label: 'Bien',
        intervalMinutes: goodMin,
        displayTime: this.formatMinutesToHuman(goodMin),
        nextDueDate: now + goodMin * 60000
      },
      {
        rating: 'easy',
        label: 'Fácil',
        intervalMinutes: easyMin,
        displayTime: this.formatMinutesToHuman(easyMin),
        nextDueDate: now + easyMin * 60000
      }
    ];
  }

  public parseStepsString(stepsStr: string): number[] {
    return stepsStr
      .split(',')
      .map(s => this.parseTimeToMinutes(s))
      .filter(m => m > 0);
  }

  public formatStepsToString(steps: number[]): string {
    return steps.map(m => this.formatMinutesToHuman(m)).join(', ');
  }
}

export const srsService = SrsService.getInstance();
