import './index.css';
import katex from 'katex';
import 'katex/dist/contrib/mhchem.js';
import 'katex/dist/katex.min.css';
import 'mathlive';
import 'mathlive/static.css';

(window as any).katex = katex;

import { nativeService } from './services/native.service';
import { deckService } from './services/deck.service';
import { themeService } from './services/theme.service';
import { eurekaSupabase, type AuthUser } from './services/supabase.service';
import { openAuthModal } from './components/AuthModal';
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
import { renderActiveStudyDashboard, bindActiveStudyDashboardEvents } from './components/ActiveStudyView';
import { UltraFastMindMap } from './components/UltraFastMindMap';
import { activeStudyService } from './services/active-study.service';

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
  private currentTab: FigmaMainTab = 'flashcards';
  private currentView: AppView = 'root';
  private selectedRootDeckId: string = '';
  private selectedSubdeckId: string = '';
  private selectedStudyTopicId: string = '';
  private editingCardId: string | null = null;
  private appElement: HTMLElement;
  private activeStudySession: FigmaStudySession | null = null;
  private activeMindMapInstance: UltraFastMindMap | null = null;
  private cleanupActiveStudyEvents: (() => void) | null = null;
  private toastTimeout: number | null = null;

  constructor() {
    const el = document.getElementById('app');
    if (!el) throw new Error('Root container #app not found');
    this.appElement = el;
  }

  public async init(): Promise<void> {
    themeService.applyTheme();
    await nativeService.initialize();

    // Suscribirse a cambios en los mazos y tarjetas
    deckService.subscribe(() => {
      if (this.currentView !== 'study') {
        this.render();
      }
    });

    // Suscribirse a cambios de autenticación
    eurekaSupabase.onAuthChange(async (user) => {
      const activeId = user?.id || 'guest';
      await deckService.setUser(activeId);
      const rootDecks = deckService.getRootDecks();
      if (rootDecks.length > 0) {
        this.selectedRootDeckId = rootDecks[0].id;
        const sub = deckService.getSubdecks(rootDecks[0].id);
        this.selectedSubdeckId = sub.length > 0 ? sub[0].id : rootDecks[0].id;
      }
      this.render();
    });

    // Comprobar si hay usuario conectado al inicio
    const currentUser = eurekaSupabase.getCurrentUser();
    if (!currentUser) {
      this.promptAuth(false);
    } else {
      await deckService.setUser(currentUser.id);
      this.render();
    }
  }

  public promptAuth(allowDismiss: boolean = true): void {
    openAuthModal({
      allowDismiss,
      onSuccess: async (user: AuthUser) => {
        this.showToast(`👋 ¡Bienvenido de nuevo, ${user.username}!`);
        await deckService.setUser(user.id);
        this.render();
      },
      onClose: () => {
        if (!eurekaSupabase.getCurrentUser()) {
          eurekaSupabase.setGuestSession();
        }
        this.render();
      }
    });
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

  private openUserAccountMenu(): void {
    const user = eurekaSupabase.getCurrentUser();
    const displayName = user?.username || 'Invitado (Local)';
    const email = user?.email || 'Modo sin cuenta';

    dialogService.showConfirm({
      title: `👤 ${displayName}`,
      message: `Correo: ${email}\nBase de datos: Aislada y sincronizada en la nube.\n\n¿Qué acción deseas realizar?`,
      confirmText: '🚪 Cerrar Sesión',
      cancelText: 'Cerrar',
      isDanger: true,
      onConfirm: async () => {
        await eurekaSupabase.signOut();
        this.showToast('Sesión cerrada correctamente');
        this.promptAuth(false);
      }
    });
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
        const card = deckService.getCardById(cardId);
        if (card) {
          this.selectedSubdeckId = card.deckId;
          const targetDeck = deckService.getDeckById(card.deckId);
          if (targetDeck?.parentId) {
            this.selectedRootDeckId = targetDeck.parentId;
          } else {
            this.selectedRootDeckId = card.deckId;
          }
        }
        this.activeStudySession = null;
        this.editingCardId = cardId;
        this.currentTab = 'inicio';
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

  public openMindMap(topicId?: string): void {
    nativeService.triggerHaptics('medium');
    if (this.cleanupActiveStudyEvents) {
      this.cleanupActiveStudyEvents();
      this.cleanupActiveStudyEvents = null;
    }

    let initialData: any = undefined;
    let topicTitle = 'Mapa Mental Táctil';

    if (topicId) {
      const topic = activeStudyService.getTopicById(topicId);
      if (topic) {
        topicTitle = topic.title;
        const roots = activeStudyService.getOutlineTree(topicId);
        if (roots.length > 0) {
          const mapNode = (n: any): any => ({
            data: { text: n.text, id: n.id },
            children: n.children && n.children.length > 0 ? n.children.map(mapNode) : []
          });
          initialData = {
            data: { text: topic.title },
            children: roots.map(mapNode)
          };
        }
      }
    }

    // Montar en un contenedor de pantalla completa fijo de 100vw y 100vh
    const mount = document.createElement('div');
    mount.id = 'eureka-mindmap-fullscreen-mount';
    document.body.appendChild(mount);

    this.activeMindMapInstance = new UltraFastMindMap(mount, {
      topicId,
      topicTitle,
      initialData,
      onBack: () => {
        if (this.activeMindMapInstance) {
          this.activeMindMapInstance.destroy();
          this.activeMindMapInstance = null;
        }
        mount.remove();
        this.render();
      },
      onSave: () => {
        this.showToast('🧠 Mapa mental sincronizado');
      }
    });

    this.activeMindMapInstance.mount();
  }

  private handleOpenAddMenu(parentId?: string | null): void {
    nativeService.triggerHaptics('light');
    const parent = parentId ? deckService.getDeckById(parentId) : undefined;
    dialogService.showCreateChoiceModal({
      parentName: parent?.name,
      onChoice: (choice) => {
        if (choice === 'folder') {
          this.promptCreateFolder(parentId || null);
        } else {
          this.promptCreateDeck(parentId || null);
        }
      }
    });
  }

  private promptCreateFolder(parentId: string | null): void {
    const parent = parentId ? deckService.getDeckById(parentId) : undefined;
    dialogService.showPrompt({
      title: parent ? `Nueva Carpeta en "${parent.name}"` : 'Nueva Carpeta',
      placeholder: 'Nombre de la carpeta (ej. Matemáticas, Anatomía)...',
      confirmText: 'Crear Carpeta',
      onConfirm: (name) => {
        if (name && name.trim()) {
          const newFolder = deckService.createDeck({
            name: name.trim(),
            parentId: parentId,
            icon: 'folder',
            color: '#38bdf8'
          });
          this.showToast(`📁 Carpeta "${name}" creada`);
          if (parentId) {
            this.selectedRootDeckId = parentId;
            this.currentView = 'subdeck';
          } else {
            this.selectedRootDeckId = newFolder.id;
            this.currentView = 'root';
          }
          this.render();
        }
      }
    });
  }

  private promptCreateDeck(parentId: string | null): void {
    const parent = parentId ? deckService.getDeckById(parentId) : undefined;
    dialogService.showPrompt({
      title: parent ? `Nuevo Mazo en "${parent.name}"` : 'Nuevo Mazo de Flashcards',
      placeholder: 'Nombre del mazo (ej. Fórmulas, Huesos)...',
      confirmText: 'Crear Mazo',
      onConfirm: (name) => {
        if (name && name.trim()) {
          const newDeck = deckService.createDeck({
            name: name.trim(),
            parentId: parentId,
            icon: 'deck',
            color: '#a855f7'
          });
          this.showToast(`🎴 Mazo "${name}" creado`);
          this.selectedSubdeckId = newDeck.id;
          if (parentId) {
            this.selectedRootDeckId = parentId;
          } else {
            this.selectedRootDeckId = newDeck.id;
          }
          this.currentView = 'dashboard';
          this.render();
        }
      }
    });
  }

  public render(): void {
    if (this.currentView === 'study') return;

    const rootDecks = deckService.getRootDecks();
    const rootDeck = deckService.getDeckById(this.selectedRootDeckId) || rootDecks[0] || deckService.getAllDecks()[0];
    const subdeck = deckService.getDeckById(this.selectedSubdeckId) || rootDeck;
    const editCard = this.editingCardId ? deckService.getCardById(this.editingCardId) : undefined;

    let bodyHtml = '';
    let showGlobalHeader = true;

    if (this.currentView === 'editor') {
      showGlobalHeader = false;
      bodyHtml = renderFigmaCardEditor(subdeck, rootDeck && rootDeck.id !== subdeck.id ? rootDeck : undefined, editCard);
    } else if (this.currentView === 'deck_settings') {
      showGlobalHeader = false;
      bodyHtml = renderFigmaDeckSettingsView(subdeck);
    } else if (this.currentView === 'advanced_menu') {
      showGlobalHeader = false;
      bodyHtml = renderFigmaAdvancedDeckMenuView(subdeck);
    } else if (this.currentView === 'algorithm_selector') {
      showGlobalHeader = false;
      bodyHtml = renderFigmaAlgorithmSelectorView(subdeck);
    } else if (this.currentView === 'learning_phase') {
      showGlobalHeader = false;
      bodyHtml = renderFigmaLearningPhaseView(subdeck);
    } else if (this.currentTab === 'estudio') {
      bodyHtml = renderActiveStudyDashboard(this.selectedStudyTopicId);
    } else if (this.currentTab === 'biblioteca') {
      bodyHtml = renderFigmaLibraryView();
    } else if (this.currentTab === 'ajustes' || this.currentView === 'app_settings') {
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
          bodyHtml = renderFigmaDeckDashboard(subdeck, rootDeck && rootDeck.id !== subdeck.id ? rootDeck : undefined);
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

    // Limpiar temporizadores previos de la sección de estudio
    if (this.cleanupActiveStudyEvents) {
      this.cleanupActiveStudyEvents();
      this.cleanupActiveStudyEvents = null;
    }

    // Header tabs & Mobile Bottom Nav items
    layout.querySelectorAll<HTMLButtonElement>('.figma-nav-tab-btn, .mobile-nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab as FigmaMainTab;
        if (tab && tab !== this.currentTab) {
          nativeService.triggerHaptics('light');
          this.currentTab = tab;
          if (tab === 'flashcards' || tab === 'inicio') {
            this.currentView = 'root';
          }
          this.render();
        }
      });
    });

    layout.querySelector('#nav-brand-logo')?.addEventListener('click', () => {
      this.currentTab = 'flashcards';
      this.currentView = 'root';
      this.render();
    });

    // Menú de Cuenta / Avatar
    layout.querySelector('#btn-header-avatar')?.addEventListener('click', () => {
      this.openUserAccountMenu();
    });

    layout.querySelector('#btn-header-theme-mobile')?.addEventListener('click', () => {
      this.currentTab = 'ajustes';
      this.render();
    });

    // Pestaña ESTUDIO ACTIVO (Sección independiente completa)
    if (this.currentTab === 'estudio') {
      this.cleanupActiveStudyEvents = bindActiveStudyDashboardEvents(
        layout,
        () => this.render(),
        (topicId) => {
          this.selectedStudyTopicId = topicId;
        },
        (topicId) => {
          this.openMindMap(topicId);
        }
      );
      return;
    }

    // Floating actions
    layout.querySelector('#btn-fab-gift')?.addEventListener('click', () => {
      this.showToast('🎁 ¡Racha de hoy completada! +50 XP');
    });

    layout.querySelector('#btn-fab-help')?.addEventListener('click', () => {
      this.showToast('Atajos: Espacio = Voltear | 1, 2, 3, 4 = Calificar');
    });

    const rootDecks = deckService.getRootDecks();
    const rootDeck = deckService.getDeckById(this.selectedRootDeckId) || rootDecks[0] || deckService.getAllDecks()[0];
    const subdeck = deckService.getDeckById(this.selectedSubdeckId) || rootDeck;

    // View: Card Editor (Top Priority)
    if (this.currentView === 'editor') {
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
      return;
    }

    // View: Fullscreen Deck Settings (Configuración de Intervalos)
    if (this.currentView === 'deck_settings') {
      bindFigmaDeckSettingsViewEvents(layout, subdeck, {
        onBack: () => {
          this.currentView = 'advanced_menu';
          this.render();
        },
        onOpenAlgorithmSelector: () => {
          this.currentView = 'algorithm_selector';
          this.render();
        },
        onSaved: () => {
          this.showToast('Ajustes guardados');
          this.render();
        }
      });
      return;
    }

    // View: Fullscreen Advanced Menu (Opciones de Mazo - Vista Principal)
    if (this.currentView === 'advanced_menu') {
      bindFigmaAdvancedDeckMenuViewEvents(layout, subdeck, {
        onBack: () => {
          this.currentView = 'dashboard';
          this.render();
        },
        onOpenDeckSettings: () => {
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
      return;
    }

    // View: Fullscreen Algorithm Selector
    if (this.currentView === 'algorithm_selector') {
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
      return;
    }

    // View: Fullscreen Learning Phase Step Editor
    if (this.currentView === 'learning_phase') {
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
      return;
    }

    // View: App Settings / Personalización
    if (this.currentTab === 'ajustes' || this.currentView === 'app_settings') {
      bindFigmaAppSettingsViewEvents(layout, {
        onBack: () => {
          this.currentTab = 'flashcards';
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

    const isFlashcards = this.currentTab === 'flashcards' || this.currentTab === 'inicio';

    // View 1: Root Deck List
    if (isFlashcards && this.currentView === 'root') {
      bindFigmaDeckListEvents(layout, {
        onSelectDeck: (deckId) => {
          nativeService.triggerHaptics('light');
          const targetDeck = deckService.getDeckById(deckId);
          if (deckService.isFolder(targetDeck)) {
            this.selectedRootDeckId = deckId;
            this.currentView = 'subdeck';
          } else {
            this.selectedRootDeckId = targetDeck?.parentId || deckId;
            this.selectedSubdeckId = deckId;
            this.currentView = 'dashboard';
          }
          this.render();
        },
        onAdd: () => this.handleOpenAddMenu(null),
        onRefresh: () => this.render()
      });
    }

    // View 2: Subdeck Explorer
    else if (isFlashcards && this.currentView === 'subdeck') {
      bindFigmaSubdeckEvents(layout, rootDeck, {
        onBack: () => {
          this.currentView = 'root';
          this.render();
        },
        onSelectSubdeck: (subId) => {
          nativeService.triggerHaptics('light');
          const targetSub = deckService.getDeckById(subId);
          if (deckService.isFolder(targetSub)) {
            this.selectedRootDeckId = subId;
            this.currentView = 'subdeck';
          } else {
            this.selectedSubdeckId = subId;
            this.currentView = 'dashboard';
          }
          this.render();
        },
        onAdd: (parentId) => this.handleOpenAddMenu(parentId),
        onConfigureDeck: () => {
          this.currentView = 'advanced_menu';
          this.render();
        },
        onRefresh: () => this.render()
      });
    }

    // View 3: Dashboard
    else if (isFlashcards && this.currentView === 'dashboard') {
      bindFigmaDashboardEvents(layout, subdeck, {
        onBackToSubdecks: () => {
          if (subdeck.parentId) {
            this.currentView = 'subdeck';
          } else {
            this.currentView = 'root';
          }
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
          this.currentView = 'advanced_menu';
          this.render();
        },
        onEditCard: (cardId) => {
          this.editingCardId = cardId;
          this.currentView = 'editor';
          this.render();
        },
        onRefresh: () => {
          this.render();
        }
      });
    }

    // View: Library
    else if (this.currentTab === 'biblioteca') {
      bindFigmaLibraryEvents(layout, {
        onAddCard: () => {
          this.editingCardId = null;
          this.currentTab = 'flashcards';
          this.currentView = 'editor';
          this.render();
        },
        onEditCard: (cardId) => {
          this.editingCardId = cardId;
          this.currentTab = 'flashcards';
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
