import confetti from 'canvas-confetti';
import type { Deck, Flashcard, StudyRating } from '../types/flashcard';
import { deckService } from '../services/deck.service';
import { srsService } from '../services/srs.service';
import { katexService } from '../services/katex.service';
import { ttsService } from '../services/tts.service';

export interface StudySessionOptions {
  deckId: string;
  onExit: () => void;
}

export class StudySession {
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

  constructor(options: StudySessionOptions) {
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
      const textToPlay = currentCard.audioText || currentCard.front;
      if (textToPlay) {
        ttsService.speak(textToPlay, currentCard.audioLang || this.deck.settings.ttsVoiceLang);
      }
    }

    container.innerHTML = `
      <div class="study-view-apple">
        
        <!-- Header -->
        <div class="study-top-nav">
          <button class="icon-btn" id="btn-exit-study" title="Salir">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          
          <div style="text-align:center;">
            <div style="font-size:0.95rem; font-weight:700; color:#ffffff;">${this.deck.name}</div>
            <div style="font-size:0.75rem; color:var(--ios-secondary-label);">
              Tarjeta ${this.currentCardIndex + 1} de ${this.queue.length}
            </div>
          </div>

          <button class="icon-btn btn-audio-play" title="Reproducir audio" data-audio-text="${encodeURIComponent(currentCard.audioText || currentCard.front)}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </button>
        </div>

        <!-- Progress Bar -->
        <div style="width:100%; height:4px; background:var(--ios-surface-2); border-radius:99px; overflow:hidden;">
          <div style="width:${progressPercent}%; height:100%; background:var(--ios-blue); transition:width 0.25s;"></div>
        </div>

        <!-- 3D Card Scene -->
        <div class="study-card-3d-scene" id="card-scene">
          <div class="study-card-3d ${this.isFlipped ? 'flipped' : ''}" id="flashcard-card">
            
            <!-- ANVERSO -->
            <div class="card-face-apple front">
              <span class="card-top-tag">${this.formatCardTag(currentCard.type)}</span>
              <div class="card-main-content">
                ${this.renderFaceContent(currentCard, false)}
              </div>
              <div style="text-align:center; font-size:0.75rem; color:var(--ios-tertiary-label); margin-top:12px;">
                Toca para ver respuesta (o presiona Espacio)
              </div>
            </div>

            <!-- REVERSO -->
            <div class="card-face-apple back">
              <span class="card-top-tag" style="color:var(--ios-green);">Respuesta</span>
              <div class="card-main-content">
                ${this.renderFaceContent(currentCard, true)}
              </div>
            </div>

          </div>
        </div>

        <!-- Rating Buttons (Apple Style) -->
        <div style="margin-top:auto;">
          ${
            !this.isFlipped
              ? `
            <button class="btn-apple-flip" id="btn-show-answer">
              Mostrar Respuesta
            </button>
          `
              : `
            <div class="apple-rating-bar">
              ${intervalProjections
                .map(
                  (p) => `
                <button class="btn-apple-rate btn-rate-${p.rating}" data-rating="${p.rating}">
                  <span class="rate-time-text">${p.displayTime}</span>
                  <span class="rate-lbl-text">${p.label}</span>
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

  private formatCardTag(type: Flashcard['type']): string {
    switch (type) {
      case 'image_occlusion':
        return '🖼️ Oclusión Visual';
      case 'latex':
        return '📐 Fórmula';
      case 'tts_audio':
        return '🎙️ Audio & Voz';
      default:
        return '📝 Pregunta';
    }
  }

  private renderFaceContent(card: Flashcard, isBack: boolean): string {
    // 1. Caso Oclusión de Imagen
    if (card.type === 'image_occlusion' && card.occlusionImage) {
      const mode = card.occlusionMode || 'hide_one_reveal_one';
      return `
        <div>
          <div class="study-occlusion-img-wrapper">
            <img src="${card.occlusionImage}" alt="Oclusión" draggable="false" />
            ${(card.occlusionMasks || [])
              .map((m) => {
                const isActive = m.id === card.activeMaskId;
                if (isActive) {
                  return isBack
                    ? ''
                    : `<div class="occlusion-mask-target" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%;">?</div>`;
                } else {
                  return mode === 'hide_all_reveal_one'
                    ? `<div class="occlusion-mask-dormant" style="left:${m.x}%; top:${m.y}%; width:${m.width}%; height:${m.height}%;"></div>`
                    : '';
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

    // 2. Tarjeta con Imagen adjunta
    const attachedImg = isBack ? card.backImage : card.frontImage;
    const textContent = isBack ? `${card.front}\n\n---\n\n${card.back}` : card.front;

    return `
      <div>
        ${
          attachedImg
            ? `
          <div style="text-align:center; margin-bottom:14px;">
            <img src="${attachedImg}" style="max-width:100%; max-height:200px; border-radius:12px; border:1px solid var(--ios-separator);" />
          </div>
        `
            : ''
        }
        <div style="font-size:1.15rem; line-height:1.6;">
          ${katexService.parseAndRender(textContent)}
        </div>
      </div>
    `;
  }

  private bindEvents(container: HTMLElement): void {
    document.getElementById('btn-exit-study')?.addEventListener('click', () => {
      ttsService.stop();
      this.onExitCallback();
    });

    const triggerFlip = () => {
      if (!this.isFlipped) {
        this.isFlipped = true;
        this.render(container);
      }
    };

    document.getElementById('btn-show-answer')?.addEventListener('click', triggerFlip);
    document.getElementById('card-scene')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.btn-audio-play')) return;
      triggerFlip();
    });

    // Rating buttons
    container.querySelectorAll<HTMLButtonElement>('.btn-apple-rate').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rating = btn.dataset.rating as StudyRating;
        if (rating) {
          this.handleRating(rating, container);
        }
      });
    });

