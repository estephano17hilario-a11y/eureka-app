import confetti from 'canvas-confetti';
import type { Deck, Flashcard, StudyRating } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { srsService } from '../services/srs.service';
import { katexService } from '../services/katex.service';
import { ttsService } from '../services/tts.service';
import { dialogService } from '../services/dialog.service';
import { openMicroGameModal } from './MicroGameModal';
import { setupMathVirtualKeyboard, validateMathAnswer, evaluateDetailedMathAnswer } from '../services/math-engine.service';
import { nativeService } from '../services/native.service';
import { studyStats, formatDuration } from '../services/study-stats.service';
import type { StudyLaunch } from './DeckInsights';
import '../ui/styles/deck-insights.css';

const escHtml = (t: string): string => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clock = (ms: number): string => {
  const total = Math.floor(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};
/** Respuesta de un hueco: «La {{c::mitocondria}} produce ATP» → «mitocondria» */
const clozeAnswer = (front: string): string => /\{\{c\d*::([\s\S]*?)(?:::[\s\S]*?)?\}\}/.exec(front)?.[1]?.trim() || '';

export interface FigmaStudyOptions {
  deckId: string;
  specificCardId?: string;
  forceAllCards?: boolean;
  isPreviewMode?: boolean;
  /** Sesión a medida: qué tarjetas, con qué método y si cuenta para el repaso espaciado */
  launch?: StudyLaunch;
  onExit: () => void;
  onEditCard?: (cardId: string) => void;
}

export class FigmaStudySession {
  private deck: Deck;
  private queue: Flashcard[] = [];
  private currentCardIndex: number = 0;
  private isFlipped: boolean = false;
  private isSingleCardMode: boolean = false;
  private isPreviewMode: boolean = false;
  private isTypeAnswerMode: boolean = false;
  private isGameActive: boolean = false;
  private isHandlingRating: boolean = false;
  private typedAnswer: string = '';
  private onExitCallback: () => void;
  private onEditCardCallback?: (cardId: string) => void;
  private historyStack: { cardIndex: number; isFlipped: boolean }[] = [];
  /** Calificaciones deshacibles: estado previo de la tarjeta y qué se tocó en la cola y las cifras */
  private undoStack: { snapshot: Flashcard; index: number; rating: StudyRating; requeued: boolean }[] = [];
  private animate: 'enter' | 'flip' | null = 'enter';
  private method: 'flip' | 'quiz' | 'type' = 'flip';
  /** Práctica libre: no se toca el calendario de repasos */
  private practice = false;
  private sessionLabel = '';
  private cardShownAt = Date.now();
  private studiedMs = 0;
  private timerId = 0;
  private combo = 0;
  private bestCombo = 0;
  private hintLevel = 0;
  private quizCardId = '';
  private quizOptions: { text: string; correct: boolean }[] | null = null;
  /** Opción elegida (-1 = «no lo sé») */
  private quizChoice: number | null = null;
  private missed = new Map<string, Flashcard>();
  private sessionStats = {
    startTime: Date.now(),
    againCount: 0,
    hardCount: 0,
    goodCount: 0,
    easyCount: 0,
    totalReviewed: 0
  };

  constructor(options: FigmaStudyOptions) {
    const deck = deckService.getDeckById(options.deckId);
    if (!deck) throw new Error(`Deck not found: ${options.deckId}`);
    this.deck = deck;
    this.onExitCallback = options.onExit;
    this.onEditCardCallback = options.onEditCard;
    this.isPreviewMode = !!options.isPreviewMode;

    if (options.launch) {
      this.queue = options.launch.cardIds.map((id) => deckService.getCardById(id)).filter((c): c is Flashcard => !!c);
      this.method = options.launch.method;
      this.practice = options.launch.practice;
      this.sessionLabel = options.launch.label;
      this.isTypeAnswerMode = this.method === 'type';
    } else if (options.specificCardId) {
      const allCards = deckService.getCardsByDeck(options.deckId, true);
      const targetIdx = allCards.findIndex((c) => c.id === options.specificCardId);
      if (targetIdx !== -1) {
        this.queue = allCards;
        this.currentCardIndex = targetIdx;
      } else {
        const specific = deckService.getCardById(options.specificCardId);
        if (specific) this.queue = [specific];
      }
      this.isSingleCardMode = false;
    } else if (options.forceAllCards) {
      const all = deckService.getCardsByDeck(options.deckId, true);
      this.queue = deck.settings.mixCards ? [...all].sort(() => Math.random() - 0.5) : [...all];
    } else {
      let dueCards = deckService.getDueCardsByDeck(options.deckId, true);
      if (dueCards.length === 0) {
        dueCards = deckService.getCardsByDeck(options.deckId, true).filter((c) => !c.suspended);
      }
      this.queue = deck.settings.mixCards ? [...dueCards].sort(() => Math.random() - 0.5) : [...dueCards];
    }
  }

  public render(container: HTMLElement): void {
    if (this.queue.length === 0) {
      this.renderEmptyState(container);
      return;
    }

    if (this.currentCardIndex >= this.queue.length) {
      this.renderCompletionScreen(container);
      return;
    }

    const currentCard = this.queue[this.currentCardIndex];
    const totalCount = this.queue.length;
    const currentNum = this.currentCardIndex + 1;
    const progressPercent = totalCount > 0 ? Math.round((currentNum / totalCount) * 100) : 0;
    const intervalProjections = srsService.projectIntervals(currentCard, this.deck.settings);
    this.buildQuiz(currentCard);
    this.startTimer();

    if (this.deck.settings.autoPlayAudio && !this.isFlipped) {
      const text = currentCard.audioText || currentCard.front;
      if (text) ttsService.speak(text, currentCard.audioLang || this.deck.settings.ttsVoiceLang);
    }

    container.innerHTML = `
      <div class="cupertino-study-container">
        
        <!-- Header -->
        <div class="cupertino-study-header">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:12px; min-width:0;">
              <button class="ios-back-btn" id="btn-study-exit" style="padding:0; font-size:1.1rem; color:#fff; flex-shrink:0;">
                <span class="ios-back-chevron">‹</span> Salir
              </button>
              <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                <h2 style="font-size:1.45rem; font-weight:800; color:#ffffff; letter-spacing:-0.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${this.deck.name}
                </h2>
                ${this.isPreviewMode ? '<span class="apple-badge-subpill" style="font-size:0.75rem; background:rgba(56,189,248,0.15); color:var(--f-blue); border:1px solid rgba(56,189,248,0.3); flex-shrink:0;">🔍 Vista Previa</span>' : ''}
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
              ${
                this.isPreviewMode
                  ? ''
                  : `<button class="sx-undo" id="btn-study-undo" title="Deshacer la última calificación (Z)" ${this.undoStack.length ? '' : 'disabled'}>↩ <span>Deshacer</span></button>`
              }
              <button class="cupertino-icon-square ${currentCard.starred ? 'sx-icon-on' : ''}" id="btn-study-star" title="Marcar como favorita (F)" aria-label="Favorita">${currentCard.starred ? '★' : '☆'}</button>
              ${!this.isFlipped && !this.isPreviewMode ? '<button class="cupertino-icon-square" id="btn-study-hint" title="Pedir una pista (H)" aria-label="Pista">💡</button>' : ''}
              <button class="cupertino-icon-square" id="btn-study-audio" title="Pronunciación TTS">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              </button>
            </div>
          </div>

          <!-- Progress track -->
          <div class="cupertino-progress-row">
            <div class="cupertino-progress-pill">${currentNum}/${totalCount}</div>
            <div class="cupertino-track-bar">
              <div class="cupertino-track-fill" style="width: ${progressPercent}%;"></div>
              <div class="cupertino-track-thumb" style="left: ${progressPercent}%;"></div>
            </div>
          </div>
          ${this.metaRowHtml(currentCard)}
        </div>

        <!-- Main Card Canvas with Lateral Navigation Arrows -->
        <div class="cupertino-study-arena-row">
          <button class="cupertino-nav-arrow left" id="btn-nav-prev-card" title="Tarjeta anterior (←)" ${this.currentCardIndex === 0 ? 'style="opacity:0.25; pointer-events:none;"' : ''}>
            ‹
          </button>

          <div class="cupertino-flashcard-box ${this.animate === 'enter' ? 'sx-enter' : this.animate === 'flip' ? 'sx-flip' : ''}" id="f-study-scene" style="cursor:pointer; position:relative; touch-action:pan-y;">
            <span class="sx-swipe-hint left" id="sx-hint-left">De nuevo</span>
            <span class="sx-swipe-hint right" id="sx-hint-right">Bien</span>

            <!-- Top 3-dots icon for Card Actions / Editing -->
            <div class="cupertino-card-top-action">
              <button class="cupertino-btn-card-menu" id="btn-card-more-action" title="Editar o gestionar tarjeta">⋮</button>
            </div>

            <!-- Card Content (Front or Back) -->
            <div class="cupertino-card-body-content">
              ${
                !this.isFlipped
                  ? this.renderFrontContent(currentCard)
                  : this.renderBackContent(currentCard)
              }
            </div>

            ${
              !this.isFlipped && !this.isTypeAnswerMode
                ? `
              <div class="cupertino-card-hint-text">
                ${this.quizOptions ? 'Elige una opción (teclas A–D) · H pista · ? atajos' : 'Toca la tarjeta o presiona Espacio para ver respuesta · H pista · ? atajos'}
              </div>
            `
                : this.isFlipped
                ? `
              <div class="cupertino-card-hint-text" style="opacity:0.85;">
                Presiona [1] De nuevo • [2] Difícil • [3 / Espacio] Bien • [4] Fácil
              </div>
            `
                : ''
            }
          </div>

          <button class="cupertino-nav-arrow right" id="btn-nav-next-card" title="Siguiente tarjeta (→)" ${this.currentCardIndex >= this.queue.length - 1 ? 'style="opacity:0.25; pointer-events:none;"' : ''}>
            ›
          </button>
        </div>

        <!-- Bottom Controls -->
        <div class="cupertino-bottom-controls">
          ${
            this.isPreviewMode
              ? `
            <!-- Modo Vista Previa -->
            <div class="cupertino-front-controls-row" style="justify-content:center;">
              <button class="cupertino-btn-show-answer" id="btn-f-show-answer" style="max-width:320px; font-weight:800;">
                ${!this.isFlipped ? '👁️ Voltear al Reverso' : '🔄 Voltear al Anverso'}
              </button>
            </div>
          `
              : `
            <div style="display:flex; flex-direction:column; gap:10px; width:100%;">
              ${
                !this.isFlipped
                  ? `
                <div class="cupertino-front-controls-row">
                  <button class="cupertino-icon-square ${this.isTypeAnswerMode ? 'active-keyboard-mode' : ''}" id="btn-toggle-type-mode" title="Escribir la respuesta (Modo teclado)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="10" y2="8"/><line x1="14" y1="8" x2="14" y2="8"/><line x1="18" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/></svg>
                  </button>

                  <button class="cupertino-btn-show-answer" id="btn-f-show-answer">
                    ${this.isTypeAnswerMode ? 'Comprobar respuesta' : this.quizOptions ? '🤷 No lo sé · ver respuesta' : '👁️ Mostrar respuesta (Espacio)'}
                  </button>
                </div>
              `
                  : `
                <!-- 4 Frosted Cupertino Rating Pills (Solo al ver respuesta) -->
                <div class="cupertino-rating-row">
                  <button type="button" class="cupertino-rate-pill rate-again" id="btn-rate-again" data-rating="again" title="Presiona [1]">
                    <span class="c-rate-title">De nuevo</span>
                    <span class="c-rate-subtitle">${intervalProjections[0]?.displayTime || '< 1 min'}</span>
                    <span class="c-rate-key">[1]</span>
                  </button>

                  <button type="button" class="cupertino-rate-pill rate-hard" id="btn-rate-hard" data-rating="hard" title="Presiona [2]">
                    <span class="c-rate-title">Difícil</span>
                    <span class="c-rate-subtitle">${intervalProjections[1]?.displayTime || '2 min'}</span>
                    <span class="c-rate-key">[2]</span>
                  </button>

                  <button type="button" class="cupertino-rate-pill rate-good" id="btn-rate-good" data-rating="good" title="Presiona [3 / Espacio]">
                    <span class="c-rate-title">Bien</span>
                    <span class="c-rate-subtitle">${intervalProjections[2]?.displayTime || '4 min'}</span>
                    <span class="c-rate-key">[3 / Espacio]</span>
                  </button>

                  <button type="button" class="cupertino-rate-pill rate-easy" id="btn-rate-easy" data-rating="easy" title="Presiona [4]">
                    <span class="c-rate-title">Fácil</span>
                    <span class="c-rate-subtitle">${intervalProjections[3]?.displayTime || '14 min'}</span>
                    <span class="c-rate-key">[4]</span>
                  </button>
                </div>
              `
              }
            </div>
          `
          }
        </div>

      </div>
    `;

    this.animate = null;
    this.bindEvents(container);
  }

  private renderFrontContent(card: Flashcard): string {
    let mediaHtml = '';
    if (card.type === 'image_occlusion' && card.occlusionImage) {
      const mode = card.occlusionMode || 'hide_one_reveal_one';
      const masks = card.occlusionMasks || [];
      const activeMaskId = card.activeMaskId || (masks.length > 0 ? masks[0].id : null);

      mediaHtml = `
        <div class="cupertino-occlusion-wrap">
          <div class="cupertino-occlusion-img-box" id="study-occlusion-img-box" style="cursor:pointer;" title="Toca para mostrar respuesta">
            <img src="${card.occlusionImage}" alt="Oclusión" draggable="false" class="cupertino-responsive-img study-occlusion-target-img" />
            ${masks
              .map((m) => {
                const isActive = m.id === activeMaskId;
                if (isActive) {
                  return `<div class="figma-drawn-mask active-question-mask" data-mask-id="${m.id}" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%; background:#ef4444; border:2px solid #ffffff; font-size:1.15rem; font-weight:900; color:#fff; box-shadow:0 0 20px rgba(239,68,68,0.85); cursor:pointer;" title="Toca para revelar respuesta">?</div>`;
                } else {
                  if (mode === 'hide_all_reveal_one') {
                    return `<div class="figma-drawn-mask other-hidden-mask" data-mask-id="${m.id}" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%; background:#18191f; border:1px solid #3f3f46; cursor:pointer;" title="Toca para revelar respuesta"></div>`;
                  }
                  return '';
                }
              })
              .join('')}
          </div>
        </div>
      `;
    } else if (card.frontImage) {
      mediaHtml = `<img src="${card.frontImage}" class="cupertino-responsive-img" alt="Front Attachment" />`;
    }

    const typeAnswerInputHtml = this.isTypeAnswerMode
      ? `
      <div class="cupertino-type-answer-box" style="margin-top:16px; width:100%; max-width:480px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; font-size:0.75rem; color:var(--f-text-secondary); font-weight:700;">
          <span style="display:flex; align-items:center; gap:5px;">
            <span>⌨️</span> Entrada Táctil de Respuestas (MathLive)
          </span>
          <span class="apple-badge-subpill" style="font-size:0.7rem; background:rgba(56,189,248,0.12); color:#38bdf8; border:1px solid rgba(56,189,248,0.25);">
            Álgebra • Cálculo • Griego • Química
          </span>
        </div>
        <math-field 
          id="exam-input" 
          virtual-keyboard-mode="on" 
          class="cupertino-mathfield-input"
        >${this.typedAnswer}</math-field>
        <div style="font-size:0.72rem; color:var(--f-text-muted); margin-top:6px; text-align:right;">
          Toca para abrir el teclado virtual adaptado a mobile
        </div>
      </div>
    `
      : '';

    return `
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:14px; width:100%;">
        ${mediaHtml}
        <div class="cupertino-card-main-title">
          ${card.type === 'cloze' ? katexService.renderCloze(card.front, false) : katexService.parseAndRender(card.front)}
        </div>
        ${typeAnswerInputHtml}
        ${this.hintHtml(card)}
        ${this.quizFrontHtml()}
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /*  Barra de sesión, pistas y opción múltiple                           */
  /* ------------------------------------------------------------------ */
  private startTimer(): void {
    if (this.timerId || this.isPreviewMode) return;
    this.timerId = window.setInterval(() => {
      const el = document.getElementById('sx-timer');
      if (el) el.textContent = `⏱ ${clock(Date.now() - this.sessionStats.startTime)}`;
      else if (!document.querySelector('.cupertino-study-container')) this.stopTimer();
    }, 1000);
  }

  private stopTimer(): void {
    window.clearInterval(this.timerId);
    this.timerId = 0;
  }

  private metaRowHtml(card: Flashcard): string {
    if (this.isPreviewMode) return '';
    const s = this.sessionStats;
    const pills: string[] = [];
    if (this.sessionLabel) pills.push(`<span class="sx-pill">🎯 ${escHtml(this.sessionLabel)}</span>`);
    if (this.practice) pills.push('<span class="sx-pill practice" title="Las respuestas no cambian tu calendario de repasos">Práctica libre</span>');
    pills.push(`<span class="sx-pill" id="sx-timer">⏱ ${clock(Date.now() - s.startTime)}</span>`);
    if (s.totalReviewed) pills.push(`<span class="sx-pill ok">✓ ${s.goodCount + s.easyCount}/${s.totalReviewed}</span>`);
    if (this.combo >= 3) pills.push(`<span class="sx-pill combo">🔥 ×${this.combo}</span>`);
    (card.tags || []).slice(0, 3).forEach((t) => pills.push(`<span class="sx-pill">#${escHtml(t)}</span>`));
    return `<div class="sx-meta">${pills.join('')}</div>`;
  }

  /** Respuesta en texto plano (para pistas progresivas) */
  private plainAnswer(card: Flashcard): string {
    const raw = card.type === 'cloze' ? clozeAnswer(card.front) : card.back;
    return raw
      .replace(/\$\$?([^$]*)\$\$?/g, '$1')
      .replace(/[*_`#>~=]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private hintHtml(card: Flashcard): string {
    if (!this.hintLevel || this.isFlipped) return '';
    const parts: string[] = [];
    if (card.hint) parts.push(`<div><b>💡 Pista:</b>${escHtml(card.hint)}</div>`);
    const letters = card.hint ? this.hintLevel - 1 : this.hintLevel;
    const answer = this.plainAnswer(card);
    if (letters > 0 && answer) {
      const chars = [...answer].slice(0, 48);
      const shown = chars.map((ch, i) => (i < letters || /[\s.,;:()\-]/.test(ch) ? ch : '•')).join('');
      parts.push(`<div><b>Empieza por:</b><code>${escHtml(shown)}</code></div>`);
    } else if (!card.hint) {
      parts.push('<div>Esta tarjeta no tiene pista ni texto en la respuesta.</div>');
    }
    return `<div class="sx-hint">${parts.join('')}</div>`;
  }

  /** Prepara las opciones del cuestionario: la respuesta correcta + hasta 3 respuestas de otras tarjetas del mazo */
  private buildQuiz(card: Flashcard): void {
    if (this.quizCardId === card.id) return;
    this.quizCardId = card.id;
    this.quizChoice = null;
    this.quizOptions = null;
    if (this.method !== 'quiz' || this.isPreviewMode || card.type === 'image_occlusion') return;
    const answerOf = (c: Flashcard): string => (c.type === 'cloze' ? clozeAnswer(c.front) : c.back.trim());
    const correct = answerOf(card);
    if (!correct || correct.length > 240) return;
    const norm = (t: string) => t.toLowerCase().replace(/\s+/g, ' ').trim();
    const seen = new Set([norm(correct)]);
    const pool = deckService
      .getCardsByDeck(this.deck.id, true)
      .filter((c) => c.id !== card.id && c.type !== 'image_occlusion')
      .sort(() => Math.random() - 0.5);
    const candidates: string[] = [];
    for (const c of pool) {
      const a = answerOf(c);
      if (!a || a.length > 240 || seen.has(norm(a))) continue;
      seen.add(norm(a));
      candidates.push(a);
      if (candidates.length >= 14) break;
    }
    // Con menos de dos distractores no hay cuestionario posible: esa tarjeta se estudia volteando
    if (candidates.length < 2) return;
    candidates.sort((x, y) => Math.abs(x.length - correct.length) - Math.abs(y.length - correct.length));
    this.quizOptions = [{ text: correct, correct: true }, ...candidates.slice(0, 3).map((text) => ({ text, correct: false }))].sort(() => Math.random() - 0.5);
  }

  private quizFrontHtml(): string {
    if (!this.quizOptions || this.isFlipped) return '';
    return `<div class="sx-quiz">${this.quizOptions
      .map((o, i) => `<button type="button" class="sx-opt" data-opt="${i}"><kbd>${'ABCD'[i]}</kbd><span>${katexService.parseAndRender(o.text)}</span></button>`)
      .join('')}</div>`;
  }

  private quizBackHtml(): string {
    if (!this.quizOptions || this.quizChoice === null) return '';
    const right = this.quizChoice >= 0 && this.quizOptions[this.quizChoice]?.correct;
    const verdict = right ? '<div class="sx-verdict ok">✓ ¡Correcto!</div>' : `<div class="sx-verdict ko">${this.quizChoice < 0 ? 'Esta era la respuesta' : '✗ No era esa'}</div>`;
    const opts = this.quizOptions
      .map((o, i) => `<div class="sx-opt ${o.correct ? 'correct' : i === this.quizChoice ? 'wrong' : 'dim'}"><kbd>${o.correct ? '✓' : i === this.quizChoice ? '✗' : 'ABCD'[i]}</kbd><span>${katexService.parseAndRender(o.text)}</span></div>`)
      .join('');
    return `${verdict}<div class="sx-quiz" style="margin:0 0 14px;">${opts}</div>`;
  }

  private openShortcuts(): void {
    const modal = document.createElement('div');
    modal.className = 'apple-modal-overlay';
    modal.innerHTML = `
      <div class="apple-modal-content apple-glass-panel" style="max-width:420px; width:92%; padding:22px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
          <h3 style="font-size:1.15rem; font-weight:800; color:#fff; margin:0;">⌨️ Atajos de la sesión</h3>
          <button id="btn-close-keys" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
        </div>
        <div class="sx-keys">
          <kbd>Espacio</kbd><span>Ver la respuesta · calificar «Bien»</span>
          <kbd>1 · 2 · 3 · 4</kbd><span>De nuevo · Difícil · Bien · Fácil</span>
          <kbd>A – D</kbd><span>Elegir opción (opción múltiple)</span>
          <kbd>H</kbd><span>Pedir una pista (cada vez revela más)</span>
          <kbd>F</kbd><span>Marcar como favorita</span>
          <kbd>E</kbd><span>Editar la tarjeta</span>
          <kbd>B</kbd><span>Posponer la tarjeta a mañana</span>
          <kbd>Z</kbd><span>Deshacer la última calificación</span>
          <kbd>← →</kbd><span>Tarjeta anterior / siguiente</span>
          <kbd>Deslizar</kbd><span>Derecha = Bien · Izquierda = De nuevo</span>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.querySelector('#btn-close-keys')?.addEventListener('click', close);
    modal.addEventListener('click', (e) => e.target === modal && close());
  }

  /** Quita la tarjeta actual de la cola (pausada, pospuesta o eliminada) y sigue con la siguiente */
  private dropCurrentCard(container: HTMLElement): void {
    const id = this.queue[this.currentCardIndex]?.id;
    this.queue = this.queue.filter((c, i) => i < this.currentCardIndex || c.id !== id);
    this.isFlipped = false;
    this.hintLevel = 0;
    this.animate = 'enter';
    this.cardShownAt = Date.now();
    this.render(container);
  }

  private renderBackContent(card: Flashcard): string {
    let mediaHtml = '';
    if (card.type === 'image_occlusion' && card.occlusionImage) {
      const mode = card.occlusionMode || 'hide_one_reveal_one';
      const masks = card.occlusionMasks || [];
      const activeMaskId = card.activeMaskId || (masks.length > 0 ? masks[0].id : null);

      mediaHtml = `
        <div class="cupertino-occlusion-wrap">
          <div class="cupertino-occlusion-img-box">
            <img src="${card.occlusionImage}" alt="Oclusión Revelada" draggable="false" class="cupertino-responsive-img" />
            ${masks
              .map((m) => {
                const isActive = m.id === activeMaskId;
                if (isActive) {
                  // El recuadro objetivo simplemente se desocluya sin puntos ni recuadros superpuestos
                  return '';
                }
                // Si el modo es ocultar todas, las no activas siguen tapadas
                if (mode === 'hide_all_reveal_one') {
                  return `<div class="figma-drawn-mask other-hidden-mask" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%; background:#18191f; border:1px solid #3f3f46;"></div>`;
                }
                // En modo hide_one_reveal_one, no se tapa NINGUNA otra etiqueta al voltear
                return '';
              })
              .join('')}
          </div>
        </div>
      `;
    } else if (card.backImage) {
      mediaHtml = `<img src="${card.backImage}" class="cupertino-responsive-img" style="margin-bottom:14px;" alt="Back Attachment" />`;
    }

    let typedComparisonHtml = '';
    if (this.isTypeAnswerMode && this.typedAnswer.trim()) {
      const evaluation = evaluateDetailedMathAnswer(this.typedAnswer, card.back);
      const isMatch = evaluation.isEquivalent || validateMathAnswer(this.typedAnswer, card.back);

      let badgeLabel = 'Discrepancia';
      let badgeColor = '#f87171';
      let badgeBg = 'rgba(239,68,68,0.18)';
      let badgeBorder = '#ef4444';

      if (isMatch) {
        badgeColor = '#10b981';
        badgeBg = 'rgba(16,185,129,0.18)';
        badgeBorder = '#10b981';

        if (evaluation.isSymbolicEquivalent && !evaluation.isExactString) {
          badgeLabel = '✓ Equivalente Semántico (AST)';
        } else if (evaluation.isNumericEquivalent && !evaluation.isExactString) {
          badgeLabel = '✓ Equivalente Numérico';
        } else {
          badgeLabel = '✓ Exacto';
        }
      }

      typedComparisonHtml = `
        <div class="cupertino-typed-comparison-card apple-glass-panel" style="margin-bottom:14px; width:100%; max-width:480px; padding:14px 18px; border-radius:14px; text-align:left;">
          <div style="font-size:0.75rem; font-weight:800; color:var(--f-text-secondary); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
            <span>Tu respuesta:</span>
            <span style="color:${badgeColor}; font-weight:900;">
              ${isMatch ? 'Validación Semántica: Correcta' : 'Discrepancia Semántica'}
            </span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
            <span style="font-size:1.15rem; font-weight:700; color:${badgeColor};">
              ${katexService.parseAndRender(this.typedAnswer) || this.typedAnswer}
            </span>
            <span class="apple-badge-subpill" style="font-size:0.75rem; background:${badgeBg}; color:${badgeColor}; border:1px solid ${badgeBorder};">
              ${badgeLabel}
            </span>
          </div>
        </div>
      `;
    }

    const credit = card.imageCredit ? `<div class="sx-credit">📷 ${card.imageCredit.replace(/</g, '&lt;')}</div>` : '';

    const quizHtml = this.quizBackHtml();

    if (card.type === 'cloze') {
      // En los huecos la respuesta es la propia frase con el hueco resaltado; lo extra va debajo
      return `
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; width:100%;">
          ${mediaHtml}
          ${quizHtml}
          <div class="cupertino-card-main-title">${katexService.renderCloze(card.front, true)}</div>
          ${card.back.trim() ? `<div class="cupertino-card-divider"></div><div class="cupertino-card-answer-text">${katexService.parseAndRender(card.back)}</div>` : ''}
          ${credit}
        </div>
      `;
    }

    return `
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; width:100%;">
        ${mediaHtml}
        <div class="cupertino-card-main-title is-back-prompt">
          ${katexService.parseAndRender(card.front)}
        </div>

        <div class="cupertino-card-divider"></div>

        ${typedComparisonHtml}
        ${quizHtml}

        <div class="cupertino-card-answer-text">
          ${katexService.parseAndRender(card.back)}
        </div>
        ${credit}
      </div>
    `;
  }

  private openCardMenu(currentCard: Flashcard, container: HTMLElement): void {
    const modal = document.createElement('div');
    modal.className = 'apple-modal-overlay';
    modal.innerHTML = `
      <div class="apple-modal-content apple-glass-panel" style="max-width:380px; width:90%; padding:20px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
          <h3 style="font-size:1.15rem; font-weight:800; color:#fff;">Opciones de la Tarjeta</h3>
          <button id="btn-close-card-menu" style="background:none; border:none; color:var(--f-text-secondary); font-size:1.3rem; cursor:pointer;">✕</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="menu-action-item-btn" id="btn-menu-edit-card" style="display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:12px; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); color:#38bdf8; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
            <span style="font-size:1.2rem;">✏️</span>
            <div>
              <div>Editar esta tarjeta</div>
              <div style="font-size:0.75rem; color:var(--f-text-secondary); font-weight:500;">Modificar anverso, reverso o multimedia</div>
            </div>
          </button>

          <button class="menu-action-item-btn" id="btn-menu-bury-card" style="display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
            <span style="font-size:1.2rem;">🌙</span>
            <div>
              <div>Posponer a mañana</div>
              <div style="font-size:0.75rem; color:var(--f-text-secondary); font-weight:500;">Sale de la sesión sin cambiar su progreso</div>
            </div>
          </button>

          <button class="menu-action-item-btn" id="btn-menu-suspend-card" style="display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
            <span style="font-size:1.2rem;">⏸</span>
            <div>
              <div>Pausar tarjeta</div>
              <div style="font-size:0.75rem; color:var(--f-text-secondary); font-weight:500;">No volverá a salir hasta que la reactives en el mazo</div>
            </div>
          </button>

          <button class="menu-action-item-btn" id="btn-menu-reset-card" style="display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
            <span style="font-size:1.2rem;">🔄</span>
            <div>
              <div>Reiniciar progreso</div>
              <div style="font-size:0.75rem; color:var(--f-text-secondary); font-weight:500;">Restablecer a tarjeta nueva</div>
            </div>
          </button>

          <button class="menu-action-item-btn" id="btn-menu-delete-card" style="display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:12px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); color:#f87171; font-weight:700; font-size:0.95rem; cursor:pointer; text-align:left;">
            <span style="font-size:1.2rem;">🗑️</span>
            <div>
              <div>Eliminar tarjeta</div>
              <div style="font-size:0.75rem; color:#fca5a5; font-weight:500;">Borrar definitivamente del mazo</div>
            </div>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.querySelector('#btn-close-card-menu')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    modal.querySelector('#btn-menu-edit-card')?.addEventListener('click', () => {
      closeModal();
      window.onkeydown = null;
      if (this.onEditCardCallback) {
        this.onEditCardCallback(currentCard.id);
      }
    });

    modal.querySelector('#btn-menu-bury-card')?.addEventListener('click', () => {
      closeModal();
      deckService.buryCard(currentCard.id);
      this.dropCurrentCard(container);
    });

    modal.querySelector('#btn-menu-suspend-card')?.addEventListener('click', () => {
      closeModal();
      deckService.setCardsFlags([currentCard.id], { suspended: true });
      this.dropCurrentCard(container);
    });

    modal.querySelector('#btn-menu-reset-card')?.addEventListener('click', () => {
      closeModal();
      dialogService.showConfirm({
        title: 'Restablecer Progreso',
        message: '¿Deseas restablecer el progreso de esta tarjeta a estado nuevo?',
        confirmText: 'Continuar',
        onConfirm: () => {
          dialogService.showConfirm({
            title: '⚠️ Confirmación Final',
            message: 'Esta acción borrará todo el historial e intervalos acumulados de esta tarjeta. ¿Confirmar por segunda vez?',
            confirmText: 'Restablecer Definitivamente',
            isDanger: true,
            onConfirm: () => {
              deckService.resetCardProgress(currentCard.id);
              this.render(container);
            }
          });
        }
      });
    });

    modal.querySelector('#btn-menu-delete-card')?.addEventListener('click', () => {
      dialogService.showConfirm({
        title: 'Eliminar Tarjeta',
        message: '¿Estás seguro de eliminar esta tarjeta definitivamente?',
        confirmText: 'Eliminar',
        isDanger: true,
        onConfirm: () => {
          deckService.deleteCard(currentCard.id);
          closeModal();
          this.queue.splice(this.currentCardIndex, 1);
          this.isFlipped = false;
          this.render(container);
        }
      });
    });
  }

  private bindEvents(container: HTMLElement): void {
    const currentCard = this.queue[this.currentCardIndex];

    document.getElementById('btn-study-exit')?.addEventListener('click', () => {
      window.onkeydown = null;
      this.stopTimer();
      ttsService.stop();
      this.onExitCallback();
    });

    // Favorita: se guarda al instante y la tarjeta de la cola se actualiza para reflejarlo
    document.getElementById('btn-study-star')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const starred = !currentCard.starred;
      deckService.setCardsFlags([currentCard.id], { starred });
      this.queue = this.queue.map((c) => (c.id === currentCard.id ? { ...c, starred } : c));
      this.render(container);
    });

    // Pista: cada pulsación revela un poco más
    document.getElementById('btn-study-hint')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hintLevel++;
      this.render(container);
    });

    // Top 3-dots Card Menu (Solicitud #3)
    document.getElementById('btn-card-more-action')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openCardMenu(currentCard, container);
    });

    // Solicitud #2: Si se accede manualmente a la tarjeta (Modo Vista Previa), no interactuar con modificadores SRS ni calificar
    if (this.isPreviewMode) {
      const toggleFlip = () => {
        this.isFlipped = !this.isFlipped;
        this.render(container);
      };

      document.getElementById('btn-f-show-answer')?.addEventListener('click', toggleFlip);
      document.getElementById('f-study-scene')?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.id === 'btn-card-more-action' || target.tagName === 'BUTTON') return;
        toggleFlip();
      });

      document.getElementById('btn-nav-prev-card')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentCardIndex > 0) {
          this.currentCardIndex--;
          this.isFlipped = false;
          this.render(container);
        }
      });

      document.getElementById('btn-nav-next-card')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentCardIndex < this.queue.length - 1) {
          this.currentCardIndex++;
          this.isFlipped = false;
          this.render(container);
        }
      });

      // Audio
      document.getElementById('btn-study-audio')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = this.isFlipped ? currentCard.back : currentCard.front;
        ttsService.speak(text, currentCard.audioLang || this.deck.settings.ttsVoiceLang);
      });

      window.onkeydown = (e: KeyboardEvent) => {
        if (
          this.isGameActive ||
          document.getElementById('modal-microgame-root') ||
          document.querySelector('.apple-modal-overlay') ||
          document.querySelector('.modal-backdrop')
        ) {
          return;
        }

        if (e.key === 'ArrowLeft') {
          if (this.currentCardIndex > 0) {
            e.preventDefault();
            this.currentCardIndex--;
            this.isFlipped = false;
            this.render(container);
          }
        } else if (e.key === 'ArrowRight') {
          if (this.currentCardIndex < this.queue.length - 1) {
            e.preventDefault();
            this.currentCardIndex++;
            this.isFlipped = false;
            this.render(container);
          }
        } else if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          toggleFlip();
        }
      };

      return;
    }

    // Configurar e inicializar entrada táctil de respuestas MathLive (Modo Examen / Teclado)
    if (this.isTypeAnswerMode && !this.isFlipped) {
      setupMathVirtualKeyboard();
      const mathField = document.getElementById('exam-input') as (HTMLElement & { value: string; focus: () => void }) | null;
      if (mathField) {
        setTimeout(() => {
          try {
            mathField.focus();
          } catch {}
        }, 80);

        mathField.addEventListener('input', () => {
          this.typedAnswer = mathField.value;
        });
        mathField.addEventListener('change', () => {
          this.typedAnswer = mathField.value;
        });
        mathField.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            triggerFlip();
          }
        });
      }
    }

    const triggerFlip = () => {
      if (!this.isFlipped) {
        // En opción múltiple, ver la respuesta sin elegir cuenta como «no lo sé»
        if (this.quizOptions && this.quizChoice === null) this.quizChoice = -1;
        // Extraer la respuesta del estudiante en formato LaTeX estándar mediante la propiedad reactiva mathfield.value
        const mathField = document.getElementById('exam-input') as (HTMLElement & { value: string }) | null;
        if (mathField && mathField.value !== undefined) {
          this.typedAnswer = mathField.value;
        }
        this.historyStack.push({ cardIndex: this.currentCardIndex, isFlipped: false });
        this.isFlipped = true;
        this.animate = 'flip';
        this.render(container);
      }
    };

    // Opción múltiple: elegir una respuesta revela el resultado
    container.querySelectorAll<HTMLElement>('button.sx-opt').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.quizChoice = Number(btn.dataset.opt);
        triggerFlip();
      });
    });

    // Tras responder un cuestionario se continúa con un solo botón: acierto = «Bien», fallo = «De nuevo»
    const quizAnswered = this.isFlipped && !!this.quizOptions && this.quizChoice !== null;
    const quizRating = (): StudyRating => (this.quizChoice !== null && this.quizChoice >= 0 && this.quizOptions?.[this.quizChoice]?.correct ? 'good' : 'again');
    if (quizAnswered) {
      const row = container.querySelector('.cupertino-rating-row');
      if (row) {
        row.outerHTML = '<button type="button" class="sx-continue" id="btn-quiz-continue">Continuar (Espacio)</button>';
        document.getElementById('btn-quiz-continue')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleRating(quizRating(), container);
        });
      }
    }

    // Toggle Type Answer Mode Button (Solicitud #5)
    document.getElementById('btn-toggle-type-mode')?.addEventListener('click', () => {
      this.isTypeAnswerMode = !this.isTypeAnswerMode;
      this.typedAnswer = '';
      this.render(container);
    });

    document.getElementById('btn-f-show-answer')?.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerFlip();
    });

    document.getElementById('f-study-scene')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (
        target.id === 'btn-card-more-action' ||
        target.closest('#btn-card-more-action') ||
        target.closest('.sx-opt, .sx-hint') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'BUTTON'
      ) {
        return;
      }
      if (!this.isTypeAnswerMode && !this.quizOptions) {
        triggerFlip();
      }
    });

    // Manejador directo e instantáneo para clics en la imagen de oclusión o en cualquiera de sus máscaras
    container.querySelectorAll('.figma-drawn-mask, #study-occlusion-img-box, .study-occlusion-target-img, .cupertino-occlusion-wrap').forEach((elem) => {
      elem.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerFlip();
      });
    });

    // Solicitud #2: Flechas laterales para rotar entre flashcard y flashcards
    document.getElementById('btn-nav-prev-card')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.currentCardIndex > 0) {
        this.currentCardIndex--;
        this.isFlipped = false;
        this.typedAnswer = '';
        this.render(container);
      }
    });

    document.getElementById('btn-nav-next-card')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.currentCardIndex < this.queue.length - 1) {
        this.currentCardIndex++;
        this.isFlipped = false;
        this.typedAnswer = '';
        this.render(container);
      }
    });

    // Audio
    document.getElementById('btn-study-audio')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = this.isFlipped ? currentCard.back : currentCard.front;
      ttsService.speak(text, currentCard.audioLang || this.deck.settings.ttsVoiceLang);
    });

    document.getElementById('btn-study-undo')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.undoLast(container);
    });

    // Deslizar la tarjeta: derecha = Bien, izquierda = De nuevo (solo con la respuesta a la vista)
    const scene = document.getElementById('f-study-scene');
    if (scene) {
      let sx = 0;
      let sy = 0;
      let dx = 0;
      let tracking = false;
      const hintL = document.getElementById('sx-hint-left');
      const hintR = document.getElementById('sx-hint-right');
      scene.addEventListener(
        'touchstart',
        (e) => {
          if (!this.isFlipped || e.touches.length !== 1) return;
          const target = e.target as HTMLElement;
          if (target.closest('math-field, input, textarea, button')) return;
          sx = e.touches[0].clientX;
          sy = e.touches[0].clientY;
          dx = 0;
          tracking = true;
        },
        { passive: true }
      );
      scene.addEventListener(
        'touchmove',
        (e) => {
          if (!tracking) return;
          dx = e.touches[0].clientX - sx;
          const dy = e.touches[0].clientY - sy;
          if (Math.abs(dy) > Math.abs(dx) * 1.2) return;
          scene.style.transform = `translateX(${dx * 0.5}px) rotate(${dx / 40}deg)`;
          const k = Math.min(1, Math.abs(dx) / 90);
          if (hintL) hintL.style.opacity = dx < 0 ? String(k) : '0';
          if (hintR) hintR.style.opacity = dx > 0 ? String(k) : '0';
        },
        { passive: true }
      );
      const endSwipe = () => {
        if (!tracking) return;
        tracking = false;
        const fired = Math.abs(dx) > 90;
        scene.style.transform = '';
        if (hintL) hintL.style.opacity = '0';
        if (hintR) hintR.style.opacity = '0';
        if (fired) {
          // El clic fantasma que sigue al gesto no debe voltear la siguiente tarjeta
          scene.addEventListener('click', (ev) => ev.stopPropagation(), { once: true, capture: true });
          this.handleRating(dx > 0 ? 'good' : 'again', container);
        }
      };
      scene.addEventListener('touchend', endSwipe);
      scene.addEventListener('touchcancel', endSwipe);
    }

    // Rating buttons with clean, reliable onclick handlers (Solo activos al voltear)
    if (this.isFlipped) {
      const bindRating = (id: string, rating: StudyRating) => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleRating(rating, container);
          };
        }
      };

      bindRating('btn-rate-again', 'again');
      bindRating('btn-rate-hard', 'hard');
      bindRating('btn-rate-good', 'good');
      bindRating('btn-rate-easy', 'easy');
    }

    // Keyboard controls (Atajos 1, 2, 3, 4, Espacio, Enter y Flechas)
    window.onkeydown = (e: KeyboardEvent) => {
      // Si el microjuego está activo o hay un modal abierto, no procesar atajos de fondo
      if (
        this.isGameActive ||
        document.getElementById('modal-microgame-root') ||
        document.querySelector('.apple-modal-overlay') ||
        document.querySelector('.modal-backdrop')
      ) {
        return;
      }

      const activeEl = document.activeElement;
      const isInputActive =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl.tagName === 'MATH-FIELD' && !this.isFlipped));

      // Flechas del teclado para navegar entre flashcards
      if (e.key === 'ArrowLeft') {
        if (!isInputActive && this.currentCardIndex > 0) {
          e.preventDefault();
          this.currentCardIndex--;
          this.isFlipped = false;
          this.typedAnswer = '';
          this.render(container);
          return;
        }
      } else if (e.key === 'ArrowRight') {
        if (!isInputActive && this.currentCardIndex < this.queue.length - 1) {
          e.preventDefault();
          this.currentCardIndex++;
          this.isFlipped = false;
          this.typedAnswer = '';
          this.render(container);
          return;
        }
      }

      if (isInputActive) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const lower = e.key.toLowerCase();
      if (e.key === '?') {
        e.preventDefault();
        this.openShortcuts();
        return;
      }
      if (lower === 'f') {
        e.preventDefault();
        document.getElementById('btn-study-star')?.click();
        return;
      }
      if (lower === 'h' && !this.isFlipped) {
        e.preventDefault();
        document.getElementById('btn-study-hint')?.click();
        return;
      }
      if (lower === 'e' && this.onEditCardCallback) {
        e.preventDefault();
        window.onkeydown = null;
        this.stopTimer();
        this.onEditCardCallback(currentCard.id);
        return;
      }
      if (lower === 'b' && !(this.quizOptions && !this.isFlipped)) {
        e.preventDefault();
        deckService.buryCard(currentCard.id);
        this.dropCurrentCard(container);
        return;
      }

      // Opción múltiple: A–D (o 1–4) eligen; después, Espacio continúa
      if (this.quizOptions && !this.isFlipped) {
        const idx = 'abcd'.indexOf(lower) >= 0 ? 'abcd'.indexOf(lower) : '1234'.indexOf(e.key);
        if (idx >= 0 && idx < this.quizOptions.length) {
          e.preventDefault();
          this.quizChoice = idx;
          triggerFlip();
          return;
        }
      }
      if (quizAnswered) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          this.handleRating(quizRating(), container);
        }
        return;
      }

      if ((e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        e.preventDefault();
        this.undoLast(container);
        return;
      }

      const isSpaceOrEnter = e.code === 'Space' || e.key === ' ' || e.code === 'Enter' || e.key === 'Enter';

      // Si la tarjeta NO ha sido volteada, solo se permite voltear
      if (!this.isFlipped) {
        if (isSpaceOrEnter) {
          e.preventDefault();
          triggerFlip();
        }
        return;
      }

      const isKey1 = e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1';
      const isKey2 = e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2';
      const isKey3 = e.key === '3' || e.code === 'Digit3' || e.code === 'Numpad3';
      const isKey4 = e.key === '4' || e.code === 'Digit4' || e.code === 'Numpad4';

      if (isKey1) {
        e.preventDefault();
        this.handleRating('again', container);
      } else if (isKey2) {
        e.preventDefault();
        this.handleRating('hard', container);
      } else if (isKey3 || isSpaceOrEnter) {
        e.preventDefault();
        this.handleRating('good', container);
      } else if (isKey4) {
        e.preventDefault();
        this.handleRating('easy', container);
      }
    };
  }

  private handleRating(rating: StudyRating, container: HTMLElement): void {
    if (this.isHandlingRating) return;
    this.isHandlingRating = true;

    try {
      try {
        nativeService.triggerHaptics('light');
      } catch {}

      const currentCard = this.queue[this.currentCardIndex];
      let requeued = false;
      if (currentCard) {
        const before = deckService.getCardById(currentCard.id);
        if (before) this.undoStack.push({ snapshot: { ...before }, index: this.currentCardIndex, rating, requeued: false });
        if (this.undoStack.length > 30) this.undoStack.shift();
        // En práctica libre la respuesta cuenta para tus estadísticas, pero no mueve la fecha de repaso
        if (this.practice) studyStats.record(rating);
        else deckService.reviewCard(currentCard.id, rating);
        const elapsed = Date.now() - this.cardShownAt;
        studyStats.addTime(elapsed);
        this.studiedMs += Math.min(elapsed, 5 * 60 * 1000);
        if (rating === 'again') {
          this.combo = 0;
          this.missed.set(currentCard.id, currentCard);
        } else if (rating !== 'hard') {
          this.combo++;
          this.bestCombo = Math.max(this.bestCombo, this.combo);
        }
      }

      this.sessionStats.totalReviewed++;
      if (rating === 'again') {
        this.sessionStats.againCount++;
        if (!this.isSingleCardMode && currentCard) {
          this.queue.push(currentCard);
          requeued = true;
        }
      }
      if (this.undoStack.length) this.undoStack[this.undoStack.length - 1].requeued = requeued;
      if (rating === 'hard') {
        this.sessionStats.hardCount++;
      } else if (rating === 'good') {
        this.sessionStats.goodCount++;
      } else if (rating === 'easy') {
        this.sessionStats.easyCount++;
      }

      this.currentCardIndex++;
      this.isFlipped = false;
      this.typedAnswer = '';
      this.animate = 'enter';
      this.hintLevel = 0;
      this.cardShownAt = Date.now();

      // Check if Neuro-Ergonomic Micro-Game break is enabled and interval reached
      const interval = this.deck.settings.microGameInterval !== undefined ? this.deck.settings.microGameInterval : 5;
      const isEnabled = this.deck.settings.enableMicroGames !== false;
      const hasMoreCards = this.currentCardIndex < this.queue.length;

      if (isEnabled && interval > 0 && this.sessionStats.totalReviewed > 0 && this.sessionStats.totalReviewed % interval === 0 && hasMoreCards) {
        this.isGameActive = true;
        openMicroGameModal({
          streakCount: this.sessionStats.totalReviewed,
          gameType: this.deck.settings.preferredMicroGame || 'all',
          onContinue: () => {
            this.isGameActive = false;
            this.isHandlingRating = false;
            this.render(container);
          }
        });
        return;
      }
    } catch (err) {
      console.error('Error during handleRating:', err);
    } finally {
      this.isHandlingRating = false;
    }

    this.render(container);
  }

  /** Deshace la última calificación: devuelve la tarjeta a su estado anterior y la muestra otra vez para calificarla. */
  private undoLast(container: HTMLElement): void {
    const last = this.undoStack.pop();
    if (!last || this.isHandlingRating) return;
    deckService.restoreCardState(last.snapshot);
    studyStats.unrecord(last.rating);
    if (last.requeued) this.queue.pop();
    this.combo = 0;
    this.hintLevel = 0;
    this.cardShownAt = Date.now();
    // En opción múltiple la tarjeta vuelve para calificarla a mano
    this.quizCardId = last.snapshot.id;
    this.quizOptions = null;
    this.quizChoice = null;

    const s = this.sessionStats;
    s.totalReviewed = Math.max(0, s.totalReviewed - 1);
    if (last.rating === 'again') s.againCount = Math.max(0, s.againCount - 1);
    else if (last.rating === 'hard') s.hardCount = Math.max(0, s.hardCount - 1);
    else if (last.rating === 'good') s.goodCount = Math.max(0, s.goodCount - 1);
    else s.easyCount = Math.max(0, s.easyCount - 1);

    this.currentCardIndex = last.index;
    this.isFlipped = true;
    this.animate = 'enter';
    try {
      nativeService.triggerHaptics('light');
    } catch {
      /* ignore */
    }
    this.render(container);
  }

  private renderCompletionScreen(container: HTMLElement): void {
    window.onkeydown = null;
    try {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    } catch {}

    this.stopTimer();
    const st = this.sessionStats;
    const goodEasy = st.goodCount + st.easyCount;
    const accuracy = st.totalReviewed > 0 ? Math.round((goodEasy / st.totalReviewed) * 100) : 100;
    const perCard = st.totalReviewed ? Math.round(this.studiedMs / st.totalReviewed / 1000) : 0;
    const streak = studyStats.streak();
    const missed = Array.from(this.missed.values());
    const plain = (c: Flashcard) => (c.type === 'cloze' ? c.front.replace(/\{\{c\d*::([\s\S]*?)(?:::[\s\S]*?)?\}\}/g, '$1') : c.front).replace(/[$*_#`]/g, '').slice(0, 80) || 'Tarjeta con imagen';
    const title = accuracy >= 90 ? '¡Sesión impecable!' : accuracy >= 70 ? '¡Sesión completada!' : '¡Buen trabajo, sigue así!';

    container.innerHTML = `
      <div class="cupertino-study-container">
        <div class="sx-done">
          <div class="sx-ring" style="--p:${accuracy}"><div><b>${accuracy}%</b><small>aciertos</small></div></div>
          <h2>${title}</h2>
          <p style="color:var(--f-text-secondary); margin:0; font-size:0.98rem;">
            ${st.totalReviewed} respuesta${st.totalReviewed === 1 ? '' : 's'}${this.sessionLabel ? ` · ${escHtml(this.sessionLabel)}` : ''}${this.practice ? ' · práctica libre' : ''}
          </p>

          <div class="sx-done-grid">
            <div class="dk-kpi"><b>${formatDuration(this.studiedMs)}</b><span>de estudio</span></div>
            <div class="dk-kpi"><b>${perCard} s</b><span>por tarjeta</span></div>
            <div class="dk-kpi"><b>🔥 ×${this.bestCombo}</b><span>mejor racha</span></div>
            <div class="dk-kpi"><b>${streak.current}</b><span>día${streak.current === 1 ? '' : 's'} seguido${streak.current === 1 ? '' : 's'}</span></div>
          </div>

          <div class="dk-sec" style="width:100%; text-align:left;">
            <div class="dk-stack">
              <b class="r-again" style="width:${(st.againCount / Math.max(1, st.totalReviewed)) * 100}%"></b><b class="r-hard" style="width:${(st.hardCount / Math.max(1, st.totalReviewed)) * 100}%"></b><b class="r-good" style="width:${(st.goodCount / Math.max(1, st.totalReviewed)) * 100}%"></b><b class="r-easy" style="width:${(st.easyCount / Math.max(1, st.totalReviewed)) * 100}%"></b>
            </div>
            <div class="dk-legend">
              <span><i class="r-again"></i>${st.againCount} de nuevo</span><span><i class="r-hard"></i>${st.hardCount} difícil</span><span><i class="r-good"></i>${st.goodCount} bien</span><span><i class="r-easy"></i>${st.easyCount} fácil</span>
            </div>
          </div>

          ${
            missed.length
              ? `<div class="dk-sec sx-missed"><h4>Para repasar otra vez (${missed.length})</h4><ol class="dk-hardest">${missed
                  .slice(0, 6)
                  .map((c) => `<li><span>${escHtml(plain(c))}</span></li>`)
                  .join('')}</ol>${missed.length > 6 ? `<p class="dk-p">…y ${missed.length - 6} más</p>` : ''}</div>`
              : ''
          }

          <div class="sx-done-btns">
            ${missed.length ? `<button class="apple-btn-secondary" id="btn-study-retry-missed" style="padding:16px 24px; border-radius:9999px; font-weight:700;">↩️ Repasar las ${missed.length} falladas</button>` : ''}
            <button class="figma-btn-blue-pill" id="btn-study-finish-all" style="padding:16px 32px; font-size:1.05rem;">Volver al mazo</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-study-finish-all')?.addEventListener('click', () => {
      this.onExitCallback();
    });

    document.getElementById('btn-study-retry-missed')?.addEventListener('click', () => {
      // Segunda vuelta solo con las falladas, como práctica libre (el calendario ya quedó ajustado)
      this.queue = missed.map((c) => deckService.getCardById(c.id) || c);
      this.missed.clear();
      this.undoStack = [];
      this.currentCardIndex = 0;
      this.isFlipped = false;
      this.practice = true;
      this.sessionLabel = 'Falladas';
      this.combo = 0;
      this.bestCombo = 0;
      this.studiedMs = 0;
      this.quizCardId = '';
      this.cardShownAt = Date.now();
      this.sessionStats = { startTime: Date.now(), againCount: 0, hardCount: 0, goodCount: 0, easyCount: 0, totalReviewed: 0 };
      this.animate = 'enter';
      this.render(container);
    });
  }

  private renderEmptyState(container: HTMLElement): void {
    container.innerHTML = `
      <div class="cupertino-study-container" style="align-items:center; text-align:center; padding:60px 10px;">
        <div style="font-size:4rem; margin-bottom:12px;">🏆</div>
        <h2 style="font-size:2rem; font-weight:800; color:#ffffff; margin-bottom:8px;">¡Todo al día!</h2>
        <p style="color:var(--f-text-secondary); margin-bottom:28px; font-size:1.05rem; max-width:460px; line-height:1.5;">
          Has repasado todas las tarjetas programadas para este momento. Tus próximas revisiones se habilitarán automáticamente al cumplirse sus intervalos espaciados.
        </p>

        <div style="display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:wrap;">
          <button class="figma-btn-blue-pill" id="btn-study-finish-all" style="padding:16px 32px; font-size:1.05rem;">
            Volver a Mis Mazos
          </button>
          <button class="apple-btn-secondary" id="btn-study-force-all" style="padding:16px 26px; border-radius:9999px; font-weight:700;">
            🎯 Repasar mazo completo
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-study-finish-all')?.addEventListener('click', () => {
      this.onExitCallback();
    });

    document.getElementById('btn-study-force-all')?.addEventListener('click', () => {
      const all = deckService.getCardsByDeck(this.deck.id, true);
      this.queue = this.deck.settings.mixCards ? [...all].sort(() => Math.random() - 0.5) : [...all];
      this.currentCardIndex = 0;
      this.isFlipped = false;
      this.render(container);
    });
  }
}
