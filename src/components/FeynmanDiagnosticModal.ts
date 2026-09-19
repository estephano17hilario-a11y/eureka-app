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

export interface FeynmanDiagnosticModalOptions {
  initialTopic?: string;
  initialSubject?: string;
  initialStage?: 'questionnaire' | 'import_only';
  onGenerated: (guide: FeynmanStudyGuide) => void;
  onClose?: () => void;
}

export function openFeynmanDiagnosticModal(options: FeynmanDiagnosticModalOptions): void {
  const existing = document.getElementById('modal-feynman-diagnostic-root');
  if (existing) existing.remove();

  // Estado interno del formulario reactivo
  let currentTopic = options.initialTopic || '';
  let selectedSubject = options.initialSubject || 'general';
  let selectedLevel: FeynmanCurrentLevel = 1;
  let selectedGoal: FeynmanTargetGoal = 'general';
  let hasAttachedInfo = false;
  let attachedInfoType: 'support' | 'total_basis' = 'support';
  let isSubmitting = false;
  let currentStage: 'questionnaire' | 'prompt_and_import' = options.initialStage === 'import_only' ? 'prompt_and_import' : 'questionnaire';
  let generatedPromptText = '';

  const initialSubjectProfile = feynmanPedagogyService.getSubjectPedagogicalProfile(selectedSubject);

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-feynman-diagnostic-root" style="z-index: 11000; animation: fadeIn 0.2s ease-out;">
      <div class="modal-container apple-glass-panel" style="max-width: 780px; width: 95%; max-height: 92vh; overflow-y: auto; background: var(--f-surface); border: 1px solid var(--f-border); border-radius: var(--f-radius-lg); box-shadow: 0 25px 60px rgba(0,0,0,0.6); padding: 0;">
        
        <!-- CABECERA MODAL FIGMA / APPLE -->
        <div class="figma-modal-header" style="padding: 18px 24px; border-bottom: 1px solid var(--f-border); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #38bdf8, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; box-shadow: 0 4px 15px rgba(56,189,248,0.3);">
              🔬
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.02em;">Diagnóstico & Rutas Feynman</h3>
                <span style="background: rgba(56,189,248,0.15); color: var(--f-blue); border: 1px solid rgba(56,189,248,0.3); font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; text-transform: uppercase;">IA Externa & Simuladores</span>
              </div>
              <p style="font-size: 0.78rem; color: var(--f-text-secondary); margin: 3px 0 0 0;">
                Genera el prompt maestro adaptado a tu materia para tu IA y carga la respuesta para desplegar el roadmap y simuladores en vivo.
              </p>
            </div>
          </div>
          <button class="figma-btn-ghost" id="btn-close-feynman-diagnostic" style="font-size: 1.4rem; line-height: 1; padding: 6px 10px; color: var(--f-text-muted);">×</button>
        </div>

        <!-- STAGE 1: CUESTIONARIO DE DIAGNÓSTICO -->
        <div id="feynman-stage-questionnaire" class="${currentStage === 'questionnaire' ? '' : 'hidden'}" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">

          <!-- 1. CAMPO: TEMA PRINCIPAL (Obligatorio) -->
          <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label for="feynman-input-topic" style="font-size: 0.88rem; font-weight: 700; color: #fff;">
                ¿Qué tema quieres aprender? <span style="color: var(--f-blue);">*</span>
              </label>
              <span style="font-size: 0.72rem; color: var(--f-text-muted);">Obligatorio</span>
            </div>
            <input 
              type="text" 
              id="feynman-input-topic" 
              class="cupertino-dialog-input" 
              style="width: 100%; box-sizing: border-box; font-size: 0.95rem; padding: 12px 16px; background: var(--f-input-bg); border: 1px solid var(--f-input-border); border-radius: var(--f-radius-sm); color: #fff;"
              placeholder="Ej: Mecánica Cuántica, Revolución Francesa, Derecho Penal, Microservicios..."
              value="${escapeHtml(currentTopic)}"
            />
            
            <!-- Chips sugeridos rápidos -->
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
              <button type="button" class="btn-preset-chip feynman-topic-chip" data-topic="Física Cuántica y Principio de Incertidumbre" data-subject="fisica">⚛️ Cuántica</button>
              <button type="button" class="btn-preset-chip feynman-topic-chip" data-topic="Arquitectura de Microservicios y Resiliencia" data-subject="informatica">🏗️ Microservicios</button>
              <button type="button" class="btn-preset-chip feynman-topic-chip" data-topic="Causalidad y Dinámica de la Revolución Francesa" data-subject="historia">🏛️ Rev. Francesa</button>
              <button type="button" class="btn-preset-chip feynman-topic-chip" data-topic="Teoría del Delito y Culpabilidad Jurídica" data-subject="derecho">⚖️ Derecho Penal</button>
              <button type="button" class="btn-preset-chip feynman-topic-chip" data-topic="Fisiopatología del Shock y Parámetros Hemodinámicos" data-subject="medicina">🩺 Fisiopatología</button>
            </div>
          </div>

          <!-- 2. CAMPO: MATERIA / ÁREA DISCIPLINAR (Adaptación Pedagógica del Prompt) -->
          <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label for="feynman-select-subject" style="font-size: 0.88rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 6px;">
                <span>📚 Materia o Área del Conocimiento</span>
                <span style="color: var(--f-blue);">*</span>
              </label>
              <span id="feynman-subject-badge" style="font-size: 0.72rem; font-weight: 800; color: #38bdf8; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.25); padding: 2px 10px; border-radius: 999px;">
                ${initialSubjectProfile.name}
              </span>
            </div>

            <select 
              id="feynman-select-subject" 
              class="cupertino-dialog-input" 
              style="width: 100%; box-sizing: border-box; font-size: 0.92rem; padding: 11px 14px; background: var(--f-input-bg); border: 1px solid var(--f-input-border); border-radius: var(--f-radius-sm); color: #fff; cursor: pointer;"
            >
              ${POPULAR_SUBJECTS.map((s) => `
                <option value="${s.id}" ${s.id === selectedSubject ? 'selected' : ''} style="background: #0f172a; color: #fff;">
                  ${s.icon} ${s.name}
                </option>
              `).join('')}
            </select>

            <div id="feynman-subject-desc-box" style="padding: 10px 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--f-border); border-radius: 10px; font-size: 0.77rem; color: var(--f-text-secondary); line-height: 1.4;">
              💡 <strong>Regla del Dominio:</strong> <span id="feynman-subject-math-rule-text">${initialSubjectProfile.mathRule}</span>
            </div>
          </div>

          <!-- 3. PREGUNTA 1: NIVEL ACTUAL (Selector 1 a 5 obligatorio) -->
          <div class="form-group" style="display: flex; flex-direction: column; gap: 10px;">
            <label style="font-size: 0.88rem; font-weight: 700; color: #fff;">
              Pregunta 1: ¿Cuál es tu nivel actual en este tema? <span style="color: var(--f-blue);">*</span>
            </label>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px;" id="feynman-current-level-selector">
              ${FEYNMAN_CURRENT_LEVELS.map(
                (lvl) => `
                <button 
                  type="button" 
                  class="feynman-level-pill ${lvl.level === 1 ? 'active' : ''}" 
                  data-level="${lvl.level}"
                  style="padding: 10px 8px; border-radius: 12px; border: 1px solid ${lvl.level === 1 ? 'var(--f-blue)' : 'var(--f-border)'}; background: ${lvl.level === 1 ? 'rgba(56,189,248,0.15)' : 'var(--f-input-bg)'}; color: #fff; cursor: pointer; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: all 0.2s ease;"
                >
                  <span style="font-size: 1rem; font-weight: 800; color: ${lvl.level === 1 ? 'var(--f-blue)' : 'var(--f-text-secondary)'};">Nivel ${lvl.level}</span>
                  <span style="font-size: 0.7rem; color: var(--f-text-secondary); line-height: 1.2;">${lvl.badge}</span>
                </button>
              `
              ).join('')}
            </div>
            
            <div id="feynman-level-desc-box" style="padding: 10px 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--f-border); border-radius: 10px; font-size: 0.78rem; color: var(--f-text-secondary);">
              ${FEYNMAN_CURRENT_LEVELS[0].description}
            </div>

            <!-- Lógica Condicional Pregunta 1: Mostrar si Nivel >= 2 -->
            <div id="feynman-conditional-prev-knowledge-wrap" class="hidden" style="margin-top: 6px; transition: all 0.3s ease;">
              <label for="feynman-input-prev-knowledge" style="font-size: 0.82rem; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                <span>✨ Especificar conocimientos previos (opcional)</span>
              </label>
              <textarea 
                id="feynman-input-prev-knowledge" 
                class="figma-editor-textarea" 
                style="min-height: 70px; font-size: 0.85rem; border-radius: var(--f-radius-sm); border: 1px solid rgba(56,189,248,0.3); background: rgba(56,189,248,0.04);"
                placeholder="Ej. Ya domino X herramienta, leí el libro Y, conozco la notación básica..."
              ></textarea>
            </div>
          </div>

          <!-- 4. PREGUNTA 2: NIVEL OBJETIVO (Selector de 3 opciones obligatorio) -->
          <div class="form-group" style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label style="font-size: 0.88rem; font-weight: 700; color: #fff;">
                Pregunta 2: ¿Cuál es tu nivel objetivo? <span style="color: var(--f-blue);">*</span>
              </label>
              <span id="feynman-goal-levels-badge" style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; background: rgba(56,189,248,0.12); padding: 2px 10px; border-radius: 999px; border: 1px solid rgba(56,189,248,0.3);">
                🎯 Exactamente 10 Niveles
              </span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;" id="feynman-target-goal-selector">
              ${FEYNMAN_TARGET_GOALS.map(
                (g) => `
                <div 
                  class="feynman-goal-card ${g.goal === 'general' ? 'active' : ''}" 
                  data-goal="${g.goal}"
                  data-levels="${g.levelsCount}"
                  style="padding: 14px; border-radius: 14px; border: 1px solid ${g.goal === 'general' ? '#38bdf8' : 'var(--f-border)'}; background: ${g.goal === 'general' ? 'rgba(56,189,248,0.08)' : 'var(--f-input-bg)'}; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; gap: 8px; transition: all 0.2s ease;"
                >
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <span style="font-size: 0.92rem; font-weight: 800; color: #fff;">${g.title}</span>
                      <span style="font-size: 0.68rem; font-weight: 800; color: #fff; background: ${g.gradient}; padding: 2px 8px; border-radius: 999px;">${g.badge}</span>
                    </div>
                    <p style="font-size: 0.75rem; color: var(--f-text-secondary); line-height: 1.35; margin: 0;">${g.description}</p>
                  </div>
                  <div style="font-size: 0.7rem; font-weight: 700; color: ${g.goal === 'general' ? '#38bdf8' : 'var(--f-text-muted)'}; margin-top: 4px;">
                    ${g.levelsCount} pasos axiomáticos
                  </div>
                </div>
              `
              ).join('')}
            </div>

            <!-- Lógica Condicional Pregunta 2: Mostrar si Objetivo es "adentrado" o "especializado" -->
            <div id="feynman-conditional-specific-focus-wrap" class="hidden" style="margin-top: 6px; transition: all 0.3s ease;">
              <label for="feynman-input-specific-focus" id="feynman-label-specific-focus" style="font-size: 0.82rem; font-weight: 700; color: #a855f7; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                <span>🎯 ¿Específicamente qué quieres aprender sobre este tema? (opcional)</span>
              </label>
              <input 
                type="text" 
                id="feynman-input-specific-focus" 
                class="cupertino-dialog-input" 
                style="width: 100%; box-sizing: border-box; font-size: 0.85rem; padding: 10px 14px; background: rgba(168,85,247,0.04); border: 1px solid rgba(168,85,247,0.3); border-radius: var(--f-radius-sm); color: #fff;"
                placeholder="Ej. Enfoque aplicado, optimización, casos extremos o jurisprudencia..."
              />
            </div>
          </div>

          <!-- 5. CASILLA: ADJUNTAR INFORMACIÓN / MATERIAL DE REFERENCIA -->
          <div class="form-group" style="padding: 16px; background: rgba(255,255,255,0.02); border: 1px solid var(--f-border); border-radius: 14px; display: flex; flex-direction: column; gap: 12px;">
            <label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer; user-select: none;">
              <input type="checkbox" id="feynman-checkbox-attach-info" style="width: 18px; height: 18px; margin-top: 2px; accent-color: #38bdf8; cursor: pointer;" />
              <div>
                <span style="font-size: 0.88rem; font-weight: 800; color: #fff;">📎 Voy a adjuntar información / material de referencia a la IA</span>
                <p style="font-size: 0.74rem; color: var(--f-text-secondary); margin: 2px 0 0 0; line-height: 1.35;">
                  Avisa a la IA para calibrar la explicación según tus apuntes, PDFs, libros o documentos fuente.
                </p>
              </div>
            </label>

            <!-- Opciones condicionales del tipo de adjunto -->
            <div id="feynman-attach-options-wrap" class="hidden" style="padding-top: 12px; border-top: 1px solid var(--f-border); display: flex; flex-direction: column; gap: 12px;">
              <span style="font-size: 0.8rem; font-weight: 700; color: #38bdf8;">Selecciona cómo debe actuar la IA con respecto al material:</span>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;">
                <label class="feynman-attach-type-card active" id="feynman-attach-type-support" style="padding: 12px 14px; border-radius: 12px; border: 1px solid #38bdf8; background: rgba(56,189,248,0.1); cursor: pointer; display: flex; gap: 10px; align-items: flex-start; transition: all 0.2s ease;">
                  <input type="radio" name="feynman_attach_type" value="support" checked style="margin-top: 3px; accent-color: #38bdf8;" />
                  <div>
                    <div style="font-size: 0.84rem; font-weight: 800; color: #fff;">ℹ️ Información de apoyo / complementaria</div>
                    <div style="font-size: 0.73rem; color: var(--f-text-secondary); margin-top: 3px; line-height: 1.35;">
                      El material servirá como contexto y fuente de ejemplos. La IA enriquecerá la ruta con todo su conocimiento pedagógico de primeros principios.
                    </div>
                  </div>
                </label>

                <label class="feynman-attach-type-card" id="feynman-attach-type-total" style="padding: 12px 14px; border-radius: 12px; border: 1px solid var(--f-border); background: var(--f-input-bg); cursor: pointer; display: flex; gap: 10px; align-items: flex-start; transition: all 0.2s ease;">
                  <input type="radio" name="feynman_attach_type" value="total_basis" style="margin-top: 3px; accent-color: #38bdf8;" />
                  <div>
                    <div style="font-size: 0.84rem; font-weight: 800; color: #fff;">🎯 Base total de la explicación del tema</div>
                    <div style="font-size: 0.73rem; color: var(--f-text-secondary); margin-top: 3px; line-height: 1.35;">
                      Toda la explicación, axiomas y niveles deben basarse e investigarse estricta y totalmente en la información adjunta, sin salirse del alcance documental.
                    </div>
                  </div>
                </label>
              </div>

              <div style="margin-top: 2px;">
                <label for="feynman-input-attach-content" style="font-size: 0.78rem; font-weight: 700; color: var(--f-text-secondary); display: block; margin-bottom: 4px;">
                  Pegar texto del documento aquí (opcional, o adjúntalo como archivo en tu chat con la IA):
                </label>
                <textarea 
                  id="feynman-input-attach-content" 
                  class="figma-editor-textarea" 
                  style="min-height: 70px; font-size: 0.82rem; border-radius: var(--f-radius-sm); border: 1px solid rgba(56,189,248,0.25); background: rgba(0,0,0,0.3);"
                  placeholder="Pega aquí el texto, apuntes o extracto si deseas que vaya incrustado directamente en el prompt..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- FOOTER STAGE 1 -->
          <div style="padding-top: 10px; border-top: 1px solid var(--f-border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <button type="button" class="figma-btn-ghost" id="btn-switch-to-direct-paste" style="padding: 8px 14px; font-size: 0.8rem; color: #38bdf8;">
              📥 Ya tengo mi Markdown (Pegar directamente)
            </button>

            <div style="display: flex; align-items: center; gap: 10px;">
              <button type="button" class="figma-btn-blue-pill" id="btn-generate-feynman-prompt-stage" style="padding: 12px 24px; font-weight: 800; font-size: 0.92rem; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(56,189,248,0.3);">
                <span>📝 Generar Prompt Maestro para mi IA →</span>
              </button>
            </div>
          </div>

        </div>

        <!-- STAGE 2: PROMPT GENERADO ("TEXTAZO") & IMPORTADOR MARKDOWN -->
        <div id="feynman-stage-prompt-import" class="${currentStage === 'prompt_and_import' ? '' : 'hidden'}" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
          
          <!-- BANNER EXPLICATIVO -->
          <div style="background: linear-gradient(135deg, rgba(56,189,248,0.1), rgba(168,85,247,0.1)); border: 1px solid rgba(56,189,248,0.3); border-radius: 14px; padding: 16px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <span style="font-size: 1.2rem;">✨</span>
              <h4 style="font-size: 0.98rem; font-weight: 800; color: #fff; margin: 0;">Paso 1: Copia el Prompt Maestro y pásalo a tu IA favorita</h4>
            </div>
            <p style="font-size: 0.82rem; color: #e2e8f0; line-height: 1.45; margin: 0;">
              Copia este texto y pégalo en <strong>ChatGPT, Claude, Gemini, DeepSeek o el LLM que prefieras</strong>. Cuando la IA te devuelva el archivo Markdown (.md), pégalo abajo para generar el roadmap interactivo con simuladores TypeScript ejecutándose en vivo.
            </p>
          </div>

          <!-- RECUADRO DEL PROMPT MAESTRO ("TEXTAZO") -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.85rem; font-weight: 700; color: #fff;">Prompt Maestro Calibrado (+400/500 líneas React + TSX / nivel)</span>
              <button type="button" class="figma-btn-blue-pill" id="btn-copy-feynman-master-prompt" style="padding: 6px 14px; font-size: 0.78rem; display: flex; align-items: center; gap: 6px;">
                <span>📋 Copiar Prompt Maestro</span>
              </button>
            </div>
            <textarea 
              id="feynman-prompt-preview-box" 
              class="figma-editor-textarea" 
              readonly 
              style="min-height: 140px; font-family: monospace; font-size: 0.78rem; line-height: 1.4; background: rgba(0,0,0,0.5); border: 1px solid var(--f-border); border-radius: var(--f-radius-sm); color: #93c5fd;"
            >${escapeHtml(generatedPromptText)}</textarea>
          </div>

          <!-- PASO 2: PEGAR O SUBIR RESPUESTA MARKDOWN -->
          <div style="background: var(--f-input-bg); border: 1px solid var(--f-border); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.1rem;">📥</span>
                <h4 style="font-size: 0.95rem; font-weight: 800; color: #fff; margin: 0;">Paso 2: Pega el Markdown Devuelto por tu IA</h4>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="file" id="feynman-file-md-upload" accept=".md,.markdown,.txt" style="display: none;" />
                <button type="button" class="figma-btn-ghost" id="btn-trigger-file-upload" style="padding: 6px 12px; font-size: 0.78rem; border: 1px solid var(--f-border); border-radius: 8px;">
                  📁 Cargar archivo .md
                </button>
              </div>
            </div>

            <textarea 
              id="feynman-input-pasted-markdown" 
              class="figma-editor-textarea" 
              style="min-height: 140px; font-size: 0.85rem; font-family: monospace; border-radius: var(--f-radius-sm); border: 1px solid rgba(56,189,248,0.25); background: rgba(0,0,0,0.4);"
              placeholder="Pega aquí el texto completo devuelto por tu IA (que contenga los niveles '# Nivel 1: ...')..."
            ></textarea>

            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
              <button type="button" class="figma-btn-ghost" id="btn-back-to-questionnaire" style="font-size: 0.8rem; padding: 8px 14px;">
                ← Modificar Cuestionario
              </button>

              <button type="button" class="figma-btn-blue-pill" id="btn-deploy-markdown-roadmap" style="padding: 12px 24px; font-size: 0.92rem; font-weight: 800; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 18px rgba(56,189,248,0.35);">
                <span>🚀 Desplegar Roadmap y Simuladores en Vivo</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Elementos DOM
  const modalRoot = document.getElementById('modal-feynman-diagnostic-root');
  const stageQuestionnaire = document.getElementById('feynman-stage-questionnaire');
  const stagePromptImport = document.getElementById('feynman-stage-prompt-import');
  const topicInput = document.getElementById('feynman-input-topic') as HTMLInputElement | null;
  const subjectSelect = document.getElementById('feynman-select-subject') as HTMLSelectElement | null;
  const subjectBadge = document.getElementById('feynman-subject-badge');
  const subjectMathRuleText = document.getElementById('feynman-subject-math-rule-text');
  const prevKnowledgeWrap = document.getElementById('feynman-conditional-prev-knowledge-wrap');
  const prevKnowledgeInput = document.getElementById('feynman-input-prev-knowledge') as HTMLTextAreaElement | null;
  const levelDescBox = document.getElementById('feynman-level-desc-box');
  const goalBadge = document.getElementById('feynman-goal-levels-badge');
  const specificFocusWrap = document.getElementById('feynman-conditional-specific-focus-wrap');
  const specificFocusInput = document.getElementById('feynman-input-specific-focus') as HTMLInputElement | null;
  const specificFocusLabel = document.getElementById('feynman-label-specific-focus');
  const attachCheckbox = document.getElementById('feynman-checkbox-attach-info') as HTMLInputElement | null;
  const attachOptionsWrap = document.getElementById('feynman-attach-options-wrap');
  const attachSupportCard = document.getElementById('feynman-attach-type-support');
  const attachTotalCard = document.getElementById('feynman-attach-type-total');
  const attachContentInput = document.getElementById('feynman-input-attach-content') as HTMLTextAreaElement | null;
  const promptPreviewBox = document.getElementById('feynman-prompt-preview-box') as HTMLTextAreaElement | null;
  const pastedMarkdownInput = document.getElementById('feynman-input-pasted-markdown') as HTMLTextAreaElement | null;
  const fileUploadInput = document.getElementById('feynman-file-md-upload') as HTMLInputElement | null;

  // Actualizar etiqueta de foco
  const updateFocusLabel = () => {
    if (!specificFocusLabel) return;
    const topic = topicInput?.value.trim() || 'este tema';
    specificFocusLabel.innerHTML = `<span>🎯 ¿Específicamente qué quieres aprender sobre ${escapeHtml(topic)}? (opcional)</span>`;
  };

  topicInput?.addEventListener('input', () => {
    currentTopic = topicInput.value;
    updateFocusLabel();
  });

  // Selector de Materia
  subjectSelect?.addEventListener('change', () => {
    selectedSubject = subjectSelect.value;
    const profile = feynmanPedagogyService.getSubjectPedagogicalProfile(selectedSubject);
    if (subjectBadge) subjectBadge.textContent = profile.name;
    if (subjectMathRuleText) subjectMathRuleText.textContent = profile.mathRule;
  });

  // Chips de temas rápidos
  modalRoot?.querySelectorAll<HTMLButtonElement>('.feynman-topic-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const t = chip.dataset.topic;
      const s = chip.dataset.subject;
      if (t && topicInput) {
        topicInput.value = t;
        currentTopic = t;
        updateFocusLabel();
      }
      if (s && subjectSelect) {
        subjectSelect.value = s;
        selectedSubject = s;
        const profile = feynmanPedagogyService.getSubjectPedagogicalProfile(s);
        if (subjectBadge) subjectBadge.textContent = profile.name;
        if (subjectMathRuleText) subjectMathRuleText.textContent = profile.mathRule;
      }
      topicInput?.focus();
    });
  });

  // Toggle de Adjuntar Información
  attachCheckbox?.addEventListener('change', () => {
    hasAttachedInfo = attachCheckbox.checked;
    if (hasAttachedInfo) {
      attachOptionsWrap?.classList.remove('hidden');
    } else {
      attachOptionsWrap?.classList.add('hidden');
    }
  });

  // Radios de tipo de adjunto (support vs total_basis)
  modalRoot?.querySelectorAll<HTMLInputElement>('input[name="feynman_attach_type"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      attachedInfoType = radio.value as 'support' | 'total_basis';
      if (attachedInfoType === 'support') {
        if (attachSupportCard) {
          attachSupportCard.style.border = '1px solid #38bdf8';
          attachSupportCard.style.background = 'rgba(56,189,248,0.1)';
        }
        if (attachTotalCard) {
          attachTotalCard.style.border = '1px solid var(--f-border)';
          attachTotalCard.style.background = 'var(--f-input-bg)';
        }
      } else {
        if (attachTotalCard) {
          attachTotalCard.style.border = '1px solid #38bdf8';
          attachTotalCard.style.background = 'rgba(56,189,248,0.1)';
        }
        if (attachSupportCard) {
          attachSupportCard.style.border = '1px solid var(--f-border)';
          attachSupportCard.style.background = 'var(--f-input-bg)';
        }
      }
    });
  });

  // Selector de Nivel Actual (1 a 5)
  const levelButtons = modalRoot?.querySelectorAll<HTMLButtonElement>('.feynman-level-pill');
  levelButtons?.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lvl = parseInt(btn.dataset.level || '1', 10) as FeynmanCurrentLevel;
      selectedLevel = lvl;

      levelButtons.forEach((b) => {
        const isActive = parseInt(b.dataset.level || '1', 10) === lvl;
        b.style.border = isActive ? '1px solid var(--f-blue)' : '1px solid var(--f-border)';
        b.style.background = isActive ? 'rgba(56,189,248,0.15)' : 'var(--f-input-bg)';
        const lvlNumSpan = b.querySelector('span:first-child') as HTMLElement | null;
        if (lvlNumSpan) {
          lvlNumSpan.style.color = isActive ? 'var(--f-blue)' : 'var(--f-text-secondary)';
        }
      });

      const opt = FEYNMAN_CURRENT_LEVELS.find((o) => o.level === lvl);
      if (levelDescBox && opt) {
        levelDescBox.textContent = opt.description;
      }

      // Lógica condicional: mostrar campo conocimientos previos si nivel >= 2
      if (lvl >= 2) {
        prevKnowledgeWrap?.classList.remove('hidden');
      } else {
        prevKnowledgeWrap?.classList.add('hidden');
        if (prevKnowledgeInput) prevKnowledgeInput.value = '';
      }
    });
  });

  // Selector de Nivel Objetivo
  const goalCards = modalRoot?.querySelectorAll<HTMLDivElement>('.feynman-goal-card');
  goalCards?.forEach((card) => {
    card.addEventListener('click', () => {
      const goal = (card.dataset.goal || 'general') as FeynmanTargetGoal;
      selectedGoal = goal;

      goalCards.forEach((c) => {
        const isSelected = c.dataset.goal === goal;
        c.style.border = isSelected ? '1px solid #38bdf8' : '1px solid var(--f-border)';
        c.style.background = isSelected ? 'rgba(56,189,248,0.08)' : 'var(--f-input-bg)';
      });

      const opt = FEYNMAN_TARGET_GOALS.find((g) => g.goal === goal);
      if (goalBadge && opt) {
        goalBadge.textContent = `🎯 Exactamente ${opt.levelsCount} Niveles`;
      }

      // Lógica condicional: mostrar campo de enfoque específico si adentrado o especializado
      if (goal === 'adentrado' || goal === 'especializado') {
        updateFocusLabel();
        specificFocusWrap?.classList.remove('hidden');
      } else {
        specificFocusWrap?.classList.add('hidden');
        if (specificFocusInput) specificFocusInput.value = '';
      }
    });
  });

  // Helper para construir el objeto del formulario
  const getCurrentFormData = (): FeynmanDiagnosticForm => {
    return {
      topic: topicInput?.value.trim() || 'Tema General',
      subject: selectedSubject,
      currentLevel: selectedLevel,
      previousKnowledge: selectedLevel >= 2 ? prevKnowledgeInput?.value.trim() : undefined,
      targetGoal: selectedGoal,
      specificFocus: selectedGoal !== 'general' ? specificFocusInput?.value.trim() : undefined,
      hasAttachedInfo,
      attachedInfoType: hasAttachedInfo ? attachedInfoType : undefined,
      attachedInfoContent: hasAttachedInfo ? attachContentInput?.value.trim() : undefined
    };
  };

  // Construir y pasar al Paso 2 (Prompt Maestro y Pegar Markdown)
  const buildAndShowPromptStage = () => {
    const topic = topicInput?.value.trim();
    if (!topic) {
      topicInput?.focus();
      topicInput?.style.setProperty('border-color', '#ef4444', 'important');
      setTimeout(() => topicInput?.style.removeProperty('border-color'), 2000);
      return;
    }

    const form = getCurrentFormData();
    generatedPromptText = feynmanPedagogyService.buildFullExportablePrompt(form);
    if (promptPreviewBox) {
      promptPreviewBox.value = generatedPromptText;
    }

    stageQuestionnaire?.classList.add('hidden');
    stagePromptImport?.classList.remove('hidden');
    currentStage = 'prompt_and_import';
    nativeService.triggerHaptics('light');
  };

  modalRoot?.querySelector('#btn-generate-feynman-prompt-stage')?.addEventListener('click', buildAndShowPromptStage);

  modalRoot?.querySelector('#btn-switch-to-direct-paste')?.addEventListener('click', () => {
    const form = getCurrentFormData();
    generatedPromptText = feynmanPedagogyService.buildFullExportablePrompt(form);
    if (promptPreviewBox) promptPreviewBox.value = generatedPromptText;
    stageQuestionnaire?.classList.add('hidden');
    stagePromptImport?.classList.remove('hidden');
    currentStage = 'prompt_and_import';
  });

  modalRoot?.querySelector('#btn-back-to-questionnaire')?.addEventListener('click', () => {
    stagePromptImport?.classList.add('hidden');
    stageQuestionnaire?.classList.remove('hidden');
    currentStage = 'questionnaire';
    nativeService.triggerHaptics('light');
  });

  // Copiar Prompt Maestro con 1 click
  modalRoot?.querySelector('#btn-copy-feynman-master-prompt')?.addEventListener('click', () => {
    const form = getCurrentFormData();
    generatedPromptText = feynmanPedagogyService.buildFullExportablePrompt(form);
    if (promptPreviewBox) {
      promptPreviewBox.value = generatedPromptText;
    }

    navigator.clipboard.writeText(generatedPromptText);
    nativeService.triggerHaptics('medium');
    const copyBtn = modalRoot?.querySelector('#btn-copy-feynman-master-prompt');
    if (copyBtn) {
      copyBtn.innerHTML = '<span>✅ ¡Prompt Maestro Copiado!</span>';
      setTimeout(() => {
        if (copyBtn) copyBtn.innerHTML = '<span>📋 Copiar Prompt Maestro</span>';
      }, 2500);
    }
    showDiagnosticToast(`📋 ¡Prompt para "${form.topic}" copiado! Pégalo en tu IA`);
  });

  // Subir archivo Markdown (.md)
  modalRoot?.querySelector('#btn-trigger-file-upload')?.addEventListener('click', () => {
    fileUploadInput?.click();
  });

  fileUploadInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (pastedMarkdownInput && text) {
          pastedMarkdownInput.value = text;
          showDiagnosticToast(`📁 Archivo "${file.name}" cargado`);
        }
      };
      reader.readAsText(file);
    }
  });

  // Desplegar Roadmap a partir del Markdown pegado
  modalRoot?.querySelector('#btn-deploy-markdown-roadmap')?.addEventListener('click', () => {
    if (isSubmitting) return;
    const markdown = pastedMarkdownInput?.value.trim();
    if (!markdown) {
      pastedMarkdownInput?.focus();
      pastedMarkdownInput?.style.setProperty('border-color', '#ef4444', 'important');
      setTimeout(() => pastedMarkdownInput?.style.removeProperty('border-color'), 2000);
      return;
    }

    isSubmitting = true;
    try {
      const form = getCurrentFormData();
      const guide = feynmanLlmService.importMarkdownGuide(markdown, form.topic ? form : undefined);
      modalRoot?.remove();
      options.onGenerated(guide);
    } catch (err: any) {
      isSubmitting = false;
      console.error('[FeynmanDiagnosticModal] Error al importar Markdown:', err);
      dialogService.showAlert({
        title: '⚠️ Formato Markdown no reconocido',
        message: err.message || 'No se pudieron extraer los niveles. Asegúrate de que el texto comience con "# Nivel 1:" o incluya los encabezados de nivel.'
      });
    }
  });

  // Cerrar modal
  const closeModal = () => {
    modalRoot?.remove();
    options.onClose?.();
  };

  modalRoot?.querySelector('#btn-close-feynman-diagnostic')?.addEventListener('click', closeModal);
}

function showDiagnosticToast(msg: string): void {
  const existing = document.getElementById('feynman-diag-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'feynman-diag-toast';
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
