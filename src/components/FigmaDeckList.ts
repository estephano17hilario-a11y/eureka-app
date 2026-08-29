import { deckService } from '../services/deck.service';

export interface FigmaDeckListCallbacks {
  onSelectDeck: (deckId: string) => void;
  onAdd: () => void;
}

export function renderFigmaDeckList(): string {
  const rootDecks = deckService.getRootDecks();

  if (rootDecks.length === 0) {
    return `
      <div>
        <!-- Responsive Action Header -->
        <div class="figma-action-header">
          <h2 class="figma-view-title">Inicio</h2>
          <div class="figma-header-actions-group">
            <button class="figma-btn-white-pill" id="btn-main-add" style="display:flex; align-items:center; gap:6px; font-weight:700;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Crear</span>
            </button>
          </div>
        </div>

        <!-- Empty State Centralizado para Nuevas Cuentas -->
        <div class="figma-card-container apple-glass-panel" style="padding:56px 24px; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:420px; border-radius:26px;">
          <div style="width:84px; height:84px; border-radius:24px; background:linear-gradient(135deg, rgba(56,189,248,0.18), rgba(139,92,246,0.18)); border:1.5px solid rgba(56,189,248,0.3); display:flex; align-items:center; justify-content:center; margin-bottom:20px; box-shadow:0 12px 30px rgba(56,189,248,0.2);">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
          </div>

          <h3 style="font-size:1.55rem; font-weight:900; color:#ffffff; margin:0 0 10px 0; letter-spacing:-0.02em;">¡Bienvenido a tu Espacio Eureka!</h3>
          <p style="font-size:0.96rem; color:var(--f-text-secondary); max-width:420px; line-height:1.55; margin:0 0 28px 0;">
            No tienes ninguna carpeta ni mazo creado todavía. Empieza organizando tus materias o creando un mazo de tarjetas.
          </p>

          <button class="figma-btn-blue-pill" id="btn-create-first-deck" style="padding:16px 36px; font-size:1.08rem; font-weight:800; border-radius:9999px; box-shadow:0 10px 30px rgba(56,189,248,0.4); display:inline-flex; align-items:center; gap:10px; cursor:pointer;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#07080a" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Crea tu primera carpeta / mazo</span>
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div>
      <!-- Responsive Action Header -->
      <div class="figma-action-header">
        <h2 class="figma-view-title">Inicio</h2>

        <div class="figma-header-actions-group">
          <button class="figma-btn-white-pill" id="btn-main-add" style="display:flex; align-items:center; gap:6px; font-weight:700;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Agregar</span>
          </button>
        </div>
      </div>

      <!-- Main Deck List Container -->
      <div class="figma-card-container apple-glass-panel">
        ${rootDecks
          .map(
            (d) => `
          <div class="figma-deck-row" data-deck-id="${d.id}">
            <div class="figma-deck-left">
              <div class="figma-deck-folder-icon" style="background:${d.color}15; border-color:${d.color}; color:${d.color};">
                ${
                  d.icon === 'deck'
                    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`
                    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
                }
              </div>
              <div class="figma-deck-info-wrap">
                <span class="figma-deck-title">${d.name}</span>
                <div class="figma-deck-subtext">${d.description || (d.icon === 'deck' ? 'Mazo de tarjetas' : 'Carpeta de temas')}</div>
              </div>
            </div>

            <span class="figma-chevron">›</span>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

export function bindFigmaDeckListEvents(container: HTMLElement, callbacks: FigmaDeckListCallbacks): void {
  container.querySelectorAll('.figma-deck-row').forEach((card) => {
    card.addEventListener('click', () => {
      const id = (card as HTMLElement).dataset.deckId;
      if (id) callbacks.onSelectDeck(id);
    });
  });

  container.querySelector('#btn-main-add')?.addEventListener('click', () => callbacks.onAdd());
  container.querySelector('#btn-create-first-deck')?.addEventListener('click', () => callbacks.onAdd());
}
