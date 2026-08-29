import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { dialogService } from '../services/dialog.service';

export interface FigmaAdvancedDeckMenuViewCallbacks {
  onBack: () => void;
  onOpenDeckSettings: () => void;
  onOpenAlgorithmSelector: () => void;
  onOpenAiBuilder: () => void;
  onOpenBatchImport: () => void;
  onActionCompleted: () => void;
}

export function renderFigmaAdvancedDeckMenuView(deck: Deck): string {
  const currentTheme = localStorage.getItem('eureka_theme') || 'oled';

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
      ? 'Repaso general'
      : 'Personalizado';

  return `
    <div class="ios-fullscreen-view">
      
      <!-- iOS Native Header -->
      <div class="ios-navbar">
        <button class="ios-back-btn" id="btn-adv-view-back" title="Volver al Mazo">
          <span class="ios-back-chevron">‹</span> Mazo
        </button>
        <h1 class="ios-nav-title">Opciones del Mazo</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:16px;">
        
        <div style="margin-bottom:4px;">
          <h2 style="font-size:1.55rem; font-weight:900; color:#ffffff; letter-spacing:-0.02em; margin:0 0 4px 0;">${deck.name}</h2>
          <p style="font-size:0.88rem; color:var(--f-text-secondary); margin:0;">Gestión general, creación con IA y configuración</p>
        </div>

        <!-- Grupo Principal: CONFIGURACIÓN DE INTERVALOS Y ALGORITMO (Solicitud #1) -->
        <div class="apple-card-grouped" style="border:1.5px solid rgba(56,189,248,0.3); background:rgba(56,189,248,0.06);">
          <div class="apple-list-row" id="adv-view-row-settings" style="cursor:pointer;" title="Configuración de intervalos">
            <div style="display:flex; align-items:center; gap:14px;">
              <div style="width:42px; height:42px; border-radius:12px; background:linear-gradient(135deg, #38bdf8, #818cf8); display:flex; align-items:center; justify-content:center; color:#07080a; font-weight:900; font-size:1.25rem; box-shadow:0 6px 18px rgba(56,189,248,0.35);">
                ⚙️
              </div>
              <div>
                <div style="font-size:1.06rem; font-weight:800; color:#fff;">Configuración de Intervalos & Algoritmo</div>
                <div style="font-size:0.82rem; color:var(--f-blue); font-weight:600;">Algoritmo activo: ${algoLabel} · ${deck.settings.newCardsPerDay} nuevas/día</div>
              </div>
            </div>
            <span class="apple-chevron" style="color:var(--f-blue); font-size:1.4rem;">›</span>
          </div>
        </div>

        <!-- Grupo 2: Herramientas de Creación e Importación -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="adv-view-row-ai" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <div style="width:36px; height:36px; border-radius:10px; background:rgba(236,72,153,0.15); color:#ec4899; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                ✨
              </div>
              <div>
                <div style="font-size:1.02rem; font-weight:700; color:#fff;">Generar tarjetas con IA</div>
                <div style="font-size:0.78rem; color:var(--f-text-secondary);">Crea flashcards automáticas a partir de texto o PDFs</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="apple-badge-beta" style="background:#ec4899; color:#fff; font-size:0.75rem; padding:3px 8px; border-radius:6px; font-weight:800;">AI Builder</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <div class="apple-list-row" id="adv-view-row-import" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <div style="width:36px; height:36px; border-radius:10px; background:rgba(16,185,129,0.15); color:#10b981; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                ⬇
              </div>
              <div>
                <div style="font-size:1.02rem; font-weight:700; color:#fff;">Importar tarjetas masivamente</div>
                <div style="font-size:0.78rem; color:var(--f-text-secondary);">Cargar desde Excel (.xlsx), CSV, TXT o Anki</div>
              </div>
            </div>
            <span class="apple-chevron">›</span>
          </div>
        </div>

        <!-- Grupo 3: Audio y Estilo Visual -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="adv-view-row-theme" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">🎨</span>
              <div>
                <div style="font-size:1.02rem; font-weight:600; color:#fff;">Tema Visual y Fondo de la App</div>
                <div style="font-size:0.78rem; color:var(--f-text-secondary);">OLED, Liquid Glass o Emerald</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="color:var(--f-blue); font-size:0.92rem; font-weight:700; text-transform:capitalize;" id="lbl-active-theme">${currentTheme}</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <div class="apple-list-row" id="adv-view-row-tts" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">🔊</span>
              <div>
                <div style="font-size:1.02rem; font-weight:600; color:#fff;">Voz y Pronunciación (TTS)</div>
                <div style="font-size:0.78rem; color:var(--f-text-secondary);">Idioma de lectura en voz alta</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="color:var(--f-text-secondary); font-size:0.9rem;">${deck.settings.ttsVoiceLang}</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>
        </div>

        <!-- Grupo 4: Gestión y Copias de Seguridad -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="adv-view-row-rename" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">✏️</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Cambiar el nombre del mazo</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-duplicate" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">🗎</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Duplicar mazo</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-reset" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">↺</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Restablecer progreso de estudio</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-export" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">⬆</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Exportar copia de seguridad (JSON)</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-delete" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem; color:#ef4444;">🗑️</span>
              <span style="font-size:1.02rem; font-weight:700; color:#ef4444;">Eliminar mazo definitivamente</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}

export function bindFigmaAdvancedDeckMenuViewEvents(
  container: HTMLElement,
  deck: Deck,
  callbacks: FigmaAdvancedDeckMenuViewCallbacks
): void {
  container.querySelector('#btn-adv-view-back')?.addEventListener('click', () => callbacks.onBack());
  container.querySelector('#adv-view-row-settings')?.addEventListener('click', () => callbacks.onOpenDeckSettings());
  container.querySelector('#adv-view-row-ai')?.addEventListener('click', () => callbacks.onOpenAiBuilder());
  container.querySelector('#adv-view-row-import')?.addEventListener('click', () => callbacks.onOpenBatchImport());

  // Theme Selector
  container.querySelector('#adv-view-row-theme')?.addEventListener('click', () => {
    const themes = ['oled', 'glass', 'emerald'];
    const current = localStorage.getItem('eureka_theme') || 'oled';
    const nextIdx = (themes.indexOf(current) + 1) % themes.length;
    const next = themes[nextIdx];
    localStorage.setItem('eureka_theme', next);

    document.body.className = '';
    document.body.classList.add(`theme-${next}`);

    const lbl = container.querySelector('#lbl-active-theme');
    if (lbl) lbl.textContent = next;
  });

  // Rename
  container.querySelector('#adv-view-row-rename')?.addEventListener('click', () => {
    dialogService.showPrompt({
      title: 'Renombrar Mazo',
      defaultValue: deck.name,
      confirmText: 'Guardar',
      onConfirm: (name) => {
        if (name && name.trim()) {
          deckService.renameDeck(deck.id, name.trim());
          callbacks.onActionCompleted();
        }
      }
    });
  });

  // Duplicate
  container.querySelector('#adv-view-row-duplicate')?.addEventListener('click', () => {
    deckService.duplicateDeck(deck.id);
    callbacks.onActionCompleted();
  });

  // Reset Progress
  container.querySelector('#adv-view-row-reset')?.addEventListener('click', () => {
    dialogService.showConfirm({
      title: 'Restablecer Progreso',
      message: `¿Estás seguro de restablecer todo el progreso de estudio en "${deck.name}"? Todas las tarjetas volverán al estado nuevo.`,
      confirmText: 'Restablecer',
      isDanger: true,
      onConfirm: () => {
        deckService.resetDeckProgress(deck.id);
        callbacks.onActionCompleted();
      }
    });
  });

  // Export
  container.querySelector('#adv-view-row-export')?.addEventListener('click', () => {
    const json = deckService.exportDeck(deck.id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.toLowerCase().replace(/\s+/g, '_')}_backup.json`;
    a.click();
  });

  // Delete
  container.querySelector('#adv-view-row-delete')?.addEventListener('click', () => {
    dialogService.showConfirm({
      title: 'Eliminar Mazo Definitivamente',
      message: `¿ELIMINAR DEFINITIVAMENTE el mazo "${deck.name}" y todas sus tarjetas? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar Mazo',
      isDanger: true,
      onConfirm: () => {
        deckService.deleteDeck(deck.id);
        callbacks.onActionCompleted();
      }
    });
  });

  // Voice TTS
  container.querySelector('#adv-view-row-tts')?.addEventListener('click', () => {
    dialogService.showPrompt({
      title: 'Voz y Pronunciación (TTS)',
      message: 'Código de idioma de voz (ej: es-ES, en-US, fr-FR, de-DE, ja-JP):',
      defaultValue: deck.settings.ttsVoiceLang || 'es-ES',
      confirmText: 'Guardar Idioma',
      onConfirm: (lang) => {
        if (lang && lang.trim()) {
          deckService.updateDeck(deck.id, {
            settings: { ...deck.settings, ttsVoiceLang: lang.trim() }
          });
          callbacks.onActionCompleted();
        }
      }
    });
  });
}
