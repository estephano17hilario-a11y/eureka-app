import './index.css';
import { nativeService } from './services/native.service';
import { deckService } from './services/deck.service';
import { themeService } from './services/theme.service';
import { renderFigmaHeader, type FigmaMainTab } from './components/FigmaHeader';
import { renderFigmaDeckList, bindFigmaDeckListEvents } from './components/FigmaDeckList';
import { renderFigmaSubdeckList, bindFigmaSubdeckEvents } from './components/FigmaSubdeckList';
import { renderFigmaDeckDashboard, bindFigmaDashboardEvents } from './components/FigmaDeckDashboard';
import { renderFigmaCardEditor, bindFigmaCardEditorEvents } from './components/FigmaCardEditor';
import { renderFigmaLibraryView, bindFigmaLibraryEvents } from './components/FigmaLibraryView';
import { renderFigmaDeckSettingsView, bindFigmaDeckSettingsViewEvents } from './components/FigmaDeckSettingsView';
import { renderFigmaAdvancedDeckMenuView, bindFigmaAdvancedDeckMenuViewEvents } from './components/FigmaAdvancedDeckMenuView';
import { renderFigmaAlgorithmSelectorView, bindFigmaAlgorithmSelectorViewEvents } from './components/FigmaAlgorithmSelectorView';
import { renderFigmaLearningPhaseView, bindFigmaLearningPhaseViewEvents } from './components/FigmaLearningPhaseView';
import { renderFigmaAppSettingsView, bindFigmaAppSettingsViewEvents } from './components/FigmaAppSettingsView';
import { FigmaStudySession } from './components/FigmaStudySession';
import { dialogService } from './services/dialog.service';
import { openFigmaBatchImportModal } from './components/FigmaBatchImportModal';
import { openFigmaAiBuilderModal } from './components/FigmaAiBuilderModal';

