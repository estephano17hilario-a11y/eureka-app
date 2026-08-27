import './index.css';
import { nativeService } from './services/native.service';
import { deckService } from './services/deck.service';
import { renderFigmaHeader, type FigmaMainTab } from './components/FigmaHeader';
import { renderFigmaDeckList, bindFigmaDeckListEvents } from './components/FigmaDeckList';
import { renderFigmaSubdeckList, bindFigmaSubdeckEvents } from './components/FigmaSubdeckList';
import { renderFigmaDeckDashboard, bindFigmaDashboardEvents } from './components/FigmaDeckDashboard';
import { renderFigmaCardEditor, bindFigmaCardEditorEvents } from './components/FigmaCardEditor';
import { renderFigmaLibraryView, bindFigmaLibraryEvents } from './components/FigmaLibraryView';
import { FigmaStudySession } from './components/FigmaStudySession';
import { openFigmaDeckSettingsModal } from './components/FigmaDeckSettingsModal';
import { openFigmaBatchImportModal } from './components/FigmaBatchImportModal';

type AppView = 'root' | 'subdeck' | 'dashboard' | 'editor' | 'library' | 'study';

class EurekaFigmaApp {
  private currentTab: FigmaMainTab = 'inicio';
  private currentView: AppView = 'root';
  private selectedRootDeckId: string = 'deck-mates';
  private selectedSubdeckId: string = 'deck-mates-sub';
  private editingCardId: string | null = null;
  private appElement: HTMLElement;
  private activeStudySession: FigmaStudySession | null = null;
  private toastTimeout: number | null = null;

  constructor() {
    const el = document.getElementById('app');
    if (!el) throw new Error('Root container #app not found');
    this.appElement = el;
  }

  public async init(): Promise<void> {
    await nativeService.initialize();
    deckService.subscribe(() => {
      if (this.currentView !== 'study') {
        this.render();
      }
    });
    this.render();
  }

  public showToast(message: string): void {
    const existing = document.getElementById('eureka-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'eureka-toast';
    toast.className = 'toast-notice';
    toast.innerHTML = `<span>${message}</span>`;

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    if (this.toastTimeout) window.clearTimeout(this.toastTimeout);
    this.toastTimeout = window.setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 2400);
  }

  private startStudy(deckId: string): void {
    nativeService.triggerHaptics('medium');
    this.currentView = 'study';
    this.activeStudySession = new FigmaStudySession({
      deckId,
      onExit: () => {
        this.activeStudySession = null;
        this.currentView = 'dashboard';
        this.render();
      }
    });

    this.appElement.innerHTML = `
      <div class="figma-app-layout" id="study-mount"></div>
    `;

    const mount = document.getElementById('study-mount');
    if (mount) {
      this.activeStudySession.render(mount);
    }
  }

  private openSettings(deckId: string): void {
    nativeService.triggerHaptics('light');
    const deck = deckService.getDeckById(deckId);
    if (!deck) return;

    openFigmaDeckSettingsModal({
      deck,
      onSaved: () => {
        this.showToast('Configuración del mazo guardada');
        this.render();
      },
      onClose: () => {}
    });
  }

  private openBatchImport(deckId: string): void {
    nativeService.triggerHaptics('light');
    openFigmaBatchImportModal({
      deckId,
      onImported: (count) => {
        this.showToast(`¡${count} tarjetas importadas con éxito!`);
        this.render();
      },
      onClose: () => {}
    });
  }

  private promptCreateDeck(parentId?: string): void {
    const parent = parentId ? deckService.getDeckById(parentId) : undefined;
    const name = prompt(parent ? `Nuevo Submazo en "${parent.name}":` : 'Nombre del nuevo mazo:');
    if (name && name.trim()) {
      deckService.createDeck({
        name: name.trim(),
        parentId: parentId || null
      });
      this.showToast(`Mazo "${name}" creado`);
      this.render();
    }
  }

