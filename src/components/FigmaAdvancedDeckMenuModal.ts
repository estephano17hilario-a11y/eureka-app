import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { dialogService } from '../services/dialog.service';
import { openFigmaAlgorithmSelectorModal } from './FigmaAlgorithmSelectorModal';
import { openFigmaAiBuilderModal } from './FigmaAiBuilderModal';
import { openFigmaBatchImportModal } from './FigmaBatchImportModal';

export interface FigmaAdvancedDeckMenuOptions {
  deck: Deck;
  onActionCompleted: () => void;
  onClose: () => void;
}

export function openFigmaAdvancedDeckMenuModal(options: FigmaAdvancedDeckMenuOptions): void {
  const existing = document.getElementById('modal-adv-menu-root');
  if (existing) existing.remove();

  const deck = options.deck;

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-adv-menu-root">
      <div class="apple-glass-modal" style="max-width:580px; max-height:88vh; display:flex; flex-direction:column;">
        
        <!-- Header -->
        <div class="figma-modal-header" style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">Opciones de Mazo</h3>
          <button class="figma-btn-ghost" id="btn-close-adv-menu">×</button>
        </div>

        <div style="padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:14px;">
          
          <!-- Group 1: Algoritmo -->
          <div class="apple-card-grouped">
            <div class="apple-list-row" id="adv-row-algo" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--f-blue)" stroke-width="2.5"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="10" y2="21"/></svg>
                <div>
                  <div style="font-size:0.98rem; font-weight:700; color:#fff;">Personalizado</div>
                  <div style="font-size:0.75rem; color:var(--f-text-secondary);">Ajustes predeterminados del algoritmo</div>
                </div>
              </div>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <!-- Group 2: Audio y Estilo -->
          <div class="apple-card-grouped">
            <div class="apple-list-row" id="adv-row-tts" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">🔊</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Texto a voz</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="color:var(--f-text-secondary); font-size:0.85rem;">${deck.settings.ttsVoiceLang}</span>
                <span class="apple-chevron">›</span>
              </div>
            </div>

            <div class="apple-list-row" id="adv-row-style" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">🗂</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Estilo de la tarjeta</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <!-- Group 3: Compartir y Biblioteca -->
          <div class="apple-card-grouped">
            <div class="apple-list-row" id="adv-row-share" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">⬆</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Compartir mazo</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="color:var(--f-text-secondary); font-size:0.85rem;">Off</span>
                <span class="apple-chevron">›</span>
              </div>
            </div>

            <div class="apple-list-row" id="adv-row-publish" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">🖫</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Publicar en la biblioteca</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <!-- Group 4: Acciones Avanzadas -->
          <div class="apple-card-grouped">
            <div class="apple-list-row" id="adv-row-ai" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem; color:#ec4899;">✨</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Generar tarjetas con IA</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span class="apple-badge-beta">Beta</span>
                <span class="apple-chevron">›</span>
              </div>
            </div>

            <div class="apple-list-row" id="adv-row-import" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">⬇</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Importar tarjetas</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <div class="apple-list-row" id="adv-row-rename" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">✏️</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Cambiar el nombre del mazo</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <div class="apple-list-row" id="adv-row-move" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">↪</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Mover mazo</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <div class="apple-list-row" id="adv-row-duplicate" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">🗎</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Duplicar mazo</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <div class="apple-list-row" id="adv-row-reset" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">↺</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Restablecer progreso</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <div class="apple-list-row" id="adv-row-archive" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">📥</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Archivar mazo</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <div class="apple-list-row" id="adv-row-export" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem;">⬆</span>
                <span style="font-size:0.98rem; font-weight:600; color:#fff;">Exportar mazo</span>
              </div>
              <span class="apple-chevron">›</span>
            </div>

            <div class="apple-list-row" id="adv-row-delete" style="cursor:pointer;">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.1rem; color:#ef4444;">🗑️</span>
                <span style="font-size:0.98rem; font-weight:700; color:#ef4444;">Eliminar mazo</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Rename
  document.getElementById('adv-row-rename')?.addEventListener('click', () => {
    dialogService.showPrompt({
      title: 'Renombrar Mazo',
      defaultValue: deck.name,
      confirmText: 'Guardar',
      onConfirm: (name) => {
        if (name && name.trim()) {
          deckService.renameDeck(deck.id, name.trim());
          document.getElementById('modal-adv-menu-root')?.remove();
          options.onActionCompleted();
        }
      }
    });
  });

  // Duplicate
  document.getElementById('adv-row-duplicate')?.addEventListener('click', () => {
    deckService.duplicateDeck(deck.id);
    document.getElementById('modal-adv-menu-root')?.remove();
    options.onActionCompleted();
  });

  // Reset Progress
  document.getElementById('adv-row-reset')?.addEventListener('click', () => {
    dialogService.showConfirm({
      title: 'Restablecer Progreso',
      message: `¿Estás seguro de restablecer todo el progreso de estudio en "${deck.name}"? Todas las tarjetas volverán al estado nuevo.`,
      confirmText: 'Restablecer',
      isDanger: true,
      onConfirm: () => {
        deckService.resetDeckProgress(deck.id);
        document.getElementById('modal-adv-menu-root')?.remove();
        options.onActionCompleted();
      }
    });
  });

  // Archive
  document.getElementById('adv-row-archive')?.addEventListener('click', () => {
    dialogService.showConfirm({
      title: 'Archivar Mazo',
      message: `¿Deseas archivar el mazo "${deck.name}"?`,
      confirmText: 'Archivar',
      onConfirm: () => {
        deckService.archiveDeck(deck.id);
        document.getElementById('modal-adv-menu-root')?.remove();
        options.onActionCompleted();
      }
    });
  });

  // Export
  document.getElementById('adv-row-export')?.addEventListener('click', () => {
    const json = deckService.exportDeck(deck.id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.toLowerCase().replace(/\s+/g, '_')}_backup.json`;
    a.click();
  });

  // Delete
  document.getElementById('adv-row-delete')?.addEventListener('click', () => {
    dialogService.showConfirm({
      title: 'Eliminar Mazo Definitivamente',
      message: `¿ELIMINAR DEFINITIVAMENTE el mazo "${deck.name}" y todas sus tarjetas? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar Mazo',
      isDanger: true,
      onConfirm: () => {
        deckService.deleteDeck(deck.id);
        document.getElementById('modal-adv-menu-root')?.remove();
        options.onActionCompleted();
      }
    });
  });

  // AI Generator
  document.getElementById('adv-row-ai')?.addEventListener('click', () => {
    document.getElementById('modal-adv-menu-root')?.remove();
    openFigmaAiBuilderModal({
      deckId: deck.id,
      onBatchAdded: () => options.onActionCompleted(),
      onClose: () => {}
    });
  });

  // Batch Import
  document.getElementById('adv-row-import')?.addEventListener('click', () => {
    document.getElementById('modal-adv-menu-root')?.remove();
    openFigmaBatchImportModal({
      deckId: deck.id,
      onImported: () => options.onActionCompleted(),
      onClose: () => {}
    });
  });

  // Open Algorithm Modal
  document.getElementById('adv-row-algo')?.addEventListener('click', () => {
    document.getElementById('modal-adv-menu-root')?.remove();
    openFigmaAlgorithmSelectorModal({
      deck,
      onSaved: () => options.onActionCompleted(),
      onClose: () => {}
    });
  });

  const close = () => {
    document.getElementById('modal-adv-menu-root')?.remove();
    options.onClose();
  };

  document.getElementById('btn-close-adv-menu')?.addEventListener('click', close);
}