type AppView =
  | 'root'
  | 'subdeck'
  | 'dashboard'
  | 'deck_settings'
  | 'advanced_menu'
  | 'algorithm_selector'
  | 'learning_phase'
  | 'app_settings'
  | 'editor'
  | 'library'
  | 'study';

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
    themeService.applyTheme();
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

  private startStudy(deckId: string, specificCardId?: string): void {
    nativeService.triggerHaptics('medium');
    this.currentView = 'study';
    this.activeStudySession = new FigmaStudySession({
      deckId,
      specificCardId,
      onExit: () => {
        this.activeStudySession = null;
        this.currentView = 'dashboard';
        this.render();
      },
      onEditCard: (cardId) => {
        this.activeStudySession = null;
        this.editingCardId = cardId;
        this.currentView = 'editor';
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
    dialogService.showPrompt({
      title: parent ? `Nuevo Submazo en "${parent.name}"` : 'Crear Nuevo Mazo',
      placeholder: 'Nombre del mazo...',
      confirmText: 'Crear Mazo',
      onConfirm: (name) => {
        if (name && name.trim()) {
          deckService.createDeck({
            name: name.trim(),
            parentId: parentId || null
          });
          this.showToast(`Mazo "${name}" creado con éxito`);
          this.render();
        }
      }
    });
  }

  public render(): void {
    if (this.currentView === 'study') return;

    const rootDeck = deckService.getDeckById(this.selectedRootDeckId) || deckService.getRootDecks()[0];
    const subdeck = deckService.getDeckById(this.selectedSubdeckId) || rootDeck;
    const editCard = this.editingCardId ? deckService.getCardById(this.editingCardId) : undefined;

    let bodyHtml = '';
    let showGlobalHeader = true;

    if (this.currentTab === 'biblioteca') {
      bodyHtml = renderFigmaLibraryView();
    } else if (this.currentTab === 'ajustes') {
      bodyHtml = renderFigmaAppSettingsView();
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

        // Vistas Completas Nativas
        case 'deck_settings':
          showGlobalHeader = false;
          bodyHtml = renderFigmaDeckSettingsView(subdeck);
          break;

        case 'advanced_menu':
          showGlobalHeader = false;
          bodyHtml = renderFigmaAdvancedDeckMenuView(subdeck);
          break;

        case 'algorithm_selector':
          showGlobalHeader = false;
          bodyHtml = renderFigmaAlgorithmSelectorView(subdeck);
          break;

        case 'learning_phase':
          showGlobalHeader = false;
          bodyHtml = renderFigmaLearningPhaseView(subdeck);
          break;

        case 'app_settings':
          bodyHtml = renderFigmaAppSettingsView();
          break;

        case 'editor':
          showGlobalHeader = false;
          bodyHtml = renderFigmaCardEditor(subdeck, rootDeck.id !== subdeck.id ? rootDeck : undefined, editCard);
          break;

        default:
          bodyHtml = renderFigmaDeckList();
          break;
      }
    }

    this.appElement.innerHTML = `
      <div class="figma-app-layout" id="main-layout-mount">
        ${showGlobalHeader ? renderFigmaHeader(this.currentTab) : ''}
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

    // Header tabs & Mobile Bottom Nav items
    layout.querySelectorAll<HTMLButtonElement>('.figma-nav-tab-btn, .mobile-nav-item').forEach((btn) => {
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

    layout.querySelector('#btn-header-avatar')?.addEventListener('click', () => {
      this.currentTab = 'ajustes';
      this.render();
    });

    layout.querySelector('#btn-header-theme-mobile')?.addEventListener('click', () => {
      this.currentTab = 'ajustes';
      this.render();
    });

    // Floating actions
    layout.querySelector('#btn-fab-gift')?.addEventListener('click', () => {
      this.showToast('🎁 ¡Racha de hoy completada! +50 XP');
    });

    layout.querySelector('#btn-fab-help')?.addEventListener('click', () => {
      this.showToast('Atajos: Espacio = Voltear | 1, 2, 3, 4 = Calificar');
    });

    const rootDeck = deckService.getDeckById(this.selectedRootDeckId) || deckService.getRootDecks()[0];
    const subdeck = deckService.getDeckById(this.selectedSubdeckId) || rootDeck;

    // View: App Settings / Personalización
    if (this.currentTab === 'ajustes' || this.currentView === 'app_settings') {
      bindFigmaAppSettingsViewEvents(layout, {
        onBack: () => {
          this.currentTab = 'inicio';
          this.currentView = 'root';
          this.render();
        },
        onThemeChanged: () => {
          this.showToast('Estilo visual aplicado');
          this.render();
        }
      });
      return;
    }

    // View 1: Root Deck List
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
        onManageDecks: () => {
          this.currentView = 'deck_settings';
          this.render();
        }
      });
    }

    // View 2: Subdeck Explorer
    else if (this.currentTab === 'inicio' && this.currentView === 'subdeck') {
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
        onConfigureDeck: () => {
          this.currentView = 'deck_settings';
          this.render();
        }
      });
    }

    // View 3: Dashboard
    else if (this.currentTab === 'inicio' && this.currentView === 'dashboard') {
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
        onStudySpecificCard: (deckId, cardId) => {
          this.startStudy(deckId, cardId);
        },
        onAddCard: () => {
          this.editingCardId = null;
          this.currentView = 'editor';
          this.render();
        },
        onConfigureDeck: () => {
          this.currentView = 'deck_settings';
          this.render();
        },
        onEditCard: (cardId) => {
          this.editingCardId = cardId;
          this.currentView = 'editor';
          this.render();
        }
      });
    }

    // View: Fullscreen Deck Settings (Foto 1)
    else if (this.currentTab === 'inicio' && this.currentView === 'deck_settings') {
      bindFigmaDeckSettingsViewEvents(layout, subdeck, {
        onBack: () => {
          this.currentView = 'dashboard';
          this.render();
        },
        onOpenAlgorithmSelector: () => {
          this.currentView = 'algorithm_selector';
          this.render();
        },
        onOpenAdvancedMenu: () => {
          this.currentView = 'advanced_menu';
          this.render();
        },
        onSaved: () => {
          this.showToast('Ajustes guardados');
          this.render();
        }
      });
    }

    // View: Fullscreen Advanced Menu (Foto 2)
    else if (this.currentTab === 'inicio' && this.currentView === 'advanced_menu') {
      bindFigmaAdvancedDeckMenuViewEvents(layout, subdeck, {
        onBack: () => {
          this.currentView = 'deck_settings';
          this.render();
        },
        onOpenAlgorithmSelector: () => {
          this.currentView = 'algorithm_selector';
          this.render();
        },
        onOpenAiBuilder: () => {
          openFigmaAiBuilderModal({
            deckId: subdeck.id,
            onBatchAdded: () => {
              this.showToast('Tarjetas añadidas');
              this.currentView = 'dashboard';
              this.render();
            },
            onClose: () => {}
          });
        },
        onOpenBatchImport: () => {
          this.openBatchImport(subdeck.id);
        },
        onActionCompleted: () => {
          this.showToast('Acción completada');
          this.currentView = 'dashboard';
          this.render();
        }
      });
    }

    // View: Fullscreen Algorithm Selector (Foto 3)
    else if (this.currentTab === 'inicio' && this.currentView === 'algorithm_selector') {
      bindFigmaAlgorithmSelectorViewEvents(layout, subdeck, {
        onBack: () => {
          this.currentView = 'deck_settings';
          this.render();
        },
        onOpenCustomLearningPhases: () => {
          this.currentView = 'learning_phase';
          this.render();
        },
        onSaved: () => {
          this.showToast('Algoritmo actualizado');
          this.currentView = 'deck_settings';
          this.render();
        }
      });
    }

    // View: Fullscreen Learning Phase Step Editor (Foto 4)
    else if (this.currentTab === 'inicio' && this.currentView === 'learning_phase') {
      bindFigmaLearningPhaseViewEvents(layout, subdeck, {
        onBack: () => {
          this.currentView = 'algorithm_selector';
          this.render();
        },
        onSaved: () => {
          this.showToast('Escalera de 12 pasos guardada');
          this.currentView = 'deck_settings';
          this.render();
        }
      });
    }

    // View: Card Editor (Matching Images 2 & 3)
    else if (this.currentTab === 'inicio' && this.currentView === 'editor') {
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

    // View: Library
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
        },
        onStudySpecificCard: (deckId, cardId) => {
          this.startStudy(deckId, cardId);
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
