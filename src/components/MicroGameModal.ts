import confetti from 'canvas-confetti';
import { nativeService } from '../services/native.service';

export interface MicroGameOptions {
  streakCount: number;
  gameType?: 'all' | 'tap_frenzy' | 'flash_reflex' | 'meteor_smash' | 'arrow_rush';
  onContinue: () => void;
}

// Generador de sonidos arcade en tiempo real (Cero lag, Web Audio puro)
function playArcadeFx(type: 'tap' | 'laser' | 'shatter' | 'combo' | 'victory'): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.06);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'laser') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'shatter') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.14);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'combo') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, now);
      osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'victory') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.07); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.14); // G5
      osc.frequency.setValueAtTime(1046.5, now + 0.21); // C6
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch {
    // Ignorar si está silenciado
  }
}

export function openMicroGameModal(options: MicroGameOptions): void {
  const existing = document.getElementById('modal-microgame-root');
  if (existing) existing.remove();

  const games = ['crystal_shatter', 'tap_frenzy', 'meteor_smash', 'flash_reflex'] as const;
  const selectedType = games[Math.floor(Math.random() * games.length)];

  const modal = document.createElement('div');
  modal.id = 'modal-microgame-root';
  modal.className = 'apple-modal-overlay';
  modal.style.zIndex = '99999';

  let gameHtml = '';

  // 1. CRYSTAL SHATTER (ROMPE-CRISTAL HÍPER-SATISFACTORIO)
  if (selectedType === 'crystal_shatter') {
    gameHtml = `
      <div style="text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:6px;">
          <span class="apple-badge-subpill" style="font-size:0.78rem; background:rgba(56,189,248,0.18); color:var(--f-blue); border:1px solid rgba(56,189,248,0.4);">
            💎 ROMPE-CRISTAL • ¡${options.streakCount} tarjetas!
          </span>
        </div>
        <h2 style="font-size:1.55rem; font-weight:900; color:#ffffff; margin-bottom:2px; letter-spacing:-0.03em;">
          CRISTAL CÓSMICO
        </h2>
        <p style="font-size:0.86rem; color:var(--f-text-secondary); margin-bottom:14px;">
          ¡Dale <strong>3 impactos rápidos</strong> para romper el cristal y recargar energía!
        </p>

        <!-- Crystal health bar -->
        <div style="display:flex; justify-content:center; gap:6px; margin-bottom:18px;">
          <div class="crystal-hp-bar active" id="hp-1"></div>
          <div class="crystal-hp-bar active" id="hp-2"></div>
          <div class="crystal-hp-bar active" id="hp-3"></div>
        </div>

        <!-- 3D Glowing Crystal Button -->
        <div style="margin-bottom:16px; height:140px; display:flex; align-items:center; justify-content:center;">
          <div id="btn-hit-crystal" class="cyber-crystal-core">
            <span id="crystal-glyph" style="font-size:4.2rem; filter:drop-shadow(0 0 25px #38bdf8); transition:all 0.1s ease; user-select:none;">💎</span>
          </div>
        </div>

        <div id="crystal-status-msg" style="font-size:1.05rem; font-weight:800; color:var(--f-blue); min-height:26px;">
          ¡TOCA EL CRISTAL! ⚡
        </div>
      </div>
    `;
  }

  // 2. TAP FRENZY (RÁFAGA TURBO NEÓN)
  else if (selectedType === 'tap_frenzy') {
    gameHtml = `
      <div style="text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:6px;">
          <span class="apple-badge-subpill" style="font-size:0.78rem; background:rgba(245,158,11,0.18); color:#f59e0b; border:1px solid rgba(245,158,11,0.4);">
            ⚡ RÁFAGA TURBO • ¡${options.streakCount} tarjetas!
          </span>
        </div>
        <h2 style="font-size:1.55rem; font-weight:900; color:#ffffff; margin-bottom:2px; letter-spacing:-0.03em;">
          FRENESÍ DE TOQUES
        </h2>
        <p style="font-size:0.86rem; color:var(--f-text-secondary); margin-bottom:14px;">
          ¡Toca a máxima velocidad <strong>10 VECES</strong> seguidas!
        </p>

        <!-- Timer bar -->
        <div style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:999px; overflow:hidden; margin-bottom:16px;">
          <div id="turbo-timer-bar" style="width:100%; height:100%; background:linear-gradient(90deg, #f59e0b, #ef4444); transition:width 0.05s linear;"></div>
        </div>

        <!-- Giant Turbo Tap Button -->
        <div style="margin-bottom:16px;">
          <button id="btn-turbo-frenzy" class="turbo-tap-btn">
            <span style="font-size:2.6rem; display:block; filter:drop-shadow(0 0 14px #f59e0b);">⚡</span>
            <span id="turbo-tap-count" style="font-size:1.25rem; font-weight:900; color:#fff;">¡DALE YA! (0/10)</span>
          </button>
        </div>

        <div id="frenzy-status-feedback" style="font-size:1.05rem; font-weight:800; color:#38bdf8; min-height:26px;">
          ¡Prepárate... DALE!
        </div>
      </div>
    `;
  }

  // 3. METEOR SMASH (DESTRUCCIÓN ESPACIAL)
  else if (selectedType === 'meteor_smash') {
    gameHtml = `
      <div style="text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:6px;">
          <span class="apple-badge-subpill" style="font-size:0.78rem; background:rgba(239,68,68,0.18); color:#f87171; border:1px solid rgba(239,68,68,0.4);">
            💥 DESTRUCCIÓN ULTRA • ¡${options.streakCount} tarjetas!
          </span>
        </div>
        <h2 style="font-size:1.55rem; font-weight:900; color:#ffffff; margin-bottom:2px; letter-spacing:-0.03em;">
          METEOR SMASH
        </h2>
        <p style="font-size:0.86rem; color:var(--f-text-secondary); margin-bottom:14px;">
          ¡Revienta los 6 meteoros cósmicos que caen en pantalla!
        </p>

        <!-- Arena -->
        <div id="meteor-smash-arena" style="position:relative; width:100%; height:180px; background:radial-gradient(circle at 50% 50%, rgba(239,68,68,0.12), rgba(0,0,0,0.6)); border:1.5px solid rgba(239,68,68,0.3); border-radius:20px; overflow:hidden; margin-bottom:14px;">
          <div class="meteor-target" data-m-id="1" style="top:15px; left:25px; animation-duration:1.5s;">☄️</div>
          <div class="meteor-target" data-m-id="2" style="top:75px; left:110px; animation-duration:1.8s;">💥</div>
          <div class="meteor-target" data-m-id="3" style="top:25px; right:35px; animation-duration:1.4s;">🚀</div>
          <div class="meteor-target" data-m-id="4" style="bottom:20px; left:50px; animation-duration:2.0s;">☄️</div>
          <div class="meteor-target" data-m-id="5" style="bottom:65px; right:75px; animation-duration:1.6s;">🔥</div>
          <div class="meteor-target" data-m-id="6" style="bottom:15px; right:25px; animation-duration:2.1s;">💥</div>
        </div>

        <div id="meteor-status-feedback" style="font-size:1.05rem; font-weight:800; color:#f87171; min-height:26px;">
          ¡Destruye todos! (0/6)
        </div>
      </div>
    `;
  }

  // 4. FLASH REFLEX (PUNTERÍA Y REACCIÓN EN MILISEGUNDOS)
  else {
    gameHtml = `
      <div style="text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:6px;">
          <span class="apple-badge-subpill" style="font-size:0.78rem; background:rgba(168,85,247,0.18); color:#c084fc; border:1px solid rgba(168,85,247,0.4);">
            🎯 REACCIÓN LÁSER • ¡${options.streakCount} tarjetas!
          </span>
        </div>
        <h2 style="font-size:1.55rem; font-weight:900; color:#ffffff; margin-bottom:2px; letter-spacing:-0.03em;">
          CAZA-DESTELLOS
        </h2>
        <p style="font-size:0.86rem; color:var(--f-text-secondary); margin-bottom:14px;">
          ¡Toca el botón neón en cuanto parpadee! (Ronda <span id="flash-round-num">1</span>/3)
        </p>

        <!-- 4 Grid targets -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; max-width:270px; margin:0 auto 16px;">
          <button class="flash-target-btn" data-target-id="0" style="--c:#38bdf8;">🔷</button>
          <button class="flash-target-btn" data-target-id="1" style="--c:#a855f7;">🟣</button>
          <button class="flash-target-btn" data-target-id="2" style="--c:#10b981;">🟢</button>
          <button class="flash-target-btn" data-target-id="3" style="--c:#f59e0b;">🟡</button>
        </div>

        <div id="flash-status-feedback" style="font-size:1.05rem; font-weight:800; color:#38bdf8; min-height:26px;">
          ¡Atento a la luz...!
        </div>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="apple-modal-content apple-glass-panel" style="max-width:420px; width:92%; padding:24px; animation: modalPopIn 0.2s ease-out; position:relative;">
      <button id="btn-skip-microgame-x" style="position:absolute; top:14px; right:14px; background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer; padding:4px;">✕</button>

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

  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
    }
  };
  window.addEventListener('keydown', keyHandler);

  // ==========================================
  // GAME LOGIC IMPLEMENTATIONS
  // ==========================================

  // 1. CRYSTAL SHATTER
  if (selectedType === 'crystal_shatter') {
    let hits = 0;
    const maxHits = 3;
    const crystalBtn = modal.querySelector('#btn-hit-crystal') as HTMLElement;
    const glyph = modal.querySelector('#crystal-glyph') as HTMLElement;
    const statusMsg = modal.querySelector('#crystal-status-msg') as HTMLElement;

    crystalBtn?.addEventListener('click', () => {
      if (hits >= maxHits) return;
      hits++;
      playArcadeFx('shatter');
      nativeService.triggerHaptics('heavy');

      const hpEl = modal.querySelector(`#hp-${hits}`) as HTMLElement;
      if (hpEl) hpEl.classList.remove('active');

      if (hits === 1) {
        glyph.textContent = '💠';
        glyph.style.transform = 'scale(1.2) rotate(8deg)';
        statusMsg.textContent = '¡IMPACTO CRÍTICO 1! 🔥';
      } else if (hits === 2) {
        glyph.textContent = '✨';
        glyph.style.transform = 'scale(1.35) rotate(-12deg)';
        statusMsg.textContent = '¡A PUNTO DE ESTALLAR! 💥';
      } else if (hits === 3) {
        glyph.textContent = '💥';
        glyph.style.transform = 'scale(1.8)';
        playArcadeFx('victory');
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
        statusMsg.innerHTML = `<span style="color:#10b981; font-weight:900;">✨ ¡CRISTAL DESTRUIDO! (+30 XP)</span>`;
        setTimeout(close, 900);
      }

      setTimeout(() => {
        if (hits < maxHits) glyph.style.transform = 'scale(1)';
      }, 120);
    });
  }

  // 2. TAP FRENZY
  else if (selectedType === 'tap_frenzy') {
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
      const pct = Math.max(0, 100 - (elapsed / 5000) * 100);
      if (timerBar) timerBar.style.width = `${pct}%`;
      if (pct <= 0) {
        clearInterval(intervalId);
        if (taps < targetTaps) {
          feedback.innerHTML = `<span style="color:#f59e0b;">⏱️ ¡Buen intento! (${taps}/${targetTaps})</span>`;
          setTimeout(close, 700);
        }
      }
    }, 40);

    btn?.addEventListener('click', () => {
      if (taps >= targetTaps) return;
      taps++;
      playArcadeFx('tap');
      nativeService.triggerHaptics('light');
      btn.classList.add('tap-pulse');
      setTimeout(() => btn.classList.remove('tap-pulse'), 70);

      countEl.textContent = `¡TAP! (${taps}/${targetTaps})`;
      feedback.textContent = `COMBO x${taps}! 🔥`;

      if (taps >= targetTaps) {
        clearInterval(intervalId);
        const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
        playArcadeFx('victory');
        nativeService.triggerHaptics('heavy');
        confetti({ particleCount: 50, spread: 75, origin: { y: 0.6 } });
        feedback.innerHTML = `<span style="color:#10b981; font-weight:900;">⚡ ¡RÁFAGA EN ${timeTaken}s! (+25 XP)</span>`;
        setTimeout(close, 1000);
      }
    });
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
        playArcadeFx('laser');
        nativeService.triggerHaptics('medium');
        feedback.textContent = `¡SMASH! (${destroyed}/${totalMeteors}) 🔥`;

        if (destroyed >= totalMeteors) {
          playArcadeFx('victory');
          nativeService.triggerHaptics('heavy');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          feedback.innerHTML = `<span style="color:#10b981; font-weight:900;">💥 ¡ESPACIO LIMPIO! (+25 XP)</span>`;
          setTimeout(close, 900);
        }
      });
    });
  }

  // 4. FLASH REFLEX
  else {
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
      feedback.textContent = '¡Atento a la luz...! 👀';

      setTimeout(() => {
        if (isCleanedUp) return;
        activeTarget = Math.floor(Math.random() * 4);
        flashStartTime = Date.now();
        targets[activeTarget]?.classList.add('flashing');
        playArcadeFx('combo');
        nativeService.triggerHaptics('medium');
        feedback.textContent = '💥 ¡TOCA AHORA!';
      }, 400 + Math.random() * 700);
    };

    targets.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.targetId || '-1', 10);
        if (id === activeTarget && activeTarget !== -1) {
          const reaction = Date.now() - flashStartTime;
          totalTimes.push(reaction);
          btn.classList.remove('flashing');
          activeTarget = -1;
          playArcadeFx('laser');
          nativeService.triggerHaptics('heavy');

          if (currentRound < maxRounds) {
            currentRound++;
            if (roundEl) roundEl.textContent = String(currentRound);
            feedback.innerHTML = `<span style="color:#10b981;">✓ ${reaction}ms ¡Rápido!</span>`;
            triggerNextRound();
          } else {
            const avg = Math.round(totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length);
            playArcadeFx('victory');
            confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
            feedback.innerHTML = `<span style="color:#10b981; font-weight:900;">⚡ Promedio: ${avg}ms • ¡Reflejos Dios!</span>`;
            setTimeout(close, 1000);
          }
        }
      });
    });

    triggerNextRound();
  }
}
