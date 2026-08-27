import { deckService } from '../services/deck.service';

export interface FigmaBatchImportOptions {
  deckId: string;
  onImported: (count: number) => void;
  onClose: () => void;
}

export function openFigmaBatchImportModal(options: FigmaBatchImportOptions): void {
  const existing = document.getElementById('modal-batch-import-root');
  if (existing) existing.remove();

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-batch-import-root">
      <div class="modal-container" style="max-width:580px; background:var(--f-surface); border:1px solid var(--f-border); border-radius:var(--f-radius-lg);">
        
        <div class="figma-modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="figma-icon-circle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#50b5ff" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div>
              <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">Importar Tarjetas en Lote</h3>
              <p style="font-size:0.75rem; color:var(--f-text-secondary);">Pega tus pares de Pregunta y Respuesta</p>
            </div>
          </div>
          <button class="figma-btn-ghost" id="btn-close-batch-modal">×</button>
        </div>

        <div class="modal-body" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Formato admitido: <code>Pregunta;Respuesta</code> o separado por tabulaciones (CSV/TSV)</label>
            <textarea 
              id="batch-raw-textarea" 
              class="figma-editor-textarea" 
              style="min-height:160px; border-radius:var(--f-radius-sm); font-size:0.88rem;"
              placeholder="¿Qué es el ortocentro?;Punto de intersección de las alturas de un triángulo&#10;¿Qué es la Vena Cava?;Vaso que transporta sangre desoxigenada al corazón&#10;Identidad de Euler;$$e^{i\\pi} + 1 = 0$$"
            ></textarea>
          </div>

          <div style="margin-top:16px; display:flex; justify-content:flex-end; gap:10px;">
            <button class="figma-btn-ghost" id="btn-cancel-batch">Cancelar</button>
            <button class="figma-btn-blue-pill" id="btn-confirm-batch-import">
              Importar Tarjetas
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const textarea = document.getElementById('batch-raw-textarea') as HTMLTextAreaElement | null;

  document.getElementById('btn-confirm-batch-import')?.addEventListener('click', () => {
    const raw = textarea?.value || '';
    const count = deckService.importBatchCards(options.deckId, raw);
    document.getElementById('modal-batch-import-root')?.remove();
    options.onImported(count);
  });

  const close = () => {
    document.getElementById('modal-batch-import-root')?.remove();
    options.onClose();
  };

  document.getElementById('btn-close-batch-modal')?.addEventListener('click', close);
  document.getElementById('btn-cancel-batch')?.addEventListener('click', close);
}
