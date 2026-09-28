import { themeService, type AppCustomizationTheme, type BgThemeType } from '../services/theme.service';
import { nativeService, type VibrationIntensity } from '../services/native.service';

export interface FigmaAppSettingsViewCallbacks {
  onBack: () => void;
  onThemeChanged: () => void;
}

export function renderFigmaAppSettingsView(): string {
  const t = themeService.getTheme();
  const vibrationEnabled = nativeService.getVibrationEnabled();
  const vibrationIntensity = nativeService.getVibrationIntensity();
  const notificationsEnabled = nativeService.getNotificationsEnabled();
  const notificationTime = nativeService.getNotificationTime();

  return `
    <div class="ios-fullscreen-view">
      
      <!-- iOS Header -->
      <div class="ios-navbar">
        <button class="ios-back-btn" id="btn-app-settings-back">
          <span class="ios-back-chevron">‹</span> Volver
        </button>
        <h1 class="ios-nav-title">Ajustes & Personalización</h1>
        <div style="width:60px;"></div>
      </div>

      <div class="ios-content-scroll" style="display:flex; flex-direction:column; gap:22px; padding-bottom:60px;">
        
        <div>
          <h2 style="font-size:1.8rem; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">Ajustes de la Aplicación</h2>
          <p style="font-size:0.92rem; color:var(--f-text-secondary); margin-top:4px;">Control de vibración, notificaciones y atmósfera visual</p>
        </div>

        <!-- 1. VIBRACIÓN Y RESPUESTA HÁPTICA -->
        <div class="apple-card-grouped" style="padding:22px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
            <div>
              <div style="font-size:1.1rem; font-weight:800; color:#fff; display:flex; align-items:center; gap:8px;">
                <span>📳</span> Respuesta Háptica & Vibración
              </div>
              <div style="font-size:0.85rem; color:var(--f-text-secondary); margin-top:2px;">
                Vibración al tocar botones, voltear tarjetas y navegar
              </div>
            </div>
            
            <label class="figma-toggle-switch">
              <input type="checkbox" id="toggle-vibration" ${vibrationEnabled ? 'checked' : ''} />
              <span class="figma-toggle-slider"></span>
            </label>
          </div>

          <div id="vibration-intensity-section" style="display: ${vibrationEnabled ? 'flex' : 'none'}; flex-direction:column; gap:12px; border-top:1px solid rgba(255,255,255,0.08); padding-top:16px;">
            <div style="font-size:0.9rem; font-weight:700; color:#e2e8f0;">Intensidad de la Vibración:</div>
            
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
              <button class="apple-btn-outline-pill ${vibrationIntensity === 'light' ? 'active-pill' : ''}" data-vib-intensity="light" style="padding:12px 8px; font-weight:800; text-align:center;">
                📳 Suave
              </button>
              <button class="apple-btn-outline-pill ${vibrationIntensity === 'medium' ? 'active-pill' : ''}" data-vib-intensity="medium" style="padding:12px 8px; font-weight:800; text-align:center;">
                ⚡ Media
              </button>
              <button class="apple-btn-outline-pill ${vibrationIntensity === 'heavy' ? 'active-pill' : ''}" data-vib-intensity="heavy" style="padding:12px 8px; font-weight:800; text-align:center;">
                💥 Fuerte
              </button>
            </div>

            <button class="figma-btn-ghost" id="btn-test-vibration" style="align-self:flex-start; margin-top:4px; font-size:0.85rem; padding:8px 16px; border:1px solid rgba(56,189,248,0.3); color:#38bdf8; border-radius:999px;">
              ✨ Probar Vibración Ahora
            </button>
          </div>
        </div>

        <!-- 2. NOTIFICACIONES Y RECORDATORIOS DIARIOS -->
        <div class="apple-card-grouped" style="padding:22px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
            <div>
              <div style="font-size:1.1rem; font-weight:800; color:#fff; display:flex; align-items:center; gap:8px;">
                <span>🔔</span> Notificaciones & Recordatorios
              </div>
              <div style="font-size:0.85rem; color:var(--f-text-secondary); margin-top:2px;">
                Recordatorios inteligentes para mantener tus rachas diarias
              </div>
            </div>
            
            <label class="figma-toggle-switch">
              <input type="checkbox" id="toggle-notifications" ${notificationsEnabled ? 'checked' : ''} />
              <span class="figma-toggle-slider"></span>
            </label>
          </div>

          <div id="notifications-config-section" style="display: ${notificationsEnabled ? 'flex' : 'none'}; flex-direction:column; gap:12px; border-top:1px solid rgba(255,255,255,0.08); padding-top:16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
              <span style="font-size:0.9rem; font-weight:700; color:#e2e8f0;">Hora preferida del recordatorio:</span>
              <input type="time" id="input-notification-time" value="${notificationTime}" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#fff; padding:6px 12px; border-radius:10px; font-weight:700; font-size:1rem; outline:none;" />
            </div>

            <button class="figma-btn-ghost" id="btn-test-notification" style="align-self:flex-start; margin-top:4px; font-size:0.85rem; padding:8px 16px; border:1px solid rgba(16,185,129,0.3); color:#10b981; border-radius:999px;">
              🔔 Enviar Recordatorio de Prueba
            </button>
          </div>
        </div>

        <!-- 3. Atmósferas y Fondos Futuristas -->
        <div class="apple-card-grouped" style="padding:22px;">
          <div style="font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:16px;">
            Atmósfera y Fondo de la App
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px;">
            
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

        <!-- 4. Color de Acento -->
        <div class="apple-card-grouped" style="padding:22px;">
          <div style="font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:16px;">
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

        <!-- 5. Formas y Bordes de las Tarjetas -->
        <div class="apple-card-grouped" style="padding:22px;">
          <div style="font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:16px;">
            Formas y Bordes de las Flashcards
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:12px;">
            <button class="apple-btn-outline-pill ${t.cardRadius === 'super_rounded' ? 'active-pill' : ''}" data-radius="super_rounded" style="padding:16px 12px; font-weight:800; text-align:center;">
              Super Redondo (28px)
            </button>
            <button class="apple-btn-outline-pill ${t.cardRadius === 'standard' ? 'active-pill' : ''}" data-radius="standard" style="padding:16px 12px; font-weight:800; text-align:center;">
              Estándar iOS (18px)
            </button>
            <button class="apple-btn-outline-pill ${t.cardRadius === 'sharp' ? 'active-pill' : ''}" data-radius="sharp" style="padding:16px 12px; font-weight:800; text-align:center;">
              Futurista Recto (10px)
            </button>
          </div>
        </div>

        <!-- 6. Escala Táctil de Botones Grandes -->
        <div class="apple-card-grouped" style="padding:22px;">
          <div style="font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:16px;">
            Tamaño de Botones y Ergonomía Táctil
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px;">
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

  // Vibration toggle
  const toggleVib = container.querySelector<HTMLInputElement>('#toggle-vibration');
  const vibSection = container.querySelector<HTMLElement>('#vibration-intensity-section');
  toggleVib?.addEventListener('change', () => {
    const isChecked = toggleVib.checked;
    nativeService.setVibrationEnabled(isChecked);
    if (vibSection) {
      vibSection.style.display = isChecked ? 'flex' : 'none';
    }
  });

  // Vibration intensity buttons
  container.querySelectorAll<HTMLButtonElement>('button[data-vib-intensity]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const intensity = btn.dataset.vibIntensity as VibrationIntensity;
      if (intensity) {
        nativeService.setVibrationIntensity(intensity);
        container.querySelectorAll('button[data-vib-intensity]').forEach((b) => b.classList.remove('active-pill'));
        btn.classList.add('active-pill');
      }
    });
  });

  // Test vibration button
  container.querySelector('#btn-test-vibration')?.addEventListener('click', () => {
    nativeService.triggerHaptics('heavy');
  });

  // Notifications toggle
  const toggleNotif = container.querySelector<HTMLInputElement>('#toggle-notifications');
  const notifSection = container.querySelector<HTMLElement>('#notifications-config-section');
  toggleNotif?.addEventListener('change', async () => {
    const isChecked = toggleNotif.checked;
    const ok = await nativeService.setNotificationsEnabled(isChecked);
    if (!ok && isChecked) {
      toggleNotif.checked = false;
      alert('Debes conceder permisos de notificación en el sistema.');
    }
    if (notifSection) {
      notifSection.style.display = toggleNotif.checked ? 'flex' : 'none';
    }
  });

  // Notification time input
  const inputTime = container.querySelector<HTMLInputElement>('#input-notification-time');
  inputTime?.addEventListener('change', () => {
    if (inputTime.value) {
      nativeService.setNotificationTime(inputTime.value);
    }
  });

  // Test notification button
  container.querySelector('#btn-test-notification')?.addEventListener('click', async () => {
    await nativeService.scheduleTestNotification();
    nativeService.triggerHaptics('success');
  });

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

  // Background Theme Preset Cards
  container.querySelectorAll<HTMLElement>('.theme-preset-card').forEach((card) => {
    card.addEventListener('click', () => {
      const bg = card.dataset.bg as BgThemeType;
      if (bg) {
        themeService.setTheme({ bgTheme: bg });
        container.querySelectorAll('.theme-preset-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        callbacks.onThemeChanged();
      }
    });
  });

  // Card Radius buttons
  container.querySelectorAll<HTMLButtonElement>('button[data-radius]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const rad = btn.dataset.radius as AppCustomizationTheme['cardRadius'];
      if (rad) {
        themeService.setTheme({ cardRadius: rad });
        container.querySelectorAll('button[data-radius]').forEach((b) => b.classList.remove('active-pill'));
        btn.classList.add('active-pill');
        callbacks.onThemeChanged();
      }
    });
  });

  // UI Scale buttons
  container.querySelectorAll<HTMLButtonElement>('button[data-scale]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sc = btn.dataset.scale as AppCustomizationTheme['uiScale'];
      if (sc) {
        themeService.setTheme({ uiScale: sc });
        container.querySelectorAll('button[data-scale]').forEach((b) => b.classList.remove('active-pill'));
        btn.classList.add('active-pill');
        callbacks.onThemeChanged();
      }
    });
  });
}
