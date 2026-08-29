import type { Deck, Flashcard, DeckStats, StudyRating, DeckSettings, CardType, OcclusionMask, OcclusionMode } from '../types/flashcard';
import { getInitialDemoDecks } from './demo-data';
import { srsService } from './srs.service';
import { eurekaSupabase } from './supabase.service';

export class DeckService {
  private static instance: DeckService;
  private currentUserId: string = '';
  private decks: Deck[] = [];
  private cards: Flashcard[] = [];
  private listeners: Array<() => void> = [];

  private constructor() {
    this.currentUserId = eurekaSupabase.getUserId();
    this.loadFromStorage();
    this.syncWithCloud();
  }

  public static getInstance(): DeckService {
    if (!DeckService.instance) {
      DeckService.instance = new DeckService();
    }
    return DeckService.instance;
  }

  public async setUser(userId: string): Promise<void> {
    this.currentUserId = userId;
    this.loadFromStorage();
    await this.syncWithCloud();
    this.notify();
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

  private getDecksStorageKey(): string {
    return `eureka_decks_user_${this.currentUserId || 'default'}`;
  }

  private getCardsStorageKey(): string {
    return `eureka_cards_user_${this.currentUserId || 'default'}`;
  }

  private loadFromStorage(): void {
    try {
      const storedDecks = localStorage.getItem(this.getDecksStorageKey());
      const storedCards = localStorage.getItem(this.getCardsStorageKey());

      if (storedDecks && storedCards) {
        this.decks = JSON.parse(storedDecks);
        this.cards = JSON.parse(storedCards);

        // Normalizar carpetas y mazos
        this.decks.forEach(d => {
          if (d.id === 'deck-mates-sub') {
            d.isFolder = false;
            d.icon = 'deck';
          } else if (d.id === 'deck-mates' || d.id === 'deck-idioma') {
            d.isFolder = true;
            d.icon = 'folder';
          } else if (d.isFolder === undefined) {
            d.isFolder = (d.icon === 'folder' || d.icon === 'folder-sub' || d.icon === 'briefcase');
          }
        });
      } else {
        // Si no hay datos para este usuario, inicializar con plantilla limpia
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
      localStorage.setItem(this.getDecksStorageKey(), JSON.stringify(this.decks));
      localStorage.setItem(this.getCardsStorageKey(), JSON.stringify(this.cards));
      
      // Sincronización instantánea a la base de datos de Eureka para este usuario
      eurekaSupabase.syncDecks(this.decks);
      eurekaSupabase.syncCards(this.cards);
    } catch (err) {
      console.warn('Error guardando en almacenamiento:', err);
    }
  }

  public async syncWithCloud(): Promise<void> {
    try {
      const [remoteDecks, remoteCards] = await Promise.all([
        eurekaSupabase.fetchDecks(),
        eurekaSupabase.fetchCards()
      ]);

      if (remoteDecks && remoteDecks.length > 0) {
        this.decks = remoteDecks;
        if (remoteCards && remoteCards.length > 0) {
          this.cards = remoteCards;
        } else {
          this.cards = [];
        }
        localStorage.setItem(this.getDecksStorageKey(), JSON.stringify(this.decks));
        localStorage.setItem(this.getCardsStorageKey(), JSON.stringify(this.cards));
        this.listeners.forEach(fn => fn());
      } else if (this.decks.length > 0) {
        // Subida inicial a la base de datos de Eureka para este usuario
        await Promise.all([
          eurekaSupabase.syncDecks(this.decks),
          eurekaSupabase.syncCards(this.cards)
        ]);
      }
    } catch (err) {
      console.warn('[EUREKA SYNC] Error sincronizando con la nube:', err);
    }
  }

  // --- GESTIÓN DE MAZOS Y SUBMAZOS ---

  public isFolder(deckOrId?: Deck | string | null): boolean {
    if (!deckOrId) return false;
    const deck = typeof deckOrId === 'string' ? this.getDeckById(deckOrId) : deckOrId;
    if (!deck) return false;
    if (deck.isFolder !== undefined) return deck.isFolder;
    return deck.icon === 'folder' || deck.icon === 'folder-sub' || deck.icon === 'briefcase';
  }

  public getAllDecks(): Deck[] {
    return this.decks.filter(d => !d.isArchived);
  }

  public getOnlyDecks(): Deck[] {
    return this.decks.filter(d => !d.isArchived && !this.isFolder(d));
  }

  public getOnlyFolders(): Deck[] {
    return this.decks.filter(d => !d.isArchived && this.isFolder(d));
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
    isFolder?: boolean;
    settings?: Partial<DeckSettings>;
  }): Deck {
    const isFolder = params.isFolder !== undefined
      ? params.isFolder
      : (params.icon === 'folder' || params.icon === 'folder-sub');

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
      icon: params.icon || (isFolder ? (params.parentId ? 'folder-sub' : 'folder') : 'deck'),
      isFolder,
      color: params.color || (isFolder ? '#38bdf8' : '#a855f7'),
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

  // --- GESTIÓN DE TARJETAS (ORDENADAS DE MÁS RECIENTE A MÁS VIEJA) ---

  public getCardsByDeck(deckId: string, includeSubdecks: boolean = true): Flashcard[] {
    let list: Flashcard[];
    if (!includeSubdecks) {
      list = this.cards.filter(c => c.deckId === deckId);
    } else {
      const deckIds = this.getDeckHierarchyIds(deckId);
      list = this.cards.filter(c => deckIds.includes(c.deckId));
    }
    // Ordenar de más reciente a más vieja
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  public searchCardsInDeck(deckId: string, query: string): Flashcard[] {
    const all = this.getCardsByDeck(deckId, true);
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter(c => c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q));
  }

  /**
   * Obtiene estrictamente las tarjetas pendientes para hoy (dueDate <= Date.now()).
   * Si una tarjeta fue revisada y programada para dentro de 1 día (24h), no se mostrará hasta cumplirse dicho plazo.
   */
  public getDueCardsByDeck(deckId: string, includeSubdecks: boolean = true): Flashcard[] {
    const allCards = this.getCardsByDeck(deckId, includeSubdecks);
    const now = Date.now();
    return allCards.filter(c => c.dueDate <= now);
  }

  public getCardById(cardId: string): Flashcard | undefined {
    return this.cards.find(c => c.id === cardId);
  }

  public getCardsByGroupId(groupId: string): Flashcard[] {
    return this.cards.filter(c => c.groupId === groupId);
  }

  public createCard(
    params: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'state' | 'stepIndex' | 'intervalMinutes' | 'easeFactor' | 'lapses' | 'reps' | 'dueDate'>,
    createInvertedPair: boolean = false
  ): Flashcard {
    const deck = this.getDeckById(params.deckId);
    const steps = deck?.settings.learningSteps || [4, 1440, 2880, 7200];
    const now = Date.now();
    const groupId = createInvertedPair ? `grp-inv-${now}-${Math.random().toString(36).substr(2, 4)}` : params.groupId;

    const newCard: Flashcard = {
      ...params,
      id: `card-${now}-${Math.random().toString(36).substr(2, 4)}`,
      groupId,
      groupTitle: createInvertedPair ? 'Par Invertido' : params.groupTitle,
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

    // Si está activada la opción de Tarjetas Invertidas, crear la segunda tarjeta inversa (Reverso -> Anverso)
    if (createInvertedPair && params.type !== 'image_occlusion') {
      const invertedCard: Flashcard = {
        ...params,
        id: `card-${now}-inv-${Math.random().toString(36).substr(2, 4)}`,
        groupId,
        groupTitle: 'Par Invertido',
        front: params.back,
        back: params.front,
        frontImage: params.backImage,
        backImage: params.frontImage,
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
   * Divide un lienzo de oclusión con N máscaras en N flashcards individuales agrupadas bajo un groupId común.
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
    const groupId = `occ-grp-${now}-${Math.random().toString(36).substr(2, 4)}`;

    masks.forEach((mask, index) => {
      const card: Flashcard = {
        id: `card-occ-${now}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        deckId,
        groupId,
        groupTitle: `Oclusión (${masks.length} máscaras)`,
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

  /**
   * Sincroniza y actualiza un grupo de oclusión existente sin duplicar tarjetas:
   * 1. Modifica las tarjetas existentes para que tengan la nueva imagen y máscaras.
   * 2. Si se eliminaron máscaras, elimina las tarjetas sobrantes del grupo.
   * 3. Si se agregaron nuevas máscaras, crea las tarjetas faltantes para esas máscaras.
   */
  public syncOcclusionCards(
    deckId: string,
    existingCard: Flashcard,
    imageSrc: string,
    masks: OcclusionMask[],
    mode: OcclusionMode = 'hide_all_reveal_one',
    frontText?: string
  ): void {
    const deck = this.getDeckById(deckId);
    const steps = deck?.settings.learningSteps || [4, 1440, 2880, 7200];
    const now = Date.now();

    const groupId = existingCard.groupId || `occ-grp-${now}-${Math.random().toString(36).substr(2, 4)}`;
    const groupCards = existingCard.groupId ? this.getCardsByGroupId(groupId) : [existingCard];

    // 1. Actualizar o crear tarjetas para cada máscara
    masks.forEach((mask, index) => {
      const labelText = mask.label ? `**${mask.label}**` : `Estructura #${index + 1} revelada.`;
      const front = frontText || `Identifica la estructura anatómica #${index + 1}:`;

      if (index < groupCards.length) {
        const target = groupCards[index];
        this.updateCard(target.id, {
          deckId,
          groupId,
          groupTitle: `Oclusión (${masks.length} máscaras)`,
          type: 'image_occlusion',
          front,
          back: labelText,
          occlusionImage: imageSrc,
          occlusionMasks: masks,
          activeMaskId: mask.id,
          occlusionMode: mode,
          updatedAt: now
        });
      } else {
        const newCard: Flashcard = {
          id: `card-occ-${now}-${index}-${Math.random().toString(36).substr(2, 4)}`,
          deckId,
          groupId,
          groupTitle: `Oclusión (${masks.length} máscaras)`,
          type: 'image_occlusion',
          front,
          back: labelText,
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
        this.cards.push(newCard);
      }
    });

    // 2. Si se eliminaron máscaras en el editor, eliminar las tarjetas sobrantes del grupo
    if (masks.length < groupCards.length) {
      const cardsToDelete = groupCards.slice(masks.length).map(c => c.id);
      const deleteSet = new Set(cardsToDelete);
      this.cards = this.cards.filter(c => !deleteSet.has(c.id));
    }

    this.notify();
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

  public deleteCardGroup(groupId: string): void {
    this.cards = this.cards.filter(c => c.groupId !== groupId);
    this.notify();
  }

  /**
   * Operaciones en Lote (Batch Actions)
   * Al mover una tarjeta de Mazo X a Mazo Y:
   * 1. Preserva el dueDate pendiente intacto (ej: si faltan 5 días para verla, se mantendrá en 5 días).
   * 2. Mapea el escalón actual al nuevo mazo de destino para que el siguiente repaso ('Bien')
   *    salte al siguiente intervalo mayor de la nueva carpeta (ej: 7 días).
   */
  public moveCards(cardIds: string[], targetDeckId: string): void {
    const idSet = new Set(cardIds);
    const now = Date.now();
    const targetDeck = this.getDeckById(targetDeckId);
    const targetSteps = targetDeck?.settings?.learningSteps || [4, 1440, 2880, 7200, 15840, 25920, 41760, 82080, 146880, 246240, 400320, 633600];

    this.cards = this.cards.map(c => {
      if (idSet.has(c.id)) {
        const currentInterval = c.intervalMinutes > 0 ? c.intervalMinutes : Math.max(1, Math.round((c.dueDate - now) / 60000));
        
        let mappedIndex = 0;
        for (let i = 0; i < targetSteps.length; i++) {
          if (targetSteps[i] <= currentInterval) {
            mappedIndex = i;
          } else {
            break;
          }
        }

        return {
          ...c,
          deckId: targetDeckId,
          stepIndex: mappedIndex,
          updatedAt: now
        };
      }
      return c;
    });
    this.notify();
  }

  public deleteCards(cardIds: string[]): void {
    const idSet = new Set(cardIds);
    this.cards = this.cards.filter(c => !idSet.has(c.id));
    this.notify();
  }

  public resetCardsProgress(cardIds: string[]): void {
    const idSet = new Set(cardIds);
    const now = Date.now();
    this.cards = this.cards.map(c => {
      if (idSet.has(c.id)) {
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

  /**
   * Revertir / Desrevertir tarjetas:
   * Para tarjetas normales invierte anverso y reverso; para tarjetas de pares invertidos conmuta o des-invierte el estado.
   */
  public toggleInvertCards(cardIds: string[]): void {
    const idSet = new Set(cardIds);
    const now = Date.now();
    this.cards = this.cards.map(c => {
      if (idSet.has(c.id)) {
        return {
          ...c,
          front: c.back,
          back: c.front,
          frontImage: c.backImage,
          backImage: c.frontImage,
          isInverted: !c.isInverted,
          updatedAt: now
        };
      }
      return c;
    });
    this.notify();
  }

  public resetCardProgress(cardId: string): Flashcard | undefined {
    const card = this.getCardById(cardId);
    if (!card) return undefined;
    const now = Date.now();
    return this.updateCard(cardId, {
      state: 'new',
      stepIndex: 0,
      intervalMinutes: 4,
      easeFactor: 2.50,
      lapses: 0,
      reps: 0,
      dueDate: now,
      updatedAt: now
    });
  }

  // --- CALIFICACIÓN Y ESTADÍSTICAS SRS ---

  public reviewCard(cardId: string, rating: StudyRating): Flashcard | undefined {
    const card = this.getCardById(cardId);
    if (!card) return undefined;

    const deck = this.getDeckById(card.deckId);
    const settings = deck?.settings || {
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

    const nextState = srsService.calculateNextState(card, rating, settings);

    // Registrar analítica de estudio en Eureka Cloud
    eurekaSupabase.logStudyReview({
      deckId: card.deckId,
      cardId: card.id,
      rating,
      intervalMinutes: nextState.intervalMinutes,
      easeFactor: nextState.easeFactor
    });

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
      // Estado para la barra de progreso
      if (c.state === 'new') {
        newCards++;
      } else if (c.state === 'learning' || c.state === 'relearning') {
        learningCards++;
      } else if (c.state === 'review' || c.intervalMinutes >= 10080) {
        masteredCards++;
      }

      // Estrictamente pendientes para hoy (dueDate <= now)
      if (c.dueDate <= now) {
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
