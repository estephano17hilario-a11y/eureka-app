import confetti from 'canvas-confetti';
import type { Deck, Flashcard, StudyRating } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { srsService } from '../services/srs.service';
import { katexService } from '../services/katex.service';
import { ttsService } from '../services/tts.service';

export interface FigmaStudyOptions {
  deckId: string;
  specificCardId?: string; // Para estudiar una tarjeta individual directamente
  onExit: () => void;
}

export class FigmaStudySession {
  private deck: Deck;
  private queue: Flashcard[] = [];
  private currentCardIndex: number = 0;
  private isFlipped: boolean = false;
  private isSingleCardMode: boolean = false;
  private onExitCallback: () => void;
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
    const progressPercent = Math.round(((this.currentCardIndex + 1) / this.queue.length) * 100);
    const intervalProjections = srsService.projectIntervals(currentCard, this.deck.settings);

    if (this.deck.settings.autoPlayAudio && !this.isFlipped) {
      const text = currentCard.audioText || currentCard.front;
      if (text) ttsService.speak(text, currentCard.audioLang || this.deck.settings.ttsVoiceLang);
    }

    container.innerHTML = `
      <div class="ios-fullscreen-view" style="padding:0;">
        
        <!-- Header iOS -->
        <div class="ios-navbar" style="padding:0 4px; margin-bottom:12px;">
          <button class="ios-back-btn" id="btn-study-exit">
            <span class="ios-back-chevron">‹</span> Salir
          </button>
          
          <div style="text-align:center;">
            <div style="font-size:1rem; font-weight:800; color:#ffffff;">${this.deck.name}</div>
            <div style="font-size:0.75rem; color:var(--f-text-secondary);">
              ${this.isSingleCardMode ? 'Tarjeta focalizada' : `Tarjeta ${this.currentCardIndex + 1} de ${this.queue.length}`}
            </div>
          </div>

          <button class="figma-icon-btn-dark" id="btn-study-audio" style="width:38px; height:38px;" title="Pronunciación por voz">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </button>
        </div>

        <!-- iOS Progress Bar -->
        <div style="width:100%; height:4px; background:#1c1d22; border-radius:99px; overflow:hidden; margin-bottom:14px;">
          <div style="width:${progressPercent}%; height:100%; background:var(--f-blue); transition:width 0.25s;"></div>
        </div>

        <!-- 3D Card Scene -->
        <div class="figma-study-scene" id="f-study-scene">
          <div class="figma-study-card ${this.isFlipped ? 'flipped' : ''}" id="f-card-element">
            
            <!-- ANVERSO -->
            <div class="figma-study-face front apple-glass-panel">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <span class="apple-badge-subpill" style="font-size:0.8rem;">
                  ${currentCard.type === 'image_occlusion' ? '🖼️ OCLUSIÓN DE IMAGEN' : 'PREGUNTA'}
                </span>
                ${currentCard.isInverted ? `<span class="apple-badge-subpill" style="color:#ec4899; background:rgba(236,72,153,0.12);">⇄ INVERTIDO</span>` : ''}
              </div>

              <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                ${this.renderCardContent(currentCard, false)}
              </div>

              <div style="text-align:center; font-size:0.85rem; color:var(--f-text-muted); margin-top:16px;">
                Toca la tarjeta o presiona Espacio para voltear
              </div>
            </div>

            <!-- REVERSO -->
            <div class="figma-study-face back apple-glass-panel">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <span class="apple-badge-subpill" style="color:var(--f-green); background:rgba(132,204,22,0.12); font-size:0.8rem;">
                  RESPUESTA REVELADA
                </span>
              </div>

              <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                ${this.renderCardContent(currentCard, true)}
              </div>
            </div>

          </div>
        </div>

        <!-- Rating Buttons Bar -->
        <div style="margin-top:auto; padding-top:12px;">
          ${
            !this.isFlipped
              ? `
            <button class="figma-btn-blue-pill" id="btn-f-show-answer" style="width:100%; padding:18px; font-size:1.1rem; justify-content:center; border-radius:18px;">
              Mostrar Respuesta
            </button>
          `
              : `
            <div class="figma-rating-grid">
              ${intervalProjections
                .map(
                  (p) => `
                <button class="figma-rate-btn btn-${p.rating}" data-rating="${p.rating}">
                  <span class="f-rate-time">${p.displayTime}</span>
                  <span class="f-rate-lbl">${p.label}</span>
                </button>
              `
                )
                .join('')}
            </div>
          `
          }
        </div>

      </div>
    `;

