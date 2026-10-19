import {
  FEYNMAN_CURRENT_LEVELS,
  FEYNMAN_TARGET_GOALS,
  type FeynmanCurrentLevel,
  type FeynmanTargetGoal,
  type FeynmanDiagnosticForm,
  type FeynmanStudyGuide
} from '../types/feynman';
import { feynmanPedagogyService } from '../services/feynman-pedagogy.service';
import { feynmanLlmService } from '../services/feynman-llm.service';
import { dialogService } from '../services/dialog.service';
import { nativeService } from '../services/native.service';
import { POPULAR_SUBJECTS } from './ActiveStudyView';
import { openFeynmanGuideViewerModal } from './FeynmanGuideViewerModal';

export interface FeynmanDiagnosticModalOptions {
  initialTopic?: string;
  initialSubject?: string;
  initialStage?: 'questionnaire' | 'import_only';
  /** Se llama cuando la guía ya fue convertida en cuaderno + mazo (para refrescar la UI de fondo) */
  onGenerated?: (guide: FeynmanStudyGuide) => void;
  /** Abre el cuaderno recién creado y empieza a estudiar */
  onOpenTopic?: (topicId: string) => void;
  onOpenDeck?: (deckId: string) => void;
  onClose?: () => void;
}

// Temas de ejemplo con un toque: rellenan tema y materia a la vez
const TOPIC_PRESETS = [
  { icon: '⚛️', label: 'Mecánica Cuántica', topic: 'Física Cuántica y Principio de Incertidumbre', subject: 'fisica' },
  { icon: '💻', label: 'Microservicios', topic: 'Arquitectura de Microservicios, Resiliencia y Event-Driven', subject: 'informatica' },
  { icon: '🏛️', label: 'Rev. Francesa', topic: 'Causalidad Sociopolítica y Fases de la Revolución Francesa', subject: 'historia' },
  { icon: '⚖️', label: 'Teoría del Delito', topic: 'Teoría del Delito y Culpabilidad en Derecho Penal', subject: 'derecho' },
  { icon: '🩺', label: 'Fisiopatología', topic: 'Fisiopatología del Shock y Parámetros Hemodinámicos', subject: 'medicina' },
  { icon: '📈', label: 'Macroeconomía', topic: 'Dinámica de Inflación, Curva de Phillips y Política Monetaria', subject: 'economia' },
  { icon: '🧬', label: 'Replicación ADN', topic: 'Mecanismos Moleculares de Replicación del ADN y Mutación', subject: 'biologia' },
  { icon: '📐', label: 'Álgebra Lineal', topic: 'Descomposición en Valores Singulares (SVD) y Espacios Vectoriales', subject: 'matematicas' }
];

const STEP_LABELS = ['Tema', 'Perfil', 'Prompt', 'Importar'];
const SUCCESS_STEP = 4;

/**
 * Asistente Feynman paso a paso:
 * 1) Tema  2) Perfil y meta  3) Prompt maestro  4) Importar la respuesta de la IA
 * Al final crea EN UN SOLO PASO el cuaderno y su mazo de flashcards, ya vinculados.
 */
