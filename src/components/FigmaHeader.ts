import { eurekaBackend } from '../services/backend.service';

export type FigmaMainTab = 'flashcards' | 'estudio' | 'biblioteca' | 'ajustes' | 'inicio';

export function renderFigmaHeader(activeTab: FigmaMainTab = 'flashcards'): string {
  const user = eurekaBackend.getCurrentUser();
  const displayName = user?.username || 'Estudiante';
  const initial = displayName.charAt(0).toUpperCase() || 'E';
  const isFlashcards = activeTab === 'flashcards' || activeTab === 'inicio';

  return `
    <!-- Top Nav Header (Unificado en la parte SUPERIOR para Computadora y Celular) -->
    <header class="figma-global-nav-wrapper">
      <div class="figma-global-nav">
        <div class="figma-nav-left">
          <div class="figma-logo-wrap" id="nav-brand-logo">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.5 2C7.01 2 5 4.01 5 6.5C5 7.18 5.16 7.82 5.43 8.39C3.99 9.15 3 10.71 3 12.5C3 14.54 4.31 16.27 6.13 16.82C6.04 17.2 6 17.59 6 18C6 20.21 7.79 22 10 22C10.78 22 11.51 21.78 12 21.39" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14.5 2C16.99 2 19 4.01 19 6.5C19 7.18 18.84 7.82 18.57 8.39C20.01 9.15 21 10.71 21 12.5C21 14.54 19.69 16.27 17.87 16.82C17.96 17.2 18 17.59 18 18C18 20.21 16.21 22 14 22C13.22 22 12.49 21.78 12 21.39" stroke="#818cf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 4.5V20.5" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/>
              <path d="M8.5 7.5C7.5 8.5 7.5 10.5 8.5 11.5M15.5 7.5C16.5 8.5 16.5 10.5 15.5 11.5" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>
            </svg>
            <span class="figma-brand-name">Eureka</span>
          </div>

          <!-- Desktop Navigation Tabs (Visible en Pantallas Grandes / Computadora) -->
          <nav class="figma-nav-tabs desktop-only">
            <button class="figma-nav-tab-btn ${isFlashcards ? 'active' : ''}" data-tab="flashcards">
              🎴 Flashcards
            </button>
            <button class="figma-nav-tab-btn ${activeTab === 'estudio' ? 'active' : ''}" data-tab="estudio">
              🧠 Estudio
            </button>
            <button class="figma-nav-tab-btn ${activeTab === 'biblioteca' ? 'active' : ''}" data-tab="biblioteca">
              📚 Biblioteca
            </button>
            <button class="figma-nav-tab-btn ${activeTab === 'ajustes' ? 'active' : ''}" data-tab="ajustes">
              🎨 Personalización
            </button>
          </nav>
        </div>

        <div class="figma-nav-right">
          <!-- Timer Capsule (Desktop only) -->
          <button class="figma-timer-capsule desktop-only" id="btn-header-premium" style="border:none; cursor:pointer;" title="Rachas y repetición diaria">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>12:00:00</span>
          </button>

          <!-- Botón Feynman IA Directo -->
          <button class="figma-btn-ghost" id="btn-header-feynman" title="Diagnóstico y Rutas Feynman con IA" style="border:1px solid rgba(56,189,248,0.3); background:rgba(56,189,248,0.1); color:#38bdf8; font-size:0.8rem; font-weight:800; border-radius:999px; padding:5px 12px; display:flex; align-items:center; gap:6px; cursor:pointer;">
            <span>🔬</span>
            <span class="desktop-only" style="display:inline !important;">Feynman IA</span>
          </button>

          <!-- Streak Badge -->
          <div class="figma-streak-badge" title="Racha activa">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            <span>${user?.streakDays || 1}</span>
          </div>

          <!-- Quick Theme Switcher Button (Mobile) -->
          <button class="figma-icon-btn-dark mobile-only" id="btn-header-theme-mobile" style="width:38px; height:38px; border-radius:50%;" title="Personalización">
            🎨
          </button>

          <!-- Profile Avatar & User Badge -->
          <button class="figma-avatar-circle" id="btn-header-avatar" title="Cuenta: ${displayName} (${user?.email || 'Local'})" style="display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #38bdf8, #8b5cf6); color:#fff; font-weight:800; border:2px solid rgba(255,255,255,0.2);">
            <span>${initial}</span>
          </button>
        </div>
      </div>

      <!-- Barra de Pestañas Superior Móvil (Dashboard en la parte SUPERIOR en celular y PC por igual) -->
      <nav class="figma-top-nav-mobile mobile-only" aria-label="Navegación principal">
        <button class="figma-nav-tab-btn ${isFlashcards ? 'active' : ''}" data-tab="flashcards">
          <span>🎴 Flashcards</span>
        </button>

        <button class="figma-nav-tab-btn ${activeTab === 'estudio' ? 'active' : ''}" data-tab="estudio">
          <span>🧠 Estudio</span>
        </button>

        <button class="figma-nav-tab-btn ${activeTab === 'biblioteca' ? 'active' : ''}" data-tab="biblioteca">
          <span>📚 Biblioteca</span>
        </button>

        <button class="figma-nav-tab-btn ${activeTab === 'ajustes' ? 'active' : ''}" data-tab="ajustes">
          <span>🎨 Estilo</span>
        </button>
      </nav>
    </header>
  `;
}
