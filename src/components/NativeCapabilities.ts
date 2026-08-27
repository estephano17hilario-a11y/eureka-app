import type { DeviceStatus } from '../types';

export function renderNativeCapabilities(device: DeviceStatus, hapticsCount: number): string {
  return `
    <div class="native-panel">
      <div class="section-header" style="margin-top:0">
        <h3 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
          Capacitor Native Core
        </h3>
        <span class="hero-chip" style="margin-bottom:0">
          <span class="hero-chip-dot"></span> Online
        </span>
      </div>

      <div class="native-item-row">
        <div class="native-info">
          <div class="native-info-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div>
            <div class="native-label">Haptic Engine (Vibración)</div>
            <div class="native-sublabel">Disparado ${hapticsCount} veces</div>
          </div>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn-action" id="btn-haptic-light">Light</button>
          <button class="btn-action" id="btn-haptic-impact">Heavy</button>
        </div>
      </div>

      <div class="native-item-row">
        <div class="native-info">
          <div class="native-info-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="6" width="18" height="12" rx="2"></rect>
              <line x1="23" y1="13" x2="23" y2="11"></line>
            </svg>
          </div>
          <div>
            <div class="native-label">Device Info & Batería</div>
            <div class="native-sublabel">${device.model} • ${device.osVersion}</div>
          </div>
        </div>
        <button class="btn-action" id="btn-refresh-device">
          ${device.batteryLevel !== undefined ? `${device.batteryLevel}%` : 'Inspeccionar'}
        </button>
      </div>

      <div class="native-item-row">
        <div class="native-info">
          <div class="native-info-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div>
            <div class="native-label">Capacitor Preferences</div>
            <div class="native-sublabel">Almacenamiento nativo seguro</div>
          </div>
        </div>
        <button class="btn-action" id="btn-save-pref">Test Store</button>
      </div>

      <button class="btn-primary-gradient" id="btn-trigger-action">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        Ejecutar Secuencia Eureka
      </button>
    </div>
  `;
}
