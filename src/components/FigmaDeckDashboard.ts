import type { Deck, Flashcard } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { katexService } from '../services/katex.service';
import { dialogService } from '../services/dialog.service';
import { askTag, bindDeckFilters, cardBadgesHtml, cardDataAttrs, deckFilterActiveCount, deckFilterBarHtml, deckNoResultsHtml, openDeckStats, openStudyLauncher, type StudyLaunch } from './DeckInsights';

export interface FigmaDashboardCallbacks {
  onBackToSubdecks: () => void;
  onBackToRoot: () => void;
  onStudy: (deckId: string, launch?: StudyLaunch) => void;
  onStudySpecificCard: (deckId: string, cardId: string) => void;
  onAddCard: (deckId: string) => void;
  onConfigureDeck: (deckId: string) => void;
  onEditCard: (cardId: string) => void;
  onRefresh?: () => void;
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
  // Grupos que son un par invertido (Anverso↔Reverso): se muestran como una sola pila.
  // Cualquier otro grupo (p. ej. huecos/cloze) se pinta tarjeta a tarjeta; antes esas tarjetas no aparecían en el mazo.
  const invertedGroupIds = new Set<string>();
  for (const x of cards) if (x.groupId && x.isInverted) invertedGroupIds.add(x.groupId);

  // Una sola plantilla para todas las filas: cabecera (miniatura + título + ⋮), descripción y una fila de chips.
  // El tipo (invertida / oclusión / huecos) va como chip en la fila inferior en vez de ocupar una fila entera arriba.
  const rowHtml = (c: Flashcard, kind: 'single' | 'inverted' | 'occlusion', stacked: boolean): string => {
    const lead =
      kind === 'inverted'
        ? '<span class="dk-badge kind" title="Par invertido: se estudia Anverso→Reverso y Reverso→Anverso">⇄ Invertido</span>'
        : kind === 'occlusion'
        ? '<span class="dk-badge kind" title="Oclusión de imagen">🖼️ Oclusión</span>'
        : c.type === 'cloze'
        ? '<span class="dk-badge kind" title="Tarjeta de huecos">🕳️ Huecos</span>'
        : '';
    const title = c.type === 'cloze' ? katexService.renderCloze(c.front, false) : katexService.parseAndRender(c.front);
    const thumb = c.frontImage
      ? `<img class="fc-row-thumb" src="${c.frontImage}" alt="" loading="lazy" decoding="async" />`
      : '';
    const back = c.back ? `<div class="figma-card-desc-preview">${katexService.parseAndRender(c.back)}</div>` : '';
    const item = `
        <div class="figma-card-item selectable-card-target" data-card-id="${c.id}" ${cardDataAttrs(c)}${
          stacked ? '' : ' title="Toca para previsualizar • Mantén presionado para seleccionar"'
        }>
          <div class="fc-row-head">
            ${thumb}
            <div class="figma-card-title-bold">${title}</div>
            <button class="btn-card-item-dots" data-card-id="${c.id}" title="Opciones de tarjeta" aria-label="Opciones de tarjeta">⋮</button>
          </div>
          ${back}
          ${cardBadgesHtml(c, lead)}
        </div>`;
    return stacked ? `<div class="figma-card-stacked-wrapper" data-group-id="${c.groupId}">${item}</div>` : item;
  };

  for (const c of cards) {
    if (c.groupId && c.type === 'image_occlusion') {
      if (renderedGroupIds.has(c.groupId)) continue;
      renderedGroupIds.add(c.groupId);
      const groupCards = deckService.getCardsByGroupId(c.groupId);
      cardItemsHtml.push(rowHtml(groupCards[0] || c, 'occlusion', true));
    } else if (c.groupId && invertedGroupIds.has(c.groupId)) {
      if (renderedGroupIds.has(c.groupId)) continue;
      renderedGroupIds.add(c.groupId);
      const pairCards = deckService.getCardsByGroupId(c.groupId);
      cardItemsHtml.push(rowHtml(pairCards[0] || c, 'inverted', true));
    } else {
      // Tarjeta individual (sin grupo, o de un grupo que no se apila: huecos, etc.)
      cardItemsHtml.push(rowHtml(c, c.type === 'image_occlusion' ? 'occlusion' : c.isInverted ? 'inverted' : 'single', false));
    }
  }

  const isEmpty = totalInDeck === 0;
  const filtersOpen = dashUi.filtersOpen.has(deck.id) || deckFilterActiveCount(deck.id) > 0;
  const studyMoreOpen = dashUi.studyMoreOpen;
  const chevron =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

