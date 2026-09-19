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

// Preset temáticos rápidos con materias asociadas
const TOPIC_PRESETS = [
  { icon: '⚛️', label: 'Mecánica Cuántica', topic: 'Física Cuántica y Principio de Incertidumbre', subject: 'fisica' },
  { icon: '💻', label: 'Microservicios', topic: 'Arquitectura de Microservicios, Resiliencia y Event-Driven', subject: 'informatica' },
  { icon: '🏛️', label: 'Rev. Francesa', topic: 'Causalidad Sociopolítica y Fases de la Revolución Francesa', subject: 'historia' },
  { icon: '⚖️', label: 'Teoría del Delito', topic: 'Teoría del Delito y Culpabilidad en Derecho Penal', subject: 'derecho' },
  { icon: '🩺', label: 'Fisiopatología', topic: 'Fisiopatología del Shock y Parámetros Hemodinámicos', subject: 'medicina' },
  { icon: '📈', label: 'Macroeconomía', topic: 'Dinámica de Inflación, Curva de Phillips y Política Monetaria', subject: 'economia' },
  { icon: '🧬', label: 'Replicación ADN', topic: 'Mecanismos Moleculares de Replicación del ADN y Mutación', subject: 'biologia' },
  { icon: '📐', label: 'Álgebra Lineal', topic: 'Descomposición en Valores Singulares (SVD) y Espacios Vectoriales', subject: 'matematicas' },
  { icon: '🧠', label: 'Epistemología', topic: 'El Problema de la Inducción y Falsacionismo Científico', subject: 'filosofia' },
  { icon: '⚙️', label: 'Termodinámica', topic: 'Entropía y Ciclos de Carnot en Termodinámica Estadística', subject: 'ingenieria' }
];

