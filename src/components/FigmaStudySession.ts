import confetti from 'canvas-confetti';
import type { Deck, Flashcard, StudyRating } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { srsService } from '../services/srs.service';
import { katexService } from '../services/katex.service';
import { ttsService } from '../services/tts.service';

export interface FigmaStudyOptions {
  deckId: string;
  onExit: () => void;
}

export class FigmaStudySession {
  private deck: Deck;
  private queue: Flashcard[] = [];
  private currentCardIndex: number = 0;
  private isFlipped: boolean = false;
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

    let cards = deckService.getDueCardsByDeck(options.deckId, true);
    if (cards.length === 0) {
      cards = deckService.getCardsByDeck(options.deckId, true);
    }
    this.queue = [...cards].sort(() => Math.random() - 0.5);
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
    const progressPercent = Math.round((this.currentCardIndex / this.queue.length) * 100);
    const intervalProjections = srsService.projectIntervals(currentCard, this.deck.settings);

    if (this.deck.settings.autoPlayAudio && !this.isFlipped) {
      const text = currentCard.audioText || currentCard.front;
      if (text) ttsService.speak(text, currentCard.audioLang || this.deck.settings.ttsVoiceLang);
    }

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- Header -->
        <div class="figma-action-header" style="margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <button class="figma-icon-btn-dark" id="btn-study-exit" title="Salir">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div>
              <div style="font-size:1.1rem; font-weight:800; color:#ffffff;">${this.deck.name}</div>
              <div style="font-size:0.78rem; color:var(--f-text-secondary);">
                Tarjeta ${this.currentCardIndex + 1} de ${this.queue.length}
              </div>
            </div>
          </div>

          <button class="figma-icon-btn-dark" id="btn-study-audio" title="Reproducir audio">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </button>
        </div>

        <!-- Progress Bar -->
        <div style="width:100%; height:6px; background:#24252a; border-radius:99px; overflow:hidden;">
          <div style="width:${progressPercent}%; height:100%; background:var(--f-blue); transition:width 0.2s;"></div>
        </div>

        <!-- 3D Card Scene -->
        <div class="figma-study-scene" id="f-study-scene">
          <div class="figma-study-card ${this.isFlipped ? 'flipped' : ''}" id="f-card-element">
            
            <!-- ANVERSO -->
            <div class="figma-study-face front">
              <div style="font-size:0.8rem; font-weight:700; color:var(--f-blue); margin-bottom:14px;">
                ${currentCard.type === 'image_occlusion' ? '🖼️ OCLUSIÓN DE IMAGEN' : 'PREGUNTA'}
              </div>

              <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                ${this.renderCardContent(currentCard, false)}
              </div>

              <div style="text-align:center; font-size:0.8rem; color:var(--f-text-muted); margin-top:16px;">
                Toca la tarjeta o presiona Espacio para voltear
              </div>
            </div>

            <!-- REVERSO -->
            <div class="figma-study-face back">
              <div style="font-size:0.8rem; font-weight:700; color:#84cc16; margin-bottom:14px;">
                RESPUESTA REVELADA
              </div>

              <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                ${this.renderCardContent(currentCard, true)}
              </div>
            </div>

          </div>
        </div>

        <!-- Rating Buttons Bar -->
        <div>
          ${
            !this.isFlipped
              ? `
            <button class="figma-btn-blue-pill" id="btn-f-show-answer" style="width:100%; padding:16px; font-size:1.05rem; justify-content:center;">
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
      return `
        <div>
          <div style="position:relative; display:inline-block; max-width:100%; border-radius:12px; overflow:hidden; margin-bottom:12px;">
            <img src="${card.occlusionImage}" alt="Oclusión" draggable="false" style="max-width:100%; height:auto; display:block;" />
            ${(card.occlusionMasks || [])
              .map((m) => {
                const isActive = m.id === card.activeMaskId;
                if (isActive) {
                  return isBack
                    ? `<div class="figma-drawn-mask" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%; background:transparent; border:2px solid #84cc16; box-shadow:0 0 14px rgba(132,204,22,0.8);"></div>`
                    : `<div class="figma-drawn-mask" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%; background:#ef4444; border:2px solid #ffffff; font-size:1.1rem; font-weight:900; color:#fff;">?</div>`;
                } else {
                  return `<div class="figma-drawn-mask" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%; background:#24252a; border:1px solid #475569;"></div>`;
                }
              })
              .join('')}
          </div>
          <div style="font-size:1.05rem; line-height:1.5;">
            ${isBack ? katexService.parseAndRender(card.back) : katexService.parseAndRender(card.front)}
          </div>
        </div>
      `;
    }

    const img = isBack ? card.backImage : card.frontImage;
    const text = isBack ? `${card.front}\n\n---\n\n${card.back}` : card.front;

    return `
      <div>
        ${img ? `<div style="text-align:center; margin-bottom:14px;"><img src="${img}" style="max-width:100%; max-height:220px; border-radius:12px;" /></div>` : ''}
        <div style="font-size:1.18rem; line-height:1.6; color:#ffffff;">
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
      this.queue.push(currentCard);
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
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {}

    const goodEasy = this.sessionStats.goodCount + this.sessionStats.easyCount;
    const accuracy = this.sessionStats.totalReviewed > 0 ? Math.round((goodEasy / this.sessionStats.totalReviewed) * 100) : 100;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:50px 10px;">
        <div style="font-size:3rem; margin-bottom:12px;">🎉</div>
        <h2 style="font-size:1.85rem; font-weight:800; color:#ffffff; margin-bottom:8px;">¡Sesión Completada!</h2>
        <p style="color:var(--f-text-secondary); margin-bottom:24px;">
          Repasaste ${this.sessionStats.totalReviewed} tarjetas con ${accuracy}% de retención.
        </p>

        <div class="figma-card-container" style="width:100%; max-width:480px; text-align:left;">
          <div class="figma-deck-row" style="padding:14px 20px;">
            <span style="color:#f87171;">🔴 Muy Difícil</span>
            <strong>${this.sessionStats.againCount}</strong>
          </div>
          <div class="figma-deck-row" style="padding:14px 20px;">
            <span style="color:#fbbf24;">🟠 Difícil</span>
            <strong>${this.sessionStats.hardCount}</strong>
          </div>
          <div class="figma-deck-row" style="padding:14px 20px;">
            <span style="color:#38bdf8;">🔵 Normal (Protocolo)</span>
            <strong>${this.sessionStats.goodCount}</strong>
          </div>
          <div class="figma-deck-row" style="padding:14px 20px;">
            <span style="color:#84cc16;">🟢 Fácil</span>
            <strong>${this.sessionStats.easyCount}</strong>
          </div>
        </div>

        <button class="figma-btn-blue-pill" id="btn-study-finish-all" style="margin-top:16px; padding:12px 32px;">
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
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:60px 10px;">
        <div style="font-size:3.5rem; margin-bottom:12px;">🏆</div>
        <h2 style="font-size:1.8rem; font-weight:800; color:#ffffff; margin-bottom:8px;">¡Todo al día!</h2>
        <p style="color:var(--f-text-secondary); margin-bottom:24px;">No tienes tarjetas pendientes en este mazo hoy.</p>
        <button class="figma-btn-blue-pill" id="btn-study-finish-all" style="padding:12px 28px;">
          Volver a Mis Mazos
        </button>
      </div>
    `;
    document.getElementById('btn-study-finish-all')?.addEventListener('click', () => {
      this.onExitCallback();
    });
  }
}
