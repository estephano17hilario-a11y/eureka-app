import type { Deck, Flashcard } from '../types/flashcard';

export const HEART_ANATOMY_SVG_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450" style="background:#111216; font-family:-apple-system, BlinkMacSystemFont, sans-serif;">
  <defs>
    <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="70%" stop-color="#991b1b"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="aortaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <linearGradient id="venaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="0%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>

  <text x="300" y="34" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle" letter-spacing="0.5">ANATOMÍA DEL CORAZÓN HUMANO</text>
  <text x="300" y="52" fill="#94a3b8" font-size="11" text-anchor="middle">Esquema de Cámaras y Grandes Vasos</text>

  <g transform="translate(140, 65)">
    <!-- Vena Cava -->
    <path d="M70,30 L70,120 C70,140 85,155 105,155 L105,30 Z" fill="url(#venaGrad)" stroke="#38bdf8" stroke-width="2"/>
    <!-- Aorta -->
    <path d="M120,40 C120,-10 200,-10 200,60 L180,90 C170,50 145,50 140,80 Z" fill="url(#aortaGrad)" stroke="#fca5a5" stroke-width="2"/>
    <!-- Pulmonary Artery -->
    <path d="M150,55 L220,95 L205,115 L145,85 Z" fill="#818cf8" opacity="0.85"/>
    <!-- Ventricles Body -->
    <path d="M50,130 C30,220 120,320 160,330 C210,320 280,210 250,130 C230,80 180,100 150,115 C120,100 70,80 50,130 Z" fill="url(#heartGrad)" stroke="#f87171" stroke-width="3"/>
    <!-- Septum separator -->
    <path d="M150,125 C145,200 155,270 160,330" stroke="#fecaca" stroke-width="2.5" stroke-dasharray="4,4" fill="none"/>
  </g>

  <!-- Labels -->
  <rect x="25" y="100" width="150" height="32" rx="8" fill="#1e1f24" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="100" y="121" fill="#38bdf8" font-size="12" font-weight="600" text-anchor="middle">Vena Cava Superior</text>

  <rect x="420" y="70" width="150" height="32" rx="8" fill="#1e1f24" stroke="#f87171" stroke-width="1.5"/>
  <text x="495" y="91" fill="#f87171" font-size="12" font-weight="600" text-anchor="middle">Cayado de la Aorta</text>

  <rect x="25" y="195" width="150" height="32" rx="8" fill="#1e1f24" stroke="#818cf8" stroke-width="1.5"/>
  <text x="100" y="216" fill="#818cf8" font-size="12" font-weight="600" text-anchor="middle">Aurícula Derecha</text>

  <rect x="420" y="275" width="155" height="32" rx="8" fill="#1e1f24" stroke="#ec4899" stroke-width="1.5"/>
  <text x="497" y="296" fill="#ec4899" font-size="12" font-weight="600" text-anchor="middle">Ventrículo Izquierdo</text>
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
      id: 'card-figma-occlusion',
      deckId: 'deck-humans',
      type: 'image_occlusion',
      front: 'Identifica la estructura anatómica señalada con la máscara luminosa:',
      back: 'La **Vena Cava Superior** transporta sangre desoxigenada desde la parte superior del cuerpo hacia la aurícula derecha.',
      occlusionImage: HEART_ANATOMY_SVG_URI,
      occlusionMasks: [
        { id: 'mask-1', x: 4.1, y: 22.2, width: 25.0, height: 7.2, label: 'Vena Cava Superior' },
        { id: 'mask-2', x: 70.0, y: 15.5, width: 25.0, height: 7.2, label: 'Cayado de la Aorta' },
        { id: 'mask-3', x: 4.1, y: 43.3, width: 25.0, height: 7.2, label: 'Aurícula Derecha' },
        { id: 'mask-4', x: 70.0, y: 61.1, width: 25.8, height: 7.2, label: 'Ventrículo Izquierdo' }
      ],
      activeMaskId: 'mask-1',
      occlusionMode: 'hide_all_reveal_one',
      audioLang: 'es-ES',
      audioText: 'Vena Cava Superior.',
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
