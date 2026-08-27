import type { Deck, Flashcard, DeckStats, StudyRating, DeckSettings, CardType, OcclusionMask, OcclusionMode } from '../types/flashcard';
import { getInitialDemoDecks } from './demo-data';
import { srsService } from './srs.service';

const DECKS_STORAGE_KEY = 'eureka_flashcards_decks_v3';
const CARDS_STORAGE_KEY = 'eureka_flashcards_cards_v3';

export class DeckService {
  private static instance: DeckService;
  private decks: Deck[] = [];
  private cards: Flashcard[] = [];
  private listeners: Array<() => void> = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): DeckService {
    if (!DeckService.instance) {
      DeckService.instance = new DeckService();
    }
    return DeckService.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.saveToStorage();
    this.listeners.forEach(fn => fn());
  }

  private loadFromStorage(): void {
    try {
      const storedDecks = localStorage.getItem(DECKS_STORAGE_KEY);
      const storedCards = localStorage.getItem(CARDS_STORAGE_KEY);

      if (storedDecks && storedCards) {
        this.decks = JSON.parse(storedDecks);
        this.cards = JSON.parse(storedCards);
      } else {
        const demo = getInitialDemoDecks();
        this.decks = demo.decks;
        this.cards = demo.cards;
        this.saveToStorage();
      }
    } catch {
      const demo = getInitialDemoDecks();
      this.decks = demo.decks;
      this.cards = demo.cards;
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(this.decks));
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(this.cards));
    } catch (err) {
      console.warn('Error guardando en almacenamiento:', err);
    }
  }

  // --- GESTIÓN DE MAZOS Y SUBMAZOS ---

  public getAllDecks(): Deck[] {
    return this.decks.filter(d => !d.isArchived);
  }

  public getRootDecks(): Deck[] {
    return this.decks.filter(d => !d.parentId && !d.isArchived);
  }

  public getSubdecks(parentId: string): Deck[] {
    return this.decks.filter(d => d.parentId === parentId && !d.isArchived);
  }

  public getDeckById(deckId: string): Deck | undefined {
    return this.decks.find(d => d.id === deckId);
  }

  public getDeckHierarchyIds(deckId: string): string[] {
    const ids = [deckId];
    const directChildren = this.getSubdecks(deckId);
    for (const child of directChildren) {
      ids.push(...this.getDeckHierarchyIds(child.id));
    }
    return ids;
  }

  public createDeck(params: {
    name: string;
    description?: string;
    parentId?: string | null;
    color?: string;
    icon?: string;
    settings?: Partial<DeckSettings>;
  }): Deck {
    const parent = params.parentId ? this.getDeckById(params.parentId) : undefined;
    const defaultSettings: DeckSettings = parent?.settings || {
      algorithmType: 'custom',
      learningSteps: [4, 1440, 2880, 7200, 15840, 25920, 41760, 82080, 146880, 246240, 400320, 633600],
      easyBonus: 1.35,
      hardIntervalMultiplier: 1.2,
      newCardsPerDay: 25,
      maxReviewsPerDay: 3000,
      mixCards: true,
      autoPlayAudio: false,
      ttsVoiceLang: 'es-ES'
    };

    const newDeck: Deck = {
      id: `deck-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      parentId: params.parentId || null,
      name: params.name.trim(),
      description: params.description?.trim() || '',
      icon: params.icon || (params.parentId ? 'folder-sub' : 'folder'),
      color: params.color || (params.parentId ? '#84cc16' : '#50b5ff'),
      settings: { ...defaultSettings, ...params.settings },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.decks.push(newDeck);
    this.notify();
    return newDeck;
  }

  public updateDeck(deckId: string, updates: Partial<Deck>): Deck | undefined {
    const index = this.decks.findIndex(d => d.id === deckId);
    if (index === -1) return undefined;

    this.decks[index] = {
      ...this.decks[index],
      ...updates,
      updatedAt: Date.now()
    };

    this.notify();
    return this.decks[index];
  }

  public renameDeck(deckId: string, newName: string): Deck | undefined {
    return this.updateDeck(deckId, { name: newName.trim() });
  }

  public duplicateDeck(deckId: string): Deck | undefined {
    const original = this.getDeckById(deckId);
    if (!original) return undefined;

    const newDeck = this.createDeck({
      name: `${original.name} (Copia)`,
      description: original.description,
      parentId: original.parentId,
      color: original.color,
      icon: original.icon,
      settings: { ...original.settings }
    });

    const originalCards = this.getCardsByDeck(deckId, false);
    originalCards.forEach(c => {
      this.createCard({
        deckId: newDeck.id,
        type: c.type,
        front: c.front,
        back: c.back,
        frontImage: c.frontImage,
        backImage: c.backImage,
        occlusionImage: c.occlusionImage,
        occlusionMasks: c.occlusionMasks ? [...c.occlusionMasks] : undefined,
        activeMaskId: c.activeMaskId,
        occlusionMode: c.occlusionMode,
        audioLang: c.audioLang,
        audioText: c.audioText
      });
    });

    return newDeck;
  }

  public resetDeckProgress(deckId: string): void {
    const ids = this.getDeckHierarchyIds(deckId);
    const now = Date.now();
    this.cards = this.cards.map(c => {
      if (ids.includes(c.deckId)) {
        return {
          ...c,
          state: 'new',
          stepIndex: 0,
          intervalMinutes: 4,
          easeFactor: 2.50,
          lapses: 0,
          reps: 0,
          dueDate: now,
          updatedAt: now
        };
      }
      return c;
    });
    this.notify();
  }

  public archiveDeck(deckId: string): void {
    this.updateDeck(deckId, { isArchived: true });
  }

  public exportDeck(deckId: string): string {
    const deck = this.getDeckById(deckId);
    const cards = this.getCardsByDeck(deckId, true);
    return JSON.stringify({ deck, cards }, null, 2);
  }

  public deleteDeck(deckId: string): void {
    const allIdsToDelete = this.getDeckHierarchyIds(deckId);
    this.decks = this.decks.filter(d => !allIdsToDelete.includes(d.id));
    this.cards = this.cards.filter(c => !allIdsToDelete.includes(c.deckId));
    this.notify();
  }

  // --- GESTIÓN DE TARJETAS ---

  public getCardsByDeck(deckId: string, includeSubdecks: boolean = true): Flashcard[] {
    if (!includeSubdecks) {
      return this.cards.filter(c => c.deckId === deckId);
    }
    const deckIds = this.getDeckHierarchyIds(deckId);
    return this.cards.filter(c => deckIds.includes(c.deckId));
  }

  public searchCardsInDeck(deckId: string, query: string): Flashcard[] {
    const all = this.getCardsByDeck(deckId, true);
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter(c => c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q));
  }

  public getDueCardsByDeck(deckId: string, includeSubdecks: boolean = true): Flashcard[] {
    const allCards = this.getCardsByDeck(deckId, includeSubdecks);
    const now = Date.now();
    return allCards.filter(c => c.dueDate <= now || c.state === 'new');
  }

  public getCardById(cardId: string): Flashcard | undefined {
    return this.cards.find(c => c.id === cardId);
  }

  public createCard(
    params: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'state' | 'stepIndex' | 'intervalMinutes' | 'easeFactor' | 'lapses' | 'reps' | 'dueDate'>,
    createInvertedPair: boolean = false
  ): Flashcard {
    const deck = this.getDeckById(params.deckId);
    const steps = deck?.settings.learningSteps || [4, 1440, 2880, 7200];
    const now = Date.now();

    const newCard: Flashcard = {
      ...params,
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      isInverted: false,
      state: 'new',
      stepIndex: 0,
      intervalMinutes: steps[0] || 4,
      easeFactor: 2.50,
      lapses: 0,
      reps: 0,
      dueDate: now,
      createdAt: now,
      updatedAt: now
    };

    this.cards.push(newCard);

    // Si está activada la opción de Tarjetas Invertidas, crear automáticamente la tarjeta inversa (Reverso -> Anverso)
    if (createInvertedPair && params.type !== 'image_occlusion') {
      const invertedCard: Flashcard = {
        ...params,
        id: `card-${Date.now()}-inv-${Math.random().toString(36).substr(2, 4)}`,
        front: params.back,
        back: params.front,
        isInverted: true,
        state: 'new',
        stepIndex: 0,
        intervalMinutes: steps[0] || 4,
        easeFactor: 2.50,
        lapses: 0,
        reps: 0,
        dueDate: now,
        createdAt: now + 1,
        updatedAt: now + 1
      };
      this.cards.push(invertedCard);
    }

    this.notify();
    return newCard;
  }

  /**
   * Divide un lienzo de oclusión con N máscaras en N flashcards individuales e inteligentes.
   */
  public createOcclusionCards(
    deckId: string,
    imageSrc: string,
    masks: OcclusionMask[],
    mode: OcclusionMode = 'hide_all_reveal_one'
  ): Flashcard[] {
    const created: Flashcard[] = [];
    const deck = this.getDeckById(deckId);
    const steps = deck?.settings.learningSteps || [4, 1440, 2880, 7200];
    const now = Date.now();

    masks.forEach((mask, index) => {
      const card: Flashcard = {
        id: `card-occ-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        deckId,
        type: 'image_occlusion',
        front: `Identifica la estructura anatómica #${index + 1}:`,
        back: mask.label ? `**${mask.label}**` : `Estructura #${index + 1} revelada.`,
        occlusionImage: imageSrc,
        occlusionMasks: masks,
        activeMaskId: mask.id,
        occlusionMode: mode,
        isInverted: false,
        state: 'new',
        stepIndex: 0,
        intervalMinutes: steps[0] || 4,
        easeFactor: 2.50,
        lapses: 0,
        reps: 0,
        dueDate: now + index * 5,
        createdAt: now + index,
        updatedAt: now + index
      };
      this.cards.push(card);
      created.push(card);
    });

    this.notify();
    return created;
  }

  public importBatchCards(deckId: string, rawText: string): number {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    let count = 0;

    for (const line of lines) {
      let parts: string[] = [];
      if (line.includes(';')) parts = line.split(';');
      else if (line.includes('\t')) parts = line.split('\t');
      else if (line.includes(':::')) parts = line.split(':::');
      else if (line.includes('|')) parts = line.split('|');

      if (parts.length >= 2) {
        const front = parts[0].trim();
        const back = parts.slice(1).join(';').trim();
        const type: CardType = front.includes('$') || back.includes('$') ? 'latex' : 'standard';

        this.createCard({
          deckId,
          type,
          front,
          back
        });
        count++;
      }
    }

    return count;
  }

  public updateCard(cardId: string, updates: Partial<Flashcard>): Flashcard | undefined {
    const index = this.cards.findIndex(c => c.id === cardId);
    if (index === -1) return undefined;

    this.cards[index] = {
      ...this.cards[index],
      ...updates,
      updatedAt: Date.now()
    };

    this.notify();
    return this.cards[index];
  }

  public deleteCard(cardId: string): void {
    this.cards = this.cards.filter(c => c.id !== cardId);
    this.notify();
  }

  // --- CALIFICACIÓN Y ESTADÍSTICAS SRS ---

  public reviewCard(cardId: string, rating: StudyRating): Flashcard | undefined {
    const card = this.getCardById(cardId);
    if (!card) return undefined;

    const deck = this.getDeckById(card.deckId);
    const settings = deck?.settings || {
      algorithmType: 'custom',
      learningSteps: [4, 1440, 2880, 7200],
      easyBonus: 1.35,
      hardIntervalMultiplier: 1.2,
      newCardsPerDay: 25,
      maxReviewsPerDay: 3000,
      mixCards: true,
      autoPlayAudio: false,
      ttsVoiceLang: 'es-ES'
    };

    const nextState = srsService.calculateNextState(card, rating, settings);

    return this.updateCard(cardId, {
      ...nextState,
      lastReviewDate: Date.now()
    });
  }

  public getDeckStats(deckId: string): DeckStats {
    const cards = this.getCardsByDeck(deckId, true);
    const now = Date.now();

    let newCards = 0;
    let learningCards = 0;
    let dueCards = 0;
    let masteredCards = 0;

    cards.forEach(c => {
      if (c.state === 'new') {
        newCards++;
      } else if (c.state === 'learning' || c.state === 'relearning') {
        learningCards++;
      } else if (c.intervalMinutes >= 10080) {
        masteredCards++;
      }

      if (c.dueDate <= now || c.state === 'new') {
        dueCards++;
      }
    });

    return {
      totalCards: cards.length,
      newCards,
      learningCards,
      dueCards,
      masteredCards
    };
  }

  public resetAllToDemo(): void {
    const demo = getInitialDemoDecks();
    this.decks = demo.decks;
    this.cards = demo.cards;
    this.notify();
  }
}

export const deckService = DeckService.getInstance();
