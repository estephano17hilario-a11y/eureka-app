import confetti from 'canvas-confetti';
import type { Deck, Flashcard, StudyRating } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { srsService } from '../services/srs.service';
import { katexService } from '../services/katex.service';
import { ttsService } from '../services/tts.service';
import { dialogService } from '../services/dialog.service';
import { openMicroGameModal } from './MicroGameModal';

export interface FigmaStudyOptions {
  deckId: string;
  specificCardId?: string;
  forceAllCards?: boolean;
  onExit: () => void;
  onEditCard?: (cardId: string) => void;
}

export class FigmaStudySession {
  private deck: Deck;
  private queue: Flashcard[] = [];
  private currentCardIndex: number = 0;
  private isFlipped: boolean = false;
  private isSingleCardMode: boolean = false;
  private isTypeAnswerMode: boolean = false;
  private typedAnswer: string = '';
  private onExitCallback: () => void;
  private onEditCardCallback?: (cardId: string) => void;
  private historyStack: { cardIndex: number; isFlipped: boolean }[] = [];
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

    if (options.specificCardId) {
      const specific = deckService.getCardById(options.specificCardId);
      if (specific) {
        this.queue = [specific];
        this.isSingleCardMode = true;
      }
    } else if (options.forceAllCards) {
      const all = deckService.getCardsByDeck(options.deckId, true);
      this.queue = deck.settings.mixCards ? [...all].sort(() => Math.random() - 0.5) : [...all];
    } else {
      // Filtrar estrictamente las tarjetas pendientes para hoy (dueDate <= Date.now())
      const dueCards = deckService.getDueCardsByDeck(options.deckId, true);
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

    if (this.deck.settings.autoPlayAudio && !this.isFlipped) {
      const text = currentCard.audioText || currentCard.front;
      if (text) ttsService.speak(text, currentCard.audioLang || this.deck.settings.ttsVoiceLang);
    }

    container.innerHTML = `
      <div class="cupertino-study-container">
        
        <!-- Header matching Reference Image 3 & 5 -->
        <div class="cupertino-study-header">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:12px; min-width:0;">
              <button class="ios-back-btn" id="btn-study-exit" style="padding:0; font-size:1.1rem; color:#fff; flex-shrink:0;">
                <span class="ios-back-chevron">‹</span> Salir
              </button>
              <h2 style="font-size:1.45rem; font-weight:800; color:#ffffff; letter-spacing:-0.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${this.deck.name}
              </h2>
            </div>

            <button class="cupertino-icon-square" id="btn-study-audio" title="Pronunciación TTS">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            </button>
          </div>

          <!-- Progress track matching Image 3 (Pill 1/10 + Green Dot Track) -->
          <div class="cupertino-progress-row">
            <div class="cupertino-progress-pill">${currentNum}/${totalCount}</div>
            <div class="cupertino-track-bar">
              <div class="cupertino-track-fill" style="width: ${progressPercent}%;"></div>
              <div class="cupertino-track-thumb" style="left: ${progressPercent}%;"></div>
            </div>
          </div>
        </div>

        <!-- Main Card Canvas (Responsive, Auto-Height, No Cut-Off Images) -->
        <div class="cupertino-flashcard-box" id="f-study-scene">
          
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
              Toca la tarjeta o presiona Espacio para voltear
            </div>
          `
              : ''
          }
        </div>

