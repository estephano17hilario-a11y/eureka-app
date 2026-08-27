export function renderInsightsPanel(): string {
  return `
    <div class="hero-banner" style="margin-top: 12px;">
      <div class="hero-content">
        <span class="hero-chip">
          <span class="hero-chip-dot"></span> Arquitectura Móvil
        </span>
        <h2 class="hero-title">Capacitor <span>+ TypeScript</span></h2>
        <p class="hero-desc">
          Eureka está optimizado con tipado estricto, bundling asíncrono con Vite, soporte para Android/iOS y sincronización instantánea de código.
        </p>

        <div class="hero-stats">
          <div class="stat-box">
            <div class="stat-number">60 FPS</div>
            <div class="stat-label">Rendimiento</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">100%</div>
            <div class="stat-label">TypeScript</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">0ms</div>
            <div class="stat-label">Bridge Lag</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-header">
      <h3 class="section-title">Comandos Rápidos de Capacitor</h3>
    </div>

    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom: 24px;">
      <div class="stat-box" style="text-align:left; padding:14px; background: rgba(14, 22, 38, 0.7); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:600; font-size:0.85rem; color:#a5b4fc;">npm run build && npx cap sync</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Compila y sincroniza con iOS/Android</div>
        </div>
      </div>
      <div class="stat-box" style="text-align:left; padding:14px; background: rgba(14, 22, 38, 0.7); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:600; font-size:0.85rem; color:#38bdf8;">npx cap add android / ios</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Genera proyecto Android Studio / Xcode</div>
        </div>
      </div>
      <div class="stat-box" style="text-align:left; padding:14px; background: rgba(14, 22, 38, 0.7); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:600; font-size:0.85rem; color:#f472b6;">npx cap open android / ios</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Abre IDE nativo para emulador o dispositivo real</div>
        </div>
      </div>
    </div>
  `;
}