  return `
    <div class="dk2">
      <!-- Cabecera: volver, ruta y ajustes del mazo -->
      <div class="figma-action-header">
        <div class="figma-breadcrumbs">
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
          <button class="figma-icon-btn-dark" id="btn-dash-menu" title="Ajustes del mazo" aria-label="Ajustes del mazo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>

      <!-- Título y algoritmo (discreto: un toque abre los ajustes) -->
      <div class="dk2-titlebar">
        <h1 class="figma-dash-title">${deck.name}</h1>
        <button type="button" class="dk2-algo" id="btn-open-algo-settings" title="Cambiar el algoritmo de repaso">${algoLabel}${chevron}</button>
      </div>

      <!-- Panel de estudio: UNA acción principal; lo demás, desplegable -->
      <section class="figma-hero-metric-box dk2-hero apple-glass-panel">
        <div class="dk2-hero-top">
          <div class="dk2-due">
            <span class="figma-hero-large-number">${dueCount}</span>
            <span class="figma-hero-label">para hoy</span>
          </div>

          ${
            isEmpty
              ? `<button class="figma-btn-study-large dk2-study" id="btn-dash-add-first">+ Agregar tarjetas</button>`
              : `<div class="dk2-cta">
                  <button class="figma-btn-study-large dk2-study" id="btn-study-cards-main">${dueCount > 0 ? 'Estudiar' : 'Repasar'}</button>
                  <button type="button" class="dk2-icon-btn" id="btn-study-more" data-expand="dk2-study-more" aria-expanded="${studyMoreOpen}" aria-controls="dk2-study-more" aria-label="Más formas de estudiar" title="Más formas de estudiar">${chevron}</button>
                </div>`
          }
        </div>

        ${
          isEmpty
            ? ''
            : `<div class="dk2-collapse dk2-more-row" id="dk2-study-more" data-open="${studyMoreOpen ? 1 : 0}">
                <div class="dk2-collapse-inner">
                  <div class="dk2-more-actions">
                    <button type="button" class="dk-hero-btn" id="btn-study-modes" title="Elegir qué, cómo y cuánto estudiar">🎯 Modos de estudio</button>
                    <button type="button" class="dk-hero-btn" id="btn-deck-stats" title="Racha, actividad y previsión de repasos">📊 Estadísticas</button>
                  </div>
                </div>
              </div>
              <div class="dk2-progress">
                <div class="figma-segment-bar dk2-bar" role="img" aria-label="${newCount} nuevas, ${learningCount} aprendiendo, ${masteredCount} dominadas">
                  <div class="f-seg-gray" style="width: ${pctGray}%;"></div>
                  <div class="f-seg-green" style="width: ${pctGreen}%;"></div>
                  <div class="f-seg-blue" style="width: ${pctBlue}%;"></div>
                </div>
                <div class="dk2-legend">
                  <span title="Tarjetas nuevas, aún sin estudiar"><i style="background:#94a3b8"></i><b>${newCount}</b> nuevas</span>
                  <span title="Tarjetas en fase de aprendizaje"><i style="background:#10b981"></i><b>${learningCount}</b> aprendiendo</span>
                  <span title="Tarjetas consolidadas"><i style="background:#38bdf8"></i><b>${masteredCount}</b> dominadas</span>
                </div>
              </div>`
        }
      </section>

      <!-- Tarjetas del mazo -->
      <div class="figma-dashboard-bottom-board">
        <div id="dash-section-flashcards" class="dash-bottom-section active">
          <div class="dk2-cards-head">
            <h2 class="dk2-cards-title">Tarjetas <span class="figma-tab-count-chip">${totalInDeck}</span></h2>
            ${
              isEmpty
                ? ''
                : `<div class="dk2-tools">
                    <button type="button" class="dk2-icon-btn ${deckFilterActiveCount(deck.id) > 0 ? 'has-active' : ''}" id="btn-dash-filters" aria-expanded="${filtersOpen}" aria-controls="dk2-filter-panel" aria-label="Filtros y orden" title="Filtros y orden">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
                      <span class="dk2-dot"></span>
                    </button>
                    <button class="figma-btn-white-pill dk2-add" id="btn-dash-add-card">+ Agregar</button>
                  </div>`
            }
          </div>

          ${
            isEmpty
              ? ''
              : `<div class="figma-search-input-wrap dk2-search">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" class="figma-search-input" placeholder="Buscar tarjetas…" id="dash-search-input" />
                </div>

