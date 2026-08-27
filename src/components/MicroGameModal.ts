import confetti from 'canvas-confetti';
import { nativeService } from '../services/native.service';

export interface MicroGameOptions {
  streakCount: number;
  gameType?: 'all' | 'tap_frenzy' | 'flash_reflex' | 'meteor_smash' | 'arrow_rush';
  onContinue: () => void;
}

export function openMicroGameModal(options: MicroGameOptions): void {
  const existing = document.getElementById('modal-microgame-root');
  if (existing) existing.remove();

  const games = ['tap_frenzy', 'flash_reflex', 'meteor_smash', 'arrow_rush'] as const;
  const selectedType =
    options.gameType && options.gameType !== 'all' && games.includes(options.gameType as any)
      ? (options.gameType as typeof games[number])
      : games[Math.floor(Math.random() * games.length)];

  const modal = document.createElement('div');
  modal.id = 'modal-microgame-root';
  modal.className = 'apple-modal-overlay';
  modal.style.zIndex = '99999';

  let gameHtml = '';

  // 1. TAP FRENZY (RÁFAGA NEÓN)
  if (selectedType === 'tap_frenzy') {
    gameHtml = `
      <div style="text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:8px;">
          <span class="apple-badge-subpill" style="font-size:0.8rem; background:rgba(245,158,11,0.18); color:#f59e0b; border:1px solid rgba(245,158,11,0.35);">
            ⚡ RÁFAGA DE REFLEJOS • ¡${options.streakCount} tarjetas!
          </span>
        </div>
        <h2 style="font-size:1.55rem; font-weight:900; color:#ffffff; margin-bottom:4px; letter-spacing:-0.03em; text-transform:uppercase;">
          🔥 RÁFAGA NEÓN
        </h2>
        <p style="font-size:0.88rem; color:var(--f-text-secondary); margin-bottom:16px;">
          ¡Toca el turbo botón <strong>10 VECES</strong> a máxima velocidad!
        </p>

        <!-- Timer bar -->
        <div style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:999px; overflow:hidden; margin-bottom:20px;">
          <div id="turbo-timer-bar" style="width:100%; height:100%; background:linear-gradient(90deg, #f59e0b, #ef4444); transition:width 0.1s linear;"></div>
        </div>

        <!-- Giant Turbo Tap Button -->
        <div style="margin-bottom:20px;">
          <button id="btn-turbo-frenzy" class="turbo-tap-btn">
            <span style="font-size:2.4rem; display:block; filter:drop-shadow(0 0 10px #f59e0b);">⚡</span>
            <span id="turbo-tap-count" style="font-size:1.3rem; font-weight:900; color:#fff;">¡TOCA YA! (0/10)</span>
          </button>
        </div>

        <div id="frenzy-status-feedback" style="font-size:1.05rem; font-weight:800; color:#38bdf8; min-height:24px;">
          ¡Preparado... Dale!
        </div>
      </div>
    `;
  }

  // 2. FLASH REFLEX (CAZA-DESTELLOS EN MILISEGUNDOS)
  else if (selectedType === 'flash_reflex') {
    gameHtml = `
      <div style="text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:8px;">
          <span class="apple-badge-subpill" style="font-size:0.8rem; background:rgba(56,189,248,0.18); color:var(--f-blue); border:1px solid rgba(56,189,248,0.35);">
            🎯 REACCIÓN EXTREMA • ¡${options.streakCount} tarjetas!
          </span>
        </div>
        <h2 style="font-size:1.55rem; font-weight:900; color:#ffffff; margin-bottom:4px; letter-spacing:-0.03em; text-transform:uppercase;">
          🎯 CAZA-DESTELLOS
        </h2>
        <p style="font-size:0.88rem; color:var(--f-text-secondary); margin-bottom:16px;">
          ¡Toca el botón que se ilumine en cuanto parpadee! (Ronda <span id="flash-round-num">1</span>/3)
        </p>

        <!-- 4 Grid targets -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; max-width:280px; margin:0 auto 20px;">
          <button class="flash-target-btn" data-target-id="0" style="--c:#38bdf8;">🔷</button>
          <button class="flash-target-btn" data-target-id="1" style="--c:#a855f7;">🟣</button>
          <button class="flash-target-btn" data-target-id="2" style="--c:#10b981;">🟢</button>
          <button class="flash-target-btn" data-target-id="3" style="--c:#f59e0b;">🟡</button>
        </div>

        <div id="flash-status-feedback" style="font-size:1.05rem; font-weight:800; color:#38bdf8; min-height:24px;">
          ¡Ojo a la pantalla...!
        </div>
      </div>
    `;
  }

  // 3. METEOR SMASH (LLUVIA DE METEOROS)
  else if (selectedType === 'meteor_smash') {
    gameHtml = `
      <div style="text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:8px;">
          <span class="apple-badge-subpill" style="font-size:0.8rem; background:rgba(239,68,68,0.18); color:#f87171; border:1px solid rgba(239,68,68,0.35);">
            💥 DESTRUCCIÓN VELOZ • ¡${options.streakCount} tarjetas!
          </span>
        </div>
        <h2 style="font-size:1.55rem; font-weight:900; color:#ffffff; margin-bottom:4px; letter-spacing:-0.03em; text-transform:uppercase;">
          💥 METEOR SMASH
        </h2>
        <p style="font-size:0.88rem; color:var(--f-text-secondary); margin-bottom:14px;">
          ¡Revienta los 6 meteoros espaciales antes de que escapen!
        </p>

        <!-- Arena -->
        <div id="meteor-smash-arena" style="position:relative; width:100%; height:190px; background:radial-gradient(circle at 50% 50%, rgba(239,68,68,0.08), rgba(0,0,0,0.5)); border:1.5px solid rgba(239,68,68,0.25); border-radius:20px; overflow:hidden; margin-bottom:16px;">
          <div class="meteor-target" data-m-id="1" style="top:20px; left:30px; animation-duration:1.8s;">☄️</div>
          <div class="meteor-target" data-m-id="2" style="top:90px; left:120px; animation-duration:2.1s;">💥</div>
          <div class="meteor-target" data-m-id="3" style="top:30px; right:40px; animation-duration:1.6s;">🚀</div>
          <div class="meteor-target" data-m-id="4" style="bottom:25px; left:60px; animation-duration:2.3s;">☄️</div>
          <div class="meteor-target" data-m-id="5" style="bottom:75px; right:80px; animation-duration:1.9s;">🔥</div>
          <div class="meteor-target" data-m-id="6" style="bottom:20px; right:30px; animation-duration:2.4s;">💥</div>
        </div>

        <div id="meteor-status-feedback" style="font-size:1.05rem; font-weight:800; color:#f87171; min-height:24px;">
          ¡Destruye todos! (0/6)
        </div>
      </div>
    `;
  }

  // 4. ARROW RUSH (FLECHA VELOZ)
  else {
    gameHtml = `
      <div style="text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:8px;">
          <span class="apple-badge-subpill" style="font-size:0.8rem; background:rgba(168,85,247,0.18); color:#c084fc; border:1px solid rgba(168,85,247,0.35);">
            🔄 INSTINTO RÁPIDO • ¡${options.streakCount} tarjetas!
          </span>
        </div>
        <h2 style="font-size:1.55rem; font-weight:900; color:#ffffff; margin-bottom:4px; letter-spacing:-0.03em; text-transform:uppercase;">
          ⚡ FLECHA VELOZ
        </h2>
        <p style="font-size:0.88rem; color:var(--f-text-secondary); margin-bottom:14px;">
          ¡Toca la dirección de la flecha gigante! (Ronda <span id="arrow-round-num">1</span>/3)
        </p>

        <!-- Big Arrow Target -->
        <div style="display:flex; align-items:center; justify-content:center; height:100px; margin-bottom:16px;">
          <div id="big-arrow-display" style="font-size:4rem; color:var(--f-blue); filter:drop-shadow(0 0 20px rgba(56,189,248,0.8)); font-weight:900; transform:scale(1); transition:transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            ⬆️
          </div>
        </div>

        <!-- 4 Directional D-pad Buttons -->
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; max-width:300px; margin:0 auto 16px;">
          <button class="arrow-dir-btn" data-dir="left">⬅️</button>
          <button class="arrow-dir-btn" data-dir="up">⬆️</button>
          <button class="arrow-dir-btn" data-dir="down">⬇️</button>
          <button class="arrow-dir-btn" data-dir="right">➡️</button>
        </div>

        <div id="arrow-status-feedback" style="font-size:1.05rem; font-weight:800; color:#c084fc; min-height:24px;">
          ¡Reacciona de inmediato!
        </div>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="apple-modal-content apple-glass-panel" style="max-width:440px; width:92%; padding:24px; animation: modalPopIn 0.2s ease-out; position:relative;">
      <button id="btn-skip-microgame-x" style="position:absolute; top:16px; right:16px; background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer; padding:4px;">✕</button>

      ${gameHtml}

      <div style="display:flex; justify-content:center; gap:10px; margin-top:14px;">
        <button class="dialog-btn dialog-btn-primary" id="btn-continue-studying-now" style="width:100%; padding:13px; border-radius:14px; font-size:0.98rem; font-weight:800; background:var(--f-blue); color:#07080a; justify-content:center;">
          ⚡ Continuar Repaso ›
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  let isCleanedUp = false;
  const close = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    window.removeEventListener('keydown', keyHandler);
    modal.remove();
    options.onContinue();
  };

  modal.querySelector('#btn-skip-microgame-x')?.addEventListener('click', close);
  modal.querySelector('#btn-continue-studying-now')?.addEventListener('click', close);

  // Esc / Space to continue
  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
    }
  };
  window.addEventListener('keydown', keyHandler);

  // ==========================================
  // GAME LOGIC IMPLEMENTATIONS
  // ==========================================

  // 1. TAP FRENZY
  if (selectedType === 'tap_frenzy') {
    let taps = 0;
    const targetTaps = 10;
    const startTime = Date.now();
    const btn = modal.querySelector('#btn-turbo-frenzy') as HTMLButtonElement;
    const countEl = modal.querySelector('#turbo-tap-count') as HTMLElement;
    const feedback = modal.querySelector('#frenzy-status-feedback') as HTMLElement;
    const timerBar = modal.querySelector('#turbo-timer-bar') as HTMLElement;

    const intervalId = setInterval(() => {
      if (isCleanedUp) {
        clearInterval(intervalId);
        return;
      }
      const elapsed = Date.now() - startTime;
      const pct = Math.max(0, 100 - (elapsed / 6000) * 100);
      if (timerBar) timerBar.style.width = `${pct}%`;
      if (pct <= 0) {
        clearInterval(intervalId);
        if (taps < targetTaps) {
          feedback.innerHTML = `<span style="color:#f59e0b;">⏱️ ¡Casi! (${taps}/${targetTaps}) Buen intento.</span>`;
          setTimeout(close, 800);
        }
      }
    }, 50);

    btn?.addEventListener('click', () => {
      if (taps >= targetTaps) return;
      taps++;
      nativeService.triggerHaptics('light');
      btn.classList.add('tap-pulse');
      setTimeout(() => btn.classList.remove('tap-pulse'), 80);

      countEl.textContent = `¡TAP! (${taps}/${targetTaps})`;
      feedback.textContent = `Combo x${taps}! 🔥`;

      if (taps >= targetTaps) {
        clearInterval(intervalId);
        const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
        nativeService.triggerHaptics('heavy');
        confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
        feedback.innerHTML = `<span style="color:#10b981; font-weight:900;">⚡ ¡RÁFAGA COMPLETADA EN ${timeTaken}s! (+25 XP)</span>`;
        setTimeout(close, 1100);
      }
    });
  }

  // 2. FLASH REFLEX
  else if (selectedType === 'flash_reflex') {
    let currentRound = 1;
    const maxRounds = 3;
    let activeTarget = -1;
    let flashStartTime = 0;
    const totalTimes: number[] = [];

    const feedback = modal.querySelector('#flash-status-feedback') as HTMLElement;
    const roundEl = modal.querySelector('#flash-round-num') as HTMLElement;
    const targets = modal.querySelectorAll<HTMLButtonElement>('.flash-target-btn');

    const triggerNextRound = () => {
      if (isCleanedUp) return;
      targets.forEach((t) => t.classList.remove('flashing'));
      activeTarget = -1;
      feedback.textContent = '¡Atento...!';

      setTimeout(() => {
        if (isCleanedUp) return;
        activeTarget = Math.floor(Math.random() * 4);
        flashStartTime = Date.now();
        targets[activeTarget]?.classList.add('flashing');
        nativeService.triggerHaptics('medium');
        feedback.textContent = '💥 ¡TOCA AHORA!';
      }, 500 + Math.random() * 900);
    };

    targets.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.targetId || '-1', 10);
        if (id === activeTarget && activeTarget !== -1) {
          const reaction = Date.now() - flashStartTime;
          totalTimes.push(reaction);
          btn.classList.remove('flashing');
          activeTarget = -1;
          nativeService.triggerHaptics('heavy');

          if (currentRound < maxRounds) {
            currentRound++;
            if (roundEl) roundEl.textContent = String(currentRound);
            feedback.innerHTML = `<span style="color:#10b981;">✓ ${reaction}ms ¡Rápido!</span>`;
            triggerNextRound();
          } else {
            const avg = Math.round(totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length);
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
            feedback.innerHTML = `<span style="color:#10b981; font-weight:900;">⚡ Promedio: ${avg}ms • ¡Reflejo Dios!</span>`;
            setTimeout(close, 1100);
          }
        }
      });
    });

    triggerNextRound();
  }

  // 3. METEOR SMASH
  else if (selectedType === 'meteor_smash') {
    let destroyed = 0;
    const totalMeteors = 6;
    const feedback = modal.querySelector('#meteor-status-feedback') as HTMLElement;

    modal.querySelectorAll<HTMLElement>('.meteor-target').forEach((m) => {
      m.addEventListener('click', () => {
        if (m.classList.contains('smashed')) return;
        m.classList.add('smashed');
        destroyed++;
        nativeService.triggerHaptics('medium');
        feedback.textContent = `¡Smash! (${destroyed}/${totalMeteors}) 🔥`;

        if (destroyed >= totalMeteors) {
          nativeService.triggerHaptics('heavy');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          feedback.innerHTML = `<span style="color:#10b981; font-weight:900;">💥 ¡ESPACIO DESPEJADO! (+20 XP)</span>`;
          setTimeout(close, 1000);
        }
      });
    });
  }

  // 4. ARROW RUSH
  else {
    const dirs = ['up', 'down', 'left', 'right'] as const;
    const arrowIcons: Record<string, string> = {
      up: '⬆️',
      down: '⬇️',
      left: '⬅️',
      right: '➡️'
    };

    let currentRound = 1;
    const maxRounds = 3;
    let expectedDir: typeof dirs[number] = 'up';

    const arrowEl = modal.querySelector('#big-arrow-display') as HTMLElement;
    const feedback = modal.querySelector('#arrow-status-feedback') as HTMLElement;
    const roundEl = modal.querySelector('#arrow-round-num') as HTMLElement;

    const setNextArrow = () => {
      expectedDir = dirs[Math.floor(Math.random() * dirs.length)];
      if (arrowEl) {
        arrowEl.textContent = arrowIcons[expectedDir];
        arrowEl.style.transform = 'scale(1.25)';
        setTimeout(() => (arrowEl.style.transform = 'scale(1)'), 120);
      }
    };

    modal.querySelectorAll<HTMLButtonElement>('.arrow-dir-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = btn.dataset.dir;
        if (dir === expectedDir) {
          nativeService.triggerHaptics('medium');
          if (currentRound < maxRounds) {
            currentRound++;
            if (roundEl) roundEl.textContent = String(currentRound);
            feedback.innerHTML = `<span style="color:#10b981;">✓ ¡Correcto!</span>`;
            setNextArrow();
          } else {
            nativeService.triggerHaptics('heavy');
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
            feedback.innerHTML = `<span style="color:#10b981; font-weight:900;">⚡ ¡3/3 INSTINTO PERFECTO! (+20 XP)</span>`;
            setTimeout(close, 1000);
          }
        } else {
          nativeService.triggerHaptics('light');
          feedback.innerHTML = `<span style="color:#f87171;">¡Era ${arrowIcons[expectedDir]}! Intenta de nuevo</span>`;
        }
      });
    });

    setNextArrow();
  }
}
