import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { katexService } from '../services/katex.service';
import { openImageOcclusionModal } from './ImageOcclusionModal';

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

  // Agrupación inteligente de tarjetas por groupId (Oclusiones múltiples y pares invertidos)
  const renderedGroupIds = new Set<string>();
  const cardItemsHtml: string[] = [];

  for (const c of cards) {
    if (c.groupId && c.type === 'image_occlusion') {
      if (renderedGroupIds.has(c.groupId)) continue;
      renderedGroupIds.add(c.groupId);

      const groupCards = deckService.getCardsByGroupId(c.groupId);
      cardItemsHtml.push(`
        <div class="occlusion-group-card apple-glass-panel" data-group-id="${c.groupId}">
          <div class="occlusion-group-header">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:1.4rem;">🖼️</span>
              <div>
                <div style="font-size:1.1rem; font-weight:800; color:#fff;">
                  Oclusión de Imagen (${groupCards.length} tarjetas contenidas)
                </div>
                <div style="font-size:0.82rem; color:var(--f-text-secondary); margin-top:2px;">
                  Toca para desplegar sub-tarjetas o edita la imagen general
                </div>
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:10px;">
              <button class="apple-btn-outline-pill btn-edit-group-occlusion" data-group-id="${c.groupId}" style="padding:6px 14px; font-size:0.82rem; font-weight:700; color:var(--f-blue); border-color:var(--f-blue);">
                ✏️ Editar Oclusión
              </button>
              <button class="btn-toggle-group-accordion" data-group-id="${c.groupId}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer; padding:4px 8px;">
                ▾
              </button>
            </div>
          </div>

          <div class="occlusion-group-body" id="group-body-${c.groupId}" style="margin-top:14px; display:flex; flex-direction:column; gap:8px;">
            ${groupCards
              .map(
                (gc, idx) => `
              <div class="occlusion-child-card-row clickable-card-row" data-dash-card-id="${gc.id}" title="Estudiar máscara #${idx + 1}">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:0.82rem; font-weight:800; color:var(--f-blue); background:rgba(56,189,248,0.12); padding:2px 8px; border-radius:6px;">
                    #${idx + 1}
                  </span>
                  <span style="font-weight:700; color:#fff; font-size:0.95rem;">${gc.front}</span>
                  <span style="color:var(--f-text-secondary); font-size:0.88rem;">➜ ${katexService.parseAndRender(gc.back)}</span>
                </div>
                
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="apple-badge-subpill" style="font-size:0.72rem; padding:1px 6px;">🎯 Estudiar</span>
                  <button class="btn-card-del-action" data-del-id="${gc.id}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.85rem;">🗑️</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `);
    } else if (c.groupId && c.isInverted) {
      if (renderedGroupIds.has(c.groupId)) continue;
      renderedGroupIds.add(c.groupId);

      const pairCards = deckService.getCardsByGroupId(c.groupId);
      cardItemsHtml.push(`
        <div class="occlusion-group-card apple-glass-panel" data-group-id="${c.groupId}">
          <div class="occlusion-group-header">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:1.4rem;">⇄</span>
              <div>
                <div style="font-size:1.1rem; font-weight:800; color:#fff;">
                  Par Invertido (2 tarjetas)
                </div>
                <div style="font-size:0.82rem; color:var(--f-text-secondary); margin-top:2px;">
                  Anverso ⇄ Reverso recíproco
                </div>
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:10px;">
              <button class="btn-toggle-group-accordion" data-group-id="${c.groupId}" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer; padding:4px 8px;">
                ▾
              </button>
            </div>
          </div>

          <div class="occlusion-group-body" id="group-body-${c.groupId}" style="margin-top:14px; display:flex; flex-direction:column; gap:8px;">
            ${pairCards
              .map(
                (pc, idx) => `
              <div class="occlusion-child-card-row clickable-card-row" data-dash-card-id="${pc.id}">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:0.8rem; font-weight:800; color:#a855f7; background:rgba(168,85,247,0.14); padding:2px 8px; border-radius:6px;">
                    ${idx === 0 ? 'Normal' : 'Invertida'}
                  </span>
                  <span style="font-weight:700; color:#fff; font-size:0.95rem;">${pc.front}</span>
                  <span style="color:var(--f-text-secondary); font-size:0.88rem;">➜ ${katexService.parseAndRender(pc.back)}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="apple-badge-subpill" style="font-size:0.72rem; padding:1px 6px;">🎯 Estudiar</span>
                  <button class="btn-card-edit-action" data-edit-id="${pc.id}" style="background:none; border:none; color:var(--f-blue); cursor:pointer; font-size:0.85rem;">✏️</button>
                  <button class="btn-card-del-action" data-del-id="${pc.id}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.85rem;">🗑️</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `);
    } else if (!c.groupId) {
      cardItemsHtml.push(`
        <div class="figma-card-item apple-glass-panel clickable-card-row" data-dash-card-id="${c.id}" title="Toca para aprender esta tarjeta en específico">
          <div class="figma-card-top-tag-row">
            <div class="figma-tag-invertido">
              ${
                c.isInverted
                  ? `<span>⇄ Invertido</span>`
                  : c.type === 'latex'
                  ? `<span>📐 LaTeX</span>`
                  : `<span>Estándar</span>`
              }
              <span class="apple-badge-subpill" style="font-size:0.72rem; padding:1px 6px; margin-left:6px;">🎯 Estudiar</span>
            </div>
            
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn-card-edit-action" data-edit-id="${c.id}" style="background:none; border:none; color:var(--f-blue); cursor:pointer; font-size:0.88rem; font-weight:700;">✏️ Editar</button>
              <button class="btn-card-del-action" data-del-id="${c.id}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.88rem; font-weight:700;">🗑️</button>
            </div>
          </div>

          <div class="figma-card-title-bold">${c.front}</div>
          <div class="figma-card-body-text">${katexService.parseAndRender(c.back)}</div>
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

        <div class="figma-search-bar-row">
          <div class="figma-search-input-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="figma-search-input" placeholder="Buscar tarjetas en el mazo..." id="dash-search-input" />
          </div>

          <button class="figma-btn-white-pill" id="btn-dash-add-card">
            Agregar tarjetas
          </button>
        </div>

        <!-- Cards List Container with Accordions and Targeted Single-Card Study -->
        <div id="dash-cards-list-mount" style="margin-top:18px;">
          ${cardItemsHtml.join('')}
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

  // Open Settings View (Foto 1)
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
    alert(`Enlace para compartir mazo "${deck.name}":\nhttps://eureka.app/deck/${deck.id}`);
  });

  const bindCardEvents = () => {
    // Accordion Toggle
    container.querySelectorAll('.btn-toggle-group-accordion').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const groupId = (btn as HTMLElement).dataset.groupId;
        if (groupId) {
          const body = container.querySelector(`#group-body-${groupId}`) as HTMLElement | null;
          if (body) {
            const isHidden = body.style.display === 'none';
            body.style.display = isHidden ? 'flex' : 'none';
            btn.textContent = isHidden ? '▾' : '▸';
          }
        }
      });
    });

    // Edit Complete Occlusion Group
    container.querySelectorAll<HTMLButtonElement>('.btn-edit-group-occlusion').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const groupId = btn.dataset.groupId;
        if (groupId) {
          const groupCards = deckService.getCardsByGroupId(groupId);
          const first = groupCards[0];
          if (first && first.occlusionImage && first.occlusionMasks) {
            openImageOcclusionModal({
              deckId: deck.id,
              initialImage: first.occlusionImage,
              initialMasks: first.occlusionMasks,
              initialMode: first.occlusionMode || 'hide_all_reveal_one',
              onConfirm: (img, masks, mode) => {
                deckService.deleteCardGroup(groupId);
                deckService.createOcclusionCards(deck.id, img, masks, mode);
              },
              onClose: () => {}
            });
          }
        }
      });
    });

    // Targeted Single-Card Study on card row click!
    container.querySelectorAll('.clickable-card-row').forEach((row) => {
      row.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('btn-card-edit-action') || target.classList.contains('btn-card-del-action')) {
          return;
        }
        const cardId = (row as HTMLElement).dataset.dashCardId;
        if (cardId) {
          callbacks.onStudySpecificCard(deck.id, cardId);
        }
      });
    });

    // Edit individual card
    container.querySelectorAll<HTMLButtonElement>('.btn-card-edit-action').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.editId;
        if (id) callbacks.onEditCard(id);
      });
    });

    // Delete card
    container.querySelectorAll<HTMLButtonElement>('.btn-card-del-action').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.delId;
        if (id && confirm('¿Eliminar esta tarjeta definitivamente?')) {
          deckService.deleteCard(id);
        }
      });
    });
  };

  bindCardEvents();
}
