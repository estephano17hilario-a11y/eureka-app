export type FigmaMainTab = 'inicio' | 'biblioteca';

let pomodoroSeconds = 28 * 60 + 29; // 28m 29s
let timerInterval: number | null = null;

function formatPomodoroTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const mm = m < 10 ? `0${m}` : `${m}`;
  const ss = s < 10 ? `0${s}` : `${s}`;
  return `00 : ${mm} : ${ss} left`;
}

function startGlobalPomodoro(): void {
  if (timerInterval) return;
  timerInterval = window.setInterval(() => {
    if (pomodoroSeconds > 0) {
      pomodoroSeconds--;
      const label = document.getElementById('figma-timer-display');
      if (label) label.textContent = formatPomodoroTime(pomodoroSeconds);
    }
  }, 1000);
}

startGlobalPomodoro();

export function renderFigmaHeader(activeTab: FigmaMainTab): string {
  return `
    <header class="figma-global-nav">
      <div class="figma-nav-left">
        <div class="figma-logo-wrap" id="nav-brand-logo">
          <!-- Stylized Noji N curve logo -->
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M7 25C7 20 12 10 16 7C20 4 25 7 25 12C25 18 19 25 15 25C11 25 9 22 9 18C9 14 14 11 18 11" stroke="#50b5ff" stroke-width="3" stroke-linecap="round"/>
            <circle cx="24" cy="8" r="2" fill="#50b5ff"/>
          </svg>
        </div>

        <nav class="figma-nav-tabs">
          <button class="figma-nav-tab-btn ${activeTab === 'inicio' ? 'active' : ''}" data-tab="inicio">
            Inicio
          </button>
          <button class="figma-nav-tab-btn ${activeTab === 'biblioteca' ? 'active' : ''}" data-tab="biblioteca">
            Biblioteca
          </button>
        </nav>
      </div>

      <div class="figma-nav-right">
        <div class="figma-timer-capsule" id="btn-toggle-timer" style="cursor:pointer;" title="Temporizador de estudio Pomodoro">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span id="figma-timer-display">${formatPomodoroTime(pomodoroSeconds)}</span>
        </div>

        <div class="figma-streak-badge" title="Racha de estudio">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          <span>0</span>
        </div>

        <div class="figma-avatar-circle" title="Perfil de usuario">
          <span>EU</span>
        </div>
      </div>
    </header>
  `;
}
