import type { Deck, Flashcard } from '../types/flashcard';

// Placeholder transparente limpio para cuando no hay imagen
export const CLEAN_CANVAS_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400" style="background:#0c0d12; font-family:-apple-system, BlinkMacSystemFont, sans-serif;">
  <rect width="600" height="400" fill="#0c0d12"/>
  <circle cx="300" cy="180" r="45" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,6"/>
  <path d="M285,180 L315,180 M300,165 L300,195" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
  <text x="300" y="260" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">Carga o arrastra una imagen aquí</text>
  <text x="300" y="285" fill="#71717a" font-size="13" text-anchor="middle">Formatos soportados: PNG, JPG, WEBP, SVG</text>
</svg>
`)}`;


export function getInitialDemoDecks(): { decks: Deck[]; cards: Flashcard[] } {
  const now = Date.now();

  // Root Decks matching Figma
  const deckMates: Deck = {
    id: 'deck-mates',
    parentId: null,
    name: 'MATES',
    description: 'Matemáticas, Física & Química',
    icon: 'folder',
    isFolder: true,
    color: '#84cc16', // Green
    settings: {
      algorithmType: 'custom',
      learningSteps: [4, 1440, 2880, 7200, 15840, 25920, 41760, 82080, 146880, 246240, 400320, 633600],
      easyBonus: 1.35,
      hardIntervalMultiplier: 1.2,
      newCardsPerDay: 25,
      maxReviewsPerDay: 3000,
      mixCards: true,
      autoPlayAudio: false,
      ttsVoiceLang: 'es-ES'
    },
    createdAt: now - 86400000 * 5,
    updatedAt: now
  };

  const deckMatesSub: Deck = {
    id: 'deck-mates-sub',
    parentId: 'deck-mates',
    name: 'Matemática, Física & Química',
    description: 'Cálculo, geometría no euclidiana, mecánica cuántica',
    icon: 'deck',
    isFolder: false,
    color: '#84cc16',
    settings: {
      algorithmType: 'custom',
      learningSteps: [4, 1440, 2880, 7200, 15840, 25920, 41760, 82080, 146880, 246240, 400320, 633600],
      easyBonus: 1.35,
      hardIntervalMultiplier: 1.2,
      newCardsPerDay: 25,
      maxReviewsPerDay: 3000,
      mixCards: true,
      autoPlayAudio: false,
      ttsVoiceLang: 'es-ES'
    },
    createdAt: now - 86400000 * 4,
    updatedAt: now
  };

  const deckIdioma: Deck = {
    id: 'deck-idioma',
    parentId: null,
    name: 'IDIOMA',
    description: 'Inglés avanzado, fonética & phrasal verbs',
    icon: 'folder',
    isFolder: true,
    color: '#8b5cf6', // Purple
    settings: {
      algorithmType: 'languages',
      learningSteps: [4, 1440, 2880, 7200],
      easyBonus: 1.4,
      hardIntervalMultiplier: 1.2,
      newCardsPerDay: 20,
      maxReviewsPerDay: 3000,
      mixCards: true,
      autoPlayAudio: true,
      ttsVoiceLang: 'en-US'
    },
    createdAt: now - 86400000 * 3,
    updatedAt: now
  };

  const deckHumans: Deck = {
    id: 'deck-humans',
    parentId: null,
    name: 'HUMANS',
    description: 'Anatomía humana, fisiología y medicina clínica',
    icon: 'folder',
    color: '#f59e0b', // Orange
    settings: {
      algorithmType: 'medical',
      learningSteps: [4, 1440, 2880, 7200],
      easyBonus: 1.35,
      hardIntervalMultiplier: 1.2,
      newCardsPerDay: 20,
      maxReviewsPerDay: 3000,
      mixCards: true,
      autoPlayAudio: false,
      ttsVoiceLang: 'es-ES'
    },
    createdAt: now - 86400000 * 2,
    updatedAt: now
  };

  const deckTools: Deck = {
    id: 'deck-tools',
    parentId: null,
    name: 'TOOLS',
    description: 'Algoritmos, arquitecturas y herramientas',
    icon: 'briefcase',
    color: '#ec4899', // Pink / Suitcase
    settings: {
      algorithmType: 'fsrs',
      learningSteps: [4, 1440, 2880, 7200],
      easyBonus: 1.35,
      hardIntervalMultiplier: 1.2,
      newCardsPerDay: 20,
      maxReviewsPerDay: 3000,
      mixCards: true,
      autoPlayAudio: false,
      ttsVoiceLang: 'es-ES'
    },
    createdAt: now - 86400000,
    updatedAt: now
  };

  const cards: Flashcard[] = [
    {
      id: 'card-figma-1',
      deckId: 'deck-mates-sub',
      type: 'latex',
      front: 'Geometría Hiperbólica (Lobachevskiana)',
      back: 'Curvatura $$K < 0$$. La suma de los ángulos del triángulo $$< 180^\\circ$$. Fey: Dibujar sobre una papa frita Pringles (silla de montar). Las paralelas se repelen hacia afuera.',
      audioLang: 'es-ES',
      audioText: 'Geometría Hiperbólica. Curvatura K menor que cero.',
      state: 'learning',
      stepIndex: 1,
      intervalMinutes: 1440,
      easeFactor: 2.50,
      lapses: 0,
      reps: 2,
      dueDate: now - 1000,
      createdAt: now - 86400000 * 3,
      updatedAt: now
    },
    {
      id: 'card-figma-2',
      deckId: 'deck-mates-sub',
      type: 'latex',
      front: 'Geometría Elíptica (Riemanniana)',
      back: 'Curvatura $$K > 0$$. La suma de los ángulos del triángulo $$> 180^\\circ$$. Fey: Dibujar sobre un globo terráqueo. Las líneas que crees paralelas siempre chocarán en los polos.',
      audioLang: 'es-ES',
      audioText: 'Geometría Elíptica. Curvatura K mayor que cero.',
      state: 'learning',
      stepIndex: 2,
      intervalMinutes: 4320,
      easeFactor: 2.50,
      lapses: 0,
      reps: 3,
      dueDate: now - 2000,
      createdAt: now - 86400000 * 2,
      updatedAt: now
    },
    {
      id: 'card-figma-3',
      deckId: 'deck-mates-sub',
      type: 'standard',
      front: 'Ortocentro:',
      back: 'Intersección de las alturas. Fey: El foco de tensión. Donde colisionan todas las plomadas gravitacionales de la estructura (enfocado en los ángulos).',
      audioLang: 'es-ES',
      audioText: 'Ortocentro. Intersección de las alturas.',
      state: 'new',
      stepIndex: 0,
      intervalMinutes: 4,
      easeFactor: 2.50,
      lapses: 0,
      reps: 0,
      dueDate: now,
      createdAt: now - 86400000,
      updatedAt: now
    },
    {
      id: 'card-figma-4',
      deckId: 'deck-mates-sub',
      type: 'standard',
      front: 'Circuncentro:',
      back: 'Intersección de las mediatrices. Centro geométrico del círculo circunscrito. Fey: El domo del escudo. Un campo de fuerza que encapsula la base tocando solo las esquinas exteriores.',
      audioLang: 'es-ES',
      audioText: 'Circuncentro. Intersección de las mediatrices.',
      state: 'new',
      stepIndex: 0,
      intervalMinutes: 4,
      easeFactor: 2.50,
      lapses: 0,
      reps: 0,
      dueDate: now,
      createdAt: now - 86400000,
      updatedAt: now
    },
    {
      id: 'card-figma-humans-1',
      deckId: 'deck-humans',
      type: 'standard',
      front: '¿Cuál es la función principal de la Mielina en los axones neuronales?',
      back: 'Actúa como aislante eléctrico permitiendo la **conducción saltatoria** de los potenciales de acción a través de los Nodos de Ranvier, aumentando drásticamente la velocidad del impulso nervioso.',
      audioLang: 'es-ES',
      audioText: 'Función principal de la Mielina en los axones neuronales.',
      state: 'new',
      stepIndex: 0,
      intervalMinutes: 4,
      easeFactor: 2.50,
      lapses: 0,
      reps: 0,
      dueDate: now,
      createdAt: now - 86400000,
      updatedAt: now
    }
  ];

  return {
    decks: [deckMates, deckMatesSub, deckIdioma, deckHumans, deckTools],
    cards
  };
}
