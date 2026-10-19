import { eurekaBackend } from '../services/backend.service';

export type FigmaMainTab = 'flashcards' | 'estudio' | 'biblioteca' | 'ajustes' | 'inicio';

const ICON_NOTEBOOK = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H19v18H6.5A2.5 2.5 0 0 0 4 22.5z"/><path d="M8 7h7M8 11h5"/><path d="M4 19.5V4.5"/></svg>`;
const ICON_DECK = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="15" height="14" rx="2.5"/><path d="M7 3h12a2 2 0 0 1 2 2v11"/></svg>`;
const ICON_LIBRARY = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v16M9 4v16M14 6l5 14"/></svg>`;
const ICON_SETTINGS = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9c0-1-.8-1.5-1.7-1.2A4 4 0 0 1 13.2 5.7C13.4 4 12.8 3 12 3z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="16" r="1"/><circle cx="16" cy="13" r="1"/></svg>`;

export function renderFigmaHeader(activeTab: FigmaMainTab = 'flashcards'): string {
  const user = eurekaBackend.getCurrentUser();
  const displayName = user?.username || 'Estudiante';
  const initial = displayName.charAt(0).toUpperCase() || 'E';
  const isFlashcards = activeTab === 'flashcards' || activeTab === 'inicio';

  return `
    <!-- Barra superior del escritorio de estudio (Computadora y Celular) -->
    <header class="figma-global-nav-wrapper">
      <div class="figma-global-nav">
        <div class="figma-nav-left">
          <div class="figma-logo-wrap" id="nav-brand-logo">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.5 2C7.01 2 5 4.01 5 6.5C5 7.18 5.16 7.82 5.43 8.39C3.99 9.15 3 10.71 3 12.5C3 14.54 4.31 16.27 6.13 16.82C6.04 17.2 6 17.59 6 18C6 20.21 7.79 22 10 22C10.78 22 11.51 21.78 12 21.39" stroke="#ffd08a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14.5 2C16.99 2 19 4.01 19 6.5C19 7.18 18.84 7.82 18.57 8.39C20.01 9.15 21 10.71 21 12.5C21 14.54 19.69 16.27 17.87 16.82C17.96 17.2 18 17.59 18 18C18 20.21 16.21 22 14 22C13.22 22 12.49 21.78 12 21.39" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 4.5V20.5" stroke="#ffd08a" stroke-width="2.2" stroke-linecap="round"/>
              <path d="M8.5 7.5C7.5 8.5 7.5 10.5 8.5 11.5M15.5 7.5C16.5 8.5 16.5 10.5 15.5 11.5" stroke="#ffd08a" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>
            </svg>
            <span class="figma-brand-name">Eureka</span>
          </div>

          <!-- Pestañas de escritorio -->
          <nav class="figma-nav-tabs desktop-only">
            <button class="figma-nav-tab-btn ${activeTab === 'estudio' ? 'active' : ''}" data-tab="estudio">
              ${ICON_NOTEBOOK}<span>Cuadernos</span>
            </button>
            <button class="figma-nav-tab-btn ${isFlashcards ? 'active' : ''}" data-tab="flashcards">
              ${ICON_DECK}<span>Mazos</span>
            </button>
            <button class="figma-nav-tab-btn ${activeTab === 'biblioteca' ? 'active' : ''}" data-tab="biblioteca">
              ${ICON_LIBRARY}<span>Biblioteca</span>
            </button>
            <button class="figma-nav-tab-btn ${activeTab === 'ajustes' ? 'active' : ''}" data-tab="ajustes">
              ${ICON_SETTINGS}<span>Personalizar</span>
            </button>
          </nav>
        </div>

        <div class="figma-nav-right">
          <!-- Reloj de sesión real: cuánto llevas en tu escritorio de estudio -->
          <button class="figma-timer-capsule desktop-only" id="btn-header-premium" style="cursor:pointer;" title="Tiempo de esta sesión de estudio (toca para pausar)">
            <span class="clock-dot"></span>
            <span id="header-session-clock">00:00</span>
          </button>

          <!-- Crear (escritorio) -->
          <button class="btn-header-create desktop-only" id="btn-header-create" title="Crear cuaderno, ruta Feynman, mazo o carpeta">
            <span style="font-size:1.1rem; line-height:1;">＋</span><span>Crear</span>
          </button>

          <!-- Racha -->
          <div class="figma-streak-badge" title="Racha activa">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            <span>${user?.streakDays || 1}</span>
          </div>

          <!-- Personalización rápida (celular) -->
          <button class="figma-icon-btn-dark mobile-only" id="btn-header-theme-mobile" style="width:38px; height:38px; border-radius:50%;" title="Personalización">
            🎨
          </button>

          <!-- Perfil -->
          <button class="figma-avatar-circle" id="btn-header-avatar" title="Cuenta: ${displayName} (${user?.email || 'Local'})" style="display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #ffd08a, #d97706); color:#1c1204; font-weight:800; border:2px solid rgba(255,255,255,0.2);">
            <span>${initial}</span>
          </button>
        </div>
      </div>
    </header>
  `;
}