    this.bindEvents(container);
  }

  private renderCardContent(card: Flashcard, isBack: boolean): string {
    if (card.type === 'image_occlusion' && card.occlusionImage) {
      const mode = card.occlusionMode || 'hide_all_reveal_one';
      return `
        <div>
          <div style="position:relative; display:inline-block; max-width:100%; border-radius:14px; overflow:hidden; margin-bottom:14px;">
            <img src="${card.occlusionImage}" alt="Oclusión" draggable="false" style="max-width:100%; height:auto; display:block;" />
            ${(card.occlusionMasks || [])
              .map((m) => {
                const isActive = m.id === card.activeMaskId;
                if (isActive) {
                  return isBack
                    ? `<div class="figma-drawn-mask" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%; background:transparent; border:2.5px solid #84cc16; box-shadow:0 0 16px rgba(132,204,22,0.9);"></div>`
                    : `<div class="figma-drawn-mask" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%; background:#ef4444; border:2px solid #ffffff; font-size:1.2rem; font-weight:900; color:#fff;">?</div>`;
                } else {
                  if (mode === 'hide_all_reveal_one') {
                    return `<div class="figma-drawn-mask" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%; background:#191a1e; border:1px solid #475569;"></div>`;
                  } else {
                    return '';
                  }
                }
              })
              .join('')}
          </div>
          <div style="font-size:1.15rem; line-height:1.55; color:#ffffff;">
            ${isBack ? katexService.parseAndRender(card.back) : katexService.parseAndRender(card.front)}
          </div>
        </div>
      `;
    }

    const img = isBack ? card.backImage : card.frontImage;
    const text = isBack ? `${card.front}\n\n---\n\n${card.back}` : card.front;

    return `
      <div>
        ${img ? `<div style="text-align:center; margin-bottom:16px;"><img src="${img}" style="max-width:100%; max-height:240px; border-radius:14px;" /></div>` : ''}
        <div style="font-size:1.25rem; line-height:1.65; color:#ffffff; font-weight:600;">
          ${katexService.parseAndRender(text)}
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
        this.isFlipped = true;
        this.render(container);
      }
    };

    document.getElementById('btn-f-show-answer')?.addEventListener('click', triggerFlip);
    document.getElementById('f-study-scene')?.addEventListener('click', () => triggerFlip());

    // Audio
    document.getElementById('btn-study-audio')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentCard = this.queue[this.currentCardIndex];
      const text = currentCard.audioText || currentCard.front;
      ttsService.speak(text, currentCard.audioLang || this.deck.settings.ttsVoiceLang);
    });

    // Rating buttons
    container.querySelectorAll<HTMLButtonElement>('.figma-rate-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rating = btn.dataset.rating as StudyRating;
        if (rating) this.handleRating(rating, container);
      });
    });

    // Keyboard
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
      <div class="ios-fullscreen-view" style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:40px 10px;">
        <div style="font-size:3.5rem; margin-bottom:12px;">🎉</div>
        <h2 style="font-size:2rem; font-weight:800; color:#ffffff; margin-bottom:8px;">¡Sesión Completada!</h2>
        <p style="color:var(--f-text-secondary); margin-bottom:24px; font-size:1rem;">
          Repasaste ${this.sessionStats.totalReviewed} tarjetas con ${accuracy}% de retención.
        </p>

        <div class="apple-card-grouped" style="width:100%; max-width:480px; text-align:left; margin-bottom:24px;">
          <div class="apple-list-row" style="padding:14px 20px;">
            <span style="color:#f87171; font-weight:700;">🔴 Muy Difícil</span>
            <strong style="font-size:1.1rem; color:#fff;">${this.sessionStats.againCount}</strong>
          </div>
          <div class="apple-list-row" style="padding:14px 20px;">
            <span style="color:#fbbf24; font-weight:700;">🟠 Difícil</span>
            <strong style="font-size:1.1rem; color:#fff;">${this.sessionStats.hardCount}</strong>
          </div>
          <div class="apple-list-row" style="padding:14px 20px;">
            <span style="color:#38bdf8; font-weight:700;">🔵 Bien (Siguiente Escalón)</span>
            <strong style="font-size:1.1rem; color:#fff;">${this.sessionStats.goodCount}</strong>
          </div>
          <div class="apple-list-row" style="padding:14px 20px;">
            <span style="color:#84cc16; font-weight:700;">🟢 Fácil</span>
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
      <div class="ios-fullscreen-view" style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:60px 10px;">
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
