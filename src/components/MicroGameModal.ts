import confetti from 'canvas-confetti';
import { nativeService } from '../services/native.service';

export interface MicroGameOptions {
  streakCount: number;
  gameType?: 'all' | 'bubbles' | 'breathing' | 'rhythm';
  onContinue: () => void;
}

export function openMicroGameModal(options: MicroGameOptions): void {
  const existing = document.getElementById('modal-microgame-root');
  if (existing) existing.remove();

  const games = ['bubbles', 'breathing', 'rhythm'] as const;
  const selectedType =
    options.gameType && options.gameType !== 'all'
      ? options.gameType
      : games[Math.floor(Math.random() * games.length)];

  const modal = document.createElement('div');
  modal.id = 'modal-microgame-root';
  modal.className = 'apple-modal-overlay';
  modal.style.zIndex = '99999';

  let gameContentHtml = '';

  if (selectedType === 'bubbles') {
    gameContentHtml = `
      <div style="text-align:center;">
        <span class="apple-badge-subpill" style="font-size:0.8rem; background:rgba(56,189,248,0.16); color:var(--f-blue); margin-bottom:10px;">
          🧠 Pausa Neuro-Ergonómica • ¡${options.streakCount} tarjetas!
        </span>
        <h2 style="font-size:1.45rem; font-weight:800; color:#ffffff; margin-bottom:6px; letter-spacing:-0.02em;">
          🌌 Dopa-Burbujas Zen
        </h2>
        <p style="font-size:0.86rem; color:var(--f-text-secondary); margin-bottom:20px; line-height:1.4;">
          Revienta las 5 esferas para reiniciar tu dopamina y despejar la mente sin estrés.
        </p>

        <!-- Bubble Play Area -->
        <div id="bubble-play-area" style="position:relative; height:180px; width:100%; max-width:360px; margin:0 auto 20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:20px; overflow:hidden;">
          <div class="zen-bubble" data-idx="1" style="top:25px; left:30px; background:radial-gradient(circle, #38bdf8, #0284c7);">✨</div>
          <div class="zen-bubble" data-idx="2" style="top:85px; left:110px; background:radial-gradient(circle, #a855f7, #7e22ce);">🌸</div>
          <div class="zen-bubble" data-idx="3" style="top:30px; right:40px; background:radial-gradient(circle, #10b981, #059669);">🌿</div>
          <div class="zen-bubble" data-idx="4" style="bottom:25px; left:50px; background:radial-gradient(circle, #f59e0b, #d97706);">⚡</div>
          <div class="zen-bubble" data-idx="5" style="bottom:30px; right:60px; background:radial-gradient(circle, #ec4899, #be185d);">💎</div>
        </div>

        <div id="microgame-status-msg" style="font-size:0.92rem; font-weight:700; color:var(--f-text-secondary); margin-bottom:16px;">
          Toca las burbujas flotantes (0/5)
        </div>
      </div>
    `;
  } else if (selectedType === 'breathing') {
    gameContentHtml = `
      <div style="text-align:center;">
        <span class="apple-badge-subpill" style="font-size:0.8rem; background:rgba(16,185,129,0.16); color:#10b981; margin-bottom:10px;">
          🧠 Desconexión Parasimpática • ¡${options.streakCount} tarjetas!
        </span>
        <h2 style="font-size:1.45rem; font-weight:800; color:#ffffff; margin-bottom:6px; letter-spacing:-0.02em;">
          🌸 Respiración de Enfoque
        </h2>
        <p style="font-size:0.86rem; color:var(--f-text-secondary); margin-bottom:20px; line-height:1.4;">
          Sigue el ritmo del orbe para liberar carga alostática y oxigenar tu memoria.
        </p>

        <!-- Breathing Orb Area -->
        <div style="height:190px; display:flex; align-items:center; justify-content:center; margin-bottom:16px;">
          <div class="breathing-orb-container">
            <div class="breathing-orb" id="zen-breath-orb"></div>
          </div>
        </div>

        <div id="breathing-guide-text" style="font-size:1.05rem; font-weight:800; color:var(--f-blue); margin-bottom:16px; transition:all 0.4s ease;">
          Inhala profundamente...
        </div>
      </div>
    `;
  } else {
    gameContentHtml = `
      <div style="text-align:center;">
        <span class="apple-badge-subpill" style="font-size:0.8rem; background:rgba(168,85,247,0.16); color:#c084fc; margin-bottom:10px;">
          🧠 Reflejo Armónico • ¡${options.streakCount} tarjetas!
        </span>
        <h2 style="font-size:1.45rem; font-weight:800; color:#ffffff; margin-bottom:6px; letter-spacing:-0.02em;">
          ⚡ Toque Armónico Zen
        </h2>
        <p style="font-size:0.86rem; color:var(--f-text-secondary); margin-bottom:20px; line-height:1.4;">
          Toca en cualquier momento para sincronizar tus ondas cerebrales.
        </p>

        <div id="rhythm-tap-target" style="height:170px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; cursor:pointer;">
          <div class="harmonic-ripple-core">
            <span style="font-size:1.8rem;">✨</span>
          </div>
        </div>

        <div id="rhythm-status-msg" style="font-size:0.92rem; font-weight:700; color:var(--f-text-secondary); margin-bottom:16px;">
          Toca el núcleo central
        </div>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="apple-modal-content apple-glass-panel" style="max-width:440px; width:92%; padding:28px 24px; animation: modalPopIn 0.22s ease-out; position:relative;">
      <button id="btn-skip-microgame-x" style="position:absolute; top:16px; right:16px; background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer; padding:4px;">✕</button>

      ${gameContentHtml}

      <div style="display:flex; justify-content:center; gap:10px; margin-top:8px;">
        <button class="dialog-btn dialog-btn-primary" id="btn-continue-studying-now" style="width:100%; padding:14px; border-radius:14px; font-size:1rem; font-weight:800; background:var(--f-blue); color:#07080a; justify-content:center;">
          ⚡ Continuar Estudiando ›
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => {
    modal.remove();
    options.onContinue();
  };

  modal.querySelector('#btn-skip-microgame-x')?.addEventListener('click', close);
  modal.querySelector('#btn-continue-studying-now')?.addEventListener('click', close);

  // Esc / Space to continue
  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
      window.removeEventListener('keydown', keyHandler);
      close();
    }
  };
  window.addEventListener('keydown', keyHandler);

  // Game Logic
  if (selectedType === 'bubbles') {
    let poppedCount = 0;
    const statusMsg = modal.querySelector('#microgame-status-msg') as HTMLElement;
    modal.querySelectorAll('.zen-bubble').forEach((bubble) => {
      bubble.addEventListener('click', () => {
        if ((bubble as HTMLElement).classList.contains('popped')) return;
        (bubble as HTMLElement).classList.add('popped');
        nativeService.triggerHaptics('light');
        poppedCount += 1;
        statusMsg.textContent = `¡Pop! (${poppedCount}/5)`;

        if (poppedCount === 5) {
          nativeService.triggerHaptics('heavy');
          confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
          statusMsg.innerHTML = `<span style="color:#10b981; font-weight:800;">✨ ¡Mente Despejada y Restaurada! (+15 XP)</span>`;
          setTimeout(() => {
            close();
          }, 1200);
        }
      });
    });
  } else if (selectedType === 'breathing') {
    const textEl = modal.querySelector('#breathing-guide-text') as HTMLElement;
    let breathState = 'inhale';

    const breathInterval = setInterval(() => {
      if (!document.getElementById('modal-microgame-root')) {
        clearInterval(breathInterval);
        return;
      }
      if (breathState === 'inhale') {
        breathState = 'exhale';
        if (textEl) {
          textEl.textContent = 'Exhala suavemente... calma.';
          textEl.style.color = '#10b981';
        }
      } else {
        breathState = 'inhale';
        if (textEl) {
          textEl.textContent = 'Inhala profundamente...';
          textEl.style.color = 'var(--f-blue)';
        }
      }
    }, 4000);
  } else if (selectedType === 'rhythm') {
    const tapArea = modal.querySelector('#rhythm-tap-target');
    const statusMsg = modal.querySelector('#rhythm-status-msg') as HTMLElement;
    tapArea?.addEventListener('click', () => {
      nativeService.triggerHaptics('medium');
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
      if (statusMsg) {
        statusMsg.innerHTML = `<span style="color:#a855f7; font-weight:800;">✨ ¡Armonía y Enfoque Sincronizados!</span>`;
      }
      setTimeout(() => close(), 900);
    });
  }
}
