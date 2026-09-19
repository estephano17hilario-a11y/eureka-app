import type { FeynmanStudyGuide, FeynmanQuizQuestion } from '../types/feynman';
import { feynmanLlmService } from '../services/feynman-llm.service';
import { feynmanSandboxService } from '../services/feynman-sandbox.service';
import { katexService } from '../services/katex.service';
import { dialogService } from '../services/dialog.service';

export interface FeynmanGuideViewerOptions {
  guide: FeynmanStudyGuide;
  onClose?: () => void;
  onOpenTopic?: (topicId: string) => void;
  onOpenDeck?: (deckId: string) => void;
}

export function openFeynmanGuideViewerModal(options: FeynmanGuideViewerOptions): void {
  const existing = document.getElementById('modal-feynman-viewer-root');
  if (existing) existing.remove();

  const { guide } = options;
  let currentLevelIndex = 0; // 0-indexed; guide.levels.length represents Final Exam if present
  let currentTab: 'interactive' | 'markdown' = 'interactive';

  // Almacenar respuestas seleccionadas por el usuario para los quizzes
  const userAnswers = new Map<string, number>();

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-feynman-viewer-root" style="z-index: 11000; animation: fadeIn 0.2s ease-out; padding: 12px;">
      <style>
        @media (max-width: 640px) {
          #modal-feynman-viewer-root {
            padding: 0 !important;
          }
          #modal-feynman-viewer-root .modal-container {
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            padding-top: max(var(--sat), 4px) !important;
            padding-bottom: max(var(--sab), 4px) !important;
          }
          #modal-feynman-viewer-root .figma-modal-header {
            padding: 12px 14px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          #modal-feynman-viewer-root #feynman-viewer-body {
            padding: 14px !important;
            gap: 14px !important;
          }
          #modal-feynman-viewer-root .reading-sandbox-live-box,
          #modal-feynman-viewer-root .reading-sandbox-code-box {
            height: 420px !important;
          }
        }
      </style>
      <div class="modal-container apple-glass-panel" style="max-width: 1080px; width: 98%; height: 94vh; max-height: 94vh; display: flex; flex-direction: column; background: var(--f-surface); border: 1px solid var(--f-border); border-radius: var(--f-radius-lg); box-shadow: 0 30px 80px rgba(0,0,0,0.7); overflow: hidden; padding: 0;">
        
        <!-- CABECERA PRINCIPAL FIGMA -->
        <header class="figma-modal-header" style="padding: 16px 24px; border-bottom: 1px solid var(--f-border); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; background: rgba(0,0,0,0.2);">
          <div style="display: flex; align-items: center; gap: 14px; min-width: 0;">
            <div style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #38bdf8, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; box-shadow: 0 4px 14px rgba(56,189,248,0.25);">
              🔬
            </div>
            <div style="min-width: 0;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h2 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                  ${escapeHtml(guide.topic)}
                </h2>
                <span style="font-size: 0.7rem; font-weight: 800; color: #38bdf8; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.25); padding: 2px 8px; border-radius: 999px;">
                  ${guide.levelsCount} Niveles Axiomáticos
                </span>
                ${guide.finalExam ? `
                  <span style="font-size: 0.7rem; font-weight: 800; color: #fbbf24; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.25); padding: 2px 8px; border-radius: 999px;">
                    🎓 Examen Final Integrado
                  </span>
                ` : ''}
                <span style="font-size: 0.7rem; color: var(--f-text-muted);">
                  ${new Date(guide.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style="font-size: 0.78rem; color: var(--f-text-secondary); margin: 2px 0 0 0;">
                Ruta Pedagógica Feynman • Primeros Principios & React 18 + TSX
              </p>
            </div>
          </div>

          <!-- ACCIONES DE CABECERA -->
          <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
            <!-- Selector de Pestaña -->
            <div style="display: flex; background: var(--f-input-bg); padding: 3px; border-radius: 10px; border: 1px solid var(--f-border);">
              <button class="figma-btn-ghost feynman-tab-btn active" data-tab="interactive" style="padding: 6px 12px; font-size: 0.78rem; border-radius: 7px; color: #fff;">
                ⚡ Interactivo
              </button>
              <button class="figma-btn-ghost feynman-tab-btn" data-tab="markdown" style="padding: 6px 12px; font-size: 0.78rem; border-radius: 7px; color: var(--f-text-secondary);">
                📄 Markdown (.md)
              </button>
            </div>

            <!-- Botones de Utilidad -->
            <button class="figma-icon-btn-ghost" id="btn-copy-guide-md" title="Copiar todo el Markdown al portapapeles" style="padding: 8px; font-size: 0.9rem;">
              📋
            </button>
            <button class="figma-icon-btn-ghost" id="btn-download-guide-md" title="Descargar archivo .md" style="padding: 8px; font-size: 0.9rem;">
              💾
            </button>
            <button class="figma-btn-ghost" id="btn-close-feynman-viewer" style="font-size: 1.4rem; padding: 4px 10px; color: var(--f-text-muted);">
              ×
            </button>
          </div>
        </header>

        <!-- SUB-BARRA DE NAVEGACIÓN SECUENCIAL DE NIVELES (STEPPER) -->
        <nav id="feynman-levels-stepper-wrap" style="padding: 10px 20px; background: rgba(255,255,255,0.015); border-bottom: 1px solid var(--f-border); display: flex; align-items: center; gap: 8px; overflow-x: auto; flex-shrink: 0; scrollbar-width: thin;">
          ${guide.levels.map((lvl, idx) => `
            <button 
              type="button" 
              class="feynman-step-pill ${idx === 0 ? 'active' : ''}" 
              data-level-index="${idx}"
              style="padding: 6px 12px; border-radius: 999px; border: 1px solid ${idx === 0 ? '#38bdf8' : 'var(--f-border)'}; background: ${idx === 0 ? 'rgba(56,189,248,0.18)' : 'var(--f-input-bg)'}; color: ${idx === 0 ? '#38bdf8' : 'var(--f-text-secondary)'}; font-size: 0.76rem; font-weight: 700; white-space: nowrap; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;"
            >
              <span>Nivel ${lvl.levelNumber}</span>
              <span style="opacity: 0.4;">→</span>
            </button>
          `).join('')}
          ${guide.finalExam ? `
            <button 
              type="button" 
              class="feynman-step-pill" 
              data-level-index="${guide.levels.length}"
              style="padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(245,158,11,0.3); background: rgba(245,158,11,0.08); color: #fbbf24; font-size: 0.76rem; font-weight: 800; white-space: nowrap; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;"
            >
              <span>🎓 Examen Final</span>
              <span>🏆</span>
            </button>
          ` : ''}
        </nav>

        <!-- CONTENIDO PRINCIPAL SCROLLABLE -->
        <main id="feynman-viewer-body" style="flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px;">
          <!-- Contenido inyectado dinámicamente -->
        </main>

        <!-- FOOTER CON ACCIONES DE ECOSISTEMA EUREKA -->
        <footer style="padding: 14px 24px; border-top: 1px solid var(--f-border); background: rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button type="button" class="figma-btn-ghost" id="btn-prev-level" style="padding: 8px 16px; border-radius: 10px; font-size: 0.82rem;">
              ← Nivel Anterior
            </button>
            <button type="button" class="figma-btn-blue-pill" id="btn-next-level" style="padding: 8px 20px; border-radius: 10px; font-size: 0.82rem; font-weight: 700;">
              Siguiente Nivel →
            </button>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <button type="button" class="figma-btn-ghost" id="btn-export-to-notebook" style="padding: 8px 14px; border-radius: 10px; font-size: 0.82rem; color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); display: flex; align-items: center; gap: 6px;">
              <span>📓 Convertir en Cuaderno Eureka</span>
            </button>
            <button type="button" class="figma-btn-ghost" id="btn-export-to-deck" style="padding: 8px 14px; border-radius: 10px; font-size: 0.82rem; color: #a855f7; border: 1px solid rgba(168,85,247,0.3); display: flex; align-items: center; gap: 6px;">
              <span>🎴 Generar Mazo de Flashcards</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modalRoot = document.getElementById('modal-feynman-viewer-root');
  const viewerBody = document.getElementById('feynman-viewer-body');
  const stepperWrap = document.getElementById('feynman-levels-stepper-wrap');
  const prevBtn = document.getElementById('btn-prev-level') as HTMLButtonElement | null;
  const nextBtn = document.getElementById('btn-next-level') as HTMLButtonElement | null;

  // Renderizar preguntas interactivas de examen
  const renderQuizQuestionsHtml = (questions: FeynmanQuizQuestion[], quizPrefix: string): string => {
    return questions.map((q, qIdx) => {
      const qKey = `${quizPrefix}-${qIdx}`;
      const selectedOpt = userAnswers.get(qKey);
      const isAnswered = selectedOpt !== undefined;
      const isCorrect = isAnswered && selectedOpt === q.correctIndex;

      return `
        <div class="feynman-quiz-card" data-quiz-key="${qKey}">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span class="feynman-quiz-q-num">Pregunta ${qIdx + 1} de ${questions.length}</span>
            ${isAnswered ? `
              <span class="feynman-exam-score-pill" style="background: ${isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}; color: ${isCorrect ? '#34d399' : '#f87171'}; border: 1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'};">
                ${isCorrect ? '✓ Correcto (+10 pts)' : '✗ Incorrecto'}
              </span>
            ` : ''}
          </div>

          <h4 style="font-size: 0.94rem; font-weight: 700; color: #fff; margin: 0; line-height: 1.5;">
            ${katexService.parseAndRender(q.question)}
          </h4>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
            ${q.options.map((optText, optIdx) => {
              const optClean = optText.replace(/^[A-D]\)\s*/i, '').trim();
              const optLetter = optIdx === 0 ? 'A' : optIdx === 1 ? 'B' : optIdx === 2 ? 'C' : 'D';
              
              let optClass = 'feynman-quiz-option';
              if (isAnswered) {
                if (optIdx === q.correctIndex) {
                  optClass += ' correct';
                } else if (optIdx === selectedOpt) {
                  optClass += ' incorrect';
                } else {
                  optClass += ' disabled';
                }
              }

              return `
                <button 
                  type="button" 
                  class="${optClass} btn-select-quiz-option" 
                  data-quiz-key="${qKey}"
                  data-option-idx="${optIdx}"
                  ${isAnswered ? 'disabled' : ''}
                >
                  <span style="font-weight: 800; font-size: 0.8rem; color: ${isAnswered && optIdx === q.correctIndex ? '#34d399' : '#38bdf8'}; width: 22px; flex-shrink: 0;">
                    ${optLetter})
                  </span>
                  <span style="flex: 1;">${katexService.parseAndRender(optClean)}</span>
                  ${isAnswered && optIdx === q.correctIndex ? '<span style="font-weight: 800; color: #34d399;">✓</span>' : ''}
                  ${isAnswered && optIdx === selectedOpt && !isCorrect ? '<span style="font-weight: 800; color: #f43f5e;">✗</span>' : ''}
                </button>
              `;
            }).join('')}
          </div>

          ${isAnswered ? `
            <div class="feynman-quiz-explanation ${isCorrect ? 'correct-exp' : 'incorrect-exp'}">
              <strong style="display: block; margin-bottom: 4px; color: ${isCorrect ? '#34d399' : '#fbbf24'};">
                💡 Justificación Causal (Primeros Principios):
              </strong>
              <div>${katexService.parseAndRender(q.explanation)}</div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  };

  // Renderizar la vista del Examen Final de Maestría
  const renderFinalExamView = () => {
    if (!viewerBody || !guide.finalExam) return;

    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) {
      nextBtn.textContent = '🎉 ¡Ruta Completada!';
    }

    // Actualizar stepper visual
    stepperWrap?.querySelectorAll<HTMLButtonElement>('.feynman-step-pill').forEach((pill) => {
      const idx = parseInt(pill.dataset.levelIndex || '0', 10);
      const isActive = idx === guide.levels.length;
      pill.style.border = isActive ? '1px solid #fbbf24' : '1px solid var(--f-border)';
      pill.style.background = isActive ? 'rgba(245,158,11,0.22)' : 'var(--f-input-bg)';
      pill.style.color = isActive ? '#fbbf24' : 'var(--f-text-secondary)';
      if (isActive) {
        pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });

    // Calcular estadísticas del examen final
    let correctCount = 0;
    let answeredCount = 0;
    guide.finalExam.questions.forEach((q, idx) => {
      const ans = userAnswers.get(`final-${idx}`);
      if (ans !== undefined) {
        answeredCount++;
        if (ans === q.correctIndex) correctCount++;
      }
    });

    const totalQ = guide.finalExam.questions.length;
    const finalScore = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

    viewerBody.innerHTML = `
      <!-- BANNER DE ENCABEZADO DE EXAMEN FINAL -->
      <div style="background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(168,85,247,0.12)); border: 1.5px solid rgba(245,158,11,0.35); border-radius: 18px; padding: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
          <span style="font-size: 0.8rem; font-weight: 800; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: 6px;">
            <span>🏆</span> Gran Reto de Maestría • Evaluación Capstone
          </span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="feynman-exam-score-pill" style="background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3);">
              Progreso: ${answeredCount}/${totalQ} respondidas
            </span>
            <span class="feynman-exam-score-pill" style="background: ${finalScore >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(56,189,248,0.15)'}; color: ${finalScore >= 70 ? '#34d399' : '#38bdf8'}; border: 1px solid ${finalScore >= 70 ? 'rgba(16,185,129,0.3)' : 'rgba(56,189,248,0.3)'};">
              Calificación: ${finalScore}%
            </span>
          </div>
        </div>
        <h2 style="font-size: 1.5rem; font-weight: 900; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.02em;">
          # ${escapeHtml(guide.finalExam.title)}
        </h2>
        <p style="font-size: 0.88rem; color: #cbd5e1; margin: 0; line-height: 1.55;">
          ${katexService.parseAndRender(guide.finalExam.summary)}
        </p>
      </div>

      <!-- SECCIÓN A: QUIZZ DE SÍNTESIS INTEGRAL -->
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">📝</span>
            <h3 style="font-size: 1.1rem; font-weight: 800; color: #fff; margin: 0;">
              Parte A: Quizz de Maestría Causal (${guide.finalExam.questions.length} Preguntas Fundamentales)
            </h3>
          </div>
          <span style="font-size: 0.75rem; color: var(--f-text-muted);">
            Demuestra comprensión no memorística de primeros principios
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${renderQuizQuestionsHtml(guide.finalExam.questions, 'final')}
        </div>
      </div>

      <!-- SECCIÓN B: MEGA-SIMULADOR EVALUADOR EN REACT + TYPESCRIPT -->
      <div style="margin-top: 10px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">💻</span>
            <h3 style="font-size: 1.1rem; font-weight: 800; color: #fff; margin: 0;">
              Parte B: Mega-Simulador Evaluador en React 18 + TSX (+1,000 Líneas)
            </h3>
          </div>
          <span style="font-size: 0.75rem; color: #38bdf8; background: rgba(56,189,248,0.12); padding: 2px 10px; border-radius: 999px; font-weight: 700;">
            ⚡ Suite Completa en Vivo
          </span>
        </div>
        ${feynmanSandboxService.renderInteractiveSandboxWidget(guide.finalExam.masterReactCode, guide.finalExam.title)}
      </div>
    `;

    attachQuizOptionListeners();
  };

  // Renderizar la vista interactiva del nivel actual
  const renderCurrentLevelView = () => {
    if (!viewerBody) return;

    if (currentTab === 'markdown') {
      viewerBody.innerHTML = `
        <div style="background: var(--f-input-bg); border: 1px solid var(--f-border); border-radius: 14px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <span style="font-size: 0.85rem; font-weight: 800; color: #fff;">Documento Markdown Completo y Continuo</span>
            <button class="figma-btn-blue-pill" id="btn-copy-markdown-tab" style="padding: 6px 14px; font-size: 0.78rem;">
              Copiar Todo (.md)
            </button>
          </div>
          <pre style="margin: 0; padding: 16px; background: rgba(0,0,0,0.4); border-radius: 10px; color: #e2e8f0; font-family: monospace; font-size: 0.85rem; line-height: 1.5; white-space: pre-wrap; word-break: break-word; max-height: 60vh; overflow-y: auto;">${escapeHtml(guide.markdown)}</pre>
        </div>
      `;

      viewerBody.querySelector('#btn-copy-markdown-tab')?.addEventListener('click', () => {
        navigator.clipboard.writeText(guide.markdown);
        showLocalToast('¡Markdown copiado al portapapeles!');
      });
      return;
    }

    // Si estamos en la pestaña del Examen Final
    if (currentLevelIndex === guide.levels.length && guide.finalExam) {
      renderFinalExamView();
      return;
    }

    const lvl = guide.levels[currentLevelIndex];
    if (!lvl) return;

    const isFirst = currentLevelIndex === 0;
    const isLast = currentLevelIndex === guide.levels.length - 1;

    if (prevBtn) prevBtn.disabled = isFirst;
    if (nextBtn) {
      if (isLast) {
        nextBtn.textContent = guide.finalExam ? '🎓 Ir al Examen Final →' : '🏁 Completar Ruta';
      } else {
        nextBtn.textContent = `Nivel ${lvl.levelNumber + 1} →`;
      }
    }

    // Actualizar stepper visual
    stepperWrap?.querySelectorAll<HTMLButtonElement>('.feynman-step-pill').forEach((pill) => {
      const idx = parseInt(pill.dataset.levelIndex || '0', 10);
      const isActive = idx === currentLevelIndex;
      pill.style.border = isActive ? '1px solid #38bdf8' : '1px solid var(--f-border)';
      pill.style.background = isActive ? 'rgba(56,189,248,0.18)' : 'var(--f-input-bg)';
      pill.style.color = isActive ? '#38bdf8' : 'var(--f-text-secondary)';
      if (isActive) {
        pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });

    const isValidEquation = (eq?: string): boolean => {
      if (!eq) return false;
      const trimmed = eq.trim().replace(/^[*_$`\s]+|[*_$`\s]+$/g, '').trim();
      if (!trimmed || trimmed === '-' || trimmed === '—') return false;
      const lower = trimmed.toLowerCase();
      if (
        lower.startsWith('n/a') ||
        lower.startsWith('no aplica') ||
        lower.startsWith('ningun') ||
        lower.startsWith('none') ||
        lower.startsWith('no requerida') ||
        lower.startsWith('no necesaria') ||
        lower.startsWith('omitir') ||
        lower.startsWith('no hay') ||
        lower.startsWith('no contiene')
      ) {
        return false;
      }
      return true;
    };

    const renderedAxiom = katexService.parseAndRender(lvl.axiomIntuition);

    viewerBody.innerHTML = `
      <!-- BANNER DE ENCABEZADO DE NIVEL -->
      <div style="background: linear-gradient(135deg, rgba(56,189,248,0.08), rgba(168,85,247,0.08)); border: 1px solid rgba(56,189,248,0.2); border-radius: 16px; padding: 20px 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
          <span style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">
            Paso Axiomático ${lvl.levelNumber} de ${guide.levelsCount}
          </span>
          <span style="font-size: 0.75rem; color: var(--f-text-secondary); background: rgba(0,0,0,0.3); padding: 2px 10px; border-radius: 999px;">
            ${lvl.sublevels.length} Subniveles Atómicos
          </span>
        </div>
        <h2 style="font-size: 1.4rem; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.02em;">
          # Nivel ${lvl.levelNumber}: ${escapeHtml(lvl.title)}
        </h2>
        ${lvl.purpose ? `
          <div style="margin-top: 10px; display: flex; align-items: flex-start; gap: 8px; font-size: 0.88rem; color: #e0f2fe; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.25); border-radius: 10px; padding: 8px 14px; line-height: 1.5;">
            <span style="color: #38bdf8; font-weight: 800; white-space: nowrap;">🎯 Propósito del Nivel:</span>
            <span>${escapeHtml(lvl.purpose)}</span>
          </div>
        ` : ''}
      </div>

      <!-- SECCIÓN 1: AXIOMA CENTRAL (INTUICIÓN FEYNMAN) -->
      <div style="background: var(--f-input-bg); border: 1px solid var(--f-border); border-radius: 16px; padding: 22px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
          <span style="font-size: 1.2rem;">💡</span>
          <h3 style="font-size: 1.05rem; font-weight: 800; color: #fff; margin: 0;">1. Axioma Central (Intuición Feynman)</h3>
        </div>
        <div style="font-size: 0.92rem; color: #e2e8f0; line-height: 1.6;">
          ${renderedAxiom}
        </div>
      </div>

      <!-- SECCIÓN 2: DESGLOSE ATÓMICO (SUBNIVELES) -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">🧩</span>
            <h3 style="font-size: 1.05rem; font-weight: 800; color: #fff; margin: 0;">2. Desglose Atómico (${lvl.sublevels.length} Principios)</h3>
          </div>
          <span style="font-size: 0.75rem; color: var(--f-text-muted);">Microlearning atómico (2-4 oraciones)</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 14px;">
          ${lvl.sublevels.map((sub) => `
            <div style="background: var(--f-input-bg); border: 1px solid var(--f-border); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 9px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; background: rgba(56,189,248,0.1); padding: 2px 8px; border-radius: 6px;">
                  Subnivel ${sub.sublevelNumber}
                </span>
                ${sub.mathType === 'eureka' ? `
                  <span style="font-size: 0.68rem; font-weight: 800; color: #a855f7; background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.3); padding: 1px 7px; border-radius: 999px;">
                    ⚡ Formalismo Eureka
                  </span>
                ` : ''}
              </div>

              <h4 style="font-size: 0.94rem; font-weight: 700; color: #fff; margin: 0;">
                ${escapeHtml(sub.concept)}
              </h4>

              <!-- 1. Intuición Feynman (Resumido y fácil de entender) -->
              ${sub.intuition ? `
                <div style="font-size: 0.82rem; color: #34d399; background: rgba(16,185,129,0.08); border-left: 3px solid #10b981; padding: 7px 11px; border-radius: 6px; line-height: 1.45;">
                  💡 <strong style="color: #6ee7b7;">Intuición Feynman:</strong> ${katexService.parseAndRender(sub.intuition)}
                </div>
              ` : ''}

              <!-- 2. Idea Clave (Términos formales y rigurosos) -->
              <div style="font-size: 0.82rem; color: #e2e8f0; line-height: 1.45;">
                <strong style="color: #38bdf8;">Idea Clave:</strong> ${katexService.parseAndRender(sub.keyIdea)}
              </div>

              <!-- 3. Cadena Causal (Solo si es necesario, muy fácil de entender y corta) -->
              ${sub.mechanism ? `
                <div style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.45; background: rgba(192,132,252,0.06); border-left: 3px solid #c084fc; padding: 6px 10px; border-radius: 6px;">
                  <strong style="color: #c084fc;">Cadena Causal:</strong> ${katexService.parseAndRender(sub.mechanism)}
                </div>
              ` : ''}

              <!-- 4. Formalismo Matemático (Solo si aplica) -->
              ${isValidEquation(sub.equation) ? `
                <div style="font-size: 0.82rem; color: #38bdf8; background: rgba(56,189,248,0.08); border-left: 3px solid ${sub.mathType === 'eureka' ? '#a855f7' : '#38bdf8'}; padding: 7px 11px; border-radius: 6px; margin-top: 2px;">
                  <strong style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: ${sub.mathType === 'eureka' ? '#c084fc' : '#7dd3fc'}; display: block; margin-bottom: 2px;">
                    ${sub.mathType === 'eureka' ? '⚡ (FORMALISMO MATEMÁTICO EUREKA)' : '📐 (FORMALISMO MATEMÁTICO)'}:
                  </strong>
                  ${katexService.parseAndRender(sub.equation!.includes('$') || sub.equation!.includes('\\') ? sub.equation! : ('$' + sub.equation! + '$'))}
                </div>
              ` : ''}

              <!-- 5. Límite de Ruptura / Condición de Frontera -->
              ${sub.boundaryCondition ? `
                <div style="font-size: 0.79rem; color: #fbbf24; background: rgba(245,158,11,0.08); border-left: 3px solid #f59e0b; padding: 6px 10px; border-radius: 6px;">
                  <strong>⚠️ Límite de Ruptura:</strong> ${katexService.parseAndRender(sub.boundaryCondition)}
                </div>
              ` : ''}

              ${sub.visualResourceUrl ? `
                <div style="margin-top: 4px; border-radius: 8px; overflow: hidden; border: 1px solid var(--f-border);">
                  <img src="${escapeHtml(sub.visualResourceUrl)}" alt="${escapeHtml(sub.concept)}" style="width: 100%; height: auto; display: block;" />
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SECCIÓN 3: SIMULADOR GRÁFICO INTERACTIVO (REACT 18 + TSX) -->
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">⚡</span>
            <h3 style="font-size: 1.05rem; font-weight: 800; color: #fff; margin: 0;">3. Simulador Gráfico Interactivo (React 18 + TSX)</h3>
          </div>
          <span style="font-size: 0.75rem; color: #38bdf8; background: rgba(56,189,248,0.12); padding: 2px 10px; border-radius: 999px; font-weight: 700;">
            +500 Líneas de Código React
          </span>
        </div>
        ${feynmanSandboxService.renderInteractiveSandboxWidget(lvl.typescriptCode, lvl.title)}
      </div>

      <!-- SECCIÓN 4: NEXO CAUSAL (PRIMEROS PRINCIPIOS) -->
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(245,158,11,0.08)); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 22px; display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.2rem;">🔗</span>
          <h3 style="font-size: 1.05rem; font-weight: 800; color: #fff; margin: 0;">4. Nexo Causal</h3>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 14px;">
          <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); border-radius: 12px; padding: 14px;">
            <div style="font-size: 0.78rem; font-weight: 800; color: #34d399; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <span>✅ Problema resuelto:</span>
            </div>
            <p style="font-size: 0.85rem; color: #e2e8f0; margin: 0; line-height: 1.45;">
              ${escapeHtml(lvl.causalNexus.solvedProblem)}
            </p>
          </div>

          <div style="background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25); border-radius: 12px; padding: 14px;">
            <div style="font-size: 0.78rem; font-weight: 800; color: #fbbf24; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <span>⚠️ Siguiente obstáculo:</span>
            </div>
            <p style="font-size: 0.85rem; color: #e2e8f0; margin: 0; line-height: 1.45;">
              ${escapeHtml(lvl.causalNexus.nextObstacle)}
            </p>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 5: EXAMEN DE NIVEL (EVALUACIÓN FORMATIVA & CASOS LÍMITE) -->
      ${lvl.exam && lvl.exam.questions && lvl.exam.questions.length > 0 ? `
        <div style="background: linear-gradient(135deg, rgba(56,189,248,0.06), rgba(168,85,247,0.06)); border: 1px solid rgba(56,189,248,0.25); border-radius: 16px; padding: 22px; display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.2rem;">🎯</span>
              <h3 style="font-size: 1.05rem; font-weight: 800; color: #fff; margin: 0;">
                5. Examen de Nivel ${lvl.levelNumber} (${lvl.exam.questions.length} Preguntas de Comprobación Causal)
              </h3>
            </div>
            <span style="font-size: 0.75rem; color: #38bdf8; background: rgba(56,189,248,0.12); padding: 2px 10px; border-radius: 999px; font-weight: 700;">
              Retroalimentación Inmediata
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${renderQuizQuestionsHtml(lvl.exam.questions, `lvl-${lvl.levelNumber}`)}
          </div>

          ${lvl.exam.examReactCode ? `
            <div style="margin-top: 8px;">
              <h4 style="font-size: 0.95rem; font-weight: 800; color: #fff; margin: 0 0 8px 0;">
                💻 Evaluador Práctico Interactivo (+400 Líneas):
              </h4>
              ${feynmanSandboxService.renderInteractiveSandboxWidget(lvl.exam.examReactCode, `Examen Práctico Nivel ${lvl.levelNumber}`)}
            </div>
          ` : ''}

          <div style="display: flex; justify-content: flex-end; margin-top: 6px;">
            <button type="button" class="figma-btn-blue-pill" id="btn-advance-causal-next" style="padding: 8px 18px; font-size: 0.82rem;">
              ${isLast 
                ? (guide.finalExam ? '🎓 Presentar Examen Final del Cuaderno →' : '🏁 Completar Ruta')
                : `Avanzar al Nivel ${lvl.levelNumber + 1} (${escapeHtml(guide.levels[currentLevelIndex + 1]?.title || '')}) →`
              }
            </button>
          </div>
        </div>
      ` : `
        <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
          <button type="button" class="figma-btn-blue-pill" id="btn-advance-causal-next" style="padding: 8px 18px; font-size: 0.82rem;">
            ${isLast 
              ? (guide.finalExam ? '🎓 Presentar Examen Final del Cuaderno →' : '🏁 Completar Ruta')
              : `Avanzar al Nivel ${lvl.levelNumber + 1} (${escapeHtml(guide.levels[currentLevelIndex + 1]?.title || '')}) →`
            }
          </button>
        </div>
      `}
    `;

    attachQuizOptionListeners();

    viewerBody.querySelector('#btn-advance-causal-next')?.addEventListener('click', () => {
      if (currentLevelIndex < guide.levels.length - 1) {
        currentLevelIndex++;
        renderCurrentLevelView();
      } else if (guide.finalExam && currentLevelIndex === guide.levels.length - 1) {
        currentLevelIndex = guide.levels.length;
        renderCurrentLevelView();
      } else {
        showLocalToast('🎉 ¡Has completado todos los niveles!');
      }
    });
  };

  // Delegación de clics para opciones de preguntas del quiz
  const attachQuizOptionListeners = () => {
    viewerBody?.querySelectorAll<HTMLButtonElement>('.btn-select-quiz-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const quizKey = btn.dataset.quizKey;
        const optIdx = parseInt(btn.dataset.optionIdx || '0', 10);
        if (quizKey && !userAnswers.has(quizKey)) {
          userAnswers.set(quizKey, optIdx);
          renderCurrentLevelView();
        }
      });
    });
  };

  // Switch de pestañas principales (Interactivo / Markdown)
  modalRoot?.querySelectorAll<HTMLButtonElement>('.feynman-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = (btn.dataset.tab || 'interactive') as 'interactive' | 'markdown';
      currentTab = tab;
      modalRoot.querySelectorAll<HTMLButtonElement>('.feynman-tab-btn').forEach((b) => {
        const isActive = b.dataset.tab === tab;
        b.style.color = isActive ? '#fff' : 'var(--f-text-secondary)';
        b.classList.toggle('active', isActive);
      });
      renderCurrentLevelView();
    });
  });

  // Eventos de stepper
  stepperWrap?.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('.feynman-step-pill') as HTMLElement | null;
    if (target && target.dataset.levelIndex !== undefined) {
      currentLevelIndex = parseInt(target.dataset.levelIndex, 10);
      renderCurrentLevelView();
    }
  });

  // Botones anterior / siguiente
  prevBtn?.addEventListener('click', () => {
    if (currentLevelIndex > 0) {
      currentLevelIndex--;
      renderCurrentLevelView();
    }
  });

  nextBtn?.addEventListener('click', () => {
    const maxIndex = guide.finalExam ? guide.levels.length : guide.levels.length - 1;
    if (currentLevelIndex < maxIndex) {
      currentLevelIndex++;
      renderCurrentLevelView();
    } else {
      showLocalToast('🎉 ¡Has completado todos los niveles y el examen final!');
    }
  });

  // Copiar todo el Markdown
  modalRoot?.querySelector('#btn-copy-guide-md')?.addEventListener('click', () => {
    navigator.clipboard.writeText(guide.markdown);
    showLocalToast('¡Markdown completo copiado al portapapeles!');
  });

  // Descargar archivo .md
  modalRoot?.querySelector('#btn-download-guide-md')?.addEventListener('click', () => {
    const blob = new Blob([guide.markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ruta_Feynman_${guide.topic.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showLocalToast('Archivo .md descargado');
  });

  // Convertir en Cuaderno de Estudio de Eureka
  modalRoot?.querySelector('#btn-export-to-notebook')?.addEventListener('click', () => {
    try {
      const topicId = feynmanLlmService.exportToActiveStudyTopic(guide);
      dialogService.showAlert({
        title: '📓 ¡Cuaderno de Estudio Creado!',
        message: `Se ha creado el cuaderno "[Feynman] ${guide.topic}" con ${guide.levelsCount} fragmentos interactivos en tu zona de Estudio Activo.`,
        buttonText: 'Abrir Cuaderno',
        onConfirm: () => {
          modalRoot.remove();
          options.onClose?.();
          options.onOpenTopic?.(topicId);
        }
      });
    } catch (err: any) {
      dialogService.showAlert({
        title: 'Error al exportar',
        message: err.message || 'No se pudo crear el cuaderno.'
      });
    }
  });

  // Exportar a Mazo de Flashcards
  modalRoot?.querySelector('#btn-export-to-deck')?.addEventListener('click', () => {
    try {
      const deckId = feynmanLlmService.exportToFlashcardDeck(guide);
      dialogService.showAlert({
        title: '🎴 ¡Mazo de Flashcards Generado!',
        message: `Se ha generado el mazo "Ruta Feynman: ${guide.topic}" con los axiomas centrales y principios de microlearning listos para repaso espaciado.`,
        buttonText: 'Ir al Mazo',
        onConfirm: () => {
          modalRoot.remove();
          options.onClose?.();
          options.onOpenDeck?.(deckId);
        }
      });
    } catch (err: any) {
      dialogService.showAlert({
        title: 'Error al exportar',
        message: err.message || 'No se pudo crear el mazo.'
      });
    }
  });

  // Cerrar modal
  const closeModal = () => {
    modalRoot?.remove();
    options.onClose?.();
  };

  modalRoot?.querySelector('#btn-close-feynman-viewer')?.addEventListener('click', closeModal);

  // Render inicial
  renderCurrentLevelView();
}

function showLocalToast(msg: string): void {
  const existing = document.getElementById('feynman-viewer-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'feynman-viewer-toast';
  toast.className = 'toast-notice show';
  toast.style.cssText = 'position:fixed; bottom:30px; left:50%; transform:translateX(-50%); z-index:12000; background:rgba(14,15,20,0.92); border:1px solid var(--f-blue); color:#fff; padding:10px 20px; border-radius:999px; font-weight:700; font-size:0.85rem; box-shadow:0 10px 25px rgba(0,0,0,0.5); backdrop-filter:blur(10px);';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
