import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { katexService } from '../services/katex.service';
import { dialogService } from '../services/dialog.service';

export interface FigmaDashboardCallbacks {
  onBackToSubdecks: () => void;
  onBackToRoot: () => void;
  onStudy: (deckId: string) => void;
  onStudySpecificCard: (deckId: string, cardId: string) => void;
  onAddCard: (deckId: string) => void;
  onConfigureDeck: (deckId: string) => void;
  onEditCard: (cardId: string) => void;
}

export function renderFigmaDeckDashboard(deck: Deck, parentDeck?: Deck): string {
  const stats = deckService.getDeckStats(deck.id);
  const dueCount = stats.dueCards;
  const newCount = stats.newCards;
  const learningCount = stats.learningCards;
  const masteredCount = stats.masteredCards;
  const totalInDeck = stats.totalCards;

  const totalCalculated = Math.max(1, newCount + learningCount + masteredCount);
  const pctGray = Math.round((newCount / totalCalculated) * 100);
  const pctGreen = Math.round((learningCount / totalCalculated) * 100);
  const pctBlue = Math.round((masteredCount / totalCalculated) * 100);

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

  const renderedGroupIds = new Set<string>();
  const cardItemsHtml: string[] = [];

  for (const c of cards) {
    if (c.groupId && c.type === 'image_occlusion') {
      if (renderedGroupIds.has(c.groupId)) continue;
      renderedGroupIds.add(c.groupId);

      const groupCards = deckService.getCardsByGroupId(c.groupId);
      const firstCard = groupCards[0] || c;

      cardItemsHtml.push(`
        <div class="figma-card-stacked-wrapper" data-group-id="${c.groupId}">
          <div class="figma-card-item selectable-card-target" data-card-id="${firstCard.id}" style="cursor:pointer;">
            
            <!-- Top Row: Oclu + 3 dots -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:6px; color:var(--f-text-secondary); font-size:0.82rem; font-weight:600;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                <span>Oclu</span>
              </div>
              <button class="btn-card-item-dots" data-card-id="${firstCard.id}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.35rem; cursor:pointer; padding:0 4px; line-height:1;" title="Opciones de tarjeta">
                ⋮
              </button>
            </div>

            <!-- Front Title (Bold White) -->
            <div class="figma-card-title-bold" style="font-size:0.96rem; font-weight:700; color:#ffffff; line-height:1.45;">
              ${katexService.parseAndRender(firstCard.front)}
            </div>

            <!-- Back Description (Grey Secondary) -->
            ${
              firstCard.back
                ? `
              <div class="figma-card-desc-preview" style="color:var(--f-text-secondary); font-size:0.86rem; line-height:1.45; margin-top:6px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
                ${katexService.parseAndRender(firstCard.back)}
              </div>
            `
                : ''
            }

          </div>
        </div>
      `);
    } else if (c.groupId && c.isInverted) {
      if (renderedGroupIds.has(c.groupId)) continue;
      renderedGroupIds.add(c.groupId);

      const pairCards = deckService.getCardsByGroupId(c.groupId);
      const firstCard = pairCards[0] || c;

      cardItemsHtml.push(`
        <div class="figma-card-stacked-wrapper" data-group-id="${c.groupId}">
          <div class="figma-card-item selectable-card-target" data-card-id="${firstCard.id}" style="cursor:pointer;">
            
            <!-- Top Row: Invertido + 3 dots -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:6px; color:var(--f-text-secondary); font-size:0.82rem; font-weight:600;">
                <span style="font-size:0.95rem;">⇄</span>
                <span>Invertido</span>
              </div>
              <button class="btn-card-item-dots" data-card-id="${firstCard.id}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.35rem; cursor:pointer; padding:0 4px; line-height:1;" title="Opciones de tarjeta">
                ⋮
              </button>
            </div>

            <!-- Front Title (Bold White) -->
            <div class="figma-card-title-bold" style="font-size:0.96rem; font-weight:700; color:#ffffff; line-height:1.45;">
              ${katexService.parseAndRender(firstCard.front)}
            </div>

            <!-- Back Description (Grey Secondary) -->
            ${
              firstCard.back
                ? `
              <div class="figma-card-desc-preview" style="color:var(--f-text-secondary); font-size:0.86rem; line-height:1.45; margin-top:6px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
                ${katexService.parseAndRender(firstCard.back)}
              </div>
            `
                : ''
            }

          </div>
        </div>
      `);
    } else if (!c.groupId) {
      // Tarjeta individual sin grupo
      const isInverted = c.isInverted;
      const isOcclusion = c.type === 'image_occlusion';

      cardItemsHtml.push(`
        <div class="figma-card-item selectable-card-target" data-card-id="${c.id}" title="Toca para previsualizar • Mantén presionado para seleccionar" style="cursor:pointer; margin-bottom:10px;">
          
          ${
            isInverted
              ? `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:6px; color:var(--f-text-secondary); font-size:0.82rem; font-weight:600;">
                <span style="font-size:0.95rem;">⇄</span>
                <span>Invertido</span>
              </div>
              <button class="btn-card-item-dots" data-card-id="${c.id}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.35rem; cursor:pointer; padding:0 4px; line-height:1;" title="Opciones de tarjeta">
                ⋮
              </button>
            </div>
            <div class="figma-card-title-bold" style="font-size:0.96rem; font-weight:700; color:#ffffff; line-height:1.45;">
              ${katexService.parseAndRender(c.front)}
            </div>
          `
              : isOcclusion
              ? `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:6px; color:var(--f-text-secondary); font-size:0.82rem; font-weight:600;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                <span>Oclu</span>
              </div>
              <button class="btn-card-item-dots" data-card-id="${c.id}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.35rem; cursor:pointer; padding:0 4px; line-height:1;" title="Opciones de tarjeta">
                ⋮
              </button>
            </div>
            <div class="figma-card-title-bold" style="font-size:0.96rem; font-weight:700; color:#ffffff; line-height:1.45;">
              ${katexService.parseAndRender(c.front)}
            </div>
          `
              : `
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px;">
              <div class="figma-card-title-bold" style="font-size:0.96rem; font-weight:700; color:#ffffff; line-height:1.45; flex:1;">
                ${katexService.parseAndRender(c.front)}
              </div>
              <button class="btn-card-item-dots" data-card-id="${c.id}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.35rem; cursor:pointer; padding:0 4px; line-height:1; flex-shrink:0; margin-top:-2px;" title="Opciones de tarjeta">
                ⋮
              </button>
            </div>
          `
          }

          ${
            c.back
              ? `
            <div class="figma-card-desc-preview" style="color:var(--f-text-secondary); font-size:0.86rem; line-height:1.45; margin-top:6px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
              ${katexService.parseAndRender(c.back)}
            </div>
          `
              : ''
          }

        </div>
      `);
    }
  }

  return `
    <div>
      <!-- Action Header with 3-level Breadcrumb -->
      <div class="figma-action-header">
        <div class="figma-breadcrumbs" style="font-size:1.2rem;">
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
            <div class="figma-stat-val-badge" style="color:#10b981;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${learningCount}</span>
            </div>
            <span class="figma-stat-name">En aprendizaje</span>
          </div>

          <div class="figma-stat-pill">
            <div class="figma-stat-val-badge" style="color:#38bdf8;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              <span>${masteredCount}</span>
            </div>
            <span class="figma-stat-name">Dominadas</span>
          </div>
        </div>

        <button class="figma-btn-study-large" id="btn-study-cards-main">
          ${dueCount > 0 ? 'Estudiar tarjetas' : '✨ Repasar mazo'}
        </button>
      </div>

      <!-- Progress Section: Tarjetas en el mazo -->
      <div class="figma-progress-section">
        <div class="figma-progress-title-row">
          <span>Tarjetas en el mazo (${totalInDeck})</span>
          <span style="color:var(--f-text-muted); cursor:pointer;" id="btn-deck-info-icon">ⓘ</span>
        </div>

        <div class="figma-segment-bar">
          <div class="f-seg-gray" style="width: ${pctGray}%;"></div>
          <div class="f-seg-green" style="width: ${pctGreen}%;"></div>
          <div class="f-seg-blue" style="width: ${pctBlue}%;"></div>
        </div>

        <div class="figma-bar-legend">
          <div class="f-legend-item">
            <div class="f-dot" style="background:#64748b;"></div>
            <span><strong>${newCount}</strong> No estudiadas</span>
          </div>
          <div class="f-legend-item">
            <div class="f-dot" style="background:#10b981;"></div>
            <span><strong>${learningCount}</strong> En aprendizaje</span>
          </div>
          <div class="f-legend-item">
            <div class="f-dot" style="background:#38bdf8;"></div>
            <span><strong>${masteredCount}</strong> Dominadas</span>
          </div>
        </div>

        <!-- Search and Action Bar -->
        <div class="figma-search-bar-row" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <div class="figma-search-input-wrap" style="flex:1; min-width:180px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="figma-search-input" placeholder="Buscar tarjetas en el mazo..." id="dash-search-input" />
          </div>

          <button class="figma-btn-white-pill" id="btn-dash-add-card" style="padding:10px 18px; font-size:0.88rem;">
            + Agregar tarjetas
          </button>
        </div>

        <!-- Cards List Container with Accordions and Long-Press Multi-Selection -->
        <div id="dash-cards-list-mount" style="margin-top:18px;">
          ${cardItemsHtml.length > 0 ? cardItemsHtml.join('') : `
            <div style="text-align:center; padding:36px 16px; color:var(--f-text-muted);">
              No hay tarjetas en este mazo todavía. ¡Agrega una con el botón de arriba!
            </div>
          `}
        </div>
      </div>

      <!-- Floating Batch Actions Bar (Visible when cards are selected) -->
      <div id="figma-batch-dock" class="figma-batch-actions-dock" style="display:none;">
        <div class="batch-info">
          <span class="batch-count-badge" id="batch-selected-count">0 seleccionadas</span>
          <button class="batch-text-btn" id="btn-batch-select-all">Todas</button>
        </div>

        <div class="batch-actions-btns">
          <button class="batch-action-btn btn-batch-edit" id="btn-batch-edit-action" title="Editar tarjeta" style="display:none;">
            ✏️ Editar
          </button>
          <button class="batch-action-btn btn-batch-move" id="btn-batch-move-action" title="Mover a otra carpeta/mazo">
            📁 Mover
          </button>
          <button class="batch-action-btn btn-batch-invert" id="btn-batch-invert-action" title="Revertir o desrevertir">
            ⇄ Revertir
          </button>
          <button class="batch-action-btn btn-batch-reset" id="btn-batch-reset-action" title="Restablecer progreso a nuevo" style="background:rgba(245,158,11,0.18); color:#f59e0b; border:1px solid rgba(245,158,11,0.35);">
            🔄 Borrar Progreso
          </button>
          <button class="batch-action-btn btn-batch-delete" id="btn-batch-delete-action" title="Eliminar seleccionadas">
            🗑️ Borrar
          </button>
          <button class="batch-action-btn btn-batch-close" id="btn-batch-close-action" title="Cancelar selección">
            ✕
          </button>
        </div>
      </div>

      <!-- Floating Action Buttons -->
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

  // Open Settings View
  container.querySelector('#btn-dash-menu')?.addEventListener('click', () => callbacks.onConfigureDeck(deck.id));
  container.querySelector('#btn-open-algo-settings')?.addEventListener('click', () => callbacks.onConfigureDeck(deck.id));
  container.querySelector('#btn-deck-info-icon')?.addEventListener('click', () => callbacks.onConfigureDeck(deck.id));

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
    dialogService.showAlert({
      title: `Compartir "${deck.name}"`,
      message: `Enlace para compartir este mazo:\nhttps://eureka.app/deck/${deck.id}`
    });
  });

  // Estado de Selección Múltiple (Activado por Long-Press)
  const selectedCards = new Set<string>();
  const batchDock = container.querySelector('#figma-batch-dock') as HTMLElement | null;
  const countBadge = container.querySelector('#batch-selected-count') as HTMLElement | null;
  const btnBatchEdit = container.querySelector('#btn-batch-edit-action') as HTMLElement | null;

  const updateBatchDock = () => {
    if (!batchDock || !countBadge) return;
    if (selectedCards.size > 0) {
      batchDock.style.display = 'flex';
      countBadge.textContent = `${selectedCards.size} sel.`;
      if (btnBatchEdit) {
        btnBatchEdit.style.display = selectedCards.size === 1 ? 'inline-flex' : 'none';
      }
    } else {
      batchDock.style.display = 'none';
    }

    // Actualizar clases visuales de selección en los elementos
    container.querySelectorAll('.selectable-card-target').forEach((el) => {
      const cardId = (el as HTMLElement).dataset.cardId;
      const groupId = (el as HTMLElement).dataset.groupId;

      let isSelected = false;
      if (cardId && selectedCards.has(cardId)) {
        isSelected = true;
      } else if (groupId) {
        const groupCards = deckService.getCardsByGroupId(groupId);
        if (groupCards.length > 0 && groupCards.every((c) => selectedCards.has(c.id))) {
          isSelected = true;
        }
      }

      if (isSelected) {
        el.classList.add('card-selected-active');
      } else {
        el.classList.remove('card-selected-active');
      }
    });
  };

  // Edit single card from batch selection
  btnBatchEdit?.addEventListener('click', () => {
    if (selectedCards.size === 1) {
      const cardId = Array.from(selectedCards)[0];
      selectedCards.clear();
      updateBatchDock();
      callbacks.onEditCard(cardId);
    }
  });

  // Select all / unselect all inside batch dock
  container.querySelector('#btn-batch-select-all')?.addEventListener('click', () => {
    const allCards = deckService.getCardsByDeck(deck.id, true);
    if (selectedCards.size === allCards.length) {
      selectedCards.clear();
    } else {
      allCards.forEach((c) => selectedCards.add(c.id));
    }
    updateBatchDock();
  });

  // Close batch dock
  container.querySelector('#btn-batch-close-action')?.addEventListener('click', () => {
    selectedCards.clear();
    updateBatchDock();
  });

  // Batch Delete
  container.querySelector('#btn-batch-delete-action')?.addEventListener('click', () => {
    if (selectedCards.size === 0) return;
    dialogService.showConfirm({
      title: 'Eliminar Tarjetas',
      message: `¿Estás seguro de eliminar ${selectedCards.size} tarjeta(s) definitivamente? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      isDanger: true,
      onConfirm: () => {
        deckService.deleteCards(Array.from(selectedCards));
        selectedCards.clear();
        updateBatchDock();
      }
    });
  });

  // Batch Invert / Toggle Reverse
  container.querySelector('#btn-batch-invert-action')?.addEventListener('click', () => {
    if (selectedCards.size === 0) return;
    deckService.toggleInvertCards(Array.from(selectedCards));
    selectedCards.clear();
    updateBatchDock();
  });

  // Batch Reset Progress (Solicitud #4: Doble Confirmación)
  container.querySelector('#btn-batch-reset-action')?.addEventListener('click', () => {
    if (selectedCards.size === 0) return;
    const count = selectedCards.size;
    dialogService.showConfirm({
      title: 'Restablecer Progreso',
      message: `¿Deseas restablecer el progreso de ${count} tarjeta(s) seleccionada(s) a estado nuevo?`,
      confirmText: 'Continuar',
      onConfirm: () => {
        // Segunda confirmación obligatoria
        dialogService.showConfirm({
          title: '⚠️ Confirmación Final',
          message: `Esta acción borrará todo el historial de repasos e intervalos de estas ${count} tarjeta(s). ¿Confirmar por segunda vez?`,
          confirmText: 'Restablecer Definitivamente',
          isDanger: true,
          onConfirm: () => {
            deckService.resetCardsProgress(Array.from(selectedCards));
            selectedCards.clear();
            updateBatchDock();
            callbacks.onConfigureDeck(deck.id);
          }
        });
      }
    });
  });

  // Batch Move to Folder / Deck Modal
  container.querySelector('#btn-batch-move-action')?.addEventListener('click', () => {
    if (selectedCards.size === 0) return;

    const allDecks = deckService.getAllDecks();
    const modal = document.createElement('div');
    modal.className = 'apple-modal-overlay';
    modal.innerHTML = `
      <div class="apple-modal-content apple-glass-panel" style="max-width:440px; width:92%; padding:24px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
          <h3 style="font-size:1.25rem; font-weight:800; color:#fff;">Mover ${selectedCards.size} tarjeta(s)</h3>
          <button id="btn-close-move-modal" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
        </div>
        <p style="color:var(--f-text-secondary); font-size:0.9rem; margin-bottom:16px;">
          Selecciona el mazo o submazo de destino:
        </p>

        <div style="display:flex; flex-direction:column; gap:8px; max-height:280px; overflow-y:auto; margin-bottom:18px;">
          ${allDecks
            .map((d) => {
              const isCurrent = d.id === deck.id;
              return `
              <button class="target-deck-btn ${isCurrent ? 'disabled' : ''}" data-target-id="${d.id}" style="text-align:left; padding:12px 16px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#fff; font-weight:700; cursor:${isCurrent ? 'not-allowed' : 'pointer'}; display:flex; align-items:center; justify-content:space-between;">
                <span>${d.parentId ? '↳ ' : '📁 '} ${d.name}</span>
                ${isCurrent ? '<span style="font-size:0.75rem; color:var(--f-text-muted);">(Actual)</span>' : '<span style="color:var(--f-blue);">Mover aquí ›</span>'}
              </button>
            `;
            })
            .join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#btn-close-move-modal')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    modal.querySelectorAll<HTMLButtonElement>('.target-deck-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.targetId;
        if (targetId && targetId !== deck.id) {
          deckService.moveCards(Array.from(selectedCards), targetId);
          selectedCards.clear();
          modal.remove();
          updateBatchDock();
        }
      });
    });
  });

  const bindCardEvents = () => {
    // Accordion Toggle on Group Header Click
    container.querySelectorAll('[data-toggle-group]').forEach((header) => {
      header.addEventListener('click', () => {
        if (selectedCards.size > 0) return; // In selection mode, long-press handles selection
        const groupId = (header as HTMLElement).dataset.toggleGroup;
        if (groupId) {
          const body = container.querySelector(`#group-body-${groupId}`) as HTMLElement | null;
          const chevron = header.querySelector('.btn-toggle-group-accordion');
          if (body) {
            const isHidden = body.style.display === 'none';
            body.style.display = isHidden ? 'flex' : 'none';
            if (chevron) chevron.textContent = isHidden ? '▾' : '▸';
          }
        }
      });
    });

    // LONG-PRESS (Mantener presionado) y Click Handling para selección y estudio
    container.querySelectorAll<HTMLElement>('.selectable-card-target').forEach((el) => {
      let pressTimer: number | null = null;
      let isLongPress = false;
      let startX = 0;
      let startY = 0;

      const startPress = (x: number, y: number) => {
        isLongPress = false;
        startX = x;
        startY = y;
        pressTimer = window.setTimeout(() => {
          isLongPress = true;
          try {
            if (navigator.vibrate) navigator.vibrate(40);
          } catch {}

          const cardId = (el as HTMLElement).dataset.cardId;
          const groupId = (el as HTMLElement).dataset.groupId;

          if (cardId) {
            if (selectedCards.has(cardId)) {
              selectedCards.delete(cardId);
            } else {
              selectedCards.add(cardId);
            }
          } else if (groupId) {
            const groupCards = deckService.getCardsByGroupId(groupId);
            const allSelected = groupCards.every((c) => selectedCards.has(c.id));
            if (allSelected) {
              groupCards.forEach((c) => selectedCards.delete(c.id));
            } else {
              groupCards.forEach((c) => selectedCards.add(c.id));
            }
          }
          updateBatchDock();
        }, 450);
      };

      const cancelPress = () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      };

      // Mouse Events
      el.addEventListener('mousedown', (e: MouseEvent) => {
        if (e.button === 0) startPress(e.clientX, e.clientY);
      });
      el.addEventListener('mouseup', cancelPress);
      el.addEventListener('mouseleave', cancelPress);

      // Touch Events (Mobile)
      el.addEventListener(
        'touchstart',
        (e: TouchEvent) => {
          if (e.touches.length === 1) {
            startPress(e.touches[0].clientX, e.touches[0].clientY);
          }
        },
        { passive: true }
      );
      el.addEventListener(
        'touchmove',
        (e: TouchEvent) => {
          if (e.touches.length === 1) {
            const dx = Math.abs(e.touches[0].clientX - startX);
            const dy = Math.abs(e.touches[0].clientY - startY);
            if (dx > 10 || dy > 10) cancelPress();
          }
        },
        { passive: true }
      );
      el.addEventListener('touchend', cancelPress);
      el.addEventListener('touchcancel', cancelPress);

      // Normal Click: Si está en modo selección, conmuta; si no, abre en modo vista previa
      el.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn-card-item-dots')) {
          return;
        }

        if (isLongPress) {
          e.preventDefault();
          e.stopPropagation();
          isLongPress = false;
          return;
        }

        const cardId = (el as HTMLElement).dataset.cardId;
        const groupId = (el as HTMLElement).dataset.groupId;

        if (selectedCards.size > 0) {
          e.stopPropagation();
          if (cardId) {
            if (selectedCards.has(cardId)) {
              selectedCards.delete(cardId);
            } else {
              selectedCards.add(cardId);
            }
          } else if (groupId) {
            const groupCards = deckService.getCardsByGroupId(groupId);
            const allSelected = groupCards.every((c) => selectedCards.has(c.id));
            if (allSelected) {
              groupCards.forEach((c) => selectedCards.delete(c.id));
            } else {
              groupCards.forEach((c) => selectedCards.add(c.id));
            }
          }
          updateBatchDock();
          return;
        }

        // Si es una tarjeta individual o subtarjeta, abrir en vista previa/estudio
        if (cardId) {
          callbacks.onStudySpecificCard(deck.id, cardId);
        }
      });
    });

    // Menú de 3 puntos (⋮) de cada tarjeta (Image 2)
    container.querySelectorAll<HTMLButtonElement>('.btn-card-item-dots').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const cardId = btn.dataset.cardId;
        if (!cardId) return;
        const targetCard = deckService.getCardById(cardId);
        if (!targetCard) return;

        const modal = document.createElement('div');
        modal.className = 'apple-modal-overlay';
        modal.innerHTML = `
          <div class="apple-modal-content apple-glass-panel" style="max-width:420px; width:92%; padding:22px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
              <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">Opciones de Tarjeta</h3>
              <button id="btn-close-card-item-menu" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
            </div>

            <div style="display:flex; flex-direction:column; gap:8px;">
              <button class="menu-action-item-btn" id="btn-cmenu-study" style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); color:#38bdf8; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
                <span style="font-size:1.2rem;">👁️</span>
                <div>
                  <div>Ver / Previsualizar</div>
                  <div style="font-size:0.75rem; color:var(--f-text-secondary); font-weight:500;">Inspeccionar a pantalla completa</div>
                </div>
              </button>

              <button class="menu-action-item-btn" id="btn-cmenu-edit" style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
                <span style="font-size:1.2rem;">✏️</span>
                <div>
                  <div>Editar tarjeta</div>
                  <div style="font-size:0.75rem; color:var(--f-text-secondary); font-weight:500;">Modificar anverso o reverso</div>
                </div>
              </button>

              <button class="menu-action-item-btn" id="btn-cmenu-reset" style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
                <span style="font-size:1.2rem;">🔄</span>
                <div>
                  <div>Reiniciar progreso</div>
                  <div style="font-size:0.75rem; color:var(--f-text-secondary); font-weight:500;">Restablecer a tarjeta nueva</div>
                </div>
              </button>

              <button class="menu-action-item-btn" id="btn-cmenu-delete" style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); color:#f87171; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
                <span style="font-size:1.2rem;">🗑️</span>
                <div>
                  <div>Eliminar tarjeta</div>
                  <div style="font-size:0.75rem; color:#fca5a5; font-weight:500;">Borrar definitivamente</div>
                </div>
              </button>
            </div>
          </div>
        `;

        document.body.appendChild(modal);
        const closeModal = () => modal.remove();
        modal.querySelector('#btn-close-card-item-menu')?.addEventListener('click', closeModal);
        modal.addEventListener('click', (ev) => {
          if (ev.target === modal) closeModal();
        });

        modal.querySelector('#btn-cmenu-study')?.addEventListener('click', () => {
          closeModal();
          callbacks.onStudySpecificCard(deck.id, targetCard.id);
        });

        modal.querySelector('#btn-cmenu-edit')?.addEventListener('click', () => {
          closeModal();
          callbacks.onEditCard(targetCard.id);
        });

        modal.querySelector('#btn-cmenu-reset')?.addEventListener('click', () => {
          closeModal();
          deckService.resetCardProgress(targetCard.id);
          callbacks.onConfigureDeck(deck.id);
        });

        modal.querySelector('#btn-cmenu-delete')?.addEventListener('click', () => {
          closeModal();
          dialogService.showConfirm({
            title: 'Eliminar Tarjeta',
            message: '¿Estás seguro de eliminar esta tarjeta definitivamente?',
            confirmText: 'Eliminar',
            isDanger: true,
            onConfirm: () => {
              deckService.deleteCard(targetCard.id);
              callbacks.onConfigureDeck(deck.id);
            }
          });
        });
      });
    });
  };

  bindCardEvents();
}