        <!-- Bottom Controls matching Image 3 & Image 5 -->
        <div class="cupertino-bottom-controls">
          ${
            !this.isFlipped
              ? `
            <!-- Control Bar Front: [⌨ Escribir respuesta] [Mostrar respuesta] [↶ Deshacer] -->
            <div class="cupertino-front-controls-row">
              <button class="cupertino-icon-square ${this.isTypeAnswerMode ? 'active-keyboard-mode' : ''}" id="btn-toggle-type-mode" title="Escribir la respuesta (Modo teclado)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="10" y2="8"/><line x1="14" y1="8" x2="14" y2="8"/><line x1="18" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/></svg>
              </button>

              <button class="cupertino-btn-show-answer" id="btn-f-show-answer">
                ${this.isTypeAnswerMode ? 'Comprobar respuesta' : 'Mostrar respuesta'}
              </button>

              <button class="cupertino-icon-square" id="btn-undo-card" title="Deshacer última tarjeta">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
              </button>
            </div>
          `
              : `
            <!-- Rating Bar Back (Image 5): 4 Frosted Cupertino Buttons -->
            <div class="cupertino-rating-row">
              <button class="cupertino-rate-pill rate-again" data-rating="again" title="Presiona [1]">
                <span class="c-rate-title">De nuevo</span>
                <span class="c-rate-subtitle">${intervalProjections[0].displayTime}</span>
              </button>

              <button class="cupertino-rate-pill rate-hard" data-rating="hard" title="Presiona [2]">
                <span class="c-rate-title">Difícil</span>
                <span class="c-rate-subtitle">${intervalProjections[1].displayTime}</span>
              </button>

              <button class="cupertino-rate-pill rate-good" data-rating="good" title="Presiona [3]">
                <span class="c-rate-title">Bien</span>
                <span class="c-rate-subtitle">${intervalProjections[2].displayTime}</span>
              </button>

              <button class="cupertino-rate-pill rate-easy" data-rating="easy" title="Presiona [4]">
                <span class="c-rate-title">Fácil</span>
                <span class="c-rate-subtitle">${intervalProjections[3].displayTime}</span>
              </button>
            </div>
          `
          }
        </div>