  public render(): void {
    if (this.currentView === 'study') return;

    const rootDeck = deckService.getDeckById(this.selectedRootDeckId) || deckService.getRootDecks()[0];
    const subdeck = deckService.getDeckById(this.selectedSubdeckId) || rootDeck;
    const editCard = this.editingCardId ? deckService.getCardById(this.editingCardId) : undefined;

    let bodyHtml = '';

    if (this.currentTab === 'biblioteca') {
      bodyHtml = renderFigmaLibraryView();
    } else {
      switch (this.currentView) {
        case 'root':
          bodyHtml = renderFigmaDeckList();
          break;

        case 'subdeck':
          bodyHtml = renderFigmaSubdeckList(rootDeck);
          break;

        case 'dashboard':
          bodyHtml = renderFigmaDeckDashboard(subdeck, rootDeck.id !== subdeck.id ? rootDeck : undefined);
          break;

        case 'editor':
          bodyHtml = renderFigmaCardEditor(subdeck, rootDeck.id !== subdeck.id ? rootDeck : undefined, editCard);
          break;

        default:
          bodyHtml = renderFigmaDeckList();
          break;
      }
    }

    this.appElement.innerHTML = `
      <div class="figma-app-layout" id="main-layout-mount">
        ${renderFigmaHeader(this.currentTab)}
        <main>
          ${bodyHtml}
        </main>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const layout = document.getElementById('main-layout-mount');
    if (!layout) return;

    // Header tabs
    layout.querySelectorAll<HTMLButtonElement>('.figma-nav-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab as FigmaMainTab;
        if (tab && tab !== this.currentTab) {
          nativeService.triggerHaptics('light');
          this.currentTab = tab;
          if (tab === 'inicio') this.currentView = 'root';
          this.render();
        }
      });
    });

    layout.querySelector('#nav-brand-logo')?.addEventListener('click', () => {
      this.currentTab = 'inicio';
      this.currentView = 'root';
      this.render();
    });

    // Floating actions
    layout.querySelector('#btn-fab-gift')?.addEventListener('click', () => {
      this.showToast('🎁 ¡Racha de hoy completada! +50 XP');
    });

    layout.querySelector('#btn-fab-help')?.addEventListener('click', () => {
      this.showToast('Atajos: Espacio = Voltear | 1, 2, 3, 4 = Calificar');
    });

    // View 1: Root Deck List (Screenshot 1)
    if (this.currentTab === 'inicio' && this.currentView === 'root') {
      bindFigmaDeckListEvents(layout, {
        onSelectDeck: (deckId) => {
          nativeService.triggerHaptics('light');
          this.selectedRootDeckId = deckId;
          const subs = deckService.getSubdecks(deckId);
          if (subs.length > 0) {
            this.selectedSubdeckId = subs[0].id;
            this.currentView = 'subdeck';
          } else {
            this.selectedSubdeckId = deckId;
            this.currentView = 'dashboard';
          }
          this.render();
        },
        onAddCard: () => {
          nativeService.triggerHaptics('light');
          this.editingCardId = null;
          this.currentView = 'editor';
          this.render();
        },
        onCreateDeck: () => this.promptCreateDeck(),
        onImportBatch: () => this.openBatchImport(this.selectedSubdeckId),
        onManageDecks: () => this.openSettings(this.selectedRootDeckId)
      });
    }

    // View 2: Subdeck Explorer (Screenshot 2)
    else if (this.currentTab === 'inicio' && this.currentView === 'subdeck') {
      const rootDeck = deckService.getDeckById(this.selectedRootDeckId) || deckService.getRootDecks()[0];
      bindFigmaSubdeckEvents(layout, rootDeck, {
        onBack: () => {
          this.currentView = 'root';
          this.render();
        },
        onSelectSubdeck: (subId) => {
          nativeService.triggerHaptics('light');
          this.selectedSubdeckId = subId;
          this.currentView = 'dashboard';
          this.render();
        },
        onAddCard: () => {
          this.editingCardId = null;
          this.currentView = 'editor';
          this.render();
        },
        onImportBatch: (deckId) => this.openBatchImport(deckId),
        onConfigureDeck: (id) => this.openSettings(id)
      });
    }

    // View 3: Dashboard (Screenshot 3)
    else if (this.currentTab === 'inicio' && this.currentView === 'dashboard') {
      const subdeck = deckService.getDeckById(this.selectedSubdeckId) || deckService.getRootDecks()[0];
      bindFigmaDashboardEvents(layout, subdeck, {
        onBackToSubdecks: () => {
          this.currentView = 'subdeck';
          this.render();
        },
        onBackToRoot: () => {
          this.currentView = 'root';
          this.render();
        },
        onStudy: (id) => this.startStudy(id),
        onAddCard: () => {
          this.editingCardId = null;
          this.currentView = 'editor';
          this.render();
        },
        onConfigureDeck: (id) => this.openSettings(id),
        onEditCard: (cardId) => {
          this.editingCardId = cardId;
          this.currentView = 'editor';
          this.render();
        }
      });
    }

    // View 4: Card Editor (Screenshot 4)
    else if (this.currentTab === 'inicio' && this.currentView === 'editor') {
      const subdeck = deckService.getDeckById(this.selectedSubdeckId) || deckService.getRootDecks()[0];
      const editCard = this.editingCardId ? deckService.getCardById(this.editingCardId) : undefined;
      bindFigmaCardEditorEvents(layout, subdeck, editCard, {
        onBack: () => {
          this.editingCardId = null;
          this.currentView = 'dashboard';
          this.render();
        },
        onSaved: () => {
          this.showToast('¡Tarjeta guardada con éxito!');
          this.editingCardId = null;
          this.currentView = 'dashboard';
          this.render();
        }
      });
    }

    // View 5: Library (Screenshot 5)
    else if (this.currentTab === 'biblioteca') {
      bindFigmaLibraryEvents(layout, {
        onAddCard: () => {
          this.editingCardId = null;
          this.currentTab = 'inicio';
          this.currentView = 'editor';
          this.render();
        },
        onEditCard: (cardId) => {
          this.editingCardId = cardId;
          this.currentTab = 'inicio';
          this.currentView = 'editor';
          this.render();
        }
      });
    }
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  const app = new EurekaFigmaApp();
  app.init();
});
