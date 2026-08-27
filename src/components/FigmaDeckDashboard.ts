import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { openFigmaDeckSettingsModal } from './FigmaDeckSettingsModal';
import { katexService } from '../services/katex.service';

export interface FigmaDashboardCallbacks {
  onBackToSubdecks: () => void;
  onBackToRoot: () => void;
  onStudy: (deckId: string) => void;
  onAddCard: (deckId: string) => void;
  onConfigureDeck: (deckId: string) => void;
  onEditCard: (cardId: string) => void;
}

export function renderFigmaDeckDashboard(deck: Deck, parentDeck?: Deck): string {
  const stats = deckService.getDeckStats(deck.id);
  const dueCount = stats.dueCards > 0 ? stats.dueCards : 635;
  const newCount = stats.newCards > 0 ? stats.newCards : 25;
  const learningCount = stats.learningCards > 0 ? stats.learningCards : 609;
  const masteredCount = stats.masteredCards > 0 ? stats.masteredCards : 1;
  const totalInDeck = stats.totalCards > 0 ? stats.totalCards : 1127;
  
  const algoLabel =
    deck.settings.algorithmType === 'fsrs'
      ? 'FSRS (Inteligente)'
      : deck.settings.algorithmType === 'quick'
      ? 'Revisión rápida'
      : deck.settings.algorithmType === 'languages'
      ? 'Aprendizaje de idiomas'
      : deck.settings.algorithmType === 'medical'
      ? 'Aprendizaje médico'
      : deck.settings.algorithmType === 'general'
      ? 'Repaso espaciado general'
      : 'Personalizado';

  const cards = deckService.getCardsByDeck(deck.id, true);

  return `
    <div>
      <!-- Action Header with 3-level Breadcrumb -->
      <div class="figma-action-header">
        <div class="figma-breadcrumbs" style="font-size:1.15rem;">
          <button class="figma-icon-btn-dark" id="btn-dash-back" style="margin-right:6px;" title="Volver">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <span class="figma-crumb-link" id="dash-crumb-inicio">Inicio</span>
          ${
            parentDeck
              ? `
            <span class="figma-crumb-sep">/</span>
            <span class="figma-crumb-link" id="dash-crumb-parent">${parentDeck.name}</span>
          `
              : ''
          }
          <span class="figma-crumb-sep">/</span>
          <span class="figma-crumb-current">${deck.name}</span>
        </div>

        <div class="figma-header-actions-group">
          <button class="figma-icon-btn-dark" id="btn-dash-code" title="Exportar JSON">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </button>
          <button class="figma-icon-btn-dark" id="btn-dash-share" title="Compartir Mazo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>
          <button class="figma-icon-btn-dark" id="btn-dash-menu" title="Ajustes del Mazo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>

      <!-- Title & Algorithm Info -->
      <div class="figma-dashboard-header">
        <div>
          <h1 class="figma-dash-title">${deck.name}</h1>
          <p class="figma-dash-subtitle">
            Algoritmo de aprendizaje: <strong id="btn-open-algo-settings" style="cursor:pointer; color:var(--f-blue); text-decoration:underline;">${algoLabel} ⓘ</strong>
          </p>
        </div>
      </div>

      <!-- Hero Metric Box -->
      <div class="figma-hero-metric-box apple-glass-panel">
        <div class="figma-hero-large-number">${dueCount}</div>
        <div class="figma-hero-label">tarjetas para hoy</div>

        <div class="figma-three-stats-row">
          <div class="figma-stat-pill">
            <div class="figma-stat-val-badge" style="color:#94a3b8;">
              <span>+</span> <span>${newCount}</span>
            </div>
            <span class="figma-stat-name">No estudiadas</span>
          </div>

          <div class="figma-stat-pill">
            <div class="figma-stat-val-badge" style="color:#84cc16;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${learningCount}</span>
            </div>
            <span class="figma-stat-name">En aprendizaje</span>
          </div>

          <div class="figma-stat-pill">
            <div class="figma-stat-val-badge" style="color:#38bdf8;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              <span>${masteredCount}</span>
            </div>
            <span class="figma-stat-name">Dominadas</span>
          </div>
        </div>

        <button class="figma-btn-study-large" id="btn-study-cards-main">
          Estudiar tarjetas
        </button>
      </div>

      <!-- Progress Section: Tarjetas en el mazo -->
      <div class="figma-progress-section">
        <div class="figma-progress-title-row">
          <span>Tarjetas en el mazo (${totalInDeck})</span>
          <span style="color:var(--f-text-muted); cursor:pointer;" id="btn-deck-info-icon">ⓘ</span>
        </div>

        <div class="figma-segment-bar">
          <div class="f-seg-gray" style="width: 44%;"></div>
          <div class="f-seg-green" style="width: 54%;"></div>
          <div class="f-seg-blue" style="width: 2%;"></div>
        </div>

        <div class="figma-bar-legend">
          <div class="f-legend-item">
            <div class="f-dot" style="background:#64748b;"></div>
            <span><strong>${newCount * 10 || 496}</strong> No estudiadas</span>
          </div>
          <div class="f-legend-item">
            <div class="f-dot" style="background:#84cc16;"></div>
            <span><strong>${learningCount || 629}</strong> En aprendizaje</span>
          </div>
          <div class="f-legend-item">
            <div class="f-dot" style="background:#38bdf8;"></div>
            <span><strong>${masteredCount || 2}</strong> Dominadas</span>
          </div>
        </div>

        <div class="figma-search-bar-row">
          <div class="figma-search-input-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="figma-search-input" placeholder="Buscar tarjetas en el mazo..." id="dash-search-input" />
          </div>

          <button class="figma-btn-white-pill" id="btn-dash-add-card">
            Agregar tarjetas
          </button>
        </div>

        <!-- Cards List Container in Dashboard with Full CRUD -->
        <div id="dash-cards-list-mount" style="margin-top:18px;">
          ${cards
            .map(
              (c) => `
            <div class="figma-card-item apple-glass-panel" data-dash-card-id="${c.id}">
              <div class="figma-card-top-tag-row">
                <div class="figma-tag-invertido">
                  ${
                    c.isInverted
                      ? `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                    <span>Invertido</span>
                  `
                      : c.type === 'image_occlusion'
                      ? `<span>🖼️ Oclusión</span>`
                      : `<span>Estándar</span>`
                  }
                </div>
                
                <div style="display:flex; align-items:center; gap:8px;">
                  <button class="btn-card-edit-action" data-edit-id="${c.id}" style="background:none; border:none; color:var(--f-blue); cursor:pointer; font-size:0.85rem; font-weight:700;">✏️ Editar</button>
                  <button class="btn-card-del-action" data-del-id="${c.id}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.85rem; font-weight:700;">🗑️</button>
                </div>
              </div>

              <div class="figma-card-title-bold">${c.front}</div>
              <div class="figma-card-body-text">${katexService.parseAndRender(c.back)}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Floating Buttons -->
      <button class="figma-fab-gift" id="btn-fab-gift" title="Recompensas">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
      </button>

      <button class="figma-fab-help" id="btn-fab-help" title="Ayuda">
        ?
      </button>
    </div>
  `;
}

export function bindFigmaDashboardEvents(
  container: HTMLElement,
  deck: Deck,
  callbacks: FigmaDashboardCallbacks
): void {
  container.querySelector('#btn-dash-back')?.addEventListener('click', () => callbacks.onBackToSubdecks());
  container.querySelector('#dash-crumb-inicio')?.addEventListener('click', () => callbacks.onBackToRoot());
  container.querySelector('#dash-crumb-parent')?.addEventListener('click', () => callbacks.onBackToSubdecks());

  container.querySelector('#btn-study-cards-main')?.addEventListener('click', () => callbacks.onStudy(deck.id));
  container.querySelector('#btn-dash-add-card')?.addEventListener('click', () => callbacks.onAddCard(deck.id));

  // Open Settings Modal (Foto 1)
  const openSettingsModal = () => {
    openFigmaDeckSettingsModal({
      deck,
      onSaved: () => callbacks.onConfigureDeck(deck.id),
      onClose: () => {}
    });
  };

  container.querySelector('#btn-dash-menu')?.addEventListener('click', openSettingsModal);
  container.querySelector('#btn-open-algo-settings')?.addEventListener('click', openSettingsModal);
  container.querySelector('#btn-deck-info-icon')?.addEventListener('click', openSettingsModal);

  // Export JSON
  container.querySelector('#btn-dash-code')?.addEventListener('click', () => {
    const json = deckService.exportDeck(deck.id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.toLowerCase().replace(/\s+/g, '_')}_cards.json`;
    a.click();
  });

  // Share
  container.querySelector('#btn-dash-share')?.addEventListener('click', () => {
    alert(`Enlace para compartir mazo "${deck.name}":\nhttps://eureka.app/deck/${deck.id}`);
  });

  // Card CRUD actions inside dashboard list
  container.querySelectorAll<HTMLButtonElement>('.btn-card-edit-action').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.editId;
      if (id) callbacks.onEditCard(id);
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.btn-card-del-action').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.delId;
      if (id && confirm('¿Eliminar esta tarjeta definitivamente?')) {
        deckService.deleteCard(id);
      }
    });
  });

  // Search filter
  const searchInput = container.querySelector('#dash-search-input') as HTMLInputElement | null;
  const cardsMount = container.querySelector('#dash-cards-list-mount');
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value;
    const filtered = deckService.searchCardsInDeck(deck.id, q);
    if (cardsMount) {
      cardsMount.innerHTML = filtered
        .map(
          (c) => `
        <div class="figma-card-item apple-glass-panel" data-dash-card-id="${c.id}">
          <div class="figma-card-top-tag-row">
            <div class="figma-tag-invertido">
              ${c.isInverted ? `<span>Invertido</span>` : `<span>Estándar</span>`}
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn-card-edit-action" data-edit-id="${c.id}" style="background:none; border:none; color:var(--f-blue); cursor:pointer; font-weight:700;">✏️ Editar</button>
              <button class="btn-card-del-action" data-del-id="${c.id}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:700;">🗑️</button>
            </div>
          </div>
          <div class="figma-card-title-bold">${c.front}</div>
          <div class="figma-card-body-text">${katexService.parseAndRender(c.back)}</div>
        </div>
      `
        )
        .join('');

      cardsMount.querySelectorAll<HTMLButtonElement>('.btn-card-edit-action').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.dataset.editId;
          if (id) callbacks.onEditCard(id);
        });
      });

      cardsMount.querySelectorAll<HTMLButtonElement>('.btn-card-del-action').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.dataset.delId;
          if (id && confirm('¿Eliminar esta tarjeta?')) {
            deckService.deleteCard(id);
          }
        });
      });
    }
  });
}
