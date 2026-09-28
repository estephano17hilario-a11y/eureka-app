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
            <h2 style="font-size:1.25rem; font-weight:900; color:#fff; margin:0;">Centro de Cuentas</h2>
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
                  ${isGuest ? 'Modo Local' : '🟢 Sincronizado'}
                </span>
              </div>
              <div style="font-size:0.8rem; color:var(--f-text-secondary); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${isGuest ? 'Datos en este dispositivo' : (currentUser?.email || 'Cuenta Eureka')}
              </div>
              <div style="font-size:0.75rem; color:#38bdf8; margin-top:4px; font-weight:600;">
                Base de Datos: Servidor VPS PostgreSQL
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

        <!-- Conmutador Rápido de Cuentas (Cuentas Registradas en VPS) -->
        <div style="margin-bottom:20px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
            <span style="font-size:0.8rem; font-weight:800; color:var(--f-text-secondary); text-transform:uppercase; letter-spacing:0.04em;">
              Cuentas en este Servidor (Sincronización Universal)
            </span>
            <span id="account-loading-spinner" style="font-size:0.75rem; color:var(--f-blue);">Cargando... ⏳</span>
          </div>

          <div id="vps-accounts-list-container" style="display:flex; flex-direction:column; gap:8px; min-height:60px;">
            <div style="text-align:center; padding:16px; color:var(--f-text-muted); font-size:0.85rem;">
              Buscando cuentas en el servidor VPS...
            </div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div style="display:flex; flex-direction:column; gap:10px;">
          <button 
            type="button" 
            id="btn-open-login-register" 
            class="figma-btn-blue-pill" 
            style="width:100%; padding:13px; font-size:0.95rem; font-weight:800; justify-content:center; border-radius:14px; box-shadow:0 6px 20px rgba(56,189,248,0.35);"
          >
            ➕ Iniciar Sesión / Crear Nueva Cuenta
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
  const accountsContainer = document.getElementById('vps-accounts-list-container') as HTMLElement;
  const spinner = document.getElementById('account-loading-spinner') as HTMLElement;

  const closeModal = () => {
    modalRoot.remove();
    options.onClose?.();
  };

  document.getElementById('btn-close-account-modal')?.addEventListener('click', closeModal);

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

  // Cargar lista de cuentas desde el servidor VPS
  eurekaBackend.fetchAccounts().then((accounts) => {
    if (spinner) spinner.style.display = 'none';
    if (!accountsContainer) return;

    if (accounts.length === 0) {
      accountsContainer.innerHTML = `
        <div style="text-align:center; padding:14px; background:rgba(255,255,255,0.02); border-radius:12px; border:1px dashed var(--f-border); color:var(--f-text-muted); font-size:0.82rem;">
          No hay otras cuentas registradas aún. ¡Crea una para compartir datos con tu teléfono y la web!
        </div>
      `;
      return;
    }

    accountsContainer.innerHTML = accounts.map((acc) => {
      const isCurrent = currentUser?.id === acc.id || currentUser?.email === acc.email;
      const deckCount = (acc as any).deck_count ?? 0;

      return `
        <div style="display:flex; align-items:center; justify-content:space-between; background:${isCurrent ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${isCurrent ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)'}; padding:10px 14px; border-radius:14px; transition:all 0.15s;">
          <div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
            <img src="${acc.avatarUrl}" style="width:36px; height:36px; border-radius:10px; background:#1e293b; flex-shrink:0;" />
            <div style="min-width:0; flex:1;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-weight:800; color:#fff; font-size:0.9rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                  ${acc.username}
                </span>
                ${isCurrent ? '<span style="font-size:0.68rem; font-weight:800; color:#38bdf8; background:rgba(56,189,248,0.2); padding:1px 6px; border-radius:999px;">Activa</span>' : ''}
              </div>
              <div style="font-size:0.74rem; color:var(--f-text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${acc.email || 'Cuenta Eureka'} • ${deckCount} mazos
              </div>
            </div>
          </div>

          ${
            isCurrent
              ? `
            <span style="color:#10b981; font-size:0.82rem; font-weight:800; padding:4px 8px;">
              ✓ Conectado
            </span>
          `
              : `
            <button type="button" class="btn-quick-switch-account figma-btn-blue-pill" data-account-id="${acc.id}" style="padding:6px 14px; font-size:0.8rem; border-radius:10px; font-weight:700; flex-shrink:0;">
              ⚡ Conectar
            </button>
          `
          }
        </div>
      `;
    }).join('');

    // Eventos de conexión rápida
    accountsContainer.querySelectorAll('.btn-quick-switch-account').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.accountId;
        const target = accounts.find((a) => a.id === id);
        if (target) {
          btn.textContent = 'Conectando...';
          await eurekaBackend.selectAccount(target);
          modalRoot.remove();
          options.onAccountChanged(target);
        }
      });
    });
  }).catch(() => {
    if (spinner) spinner.style.display = 'none';
    if (accountsContainer) {
      accountsContainer.innerHTML = `
        <div style="text-align:center; padding:12px; color:var(--f-text-muted); font-size:0.82rem;">
          No se pudieron cargar cuentas adicionales del servidor.
        </div>
      `;
    }
  });
}
