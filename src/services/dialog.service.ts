export interface IntervalPickerOptions {
  title?: string;
  subtitle?: string;
  initialMinutes?: number;
  onConfirm: (totalMinutes: number) => void;
  onCancel?: () => void;
}

export interface PromptModalOptions {
  title: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  inputType?: 'text' | 'number';
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
}

export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface AlertModalOptions {
  title: string;
  message: string;
  buttonText?: string;
  onConfirm?: () => void;
}

export class DialogService {
  private static instance: DialogService;

  private constructor() {}

  public static getInstance(): DialogService {
    if (!DialogService.instance) {
      DialogService.instance = new DialogService();
    }
    return DialogService.instance;
  }

  /**
   * Modal hermoso para editar intervalos con Días, Horas y Minutos + Presets rápidos
   */
  public showIntervalPicker(options: IntervalPickerOptions): void {
    const totalInit = Math.max(1, options.initialMinutes || 4);
    let initDays = Math.floor(totalInit / 1440);
    let remainingMinutes = totalInit % 1440;
    let initHours = Math.floor(remainingMinutes / 60);
    let initMins = remainingMinutes % 60;

    const modal = document.createElement('div');
    modal.className = 'apple-modal-overlay';
    modal.innerHTML = `
      <div class="apple-modal-content apple-glass-panel" style="max-width:460px; width:92%; padding:24px; animation: modalPopIn 0.22s ease-out;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
          <div>
            <h3 style="font-size:1.3rem; font-weight:800; color:#fff; letter-spacing:-0.02em;">
              ${options.title || 'Modificar Intervalo'}
            </h3>
            ${options.subtitle ? `<p style="font-size:0.85rem; color:var(--f-text-secondary); margin-top:2px;">${options.subtitle}</p>` : ''}
          </div>
          <button id="btn-dialog-close-x" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.4rem; cursor:pointer; padding:4px;">✕</button>
        </div>

        <!-- 3 Inputs: Días, Horas, Minutos -->
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom:16px;">
          <div class="interval-input-group">
            <label style="font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); display:block; margin-bottom:6px;">Días</label>
            <input type="number" id="picker-days" min="0" max="3650" value="${initDays}" class="cupertino-dialog-input" />
          </div>

          <div class="interval-input-group">
            <label style="font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); display:block; margin-bottom:6px;">Horas</label>
            <input type="number" id="picker-hours" min="0" max="23" value="${initHours}" class="cupertino-dialog-input" />
          </div>

          <div class="interval-input-group">
            <label style="font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); display:block; margin-bottom:6px;">Minutos</label>
            <input type="number" id="picker-minutes" min="0" max="59" value="${initMins}" class="cupertino-dialog-input" />
          </div>
        </div>

        <!-- Live Calculation Preview -->
        <div id="picker-live-preview" style="background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:10px 14px; margin-bottom:16px; font-size:0.88rem; font-weight:700; color:var(--f-blue); text-align:center;">
          ⏱️ Total calculado: ${this.formatReadableDuration(initDays, initHours, initMins)}
        </div>

        <!-- Quick Presets -->
        <div style="margin-bottom:20px;">
          <span style="font-size:0.75rem; font-weight:800; color:var(--f-text-muted); text-transform:uppercase; letter-spacing:0.04em; display:block; margin-bottom:8px;">
            Atajos rápidos:
          </span>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="preset-btn" data-days="0" data-hours="0" data-mins="4">4 min</button>
            <button class="preset-btn" data-days="0" data-hours="0" data-mins="10">10 min</button>
            <button class="preset-btn" data-days="0" data-hours="1" data-mins="0">1 hora</button>
            <button class="preset-btn" data-days="1" data-hours="0" data-mins="0">1 día</button>
            <button class="preset-btn" data-days="2" data-hours="0" data-mins="0">2 días</button>
            <button class="preset-btn" data-days="5" data-hours="0" data-mins="0">5 días</button>
            <button class="preset-btn" data-days="15" data-hours="0" data-mins="0">15 días</button>
            <button class="preset-btn" data-days="30" data-hours="0" data-mins="0">1 mes</button>
            <button class="preset-btn" data-days="600" data-hours="0" data-mins="0">600 días</button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex; align-items:center; justify-content:flex-end; gap:10px;">
          <button class="dialog-btn dialog-btn-cancel" id="btn-dialog-cancel">
            Cancelar
          </button>
          <button class="dialog-btn dialog-btn-primary" id="btn-dialog-save-interval">
            Guardar Intervalo
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const inputDays = modal.querySelector('#picker-days') as HTMLInputElement;
    const inputHours = modal.querySelector('#picker-hours') as HTMLInputElement;
    const inputMins = modal.querySelector('#picker-minutes') as HTMLInputElement;
    const previewEl = modal.querySelector('#picker-live-preview') as HTMLElement;

    const updatePreview = () => {
      const d = Math.max(0, parseInt(inputDays.value, 10) || 0);
      const h = Math.max(0, parseInt(inputHours.value, 10) || 0);
      const m = Math.max(0, parseInt(inputMins.value, 10) || 0);
      const total = d * 1440 + h * 60 + m;
      previewEl.textContent = `⏱️ Total: ${this.formatReadableDuration(d, h, m)} (${total} minutos)`;
    };

    [inputDays, inputHours, inputMins].forEach((inp) => {
      inp.addEventListener('input', updatePreview);
    });

    modal.querySelectorAll<HTMLButtonElement>('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        inputDays.value = btn.dataset.days || '0';
        inputHours.value = btn.dataset.hours || '0';
        inputMins.value = btn.dataset.mins || '0';
        updatePreview();
      });
    });

    const closeModal = () => modal.remove();

    modal.querySelector('#btn-dialog-close-x')?.addEventListener('click', () => {
      closeModal();
      if (options.onCancel) options.onCancel();
    });

    modal.querySelector('#btn-dialog-cancel')?.addEventListener('click', () => {
      closeModal();
      if (options.onCancel) options.onCancel();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
        if (options.onCancel) options.onCancel();
      }
    });

    modal.querySelector('#btn-dialog-save-interval')?.addEventListener('click', () => {
      const d = Math.max(0, parseInt(inputDays.value, 10) || 0);
      const h = Math.max(0, parseInt(inputHours.value, 10) || 0);
      const m = Math.max(0, parseInt(inputMins.value, 10) || 0);
      const total = Math.max(1, d * 1440 + h * 60 + m);
      closeModal();
      options.onConfirm(total);
    });
  }

  private formatReadableDuration(days: number, hours: number, minutes: number): string {
    const parts: string[] = [];
    if (days > 0) parts.push(days === 1 ? '1 día' : `${days} días`);
    if (hours > 0) parts.push(hours === 1 ? '1 hora' : `${hours} horas`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes} min`);
    return parts.join(', ');
  }

  /**
   * Modal de Entrada de Texto (Reemplazo nativo de prompt)
   */
  public showPrompt(options: PromptModalOptions): void {
    const modal = document.createElement('div');
    modal.className = 'apple-modal-overlay';
    modal.innerHTML = `
      <div class="apple-modal-content apple-glass-panel" style="max-width:440px; width:92%; padding:24px; animation: modalPopIn 0.22s ease-out;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <h3 style="font-size:1.25rem; font-weight:800; color:#fff; letter-spacing:-0.02em;">
            ${options.title}
          </h3>
          <button id="btn-prompt-close-x" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
        </div>

        ${options.message ? `<p style="font-size:0.9rem; color:var(--f-text-secondary); margin-bottom:14px; line-height:1.4;">${options.message}</p>` : ''}

        <input 
          type="${options.inputType || 'text'}" 
          id="prompt-modal-input" 
          value="${options.defaultValue || ''}" 
          placeholder="${options.placeholder || ''}" 
          class="cupertino-dialog-input" 
          style="width:100%; margin-bottom:18px;" 
        />

        <div style="display:flex; align-items:center; justify-content:flex-end; gap:10px;">
          <button class="dialog-btn dialog-btn-cancel" id="btn-prompt-cancel">
            ${options.cancelText || 'Cancelar'}
          </button>
          <button class="dialog-btn dialog-btn-primary" id="btn-prompt-confirm">
            ${options.confirmText || 'Aceptar'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const input = modal.querySelector('#prompt-modal-input') as HTMLInputElement;
    input.focus();
    input.select();

    const closeModal = () => modal.remove();

    const handleConfirm = () => {
      const val = input.value.trim();
      closeModal();
      options.onConfirm(val);
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleConfirm();
      if (e.key === 'Escape') {
        closeModal();
        if (options.onCancel) options.onCancel();
      }
    });

    modal.querySelector('#btn-prompt-close-x')?.addEventListener('click', () => {
      closeModal();
      if (options.onCancel) options.onCancel();
    });

    modal.querySelector('#btn-prompt-cancel')?.addEventListener('click', () => {
      closeModal();
      if (options.onCancel) options.onCancel();
    });

    modal.querySelector('#btn-prompt-confirm')?.addEventListener('click', handleConfirm);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
        if (options.onCancel) options.onCancel();
      }
    });
  }

  /**
   * Modal de Confirmación (Reemplazo nativo de confirm)
   */
  public showConfirm(options: ConfirmModalOptions): void {
    const modal = document.createElement('div');
    modal.className = 'apple-modal-overlay';
    modal.innerHTML = `
      <div class="apple-modal-content apple-glass-panel" style="max-width:420px; width:90%; padding:24px; animation: modalPopIn 0.22s ease-out;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <h3 style="font-size:1.25rem; font-weight:800; color:${options.isDanger ? '#f87171' : '#fff'}; letter-spacing:-0.02em;">
            ${options.isDanger ? '⚠️ ' : ''}${options.title}
          </h3>
          <button id="btn-confirm-close-x" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
        </div>

        <p style="font-size:0.92rem; color:var(--f-text-secondary); margin-bottom:20px; line-height:1.5;">
          ${options.message}
        </p>

        <div style="display:flex; align-items:center; justify-content:flex-end; gap:10px;">
          <button class="dialog-btn dialog-btn-cancel" id="btn-confirm-cancel">
            ${options.cancelText || 'Cancelar'}
          </button>
          <button class="dialog-btn ${options.isDanger ? 'dialog-btn-danger' : 'dialog-btn-primary'}" id="btn-confirm-ok">
            ${options.confirmText || 'Aceptar'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();

    modal.querySelector('#btn-confirm-close-x')?.addEventListener('click', () => {
      closeModal();
      if (options.onCancel) options.onCancel();
    });

    modal.querySelector('#btn-confirm-cancel')?.addEventListener('click', () => {
      closeModal();
      if (options.onCancel) options.onCancel();
    });

    modal.querySelector('#btn-confirm-ok')?.addEventListener('click', () => {
      closeModal();
      options.onConfirm();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
        if (options.onCancel) options.onCancel();
      }
    });
  }

  /**
   * Modal de Información / Aviso (Reemplazo nativo de alert)
   */
  public showAlert(options: AlertModalOptions): void {
    const modal = document.createElement('div');
    modal.className = 'apple-modal-overlay';
    modal.innerHTML = `
      <div class="apple-modal-content apple-glass-panel" style="max-width:440px; width:90%; padding:24px; animation: modalPopIn 0.22s ease-out;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <h3 style="font-size:1.25rem; font-weight:800; color:#fff; letter-spacing:-0.02em;">
            ${options.title}
          </h3>
          <button id="btn-alert-close-x" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
        </div>

        <p style="font-size:0.92rem; color:var(--f-text-secondary); margin-bottom:20px; line-height:1.5; white-space:pre-line;">
          ${options.message}
        </p>

        <div style="display:flex; align-items:center; justify-content:flex-end;">
          <button class="dialog-btn dialog-btn-primary" id="btn-alert-ok" style="min-width:110px;">
            ${options.buttonText || 'Entendido'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
      modal.remove();
      if (options.onConfirm) options.onConfirm();
    };

    modal.querySelector('#btn-alert-close-x')?.addEventListener('click', closeModal);
    modal.querySelector('#btn-alert-ok')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

export const dialogService = DialogService.getInstance();
