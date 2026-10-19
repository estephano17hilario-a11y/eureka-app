import { nativeService } from '../services/native.service';

export type CreateHubChoice = 'feynman' | 'import' | 'notebook' | 'deck' | 'folder';
export type CreateHubContext = 'notebooks' | 'decks';

export interface CreateHubOptions {
  context: CreateHubContext;
  /** Nombre de la carpeta actual (para decir "dentro de X") */
  parentName?: string;
  onChoice: (choice: CreateHubChoice) => void;
}

interface HubTile {
  id: CreateHubChoice;
  icon: string;
  title: string;
  desc: string;
}

const TILES: Record<CreateHubChoice, HubTile> = {
  feynman: {
    id: 'feynman',
    icon: '🔬',
    title: 'Ruta Feynman con IA',
    desc: 'Dime el tema y yo armo el prompt maestro. Tu IA lo responde y Eureka crea el cuaderno con sus flashcards.'
  },
  notebook: {
    id: 'notebook',
    icon: '📓',
    title: 'Cuaderno en blanco',
    desc: 'Ponle nombre, elige color y listo. Tu mazo se crea solo.'
  },
  import: {
    id: 'import',
    icon: '📥',
    title: 'Ya tengo mi .md',
    desc: 'Pega o sube la respuesta de tu IA y ábrela como cuaderno.'
  },
  deck: {
    id: 'deck',
    icon: '🎴',
    title: 'Mazo de flashcards',
    desc: 'Tarjetas para repaso espaciado.'
  },
  folder: {
    id: 'folder',
    icon: '📁',
    title: 'Carpeta',
    desc: 'Agrupa materias y temas.'
  }
};

/**
 * Hub único de creación: todo lo que se puede crear (cuaderno, ruta Feynman, mazo, carpeta)
 * está a un toque, ordenado según desde dónde lo abres.
 */
export function openCreateHub(options: CreateHubOptions): void {
  document.getElementById('create-hub-root')?.remove();

  const isDecks = options.context === 'decks';

  const featured = isDecks ? TILES.deck : TILES.feynman;
  const grid: HubTile[] = isDecks
    ? [TILES.folder, TILES.notebook, TILES.feynman, TILES.import]
    : [TILES.notebook, TILES.import, TILES.deck, TILES.folder];

  const featuredBadge = isDecks ? 'Rápido' : 'Recomendado';
  const featuredStyle = isDecks
    ? 'border-color: rgba(255,208,138,0.5); background: radial-gradient(120% 140% at 0% 0%, rgba(255,186,98,0.22), transparent 60%), linear-gradient(135deg, rgba(120,70,20,0.5), rgba(60,35,12,0.5));'
    : '';

  const root = document.createElement('div');
  root.id = 'create-hub-root';
  root.className = 'ch-overlay';
  root.innerHTML = `
    <div class="ch-sheet" role="dialog" aria-modal="true" aria-label="Crear">
      <div class="ch-head">
        <div>
          <div class="ch-title">¿Qué quieres crear?</div>
          <div class="ch-sub">${
            options.parentName ? `Dentro de “${escapeHtml(options.parentName)}”` : 'Un solo toque y empiezas a estudiar'
          }</div>
        </div>
        <button class="ch-close" id="ch-close" aria-label="Cerrar">✕</button>
      </div>

      <button class="ch-feature" data-choice="${featured.id}" style="${featuredStyle}">
        <div class="ch-feature-icon" ${isDecks ? 'style="background:linear-gradient(135deg,#ffd08a,#f59e0b);"' : ''}>${featured.icon}</div>
        <div>
          <div class="ch-feature-title">${featured.title} <span class="ch-badge">${featuredBadge}</span></div>
          <div class="ch-feature-desc">${featured.desc}</div>
        </div>
      </button>

      <div class="ch-grid">
        ${grid
          .map(
            (t) => `
          <button class="ch-tile" data-choice="${t.id}">
            <span class="ch-tile-icon">${t.icon}</span>
            <span class="ch-tile-title">${t.title}</span>
            <span class="ch-tile-desc">${t.desc}</span>
          </button>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  document.body.appendChild(root);
  nativeService.triggerHaptics('light');

  const close = () => {
    root.remove();
    document.removeEventListener('keydown', onKey);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKey);

  root.addEventListener('click', (e) => {
    if (e.target === root) close();
  });
  root.querySelector('#ch-close')?.addEventListener('click', close);

  root.querySelectorAll<HTMLElement>('[data-choice]').forEach((el) => {
    el.addEventListener('click', () => {
      const choice = el.dataset.choice as CreateHubChoice;
      nativeService.triggerHaptics('medium');
      close();
      options.onChoice(choice);
    });
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