                <div class="dk2-collapse" id="dk2-filter-panel" data-open="${filtersOpen ? 1 : 0}">
                  <div class="dk2-collapse-inner">${deckFilterBarHtml(deck)}</div>
                </div>
                ${deckNoResultsHtml()}`
          }

          <!-- Lista de tarjetas (selección múltiple con pulsación larga) -->
          <div id="dash-cards-list-mount" style="margin-top:14px;">
            ${cardItemsHtml.length > 0 ? cardItemsHtml.join('') : `
              <div class="dk2-empty">
                Este mazo aún no tiene tarjetas.
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Barra de acciones de la selección: lo esencial a la vista, el resto en «Más» -->
      <div id="figma-batch-dock" class="figma-batch-actions-dock dk2-dock" style="display:none;">
        <div class="batch-info">
          <button class="batch-action-btn btn-batch-close" id="btn-batch-close-action" title="Cancelar selección" aria-label="Cancelar selección">✕</button>
          <span class="batch-count-badge" id="batch-selected-count">0 sel.</span>
          <button class="batch-text-btn" id="btn-batch-select-all">Todas</button>
        </div>

        <div class="batch-actions-btns">
          <button class="batch-action-btn btn-batch-edit" id="btn-batch-edit-action" title="Editar tarjeta" style="display:none;">✏️ Editar</button>
          <button class="batch-action-btn btn-batch-move" id="btn-batch-move-action" title="Mover a otra carpeta/mazo">📁 Mover</button>
          <button class="batch-action-btn btn-batch-delete" id="btn-batch-delete-action" title="Eliminar seleccionadas">🗑️ Borrar</button>
          <div class="dk2-pop-wrap">
            <button type="button" class="batch-action-btn dk2-more" id="btn-batch-more" data-menu-toggle="dk2-batch-menu" aria-haspopup="menu" aria-expanded="false" title="Más acciones">Más ⋯</button>
            <div class="dk2-menu up" id="dk2-batch-menu" role="menu" data-open="0">
              <button type="button" role="menuitem" id="btn-batch-star-action" title="Marcar o desmarcar como favoritas">⭐ Favorita</button>
              <button type="button" role="menuitem" id="btn-batch-tag-action" title="Añadir o quitar una etiqueta">🏷️ Etiquetar</button>
              <button type="button" role="menuitem" id="btn-batch-suspend-action" title="Las pausadas no entran en los repasos">⏸ Pausar / reactivar</button>
              <button type="button" role="menuitem" id="btn-batch-dup-action" title="Duplicar como tarjetas nuevas">⧉ Duplicar</button>
              <button type="button" role="menuitem" id="btn-batch-rev-on-action" title="Activar la versión inversa (Reverso → Anverso)">⇄ Activar inversa</button>
              <button type="button" role="menuitem" id="btn-batch-rev-off-action" title="Quitar la versión inversa">⇄ Quitar inversa</button>
              <button type="button" role="menuitem" id="btn-batch-archive-action" title="Salen de la vista normal y de los repasos">📦 Archivar / desarchivar</button>
              <button type="button" role="menuitem" class="warn" id="btn-batch-reset-action" title="Restablecer progreso a nuevo">🔄 Borrar progreso</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Estado de interfaz que debe sobrevivir a los repintados por cambio de datos (p. ej. al llegar una sincronización). */
const dashUi = { filtersOpen: new Set<string>(), studyMoreOpen: false };
let disposePopovers: (() => void) | null = null;

/** Menús desplegables pequeños: se cierran al elegir, al tocar fuera o con Esc. */
function bindPopovers(container: HTMLElement): void {
  disposePopovers?.();
  const menus = Array.from(container.querySelectorAll<HTMLElement>('.dk2-menu'));
  const setOpen = (menu: HTMLElement, open: boolean) => {
    menu.dataset.open = open ? '1' : '0';
    menu.parentElement?.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', String(open));
  };
  const closeAll = () => menus.forEach((m) => setOpen(m, false));

  container.querySelectorAll<HTMLElement>('[data-menu-toggle]').forEach((btn) => {
    const menu = container.querySelector<HTMLElement>(`#${btn.dataset.menuToggle}`);
    if (!menu) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = menu.dataset.open !== '1';
      closeAll();
      setOpen(menu, willOpen);
    });
  });
  menus.forEach((m) =>
    m.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('button')) closeAll();
    })
  );

  const onOutside = (e: Event) => {
    if (!(e.target as HTMLElement | null)?.closest?.('.dk2-pop-wrap')) closeAll();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeAll();
  };
  document.addEventListener('pointerdown', onOutside, true);
  document.addEventListener('keydown', onKey);
  disposePopovers = () => {
    document.removeEventListener('pointerdown', onOutside, true);
    document.removeEventListener('keydown', onKey);
  };
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
  container.querySelector('#btn-study-modes')?.addEventListener('click', () => openStudyLauncher(deck, (launch) => callbacks.onStudy(deck.id, launch)));
  container.querySelector('#btn-deck-stats')?.addEventListener('click', () => openDeckStats(deck));

  // Open Settings View
  container.querySelector('#btn-dash-menu')?.addEventListener('click', () => callbacks.onConfigureDeck(deck.id));
  container.querySelector('#btn-open-algo-settings')?.addEventListener('click', () => callbacks.onConfigureDeck(deck.id));
  container.querySelector('#btn-dash-add-first')?.addEventListener('click', () => callbacks.onAddCard(deck.id));

  // Menús pequeños (más formas de estudiar, más acciones de la selección) y panel de filtros plegable
  bindPopovers(container);
  const bindExpander = (btnSel: string, panelSel: string, remember: (open: boolean) => void) => {
    const btn = container.querySelector<HTMLElement>(btnSel);
    const panel = container.querySelector<HTMLElement>(panelSel);
    btn?.addEventListener('click', () => {
      if (!panel) return;
      const open = panel.dataset.open !== '1';
      panel.dataset.open = open ? '1' : '0';
      btn.setAttribute('aria-expanded', String(open));
      remember(open);
    });
  };
  bindExpander('#btn-dash-filters', '#dk2-filter-panel', (open) => (open ? dashUi.filtersOpen.add(deck.id) : dashUi.filtersOpen.delete(deck.id)));
  bindExpander('#btn-study-more', '#dk2-study-more', (open) => (dashUi.studyMoreOpen = open));

  // Estado de Selección Múltiple (Activado por Long-Press)
  const selectedCards = new Set<string>();
  const batchDock = container.querySelector('#figma-batch-dock') as HTMLElement | null;
  const countBadge = container.querySelector('#batch-selected-count') as HTMLElement | null;
  const btnBatchEdit = container.querySelector('#btn-batch-edit-action') as HTMLElement | null;

  const updateBatchDock = () => {
    if (!batchDock || !countBadge) return;
    // Con alguna tarjeta elegida se muestran las casillas en todas las tarjetas
    container.classList.toggle('dk-select-mode', selectedCards.size > 0);
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

  // Búsqueda, filtros por estado/etiqueta y orden (se recuerdan mientras sigas en la app)
  bindDeckFilters(container, deck);

  const showBatchToast = (msg: string) => {
    document.getElementById('dk-batch-toast')?.remove();
    const t = document.createElement('div');
    t.id = 'dk-batch-toast';
    t.textContent = msg;
    t.style.cssText =
      'position:fixed;left:50%;bottom:110px;transform:translateX(-50%);z-index:9999;background:rgba(20,20,24,.96);color:#fff;padding:10px 16px;border-radius:12px;font-weight:700;font-size:.88rem;border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 30px rgba(0,0,0,.4);max-width:90vw;text-align:center;';
    document.body.appendChild(t);
    window.setTimeout(() => t.remove(), 2600);
  };

  // Acciones por lote: favoritas, etiquetas, pausar y duplicar
  const selectedList = () => Array.from(selectedCards);
  const afterBatch = () => {
    selectedCards.clear();
    updateBatchDock();
  };
  container.querySelector('#btn-batch-star-action')?.addEventListener('click', () => {
    const ids = selectedList();
    if (!ids.length) return;
    const allStarred = ids.every((id) => deckService.getCardById(id)?.starred);
    deckService.setCardsFlags(ids, { starred: !allStarred });
    afterBatch();
  });
  container.querySelector('#btn-batch-suspend-action')?.addEventListener('click', () => {
    const ids = selectedList();
    if (!ids.length) return;
    const allSuspended = ids.every((id) => deckService.getCardById(id)?.suspended);
    deckService.setCardsFlags(ids, { suspended: !allSuspended });
    afterBatch();
  });
  container.querySelector('#btn-batch-tag-action')?.addEventListener('click', () => {
    const ids = selectedList();
    if (!ids.length) return;
    askTag(deck, (tag, remove) => {
      deckService.tagCards(ids, tag, remove);
      afterBatch();
    });
  });
  container.querySelector('#btn-batch-dup-action')?.addEventListener('click', () => {
    const ids = selectedList();
    if (!ids.length) return;
    deckService.duplicateCards(ids);
    afterBatch();
  });

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

  // Activar / quitar la versión inversa (tarjeta Reverso → Anverso) de varias tarjetas
  const setReversible = (enable: boolean) => {
    const ids = selectedList();
    if (!ids.length) return;
    const n = deckService.setReversible(ids, enable);
    showBatchToast(
      n > 0
        ? enable
          ? `⇄ Inversa activada en ${n} tarjeta${n === 1 ? '' : 's'}`
          : `Inversa quitada en ${n} tarjeta${n === 1 ? '' : 's'}`
        : enable
        ? 'Esas tarjetas ya tienen inversa (o son de huecos/oclusión)'
        : 'Ninguna de las seleccionadas tiene inversa'
    );
    afterBatch();
  };
  container.querySelector('#btn-batch-rev-on-action')?.addEventListener('click', () => setReversible(true));
  container.querySelector('#btn-batch-rev-off-action')?.addEventListener('click', () => setReversible(false));

  // Archivar / desarchivar
  container.querySelector('#btn-batch-archive-action')?.addEventListener('click', () => {
    const ids = selectedList();
    if (!ids.length) return;
    const allArchived = ids.every((id) => deckService.getCardById(id)?.archived);
    deckService.setCardsFlags(ids, allArchived ? { archived: false, suspended: false } : { archived: true, suspended: true });
    showBatchToast(allArchived ? `Desarchivadas ${ids.length}` : `📦 ${ids.length} archivada${ids.length === 1 ? '' : 's'} · las ves en el filtro «Archivadas»`);
    afterBatch();
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
            callbacks.onRefresh?.();
          }
        });
      }
    });
  });

  // Batch Move to Folder / Deck Modal
  container.querySelector('#btn-batch-move-action')?.addEventListener('click', () => {
    if (selectedCards.size === 0) return;

    const allDecks = deckService.getOnlyDecks();
    const modal = document.createElement('div');
    modal.className = 'apple-modal-overlay';
    modal.innerHTML = `
      <div class="apple-modal-content apple-glass-panel" style="max-width:440px; width:92%; padding:24px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
          <h3 style="font-size:1.25rem; font-weight:800; color:#fff;">Mover ${selectedCards.size} tarjeta(s)</h3>
          <button id="btn-close-move-modal" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
        </div>
        <p style="color:var(--f-text-secondary); font-size:0.9rem; margin-bottom:16px;">
          Selecciona el mazo de destino:
        </p>

        <div style="display:flex; flex-direction:column; gap:8px; max-height:280px; overflow-y:auto; margin-bottom:18px;">
          ${allDecks
            .map((d) => {
              const isCurrent = d.id === deck.id;
              return `
              <button class="target-deck-btn ${isCurrent ? 'disabled' : ''}" data-target-id="${d.id}" style="text-align:left; padding:12px 16px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#fff; font-weight:700; cursor:${isCurrent ? 'not-allowed' : 'pointer'}; display:flex; align-items:center; justify-content:space-between;">
                <span>🎴 ${d.name}</span>
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

              <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px;">
                <button class="menu-action-item-btn" id="btn-cmenu-star" style="padding:10px 6px; border-radius:12px; background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.3); color:#fbbf24; font-weight:700; font-size:0.82rem; cursor:pointer;">${targetCard.starred ? '★ Quitar favorita' : '☆ Favorita'}</button>
                <button class="menu-action-item-btn" id="btn-cmenu-suspend" style="padding:10px 6px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:0.82rem; cursor:pointer;">${targetCard.suspended ? '▶ Reactivar' : '⏸ Pausar'}</button>
                <button class="menu-action-item-btn" id="btn-cmenu-dup" style="padding:10px 6px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:0.82rem; cursor:pointer;">⧉ Duplicar</button>
              </div>

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

        modal.querySelector('#btn-cmenu-star')?.addEventListener('click', () => {
          closeModal();
          deckService.setCardsFlags([targetCard.id], { starred: !targetCard.starred });
        });
        modal.querySelector('#btn-cmenu-suspend')?.addEventListener('click', () => {
          closeModal();
          deckService.setCardsFlags([targetCard.id], { suspended: !targetCard.suspended });
        });
        modal.querySelector('#btn-cmenu-dup')?.addEventListener('click', () => {
          closeModal();
          deckService.duplicateCards([targetCard.id]);
        });

        modal.querySelector('#btn-cmenu-reset')?.addEventListener('click', () => {
          closeModal();
          deckService.resetCardProgress(targetCard.id);
          callbacks.onRefresh?.();
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
              callbacks.onRefresh?.();
            }
          });
        });
      });
    });
  };

  bindCardEvents();
}