    // Audio
    container.querySelectorAll<HTMLButtonElement>('.btn-audio-play').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = decodeURIComponent(btn.dataset.audioText || '');
        const currentCard = this.queue[this.currentCardIndex];
        ttsService.speak(text, currentCard.audioLang || this.deck.settings.ttsVoiceLang);
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
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}

    const goodEasy = this.sessionStats.goodCount + this.sessionStats.easyCount;
    const accuracy = this.sessionStats.totalReviewed > 0 ? Math.round((goodEasy / this.sessionStats.totalReviewed) * 100) : 100;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:40px 10px;">
        <div class="apple-stat-icon" style="width:64px; height:64px; border-radius:50%; background:var(--ios-blue); margin-bottom:16px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:6px;">¡Sesión Completada!</h2>
        <p style="color:var(--ios-secondary-label); font-size:0.9rem; margin-bottom:24px;">
          Has repasado ${this.sessionStats.totalReviewed} tarjetas con ${accuracy}% de retención.
        </p>

        <div class="apple-grouped-list" style="width:100%; text-align:left;">
          <div class="apple-list-item">
            <span>🔴 Muy Difícil</span>
            <strong>${this.sessionStats.againCount}</strong>
          </div>
          <div class="apple-list-item">
            <span>🟠 Difícil</span>
            <strong>${this.sessionStats.hardCount}</strong>
          </div>
          <div class="apple-list-item">
            <span>🔵 Normal (Protocolo)</span>
            <strong>${this.sessionStats.goodCount}</strong>
          </div>
          <div class="apple-list-item">
            <span>🟢 Fácil</span>
            <strong>${this.sessionStats.easyCount}</strong>
          </div>
        </div>

        <button class="btn-apple-flip" id="btn-finish-study" style="margin-top:14px;">
          Volver a Mis Mazos
        </button>
      </div>
    `;

    document.getElementById('btn-finish-study')?.addEventListener('click', () => {
      this.onExitCallback();
    });
  }

  private renderEmptyState(container: HTMLElement): void {
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; padding:60px 10px;">
        <div style="font-size:3rem; margin-bottom:12px;">🎉</div>
        <h2 style="font-size:1.6rem; font-weight:800; margin-bottom:6px;">¡Al Día!</h2>
        <p style="color:var(--ios-secondary-label); font-size:0.9rem; margin-bottom:24px;">
          No tienes tarjetas pendientes de repasar en este mazo hoy.
        </p>
        <button class="btn-apple-flip" id="btn-finish-study">
          Volver a Mis Mazos
        </button>
      </div>
    `;
    document.getElementById('btn-finish-study')?.addEventListener('click', () => {
      this.onExitCallback();
    });
  }
}
