import { themeService, type AppCustomizationTheme } from '../services/theme.service';

export interface FigmaAppSettingsViewCallbacks {
  onBack: () => void;
  onThemeChanged: () => void;
}

export function renderFigmaAppSettingsView(): string {
  const t = themeService.getTheme();

  return `
    <div class="ios-fullscreen-view">
      
      <!-- iOS Header -->
      <div class="ios-navbar">
        <button class="ios-back-btn" id="btn-app-settings-back">
          <span class="ios-back-chevron">‹</span> Volver
        </button>
        <h1 class="ios-nav-title">Personalización & Estilo</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:20px; padding-bottom:40px;">
        
        <div>
          <h2 style="font-size:1.75rem; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">Personaliza tu Eureka</h2>
          <p style="font-size:0.9rem; color:var(--f-text-secondary);">Adapta los colores, formas y dimensiones a tu estilo</p>
        </div>

        <!-- 1. Color de Acento -->
        <div class="apple-card-grouped" style="padding:20px 22px;">
          <div style="font-size:1.05rem; font-weight:700; color:#fff; margin-bottom:12px;">
            Color de Acento Principal
          </div>

          <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
            <button class="theme-color-circle ${t.accentName === 'blue' ? 'active' : ''}" data-accent="blue" style="background:#38bdf8;" title="Cyber Blue"></button>
            <button class="theme-color-circle ${t.accentName === 'green' ? 'active' : ''}" data-accent="green" style="background:#84cc16;" title="Neon Green"></button>
            <button class="theme-color-circle ${t.accentName === 'purple' ? 'active' : ''}" data-accent="purple" style="background:#a855f7;" title="Electric Purple"></button>
            <button class="theme-color-circle ${t.accentName === 'amber' ? 'active' : ''}" data-accent="amber" style="background:#f59e0b;" title="Sunset Amber"></button>
            <button class="theme-color-circle ${t.accentName === 'pink' ? 'active' : ''}" data-accent="pink" style="background:#ec4899;" title="Coral Pink"></button>
            <button class="theme-color-circle ${t.accentName === 'red' ? 'active' : ''}" data-accent="red" style="background:#ef4444;" title="Crimson"></button>
          </div>
        </div>

        <!-- 2. Fondo y Atmósfera de la App -->
        <div class="apple-card-grouped" style="padding:20px 22px;">
          <div style="font-size:1.05rem; font-weight:700; color:#fff; margin-bottom:12px;">
            Atmósfera y Fondo de la App
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
            <div class="theme-preset-box ${t.bgTheme === 'oled' ? 'selected' : ''}" data-bg="oled">
              <div style="font-size:1.3rem; margin-bottom:4px;">🖤</div>
              <div style="font-weight:700; color:#fff;">OLED Pitch Black</div>
              <div style="font-size:0.76rem; color:var(--f-text-secondary);">Negro puro, ahorro de batería</div>
            </div>

            <div class="theme-preset-box ${t.bgTheme === 'glass' ? 'selected' : ''}" data-bg="glass">
              <div style="font-size:1.3rem; margin-bottom:4px;">🔮</div>
              <div style="font-weight:700; color:#fff;">Liquid Glass</div>
              <div style="font-size:0.76rem; color:var(--f-text-secondary);">Medianoche translúcido con blur</div>
            </div>

            <div class="theme-preset-box ${t.bgTheme === 'emerald' ? 'selected' : ''}" data-bg="emerald">
              <div style="font-size:1.3rem; margin-bottom:4px;">🌿</div>
              <div style="font-weight:700; color:#fff;">Emerald Cyber</div>
              <div style="font-size:0.76rem; color:var(--f-text-secondary);">Verde bosque profundo</div>
            </div>
          </div>
        </div>

        <!-- 3. Formas y Bordes de las Tarjetas -->
        <div class="apple-card-grouped" style="padding:20px 22px;">
          <div style="font-size:1.05rem; font-weight:700; color:#fff; margin-bottom:12px;">
            Formas y Bordes (Radio de Esquinas)
          </div>

          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
            <button class="apple-btn-outline-pill ${t.cardRadius === 'super_rounded' ? 'active-pill' : ''}" data-radius="super_rounded" style="padding:14px 10px; font-weight:700; text-align:center;">
              Super Redondo (26px)
            </button>
            <button class="apple-btn-outline-pill ${t.cardRadius === 'standard' ? 'active-pill' : ''}" data-radius="standard" style="padding:14px 10px; font-weight:700; text-align:center;">
              Estándar iOS (18px)
            </button>
            <button class="apple-btn-outline-pill ${t.cardRadius === 'sharp' ? 'active-pill' : ''}" data-radius="sharp" style="padding:14px 10px; font-weight:700; text-align:center;">
              Moderno Recto (10px)
            </button>
          </div>
        </div>

        <!-- 4. Escala Táctil de Botones -->
        <div class="apple-card-grouped" style="padding:20px 22px;">
          <div style="font-size:1.05rem; font-weight:700; color:#fff; margin-bottom:12px;">
            Tamaño Táctil y Comodidad de Botones
          </div>

          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;">
            <button class="apple-btn-secondary ${t.uiScale === 'comfortable' ? 'active-pill' : ''}" data-scale="comfortable" style="padding:16px; border-radius:16px; font-weight:700;">
              ✨ Cómodo y Grande (Recomendado)
            </button>
            <button class="apple-btn-secondary ${t.uiScale === 'normal' ? 'active-pill' : ''}" data-scale="normal" style="padding:16px; border-radius:16px; font-weight:700;">
              Normal Estándar
            </button>
          </div>
        </div>

      </div>

    </div>
  `;
}

export function bindFigmaAppSettingsViewEvents(
  container: HTMLElement,
  callbacks: FigmaAppSettingsViewCallbacks
): void {
  container.querySelector('#btn-app-settings-back')?.addEventListener('click', () => callbacks.onBack());

  // Accent circles
  container.querySelectorAll<HTMLButtonElement>('.theme-color-circle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const accent = btn.dataset.accent as AppCustomizationTheme['accentName'];
      if (accent) {
        themeService.setTheme({ accentName: accent });
        container.querySelectorAll('.theme-color-circle').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        callbacks.onThemeChanged();
      }
    });
  });

  // Background box
  container.querySelectorAll<HTMLElement>('.theme-preset-box').forEach((box) => {
    box.addEventListener('click', () => {
      const bg = box.dataset.bg as AppCustomizationTheme['bgTheme'];
      if (bg) {
        themeService.setTheme({ bgTheme: bg });
        container.querySelectorAll('.theme-preset-box').forEach((b) => b.classList.remove('selected'));
        box.classList.add('selected');
        callbacks.onThemeChanged();
      }
    });
  });

  // Radius
  container.querySelectorAll<HTMLButtonElement>('[data-radius]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const r = btn.dataset.radius as AppCustomizationTheme['cardRadius'];
      if (r) {
        themeService.setTheme({ cardRadius: r });
        container.querySelectorAll('[data-radius]').forEach((b) => b.classList.remove('active-pill'));
        btn.classList.add('active-pill');
        callbacks.onThemeChanged();
      }
    });
  });

  // Scale
  container.querySelectorAll<HTMLButtonElement>('[data-scale]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const s = btn.dataset.scale as AppCustomizationTheme['uiScale'];
      if (s) {
        themeService.setTheme({ uiScale: s });
        container.querySelectorAll('[data-scale]').forEach((b) => b.classList.remove('active-pill'));
        btn.classList.add('active-pill');
        callbacks.onThemeChanged();
      }
    });
  });
}