export function openFeynmanDiagnosticModal(options: FeynmanDiagnosticModalOptions): void {
  const existing = document.getElementById('modal-feynman-diagnostic-root');
  if (existing) existing.remove();

  // Estado interno reactivo
  let currentTopic = options.initialTopic || '';
  let selectedSubject = options.initialSubject || 'general';
  let selectedLevel: FeynmanCurrentLevel = 1;
  let selectedGoal: FeynmanTargetGoal = 'general';
  let hasAttachedInfo = false;
  let attachedInfoType: 'support' | 'total_basis' = 'support';
  let isSubmitting = false;
  let currentStage: 'questionnaire' | 'prompt_and_import' = options.initialStage === 'import_only' ? 'prompt_and_import' : 'questionnaire';
  let generatedPromptText = '';
  let isPromptPreviewExpanded = false;

  const initialSubjectProfile = feynmanPedagogyService.getSubjectPedagogicalProfile(selectedSubject);

  const modalHtml = `
    <div class="modal-backdrop figma-modal-backdrop" id="modal-feynman-diagnostic-root" style="z-index: 11000; animation: feynmanFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);">
      <style>
        @keyframes feynmanFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes feynmanPulse {
          0%, 100% { box-shadow: 0 0 15px rgba(56, 189, 248, 0.25); }
          50% { box-shadow: 0 0 28px rgba(56, 189, 248, 0.55); }
        }
        .feynman-glass-card {
          background: rgba(23, 24, 31, 0.78);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.25s ease;
        }
        .feynman-glass-card:hover {
          border-color: rgba(255, 255, 255, 0.16);
        }
        .feynman-subject-card {
          cursor: pointer;
          user-select: none;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          display: flex;
          align-items: center;
          gap: 9px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .feynman-subject-card:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(56, 189, 248, 0.4);
        }
        .feynman-subject-card.active {
          border-color: #38bdf8;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.16), rgba(168, 85, 247, 0.12));
          box-shadow: 0 4px 18px rgba(56, 189, 248, 0.2);
        }
        .feynman-level-box {
          cursor: pointer;
          user-select: none;
          padding: 14px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .feynman-level-box:hover {
          transform: translateY(-2px);
          border-color: rgba(56, 189, 248, 0.3);
          background: rgba(255, 255, 255, 0.05);
        }
        .feynman-level-box.active {
          border-color: #38bdf8;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(56, 189, 248, 0.05));
          box-shadow: 0 4px 20px rgba(56, 189, 248, 0.25);
        }
        .feynman-goal-box {
          cursor: pointer;
          user-select: none;
          padding: 16px 18px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 12px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .feynman-goal-box:hover {
          transform: translateY(-2px);
          border-color: rgba(56, 189, 248, 0.4);
          background: rgba(255, 255, 255, 0.05);
        }
        .feynman-goal-box.active {
          border-color: #38bdf8;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.14), rgba(168, 85, 247, 0.08));
          box-shadow: 0 8px 24px rgba(56, 189, 248, 0.25);
        }
        .feynman-chip-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          font-size: 0.74rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 999px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.18s ease;
        }
        .feynman-chip-btn:hover {
          background: rgba(56, 189, 248, 0.12);
          border-color: rgba(56, 189, 248, 0.4);
          color: #fff;
          transform: translateY(-1px);
        }
        .feynman-dropzone {
          border: 2px dashed rgba(56, 189, 248, 0.35);
          background: rgba(56, 189, 248, 0.03);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .feynman-dropzone.drag-over {
          border-color: #38bdf8;
          background: rgba(56, 189, 248, 0.12);
          transform: scale(1.01);
        }
        .feynman-stepper-tab {
          cursor: pointer;
          user-select: none;
          padding: 10px 18px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--f-text-secondary);
          background: transparent;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        .feynman-stepper-tab:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.04);
        }
        .feynman-stepper-tab.active {
          color: #fff;
          background: rgba(56, 189, 248, 0.14);
          border-color: rgba(56, 189, 248, 0.35);
          box-shadow: 0 2px 10px rgba(56, 189, 248, 0.2);
        }
        .feynman-ai-launcher-btn {
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 13px;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 700;
          color: #fff;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .feynman-ai-launcher-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        }
        .feynman-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .feynman-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .feynman-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(255, 255, 255, 0.15);
          transition: 0.25s;
          border-radius: 24px;
        }
        .feynman-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.25s;
          border-radius: 50%;
        }
        input:checked + .feynman-slider {
          background-color: #38bdf8;
        }
        input:checked + .feynman-slider:before {
          transform: translateX(20px);
        }
      </style>

      <div class="modal-container feynman-glass-card" style="max-width: 860px; width: 95%; max-height: 94vh; overflow-y: auto; border-radius: 24px; box-shadow: 0 30px 80px rgba(0,0,0,0.75), 0 0 1px 1px rgba(255,255,255,0.1); padding: 0;">
        
        <!-- CABECERA PRINCIPAL CON STEPPER INTEGRADO -->
        <div style="padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); background: linear-gradient(180deg, rgba(56,189,248,0.06), transparent); display: flex; flex-direction: column; gap: 14px;">
          
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, #38bdf8, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 1.35rem; box-shadow: 0 4px 20px rgba(56,189,248,0.35);">
                ⚡
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <h3 style="font-size: 1.22rem; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.02em;">Estudio Feynman & Simuladores</h3>
                  <span style="background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); font-size: 0.65rem; font-weight: 800; padding: 2px 9px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em;">IA de Primeros Principios</span>
                </div>
                <p style="font-size: 0.8rem; color: #94a3b8; margin: 3px 0 0 0;">
                  Calibra tu prompt pedagógico paso a paso, cópialo a tu IA favorita y despliega simuladores interactivos TSX en vivo.
                </p>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
              <button type="button" class="figma-btn-ghost" id="btn-quick-import-mode" style="font-size: 0.78rem; font-weight: 700; color: #38bdf8; background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.25); border-radius: 10px; padding: 8px 14px; display: flex; align-items: center; gap: 6px;">
                <span>📥 Modo Rápido (Tengo .md)</span>
              </button>
              <button class="figma-btn-ghost" id="btn-close-feynman-diagnostic" style="font-size: 1.5rem; line-height: 1; padding: 6px 12px; color: #94a3b8; border-radius: 10px;">×</button>
            </div>
          </div>

          <!-- STEPPER FLUIDO -->
          <div style="display: flex; align-items: center; gap: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px;">
            <button type="button" class="feynman-stepper-tab ${currentStage === 'questionnaire' ? 'active' : ''}" id="tab-step-configure">
              <span style="width: 20px; height: 20px; border-radius: 50%; background: ${currentStage === 'questionnaire' ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; color: ${currentStage === 'questionnaire' ? '#000' : '#fff'}; font-size: 0.72rem; display: flex; align-items: center; justify-content: center; font-weight: 800;">1</span>
              <span>Configuración Pedagógica</span>
            </button>

            <span style="color: rgba(255,255,255,0.2); font-size: 0.8rem;">→</span>

            <button type="button" class="feynman-stepper-tab ${currentStage === 'prompt_and_import' ? 'active' : ''}" id="tab-step-prompt">
              <span style="width: 20px; height: 20px; border-radius: 50%; background: ${currentStage === 'prompt_and_import' ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; color: ${currentStage === 'prompt_and_import' ? '#000' : '#fff'}; font-size: 0.72rem; display: flex; align-items: center; justify-content: center; font-weight: 800;">2</span>
              <span>Prompt Maestro & Despliegue</span>
            </button>

            <div style="margin-left: auto; display: flex; align-items: center; gap: 6px;">
              <span id="feynman-live-summary-badge" style="font-size: 0.72rem; font-weight: 700; color: #38bdf8; background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.25); padding: 3px 10px; border-radius: 999px;">
                🎯 10 Niveles • +500L TSX • Step-by-Step
              </span>
            </div>
          </div>

        </div>

        <!-- STAGE 1: CUESTIONARIO & CONFIGURACIÓN VISUAL -->
        <div id="feynman-stage-questionnaire" class="${currentStage === 'questionnaire' ? '' : 'hidden'}" style="padding: 24px; display: flex; flex-direction: column; gap: 24px;">

          <!-- 1. TEMA PRINCIPAL (HERO INPUT CON CHIPS) -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label for="feynman-input-topic" style="font-size: 0.94rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;">
                <span>🎯 ¿Qué tema deseas dominar con primeros principios?</span>
                <span style="color: #38bdf8;">*</span>
              </label>
              <span style="font-size: 0.72rem; color: #64748b; font-weight: 600;">Obligatorio</span>
            </div>

            <div style="position: relative;">
              <input 
                type="text" 
                id="feynman-input-topic" 
                style="width: 100%; box-sizing: border-box; font-size: 1.05rem; font-weight: 600; padding: 14px 18px; background: rgba(0,0,0,0.45); border: 1px solid rgba(56,189,248,0.25); border-radius: 14px; color: #fff; outline: none; transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(0,0,0,0.2);"
                placeholder="Ej: Mecánica Cuántica, Revolución Francesa, Microservicios, Derecho Penal..."
                value="${escapeHtml(currentTopic)}"
              />
            </div>
            
            <!-- Chips temáticos con icono -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Sugerencias rápidas:</span>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${TOPIC_PRESETS.map((p) => `
                  <button type="button" class="feynman-chip-btn feynman-topic-chip" data-topic="${escapeHtml(p.topic)}" data-subject="${p.subject}">
                    <span>${p.icon}</span>
                    <span>${p.label}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- 2. MATERIA / ÁREA DISCIPLINAR (SELECTOR VISUAL DE TARJETAS) -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div>
                <label style="font-size: 0.94rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;">
                  <span>📚 Materia o Área Disciplinar</span>
                  <span style="color: #38bdf8;">*</span>
                </label>
                <p style="font-size: 0.75rem; color: #94a3b8; margin: 2px 0 0 0;">
                  Calibra la regla de formalismo matemático, el tipo de simulador TSX y el estilo de razonamiento de la IA.
                </p>
              </div>

              <!-- Selector desplegable tradicional como respaldo rápido -->
              <select 
                id="feynman-select-subject" 
                style="font-size: 0.82rem; font-weight: 700; padding: 8px 14px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: #38bdf8; cursor: pointer; outline: none;"
              >
                ${POPULAR_SUBJECTS.map((s) => `
                  <option value="${s.id}" ${s.id === selectedSubject ? 'selected' : ''} style="background: #0f172a; color: #fff;">
                    ${s.icon} ${s.name}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Grid visual de tarjetas de disciplinas destacadas -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 9px;" id="feynman-subject-grid-picker">
              ${POPULAR_SUBJECTS.slice(0, 10).map((s) => `
                <div class="feynman-subject-card ${s.id === selectedSubject ? 'active' : ''}" data-subject="${s.id}">
                  <span style="font-size: 1.15rem;">${s.icon}</span>
                  <span style="font-size: 0.8rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.name}</span>
                </div>
              `).join('')}
            </div>

            <!-- Tarjeta de Calibración Pedagógica en vivo -->
            <div id="feynman-subject-desc-box" style="padding: 12px 16px; background: rgba(56,189,248,0.05); border: 1px solid rgba(56,189,248,0.2); border-radius: 12px; display: flex; align-items: flex-start; gap: 10px;">
              <span style="font-size: 1.2rem; color: #38bdf8;">🧠</span>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <span id="feynman-subject-badge" style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.04em;">
                  ${initialSubjectProfile.name}
                </span>
                <p id="feynman-subject-math-rule-text" style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.45; margin: 0;">
                  ${initialSubjectProfile.mathRule}
                </p>
              </div>
            </div>
          </div>

          <!-- 3. PREGUNTA 1: NIVEL ACTUAL (MEDIDOR VISUAL DE MAESTRÍA 1 A 5) -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <label style="font-size: 0.94rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;">
                  <span>Pregunta 1: ¿Cuál es tu punto de partida actual?</span>
                  <span style="color: #38bdf8;">*</span>
                </label>
                <p style="font-size: 0.75rem; color: #94a3b8; margin: 2px 0 0 0;">
                  Determina la profundidad axiomática inicial desde donde la IA construirá los primeros principios.
                </p>
              </div>
              <span id="feynman-current-level-badge" style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; background: rgba(56,189,248,0.12); padding: 3px 10px; border-radius: 999px;">
                Nivel 1: Principiante
              </span>
            </div>

            <!-- Botones de niveles 1 a 5 con gradientes -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px;" id="feynman-current-level-selector">
              ${FEYNMAN_CURRENT_LEVELS.map(
                (lvl) => `
                <div 
                  class="feynman-level-box ${lvl.level === 1 ? 'active' : ''}" 
                  data-level="${lvl.level}"
                >
                  <span style="font-size: 1.15rem; font-weight: 900; color: ${lvl.level === 1 ? '#38bdf8' : '#fff'};">Nivel ${lvl.level}</span>
                  <span style="font-size: 0.74rem; font-weight: 700; color: #94a3b8;">${lvl.badge}</span>
                  <div style="width: 24px; height: 3px; border-radius: 999px; background: ${lvl.level === 1 ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; margin-top: 2px;"></div>
                </div>
              `
              ).join('')}
            </div>
            
            <div id="feynman-level-desc-box" style="padding: 10px 14px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; font-size: 0.8rem; color: #94a3b8;">
              ${FEYNMAN_CURRENT_LEVELS[0].description}
            </div>

            <!-- Condicional Nivel >= 2: Conocimientos previos -->
            <div id="feynman-conditional-prev-knowledge-wrap" class="hidden" style="display: flex; flex-direction: column; gap: 6px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
              <label for="feynman-input-prev-knowledge" style="font-size: 0.84rem; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
                <span>✨ ¿Qué conceptos, libros o bases ya tienes aprendidos? (opcional)</span>
              </label>
              <textarea 
                id="feynman-input-prev-knowledge" 
                style="width: 100%; box-sizing: border-box; min-height: 65px; font-size: 0.84rem; padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(56,189,248,0.25); background: rgba(0,0,0,0.4); color: #fff; outline: none;"
                placeholder="Ej. Ya domino cálculo integral y leyes de Newton básicas, conozco sintaxis de Python..."
              ></textarea>
            </div>
          </div>

          <!-- 4. PREGUNTA 2: NIVEL OBJETIVO (3 TARJETAS DE IMPACTO) -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div>
                <label style="font-size: 0.94rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;">
                  <span>Pregunta 2: ¿Hasta dónde deseas llegar?</span>
                  <span style="color: #38bdf8;">*</span>
                </label>
                <p style="font-size: 0.75rem; color: #94a3b8; margin: 2px 0 0 0;">
                  Define la escala de la ruta de primeros principios y la cantidad de niveles axiomáticos.
                </p>
              </div>
              <span id="feynman-goal-levels-badge" style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; background: rgba(56,189,248,0.12); padding: 4px 12px; border-radius: 999px; border: 1px solid rgba(56,189,248,0.3);">
                🎯 Exactamente 10 Niveles
              </span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;" id="feynman-target-goal-selector">
              ${FEYNMAN_TARGET_GOALS.map(
                (g) => `
                <div 
                  class="feynman-goal-box ${g.goal === 'general' ? 'active' : ''}" 
                  data-goal="${g.goal}"
                  data-levels="${g.levelsCount}"
                >
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-size: 0.96rem; font-weight: 800; color: #fff;">${g.title}</span>
                      <span style="font-size: 0.68rem; font-weight: 800; color: #fff; background: ${g.gradient}; padding: 2px 9px; border-radius: 999px;">${g.badge}</span>
                    </div>
                    <p style="font-size: 0.77rem; color: #94a3b8; line-height: 1.4; margin: 0;">${g.description}</p>
                  </div>

                  <div style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.74rem; font-weight: 800; color: ${g.goal === 'general' ? '#38bdf8' : '#fff'};">
                      ⚡ ${g.levelsCount} Pasos Axiomáticos
                    </span>
                    <span style="font-size: 0.68rem; color: #64748b;">+500L TSX / c/u</span>
                  </div>
                </div>
              `
              ).join('')}
            </div>

            <!-- Condicional Pregunta 2: Enfoque específico si es 15 o 20 niveles -->
            <div id="feynman-conditional-specific-focus-wrap" class="hidden" style="display: flex; flex-direction: column; gap: 6px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
              <label for="feynman-input-specific-focus" id="feynman-label-specific-focus" style="font-size: 0.84rem; font-weight: 700; color: #a855f7; display: flex; align-items: center; gap: 6px;">
                <span>🎯 ¿Específicamente en qué área o aplicación deseas profundizar? (opcional)</span>
              </label>
              <input 
                type="text" 
                id="feynman-input-specific-focus" 
                style="width: 100%; box-sizing: border-box; font-size: 0.88rem; padding: 11px 14px; background: rgba(168,85,247,0.06); border: 1px solid rgba(168,85,247,0.3); border-radius: 12px; color: #fff; outline: none;"
                placeholder="Ej. Enfoque en aplicaciones clínicas, optimización de algoritmos, litigio penal..."
              />
            </div>
          </div>

          <!-- 5. CASILLA CON SWITCH APPLE: ADJUNTAR MATERIAL O APUNTES -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.4rem;">📎</span>
                <div>
                  <span style="font-size: 0.94rem; font-weight: 800; color: #fff; display: block;">Voy a adjuntar apuntes o material de referencia</span>
                  <span style="font-size: 0.76rem; color: #94a3b8;">La IA calibrará su explicación a partir de tus PDFs, libros o apuntes.</span>
                </div>
              </div>

              <label class="feynman-switch">
                <input type="checkbox" id="feynman-checkbox-attach-info" />
                <span class="feynman-slider"></span>
              </label>
            </div>

            <!-- Opciones condicionales del adjunto -->
            <div id="feynman-attach-options-wrap" class="hidden" style="padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 14px;">
              <span style="font-size: 0.82rem; font-weight: 800; color: #38bdf8;">¿Cómo debe comportarse la IA respecto al material adjunto?</span>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;">
                <label class="feynman-glass-card" id="feynman-attach-type-support" style="padding: 14px; border-radius: 14px; border: 1px solid #38bdf8; background: rgba(56,189,248,0.1); cursor: pointer; display: flex; gap: 10px; align-items: flex-start;">
                  <input type="radio" name="feynman_attach_type" value="support" checked style="margin-top: 3px; accent-color: #38bdf8;" />
                  <div>
                    <div style="font-size: 0.86rem; font-weight: 800; color: #fff;">ℹ️ Información de apoyo / complementaria</div>
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 4px; line-height: 1.4;">
                      El material aporta contexto y casos de uso. La IA complementa con su amplio conocimiento axiomático.
                    </div>
                  </div>
                </label>

                <label class="feynman-glass-card" id="feynman-attach-type-total" style="padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); cursor: pointer; display: flex; gap: 10px; align-items: flex-start;">
                  <input type="radio" name="feynman_attach_type" value="total_basis" style="margin-top: 3px; accent-color: #38bdf8;" />
                  <div>
                    <div style="font-size: 0.86rem; font-weight: 800; color: #fff;">🎯 Base total de la explicación</div>
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 4px; line-height: 1.4;">
                      Toda la ruta y axiomas deben provenir estrictamente del documento proporcionado, sin salirse del temario.
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label for="feynman-input-attach-content" style="font-size: 0.8rem; font-weight: 700; color: #cbd5e1; display: block; margin-bottom: 6px;">
                  Pega el texto del documento aquí (opcional, o adjúntalo como archivo en tu conversación con la IA):
                </label>
                <textarea 
                  id="feynman-input-attach-content" 
                  style="width: 100%; box-sizing: border-box; min-height: 80px; font-size: 0.82rem; padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(56,189,248,0.25); background: rgba(0,0,0,0.4); color: #fff; outline: none;"
                  placeholder="Pega aquí el contenido, extractos o apuntes si deseas incrustarlos directamente en el prompt..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- FOOTER DE ACCIONES DEL STAGE 1 -->
          <div style="padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <button type="button" class="figma-btn-ghost" id="btn-switch-to-direct-paste" style="padding: 10px 16px; font-size: 0.84rem; font-weight: 700; color: #38bdf8; border-radius: 12px;">
              📥 Ya tengo mi Markdown (Pegar directamente)
            </button>

            <button type="button" class="figma-btn-blue-pill" id="btn-generate-feynman-prompt-stage" style="padding: 14px 28px; font-weight: 900; font-size: 0.96rem; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 25px rgba(56,189,248,0.4); animation: feynmanPulse 3s infinite ease-in-out;">
              <span>⚡ Generar Prompt Maestro para mi IA →</span>
            </button>
          </div>

        </div>

        <!-- STAGE 2: PROMPT MAESTRO & IMPORTADOR INTELIGENTE -->
        <div id="feynman-stage-prompt-import" class="${currentStage === 'prompt_and_import' ? '' : 'hidden'}" style="padding: 24px; display: flex; flex-direction: column; gap: 22px;">
          
          <!-- BANNER DE FLUJO PASO A PASO -->
          <div style="background: linear-gradient(135deg, rgba(56,189,248,0.12), rgba(168,85,247,0.12)); border: 1px solid rgba(56,189,248,0.35); border-radius: 18px; padding: 18px 22px; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.35rem;">🚀</span>
                <h4 style="font-size: 1.05rem; font-weight: 800; color: #fff; margin: 0;">Paso 1: Copia el Prompt Maestro y pásalo a tu IA</h4>
              </div>
              <span style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); padding: 3px 10px; border-radius: 999px;">
                +400 a 500 Líneas TSX / Nivel
              </span>
            </div>
            
            <p style="font-size: 0.82rem; color: #e2e8f0; line-height: 1.5; margin: 0;">
              Copia el prompt calibrado con 1 click y envíalo a tu LLM de preferencia. La IA te devolverá un archivo Markdown estructurado con niveles sinérgicos y simuladores interactivos React 18 + TSX.
            </p>

            <!-- Lanzadores rápidos de IAs populares -->
            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 4px;">
              <span style="font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Abrir tu IA:</span>
              <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" class="feynman-ai-launcher-btn" style="background: #10a37f;">
                <span>🟢 ChatGPT</span>
              </a>
              <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" class="feynman-ai-launcher-btn" style="background: #d97706;">
                <span>🟠 Claude</span>
              </a>
              <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" class="feynman-ai-launcher-btn" style="background: #2563eb;">
                <span>🔵 Gemini</span>
              </a>
              <a href="https://chat.deepseek.com" target="_blank" rel="noopener noreferrer" class="feynman-ai-launcher-btn" style="background: #4f46e5;">
                <span>🟣 DeepSeek</span>
              </a>
            </div>
          </div>

          <!-- SUITE DE COPIA DEL PROMPT MAESTRO -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
              <div>
                <span style="font-size: 0.9rem; font-weight: 800; color: #fff;">Prompt Maestro Calibrado</span>
                <span id="feynman-prompt-length-tag" style="font-size: 0.72rem; color: #94a3b8; margin-left: 8px;">(Listo para enviar)</span>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                <button type="button" class="figma-btn-ghost" id="btn-toggle-prompt-preview" style="font-size: 0.78rem; font-weight: 700; color: #94a3b8; padding: 6px 12px; border-radius: 8px;">
                  <span>👁️ Ver texto del prompt</span>
                </button>

                <button type="button" class="figma-btn-blue-pill" id="btn-copy-feynman-master-prompt" style="padding: 9px 18px; font-size: 0.86rem; font-weight: 800; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 18px rgba(56,189,248,0.3);">
                  <span>📋 COPIAR PROMPT MAESTRO</span>
                </button>
              </div>
            </div>

            <!-- Preview colapsable del texto para no saturar la pantalla -->
            <div id="feynman-prompt-preview-container" class="hidden">
              <textarea 
                id="feynman-prompt-preview-box" 
                readonly 
                style="width: 100%; box-sizing: border-box; min-height: 160px; font-family: monospace; font-size: 0.78rem; line-height: 1.45; background: rgba(0,0,0,0.6); border: 1px solid rgba(56,189,248,0.25); border-radius: 12px; color: #93c5fd; padding: 12px 14px;"
              >${escapeHtml(generatedPromptText)}</textarea>
            </div>
          </div>

          <!-- PASO 2: DROPZONE & ANALIZADOR EN VIVO DEL MARKDOWN DEVUELTO -->
          <div class="feynman-dropzone" id="feynman-dropzone-md">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.3rem;">📥</span>
                <div>
                  <h4 style="font-size: 0.98rem; font-weight: 800; color: #fff; margin: 0;">Paso 2: Trae el Markdown devuelto por tu IA</h4>
                  <span style="font-size: 0.74rem; color: #94a3b8;">Pega el contenido o arrastra directamente tu archivo .md</span>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                <button type="button" class="figma-btn-ghost" id="btn-paste-clipboard-md" style="font-size: 0.78rem; font-weight: 700; color: #38bdf8; background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.25); border-radius: 8px; padding: 6px 12px;">
                  📋 Pegar de Portapapeles
                </button>

                <input type="file" id="feynman-file-md-upload" accept=".md,.markdown,.txt" style="display: none;" />
                <button type="button" class="figma-btn-ghost" id="btn-trigger-file-upload" style="font-size: 0.78rem; font-weight: 700; color: #fff; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 6px 12px;">
                  📁 Subir archivo .md
                </button>
              </div>
            </div>

            <textarea 
              id="feynman-input-pasted-markdown" 
              style="width: 100%; box-sizing: border-box; min-height: 150px; font-size: 0.84rem; font-family: monospace; border-radius: 12px; border: 1px solid rgba(56,189,248,0.25); background: rgba(0,0,0,0.55); color: #fff; padding: 12px 14px; outline: none; transition: border-color 0.2s;"
              placeholder="Pega aquí el archivo Markdown (.md) que te entregó la IA (debe comenzar con '# Nivel 1:' e incluir los componentes TypeScript)..."
            ></textarea>

            <!-- ANALIZADOR EN TIEMPO REAL DEL CONTENIDO -->
            <div id="feynman-live-analyzer-bar" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 8px 12px; background: rgba(0,0,0,0.3); border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.75rem;" id="feynman-analyzer-chips-wrap">
                <span style="color: #94a3b8;">⏳ Esperando contenido para escanear...</span>
              </div>

              <span id="feynman-analyzer-chars-count" style="font-size: 0.72rem; color: #64748b;">
                0 caracteres
              </span>
            </div>

            <!-- FOOTER DE ACCIONES DEL STAGE 2 -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; flex-wrap: wrap; gap: 10px;">
              <button type="button" class="figma-btn-ghost" id="btn-back-to-questionnaire" style="font-size: 0.82rem; font-weight: 700; padding: 10px 16px; border-radius: 10px; color: #94a3b8;">
                ← Modificar Parámetros
              </button>

              <button type="button" class="figma-btn-blue-pill" id="btn-deploy-markdown-roadmap" style="padding: 13px 26px; font-size: 0.94rem; font-weight: 900; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 22px rgba(56,189,248,0.35);">
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
  const tabConfigure = document.getElementById('tab-step-configure');
  const tabPrompt = document.getElementById('tab-step-prompt');
  const liveSummaryBadge = document.getElementById('feynman-live-summary-badge');
  const topicInput = document.getElementById('feynman-input-topic') as HTMLInputElement | null;
  const subjectSelect = document.getElementById('feynman-select-subject') as HTMLSelectElement | null;
  const subjectBadge = document.getElementById('feynman-subject-badge');
  const subjectMathRuleText = document.getElementById('feynman-subject-math-rule-text');
  const prevKnowledgeWrap = document.getElementById('feynman-conditional-prev-knowledge-wrap');
  const prevKnowledgeInput = document.getElementById('feynman-input-prev-knowledge') as HTMLTextAreaElement | null;
  const currentLevelBadge = document.getElementById('feynman-current-level-badge');
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
  const promptPreviewContainer = document.getElementById('feynman-prompt-preview-container');
  const promptPreviewBox = document.getElementById('feynman-prompt-preview-box') as HTMLTextAreaElement | null;
  const promptLengthTag = document.getElementById('feynman-prompt-length-tag');
  const pastedMarkdownInput = document.getElementById('feynman-input-pasted-markdown') as HTMLTextAreaElement | null;
  const fileUploadInput = document.getElementById('feynman-file-md-upload') as HTMLInputElement | null;
  const dropzoneMd = document.getElementById('feynman-dropzone-md');
  const analyzerChipsWrap = document.getElementById('feynman-analyzer-chips-wrap');
  const analyzerCharsCount = document.getElementById('feynman-analyzer-chars-count');

  // Actualizar resumen en vivo del header
  const updateLiveSummary = () => {
    if (!liveSummaryBadge) return;
    const goalObj = FEYNMAN_TARGET_GOALS.find((g) => g.goal === selectedGoal);
    const levelsCount = goalObj ? goalObj.levelsCount : 10;
    const subjObj = POPULAR_SUBJECTS.find((s) => s.id === selectedSubject);
    const icon = subjObj?.icon || '📚';
    const subjName = subjObj?.name || 'General';
    liveSummaryBadge.innerHTML = `🎯 ${levelsCount} Niveles • ${icon} ${subjName} • +500L TSX • Step-by-Step`;
  };

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

  // Selector de Materia: Sincronizar Grid de Tarjetas y Dropdown
  const applySubjectSelection = (subjId: string) => {
    selectedSubject = subjId;
    if (subjectSelect) subjectSelect.value = subjId;

    modalRoot?.querySelectorAll<HTMLElement>('.feynman-subject-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.subject === subjId);
    });

    const profile = feynmanPedagogyService.getSubjectPedagogicalProfile(selectedSubject);
    if (subjectBadge) subjectBadge.textContent = profile.name;
    if (subjectMathRuleText) subjectMathRuleText.textContent = profile.mathRule;
    updateLiveSummary();
  };

  subjectSelect?.addEventListener('change', () => {
    if (subjectSelect) applySubjectSelection(subjectSelect.value);
  });

  modalRoot?.querySelectorAll<HTMLElement>('.feynman-subject-card').forEach((card) => {
    card.addEventListener('click', () => {
      const s = card.dataset.subject;
      if (s) {
        nativeService.triggerHaptics('light');
        applySubjectSelection(s);
      }
    });
  });

  // Chips temáticos rápidos
  modalRoot?.querySelectorAll<HTMLButtonElement>('.feynman-topic-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const t = chip.dataset.topic;
      const s = chip.dataset.subject;
      if (t && topicInput) {
        topicInput.value = t;
        currentTopic = t;
        updateFocusLabel();
      }
      if (s) {
        applySubjectSelection(s);
      }
      nativeService.triggerHaptics('light');
      topicInput?.focus();
    });
  });

  // Switch de Adjuntar Información
  attachCheckbox?.addEventListener('change', () => {
    hasAttachedInfo = attachCheckbox.checked;
    nativeService.triggerHaptics('light');
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
          attachSupportCard.style.borderColor = '#38bdf8';
          attachSupportCard.style.background = 'rgba(56,189,248,0.1)';
        }
        if (attachTotalCard) {
          attachTotalCard.style.borderColor = 'rgba(255,255,255,0.08)';
          attachTotalCard.style.background = 'rgba(255,255,255,0.02)';
        }
      } else {
        if (attachTotalCard) {
          attachTotalCard.style.borderColor = '#38bdf8';
          attachTotalCard.style.background = 'rgba(56,189,248,0.1)';
        }
        if (attachSupportCard) {
          attachSupportCard.style.borderColor = 'rgba(255,255,255,0.08)';
          attachSupportCard.style.background = 'rgba(255,255,255,0.02)';
        }
      }
    });
  });

  // Selector de Nivel Actual (1 a 5)
  const levelBoxes = modalRoot?.querySelectorAll<HTMLElement>('.feynman-level-box');
  levelBoxes?.forEach((box) => {
    box.addEventListener('click', () => {
      const lvl = parseInt(box.dataset.level || '1', 10) as FeynmanCurrentLevel;
      selectedLevel = lvl;
      nativeService.triggerHaptics('light');

      levelBoxes.forEach((b) => {
        b.classList.toggle('active', parseInt(b.dataset.level || '1', 10) === lvl);
        const lvlNum = b.querySelector('span:first-child') as HTMLElement | null;
        if (lvlNum) lvlNum.style.color = parseInt(b.dataset.level || '1', 10) === lvl ? '#38bdf8' : '#fff';
      });

      const opt = FEYNMAN_CURRENT_LEVELS.find((o) => o.level === lvl);
      if (levelDescBox && opt) {
        levelDescBox.textContent = opt.description;
      }
      if (currentLevelBadge && opt) {
        currentLevelBadge.textContent = `Nivel ${lvl}: ${opt.badge}`;
      }

      if (lvl >= 2) {
        prevKnowledgeWrap?.classList.remove('hidden');
      } else {
        prevKnowledgeWrap?.classList.add('hidden');
        if (prevKnowledgeInput) prevKnowledgeInput.value = '';
      }
    });
  });

  // Selector de Nivel Objetivo (10, 15, 20 niveles)
  const goalBoxes = modalRoot?.querySelectorAll<HTMLElement>('.feynman-goal-box');
  goalBoxes?.forEach((box) => {
    box.addEventListener('click', () => {
      const goal = (box.dataset.goal || 'general') as FeynmanTargetGoal;
      selectedGoal = goal;
      nativeService.triggerHaptics('light');

      goalBoxes.forEach((b) => {
        b.classList.toggle('active', b.dataset.goal === goal);
      });

      const opt = FEYNMAN_TARGET_GOALS.find((g) => g.goal === goal);
      if (goalBadge && opt) {
        goalBadge.textContent = `🎯 Exactamente ${opt.levelsCount} Niveles`;
      }
      updateLiveSummary();

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

  // Generar prompt maestro y cambiar a Stage 2
  const buildAndShowPromptStage = () => {
    const topic = topicInput?.value.trim();
    if (!topic) {
      topicInput?.focus();
      topicInput?.style.setProperty('border-color', '#ef4444', 'important');
      setTimeout(() => topicInput?.style.removeProperty('border-color'), 2000);
      showDiagnosticToast('⚠️ Ingresa el tema que deseas aprender');
      return;
    }

    const form = getCurrentFormData();
    generatedPromptText = feynmanPedagogyService.buildFullExportablePrompt(form);
    if (promptPreviewBox) {
      promptPreviewBox.value = generatedPromptText;
    }
    if (promptLengthTag) {
      promptLengthTag.textContent = `(${generatedPromptText.length.toLocaleString()} caracteres)`;
    }

    stageQuestionnaire?.classList.add('hidden');
    stagePromptImport?.classList.remove('hidden');
    tabConfigure?.classList.remove('active');
    tabPrompt?.classList.add('active');
    currentStage = 'prompt_and_import';
    nativeService.triggerHaptics('medium');
  };

  modalRoot?.querySelector('#btn-generate-feynman-prompt-stage')?.addEventListener('click', buildAndShowPromptStage);

  // Botón modo rápido en cabecera
  modalRoot?.querySelector('#btn-quick-import-mode')?.addEventListener('click', () => {
    stageQuestionnaire?.classList.add('hidden');
    stagePromptImport?.classList.remove('hidden');
    tabConfigure?.classList.remove('active');
    tabPrompt?.classList.add('active');
    currentStage = 'prompt_and_import';
    pastedMarkdownInput?.focus();
  });

  // Botón directo desde Stage 1
  modalRoot?.querySelector('#btn-switch-to-direct-paste')?.addEventListener('click', () => {
    stageQuestionnaire?.classList.add('hidden');
    stagePromptImport?.classList.remove('hidden');
    tabConfigure?.classList.remove('active');
    tabPrompt?.classList.add('active');
    currentStage = 'prompt_and_import';
    pastedMarkdownInput?.focus();
  });

  // Volver a configurar
  modalRoot?.querySelector('#btn-back-to-questionnaire')?.addEventListener('click', () => {
    stagePromptImport?.classList.add('hidden');
    stageQuestionnaire?.classList.remove('hidden');
    tabPrompt?.classList.remove('active');
    tabConfigure?.classList.add('active');
    currentStage = 'questionnaire';
    nativeService.triggerHaptics('light');
  });

  // Navegación por tabs en el stepper
  tabConfigure?.addEventListener('click', () => {
    stagePromptImport?.classList.add('hidden');
    stageQuestionnaire?.classList.remove('hidden');
    tabPrompt?.classList.remove('active');
    tabConfigure?.classList.add('active');
    currentStage = 'questionnaire';
  });

  tabPrompt?.addEventListener('click', () => {
    buildAndShowPromptStage();
  });

  // Toggle de preview de texto del prompt
  modalRoot?.querySelector('#btn-toggle-prompt-preview')?.addEventListener('click', () => {
    isPromptPreviewExpanded = !isPromptPreviewExpanded;
    if (isPromptPreviewExpanded) {
      promptPreviewContainer?.classList.remove('hidden');
      const toggleBtn = modalRoot?.querySelector('#btn-toggle-prompt-preview');
      if (toggleBtn) toggleBtn.innerHTML = '<span>🔼 Ocultar texto del prompt</span>';
    } else {
      promptPreviewContainer?.classList.add('hidden');
      const toggleBtn = modalRoot?.querySelector('#btn-toggle-prompt-preview');
      if (toggleBtn) toggleBtn.innerHTML = '<span>👁️ Ver texto del prompt</span>';
    }
  });

  // Copiar Prompt Maestro con feedback visual destacado
  modalRoot?.querySelector('#btn-copy-feynman-master-prompt')?.addEventListener('click', () => {
    const form = getCurrentFormData();
    generatedPromptText = feynmanPedagogyService.buildFullExportablePrompt(form);
    if (promptPreviewBox) {
      promptPreviewBox.value = generatedPromptText;
    }

    navigator.clipboard.writeText(generatedPromptText);
    nativeService.triggerHaptics('heavy');
    
    const copyBtn = modalRoot?.querySelector('#btn-copy-feynman-master-prompt');
    if (copyBtn) {
      copyBtn.innerHTML = '<span>✅ ¡PROMPT COPIADO AL PORTAPAPELES!</span>';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        if (copyBtn) {
          copyBtn.innerHTML = '<span>📋 COPIAR PROMPT MAESTRO</span>';
          copyBtn.classList.remove('copied');
        }
      }, 3000);
    }
    showDiagnosticToast(`📋 ¡Prompt para "${form.topic}" copiado! Pégalo en ChatGPT / Claude`);
  });

  // Scanner en vivo para el analizador de Markdown
  const runLiveMarkdownScanner = (text: string) => {
    if (!analyzerChipsWrap || !analyzerCharsCount) return;
    const trimmed = text.trim();
    analyzerCharsCount.textContent = `${trimmed.length.toLocaleString()} caracteres`;

    if (!trimmed) {
      analyzerChipsWrap.innerHTML = `<span style="color: #94a3b8;">⏳ Esperando contenido para escanear...</span>`;
      return;
    }

    // Contar niveles
    const levelMatches = Array.from(trimmed.matchAll(/(?:^|\n)#+\s*(?:Nivel|Paso|Level)\s*\[?(\d+)\]?/gi));
    const uniqueLevels = new Set(levelMatches.map((m) => m[1])).size;

    // Contar bloques de código interactivo TSX
    const codeBlocksCount = (trimmed.match(/```(?:tsx|ts|typescript|jsx|javascript|js|react)/gi) || []).length;

    // Detectar examen final
    const hasFinalExam = /(?:^|\n)#+\s*Examen\s*Final/i.test(trimmed);

    let html = '';
    if (uniqueLevels > 0) {
      html += `<span style="background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); font-weight: 800; padding: 2px 8px; border-radius: 6px;">✅ ${uniqueLevels} Niveles detectados</span>`;
    } else {
      html += `<span style="background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); font-weight: 700; padding: 2px 8px; border-radius: 6px;">⚠️ Buscando '# Nivel 1:'...</span>`;
    }

    if (codeBlocksCount > 0) {
      html += `<span style="background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); font-weight: 800; padding: 2px 8px; border-radius: 6px;">⚡ ${codeBlocksCount} Simuladores TSX</span>`;
    }

    if (hasFinalExam) {
      html += `<span style="background: rgba(168,85,247,0.15); color: #c084fc; border: 1px solid rgba(168,85,247,0.3); font-weight: 800; padding: 2px 8px; border-radius: 6px;">🎓 Examen Final</span>`;
    }

    analyzerChipsWrap.innerHTML = html;
  };

  pastedMarkdownInput?.addEventListener('input', () => {
    runLiveMarkdownScanner(pastedMarkdownInput.value);
  });

  // Pegar del portapapeles con 1 click
  modalRoot?.querySelector('#btn-paste-clipboard-md')?.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && pastedMarkdownInput) {
        pastedMarkdownInput.value = text;
        runLiveMarkdownScanner(text);
        nativeService.triggerHaptics('medium');
        showDiagnosticToast('📋 Contenido pegado del portapapeles');
      } else {
        showDiagnosticToast('⚠️ El portapapeles está vacío');
      }
    } catch {
      showDiagnosticToast('⚠️ Permiso de portapapeles denegado. Usa Ctrl+V / Cmd+V');
    }
  });

  // Drag & drop en la zona de markdown
  dropzoneMd?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzoneMd.classList.add('drag-over');
  });

  dropzoneMd?.addEventListener('dragleave', () => {
    dropzoneMd.classList.remove('drag-over');
  });

  dropzoneMd?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzoneMd.classList.remove('drag-over');
    const file = e.dataTransfer?.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (pastedMarkdownInput && text) {
          pastedMarkdownInput.value = text;
          runLiveMarkdownScanner(text);
          showDiagnosticToast(`📁 Archivo "${file.name}" cargado`);
        }
      };
      reader.readAsText(file);
    }
  });

  // Subir archivo Markdown (.md) tradicional
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
          runLiveMarkdownScanner(text);
          showDiagnosticToast(`📁 Archivo "${file.name}" cargado`);
        }
      };
      reader.readAsText(file);
    }
  });

  // Desplegar Roadmap a partir del Markdown
  modalRoot?.querySelector('#btn-deploy-markdown-roadmap')?.addEventListener('click', () => {
    if (isSubmitting) return;
    const markdown = pastedMarkdownInput?.value.trim();
    if (!markdown) {
      pastedMarkdownInput?.focus();
      pastedMarkdownInput?.style.setProperty('border-color', '#ef4444', 'important');
      setTimeout(() => pastedMarkdownInput?.style.removeProperty('border-color'), 2000);
      showDiagnosticToast('⚠️ Pega primero el Markdown generado por tu IA');
      return;
    }

    isSubmitting = true;
    const deployBtn = modalRoot?.querySelector('#btn-deploy-markdown-roadmap') as HTMLButtonElement | null;
    if (deployBtn) {
      deployBtn.disabled = true;
      deployBtn.innerHTML = '<span>⏳ Desplegando Roadmap y Simuladores...</span>';
    }

    try {
      const form = getCurrentFormData();
      const guide = feynmanLlmService.importMarkdownGuide(markdown, form.topic ? form : undefined);
      nativeService.triggerHaptics('heavy');
      modalRoot?.remove();
      options.onGenerated(guide);
    } catch (err: any) {
      isSubmitting = false;
      if (deployBtn) {
        deployBtn.disabled = false;
        deployBtn.innerHTML = '<span>🚀 Desplegar Roadmap y Simuladores en Vivo</span>';
      }
      console.error('[FeynmanDiagnosticModal] Error al importar Markdown:', err);
      dialogService.showAlert({
        title: '⚠️ Formato Markdown no reconocido',
        message: err.message || 'No se pudieron extraer los niveles. Asegúrate de que el texto contenga encabezados tipo "# Nivel 1: [Título]".'
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
  toast.style.cssText = 'position:fixed; bottom:30px; left:50%; transform:translateX(-50%); z-index:12000; background:rgba(14,15,20,0.94); border:1px solid #38bdf8; color:#fff; padding:10px 22px; border-radius:999px; font-weight:800; font-size:0.86rem; box-shadow:0 12px 30px rgba(0,0,0,0.6); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); animation: feynmanFadeIn 0.2s ease-out;';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
