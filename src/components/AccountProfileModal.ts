import { eurekaBackend, type AuthUser } from '../services/backend.service';
import { deckService } from '../services/deck.service';
import { openAuthModal } from './AuthModal';

export interface AccountProfileModalOptions {
  onAccountChanged: (user: AuthUser | null) => void;
  onClose?: () => void;
}

export function openAccountProfileModal(options: AccountProfileModalOptions): void {
  const existing = document.getElementById('modal-eureka-account-profile');
  if (existing) existing.remove();

  const currentUser = eurekaBackend.getCurrentUser();
  const isGuest = !currentUser || currentUser.email === 'guest@eureka.local' || currentUser.id.startsWith('guest_');
  const userDecks = deckService.getAllDecks().filter(d => !d.isArchived && !deckService.isFolder(d));
  const userCards = deckService.getAllCards();

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-eureka-account-profile" style="z-index:9999999; backdrop-filter:blur(24px); background:rgba(0,0,0,0.85); animation:iosFadeIn 0.2s ease;">
      <div class="apple-glass-modal" style="max-width:480px; width:92%; padding:28px 24px; border-radius:28px; box-shadow:0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(56,189,248,0.15); border:1px solid rgba(255,255,255,0.12); max-height:90vh; overflow-y:auto;">
        
        <!-- Header con Botón de Cierre -->
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.2rem;">👤</span>
            <h2 style="font-size:1.25rem; font-weight:900; color:#fff; margin:0;">Perfil y Cuenta</h2>
          </div>
          <button type="button" id="btn-close-account-modal" class="figma-icon-btn-ghost" style="width:32px; height:32px; font-size:1.1rem; border-radius:50%;">✕</button>
        </div>

        <!-- Tarjeta de Perfil Activo -->
        <div class="apple-glass-panel" style="padding:18px; border-radius:20px; border:1px solid rgba(56,189,248,0.3); background:linear-gradient(135deg, rgba(56,189,248,0.12), rgba(139,92,246,0.12)); margin-bottom:20px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <img 
              src="${currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Guest'}" 
              style="width:56px; height:56px; border-radius:18px; background:#0f172a; border:2px solid #38bdf8; box-shadow:0 8px 20px rgba(56,189,248,0.3);"
            />
            <div style="flex:1; min-width:0;">
              <div style="display:flex; align-items:center; gap:8px;">
                <h3 style="font-size:1.15rem; font-weight:900; color:#fff; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                  ${currentUser?.username || 'Invitado (Local)'}
                </h3>
                <span style="font-size:0.7rem; font-weight:800; background:${isGuest ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}; color:${isGuest ? '#f59e0b' : '#10b981'}; border:1px solid ${isGuest ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.4)'}; padding:2px 8px; border-radius:999px;">
                  ${isGuest ? 'Modo Local' : '🟢 Sincronizado en la Nube'}
                </span>
              </div>
              <div style="font-size:0.8rem; color:var(--f-text-secondary); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${isGuest ? 'Datos guardados en este dispositivo' : (currentUser?.email || 'Cuenta Eureka')}
              </div>
              <div style="font-size:0.75rem; color:#38bdf8; margin-top:4px; font-weight:600;">
                Servidor: Eureka VPS (89.117.73.97)
              </div>
            </div>
          </div>

          <!-- Métricas Rápidas -->
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-top:14px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08); text-align:center;">
            <div>
              <div style="font-size:1.1rem; font-weight:800; color:#fff;">${userDecks.length}</div>
              <div style="font-size:0.72rem; color:var(--f-text-muted);">Mazos</div>
            </div>
            <div>
              <div style="font-size:1.1rem; font-weight:800; color:#10b981;">${userCards.length}</div>
              <div style="font-size:0.72rem; color:var(--f-text-muted);">Tarjetas</div>
            </div>
            <div>
              <div style="font-size:1.1rem; font-weight:800; color:#f59e0b;">${currentUser?.streakDays || 1} 🔥</div>
              <div style="font-size:0.72rem; color:var(--f-text-muted);">Racha Días</div>
            </div>
          </div>
        </div>

        <!-- Estado de Sincronización y Acciones -->
        <div style="margin-bottom:20px; padding:14px; border-radius:18px; background:rgba(255,255,255,0.03); border:1px solid var(--f-border);">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
            <span style="font-size:0.82rem; font-weight:800; color:#fff;">⚡ Sincronización en Tiempo Real</span>
            <span id="sync-status-badge" style="font-size:0.72rem; font-weight:700; color:#10b981;">Activo</span>
          </div>
          <p style="font-size:0.78rem; color:var(--f-text-muted); margin:0 0 10px 0; line-height:1.4;">
            Tus mazos, tarjetas, avances y mapas mentales se sincronizan automáticamente con tu cuenta en el servidor central.
          </p>
          <button 
            type="button" 
            id="btn-force-sync" 
            class="apple-btn-outline-pill" 
            style="width:100%; padding:9px; font-size:0.82rem; font-weight:700; justify-content:center; border-radius:12px;"
          >
            🔄 Forzar Sincronización Ahora
          </button>
        </div>

        <!-- Botones de Cuenta -->
        <div style="display:flex; flex-direction:column; gap:10px;">
          <button 
            type="button" 
            id="btn-open-login-register" 
            class="figma-btn-blue-pill" 
            style="width:100%; padding:13px; font-size:0.95rem; font-weight:800; justify-content:center; border-radius:14px; box-shadow:0 6px 20px rgba(56,189,248,0.35);"
          >
            ${isGuest ? '🔐 Iniciar Sesión / Crear Cuenta' : '🔄 Cambiar de Cuenta'}
          </button>

          ${
            !isGuest
              ? `
            <button 
              type="button" 
              id="btn-action-logout" 
              class="apple-btn-outline-pill" 
              style="width:100%; padding:11px; font-size:0.88rem; font-weight:700; justify-content:center; border-radius:14px; border-color:rgba(239,68,68,0.3); color:#fca5a5;"
            >
              🚪 Cerrar Sesión en este Dispositivo
            </button>
          `
              : ''
          }
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modalRoot = document.getElementById('modal-eureka-account-profile') as HTMLElement;
  const btnForceSync = document.getElementById('btn-force-sync') as HTMLElement;

  const closeModal = () => {
    modalRoot.remove();
    options.onClose?.();
  };

  document.getElementById('btn-close-account-modal')?.addEventListener('click', closeModal);

  // Sincronización manual en 1 clic
  btnForceSync?.addEventListener('click', async () => {
    btnForceSync.textContent = 'Sincronizando... ⏳';
    try {
      await deckService.syncWithCloud();
      btnForceSync.textContent = '✓ ¡Sincronizado con éxito!';
      setTimeout(() => {
        if (btnForceSync) btnForceSync.textContent = '🔄 Forzar Sincronización Ahora';
      }, 2000);
    } catch {
      btnForceSync.textContent = '⚠️ Error de sincronización';
    }
  });

  // Abrir modal de Login / Registro
  document.getElementById('btn-open-login-register')?.addEventListener('click', () => {
    modalRoot.remove();
    openAuthModal({
      allowDismiss: true,
      onSuccess: async (user) => {
        options.onAccountChanged(user);
      }
    });
  });

  // Cerrar Sesión
  document.getElementById('btn-action-logout')?.addEventListener('click', async () => {
    await eurekaBackend.signOut();
    modalRoot.remove();
    options.onAccountChanged(null);
  });
}
