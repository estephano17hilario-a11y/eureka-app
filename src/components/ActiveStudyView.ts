import type { Flashcard } from '../types/flashcard';
import type { OutlineNode, ActiveStudyTopic, StudyChunk } from '../types/active-study';
import { activeStudyService, UNLOCK_COST } from '../services/active-study.service';
import { deckService } from '../services/deck.service';
import { katexService } from '../services/katex.service';
import { dialogService } from '../services/dialog.service';
import { openScientificFormulaAssistant } from './ScientificFormulaAssistant';
import { nativeService } from '../services/native.service';
import Sortable from 'sortablejs';
import { openFeynmanGuideViewerModal } from './FeynmanGuideViewerModal';
import { feynmanLlmService } from '../services/feynman-llm.service';
import { feynmanSandboxService } from '../services/feynman-sandbox.service';

let activeStudyingTopicId: string | null = null;
let currentFolderId: string | null = null;

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
 * Colores de la tapa a partir del degradado de la materia
 */
function hexPair(gradient: string): [string, string] {
  const m = gradient.match(/#[0-9a-fA-F]{6}/g) || [];
  return [m[0] || '#1e3a8a', m[1] || m[0] || '#0284c7'];
}

function coverBackground(topic: ActiveStudyTopic, info: ReturnType<typeof getSubjectInfo>): string {
  if (topic.coverImage) {
    return `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.4)), url('${escapeAttr(topic.coverImage)}') center/cover`;
  }
  if (topic.color) {
    return `linear-gradient(135deg, ${escapeAttr(topic.color)} 0%, ${escapeAttr(topic.color)} 100%)`;
  }
  const [a, b] = hexPair(info.gradient);
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}

function displayTitleOf(topic: ActiveStudyTopic): string {
  return topic.title.replace(/^\[Feynman\]\s*/i, '');
}

/**
 * Cuaderno real sobre la estantería: tapa con tela, lomo cosido, goma elástica y etiqueta manuscrita.
 * Al pasar el cursor la tapa se abre y deja ver en qué página te quedaste.
 */
function renderNotebookItem(topic: ActiveStudyTopic): string {
  const info = getSubjectInfo(topic.subject);
  const linkedDeck = topic.deckId ? deckService.getDeckById(topic.deckId) : null;
  const isLinked = Boolean(topic.deckId && linkedDeck && !deckService.isFolder(linkedDeck));
  const cards = isLinked ? deckService.getCardsByDeck(topic.deckId!, false).length : 0;
  const total = topic.chunks.length;
  const done = topic.chunks.filter((c) => c.isCompleted).length;
  const consolidated = topic.state === 'TOPIC_CONSOLIDATED';
  const pct = consolidated ? 100 : total ? Math.round((done / total) * 100) : 0;
  const current = topic.chunks[topic.currentChunkIndex] || topic.chunks[0];
  const title = displayTitleOf(topic);
  const emoji = topic.emoji || info.icon;
  const subjectLine = topic.feynmanGuideId ? '🔬 Ruta Feynman' : info.name;
  const searchBlob = `${title} ${info.name} ${topic.description || ''}`.toLowerCase();

  return `
    <div class="nb-item" data-notebook-id="${topic.id}" data-search="${escapeAttr(searchBlob)}" data-subject="${escapeAttr(info.name)}" style="--nb-bg: ${coverBackground(topic, info)};${topic.fontFamily ? ` font-family:'${escapeAttr(topic.fontFamily)}', sans-serif;` : ''}">
      <div class="nb-book">
        <div class="nb-pages"></div>
        <div class="nb-peek">
          <small>${consolidated ? 'Cuaderno completado' : done > 0 ? 'Continúas en' : 'Empiezas en'}</small>
          <strong>${escapeHtml(current ? current.title.replace(/^[^\p{L}\p{N}]+/u, '') : title)}</strong>
          <div class="nb-peek-bar"><i style="width:${pct}%;"></i></div>
        </div>
        <div class="nb-cover">
          <div class="nb-spine"></div>
          <div class="nb-band"></div>
          ${!isLinked ? '<span class="nb-warn">Sin mazo</span>' : ''}
          <button class="nb-menu-btn" data-topic-id="${topic.id}" title="Más opciones" aria-label="Más opciones">⋯</button>
          <div class="nb-label">
            <span class="nb-label-emoji">${escapeHtml(emoji)}</span>
            <span class="nb-label-title">${escapeHtml(title)}</span>
            <span class="nb-label-subject">${escapeHtml(subjectLine)}</span>
          </div>
          <div class="nb-cover-foot">
            <div class="nb-progress"><i style="width:${pct}%;"></i></div>
            <em>${consolidated ? '✓' : pct + '%'}</em>
          </div>
        </div>
      </div>
      <div class="nb-caption">${consolidated ? '✓ Consolidado' : `📖 ${done}/${total}`}${isLinked ? ` · 🎴 ${cards}` : ''}</div>
    </div>
  `;
}

/**
 * Carpeta como archivador manila con sus hojas asomando
 */
function renderFolderItem(topic: ActiveStudyTopic): string {
  const childCount = activeStudyService.getFolderContents(topic.id).length;
  const emoji = topic.emoji || '📁';
  const bg = topic.color
    ? `linear-gradient(160deg, ${escapeAttr(topic.color)}, ${escapeAttr(topic.color)})`
    : 'var(--folder-bg)';
  const searchBlob = `${topic.title} carpeta ${topic.description || ''}`.toLowerCase();

  return `
    <div class="nb-item is-folder" data-folder-id="${topic.id}" data-search="${escapeAttr(searchBlob)}" data-subject="Carpeta" style="--nb-bg: ${bg};">
      <div class="nb-book">
        <div class="nbf-papers"></div>
        <div class="nbf-body">
          <button class="nb-menu-btn" data-topic-id="${topic.id}" title="Más opciones" aria-label="Más opciones" style="top:12px; right:8px;">⋯</button>
          <span class="nbf-emoji">${escapeHtml(emoji)}</span>
          <span class="nbf-title">${escapeHtml(topic.title)}</span>
          <span class="nbf-count">${childCount} ${childCount === 1 ? 'cuaderno' : 'cuadernos'}</span>
        </div>
        <div class="nbf-tab"></div>
      </div>
      <div class="nb-caption">📁 Carpeta</div>
    </div>
  `;
}

/**
 * Renderiza la Vista de Cuadernos: un escritorio con la estantería de cuadernos
 */
export function renderActiveStudyDashboard(_selectedTopicId?: string): string {
  const allTopics = activeStudyService.getAllTopics();
  const userCoins = activeStudyService.getUserCoins();
  const savedFeynmanGuides = feynmanLlmService.getSavedGuides();

  // Si el usuario está dentro de un cuaderno (lectura / esquema / consolidación)
  if (activeStudyingTopicId) {
    const studyingTopic = allTopics.find((t) => t.id === activeStudyingTopicId);
    if (studyingTopic && !studyingTopic.isFolder) {
      return renderSelectedTopicWorkspace(studyingTopic, userCoins);
    }
    activeStudyingTopicId = null;
  }

  const currentFolder = currentFolderId ? allTopics.find((t) => t.id === currentFolderId && t.isFolder) : null;
  if (currentFolderId && !currentFolder) {
    currentFolderId = null;
  }

  const visibleTopics = currentFolderId
    ? allTopics.filter((t) => t.folderId === currentFolderId)
    : allTopics.filter((t) => !t.folderId);

  // Una sola píldora por materia (distintos textos pueden apuntar a la misma materia)
  const activeSubjects = Array.from(
    new Map(
      visibleTopics
        .filter((t) => !t.isFolder)
        .map((t) => getSubjectInfo(t.subject))
        .map((info) => [info.id, info] as const)
    ).values()
  );

  const headerHtml = `
    <div class="nbv-head">
      <div>
        <h1 class="nbv-title">${currentFolder ? escapeHtml(currentFolder.title) : 'Mis cuadernos'}</h1>
        <p class="nbv-sub">${
          currentFolder
            ? escapeHtml(currentFolder.description || 'Cuadernos organizados dentro de esta carpeta.')
            : visibleTopics.length > 0
            ? `${visibleTopics.length} ${visibleTopics.length === 1 ? 'cuaderno' : 'cuadernos'} · toca uno para seguir donde lo dejaste`
            : 'Crea tu primer cuaderno para empezar a estudiar.'
        }</p>
      </div>
      <div class="nbv-actions">
        <button class="nbv-btn soft btn-toggle-orientation" title="Rotar pantalla (horizontal / vertical)" aria-label="Rotar pantalla" style="padding:12px 14px;">🔄</button>
        <button class="nbv-btn ai" id="btn-open-feynman-diagnostic"><span>🔬</span><span>Ruta Feynman IA</span></button>
      </div>
    </div>
  `;

  const crumbsHtml = currentFolder
    ? `<div class="nbv-crumbs">
         <button class="btn-breadcrumb-root" type="button">🏠 Todos los cuadernos</button>
         <span>/</span>
         <span style="color:#fff3df; font-weight:800;">📁 ${escapeHtml(currentFolder.title)}</span>
       </div>`
    : '';

  const orphanGuides = savedFeynmanGuides.filter(
    (g) =>
      !allTopics.some(
        (t) =>
          t.feynmanGuideId === g.id ||
          (!t.isFolder && displayTitleOf(t).trim().toLowerCase() === g.topic.trim().toLowerCase())
      )
  );

  const routesHtml =
    orphanGuides.length > 0 && !currentFolder
      ? `<div class="nbv-routes">
           <span class="nbv-routes-label">Rutas sin cuaderno</span>
           ${orphanGuides
             .map(
               (g) => `<button class="nbv-route btn-open-saved-feynman" data-guide-id="${g.id}" type="button">
                 <span>🔬 ${escapeHtml(g.topic)}</span><small>${g.levelsCount}L</small>
               </button>`
             )
             .join('')}
         </div>`
      : '';

  const toolbarHtml =
    visibleTopics.length > 0
      ? `<div class="nbv-toolbar">
           <label class="nbv-search">
             <span style="opacity:0.6;">🔍</span>
             <input type="text" id="input-search-notebooks" placeholder="Buscar cuaderno…" />
           </label>
           ${
             activeSubjects.length > 1
               ? `<div class="nbv-pills" id="notebooks-filter-pills">
                    <button class="nbv-pill notebook-subject-filter-btn active" data-subject-filter="ALL">Todos</button>
                    ${activeSubjects
                      .map(
                        (s) => `<button class="nbv-pill notebook-subject-filter-btn" data-subject-filter="${escapeAttr(s.name)}">${s.icon} ${escapeHtml(s.name)}</button>`
                      )
                      .join('')}
                  </div>`
               : ''
           }
         </div>`
      : '';

  const shelfHtml =
    visibleTopics.length > 0
      ? `<div class="nb-shelf" id="notebooks-shelf-grid">
           ${visibleTopics.map((t) => (t.isFolder ? renderFolderItem(t) : renderNotebookItem(t))).join('')}
           <div class="nb-item nb-add" id="btn-shelf-add">
             <div class="nb-book"><div class="nb-add-cover"><b>＋</b><span>Nuevo cuaderno</span></div></div>
             <div class="nb-caption"></div>
           </div>
         </div>`
      : `<div class="nbv-empty">
           <div class="nbv-empty-book">${currentFolder ? '📁' : '📓'}</div>
           <h2>${currentFolder ? 'Esta carpeta está vacía' : 'Tu estantería está vacía'}</h2>
           <p>${
             currentFolder
               ? 'Crea un cuaderno aquí dentro para organizar tus asignaturas.'
               : 'Empieza con una ruta Feynman guiada por IA (cuaderno + flashcards en un solo paso) o abre un cuaderno en blanco.'
           }</p>
           <div class="nbv-empty-actions">
             ${currentFolder ? '' : '<button class="nbv-btn ai" id="btn-empty-feynman"><span>🔬</span><span>Crear con Feynman IA</span></button>'}
             <button class="nbv-btn gold" id="btn-empty-create-notebook"><span>📓</span><span>Cuaderno en blanco</span></button>
             ${
               currentFolder
                 ? '<button class="nbv-btn soft btn-breadcrumb-root">← Volver</button>'
                 : `<button class="nbv-btn soft" id="btn-load-neuro-demo">🧪 Probar demo</button>`
             }
           </div>
         </div>`;

  return `
    <div class="nbv">
      ${headerHtml}
      ${crumbsHtml}
      ${routesHtml}
      ${toolbarHtml}
      ${shelfHtml}
    </div>
  `;
}

/**
 * Pantalla de trabajo de un cuaderno abierto: enruta según la fase
 * lectura (hoja con renglones) → esquema ciego → consolidación.
 */
function renderSelectedTopicWorkspace(topic: ActiveStudyTopic, userCoins: number): string {
  const state = topic.state;
  const currentChunk = topic.chunks[topic.currentChunkIndex] || topic.chunks[0];

  if (!currentChunk) {
    return renderBenchDesk(
      topic,
      `<div class="apple-glass-panel" style="padding:32px; text-align:center; color:#fff;">Este cuaderno aún no tiene páginas.</div>`,
      '📓 Cuaderno vacío',
      ''
    );
  }

  // Obtener tarjetas asociadas a este tema
  const cardsTopic = deckService.getCardsByDeck(topic.id, true);
  const cardsDeck = topic.deckId ? deckService.getCardsByDeck(topic.deckId, false) : [];
  const mergedCards = [...cardsTopic, ...cardsDeck].filter((c, idx, self) => self.findIndex((x) => x.id === c.id) === idx);
  const currentChunkCards = mergedCards.filter((c) => c.chunkId === currentChunk.id);

  if (state === 'TOPIC_CONSOLIDATED') {
    return renderBenchDesk(topic, renderConsolidatedScreen(topic, userCoins, mergedCards), '🧠 Consolidación', 'green');
  }

  if (state === 'BUILDING_OUTLINE') {
    return renderBenchDesk(topic, renderOutlineBuildingScreen(topic, currentChunk, currentChunkCards), '🌳 Esquema ciego', 'purple');
  }

  const linkedDeck = topic.deckId ? deckService.getDeckById(topic.deckId) : null;
  return renderCenteredAtomicReadingScreen(topic, currentChunk, currentChunkCards, linkedDeck ? linkedDeck.name : '', mergedCards);
}

/**
 * Marco común (barra superior + escritorio) para las pantallas intermedias del cuaderno
 */
function renderBenchDesk(topic: ActiveStudyTopic, innerHtml: string, chipText: string, chipClass: string): string {
  return `
    <div class="pg-desk active-study-topic-workspace" data-topic-id="${topic.id}">
      <header class="pg-bar">
        <div class="pg-bar-left">
          <button class="pg-exit btn-back-to-notebooks" type="button">← Cuadernos</button>
          <span class="pg-chip ${chipClass}">${chipText}</span>
        </div>
        <div class="pg-bar-right">
          <button class="pg-round btn-toggle-orientation" title="Rotar pantalla" type="button">🔄</button>
          <button class="pg-round btn-open-topic-mindmap" data-topic-id="${topic.id}" title="Abrir mapa mental" type="button">🧠</button>
        </div>
      </header>
      <div class="pg-bench">${innerHtml}</div>
    </div>
  `;
}

/**
 * Normaliza un texto para comparar títulos sin ruido (emojis, números, palabras de rotulado)
 */
function normalizeForCompare(s: string): string {
  return s
    .toLowerCase()
    .replace(/átomo|atomo|subnivel|nivel|paso|bloque|página|pagina/g, ' ')
    .replace(/[^\p{L}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Quita del contenido el primer encabezado cuando solo repite el título de la página
 * (p. ej. "### Subnivel 1.1: X" bajo el título "X"), y limpia "## # Nivel" → "## Nivel".
 */
function stripRepeatedHeading(content: string, pageTitle: string): string {
  let text = content.replace(/^(\s*#{1,6})\s+#\s+/, '$1 ');
  const lines = text.split('\n');
  const firstIdx = lines.findIndex((l) => l.trim().length > 0);
  if (firstIdx === -1) return text;

  const m = lines[firstIdx].match(/^\s*#{1,6}\s+(.*)$/);
  if (!m) return text;

  const head = normalizeForCompare(m[1]);
  const title = normalizeForCompare(pageTitle);
  if (!head || !title) return text;

  const same = head === title || (head.length >= 6 && title.includes(head)) || (title.length >= 6 && head.includes(title));
  if (!same) return text;

  lines.splice(firstIdx, 1);
  // Quitar la línea en blanco que quedó al inicio
  while (lines.length && lines[0].trim() === '') lines.shift();
  return lines.join('\n');
}

interface PageParts {
  chipText: string;
  chipClass: string;
  title: string; // vacío = no mostrar título (páginas genéricas)
  content: string;
}

/**
 * Descompone el título del bloque en "chip" (tipo de página), título legible y contenido sin repeticiones.
 * Así cada dato aparece una sola vez: tipo arriba, título en la hoja, posición en el rótulo.
 */
function buildPageParts(chunk: StudyChunk): PageParts {
  const raw = chunk.title;
  let chipText = '📄 Apuntes';
  let chipClass = '';
  let title = raw;

  const atom = raw.match(/^Átomo\s*([\d.]+)\s*[:.-]\s*(?:Subnivel\s*[\d.]+\s*[:.-]\s*)?(.*)$/i);

  if (atom) {
    chipText = `🔬 Átomo ${atom[1]}`;
    title = atom[2].trim() || raw;
  } else if (raw.includes('Visión Holística') || raw.includes('Hoja de Ruta') || raw.includes('Problemática Global')) {
    chipText = '🗺️ Hoja de ruta';
    chipClass = 'purple';
    title = raw.replace(/^[^\p{L}\p{N}]+/u, '').replace(/^Hoja de Ruta:\s*/i, '');
  } else if (raw.includes('Propósito') || raw.includes('Axioma Central')) {
    const lvl = raw.match(/Nivel\s*(\d+)/i);
    chipText = lvl ? `🎯 Nivel ${lvl[1]}` : '🎯 Propósito';
    title = raw.replace(/^[^\p{L}\p{N}]+/u, '').replace(/^Nivel\s*\d+:\s*/i, '');
  } else if (raw.includes('Puente Conector') || raw.includes('Puente Inter-Nivel')) {
    chipText = '🌉 Puente';
    chipClass = 'green';
    title = raw.replace(/^[^\p{L}\p{N}]+/u, '').replace(/:?\s*Puente Conector Inter-Nivel/i, '').trim() || 'Del nivel anterior al siguiente';
  } else if (raw.includes('Transición Sinérgica')) {
    chipText = '🔗 Transición';
    chipClass = 'green';
    title = raw.replace(/^[^\p{L}\p{N}]+/u, '').replace(/^Transición Sinérgica:\s*/i, '');
  } else if (raw.includes('Examen Final')) {
    chipText = '🎓 Examen final';
    chipClass = 'gold';
    title = raw.replace(/^[^\p{L}\p{N}]+/u, '').replace(/^Examen Final:\s*/i, '');
  } else if (/^(Página|Pagina|Bloque)\s*\d+\s*[:.-]?\s*(.*)$/i.test(raw)) {
    // Título genérico ("Página 1"): la hoja ya dice "Página N de M", no se repite
    const generic = raw.match(/^(?:Página|Pagina|Bloque)\s*\d+\s*[:.-]?\s*(.*)$/i);
    title = (generic?.[1] || '').trim();
  }

  let content = stripRepeatedHeading(chunk.sourceContent, title || raw);

  // La fórmula aparece primero como viñeta "(FORMALISMO MATEMÁTICO)" y otra vez en su bloque 📐: se muestra una sola vez
  if (/📐\s*\*\*Formalismo/i.test(content)) {
    content = content.replace(/^\s*[-*•]\s*\*\*\(?FORMALISMO\s*MATEM[AÁ]TICO(?:\s*EUREKA)?\)?:?\*\*:?.*\n?/gim, '');
  }

  return { chipText, chipClass, title, content };
}

/**
 * MODO LECTURA: una hoja de cuaderno con renglones, margen y espiral, bajo la luz de tu lámpara.
 * Solo lo esencial: leer, agregar flashcard, ver mapa y pasar de página.
 */
function renderCenteredAtomicReadingScreen(
  topic: ActiveStudyTopic,
  chunk: StudyChunk,
  chunkCards: Flashcard[],
  _deckName: string,
  _mergedCards: Flashcard[]
): string {
  const parts = buildPageParts(chunk);

  const isRoadmapChunk = chunk.title.includes('Visión Holística') || chunk.title.includes('Hoja de Ruta') || chunk.title.includes('Problemática Global');
  const isPurposeAxiomChunk = chunk.title.includes('Propósito') || chunk.title.includes('Axioma Central');
  const isBridgeChunk = chunk.title.includes('Puente Conector') || chunk.title.includes('Puente Inter-Nivel');
  const isAtomTransitionChunk = chunk.title.includes('Transición Sinérgica: Átomo');

  const isLast = topic.currentChunkIndex + 1 >= topic.chunks.length;
  let nextBtnText = isLast ? 'Terminar y armar mi esquema' : 'Pasar de página';
  if (isRoadmapChunk) nextBtnText = 'Ir al Nivel 1';
  else if (isPurposeAxiomChunk) nextBtnText = 'Entrar al desglose';
  else if (isBridgeChunk) nextBtnText = 'Cruzar al siguiente nivel';
  else if (isAtomTransitionChunk) nextBtnText = 'Siguiente átomo';

  const progressPercent = Math.round(((topic.currentChunkIndex + 1) / topic.chunks.length) * 100);

  // Pestañas separadoras del cuaderno (máx. 12) que indican el avance
  const tabCount = Math.min(topic.chunks.length, 12);
  const palette = ['#ef4444', '#f59e0b', '#10b981', '#38bdf8', '#a855f7', '#ec4899'];
  const currentTabIdx = Math.min(tabCount - 1, Math.floor((topic.currentChunkIndex / topic.chunks.length) * tabCount));
  const tabsHtml = Array.from({ length: tabCount })
    .map(
      (_, i) =>
        `<span class="pg-tab ${i < currentTabIdx ? 'done' : ''} ${i === currentTabIdx ? 'current' : ''}" style="--tab:${palette[i % palette.length]};"></span>`
    )
    .join('');

  return `
    <div class="pg-desk" data-topic-id="${topic.id}">
      <div class="pg-progress" style="width: ${progressPercent}%;"></div>

      <header class="pg-bar">
        <div class="pg-bar-left">
          <button class="pg-exit" id="btn-exit-atomic-reading" type="button" title="Salir (se guarda tu avance)">✕ Salir</button>
          <span class="pg-chip ${parts.chipClass}">${parts.chipText}</span>
          <span class="pg-notebook-name">${escapeHtml(displayTitleOf(topic))}</span>
        </div>
        <div class="pg-bar-right">
          <button class="pg-round btn-toggle-orientation" type="button" title="Rotar pantalla">🔄</button>
        </div>
      </header>

      <div class="pg-wrap">
        <div class="pg-tabs">${tabsHtml}</div>
        <article class="pg-sheet" id="pg-sheet">
          <div class="pg-spiral"></div>
          <div class="pg-ribbon"></div>

          <div class="pg-kicker">Página ${topic.currentChunkIndex + 1} de ${topic.chunks.length}</div>
          ${parts.title ? `<h2 class="pg-title">${escapeHtml(parts.title)}</h2>` : '<div style="height:10px;"></div>'}

          <div class="pg-content">
            ${feynmanSandboxService.renderContentWithSandboxes(parts.content, parts.title || chunk.title)}
          </div>

          <div class="pg-tools">
            <button class="pg-tool" id="btn-atomic-add-card" type="button" title="Crear flashcard para esta página">
              <span>➕ Agregar flashcard</span>
              <span class="count">${chunkCards.length}</span>
            </button>
            <button class="pg-tool" id="btn-atomic-continue-mindmap" type="button" title="Ver el mapa mental de este cuaderno">
              <span>🧠 Mapa mental</span>
            </button>
          </div>

          <div class="pg-foot">
            <button class="pg-next" id="btn-atomic-next" type="button">
              <span>${nextBtnText}</span>
              <span class="arrow">➔</span>
            </button>
          </div>
        </article>
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
                  <div style="color:var(--f-text-secondary); font-size:0.9rem; line-height:1.5;">${feynmanSandboxService.renderContentWithSandboxes(c.sourceContent, c.title)}</div>
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

  // 1. Creación: todo pasa por el hub único (main.ts escucha este evento)
  const emitCreate = (choice: string) => {
    nativeService.triggerHaptics('medium');
    window.dispatchEvent(new CustomEvent('eureka:create', { detail: { choice, context: 'notebooks' } }));
  };

  container.querySelector('#btn-open-create-hub')?.addEventListener('click', () => emitCreate('hub'));
  container.querySelector('#btn-create-study-topic')?.addEventListener('click', () => emitCreate('hub'));
  container.querySelector('#btn-empty-create-notebook')?.addEventListener('click', () => emitCreate('notebook'));
  container.querySelector('#btn-empty-feynman')?.addEventListener('click', () => emitCreate('feynman'));
  container.querySelector('#btn-open-feynman-diagnostic')?.addEventListener('click', () => emitCreate('feynman'));
  container.querySelector('#btn-shelf-add')?.addEventListener('click', () => emitCreate('hub'));

  container.querySelectorAll<HTMLElement>('.btn-open-saved-feynman').forEach((card) => {
    card.addEventListener('click', () => {
      const gid = card.dataset.guideId;
      if (gid) {
        const guide = feynmanLlmService.getGuideById(gid);
        if (guide) {
          nativeService.triggerHaptics('light');
          openFeynmanGuideViewerModal({
            guide,
            onOpenTopic: (topicId) => {
              openStudyNotebook(topicId);
              onSelectTopic(topicId);
              onRefresh();
            },
            onOpenDeck: (deckId) => {
              window.dispatchEvent(new CustomEvent('eureka:open-deck', { detail: { deckId } }));
            }
          });
        }
      }
    });
  });

  // 2. Búsqueda y filtro en vivo sobre la estantería
  const searchInput = container.querySelector('#input-search-notebooks') as HTMLInputElement | null;
  const filterPills = container.querySelectorAll<HTMLButtonElement>('.notebook-subject-filter-btn');
  let currentSubjectFilter = 'ALL';

  const applyNotebookFilters = () => {
    const query = searchInput?.value.toLowerCase().trim() || '';
    container.querySelectorAll<HTMLElement>('.nb-item[data-search]').forEach((item) => {
      const blob = item.dataset.search || '';
      const subj = item.dataset.subject || '';
      const matchesQuery = !query || blob.includes(query);
      const matchesSubj =
        currentSubjectFilter === 'ALL' || item.classList.contains('is-folder') || subj.toLowerCase() === currentSubjectFilter.toLowerCase();
      item.style.display = matchesQuery && matchesSubj ? '' : 'none';
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

  // 3. Un toque en un cuaderno lo abre; un toque en una carpeta entra en ella; ⋯ abre el menú
  container.querySelectorAll<HTMLElement>('.nb-item[data-notebook-id], .nb-item[data-folder-id]').forEach((item) => {
    item.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.nb-menu-btn')) return;

      const folderId = item.dataset.folderId;
      if (folderId) {
        nativeService.triggerHaptics('light');
        currentFolderId = folderId;
        onRefresh();
        return;
      }

      const tid = item.dataset.notebookId;
      if (!tid) return;
      const t = activeStudyService.getTopicById(tid);
      if (!t) return;
      nativeService.triggerHaptics('medium');
      openStudyNotebook(tid);
      onSelectTopic(tid);
      onRefresh();
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.nb-menu-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tid = btn.dataset.topicId;
      if (!tid) return;
      const t = activeStudyService.getTopicById(tid);
      if (!t) return;
      nativeService.triggerHaptics('light');
      openNotebookActionSheet(t, {
        onRefresh,
        onSelectTopic,
        onOpenMindMap
      });
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.btn-breadcrumb-root').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentFolderId = null;
      onRefresh();
    });
  });

  // Alternar orientación nativa de pantalla (horizontal / vertical)
  container.querySelectorAll<HTMLButtonElement>('.btn-toggle-orientation').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const isLandscape = await nativeService.toggleScreenOrientation();
      dialogService.showAlert({
        title: 'Orientación de Pantalla',
        message: isLandscape
          ? '📱 Modo horizontal (paisaje) activado para lectura amplia y estudio descansado.'
          : '📱 Modo vertical (retrato) restaurado.'
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

  container.querySelector('#btn-exit-atomic-reading')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    nativeService.triggerHaptics('light');
    const chunkTitle = topic.chunks[topic.currentChunkIndex]?.title || `Átomo ${topic.currentChunkIndex + 1}`;
    dialogService.showConfirm({
      title: '¿Estás seguro de salir?',
      message: `Tu avance se guardará exactamente en "${chunkTitle}" para que retomes el estudio donde te quedaste.`,
      confirmText: 'Sí, salir',
      cancelText: 'Seguir estudiando',
      onConfirm: () => {
        activeStudyService.setCurrentChunk(topic.id, topic.currentChunkIndex);
        activeStudyingTopicId = null;
        onRefresh();
      }
    });
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


  container.querySelector('#btn-atomic-next')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget as HTMLButtonElement;
    if (btn.disabled) return;
    btn.disabled = true;
    nativeService.triggerHaptics('light');

    const goNext = () => {
      if (topic.currentChunkIndex + 1 < topic.chunks.length) {
        activeStudyService.setCurrentChunk(topic.id, topic.currentChunkIndex + 1);
      } else {
        activeStudyService.updateTopicState(topic.id, 'BUILDING_OUTLINE');
      }
      onRefresh();
    };

    // Animación de pasar la página antes de mostrar la siguiente
    const sheet = container.querySelector('#pg-sheet');
    if (sheet) {
      sheet.classList.add('turn-out');
      window.setTimeout(goNext, 300);
    } else {
      goNext();
    }
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
    const cardsTopic = deckService.getCardsByDeck(topic.id, true);
    const cardsDeck = topic.deckId ? deckService.getCardsByDeck(topic.deckId, false) : [];
    const mergedCards = [...cardsTopic, ...cardsDeck].filter((c, idx, self) => self.findIndex((x) => x.id === c.id) === idx);
    const isLastChunk = topic.currentChunkIndex + 1 >= topic.chunks.length;

    if (isLastChunk && mergedCards.length < 3) {
      nativeService.triggerHaptics('heavy');
      dialogService.showAlert({
        title: '⚠️ Mínimo 3 Flashcards Requeridas',
        message: `Para finalizar y consolidar este nivel, la metodología exige un mínimo de 3 flashcards creadas (actualmente tienes ${mergedCards.length} de 3).\n\nPor favor crea las tarjetas que faltan para asegurar tu retención a largo plazo.`,
        buttonText: 'Crear Flashcard Ahora',
        onConfirm: () => {
          const targetDeckId = topic.deckId || (deckService.getAllDecks()[0]?.id || 'deck-default');
          if (onOpenCardCreator) {
            onOpenCardCreator(targetDeckId, currentChunk?.id);
          } else if (currentChunk) {
            openAddFlashcardModal(topic, currentChunk, () => {
              onRefresh();
            });
          }
        }
      });
      return;
    }

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
 * Abre un cuaderno directamente en modo lectura (y le asegura un mazo de flashcards)
 */
export function openStudyNotebook(topicId: string): void {
  const topic = activeStudyService.getTopicById(topicId);
  if (!topic || topic.isFolder) return;
  ensureDeckForTopic(topic);
  activeStudyingTopicId = topicId;
}

export function closeStudyNotebook(): void {
  activeStudyingTopicId = null;
}

/**
 * Garantiza que el cuaderno tenga un mazo real vinculado.
 * Si no lo tiene, crea uno con su mismo nombre: el usuario ya no tiene que "vincular" nada a mano.
 */
function ensureDeckForTopic(topic: ActiveStudyTopic): string {
  const linked = topic.deckId ? deckService.getDeckById(topic.deckId) : null;
  if (linked && !deckService.isFolder(linked)) return linked.id;

  const info = getSubjectInfo(topic.subject);
  const deck = deckService.createDeck({
    name: displayTitleOf(topic),
    icon: 'deck',
    color: topic.color || info.color || '#38bdf8'
  });
  activeStudyService.updateTopic(topic.id, { deckId: deck.id });
  return deck.id;
}

function confirmDeleteTopic(topic: ActiveStudyTopic, onDone: () => void): void {
  const isFolder = Boolean(topic.isFolder);
  dialogService.showConfirm({
    title: isFolder ? `¿Eliminar la carpeta “${topic.title}”?` : `¿Eliminar “${displayTitleOf(topic)}”?`,
    message: isFolder
      ? 'Los cuadernos que contiene NO se borran: volverán a tu estantería principal.'
      : 'Se borra el cuaderno y su esquema. Las flashcards se conservan en su mazo vinculado.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    isDanger: true,
    onConfirm: () => {
      if (isFolder) {
        activeStudyService.getFolderContents(topic.id).forEach((child) => activeStudyService.moveTopicToFolder(child.id, null));
      }
      activeStudyService.deleteTopic(topic.id);
      if (activeStudyingTopicId === topic.id) activeStudyingTopicId = null;
      if (currentFolderId === topic.id) currentFolderId = null;
      onDone();
    }
  });
}

interface ActionSheetContext {
  onRefresh: () => void;
  onSelectTopic: (topicId: string) => void;
  onOpenMindMap?: (topicId?: string) => void;
}

/**
 * Menú ⋯ de un cuaderno o carpeta: todas las acciones secundarias en un solo lugar
 */
function openNotebookActionSheet(topic: ActiveStudyTopic, ctx: ActionSheetContext): void {
  document.getElementById('nb-action-sheet')?.remove();

  interface Item {
    icon: string;
    label: string;
    sub?: string;
    danger?: boolean;
    run: () => void;
  }

  const items: Item[] = [];
  const info = getSubjectInfo(topic.subject);

  if (topic.isFolder) {
    items.push({
      icon: '📂',
      label: 'Abrir carpeta',
      run: () => {
        currentFolderId = topic.id;
        ctx.onRefresh();
      }
    });
    items.push({
      icon: '✏️',
      label: 'Renombrar',
      run: () => {
        dialogService.showPrompt({
          title: 'Renombrar carpeta',
          placeholder: topic.title,
          confirmText: 'Guardar',
          onConfirm: (name) => {
            if (name && name.trim()) {
              activeStudyService.updateTopic(topic.id, { title: name.trim() });
              ctx.onRefresh();
            }
          }
        });
      }
    });
  } else {
    items.push({
      icon: '📖',
      label: topic.state === 'TOPIC_CONSOLIDATED' ? 'Repasar cuaderno' : 'Estudiar / continuar',
      sub: 'Abrir en modo lectura',
      run: () => {
        openStudyNotebook(topic.id);
        ctx.onSelectTopic(topic.id);
        ctx.onRefresh();
      }
    });
    items.push({
      icon: '🧠',
      label: 'Mapa mental',
      sub: 'Ver el esquema como mapa',
      run: () => ctx.onOpenMindMap?.(topic.id)
    });
    items.push({
      icon: '✏️',
      label: 'Personalizar',
      sub: 'Nombre, color, emoji, portada',
      run: () => openEditNotebookModal(topic, () => ctx.onRefresh())
    });
    items.push({
      icon: '🎴',
      label: 'Cambiar mazo de flashcards',
      sub: 'Vinculado: ' + (topic.deckId ? deckService.getDeckById(topic.deckId)?.name || 'ninguno' : 'ninguno'),
      run: () => openLinkTopicDeckModal(topic, () => ctx.onRefresh())
    });
    if (activeStudyService.getAllFolders().length > 0 || topic.folderId) {
      items.push({
        icon: '📥',
        label: 'Mover a carpeta',
        run: () => openMoveToFolderModal(topic, () => ctx.onRefresh())
      });
    }
    items.push({
      icon: '📁',
      label: 'Convertir en carpeta',
      sub: 'Para agrupar otros cuadernos',
      run: () => {
        dialogService.showConfirm({
          title: '📁 Convertir en carpeta',
          message: `“${displayTitleOf(topic)}” pasará a ser una carpeta donde podrás organizar varios cuadernos.`,
          confirmText: 'Convertir',
          onConfirm: () => {
            activeStudyService.convertTopicToFolder(topic.id);
            ctx.onRefresh();
          }
        });
      }
    });
  }

  items.push({
    icon: '🗑️',
    label: 'Eliminar',
    danger: true,
    run: () => confirmDeleteTopic(topic, () => ctx.onRefresh())
  });

  const root = document.createElement('div');
  root.id = 'nb-action-sheet';
  root.className = 'as-overlay';
  root.innerHTML = `
    <div class="as-sheet" role="dialog" aria-modal="true">
      <div class="as-head">
        <span class="as-head-emoji">${escapeHtml(topic.emoji || (topic.isFolder ? '📁' : info.icon))}</span>
        <div style="min-width:0;">
          <div class="as-head-title">${escapeHtml(displayTitleOf(topic))}</div>
          <div class="as-head-sub">${topic.isFolder ? 'Carpeta' : escapeHtml(info.name)}</div>
        </div>
      </div>
      ${items
        .map(
          (it, i) => `
        <button class="as-item ${it.danger ? 'danger' : ''}" data-i="${i}" type="button">
          <span class="ico">${it.icon}</span>
          <span><span>${it.label}</span>${it.sub ? `<small>${escapeHtml(it.sub)}</small>` : ''}</span>
        </button>`
        )
        .join('')}
    </div>
  `;
  document.body.appendChild(root);

  const close = () => {
    root.remove();
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKey);
  root.addEventListener('click', (e) => {
    if (e.target === root) close();
  });

  root.querySelectorAll<HTMLElement>('.as-item').forEach((el) => {
    el.addEventListener('click', () => {
      const i = parseInt(el.dataset.i || '0', 10);
      close();
      items[i]?.run();
    });
  });
}

const NOTEBOOK_COLORS = ['', '#1e3a8a', '#7f1d1d', '#14532d', '#581c87', '#9a3412', '#0f766e', '#374151', '#be185d', '#a16207', '#1d4ed8', '#292524'];

/**
 * Crear cuaderno en una sola hoja: nombre, materia y color con vista previa en vivo.
 * Al crearlo, su mazo de flashcards se genera y se vincula solo.
 */
function openCreateNotebookModal(onCreated: (topicId: string) => void): void {
  document.getElementById('nc-root')?.remove();

  let name = '';
  let subjectName = 'General / Otra';
  let color = '';
  let photo: string | undefined;

  const root = document.createElement('div');
  root.id = 'nc-root';
  root.className = 'nc-overlay';
  root.innerHTML = `
    <div class="nc-sheet" role="dialog" aria-modal="true" aria-label="Nuevo cuaderno">
      <div class="nc-preview">
        <div id="nc-preview-book"></div>
        <div class="nc-colors" id="nc-colors">
          ${NOTEBOOK_COLORS.map(
            (c) =>
              `<span class="nc-swatch ${c === color ? 'active' : ''}" data-color="${c}" title="${c ? c : 'Color según materia'}" style="background:${
                c || 'conic-gradient(#f43f5e, #f59e0b, #10b981, #38bdf8, #a855f7, #f43f5e)'
              };"></span>`
          ).join('')}
        </div>
      </div>

      <div class="nc-form">
        <div>
          <h3>Nuevo cuaderno</h3>
        </div>
        <div class="nc-sub">Se crea con su mazo de flashcards ya vinculado. Sin pasos extra.</div>

        <div>
          <span class="fw-label">Nombre</span>
          <input class="fw-input" id="nc-name" type="text" autocomplete="off" placeholder="Ej: Biología celular, Macroeconomía…" />
        </div>

        <div>
          <span class="fw-label">Materia</span>
          <div class="fw-chips scroll" id="nc-subjects" style="margin:0; padding-left:0; padding-right:0;">
            ${POPULAR_SUBJECTS.map(
              (s) => `<button type="button" class="fw-chip ${s.name === subjectName ? 'active' : ''}" data-subject="${escapeAttr(s.name)}"><span>${s.icon}</span>${escapeHtml(s.name)}</button>`
            ).join('')}
          </div>
        </div>

        <details class="fw-more">
          <summary>Más opciones</summary>
          <div class="fw-more-body">
            <div>
              <span class="fw-label">Descripción</span>
              <textarea class="fw-textarea" id="nc-desc" style="min-height:60px;" placeholder="Breve descripción o temario (opcional)"></textarea>
            </div>
            <div>
              <span class="fw-label">Apuntes iniciales</span>
              <textarea class="fw-textarea" id="nc-content" placeholder="Pega apuntes para trocearlos en páginas (opcional)…"></textarea>
            </div>
            <div>
              <span class="fw-label">Portada con foto</span>
              <input type="file" id="nc-photo-file" accept="image/*" style="display:none;" />
              <div class="fw-ai-row">
                <button type="button" class="fw-btn ghost" id="nc-photo-btn" style="padding:9px 14px; font-size:0.82rem;">📷 Elegir foto</button>
                <button type="button" class="fw-link hidden" id="nc-photo-remove">Quitar foto</button>
              </div>
            </div>
          </div>
        </details>

        <div class="nc-actions">
          <button type="button" class="fw-btn ghost" id="nc-cancel">Cancelar</button>
          <button type="button" class="fw-btn gold" id="nc-save">✨ Crear cuaderno</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const previewEl = root.querySelector('#nc-preview-book') as HTMLElement;
  const nameInput = root.querySelector('#nc-name') as HTMLInputElement;

  const renderPreview = () => {
    const info = getSubjectInfo(subjectName);
    const fake = { coverImage: photo, color: color || undefined } as ActiveStudyTopic;
    previewEl.innerHTML = `
      <div class="nb-item" style="--nb-bg: ${coverBackground(fake, info)};">
        <div class="nb-book">
          <div class="nb-pages"></div>
          <div class="nb-cover">
            <div class="nb-spine"></div>
            <div class="nb-band"></div>
            <div class="nb-label">
              <span class="nb-label-emoji">${escapeHtml(info.icon)}</span>
              <span class="nb-label-title">${escapeHtml(name.trim() || 'Mi cuaderno')}</span>
              <span class="nb-label-subject">${escapeHtml(info.name)}</span>
            </div>
            <div class="nb-cover-foot"><div class="nb-progress"><i style="width:0%;"></i></div><em>0%</em></div>
          </div>
        </div>
      </div>
    `;
  };
  renderPreview();

  const close = () => {
    root.remove();
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKey);
  root.addEventListener('mousedown', (e) => {
    if (e.target === root && !name.trim()) close();
  });
  root.querySelector('#nc-cancel')?.addEventListener('click', close);

  nameInput.addEventListener('input', () => {
    name = nameInput.value;
    renderPreview();
  });
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    }
  });
  setTimeout(() => nameInput.focus(), 120);

  root.querySelectorAll<HTMLElement>('#nc-subjects .fw-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      nativeService.triggerHaptics('light');
      subjectName = chip.dataset.subject || 'General / Otra';
      root.querySelectorAll('#nc-subjects .fw-chip').forEach((c) => c.classList.toggle('active', c === chip));
      renderPreview();
    });
  });

  root.querySelectorAll<HTMLElement>('#nc-colors .nc-swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      nativeService.triggerHaptics('light');
      color = sw.dataset.color || '';
      root.querySelectorAll('#nc-colors .nc-swatch').forEach((s) => s.classList.toggle('active', s === sw));
      renderPreview();
    });
  });

  // Foto de portada
  const fileInput = root.querySelector('#nc-photo-file') as HTMLInputElement;
  const photoBtn = root.querySelector('#nc-photo-btn') as HTMLButtonElement;
  const photoRemove = root.querySelector('#nc-photo-remove') as HTMLButtonElement;
  photoBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      photo = e.target?.result as string;
      photoBtn.textContent = '📷 Cambiar foto';
      photoRemove.classList.remove('hidden');
      renderPreview();
    };
    reader.readAsDataURL(file);
  });
  photoRemove.addEventListener('click', () => {
    photo = undefined;
    fileInput.value = '';
    photoBtn.textContent = '📷 Elegir foto';
    photoRemove.classList.add('hidden');
    renderPreview();
  });

  function save() {
    const finalName = name.trim();
    if (!finalName) {
      nameInput.classList.add('error');
      nameInput.focus();
      setTimeout(() => nameInput.classList.remove('error'), 1800);
      return;
    }

    const description = (root.querySelector('#nc-desc') as HTMLTextAreaElement).value.trim();
    const rawContent = (root.querySelector('#nc-content') as HTMLTextAreaElement).value.trim();

    let chunksData: { title: string; content: string }[] = [];
    let detectedGuide: any = null;

    if (
      rawContent &&
      (rawContent.includes('Nivel 1') ||
        rawContent.includes('Problemática Global') ||
        rawContent.includes('Propósito del Nivel') ||
        rawContent.includes('Axioma Central'))
    ) {
      try {
        detectedGuide = feynmanLlmService.importGuideFromMarkdown(rawContent, {
          topic: finalName,
          subject: subjectName,
          currentLevel: 1,
          targetGoal: 'general'
        });
        if (detectedGuide && detectedGuide.levels && detectedGuide.levels.length > 0) {
          chunksData = feynmanLlmService.buildActiveStudyChunksFromGuide(detectedGuide);
        }
      } catch (e) {
        console.warn('Fallback al troceado estándar de párrafos:', e);
      }
    }

    if (chunksData.length === 0) {
      const paragraphs = rawContent ? rawContent.split(/\n\s*\n/).filter((p) => p.trim().length > 0) : [];
      chunksData =
        paragraphs.length > 0
          ? paragraphs.map((p, idx) => ({ title: `Página ${idx + 1}`, content: p.trim() }))
          : [{ title: 'Página 1', content: description || `Notas principales de ${finalName}. Toca “Agregar flashcard” para empezar a estudiar.` }];
    }

    const newTopic = activeStudyService.createTopic('', finalName, chunksData, {
      description,
      coverImage: photo,
      subject: subjectName,
      color: color || undefined,
      folderId: currentFolderId,
      feynmanGuideId: detectedGuide?.id,
      rawMarkdown: rawContent
    });

    // El mazo se crea y se vincula solo
    ensureDeckForTopic(newTopic);

    nativeService.triggerHaptics('medium');
    close();
    onCreated(newTopic.id);
  }

  root.querySelector('#nc-save')?.addEventListener('click', save);
}

