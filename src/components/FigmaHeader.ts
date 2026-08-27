export type FigmaMainTab = 'inicio' | 'biblioteca' | 'ajustes';

export function renderFigmaHeader(activeTab: FigmaMainTab = 'inicio'): string {
  return `
    <!-- Top Nav Header (Responsive for Desktop & Mobile APK) -->
    <header class="figma-global-nav">
      <div class="figma-nav-left">
        <div class="figma-logo-wrap" id="nav-brand-logo">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span class="figma-brand-name">Eureka</span>
        </div>

        <!-- Desktop Navigation Tabs (Hidden on Mobile) -->
        <nav class="figma-nav-tabs desktop-only">
          <button class="figma-nav-tab-btn ${activeTab === 'inicio' ? 'active' : ''}" data-tab="inicio">
            Inicio
          </button>
          <button class="figma-nav-tab-btn ${activeTab === 'biblioteca' ? 'active' : ''}" data-tab="biblioteca">
            Biblioteca
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

        <!-- Streak Badge -->
        <div class="figma-streak-badge" title="Racha activa">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          <span>0</span>
        </div>

        <!-- Quick Theme Switcher Button (Mobile) -->
        <button class="figma-icon-btn-dark mobile-only" id="btn-header-theme-mobile" style="width:38px; height:38px; border-radius:50%;" title="Personalización">
          🎨
        </button>

        <!-- Profile Avatar -->
        <button class="figma-avatar-circle" id="btn-header-avatar" title="Ajustes de la App">
          <span>E</span>
        </button>
      </div>
    </header>

    <!-- Mobile Native Bottom Navigation Bar (iOS & Android APK) -->
    <nav class="mobile-bottom-nav mobile-only">
      <button class="mobile-nav-item ${activeTab === 'inicio' ? 'active' : ''}" data-tab="inicio">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Inicio</span>
      </button>

      <button class="mobile-nav-item ${activeTab === 'biblioteca' ? 'active' : ''}" data-tab="biblioteca">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        <span>Biblioteca</span>
      </button>

      <button class="mobile-nav-item ${activeTab === 'ajustes' ? 'active' : ''}" data-tab="ajustes">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <span>Estilo</span>
      </button>
    </nav>
  `;
}
