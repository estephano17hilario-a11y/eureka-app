import { deckService } from '../services/deck.service';
import { katexService } from '../services/katex.service';

export interface FigmaLibraryCallbacks {
  onAddCard: () => void;
  onEditCard: (cardId: string) => void;
  onStudySpecificCard: (deckId: string, cardId: string) => void;
}

export function renderFigmaLibraryView(): string {
  const allCards = deckService.getAllDecks().flatMap((d) => deckService.getCardsByDeck(d.id, false));

  return `
    <div style="padding-bottom:90px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
        <div>
          <h2 style="font-size:1.75rem; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">Biblioteca de Tarjetas</h2>
          <p style="font-size:0.85rem; color:var(--f-text-secondary);">Toca cualquier tarjeta para repasarla individualmente</p>
        </div>
        <span class="apple-badge-subpill" style="font-size:0.9rem; font-weight:800;">
          ${allCards.length} tarjetas
        </span>
      </div>

      ${
        allCards.length === 0
          ? `
        <div style="padding:60px 20px; text-align:center;">
          <p style="color:var(--f-text-secondary); margin-bottom:16px;">No hay tarjetas en tu biblioteca.</p>
          <button class="figma-btn-blue-pill" id="btn-library-empty-add" style="margin:0 auto;">
            + Crear Primera Tarjeta
          </button>
        </div>
      `
          : allCards
              .map(
                (c) => `
        <div class="figma-card-item apple-glass-panel clickable-lib-card-row" data-card-id="${c.id}" data-deck-id="${c.deckId}" title="Toca para aprender esta tarjeta">
          <div class="figma-card-top-tag-row">
            <div class="figma-tag-invertido">
              ${
                c.isInverted
                  ? `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                <span>Invertido</span>
              `
                  : c.type === 'image_occlusion'
                  ? `<span>🖼️ Oclusión de Imagen</span>`
                  : `<span>Estándar</span>`
              }
              <span class="apple-badge-subpill" style="font-size:0.72rem; padding:1px 6px; margin-left:6px;">🎯 Estudiar</span>
            </div>
            
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn-lib-card-edit" data-edit-id="${c.id}" style="background:none; border:none; color:var(--f-blue); cursor:pointer; font-size:0.88rem; font-weight:700;">✏️ Editar</button>
              <button class="btn-lib-card-del" data-del-id="${c.id}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.88rem; font-weight:700;">🗑️</button>
            </div>
          </div>

          <div class="figma-card-title-bold">
            ${c.front}
          </div>

          <div class="figma-card-body-text">
            ${katexService.parseAndRender(c.back)}
          </div>

          ${
            c.type === 'image_occlusion' || c.frontImage || c.backImage
              ? `
            <div style="color:var(--f-text-muted); margin-top:4px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
          `
              : ''
          }
        </div>
      `
              )
              .join('')
      }

      <!-- Floating Add Button -->
      <div class="figma-floating-add-btn-wrap">
        <button class="figma-btn-white-pill" id="btn-library-floating-add" style="box-shadow:0 10px 32px rgba(0,0,0,0.6); padding:14px 32px;">
          Agregar tarjetas
        </button>
      </div>

      <!-- Floating Help -->
      <button class="figma-fab-help" id="btn-fab-help" title="Ayuda">
        ?
      </button>
    </div>
  `;
}

export function bindFigmaLibraryEvents(container: HTMLElement, callbacks: FigmaLibraryCallbacks): void {
  container.querySelector('#btn-library-floating-add')?.addEventListener('click', () => callbacks.onAddCard());
  container.querySelector('#btn-library-empty-add')?.addEventListener('click', () => callbacks.onAddCard());

  container.querySelectorAll('.clickable-lib-card-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('btn-lib-card-edit') || target.classList.contains('btn-lib-card-del')) {
        return;
      }
      const cardId = (row as HTMLElement).dataset.cardId;
      const deckId = (row as HTMLElement).dataset.deckId;
      if (cardId && deckId) {
        callbacks.onStudySpecificCard(deckId, cardId);
      }
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.btn-lib-card-edit').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.editId;
      if (id) callbacks.onEditCard(id);
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.btn-lib-card-del').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.delId;
      if (id && confirm('¿Eliminar esta tarjeta definitivamente?')) {
        deckService.deleteCard(id);
      }
    });
  });
}
