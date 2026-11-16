import type { Deck, AlgorithmType } from '../types/flashcard';
import { deckService } from '../services/deck.service';

export interface FigmaAlgorithmSelectorViewCallbacks {
  onBack: () => void;
  onOpenCustomLearningPhases: () => void;
  onSaved: () => void;
}

interface AlgoTemplate {
  key: AlgorithmType;
  icon: string;
  title: string;
  tags: Array<{ label: string; hot?: boolean }>;
  desc: string;
  points: string[];
}

const TEMPLATES: AlgoTemplate[] = [
  {
    key: 'fsrs',
    icon: '🧠',
    title: 'Repetición espaciada inteligente (FSRS)',
    tags: [{ label: 'Recomendado', hot: true }, { label: 'Beta' }],
    desc: 'El algoritmo más avanzado: aprende cómo recuerdas tú y programa cada repaso justo antes de que lo olvides.',
    points: ['Recuerdas más con menos repasos', 'Se adapta a tu memoria personal']
  },
  {
    key: 'general',
    icon: '📅',
    title: 'Repaso espaciado general',
    tags: [{ label: 'Equilibrado' }],
    desc: 'Programa los repasos según qué tan bien recuerdas cada tarjeta.',
    points: ['Las fáciles aparecen menos', 'Las difíciles vuelven más seguido']
  },
  {
    key: 'quick',
    icon: '⚡',
    title: 'Revisión rápida',
    tags: [{ label: 'Sin horario' }],
    desc: 'Repasa tarjeta por tarjeta, sin calendario. Siempre están disponibles cuando quieras estudiar.',
    points: ['Ideal para repasar a tu ritmo', 'No sigue intervalos de repaso']
  },
  {
    key: 'languages',
    icon: '🔤',
    title: 'Aprendizaje de idiomas',
    tags: [{ label: 'Vocabulario' }, { label: '+ Repaso espaciado' }],
    desc: 'Pensado para palabras nuevas: al principio salen seguido y luego se espacian cada vez más.',
    points: ['Muchas repeticiones al inicio', 'Intervalos largos al consolidar']
  },
  {
    key: 'medical',
    icon: '⚕️',
    title: 'Aprendizaje médico',
    tags: [{ label: 'Gran volumen' }, { label: '+ Repaso espaciado' }],
    desc: 'Basado en técnicas de estudiantes de medicina de alto rendimiento para cubrir mucho material.',
    points: ['Sin límites diarios', 'Evita repetir tarjetas de más']
  }
];

export function renderFigmaAlgorithmSelectorView(deck: Deck): string {
  const currentAlgo: AlgorithmType = deck.settings.algorithmType || 'custom';

  const card = (t: AlgoTemplate) => `
    <button type="button" class="al-card ${currentAlgo === t.key ? 'selected' : ''}" data-algo-key="${t.key}" aria-pressed="${currentAlgo === t.key}">
      <span class="al-top">
        <span class="al-ic">${t.icon}</span>
        <span class="al-heading">
          <span class="al-title">${t.title}</span>
          <span class="al-tags">${t.tags.map((g) => `<span class="al-tag ${g.hot ? 'hot' : ''}">${g.label}</span>`).join('')}</span>
        </span>
        <span class="al-radio">✓</span>
      </span>
      <p class="al-desc">${t.desc}</p>
      <ul class="al-points">${t.points.map((p) => `<li>${p}</li>`).join('')}</ul>
    </button>`;

  return `
    <div class="ios-fullscreen-view">

      <!-- iOS Native Header -->
      <div class="ios-navbar">
        <button class="ios-back-btn" id="btn-algo-view-back">
          <span class="ios-back-chevron">‹</span> Volver
        </button>
        <h1 class="ios-nav-title">Elegir algoritmo</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:14px;">
        <p class="al-intro">Elige una plantilla para este mazo. Si ninguna te encaja, crea tu propia escalera de repasos.</p>

        ${TEMPLATES.map(card).join('')}

        <!-- Personalizar: botón principal -->
        <button type="button" class="al-custom" id="btn-view-custom-phases">
          <span class="al-custom-ic">⚙️</span>
          <span class="al-custom-tx">
            <b>Personalizar</b>
            <span>Crea tu propia escalera de repasos: cada paso en meses, días, horas y minutos.</span>
          </span>
          <span class="al-custom-go">›</span>
        </button>

        <div style="height:30px;"></div>
      </div>

    </div>
  `;
}

export function bindFigmaAlgorithmSelectorViewEvents(
  container: HTMLElement,
  deck: Deck,
  callbacks: FigmaAlgorithmSelectorViewCallbacks
): void {
  container.querySelector('#btn-algo-view-back')?.addEventListener('click', () => callbacks.onBack());
  container.querySelector('#btn-view-custom-phases')?.addEventListener('click', () => callbacks.onOpenCustomLearningPhases());

  container.querySelectorAll<HTMLElement>('.al-card').forEach((card) => {
    card.addEventListener('click', () => {
      const key = card.dataset.algoKey as AlgorithmType;
      if (key) {
        deckService.updateDeck(deck.id, {
          settings: { ...deck.settings, algorithmType: key }
        });
        callbacks.onSaved();
      }
    });
  });
}
