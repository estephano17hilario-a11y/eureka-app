import type { FigmaMainTab } from './FigmaHeader';

export function renderEurekaBottomNav(activeTab: FigmaMainTab = 'flashcards'): string {
  const isFlashcards = activeTab === 'flashcards' || activeTab === 'inicio';

  const tabs = [
    {
      id: 'flashcards',
      label: 'Flashcards',
      isActive: isFlashcards,
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="3"/>
        <path d="M7 8h10M7 12h7M7 16h4"/>
      </svg>`
    },
    {
      id: 'estudio',
      label: 'Estudio',
      isActive: activeTab === 'estudio',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.25.51 2.38 1.34 3.2A4.5 4.5 0 0 0 5 14c0 1.9 1.18 3.52 2.86 4.18A4.5 4.5 0 0 0 12 22a4.5 4.5 0 0 0 4.14-3.82C17.82 17.52 19 15.9 19 14a4.5 4.5 0 0 0-3.84-4.3A4.5 4.5 0 0 0 16.5 6.5 4.5 4.5 0 0 0 12 2z"/>
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

  return `
    <nav class="eureka-mobile-bottom-nav mobile-only" aria-label="Navegación inferior">
      <div class="eureka-bottom-nav-inner">
        ${tabs
          .map(
            (tab) => `
          <button class="eureka-bottom-nav-item figma-nav-tab-btn ${tab.isActive ? 'active' : ''}" data-tab="${tab.id}">
            <div class="eureka-nav-icon-wrap">
              ${tab.icon}
            </div>
            <span class="eureka-nav-label">${tab.label}</span>
          </button>
        `
          )
          .join('')}
      </div>
    </nav>
  `;
}
