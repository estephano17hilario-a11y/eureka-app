import { themeService, type AppCustomizationTheme, type BgThemeType } from '../services/theme.service';

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

      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:22px; padding-bottom:40px;">
        
        <div>
          <h2 style="font-size:1.8rem; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">Atmósfera & Estilo Visual</h2>
          <p style="font-size:0.92rem; color:var(--f-text-secondary);">Diseño moderno futurista con gradientes y mallas cromáticas</p>
        </div>

        <!-- 1. Atmósferas y Fondos Futuristas (Inspirados en las Imágenes) -->
        <div class="apple-card-grouped" style="padding:22px;">
          <div style="font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:14px;">
            Atmósfera y Fondo de la App
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px;">
            
            <div class="theme-preset-card ${t.bgTheme === 'modern_black' ? 'selected' : ''}" data-bg="modern_black">
              <div class="theme-preview-box preview-modern-black">
                <span class="theme-badge-glow">Default</span>
              </div>
              <div class="theme-card-info">
                <div class="theme-card-title">Modern Lead Black</div>
                <div class="theme-card-desc">Plomo oscuro elegante y sutil, estilo Noji/AnkiPro nativo</div>
              </div>
            </div>

            <div class="theme-preset-card ${t.bgTheme === 'holo_cyber' ? 'selected' : ''}" data-bg="holo_cyber">
              <div class="theme-preview-box preview-holo-cyber">
                <span class="theme-badge-glow" style="background:#ec4899;">Holo 3D</span>
              </div>
              <div class="theme-card-info">
                <div class="theme-card-title">Holo Prism Chrome</div>
                <div class="theme-card-desc">Efecto holográfico iridiscente con mallas de color</div>
              </div>
            </div>

            <div class="theme-preset-card ${t.bgTheme === 'digital_blue' ? 'selected' : ''}" data-bg="digital_blue">
              <div class="theme-preview-box preview-digital-blue">
                <span class="theme-badge-glow" style="background:#38bdf8;">Digital</span>
              </div>
              <div class="theme-card-info">
                <div class="theme-card-title">Digital Technology</div>
                <div class="theme-card-desc">Aura azul eléctrico y cian futurista profundo</div>
              </div>
            </div>

            <div class="theme-preset-card ${t.bgTheme === 'emerald_vision' ? 'selected' : ''}" data-bg="emerald_vision">
              <div class="theme-preview-box preview-emerald-vision">
                <span class="theme-badge-glow" style="background:#10b981;">Vision</span>
              </div>
              <div class="theme-card-info">
                <div class="theme-card-title">Vision Emerald</div>
                <div class="theme-card-desc">Anillo de luz verde neón y esmeralda cósmico</div>
              </div>
            </div>

            <div class="theme-preset-card ${t.bgTheme === 'sunset_magenta' ? 'selected' : ''}" data-bg="sunset_magenta">
              <div class="theme-preview-box preview-sunset-magenta">
                <span class="theme-badge-glow" style="background:#a855f7;">Unlocking</span>
              </div>
              <div class="theme-card-info">
                <div class="theme-card-title">Sunset Magenta</div>
                <div class="theme-card-desc">Gradiente violeta, púrpura y magenta resplandeciente</div>
              </div>
            </div>

          </div>
        </div>

        <!-- 2. Color de Acento -->
        <div class="apple-card-grouped" style="padding:22px;">
          <div style="font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:14px;">
            Color de Acento de Botones y Resaltados
          </div>

          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <button class="theme-color-circle ${t.accentName === 'blue' ? 'active' : ''}" data-accent="blue" style="background:linear-gradient(135deg, #38bdf8, #0284c7);" title="Cyber Blue"></button>
            <button class="theme-color-circle ${t.accentName === 'green' ? 'active' : ''}" data-accent="green" style="background:linear-gradient(135deg, #10b981, #059669);" title="Neon Emerald"></button>
            <button class="theme-color-circle ${t.accentName === 'purple' ? 'active' : ''}" data-accent="purple" style="background:linear-gradient(135deg, #a855f7, #7e22ce);" title="Electric Purple"></button>
            <button class="theme-color-circle ${t.accentName === 'amber' ? 'active' : ''}" data-accent="amber" style="background:linear-gradient(135deg, #f59e0b, #d97706);" title="Sunset Amber"></button>
            <button class="theme-color-circle ${t.accentName === 'pink' ? 'active' : ''}" data-accent="pink" style="background:linear-gradient(135deg, #ec4899, #be185d);" title="Coral Pink"></button>
            <button class="theme-color-circle ${t.accentName === 'red' ? 'active' : ''}" data-accent="red" style="background:linear-gradient(135deg, #ef4444, #b91c1c);" title="Crimson"></button>
          </div>
        </div>

        <!-- 3. Formas y Bordes de las Tarjetas -->
        <div class="apple-card-grouped" style="padding:22px;">
          <div style="font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:14px;">
            Formas y Bordes de las Flashcards
          </div>

          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
            <button class="apple-btn-outline-pill ${t.cardRadius === 'super_rounded' ? 'active-pill' : ''}" data-radius="super_rounded" style="padding:16px 10px; font-weight:800; text-align:center;">
              Super Redondo (28px)
            </button>
            <button class="apple-btn-outline-pill ${t.cardRadius === 'standard' ? 'active-pill' : ''}" data-radius="standard" style="padding:16px 10px; font-weight:800; text-align:center;">
              Estándar iOS (18px)
            </button>
            <button class="apple-btn-outline-pill ${t.cardRadius === 'sharp' ? 'active-pill' : ''}" data-radius="sharp" style="padding:16px 10px; font-weight:800; text-align:center;">
              Futurista Recto (10px)
            </button>
          </div>
        </div>

        <!-- 4. Escala Táctil de Botones Grandes -->
        <div class="apple-card-grouped" style="padding:22px;">
          <div style="font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:14px;">
            Tamaño de Botones y Ergonomía Táctil
          </div>

          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:14px;">
            <button class="apple-btn-secondary ${t.uiScale === 'comfortable' ? 'active-pill' : ''}" data-scale="comfortable" style="padding:18px; border-radius:18px; font-weight:800; font-size:1.05rem;">
              ✨ Cómodo y Grande (Recomendado)
            </button>
            <button class="apple-btn-secondary ${t.uiScale === 'normal' ? 'active-pill' : ''}" data-scale="normal" style="padding:18px; border-radius:18px; font-weight:800; font-size:1.05rem;">
              Normal
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

  // Background presets
  container.querySelectorAll<HTMLElement>('.theme-preset-card').forEach((card) => {
    card.addEventListener('click', () => {
      const bg = card.dataset.bg as BgThemeType;
      if (bg) {
        themeService.setTheme({ bgTheme: bg });
        container.querySelectorAll('.theme-preset-card').forEach((b) => b.classList.remove('selected'));
        card.classList.add('selected');
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
