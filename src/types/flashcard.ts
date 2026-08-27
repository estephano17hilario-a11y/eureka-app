export type CardType = 'standard' | 'latex' | 'image_occlusion' | 'tts_audio';

export type StudyRating = 'again' | 'hard' | 'good' | 'easy';

export type CardReviewState = 'new' | 'learning' | 'review' | 'relearning';

export type AlgorithmType = 'custom' | 'fsrs' | 'quick' | 'general' | 'languages' | 'medical';

export type OcclusionMode = 'hide_all_reveal_one' | 'hide_one_reveal_one';

export interface OcclusionMask {
  id: string;
  x: number; // porcentaje 0 - 100
  y: number; // porcentaje 0 - 100
  width: number; // porcentaje 0 - 100
  height: number; // porcentaje 0 - 100
  label?: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  type: CardType;
  front: string;
  back: string;
  frontImage?: string;
  backImage?: string;
  occlusionImage?: string;
  occlusionMasks?: OcclusionMask[];
  activeMaskId?: string;
  occlusionMode?: OcclusionMode;
  audioLang?: string;
  audioText?: string;
  isInverted?: boolean; // True si es una tarjeta invertida (Reverso -> Anverso)
  
  // Agrupación de Oclusiones Múltiples y Pares Invertidos
  groupId?: string;
  groupTitle?: string;
  groupRole?: 'parent' | 'child';

  // SRS Properties
  state: CardReviewState;
  stepIndex: number;
  intervalMinutes: number;
  easeFactor: number;
  lapses: number;
  reps: number;
  dueDate: number;
  lastReviewDate?: number;
  createdAt: number;
  updatedAt: number;
}

export interface DeckSettings {
  algorithmType: AlgorithmType;
  learningSteps: number[]; // e.g. [4, 1440, 2880, 7200, 15840, 25920, 41760, 82080, 146880, 246240, 400320, 633600]
  easyBonus: number;
  hardIntervalMultiplier: number;
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  mixCards: boolean;
  autoPlayAudio: boolean;
  ttsVoiceLang: string;
  cardStyle?: {
    fontSize?: 'sm' | 'md' | 'lg';
    theme?: 'oled' | 'liquid_glass' | 'emerald_forest';
  };
}

export interface Deck {
  id: string;
  parentId?: string | null;
  name: string;
  description: string;
  icon: string;
  color: string;
  settings: DeckSettings;
  createdAt: number;
  updatedAt: number;
  isArchived?: boolean;
}

export interface DeckStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  dueCards: number;
  masteredCards: number;
}

export interface IntervalProjection {
  rating: StudyRating;
  label: string;
  intervalMinutes: number;
  displayTime: string;
  nextDueDate: number;
}
