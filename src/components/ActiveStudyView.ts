import type { Flashcard } from '../types/flashcard';
import type { OutlineNode, ActiveStudyTopic, StudyChunk } from '../types/active-study';
import { activeStudyService, UNLOCK_COST } from '../services/active-study.service';
import { deckService } from '../services/deck.service';
import { katexService } from '../services/katex.service';
import { dialogService } from '../services/dialog.service';
import { openScientificFormulaAssistant } from './ScientificFormulaAssistant';
import { nativeService } from '../services/native.service';
import Sortable from 'sortablejs';

let activeStudyingTopicId: string | null = null;

/**
 * Renderiza el Dashboard Principal e Independiente de Estudio Activo
 */
export const POPULAR_SUBJECTS = [
  { id: 'matematicas', name: 'Matemáticas', icon: '📐', gradient: 'linear-gradient(135deg, #1e3a8a, #0284c7)', color: '#38bdf8', badgeBg: 'rgba(56,189,248,0.15)', borderColor: 'rgba(56,189,248,0.3)' },
  { id: 'fisica', name: 'Física', icon: '⚡', gradient: 'linear-gradient(135deg, #4c1d95, #9333ea)', color: '#c084fc', badgeBg: 'rgba(192,132,252,0.15)', borderColor: 'rgba(192,132,252,0.3)' },
  { id: 'quimica', name: 'Química', icon: '🧪', gradient: 'linear-gradient(135deg, #064e3b, #10b981)', color: '#34d399', badgeBg: 'rgba(52,211,153,0.15)', borderColor: 'rgba(52,211,153,0.3)' },
  { id: 'biologia', name: 'Biología', icon: '🧬', gradient: 'linear-gradient(135deg, #065f46, #059669)', color: '#10b981', badgeBg: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)' },
  { id: 'medicina', name: 'Medicina & Anatomía', icon: '🩺', gradient: 'linear-gradient(135deg, #831843, #e11d48)', color: '#f43f5e', badgeBg: 'rgba(244,63,94,0.15)', borderColor: 'rgba(244,63,94,0.3)' },
  { id: 'historia', name: 'Historia', icon: '🏛️', gradient: 'linear-gradient(135deg, #78350f, #d97706)', color: '#fbbf24', badgeBg: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.3)' },
  { id: 'geografia', name: 'Geografía', icon: '🌍', gradient: 'linear-gradient(135deg, #0e7490, #06b6d4)', color: '#22d3ee', badgeBg: 'rgba(34,211,238,0.15)', borderColor: 'rgba(34,211,238,0.3)' },
  { id: 'filosofia', name: 'Filosofía', icon: '💡', gradient: 'linear-gradient(135deg, #374151, #6b7280)', color: '#e5e7eb', badgeBg: 'rgba(229,231,235,0.15)', borderColor: 'rgba(229,231,235,0.3)' },
  { id: 'literatura', name: 'Literatura & Lengua', icon: '📚', gradient: 'linear-gradient(135deg, #701a75, #c026d3)', color: '#f0abfc', badgeBg: 'rgba(240,171,252,0.15)', borderColor: 'rgba(240,171,252,0.3)' },
  { id: 'idiomas', name: 'Idiomas', icon: '🗣️', gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#60a5fa', badgeBg: 'rgba(96,165,250,0.15)', borderColor: 'rgba(96,165,250,0.3)' },
  { id: 'informatica', name: 'Informática & Programación', icon: '💻', gradient: 'linear-gradient(135deg, #0f172a, #0369a1)', color: '#38bdf8', badgeBg: 'rgba(56,189,248,0.15)', borderColor: 'rgba(56,189,248,0.3)' },
  { id: 'derecho', name: 'Derecho & Leyes', icon: '⚖️', gradient: 'linear-gradient(135deg, #1c1917, #78716c)', color: '#d6d3d1', badgeBg: 'rgba(214,211,209,0.15)', borderColor: 'rgba(214,211,209,0.3)' },
  { id: 'economia', name: 'Economía & Finanzas', icon: '📈', gradient: 'linear-gradient(135deg, #14532d, #16a34a)', color: '#4ade80', badgeBg: 'rgba(74,222,128,0.15)', borderColor: 'rgba(74,222,128,0.3)' },
  { id: 'psicologia', name: 'Psicología', icon: '🧠', gradient: 'linear-gradient(135deg, #581c87, #a855f7)', color: '#c084fc', badgeBg: 'rgba(192,132,252,0.15)', borderColor: 'rgba(192,132,252,0.3)' },
  { id: 'arte', name: 'Arte & Diseño', icon: '🎨', gradient: 'linear-gradient(135deg, #9d174d, #ec4899)', color: '#f472b6', badgeBg: 'rgba(244,114,182,0.15)', borderColor: 'rgba(244,114,182,0.3)' },
  { id: 'musica', name: 'Música', icon: '🎵', gradient: 'linear-gradient(135deg, #3b0764, #7e22ce)', color: '#d8b4fe', badgeBg: 'rgba(216,180,254,0.15)', borderColor: 'rgba(216,180,254,0.3)' },
  { id: 'ciencias_sociales', name: 'Ciencias Sociales', icon: '👥', gradient: 'linear-gradient(135deg, #1e293b, #475569)', color: '#94a3b8', badgeBg: 'rgba(148,163,184,0.15)', borderColor: 'rgba(148,163,184,0.3)' },
  { id: 'ingenieria', name: 'Ingeniería', icon: '⚙️', gradient: 'linear-gradient(135deg, #312e81, #4f46e5)', color: '#818cf8', badgeBg: 'rgba(129,140,248,0.15)', borderColor: 'rgba(129,140,248,0.3)' },
  { id: 'politica', name: 'Ciencias Políticas', icon: '🗳️', gradient: 'linear-gradient(135deg, #881337, #be123c)', color: '#fb7185', badgeBg: 'rgba(251,113,133,0.15)', borderColor: 'rgba(251,113,133,0.3)' },
  { id: 'general', name: 'General / Otra', icon: '📝', gradient: 'linear-gradient(135deg, #1e1e2f, #334155)', color: '#cbd5e1', badgeBg: 'rgba(203,213,225,0.15)', borderColor: 'rgba(203,213,225,0.3)' }
];

export function getSubjectInfo(subjectName?: string) {
  if (!subjectName) return POPULAR_SUBJECTS[POPULAR_SUBJECTS.length - 1];
  const found = POPULAR_SUBJECTS.find(
    (s) => s.name.toLowerCase() === subjectName.toLowerCase() || s.id === subjectName.toLowerCase()
  );
  return found || POPULAR_SUBJECTS[POPULAR_SUBJECTS.length - 1];
}

/**
 * Renderiza la Vista de Cuadernos de Estudio (Ultra Clean)
 */
export function renderActiveStudyDashboard(_selectedTopicId?: string): string {
  const allTopics = activeStudyService.getAllTopics();
  const userCoins = activeStudyService.getUserCoins();

  // Si el usuario está activamente en modo estudio de un cuaderno:
  if (activeStudyingTopicId) {
    const studyingTopic = allTopics.find((t) => t.id === activeStudyingTopicId) || allTopics[0];
    if (studyingTopic) {
      return renderSelectedTopicWorkspace(studyingTopic, userCoins);
    }
  }

  // Lista de materias presentes para las píldoras de filtro
  const activeSubjectNames = Array.from(new Set(allTopics.map((t) => t.subject || 'General'))).filter(Boolean);
  const activeSubjects = activeSubjectNames.map((name) => getSubjectInfo(name));

  return `
    <div class="notebooks-view-container">
      <!-- CABECERA ULTRA CLEAN DE CUADERNOS -->
      <div class="notebooks-view-header apple-glass-panel">
        <div class="notebooks-header-left">
          <div class="notebooks-header-badge">
            <span>📓 ZONA DE ESTUDIO</span>
          </div>
          <h1 class="notebooks-header-title">Mis Cuadernos de Estudio</h1>
          <p class="notebooks-header-subtitle">
            Crea cuadernos para tus materias, organízalos con mapas mentales interactivos y aprende con lectura atómica y repaso espaciado.
          </p>
        </div>
        <div class="notebooks-header-actions">
          <button class="figma-btn-study-large" id="btn-create-study-topic" style="padding:12px 24px; font-size:0.92rem; display:inline-flex; align-items:center; gap:8px; width:auto;">
            <span>✨</span>
            <span>+ Nuevo Cuaderno</span>
          </button>
        </div>
      </div>

      <!-- BARRA DE BÚSQUEDA Y FILTRO RÁPIDO DE CUADERNOS -->
      <div class="notebooks-search-bar-wrap apple-glass-panel">
        <div class="notebooks-search-input-box">
          <span class="notebooks-search-icon">🔍</span>
          <input 
            type="text" 
            id="input-search-notebooks" 
            placeholder="Buscar cuaderno por título o materia..." 
            class="notebooks-search-input"
          />
        </div>
        ${
          activeSubjects.length > 0
            ? `
          <div class="notebooks-subject-pills-row" id="notebooks-filter-pills">
            <button class="notebook-subject-filter-btn active" data-subject-filter="ALL">Todos (${allTopics.length})</button>
            ${activeSubjects
              .map(
                (subj) => `
              <button class="notebook-subject-filter-btn" data-subject-filter="${escapeAttr(subj.name)}">
                ${subj.icon} ${escapeHtml(subj.name)}
              </button>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      </div>

      <!-- ESTANTERÍA / GRID DE CUADERNOS -->
      ${
        allTopics.length > 0
          ? `
        <div class="notebooks-shelf-grid" id="notebooks-shelf-grid">
          ${allTopics
            .map((topic) => {
              const subjectInfo = getSubjectInfo(topic.subject);
              const linkedDeck = topic.deckId ? deckService.getDeckById(topic.deckId) : null;
              const cardsCount = topic.deckId ? deckService.getCardsByDeck(topic.deckId, false).length : 0;
              const hasCover = Boolean(topic.coverImage);
              const chunksCount = topic.chunks.length;
              const completedChunks = topic.chunks.filter((c) => c.isCompleted).length;

              return `
              <div class="notebook-card apple-glass-panel" data-notebook-id="${topic.id}" data-subject="${escapeAttr(topic.subject || 'General')}">
                <!-- Portada del Cuaderno -->
                <div 
                  class="notebook-card-cover" 
                  style="${
                    hasCover
                      ? `background-image: url('${topic.coverImage}'); background-size: cover; background-position: center;`
                      : `background: ${subjectInfo.gradient};`
                  }"
                >
                  <div class="notebook-cover-spine"></div>
                  <div class="notebook-cover-badge-row">
                    <span class="notebook-cover-subject-tag" style="background:${subjectInfo.badgeBg}; color:${subjectInfo.color}; border: 1px solid ${subjectInfo.borderColor};">
                      ${subjectInfo.icon} ${escapeHtml(subjectInfo.name)}
                    </span>
                    <button class="notebook-delete-btn figma-icon-btn-ghost" data-topic-id="${topic.id}" title="Eliminar cuaderno">
                      🗑️
                    </button>
                  </div>
                  <div class="notebook-cover-content">
                    <h3 class="notebook-cover-title">${escapeHtml(topic.title)}</h3>
                  </div>
                </div>

                <!-- Cuerpo / Detalles del Cuaderno -->
                <div class="notebook-card-body">
                  <p class="notebook-card-desc">
                    ${escapeHtml(topic.description || 'Cuaderno interactivo con mapa mental y flujo de estudio activo.')}
                  </p>

                  <div class="notebook-card-meta">
                    <span class="notebook-card-deck-pill">
                      🎴 ${escapeHtml(linkedDeck ? linkedDeck.name : 'Sin mazo')} · ${cardsCount} tarjetas
                    </span>
                    <span class="notebook-card-chunks-pill">
                      📖 ${completedChunks}/${chunksCount} bloques
                    </span>
                  </div>

                  <!-- Botones de Acción del Cuaderno -->
                  <div class="notebook-card-actions">
                    <button class="figma-btn-white-pill btn-open-topic-mindmap" data-topic-id="${topic.id}" title="Abrir Mapa Mental de este cuaderno">
                      <span>🧠 Mapa Mental</span>
                    </button>
                    <button class="figma-btn-study-large btn-study-notebook" data-topic-id="${topic.id}" style="width:auto; padding:8px 16px; font-size:0.84rem;" title="Comenzar o continuar lectura de estudio">
                      <span>📖 Estudiar ➔</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      `
          : `
        <div class="notebooks-empty-state apple-glass-panel">
          <div style="font-size:3.5rem; margin-bottom:12px;">📓</div>
          <h2 style="color:#fff; font-size:1.4rem; margin:0 0 8px 0;">Tu estantería de cuadernos está vacía</h2>
          <p style="color:var(--f-text-secondary); max-width:480px; margin:0 auto 20px auto; font-size:0.92rem; line-height:1.5;">
            Crea tu primer cuaderno para organizar tus materias con esquemas mentales interactivos, lectura atómica y flashcards activas.
          </p>
          <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
            <button class="figma-btn-study-large" id="btn-empty-create-notebook" style="width:auto; padding:12px 26px;">
              ✨ + Crear Mi Primer Cuaderno
            </button>
            <button class="figma-btn-white-pill" id="btn-load-neuro-demo" style="width:auto; padding:12px 20px;">
              🧪 Cargar Demo Neurociencia
            </button>
            <button class="figma-btn-white-pill" id="btn-load-nuclear-demo" style="width:auto; padding:12px 20px;">
              ⚛️ Cargar Demo Física Nuclear
            </button>
          </div>
        </div>
      `
      }
    </div>
  `;
}

/**
 * Renderiza el espacio de trabajo de un tema seleccionado con sus 3 fases
 */
function renderSelectedTopicWorkspace(topic: ActiveStudyTopic, userCoins: number): string {
  const state = topic.state;
  const currentChunk = topic.chunks[topic.currentChunkIndex] || topic.chunks[0];
  
  // Obtener tarjetas asociadas a este tema
  const cardsTopic = deckService.getCardsByDeck(topic.id, true);
  const cardsDeck = topic.deckId ? deckService.getCardsByDeck(topic.deckId, false) : [];
  const mergedCards = [...cardsTopic, ...cardsDeck].filter((c, idx, self) => self.findIndex((x) => x.id === c.id) === idx);
  const currentChunkCards = currentChunk ? mergedCards.filter((c) => c.chunkId === currentChunk.id) : [];

  const linkedDeck = topic.deckId ? deckService.getDeckById(topic.deckId) : null;
  const deckName = linkedDeck ? linkedDeck.name : 'Baraja sin vincular';

  // Si el usuario está activamente en modo estudio atómico centrado:
  if (activeStudyingTopicId === topic.id) {
    return renderCenteredAtomicReadingScreen(topic, currentChunk, currentChunkCards, deckName);
  }

  return `
    <div class="active-study-topic-workspace" data-topic-id="${topic.id}">
      <!-- Barra Superior de Información del Tema -->
      <div class="active-study-top-bar apple-glass-panel">
        <div class="study-topic-info">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <button class="figma-btn-white-pill btn-back-to-notebooks" style="padding:5px 12px; font-size:0.78rem; gap:4px; border-color:rgba(255,255,255,0.2); cursor:pointer;">
              ← Volver a Cuadernos
            </button>
            <span class="study-topic-chip">CUADERNO</span>
            <button class="atomic-deck-link-chip btn-change-topic-deck" data-topic-id="${topic.id}" title="Toca para cambiar de baraja vinculada" style="border:none; cursor:pointer;">🎴 Baraja: ${escapeAttr(deckName)} ✎</button>
            <span class="study-topic-date">${new Date(topic.createdAt).toLocaleDateString()}</span>
          </div>
          <h3 class="study-topic-title">${escapeHtml(topic.title)}</h3>
        </div>

        <div class="study-top-right-meta">
          <button class="figma-btn-white-pill btn-open-topic-mindmap" data-topic-id="${topic.id}" style="padding:6px 14px; font-size:0.82rem; border-color:rgba(56,189,248,0.4); color:#38bdf8;">
            🧠 Ver Mapa Mental
          </button>
          <button class="figma-icon-btn-ghost" id="btn-study-topic-reset" title="Reiniciar sesión de estudio">
            🔄
          </button>
          <button class="figma-icon-btn-ghost" id="btn-study-topic-delete" title="Eliminar este tema" style="color:#ef4444;">
            🗑️
          </button>
        </div>
      </div>

      <!-- Stepper de Bloques Atómicos -->
      <div class="study-chunks-stepper">
        ${topic.chunks
          .map((chunk, idx) => {
            const isDone = chunk.isCompleted;
            const isCurrent = idx === topic.currentChunkIndex && state !== 'TOPIC_CONSOLIDATED';
            return `
            <div class="stepper-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}">
              <div class="stepper-dot">${isDone ? '✓' : idx + 1}</div>
              <span class="stepper-label">${escapeAttr(chunk.title)}</span>
            </div>
          `;
          })
          .join('')}
        
        <div class="stepper-step ${state === 'TOPIC_CONSOLIDATED' ? 'done current' : ''}">
          <div class="stepper-dot">🔒</div>
          <span class="stepper-label">Consolidación</span>
        </div>
      </div>

      <!-- CONTENIDO SEGÚN LA FASE ACTIVA O CTA DE ESTUDIO -->
      ${
        state === 'TOPIC_CONSOLIDATED'
          ? renderConsolidatedScreen(topic, userCoins, mergedCards)
          : state === 'BUILDING_OUTLINE'
          ? renderOutlineBuildingScreen(topic, currentChunk, currentChunkCards)
          : `
          <div class="study-overview-cta-card apple-glass-panel" style="text-align:center; padding:36px 20px; border:1.5px solid rgba(56,189,248,0.3); border-radius:24px; margin-top:10px;">
            <div style="font-size:3rem; margin-bottom:12px;">🔬</div>
            <h3 style="font-size:1.45rem; font-weight:900; color:#fff; margin:0 0 8px 0;">
              ${escapeAttr(currentChunk.title)}
            </h3>
            <p style="color:var(--f-text-secondary); max-width:540px; margin:0 auto 24px auto; font-size:0.95rem; line-height:1.55;">
              Inicia el ciclo de estudio activo en el centro de tu pantalla. Lee la información átomo, redacta tus flashcards con asistencia KaTeX y continúa de inmediato a tu mapa mental.
            </p>
            <div style="display:flex; justify-content:center; gap:14px; flex-wrap:wrap;">
              <button class="figma-btn-study-large" id="btn-start-active-study" style="width:auto; padding:14px 34px; font-size:1.02rem; box-shadow:0 8px 30px rgba(56,189,248,0.35);">
                🚀 Empezar Estudio (Átomo ${topic.currentChunkIndex + 1}/${topic.chunks.length}) ➔
              </button>
              <button class="figma-btn-white-pill btn-open-topic-mindmap" data-topic-id="${topic.id}" style="width:auto; padding:14px 22px; font-size:0.92rem; border-color:rgba(56,189,248,0.4); color:#38bdf8;">
                🧠 Abrir Mapa Mental
              </button>
            </div>
          </div>
          `
      }
    </div>
  `;
}

/**
 * MODO LECTURA ATÓMICA CENTRADA: Pone en el centro de la pantalla la información del átomo
 */
function renderCenteredAtomicReadingScreen(
  topic: ActiveStudyTopic,
  chunk: StudyChunk,
  chunkCards: Flashcard[],
  deckName: string
): string {
  return `
    <div class="active-study-topic-workspace atomic-study-immersive-container" data-topic-id="${topic.id}">
      <div class="atomic-reading-card">
        <!-- Barra Superior del Átomo -->
        <div class="atomic-card-top-meta">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="atomic-tag-badge">🔬 Átomo ${topic.currentChunkIndex + 1} de ${topic.chunks.length}</span>
            <button class="atomic-deck-link-chip btn-change-topic-deck" data-topic-id="${topic.id}" title="Toca para cambiar de baraja vinculada" style="border:none; cursor:pointer;">🎴 Baraja: ${escapeAttr(deckName)} ✎</button>
          </div>
          <button class="figma-btn-white-pill" id="btn-exit-atomic-reading" style="padding:6px 14px; font-size:0.8rem;">
            ✕ Volver al Resumen
          </button>
        </div>

        <!-- Título del Átomo de Información -->
        <h2 class="atomic-chunk-headline">${escapeHtml(chunk.title)}</h2>

        <!-- Contenido Fuente Central con KaTeX y Notación Científica -->
        <div class="atomic-reading-content">
          ${chunk.sourceContent
            .split('\n\n')
            .map((p) => `<p>${katexService.parseAndRender(p)}</p>`)
            .join('')}
        </div>

        <!-- Barra Inferior de Acciones Focalizadas -->
        <div class="atomic-action-dock-centered">
          <button class="btn-atomic-add-card" id="btn-atomic-add-card" title="Agregar flashcard vinculada a esta información">
            <span style="font-size:1.2rem;">➕</span>
            <span>Agregar Flashcard</span>
            <span style="font-size:0.82rem; opacity:0.85;">(${chunkCards.length} en este átomo)</span>
          </button>

          <button class="btn-atomic-continue" id="btn-atomic-continue-mindmap" title="Continuar al mapa mental de este tema">
            <span>Continuar al Mapa Mental</span>
            <span style="font-size:1.1rem;">➔</span>
          </button>
        </div>
      </div>
    </div>
  `;
}



/**
 * FASE 2: Constructor del Esquema Ciego (Outliner Jerárquico Táctil con SortableJS)
 */
function renderOutlineBuildingScreen(
  topic: ActiveStudyTopic,
  chunk: { id: string; title: string },
  chunkCards: Flashcard[]
): string {
  const outlineNodes = activeStudyService.getOutlineNodes(topic.id);
  const outlineTree = activeStudyService.getOutlineTree(topic.id);
  const hasNodes = outlineNodes.length > 0;
  const isLastChunk = topic.currentChunkIndex + 1 >= topic.chunks.length;

  return `
    <div class="study-screen-outline-wrap">
      <!-- Info Header -->
      <div class="study-screen-header">
        <div class="study-phase-badge" style="background:rgba(168,85,247,0.15); border-color:rgba(168,85,247,0.3); color:#c084fc;">
          <span>FASE 2: RECUPERACIÓN ACTIVA (ESQUEMA CIEGO)</span>
        </div>
        <h2 class="study-chunk-title">${chunk.title}</h2>
        <p class="study-phase-instruction">
          El texto original se encuentra <strong>completamente oculto</strong>. Utiliza únicamente las pistas de tus flashcards para estructurar el esquema jerárquico de tus ideas de memoria.
        </p>
      </div>

      <!-- Barra de Soporte (CUES TRAY) con solo los Anversos -->
      <div class="study-cues-tray apple-glass-panel">
        <div class="cues-tray-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>💡</span>
            <strong style="color:#fff; font-size:0.92rem;">Barra de Soporte (Pistas Mnémicas)</strong>
          </div>
          <span style="font-size:0.78rem; color:var(--f-text-secondary);">
            Solo anversos visibles • Toca para insertar como nodo en el esquema
          </span>
        </div>

        <div class="cues-tray-scroll">
          ${
            chunkCards.length > 0
              ? chunkCards
                  .map(
                    (c) => `
                <button class="cue-chip-btn" data-card-id="${c.id}" data-card-front="${escapeAttr(c.front)}" title="Toca para insertar en el esquema">
                  <span class="cue-spark">⚡</span>
                  <span class="cue-text">${katexService.parseAndRender(c.front)}</span>
                  <span class="cue-insert-icon">+</span>
                </button>
              `
                  )
                  .join('')
              : '<span style="color:var(--f-text-muted); font-size:0.85rem; padding:6px 0;">No hay pistas registradas para este bloque.</span>'
          }
        </div>
      </div>

      <!-- Editor de Esquema (Outliner Interactivo Nativo) -->
      <div class="study-outliner-box apple-glass-panel">
        <div class="outliner-box-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>🌳</span>
            <strong style="color:#fff; font-size:1.05rem;">Esquema Jerárquico del Tema</strong>
            <span class="nodes-count-badge">(${outlineNodes.length} nodos)</span>
          </div>
          <button class="figma-btn-white-pill btn-open-topic-mindmap" data-topic-id="${topic.id}" style="padding:5px 12px; font-size:0.78rem; border-color:rgba(56,189,248,0.4); color:#38bdf8;">
            🧠 Ver como Mapa Mental
          </button>
        </div>

        <!-- Input para nueva idea principal (raíz) -->
        <div class="outliner-add-root-row">
          <input 
            type="text" 
            id="input-outliner-new-node" 
            placeholder="Escribe una idea o concepto para el esquema..." 
            autocomplete="off"
          />
          <button class="figma-btn-white-pill" id="btn-add-outline-root">
            + Añadir Nodo
          </button>
        </div>

        <!-- Árbol Jerárquico de Nodos (DOM + SortableJS) -->
        <div class="outliner-tree-mount" id="outline-tree-container">
          ${
            outlineTree.length > 0
              ? renderOutlineTreeHtml(outlineTree)
              : `
            <div class="outliner-empty-state">
              <span>El esquema está vacío. Pulsa una pista de arriba o escribe una idea para comenzar a estructurar tus conceptos.</span>
            </div>
          `
          }
        </div>
      </div>

      <!-- Barra de Navegación Inferior -->
      <div class="study-bottom-nav-bar">
        <button class="figma-icon-btn-dark" id="btn-back-to-reading" style="padding:10px 18px; border-radius:12px; width:auto; gap:6px;">
          <span>← Volver a Lectura</span>
        </button>

        <button 
          class="figma-btn-study-large ${hasNodes ? '' : 'btn-disabled'}" 
          id="btn-complete-chunk-step"
          ${hasNodes ? '' : 'disabled'}
          style="width:auto; min-width:260px; padding:14px 28px;"
        >
          ${isLastChunk ? '🌟 Finalizar Tema y Consolidar' : 'Completar Bloque y Siguiente ➔'}
        </button>
      </div>
    </div>
  `;
}

/**
 * FASE 3: Consolidación y Mecánica de Desbloqueo (24 horas / Monedas)
 */
function renderConsolidatedScreen(
  topic: ActiveStudyTopic,
  userCoins: number,
  allCards: Flashcard[]
): string {
  const isLocked = activeStudyService.isContentLocked(topic.id);
  const remainingMs = activeStudyService.getRemainingLockTimeMs(topic.id);
  const outlineTree = activeStudyService.getOutlineTree(topic.id);

  return `
    <div class="study-screen-consolidated-wrap">
      <!-- Hero de Tema Finalizado -->
      <div class="consolidated-hero apple-glass-panel">
        <div class="consolidated-trophy">🧠</div>
        <h2 style="font-size:1.6rem; font-weight:900; color:#fff; margin:0 0 6px 0;">
          ¡Tema Consolidado Exitosamente!
        </h2>
        <p style="font-size:0.92rem; color:var(--f-text-secondary); max-width:540px; margin:0 auto 16px auto; line-height:1.5;">
          Has completado todos los bloques atómicos, creado tus flashcards y estructurado el mapa jerárquico de memoria.
        </p>
      </div>

      <!-- COMPONENTE DE BLOQUEO DE 24 HORAS DEL TEXTO FUENTE -->
      ${
        isLocked
          ? `
        <div class="twentyfour-lock-card apple-glass-panel">
          <div class="lock-visual-badge">
            <div class="lock-pulsing-glow"></div>
            <span style="font-size:2.4rem; position:relative; z-index:1;">🔒</span>
          </div>

          <h3 class="lock-card-title">Texto Fuente Original Bloqueado</h3>
          <p class="lock-card-desc">
            Para forzar la <strong>consolidación sináptica profunda</strong> y eliminar la familiaridad ilusoria, el texto original permanece bloqueado durante 24 horas.
          </p>

          <!-- Temporizador Regresivo Dinámico hh:mm:ss -->
          <div class="lock-countdown-box">
            <div class="countdown-label">Tiempo restante para desbloqueo automático:</div>
            <div class="countdown-digits" id="lock-countdown-display" data-remaining="${remainingMs}">
              ${formatCountdown(remainingMs)}
            </div>
          </div>

          <!-- Bypass con Monedas -->
          <div class="lock-bypass-box">
            <p class="bypass-notice">¿Necesitas inspeccionar el texto antes de tiempo?</p>
            <button class="btn-bypass-coins" id="btn-bypass-with-coins">
              <span>🪙 Desbloquear ahora por ${UNLOCK_COST} Monedas</span>
              <span class="bypass-balance-tag">(Tienes ${userCoins})</span>
            </button>
          </div>
        </div>
      `
          : `
        <!-- Texto Fuente Desbloqueado -->
        <div class="twentyfour-unlocked-card apple-glass-panel">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.3rem;">🔓</span>
              <h4 style="font-size:1.1rem; font-weight:800; color:#10b981; margin:0;">Texto Fuente Desbloqueado</h4>
            </div>
            <span style="font-size:0.8rem; color:var(--f-text-muted);">Acceso libre concedido</span>
          </div>

          <details style="cursor:pointer;">
            <summary style="font-size:0.9rem; font-weight:700; color:var(--f-blue); padding:6px 0;">
              Ver contenido completo de los ${topic.chunks.length} bloques ▾
            </summary>
            <div class="unlocked-chunks-content" style="margin-top:14px;">
              ${topic.chunks
                .map(
                  (c) => `
                <div class="unlocked-chunk-item">
                  <h5 style="color:#fff; font-size:1rem; margin:0 0 6px 0;">${c.title}</h5>
                  <div style="color:var(--f-text-secondary); font-size:0.9rem; line-height:1.5;">${katexService.parseAndRender(c.sourceContent)}</div>
                </div>
              `
                )
                .join('')}
            </div>
          </details>
        </div>
      `
      }

      <!-- ESQUEMA CONCEPTUAL GLOBAL (Siempre Visible y Editable) -->
      <div class="consolidated-section apple-glass-panel">
        <div class="consolidated-section-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.2rem;">🌳</span>
            <h3 style="font-size:1.15rem; font-weight:800; color:#fff; margin:0;">Esquema Conceptual Completo</h3>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="figma-btn-white-pill btn-open-topic-mindmap" data-topic-id="${topic.id}" style="padding:5px 12px; font-size:0.78rem; border-color:rgba(56,189,248,0.4); color:#38bdf8;">
              🧠 Ver como Mapa Mental
            </button>
            <span class="status-free-badge">Siempre Editable</span>
          </div>
        </div>

        <div class="outliner-tree-mount" id="consolidated-tree-container">
          ${
            outlineTree.length > 0
              ? renderOutlineTreeHtml(outlineTree)
              : '<div style="color:var(--f-text-muted); text-align:center; padding:18px;">No hay nodos registrados en el esquema.</div>'
          }
        </div>
      </div>

      <!-- FLASHCARDS CREADAS PARA ESTE TEMA (Siempre Visibles y Repasables) -->
      <div class="consolidated-section apple-glass-panel">
        <div class="consolidated-section-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.2rem;">🎴</span>
            <h3 style="font-size:1.15rem; font-weight:800; color:#fff; margin:0;">Flashcards Asociadas al Tema</h3>
          </div>
          <span class="status-free-badge">${allCards.length} tarjetas</span>
        </div>

        <div class="consolidated-cards-grid">
          ${
            allCards.length > 0
              ? allCards
                  .map(
                    (c) => `
                <div class="figma-card-item">
                  <div style="font-size:0.92rem; font-weight:700; color:#fff; margin-bottom:6px;">
                    ${katexService.parseAndRender(c.front)}
                  </div>
                  <div style="font-size:0.84rem; color:var(--f-text-secondary); line-height:1.4;">
                    ${katexService.parseAndRender(c.back)}
                  </div>
                </div>
              `
                  )
                  .join('')
              : '<div style="color:var(--f-text-muted); text-align:center; padding:18px; grid-column:1/-1;">No hay flashcards registradas para este tema.</div>'
          }
        </div>
      </div>

      <!-- Botón para reiniciar o repetir sesión -->
      <div style="text-align:center; margin-top:24px;">
        <button class="figma-btn-white-pill" id="btn-restart-study-session" style="padding:12px 28px;">
          🔄 Repasar Sesión de Estudio de este Tema
        </button>
      </div>
    </div>
  `;
}

/**
 * Renderizador recursivo para el árbol del esquema (Outliner táctil con SortableJS)
 */
function renderOutlineTreeHtml(nodes: OutlineNode[], depth: number = 0): string {
  return `
    <ul class="outliner-node-list depth-${depth}">
      ${nodes
        .map(
          (n) => `
        <li class="outliner-node-item" data-node-id="${n.id}">
          <div class="outliner-node-row">
            <span class="node-drag-handle" title="Toca y arrastra para reordenar a 60 FPS">⋮⋮</span>
            <span class="node-bullet-symbol">•</span>
            <div class="node-text-content" contenteditable="true" data-edit-node="${n.id}">
              ${n.text}
            </div>

            <div class="node-action-buttons">
              <button class="btn-node-action btn-add-child" data-parent-id="${n.id}" title="Agregar subnodo">+ Hijo</button>
              <button class="btn-node-action btn-indent" data-node-id="${n.id}" title="Aumentar sangría">→</button>
              <button class="btn-node-action btn-outdent" data-node-id="${n.id}" title="Disminuir sangría">←</button>
              <button class="btn-node-action btn-delete-node" data-node-id="${n.id}" title="Eliminar nodo">✕</button>
            </div>
          </div>

          ${n.children && n.children.length > 0 ? renderOutlineTreeHtml(n.children, depth + 1) : ''}
        </li>
      `
        )
        .join('')}
    </ul>
  `;
}

/**
 * Enlace reactivo de eventos para el Dashboard de Estudio Activo
 */
export function bindActiveStudyDashboardEvents(
  container: HTMLElement,
  onRefresh: () => void,
  onSelectTopic: (topicId: string) => void,
  onOpenMindMap?: (topicId?: string) => void,
  onOpenCardCreator?: (deckId: string, chunkId?: string) => void
): () => void {
  const allTopics = activeStudyService.getAllTopics();

  // 1. Selector de Píldoras de Tema
  container.querySelectorAll<HTMLButtonElement>('.study-topic-pill-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const topicId = btn.dataset.topicId;
      if (topicId) {
        activeStudyingTopicId = null;
        onSelectTopic(topicId);
        onRefresh();
      }
    });
  });

  // 2. Creación de Cuadernos
  const handleOpenCreateModal = () => {
    openCreateNotebookModal((newTopicId) => {
      onSelectTopic(newTopicId);
      onRefresh();
    });
  };

  container.querySelector('#btn-create-study-topic')?.addEventListener('click', handleOpenCreateModal);
  container.querySelector('#btn-empty-create-notebook')?.addEventListener('click', handleOpenCreateModal);

  // 2.1 Búsqueda y Filtro de Cuadernos en vivo
  const searchInput = container.querySelector('#input-search-notebooks') as HTMLInputElement | null;
  const filterPills = container.querySelectorAll<HTMLButtonElement>('.notebook-subject-filter-btn');
  let currentSubjectFilter = 'ALL';

  const applyNotebookFilters = () => {
    const query = searchInput?.value.toLowerCase().trim() || '';
    container.querySelectorAll<HTMLElement>('.notebook-card').forEach((card) => {
      const title = card.querySelector('.notebook-cover-title')?.textContent?.toLowerCase() || '';
      const desc = card.querySelector('.notebook-card-desc')?.textContent?.toLowerCase() || '';
      const subj = card.dataset.subject || '';
      const matchesQuery = !query || title.includes(query) || desc.includes(query) || subj.toLowerCase().includes(query);
      const matchesSubj = currentSubjectFilter === 'ALL' || subj.toLowerCase() === currentSubjectFilter.toLowerCase();
      card.style.display = matchesQuery && matchesSubj ? 'flex' : 'none';
    });
  };

  searchInput?.addEventListener('input', applyNotebookFilters);
  filterPills.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterPills.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentSubjectFilter = btn.dataset.subjectFilter || 'ALL';
      applyNotebookFilters();
    });
  });

  // 2.2 Botón de Estudiar Cuaderno
  container.querySelectorAll<HTMLButtonElement>('.btn-study-notebook').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tid = btn.dataset.topicId;
      if (tid) {
        activeStudyingTopicId = tid;
        onSelectTopic(tid);
        onRefresh();
      }
    });
  });

  // 2.3 Botón de Eliminar Cuaderno
  container.querySelectorAll<HTMLButtonElement>('.notebook-delete-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tid = btn.dataset.topicId;
      if (!tid) return;
      dialogService.showConfirm({
        title: 'Eliminar Cuaderno',
        message: '¿Estás seguro de que deseas eliminar este cuaderno de estudio? Se conservarán las tarjetas registradas en tu baraja.',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        onConfirm: () => {
          activeStudyService.deleteTopic(tid);
          if (activeStudyingTopicId === tid) activeStudyingTopicId = null;
          onRefresh();
        }
      });
    });
  });

  // 2.4 Botón Volver a Cuadernos
  container.querySelectorAll<HTMLButtonElement>('.btn-back-to-notebooks').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeStudyingTopicId = null;
      onRefresh();
    });
  });

  container.querySelector('#btn-load-neuro-demo')?.addEventListener('click', () => {
    const demo = activeStudyService.createDemoTopic('global_study');
    onSelectTopic(demo.id);
    onRefresh();
  });

  container.querySelector('#btn-empty-neuro-demo')?.addEventListener('click', () => {
    const demo = activeStudyService.createDemoTopic('global_study');
    onSelectTopic(demo.id);
    onRefresh();
  });

  container.querySelector('#btn-load-nuclear-demo')?.addEventListener('click', () => {
    const nuclear = activeStudyService.createNuclearDemoTopic('global_study');
    onSelectTopic(nuclear.id);
    onRefresh();
  });

  container.querySelector('#btn-empty-nuclear-demo')?.addEventListener('click', () => {
    const nuclear = activeStudyService.createNuclearDemoTopic('global_study');
    onSelectTopic(nuclear.id);
    onRefresh();
  });

  // 3. Recarga de Monedas de Prueba para el Bypass
  container.querySelector('#btn-add-demo-coins')?.addEventListener('click', () => {
    activeStudyService.addCoins(100);
    onRefresh();
  });

  // Comprobar si hay un tema activo seleccionado
  const activeWorkspace = container.querySelector('[data-topic-id]') as HTMLElement | null;
  const currentTopicId = activeWorkspace?.dataset.topicId || (allTopics.length > 0 ? allTopics[0].id : undefined);

  // Lanzador directo de Mapa Mental desde la barra de temas
  container.querySelector('#btn-launch-free-mindmap')?.addEventListener('click', () => {
    nativeService.triggerHaptics('medium');
    onOpenMindMap?.(currentTopicId);
  });

  // Botones para abrir el esquema como Mapa Mental
  container.querySelectorAll<HTMLButtonElement>('.btn-open-topic-mindmap').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tid = btn.dataset.topicId || currentTopicId;
      nativeService.triggerHaptics('medium');
      onOpenMindMap?.(tid);
    });
  });

  // Botón interactivo para cambiar o re-vincular baraja de un tema
  container.querySelectorAll<HTMLButtonElement>('.btn-change-topic-deck').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tid = btn.dataset.topicId || currentTopicId;
      if (tid) {
        const t = activeStudyService.getTopicById(tid);
        if (t) {
          openChangeTopicDeckModal(t, () => onRefresh());
        }
      }
    });
  });

  if (!currentTopicId) return () => {};

  const topic = activeStudyService.getTopicById(currentTopicId);
  if (!topic) return () => {};

  // 3.5 MODO ESTUDIO ATÓMICO CENTRADO: Controles de navegación y acción
  container.querySelector('#btn-start-active-study')?.addEventListener('click', () => {
    activeStudyingTopicId = topic.id;
    nativeService.triggerHaptics('medium');
    onRefresh();
  });

  container.querySelector('#btn-exit-atomic-reading')?.addEventListener('click', () => {
    activeStudyingTopicId = null;
    nativeService.triggerHaptics('light');
    onRefresh();
  });

  const currentChunk = topic.chunks[topic.currentChunkIndex] || topic.chunks[0];

  container.querySelector('#btn-atomic-add-card')?.addEventListener('click', () => {
    nativeService.triggerHaptics('light');
    let targetDeckId = topic.deckId;
    if (!targetDeckId) {
      const allDecks = deckService.getAllDecks();
      const defaultDeck = allDecks[0] || deckService.createDeck({ name: topic.title, icon: 'deck', color: '#38bdf8' });
      targetDeckId = defaultDeck.id;
      topic.deckId = targetDeckId;
      activeStudyService.saveToStorage();
    }

    if (onOpenCardCreator) {
      onOpenCardCreator(targetDeckId, currentChunk?.id);
    } else if (currentChunk) {
      openAddFlashcardModal(topic, currentChunk, () => {
        onRefresh();
      });
    }
  });

  container.querySelector('#btn-atomic-continue-mindmap')?.addEventListener('click', () => {
    nativeService.triggerHaptics('medium');
    onOpenMindMap?.(topic.id);
  });

  // 4. Eliminar Tema
  container.querySelector('#btn-study-topic-delete')?.addEventListener('click', () => {
    dialogService.showConfirm({
      title: 'Eliminar Tema',
      message: `¿Estás seguro de eliminar "${topic.title}"? El esquema y sus bloques serán borrados permanentemente.`,
      confirmText: 'Eliminar',
      isDanger: true,
      onConfirm: () => {
        if (activeStudyingTopicId === topic.id) {
          activeStudyingTopicId = null;
        }
        activeStudyService.deleteTopic(topic.id);
        const remaining = activeStudyService.getAllTopics();
        onSelectTopic(remaining.length > 0 ? remaining[0].id : '');
        onRefresh();
      }
    });
  });

  // 5. Reiniciar Sesión del Tema
  container.querySelector('#btn-study-topic-reset')?.addEventListener('click', () => {
    dialogService.showConfirm({
      title: 'Reiniciar Sesión',
      message: '¿Deseas volver al Bloque 1 para repasar todo el flujo? El esquema y flashcards creadas se mantendrán.',
      confirmText: 'Reiniciar',
      onConfirm: () => {
        activeStudyService.resetTopicSession(topic.id);
        onRefresh();
      }
    });
  });

  // 6. FASE 1: Formulario de Flashcards
  const inputFront = container.querySelector('#input-quick-front') as HTMLInputElement | null;
  const inputBack = container.querySelector('#input-quick-back') as HTMLTextAreaElement | null;
  const btnAddCard = container.querySelector('#btn-add-quick-card');

  const handleSaveCard = () => {
    if (!inputFront || !inputBack || !currentChunk) return;
    const front = inputFront.value.trim();
    const back = inputBack.value.trim();

    if (!front || !back) {
      dialogService.showAlert({
        title: 'Campos requeridos',
        message: 'Debes ingresar tanto el anverso como el reverso de la flashcard.'
      });
      return;
    }

    // Crear la tarjeta asociada a este topicId y chunkId
    deckService.createCard({
      deckId: topic.deckId || topic.id,
      type: 'standard',
      front,
      back,
      chunkId: currentChunk.id
    });

    inputFront.value = '';
    inputBack.value = '';
    onRefresh();
  };

  btnAddCard?.addEventListener('click', handleSaveCard);

  // 7. FASE 1: Pasar al Esquema
  container.querySelector('#btn-start-outline-step')?.addEventListener('click', () => {
    activeStudyService.updateTopicState(topic.id, 'BUILDING_OUTLINE');
    onRefresh();
  });

  // 8. FASE 2: Cues Tray (Pulsar chip de pista para insertar en esquema)
  container.querySelectorAll<HTMLButtonElement>('.cue-chip-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.cardFront || '';
      const cardId = btn.dataset.cardId || '';
      if (text) {
        activeStudyService.addOutlineNode(topic.id, text, null, cardId);
        onRefresh();
      }
    });
  });

  // 9. FASE 2: Editor de Esquema (Añadir raíz)
  const inputNewNode = container.querySelector('#input-outliner-new-node') as HTMLInputElement | null;
  const btnAddRoot = container.querySelector('#btn-add-outline-root');

  const handleAddRoot = () => {
    if (!inputNewNode) return;
    const val = inputNewNode.value.trim();
    if (!val) return;
    activeStudyService.addOutlineNode(topic.id, val, null);
    inputNewNode.value = '';
    onRefresh();
  };

  btnAddRoot?.addEventListener('click', handleAddRoot);
  inputNewNode?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAddRoot();
  });

  // 10. FASE 2: Acciones de nodo en árbol
  container.querySelectorAll<HTMLElement>('[data-edit-node]').forEach((editable) => {
    editable.addEventListener('blur', () => {
      const nodeId = editable.dataset.editNode;
      const text = editable.textContent?.trim() || '';
      if (nodeId && text) {
        activeStudyService.updateOutlineNode(topic.id, nodeId, text);
      }
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.btn-add-child').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parentId = btn.dataset.parentId;
      if (!parentId) return;
      dialogService.showPrompt({
        title: 'Nuevo Subnodo',
        placeholder: 'Escribe el concepto secundario...',
        confirmText: 'Agregar Subnodo',
        onConfirm: (text) => {
          if (text && text.trim()) {
            activeStudyService.addOutlineNode(topic.id, text.trim(), parentId);
            onRefresh();
          }
        }
      });
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.btn-indent').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nodeId = btn.dataset.nodeId;
      if (nodeId) {
        activeStudyService.indentOutlineNode(topic.id, nodeId);
        onRefresh();
      }
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.btn-outdent').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nodeId = btn.dataset.nodeId;
      if (nodeId) {
        activeStudyService.outdentOutlineNode(topic.id, nodeId);
        onRefresh();
      }
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.btn-delete-node').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nodeId = btn.dataset.nodeId;
      if (nodeId) {
        activeStudyService.deleteOutlineNode(topic.id, nodeId);
        onRefresh();
      }
    });
  });

  // Directiva 5: Soporte táctil y Drag-and-Drop en el Outliner DOM con SortableJS
  container.querySelectorAll<HTMLElement>('.outliner-node-list').forEach((listEl) => {
    Sortable.create(listEl, {
      group: 'nested-outliner',
      handle: '.node-drag-handle',
      animation: 160,
      fallbackOnBody: true,
      swapThreshold: 0.65,
      delay: 100, // Diferencia toque vs arrastre en móviles
      delayOnTouchOnly: true,
      touchStartThreshold: 4,
      ghostClass: 'outliner-ghost-node',
      chosenClass: 'outliner-chosen-node',
      dragClass: 'outliner-drag-node',
      onEnd: (evt) => {
        const targetList = evt.to;
        const parentLi = targetList.closest('.outliner-node-item');
        const newParentId = parentLi ? (parentLi as HTMLElement).dataset.nodeId || null : null;

        const orderedIds: string[] = Array.from(targetList.children)
          .filter((child) => child.classList.contains('outliner-node-item'))
          .map((child) => (child as HTMLElement).dataset.nodeId!)
          .filter(Boolean);

        if (orderedIds.length > 0) {
          activeStudyService.reorderOutlineNodes(topic.id, orderedIds, newParentId);
        }
      }
    });
  });

  // 11. FASE 2: Volver a lectura / Completar Bloque
  container.querySelector('#btn-back-to-reading')?.addEventListener('click', () => {
    activeStudyService.updateTopicState(topic.id, 'READING_CHUNK');
    onRefresh();
  });

  container.querySelector('#btn-complete-chunk-step')?.addEventListener('click', () => {
    activeStudyService.advanceToNextChunk(topic.id);
    onRefresh();
  });

  // 12. FASE 3: Bypass con Monedas
  container.querySelector('#btn-bypass-with-coins')?.addEventListener('click', () => {
    const currentCoins = activeStudyService.getUserCoins();
    dialogService.showConfirm({
      title: '🪙 Desbloqueo Anticipado con Monedas',
      message: `El texto original está bloqueado para consolidar tu memoria a largo plazo.\n\nDesbloquearlo ahora cuesta ${UNLOCK_COST} monedas (Saldo actual: ${currentCoins}).\n\n¿Confirmas el desbloqueo?`,
      confirmText: `Desbloquear (${UNLOCK_COST} monedas)`,
      cancelText: 'Esperar las 24h',
      onConfirm: () => {
        const result = activeStudyService.bypassLockWithCoins(topic.id, UNLOCK_COST);
        if (result.success) {
          dialogService.showAlert({
            title: '¡Desbloqueado!',
            message: result.message
          });
          onRefresh();
        } else {
          dialogService.showAlert({
            title: 'Saldo Insuficiente',
            message: result.message
          });
        }
      }
    });
  });

  // 13. FASE 3: Reiniciar sesión
  container.querySelector('#btn-restart-study-session')?.addEventListener('click', () => {
    dialogService.showConfirm({
      title: 'Reiniciar Sesión de Estudio',
      message: '¿Deseas volver al inicio del tema para repasar todos los bloques? El esquema y flashcards se mantendrán.',
      confirmText: 'Reiniciar',
      onConfirm: () => {
        activeStudyService.resetTopicSession(topic.id);
        onRefresh();
      }
    });
  });

  // 14. Timer regresivo en vivo (1 segundo)
  let timerInterval: number | null = null;
  const countdownEl = container.querySelector('#lock-countdown-display') as HTMLElement | null;
  if (countdownEl && topic.state === 'TOPIC_CONSOLIDATED') {
    timerInterval = window.setInterval(() => {
      const remaining = activeStudyService.getRemainingLockTimeMs(topic.id);
      if (remaining <= 0) {
        if (timerInterval) clearInterval(timerInterval);
        onRefresh();
      } else {
        countdownEl.textContent = formatCountdown(remaining);
      }
    }, 1000);
  }

  // Devolver función de limpieza
  return () => {
    if (timerInterval) clearInterval(timerInterval);
  };
}

/**
 * Modal para agregar una flashcard durante la lectura del átomo, con soporte de fórmulas científicas
 */
function openAddFlashcardModal(
  topic: ActiveStudyTopic,
  chunk: StudyChunk,
  onSaved: () => void
): void {
  const existing = document.getElementById('eureka-add-card-modal');
  if (existing) existing.remove();

  nativeService.triggerHaptics('light');

  const linkedDeck = topic.deckId ? deckService.getDeckById(topic.deckId) : null;
  const deckName = linkedDeck ? linkedDeck.name : 'Baraja Vinculada';

  const modal = document.createElement('div');
  modal.id = 'eureka-add-card-modal';
  modal.className = 'apple-modal-overlay';
  modal.innerHTML = `
    <div class="apple-modal-content apple-glass-panel" style="max-width:580px; width:92%; padding:24px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.3rem;">🎴</span>
          <div>
            <h3 style="font-size:1.15rem; font-weight:800; color:#fff; margin:0;">Agregar Flashcard al Átomo</h3>
            <span style="font-size:0.75rem; color:#c084fc;">Guardando en baraja: <strong>${escapeHtml(deckName)}</strong></span>
          </div>
        </div>
        <button id="btn-close-card-modal" class="figma-icon-btn-ghost" style="color:var(--f-text-secondary); font-size:1.3rem;">✕</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:14px;">
        <!-- Anverso -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label style="font-size:0.78rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase;">Anverso (Pregunta o Estímulo):</label>
            <button type="button" class="figma-btn-white-pill" id="btn-formula-for-front" style="padding:4px 10px; font-size:0.75rem; border-color:rgba(56,189,248,0.4); color:#38bdf8;">
              📐 Fórmulas KaTeX
            </button>
          </div>
          <input 
            type="text" 
            id="modal-card-front" 
            placeholder="Ej: ¿Cuál es el isótopo del Cesio usado para definir el segundo y su notación?" 
            style="width:100%; box-sizing:border-box; background:#11131c; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px 14px; color:#fff; font-size:0.95rem;"
            autocomplete="off"
          />
        </div>

        <!-- Reverso -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label style="font-size:0.78rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase;">Reverso (Respuesta / Notación Científica):</label>
            <button type="button" class="figma-btn-white-pill" id="btn-formula-for-back" style="padding:4px 10px; font-size:0.75rem; border-color:rgba(56,189,248,0.4); color:#38bdf8;">
              📐 Fórmulas KaTeX
            </button>
          </div>
          <textarea 
            id="modal-card-back" 
            rows="3" 
            placeholder="Ej: Cesio-133 expresado en notación nuclear como \\ce{^{133}_{55}Cs}." 
            style="width:100%; box-sizing:border-box; background:#11131c; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px 14px; color:#fff; font-size:0.95rem; font-family:inherit;"
          ></textarea>
        </div>

        <!-- Previsualización en vivo con KaTeX -->
        <div style="background:#090a10; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px;">
          <span style="font-size:0.72rem; font-weight:800; color:var(--f-text-muted); text-transform:uppercase; display:block; margin-bottom:4px;">Previsualización KaTeX en Vivo:</span>
          <div id="modal-card-preview" style="color:#38bdf8; font-size:0.95rem; min-height:24px;">
            <span style="color:var(--f-text-muted); font-size:0.85rem;">Escribe en el anverso o reverso para previsualizar</span>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:6px;">
          <button class="figma-btn-white-pill" id="btn-cancel-card-modal" style="background:rgba(255,255,255,0.06); color:#fff;">
            Cancelar
          </button>
          <button class="figma-btn-study-large" id="btn-save-card-modal" style="width:auto; padding:10px 24px;">
            💾 Terminar y Guardar ➔
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const inputFront = modal.querySelector('#modal-card-front') as HTMLInputElement;
  const inputBack = modal.querySelector('#modal-card-back') as HTMLTextAreaElement;
  const previewBox = modal.querySelector('#modal-card-preview') as HTMLElement;

  const updateCardPreview = () => {
    const front = inputFront.value.trim();
    const back = inputBack.value.trim();
    if (!front && !back) {
      previewBox.innerHTML = '<span style="color:var(--f-text-muted); font-size:0.85rem;">Escribe en el anverso o reverso para previsualizar</span>';
      return;
    }
    const htmlParts: string[] = [];
    if (front) htmlParts.push(`<div><strong>Q:</strong> ${katexService.parseAndRender(front)}</div>`);
    if (back) htmlParts.push(`<div><strong>A:</strong> ${katexService.parseAndRender(back)}</div>`);
    previewBox.innerHTML = htmlParts.join('<div style="margin:4px 0; border-top:1px dashed rgba(255,255,255,0.1);"></div>');
  };

  inputFront.addEventListener('input', updateCardPreview);
  inputBack.addEventListener('input', updateCardPreview);

  modal.querySelector('#btn-formula-for-front')?.addEventListener('click', () => {
    openScientificFormulaAssistant({
      initialLatex: inputFront.value,
      onInsert: (formula) => {
        const cur = inputFront.value;
        const pos = inputFront.selectionStart ?? cur.length;
        inputFront.value = `${cur.slice(0, pos)} ${formula} ${cur.slice(pos)}`.trim();
        updateCardPreview();
      }
    });
  });

  modal.querySelector('#btn-formula-for-back')?.addEventListener('click', () => {
    openScientificFormulaAssistant({
      initialLatex: inputBack.value,
      onInsert: (formula) => {
        const cur = inputBack.value;
        const pos = inputBack.selectionStart ?? cur.length;
        inputBack.value = `${cur.slice(0, pos)} ${formula} ${cur.slice(pos)}`.trim();
        updateCardPreview();
      }
    });
  });

  const closeModal = () => modal.remove();
  modal.querySelector('#btn-close-card-modal')?.addEventListener('click', closeModal);
  modal.querySelector('#btn-cancel-card-modal')?.addEventListener('click', closeModal);

  modal.querySelector('#btn-save-card-modal')?.addEventListener('click', () => {
    const front = inputFront.value.trim();
    const back = inputBack.value.trim();

    if (!front || !back) {
      dialogService.showAlert({
        title: 'Campos requeridos',
        message: 'Debes ingresar tanto el anverso como el reverso de la flashcard.'
      });
      return;
    }

    deckService.createCard({
      deckId: topic.deckId || topic.id,
      type: 'standard',
      front,
      back,
      chunkId: chunk.id
    });

    nativeService.triggerHaptics('light');
    closeModal();
    onSaved();
  });
}

/**
 * Modal interactivo y limpio para crear un nuevo Cuaderno de Estudio
 * Campos: Nombre, Descripción, Foto (opcional), 20 Materias populares, Ligar a un mazo
 */
function openCreateNotebookModal(onCreated: (topicId: string) => void): void {
  const allDecks = deckService.getAllDecks();
  let chosenPhotoDataUrl: string | undefined = undefined;

  const modal = document.createElement('div');
  modal.className = 'apple-modal-overlay';
  modal.innerHTML = `
    <div class="apple-modal-content apple-glass-panel" style="max-width:540px; width:94%; padding:24px; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; border-radius:24px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.5rem;">📓</span>
          <div>
            <h3 style="font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Nuevo Cuaderno de Estudio</h3>
            <p style="font-size:0.8rem; color:var(--f-text-secondary); margin:2px 0 0 0;">Configura tu cuaderno con mapa mental y repaso activo</p>
          </div>
        </div>
        <button id="btn-close-create-modal" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
      </div>

      <div style="overflow-y:auto; padding-right:4px; display:flex; flex-direction:column; gap:14px; flex:1;">
        <!-- 1. Nombre del Cuaderno -->
        <div>
          <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; margin-bottom:6px;">
            Nombre del Cuaderno *
          </label>
          <input 
            type="text" 
            id="modal-notebook-name" 
            placeholder="Ej: Biología Celular, Macroeconomía..." 
            style="width:100%; box-sizing:border-box; background:#14151c; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:11px 14px; color:#fff; font-size:0.95rem; outline:none;"
          />
        </div>

        <!-- 2. Descripción -->
        <div>
          <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; margin-bottom:6px;">
            Descripción
          </label>
          <textarea 
            id="modal-notebook-desc" 
            rows="2" 
            placeholder="Breve descripción o temario de este cuaderno..." 
            style="width:100%; box-sizing:border-box; background:#14151c; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px 14px; color:#fff; font-size:0.9rem; font-family:inherit; outline:none;"
          ></textarea>
        </div>

        <!-- 3. Tipo de Materia (20 materias populares) -->
        <div>
          <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; margin-bottom:6px;">
            Tipo de Materia
          </label>
          <select 
            id="modal-notebook-subject" 
            style="width:100%; box-sizing:border-box; background:#14151c; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:11px 14px; color:#fff; font-size:0.92rem; outline:none; cursor:pointer;"
          >
            ${POPULAR_SUBJECTS.map((subj) => `<option value="${subj.name}">${subj.icon} ${escapeHtml(subj.name)}</option>`).join('')}
          </select>
        </div>

        <!-- 4. Foto de Portada (Opcional) -->
        <div>
          <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; margin-bottom:6px;">
            Foto de Portada (Opcional)
          </label>
          <input type="file" id="modal-notebook-photo-file" accept="image/*" style="display:none;" />
          <div id="modal-notebook-photo-preview-wrap" style="display:none; margin-bottom:8px; position:relative; border-radius:12px; overflow:hidden; max-height:140px; border:1px solid rgba(255,255,255,0.15);">
            <img id="modal-notebook-photo-img" style="width:100%; height:140px; object-fit:cover; display:block;" />
            <button id="btn-remove-notebook-photo" type="button" style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.7); border:none; color:#fff; border-radius:50%; width:28px; height:28px; cursor:pointer; font-size:0.8rem;">✕</button>
          </div>
          <button type="button" class="figma-btn-white-pill" id="btn-trigger-notebook-photo" style="width:100%; justify-content:center; padding:10px; font-size:0.88rem;">
            📷 Seleccionar Foto de Portada
          </button>
        </div>

        <!-- 5. Ligar a un Mazo (Flashcards) -->
        <div>
          <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; margin-bottom:6px;">
            Ligar a un Mazo de Flashcards
          </label>
          <select 
            id="modal-notebook-deck" 
            style="width:100%; box-sizing:border-box; background:#14151c; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:11px 14px; color:#fff; font-size:0.92rem; outline:none; cursor:pointer;"
          >
            <option value="__new_deck__">✨ Crear nuevo mazo con el nombre del cuaderno</option>
            ${allDecks.map((d) => `<option value="${d.id}">🎴 ${escapeHtml(d.name)} (${deckService.getCardsByDeck(d.id, false).length} tarjetas)</option>`).join('')}
          </select>
        </div>

        <!-- 6. Notas o Contenido Inicial (Opcional) -->
        <div>
          <details style="border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:8px 12px; background:rgba(0,0,0,0.2);">
            <summary style="font-size:0.82rem; color:var(--f-text-secondary); cursor:pointer; font-weight:600;">
              + Agregar texto o notas iniciales para estudio (Opcional)
            </summary>
            <textarea 
              id="modal-notebook-content" 
              rows="4" 
              placeholder="Pega aquí apuntes o texto para generar bloques de lectura atómica..." 
              style="width:100%; box-sizing:border-box; margin-top:8px; background:#14151c; border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:8px 12px; color:#fff; font-size:0.88rem; font-family:inherit; outline:none;"
            ></textarea>
          </details>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08);">
        <button class="figma-btn-white-pill" id="modal-btn-cancel" style="background:rgba(255,255,255,0.06); color:#fff; padding:10px 18px;">
          Cancelar
        </button>
        <button class="figma-btn-study-large" id="modal-btn-save" style="width:auto; padding:10px 24px;">
          ✨ Crear Cuaderno ➔
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Manejo de foto de portada
  const fileInput = modal.querySelector('#modal-notebook-photo-file') as HTMLInputElement;
  const triggerPhotoBtn = modal.querySelector('#btn-trigger-notebook-photo') as HTMLButtonElement;
  const photoPreviewWrap = modal.querySelector('#modal-notebook-photo-preview-wrap') as HTMLElement;
  const photoImg = modal.querySelector('#modal-notebook-photo-img') as HTMLImageElement;
  const removePhotoBtn = modal.querySelector('#btn-remove-notebook-photo') as HTMLButtonElement;

  triggerPhotoBtn?.addEventListener('click', () => fileInput.click());
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        chosenPhotoDataUrl = e.target?.result as string;
        photoImg.src = chosenPhotoDataUrl;
        photoPreviewWrap.style.display = 'block';
        triggerPhotoBtn.textContent = '📷 Cambiar Foto de Portada';
      };
      reader.readAsDataURL(file);
    }
  });

  removePhotoBtn?.addEventListener('click', () => {
    chosenPhotoDataUrl = undefined;
    fileInput.value = '';
    photoPreviewWrap.style.display = 'none';
    triggerPhotoBtn.textContent = '📷 Seleccionar Foto de Portada';
  });

  const closeModal = () => modal.remove();
  modal.querySelector('#btn-close-create-modal')?.addEventListener('click', closeModal);
  modal.querySelector('#modal-btn-cancel')?.addEventListener('click', closeModal);

  // Guardar Cuaderno
  modal.querySelector('#modal-btn-save')?.addEventListener('click', () => {
    const nameInput = modal.querySelector('#modal-notebook-name') as HTMLInputElement | null;
    const descInput = modal.querySelector('#modal-notebook-desc') as HTMLTextAreaElement | null;
    const subjectSelect = modal.querySelector('#modal-notebook-subject') as HTMLSelectElement | null;
    const deckSelect = modal.querySelector('#modal-notebook-deck') as HTMLSelectElement | null;
    const contentInput = modal.querySelector('#modal-notebook-content') as HTMLTextAreaElement | null;

    const name = nameInput?.value.trim() || '';
    if (!name) {
      dialogService.showAlert({
        title: 'Nombre requerido',
        message: 'Por favor ingresa un nombre para el cuaderno.'
      });
      return;
    }

    const description = descInput?.value.trim() || '';
    const subject = subjectSelect?.value || 'General';
    const selectedDeck = deckSelect?.value || '__new_deck__';
    const rawContent = contentInput?.value.trim() || '';

    let finalDeckId = selectedDeck;
    if (finalDeckId === '__new_deck__') {
      const subjInfo = getSubjectInfo(subject);
      const newDeck = deckService.createDeck({
        name: name,
        icon: subjInfo.icon || 'deck',
        color: subjInfo.color || '#38bdf8'
      });
      finalDeckId = newDeck.id;
    }

    const paragraphs = rawContent ? rawContent.split(/\n\s*\n/).filter((p) => p.trim().length > 0) : [];
    const chunksData =
      paragraphs.length > 0
        ? paragraphs.map((p, idx) => ({
            title: `Bloque ${idx + 1}`,
            content: p.trim()
          }))
        : [
            {
              title: 'Bloque 1: Contenido Principal',
              content: description || `Notas principales de ${name}`
            }
          ];

    const newTopic = activeStudyService.createTopic(finalDeckId, name, chunksData, {
      description,
      coverImage: chosenPhotoDataUrl,
      subject
    });

    nativeService.triggerHaptics('medium');
    closeModal();
    onCreated(newTopic.id);
  });
}

export const openCreateTopicModal = openCreateNotebookModal;

/**
 * Modal interactivo para cambiar o re-vincular la baraja de un tema existente
 */
function openChangeTopicDeckModal(topic: ActiveStudyTopic, onSaved: () => void): void {
  const allDecks = deckService.getAllDecks();
  let selectedDeckId: string = topic.deckId || (allDecks.length > 0 ? allDecks[0].id : '__create_new__');
  let chosenColor: string = '#38bdf8';

  const modal = document.createElement('div');
  modal.className = 'apple-modal-overlay';
  modal.innerHTML = `
    <div class="apple-modal-content apple-glass-panel" style="max-width:580px; width:94%; padding:24px; max-height:90vh; display:flex; flex-direction:column; overflow:hidden;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.3rem;">🎴</span>
          <div>
            <h3 style="font-size:1.2rem; font-weight:800; color:#fff; margin:0;">Cambiar Baraja Vinculada</h3>
            <span style="font-size:0.78rem; color:var(--f-text-secondary);">${escapeHtml(topic.title)}</span>
          </div>
        </div>
        <button id="btn-close-deck-change-modal" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
      </div>

      <div style="overflow-y:auto; padding-right:4px; display:flex; flex-direction:column; gap:14px; flex:1;">
        <div class="deck-linking-interactive-container">
          <p class="deck-linking-subtext">
            Selecciona la nueva baraja donde se asociarán las flashcards de este estudio:
          </p>

          <div class="deck-selection-grid" id="deck-change-selection-grid">
            <div class="deck-select-tile deck-select-tile-new ${selectedDeckId === '__create_new__' ? 'active' : ''}" id="tile-change-create-new-deck" data-deck-id="__create_new__">
              <div class="deck-tile-icon-wrap" style="background: rgba(168,85,247,0.15); border-color: rgba(168,85,247,0.4); color:#c084fc;">
                ✨
              </div>
              <div class="deck-tile-info">
                <span class="deck-tile-title">+ Crear Nueva Baraja</span>
                <span class="deck-tile-meta">Crear una nueva para vincular</span>
              </div>
              <div class="deck-tile-check">✓</div>
            </div>

            ${allDecks
              .map((d) => {
                const isSelected = selectedDeckId === d.id;
                const cardCount = deckService.getCardsByDeck(d.id, false).length;
                return `
                <div class="deck-select-tile ${isSelected ? 'active' : ''}" data-deck-id="${d.id}">
                  <div class="deck-tile-color-indicator" style="background: ${d.color || '#38bdf8'};"></div>
                  <div class="deck-tile-icon-wrap" style="background: rgba(56,189,248,0.12); border-color: rgba(56,189,248,0.3); color:#38bdf8;">
                    🎴
                  </div>
                  <div class="deck-tile-info">
                    <span class="deck-tile-title">${escapeHtml(d.name)}</span>
                    <span class="deck-tile-meta">${cardCount} tarjetas</span>
                  </div>
                  <div class="deck-tile-check">✓</div>
                </div>
              `;
              })
              .join('')}
          </div>

          <div class="deck-new-inline-card" id="deck-change-new-inline-card" style="${selectedDeckId === '__create_new__' ? 'display:block;' : 'display:none;'}">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <span style="font-size:1.1rem;">✨</span>
              <strong style="color:#fff; font-size:0.9rem;">Configurar Nueva Baraja</strong>
            </div>
            <input 
              type="text" 
              id="input-change-inline-deck-name" 
              placeholder="Nombre de la nueva baraja..." 
              class="deck-inline-input"
            />
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:14px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.08);">
        <button class="figma-btn-white-pill" id="modal-btn-cancel-deck-change" style="background:rgba(255,255,255,0.06); color:#fff;">
          Cancelar
        </button>
        <button class="figma-btn-study-large" id="modal-btn-save-deck-change" style="width:auto; padding:10px 24px;">
          💾 Guardar Vinculación
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const grid = modal.querySelector('#deck-change-selection-grid') as HTMLElement;
  const newDeckCard = modal.querySelector('#deck-change-new-inline-card') as HTMLElement;
  const newDeckInput = modal.querySelector('#input-change-inline-deck-name') as HTMLInputElement;

  grid.querySelectorAll<HTMLElement>('.deck-select-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      nativeService.triggerHaptics('light');
      const did = tile.dataset.deckId;
      if (!did) return;

      grid.querySelectorAll('.deck-select-tile').forEach((t) => t.classList.remove('active'));
      tile.classList.add('active');
      selectedDeckId = did;

      if (did === '__create_new__') {
        newDeckCard.style.display = 'block';
        newDeckInput.focus();
      } else {
        newDeckCard.style.display = 'none';
      }
    });
  });

  const closeModal = () => modal.remove();
  modal.querySelector('#btn-close-deck-change-modal')?.addEventListener('click', closeModal);
  modal.querySelector('#modal-btn-cancel-deck-change')?.addEventListener('click', closeModal);

  modal.querySelector('#modal-btn-save-deck-change')?.addEventListener('click', () => {
    let finalDeckId = selectedDeckId;
    if (finalDeckId === '__create_new__') {
      const customName = newDeckInput.value.trim();
      if (!customName) {
        dialogService.showAlert({
          title: 'Nombre requerido',
          message: 'Por favor ingresa un nombre para la nueva baraja.'
        });
        return;
      }
      const newDeck = deckService.createDeck({
        name: customName,
        icon: 'deck',
        color: chosenColor
      });
      finalDeckId = newDeck.id;
    }

    topic.deckId = finalDeckId;
    activeStudyService.saveToStorage();
    nativeService.triggerHaptics('medium');
    closeModal();
    onSaved();
  });
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Compatibilidad retroactiva
export const renderActiveStudyView = renderActiveStudyDashboard;
export const bindActiveStudyEvents = (
  container: HTMLElement,
  _deck: any,
  onRefresh: () => void
) => bindActiveStudyDashboardEvents(container, onRefresh, () => {});

