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
        // 🔴 Muy Difícil / De nuevo: Vuelve al paso 0 inmediatamente
        nextStep = 0;
        nextInterval = steps[0];
        nextEase = Math.max(1.30, nextEase - 0.20);
        lapses += 1;
        state = 'relearning';
        break;
      }

      case 'hard': {
        // 🟠 Difícil: Debe ser SIEMPRE un intervalo menor que 'Bien' y mayor o igual que 'De nuevo'
        const isLearningPhase = currentStep < steps.length - 1 && state !== 'review';
        if (isLearningPhase) {
          const againStep = steps[0];
          const goodStep = steps[currentStep + 1];
          if (currentStep === 0) {
            // Entre Again y Good: promedio estricto asegurando < goodStep
            const avg = Math.round((againStep + goodStep) / 2);
            nextInterval = Math.max(againStep, Math.min(avg, Math.max(againStep, goodStep - 1)));
          } else {
            // Repetir el paso de aprendizaje actual
            const currentStepVal = steps[currentStep];
            nextInterval = Math.max(againStep, Math.min(currentStepVal, Math.max(againStep, goodStep - 1)));
          }
          nextStep = currentStep;
          state = 'learning';
        } else {
          // Fase de repaso (review)
          const base = card.intervalMinutes || steps[steps.length - 1];
          const hardMultiplier = settings.hardIntervalMultiplier || 1.2;
          const calculatedHard = Math.round(base * hardMultiplier);
          const goodInterval = Math.round(base * nextEase);
          nextInterval = Math.max(steps[0], Math.min(calculatedHard, Math.max(steps[0], goodInterval - 1)));
          state = 'review';
        }
        nextEase = Math.max(1.30, nextEase - 0.15);
        break;
      }

      case 'good': {
        // 🔵 Bien / Normal: Avanza estrictamente al siguiente escalón de la escalera de pasos
        const isLearningPhase = currentStep < steps.length - 1 && state !== 'review';
        if (isLearningPhase) {
          nextStep = currentStep + 1;
          nextInterval = steps[nextStep];
          state = 'learning';
        } else {
          // Graduada (Mastered): Aplica factor de facilidad
          const base = card.intervalMinutes || steps[steps.length - 1];
          nextInterval = Math.round(base * nextEase);
          state = 'review';
        }
        break;
      }

      case 'easy': {
        // 🟢 Fácil: Salta un escalón y aplica el bono de facilidad
        const isLearningPhase = currentStep < steps.length - 2 && state !== 'review';
        if (isLearningPhase) {
          nextStep = currentStep + 2;
          nextInterval = Math.round(steps[nextStep] * (settings.easyBonus || 1.35));
        } else {
          nextStep = steps.length - 1;
          const base = card.intervalMinutes || steps[steps.length - 1];
          nextInterval = Math.round(base * nextEase * (settings.easyBonus || 1.35));
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
   * Proyecta los 4 tiempos que se mostrarán en los botones de calificación (De nuevo, Difícil, Bien, Fácil).
   */
  public projectIntervals(card: Flashcard, settings: DeckSettings): IntervalProjection[] {
    const steps = settings.learningSteps && settings.learningSteps.length > 0
      ? settings.learningSteps
      : [4, 1440, 2880, 7200, 15840, 25920, 41760, 82080, 146880, 246240, 400320, 633600];

    const currentStep = card.stepIndex || 0;
    const now = Date.now();
    const isLearning = currentStep < steps.length - 1 && card.state !== 'review';

    // 1. Again (De nuevo)
    const againMin = steps[0];

    // 2. Good (Bien)
    const goodMin = isLearning
      ? steps[currentStep + 1]
      : Math.round((card.intervalMinutes || steps[steps.length - 1]) * card.easeFactor);

    // 3. Hard (Difícil): estrictamente againMin <= hardMin < goodMin
    let hardMin: number;
    if (isLearning) {
      if (currentStep === 0) {
        const avg = Math.round((againMin + goodMin) / 2);
        hardMin = Math.max(againMin, Math.min(avg, Math.max(againMin, goodMin - 1)));
      } else {
        const currentStepVal = steps[currentStep];
        hardMin = Math.max(againMin, Math.min(currentStepVal, Math.max(againMin, goodMin - 1)));
      }
    } else {
      const base = card.intervalMinutes || steps[steps.length - 1];
      const hardMultiplier = settings.hardIntervalMultiplier || 1.2;
      const hardCalculated = Math.round(base * hardMultiplier);
      hardMin = Math.max(againMin, Math.min(hardCalculated, Math.max(againMin, goodMin - 1)));
    }

    // 4. Easy (Fácil): estrictamente easyMin > goodMin
    let easyMin: number;
    if (isLearning) {
      if (currentStep < steps.length - 2) {
        easyMin = Math.round(steps[currentStep + 2] * (settings.easyBonus || 1.35));
      } else {
        const base = card.intervalMinutes || steps[steps.length - 1];
        easyMin = Math.round(base * card.easeFactor * (settings.easyBonus || 1.35));
      }
    } else {
      const base = card.intervalMinutes || steps[steps.length - 1];
      easyMin = Math.round(base * card.easeFactor * (settings.easyBonus || 1.35));
    }
    if (easyMin <= goodMin) {
      easyMin = goodMin + Math.max(1, Math.round(goodMin * 0.25));
    }

    return [
      {
        rating: 'again',
        label: 'De nuevo',
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
