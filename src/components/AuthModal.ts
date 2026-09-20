import { eurekaBackend, type AuthUser } from '../services/backend.service';

export interface AuthModalOptions {
  onSuccess: (user: AuthUser) => void;
  onClose?: () => void;
  allowDismiss?: boolean;
}

export function openAuthModal(options: AuthModalOptions): void {
  const existing = document.getElementById('modal-eureka-auth');
  if (existing) existing.remove();

  let activeTab: 'login' | 'register' = 'login';
  let isLoading = false;

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-eureka-auth" style="z-index:9999999; backdrop-filter:blur(24px); background:rgba(0,0,0,0.85);">
      <div class="apple-glass-modal" style="max-width:440px; width:92%; padding:32px 28px; border-radius:28px; box-shadow:0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(56,189,248,0.15); border:1px solid rgba(255,255,255,0.12);">
        
        <!-- Logo & Header -->
        <div style="text-align:center; margin-bottom:24px;">
          <div style="width:64px; height:64px; border-radius:20px; background:linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #8b5cf6 100%); display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px; box-shadow:0 10px 25px rgba(56,189,248,0.35);">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          </div>
          <h2 style="font-size:1.6rem; font-weight:900; color:#ffffff; letter-spacing:-0.03em; margin:0 0 4px 0;">EUREKA</h2>
          <p style="font-size:0.88rem; color:var(--f-text-secondary); margin:0;">Flashcards & Repetición Espaciada Inteligente</p>
        </div>

        <!-- Segmented Tab Switcher -->
        <div style="display:flex; background:#14151b; border-radius:14px; padding:4px; border:1px solid var(--f-border); margin-bottom:20px;">
          <button type="button" id="tab-auth-login" class="apple-tab-pill active" style="flex:1; padding:9px; border-radius:10px; border:none; cursor:pointer; font-weight:800; font-size:0.9rem; text-align:center;">
            Iniciar Sesión
          </button>
          <button type="button" id="tab-auth-register" class="apple-tab-pill" style="flex:1; padding:9px; border-radius:10px; border:none; cursor:pointer; font-weight:800; font-size:0.9rem; text-align:center;">
            Crear Cuenta
          </button>
        </div>

        <!-- Alert Error Box -->
        <div id="auth-error-box" style="display:none; padding:10px 14px; border-radius:12px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#fca5a5; font-size:0.84rem; font-weight:600; margin-bottom:16px;"></div>

        <!-- Formulario -->
        <form id="form-auth-user" style="display:flex; flex-direction:column; gap:14px;">
          
          <!-- Nombre de usuario (Solo Registro) -->
          <div id="field-auth-username" style="display:none; flex-direction:column; gap:6px;">
            <label style="font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; letter-spacing:0.04em;">Nombre de Usuario</label>
            <input 
              type="text" 
              id="input-auth-username" 
              class="cupertino-editor-card-box" 
              style="padding:13px 16px; border-radius:14px; font-size:0.95rem; color:#fff; background:#121319; border:1px solid var(--f-border); outline:none;" 
              placeholder="Tu nombre o alias..." 
              autocomplete="name"
            />
          </div>

          <!-- Correo Electrónico -->
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label style="font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; letter-spacing:0.04em;">Correo Electrónico</label>
            <input 
              type="email" 
              id="input-auth-email" 
              class="cupertino-editor-card-box" 
              style="padding:13px 16px; border-radius:14px; font-size:0.95rem; color:#fff; background:#121319; border:1px solid var(--f-border); outline:none;" 
              placeholder="tu@correo.com" 
              required 
              autocomplete="email"
            />
          </div>

          <!-- Contraseña -->
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label style="font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; letter-spacing:0.04em;">Contraseña</label>
            <input 
              type="password" 
              id="input-auth-password" 
              class="cupertino-editor-card-box" 
              style="padding:13px 16px; border-radius:14px; font-size:0.95rem; color:#fff; background:#121319; border:1px solid var(--f-border); outline:none;" 
              placeholder="Mínimo 6 caracteres..." 
              required 
              autocomplete="current-password"
            />
          </div>

          <!-- Botón de Envío -->
          <button 
            type="submit" 
            id="btn-auth-submit" 
            class="figma-btn-blue-pill" 
            style="width:100%; padding:14px; font-size:1rem; font-weight:800; justify-content:center; margin-top:8px; border-radius:14px; box-shadow:0 8px 24px rgba(56,189,248,0.35);"
          >
            <span id="btn-auth-submit-text">Iniciar Sesión</span>
          </button>

        </form>

        <!-- Divisor -->
        <div style="display:flex; align-items:center; gap:12px; margin:20px 0 16px 0;">
          <div style="flex:1; height:1px; background:rgba(255,255,255,0.08);"></div>
          <span style="font-size:0.75rem; color:var(--f-text-muted); font-weight:700; text-transform:uppercase;">o</span>
          <div style="flex:1; height:1px; background:rgba(255,255,255,0.08);"></div>
        </div>

        <!-- Modo Local / Invitado -->
        <button 
          type="button" 
          id="btn-auth-guest" 
          class="apple-btn-outline-pill" 
          style="width:100%; padding:12px; font-size:0.88rem; font-weight:700; justify-content:center; border-radius:14px; border-color:rgba(255,255,255,0.12); color:#e2e8f0;"
        >
          👤 Continuar en Modo Local (Sin Cuenta)
        </button>

        ${
          options.allowDismiss
            ? `
          <button type="button" id="btn-auth-dismiss" style="background:none; border:none; color:var(--f-text-muted); font-size:0.84rem; margin-top:14px; width:100%; cursor:pointer;">
            ✕ Cerrar ventana
          </button>
        `
            : ''
        }

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modalRoot = document.getElementById('modal-eureka-auth') as HTMLElement;
  const tabLogin = document.getElementById('tab-auth-login') as HTMLElement;
  const tabRegister = document.getElementById('tab-auth-register') as HTMLElement;
  const fieldUsername = document.getElementById('field-auth-username') as HTMLElement;
  const inputUsername = document.getElementById('input-auth-username') as HTMLInputElement;
  const inputEmail = document.getElementById('input-auth-email') as HTMLInputElement;
  const inputPassword = document.getElementById('input-auth-password') as HTMLInputElement;
  const btnSubmitText = document.getElementById('btn-auth-submit-text') as HTMLElement;
  const errorBox = document.getElementById('auth-error-box') as HTMLElement;
  const form = document.getElementById('form-auth-user') as HTMLFormElement;

  const setTab = (tab: 'login' | 'register') => {
    activeTab = tab;
    errorBox.style.display = 'none';
    if (tab === 'login') {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      fieldUsername.style.display = 'none';
      btnSubmitText.textContent = 'Iniciar Sesión';
    } else {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      fieldUsername.style.display = 'flex';
      btnSubmitText.textContent = 'Crear Cuenta Eureka';
    }
  };

  tabLogin.addEventListener('click', () => setTab('login'));
  tabRegister.addEventListener('click', () => setTab('register'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const email = inputEmail.value.trim();
    const password = inputPassword.value;
    const username = inputUsername.value.trim();

    if (!email || !password) {
      errorBox.textContent = 'Por favor completa todos los campos requeridos.';
      errorBox.style.display = 'block';
      return;
    }

    if (password.length < 6) {
      errorBox.textContent = 'La contraseña debe tener al menos 6 caracteres.';
      errorBox.style.display = 'block';
      return;
    }

    isLoading = true;
    btnSubmitText.textContent = 'Verificando... ⏳';
    errorBox.style.display = 'none';

    try {
      if (activeTab === 'register') {
        const res = await eurekaBackend.signUp(email, password, username || email.split('@')[0]);
        if (res.user) {
          modalRoot.remove();
          options.onSuccess(res.user);
        } else {
          errorBox.textContent = res.error || 'Error al crear la cuenta.';
          errorBox.style.display = 'block';
        }
      } else {
        const res = await eurekaBackend.signIn(email, password);
        if (res.user) {
          modalRoot.remove();
          options.onSuccess(res.user);
        } else {
          errorBox.textContent = res.error || 'Error al iniciar sesión.';
          errorBox.style.display = 'block';
        }
      }
    } catch (err: any) {
      errorBox.textContent = err.message || 'Ocurrió un error inesperado.';
      errorBox.style.display = 'block';
    } finally {
      isLoading = false;
      btnSubmitText.textContent = activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Eureka';
    }
  });

  // Modo Invitado
  document.getElementById('btn-auth-guest')?.addEventListener('click', () => {
    const guestUser = eurekaBackend.setGuestSession();
    modalRoot.remove();
    options.onSuccess(guestUser);
  });

  // Cerrar si está permitido
  document.getElementById('btn-auth-dismiss')?.addEventListener('click', () => {
    modalRoot.remove();
    options.onClose?.();
  });
}
