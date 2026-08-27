export type FigmaMainTab = 'inicio' | 'biblioteca' | 'ajustes';

export function renderFigmaHeader(activeTab: FigmaMainTab = 'inicio'): string {
  return `
    <header class="figma-global-nav">
      <div class="figma-nav-left">
        <div class="figma-logo-wrap" id="nav-brand-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span style="font-size:1.35rem; font-weight:800; letter-spacing:-0.03em; color:#ffffff;">Eureka</span>
        </div>

        <nav class="figma-nav-tabs">
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
        <button class="figma-timer-capsule" id="btn-header-premium" style="border:none; cursor:pointer;" title="Rachas y repetición diaria">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>12:00:00</span>
        </button>

        <div class="figma-streak-badge" title="Racha activa">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          <span>0</span>
        </div>

        <button class="figma-avatar-circle" id="btn-header-avatar" title="Ajustes de la App">
          <span>E</span>
        </button>
      </div>
    </header>
  `;
}
