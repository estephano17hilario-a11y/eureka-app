import type { FigmaMainTab } from './FigmaHeader';

let lastIndex = -1;

export function renderEurekaBottomNav(activeTab: FigmaMainTab = 'flashcards'): string {
  const isFlashcards = activeTab === 'flashcards' || activeTab === 'inicio';

  const tabs = [
    {
      id: 'estudio',
      label: 'Cuadernos',
      isActive: activeTab === 'estudio',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H19v18H6.5A2.5 2.5 0 0 0 4 22.5z"/>
        <path d="M8 7h7M8 11h5"/>
        <path d="M4 19.5V4.5"/>
      </svg>`
    },
    {
      id: 'flashcards',
      label: 'Mazos',
      isActive: isFlashcards,
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="3"/>
        <path d="M7 8h10M7 12h7M7 16h4"/>
      </svg>`
    },
    {
      id: 'biblioteca',
      label: 'Biblioteca',
      isActive: activeTab === 'biblioteca',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        <path d="M9 7h7M9 11h5"/>
      </svg>`
    },
    {
      id: 'ajustes',
      label: 'Ajustes',
      isActive: activeTab === 'ajustes',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>`
    }
  ];

  // El indicador nace en la pestaña anterior y se desliza a la actual (el nav se repinta al cambiar de pestaña)
  const current = Math.max(0, tabs.findIndex((t) => t.isActive));
  const from = lastIndex < 0 ? current : lastIndex;
  lastIndex = current;
  if (from !== current && typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.querySelector<HTMLElement>('.ebn-pill')?.style.setProperty('--i', String(current)))
    );
  }

  const renderTab = (tab: (typeof tabs)[number]) => `
          <button class="eureka-bottom-nav-item figma-nav-tab-btn ${tab.isActive ? 'active' : ''}" data-tab="${tab.id}" aria-current="${tab.isActive ? 'page' : 'false'}">
            <div class="eureka-nav-icon-wrap">
              ${tab.icon}
            </div>
            <span class="eureka-nav-label">${tab.label}</span>
          </button>
        `;

  return `
    <nav class="eureka-mobile-bottom-nav mobile-only" aria-label="Navegación inferior">
      <div class="eureka-bottom-nav-inner">
        <span class="ebn-pill" aria-hidden="true" style="--i:${from}"></span>
        ${tabs.map(renderTab).join('')}
      </div>
    </nav>
  `;
}
