export function renderHeader(): string {
  return `
    <header class="app-header">
      <h1 class="header-large-title">Eureka</h1>
      <div class="header-actions">
        <button class="btn-apple-add" id="btn-quick-add-card">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva Tarjeta
        </button>
      </div>
    </header>
  `;
}
