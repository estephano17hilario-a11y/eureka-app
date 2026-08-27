import type { Deck } from '../types/flashcard';
import { deckService } from '../services/deck.service';

export interface FigmaAdvancedDeckMenuViewCallbacks {
  onBack: () => void;
  onOpenAlgorithmSelector: () => void;
  onOpenAiBuilder: () => void;
  onOpenBatchImport: () => void;
  onActionCompleted: () => void;
}

export function renderFigmaAdvancedDeckMenuView(deck: Deck): string {
  const currentTheme = localStorage.getItem('eureka_theme') || 'oled';

  return `
    <div class="ios-fullscreen-view">
      
      <!-- iOS Native Header -->
      <div class="ios-navbar">
        <button class="ios-back-btn" id="btn-adv-view-back">
          <span class="ios-back-chevron">‹</span> Ajustes
        </button>
        <h1 class="ios-nav-title">Opciones de Mazo</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- Group 1: Algoritmo -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="adv-view-row-algo" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <div class="apple-icon-circle-sm" style="background:rgba(56,189,248,0.15); color:var(--f-blue);">
                ⥯
              </div>
              <div>
                <div style="font-size:1.02rem; font-weight:700; color:#fff;">Personalizado</div>
                <div style="font-size:0.78rem; color:var(--f-text-secondary);">Ajustes predeterminados del algoritmo</div>
              </div>
            </div>
            <span class="apple-chevron">›</span>
          </div>
        </div>

        <!-- Group 2: Audio, Tema & Estilo -->
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
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Texto a voz</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="color:var(--f-text-secondary); font-size:0.9rem;">${deck.settings.ttsVoiceLang}</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>
        </div>

        <!-- Group 3: Compartir y Biblioteca -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="adv-view-row-share" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">⬆</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Compartir mazo</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="color:var(--f-text-secondary); font-size:0.9rem;">Off</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <div class="apple-list-row" id="adv-view-row-publish" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">🖫</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Publicar en la biblioteca</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>
        </div>

        <!-- Group 4: Acciones Avanzadas -->
        <div class="apple-card-grouped">
          <div class="apple-list-row" id="adv-view-row-ai" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem; color:#ec4899;">✨</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Generar tarjetas con IA</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="apple-badge-beta">Beta</span>
              <span class="apple-chevron">›</span>
            </div>
          </div>

          <div class="apple-list-row" id="adv-view-row-import" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">⬇</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Importar tarjetas</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-rename" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">✏️</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Cambiar el nombre del mazo</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-move" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">↪</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Mover mazo</span>
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
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Restablecer progreso</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-archive" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">📥</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Archivar mazo</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-export" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem;">⬆</span>
              <span style="font-size:1.02rem; font-weight:600; color:#fff;">Exportar mazo</span>
            </div>
            <span class="apple-chevron">›</span>
          </div>

          <div class="apple-list-row" id="adv-view-row-delete" style="cursor:pointer;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:1.2rem; color:#ef4444;">🗑️</span>
              <span style="font-size:1.02rem; font-weight:700; color:#ef4444;">Eliminar mazo</span>
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
  container.querySelector('#adv-view-row-algo')?.addEventListener('click', () => callbacks.onOpenAlgorithmSelector());
  container.querySelector('#adv-view-row-ai')?.addEventListener('click', () => callbacks.onOpenAiBuilder());
  container.querySelector('#adv-view-row-import')?.addEventListener('click', () => callbacks.onOpenBatchImport());

  // Theme Selector (Requirement 4: modificar la UI de las flashcards y el fondo de la app)
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
    const name = prompt('Nuevo nombre del mazo:', deck.name);
    if (name && name.trim()) {
      deckService.renameDeck(deck.id, name);
      callbacks.onActionCompleted();
    }
  });

  // Duplicate
  container.querySelector('#adv-view-row-duplicate')?.addEventListener('click', () => {
    deckService.duplicateDeck(deck.id);
    callbacks.onActionCompleted();
  });

  // Reset Progress
  container.querySelector('#adv-view-row-reset')?.addEventListener('click', () => {
    if (confirm(`¿Restablecer todo el progreso de estudio en "${deck.name}"?`)) {
      deckService.resetDeckProgress(deck.id);
      callbacks.onActionCompleted();
    }
  });

  // Archive
  container.querySelector('#adv-view-row-archive')?.addEventListener('click', () => {
    if (confirm(`¿Archivar el mazo "${deck.name}"?`)) {
      deckService.archiveDeck(deck.id);
      callbacks.onActionCompleted();
    }
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
    if (confirm(`⚠️ ¿ELIMINAR DEFINITIVAMENTE el mazo "${deck.name}" y todas sus tarjetas? Esta acción no se puede deshacer.`)) {
      deckService.deleteDeck(deck.id);
      callbacks.onActionCompleted();
    }
  });

  // Voice TTS
  container.querySelector('#adv-view-row-tts')?.addEventListener('click', () => {
    const lang = prompt('Código de idioma de voz TTS (ej: es-ES, en-US, fr-FR, de-DE):', deck.settings.ttsVoiceLang);
    if (lang && lang.trim()) {
      deckService.updateDeck(deck.id, {
        settings: { ...deck.settings, ttsVoiceLang: lang.trim() }
      });
      callbacks.onActionCompleted();
    }
  });
}