export const openCreateTopicModal = openCreateNotebookModal;
export const openCreateStudyFolder = (onCreated: () => void): void => openCreateFolderModal(onCreated);


/**
 * Requisito 5: Modal moderno para vincular un cuaderno a un mazo existente o crear uno nuevo.
 * Si se omite, informa al usuario que no podrá estudiar hasta vincularlo.
 */
function openLinkTopicDeckModal(topic: ActiveStudyTopic, onFinish?: () => void): void {
  const allRawDecks = deckService.getAllDecks().filter((d) => !d.isArchived);
  const folders = allRawDecks.filter((d) => deckService.isFolder(d));
  const realDecks = allRawDecks.filter((d) => !deckService.isFolder(d));

  // Asegurar que el mazo preseleccionado sea un mazo real (NUNCA una carpeta)
  let selectedDeckId: string = topic.deckId && realDecks.some((d) => d.id === topic.deckId)
    ? topic.deckId
    : (realDecks.length > 0 ? realDecks[0].id : '__create_new__');

  function renderDeckTile(d: any): string {
    const isSelected = selectedDeckId === d.id;
    const cardCount = deckService.getCardsByDeck(d.id, false).length;
    return `
      <div class="deck-select-tile ${isSelected ? 'active' : ''}" data-deck-id="${d.id}" data-deck-name="${escapeAttr(d.name.toLowerCase())}">
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
  }

  // Grupos por carpeta (solo para desplegar/plegar, nunca seleccionables como mazo)
  const folderGroupsHtml = folders
    .map((f) => {
      const childDecks = realDecks.filter((d) => d.parentId === f.id);
      return `
        <div class="deck-folder-accordion-wrap" data-folder-id="${f.id}" style="border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; background: rgba(255,255,255,0.02); margin-bottom: 8px;">
          <div class="deck-folder-header-btn" style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; cursor:pointer; background:rgba(255,255,255,0.04); user-select:none;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.15rem;">📁</span>
              <span style="font-size:0.88rem; font-weight:700; color:#fff;">${escapeHtml(f.name)}</span>
              <span style="font-size:0.75rem; color:var(--f-text-secondary); background:rgba(255,255,255,0.08); padding:2px 7px; border-radius:999px;">${childDecks.length} mazos</span>
            </div>
            <span class="folder-accordion-chevron" style="font-size:0.8rem; color:var(--f-text-secondary); transition:transform 0.2s ease;">▾</span>
          </div>
          <div class="deck-folder-contents" style="display:flex; flex-direction:column; gap:8px; padding:10px 12px;">
            ${childDecks.length > 0 
              ? childDecks.map((d) => renderDeckTile(d)).join('') 
              : '<span style="font-size:0.8rem; color:var(--f-text-secondary); font-style:italic; padding:4px 6px;">Esta carpeta no contiene ningún mazo de estudio.</span>'}
          </div>
        </div>
      `;
    })
    .join('');

  // Mazos independientes (sin carpeta)
  const rootDecks = realDecks.filter((d) => !d.parentId);
  const rootDecksHtml = rootDecks.map((d) => renderDeckTile(d)).join('');

  const modal = document.createElement('div');
  modal.className = 'apple-modal-overlay';
  modal.innerHTML = `
    <div class="apple-modal-content apple-glass-panel" style="max-width:580px; width:94%; padding:24px; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; border-radius:24px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.4rem;">🎴</span>
          <div>
            <h3 style="font-size:1.2rem; font-weight:800; color:#fff; margin:0;">Vincular Mazo de Flashcards</h3>
            <span style="font-size:0.78rem; color:var(--f-text-secondary);">Cuaderno: <strong>${escapeHtml(topic.title)}</strong></span>
          </div>
        </div>
        <button id="btn-close-deck-link-modal" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
      </div>

      <!-- Buscador rápido en tiempo real -->
      <div style="margin-bottom:10px;">
        <input 
          type="text" 
          id="input-link-deck-search" 
          placeholder="🔍 Buscar mazo por nombre..." 
          style="width:100%; box-sizing:border-box; background:#14151c; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px 14px; color:#fff; font-size:0.88rem; outline:none;"
        />
      </div>

      <div style="overflow-y:auto; padding-right:4px; display:flex; flex-direction:column; gap:14px; flex:1;">
        <div class="deck-linking-interactive-container">
          <!-- Opción destacada: Crear Nueva Baraja -->
          <div class="deck-select-tile deck-select-tile-new ${selectedDeckId === '__create_new__' ? 'active' : ''}" id="tile-link-create-new-deck" data-deck-id="__create_new__" style="margin-bottom:12px;">
            <div class="deck-tile-icon-wrap" style="background: rgba(168,85,247,0.15); border-color: rgba(168,85,247,0.4); color:#c084fc;">
              ✨
            </div>
            <div class="deck-tile-info">
              <span class="deck-tile-title">+ Crear Nueva Baraja</span>
              <span class="deck-tile-meta">Crear automáticamente con el nombre de este cuaderno</span>
            </div>
            <div class="deck-tile-check">✓</div>
          </div>

          <div class="deck-new-inline-card" id="deck-link-new-inline-card" style="${selectedDeckId === '__create_new__' ? 'display:block;' : 'display:none;'} margin-bottom:14px; padding:12px; background:rgba(0,0,0,0.25); border-radius:12px; border:1px solid rgba(255,255,200,0.08);">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <span style="font-size:1.1rem;">✨</span>
              <strong style="color:#fff; font-size:0.9rem;">Nombre de la Nueva Baraja:</strong>
            </div>
            <input 
              type="text" 
              id="input-link-inline-deck-name" 
              value="${escapeAttr(topic.title)}"
              placeholder="Nombre de la nueva baraja..." 
              style="width:100%; box-sizing:border-box; background:#14151c; border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:9px 12px; color:#fff; font-size:0.9rem; outline:none;"
            />
          </div>

          <!-- Carpetas desplegables/plegables -->
          ${folders.length > 0 ? `
            <div style="margin-bottom:12px;">
              <span style="display:block; font-size:0.75rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:8px;">Carpetas (Toca para desplegar mazos):</span>
              ${folderGroupsHtml}
            </div>
          ` : ''}

          <!-- Mazos independientes -->
          ${rootDecks.length > 0 ? `
            <div>
              <span style="display:block; font-size:0.75rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:8px;">Mazos Sin Carpeta:</span>
              <div class="deck-selection-grid" id="deck-link-selection-grid" style="display:flex; flex-direction:column; gap:8px;">
                ${rootDecksHtml}
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:14px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.08);">
        <button class="figma-btn-white-pill" id="btn-skip-deck-linking" style="background:rgba(255,255,255,0.06); color:var(--f-text-secondary); font-size:0.82rem;">
          Saltar por ahora (Sin mazo)
        </button>
        <button class="figma-btn-study-large" id="modal-btn-confirm-deck-link" style="width:auto; padding:10px 24px;">
          🔗 Confirmar y Vincular Mazo ➔
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const newDeckCard = modal.querySelector('#deck-link-new-inline-card') as HTMLElement;
  const newDeckInput = modal.querySelector('#input-link-inline-deck-name') as HTMLInputElement;
  const searchInput = modal.querySelector('#input-link-deck-search') as HTMLInputElement;

  // Filtrado de mazos en tiempo real
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    modal.querySelectorAll<HTMLElement>('.deck-select-tile:not(#tile-link-create-new-deck)').forEach((tile) => {
      const name = tile.dataset.deckName || '';
      tile.style.display = !q || name.includes(q) ? 'flex' : 'none';
    });

    if (q) {
      modal.querySelectorAll<HTMLElement>('.deck-folder-accordion-wrap').forEach((wrap) => {
        const contents = wrap.querySelector('.deck-folder-contents') as HTMLElement | null;
        const chevron = wrap.querySelector('.folder-accordion-chevron') as HTMLElement | null;
        if (contents) contents.style.display = 'flex';
        if (chevron) chevron.style.transform = 'rotate(180deg)';
      });
    }
  });

  // Plegar / Desplegar carpetas
  modal.querySelectorAll<HTMLElement>('.deck-folder-header-btn').forEach((header) => {
    header.addEventListener('click', () => {
      const wrap = header.closest('.deck-folder-accordion-wrap') as HTMLElement;
      const contents = wrap?.querySelector('.deck-folder-contents') as HTMLElement | null;
      const chevron = wrap?.querySelector('.folder-accordion-chevron') as HTMLElement | null;
      if (!contents) return;
      const isVisible = contents.style.display !== 'none';
      contents.style.display = isVisible ? 'none' : 'flex';
      if (chevron) chevron.style.transform = isVisible ? 'rotate(-90deg)' : 'rotate(0deg)';
    });
  });

  // Selección de mazo (NUNCA carpeta)
  modal.querySelectorAll<HTMLElement>('.deck-select-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      nativeService.triggerHaptics('light');
      const did = tile.dataset.deckId;
      if (!did) return;

      modal.querySelectorAll('.deck-select-tile').forEach((t) => t.classList.remove('active'));
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
  modal.querySelector('#btn-close-deck-link-modal')?.addEventListener('click', closeModal);

  // Saltar por ahora
  modal.querySelector('#btn-skip-deck-linking')?.addEventListener('click', () => {
    topic.deckId = '';
    activeStudyService.saveToStorage();
    closeModal();
    dialogService.showAlert({
      title: '⚠️ Cuaderno Sin Mazo',
      message: 'Has decidido no vincular este cuaderno a ningún mazo por ahora.\n\nTen en cuenta que no podrás estudiar este cuaderno hasta que lo vincules usando el botón "🔗 Vincular a Mazo" de su tarjeta.'
    });
    onFinish?.();
  });

  // Confirmar y Vincular
  modal.querySelector('#modal-btn-confirm-deck-link')?.addEventListener('click', () => {
    let finalDeckId = selectedDeckId;
    if (finalDeckId === '__create_new__') {
      const customName = newDeckInput.value.trim() || topic.title;
      const subjInfo = getSubjectInfo(topic.subject);
      const newDeck = deckService.createDeck({
        name: customName,
        icon: 'deck',
        isFolder: false,
        color: topic.color || subjInfo.color || '#38bdf8'
      });
      finalDeckId = newDeck.id;
    }

    const targetDeck = deckService.getDeckById(finalDeckId);
    if (!targetDeck || deckService.isFolder(targetDeck)) {
      dialogService.showAlert({
        title: '⚠️ Selección Inválida',
        message: 'No puedes vincular una carpeta como mazo de estudio. Por favor selecciona un mazo de tarjetas o crea uno nuevo.'
      });
      return;
    }

    topic.deckId = finalDeckId;
    activeStudyService.updateTopic(topic.id, { deckId: finalDeckId });
    activeStudyService.saveToStorage();
    nativeService.triggerHaptics('medium');
    closeModal();
    onFinish?.();
  });
}

export const openChangeTopicDeckModal = openLinkTopicDeckModal;

/**
 * Requisito 5: Modal de edición y personalización completa del Cuaderno
 * Modifica: nombre, descripción, categoría, mazo, foto de portada, color, emoji, tipografía, sonido
 */
function openEditNotebookModal(topic: ActiveStudyTopic, onSaved: () => void): void {
  const allDecks = deckService.getAllDecks().filter((d) => !deckService.isFolder(d));
  let chosenPhotoDataUrl: string | undefined = topic.coverImage;
  let chosenColor: string = topic.color || '#38bdf8';
  let chosenEmoji: string = topic.emoji || '📓';

  const COLOR_PRESETS = ['#38bdf8', '#818cf8', '#c084fc', '#34d399', '#fbbf24', '#f43f5e', '#f97316', '#e2e8f0'];
  const EMOJI_PRESETS = ['📓', '🧠', '⚡', '🔬', '📐', '🧪', '🧬', '💻', '🏛️', '📚', '🎨', '🎵', '🚀', '💡', '🌍', '⚙️', '📈', '⚖️', '🩺'];
  const FONT_OPTIONS = ['Inter', 'Outfit', 'Roboto', 'JetBrains Mono', 'Fira Code', 'Merriweather', 'Playfair Display'];
  const SOUND_THEMES = [
    { id: 'scifi', name: '⚡ Sci-Fi Futurista' },
    { id: 'zen', name: '🌸 Zen Minimalista' },
    { id: 'arcade', name: '🎮 Arcade Retro' },
    { id: 'minimal', name: '⚪ Minimal Suave' },
    { id: 'nature', name: '🍃 Naturaleza' }
  ];

  const modal = document.createElement('div');
  modal.className = 'apple-modal-overlay';
  modal.innerHTML = `
    <div class="apple-modal-content apple-glass-panel" style="max-width:580px; width:94%; padding:24px; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; border-radius:24px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.5rem;">✏️</span>
          <div>
            <h3 style="font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Personalizar Cuaderno</h3>
            <p style="font-size:0.8rem; color:var(--f-text-secondary); margin:2px 0 0 0;">Edita el diseño, tipografía, sonidos y metadatos</p>
          </div>
        </div>
        <button id="btn-close-edit-modal" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
      </div>

      <div style="overflow-y:auto; padding-right:4px; display:flex; flex-direction:column; gap:14px; flex:1;">
        <!-- 1. Nombre -->
        <div>
          <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; margin-bottom:6px;">
            Nombre del Cuaderno *
          </label>
          <input 
            type="text" 
            id="modal-edit-name" 
            value="${escapeAttr(topic.title)}"
            style="width:100%; box-sizing:border-box; background:#14151c; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:11px 14px; color:#fff; font-size:0.95rem; outline:none;"
          />
        </div>

        <!-- 2. Descripción -->
        <div>
          <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; margin-bottom:6px;">
            Descripción
          </label>
          <textarea 
            id="modal-edit-desc" 
            rows="2" 
            style="width:100%; box-sizing:border-box; background:#14151c; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px 14px; color:#fff; font-size:0.9rem; font-family:inherit; outline:none;"
          >${escapeHtml(topic.description || '')}</textarea>
        </div>

        <!-- 3. Categoría / Materia -->
        <div>
          <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; margin-bottom:6px;">
            Categoría / Materia
          </label>
          <select 
            id="modal-edit-subject" 
            style="width:100%; box-sizing:border-box; background:#14151c; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:11px 14px; color:#fff; font-size:0.92rem; outline:none; cursor:pointer;"
          >
            ${POPULAR_SUBJECTS.map((subj) => `<option value="${subj.name}" ${subj.name.toLowerCase() === (topic.subject || '').toLowerCase() ? 'selected' : ''}>${subj.icon} ${escapeHtml(subj.name)}</option>`).join('')}
          </select>
        </div>

        <!-- 4. Mazo de Flashcards Vinculado -->
        <div>
          <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; margin-bottom:6px;">
            Mazo de Flashcards Vinculado
          </label>
          <select 
            id="modal-edit-deck" 
            style="width:100%; box-sizing:border-box; background:#14151c; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:11px 14px; color:#fff; font-size:0.92rem; outline:none; cursor:pointer;"
          >
            <option value="" ${!topic.deckId ? 'selected' : ''}>⚠️ Sin mazo vinculado (Estudio bloqueado)</option>
            ${allDecks.map((d) => `<option value="${d.id}" ${d.id === topic.deckId ? 'selected' : ''}>🎴 ${escapeHtml(d.name)} (${deckService.getCardsByDeck(d.id, false).length} tarjetas)</option>`).join('')}
          </select>
        </div>

        <!-- 5. Emoji y Color de Acento -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; margin-bottom:6px;">
              Emoji Distintivo
            </label>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:6px;">
              ${EMOJI_PRESETS.slice(0, 10).map((em) => `<button type="button" class="btn-preset-emoji figma-btn-ghost" data-emoji="${em}" style="padding:4px 8px; font-size:1.1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">${em}</button>`).join('')}
            </div>
            <input type="text" id="modal-edit-emoji-input" value="${escapeAttr(chosenEmoji)}" style="width:100%; box-sizing:border-box; background:#14151c; border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:8px 12px; color:#fff; font-size:0.9rem;" />
          </div>

          <div>
            <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; margin-bottom:6px;">
              Color de Acento
            </label>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:6px;">
              ${COLOR_PRESETS.map((col) => `<button type="button" class="btn-preset-color" data-color="${col}" style="width:24px; height:24px; border-radius:50%; background:${col}; border:2px solid ${col === chosenColor ? '#fff' : 'transparent'}; cursor:pointer;"></button>`).join('')}
            </div>
            <input type="color" id="modal-edit-color-input" value="${chosenColor}" style="width:100%; height:38px; border:none; border-radius:10px; cursor:pointer; background:transparent;" />
          </div>
        </div>

        <!-- 6. Tipografía y Tema Sonoro -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; margin-bottom:6px;">
              Tipo de Letra (Fuente)
            </label>
            <select id="modal-edit-font" style="width:100%; box-sizing:border-box; background:#14151c; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px; color:#fff; font-size:0.88rem; outline:none; cursor:pointer;">
              ${FONT_OPTIONS.map((f) => `<option value="${f}" ${f.toLowerCase() === (topic.fontFamily || '').toLowerCase() ? 'selected' : ''}>${f}</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; margin-bottom:6px;">
              Tema de Sonido
            </label>
            <select id="modal-edit-sound" style="width:100%; box-sizing:border-box; background:#14151c; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px; color:#fff; font-size:0.88rem; outline:none; cursor:pointer;">
              ${SOUND_THEMES.map((s) => `<option value="${s.id}" ${s.id === topic.soundTheme ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- 7. Foto de Portada -->
        <div>
          <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--f-text-secondary); text-transform:uppercase; margin-bottom:6px;">
            Foto de Portada
          </label>
          <input type="file" id="modal-edit-photo-file" accept="image/*" style="display:none;" />
          <div id="modal-edit-photo-preview-wrap" style="${chosenPhotoDataUrl ? 'display:block;' : 'display:none;'} margin-bottom:8px; position:relative; border-radius:12px; overflow:hidden; max-height:140px; border:1px solid rgba(255,255,255,0.15);">
            <img id="modal-edit-photo-img" src="${chosenPhotoDataUrl || ''}" style="width:100%; height:140px; object-fit:cover; display:block;" />
            <button id="btn-remove-edit-photo" type="button" style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.7); border:none; color:#fff; border-radius:50%; width:28px; height:28px; cursor:pointer; font-size:0.8rem;">✕</button>
          </div>
          <button type="button" class="figma-btn-white-pill" id="btn-trigger-edit-photo" style="width:100%; justify-content:center; padding:10px; font-size:0.88rem;">
            📷 ${chosenPhotoDataUrl ? 'Cambiar Foto de Portada' : 'Seleccionar Foto de Portada'}
          </button>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08);">
        <button class="figma-btn-white-pill" id="modal-btn-cancel-edit" style="background:rgba(255,255,255,0.06); color:#fff; padding:10px 18px;">
          Cancelar
        </button>
        <button class="figma-btn-study-large" id="modal-btn-save-edit" style="width:auto; padding:10px 24px;">
          💾 Guardar Cambios ➔
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Manejadores de color y emoji
  const emojiInput = modal.querySelector('#modal-edit-emoji-input') as HTMLInputElement;
  const colorInput = modal.querySelector('#modal-edit-color-input') as HTMLInputElement;

  modal.querySelectorAll<HTMLButtonElement>('.btn-preset-emoji').forEach((b) => {
    b.addEventListener('click', () => {
      chosenEmoji = b.dataset.emoji || '📓';
      emojiInput.value = chosenEmoji;
    });
  });

  modal.querySelectorAll<HTMLButtonElement>('.btn-preset-color').forEach((b) => {
    b.addEventListener('click', () => {
      chosenColor = b.dataset.color || '#38bdf8';
      colorInput.value = chosenColor;
      modal.querySelectorAll('.btn-preset-color').forEach((el) => {
        (el as HTMLElement).style.borderColor = (el as HTMLElement).dataset.color === chosenColor ? '#fff' : 'transparent';
      });
    });
  });

  colorInput.addEventListener('input', () => {
    chosenColor = colorInput.value;
  });

  // Manejador de foto
  const fileInput = modal.querySelector('#modal-edit-photo-file') as HTMLInputElement;
  const triggerPhotoBtn = modal.querySelector('#btn-trigger-edit-photo') as HTMLButtonElement;
  const photoPreviewWrap = modal.querySelector('#modal-edit-photo-preview-wrap') as HTMLElement;
  const photoImg = modal.querySelector('#modal-edit-photo-img') as HTMLImageElement;
  const removePhotoBtn = modal.querySelector('#btn-remove-edit-photo') as HTMLButtonElement;

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
  modal.querySelector('#btn-close-edit-modal')?.addEventListener('click', closeModal);
  modal.querySelector('#modal-btn-cancel-edit')?.addEventListener('click', closeModal);

  // Guardar edición
  modal.querySelector('#modal-btn-save-edit')?.addEventListener('click', () => {
    const nameInput = modal.querySelector('#modal-edit-name') as HTMLInputElement | null;
    const descInput = modal.querySelector('#modal-edit-desc') as HTMLTextAreaElement | null;
    const subjectSelect = modal.querySelector('#modal-edit-subject') as HTMLSelectElement | null;
    const deckSelect = modal.querySelector('#modal-edit-deck') as HTMLSelectElement | null;
    const fontSelect = modal.querySelector('#modal-edit-font') as HTMLSelectElement | null;
    const soundSelect = modal.querySelector('#modal-edit-sound') as HTMLSelectElement | null;

    const title = nameInput?.value.trim() || topic.title;
    const description = descInput?.value.trim() || '';
    const subject = subjectSelect?.value || topic.subject || 'General';
    const deckId = deckSelect?.value || '';
    const emoji = emojiInput.value.trim() || chosenEmoji;
    const color = chosenColor;
    const fontFamily = fontSelect?.value || topic.fontFamily;
    const soundTheme = (soundSelect?.value as any) || topic.soundTheme;

    activeStudyService.updateTopic(topic.id, {
      title,
      description,
      subject,
      deckId,
      coverImage: chosenPhotoDataUrl,
      color,
      emoji,
      fontFamily,
      soundTheme
    });

    nativeService.triggerHaptics('medium');
    closeModal();
    onSaved();
  });
}

/**
 * Requisito 6: Modal para crear una nueva Carpeta contenedora
 */
function openCreateFolderModal(onCreated: () => void): void {
  dialogService.showPrompt({
    title: '📁 Nueva Carpeta de Cuadernos',
    placeholder: 'Nombre de la carpeta (Ej: Primer Semestre, Medicina...)',
    confirmText: 'Crear Carpeta',
    onConfirm: (name) => {
      if (name && name.trim()) {
        activeStudyService.createTopic('', name.trim(), [], {
          isFolder: true,
          emoji: '📁',
          description: `Carpeta contenedora para ${name.trim()}`
        });
        nativeService.triggerHaptics('medium');
        onCreated();
      }
    }
  });
}

/**
 * Requisito 6: Modal para mover un cuaderno a una carpeta
 */
function openMoveToFolderModal(topic: ActiveStudyTopic, onMoved: () => void): void {
  const folders = activeStudyService.getAllFolders().filter((f) => f.id !== topic.id);

  const modal = document.createElement('div');
  modal.className = 'apple-modal-overlay';
  modal.innerHTML = `
    <div class="apple-modal-content apple-glass-panel" style="max-width:480px; width:92%; padding:24px; border-radius:22px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.3rem;">📥</span>
          <h3 style="font-size:1.15rem; font-weight:800; color:#fff; margin:0;">Mover Cuaderno a Carpeta</h3>
        </div>
        <button id="btn-close-move-modal" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
      </div>

      <p style="color:var(--f-text-secondary); font-size:0.88rem; margin:0 0 14px 0;">
        Selecciona la carpeta donde deseas ubicar el cuaderno "<strong>${escapeHtml(topic.title)}</strong>":
      </p>

      <div style="display:flex; flex-direction:column; gap:8px; max-height:280px; overflow-y:auto;">
        <button class="figma-btn-ghost btn-select-dest-folder" data-folder-id="__root__" style="justify-content:flex-start; padding:12px; border-radius:12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:0.9rem;">
          <span>🏠 Raíz (Fuera de cualquier carpeta)</span>
        </button>
        ${folders
          .map(
            (f) => `
          <button class="figma-btn-ghost btn-select-dest-folder" data-folder-id="${f.id}" style="justify-content:flex-start; padding:12px; border-radius:12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:0.9rem;">
            <span>${f.emoji || '📁'} ${escapeHtml(f.title)}</span>
          </button>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('#btn-close-move-modal')?.addEventListener('click', closeModal);

  modal.querySelectorAll<HTMLButtonElement>('.btn-select-dest-folder').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fid = btn.dataset.folderId;
      const targetFolderId = fid === '__root__' ? null : fid;
      if (targetFolderId !== undefined) {
        activeStudyService.moveTopicToFolder(topic.id, targetFolderId);
        nativeService.triggerHaptics('light');
        closeModal();
        onMoved();
      }
    });
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

export function isActivelyStudying(): boolean {
  return activeStudyingTopicId !== null;
}

// Compatibilidad retroactiva
export const renderActiveStudyView = renderActiveStudyDashboard;
export const bindActiveStudyEvents = (
  container: HTMLElement,
  _deck: any,
  onRefresh: () => void
) => bindActiveStudyDashboardEvents(container, onRefresh, () => {});

