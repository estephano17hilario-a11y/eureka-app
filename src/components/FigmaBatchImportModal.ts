import { deckService } from '../services/deck.service';
import { katexService } from '../services/katex.service';
import type { BatchParseOptions } from '../types/flashcard';

export interface FigmaBatchImportOptions {
  deckId: string;
  onImported: (count: number) => void;
  onClose: () => void;
}

export function openFigmaBatchImportModal(options: FigmaBatchImportOptions): void {
  const existing = document.getElementById('modal-batch-import-root');
  if (existing) existing.remove();

  const allDecks = deckService.getAllDecks();

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-batch-import-root">
      <div class="apple-glass-modal" style="max-width:720px; width:95%; max-height:92vh; display:flex; flex-direction:column; padding:0; overflow:hidden; border:1px solid rgba(255,255,255,0.14); box-shadow:0 28px 70px rgba(0,0,0,0.75);">
        
        <!-- Header -->
        <div class="figma-modal-header" style="padding:18px 24px; border-bottom:1px solid rgba(255,255,255,0.08); background:linear-gradient(180deg, rgba(255,255,255,0.04), transparent); display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:40px; height:40px; border-radius:12px; background:linear-gradient(135deg, rgba(56,189,248,0.25), rgba(16,185,129,0.25)); border:1px solid rgba(56,189,248,0.4); display:flex; align-items:center; justify-content:center; color:#38bdf8; font-size:1.3rem;">
              ⚡
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <h3 style="font-size:1.25rem; font-weight:800; color:#fff; letter-spacing:-0.02em; margin:0;">Importar Flashcards Masivas</h3>
                <span class="apple-badge-beta" style="background:rgba(56,189,248,0.2); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); font-size:0.72rem; padding:2px 8px; border-radius:6px; font-weight:800;">Sin Límites</span>
              </div>
              <p style="font-size:0.8rem; color:var(--f-text-secondary); margin:2px 0 0 0;">
                Pega cientos o miles de tarjetas de una sola vez • Soporta fórmulas KaTeX y Markdown
              </p>
            </div>
          </div>
          <button class="figma-btn-ghost" id="btn-close-batch-modal" style="width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:var(--f-text-secondary); display:flex; align-items:center; justify-content:center; font-size:1.2rem; cursor:pointer;">×</button>
        </div>

        <!-- Body -->
        <div class="modal-body" style="padding:20px 24px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:14px;">
          
          <!-- Target Deck Selector & Quick Actions -->
          <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px;">
            <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:220px;">
              <label style="font-size:0.78rem; font-weight:700; color:var(--f-text-muted); text-transform:uppercase; letter-spacing:0.04em;">Mazo destino:</label>
              <select id="batch-deck-select" class="cupertino-dialog-input" style="padding:6px 12px; font-size:0.88rem; text-align:left; flex:1; max-width:260px;">
                ${allDecks.map(d => `<option value="${d.id}" ${d.id === options.deckId ? 'selected' : ''}>${d.parentId ? '↳ ' : '📁 '} ${d.name}</option>`).join('')}
              </select>
            </div>

            <!-- Action buttons -->
            <div style="display:flex; align-items:center; gap:6px;">
              <button type="button" class="apple-btn-outline-pill" id="btn-batch-paste" style="font-size:0.75rem; padding:4px 10px; font-weight:700; color:#38bdf8; border-color:rgba(56,189,248,0.35);">
                📋 Pegar Portapapeles
              </button>
              <button type="button" class="apple-btn-outline-pill" id="btn-batch-example" style="font-size:0.75rem; padding:4px 10px; font-weight:700;">
                💡 Cargar Ejemplo
              </button>
              <button type="button" class="apple-btn-outline-pill" id="btn-batch-clear" style="font-size:0.75rem; padding:4px 10px; font-weight:700; color:#ef4444; border-color:rgba(239,68,68,0.3);">
                🗑️ Limpiar
              </button>
            </div>
          </div>

          <!-- Delimiter Selection Panel (Configuración de Separadores) -->
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:12px 16px; display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px;">
              <span style="font-size:0.8rem; font-weight:800; color:#fff; display:flex; align-items:center; gap:6px;">
                <span>✂️</span> Configuración de Separadores
              </span>
              <span style="font-size:0.72rem; color:var(--f-text-secondary);">
                Elige cómo dividir caras y tarjetas con opciones recomendadas o personalizadas
              </span>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
              
              <!-- 1. Separador entre Anverso y Reverso (Side Separator) -->
              <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-size:0.75rem; font-weight:700; color:var(--f-text-secondary); display:flex; align-items:center; justify-content:space-between;">
                  <span>Separador Anverso ⇄ Reverso</span>
                  <span class="apple-badge-subpill" style="font-size:0.68rem; color:#38bdf8; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.25);">Entre lados</span>
                </label>
                <div style="display:flex; gap:6px; align-items:center;">
                  <select id="batch-side-separator" class="cupertino-dialog-input" style="padding:7px 10px; font-size:0.84rem; text-align:left; flex:1;">
                    <option value=";" selected>; Punto y coma (Recomendado)</option>
                    <option value="auto">⚡ Automático (Detección inteligente)</option>
                    <option value="\\t">⇥ Tabulación [TAB] (Recomendado)</option>
                    <option value=":::">::: Tres dos puntos (Recomendado)</option>
                    <option value="|">| Barra vertical</option>
                    <option value=",">, Coma</option>
                    <option value=" - ">- Guion con espacios</option>
                    <option value=" : ">: Dos puntos con espacios</option>
                    <option value="custom">✏️ Personalizado...</option>
                  </select>
                  <input 
                    type="text" 
                    id="batch-side-custom" 
                    placeholder="Separador" 
                    class="cupertino-dialog-input hidden" 
                    style="width:90px; padding:7px 8px; font-size:0.84rem;"
                  />
                </div>
              </div>

              <!-- 2. Separador entre Flashcards (Card Separator) -->
              <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-size:0.75rem; font-weight:700; color:var(--f-text-secondary); display:flex; align-items:center; justify-content:space-between;">
                  <span>Separador entre Flashcards</span>
                  <span class="apple-badge-subpill" style="font-size:0.68rem; color:#10b981; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.25);">Entre tarjetas</span>
                </label>
                <div style="display:flex; gap:6px; align-items:center;">
                  <select id="batch-card-separator" class="cupertino-dialog-input" style="padding:7px 10px; font-size:0.84rem; text-align:left; flex:1;">
                    <option value="\\n" selected>↵ Salto de línea (1 por línea) (Recomendado)</option>
                    <option value="\\n\\n">↵↵ Línea vacía (Doble salto) (Recomendado)</option>
                    <option value=";;;">;;; Tres puntos y coma</option>
                    <option value="---">--- Tres guiones</option>
                    <option value="|">| Barra vertical</option>
                    <option value="custom">✏️ Personalizado...</option>
                  </select>
                  <input 
                    type="text" 
                    id="batch-card-custom" 
                    placeholder="Separador" 
                    class="cupertino-dialog-input hidden" 
                    style="width:90px; padding:7px 8px; font-size:0.84rem;"
                  />
                </div>
              </div>

            </div>
          </div>

          <!-- UNLIMITED TEXTAREA CONTAINER -->
          <div style="position:relative; display:flex; flex-direction:column;">
            <textarea 
              id="batch-raw-textarea" 
              class="figma-editor-textarea" 
              style="min-height:220px; max-height:420px; border-radius:14px; font-size:0.9rem; line-height:1.55; padding:16px; font-family:'Fira Code', 'SF Mono', Consolas, Menlo, monospace; background:rgba(0,0,0,0.35); border:1.5px solid rgba(255,255,255,0.12); color:#ffffff; resize:vertical; outline:none;"
              placeholder="Pega aquí tus pares de Pregunta y Respuesta&#10;Ejemplo:&#10;¿Qué es la fotosíntesis?;Proceso químico que convierte dióxido de carbono y agua en glucosa usando luz solar&#10;Teorema de Pitágoras;$$a^2 + b^2 = c^2$$"
              spellcheck="false"
              autocomplete="off"
            ></textarea>
          </div>

          <!-- Live Detection Metrics Bar -->
          <div id="batch-stats-bar" style="display:flex; align-items:center; justify-content:space-between; background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.2); border-radius:12px; padding:10px 14px; font-size:0.85rem; color:#fff;">
            <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
              <span style="font-weight:800; color:#38bdf8;" id="stat-cards-count">🎴 0 tarjetas detectadas</span>
              <span style="color:var(--f-text-secondary);" id="stat-chars-count">📝 0 caracteres (Sin límite)</span>
              <span style="color:var(--f-text-secondary);" id="stat-lines-count">📄 0 líneas</span>
            </div>
            <button type="button" class="apple-btn-outline-pill" id="btn-toggle-preview" style="font-size:0.74rem; padding:3px 10px; color:var(--f-blue); border-color:rgba(56,189,248,0.3); display:none;">
              👁️ Previsualizar
            </button>
          </div>

          <!-- Real-Time Parsed Cards Preview (Collapsible) -->
          <div id="batch-preview-drawer" class="hidden" style="border:1px solid rgba(255,255,255,0.08); border-radius:14px; background:rgba(0,0,0,0.25); padding:12px; max-height:200px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
            <div style="font-size:0.78rem; font-weight:800; color:var(--f-text-muted); text-transform:uppercase; letter-spacing:0.04em;">
              Vista Previa en Vivo de Flashcards a Importar:
            </div>
            <div id="batch-preview-list" style="display:flex; flex-direction:column; gap:8px;"></div>
          </div>

        </div>

        <!-- Footer -->
        <div style="padding:16px 24px 20px; border-top:1px solid rgba(255,255,255,0.08); background:linear-gradient(0deg, rgba(255,255,255,0.03), transparent); display:flex; align-items:center; justify-content:space-between;">
          <button class="dialog-btn dialog-btn-cancel" id="btn-cancel-batch" style="padding:10px 18px; font-size:0.92rem;">
            Cancelar
          </button>
          
          <button class="dialog-btn dialog-btn-primary" id="btn-confirm-batch-import" style="padding:12px 24px; font-size:0.95rem; font-weight:800; background:linear-gradient(135deg, #38bdf8, #2563eb); color:#ffffff; box-shadow:0 4px 18px rgba(56,189,248,0.4); opacity:0.6; pointer-events:none; transition:all 0.2s ease;">
            🚀 Importar 0 Tarjetas
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const textarea = document.getElementById('batch-raw-textarea') as HTMLTextAreaElement | null;
  const deckSelect = document.getElementById('batch-deck-select') as HTMLSelectElement | null;
  const sideSelect = document.getElementById('batch-side-separator') as HTMLSelectElement | null;
  const sideCustom = document.getElementById('batch-side-custom') as HTMLInputElement | null;
  const cardSelect = document.getElementById('batch-card-separator') as HTMLSelectElement | null;
  const cardCustom = document.getElementById('batch-card-custom') as HTMLInputElement | null;

  const statCards = document.getElementById('stat-cards-count');
  const statChars = document.getElementById('stat-chars-count');
  const statLines = document.getElementById('stat-lines-count');
  const btnTogglePreview = document.getElementById('btn-toggle-preview') as HTMLButtonElement | null;
  const previewDrawer = document.getElementById('batch-preview-drawer');
  const previewList = document.getElementById('batch-preview-list');
  const btnConfirm = document.getElementById('btn-confirm-batch-import') as HTMLButtonElement | null;

  let isPreviewOpen = false;

  const getActiveSeparators = (): BatchParseOptions => {
    let sideSeparator = sideSelect?.value || ';';
    if (sideSeparator === 'custom') {
      sideSeparator = sideCustom?.value.trim() || ';';
    }

    let cardSeparator = cardSelect?.value || '\\n';
    if (cardSeparator === 'custom') {
      cardSeparator = cardCustom?.value || '\\n';
    }

    return { sideSeparator, cardSeparator };
  };

  const updateBatchMetrics = () => {
    if (!textarea) return;
    const raw = textarea.value;
    const seps = getActiveSeparators();
    const parsed = deckService.parseBatchCards(raw, seps);
    const charCount = raw.length;
    const lineCount = raw ? raw.split('\n').length : 0;

    if (statCards) statCards.textContent = `🎴 ${parsed.length} tarjeta${parsed.length === 1 ? '' : 's'} detectada${parsed.length === 1 ? '' : 's'}`;
    if (statChars) statChars.textContent = `📝 ${charCount.toLocaleString()} caracteres (Sin límite)`;
    if (statLines) statLines.textContent = `📄 ${lineCount.toLocaleString()} líneas`;

    if (btnConfirm) {
      if (parsed.length > 0) {
        btnConfirm.style.opacity = '1';
        btnConfirm.style.pointerEvents = 'auto';
        btnConfirm.innerHTML = `🚀 Importar ${parsed.length} Tarjeta${parsed.length === 1 ? '' : 's'}`;
      } else {
        btnConfirm.style.opacity = '0.5';
        btnConfirm.style.pointerEvents = 'none';
        btnConfirm.innerHTML = `🚀 Importar 0 Tarjetas`;
      }
    }

    if (btnTogglePreview) {
      btnTogglePreview.style.display = parsed.length > 0 ? 'inline-block' : 'none';
    }

    if (previewList && isPreviewOpen) {
      renderPreviewList(parsed);
    }
  };

  const renderPreviewList = (parsed: Array<{ front: string; back: string; type: string }>) => {
    if (!previewList) return;
    if (parsed.length === 0) {
      previewList.innerHTML = '<div style="font-size:0.8rem; color:var(--f-text-secondary); text-align:center;">No se detectaron tarjetas válidas todavía. Revisa los separadores elegidos arriba.</div>';
      return;
    }

    previewList.innerHTML = parsed.slice(0, 100).map((c, i) => `
      <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:8px 12px; font-size:0.84rem;">
        <div style="font-weight:700; color:#fff; margin-bottom:2px;">#${i + 1}: ${katexService.parseAndRender(c.front)}</div>
        <div style="color:var(--f-text-secondary); font-size:0.8rem; line-height:1.4;">↳ ${katexService.parseAndRender(c.back)}</div>
      </div>
    `).join('') + (parsed.length > 100 ? `<div style="text-align:center; font-size:0.8rem; color:var(--f-blue); font-weight:700;">+ ${parsed.length - 100} tarjetas más...</div>` : '');
  };

  // Separator controls event handling
  sideSelect?.addEventListener('change', () => {
    if (sideSelect.value === 'custom') {
      sideCustom?.classList.remove('hidden');
      sideCustom?.focus();
    } else {
      sideCustom?.classList.add('hidden');
    }
    updateBatchMetrics();
  });

  sideCustom?.addEventListener('input', updateBatchMetrics);

  cardSelect?.addEventListener('change', () => {
    if (cardSelect.value === 'custom') {
      cardCustom?.classList.remove('hidden');
      cardCustom?.focus();
    } else {
      cardCustom?.classList.add('hidden');
    }
    updateBatchMetrics();
  });

  cardCustom?.addEventListener('input', updateBatchMetrics);

  textarea?.addEventListener('input', updateBatchMetrics);

  // Toggle preview
  btnTogglePreview?.addEventListener('click', () => {
    isPreviewOpen = !isPreviewOpen;
    if (previewDrawer) {
      if (isPreviewOpen) {
        previewDrawer.classList.remove('hidden');
        btnTogglePreview.textContent = '🙈 Ocultar';
        const parsed = deckService.parseBatchCards(textarea?.value || '', getActiveSeparators());
        renderPreviewList(parsed);
      } else {
        previewDrawer.classList.add('hidden');
        btnTogglePreview.textContent = '👁️ Previsualizar';
      }
    }
  });

  // Paste from clipboard
  document.getElementById('btn-batch-paste')?.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (textarea && text) {
          textarea.value = textarea.value ? `${textarea.value}\n${text}` : text;
          updateBatchMetrics();
          textarea.focus();
        }
      } else {
        textarea?.focus();
      }
    } catch {
      textarea?.focus();
    }
  });

  // Load example dynamically based on currently chosen separators
  document.getElementById('btn-batch-example')?.addEventListener('click', () => {
    if (textarea) {
      const seps = getActiveSeparators();
      let s = seps.sideSeparator || ';';
      if (s === '\\t') s = '\t';
      if (s === 'auto') s = ';';

      let c = '\n';
      if (seps.cardSeparator === '\\n\\n') c = '\n\n';
      else if (seps.cardSeparator === '---') c = '\n---\n';
      else if (seps.cardSeparator === ';;;') c = ';;;\n';
      else if (seps.cardSeparator && seps.cardSeparator !== '\\n' && seps.cardSeparator !== 'auto') {
        c = seps.cardSeparator.includes('\n') ? seps.cardSeparator : ` ${seps.cardSeparator} `;
      }

      const exampleCards = [
        `¿Qué es el principio de Arquímedes?${s}Todo cuerpo sumergido experimenta un empuje vertical hacia arriba igual al peso del fluido desalojado: $$F_E = \\rho \\cdot g \\cdot V$$`,
        `¿Qué es la Vena Cava Superior?${s}Gran vaso que transporta sangre desoxigenada desde la parte superior del cuerpo hacia la aurícula derecha del corazón.`,
        `Identidad de Euler${s}$$e^{i\\pi} + 1 = 0$$ vincula las 5 constantes matemáticas fundamentales.`,
        `Ley de Ohm${s}$$V = I \\cdot R$$ (El voltaje es directamente proporcional a la corriente y resistencia).`,
        `Función de la Mitocondria${s}Produce ATP a través de la respiración celular (central energética celular).`
      ];

      textarea.value = exampleCards.join(c);
      updateBatchMetrics();
    }
  });

  // Clear
  document.getElementById('btn-batch-clear')?.addEventListener('click', () => {
    if (textarea) {
      textarea.value = '';
      updateBatchMetrics();
    }
  });

  // Confirm Import
  btnConfirm?.addEventListener('click', () => {
    const raw = textarea?.value || '';
    const targetDeckId = deckSelect?.value || options.deckId;
    const count = deckService.importBatchCards(targetDeckId, raw, getActiveSeparators());
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