export function openFeynmanDiagnosticModal(options: FeynmanDiagnosticModalOptions): void {
  document.getElementById('fw-root')?.remove();

  // ---- Estado ----
  let step = options.initialStage === 'import_only' ? 3 : 0;
  let topic = options.initialTopic || '';
  let subject = options.initialSubject || 'general';
  let level: FeynmanCurrentLevel = 1;
  let goal: FeynmanTargetGoal = 'general';
  let prevKnowledge = '';
  let specificFocus = '';
  let attachOn = false;
  let attachType: 'support' | 'total_basis' = 'support';
  let attachContent = '';
  let promptText = '';
  let copied = false;
  let pastedMd = '';
  let notebookName = '';
  let busy = false;
  let result: { guide: FeynmanStudyGuide; topicId: string; deckId: string; chunksCount: number; cardsCount: number } | null = null;

  const root = document.createElement('div');
  root.id = 'fw-root';
  root.className = 'fw-overlay';
  root.innerHTML = `
    <div class="fw-sheet" role="dialog" aria-modal="true" aria-label="Ruta Feynman">
      <div class="fw-top">
        <div class="fw-top-row">
          <div class="fw-brand">
            <div class="fw-brand-icon">🔬</div>
            <div>
              <h3>Ruta Feynman</h3>
              <p id="fw-tagline">Del tema a tu cuaderno con flashcards, paso a paso</p>
            </div>
          </div>
          <button class="fw-x" id="fw-close" aria-label="Cerrar">✕</button>
        </div>
        <div class="fw-steps" id="fw-steps"></div>
      </div>
      <div class="fw-body" id="fw-body"></div>
      <div class="fw-foot" id="fw-foot"></div>
    </div>
  `;
  document.body.appendChild(root);

  const bodyEl = root.querySelector('#fw-body') as HTMLElement;
  const footEl = root.querySelector('#fw-foot') as HTMLElement;
  const stepsEl = root.querySelector('#fw-steps') as HTMLElement;

  // ---- Utilidades ----
  const close = () => {
    root.remove();
    document.removeEventListener('keydown', onKey);
    options.onClose?.();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !busy) close();
  };
  document.addEventListener('keydown', onKey);

  root.addEventListener('mousedown', (e) => {
    // Cerrar al tocar fuera solo si no hay trabajo a medias
    if (e.target === root && step === 0 && !topic.trim()) close();
  });
  root.querySelector('#fw-close')?.addEventListener('click', () => {
    if (!busy) close();
  });

  const toast = (msg: string) => showToast(msg);

  const getForm = (): FeynmanDiagnosticForm => ({
    topic: topic.trim() || 'Tema General',
    subject,
    currentLevel: level,
    previousKnowledge: level >= 2 ? prevKnowledge.trim() || undefined : undefined,
    targetGoal: goal,
    specificFocus: goal !== 'general' ? specificFocus.trim() || undefined : undefined,
    hasAttachedInfo: attachOn,
    attachedInfoType: attachOn ? attachType : undefined,
    attachedInfoContent: attachOn ? attachContent.trim() || undefined : undefined
  });

  const buildPrompt = () => {
    promptText = feynmanPedagogyService.buildFullExportablePrompt(getForm());
    return promptText;
  };

  const goTo = (n: number) => {
    step = n;
    nativeService.triggerHaptics('light');
    render();
  };

  const requireTopic = (inputEl?: HTMLInputElement | null): boolean => {
    if (topic.trim()) return true;
    inputEl?.classList.add('error');
    inputEl?.focus();
    setTimeout(() => inputEl?.classList.remove('error'), 1800);
    toast('✍️ Escribe primero el tema que quieres aprender');
    return false;
  };

  // ---- Render general ----
  function renderSteps() {
    if (step === SUCCESS_STEP) {
      stepsEl.innerHTML = '';
      return;
    }
    stepsEl.innerHTML = STEP_LABELS.map(
      (label, i) => `
      <button class="fw-step-pill ${i === step ? 'active' : i < step ? 'done' : ''}" data-step="${i}" type="button">
        <span>${i + 1} · ${label}</span>
        <div class="bar"></div>
      </button>`
    ).join('');

    stepsEl.querySelectorAll<HTMLElement>('.fw-step-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const target = parseInt(pill.dataset.step || '0', 10);
        if (target === step) return;
        if (target >= 2 && target > step && !topic.trim() && options.initialStage !== 'import_only') {
          goTo(0);
          requireTopic(bodyEl.querySelector<HTMLInputElement>('#fw-topic'));
          return;
        }
        if (target === 2) buildPrompt();
        goTo(target);
      });
    });
  }

  function render() {
    renderSteps();
    bodyEl.style.animation = 'none';
    void bodyEl.offsetWidth;
    bodyEl.style.animation = '';
    bodyEl.scrollTop = 0;

    if (step === 0) renderTopicStep();
    else if (step === 1) renderProfileStep();
    else if (step === 2) renderPromptStep();
    else if (step === 3) renderImportStep();
    else renderSuccessStep();
  }

  // ---- Paso 1: tema ----
  function renderTopicStep() {
    bodyEl.innerHTML = `
      <div>
        <h2 class="fw-h">¿Qué quieres dominar?</h2>
      </div>
      <p class="fw-lead">Escribe el tema con tus palabras. Eureka lo convierte en una ruta de primeros principios con simuladores y flashcards.</p>

      <input class="fw-input" id="fw-topic" type="text" autocomplete="off"
        placeholder="Ej: Mecánica cuántica, Revolución Francesa, Derecho penal…"
        value="${escapeAttr(topic)}" />

      <div>
        <span class="fw-label">Prueba con uno</span>
        <div class="fw-chips">
          ${TOPIC_PRESETS.map(
            (p) => `<button type="button" class="fw-chip" data-topic="${escapeAttr(p.topic)}" data-subject="${p.subject}"><span>${p.icon}</span>${p.label}</button>`
          ).join('')}
        </div>
      </div>

      <div>
        <span class="fw-label">Materia</span>
        <div class="fw-chips scroll" id="fw-subjects">
          ${POPULAR_SUBJECTS.map(
            (s) => `<button type="button" class="fw-chip ${s.id === subject ? 'active' : ''}" data-subject="${s.id}"><span>${s.icon}</span>${escapeHtml(s.name)}</button>`
          ).join('')}
        </div>
      </div>

      <div class="fw-note" id="fw-subject-note"></div>
    `;

    footEl.innerHTML = `
      <button type="button" class="fw-link" id="fw-quick">⚡ Usar ajustes recomendados y saltar al prompt</button>
      <button type="button" class="fw-btn primary" id="fw-next">Siguiente <span>→</span></button>
    `;

    const input = bodyEl.querySelector('#fw-topic') as HTMLInputElement;
    const note = bodyEl.querySelector('#fw-subject-note') as HTMLElement;

    const updateNote = () => {
      const profile = feynmanPedagogyService.getSubjectPedagogicalProfile(subject);
      note.innerHTML = `<b style="color:#7dd3fc;">🧠 ${escapeHtml(profile.name)}:</b> la IA adaptará el formalismo, los simuladores y el estilo de razonamiento a esta materia.`;
    };
    updateNote();

    input.addEventListener('input', () => {
      topic = input.value;
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (requireTopic(input)) goTo(1);
      }
    });

    const applySubject = (id: string) => {
      subject = id;
      bodyEl.querySelectorAll<HTMLElement>('#fw-subjects .fw-chip').forEach((c) => {
        c.classList.toggle('active', c.dataset.subject === id);
      });
      updateNote();
    };

    bodyEl.querySelectorAll<HTMLElement>('#fw-subjects .fw-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        nativeService.triggerHaptics('light');
        applySubject(chip.dataset.subject || 'general');
      });
    });

    bodyEl.querySelectorAll<HTMLElement>('.fw-chip[data-topic]').forEach((chip) => {
      chip.addEventListener('click', () => {
        nativeService.triggerHaptics('light');
        topic = chip.dataset.topic || '';
        input.value = topic;
        applySubject(chip.dataset.subject || 'general');
        const el = bodyEl.querySelector<HTMLElement>(`#fw-subjects .fw-chip[data-subject="${subject}"]`);
        el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      });
    });

    footEl.querySelector('#fw-next')?.addEventListener('click', () => {
      if (requireTopic(input)) goTo(1);
    });
    footEl.querySelector('#fw-quick')?.addEventListener('click', () => {
      if (!requireTopic(input)) return;
      buildPrompt();
      goTo(2);
    });

    if (!topic) setTimeout(() => input.focus(), 120);
  }

  // ---- Paso 2: perfil y meta ----
  function renderProfileStep() {
    const lvlOpt = FEYNMAN_CURRENT_LEVELS.find((l) => l.level === level)!;

    bodyEl.innerHTML = `
      <div>
        <h2 class="fw-h">¿Desde dónde partimos?</h2>
      </div>
      <p class="fw-lead">Así la IA ajusta la profundidad. Si dudas, deja lo que está marcado: es un buen punto de partida.</p>

      <div>
        <span class="fw-label">Tu nivel actual</span>
        <div class="fw-seg" id="fw-levels">
          ${FEYNMAN_CURRENT_LEVELS.map((l) => {
            const [em, ...rest] = l.badge.split(' ');
            return `<button type="button" class="fw-seg-btn ${l.level === level ? 'active' : ''}" data-level="${l.level}">
              <span class="em">${em}</span><span>${rest.join(' ')}</span></button>`;
          }).join('')}
        </div>
        <div class="fw-note" id="fw-level-note" style="margin-top:10px;">${lvlOpt.description}</div>
        <div id="fw-prev-wrap" class="${level >= 2 ? '' : 'hidden'}" style="margin-top:10px;">
          <textarea class="fw-textarea" id="fw-prev" style="min-height:70px;"
            placeholder="¿Qué ya sabes? (opcional) Ej: domino cálculo integral y leyes de Newton…">${escapeHtml(prevKnowledge)}</textarea>
        </div>
      </div>

      <div>
        <span class="fw-label">Hasta dónde quieres llegar</span>
        <div class="fw-goals" id="fw-goals">
          ${FEYNMAN_TARGET_GOALS.map(
            (g) => `<button type="button" class="fw-goal ${g.goal === goal ? 'active' : ''}" data-goal="${g.goal}">
              <span class="n">${g.levelsCount}</span>
              <span><span class="t">${escapeHtml(g.title)}</span><br/><span class="d">${escapeHtml(g.description)}</span></span>
            </button>`
          ).join('')}
        </div>
      </div>

      <details class="fw-more" ${attachOn || specificFocus ? 'open' : ''}>
        <summary>Opciones avanzadas</summary>
        <div class="fw-more-body">
          <div id="fw-focus-wrap" class="${goal === 'general' ? 'hidden' : ''}">
            <span class="fw-label">¿Qué área o aplicación quieres profundizar?</span>
            <input class="fw-input" id="fw-focus" type="text" style="font-size:0.92rem; padding:12px 14px; font-weight:600;"
              placeholder="Ej: aplicaciones clínicas, optimización, litigio penal…" value="${escapeAttr(specificFocus)}" />
          </div>

          <div class="fw-switch-row">
            <span>📎 Tengo apuntes o material de referencia</span>
            <label class="fw-switch"><input type="checkbox" id="fw-attach" ${attachOn ? 'checked' : ''} /><span></span></label>
          </div>

          <div id="fw-attach-wrap" class="${attachOn ? '' : 'hidden'}" style="display:${attachOn ? 'flex' : 'none'}; flex-direction:column; gap:10px;">
            <div class="fw-radio-row" id="fw-attach-type">
              <div class="fw-radio ${attachType === 'support' ? 'active' : ''}" data-type="support"><b>ℹ️ De apoyo</b>La IA complementa con su conocimiento.</div>
              <div class="fw-radio ${attachType === 'total_basis' ? 'active' : ''}" data-type="total_basis"><b>🎯 Base total</b>Solo usa lo que está en mi material.</div>
            </div>
            <textarea class="fw-textarea" id="fw-attach-content" placeholder="Pega aquí tus apuntes o extractos (opcional)…">${escapeHtml(attachContent)}</textarea>
          </div>
        </div>
      </details>
    `;

    footEl.innerHTML = `
      <button type="button" class="fw-btn ghost" id="fw-back">← Atrás</button>
      <button type="button" class="fw-btn primary" id="fw-next">Generar prompt <span>⚡</span></button>
    `;

    const levelNote = bodyEl.querySelector('#fw-level-note') as HTMLElement;
    const prevWrap = bodyEl.querySelector('#fw-prev-wrap') as HTMLElement;
    const prevInput = bodyEl.querySelector('#fw-prev') as HTMLTextAreaElement;
    const focusWrap = bodyEl.querySelector('#fw-focus-wrap') as HTMLElement;
    const focusInput = bodyEl.querySelector('#fw-focus') as HTMLInputElement;
    const attachCb = bodyEl.querySelector('#fw-attach') as HTMLInputElement;
    const attachWrap = bodyEl.querySelector('#fw-attach-wrap') as HTMLElement;
    const attachArea = bodyEl.querySelector('#fw-attach-content') as HTMLTextAreaElement;

    bodyEl.querySelectorAll<HTMLElement>('#fw-levels .fw-seg-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        nativeService.triggerHaptics('light');
        level = parseInt(btn.dataset.level || '1', 10) as FeynmanCurrentLevel;
        bodyEl.querySelectorAll('#fw-levels .fw-seg-btn').forEach((b) => b.classList.toggle('active', b === btn));
        const opt = FEYNMAN_CURRENT_LEVELS.find((l) => l.level === level);
        if (opt) levelNote.textContent = opt.description;
        prevWrap.classList.toggle('hidden', level < 2);
      });
    });

    bodyEl.querySelectorAll<HTMLElement>('#fw-goals .fw-goal').forEach((btn) => {
      btn.addEventListener('click', () => {
        nativeService.triggerHaptics('light');
        goal = (btn.dataset.goal || 'general') as FeynmanTargetGoal;
        bodyEl.querySelectorAll('#fw-goals .fw-goal').forEach((b) => b.classList.toggle('active', b === btn));
        focusWrap.classList.toggle('hidden', goal === 'general');
      });
    });

    prevInput.addEventListener('input', () => (prevKnowledge = prevInput.value));
    focusInput.addEventListener('input', () => (specificFocus = focusInput.value));
    attachArea.addEventListener('input', () => (attachContent = attachArea.value));

    attachCb.addEventListener('change', () => {
      attachOn = attachCb.checked;
      attachWrap.classList.toggle('hidden', !attachOn);
      attachWrap.style.display = attachOn ? 'flex' : 'none';
    });

    bodyEl.querySelectorAll<HTMLElement>('#fw-attach-type .fw-radio').forEach((r) => {
      r.addEventListener('click', () => {
        attachType = (r.dataset.type as 'support' | 'total_basis') || 'support';
        bodyEl.querySelectorAll('#fw-attach-type .fw-radio').forEach((x) => x.classList.toggle('active', x === r));
      });
    });

    footEl.querySelector('#fw-back')?.addEventListener('click', () => goTo(0));
    footEl.querySelector('#fw-next')?.addEventListener('click', () => {
      buildPrompt();
      goTo(2);
    });
  }

  // ---- Paso 3: prompt maestro ----
  function renderPromptStep() {
    if (!promptText) buildPrompt();

    const goalOpt = FEYNMAN_TARGET_GOALS.find((g) => g.goal === goal);
    const subjObj = POPULAR_SUBJECTS.find((s) => s.id === subject);

    bodyEl.innerHTML = `
      <div>
        <h2 class="fw-h">Tu prompt maestro está listo</h2>
      </div>
      <p class="fw-lead">
        <b style="color:#fff;">${escapeHtml(topic.trim() || 'Tu tema')}</b> · ${subjObj?.icon || '📚'} ${escapeHtml(subjObj?.name || 'General')} · ${goalOpt?.levelsCount || 10} niveles
      </p>

      <div class="fw-howto">
        <div class="fw-howto-step"><span class="num">1</span><span><b style="color:#fff;">Copia</b> el prompt con un toque.</span></div>
        <div class="fw-howto-step"><span class="num">2</span><span><b style="color:#fff;">Pégalo</b> en tu IA favorita y espera su respuesta completa.</span></div>
        <div class="fw-howto-step"><span class="num">3</span><span><b style="color:#fff;">Vuelve aquí</b> y pega lo que te devolvió: yo creo el cuaderno y las flashcards.</span></div>
      </div>

      <button type="button" class="fw-btn gold big ${copied ? 'copied' : ''}" id="fw-copy">
        ${copied ? '✅ ¡Prompt copiado!' : '📋 Copiar prompt maestro'}
      </button>

      <div>
        <span class="fw-label">Abrir mi IA</span>
        <div class="fw-ai-row">
          <a class="fw-ai" href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" style="background:#10a37f;">ChatGPT</a>
          <a class="fw-ai" href="https://claude.ai" target="_blank" rel="noopener noreferrer" style="background:#d97706;">Claude</a>
          <a class="fw-ai" href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" style="background:#2563eb;">Gemini</a>
          <a class="fw-ai" href="https://chat.deepseek.com" target="_blank" rel="noopener noreferrer" style="background:#4f46e5;">DeepSeek</a>
        </div>
      </div>

      <details class="fw-more">
        <summary>Ver el texto del prompt (${promptText.length.toLocaleString()} caracteres)</summary>
        <div class="fw-more-body">
          <textarea class="fw-textarea mono" readonly style="min-height:200px;">${escapeHtml(promptText)}</textarea>
        </div>
      </details>
    `;

    footEl.innerHTML = `
      <button type="button" class="fw-btn ghost" id="fw-back">← Ajustes</button>
      <button type="button" class="fw-btn ${copied ? 'gold' : 'primary'}" id="fw-next">Ya tengo la respuesta <span>→</span></button>
    `;

    const copyBtn = bodyEl.querySelector('#fw-copy') as HTMLButtonElement;
    copyBtn.addEventListener('click', async () => {
      buildPrompt();
      const ok = await copyToClipboard(promptText);
      nativeService.triggerHaptics('heavy');
      if (ok) {
        copied = true;
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '✅ ¡Prompt copiado! Pégalo en tu IA';
        const nextBtn = footEl.querySelector('#fw-next');
        nextBtn?.classList.remove('primary');
        nextBtn?.classList.add('gold');
      } else {
        toast('⚠️ No pude copiar automáticamente. Abre “Ver el texto” y cópialo a mano.');
        bodyEl.querySelector('details.fw-more')?.setAttribute('open', '');
      }
    });

    footEl.querySelector('#fw-back')?.addEventListener('click', () => goTo(1));
    footEl.querySelector('#fw-next')?.addEventListener('click', () => goTo(3));
  }

  // ---- Paso 4: importar respuesta ----
  function renderImportStep() {
    const needsName = !topic.trim();

    bodyEl.innerHTML = `
      <div>
        <h2 class="fw-h">Pega la respuesta de tu IA</h2>
      </div>
      <p class="fw-lead">Pega el texto (o sube el archivo .md). Detecto los niveles y simuladores automáticamente.</p>

      ${
        needsName
          ? `<div>
              <span class="fw-label">Nombre del cuaderno (opcional)</span>
              <input class="fw-input" id="fw-name" type="text" style="font-size:0.95rem; padding:12px 14px;" placeholder="Si lo dejas vacío uso el título que trae la respuesta" value="${escapeAttr(notebookName)}" />
            </div>`
          : ''
      }

      <div class="fw-drop" id="fw-drop">
        <div class="fw-ai-row">
          <button type="button" class="fw-btn ghost" id="fw-paste" style="padding:9px 14px; font-size:0.82rem;">📋 Pegar del portapapeles</button>
          <button type="button" class="fw-btn ghost" id="fw-upload" style="padding:9px 14px; font-size:0.82rem;">📁 Subir .md</button>
          <input type="file" id="fw-file" accept=".md,.markdown,.txt" style="display:none;" />
        </div>
        <textarea class="fw-textarea mono" id="fw-md" style="min-height:190px;"
          placeholder="Pega aquí el Markdown completo (debe empezar con “# Nivel 1:”)…">${escapeHtml(pastedMd)}</textarea>
        <div class="fw-scan" id="fw-scan"></div>
      </div>
    `;

    footEl.innerHTML = `
      <button type="button" class="fw-btn ghost" id="fw-back">${options.initialStage === 'import_only' ? 'Cancelar' : '← Prompt'}</button>
      <button type="button" class="fw-btn gold" id="fw-create">✨ Crear cuaderno y flashcards</button>
    `;

    const mdArea = bodyEl.querySelector('#fw-md') as HTMLTextAreaElement;
    const scanEl = bodyEl.querySelector('#fw-scan') as HTMLElement;
    const dropEl = bodyEl.querySelector('#fw-drop') as HTMLElement;
    const fileInput = bodyEl.querySelector('#fw-file') as HTMLInputElement;
    const nameInput = bodyEl.querySelector('#fw-name') as HTMLInputElement | null;

    const scan = () => {
      const text = mdArea.value.trim();
      pastedMd = mdArea.value;
      if (!text) {
        scanEl.innerHTML = '<span>⏳ Esperando contenido…</span>';
        return;
      }
      const levelMatches = Array.from(text.matchAll(/(?:^|\n)#+\s*(?:Nivel|Paso|Level)\s*\[?(\d+)\]?/gi));
      const uniqueLevels = new Set(levelMatches.map((m) => m[1])).size;
      const codeBlocks = (text.match(/```(?:tsx|ts|typescript|jsx|javascript|js|react)/gi) || []).length;
      const hasExam = /(?:^|\n)#+\s*Examen\s*Final/i.test(text);

      let html = uniqueLevels > 0
        ? `<span class="fw-tag ok">✅ ${uniqueLevels} niveles</span>`
        : `<span class="fw-tag warn">⚠️ No veo “# Nivel 1:” todavía</span>`;
      if (codeBlocks > 0) html += `<span class="fw-tag info">⚡ ${codeBlocks} simuladores</span>`;
      if (hasExam) html += `<span class="fw-tag exam">🎓 Examen final</span>`;
      html += `<span style="margin-left:auto;">${text.length.toLocaleString()} caracteres</span>`;
      scanEl.innerHTML = html;
    };
    scan();

    mdArea.addEventListener('input', scan);
    nameInput?.addEventListener('input', () => (notebookName = nameInput.value));

    const loadText = (text: string, label: string) => {
      mdArea.value = text;
      scan();
      toast(`📁 ${label}`);
    };

    bodyEl.querySelector('#fw-paste')?.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          loadText(text, 'Contenido pegado');
          nativeService.triggerHaptics('medium');
        } else {
          toast('⚠️ El portapapeles está vacío');
        }
      } catch {
        mdArea.focus();
        toast('⚠️ Sin permiso del portapapeles: pega con Ctrl+V / mantener pulsado');
      }
    });

    bodyEl.querySelector('#fw-upload')?.addEventListener('click', () => fileInput.click());
    const readFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) loadText(text, `Archivo “${file.name}” cargado`);
      };
      reader.readAsText(file);
    };
    fileInput.addEventListener('change', () => {
      const f = fileInput.files?.[0];
      if (f) readFile(f);
    });
    dropEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropEl.classList.add('over');
    });
    dropEl.addEventListener('dragleave', () => dropEl.classList.remove('over'));
    dropEl.addEventListener('drop', (e) => {
      e.preventDefault();
      dropEl.classList.remove('over');
      const f = e.dataTransfer?.files[0];
      if (f) readFile(f);
    });

    footEl.querySelector('#fw-back')?.addEventListener('click', () => {
      if (options.initialStage === 'import_only') close();
      else goTo(2);
    });

    footEl.querySelector('#fw-create')?.addEventListener('click', () => {
      if (busy) return;
      const markdown = mdArea.value.trim();
      if (!markdown) {
        mdArea.focus();
        mdArea.style.borderColor = '#ef4444';
        setTimeout(() => (mdArea.style.borderColor = ''), 1800);
        toast('⚠️ Pega primero la respuesta de tu IA');
        return;
      }

      busy = true;
      const btn = footEl.querySelector('#fw-create') as HTMLButtonElement;
      btn.disabled = true;
      btn.innerHTML = '⏳ Creando tu cuaderno…';

      // Cede un frame para que se pinte el estado "creando" antes del parseo pesado
      setTimeout(() => {
        try {
          const providedTopic = topic.trim() || notebookName.trim();
          const form: FeynmanDiagnosticForm | undefined = providedTopic ? { ...getForm(), topic: providedTopic } : undefined;
          const guide = feynmanLlmService.importMarkdownGuide(markdown, form);
          const kit = feynmanLlmService.createStudyKit(guide);
          result = { guide, ...kit };
          busy = false;
          nativeService.triggerHaptics('heavy');
          options.onGenerated?.(guide);
          goTo(SUCCESS_STEP);
        } catch (err: any) {
          busy = false;
          btn.disabled = false;
          btn.innerHTML = '✨ Crear cuaderno y flashcards';
          console.error('[FeynmanWizard] Error al importar Markdown:', err);
          dialogService.showAlert({
            title: '⚠️ No pude leer esa respuesta',
            message:
              err?.message ||
              'No se detectaron niveles. Asegúrate de pegar la respuesta completa de la IA, que debe contener encabezados como “# Nivel 1: [Título]”.'
          });
        }
      }, 30);
    });
  }

  // ---- Paso final: éxito ----
  function renderSuccessStep() {
    if (!result) return;
    const { guide, topicId, deckId, chunksCount, cardsCount } = result;
    root.querySelector<HTMLElement>('#fw-tagline')!.textContent = '¡Todo listo!';

    bodyEl.classList.add('fw-success');
    bodyEl.innerHTML = `
      <div class="fw-success-book"><span>📓</span></div>
      <h2 class="fw-h">¡Tu cuaderno está listo!</h2>
      <p class="fw-lead" style="margin-top:0;">“${escapeHtml(guide.topic)}” ya está en tu estantería, con su mazo de flashcards vinculado.</p>
      <div class="fw-stats">
        <div class="fw-stat"><b>${guide.levels.length}</b>niveles</div>
        <div class="fw-stat"><b>${chunksCount}</b>páginas</div>
        <div class="fw-stat"><b>${cardsCount}</b>flashcards</div>
      </div>
    `;

    footEl.style.flexDirection = 'column';
    footEl.innerHTML = `
      <button type="button" class="fw-btn gold big" id="fw-open">📖 Empezar a estudiar</button>
      <div style="display:flex; gap:10px; width:100%;">
        <button type="button" class="fw-btn ghost" id="fw-view" style="flex:1; padding:12px 10px; font-size:0.85rem;">🗺️ Ver ruta interactiva</button>
        <button type="button" class="fw-btn ghost" id="fw-deck" style="flex:1; padding:12px 10px; font-size:0.85rem;">🎴 Ver mazo</button>
      </div>
    `;

    footEl.querySelector('#fw-open')?.addEventListener('click', () => {
      root.remove();
      document.removeEventListener('keydown', onKey);
      options.onOpenTopic?.(topicId);
      options.onClose?.();
    });
    footEl.querySelector('#fw-view')?.addEventListener('click', () => {
      root.remove();
      document.removeEventListener('keydown', onKey);
      openFeynmanGuideViewerModal({
        guide,
        onOpenTopic: options.onOpenTopic,
        onOpenDeck: options.onOpenDeck
      });
    });
    footEl.querySelector('#fw-deck')?.addEventListener('click', () => {
      root.remove();
      document.removeEventListener('keydown', onKey);
      options.onOpenDeck?.(deckId);
      options.onClose?.();
    });
  }

  render();
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed; top:0; left:0; opacity:0;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function showToast(msg: string): void {
  document.getElementById('feynman-diag-toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'feynman-diag-toast';
  toast.style.cssText =
    'position:fixed; bottom:30px; left:50%; transform:translateX(-50%); z-index:12000; max-width:90vw; text-align:center; background:rgba(24,15,9,0.96); border:1px solid rgba(255,186,98,0.5); color:#fff; padding:11px 22px; border-radius:999px; font-weight:800; font-size:0.86rem; box-shadow:0 12px 30px rgba(0,0,0,0.6); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str: string): string {
  return escapeHtml(str);
}
