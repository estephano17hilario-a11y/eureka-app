import confetti from 'canvas-confetti';
import type { Deck, Flashcard, StudyRating } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { srsService } from '../services/srs.service';
import { katexService } from '../services/katex.service';
import { ttsService } from '../services/tts.service';

export interface FigmaStudyOptions {
  deckId: string;
  specificCardId?: string;
  onExit: () => void;
}

export class FigmaStudySession {
  private deck: Deck;
  private queue: Flashcard[] = [];
  private currentCardIndex: number = 0;
  private isFlipped: boolean = false;
  private isSingleCardMode: boolean = false;
  private onExitCallback: () => void;
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

    if (options.specificCardId) {
      const specific = deckService.getCardById(options.specificCardId);
      if (specific) {
        this.queue = [specific];
        this.isSingleCardMode = true;
      }
    } else {
      let cards = deckService.getDueCardsByDeck(options.deckId, true);
      if (cards.length === 0) {
        cards = deckService.getCardsByDeck(options.deckId, true);
      }
      this.queue = deck.settings.mixCards ? [...cards].sort(() => Math.random() - 0.5) : [...cards];
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
    const currentNum = this.currentCardIndex;
    const progressPercent = totalCount > 0 ? Math.round((currentNum / totalCount) * 100) : 0;
    const intervalProjections = srsService.projectIntervals(currentCard, this.deck.settings);

    if (this.deck.settings.autoPlayAudio && !this.isFlipped) {
      const text = currentCard.audioText || currentCard.front;
      if (text) ttsService.speak(text, currentCard.audioLang || this.deck.settings.ttsVoiceLang);
    }

    container.innerHTML = `
      <div class="cupertino-study-container">
        
        <!-- Header exact matching Reference Image 3 & 5 -->
        <div class="cupertino-study-header">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <button class="ios-back-btn" id="btn-study-exit" style="padding:0; font-size:1.1rem; color:#fff;">
                <span class="ios-back-chevron">‹</span> Salir
              </button>
              <h2 style="font-size:1.55rem; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">
                ${this.deck.name}
              </h2>
            </div>

            <button class="cupertino-icon-square" id="btn-study-audio" title="Pronunciación TTS">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            </button>
          </div>

          <!-- Progress track matching Image 3 (Pill 0/10 + Green Dot Track) -->
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
          
          <!-- Top 3-dots icon -->
          <div class="cupertino-card-top-action">
            <button class="cupertino-btn-card-menu" id="btn-card-more-action" title="Opciones">⋮</button>
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
            !this.isFlipped
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
            <!-- Control Bar Front (Image 3): [⌨] [Mostrar respuesta] [↶] -->
            <div class="cupertino-front-controls-row">
              <button class="cupertino-icon-square" id="btn-show-shortcuts" title="Atajos de teclado">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="10" y2="8"/><line x1="14" y1="8" x2="14" y2="8"/><line x1="18" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/></svg>
              </button>

              <button class="cupertino-btn-show-answer" id="btn-f-show-answer">
                Mostrar respuesta
              </button>

              <button class="cupertino-icon-square" id="btn-undo-card" title="Deshacer última tarjeta">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
              </button>
            </div>
          `
              : `
            <!-- Rating Bar Back (Image 5): 4 Frosted Cupertino Buttons -->
            <div class="cupertino-rating-row">
              <button class="cupertino-rate-pill rate-again" data-rating="again">
                <span class="c-rate-title">De nuevo</span>
                <span class="c-rate-subtitle">${intervalProjections[0].displayTime}</span>
              </button>

              <button class="cupertino-rate-pill rate-hard" data-rating="hard">
                <span class="c-rate-title">Difícil</span>
                <span class="c-rate-subtitle">${intervalProjections[1].displayTime}</span>
              </button>

              <button class="cupertino-rate-pill rate-good" data-rating="good">
                <span class="c-rate-title">Bien</span>
                <span class="c-rate-subtitle">${intervalProjections[2].displayTime}</span>
              </button>

              <button class="cupertino-rate-pill rate-easy" data-rating="easy">
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
    if (card.type === 'image_occlusion' && card.occlusionImage) {
      const mode = card.occlusionMode || 'hide_all_reveal_one';
      return `
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
          <div class="cupertino-card-main-title" style="margin-top:16px;">
            ${katexService.parseAndRender(card.front)}
          </div>
        </div>
      `;
    }

    return `
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:16px; width:100%;">
        ${card.frontImage ? `<img src="${card.frontImage}" class="cupertino-responsive-img" alt="Front Attachment" />` : ''}
        <div class="cupertino-card-main-title">
          ${katexService.parseAndRender(card.front)}
        </div>
      </div>
    `;
  }

  private renderBackContent(card: Flashcard): string {
    if (card.type === 'image_occlusion' && card.occlusionImage) {
      return `
        <div class="cupertino-occlusion-wrap">
          <div class="cupertino-occlusion-img-box">
            <img src="${card.occlusionImage}" alt="Oclusión Revelada" draggable="false" class="cupertino-responsive-img" />
            ${(card.occlusionMasks || [])
              .map((m) => {
                const isActive = m.id === card.activeMaskId;
                if (isActive) {
                  return `<div class="figma-drawn-mask active-revealed-mask" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%; background:transparent; border:3px solid #84cc16; box-shadow:0 0 20px rgba(132,204,22,0.9);"></div>`;
                }
                return `<div class="figma-drawn-mask other-hidden-mask" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%; background:#1c1d22; border:1px solid #3f3f46;"></div>`;
              })
              .join('')}
          </div>
          <div class="cupertino-card-main-title" style="margin-top:14px;">
            ${katexService.parseAndRender(card.front)}
          </div>
          <div class="cupertino-card-divider"></div>
          <div class="cupertino-card-answer-text">
            ${katexService.parseAndRender(card.back)}
          </div>
        </div>
      `;
    }

    return `
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; width:100%;">
        <div class="cupertino-card-main-title" style="color:var(--f-text-secondary); font-size:1.2rem;">
          ${katexService.parseAndRender(card.front)}
        </div>
        
        <div class="cupertino-card-divider"></div>

        ${card.backImage ? `<img src="${card.backImage}" class="cupertino-responsive-img" style="margin-bottom:14px;" alt="Back Attachment" />` : ''}

        <div class="cupertino-card-answer-text">
          ${katexService.parseAndRender(card.back)}
        </div>
      </div>
    `;
  }

  private bindEvents(container: HTMLElement): void {
    document.getElementById('btn-study-exit')?.addEventListener('click', () => {
      ttsService.stop();
      this.onExitCallback();
    });

    const triggerFlip = () => {
      if (!this.isFlipped) {
        this.historyStack.push({ cardIndex: this.currentCardIndex, isFlipped: false });
        this.isFlipped = true;
        this.render(container);
      }
    };

    document.getElementById('btn-f-show-answer')?.addEventListener('click', triggerFlip);
    document.getElementById('f-study-scene')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).id === 'btn-card-more-action') return;
      triggerFlip();
    });

    // Undo button
    document.getElementById('btn-undo-card')?.addEventListener('click', () => {
      if (this.currentCardIndex > 0) {
        this.currentCardIndex--;
        this.isFlipped = false;
        this.render(container);
      }
    });

    // Shortcuts button
    document.getElementById('btn-show-shortcuts')?.addEventListener('click', () => {
      alert('⌨️ Atajos de Teclado:\n\n• [Espacio] o [Enter] = Mostrar respuesta / Voltear\n• [1] = De nuevo (Muy difícil)\n• [2] = Difícil\n• [3] = Bien\n• [4] = Fácil\n• [Z] = Deshacer');
    });

    // Audio
    document.getElementById('btn-study-audio')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentCard = this.queue[this.currentCardIndex];
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

    // Keyboard controls
    window.onkeydown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (!this.isFlipped) {
          e.preventDefault();
          triggerFlip();
        }
      } else if (this.isFlipped) {
        if (e.key === '1') this.handleRating('again', container);
        else if (e.key === '2') this.handleRating('hard', container);
        else if (e.key === '3') this.handleRating('good', container);
        else if (e.key === '4') this.handleRating('easy', container);
      } else if (e.key === 'z' || e.key === 'Z') {
        if (this.currentCardIndex > 0) {
          this.currentCardIndex--;
          this.isFlipped = false;
          this.render(container);
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
            <span style="color:#84cc16; font-weight:700;">🔵 Bien</span>
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
        <p style="color:var(--f-text-secondary); margin-bottom:28px; font-size:1rem;">No tienes tarjetas pendientes en este mazo hoy.</p>
        <button class="figma-btn-blue-pill" id="btn-study-finish-all" style="padding:16px 32px; font-size:1.05rem;">
          Volver a Mis Mazos
        </button>
      </div>
    `;
    document.getElementById('btn-study-finish-all')?.addEventListener('click', () => {
      this.onExitCallback();
    });
  }
}