      </div>
    `;

    this.bindEvents(container);
  }

  private renderFrontContent(card: Flashcard): string {
    let mediaHtml = '';
    if (card.type === 'image_occlusion' && card.occlusionImage) {
      const mode = card.occlusionMode || 'hide_all_reveal_one';
      mediaHtml = `
        <div class="cupertino-occlusion-wrap">
          <div class="cupertino-occlusion-img-box">
            <img src="${card.occlusionImage}" alt="Oclusión" draggable="false" class="cupertino-responsive-img" />
            ${(card.occlusionMasks || [])
              .map((m) => {
                const isActive = m.id === card.activeMaskId;
                if (isActive) {
                  return `<div class="figma-drawn-mask active-question-mask" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%; background:#ef4444; border:2px solid #ffffff; font-size:1.1rem; font-weight:900; color:#fff;">?</div>`;
                } else {
                  if (mode === 'hide_all_reveal_one') {
                    return `<div class="figma-drawn-mask other-hidden-mask" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%; background:#1c1d22; border:1px solid #3f3f46;"></div>`;
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
      <div class="cupertino-type-answer-box" style="margin-top:16px; width:100%; max-width:440px;">
        <input 
          type="text" 
          id="study-typed-answer-input" 
          class="cupertino-typed-input" 
          placeholder="Escribe la respuesta aquí..." 
          value="${this.typedAnswer}" 
          autocomplete="off" 
          autocorrect="off" 
          spellcheck="false" 
        />
      </div>
    `
      : '';

    return `
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:14px; width:100%;">
        ${mediaHtml}
        <div class="cupertino-card-main-title">
          ${katexService.parseAndRender(card.front)}
        </div>
        ${typeAnswerInputHtml}
      </div>
    `;
  }

  private renderBackContent(card: Flashcard): string {
    let mediaHtml = '';
    if (card.type === 'image_occlusion' && card.occlusionImage) {
      mediaHtml = `
        <div class="cupertino-occlusion-wrap">
          <div class="cupertino-occlusion-img-box">
            <img src="${card.occlusionImage}" alt="Oclusión Revelada" draggable="false" class="cupertino-responsive-img" />
            ${(card.occlusionMasks || [])
              .map((m) => {
                const isActive = m.id === card.activeMaskId;
                if (isActive) {
                  // Solicitud #4: Eliminar recuadro pintado y borde verde neón. El área revelada se muestra totalmente limpia y transparente
                  return '';
                }
                return `<div class="figma-drawn-mask other-hidden-mask" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%; background:#1c1d22; border:1px solid #3f3f46;"></div>`;
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
      const cleanExpected = card.back.replace(/<[^>]*>?/gm, '').replace(/[*_#`$]/g, '').trim().toLowerCase();
      const cleanUser = this.typedAnswer.trim().toLowerCase();
      const isExactMatch = cleanUser === cleanExpected;

      typedComparisonHtml = `
        <div class="cupertino-typed-comparison-card apple-glass-panel" style="margin-bottom:14px; width:100%; max-width:440px; padding:12px 16px; border-radius:14px; text-align:left;">
          <div style="font-size:0.78rem; font-weight:800; color:var(--f-text-secondary); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">
            Tu respuesta escrita:
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <span style="font-size:1.05rem; font-weight:700; color:${isExactMatch ? '#10b981' : '#f87171'};">
              ${this.typedAnswer}
            </span>
            <span class="apple-badge-subpill" style="font-size:0.75rem; background:${isExactMatch ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)'}; color:${isExactMatch ? '#10b981' : '#f87171'}; border:1px solid ${isExactMatch ? '#10b981' : '#ef4444'};">
              ${isExactMatch ? '✓ Exacto' : 'Discrepancia'}
            </span>
          </div>
        </div>
      `;
    }

    return `
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; width:100%;">
        ${mediaHtml}
        <div class="cupertino-card-main-title" style="color:var(--f-text-secondary); font-size:1.15rem;">
          ${katexService.parseAndRender(card.front)}
        </div>
        
        <div class="cupertino-card-divider"></div>

        ${typedComparisonHtml}

        <div class="cupertino-card-answer-text">
          ${katexService.parseAndRender(card.back)}
        </div>
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
      ttsService.stop();
      this.onExitCallback();
    });

    // Top 3-dots Card Menu (Solicitud #3)
    document.getElementById('btn-card-more-action')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openCardMenu(currentCard, container);
    });

    // Focus typed answer input if active
    if (this.isTypeAnswerMode && !this.isFlipped) {
      const input = document.getElementById('study-typed-answer-input') as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.addEventListener('input', (e) => {
          this.typedAnswer = (e.target as HTMLInputElement).value;
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            triggerFlip();
          }
        });
      }
    }

    const triggerFlip = () => {
      if (!this.isFlipped) {
        // Save typed answer from input if exists
        const input = document.getElementById('study-typed-answer-input') as HTMLInputElement | null;
        if (input) {
          this.typedAnswer = input.value;
        }
        this.historyStack.push({ cardIndex: this.currentCardIndex, isFlipped: false });
        this.isFlipped = true;
        this.render(container);
      }
    };

    // Toggle Type Answer Mode Button (Solicitud #5)
    document.getElementById('btn-toggle-type-mode')?.addEventListener('click', () => {
      this.isTypeAnswerMode = !this.isTypeAnswerMode;
      this.typedAnswer = '';
      this.render(container);
    });

    document.getElementById('btn-f-show-answer')?.addEventListener('click', triggerFlip);
    document.getElementById('f-study-scene')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (
        target.id === 'btn-card-more-action' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'BUTTON'
      ) {
        return;
      }
      if (!this.isTypeAnswerMode) {
        triggerFlip();
      }
    });

    // Undo button
    document.getElementById('btn-undo-card')?.addEventListener('click', () => {
      if (this.currentCardIndex > 0) {
        this.currentCardIndex--;
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

    // Rating buttons (Image 5)
    container.querySelectorAll<HTMLButtonElement>('.cupertino-rate-pill').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rating = btn.dataset.rating as StudyRating;
        if (rating) this.handleRating(rating, container);
      });
    });

    // Keyboard controls (Solicitud #6)
    window.onkeydown = (e: KeyboardEvent) => {
      // If typing in an input and pressing non-enter keys, allow normal typing
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      if (!this.isFlipped) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          triggerFlip();
        }
      } else {
        if (isInputActive) return;

        if (e.key === '1' || e.code === 'Numpad1') {
          e.preventDefault();
          this.handleRating('again', container);
        } else if (e.key === '2' || e.code === 'Numpad2') {
          e.preventDefault();
          this.handleRating('hard', container);
        } else if (e.key === '3' || e.code === 'Numpad3') {
          e.preventDefault();
          this.handleRating('good', container);
        } else if (e.key === '4' || e.code === 'Numpad4') {
          e.preventDefault();
          this.handleRating('easy', container);
        } else if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          this.handleRating('good', container);
        } else if (e.key === 'z' || e.key === 'Z') {
          if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.isFlipped = false;
            this.typedAnswer = '';
            this.render(container);
          }
        }
      }
    };
  }

  private handleRating(rating: StudyRating, container: HTMLElement): void {
    const currentCard = this.queue[this.currentCardIndex];
    deckService.reviewCard(currentCard.id, rating);

    this.sessionStats.totalReviewed++;
    if (rating === 'again') {
      this.sessionStats.againCount++;
      if (!this.isSingleCardMode) {
        this.queue.push(currentCard);
      }
    } else if (rating === 'hard') {
      this.sessionStats.hardCount++;
    } else if (rating === 'good') {
      this.sessionStats.goodCount++;
    } else if (rating === 'easy') {
      this.sessionStats.easyCount++;
    }

    this.currentCardIndex++;
    this.isFlipped = false;
    this.typedAnswer = '';

    // Check if Neuro-Ergonomic Micro-Game break is enabled and interval reached
    const interval = this.deck.settings.microGameInterval !== undefined ? this.deck.settings.microGameInterval : 5;
    const isEnabled = this.deck.settings.enableMicroGames !== false;
    const hasMoreCards = this.currentCardIndex < this.queue.length;

    if (isEnabled && interval > 0 && this.sessionStats.totalReviewed > 0 && this.sessionStats.totalReviewed % interval === 0 && hasMoreCards) {
      openMicroGameModal({
        streakCount: this.sessionStats.totalReviewed,
        gameType: this.deck.settings.preferredMicroGame || 'all',
        onContinue: () => {
          this.render(container);
        }
      });
      return;
    }

    this.render(container);
  }

  private renderCompletionScreen(container: HTMLElement): void {
    window.onkeydown = null;
    try {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    } catch {}

    const goodEasy = this.sessionStats.goodCount + this.sessionStats.easyCount;
    const accuracy = this.sessionStats.totalReviewed > 0 ? Math.round((goodEasy / this.sessionStats.totalReviewed) * 100) : 100;

    container.innerHTML = `
      <div class="cupertino-study-container" style="align-items:center; text-align:center; padding:40px 10px;">
        <div style="font-size:3.5rem; margin-bottom:12px;">🎉</div>
        <h2 style="font-size:2rem; font-weight:800; color:#ffffff; margin-bottom:8px;">¡Sesión Completada!</h2>
        <p style="color:var(--f-text-secondary); margin-bottom:24px; font-size:1rem;">
          Repasaste ${this.sessionStats.totalReviewed} tarjetas con ${accuracy}% de retención.
        </p>

        <div class="apple-card-grouped" style="width:100%; max-width:480px; text-align:left; margin-bottom:24px;">
          <div class="apple-list-row" style="padding:14px 20px;">
            <span style="color:#f87171; font-weight:700;">🔴 De nuevo</span>
            <strong style="font-size:1.1rem; color:#fff;">${this.sessionStats.againCount}</strong>
          </div>
          <div class="apple-list-row" style="padding:14px 20px;">
            <span style="color:#fbbf24; font-weight:700;">🟠 Difícil</span>
            <strong style="font-size:1.1rem; color:#fff;">${this.sessionStats.hardCount}</strong>
          </div>
          <div class="apple-list-row" style="padding:14px 20px;">
            <span style="color:#10b981; font-weight:700;">🔵 Bien</span>
            <strong style="font-size:1.1rem; color:#fff;">${this.sessionStats.goodCount}</strong>
          </div>
          <div class="apple-list-row" style="padding:14px 20px;">
            <span style="color:#38bdf8; font-weight:700;">🟢 Fácil</span>
            <strong style="font-size:1.1rem; color:#fff;">${this.sessionStats.easyCount}</strong>
          </div>
        </div>

        <button class="figma-btn-blue-pill" id="btn-study-finish-all" style="padding:16px 36px; font-size:1.05rem;">
          Volver a Mis Mazos
        </button>
      </div>
    `;

    document.getElementById('btn-study-finish-all')?.addEventListener('click', () => {
      this.onExitCallback();
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
